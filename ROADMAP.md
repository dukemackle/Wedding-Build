# Roadmap / backlog

A running list of what's left, split by whether it costs money. Nothing in
the "needs payment" section gets built until we're ready to spend and launch
for real. Update this file as items are picked up or new ideas come up.

## Free to build now

- [ ] **Bulk RSVP invite emails**: let the couple pick guests from their
      list and have the app email each one their public RSVP link,
      instead of the couple copy-pasting the link into individual
      texts/emails themselves. Resend is already wired up (it sends
      vendor inquiry emails today), so this reuses existing
      infrastructure — no new payment needed, though deliverability
      rides on Resend's shared sender until a real domain is verified.

## Monetization strategy

Not a build item, just the plan so it's written down. The Knot and Zola
both give couples free tools and make money on the vendor/commerce side,
not by charging couples — we should follow the same shape:

1. **Vendor lead-gen (primary, build first).** The `vendor_inquiries`
   table already tracks every quote request sent to a vendor — that's
   the exact mechanic The Knot charges vendors for. Once vendors are
   real (via the Google Places item below), charge them a subscription
   or per-lead fee to be listed / receive inquiries. Needs Stripe +
   real vendors, in that order.
2. **Registry affiliate commissions (secondary, later).** Zola-style: a
   cut of gift purchases made through the registry. Bigger lift (real
   e-commerce/affiliate integration on top of what's today just a link
   list), worth revisiting once vendor lead-gen is proven out.
3. **Not doing:** couple-facing subscriptions/paywalls. Free access for
   couples is what makes the vendor side valuable in the first place —
   charging couples would undercut the whole flywheel.

## Needs payment before we build it

- [ ] **Real venues via Google Places API** — live search by
      city/address, real names/addresses, and a real `website` link per
      venue. Requires a Google Cloud project with billing enabled and the
      Places API turned on (usage-based cost past a small free credit).
      Recommended over Yelp because Google's Place Details actually returns
      the business's own website; Yelp mostly links back to the Yelp page.
  - Architecture note: this sits *alongside* the placeholder `venues` table,
    not a replacement — shortlisting a live result needs different storage
    (place ID, live address/website) than our fictional seed rows.
- [ ] **Real per-venue photos** — only possible once venues are real (via
      the Places API above); Place Details includes photo references.
- [ ] **Stripe integration** (from the original build brief): paid cost
      report, vendor commissions. Needs a Stripe account and takes
      transaction fees — explicitly called out as a later phase in the
      original spec, not build until we're closer to launch.
- [ ] **Nicer map styling via Mapbox** (optional upgrade path from the free
      Leaflet map above) — needs a Mapbox account + access token; free tier
      is generous but it's an external dependency to set up.
- [ ] Custom production domain (currently on the default Vercel domain).

## Already shipped

- Scaffold, Supabase auth + schema, all 5 modules (Dashboard, Budget,
  Guests & RSVP, Venues, Vendors), Step 4 polish (loading/empty states,
  mobile responsiveness)
- Venues: state field + filter (51 states/DC), city field + cascading city
  filter (255 cities), generic type-based SVG illustrations on venue cards
- Venues + Vendors: map view (Leaflet + OpenStreetMap, free/no API key),
  lat/lng per row with per-row jitter so co-located pins don't stack;
  Vendors also got the same state/city fields + cascading filters as
  Venues (useful for finding vendors near a couple's venue)
- Guests page: couple-managed gift registry (registry links and/or a cash
  fund note, shown alongside the guest list) — couple-only for now, see
  the public guest-facing site item above for the guest-visible version
- Guests page: CSV import (papaparse-based, quoted-comma-safe) with a
  downloadable template and imported/skipped row counts
- Attire module: browsable catalog (48 placeholder items across Wedding
  Dress, Bridesmaid Dress, Groom Attire, Groomsmen Attire, Ring - Her,
  Ring - Him) with category/price-tier/Buy-or-Rent filters and a
  shortlist with notes — no real purchasing yet (needs Stripe)
- Dashboard "at a glance" summary: confirmed headcount, budget total vs.
  categories with a real quote entered, and shortlist/inquiry counts
  (venues, vendors, attire) with quick links into each module
- Guests page: CSV export (download the current guest list in the same
  format the CSV import expects)
- Lightweight search box (by name) added to Venues, Vendors, and Attire
  catalogs, alongside the existing chip filters
- **Public guest-facing wedding site**: the couple can turn on a
  shareable link (`/w/your-slug`) from the Guests page with one click.
  Invited guests visit it with no login, see the couple's names/date and
  gift registry, and submit their own RSVP. Submissions land in a
  separate `rsvp_submissions` table (not the real `guests` table), and
  the couple reviews each one on the Guests page — "Add to guest list"
  merges it in, "Dismiss" discards it. A wedding is only ever visible
  publicly through the narrow `public_weddings` view, so nothing beyond
  partner names/date/region and the registry is ever exposed.
- Bumped city coverage from 1 to 5 venues/vendors per city across all 255
  already-seeded cities (1,020 new venues, 1,020 new vendors), cycling
  through the venue types/vendor categories not already used in each city
  so there's real variety to browse, not just a single placeholder result.
- Mobile polish: added a `loading.tsx` skeleton to the Attire page (the
  one module that was missing one), and fixed guest rows and pending-RSVP
  rows on the Guests page wrapping guest names awkwardly on narrow
  screens — they now stack the name/status and the action links instead
  of squeezing them side by side.
- Guest priority tiers: each guest can be flagged Must Invite / Would
  Like to Invite / If There's Room, with colored badges matching the
  existing RSVP status badges, a dedicated filter row, and a running
  cumulative headcount ("Must Invite: X → incl. Would Like: Y → incl. If
  There's Room: Z") so a couple can see how deep into the list they can
  go before hitting their venue's capacity. Supported in the CSV
  import/export and the manual add/edit form too.
