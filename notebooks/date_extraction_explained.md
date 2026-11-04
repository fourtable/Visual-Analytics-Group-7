# Song Release Dates: How They Were Extracted, Checked and Used

The v2 dataset had no release dates, so an old song and a new song were compared as if both had had the same time to collect streams and views. This document explains how we added each song's **first release date**, how we checked that the dates are right, which confounding factors the dates let us remove, how the dashboards will use them, and what the v3 EDA notebook found.

| | |
|---|---|
| Output file | `dataset/spotify_youtube_release_date.csv`: the v2 clean table (all 53 columns unchanged) plus 13 date and age columns and 14 rank columns for Tableau |
| Scripts | `scripts/add_release_dates.py` (builds the CSV), `scripts/musicbrainz_dump.py` (reads the MusicBrainz database dump) |
| Notebook | `notebooks/01_eda_spotify_youtube_v3.ipynb` |
| Coverage | 18,256 of 18,847 tracks (96.9%) have a date |
| Accuracy | On 45 random tracks checked by hand, 91% have the right year and 98% are within a year (Deezer dates alone: 74% and 83%) |
| Confidence | 82% of dates are confirmed by two independent sources |

**Contents**
1. [Why we needed release dates](#1-why-we-needed-release-dates)
2. [How the dates are extracted](#2-how-the-dates-are-extracted)
3. [Sources](#3-sources)
4. [How one date is chosen for each song](#4-how-one-date-is-chosen-for-each-song)
5. [How we checked accuracy](#5-how-we-checked-accuracy)
6. [Confounding factors addressed](#6-confounding-factors-addressed)
7. [Columns added to the CSV](#7-columns-added-to-the-csv)
8. [How the dates will be used in the visualizations](#8-how-the-dates-will-be-used-in-the-visualizations)
9. [Findings of the v3 EDA notebook](#9-findings-of-the-v3-eda-notebook)
10. [Limitations and next steps](#10-limitations-and-next-steps)

---

## 1. Why we needed release dates

The feedback on our proposal: *streams, views, likes and comments accumulate over the years, so an older song has simply had more time to collect them.*

Song age is a **confounder** if it is linked to both sides of our research question:

- **to popularity**, because counts grow with time, and
- **to the audio features**, because music has changed over the decades (songs have become shorter, louder and more rap-influenced).

If both links hold, a pooled correlation between a feature and popularity mixes two things: what the feature does, and how old songs with that feature tend to be. The v3 notebook confirms that both links hold (section 9), so we need each song's age to separate them.

The dataset was collected on **7 February 2023** (Kaggle), so a song's age is the time from its release to that day.

---

## 2. How the dates are extracted

`scripts/add_release_dates.py` runs these steps. Every lookup is cached in `scripts/release_date_cache/`, so the script can be stopped and resumed, and once everything is cached a re-run only rebuilds the CSV (about a minute).

| Step | What happens | Scale |
|---|---|---|
| 1. Read the v2 table | `dataset/spotify_youtube_clean_v2.csv` | 18,847 tracks |
| 2. Deezer | Search each song by title and artist. A result only counts if the artist matches and it is the same version (a live or karaoke version doesn't match the studio track). The earliest edition date among the matches is kept. | All 18,847 songs, about 1–2 hours, no key needed |
| 3. Wikidata | One SPARQL query per batch of artists: every song, single and album with that performer and a publication date (with its precision: day, month or year). | 2,072 artists, a few minutes, no key needed |
| 4. MusicBrainz | `scripts/musicbrainz_dump.py` streams the full MusicBrainz database dump once and keeps only the dataset's artists, songs and albums. | 7.6 GB download, about 15 minutes. It keeps 9,827 artists, 42,850 release groups and 558,994 recordings |
| 5. Combine | For each song, collect every candidate date and choose one with the rules in section 4. Record its precision, source and confidence. | |
| 6. Age columns | Compute years since release, age band, age-relative popularity scores and age-adjusted tiers (section 7). | |
| 7. Rank columns | Add the percentile rank of 10 audio features and 4 popularity measures, so Tableau can compute Spearman's ρ (section 7). | |

Two optional steps are built in but were not used:

- **YouTube upload dates** need a YouTube Data API key.
- **Spotify album dates** need a Spotify developer app, which now requires Premium and has an unpublished quota.

**To rebuild the CSV** (from the repo root):

```
python scripts/musicbrainz_dump.py          # once, after downloading mbdump.tar.bz2 into dataset/
python scripts/add_release_dates.py         # fetches what isn't cached, then writes the CSV
```

The MusicBrainz dump comes from `https://data.metabrainz.org/pub/musicbrainz/data/fullexport/` (`<latest>/mbdump.tar.bz2`). The dump and the caches are in `.gitignore`.

---

## 3. Sources

### Sources used

A streaming service dates the **edition** it carries, and for older songs that is usually a remaster or a compilation. Billy Joel's *Movin' Out* (1977) is on Deezer only as the 2009 *Legacy Edition* and a 2001 best-of. Taking the earliest Deezer edition can't fix this, because the original edition isn't there. So we added four **first-release** sources, which record the original date across all editions.

| Source (`release_date_source`) | What its date means | How a song is matched | Final dates from it |
|---|---|---|---|
| `wikidata_song` | The publication date of the song's or single's own Wikidata entry | Performer name and song title. A remix or live track only matches an entry for the same kind of version | 2,719 |
| `musicbrainz_album` | The first release of the album across **all** its editions (a MusicBrainz "release group") | Artist and album title (edition words such as "Deluxe" or "Remastered" removed). Groups typed as Compilation, Live, Remix or DJ-mix are excluded | 7,102 |
| `wikidata_album` | The publication date of the album's Wikidata entry | Performer name and album title | 1,503 |
| `musicbrainz_song` | The earliest official or promotional release that contains the recording | Artist and song title. Bootlegs, pseudo-releases and withdrawn or cancelled releases are excluded. A remix or live track only matches the same **named** version (a "Fallen Superhero Remix" doesn't match another remix) | 4,023 |
| `deezer` | The release date of the edition Deezer carries (the earliest one that matches) | Title, artist and version, as in step 2 | 2,909 |

Album dates are only used when the album's first release is also the song's. They are skipped for:

- compilations (Spotify's `album_type`, or names such as "Greatest Hits", "Best of", "Anthology");
- re-recordings ("Taylor's Version");
- remix or live tracks added to a studio album.

### Sources considered but not used

| Source | Why not |
|---|---|
| MusicBrainz web API | Limited to 1 request per second, and it throttles anonymous clients. Looking up every song would take many hours. The database dump has the same data and covers every song in 15 minutes |
| Spotify Web API | Gives only the date of the album the track is on (the same edition problem as Deezer), and new developer apps now need Premium and have an unpublished quota |
| YouTube Data API | Would give video upload dates (useful, see section 10) but needs an API key |
| Scraping Google or Wikipedia | Wikidata is Wikipedia's structured database and holds most of the release dates shown in its infoboxes. Scraping pages is fragile, slow and against Google's terms of service |

---

## 4. How one date is chosen for each song

Each song can have up to five candidate dates. The script picks one with these rules:

1. **The earliest date that a second source confirms wins.** Two dates confirm each other when they come from different sources, are within **6 months** of each other, and at least one of them is a first-release source. Requiring confirmation means one wrong match can't decide the date: MusicBrainz lists a 1978 demo of *Billie Jean*, but nothing confirms it, so the confirmed 1982 date wins.
2. **If nothing is confirmed, the most trusted source wins**, in this order:
   1. `wikidata_song`;
   2. `musicbrainz_album`;
   3. `wikidata_album`;
   4. `musicbrainz_song`;
   5. Deezer's edition date, as a last resort.
3. **An edition date is an upper limit.** Deezer's edition is a real release of the song, so the song was out by then. A first-release date more than a year later means that source is missing the early releases, and it is dropped. (This isn't applied to remix or live tracks, because Deezer may have matched a different remix.)
4. **1 January counts as year-only**, from every source. It almost always stands for "year unknown".
5. **Imprecise dates go in the middle of their period.** Year-only dates are placed on 1 July and month-only dates on the 15th, so they are at most half a period off.
6. **Impossible dates are dropped:**
   - Dates before 1920 are dropped, because Deezer uses 1900-01-01 and similar dates for "unknown".
   - Full dates after the collection day are dropped.
   - A year-only "2023" can only mean 1 January to 7 February 2023, so it is placed on the collection day.

The result is recorded in `release_date_confidence`:

| Confidence | Meaning | Tracks |
|---|---|---|
| `confirmed` | A second source agrees within 6 months | 14,980 (82%) |
| `single source` | Only one first-release source has a date | 1,670 (9%) |
| `edition date only` | Only Deezer has a date: the song may be older than this | 1,606 (9%) |

---

## 5. How we checked accuracy

### 5.1 Hand check of 50 random tracks

Fifty tracks were drawn at random from all 18,847 (`random_state=2026`). Each was compared with its documented first release: the first release of **that exact recording or version**, so a remix counts from the remix's release. Four couldn't be verified (a classical recording, a lo-fi cover, and two recent live and sped-up versions) and were left out. The full table, with the source used for each track, is in section 2.4 of the notebook.

| | Deezer dates (first version of the file) | Final dates |
|---|---|---|
| Tracks with a date | 42 of 46 | 45 of 46 |
| Right year | 74% | **91%** |
| Within one year | 83% | **98%** |
| Wrong year | 26% (11 tracks) | **9% (4 tracks)** |
| More than a year off | 17% | **2%** |

- **What got fixed** is mostly older catalogue songs that Deezer only carries as reissues:
  - *Three Times a Lady*: 1992 → 1978;
  - *I'm Eighteen*: 2007 → 1970;
  - *(Sittin' On) the Dock of the Bay*: 1992 → 1968.
- **What remains:**
  - three tracks are one year off, for example *Gravy Train*, which has its album date instead of the earlier single's;
  - one is far off: a 1988 Blondie remix gets 1981 from another recording also labelled a remix.
- **Margin of error:** with 45 tracks, the true wrong-year rate is probably between about 4% and 21%. The rules were also chosen partly on these tracks (section 5.2), so 9% is slightly optimistic. A fresh random sample would give an independent figure.

### 5.2 How the rules were chosen

Each candidate rule was scored on three test sets:

- the random hand check;
- 85 well-known songs with documented release dates;
- 29 songs flagged in our data audit.

The 6-month confirmation window scored best on all three.

| Rule | Hand check, right year | Famous songs, right year | Audit examples, right year |
|---|---|---|---|
| **Earliest date confirmed within 6 months (used)** | **91%** | **93%** | **100%** |
| Earliest date confirmed within 1 year | 89% | 88% | 97% |
| Earliest date confirmed within 2 years | 89% | 88% | 93% |
| Most trusted source, no confirmation | 87% | 92% | 86% |

One more rule was tested and **rejected**: "never let a first-release date beat an earlier Deezer date". It fixed two dates that are too recent, but made about 90 others worse, because Deezer sometimes lists a date months too early (*Hey Ya!* as December 2002 instead of 2003).

### 5.3 Consistency checks on the whole file

- **Compared with Deezer alone**, 4,760 of the 17,102 tracks that have both dates (28%) get a different year. Almost all of them (4,639) move **earlier**, by a median of 10 years, as expected when reissue dates are replaced by original dates. 1,154 tracks that Deezer couldn't date now have a date.

  | Decade | Songs by Deezer date | Songs by final date |
  |---|---|---|
  | 1950s or earlier | 5 | 99 |
  | 1960s | 56 | 380 |
  | 1970s | 251 | 828 |
  | 1980s | 554 | 1,131 |
  | 1990s | 1,437 | 1,798 |
  | 2000s | 3,289 | 2,755 |
  | 2010s | 6,194 | 5,152 |
  | 2020s | 5,316 | 4,959 |

- **Old songs are confirmed as often as new ones**: 83% of pre-1980 songs, against 82% of 2015–2023 songs. Edition-only dates are concentrated in recent years (13% of 2015–2023 songs). Those are songs that MusicBrainz and Wikidata don't list yet, and for a recent song the edition date is usually the real release.
- **Songs on the same album:**
  - 10,878 of 12,349 artist–album pairs have a single date.
  - Of the 1,471 that don't, 882 differ by under 6 months, usually a single released ahead of its album.
  - 164 differ by more than 3 years, mostly best-ofs where the songs really do come from different years.
- **Precision:** 12,165 dates are exact days, 370 months and 5,721 years only. No 1 January placeholders remain labelled as exact days.
- **Dates too recent for the plays a track already has:**
  - 24 tracks average more than 3M streams a day since their listed date.
  - Most are genuine launch hits (*Flowers*, *Kill Bill*, *As It Was*).
  - Old songs that the first version dated by a recent reissue are gone: PSY's *Gentleman* is now 2013, *Knockin' On Heaven's Door* 1991.

### 5.4 How the data audit was addressed

| Audit finding | Now |
|---|---|
| About 1 in 4 dated tracks had the wrong year, mostly older songs dated by a reissue or compilation | 9% wrong year on the random hand check, and 98% within a year. Original dates come from first-release sources |
| The `date_may_be_reissue` flag missed most errors | Replaced by `release_date_confidence`, which says how the date was established |
| 754 dates on 1 January labelled as exact days | 1 January counts as year-only from every source; none remain labelled as days |
| 1,060 artist–album pairs had differing dates | Differences are now explained: a single before its album, or a best-of. Only 164 pairs differ by more than 3 years |
| `youtube_published_at` / `years_on_youtube` were 100% empty | Removed. They are only written when upload dates are fetched |
| 1,745 tracks (9.3%) had no date | 591 tracks (3.1%) |

### 5.5 Known remaining errors

- NCT DREAM's *Glitch Mode* (2022) and Los Caligaris' *Con Vos* are dated on the collection day. MusicBrainz lists only "2023" for them, and it outranks Deezer's 2022 date.
- back number's *水平線* came out in 2020 but is dated 2023.
- Kid Cudi's *love.* gets 2022, the date of a compilation that Wikidata doesn't mark as one.
- A song released as a single before its album can carry the album date.

The notebook lists the too-recent cases (section 2.4). Treat individual dates as "very likely right", not certain. Don't label single songs in a chart by date without checking them.

---

## 6. Confounding factors addressed

| Factor | Why it biases a popularity comparison | How it is handled | Evidence (notebook section) |
|---|---|---|---|
| **Time since release** | Counts grow with time, so older songs look more popular | `stream_vs_age`, `views_vs_age`, `likes_vs_age`, `comments_vs_age`: each song is compared only with songs in the same age band. `spotify_tier_age_adj` and `youtube_tier_age_adj`: popularity tiers within the age band | Median streams differ 25× between age bands. Age-relative scores remove this (ρ with age −0.00) (3.1, 4.1) |
| **Platform launch dates** | No song could collect plays before Spotify (Oct 2008) or YouTube (Dec 2005), so a 1975 song hasn't had 48 years of streams | Tested a per-year rate whose exposure starts at the platform launch. It over-corrects, so the age-relative score is used instead | Per-year rates make new songs look 2.8–4× typical and old ones 0.2–0.3× (4.1) |
| **Era of the music** | Age is also linked to the audio features: newer songs are shorter, louder, more speech-heavy and more danceable | Feature correlations are recomputed on the age-relative score, which compares songs of the same age | Duration ρ −0.32 with release year, Loudness +0.29, Speechiness +0.29, Danceability +0.22 (3.4, 5.3) |
| **The artist's catalogue** | Within an artist's top 10, older songs have had longer to grow, which confounds the "same artist" comparison | Within-artist correlations with each song's age rank regressed out (a partial correlation) | Within-artist ρ of age with streams is +0.31, larger than any audio feature's (3.3, 5.4) |
| **Engagement decay** | New videos collect more likes and comments per view, so like rate depends on age | Compare like and comment rates within age bands only | Like rate falls from 2.1 to about 0.6–0.7 per 100 views (3.5) |
| **Wrong (reissue) dates** | A remaster date makes an old song look new, which would bias every age adjustment | First-release sources, cross-source confirmation, and a `confirmed`-only robustness check | All key results hold on confirmed dates only (2.4, 5.3, 5.4) |
| **Missing dates** | If undated songs differed systematically, the age analysis would be biased | 96.9% coverage. The 591 undated tracks keep their rows, with empty age columns | Undated tracks are mostly the least popular (classical, sleep sounds), so the analysis leans very slightly toward popular tracks (2.2) |

**Not addressed:**
- **The YouTube video's own upload date.** Views are aged from the song's release, which can be earlier than its video.
- **The sampling.** The dataset holds about the top 10 tracks per artist.
- **Causation.** Controlling for age makes comparisons fairer, but they are still correlations.

---

## 7. Columns added to the CSV

| Column | Meaning |
|---|---|
| `release_date` | The song's first release (`YYYY-MM-DD`; empty for the 591 undated tracks) |
| `release_date_precision` | `day`, `month` or `year`. Year-only dates are placed on 1 July, month-only dates on the 15th |
| `release_date_source` | `wikidata_song`, `musicbrainz_album`, `wikidata_album`, `musicbrainz_song` or `deezer` |
| `release_date_confidence` | `confirmed`, `single source` or `edition date only` (section 4) |
| `release_year` | Year of `release_date` |
| `years_since_release` | Years from release to 7 Feb 2023 |
| `age_band` | `<3 mo`, `3–6 mo`, `6–12 mo`, `1–2 y`, `2–3 y`, `3–5 y`, `5–8 y`, `8–12 y`, `12–20 y`, `20+ y` |
| `stream_vs_age`, `views_vs_age`, `likes_vs_age`, `comments_vs_age` | log10 count minus the median of songs in the same age band. 0 = typical for its age; +1 = 10× a typical song of the same age; −1 = a tenth |
| `spotify_tier_age_adj`, `youtube_tier_age_adj` | Popularity quartile within the song's age band: `Q1 (Low)` to `Q4 (Top)` |
| `Loudness_rank`, `Instrumentalness_rank`, `Acousticness_rank`, `duration_min_rank`, `Energy_rank`, `Danceability_rank`, `Valence_rank`, `Speechiness_rank`, `Tempo_rank`, `Liveness_rank`, `log_stream_rank`, `stream_vs_age_rank`, `log_views_rank`, `views_vs_age_rank` | Percentile rank (0–1) of that column across all rows, with ties averaged. Tableau has no Spearman function, but Spearman's ρ is the ordinary correlation of ranks, so `CORR([Loudness_rank], [stream_vs_age_rank])` gives it |

The age-relative and rank columns are empty where the raw count is missing (for example, no Spotify streams).

The rank columns are ranked over all rows, so `CORR()` on a filtered subset is very close to Spearman's ρ on that subset, but not identical. On the dashboards' 17,380 songs, the largest difference across the 40 feature–popularity pairs is 0.0014, so they agree to two decimal places.

---

## 8. How the dates will be used in the visualizations

### 8.1 Setting up the fields in Tableau

- **Sort `age_band` by hand.** Tableau sorts it alphabetically. Alternatively, add a sort key:
  `Age band order = CASE [age_band] WHEN "<3 mo" THEN 1 WHEN "3–6 mo" THEN 2 WHEN "6–12 mo" THEN 3 WHEN "1–2 y" THEN 4 WHEN "2–3 y" THEN 5 WHEN "3–5 y" THEN 6 WHEN "5–8 y" THEN 7 WHEN "8–12 y" THEN 8 WHEN "12–20 y" THEN 9 WHEN "20+ y" THEN 10 END`
- **Use `release_year` for timelines, not `release_date`.** About 30% of dates are year-only and sit on 1 July, so a month or day axis would show a false July spike.
- **Age-adjusted hit fields**, alongside the existing `spotify_popular` and `youtube_popular`:
  - `Spotify hit (age-adjusted) = [spotify_tier_age_adj] = "Q4 (Top)"`
  - `YouTube hit (age-adjusted) = [youtube_tier_age_adj] = "Q4 (Top)"`
  - `Quadrant (age-adjusted)` uses the same formula as `Quadrant`, with these two fields.
- **Spearman's ρ in Tableau:** use `CORR()` of two rank columns, for example `CORR([Loudness_rank], [stream_vs_age_rank])` against `CORR([Loudness_rank], [log_stream_rank])`, to compare a feature's link with age-adjusted and raw popularity (section 7).
- **A "confirmed dates only" filter** (`release_date_confidence = confirmed`, 82% of tracks) as a robustness toggle.
- **Undated tracks show as Null.** Exclude them from age-based sheets.
- The row rules don't change: the dashboards' 17,380 songs (`platform_lean` not Null) stay the same, and 16,925 of them have a date.

### 8.2 What changes in each dashboard

The figures below were computed on the 16,925 dashboard songs that have a date, for this document. They are not in the notebook.

**Dashboard 1: Where the platforms disagree**
- **Offer an age-adjusted version of the quadrants.** A hit then means top 25% *among songs of the same age* on each platform.
  - 17% of songs (2,835) change quadrant, but the quadrant sizes barely move. Hits on both go from 2,760 to 2,605; Spotify-only hits from 1,679 to 1,719; YouTube-only hits from 1,592 to 1,650.
  - 76% of raw hits on both stay hits on both.
- **The headline survives.** One-platform hits are 19% of songs on raw tiers and 20% on age-adjusted tiers, so "1 in 5 songs is a hit on only one platform" is not an age effect. This fits the notebook: `lean_score` is nearly free of age (ρ −0.10).
- **New releases get their due.** Only 92 songs under a year old are raw hits on both platforms, against 420 on age-adjusted tiers.
- **Song card:** add release date, age band and the age-adjusted tiers. Show the confidence when it isn't `confirmed`.

**Dashboard 2: What viral hit sounds like**
- **Audio Profile by quadrant and Feature by Popularity:** add the option to split by age-adjusted tiers instead of raw tiers. The notebook predicts these changes:
  - Duration's link with Spotify popularity disappears (ρ 0.080 → 0.011);
  - Danceability, Loudness, Speechiness and Valence become slightly more positive;
  - Loudness stays the leading feature on both platforms.

  The dashboard's z-score gaps need re-checking after the switch: the notebook measured correlations, not quadrant profiles.

**Dashboard 3: Sound or artist**
- **Traits vs same artists:** within an artist, older songs are bigger (within-artist ρ +0.31), so the "same artist" comparison is confounded by age. The notebook's age-controlled version (section 5.4) supports the dashboard's conclusion. Feature gaps stay negligible within artists, and only Duration keeps a small link (weakened by about a fifth).
- **Unlicensed YouTube upload:** the finding holds on age-adjusted quadrants. 38% of Spotify-only hits have an unlicensed upload, against 11% of hits on both (40% and 10% on raw quadrants). The unlicensed share is flat across ages (23–31%), except songs over 20 years old (38%).

**New charts the dates make possible**
- **Popularity by age band** (notebook 3.1): the reason for the adjustment, in one chart. Medians climb steeply for three years, peak at 5–8 years, then fall.
- **Audio features by release year** (notebook 3.4): the "music has changed" story, a natural lead-in to Dashboard 2.
- **Engagement by age band** (notebook 3.5): show like and comment rates only within an age band.

**Update the Limits section of `tableau/charts_explained_v2.md`.** The "No release date" bullet can be replaced with: *popularity is compared with songs of the same age; about 9% of dates may be a year or more off; views are aged from the song's release, not the video's upload*.

---

## 9. Findings of the v3 EDA notebook

The notebook (`notebooks/01_eda_spotify_youtube_v3.ipynb`) answers five questions. Section numbers in brackets refer to the notebook.

### Q1. What do the dates add, and how reliable are they? (§2)

- 96.9% of tracks have a date. Albums are the best covered (98%), then singles and compilations (95%), and spoken word is the worst (80%).
- The missing dates lean toward the least popular tracks: 93% of Spotify's bottom tier has a date, against 100% of its top tier.
- 82% of dates are confirmed by two sources, and 91% of a random sample have the right year (section 5 above).

### Q2. Is song age a confounder? (§3) Yes, on both sides.

- **Age drives popularity.** The median song under 3 months old has 4.3M streams, at 6–12 months 24M, and at 5–8 years 110M, a 25× range. Views follow the same curve (1.7M → 7.2M → 45M).
  - After about 8 years the medians fall again (50M streams and 9M views for songs over 20 years). Most of an old song's life predates the platforms, and fewer old songs have an official video.
  - Because the curve rises and then falls, ρ with age is only +0.17 for streams, so a correlation alone would hide the effect.
- **The raw top tier is partly an age tier.** Only 1% of songs under 3 months old are in Spotify's top tier, against 38–44% of songs aged 3–8 years (25% if age didn't matter).
- **Within an artist, older songs are bigger.** An artist's newest fifth of songs has a median of 0.44× the artist's average streams, and the oldest fifth 1.46×. Within-artist ρ of age is +0.31 with streams and +0.20 with views, larger than any audio feature's.
- **Age is linked to the audio features.** Correlations with release year:
  - **Duration** (ρ −0.32): from under 3 minutes in the 1960s, to about 4.2 in the 1990s, to about 3.1 in the 2020s;
  - **Loudness** (+0.29): about −11 dB in the late 1960s, −6 dB from the 2000s on;
  - **Speechiness** (+0.29): up from about 0.04 to 0.068 in the 2020s;
  - **Danceability** (+0.22).
- **Engagement rates depend on age.** The median like rate falls from 2.1 per 100 views for videos under 3 months old to about 0.6–0.7 for videos over 8 years (ρ −0.42).

### Q3. How should popularity be aggregated over time? (§4)

| Measure | Newest songs vs typical | Oldest songs vs typical | ρ with age |
|---|---|---|---|
| Raw count | 0.08× (Spotify), 0.12× (YouTube) | 0.97×, 0.64× | +0.17, +0.03 |
| Per-year rate (count ÷ years on the platform) | 2.8×, 4.0× | 0.33×, 0.19× | −0.56, −0.46 |
| **Age-relative score (used)** | about 1× | 1.00× | −0.00, −0.02 |

- Per-year rates **over-correct**: they assume plays arrive at a steady pace, but most arrive in a song's first years.
- Age-relative scores make no assumption about the shape of the curve and remove the age effect across songs.
- Within an artist, some age effect remains (ρ +0.20), so within-artist analyses control for each song's age directly.

### Q4. Which v2 findings change once age is controlled? (§5)

1. **Who is "popular" changes for 29% of Spotify tracks.** 19% of the raw top tier drops to Q3: older songs whose large counts are only typical for their age. 556 songs under a year old become top-tier for their age, for example Central Cee's *LET GO* and SZA's *Nobody Gets Me*.
2. **Platform agreement barely changes.**
   - ρ between streams and views: 0.62 raw, 0.59 age-relative.
   - `lean_score` is nearly age-free (ρ −0.10). Only the extremes differ: songs under 3 months lean YouTube, as music videos peak around release, and songs over 20 years old are balanced.
3. **Audio features across all songs:**
   - **Duration's link with Spotify streams was an age artefact** (ρ 0.080 → 0.011). Longer songs are older, and older songs have more streams.
   - **Features of modern songs were understated.** On Spotify:
     - Danceability: 0.028 → 0.079;
     - Loudness: 0.111 → 0.146;
     - Speechiness: −0.016 → 0.035;
     - Valence: −0.017 → 0.022.
   - On YouTube, Danceability and Valence strengthen too.
   - Every association is still weak (|ρ| ≤ 0.23). Loudness leads on both platforms.
4. **Audio features within each artist:**
   - Duration's link weakens by about a fifth once age is controlled (Spotify 0.133 → 0.106, YouTube 0.160 → 0.142) but survives.
   - Every other feature stays negligible (|ρ| < 0.05), except Loudness, which rises slightly.
   - The v2 conclusion holds: pooled associations mostly describe which kinds of artists and eras are big, not what makes one song beat another by the same artist.

All of these results hold on confirmed dates only (within 0.03).

### Q5. Does the new CSV address the feedback? (§6)

| Feedback point | Addressed? | Evidence |
|---|---|---|
| Streams accumulate over time | **Yes**, for 97% of tracks | Age explains a 25× range in median streams; age-relative scores remove it |
| Views, likes and comments accumulate over time | **Partly** | The same curve appears and is removed, but it is measured from the song's release, not the video's upload |
| Engagement rates are a fair comparison | **No** | Like rate falls about 3× with age; compare within age bands |
| The ages are right | **Mostly** | 91% right year and 98% within a year on 45 random tracks; 82% confirmed by two sources |

**In short:** the release date does remove the confounder, but only when it is used to *adjust* popularity. The raw columns alone don't solve it, and dividing by age over-corrects. Comparing each song with songs of the same age works.

---

## 10. Limitations and next steps

**Limitations**
- About 9% of dates may still have the wrong year (95% range: about 4–21%), mostly by one year. Known errors are listed in section 5.5.
- There are no YouTube upload dates, so views, likes and comments are aged from the song's release.
- **No penalty or credit for songs older than the platforms.** A song released before YouTube (Dec 2005) or Spotify (Oct 2008) could only collect plays from the platform's launch, but `years_since_release` counts from the song's release. A per-year rate starting at the launch was tested in the notebook (§4) and rejected because it over-corrects. The age bands absorb part of it, because every song in the 20+ y band predates both platforms and is only compared with songs in the same position. The 12–20 y band (2003–2011) mixes songs released before and after the launches, so for those songs the effect remains. Spotify also launched in different countries at different times (the US in 2011), which no single cut-off captures.
- Wikidata doesn't always mark compilations, so a few songs carry a compilation's date.
- A single released before its album can carry the album date.
- The analysis is correlational, and the sample holds about the top 10 tracks per artist.

**Next steps**
1. Add YouTube upload dates (free YouTube Data API key) and re-run `scripts/add_release_dates.py` and the notebook. The analysis code doesn't change.
2. Check a fresh random sample of 30–50 tracks by hand, for an accuracy figure independent of the rule choice.
3. Add the age-adjusted quadrant option and the age filters to the dashboards (section 8).
4. In any modelling, include log song age (or age band) and the artist as covariates instead of relying on raw counts.
