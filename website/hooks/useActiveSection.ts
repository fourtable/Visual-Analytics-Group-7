"use client";

import { useEffect, useState } from "react";

/**
 * The id of the section the reader is in: the last of `ids` whose top has passed a
 * reading line just below the sticky bars. At the very bottom of the page the last
 * section wins, so short closing sections still get highlighted.
 *
 * `onProgress` (optional) receives how far through the active section the reading
 * line is, from 0 to 1, on every scroll frame, without re-rendering.
 */
export function useActiveSection(
  ids: readonly string[],
  topOffset: number,
  onProgress?: (activeIndex: number, progress: number) => void,
): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = topOffset + window.innerHeight * 0.3;
      let index = -1;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) index = i;
      });
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && index >= 0) index = els.length - 1;

      setActive(index >= 0 ? els[index].id : null);

      if (onProgress) {
        let progress = 0;
        if (index >= 0) {
          const rect = els[index].getBoundingClientRect();
          progress = rect.height > 0 ? (line - rect.top) / rect.height : 0;
          progress = Math.min(1, Math.max(0, atBottom ? 1 : progress));
        }
        onProgress(index, progress);
      }
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
  }, [key, topOffset, onProgress]);

  return active;
}
