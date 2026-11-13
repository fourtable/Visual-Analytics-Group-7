import { CountUp } from "@/components/motion/CountUp";
import { GrowBar } from "@/components/motion/GrowBar";
import { QuadrantChip } from "@/components/ui/QuadrantChip";
import { splitBar } from "@/content/chapters";
import {
  quadrantCounts,
  quadrantOrder,
  quadrantTotalLabels,
  quadrantTotals,
} from "@/content/quadrants";
import { ui } from "@/content/site";
import type { Measure } from "@/content/types";
import styles from "./QuadrantSplitBar.module.css";

/** Matches --dur-slow: the whole bar fills in this time, segment by segment. */
const FILL_MS = 800;

const number = (n: number) => n.toLocaleString("en-US");
const percent = (count: number, measure: Measure) =>
  Math.round((count / quadrantTotals[measure]) * 100);

/** Each segment's share of the bar and where it starts (sum of the shares before it). */
const segments = quadrantOrder.map((q, i) => {
  const count = quadrantCounts.adjusted[q];
  const before = quadrantOrder.slice(0, i).reduce((sum, p) => sum + quadrantCounts.adjusted[p], 0);
  return {
    q,
    count,
    share: count / quadrantTotals.adjusted,
    offset: before / quadrantTotals.adjusted,
  };
});

const rawList = quadrantOrder
  .map((q) => `${number(quadrantCounts.raw[q])} (${percent(quadrantCounts.raw[q], "raw")}%)`)
  .join(" · ");

/**
 * Chapter 1 intro (Motion row 9): one full-width bar split into the four quadrants
 * (age-adjusted), filling segment by segment, with the raw counts in small text beneath.
 */
export function QuadrantSplitBar() {
  return (
    <figure className={styles.split}>
      <figcaption className={styles.label}>{splitBar.label}</figcaption>
      <div className={styles.bar}>
        {segments.map((s) => (
          <GrowBar
            key={s.q}
            className={styles.segment}
            style={{ flexGrow: s.share, flexBasis: 0 }}
            value={1}
            delay={Math.round(s.offset * FILL_MS)}
            duration={Math.round(s.share * FILL_MS)}
            ease="linear"
            color={`var(--${s.q})`}
          />
        ))}
      </div>
      <ul className={styles.legend} role="list">
        {segments.map((s) => (
          <li key={s.q} className={styles.item}>
            <QuadrantChip quadrant={s.q} />
            <span className={styles.count}>
              <CountUp value={number(s.count)} />{" "}
              <span className={styles.pct}>({percent(s.count, "adjusted")}%)</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={`raw-line ${styles.raw}`}>
        {quadrantTotalLabels.adjusted} {ui.rawPrefix} {rawList} {quadrantTotalLabels.raw}.
      </p>
    </figure>
  );
}
