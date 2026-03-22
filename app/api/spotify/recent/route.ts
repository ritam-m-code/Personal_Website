import { NextResponse } from "next/server";

type SpotifyTokenResponse = {
  access_token?: string;
};

type SpotifyArtist = {
  name?: string;
};

type SpotifyTrackDetails = {
  name?: string;
  artists?: SpotifyArtist[];
};

type SpotifyTrack = {
  track?: SpotifyTrackDetails;
  played_at?: string;
};

type SpotifyRecentResponse = {
  items?: SpotifyTrack[];
};

type SpotifyCurrentResponse = {
  is_playing?: boolean;
  item?: SpotifyTrackDetails;
};

export const dynamic = "force-dynamic";

const noTrackFallback = "No recent Spotify track found.";
const reconnectFallback =
  "Spotify needs re-connect for live playback (missing currently-playing scope).";

const readArtists = (artists?: SpotifyArtist[]) =>
  artists
    ?.map((artist) => artist.name)
    .filter((name): name is string => Boolean(name))
    .join(", ");

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { fallback: "Spotify not connected yet." },
      { status: 200 },
    );
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ fallback: "Spotify auth failed." }, { status: 200 });
    }

    const tokenData = (await tokenRes.json()) as SpotifyTokenResponse;
    if (!tokenData.access_token) {
      return NextResponse.json({ fallback: "Spotify access token missing." }, { status: 200 });
    }

    const authHeader = {
      Authorization: `Bearer ${tokenData.access_token}`,
    };

    const currentRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: authHeader,
      cache: "no-store",
    });

    if (currentRes.status === 401 || currentRes.status === 403) {
      return NextResponse.json({ fallback: reconnectFallback }, { status: 200 });
    }

    if (currentRes.ok && currentRes.status !== 204) {
      const currentData = (await currentRes.json()) as SpotifyCurrentResponse;
      const track = currentData.item?.name;
      const artist = readArtists(currentData.item?.artists);
      const isPlaying = Boolean(currentData.is_playing);

      if (track && artist && isPlaying) {
        return NextResponse.json({ track, artist, isPlaying }, { status: 200 });
      }
    }

    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: authHeader,
      cache: "no-store",
    });

    if (!recentRes.ok) {
      return NextResponse.json({ fallback: noTrackFallback }, { status: 200 });
    }

    const recentData = (await recentRes.json()) as SpotifyRecentResponse;
    const latest = recentData.items?.[0];
    const track = latest?.track?.name;
    const artist = readArtists(latest?.track?.artists);
    const playedAt = latest?.played_at;

    if (!track || !artist) {
      return NextResponse.json({ fallback: noTrackFallback }, { status: 200 });
    }

    return NextResponse.json({ track, artist, playedAt, isPlaying: false }, { status: 200 });
  } catch {
    return NextResponse.json({ fallback: "Spotify sync unavailable." }, { status: 200 });
  }
}
