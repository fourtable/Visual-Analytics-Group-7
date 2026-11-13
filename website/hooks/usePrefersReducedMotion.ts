"use client";

import { useMediaQuery } from "./useMediaQuery";

/** True when the reader's device asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
