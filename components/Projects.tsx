"use client";

import { projects, moreProjects } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import styles from "./Projects.module.css";

export default function Projects() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="projects" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§03</span>
          <h2 className="sectionTitle">Projects</h2>
          <span className="sectionRule" />
        </div>

        <div className={styles.list}>
          {projects.map((p) => (
            <article key={p.title} className={`${styles.project} reveal`}>
              <div className={styles.head}>
                <span className={`mono ${styles.index}`}>{p.index}</span>
                <div className={styles.titleRow}>
                  <h3 className={styles.title}>{p.title}</h3>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkArrow"
                  >
                    repo ↗
                  </a>
                </div>
                <div className={styles.stackTags}>
                  {p.stack.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.body}>
                <div className={styles.block}>
                  <span className={`mono ${styles.label}`}>Problem</span>
                  <p>{p.problem}</p>
                </div>
                <div className={styles.block}>
                  <span className={`mono ${styles.label}`}>Decision</span>
                  <p>{p.decision}</p>
                </div>
                <div className={styles.block}>
                  <span className={`mono ${styles.label}`}>Outcome</span>
                  <p>{p.outcome}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={`${styles.more} reveal`}>
          <p className={`mono ${styles.moreLabel}`}>More on GitHub</p>
          <ul className={styles.moreList}>
            {moreProjects.map((m) => (
              <li key={m.title} className={styles.moreRow}>
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.moreTitle}
                >
                  {m.title}
                </a>
                <p className={styles.moreDesc}>{m.description}</p>
                <div className={styles.stackTags}>
                  {m.stack.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
