import type { Link, Stat } from "./types";

const ifpiGlobal: Link = {
  label: "IFPI Global Music Report 2026",
  href: "https://www.ifpi.org/global-music-report-2026-global-recorded-music-revenues-grow-6-4-as-record-companies-drive-innovation/",
};

const ifpiEngaging: Link = {
  label: "IFPI Engaging with Music 2023",
  href: "https://www.ifpi.se/statistik/engaging-with-music-report/",
};

/** Section 2. Report sections 1 Introduction, 2 Motivation and 5.3 Research Gap. */
export const problem = {
  heading: "The problem",

  background: {
    heading: "Background",
    text: "Music today lives on both audio and video platforms. Listeners spend roughly a third of their music time on audio streaming and almost as much on video streaming. Yet, popularity isn't measured equally: Spotify counts streams, while YouTube counts views.",
    stats: [
      {
        value: "US$31.7B",
        label: "Global recorded music revenue in 2025, up 6.4%",
        source: ifpiGlobal,
      },
      { value: "20.7 hours", label: "Average weekly music listening", source: ifpiEngaging },
      {
        value: "32% vs 31%",
        label: "Share of music time on audio vs video streaming",
        source: ifpiEngaging,
      },
    ] satisfies Stat[],
    /** Motion row 10: two bars beside the 32% vs 31% chip. */
    listening: [
      { label: "Audio streaming", value: 0.32, display: "32%" },
      { label: "Video streaming", value: 0.31, display: "31%" },
    ],
  },

  why: {
    heading: "Why it matters",
    cards: [
      {
        title: "For labels",
          subtitle: "Less guesswork. Smarter bets",
          body: "Breaking into the charts takes more than talent. By uncovering which audio features are associated with popularity on Spotify and YouTube, labels can make more informed decisions when scouting artists and planning promotional strategies.",
      },
      {
        title: "For listeners",
          subtitle: "Is there a formula behind your favourite hits?",
          body: "We uncover the audio characteristics shared by popular tracks and explore whether different platforms are associated with different musical trends.",
        },
    ],
  },

  gap: {
    heading: "What existing tools miss",
    cards: [
      {
        title: "Platform dashboards",
        body: "Spotify for Artists and YouTube Studio go deep, but stay in their own lanes. You cannot directly compare how a track performs across both platforms.",
      },
      {
        title: "Aggregators",
        body: "Chartmetric and Soundcharts bring platform data together, but focus on tracking streams, views and playlists over time — not exploring the audio features behind a song.",
      },
      {
        title: "Community dashboards",
        body: "Tableau Public projects explore how audio features relate to popularity, but most rely on Spotify data alone, leaving YouTube out of the picture.",
      },
    ],
    line: "No existing tool brings it all together: an interactive, side-by-side comparison of how a song's audio features relate to popularity on Spotify and YouTube.",
  },

  question: {
    heading: "Our question",
    text: "How are audio features associated with track popularity across Spotify and YouTube?",
    objectives: [
      "**Distinguish cross-platform hits:** Identify how songs popular on both platforms differ from those popular on only one.",
      "**Compare audio characteristics:** Explore how audio features vary across different popularity groups.",
      "**Identify platform-specific patterns:** Determine which audio features are associated with popularity on Spotify and YouTube respectively.",
    ],
  },
};
