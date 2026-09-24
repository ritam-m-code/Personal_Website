"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import type { ActivityEntry } from "@/app/api/github/activity/route";
import styles from "./BuildLog.module.css";

type Response = {
  entries: ActivityEntry[];
  stats: { publicRepos: number; followers: number } | null;
  ok: boolean;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function BuildLog() {
  const ref = useReveal<HTMLDivElement>();
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [data, setData] = useState<Response | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github/activity")
      .then((r) => r.json())
      .then((json: Response) => {
        if (cancelled) return;
        setData(json);
        if (!json.ok) {
          setState("error");
        } else if (json.entries.length === 0) {
          setState("empty");
        } else {
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="build-log" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§04</span>
          <h2 className="sectionTitle">Build Log</h2>
          <span className="sectionRule" />
        </div>

        <div className={`${styles.layout} reveal`}>
          <div className={styles.logCol}>
            {state === "loading" && (
              <ul className={styles.list} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className={styles.skeletonRow}>
                    <span className={styles.skeletonBar} />
                  </li>
                ))}
              </ul>
            )}

            {state === "empty" && (
              <p className={`mono ${styles.fallback}`}>
                No public pushes in the last few weeks — recent work has been in private
                repos. Full history on{" "}
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
                  GitHub
                </a>
                .
              </p>
            )}

            {state === "error" && (
              <p className={`mono ${styles.fallback}`}>
                Live activity is taking a break — see the full history on{" "}
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className={styles.fallbackLink}>
                  GitHub
                </a>
                .
              </p>
            )}

            {state === "ready" && data && (
              <ul className={styles.list}>
                {data.entries.map((entry) => (
                  <li key={entry.id} className={styles.row}>
                    <span className={`mono ${styles.date}`}>{timeAgo(entry.date)}</span>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mono ${styles.repo}`}
                    >
                      {entry.repo}
                    </a>
                    <span className={styles.summary}>{entry.summary}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className={`mono ${styles.stats}`}>
            <p className={styles.statsLabel}>Live from GitHub</p>
            {data?.stats ? (
              <>
                <div className={styles.statRow}>
                  <span className={styles.statValue}>{data.stats.publicRepos}</span>
                  <span className={styles.statKey}>public repos</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statValue}>{data.stats.followers}</span>
                  <span className={styles.statKey}>followers</span>
                </div>
              </>
            ) : (
              <p className={styles.statsPlaceholder}>—</p>
            )}
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="linkArrow"
            >
              full profile ↗
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
