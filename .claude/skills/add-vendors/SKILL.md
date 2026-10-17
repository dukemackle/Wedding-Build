---
name: add-vendors
description: Research and add a batch of real wedding vendors to the per-state files in src/lib/batches/vendors/, check it, and open the self-merging PR. Use when the owner says /add-vendors, "add vendors", "next vendor batch", names a metro or category to fill, or pastes a list of vendors to add.
---

# Add a vendor batch

Vendors reach the app in two steps: a PR adds rows to a state's file in
`src/lib/batches/vendors/` (e.g. `ohio.ts`; the older `src/lib/vendor-batches.ts`
is closed to new batches),
then the owner clicks "Add them" on /admin/vendors, which inserts any row whose
website isn't already in the database. This skill does the first step.

## 1. Pick the batch

Arguments may name a metro, a category, or both (`/add-vendors Houston`), or the
owner may paste names or a list. Otherwise, choose for them:

1. Run `npm run coverage` for the 50-state picture, then `npm run coverage --
   <State>` for what a state's metros still need. The metros and targets are
   in `scripts/coverage-plan.mjs`.
2. **Wide before deep** until every state meets pass 1 (its first metro has 3
   in each core category): take the state furthest from it. After that, fill
   each state's other metros. A category counts as missing until the metro
   reaches its target: 3 per category, 5 in a large market, 8 in a major one
   (`MARKET_SIZE` in the plan; `npm run coverage -- <State>` shows the gaps).
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
- **Instagram-only vendors (Basic listings).** A vendor with no website can
  go in with its Instagram as the source, Website left blank, if the profile:
  posted in the last six months, shows wedding work, names its town, and gives
  an email (quotes and edit links go to it; the checker refuses one without).
  Fill only what the profile states. The site labels these "Basic listing"
  so couples know to confirm the details themselves. Fill websites first: a
  Basic listing is for gaps a metro can't fill otherwise, never a shortcut.
  Facebook-only or Google-only businesses still go on the skipped list.
- **Leave out** anything with a dead or parked site or no sign of activity in
  the last couple of years. Also leave out franchises and directories posing as
  vendors, and vendors already in the file (the checker flags duplicate websites).
- **Mix:** within a category, cover a range of styles and price points, and
  cultural specialties where they exist (South Asian, Mexican/Latino,
  Vietnamese, Jewish, etc.). Don't list only the top luxury names.
- **Record what you leave out.** Every real business found and left out goes on a line in
`src/lib/batches/skipped/<state>.tsv`, with its reason and best link (format
and reasons in that folder's README). That's how we count what exists but
isn't listed, and who to invite to /list later. Skip duplicates and
businesses left out only because the metro was already full.
- **If the owner pastes a list,** still visit each site. Fill the missing
  columns, fix wrong ones, and report any you dropped and why.

## 3. Write the rows

Tab-separated, one vendor per line, header exactly:

```
Name	Category	Address	City	State	Service area	Description	Email	Phone	Website	Instagram
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
- **Address:** the street line only ("604 Brazos St, Suite 200"), of a studio,
  shop, showroom, bakery or office the vendor publishes on their own site or
  Google listing. The import looks it up and pins the vendor there. Many
  photographers, planners and DJs work from home and publish none: leave it
  blank and they're placed near their town's centre. Never a PO Box, never a
  home address found elsewhere, never guessed. If the address's postal town
  differs from City, use the postal town as City so the lookup matches.
- Leave out Latitude/Longitude; the address is what places a vendor.

Add the rows as **one new entry at the end of the state's file** in
`src/lib/batches/vendors/`. Every row's State must be that file's state (the
checker fails otherwise); a metro that crosses a state line splits into one
batch per state. Name it `"<Metro>: <categories>"`, with the metro written
exactly as in `scripts/coverage-plan.mjs` (e.g. `Columbus: ...`), or as that
metro's earlier batches did for Texas. The coverage report counts by that
prefix.

## 4. Check

```
node .claude/skills/add-vendors/scripts/check-batches.mjs
```

Fix every ✗ problem. Read the ! warnings and fix any that come from the new
batch; warnings about older batches can stay. Then run `npx eslint
src/lib/vendor-batches.ts`.

Then verify the new rows against the businesses' own sites:

```
npm run verify:batches
```

Every FAIL blocks the PR. The fix is never to argue with the checker: blank a
phone or email the site doesn't show, correct a name to how the site writes
it, and drop (or replace) a row whose site is dead, parked or blocks automated
visits unless you can confirm it by hand some other way. Read each warning
(possible closure, city not on the site) against the site; say in the PR body
why any that remain are fine. Quote the summary line in the PR body.

## 5. Ship

This PR merges itself (CLAUDE.md: venue and vendor batches), so no preview is needed.

1. Commit just the state file(s) and their skipped files: `Add <area> vendor batch (<n> vendors)`.
2. Push and open the PR. The body should cover the counts per category, the
   sources used, and what was left out and why.
3. Subscribe to the PR. Once the Cloudflare build is green, merge it. If the
   build fails, fix it and push.
4. Tell the owner in two lines: merged, and to click **"Add them"** on
   /admin/vendors. Name the categories that are still thin in that metro.

If the PR touches anything besides the batch files in `src/lib/batches/`,
it's no longer self-merging. Hand it to the owner.
