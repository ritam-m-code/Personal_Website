"use client";

import { useState } from "react";
import { profile } from "@/lib/content";
import { useReveal } from "@/lib/useReveal";
import styles from "./Contact.module.css";

export default function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the mailto link on the same button still works
    }
  }

  return (
    <section id="contact" className="section">
      <div className="wrap" ref={ref}>
        <div className="sectionHead reveal">
          <span className="sectionNumber">§06</span>
          <h2 className="sectionTitle">Contact</h2>
          <span className="sectionRule" />
        </div>

        <div className={`${styles.block} reveal`}>
          <p className={styles.line}>
            Open to software and robotics roles. The fastest way to reach me:
          </p>

          <button type="button" onClick={copyEmail} className={styles.emailButton}>
            <span className="mono">{profile.email}</span>
            <span className={`mono ${styles.copyHint}`}>{copied ? "copied ✓" : "copy"}</span>
          </button>

          <p className={`mono ${styles.altEmail}`}>
            or{" "}
            <a href={`mailto:${profile.altEmail}`} className={styles.altEmailLink}>
              {profile.altEmail}
            </a>
          </p>

          <div className={styles.links}>
            <a href={`mailto:${profile.email}`} className={styles.linkPill}>
              Email
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkPill}>
              LinkedIn
            </a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className={styles.linkPill}>
              GitHub
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.linkPill}>
              Résumé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
