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
      text: "About one song in five is a hit on only one platform. 15% are hits on both, and 65% on neither.",
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
      text: "On YouTube, song length joins the list: its top three are loudness, instrumentalness and duration.",
      link: { label: evidence, dashboard: "dash-top3-platform" },
    },
    {
      stat: { value: "Steeper on YouTube", label: "Loudness and energy", measure: "Age-adjusted" },
      text: "Loudness and energy rise more steeply from less to more popular songs on YouTube than on Spotify.",
      setting: "set Select Feature to Loudness.",
      link: { label: evidence, dashboard: "dash-hit-sound" },
    },
    {
      stat: { value: "Shrinks", label: "Within each artist", measure: "Age-adjusted" },
      text: "Compared with the same artist's other songs, every audio-feature difference shrinks. The artist may matter more than the sound of any one song.",
      link: { label: evidence, dashboard: "dash-sound-or-artist" },
    },
  ] satisfies Finding[],
  conclusion:
    "What goes with popularity barely depends on the platform: loudness, instrumentalness and acousticness matter most on both.",
};
