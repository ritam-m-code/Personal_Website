"use client";

import Image from "next/image";
import { experience } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import styles from "./Experience.module.css";

export default function Experience() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="experience" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§02</span>
          <h2 className="sectionTitle">Experience</h2>
          <span className="sectionRule" />
        </div>

        <ul className={styles.list}>
          {experience.map((role) => (
            <li key={`${role.org}-${role.role}`} className={`${styles.row} reveal`}>
              <div className={`mono ${styles.period}`}>{role.period}</div>

              <div className={styles.roleCol}>
                <div className={styles.roleHead}>
                  {role.logo && (
                    <Image
                      src={role.logo}
                      alt=""
                      width={22}
                      height={22}
                      className={styles.logo}
                    />
                  )}
                  <div>
                    <p className={styles.role}>{role.role}</p>
                    <p className={`mono ${styles.org}`}>{role.org}</p>
                  </div>
                </div>
              </div>

              <div className={styles.descCol}>
                <p className={styles.desc}>
                  {role.description}
                  {role.linkToFeatured && (
                    <a href="#featured-work" className={styles.jump}>
                      {" "}
                      ↑ jump to case study
                    </a>
                  )}
                  {role.repoLink && (
                    <a
                      href={role.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.jump}
                    >
                      {" "}
                      → repo
                    </a>
                  )}
                </p>
                <div className={styles.tags}>
                  {role.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
