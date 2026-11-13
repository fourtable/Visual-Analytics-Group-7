/**
 * Tableau Public always draws its own toolbar (with "View on Tableau Public" and Share)
 * in a 27 px strip under every embedded viz, even when the toolbar is set to hidden.
 * The site never links out to Tableau Public, so each embed is made this much taller
 * than the dashboard and the strip is cropped off by the frame. This also stops the
 * iframe from scrolling internally. Keep in sync with scripts/capture-dashboards.mjs.
 */
export const TOOLBAR_CROP_PX = 27;

export const EMBEDDING_API_SRC =
  "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
