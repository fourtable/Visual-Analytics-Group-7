"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { motionAllowed } from "@/lib/motion";

/** Matches --dur-slow in app/globals.css. */
const DURATION_MS = 800;

type Part = { text: string } | { value: number; decimals: number; grouped: boolean };

const NUMBER = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g;

function parse(value: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const match of value.matchAll(NUMBER)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: value.slice(last, index) });
    const raw = match[0];
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    parts.push({ value: Number(raw.replace(/,/g, "")), decimals, grouped: raw.includes(",") });
    last = index + raw.length;
  }
  if (last < value.length) parts.push({ text: value.slice(last) });
  return parts;
}

function format(n: number, decimals: number, grouped: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!grouped) return fixed;
  const [whole, fraction] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${withCommas}.${fraction}` : withCommas;
}

function render(parts: Part[], t: number): string {
  return parts
    .map((p) => ("text" in p ? p.text : format(p.value * t, p.decimals, p.grouped)))
    .join("");
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Motion row 4: counts the numbers inside `value` (e.g. "US$31.7B", "32% vs 31%",
 * "16,925") up from 0 the first time it's on screen.
 * The exact final value is in the HTML, and screen readers only ever hear it
 * (a visually hidden copy); the counting copy is hidden from them.
 */
export function CountUp({ value }: { value: string }) {
  const parts = useMemo(() => parse(value), [value]);
  const hasNumber = parts.some((p) => !("text" in p));
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useRef(false);
  const visible = useInViewOnce(ref, { threshold: 0.6 });

  // Before first paint: reserve the final width, then show zero — only when motion is allowed.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !hasNumber || !motionAllowed()) return;
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.textContent = render(parts, 0);
    armed.current = true;
    return () => {
      el.textContent = value;
      el.style.minWidth = "";
      armed.current = false;
    };
  }, [parts, hasNumber, value]);

  useEffect(() => {
    const el = ref.current;
    if (!visible || !el || !armed.current) return;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION_MS);
      if (p < 1) {
        el.textContent = render(parts, 1 - Math.pow(1 - p, 3));
        frame = requestAnimationFrame(tick);
      } else {
        el.textContent = value; // always end on the exact value
        el.style.minWidth = "";
        armed.current = false;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [visible, parts, value]);

  if (!hasNumber) return <>{value}</>;
  return (
    <span className="countup">
      <span className="sr-only">{value}</span>
      <span ref={ref} className="countup-num" aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
