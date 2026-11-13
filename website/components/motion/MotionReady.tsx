"use client";

import { useEffect } from "react";

/**
 * Tells the head script in app/layout.tsx that the app is running. If this never
 * happens (a script failed), the head script removes the `motion` class after a few
 * seconds so no section is left hidden.
 */
export function MotionReady() {
  useEffect(() => {
    document.documentElement.dataset.ready = "1";
  }, []);
  return null;
}
