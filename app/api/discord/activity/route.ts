import { NextResponse } from "next/server";

type LanyardActivity = {
  type?: number;
  name?: string;
};

type LanyardResponse = {
  success?: boolean;
  data?: {
    activities?: LanyardActivity[];
  };
};

export const dynamic = "force-dynamic";

export async function GET() {
  const discordUserId = process.env.DISCORD_USER_ID;

  if (!discordUserId) {
    return NextResponse.json(
      { fallback: "Discord not connected yet." },
      { status: 200 },
    );
  }

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json(
        { fallback: "Discord activity unavailable (join discord.gg/lanyard first)." },
        { status: 200 },
      );
    }

    if (!res.ok) {
      return NextResponse.json({ fallback: "Discord presence unavailable." }, { status: 200 });
    }

    const payload = (await res.json()) as LanyardResponse;
    const game = payload.data?.activities?.find((item) => item.type === 0 && item.name)?.name;

    if (!game) {
      return NextResponse.json({ fallback: "No recent game activity found." }, { status: 200 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch {
    return NextResponse.json({ fallback: "Discord sync unavailable." }, { status: 200 });
  }
}
