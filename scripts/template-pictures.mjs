// Screenshots every template on a sample couple into public/site-templates,
// the saved pictures on the template cards (template-picture.tsx). Run after
// adding or changing a template, with `next dev` already running:
//   npm run dev -- -p 3100   (then, in another terminal)
//   npm run template-pictures [-- http://localhost:3100]
// Needs Playwright with Chromium, which isn't one of the app's dependencies:
//   npm i -g playwright && npx playwright install chromium
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import sharp from "sharp";

// CommonJS resolution, so a global install is found.
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3100";
const ids = [...readFileSync("src/lib/site-templates.ts", "utf8").matchAll(/^ {4}id: "([^"]+)"/gm)].map((m) => m[1]);
// Wide cards lay the page out at computer width, upright ones at phone width,
// each cropped to the card's shape (4:3 and 4:5) and sized for a 2x screen.
const shots = [
  { kind: "computer", viewport: { width: 1280, height: 960 }, width: 640 },
  { kind: "phone", viewport: { width: 390, height: 488 }, width: 390 },
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: shot.viewport });
  for (const id of ids) {
    await page.goto(`${base}/template-shot?t=${id}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    // Next's dev badge.
    await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()));
    const png = await page.screenshot();
    await sharp(png).resize(shot.width).webp({ quality: 72 }).toFile(`public/site-templates/${id}-${shot.kind}.webp`);
    console.log(`${id}-${shot.kind}`);
  }
  await page.close();
}
await browser.close();
