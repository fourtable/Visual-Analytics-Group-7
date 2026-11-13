"use client";

import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

type State = "hidden" | "shown" | "suppressed";

/**
 * Fades in after the first screen of scrolling. Hidden while the dashboards section
 * (`hideWithin`) fills the bottom of the screen, so it never covers a dashboard.
 */
export function BackToTop({ label, hideWithin }: { label: string; hideWithin: string }) {
  const [state, setState] = useState<State>("hidden");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const pastFirstScreen = window.scrollY > window.innerHeight;
      const zone = document.getElementById(hideWithin)?.getBoundingClientRect();
      const inZone = zone
        ? zone.top < window.innerHeight && zone.bottom > window.innerHeight - 96
        : false;
      setState(!pastFirstScreen ? "hidden" : inZone ? "suppressed" : "shown");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [hideWithin]);

  return (
    <a className={styles.button} href="#home" data-state={state} aria-label={label}>
      <svg
        className={styles.icon}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" />
      </svg>
    </a>
  );
}
