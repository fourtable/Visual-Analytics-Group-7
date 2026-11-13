#!/usr/bin/env node
/**
 * Captures the fallback screenshot for each dashboard
 * (Build Plan › Tableau embeds › Loading, fallback and screenshots).
 *
 * Each view is opened in headless Chrome exactly as the site embeds it (default
 * settings, Tableau's toolbar hidden), at 2× pixel density. After `firstinteractive`
 * it writes public/dashboards/<slug>@2x.webp and a 1× copy, <slug>.webp.
 *
 *   npm run capture                    all seven views
 *   npm run capture -- disagree flags-by-quadrant   only these slugs
 *
 * Env: BROWSER_CHANNEL=chrome|msedge (default chrome; uses the installed browser,
 *      nothing is downloaded), CAPTURE_PNG_DIR=<dir> also keeps the raw 2× PNGs.
 * Slugs, embed addresses and sizes come from content/embeds.json.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const embeds = JSON.parse(await readFile(path.join(root, "content", "embeds.json"), "utf8"));
const only = process.argv.slice(2);
const targets = only.length ? embeds.filter((e) => only.includes(e.slug)) : embeds;
if (targets.length === 0) {
  console.error(`No matching slugs. Known: ${embeds.map((e) => e.slug).join(", ")}`);
  process.exit(1);
}

const outDir = path.join(root, "public", "dashboards");
const pngDir = process.env.CAPTURE_PNG_DIR;
await mkdir(outDir, { recursive: true });
if (pngDir) await mkdir(pngDir, { recursive: true });

const API = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";
const ORIGIN = "http://capture.localhost";
const TIMEOUT_MS = 90_000;
const SETTLE_MS = 3_000;
// Tableau Public always adds its toolbar (with "View on Tableau Public") under the viz,
// whatever the toolbar setting. The site makes each embed this much taller and crops
// the strip off; the screenshot does the same. Keep in sync with lib/tableau.ts.
const TOOLBAR_CROP_PX = 27;

const html = (e) => `<!doctype html>
<html><head><meta charset="utf-8">
<script type="module" src="${API}"></script>
<style>html,body{margin:0;background:#fff}tableau-viz{display:block;width:${e.width}px;height:${e.height + TOOLBAR_CROP_PX}px}</style>
</head><body>
<tableau-viz id="viz" src="${e.src}" width="${e.width}" height="${e.height + TOOLBAR_CROP_PX}" toolbar="hidden" hide-tabs device="desktop"></tableau-viz>
<script>
  window.__viz = "loading";
  const viz = document.getElementById("viz");
  viz.addEventListener("firstinteractive", () => { window.__viz = "ready"; });
  viz.addEventListener("vizloaderror", () => { window.__viz = "error"; });
</script>
</body></html>`;

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "chrome",
  headless: true,
});

let failures = 0;
try {
  for (const e of targets) {
    const context = await browser.newContext({
      deviceScaleFactor: 2,
      viewport: { width: e.width, height: e.height + TOOLBAR_CROP_PX },
    });
    const tab = await context.newPage();
    await tab.route(`${ORIGIN}/**`, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: html(e) }),
    );
    process.stdout.write(`${e.slug} (${e.width}×${e.height}): `);
    try {
      await tab.goto(`${ORIGIN}/${e.slug}.html`);
      await tab.waitForFunction(() => window.__viz !== "loading", null, { timeout: TIMEOUT_MS });
      const state = await tab.evaluate(() => window.__viz);
      if (state !== "ready") throw new Error(`viz state: ${state}`);
      await tab.waitForTimeout(SETTLE_MS);
      // Only the dashboard itself: the toolbar strip below it is cropped off.
      const png = await tab.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: e.width, height: e.height },
      });
      if (pngDir) await writeFile(path.join(pngDir, `${e.slug}@2x.png`), png);
      await sharp(png)
        .webp({ quality: 82, effort: 6 })
        .toFile(path.join(outDir, `${e.slug}@2x.webp`));
      await sharp(png)
        .resize({ width: e.width })
        .webp({ quality: 85, effort: 6 })
        .toFile(path.join(outDir, `${e.slug}.webp`));
      console.log("saved");
    } catch (error) {
      failures += 1;
      console.log(`FAILED (${error.message})`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

process.exit(failures ? 1 : 0);
