---
name: add-vendors
description: Research and add a batch of real wedding vendors to src/lib/vendor-batches.ts, check it, and open the self-merging PR. Use when the owner says /add-vendors, "add vendors", "next vendor batch", names a metro or category to fill, or pastes a list of vendors to add.
---

# Add a vendor batch

Vendors reach the app in two steps: a PR adds rows to `src/lib/vendor-batches.ts`,
then the owner clicks "Add them" on /admin/vendors, which inserts any row whose
website isn't already in the database. This skill does the first step.

## 1. Pick the batch

Arguments may name a metro, a category, or both (`/add-vendors Houston`), or the
owner may paste names or a list. Otherwise, choose for them:

1. Run `node .claude/skills/add-vendors/scripts/check-batches.mjs`. It prints
   each area's count per category and what's missing.
2. **Go deep before wide.** Fill the metro with the most missing categories
   before starting a new metro. Any category with fewer than 3 vendors in a metro
   counts as missing.
3. Say in one line which metro and categories you're doing, then go ahead. Only
   ask if the owner's request is ambiguous.

Aim for **40–60 vendors per PR**. A small metro can come in under that rather
than be padded with weak listings.

## 2. Research (or take the owner's list)

- **Sources:** each vendor's own website is the source of truth. Venues'
  preferred-vendor lists and local wedding guides are good for finding names,
  but confirm every detail on the vendor's own site.
- **Include only** vendors that do weddings, have a working website, and are
  based in or regularly serve the metro.
- **Leave out** anything with a dead or parked site or no sign of activity in
  the last couple of years. Also leave out franchises and directories posing as
  vendors, and vendors already in the file (the checker flags duplicate websites).
- **Mix:** within a category, cover a range of styles and price points, and
  cultural specialties where they exist (South Asian, Mexican/Latino,
  Vietnamese, Jewish, etc.). Don't list only the top luxury names.
- **If the owner pastes a list,** still visit each site. Fill the missing
  columns, fix wrong ones, and report any you dropped and why.

## 3. Write the rows

Tab-separated, one vendor per line, header exactly:

```
Name	Category	City	State	Service area	Description	Email	Phone	Website	Instagram
```

- **Category:** must be one of `VENDOR_LISTING_CATEGORIES` in
  `src/lib/wedding-options.ts`. A DJ or band is `Music`, a coordinator is
  `Planning`, and a donut truck is `Desserts`.
- **City:** the vendor's base town, not the metro. **State:** spelled out
  ("Texas").
- **Service area:** short and from their site ("Austin and the Hill Country").
  Leave it blank if the site doesn't say.
- **Description:** one sentence of 80–160 characters, in our own words. Say what
  the vendor does and what sets them apart. Never copy their tagline or quote a
  review, and skip "best"/"premier" puffery. Use British spelling to match the
  file ("colour", "specialising").
- **Email, phone and Instagram:** only if published on their site. Never guess
  an email, and leave it blank rather than use a contact form URL.
  Instagram must be a full `https://www.instagram.com/handle/` URL.
- **Website:** `https://`, homepage unless a wedding-specific page is better.
- Leave out Latitude/Longitude; vendors get pinned to their town's centre.

Add the rows as **one new entry at the end of `VENDOR_BATCHES`**. Name it
`"<Area>: <categories>"`, using exactly the same area prefix as that metro's
earlier batches (e.g. `Dallas–Fort Worth: ...`). The coverage report groups by
that prefix.

## 4. Check

```
node .claude/skills/add-vendors/scripts/check-batches.mjs
```

Fix every ✗ problem. Read the ! warnings and fix any that come from the new
batch; warnings about older batches can stay. Then run `npx eslint
src/lib/vendor-batches.ts`.

## 5. Ship

This PR merges itself (CLAUDE.md: venue and vendor batches), so no preview is needed.

1. Commit just `src/lib/vendor-batches.ts`: `Add <area> vendor batch (<n> vendors)`.
2. Push and open the PR. The body should cover the counts per category, the
   sources used, and what was left out and why.
3. Subscribe to the PR. Once the Cloudflare build is green, merge it. If the
   build fails, fix it and push.
4. Tell the owner in two lines: merged, and to click **"Add them"** on
   /admin/vendors. Name the categories that are still thin in that metro.

If the PR touches anything besides `vendor-batches.ts`, it's no longer
self-merging. Hand it to the owner.
