import { Text } from "@/components/ui/Text";
import { footer } from "@/content/references";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";
import styles from "./Footer.module.css";

/** Team, course line, project links, references and disclaimer. No link to Tableau Public. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={cx("container", styles.grid)}>
        <div>
          <p className={styles.site}>{site.name}</p>
          <p>
            <Text>{footer.team}</Text>
          </p>
          <p className={styles.course}>{footer.course}</p>
        </div>
        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className={styles.heading}>
            {footer.linksHeading}
          </h2>
          <ul className={styles.list} role="list">
            {footer.links.map((link) => (
              <li key={link.label}>
                {link.href ? <a href={link.href}>{link.label}</a> : <Text>{link.label}</Text>}
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className={styles.heading}>{footer.referencesHeading}</h2>
          <ul className={styles.list} role="list">
            {footer.references.map((ref) => (
              <li key={ref.label}>
                <a href={ref.href}>{ref.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container">
        <p className={styles.disclaimer}>{footer.disclaimer}</p>
      </div>
    </footer>
  );
}
