import { quadrantNames } from "@/content/quadrants";
import type { Quadrant } from "@/content/types";
import { cx } from "@/lib/cx";
import styles from "./QuadrantMotif.module.css";

/** Same layout as the dashboards' scatter plot: Spotify on the x-axis, YouTube on the y-axis. */
const LAYOUT: ReadonlyArray<{ q: Quadrant; col: 0 | 1; row: 0 | 1 }> = [
  { q: "youtube", col: 0, row: 0 },
  { q: "both", col: 1, row: 0 },
  { q: "neither", col: 0, row: 1 },
  { q: "spotify", col: 1, row: 1 },
];

const CELL = 98;
const GAP = 4;

/** The 2×2 quadrant motif, drawn in SVG with the four quadrant colours. */
export function QuadrantMotif({
  label,
  xAxis,
  yAxis,
  variant = "hero",
  animate = false,
  className,
}: {
  label: string;
  xAxis: string;
  yAxis: string;
  variant?: "hero" | "compact";
  /** Hero only: squares appear one by one on page load (Motion row 8). */
  animate?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cx(
        styles.motif,
        variant === "compact" && styles.compact,
        animate && styles.animated,
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div className={styles.plot} aria-hidden="true">
        <svg className={styles.svg} viewBox="0 0 200 200" focusable="false">
          {LAYOUT.map(({ q, col, row }) => (
            <rect
              key={q}
              className={styles.square}
              data-q={q}
              x={col * (CELL + GAP)}
              y={row * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={6}
            />
          ))}
        </svg>
        {LAYOUT.map(({ q, col, row }) => (
          <span
            key={q}
            className={styles.label}
            data-q={q}
            style={{ left: `${col * 51 + 24.5}%`, top: `${row * 51 + 24.5}%` }}
          >
            {quadrantNames[q]}
          </span>
        ))}
      </div>
      <span className={styles.axisX} aria-hidden="true">
        {xAxis}
      </span>
      <span className={styles.axisY} aria-hidden="true">
        {yAxis}
      </span>
    </figure>
  );
}
