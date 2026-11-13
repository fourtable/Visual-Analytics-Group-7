import type { AccordionEntry } from "./types";

export type FunnelStep = {
  label: string;
  /** Track count; bar lengths are relative to the first step */
  count: number;
  /** Count as shown on the page */
  display: string;
  note: string;
};

export type Challenge = {
  title: string;
  /** Optional: the challenge in one sentence (some items go straight to how it was handled) */
  challenge?: string;
  handled: string;
  remains: string;
};

/**
 * Section 8, Methods & Limits. Report sections 4 Assumptions, 6 Datasets, 7 Tools,
 * 9 Methodology and Major Challenges and Limitations, condensed.
 */
export const methods = {
  heading: "Methods & limits",

  funnel: {
    heading: "From dataset to analysis",
    steps: [
      {
        label: "Kaggle dataset",
        count: 20700,
        display: "about 20,700",
        note: "Spotify and YouTube data, collected 7 February 2023",
      },
      {
        label: "After cleaning",
        count: 18847,
        display: "18,847",
        note: "After cleaning and preprocessing",
      },
      {
        label: "Analysed",
        count: 17380,
        display: "17,380",
        note: "Songs with both streams and views, each with its own YouTube video",
      },
      {
        label: "With a release date",
        count: 16925,
        display: "16,925",
        note: "Shown in age-adjusted views",
      },
    ] satisfies FunnelStep[],
    tracksLabel: "tracks",
    note: "Release dates came from Deezer, Wikidata and MusicBrainz: 18,256 of 18,847 tracks (96.9%), with 82% confirmed by two independent sources.",
  },

  how: {
    heading: "How we did it",
    items: [
      {
        title: "Popularity",
        body: "Streams and views are kept separate, shown on log scales, and split into four equal tiers per platform. The top 25% on a platform are its hits.",
      },
      {
        title: "Comparing features",
        body: "Each group's average is turned into a z-score against the whole dataset, so features on different scales can be compared. Gaps under ±0.15 SD count as small.",
      },
      {
        title: "Feature links",
        body: "Spearman ρ between each feature and popularity, with raw and age-adjusted versions, ranked to find the top three per platform and combined.",
      },
      {
        title: "Medians across tiers",
        body: "The median of each feature in each popularity tier, per platform. The axis is zoomed and labelled as such.",
      },
      {
        title: "Within-artist comparison",
        body: "Each song against its artist's average, scaled by the overall SD. It's descriptive, not a full model of artist effects.",
      },
      {
        title: "Assumptions",
        body: "The age adjustment reduces song-age differences; factors beyond audio and time, such as artist popularity, marketing and trends, aren't modelled.",
      },
      {
        title: "Tools",
        body: "Python (pandas, NumPy, Matplotlib, SciPy); Deezer, Wikidata and MusicBrainz for release dates; Tableau Desktop and Tableau Public; HTML, CSS and JavaScript; GitHub and Vercel.",
      },
    ] satisfies AccordionEntry[],
  },

  challenges: {
    heading: "Challenges we addressed",
    handledLabel: "How we handled it:",
    remainsLabel: "What remains:",
    items: [
      {
        title: "No release dates",
        challenge:
          "The Kaggle data has no release dates, so older songs look more popular simply for having been out longer.",
        handled:
          "We matched release dates from Deezer, Wikidata and MusicBrainz for 18,256 of 18,847 tracks (96.9%), 82% of them confirmed by two independent sources, and built the age-adjusted measure that the site shows by default.",
        remains:
          "455 analysed songs without a date are left out of age-adjusted views, and a song's release date isn't its YouTube upload date.",
      },
      {
        title: "Different popularity measures",
        challenge: "Streams and views measure different kinds of engagement.",
        handled:
          "Each platform is ranked separately, with hits defined as its own top 25%, rather than merging the two into one score.",
        remains:
          "A hit is relative to this dataset, and songs either side of the cut-off can be nearly identical.",
      },
      {
        title: "Duplicate tracks and shared videos",
        handled:
          "Songs missing streams or views, and songs sharing a YouTube video with another track, were excluded, leaving 17,380.",
        remains:
          "Without a verified recording code (ISRC) for every track, some album and single versions, remixes or remasters may still overlap.",
      },
      {
        title: "Artist effects",
        handled: "The within-artist comparison (Chapter 4).",
        remains: "It's descriptive, not a full model of artist popularity, marketing or genre.",
      },
    ] satisfies Challenge[],
  },

  limits: {
    heading: "Limits",
    items: [
      {
        title: "Representativeness",
        body: "The data holds roughly each artist's top 10 tracks, so it leans towards already-popular artists, and songs by one artist aren't independent.",
      },
      {
        title: "Association, not cause",
        body: "Correlations and group averages show patterns, not effects. The ±0.15 SD and ρ ±0.1 bands are reading guides, not significance tests.",
      },
      {
        title: "Factors not in the data",
        body: "Marketing, social media trends and playlist placement aren't captured.",
      },
    ] satisfies AccordionEntry[],
  },
};
