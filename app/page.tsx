"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type PanelCardProps = {
  eyebrow: string;
  title: string;
  lines: string[];
};

function PanelCard({ eyebrow, title, lines }: PanelCardProps) {
  return (
    <article className="panel-card">
      <p className="eyebrow" data-tone={eyebrow}>
        {eyebrow}
      </p>
      <h3>{title}</h3>
      <div className="placeholder-lines">
        {lines.map((line, index) => (
          <span key={line} className={`tone-${index % 3}`}>
            {line}
          </span>
        ))}
      </div>
    </article>
  );
}

function MainSite() {
  const defaultSpotifyHeading = "Last listened to";
  const defaultDiscordHeading = "Last played";
  const [spotifyStatus, setSpotifyStatus] = useState("Connect Spotify to show your last listened track.");
  const [spotifyHeading, setSpotifyHeading] = useState(defaultSpotifyHeading);
  const [discordStatus, setDiscordStatus] = useState("Connect Discord presence to show your last played game.");
  const [discordHeading, setDiscordHeading] = useState(defaultDiscordHeading);
  const lastGameRef = useRef<{ name: string; seenAt: string } | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [lastPushed, setLastPushed] = useState("Loading latest push...");

  const formatTimeAgo = (isoDate: string) => {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

    const units: Array<[number, string]> = [
      [60 * 60 * 24 * 365, "year"],
      [60 * 60 * 24 * 30, "month"],
      [60 * 60 * 24 * 7, "week"],
      [60 * 60 * 24, "day"],
      [60 * 60, "hour"],
      [60, "minute"],
    ];

    for (const [size, name] of units) {
      if (diffSeconds >= size) {
        const value = Math.floor(diffSeconds / size);
        return `${value} ${name}${value === 1 ? "" : "s"} ago`;
      }
    }

    return "just now";
  };

  useEffect(() => {
    let isActive = true;

    const loadSpotify = async () => {
      try {
        const spotifyRes = await fetch("/api/spotify/recent", { cache: "no-store" });

        if (spotifyRes.ok) {
          const spotifyData = (await spotifyRes.json()) as {
            track?: string;
            artist?: string;
            playedAt?: string;
            isPlaying?: boolean;
            fallback?: string;
          };
          if (!isActive) {
            return;
          }

          if (spotifyData.track && spotifyData.artist) {
            if (spotifyData.isPlaying) {
              setSpotifyHeading("Currently listening to");
              setSpotifyStatus(`${spotifyData.track} - ${spotifyData.artist}`);
            } else {
              setSpotifyHeading(defaultSpotifyHeading);
              setSpotifyStatus(`${spotifyData.track} - ${spotifyData.artist}`);
            }
          } else if (spotifyData.fallback) {
            setSpotifyHeading(defaultSpotifyHeading);
            setSpotifyStatus(spotifyData.fallback);
          }
        }
      } catch {
        if (isActive) {
          setSpotifyHeading(defaultSpotifyHeading);
          setSpotifyStatus("Spotify sync unavailable right now.");
        }
      }
    };

    const loadDiscord = async () => {
      try {
        const discordRes = await fetch("/api/discord/activity", { cache: "no-store" });
        if (discordRes.ok) {
          const discordData = (await discordRes.json()) as {
            game?: string;
            fallback?: string;
          };
          if (!isActive) {
            return;
          }

          if (discordData.game) {
            setDiscordHeading("Currently playing");
            setDiscordStatus(discordData.game);
            lastGameRef.current = { name: discordData.game, seenAt: new Date().toISOString() };
          } else if (discordData.fallback) {
            if (discordData.fallback === "No recent game activity found." && lastGameRef.current) {
              const { name, seenAt } = lastGameRef.current;
              setDiscordHeading(defaultDiscordHeading);
              setDiscordStatus(`${name} | ${formatTimeAgo(seenAt)}`);
            } else {
              setDiscordHeading(defaultDiscordHeading);
              setDiscordStatus(discordData.fallback);
            }
          }
        }
      } catch {
        if (isActive) {
          setDiscordHeading(defaultDiscordHeading);
          setDiscordStatus("Discord sync unavailable right now.");
        }
      }
    };

    loadSpotify();
    loadDiscord();
    const spotifyIntervalId = setInterval(loadSpotify, 15000);
    const discordIntervalId = setInterval(loadDiscord, 15000);

    return () => {
      isActive = false;
      clearInterval(spotifyIntervalId);
      clearInterval(discordIntervalId);
    };
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Toronto",
    });

    const updateTime = () => {
      setLocalTime(formatter.format(new Date()));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadLastPushed = async () => {
      try {
        const response = await fetch("https://api.github.com/users/ritam-m-code/events/public", {
          cache: "no-store",
        });
        if (!response.ok) {
          setLastPushed("GitHub activity unavailable.");
          return;
        }

        const events = (await response.json()) as Array<{
          type?: string;
          repo?: { name?: string };
          created_at?: string;
        }>;

        const latestPush = events.find((event) => event.type === "PushEvent");
        if (!latestPush?.repo?.name || !latestPush.created_at) {
          setLastPushed("No recent push activity.");
          return;
        }

        const repoName = latestPush.repo.name.split("/").pop() ?? latestPush.repo.name;
        setLastPushed(`${repoName} · ${formatTimeAgo(latestPush.created_at)}`);
      } catch {
        setLastPushed("GitHub activity unavailable.");
      }
    };

    loadLastPushed();
  }, []);

  const techStack = [
    { icon: "R", name: "React" },
    { icon: "N", name: "Node.js" },
    { icon: "</>", name: "HTML" },
    { icon: "#", name: "CSS" },
    { icon: "JS", name: "JavaScript" },
    { icon: "G", name: "Git" },
    { icon: "TS", name: "TypeScript" },
    { icon: "NX", name: "Next.js" },
  ];

  const sections = [
    {
      eyebrow: "Research",
      title: "Non-planar tooling",
      lines: [
        "Generative fabrication pipelines for 7-axis additive systems",
        "MATLAB + ROS tooling that bridges CAD and motion planning",
        "Focus on repeatable precision under real constraints",
      ],
    },
    {
      eyebrow: "Software",
      title: "Systems & Vision",
      lines: [
        "Transformers + PyTorch for manufacturing predictions",
        "Realtime OpenCV monitoring for motion-sensitive hardware",
        "Composable tooling for ML + controls experimentation",
      ],
    },
    {
      eyebrow: "Projects",
      title: "Embedded & Mechanical",
      lines: [
        "Recursive motion planning for maze visualization",
        "SolidWorks-driven solutions for the Biotron exoskeleton",
        "Leadership for KW Sandbox workshops and robotics builds",
      ],
    },
  ];

  return (
    <main className="site-shell minimal">
      <header className="hero-panel minimal">
        <div className="hero-mini-grid">
          <div className="hero-intro-stack">
            <article className="hero-mini-card hero-intro-card">
              <h1>Hi, I&apos;m Ritam.</h1>
              <p>
                Mechatronics student building reliable robotics and software systems with a focus on
                real-world performance.
              </p>
            </article>

            <article className="hero-mini-card hero-compact-card">
              <h2>Status</h2>
              <p className="status-note">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 16l4.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Looking for Spring &apos;26 Co-op
              </p>
            </article>
          </div>

          <article className="hero-mini-card hero-about-card">
            <h2>What I&apos;ve been up to</h2>
            <p>
              I like building mechatronic systems where software, control, and hardware all need
              to work reliably together.
            </p>
            <div className="about-meta-row">
              <div className="about-location">
                <p className="about-place">Waterloo, ON</p>
                <p className="about-time">{localTime}</p>
                <p className="status-row">
                  <span>Last pushed</span>
                  <strong>{lastPushed}</strong>
                </p>
              </div>
              <div className="status-list">
                <p className="status-row">
                  <span className="status-label">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M7 10.4c3-1.1 6.6-.9 9.8.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.7 13.1c2.4-.7 5-.4 7 .7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.4 15.5c1.6-.3 3.2-.1 4.5.6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    {spotifyHeading}
                  </span>
                  <strong>{spotifyStatus}</strong>
                </p>
                <p className="status-row">
                  <span className="status-label">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path
                        d="M8 8.5h8a3.5 3.5 0 0 1 3.5 3.5v2.5a2 2 0 0 1-2 2h-2l-1.2 1.5a.9.9 0 0 1-1.4 0L11.7 16h-5.2a2 2 0 0 1-2-2V12A3.5 3.5 0 0 1 8 8.5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="12.5" r="1.1" fill="currentColor" />
                      <circle cx="14" cy="12.5" r="1.1" fill="currentColor" />
                    </svg>
                    {discordHeading}
                  </span>
                  <strong>{discordStatus}</strong>
                </p>
              </div>
            </div>
          </article>

          <div className="hero-side-stack">
            <article className="hero-mini-card hero-compact-card">
              <h2>I&apos;m currently working on...</h2>
              <p>
                motion planning tooling for advanced manufacturing and practical ML workflows for
                smarter hardware decisions.
              </p>
            </article>

            <article className="hero-mini-card hero-compact-card">
              <h2>Get in touch</h2>
              <div className="contact-icons" aria-label="Contact links">
                <a
                  className="icon-link"
                  href="mailto:mukherjee.ritam@outlook.com"
                  aria-label="Email Ritam"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path
                      d="M4.5 7l7.5 6 7.5-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://github.com/ritam-m-code"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit GitHub profile"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://www.linkedin.com/in/ritammukherjee-uw"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit LinkedIn profile"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <path d="M7 11v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path
                      d="M11 17v-3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 13.5a2.3 2.3 0 0 1 4.6 0V17"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </a>
                <a
                  className="icon-link"
                  href="https://discord.com/users/541061375116705802"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Message on Discord (rmwat)"
                  title="rmwat on Discord"
                >
                  <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path
                      d="M7 7.5a14.8 14.8 0 0 1 3.2-1l.4.8a10.1 10.1 0 0 1 2.8 0l.4-.8a14.8 14.8 0 0 1 3.2 1A14.2 14.2 0 0 1 19 15a14.3 14.3 0 0 1-3.9 2l-.8-1.3c.6-.2 1.2-.5 1.7-.9-.4.3-.9.5-1.4.7a8.7 8.7 0 0 1-5.2 0c-.5-.2-1-.4-1.4-.7.5.4 1.1.7 1.7.9L8.9 17A14.3 14.3 0 0 1 5 15 14.2 14.2 0 0 1 7 7.5z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.45"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="10" cy="12" r="1.1" fill="currentColor" />
                    <circle cx="14" cy="12" r="1.1" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </article>
          </div>
        </div>
      </header>

      <section className="stack-panel minimal" id="stack">
        <div className="stack-heading">
          <p className="eyebrow subtle">Systems log</p>
          <h2>Tech stack</h2>
        </div>
        <div className="stack-marquee" aria-label="Technology stack marquee">
          <div className="marquee-track">
            {[0, 1].map((cloneIndex) => (
              <div
                className="marquee-group"
                key={`group-${cloneIndex}`}
                aria-hidden={cloneIndex === 1}
              >
                {techStack.map((tech) => (
                  <div className="tech-item" key={`${cloneIndex}-${tech.name}`}>
                    <span className="tech-icon" aria-hidden="true">
                      {tech.icon}
                    </span>
                    <span className="tech-name">{tech.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-grid minimal" id="highlights">
        {sections.map((section) => (
          <PanelCard key={section.title} {...section} />
        ))}
      </section>

      <section className="wide-panel minimal" id="contact">
        <h2>Contact & Threads</h2>
        <div className="placeholder-lines">
          <span>Email: mukherjee.ritam@outlook.com</span>
          <span>GitHub: github.com/ritam-m-code</span>
          <span>LinkedIn: linkedin.com/in/ritammukherjee-uw</span>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const stars = useMemo(() => {
    const count = 70;
    return Array.from({ length: count }, (_, index) => {
      const left = (index * 11.3) % 100;
      const top = (index * 7.9 + 23) % 100;
      const size = 1 + (index % 3) * 0.6;
      const duration = 3 + (index % 5) * 0.8;
      const delay = (index * 0.37) % 5;
      const color = "var(--uw-gold)";
      const pulseRange = 0.15 + (index % 4) * 0.07;
      return {
        id: index,
        left,
        top,
        size,
        duration,
        delay,
        color,
        pulseRange,
      };
    });
  }, []);

  const startReveal = () => {
    if (hasEntered || isFading) {
      return;
    }

    setIsFading(true);
    fadeTimeout.current = setTimeout(() => {
      setHasEntered(true);
      setIsFading(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  return (
    <div className={`app-frame ${hasEntered ? "entered" : "locked"}`}>
      <div className="site-layer" aria-hidden={false}>
        <MainSite />
      </div>

      {!hasEntered && (
        <div className={`entry-overlay${isFading ? " fading" : ""}`} role="presentation">
          <div className="entry-backdrop" />
          <div className="starfield" aria-hidden="true">
            {stars.map((star) => (
              <span
                key={star.id}
                className="twinkle-star"
                style={
                  {
                    top: `${star.top}%`,
                    left: `${star.left}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDuration: `${star.duration}s`,
                    animationDelay: `${star.delay}s`,
                    backgroundColor: star.color,
                    "--pulse-range": `${star.pulseRange}`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="name-trigger"
            onClick={startReveal}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="intro-card">
              <p className="entry-name">Ritam Mukherjee</p>
              <div className="logo-row">
                <img className="uw-logo" src="/uw_logo.png" alt="University of Waterloo logo" />
                <span className="hero-tagline">Mechatronics @UWaterloo</span>
              </div>
              <p className="class-year">Class of 2030</p>
              <span className="entry-helper" data-ready={isHovering ? "ready" : ""}>
                [ enter ]
                <span className="entry-ready">{isHovering ? " ready?" : ""}</span>
              </span>
            </div>
          </button>
        </div>
      )}

      <div className={`scroll-hint ${hasEntered ? "visible" : ""}`}>
        <span>scroll to explore</span>
      </div>
    </div>
  );
}
