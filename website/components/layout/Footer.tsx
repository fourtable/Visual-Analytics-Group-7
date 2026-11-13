import { Text } from "@/components/ui/Text";
import { footer } from "@/content/references";
import { site } from "@/content/site";
import styles from "./Footer.module.css";

/** Team, course line and disclaimer. No link to Tableau Public. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.site}>{site.name}</p>
        <p>
          <Text>{footer.team}</Text>
        </p>
        <p className={styles.course}>{footer.course}</p>
        <p className={styles.disclaimer}>{footer.disclaimer}</p>
      </div>
    </footer>
  );
}
