/**
 * Site-wide copy: name, metadata, the section list for the nav, the hero, and
 * interface labels used across components.
 */

export const site = {
  /** Short name on the left of the nav bar. Draft: team to confirm. */
  name: "Dopamine Trap",
  metaTitle: "What Makes a Song a Dopamine Trap? · IS428",
  description:
    "How audio features go with song popularity on Spotify and YouTube, explored through interactive dashboards.",
  ogImageAlt:
    "What Makes a Song a Dopamine Trap? IS428 Group G2T7, with a 2×2 grid of the four popularity groups.",
};

export type SectionId =
  "home" | "problem" | "how-to-read" | "findings" | "explore" | "deep-dive" | "so-what" | "methods";

/**
 * The page's sections, in order. `nav` is the nav-bar label; null keeps a section out
 * of the nav (the nav then highlights the nearest earlier link while it's on screen).
 */
export const sections: ReadonlyArray<{ id: SectionId; nav: string | null }> = [
  { id: "home", nav: "Home" },
  { id: "problem", nav: "Problem" },
  { id: "how-to-read", nav: null },
  { id: "findings", nav: "Findings" },
  { id: "explore", nav: "Explore" },
  { id: "deep-dive", nav: "Deep Dive" },
  { id: "so-what", nav: "So what?" },
  { id: "methods", nav: "Methods" },
];

export const hero = {
  eyebrow: "IS428 Visual Analytics · Group G2T7 · AY2026/27",
  title: "What Makes a Song a Dopamine Trap?",
  subtitle:
    "We compared 17,380 songs on Spotify and YouTube to see which audio features go with popularity on each platform, and whether a hit on one is a hit on the other.",
  primary: { label: "See the findings", href: "#findings" },
  secondary: { label: "Explore the dashboards", href: "#explore" },
  team: "By Samuel, Josh, John and Sze Hao",
  motif: {
    label:
      "The four popularity groups as a 2×2 grid, laid out like the dashboards' scatter plot: YouTube-only hit top left, Hit on both top right, Neither bottom left, Spotify-only hit bottom right. Spotify streams rise to the right; YouTube views rise upwards.",
    xAxis: "Spotify streams →",
    yAxis: "YouTube views →",
  },
};

/** Interface labels shared by components. */
export const ui = {
  skipToContent: "Skip to content",
  navLabel: "Page sections",
  menuOpen: "Menu",
  menuClose: "Close",
  backToTop: "Back to top",
  /** Theme toggle in the nav (a pressed/unpressed switch) */
  darkMode: "Dark mode",
  /** Says which popularity measure a figure uses. */
  measureAdjusted: "Age-adjusted",
  /** Prefix of the small secondary line under a figure. */
  rawPrefix: "Raw counts:",
  sourcePrefix: "Source:",
  embed: {
    fullScreen: "Full screen",
    exitFullScreen: "Exit full screen",
    openInteractive: "Open interactive view",
    close: "Close",
    /** {name} is the dashboard's name. */
    loading: "Loading {name}…",
    error: "This dashboard didn't load.",
    tryAgain: "Try again",
    rotateHint: "Turn your phone sideways for a bigger view.",
    frameLabel: "Interactive dashboard: {name}",
    skip: "Skip past this dashboard",
  },
  caption: {
    shows: "What this shows",
    insight: "Key insight",
    why: "Why it matters",
    tip: "Try this:",
  },
};
