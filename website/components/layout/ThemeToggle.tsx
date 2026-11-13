"use client";

import { useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

/**
 * Dark mode on/off. The icon is chosen by CSS from <html data-theme>, so it is right
 * from first paint; the pressed state is read once the page is running.
 */
export function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => null);
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={label}
      aria-pressed={theme === null ? undefined : dark}
      title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <svg
        className={`${styles.icon} ${styles.moon}`}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" />
      </svg>
      <svg
        className={`${styles.icon} ${styles.sun}`}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4" />
      </svg>
    </button>
  );
}
