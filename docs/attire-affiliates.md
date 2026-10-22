# Attire affiliates: research and pilot plan (2026-10-22)

Status: **plan only, nothing built.** Starting affiliate revenue is the owner's
call (`docs/monetization.md` lists it as legitimate but not yet sequenced).
Every rate below is tagged CONFIRMED (read on the brand's or network's own
page) or UNVERIFIED (search summary, aggregator, or old article). Re-check
before relying on any of it. Not legal advice; the disclosure and cookie
questions go to the attorney list in `docs/legal-audit.md`.

## What already exists (reuse, don't rebuild)

- `attire_items` (`0015`, `0080`): name, category, designer, `image_urls`,
  `retailer_url`, `vendor_id` (boutiques on the vendor side), buy/rent price,
  silhouette/neckline/sleeves/length/fabric/colors/size_range, badge,
  `is_featured`, `is_active`. Public read, admin write.
- `attire_shortlist` (couple favourites) and `attire_party_members` (wedding
  party board, status To order → Fitted) plus the party share link.
- `/attire` browser with filters and quick view; `/admin/attire` editor.
- Budget page reads `price_from`; `/data-refresh` monthly already HEADs
  `retailer_url`s.

## Gaps for a pilot (small, one PR)

1. **`attire_merchants` table**: name, network, program status (applied /
   approved / rejected / paused), commission note, image-rights note, contact,
   approved date. `attire_items.merchant_id` references it. Admin-only.
2. **`affiliate_url` separate from `retailer_url`**, so a dropped program falls
   back to a plain link without editing every item.
3. **`price_checked_at`** on items; show "Price as of <date>" and never present
   a stored price as live.
4. **Click-out route** (`/go/attire/<id>`): logs item, merchant, wedding (if
   signed in), then redirects to the affiliate link. Gives real clicks to
   compare with network-reported sales. Server-side only; no network secrets
   on the client.
5. **Disclosure** directly above the product grid on `/attire`, the quick view,
   and the party share page. Draft: "Some links here are affiliate links. If
   you buy through them, You Do, I Do may earn a commission, at no extra cost
   to you." Plus a Terms paragraph and a privacy-policy line on the retailer's
   tracking cookies.
6. **Categories** to add when there's product for them: mother of the
   bride/groom, flower girl, shoes, veils and accessories. One line each in
   `ATTIRE_CATEGORIES` / `ATTIRE_CATEGORY_META`.

Not now: feed importer, sponsored placements, revenue dashboard, direct
checkout. Build the importer only once an approved merchant offers a feed and
hand-curation becomes the bottleneck.

## Ranked partners

| # | Brand | Buy/rent | Network | Terms | Status |
|---|---|---|---|---|---|
| 1 | Azazie | Buy: bridesmaid, formal | Not found | 10%, 90-day cookie, datafeed, open to all | UNVERIFIED |
| 2 | Revelry | Buy: bridesmaid, mother of bride | Awin | 5%, 60 or 120 days (page contradicts itself) | CONFIRMED |
| 3 | Brilliant Earth | Buy: rings, bands | Impact | 5% bridal, 7% fine jewelry, 30 days, $500 cap per order | CONFIRMED |
| 4 | The Black Tux | Rent: suits, tux | Impact (via Acceleration Partners) | Up to $10 per order, 30 days (2023) | UNVERIFIED |
| 5 | Etsy | Buy: veils, accessories | Moving from Awin to Rakuten | About 4%, 7 or 30 days | UNVERIFIED |
| 6 | Amazon Associates | Buy | Own | Not read | Hold, see below |

Sources: azazie.com/affiliate_program; ui.awin.com/merchant-profile/51597;
brilliantearth.com/affiliates; accelerationpartners.com (2023-03-17 post);
help.etsy.com article 360000335987.

**Lower priority:**
- **Generation Tux:** a planner referral program at generationtux.com/bridal-partners. The Impact listing is unverified.
- **Friar Tux:** Awin, but showrooms are only in California and Nevada.
- **David's Bridal:** has an ambassador program. Aggregator rates conflict.
- **Birdy Grey:** no affiliate program found. Contact partnerships@birdygrey.com.
- **Lulus, BHLDN, Nordstrom, Rent the Runway, Blue Nile, Quince, Baltic Born:** aggregator figures only, and they conflict. Baltic Born reportedly rejects low-traffic sites.
- **Skip Brideside:** reported closed.
- **No program found:** Menguin, Kennedy Blue, Lovely Bride, Grace Loves Lace.

**Amazon: hold until there's traffic.** It needs 3 qualifying sales within 180 days. Its policies forbid storing or caching images, and prices must come from its API with a timestamp. Exact disclosure wording is required. All of that clashes with a curated page that stores its own photos.

## Networks (what a new publisher needs)

- **Awin** (now includes ShareASale): a full application with your URLs. A small refundable deposit may apply. Review takes about 2 working days, then each brand approves you separately.
- **Impact:** free. Needs one verified property. Review takes about 2–3 business days, then each brand approves you separately.
- **Rakuten:** free. Needs a live site with unique content and tax info. It "may temporarily reject very new" publishers.
- **CJ:** free. Needs an active site and a 250+ character profile. Content Certification wants 10K+ monthly pageviews.
- **Shopify Collabs:** creator-oriented, with 1,000+ followers required. Poor fit.

Approval for a site with no traffic is unknown; only applying will show.
Brands with open programs (Azazie, Revelry, Brilliant Earth) are the likeliest yes.

## Images

Store or show a merchant's photos only once their program terms or a written
OK allow it. None of the top three published image terms that we could find.
Ask on approval ("may we display product images from your feed on our site?")
and record the answer on the merchant row.

## Pilot plan

1. **Owner:** decide to start affiliate revenue (log it in `docs/ai-operating-system/decisions.md`).
2. **Build the gap PR** (merchants table, `affiliate_url`, `price_checked_at`, click-out route, disclosure), with a preview first.
3. **Owner:** create Awin and Impact publisher accounts, then apply to Revelry, Brilliant Earth, The Black Tux and Azazie. Business details and tax forms are the owner's to enter.
4. **On approval:** hand-curate about 20–30 items per category from approved links and images. Set `price_checked_at`, and let `/data-refresh` re-check monthly.
5. **Review after 60 days:** clicks per item (ours) against sales (network-reported, labelled as such). Expand categories or build a feed importer only if a merchant's catalog justifies it.

## Open questions

- Which network Azazie uses, and its image terms.
- Whether The Black Tux and Generation Tux are still open on Impact.
- Counsel: do click-out affiliate cookies count as "sharing" under CCPA/CPRA?
  Should we honour Global Privacy Control on the click-out?
