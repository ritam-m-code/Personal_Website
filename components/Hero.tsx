import { profile } from "@/lib/content";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.main}>
          <p className={`mono ${styles.eyebrow}`}>{profile.seeking}</p>
          <h1 className={styles.headline}>{profile.tagline}</h1>
          <p className={styles.subline}>{profile.subline}</p>
          <div className={styles.actions}>
            <a href="#featured-work" className={styles.primaryCta}>
              See featured work
            </a>
            <a href={`mailto:${profile.email}`} className={styles.secondaryCta}>
              {profile.email}
            </a>
          </div>
        </div>

        <aside className={`mono ${styles.meta}`}>
          <dl>
            <div className={styles.metaRow}>
              <dt>Based</dt>
              <dd>{profile.location}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Studying</dt>
              <dd>
                {profile.education.program}
                <br />
                {profile.education.expected}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Elsewhere</dt>
              <dd>
                <a className={styles.metaLink} href={profile.links.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                {" / "}
                <a className={styles.metaLink} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
