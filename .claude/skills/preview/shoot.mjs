// Screenshots pages at phone (375px) and desktop (1440px) width, so both
// designs are looked at before a change ships (see CLAUDE.md).
//
//   node .claude/skills/preview/shoot.mjs /path [/path2 ...] [--out DIR] [--base URL] [--full]
//
// Signed-in pages (/dashboard, /budget, /guests, ...) need PREVIEW_EMAIL and
// PREVIEW_PASSWORD for a test account; the script signs in through /login
// once and reuses the session for every shot. Without them those pages
// screenshot the login screen, and the script says so.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require("playwright");
  } catch {
    const root = execSync("npm root -g").toString().trim();
    return require(path.join(root, "playwright"));
  }
}

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const [v] = args.splice(i, 2).slice(1);
  return v;
};
const full = args.includes("--full");
const base = opt("--base", process.env.PREVIEW_BASE ?? "http://localhost:3000").replace(/\/$/, "");
const out = opt("--out", "preview");
const pages = args.filter((a) => !a.startsWith("--"));
if (pages.length === 0) pages.push("/");

const SIZES = [
  { name: "mobile", width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];

const { chromium } = loadPlaywright();
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: "/opt/pw-browsers/chromium" },
);
mkdirSync(out, { recursive: true });

// One sign-in, shared by both sizes (cookies don't care about viewport).
let storageState;
const { PREVIEW_EMAIL: email, PREVIEW_PASSWORD: password } = process.env;
if (email && password) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${base}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  if (new URL(page.url()).pathname.startsWith("/login")) {
    console.error("Sign-in failed: still on /login. Check PREVIEW_EMAIL / PREVIEW_PASSWORD.");
  } else {
    storageState = await ctx.storageState();
  }
  await ctx.close();
}

const slug = (p) => p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-") || "home";
for (const size of SIZES) {
  const { name, width, height, ...device } = size;
  const ctx = await browser.newContext({ viewport: { width, height }, storageState, ...device });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
    await page.goto(`${base}${p}`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(800); // let entrance animations settle
    const file = path.join(out, `${slug(p)}-${name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: full });
    const landed = new URL(page.url()).pathname;
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    const notes = [];
    if (landed !== p && landed.startsWith("/login")) notes.push("redirected to /login (needs PREVIEW_EMAIL/PASSWORD)");
    else if (landed !== p) notes.push(`landed on ${landed}`);
    if (overflow > 0) notes.push(`horizontal scroll: ${overflow}px wider than the screen`);
    if (errors.length) notes.push(`page errors: ${errors.slice(0, 2).join(" | ")}`);
    console.log(`${file}${notes.length ? "  ⚠ " + notes.join("; ") : ""}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
