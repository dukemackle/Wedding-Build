# Couples, vendors, venues and partners

## What exists (2026-10-20)

- Couples: `/admin/couples` list (test flag, tags, bulk email, CSV) and
  `/admin/couples/[id]` detail reading ~16 tables, with `admin_couple_notes`.
- Vendors/venues: list pages with filters, bulk actions, export, claim links,
  FAQs; `vendor_contact_log` for outreach on vendors only.
- Claims queues: `/admin/venues/claims`, `/admin/vendors/claims`.
- Inbound email: `inbox_messages` (see `docs/email-playbook.md`).
- Opt-outs: `outreach_opt_outs`. Bounces: `email_bounces`.
- No partner records, no follow-up tasks, no unified activity timeline.

## Record-page pattern (adapted from CRM record pages)

Left: key fields + quick actions. Middle: one timeline merging signup, edits
(`field_sources`), claims, inquiries, emails sent/received, notes, reports.
Right: linked records (a vendor's inquiries, a venue's preferred vendors, a
couple's booked vendors). Build the timeline as a read-time union over
existing tables before adding any new storage.

## Rules

- Contacting anyone (couple, vendor, venue, partner) is an outward action:
  drafts only, the owner sends or approves. Check `outreach_opt_outs` and
  bounces first. Vendor email drafting lives in the `vendor-outreach` skill.
- Bulk email to couples needs: a cap, a consent/transactional check, the
  CAN-SPAM pieces from `docs/legal-audit.md` R10, and an audit-log entry.
- Couples' data is shown to the owner for support, not mined. Reports use
  counts; open a single couple's record only for a reason.
- Partners (referral partners, planners, associations): when they exist, a
  small `partners` table (name, type, status, owner notes, next follow-up
  date, agreement link in Drive) is enough. Not before.

## Follow-ups

A follow-up is a note with a due date on any record, shown on Home's "needs
action" list when due. One table (`admin_tasks`: record type + id, note, due,
done_at) covers couples, listings and partners. P2 until outreach volume
makes memory unreliable.
