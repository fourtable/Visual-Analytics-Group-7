import type { Quadrant } from "./types";

/**
 * Section 3, "How to read our charts". Report sections 3 Definitions,
 * 9.2 Popularity Transformation and Classification, 9.3 Audio-Feature Standardisation.
 */
export const howToRead = {
  heading: "How to read our charts",
  intro: "The dashboards use a few terms throughout. Here are the definitions.",

  quadrants: {
    heading: "The four quadrants",
    definitions: {
      both: "In the top 25% on Spotify and on YouTube",
      spotify: "In Spotify's top 25%, but not YouTube's",
      youtube: "In YouTube's top 25%, but not Spotify's",
      neither: "Not in the top 25% on either platform",
    } satisfies Record<Quadrant, string>,
    note: 'A Spotify hit needs at least about 121.75 million streams, and a YouTube hit about 59.11 million views, adjusted for song age. "Neither" doesn\'t mean unpopular: it includes songs with plenty of streams and views just below the top 25%.',
    /** Shown after ui.rawPrefix. Read from Defining a Hit with Raw counts selected (13 Nov 2026). */
    rawNote: "about 134.74 million streams and 65.49 million views.",
  },

  glossary: {
    heading: "Glossary",
    terms: [
      {
        title: "Streams and views",
        body: "Spotify popularity is total streams; YouTube popularity is total views. We never merge them into one score.",
      },
      {
        title: "Log scale",
        body: "Song popularity varies widely. A log scale compresses this range so patterns among less and more popular songs are easier to see. Each gridline represents a tenfold increase.",
      },
      {
        title: "Adjusted for song age",
        body: "Accounts for how long a song has had to accumulate plays, making comparisons between newer and older songs fairer. Raw counts show total plays without adjustment.",
      },
      {
        title: "SD gap (z-score)",
        body: "Shows how far a group's average is from the overall average, in standard deviations. +0.35 means 0.35 SD above average; gaps within ±0.15 are considered small. This is not a significance test.",
      },
      {
        title: "Spearman ρ (rho)",
        body: "Measures the strength and direction of the relationship between an audio feature and popularity. Values range from −1 to +1; values within ±0.1 indicate a very weak relationship.",
      },
      {
        title: "Within-artist comparison",
        body: "Compares each song against the same artist's other songs, helping distinguish song-level patterns from artist-level differences.",
      },
    ],
  },
};
