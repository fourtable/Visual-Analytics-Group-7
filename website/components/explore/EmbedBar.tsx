"use client";

import { cx } from "@/lib/cx";
import styles from "./EmbedBar.module.css";

export type EmbedBarLabels = {
  fullScreen: string;
  exitFullScreen: string;
  openInteractive: string;
  close: string;
  rotateHint: string;
};

function ExpandIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

/**
 * The slim bar above each embed: the dashboard's name and Full screen (Open interactive
 * view under 1024 px). The same two buttons switch to Exit full screen / Close when the
 * dashboard is expanded, so keyboard focus stays where it was.
 */
export function EmbedBar({
  name,
  expanded,
  overlay,
  labels,
  onWide,
  onNarrow,
  className,
}: {
  name: string;
  expanded: boolean;
  overlay: boolean;
  labels: EmbedBarLabels;
  onWide: () => void;
  onNarrow: () => void;
  className?: string;
}) {
  return (
    <div className={cx(styles.bar, className)}>
      <p className={styles.name}>{name}</p>
      {overlay && <p className={styles.hint}>{labels.rotateHint}</p>}
      <button
        type="button"
        className={cx(styles.action, styles.wideOnly)}
        onClick={onWide}
        data-embed-action=""
      >
        {expanded ? <CloseIcon /> : <ExpandIcon />}
        <span>{expanded ? labels.exitFullScreen : labels.fullScreen}</span>
      </button>
      <button
        type="button"
        className={cx(styles.action, styles.narrowOnly, !expanded && styles.primary)}
        onClick={onNarrow}
        data-embed-action=""
      >
        {expanded ? <CloseIcon /> : <ExpandIcon />}
        <span>{expanded ? labels.close : labels.openInteractive}</span>
      </button>
    </div>
  );
}
