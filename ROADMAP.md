# Roadmap / backlog

A running list of what's left, split by whether it costs money. Nothing in
the "needs payment" section gets built until we're ready to spend and launch
for real. Update this file as items are picked up or new ideas come up.

## Free to build now

- [ ] **Public guest-facing wedding site**: a page invited guests can
      actually visit themselves (no login) to RSVP and view the gift
      registry, instead of the couple manually entering RSVPs on their
      behalf. No new cost, but a real architecture addition — needs a
      shareable link/slug per wedding (or per-guest), and public
      read/write access scoped narrowly (RLS policies that don't expose
      the couple's full account). Currently the Guests page, gift
      registry, and Attire shortlist are all couple-only.
- [ ] Dashboard "at a glance" summary: pull confirmed headcount, budget
      spent vs. estimated, and shortlist counts (venues/vendors/attire)
      onto the Dashboard so the couple doesn't have to click into every
      module to see status.
- [ ] CSV export to match the new CSV import — download the guest list
      (and/or budget line items) as a CSV for printing or sharing with a
      caterer/venue.
- [ ] Bump city coverage from 1 venue/vendor per city to top-5/city for
      the 255 cities we already seeded — same generated-content approach
      as the state/city seeds, no new infrastructure.
- [ ] Lightweight search box (by name) across Venues/Vendors/Attire, now
      that each catalog has grown past what chip filters alone can
      quickly narrow.
- [ ] General polish pass: tighten up Budget and Guests & RSVP modules
      (edge cases, validation, empty/loading states we haven't revisited
      since the Step 4 pass).
- [ ] Mobile responsiveness spot-check on the newer modules (Venues/
      Vendors map view + state/city filters, Attire cards, CSV import
      form) — added after the original mobile pass.

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
