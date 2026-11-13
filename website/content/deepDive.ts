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
 * Songs picked from the dashboard data (spotify_youtube_release_date.csv): each is in
 * the same quadrant under both Popularity Measure settings. Streams and views are the
 * song card's totals; features are compared with the dataset average.
 */
export const deepDive = {
  heading: "Deep dive",
  intro: "Real songs, and patterns that run across the chapters.",

  spotlights: {
    heading: "Song spotlights",
    byLabel: "by",
    labels: {
      streams: "Spotify streams (total)",
      views: "YouTube views (total)",
      year: "Released",
      features: "Standout features",
    },
    link: { label: "See it in the dashboard →", dashboard: "dash-disagree" } satisfies StoryLink,
    cards: [
      {
        title: "Spotify Darling",
        quadrant: "spotify",
        song: "Wonderwall (Remastered)",
        artist: "Oasis",
        streams: "1.57B",
        views: "5.9M",
        year: "1995",
        features: "Fast tempo (174 BPM) and low danceability (0.38)",
        insight:
          "Over 1.5 billion Spotify streams for a 1995 song, while the YouTube video matched to it has under 6 million views.",
        where:
          "Its dot sits in the bottom-right corner, among the Spotify-only hits. Click it to open its song card.",
      },
      {
        title: "YouTube Darling",
        quadrant: "youtube",
        song: "Wheels on the Bus",
        artist: "CoComelon",
        streams: "83.4M",
        views: "4.90B",
        year: "2019",
        features: "Very danceable (0.94) and very upbeat (valence 0.97)",
        insight:
          "Like other children's songs in the data, it's watched far more on YouTube than it's streamed on Spotify.",
        where:
          "Its dot sits in the top-left corner, among the YouTube-only hits. Click it to open its song card.",
      },
      {
        title: "Agreed Hit",
        quadrant: "both",
        song: "Shape of You",
        artist: "Ed Sheeran",
        streams: "3.36B",
        views: "5.91B",
        year: "2017",
        features: "Very upbeat (valence 0.93) and louder than average (−3.2 dB)",
        insight:
          "Billions of plays on both platforms, and louder than most songs, like the typical hit on both.",
        where:
          "Its dot sits in the top-right corner, among the hits on both. Click it to open its song card.",
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
