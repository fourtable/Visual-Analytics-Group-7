import type { AccordionEntry, Quadrant, StoryLink } from "./types";

export type Spotlight = {
  title: string;
  quadrant: Quadrant;
  song: string;
  artist: string;
  streams: string;
  views: string;
  year: string;
  features: string;
  insight: string;
  /** Where the song's dot sits, so the reader can click it */
  where: string;
};

export type Pattern = AccordionEntry & { drawsOn: string };

/**
 * Section 6, Deep Dive: the site's own addition (no report equivalent).
 * Pick the three songs from the song card on Where the Platforms Disagree.
 */
export const deepDive = {
  heading: "Deep dive",
  intro: "Real songs, and patterns that run across the chapters.",

  spotlights: {
    heading: "Song spotlights",
    byLabel: "by",
    labels: {
      streams: "Spotify streams",
      views: "YouTube views",
      year: "Released",
      features: "Standout features",
    },
    link: { label: "See it in the dashboard →", dashboard: "dash-disagree" } satisfies StoryLink,
    cards: [
      {
        title: "Spotify Darling",
        quadrant: "spotify",
        song: "[Song]",
        artist: "[Artist]",
        streams: "[streams]",
        views: "[views]",
        year: "[release year]",
        features: "[two standout audio features]",
        insight: "[One insight line]",
        where:
          "Its dot sits in the bottom-right corner, among the Spotify-only hits, at [streams] streams and [views] views.",
      },
      {
        title: "YouTube Darling",
        quadrant: "youtube",
        song: "[Song]",
        artist: "[Artist]",
        streams: "[streams]",
        views: "[views]",
        year: "[release year]",
        features: "[two standout audio features]",
        insight: "[One insight line]",
        where:
          "Its dot sits in the top-left corner, among the YouTube-only hits, at [streams] streams and [views] views.",
      },
      {
        title: "Agreed Hit",
        quadrant: "both",
        song: "[Song]",
        artist: "[Artist]",
        streams: "[streams]",
        views: "[views]",
        year: "[release year]",
        features: "[two standout audio features]",
        insight: "[One insight line]",
        where:
          "Its dot sits in the top-right corner, among the hits on both, at [streams] streams and [views] views.",
      },
    ] satisfies Spotlight[],
  },

  patterns: {
    heading: "Patterns across chapters",
    drawsOnPrefix: "Draws on",
    items: [
      {
        title: "Same sound, different strength",
        drawsOn: "Chapters 2 and 3",
        body: "Both platforms reward louder, less instrumental songs. The difference is degree: loudness and energy climb more steeply with popularity on YouTube, and only YouTube adds song length to its top three.",
      },
      {
        title: "The artist effect",
        drawsOn: "Chapters 3 and 4",
        body: 'The features that set hits apart mostly fade when each song is compared with its own artist\'s other tracks. Part of the "hit sound" is simply the sound of artists who already have hits.',
      },
      {
        title: '"Neither" isn\'t failure',
        drawsOn: "Chapters 1 and 5",
        body: "Two songs in three sit outside both top-25% groups, including many with huge play counts. Instrumental and spoken-word tracks cluster here, which suggests track type matters alongside sound.",
      },
    ] satisfies Pattern[],
  },
};
