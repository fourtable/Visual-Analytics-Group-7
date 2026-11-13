import type { Quadrant } from "./types";

/**
 * Section 3, "How to read our charts". Report sections 3 Definitions,
 * 9.2 Popularity Transformation and Classification, 9.3 Audio-Feature Standardisation.
 */
export const howToRead = {
  heading: "How to read our charts",
  intro: "The dashboards use a few terms throughout. Here they are, once.",

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
        body: "A few songs have far more plays than the rest, so the scatter plots use log scales. Each gridline is ten times the one below.",
      },
      {
        title: "Adjusted for song age",
        body: "Song age is the time since a song's first release. The adjusted measure accounts for how long a song has had to collect plays; Raw counts shows the totals.",
      },
      {
        title: "SD gap (z-score)",
        body: "How far a group's average sits from the average song, in standard deviations. +0.35 means 0.35 SD above average. Gaps between −0.15 and +0.15 count as small. This is a reading guide, not a significance test.",
      },
      {
        title: "Spearman ρ (rho)",
        body: "From −1 to 1, how closely a feature rises or falls with popularity. Values between −0.1 and 0.1 count as too small to matter.",
      },
      {
        title: "Within-artist comparison",
        body: "Compares each song with the same artist's other songs, to separate the song from the artist.",
      },
    ],
  },
};
