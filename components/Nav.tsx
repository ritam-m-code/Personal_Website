import Link from "next/link";
import { nav, profile } from "@/lib/content";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <header className={styles.nav}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="#top" className={styles.mark}>
          {profile.name}
        </Link>

        <nav className={styles.links} aria-label="Section navigation">
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} className={styles.link}>
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a href="/resume.pdf" className={styles.resume} target="_blank" rel="noopener noreferrer">
          Résumé ↓
        </a>
      </div>

      <nav className={styles.mobileLinks} aria-label="Section navigation (mobile)">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className={styles.mobileLink}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
