// Writes the art library's icon drawings (public/site-art/icon-*.svg) from
// src/lib/scene-icons.ts, so the patterns and the picker share one drawing.
// Run with: node scripts/site-art-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/scene-icons.ts", import.meta.url), "utf8");
const block = src.slice(src.indexOf("export const ICONS"), src.indexOf("} as const;"));
const icons = [...block.matchAll(/^\s*(\w+):\s*\n?\s*"([^"]+)"/gm)];
// Only these join the library; the rest are pattern-only (or already there, drawn larger).
const LIBRARY = ["hat", "badge", "horseshoe", "seahorse", "starfish", "turtle", "coral", "fish"];
const picked = icons.filter(([, name]) => LIBRARY.includes(name));
for (const [, name, d] of picked) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="900" height="900"><path d="${d}" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;
  writeFileSync(new URL(`../public/site-art/icon-${name}.svg`, import.meta.url), svg);
}
console.log(`wrote ${picked.length} icons`);
