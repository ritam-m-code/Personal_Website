"use client";

import { useEffect, useState } from "react";

type PanelCardProps = {
  eyebrow: string;
  title: string;
  lines: string[];
};

function PanelCard({ eyebrow, title, lines }: PanelCardProps) {
  return (
    <article className="panel-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <div className="placeholder-lines">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </article>
  );
}

function RobotIntro({ onPowerOn }: { onPowerOn: () => void }) {
  return (
    <section className="intro-screen" aria-label="Landing page lab activation screen">
      <div className="intro-copy">
        <p className="eyebrow">System Offline</p>
        <h1>
          Enter the
          <br />
          lab.
        </h1>
        <p className="intro-text">
          A dormant research lab waits in standby. Bring power back online to wake the
          space and enter the portfolio.
        </p>
      </div>

      <div className="lab-stage">
        <div className="lab-scene" aria-hidden="true">
          <div className="lab-back-wall" />
          <div className="lab-light light-left" />
          <div className="lab-light light-right" />
          <div className="lab-monitor monitor-left">
            <span />
          </div>
          <div className="lab-monitor monitor-right">
            <span />
          </div>
          <div className="lab-desk">
            <div className="desk-surface" />
            <div className="power-console">
              <div className="console-screen" />
              <button
                type="button"
                className="power-button"
                onClick={onPowerOn}
                aria-label="Power on portfolio"
              >
                <span className="power-ring" />
              </button>
            </div>
          </div>
          <div className="lab-floor-line" />
          <div className="status-pod pod-left" />
          <div className="status-pod pod-right" />
          <div className="cable cable-left" />
          <div className="cable cable-right" />
          <div className="lab-label">
            <span>[ ACTIVATE ]</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainSite() {
  const sections = [
    {
      eyebrow: "Identity",
      title: "[ Name / Tagline ]",
      lines: ["Primary headline", "Short intro", "Call to action"],
    },
    {
      eyebrow: "Profile",
      title: "[ About ]",
      lines: ["Personal statement", "Interests", "What you build"],
    },
    {
      eyebrow: "Selected Work",
      title: "[ Projects ]",
      lines: ["Project one", "Project two", "Project three"],
    },
    {
      eyebrow: "Field Log",
      title: "[ Experience ]",
      lines: ["Role", "Organization", "Impact"],
    },
    {
      eyebrow: "Capabilities",
      title: "[ Skills ]",
      lines: ["Languages", "Tools", "Concepts"],
    },
    {
      eyebrow: "Open Channel",
      title: "[ Contact ]",
      lines: ["Email", "LinkedIn", "GitHub"],
    },
  ];

  return (
    <main className="site-shell">
      <header className="hero-panel">
        <div className="mesh-layer" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Neural Mesh Online</p>
          <h1>[ Your Statement Piece Lives Here ]</h1>
          <p>
            Blank content blocks are ready. We can shape the copy, projects, and story
            over time without having to rebuild the visual system.
          </p>
        </div>

        <div className="hero-orbital">
          <div className="orbital-ring orbital-ring-a" />
          <div className="orbital-ring orbital-ring-b" />
          <div className="signal-core">
            <span />
          </div>
        </div>
      </header>

      <section className="section-grid">
        {sections.map((section) => (
          <PanelCard key={section.title} {...section} />
        ))}
      </section>

      <section className="wide-panel">
        <p className="eyebrow">Interface Notes</p>
        <div className="wide-panel-grid">
          <div>
            <h2>[ Featured Module ]</h2>
            <div className="placeholder-lines">
              <span>Space for a featured project, visual reel, or research focus</span>
              <span>Space for metrics, links, or interactive demos</span>
            </div>
          </div>
          <div className="terminal-card">
            <span>status:// connected</span>
            <span>theme:// cyber mesh</span>
            <span>content:// pending input</span>
            <span>signal:// stable</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [showMainSite, setShowMainSite] = useState(false);

  useEffect(() => {
    if (!isPoweredOn) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowMainSite(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isPoweredOn]);

  return (
    <div className={`app-frame ${isPoweredOn ? "powered-on" : ""}`}>
      {!showMainSite ? (
        <RobotIntro onPowerOn={() => setIsPoweredOn(true)} />
      ) : (
        <MainSite />
      )}
    </div>
  );
}
