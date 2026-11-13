"use client";

import { useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { cx } from "@/lib/cx";

type Tag = "div" | "header" | "ul" | "ol" | "section";

type Props = HTMLAttributes<HTMLElement> & {
  as?: Tag;
  /** Reveal direct children one after another (80 ms apart, up to 6) instead of as one block. */
  group?: boolean;
  children: ReactNode;
};

/**
 * Motion row 1: fades in and rises 16 px the first time it's 15% on screen.
 * The hidden starting state exists only while the `motion` class is on <html>
 * (see app/globals.css), so the content is always in the HTML.
 */
export function Reveal({ as = "div", group = false, className, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const visible = useInViewOnce(ref, { threshold: 0.15 });
  const Element = as as "div";
  return (
    <Element
      ref={ref as Ref<HTMLDivElement>}
      className={cx(group ? "reveal-group" : "reveal", visible && "is-visible", className)}
      {...rest}
    >
      {children}
    </Element>
  );
}
