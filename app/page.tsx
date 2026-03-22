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
  const techStack = [
    { icon: "⚛", name: "React" },
    { icon: "⬢", name: "Node.js" },
    { icon: "</>", name: "HTML" },
    { icon: "#", name: "CSS" },
    { icon: "JS", name: "JavaScript" },
    { icon: "⎇", name: "Git" },
    { icon: "TS", name: "TypeScript" },
    { icon: "▲", name: "Next.js" },
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
        <span>scroll to explore ↓</span>
      </div>
    </div>
  );
}
