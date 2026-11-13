import embeds from "./embeds.json";
import type { Caption, DashboardId } from "./types";

/**
 * The six dashboards and one worksheet, embedded from Tableau Public.
 * Embed addresses and sizes are in embeds.json (shared with scripts/capture-dashboards.mjs).
 * Captions follow the Build Plan › Section specs: Explore; tips follow › "Try this" tips.
 */
export type Dashboard = {
  /** Anchor, e.g. 'dash-defining-a-hit' */
  id: DashboardId;
  chapter: 1 | 2 | 3 | 4 | 5;
  /** h3 above the dashboard (report wording) */
  heading: string;
  /** Name in the embed bar */
  name: string;
  /** Embed URL (used only for embedding; the site never links to Tableau Public) */
  src: string;
  width: number;
  height: number;
  /** Screenshot shown before the live dashboard loads, on small screens and without JavaScript */
  fallback: { src: string; src2x: string };
  fallbackAlt: string;
  caption: Caption;
};

type EmbedMeta = { id: DashboardId; slug: string; src: string; width: number; height: number };

function embed(id: DashboardId) {
  const meta = (embeds as EmbedMeta[]).find((e) => e.id === id);
  if (!meta) throw new Error(`Missing ${id} in content/embeds.json`);
  return {
    id,
    src: meta.src,
    width: meta.width,
    height: meta.height,
    fallback: {
      src: `/dashboards/${meta.slug}.webp`,
      src2x: `/dashboards/${meta.slug}@2x.webp`,
    },
  };
}

export const dashboards: Dashboard[] = [
  {
    ...embed("dash-defining-a-hit"),
    chapter: 1,
    heading: "Defining a Hit",
    name: "Defining a Hit",
    fallbackAlt:
      "Left: a scatter plot of every song by Spotify streams (across) and YouTube views (up), both on log scales, coloured by quadrant, with dotted lines at each platform's top-25% cut-off. Right: a bar chart of how many songs fall into each of the four quadrants.",
    caption: {
      shows:
        "Left: every song plotted by Spotify streams and YouTube views on log scales, with dotted lines at each platform's top-25% cut-off and colours for the four quadrants. Right: how many songs fall into each quadrant. Use Popularity Measure to switch between raw counts and figures adjusted for song age.",
      insight:
        "Of the 16,925 songs with a release date, 15% are hits on both platforms, 10% only on Spotify, 9% only on YouTube and 65% on neither (age-adjusted). With raw counts: 16%, 10%, 9% and 65% of 17,380 songs.",
      why: "About one song in five is a hit on just one platform, so popularity doesn't carry over automatically. Everything that follows builds on these four groups.",
      tip: "Switch Popularity Measure to Raw counts to compare total streams and views with the age-adjusted view.",
    },
  },
  {
    ...embed("dash-disagree"),
    chapter: 1,
    heading: "Where the Platforms Disagree",
    name: "Where the Platforms Disagree",
    fallbackAlt:
      "A scatter plot of songs by Spotify streams and YouTube views on log scales, coloured by quadrant, beside a song card that lists one song's title, artist, release date, quadrant, streams, views and audio features.",
    caption: {
      shows:
        "The same scatter plot, with a song card. Click any song to see its title, artist, release date, quadrant, streams, views and audio features.",
      insight:
        "The platforms overlap a lot, but the off-diagonal corners hold real songs that only one audience embraced. For example, PSY's Gentleman has over 1.5 billion YouTube views but under 100 million Spotify streams.",
      why: "It moves the reader from patterns to individual songs, and raises the next question: does the sound explain the split?",
      tip: "Click any dot in the bottom-right corner to open the song card of a Spotify-only hit.",
    },
  },
  {
    ...embed("dash-hit-sound"),
    chapter: 2,
    heading: "What do viral hits sound like?",
    name: "What do viral hits sound like",
    fallbackAlt:
      "Left: each quadrant's average on every audio feature as a z-score, where zero is the average song. Right: lines showing the median of the selected feature in each popularity tier from Q1 to Q4, one line per platform.",
    caption: {
      shows:
        "Left: each quadrant's average on every audio feature, as a z-score against the average song (0). Right: the median of one chosen feature in each popularity tier, Q1 (bottom 25%) to Q4 (top 25%), with one line per platform. Use Select Feature to switch features. The right chart's axis doesn't start at zero, so small differences are visible.",
      insight:
        "Hits on both platforms and YouTube-only hits share greater loudness and lower instrumentalness. Loudness and energy change more across popularity tiers on YouTube than on Spotify.",
      why: "The platforms differ in how strongly features go with popularity, not in fundamentally different sounds.",
      tip: "Set Select Feature to Loudness, then Energy, and compare how steeply each line climbs.",
    },
  },
  {
    ...embed("dash-top3-platform"),
    chapter: 3,
    heading: "Top 3 Audio Features Per Platform",
    name: "Top 3 Audio Features Per Platform",
    fallbackAlt:
      "Two dumbbell charts, one for Spotify and one for YouTube, showing each audio feature's Spearman correlation with popularity. Filled dots are age-adjusted, hollow dots use raw counts, the top three rows are coloured and a grey band marks links too small to matter.",
    caption: {
      shows:
        "One dumbbell chart per platform, showing how closely each audio feature tracks popularity (Spearman ρ). Filled dots are adjusted for song age; hollow dots use raw counts. Coloured rows are the top 3, and the grey band marks links too small to matter. Use Tier to Show to compare one popularity tier with the average song instead.",
      insight:
        "Spotify's top three are loudness, instrumentalness and acousticness. YouTube's are loudness, instrumentalness and duration. Louder songs tend to be more popular on both; more instrumental ones, less.",
      why: "These are associations, not recipes. Making a song louder wouldn't by itself make it more popular.",
      tip: "Set Tier to Show to Q4 (Top) to see how the top 25% differ from the average song.",
    },
  },
  {
    ...embed("dash-top3-both"),
    chapter: 3,
    heading: "Top 3 Audio Features of Both Platforms",
    name: "Top 3 Audio Features of Both Platforms",
    fallbackAlt:
      "Left: a dumbbell chart of each audio feature's correlation with popularity across both platforms combined. Right: a heatmap of how each quadrant's songs differ from the average song on every audio feature, with stronger colour for bigger differences.",
    caption: {
      shows:
        "Left: each feature's link to popularity across both platforms combined. Right: a heatmap of how each quadrant's songs differ from the average song on every feature; stronger colour means a bigger difference.",
      insight:
        "Across both platforms, the top three are loudness, acousticness and instrumentalness. The heatmap shows how hits on both differ from one-platform hits and from songs that are hits on neither.",
      why: "Features that matter on both platforms are common ground for a cross-platform release. A strong combined link may still be weaker on one platform, so check both charts.",
      tip: "Set Tier to Show to Q4 (Top), then compare the Hit on both and Neither rows of the heatmap.",
    },
  },
  {
    ...embed("dash-sound-or-artist"),
    chapter: 4,
    heading: "Sound or artist",
    name: "Sound or artist",
    fallbackAlt:
      "Two bar charts of the three hit groups' audio-feature differences. Top: against the average song. Bottom: against the same artist's other songs. A grey band from −0.15 to +0.15 SD marks small differences.",
    caption: {
      shows:
        "Top: how the three hit groups' audio features differ from the average song. Bottom: how they differ from the same artist's other songs. The grey band from −0.15 to +0.15 SD marks small differences.",
      insight:
        "The top chart repeats Chapter 2's pattern. In the bottom chart, every difference shrinks once songs are compared with their own artist's catalogue.",
      why: 'The "hit sound" may reflect which artists make hits more than what makes one of an artist\'s songs beat another. This qualifies every chapter before it.',
      tip: "Compare each bar in the top chart with the same bar in the bottom chart: a shorter bottom bar means the artist explains more of the gap.",
    },
  },
  {
    ...embed("dash-flags"),
    chapter: 5,
    heading: "Flags by Quadrant",
    name: "Flags by Quadrant",
    fallbackAlt:
      "Bar charts of the share of songs in each quadrant flagged as instrumental, live or spoken word.",
    caption: {
      shows: "The share of songs in each quadrant flagged as instrumental, live or spoken word.",
      why: "Track types beyond the audio features may help explain cross-platform patterns. These are still associations, not causes.",
      tip: "Hover any bar to see the exact share.",
    },
  },
];

export function getDashboard(id: DashboardId): Dashboard {
  const found = dashboards.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown dashboard ${id}`);
  return found;
}
