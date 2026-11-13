"use client";

import { useEffect } from "react";
import { preloadDashboard } from "@/lib/embedQueue";

/**
 * Story links are plain anchors with a data-dashboard attribute. One listener on the
 * page starts loading the target dashboard on click, so it's usually ready when the
 * reader arrives. Loading never changes the dashboard.
 */
export function StoryLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[data-dashboard]");
      const id = link?.getAttribute("data-dashboard");
      if (id) preloadDashboard(id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
