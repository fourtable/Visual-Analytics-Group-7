import type { Link, MaybeLink } from "./types";

/** Footer: team, course, project links, references and disclaimer. No link to Tableau Public. */
export const footer = {
  team: "[Team member full names] · Group G2T7",
  course:
    "IS428 Visual Analytics for Business Intelligence · Singapore Management University · AY2026/27",
  linksHeading: "Project",
  /** href: null shows the label as a placeholder until the team adds the address. */
  links: [
    { label: "[Full report]", href: null },
    {
      label: "Kaggle dataset",
      href: "https://www.kaggle.com/datasets/salvatorerastelli/spotify-and-youtube",
    },
    { label: "[GitHub repository]", href: null },
    { label: "[User guide]", href: null },
  ] satisfies MaybeLink[],
  referencesHeading: "References",
  references: [
    {
      label: "IFPI Global Music Report 2026",
      href: "https://www.ifpi.org/global-music-report-2026-global-recorded-music-revenues-grow-6-4-as-record-companies-drive-innovation/",
    },
    {
      label: "IFPI Engaging with Music 2023",
      href: "https://www.ifpi.se/statistik/engaging-with-music-report/",
    },
    {
      label: "Kaggle: Spotify and YouTube dataset",
      href: "https://www.kaggle.com/datasets/salvatorerastelli/spotify-and-youtube",
    },
    { label: "Deezer API", href: "https://developers.deezer.com/api" },
    { label: "Wikidata", href: "https://www.wikidata.org/" },
    { label: "MusicBrainz", href: "https://musicbrainz.org/" },
  ] satisfies Link[],
  disclaimer: "A student project. Not affiliated with Spotify or YouTube.",
};
