"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

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
        <div className="hero-copy minimal">
          <p className="eyebrow subtle">Mechatronics Engineering @ UWaterloo</p>
          <h1>Ritam Mukherjee</h1>
          <p>
            Systems, robotics, and research tools built with precise hardware + thoughtful
            software. Clean interfaces and disciplined experimentation keep the work moving.
          </p>
          <div className="hero-actions minimal">
            <a className="primary-cta" href="#highlights">
              Explore work
            </a>
            <a className="secondary-cta" href="#contact">
              Contact
            </a>
          </div>
        </div>
      </header>

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
          <svg
            className="line-art"
            viewBox="0 0 640 320"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 260 L640 60" />
            <path d="M0 220 L640 20" />
            <path d="M40 0 L520 320" />
            <path d="M100 0 L600 280" />
            <path d="M240 0 L640 200" />
          </svg>
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
        <span>scroll to explore ↓</span>
      </div>
    </div>
  );
}
