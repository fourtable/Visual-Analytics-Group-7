"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cx } from "@/lib/cx";
import { ScrollProgress } from "./ScrollProgress";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Nav.module.css";

/** Matches --nav-h in app/globals.css. */
const NAV_HEIGHT = 64;

type SectionEntry = { id: string; nav: string | null };

type Labels = { navLabel: string; menuOpen: string; menuClose: string; darkMode: string };

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="9" height="9" rx="1.5" fill="var(--youtube)" />
      <rect x="11" y="0" width="9" height="9" rx="1.5" fill="var(--both)" />
      <rect x="0" y="11" width="9" height="9" rx="1.5" fill="var(--neither)" />
      <rect x="11" y="11" width="9" height="9" rx="1.5" fill="var(--spotify)" />
    </svg>
  );
}

/**
 * Sticky 64 px nav: site name, section links, current-section underline,
 * shadow after 80 px, scroll progress line, and a menu button below 900 px.
 * Smooth scrolling and the nav offset come from CSS (scroll-behavior, scroll-margin-top).
 */
export function Nav({
  siteName,
  sections,
  labels,
}: {
  siteName: string;
  sections: readonly SectionEntry[];
  labels: Labels;
}) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const items = useMemo(() => sections.filter((s) => s.nav), [sections]);
  const activeSection = useActiveSection(ids, NAV_HEIGHT);

  // Sections without a nav entry (How to read) keep the nearest earlier link active.
  const activeNav = useMemo(() => {
    if (!activeSection) return null;
    for (let i = ids.indexOf(activeSection); i >= 0; i--) {
      if (sections[i].nav) return sections[i].id;
    }
    return null;
  }, [activeSection, ids, sections]);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Slide the underline under the active link's text.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const place = () => {
      const label = activeNav
        ? list.querySelector<HTMLElement>(`a[href="#${activeNav}"] > span`)
        : null;
      if (!label || list.offsetParent === null) {
        indicator.style.opacity = "0";
        return;
      }
      const listBox = list.getBoundingClientRect();
      const box = label.getBoundingClientRect();
      indicator.style.transform = `translateX(${box.left - listBox.left}px) scaleX(${box.width})`;
      indicator.style.opacity = "1";
      if (!indicator.dataset.ready) {
        requestAnimationFrame(() => {
          indicator.dataset.ready = "";
        });
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeNav]);

  // Mobile menu: Escape closes it and returns focus to the button.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cx(styles.header, scrolled && styles.scrolled)}>
      <div className={cx("container", styles.inner)}>
        <a className={styles.brand} href="#home">
          <BrandMark />
          {siteName}
        </a>
        <div className={styles.end}>
          <nav aria-label={labels.navLabel}>
            <ul ref={listRef} className={styles.list} role="list">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    className={styles.link}
                    href={`#${item.id}`}
                    aria-current={activeNav === item.id ? "location" : undefined}
                  >
                    <span>{item.nav}</span>
                  </a>
                </li>
              ))}
              <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
            </ul>
            <button
              ref={buttonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="nav-panel"
              onClick={() => setOpen((value) => !value)}
            >
              <svg
                className={styles.menuIcon}
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                {open ? (
                  <path d="M4 4l10 10M14 4 4 14" />
                ) : (
                  <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" />
                )}
              </svg>
              {open ? labels.menuClose : labels.menuOpen}
            </button>
            <div ref={panelRef} id="nav-panel" className={styles.panel} hidden={!open}>
              <ul className={styles.panelList} role="list">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      className={styles.panelLink}
                      href={`#${item.id}`}
                      aria-current={activeNav === item.id ? "location" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.nav}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <ThemeToggle label={labels.darkMode} />
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
