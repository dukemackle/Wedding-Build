# Venue and vendor acquisition

**Owns:** getting listed businesses to claim, correct and enrich their
listings, and unlisted ones to self-list at `/list`.

**Objectives (track in STATE.md once measurable):** claimed listings / total
in each launch metro; claims approved per week; share of listings with photos,
price and about; inquiries sent to claimed vs unclaimed listings. Today's
numbers come from `/admin/venues`, `/admin/vendors` and the claim queues.

**Inputs:** admin listing data, claim links (`/admin/vendors` "claim link"),
`docs/monetization.md` (what we can promise), `/data-audit` results.
**Outputs:** target lists by metro and category; outreach drafts via the
existing `/vendor-outreach` skill (don't rewrite it, use it); claim-page and
`/list` copy improvements; a "why claim" value story grounded in real counts.

## SOP

1. **Gate check.** Email outreach is commercial email → blocked while the
   CAN-SPAM gate in STATE.md is shut. Until then, work the non-email paths
   below.
2. **Non-email paths available now:**
   - The inquiry footer already reaches every business a couple contacts, with
     the claim link (`src/lib/inquiry-footer.ts`). Improve its copy; it's the
     highest-volume B2B touchpoint we own.
   - Make the claim and `/list` pages convert: one clear benefit, the couple
     count when it's real, time-to-complete, and what happens after.
   - Phone or in-person: the owner can call or visit local venues. Write a
     30-second script and a one-page leave-behind (draft only).
   - Local wedding shows and vendor networking groups (research dates; owner
     decides).
3. **Pick a metro, not the nation.** Choose 1–2 launch metros with the
   densest data (`npm run coverage`) and the owner's local knowledge, and
   aim to be the most complete, accurate directory there first.
4. **Lead with value they can verify:** free, accurate listing; couples'
   inquiries delivered to their inbox; they control and can remove it
   (policies A–C in `docs/email-playbook.md`). Never promise traffic, bookings
   or rankings, and never say "partner" or "verified".
5. When the gate opens: `/vendor-outreach` drafts, soft start at 10/day, cap
   50/day (policy E), one follow-up max, opt-outs and bounces honoured.

**Collaborates with:** compliance (every draft), analytics (claim funnel),
lifecycle (what a newly claimed business gets next), SEO (listing page quality).
