import type { DashboardId, Stat } from "./types";

/** Section 5, Explore: five chapters, one per analysis task (report 8.1 to 8.5), in report order. */
export const explore = {
  heading: "Explore",
  intro:
    "Five chapters, in the order we asked the questions. Each dashboard is live: hover, click and filter.",
  stripLabel: "Explore chapters",
  /** {n} = chapter number */
  chapterLabel: "Chapter {n}",
  /** Phone version of the chapter strip. {n}, {total}, {title} */
  compact: "Chapter {n} of {total} · {title}",
};

export type Chapter = {
  id: string;
  number: 1 | 2 | 3 | 4 | 5;
  /** Label in the chapter strip */
  short: string;
  heading: string;
  intro: string;
  dashboards: DashboardId[];
};

export const chapters: Chapter[] = [
  {
    id: "ch-agree",
    number: 1,
    short: "Agree?",
    heading: "Do the platforms agree on what a hit is?",
    intro:
      "We measure popularity separately on each platform and call a song a hit when it's in that platform's top 25%.",
    dashboards: ["dash-defining-a-hit", "dash-disagree"],
  },
  {
    id: "ch-sound",
    number: 2,
    short: "Sound",
    heading: "What do hits sound like?",
    intro:
      "We compare the four groups on every audio feature, and follow one feature from the least to the most popular songs.",
    dashboards: ["dash-hit-sound"],
  },
  {
    id: "ch-features",
    number: 3,
    short: "Features",
    heading: "Which features matter most?",
    intro:
      "We rank how closely each audio feature tracks popularity: on Spotify, on YouTube and on both together.",
    dashboards: ["dash-top3-platform", "dash-top3-both"],
  },
  {
    id: "ch-artist",
    number: 4,
    short: "Artist",
    heading: "Is it the song, or the artist?",
    intro:
      "We compare each song with its own artist's other songs, to separate the song from the artist.",
    dashboards: ["dash-sound-or-artist"],
  },
  {
    id: "ch-beyond",
    number: 5,
    short: "Beyond",
    heading: "Beyond the sound",
    intro:
      "Some kinds of track cluster in particular groups. Three fun facts, then the chart behind them.",
    dashboards: ["dash-flags"],
  },
];

/** Chapter 1 intro: the quadrant split bar (Motion row 9). */
export const splitBar = {
  label: "How the songs split across the four quadrants",
};

export type FunFact = { title: string; body: string; stat: Stat };

/**
 * Chapter 5 fun facts (age-adjusted, raw beneath). Report 8.5 and 10.7.
 * Figures read from the live Flags by Quadrant sheet on 13 Nov 2026.
 */
export const funFacts = {
  kicker: "Did you know?",
  cards: [
    {
      title: "Live on YouTube.",
      body: "YouTube-only hits are the group most likely to be live recordings.",
      stat: {
        value: { adjusted: "2.9% vs 0.6%", raw: "3.2% vs 0.8% (4×)" },
        label: "of YouTube-only vs Spotify-only hits: about 5×",
        measure: "Age-adjusted",
      },
    },
    {
      title: "Instrumentals rarely break through.",
      body: "Instrumental tracks are far more common among songs that are hits on neither platform.",
      stat: {
        value: { adjusted: "6.2% vs 1.0%", raw: "7.0% vs 0.9%" },
        label: "of Neither vs Hit on both songs are instrumental",
        measure: "Age-adjusted",
      },
    },
    {
      title: "Spoken word stays quiet.",
      body: "Of 34 spoken-word tracks, almost all are hits on neither platform.",
      stat: {
        value: { adjusted: "33 of 34", raw: "32 of 34" },
        label: "spoken-word tracks are in Neither; none is a hit on both",
        measure: "Age-adjusted",
      },
    },
  ] satisfies FunFact[],
  /** The button that expands the Flags by Quadrant chart */
  toggle: "See the chart",
  toggleOpen: "Hide the chart",
};
