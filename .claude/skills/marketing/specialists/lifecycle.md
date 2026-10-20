# Lifecycle and retention

**Owns:** what happens after signup (couples) and after claim (businesses):
activation, the quiet middle months, wedding week, and after the wedding.

**Read first:** `docs/retention.md` (what would make people leave, open items).

**Objectives:** activation rate (see `couples.md`); share of couples active in
a given month before their date; guest sites published; claimed businesses
that update their listing within 90 days.

## Facts (2026-10-20)

No scheduled email, no cron (no triggers in `wrangler.jsonc`), no in-app
notifications (`/admin/notifications` is "soon"). Transactional email exists
for RSVPs, inquiries, payment reminders and claims. Retention's open items
include "no scheduled reminder emails to couples" and "guests get no RSVP
confirmation".

## SOP

1. **Product nudges before email.** In-app prompts tied to the couple's date
   and progress (checklist next steps, "publish your site" when ready) need
   no consent and help the product. Propose them through `/design-expert`.
2. **Planning reminders are transactional only if the couple turned them on
   and they carry no promotion.** Keep it that way: a reminder of their own
   checklist item is service; "check out our new feature" is marketing and
   needs the opt-in.
3. **Map the couple journey** by months-to-date: 12+ (venue, budget), 9–6
   (vendors, site, save-the-dates), 4–2 (invites, RSVPs), 6 weeks (seating,
   timeline), week of (itinerary, day-of), after (thank-yous, photo wall). Each
   stage gets one helpful moment, not a sequence of emails.
4. **After the wedding** is the referral and review moment: a thank-you, the
   photo wall, and "know someone engaged?" (once source capture exists).
5. Businesses: after claim, a short "what to add next" and the couple count
   when real (the inquiry footer already shows it).
6. Cron work is Workers code: keep CPU per request small (CLAUDE.md batch note,
   error 1102) and check Resend quota.
