# What Makes a Song a Dopamine Trap? (project website)

The one-page companion site for the IS428 G2T7 report. It walks through the report's
argument and leads readers into the six Tableau dashboards and one worksheet, embedded
live from Tableau Public. Built from the team's build plan (12 Nov 2026).

- **Stack:** Next.js (App Router) + React + TypeScript, exported as static files
- **Styling:** CSS Modules plus design tokens in `app/globals.css`; fonts via `next/font`
- **Motion:** our own `Reveal`, `CountUp` and `GrowBar` components (no animation library)
- **Dashboards:** Tableau Embedding API v3

## Run it

You need Node.js 20.9 or newer (22 LTS recommended).

```bash
cd website
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run preview    # serve out/ locally, compressed like a real host
npm run lint       # ESLint
npm run format     # Prettier
```

Versions used (13 Nov 2026): Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3,
ESLint 9.39.5 (with eslint-config-next 16.4.6), Prettier 3.10.1, playwright-core 1.65.0,
sharp 0.35.5, Node.js 20.18.0. ESLint stays on 9 because ESLint 10 needs Node 20.19+.

## Where things live

```
app/            layout.tsx (fonts, metadata, motion flag, Tableau script), page.tsx, globals.css
components/
  layout/       Nav, ScrollProgress, Footer, BackToTop, StoryLinks
  sections/     Hero, Problem, HowToRead, KeyFindings, Explore, DeepDive, SoWhat, Methods
  explore/      ChapterStrip, Chapter, DashboardBlock, TableauEmbed, EmbedBar, CaptionBlock,
                QuadrantSplitBar, FunFacts
  ui/           Button, Card, StatChip, QuadrantChip, Accordion, Placeholder, Text,
                QuadrantMotif, DataFunnel, Section
  motion/       Reveal, CountUp, GrowBar, MotionReady
content/        every word and number on the page (see below)
hooks/          useInViewOnce, useInView, useActiveSection, useMediaQuery,
                usePrefersReducedMotion, useElementSize
lib/            embed loading queue, inline-text parser, Tableau constants
public/         dashboards/ (screenshots), favicon.svg, og-image.png
scripts/        capture-dashboards.mjs, make-og-image.mjs
```

## Editing content

All copy and figures are in `content/`, one file per section, so text changes never
touch React code:

| File            | Section                                                             |
| --------------- | ------------------------------------------------------------------- |
| `site.ts`       | Site name, metadata, nav sections, hero, shared interface labels    |
| `problem.ts`    | Problem (background stats, why it matters, gap, question)           |
| `howToRead.ts`  | How to read our charts (quadrants, cut-offs, glossary)              |
| `quadrants.ts`  | Quadrant names and counts (age-adjusted and raw)                    |
| `findings.ts`   | Key Findings                                                        |
| `chapters.ts`   | Explore intro, the five chapters, Chapter 5 fun facts               |
| `dashboards.ts` | Dashboard headings, captions, "Try this" tips, screenshot alt text  |
| `embeds.json`   | Tableau embed addresses and sizes (also read by the capture script) |
| `deepDive.ts`   | Song spotlights and patterns                                        |
| `soWhat.ts`     | Conclusion, implications, future work                               |
| `methods.ts`    | Data funnel, how we did it, challenges, limits                      |
| `references.ts` | Footer (team, course line, disclaimer)                              |

Inside any string:

- `[text]` is a **placeholder**. It shows on the page with a yellow dashed highlight
  so unfilled team input is easy to spot. Replace the whole `[...]` when you fill it.
- `**text**` is bold and `*text*` is italic.

Figures that differ between popularity measures are stored with both values, for
example `value: { adjusted: "20%", raw: "19%" }`. The page shows the age-adjusted
figure with "Raw counts: …" beneath whenever the two differ. Numbers inside stat chips
count up on first view automatically (the exact final value is always in the HTML).

Copy rules from the build plan still apply: association wording only ("tends to",
"goes with"), age-adjusted figures first, the report's quadrant names, sentences under
25 words, and counts that match (five findings = five cards).

## Dashboards

- The site only **loads** dashboards and listens for `firstinteractive`. It never
  changes a filter, parameter or selection, and never links to Tableau Public.
- On screens 1024 px and wider, each dashboard loads when it comes within 600 px of the
  screen, at most two at a time, and is scaled down to fit narrower windows. Once
  loaded it stays loaded, so readers keep their own filters. Under 1024 px, readers see
  the screenshot and an **Open interactive view** button that opens the live dashboard
  in a full-screen overlay.
- **Full screen** uses the browser's full-screen mode on the same element, so the
  dashboard isn't reloaded and readers keep their changes. Escape closes it.
- Tableau Public always draws its own toolbar (with "View on Tableau Public") in a
  27 px strip under each viz, whatever the toolbar setting. The site makes each embed
  27 px taller and crops that strip off (`lib/tableau.ts`). Re-check this if Tableau
  changes its embed layout.
- **Screenshots** (the fallback shown before loading, on phones and without JavaScript)
  are captured from the live embeds with `npm run capture`. Re-run it after
  republishing a dashboard. It drives your installed Chrome (`BROWSER_CHANNEL=msedge`
  for Edge) and writes `public/dashboards/<slug>.webp` and `<slug>@2x.webp`.
- If a dashboard's size changes, update `content/embeds.json`, then re-capture.

The social preview image (`public/og-image.png`, 1200 × 630) is rendered with
`npm run og`; its words are inside `scripts/make-og-image.mjs`.

## Dark mode

The moon/sun button in the nav switches between light and dark themes. A reader's choice
is saved in their browser; on a first visit the site follows their system setting
(without JavaScript it stays light). The theme is a `data-theme` attribute on `<html>`,
set by a small script in `app/layout.tsx` before the page paints, and `app/globals.css`
redefines the colour tokens for `[data-theme="dark"]`. Use the tokens (`--bg`, `--ink`,
`--on-accent`, `--inverse-bg`, …) rather than hard-coded colours so new styles work in
both themes. The quadrant colours are identical in both themes so they still match the
dashboards, and the embedded Tableau dashboards themselves stay white.

## Deploy (Vercel)

**Live site:** https://visual-analytics-group-7.vercel.app (Vercel project
`visual-analytics-group-7` in the "Josh's projects" team).

The project is connected to this GitHub repository, so deploys are automatic:

- **Push to `main`** → Vercel builds the `website` folder and updates the live site.
- **Push any other branch or open a pull request** → Vercel builds a preview with its
  own link (shown on the pull request). Previews require a Vercel login by default;
  change that under **Settings → Deployment Protection** if outsiders should see them.

Project settings: Root Directory `website`, Next.js preset, production branch `main`.
No environment variables are needed. If a build fails, open the deployment in the
Vercel dashboard (**Deployments**) to read its build log.

The site is plain static files (`out/`), so any static host would also work.

## Website development (notes for report section 9.7)

1. **Publishing.** Each dashboard was published from Tableau Desktop to Tableau Public
   as its own workbook (one view per workbook), only so it can be embedded. Dashboards
   use fixed sizes (Defining a Hit 1200 × 800 px, the others 1366 × 768 px); the Flags
   by Quadrant worksheet is shown in a 1000 × 600 px frame.
2. **Embedding.** A React client component (`TableauEmbed`) creates Tableau's
   `<tableau-viz>` web component (Embedding API v3) when the dashboard comes within
   600 px of the screen, with at most two loading at once. The component scales each
   dashboard to the available width with a CSS transform, shows a loading shimmer, keeps
   a screenshot fallback (captured automatically at 2×) for phones, slow connections
   and readers without JavaScript, and offers Try again if a dashboard fails to load
   within 15 seconds.
3. **Structure and navigation.** A single Next.js page, statically exported, with eight
   sections in the report's order: Hero, Problem, How to read our charts, Key Findings,
   Explore (five chapters, one per analysis task), Deep Dive, So what? and
   Methods & Limits. A sticky nav bar highlights the current section and shows reading
   progress; inside Explore, a sticky chapter strip shows and links to the current
   chapter. Story links (See the evidence →) scroll to the right dashboard and start
   loading it early.
4. **Interaction and motion.** Each dashboard has an embed bar with Full screen (Open
   interactive view on phones), a caption naming the control to use, and a "Try this"
   tip. Motion is limited to: section reveals, count-up numbers, growing bars (listening
   share, quadrant split, data funnel), the hero motif, a slow red-to-green background
   wash behind the whole page (the dashboards' YouTube red and Spotify green, swelling
   and drifting in turn every 12 seconds; text colours are tuned to stay WCAG AA on
   it), a scroll-progress line, the nav underline and shadow, the chapter strip fill,
   the embed loading shimmer and smooth accordions. With reduced motion turned on,
   everything appears in its final state (the wash holds still) and state changes
   happen instantly; nothing moves on or over a dashboard, which sit on solid white
   frames. A light/dark theme toggle sits in the nav.
5. **Hosting and deployment.** The code is in the GitHub repository; Vercel builds the
   `website` folder with the Next.js preset on every push, with a preview link for each
   branch or pull request and production on `main`.

## Before launch

**Placeholders:** none left (team names, song spotlights and the Where the Platforms
Disagree example are filled; the footer has no project links or references by choice).
If you add new text with `[...]`, it shows highlighted until filled.

**Song choices** (from `dataset/spotify_youtube_release_date.csv`, each in the same
quadrant under both Popularity Measure settings): Spotify Darling, Wonderwall
(Remastered) by Oasis; YouTube Darling, Wheels on the Bus by CoComelon; Agreed Hit,
Shape of You by Ed Sheeran; caption example, Gentleman by PSY (YouTube-only hit).

**Confirm:**

- The short site name in the nav ("Dopamine Trap" is the draft).
- IFPI figures: US$31.7B (+6.4%) and 20.7 hours match the linked pages. The 32% vs 31%
  audio/video split isn't on the linked IFPI summary page; it should be in the full
  Engaging with Music 2023 report, which may be the better link.
- Copy written during the build (not in the build plan), condensed from the report:
  chapter intros for Chapters 2 to 5, the short labels under the Key Findings and fun
  fact numbers, section and block headings, the How to read and Deep Dive intro lines,
  the spotlight "where its dot sits" lines, and the screenshot alt text.

**Figures taken from the live dashboards** (the build plan's notebook estimates differ
slightly because Tableau sets its top-25% cut-offs over all 18,847 cleaned tracks):

- Age-adjusted quadrants: 2,564 / 1,761 / 1,592 / 11,008 of 16,925 (plan: 2,559 /
  1,673 / 1,673 / 11,020), so YouTube-only is 9%, not 10%.
- Live recordings: 2.9% of YouTube-only vs 0.6% of Spotify-only hits, about 5×
  (plan: 2.8%, nearly 5×).
- Raw-count hit cut-offs: about 134.74M streams and 65.49M views.
