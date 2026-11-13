"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { buttonClass } from "@/components/ui/Button";
import { useElementSize } from "@/hooks/useElementSize";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cx } from "@/lib/cx";
import { cancelWaiting, enqueue, registerPreloader, release } from "@/lib/embedQueue";
import { TOOLBAR_CROP_PX } from "@/lib/tableau";
import { fill } from "@/lib/text";
import { EmbedBar, type EmbedBarLabels } from "./EmbedBar";
import styles from "./TableauEmbed.module.css";

export type EmbedLabels = EmbedBarLabels & {
  loading: string;
  error: string;
  tryAgain: string;
  frameLabel: string;
};

type Props = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  fallback: { src: string; src2x: string };
  fallbackAlt: string;
  labels: EmbedLabels;
};

type Status = "idle" | "queued" | "loading" | "ready" | "error";
type Mode = "inline" | "fullscreen" | "overlay";

type VizElement = HTMLElement & { iframe?: HTMLIFrameElement | null };
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FullscreenTarget = HTMLElement & { webkitRequestFullscreen?: () => void };

const WIDE = "(min-width: 1024px)";
/** Start loading when the frame is this close to the screen (Build Plan: 600 px). */
const NEAR = "600px 0px";
/** An unfinished load this far away gives up its slot so nearer dashboards can load. */
const FAR = "1600px 0px";
/** Show the screenshot and Try again after this long on screen without `firstinteractive`. */
const ERROR_AFTER_MS = 15_000;

function currentFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * One Tableau dashboard (Build Plan › Tableau embeds, › Dashboard interaction).
 *
 * The server HTML holds the screenshot, sized to the dashboard, so the page never
 * jumps and works without JavaScript. On screens 1024 px and wider the live embed is
 * created once the frame is within 600 px of the screen (at most two loading at once),
 * scaled down to fit with transform: scale(), and kept for good once ready, so the
 * reader's own filters and selections survive scrolling away and back.
 * Under 1024 px, Open interactive view shows the same live dashboard in a full-screen
 * overlay. Full screen and the overlay restyle this element in place, so the iframe is
 * never moved or reloaded. The site only loads dashboards and listens for
 * `firstinteractive`; it never changes a filter, parameter or selection.
 */
export function TableauEmbed({
  id,
  name,
  src,
  width,
  height,
  fallback,
  fallbackAlt,
  labels,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<VizElement | null>(null);
  const statusRef = useRef<Status>("idle");
  const pinnedRef = useRef(false); // the reader asked for this one: never cancel it
  const savedScrollRef = useRef(0);

  const [status, setStatusState] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>("inline");
  const wide = useMediaQuery(WIDE);
  const near = useInView(areaRef, NEAR);
  const withinFar = useInView(areaRef, FAR);
  const onScreen = useInView(areaRef);
  const area = useElementSize(areaRef);

  const setStatus = useCallback((next: Status) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const teardown = useCallback(() => {
    vizRef.current?.remove();
    vizRef.current = null;
  }, []);

  const fail = useCallback(() => {
    teardown();
    release(id);
    setStatus("error");
  }, [id, setStatus, teardown]);

  /** Ask for a slot in the loading queue. `urgent` (the reader asked) skips the queue. */
  const request = useCallback(
    (urgent: boolean) => {
      if (urgent) pinnedRef.current = true;
      const current = statusRef.current;
      if (current === "ready" || current === "loading") return;
      if (current === "queued" && !urgent) return;
      setStatus("queued");
      enqueue(id, () => setStatus("loading"), urgent);
    },
    [id, setStatus],
  );

  // Lazy load on wide screens when the frame comes within 600 px.
  useEffect(() => {
    if (wide && near && statusRef.current === "idle") request(false);
  }, [wide, near, request]);

  // An unfinished load that has scrolled far away gives up its slot.
  useEffect(() => {
    if (withinFar || pinnedRef.current) return;
    if (statusRef.current === "queued") {
      cancelWaiting(id);
      setStatus("idle");
    } else if (statusRef.current === "loading") {
      teardown();
      release(id);
      setStatus("idle");
    }
  }, [withinFar, id, setStatus, teardown]);

  // Create the <tableau-viz> once a slot is granted. Done in an effect to avoid
  // custom-element typing issues in TSX.
  useEffect(() => {
    if (status !== "loading") return;
    let cancelled = false;
    customElements.whenDefined("tableau-viz").then(() => {
      const host = hostRef.current;
      if (cancelled || !host || statusRef.current !== "loading" || vizRef.current) return;
      const viz = document.createElement("tableau-viz") as VizElement;
      viz.setAttribute("src", src);
      viz.setAttribute("width", String(width));
      // Taller by the strip Tableau Public always adds for its toolbar; the frame crops it.
      viz.setAttribute("height", String(height + TOOLBAR_CROP_PX));
      viz.setAttribute("toolbar", "hidden");
      viz.setAttribute("hide-tabs", "");
      viz.setAttribute("device", "desktop");
      viz.addEventListener("firstinteractive", () => {
        if (vizRef.current !== viz) return;
        const iframe =
          viz.iframe ?? viz.shadowRoot?.querySelector("iframe") ?? viz.querySelector("iframe");
        iframe?.setAttribute("title", name);
        release(id);
        setStatus("ready");
      });
      viz.addEventListener("vizloaderror", () => {
        if (vizRef.current === viz) fail();
      });
      vizRef.current = viz;
      host.appendChild(viz);
    });
    return () => {
      cancelled = true;
    };
  }, [status, src, width, height, name, id, fail, setStatus]);

  // Error state: 15 s on screen without firstinteractive. (Off-screen time doesn't count:
  // browsers throttle off-screen frames.)
  useEffect(() => {
    if (status !== "loading" || !(onScreen || mode !== "inline")) return;
    const timer = window.setTimeout(fail, ERROR_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [status, onScreen, mode, fail]);

  // Story links start this dashboard loading straight away (wide screens only).
  useEffect(
    () =>
      registerPreloader(id, () => {
        if (window.matchMedia(WIDE).matches) request(true);
      }),
    [id, request],
  );

  // Leaving the page: free the slot.
  useEffect(
    () => () => {
      teardown();
      release(id);
      cancelWaiting(id);
    },
    [id, teardown],
  );

  // Full screen: track the browser's full-screen state for this stage.
  useEffect(() => {
    const onChange = () => {
      if (currentFullscreenElement() === stageRef.current) setMode("fullscreen");
      else setMode((m) => (m === "fullscreen" ? "inline" : m));
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const openOverlay = useCallback(() => {
    request(true);
    savedScrollRef.current = window.scrollY;
    setMode("overlay");
  }, [request]);

  const openFullscreen = useCallback(() => {
    request(true);
    const stage = stageRef.current as FullscreenTarget | null;
    if (!stage) return;
    const enter = stage.requestFullscreen
      ? () => stage.requestFullscreen()
      : stage.webkitRequestFullscreen
        ? () => stage.webkitRequestFullscreen?.()
        : null;
    if (!enter) {
      openOverlay();
      return;
    }
    Promise.resolve()
      .then(enter)
      .catch(() => openOverlay());
  }, [request, openOverlay]);

  const close = useCallback(() => {
    if (mode === "fullscreen") {
      const doc = document as FullscreenDocument;
      if (doc.exitFullscreen) doc.exitFullscreen().catch(() => setMode("inline"));
      else doc.webkitExitFullscreen?.();
    } else {
      setMode("inline");
    }
  }, [mode]);

  // Overlay: lock page scroll, Escape closes, keep focus inside, return to the same place.
  useEffect(() => {
    if (mode !== "overlay") return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const focusAction = () => {
      const buttons = stageRef.current?.querySelectorAll<HTMLButtonElement>("[data-embed-action]");
      Array.from(buttons ?? [])
        .find((b) => b.offsetParent !== null)
        ?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("inline");
    };
    const onFocusIn = (event: FocusEvent) => {
      const stage = stageRef.current;
      if (stage && event.target instanceof Node && !stage.contains(event.target)) focusAction();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      window.scrollTo({ top: savedScrollRef.current, behavior: "instant" });
    };
  }, [mode]);

  const expanded = mode !== "inline";
  let scale = 1;
  if (area.width > 0) {
    scale = expanded
      ? Math.min(1, area.width / width, area.height / height)
      : Math.min(1, area.width / width);
  }

  // Under 1024 px the inline frame keeps showing the screenshot even once a live view exists.
  const showScreenshot = status !== "ready" || !wide;
  const loading = status === "queued" || status === "loading";
  const areaStyle: CSSProperties | undefined = expanded
    ? undefined
    : { aspectRatio: `${width} / ${height}`, maxWidth: width };
  const frameStyle: CSSProperties | undefined = expanded
    ? { width: Math.floor(width * scale), height: Math.floor(height * scale) }
    : undefined;

  return (
    <div
      ref={stageRef}
      className={cx(styles.stage, expanded && styles.expanded)}
      data-mode={mode}
      data-status={status}
      role={mode === "overlay" ? "dialog" : undefined}
      aria-modal={mode === "overlay" ? true : undefined}
      aria-label={mode === "overlay" ? name : undefined}
    >
      <EmbedBar
        name={name}
        expanded={expanded}
        overlay={mode === "overlay"}
        labels={labels}
        onWide={expanded ? close : openFullscreen}
        onNarrow={expanded ? close : openOverlay}
        className={expanded ? styles.barExpanded : undefined}
      />
      <div ref={areaRef} className={styles.area} style={areaStyle}>
        <figure
          className={styles.frame}
          style={frameStyle}
          aria-label={fill(labels.frameLabel, { name })}
        >
          {showScreenshot && (
            // eslint-disable-next-line @next/next/no-img-element -- static export: plain <img> with srcset
            <img
              className={styles.shot}
              src={fallback.src}
              srcSet={`${fallback.src} ${width}w, ${fallback.src2x} ${width * 2}w`}
              sizes={`(min-width: ${width + 48}px) ${width}px, calc(100vw - 32px)`}
              width={width}
              height={height}
              alt={fallbackAlt}
              loading="lazy"
              decoding="async"
            />
          )}
          <div
            ref={hostRef}
            className={styles.host}
            style={{ width, height: height + TOOLBAR_CROP_PX, transform: `scale(${scale})` }}
          />
          {loading && (
            <div className={styles.loading} aria-hidden="true">
              <span className={styles.loadingLabel}>{fill(labels.loading, { name })}</span>
            </div>
          )}
          {status === "error" && (
            <div className={styles.error} role="status">
              <span>{labels.error}</span>
              <button
                type="button"
                className={buttonClass("primary", true)}
                onClick={() => request(true)}
              >
                {labels.tryAgain}
              </button>
            </div>
          )}
        </figure>
      </div>
    </div>
  );
}
