"use client";

import { featuredWork } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import styles from "./FeaturedWork.module.css";

export default function FeaturedWork() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="featured-work" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§{featuredWork.index}</span>
          <h2 className="sectionTitle">Featured Work</h2>
          <span className="sectionRule" />
        </div>

        <div className={styles.layout}>
          <div className={`${styles.body} reveal`}>
            <h3 className={styles.title}>{featuredWork.title}</h3>

            <div className={styles.block}>
              <span className={`mono ${styles.label}`}>Problem</span>
              <p>{featuredWork.problem}</p>
            </div>
            <div className={styles.block}>
              <span className={`mono ${styles.label}`}>Decision</span>
              <p>{featuredWork.decision}</p>
            </div>
            <div className={styles.block}>
              <span className={`mono ${styles.label}`}>Outcome</span>
              <p>{featuredWork.outcome}</p>
            </div>
          </div>

          <aside className={`mono ${styles.side} reveal`}>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Org</span>
              <span>{featuredWork.org}</span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Period</span>
              <span>{featuredWork.period}</span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideLabel}>Stack</span>
              <div className={styles.stackTags}>
                {featuredWork.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
