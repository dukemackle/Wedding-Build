# Retention: what loses couples, venues and vendors

Read this before prioritising work, or when a change touches guest data, the
guest site, the budget, reminders, listings or inquiries. Written 2026-10-05,
pre-launch. Each side leaves for a different reason; these are the things that
have to hold.

## Couples: trust first, then a reason to come back

1. **Never lose or corrupt their data.** A guest list or budget is months of
   work. One lost RSVP or a wrong total sends them back to a spreadsheet for
   good. Every save surfaces its error; nothing shows "saved" when it wasn't;
   destructive actions confirm; couples can export their data.
   **Backups (2026-10-08):** the "Weekly backup" routine runs
   `npm run backup` every Sunday: all public tables, auth users and every
   Storage file, to the "You Do, I Do backups" Shared drive and the private
   `youdoido-backups` repo (newest 12 data files kept; Storage files mirrored,
   never deleted). `npm run restore` puts one back into a project (see the
   header of `scripts/restore.mjs`). Not covered: passwords (users reset them
   after a restore) and anything changed in the Supabase dashboard rather than
   a migration.
   **Restore drill (2026-10-09):** passed into the scratch project
   `youdoido-restore-test` with `--reset --apply-migrations`: 53 tables,
   9,124 rows, 9 users, 23 files, no mismatches. It caught two script bugs,
   both fixed: migration-seeded rows deleted on live (48 `attire_items`) came
   back, and `--reset` left Storage policies behind so a re-run failed.
2. **The guest site (`/w/[slug]`) never fails.** It's the part their family
   sees. An RSVP that doesn't save, or a site that's down the week of the
   wedding, is public and unforgivable.
3. **The budget beats a spreadsheet.** It's the wedge (see
   `docs/competitors.md`). Moving in from a spreadsheet and back out must be
   easy, or the spreadsheet wins by default.
4. **The quiet middle months.** Planning runs 12-18 months. Without a reason
   to return (checklist nudges, payment due dates, Wren noticing something),
   couples drift off.

## Venues and vendors: accurate listings and real leads

1. **Listings are accurate.** Wrong prices, dead sites or closed businesses
   hurt both sides: couples stop trusting search, vendors find us because
   we're wrong and ask to be removed. Accuracy is checked on a schedule, not
   only when someone remembers, and couples can report an error.
2. **Leads arrive, and we can show it.** Owner's decision (2026-10-05):
   **inquiries go through the app**, so every lead is counted per listing and
   can be shown to the vendor ("12 couples contacted you through You Do, I
   Do"). That count is what makes claiming, and later paying, worth it.
3. **No pricing surprises.** When charging starts, follow the free-vendor
   rollout in `docs/monetization.md` exactly.

## Where the sides meet

Coverage is the marketplace. "50 states with listings" means 50 states with
*accurate* listings: audit what's in before adding more.

## Honest limit

"No issues and no inaccuracies" is the goal, not a guarantee. Listing data
comes from the public web and goes stale on its own. What we can promise is
that errors are caught by a check, not by a couple.

## Status (2026-10-05 audit)

Done:
- Inquiries (vendor and venue) are logged before the email is sent, so none
  goes out unrecorded; a failed send removes the row.
- Vendor follow-up emails carry the claim link, like first inquiries do.
- Venue-layout edits (move, resize, rotate, rename, delete) report a failed
  save and reload the stored layout instead of silently looking saved.
- RSVP form: spam trap, length caps on every field, and the couple gets an
  email when a new RSVP is waiting on /guests.
- Contact goes through the app: listing emails are hidden (inquiries are
  sent to the stored address server-side); phone, website and social taps
  are counted in `listing_contact_clicks`.
- Vendors see their leads: a gold callout on both claim pages, and a running
  "That's N couples..." line in inquiry emails (`src/lib/listing-leads.ts`).
- "Something wrong with this listing?" on every real listing feeds
  /admin/listing-health, which also lists listings whose email bounces.
- `audit.mjs` staleness default now 30 days, matching `listing-freshness.ts`.

Open, in order:
1. The data audit runs only by hand; `inbox_messages` isn't shown in admin.
2. Vendor replies to inquiries skip the app (reply-to is the couple), so
   there's no response-rate data yet.
3. No scheduled email to couples at all: no payment due-date or checklist
   reminders (no cron in `wrangler.jsonc`).
4. Guests get no RSVP confirmation and can't change an RSVP; a name typo on
   approval creates a duplicate guest.
5. Guest deletes are permanent (no undo, no soft delete).
