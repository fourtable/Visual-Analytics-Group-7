import type { Measured, Quadrant } from "./types";

/**
 * The four popularity quadrants, using the report's names.
 * Colours live in app/globals.css (--both, --spotify, --youtube, --neither).
 */

/** Reading order used wherever the four are listed. */
export const quadrantOrder: readonly Quadrant[] = ["both", "spotify", "youtube", "neither"];

export const quadrantNames: Record<Quadrant, string> = {
  both: "Hit on both",
  spotify: "Spotify-only hit",
  youtube: "YouTube-only hit",
  neither: "Neither",
};

/**
 * Songs per quadrant, as the live Defining a Hit dashboard counts them (read from its
 * summary data on 13 Nov 2026). Age-adjusted counts cover the 16,925 songs with a
 * release date; raw counts cover all 17,380 analysed songs and match report 10.1.
 * The build plan's notebook estimate (2,559 / 1,673 / 1,673 / 11,020) differs because
 * Tableau sets its top-25% cut-offs over all 18,847 cleaned tracks.
 */
export const quadrantCounts: Measured<Record<Quadrant, number>> = {
  adjusted: { both: 2564, spotify: 1761, youtube: 1592, neither: 11008 },
  raw: { both: 2767, spotify: 1690, youtube: 1629, neither: 11294 },
};

export const quadrantTotals: Measured<number> = { adjusted: 16925, raw: 17380 };

/** Text after the counts, saying what they are counts of. */
export const quadrantTotalLabels: Measured<string> = {
  adjusted: "Age-adjusted, of 16,925 songs with a release date.",
  raw: "of 17,380 songs",
};
