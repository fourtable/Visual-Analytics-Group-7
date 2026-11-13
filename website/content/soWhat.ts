/** Section 7, So what? Report: Conclusion and Future Work (11.1 to 11.3). */
export const soWhat = {
  heading: "So what?",
  conclusion:
    "Which audio features go with popularity barely depends on the platform. On both Spotify and YouTube, louder, less instrumental and less acoustic songs tend to be more popular; on YouTube, longer songs do too. But once songs are compared with their own artist's catalogue, these differences shrink. The artist matters as much as the sound.",

  implications: {
    heading: "What it means",
    cards: [
      {
        title: "For labels and marketers",
        body: "One sonic strategy can work across both platforms, with one nuance: song length matters more on YouTube. Treat these as patterns to weigh alongside artist-level factors, not as a formula for a hit.",
      },
      {
        title: "For listeners",
        body: "It shows what popular songs on your favourite apps tend to have in common, without claiming that sounding this way makes a hit.",
      },
    ],
  },

  futureWork: {
    heading: "Future work",
    items: [
      "Add more representative data and platforms such as TikTok and Apple Music.",
      "Use YouTube upload dates to match each platform's actual exposure period.",
      "Use recording codes (ISRCs) to handle duplicates, re-releases and alternative versions.",
      "Bring in context such as marketing budgets and social media virality.",
      "Test several factors together with predictive models alongside the dashboards.",
    ],
  },
};
