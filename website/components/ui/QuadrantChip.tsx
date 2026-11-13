import { quadrantNames } from "@/content/quadrants";
import type { Quadrant } from "@/content/types";
import { cx } from "@/lib/cx";
import styles from "./QuadrantChip.module.css";

/** A 10 px dot in the quadrant colour plus its name in the matching text colour. A label, not a button. */
export function QuadrantChip({ quadrant, className }: { quadrant: Quadrant; className?: string }) {
  return (
    <span className={cx(styles.chip, className)} data-q={quadrant}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.name}>{quadrantNames[quadrant]}</span>
    </span>
  );
}
