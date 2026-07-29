# Roadmap / backlog

A running list of what's left, split by whether it costs money. Nothing in
the "needs payment" section gets built until we're ready to spend and launch
for real. Update this file as items are picked up or new ideas come up.

## Free to build now

- [ ] **Map view for Venues** (Zillow-style): plot the ~370 seeded venues as
      pins on a US map using Leaflet + OpenStreetMap tiles (no API key, no
      cost). Filterable by state/city/venue type, same data we already have.
      Needs adding approximate lat/lng per venue (derived from known
      city/state coordinates).
- [ ] Bump city coverage from 1 venue/city to top-5/city for the 255 cities
      we already seeded (~1,275 placeholder venues instead of 255) — same
      generated-content approach as the state/city seeds, no new
      infrastructure.
- [ ] General polish pass: tighten up Budget, Guests & RSVP, and Vendors
      modules (edge cases, validation, empty/loading states we haven't
      revisited since the Step 4 pass).
- [ ] Mobile responsiveness spot-check on the new Venues filters (state/city
      dropdowns, image cards) — added after the original mobile pass.

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
