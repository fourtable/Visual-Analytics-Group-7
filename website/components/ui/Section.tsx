import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cx } from "@/lib/cx";
import { Text } from "./Text";
import styles from "./Section.module.css";

/** A full-width, see-through band; the page-wide colour wash shows through every section. */
export function Section({
  id,
  tone = "bg",
  labelledBy,
  className,
  children,
}: {
  id: string;
  tone?: "bg" | "surface";
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx(styles.band, className)}
      data-tone={tone}
    >
      {children}
    </section>
  );
}

/** Section h2 plus an optional intro line; fades in once (Motion row 1). */
export function SectionHeader({
  headingId,
  heading,
  intro,
  className,
}: {
  headingId: string;
  heading: string;
  intro?: string;
  className?: string;
}) {
  return (
    <Reveal as="header" className={cx(styles.header, className)}>
      <h2 id={headingId}>
        <Text>{heading}</Text>
      </h2>
      {intro && (
        <p className={styles.intro}>
          <Text>{intro}</Text>
        </p>
      )}
    </Reveal>
  );
}

/** A titled block inside a section (h3). */
export function Block({
  heading,
  headingId,
  className,
  children,
}: {
  heading?: string;
  headingId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.block, className)}>
      {heading && (
        <h3 id={headingId} className={styles.blockHeading}>
          <Text>{heading}</Text>
        </h3>
      )}
      {children}
    </div>
  );
}
