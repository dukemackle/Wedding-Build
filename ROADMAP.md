# Roadmap / backlog

A running list of what's left, split by whether it costs money. Nothing in
the "needs payment" section gets built until we're ready to spend and launch
for real. Update this file as items are picked up or new ideas come up.

## Free to build now

Nothing queued right now — see "Already shipped" below for the latest
batch. Add new ideas here as they come up.

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
- [ ] **Add-to-cart + checkout for Attire (and eventually Venues/Vendor
      deposits)**: real purchasing on top of the favorites/shortlist
      couples already build. This is the "buying things" half of the
      Stripe item above — needs a Stripe account, a decision on who
      actually gets paid (a real seller behind each Attire item, since
      today's catalog is placeholder data with no real business on the
      other end), and webhook handling for order confirmation. Bigger
      than a typical "flip a flag" payment feature; scope it properly
      once we're ready to spend and pick real sellers/vendors.
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
- Bulk RSVP invite emails: guests can now have an email on file, and the
  couple can select any number of them on the Guests page and send each
  one their public RSVP link in one batch (reuses the Resend integration
  already wired up for vendor inquiries). Tracks when each guest was last
  invited so already-invited guests are visible and safe to skip or
  re-send. Only works once the guest site (public_slug) is turned on.
- **Heart/favorites for Venues and Vendors**: hearting a venue is the
  same mechanism it already had (renamed "shortlist" to "favorites" in
  the UI), and Vendors got the same capability brand new — a new
  `vendor_favorites` table (mirrors `venue_shortlist`) so a vendor can be
  hearted for later without having sent an inquiry yet. Both show a
  "Your favorites" section with per-item notes.
- **Wedding weekend itinerary**: a new Itinerary page where the couple
  clicks a day on a calendar and builds a schedule for it (rehearsal
  dinner, ceremony, reception, day-after brunch, whatever the weekend
  needs) — title, time range, location, notes per event. The actual
  wedding day is highlighted on the calendar. Once the guest site is
  turned on, guests see the same calendar (read-only) on the public RSVP
  page, so they don't need to text the couple asking what time things
  start. RLS mirrors the registry: owner-only read/write, plus a narrow
  public-read policy gated on the wedding having a `public_slug`.
- **Redesigned visual style**: true white background with soft, fixed,
  colorful gradient shapes behind all content (emerald/gold/blush), deep
  jewel-tone emerald + gold accent colors, cards separated purely by
  soft shadow instead of visible borders, and a larger corner radius
  throughout. Retheme only, driven entirely by the six shared color
  tokens in `globals.css` — no component markup touched.
- **Budget: attach what you actually purchased from**: each budget line
  item (venue, catering, photography, etc.) can now have a free-text
  "Purchased from" field alongside the actual dollar amount, so the
  couple can record e.g. "Cedar Hollow Barn" on the venue line. The
  input suggests names pulled from whatever the couple has already
  favorited (venues, vendors) or booked (vendor inquiries marked
  "Booked"), matched to the right budget category.
- **Contacts page**: a new page consolidating everyone the couple might
  need to reach — every favorited or inquired-with vendor (deduped,
  with a mailto link from the catalog and an editable phone number),
  plus any favorited venue (with an editable contact email and phone,
  since venues don't have catalog contact info the way vendors do).
  Each vendor also shows its inquiry status (sent/responded/booked/
  declined) if one exists. Links out to Guests for guest contacts
  rather than duplicating that list.
- **Custom budget items**: a new "Additional items" section on the
  Budget page where the couple can add and delete freeform line items
  (name, amount, optional "purchased from") for costs that don't fit
  the 12 preset categories — wedding bands, a photo booth, welcome
  bags, whatever comes up. The 12 preset categories stay as they were
  (driven by the region/season/style/guest-count estimate engine, not
  simple rows, so they aren't deletable the same way), but custom
  items count toward the grand total on both the Budget page and the
  Dashboard summary.
- **Budget: who paid for it**: an optional "Paid by" field on every
  budget line — both the 12 preset categories and custom items — since
  wedding costs are commonly split across family members (bride's
  parents, groom's parents, the couple, etc.). Free text rather than a
  fixed list, with autocomplete suggestions drawn from payer names
  already entered elsewhere in the wedding's own budget. A new "Who's
  paying" summary on the Budget page totals what each payer is
  covering, shown once at least one item has a payer assigned.
- **Collapsible filters**: Venues, Vendors, Attire, and Guests had
  grown several stacked rows of filter chips/selects that ate up space
  before any results were visible. All four now hide their filter
  controls behind a single "Filters" button (showing a count badge
  when filters are active), collapsed by default. Search and the
  view toggle (where present) stay visible since they aren't filters.
- **Venues: Zillow-style map layout**: replaced the List view/Map view
  toggle with both shown at once — a scrollable list of venue cards
  alongside a sticky map, side by side on wider screens. On narrow
  screens they stack with the map first, above the list. Hovering a
  venue card highlights its pin on the map and vice versa.
- **Guestbook**: guests can now attach a photo and a public well-wish
  message when they RSVP (kept separate from the existing private
  notes field, which only the couple sees). Photos upload to a new
  Supabase Storage bucket. Like every other RSVP field, a photo/message
  only becomes visible on the public site once the couple approves the
  submission onto the real guest list — from there it shows in a new
  "Guestbook" section on the guest site, with a per-guest "hide from
  site" toggle on the couple's Guests page (in a dedicated Guestbook
  feed) if something needs to come back down. Guest photos also show
  as a small avatar next to their name on the Guests page.
- **Guest wall**: a Partiful-style "N people are going" row of guest
  avatars near the top of the public wedding site, above the RSVP
  form, for a bit of social proof before a guest even RSVPs. Shows
  every confirmed guest (photo if they've added one via the guestbook,
  otherwise an initial-letter avatar), gated by the same public-site
  opt-in as everything else on the guest site.
- **Couple's hero photo**: a real photo of the couple (not a
  placeholder illustration), uploaded from the Dashboard and shown as
  a circular portrait at the top of the public wedding site. Its own
  owner-only Storage bucket (unlike the guestbook's, which anyone with
  the invite link can add to) — only the couple can set or replace it.
- **Scroll-in animations**: each section of the public wedding site
  (hero, guest wall, RSVP, guestbook, itinerary, registry) now fades
  and slides in the first time it scrolls into view, via a small
  reusable `FadeInSection` component (IntersectionObserver-based,
  respects prefers-reduced-motion). Subtle by design — a settling
  effect, not a flashy one.
- **App-wide entrance animation + budget emoji**: every page in the
  app (not just the guest site) now fades and rises in on load or
  navigation via a shared `PageTransition` wrapper in the root layout —
  one change, whole-app coverage. Budget page also got `FadeInSection`
  scroll-reveal on its cards, plus a small emoji next to each of the 12
  preset categories (🏰 Venue, 🍽️ Catering, 📸 Photography, etc.) and a
  generic 🧾 next to custom items, so the list is easier to scan.
- **Dashboard stat tiles**: the "At a glance" summary's five tiles
  (headcount, budget, venues, vendors, attire) now each get a colored
  icon badge (alternating forest/gold, matching the existing palette)
  above the number, plus a hover shadow lift — inspired by a Tailgrids
  "data stats" pattern, hand-adapted to our own tokens rather than
  pulling in their component/theme system.
- **Budget: spending breakdown chart**: a new "Spending breakdown" card
  at the top of the Budget page, above the itemized list — a progress
  meter for "X of 12 categories have a real quote," and a sorted
  horizontal bar chart of every category (plus custom items lumped as
  "Additional items") from highest to lowest cost. Single-hue bars with
  the value labeled at the tip, since a 12+ slice pie/donut is a known
  anti-pattern for this many categories — built following the dataviz
  skill's form and mark-spec guidance.
- **Real icon system**: replaced emoji (which render inconsistently
  across platforms and read a bit informal next to the rest of the
  app) with a small hand-drawn inline-SVG icon set — one icon per
  budget category, one for custom items, and one each for the
  Dashboard's five stat tiles (headcount, budget, venues, vendors,
  attire). Same line-icon style throughout, sized/colored via the
  existing forest/brass tokens like every other icon-adjacent element.
- **More imagery**: the couple's hero photo (uploaded from the
  Dashboard) now shows there too, not just on the public site — a
  portrait next to their names on the Dashboard summary. The guestbook
  also got a bigger, more prominent photo treatment on both sides:
  a photo-grid layout on the public site (entries with a photo become
  a small card, text-only entries stay a compact row) and larger
  square photos on the couple's Guestbook feed.
