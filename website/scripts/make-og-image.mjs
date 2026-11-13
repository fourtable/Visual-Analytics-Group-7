#!/usr/bin/env node
/**
 * Renders the 1200 × 630 social preview (public/og-image.png) in headless Chrome:
 * the title and the 2×2 quadrant motif in the site's colours and fonts.
 *
 *   npm run og
 *
 * The card's words are below (a build asset, not page copy). Update them here if the
 * title changes, then re-run. Env: BROWSER_CHANNEL=chrome|msedge (default chrome).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "og-image.png");

const card = {
  eyebrow: "IS428 Visual Analytics · Group G2T7",
  title: "What Makes a Song a Dopamine Trap?",
  subtitle: "How audio features go with popularity on Spotify and YouTube.",
  squares: [
    { label: "YouTube-only hit", fill: "#E15759", text: "#C0393B" },
    { label: "Hit on both", fill: "#4E79A7", text: "#3A6290" },
    { label: "Neither", fill: "#F28E2B", text: "#B35C0C" },
    { label: "Spotify-only hit", fill: "#59A14F", text: "#3B7A34" },
  ],
};

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Space+Grotesk:wght@700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; display: flex; align-items: center; gap: 64px;
         padding: 0 80px; background: #fff; color: #1F2328; font-family: Inter, sans-serif; }
  .text { flex: 1; }
  .eyebrow { margin-bottom: 24px; color: #5B6470; font-size: 24px; font-weight: 600; }
  h1 { margin: 0; font-family: "Space Grotesk", sans-serif; font-size: 74px; line-height: 1.03; letter-spacing: -0.02em; }
  .sub { margin-top: 28px; color: #5B6470; font-size: 26px; line-height: 1.4; }
  .grid { display: grid; grid-template-columns: repeat(2, 196px); gap: 10px; }
  .sq { display: grid; place-items: center; height: 196px; border-radius: 14px; }
  .chip { padding: 6px 14px; border-radius: 999px; background: #fff; font-size: 18px; font-weight: 600; }
</style></head><body>
  <div class="text">
    <div class="eyebrow">${card.eyebrow}</div>
    <h1>${card.title}</h1>
    <div class="sub">${card.subtitle}</div>
  </div>
  <div class="grid">
    ${card.squares
      .map(
        (s) =>
          `<div class="sq" style="background:${s.fill}"><span class="chip" style="color:${s.text}">${s.label}</span></div>`,
      )
      .join("")}
  </div>
</body></html>`;

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "chrome",
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(out);
  console.log(`saved ${path.relative(root, out)}`);
} finally {
  await browser.close();
}
