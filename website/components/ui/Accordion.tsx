import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Text } from "./Text";
import styles from "./Accordion.module.css";

export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

/** Native <details>/<summary>: collapsed by default, chevron turns when open. */
export function Accordion({
  title,
  meta,
  children,
}: {
  title: string;
  /** Small text after the title, e.g. "Draws on Chapters 2 and 3" */
  meta?: string;
  children: ReactNode;
}) {
  return (
    <details className={styles.item}>
      <summary className={styles.summary}>
        <span className={styles.title}>
          <Text>{title}</Text>
        </span>
        {meta && <span className={styles.meta}>{meta}</span>}
        <Chevron className={styles.chevron} />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}

/** A stack of accordions with rules between them. */
export function AccordionList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx(styles.list, className)}>{children}</div>;
}
