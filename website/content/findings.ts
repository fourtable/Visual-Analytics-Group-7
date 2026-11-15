import type { Stat, StoryLink } from "./types";

export type Finding = {
  stat: Stat;
  text: string;
  /** When the evidence depends on a dashboard setting, say so in words. */
  setting?: string;
  link: StoryLink;
};

const evidence = "See the evidence →";

/**
 * Section 4, Key Findings. Report section 10.8 Overall Findings.
 * The report lists four findings; this page splits the second (top-three features)
 * into a both-platforms/Spotify card and a YouTube card, so the intro says five.
 */
export const findings = {
  heading: "Key findings",
  intro: "Five findings from 17,380 songs.",
  settingPrefix: "In the dashboard:",
  cards: [
    {
      stat: {
        value: { adjusted: "20%", raw: "19%" },
        label: "of songs are hits on only one platform",
        measure: "Age-adjusted",
      },
      text: "About one song in five are hits on only one platform. Another 15% are hits on both, while 65% are hits on neither.",
      link: { label: evidence, dashboard: "dash-defining-a-hit" },
    },
    {
      stat: {
        value: "Louder",
        label: "Hits on both platforms",
        measure: "Age-adjusted",
        rawNote: "With raw counts: duration replaces acousticness in the combined top three.",
      },
      text: "Hits on both platforms tend to be louder, less acoustic and less instrumental. Spotify's top three features are the same.",
      link: { label: evidence, dashboard: "dash-top3-both" },
    },
    {
      stat: { value: "Longer", label: "On YouTube", measure: "Age-adjusted" },
      text: "On YouTube, duration joins loudness and instrumentalness as YouTube's top three features associated with popularity.",
      link: { label: evidence, dashboard: "dash-top3-platform" },
    },
    {
      stat: { value: "Steeper on YouTube", label: "Loudness and energy", measure: "Age-adjusted" },
      text: "Loudness and energy have stronger positive associations with popularity on YouTube than on Spotify.",
      setting: "select **Loudness** to explore the comparison.",
      link: { label: evidence, dashboard: "dash-hit-sound" },
    },
    {
      stat: { value: "Shrinks", label: "Within each artist", measure: "Age-adjusted" },
      text: "Audio-feature differences become smaller when songs are compared against the same artist's other tracks. This suggests artist-level differences may matter more than individual song characteristics.",
      link: { label: evidence, dashboard: "dash-sound-or-artist" },
    },
  ] satisfies Finding[],
  conclusion:
    "Across both platforms: LOUDNESS, INSTRUMENTALNESS and ACOUSTICNESS show the strongest associations with popularity.",
};
