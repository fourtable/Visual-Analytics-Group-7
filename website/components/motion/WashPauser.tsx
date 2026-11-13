"use client";

import { useEffect } from "react";

/**
 * Pauses the page-wide colour wash (app/globals.css) whenever a dashboard is on screen.
 * The animated wash makes the browser redraw a full-screen layer every frame; behind a
 * live Tableau dashboard that cost about 30% CPU at rest and made interaction laggy.
 * Paused, it costs nothing, and it resumes from the same point when no dashboard shows.
 */
export function WashPauser() {
  useEffect(() => {
    const blocks = document.querySelectorAll('section[id^="dash-"]');
    if (blocks.length === 0 || typeof IntersectionObserver === "undefined") return;
    const root = document.documentElement;
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      root.classList.toggle("wash-paused", onScreen.size > 0);
    });
    blocks.forEach((block) => io.observe(block));
    return () => {
      io.disconnect();
      root.classList.remove("wash-paused");
    };
  }, []);
  return null;
}
