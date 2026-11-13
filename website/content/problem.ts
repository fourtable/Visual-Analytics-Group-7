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
    text: "Music now lives on audio and video platforms alike. Listeners spend about a third of their music time on audio streaming and almost as much on video, but each platform counts popularity its own way: Spotify counts streams, YouTube counts views.",
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
        body: "Signing and promoting an artist is a costly bet. Knowing which audio features go with popularity on each platform adds evidence when A&R teams evaluate tracks and plan marketing.",
      },
      {
        title: "For listeners",
        body: "Ever noticed that popular songs seem to sound alike? This shows which features they actually share.",
      },
    ],
  },

  gap: {
    heading: "What existing tools miss",
    cards: [
      {
        title: "Platform dashboards",
        body: "Spotify for Artists and YouTube Studio go deep, but each sees only its own platform.",
      },
      {
        title: "Aggregators",
        body: "Chartmetric and Soundcharts combine platforms, but track counts over time, not how songs sound.",
      },
      {
        title: "Community dashboards",
        body: "Projects on Tableau Public explore audio features, but almost all use Spotify data alone.",
      },
    ],
    line: "Nobody lets you compare, side by side and interactively, how a song's sound goes with popularity on an audio platform and a video platform.",
  },

  question: {
    heading: "Our question",
    text: "How are audio features associated with track popularity across Spotify and YouTube?",
    objectives: [
      "Find how songs popular on both platforms differ from those popular on only one.",
      "Compare audio features across popularity groups.",
      "Identify the audio features associated with popularity on each platform.",
    ],
  },
};
