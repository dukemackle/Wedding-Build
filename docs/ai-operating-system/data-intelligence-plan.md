# Data intelligence plan (2026-10-21)

Chief Data Officer audit and plan, written for the owner's approval. This plan
is a proposal only: nothing has been bought, signed up for, scraped or changed
in production.

Labels used throughout:
- **[code]** means verified in the repo.
- **[terms]** means read on the provider's own page on 2026-10-21.
- **UNVERIFIED** means it couldn't be confirmed.

This is not legal advice. The attorney questions are listed in §3.

---

## 1. Current state

### What we already have (most of it is better than a typical pre-launch directory)

**Listings [code]**
- About 7.8k venues and 11.5k vendors in `src/lib/batches/`, covering all 50 states and DC on pass 1 of `scripts/coverage-plan.mjs`.
- Remaining to the doubled targets: 8,297 venues and 7,679 vendors.
- About 8.2k skipped businesses are logged with a reason (dead site 3,296, no website 2,329, and others).

**Provenance and freshness [code]**
- `source`/`source_id` are unique (0075).
- `last_verified_at`, `verified_by` and `field_sources` jsonb record who set each field and when (0099, `field-sources.ts`).
- Field cadences live in `listing-freshness.ts`.
- `listing_reports` records closed, contact, price, details, photos and take-down reports.
- The admin listing-health page and the data-audit skill act on these.

**Venue pricing structure [code, 0097]**
- `price_from`, `price_basis` (rental/package/per_person/minimum), `price_options` jsonb, `service_level`, `vendor_policy`, capacities, lodging, parking and accessibility.
- Vendors have `price_from`, `price_unit` and `price_note`, but none of the richer venue fields.

**Ingestion with sound rules [code]**
- Only the business's own website counts as a source for a field.
- The Knot, WeddingWire and Zola may be used to find names only. Descriptions are written in our own words.
- Geocoding uses the US Census geocoder plus TIGERweb, with Nominatim as a throttled fallback.
- Every write goes through `/api/batch-sync`, which cannot set `active` or `verified_*`.

**Cost estimator [code, `src/lib/estimator.ts`]**
- It covers 19 categories.
- It uses `regional_cost_data` (state × category × Simple/Classic/Luxury) wherever an admin has uploaded a CSV.
- Otherwise it uses a hardcoded national base × region multiplier (`budget-categories.ts:89`) × season (W 0.85 to Su/F 1.15) × tier (0.7/1.0/1.8).
- The range is ±15% with no real data, narrowing to ±6% when every category has real data.
- "Recompute from customer quotes" takes a trimmed mean of couples' overrides once a cell has at least 5 quotes.

**Admin [code]**
- KPI home, couples, growth (feature adoption from row counts), revenue (self-reported booked GMV), spend, leads (contact taps), listing health, cost-data coverage, errors and audit log.

### Gaps and problems, ranked

1. **The estimator's public claim doesn't match its data.**
   - `/estimate` says "built from real wedding cost data across the country" (`src/app/estimate/page.tsx:26`).
   - The fallback numbers are unsourced placeholders with no year. The only cited figure points to a spreadsheet that isn't in the repo.
   - Benchmarks have free-text `source`/`notes` only. There is no effective date, sample size, geography level, currency year or licence.
   - This is the biggest trust risk in the data layer. Fix the wording now (text-only) and fix the data later (§6).

2. **Missing from the estimate:**
   - Sales tax, venue service charge (commonly 18–25% of food and drink, UNVERIFIED as a statistic) and a contingency line. Gratuity is one flat $700 line.
   - The actual date (Saturday vs Friday, peak month, holiday weekend). Season only reaches the fallback model.

3. **No product analytics.**
   - There is no events table, page views, funnels, estimator-completion tracking, search/filter logging or listing-view counts.
   - The privacy page names Cloudflare Web Analytics (`privacy/page.tsx:175`), but `integrations.md` says it isn't connected.
   - Without this, Phase 5 dashboards have nothing to measure.

4. **Freshness is set by people only.**
   - Imports leave `last_verified_at` null, so most listings read as "unverified".
   - There's no automatic closed-business signal beyond our own website checks.

5. **Data hygiene.**
   - About 49 malformed rows in `skipped/*.tsv`, including Colorado rows with the URL in the Reason column.
   - Same-site duplicates were removed by hand (0121). There's no fuzzy name+city check at import.
   - About 3k listings use personal webmail addresses (legal-audit R5).

6. **Attributes the schema lacks:**
   - Availability or booked dates
   - Peak vs off-peak price, and food-and-drink minimum separate from rental
   - Ceremony vs reception capacity
   - Structured style tags
   - Structured catering/alcohol exclusivity
   - Curfew and noise rules, rain plan
   - Insurance requirement
   - Photo credit or licence
   - Vendor-side structured fields: packages, travel fee, team size, booking lead time

### Licensing and privacy risks found in the code (proactive flags)

- **OSM tiles in production.**
  - Leaflet loads `tile.openstreetmap.org` directly.
  - The OSM tile policy is for light use, not a commercial product's main map.
  - This needs replacing before launch traffic. See quick win Q5.
- **Spoofed Chrome User-Agent** in `scripts/verify-batches.mjs:85-100`, used to get past bot blocks.
  - It undercuts the honest "YouDoIDoBot" UA used everywhere else.
  - It is hard to defend if a business objects.
  - Recommend switching to the honest UA and treating blocked sites as "couldn't check".
- **Nominatim bulk runs.**
  - `--refine-pins` (about 2 hours of by-name lookups) likely goes beyond the public server's "no heavy or bulk use" policy.
  - Census can't look places up by name, so it can't take over these lookups. Done 2026-10-21 (Q3): each import run is capped at 500 Nominatim lookups (`--osm-limit` raises it).
- **Google and Yelp "closed" markers** are used as evidence of closure in the data-audit skill.
  - Reading a single page by hand to decide a fact is fine. Copying their data is not. Keep it to that.

---

## 2. Best external data sources

### Recommended (commercial use, storage and display allowed)

| Source | Use for us | Access | Cost | Attribution |
|---|---|---|---|---|
| **BEA Regional Price Parities** (bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area) | State and metro cost-of-living adjustment of a national baseline. 2024 data released 2026-02-19, next 2026-12-10 | Download; API needs a free key (RPP through the API UNVERIFIED) | $0 | Cite BEA |
| **BLS CPI** (bls.gov) | Inflate a study year to today's dollars, monthly | API v2, free key | $0 | "cite the Bureau of Labor Statistics" [terms] |
| **Census ACS 5-year** (api.census.gov) | County income (B19013), population (B01003), marriages in the last year (B12501, S1251) for demand and price scaling | API; a free key is now required in practice (keyless calls redirect) | $0 | "This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau." [terms] |
| **Census County Business Patterns 2023** | Supply density by county/ZIP: caterers 722320, photography studios 541921, florists 453110, other personal services 812990 (broad). Use as the denominator for our coverage (§5) | Same API | $0 | Same notice |
| **CDC/NCHS marriage rates** (cdc.gov/nchs/nvss/marriage-divorce.htm) | State demand per 1,000 people, 2000–2024. Counted by state of licence, which inflates NV and HI | XLS, yearly | $0 | Cite NCHS |
| **NOAA Climate Normals 1991–2020** (ncei.noaa.gov/products/land-based-station/us-climate-normals) | Per-venue monthly average temperature, rainfall and rain days. Static until the 2031–40 set | Keyless Access Data Service (probed, works) or bulk CSV | $0 | Credit NOAA NCEI (formal terms UNVERIFIED; standard federal) |
| **Sunset / golden hour** | Computed locally with the public-domain NOAA solar algorithm, or `suncalc` (BSD-2, UNVERIFIED) | In code | $0 | none |
| **US holidays** | Computed from 5 U.S.C. 6103 rules. Long weekends drive date demand | In code | $0 | none |
| **Overture Maps Places** (docs.overturemaps.org/guides/places) | Discovering businesses to research; open/closed cross-check using `confidence` and `operating_status`. Monthly. The Sept 2026 release replaced `categories` with `taxonomy`/`basic_category` | S3/Azure with no account; DuckDB | $0 | Per-source licences (CDLA-P 2.0, Apache 2.0 for Foursquare rows, CC0); include Foursquare NOTICE |
| **Foursquare OS Places** (huggingface.co/datasets/foursquare/fsq-os-places) | `date_closed` and `date_refreshed` closure signal; discovery | Gated HF download (needs an HF account, owner step); about 263 GB Parquet, query remotely with DuckDB | $0 | Apache 2.0 notice |
| **US Census Geocoder** (geocoding.geo.census.gov) | Permanent geocodes (already the primary). Use the 10k batch endpoint | Free | $0 | Explicit public-domain statement UNVERIFIED |
| **Our own HTTP/DNS checks** | Dead sites, parked domains, redirects | Already partly built | $0 | none |
| **Google Search Console API** | Our own SEO queries and pages | Free | $0 | none |

### Possible later (paid or restricted)

| Source | What it would add | Blocker |
|---|---|---|
| **The Wedding Report** (wedding.report) | The only county/ZIP average and median wedding spend we found, with 20+ years of history | Terms bar SaaS or public dashboard use and AI grounding without a Commercial Licence (price: contact sales). The $250/yr "Data Pro" plan is internal use only |
| **Google Place Details (New)** | Best open/closed signal, live | Must not store content beyond `place_id`; lat/lng cache limit (30 days in older terms); results shown on a map must be a Google Map. Free cap 10k/mo Essentials, then $5 per 1k [terms]. Only acceptable pattern: store `place_id`, call live to flag a row for a person to review, store nothing else. Owner or attorney call |
| **Data Axle** | Paid business-verification licence | Contact sales; storage terms set by contract |
| **Google Trends API (alpha)** | Search interest by region | Application-only alpha, no terms published. Never scrape trends.google.com |
| **Visual Crossing** | Historical daily weather for a specific date | Free 30k records/mo allows commercial use, needs an attribution link; NOAA normals cover most needs |

### Rejected

- **The Knot / WeddingWire:** §7 non-commercial only; §10 no scraping or mass manual collection [terms].
- **Zola:** §2 no reproducing or displaying; §3 no scraping and no use "competitive to Zola" [terms]. We are a competitor.
- **Yelp Places API:** from $229/mo, 24-hour cache limit, Yelp branding required [terms].
- **Foursquare Places *API*:** licence §2.5.4 bans using the data to contact businesses, which conflicts with claim outreach. Use the open dataset instead.
- **OSM data merged into our rows:** ODbL share-alike risk. OpenCorporates has the same problem.
- **Open-Meteo free tier:** non-commercial only.
- **Common Crawl:** crawled content stays under each site owner's terms; indemnity required.
- **Joy:** reuses others' figures.

---

## 3. Legal and licensing considerations

**Rules to adopt (new)**
1. Every external dataset gets a row in a `data_sources` registry: licence, terms URL, date the terms were checked, attribution text, and what's allowed (store, display, derive).
2. Nothing is imported without that row.
3. Attribution renders from that registry, in the estimator footer and on an `/about/data` page.
4. Census notice is mandatory once Census data ships.

**What we can do with The Knot and Zola figures**
- Use them as one comparison line ("The Knot's 2026 study reports a $34,200 national average, n=10,474"), and only after an attorney says yes.
- Never store their tables, and never feed their tables to Wren.
- The Wedding Report's terms explicitly bar AI grounding and SaaS use. Assume the same for the others until we're told otherwise.

**Questions for the attorney queue (`docs/legal-audit.md` §11)**
- (a) May we quote a single attributed figure from The Knot or Zola in the product?
- (b) The Google `place_id` live-check pattern.
- (c) Is mixing Overture or Foursquare-open rows with our hand-written rows fine? Expected yes; both licences are permissive.

**Prices**
- A price we show comes from the business's own site with a date, from a claimed vendor, or from a couple's own quote.
- Label each one ("Published on their site, checked Oct 2026", "Estimate").
- Never present an AI-written or modelled figure as a vendor's price.
- This builds on legal-audit R5 (fixed 2026-10-21).

**Couples' quotes used for benchmarks**
- These are couples' data. The privacy policy needs to say quotes are used in aggregate (minimum 5 per cell, already enforced in code) before "Wren customer data" rows are shown publicly.
- Check `docs/legal.md` before shipping.

---

## 4. Missing data and product opportunities

Ranked by stress reduced per unit of effort.

1. **An honest estimate, line by line.**
   - Show tax, service charge, gratuity and contingency as their own lines, with the source shown on each line.
   - The biggest budget shock for couples is the 20–30% added on top of the quoted price (venue service charge + tax + tips). Almost no estimator shows it up front. (That this is the biggest shock is a hypothesis, not researched.)
2. **Date intelligence for a venue** (NOAA normals + sunset + holidays):
   - "Oct 17, 2027 at this venue: average high 79°F, 4 rain days that month, sunset 6:52, golden hour 6:15."
   - Flags for holiday weekends and Saturday vs Friday cost.
   - It's all public-domain data and computed in code. It is distinctive and cheap.
3. **Price transparency on listings.**
   - Make `price_from` + `price_basis` + checked-date the main fact on venue and vendor cards.
   - Add the missing structured fields to vendors (package, travel fee, minimum).
   - Rank priced listings first only when the couple filters by budget.
4. **Rain-plan and logistics fields** for venues: indoor backup, curfew, catering/alcohol exclusivity, food-and-drink minimum. These come up in real decisions and are mostly free text today.
5. **Guest-count consequences.** "Each 10 guests ≈ $X at your tier" is already computable from the per-guest lines. Show it on the guest list.
6. **Market context** (later, needs data volume): "Saturdays in June at Austin venues on Wren start from $X (n venues with published prices)". Built only from our own dated price observations.

---

## 5. Recommended architecture

### 5.1 Cost intelligence (three new tables, additive; `regional_cost_data` stays until migrated)

```
data_sources        id, name, url, terms_url, license, terms_checked_at,
                    attribution_text, may_store, may_display, may_derive, notes

cost_benchmarks     id, source_id → data_sources, category_key (or 'total'),
                    geo_level (national|region|state|metro|county|zip), geo_code,
                    metric (mean|median|p25|p75|min|max|multiplier|rate),
                    tier (null|Simple|Classic|Luxury), per_guest bool,
                    amount, currency_year, effective_date, sample_size,
                    methodology, confidence (high|med|low), superseded_at

price_observations  id, listing_kind (venue|vendor), listing_id, category_key,
                    amount, basis (rental|package|per_person|minimum|hourly),
                    guest_count, day_type (sat|fri|sun|weekday), month,
                    origin (published_site|vendor_claim|couple_quote|couple_paid),
                    observed_at, source_url, wedding_id null (quotes only)
```

**How an estimate is built.** Each line keeps its own label, so the UI can say exactly what it is:

1. **National baseline** per category, from our own documented methodology. It has a `methodology` row and is inflated with CPI to the current year.
2. **Local adjustment:** BEA RPP for state or metro, optionally adjusted by ACS county income. Each is stored as a `multiplier` benchmark with its source.
3. **Tier, guests, date:** the tier multiplier. Day-type and month multipliers start as labelled assumptions and are replaced by measured ones as `price_observations` grow.
4. **Replace with local observations** when a geo × category cell has at least N dated observations (start with 5, already the code's rule), using the median rather than the mean.
5. **Couple's own numbers** override everything: quote, then contract, then paid. They are labelled as such.
6. **Add-ons as their own lines:**
   - Sales tax: state rate as a labelled estimate, applied only to taxable categories.
   - Service charge: a % of food and drink, taken from the venue's `price_options` when published, otherwise an assumption range.
   - Gratuity: guidance ranges we write ourselves.
   - Contingency: default 5–10%, set by the couple.

**What each line shows the couple:** one of "Estimate", "Local published prices (n=…)", "Your quote" or "Paid", plus the source and as-of date.

**The range reflects how much evidence there is**, not a fixed ±%:
- Measured spread (p25–p75) where there are observations.
- A wider band for assumption-only lines.

**Accuracy loop:**
- Snapshot the estimate when a couple first sees it (`estimate_snapshots`: wedding_id, inputs, per-line amounts, created_at).
- Compare it later with their quotes and paid amounts.
- That error by category and state becomes the admin "estimate accuracy" chart (§5.3).

**Where it runs:** the existing routine machine (`npm run import:*` pattern), writing through a secret-protected endpoint. Never in the Worker: the 10 ms CPU limit (error 1102) applies.

### 5.2 Listings data

- **Matching key.** Add an `external_ids` jsonb on venues and vendors (`{overture: …, fsq: …, google_place_id: …}`). Match on normalised website domain, then phone, then name + 150 m distance.
- **Monthly closure sweep** (routine machine):
  - Our HTTP/DNS check.
  - Overture `operating_status`/`confidence` and FSQ `date_closed`/`date_refreshed` for matched rows.
  - This writes a `signals` jsonb plus `signal_checked_at`. It never hides a listing automatically: two independent closure signals put the listing in the admin "needs you" queue.
  - Successful automated checks stamp `field_sources.*.by = 'check'`, which is separate from a person's `last_verified_at`. "Unverified" then stops meaning "never looked at".
- **Discovery queue:**
  - Overture/FSQ businesses in wedding categories, within coverage-plan metros, that aren't yet in our data or the skipped TSVs, go into `listing_leads` (already exists, 0102).
  - The batch researchers work from that list instead of directory sites.
  - Facts still come only from the business's own site, so the rule from `/add-venues` is unchanged.
- **Dedupe at import:** fuzzy name + city + 150 m check in `import-batches.mjs`, reusing the data-audit logic.
- **Vendor-supplied data first:** the claim form (already has the listing reader) becomes the way to fill the new structured fields. Claimed values carry `by: 'vendor'` and win over ours.

### 5.3 Analytics (needed before most dashboards)

- An `events` table with about 15 server-side events, as already proposed in `docs/admin-blueprint.md` #12:
  - signup, wedding_created, estimate_viewed, estimate_applied, listing_viewed, listing_contact, inquiry_sent, inquiry_responded, claim_started, claim_approved, site_published, search_performed (filters, results_count), and others.
- Write server-side from existing actions, with no third-party tracker.
- Each event records `is_test`.
- Connect Cloudflare Web Analytics for page traffic. This also makes the privacy page true.

---

## 6. Quick wins (≤1 PR each, $0, no new services)

| # | What | Why | Type |
|---|---|---|---|
| Q1 (wording done 2026-10-21) | Change the `/estimate` wording to match reality ("estimates from national averages adjusted for your state; lines marked ✓ use sourced local data"), and show the source on each sourced line | Removes the main overclaim | Text-only, ship directly |
| Q2 | Add tax, venue service charge and contingency lines to the estimator (assumption ranges, labelled) | Biggest planning shock surfaced up front | Logic + UI; preview first |
| Q3 | Switch `verify-batches.mjs` to the honest UA; cap Nominatim lookups per import run (done 2026-10-21) | Removes two terms/ethics risks | Script-only, ship directly |
| Q4 (done 2026-10-21: 46 Colorado rows) | Fix the about 49 malformed `skipped/*.tsv` rows and add a column-count check to `npm run coverage` | Clean coverage numbers | Batch-file hygiene |
| Q5 | Plan the map-tile move off `tile.openstreetmap.org`. Options to price: self-hosted Protomaps PMTiles on Cloudflare R2, MapTiler, Stadia (all UNVERIFIED, quotes needed) | Policy and reliability risk at launch | Research, then owner decision |
| Q6 | Fix the privacy-page Cloudflare Web Analytics claim, or connect it (owner step) | Policy must match code (legal-audit R3) | Text or owner action |
| Q7 | Add a `data_sources` registry table and an `/about/data` attribution page | Foundation for every later import | Migration + page |

---

## 7. Medium term (1–3 months, still $0 in fees)

1. **Cost benchmark tables** (§5.1) plus a CPI/RPP loader. Migrate `regional_cost_data` rows into `cost_benchmarks`. Write and commit the national baseline methodology (the spreadsheet the code cites).
2. **`price_observations`**, backfilled from `price_from`/`price_options` already on listings (dated by `field_sources`) and from couples' overrides.
3. **Events table and estimate snapshots** (§5.3), then the first admin dashboards:
   - **Coverage vs supply:** our listings ÷ CBP establishments by county and category. This is the "where to research next" map and replaces guesswork in `coverage-plan.mjs`.
   - **Claimed vs unclaimed, missing price, missing contact, freshness** by state.
   - **Funnel:** visit → signup → wedding → estimate → inquiry → response.
   - **Estimate accuracy** by category once snapshots meet quotes.
4. **Date intelligence card** on venue pages and the itinerary: NOAA normals mapped to the nearest station once, stored per venue; sunset computed; holidays computed.
5. **Monthly closure sweep and discovery queue** (§5.2), using Overture first (no account). FSQ OS needs the owner to accept terms on Hugging Face.
6. **Vendor structured fields** (package, travel fee, minimum, lead time) in the claim form.

## 8. Long term (competitive advantages)

- **The price index we own.** Dated, sourced `price_observations` from published prices, claimed vendors and couples' quotes/paid amounts, by metro, category and day type. Only a planning tool with real couples' quotes can build this. Neither The Knot nor Zola publishes vendor-level data from quotes; that is a hypothesis, check `docs/competitors.md`. It is also the asset that makes later vendor monetisation credible.
- **A measured estimator.** Publish our own error rate ("our estimates were within X% of couples' final spend, n=…") once the data supports it.
- **Supply–demand map** for the marketplace: ACS marriages + CDC rates + our signups vs listings per county. It shows where vendors are scarce and where to recruit.
- **AI reports** (§9), all from our own tables.
- **A licensed local spend layer** (The Wedding Report Commercial Licence) only if couples' quotes show state-level benchmarks are too coarse. Revisit with real data.

## 9. Proactive AI reports (scheduled, via the existing routine pattern; drafts to the admin)

- **Weekly data-health:**
  - New closure signals
  - Dead sites
  - Listings stale beyond their cadence
  - Duplicates found
  - Malformed batch rows
- **Monthly coverage:**
  - Counties with the biggest gap between CBP supply and our listings, weighted by ACS marriages.
  - Hand the top 10 metros to `/add-vendors` / `/add-venues`.
- **Monthly estimator drift:** categories where couples' quotes differ from the estimate by more than 20% with n ≥ 5. The proposed new benchmark goes to the owner for approval and is never applied automatically.
- **Quarterly source check:** re-read each `data_sources.terms_url`; flag any change in terms or a new release (BEA December, CDC yearly, Overture monthly, Census CBP).

Fold these into `/data-refresh` and `/weekly-review` rather than adding new skills.

---

## 10. Complexity and operating cost

| Item | Effort | Ongoing cost |
|---|---|---|
| Q1–Q4, Q6 | S (a day or less each) | $0 |
| Q7 registry + attribution page | S | $0 |
| Cost benchmark tables + CPI/RPP loader + methodology | M (about 1 week) | $0; Census/BEA/BLS keys are free (owner requests them) |
| Price observations + backfill | M | Small Supabase storage (well under 1 GB at this scale, estimate) |
| Events + snapshots + 4 dashboards | M–L (1–2 weeks) | $0; watch Supabase row growth |
| Date intelligence (NOAA/sun/holidays) | S–M | $0 |
| Overture closure sweep + discovery | M | $0 fees; runs on the routine machine. Use remote DuckDB queries so we don't download the whole dataset |
| Map tiles off OSM | S–M | UNVERIFIED: R2 free tier may cover PMTiles; commercial tile hosts charge by use. Needs quotes |
| Google `place_id` live checks (optional) | S | $0 within 10k/mo Essentials; needs attorney sign-off |
| The Wedding Report commercial licence (optional) | M | Contact sales |

---

## 11. Prioritised roadmap

Order is by impact ÷ (cost + risk + effort), with product trust first, per the
CLAUDE.md priorities.

1. **Now (this week):** Q1 estimator wording · Q3 honest UA / Census batch · Q4 skipped-file hygiene · Q6 analytics claim.
2. **Next:** Q2 tax, service charge and contingency lines (preview first) · Q7 `data_sources` registry.
3. **Then:** events table + estimate snapshots (no data can be measured until this exists).
4. **Then:** `cost_benchmarks` + CPI/RPP loader + written methodology, replacing the placeholder base.
5. **Then:** coverage-vs-CBP dashboard → drives the remaining 16k-listing research.
6. **Then:** date intelligence card.
7. **Then:** Overture closure sweep + discovery queue.
8. **Before launch traffic:** map-tile move (Q5).
9. **After outside users:** price index, accuracy publishing, supply–demand map, licensed local data if justified.

### Owner decisions needed

- **Approve the quick wins**, in particular Q2, which is a UI change and needs a preview first.
- **Request free API keys** when step 4 starts: Census (api.census.gov/data/key_signup.html) and BEA (apps.bea.gov/API/signup).
- **Hugging Face account** to accept the FSQ OS Places terms (optional; Overture alone is enough to start).
- **Attorney questions** (§3) added to the legal-audit queue.
- **Map tiles:** choose an option once Q5 has quotes.
