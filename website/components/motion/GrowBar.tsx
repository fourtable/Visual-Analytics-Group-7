"use client";

import { useRef, type CSSProperties } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { cx } from "@/lib/cx";

type Props = {
  /** Final length, 0 to 1, as a share of the track */
  value: number;
  /** grow: from 0 to value. shrink: from full length down to value. */
  mode?: "grow" | "shrink";
  delay?: number;
  duration?: number;
  ease?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Motion rows 9, 10 and 12: a bar that grows (or shrinks) to its value with scaleX the
 * first time it's on screen. The final length is set in the HTML; the starting state
 * only exists while motion is allowed. Decorative: the number sits next to it in text.
 */
export function GrowBar({
  value,
  mode = "grow",
  delay = 0,
  duration,
  ease,
  color,
  className,
  style: extraStyle,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInViewOnce(ref, { threshold: 0.5 });
  const style = {
    ...extraStyle,
    "--value": Math.max(0, Math.min(1, value)),
    "--bar-delay": `${delay}ms`,
    ...(duration !== undefined && { "--bar-dur": `${duration}ms` }),
    ...(ease && { "--bar-ease": ease }),
    ...(color && { "--bar-color": color }),
  } as CSSProperties;
  return (
    <span
      ref={ref}
      className={cx("growbar", visible && "is-visible", className)}
      data-mode={mode}
      style={style}
      aria-hidden="true"
    >
      <span className="growbar-fill" />
    </span>
  );
}
