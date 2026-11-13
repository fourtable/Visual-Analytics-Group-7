"use client";

import { useEffect, useState, type RefObject } from "react";

type Options = {
  /** Grow (or shrink) the screen area, e.g. "600px" to fire before the element arrives. */
  rootMargin?: string;
  /** Share of the element (or, for very tall elements, of the screen) that must be visible. */
  threshold?: number;
};

const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);

/** True from the first time the element is on screen (per the options). Never resets. */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", threshold = 0 }: Options = {},
): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setSeen(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          const enough =
            threshold === 0 ||
            entry.intersectionRatio >= threshold ||
            entry.intersectionRect.height >= screen * threshold;
          if (enough) {
            setSeen(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold: threshold === 0 ? 0 : STEPS },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, seen]);

  return seen;
}
