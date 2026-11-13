"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chevron } from "@/components/ui/Accordion";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cx } from "@/lib/cx";
import { fill } from "@/lib/text";
import styles from "./ChapterStrip.module.css";

/** Nav height + strip height (--nav-h + --strip-h). */
const STICKY_OFFSET = 64 + 44;

export type StripChapter = { id: string; number: number; short: string; heading: string };

/**
 * Five numbered steps that stick under the nav inside Explore. The current chapter is
 * filled and the line to the next step fills as the reader scrolls (Motion row 5).
 * Each step links to its chapter. On phones it collapses to one line that opens the list.
 */
export function ChapterStrip({
  chapters,
  label,
  compactTemplate,
}: {
  chapters: StripChapter[];
  label: string;
  compactTemplate: string;
}) {
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const stripRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Fill the connectors directly (every scroll frame, no re-render).
  const onProgress = useCallback((index: number, progress: number) => {
    const connectors = stripRef.current?.querySelectorAll<HTMLElement>("[data-connector]");
    connectors?.forEach((el, i) => {
      const value = index < 0 ? 0 : i < index ? 1 : i === index ? progress : 0;
      el.style.setProperty("--fill", value.toFixed(3));
    });
  }, []);

  const active = useActiveSection(ids, STICKY_OFFSET, onProgress);
  const activeIndex = active ? ids.indexOf(active) : -1;
  const current = chapters[Math.max(0, activeIndex)];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav ref={stripRef} className={styles.strip} aria-label={label}>
      <div className={cx("container", styles.inner)}>
        <ol className={styles.steps} role="list">
          {chapters.map((chapter, i) => (
            <li key={chapter.id} className={styles.step}>
              <a
                className={styles.link}
                href={`#${chapter.id}`}
                aria-current={i === activeIndex ? "step" : undefined}
              >
                <span className={styles.num}>{chapter.number}</span>
                <span className={styles.label}>{chapter.short}</span>
              </a>
              {i < chapters.length - 1 && (
                <span className={styles.connector} aria-hidden="true">
                  <span className={styles.connectorFill} data-connector="" />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className={styles.compact}>
          <button
            type="button"
            className={styles.compactButton}
            aria-expanded={open}
            aria-controls="chapter-list"
            onClick={() => setOpen((value) => !value)}
          >
            <span className={styles.compactText}>
              {fill(compactTemplate, {
                n: current.number,
                total: chapters.length,
                title: current.heading,
              })}
            </span>
            <Chevron className={styles.chevron} />
          </button>
          <ol id="chapter-list" className={styles.compactList} role="list" hidden={!open}>
            {chapters.map((chapter, i) => (
              <li key={chapter.id}>
                <a
                  className={styles.compactLink}
                  href={`#${chapter.id}`}
                  aria-current={i === activeIndex ? "step" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.num}>{chapter.number}</span>
                  {chapter.heading}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
