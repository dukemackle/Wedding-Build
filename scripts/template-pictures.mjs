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
const templatesSrc = readFileSync("src/lib/site-templates.ts", "utf8");
const ids = [...templatesSrc.matchAll(/^ {4}id: "([^"]+)"/gm)].map((m) => m[1]);
// Painted suites keep their painting at the foot of the page, below the fold:
// their pictures join the top of the page (names, photo) to its foot (the
// painting), so each card shows its own painting (owner, 2026-11-13).
const skySrc = readFileSync("src/components/site-scene.tsx", "utf8");
const skyBlock = skySrc.slice(skySrc.indexOf("export const PAINTED_SKY"), skySrc.indexOf("};", skySrc.indexOf("export const PAINTED_SKY")));
const paintedScenes = new Set([...skyBlock.matchAll(/^\s+"?([a-z-]+)"?:\s*"#/gm)].map((m) => m[1]));
const sceneOf = Object.fromEntries(
  templatesSrc.split(/\n  \{\n/).flatMap((block) => {
    const id = block.match(/^ {4}id: "([^"]+)"/m)?.[1];
    const scene = block.match(/^ {4}scene: "([^"]+)"/m)?.[1];
    return id && scene ? [[id, scene]] : [];
  }),
);
const painted = (id) => paintedScenes.has(sceneOf[id]);
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
    let png = await page.screenshot();
    if (painted(id)) {
      const { width, height } = shot.viewport;
      // The painting is lazy-loaded below the fold: load it before the full-page shot.
      await page.evaluate(async () => {
        for (const img of document.images) {
          img.loading = "eager";
          if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; setTimeout(r, 8000); });
        }
      });
      await page.waitForTimeout(500);
      const full = await page.screenshot({ fullPage: true });
      const pageH = (await sharp(full).metadata()).height;
      const keep = Math.round(height * 0.5); // names and the top of the photo
      const foot = height - keep + 60; // the painting, overlapping 60px to fade in
      const bottom = await sharp(full).extract({ left: 0, top: pageH - foot, width, height: foot }).png().toBuffer();
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${foot}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${60 / foot}" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
      const faded = await sharp(bottom).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
      png = await sharp(png).composite([{ input: faded, top: keep - 60, left: 0 }]).png().toBuffer();
    }
    await sharp(png).resize(shot.width).webp({ quality: 72 }).toFile(`public/site-templates/${id}-${shot.kind}.webp`);
    console.log(`${id}-${shot.kind}`);
  }
  await page.close();
}
await browser.close();
