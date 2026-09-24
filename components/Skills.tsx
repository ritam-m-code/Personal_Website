"use client";

import { skills } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import styles from "./Skills.module.css";

export default function Skills() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="skills" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§05</span>
          <h2 className="sectionTitle">Skills</h2>
          <span className="sectionRule" />
        </div>

        <div className={`${styles.grid} reveal`}>
          {skills.map((group) => (
            <div key={group.group} className={styles.col}>
              <p className={`mono ${styles.groupLabel}`}>{group.group}</p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
