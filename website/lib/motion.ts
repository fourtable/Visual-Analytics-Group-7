/**
 * Whether animations may run right now: the head script in app/layout.tsx added the
 * `motion` class (reduced motion not requested, JavaScript running) and the reader
 * hasn't switched reduced motion on since.
 */
export function motionAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.classList.contains("motion") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
