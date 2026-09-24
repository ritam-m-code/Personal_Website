import { profile } from "@/lib/content";

export const revalidate = 1800; // 30 min — GitHub's public events API is generous but not real-time anyway

const USERNAME = profile.links.github.split("/").pop() as string;

export type ActivityEntry = {
  id: string;
  type: string;
  repo: string;
  summary: string;
  date: string;
  url: string;
};

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: {
    action?: string;
    ref_type?: string;
    commits?: { message: string }[];
    pull_request?: { html_url: string; title: string };
  };
};

function summarize(event: GithubEvent): string | null {
  switch (event.type) {
    case "PushEvent": {
      const msg = event.payload?.commits?.[event.payload.commits.length - 1]?.message;
      return msg ? `pushed — ${msg.split("\n")[0].slice(0, 72)}` : "pushed commits";
    }
    case "CreateEvent":
      return event.payload?.ref_type === "repository" ? "created repository" : null;
    case "PullRequestEvent":
      return event.payload?.action === "opened"
        ? `opened PR — ${event.payload.pull_request?.title?.slice(0, 72)}`
        : null;
    case "IssuesEvent":
      return event.payload?.action === "opened" ? "opened an issue" : null;
    case "WatchEvent":
      return "starred";
    default:
      return null;
  }
}

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ritam-portfolio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [eventsRes, userRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=30`, {
        headers,
        next: { revalidate },
      }),
      fetch(`https://api.github.com/users/${USERNAME}`, {
        headers,
        next: { revalidate },
      }),
    ]);

    if (!eventsRes.ok) {
      return Response.json({ entries: [], ok: false }, { status: 200 });
    }

    const events: GithubEvent[] = await eventsRes.json();

    const entries: ActivityEntry[] = events
      .map((event) => {
        const summary = summarize(event);
        if (!summary) return null;
        return {
          id: event.id,
          type: event.type,
          repo: event.repo.name.replace(`${USERNAME}/`, ""),
          summary,
          date: event.created_at,
          url: `https://github.com/${event.repo.name}`,
        };
      })
      .filter((e): e is ActivityEntry => e !== null)
      .slice(0, 8);

    let stats: { publicRepos: number; followers: number } | null = null;
    if (userRes.ok) {
      const user = await userRes.json();
      stats = { publicRepos: user.public_repos ?? 0, followers: user.followers ?? 0 };
    }

    return Response.json({ entries, stats, ok: true });
  } catch {
    return Response.json({ entries: [], stats: null, ok: false }, { status: 200 });
  }
}
