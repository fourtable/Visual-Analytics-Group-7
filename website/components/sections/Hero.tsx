import { Button } from "@/components/ui/Button";
import { QuadrantMotif } from "@/components/ui/QuadrantMotif";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { hero } from "@/content/site";
import { cx } from "@/lib/cx";
import styles from "./Hero.module.css";

/** 1. Hero: what the site is, and the findings one click away. The text never waits for JavaScript. */
export function Hero() {
  return (
    <Section id="home" labelledBy="home-title" className={styles.hero}>
      <div className={cx("container", styles.inner)}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 id="home-title" className={styles.title}>
            {hero.title}
          </h1>
          <p className={styles.subtitle}>
            <Text>{hero.subtitle}</Text>
          </p>
          <div className={styles.actions}>
            <Button href={hero.primary.href}>{hero.primary.label}</Button>
            <Button href={hero.secondary.href} variant="secondary">
              {hero.secondary.label}
            </Button>
          </div>
          <p className={styles.team}>
            <Text>{hero.team}</Text>
          </p>
        </div>
        <QuadrantMotif
          className={styles.motif}
          label={hero.motif.label}
          xAxis={hero.motif.xAxis}
          yAxis={hero.motif.yAxis}
          animate
        />
      </div>
    </Section>
  );
}
