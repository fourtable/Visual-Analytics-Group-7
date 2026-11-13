/**
 * Shared content types. Everything the page says lives in content/; components only
 * lay it out. Inside any string:
 *   [text]   is a placeholder the team still has to fill (shown highlighted on the page)
 *   **text** is bold, *text* is italic
 */

/** Popularity measure. The site shows `adjusted` by default, as the report does. */
export type Measure = "adjusted" | "raw";

/** A figure stored under both measures, e.g. { adjusted: "20%", raw: "19%" }. */
export type Measured<T> = Record<Measure, T>;

export type Quadrant = "both" | "spotify" | "youtube" | "neither";

export type Link = { label: string; href: string };

/** A footer or reference link whose address the team hasn't supplied yet. */
export type MaybeLink = { label: string; href: string | null };

/**
 * A stat chip: a big value with a one-line label under it.
 * `value` may be measured (adjusted shown, raw beneath when it differs).
 */
export type Stat = {
  value: string | Measured<string>;
  label: string;
  /** Says which popularity measure the chip shows (e.g. "Age-adjusted"). */
  measure?: string;
  /** Extra line in raw-count style, for findings where raw counts change the words. */
  rawNote?: string;
  source?: Link;
};

export type Caption = {
  shows: string;
  insight?: string;
  why: string;
  /** One-line "Try this" tip naming a control that is on the dashboard. */
  tip: string;
};

export type AccordionEntry = { title: string; body: string };

/** Ids of the anchors story links may point at. */
export type DashboardId =
  | "dash-defining-a-hit"
  | "dash-disagree"
  | "dash-hit-sound"
  | "dash-top3-platform"
  | "dash-top3-both"
  | "dash-sound-or-artist"
  | "dash-flags";

/** A link that scrolls to a dashboard (and starts loading it). It never changes the dashboard. */
export type StoryLink = { label: string; dashboard: DashboardId };
