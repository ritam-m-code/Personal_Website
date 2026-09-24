import { profile } from "@/lib/content";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap mono ${styles.inner}`}>
        <span>{profile.name} · {new Date().getFullYear()}</span>
        <a href="#top" className={styles.sourceLink}>
          back to top ↑
        </a>
      </div>
    </footer>
  );
}
