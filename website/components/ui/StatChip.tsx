import { CountUp } from "@/components/motion/CountUp";
import { ui } from "@/content/site";
import type { Stat } from "@/content/types";
import { cx } from "@/lib/cx";
import { hasPlaceholder } from "@/lib/text";
import { Text } from "./Text";
import styles from "./StatChip.module.css";

/**
 * A big number with a one-line label under it. Measured values show the age-adjusted
 * figure, with the raw figure as a small secondary line when the two differ.
 */
export function StatChip({
  stat,
  size = "lg",
  className,
}: {
  stat: Stat;
  size?: "lg" | "md";
  className?: string;
}) {
  const main = typeof stat.value === "string" ? stat.value : stat.value.adjusted;
  const raw = typeof stat.value === "string" ? null : stat.value.raw;

  return (
    <div className={cx(styles.chip, size === "md" && styles.md, className)}>
      <p className={styles.value}>
        {hasPlaceholder(main) ? <Text>{main}</Text> : <CountUp value={main} />}
      </p>
      <p className={styles.label}>
        <Text>{stat.label}</Text>
      </p>
      {stat.measure && <p className={styles.measure}>{stat.measure}</p>}
      {raw !== null && raw !== main && (
        <p className="raw-line">
          {ui.rawPrefix} <Text>{raw}</Text>
        </p>
      )}
      {stat.rawNote && (
        <p className="raw-line">
          <Text>{stat.rawNote}</Text>
        </p>
      )}
      {stat.source && (
        <p className={styles.source}>
          {ui.sourcePrefix} <a href={stat.source.href}>{stat.source.label}</a>
        </p>
      )}
    </div>
  );
}
