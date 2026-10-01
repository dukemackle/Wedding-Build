---
name: vendor-outreach
description: Draft emails inviting vendors (or venues) already listed on You Do, I Do to claim or improve their profile. Use when the owner asks for vendor outreach, claim invitations, or "email the Austin photographers". Drafts only, never sends, and stays within docs/legal.md and the free-vendor plan in docs/monetization.md.
---

# Vendor outreach drafts

Drafts one personal email per listed vendor inviting them to claim their
listing or fill in what's missing. The owner reviews and sends each one by
hand. This skill never sends email, never calls Resend, and never writes to
the database.

## Before drafting

1. **Read `docs/legal.md` and `docs/monetization.md`.** Both are short. If either
   has changed since this skill was written and now conflicts with a rule
   below, the doc wins. Tell the owner what changed.
2. **Confirm the phase.** These rules assume Phase 0, where everything is free.
   If the owner says Phase 1 has started, stop. The Phase 1 email is the
   rollout announcement in `docs/monetization.md` (segment first, deadline and
   early-bird rate, grace period), not this invitation. Ask the owner for the
   price and dates before drafting anything that mentions money.
3. **Get the list from the owner.** Ask for a metro and categories, or names.
   For each vendor you need the name, category, city, `slug`, `contact_email`,
   and the claim link. The owner copies the link from /admin/vendors ("claim link").
   It's `https://wrenwed.com/claim/vendor/<token>`, made by
   `ensureVendorClaimLink` in `src/lib/vendor-claim-server.ts`. Never invent a
   token. If a link is missing, leave `[CLAIM LINK]` in the draft. Venues work
   the same way through /admin/venues and `/claim/<token>`.
4. **Note what's thin on each listing.** Look for no photos, no `about`, no
   price, no website or Instagram, or a stale `last_verified_at`. Ask the owner
   for the row, or read it from `src/lib/vendor-batches.ts` if it came from a
   batch. Name one or two gaps in the email. That makes it personal, and it's
   the honest reason to write.

## Who not to email

Skip the vendor and tell the owner why if any of these apply:
- There's no `contact_email`, or it's a personal address rather than a
  business one.
- The row has `is_sample` or `_seed_marker` set. It's demo data, not a real
  business.
- The vendor already claimed the listing (`source` is `claimed` or
  `self-listed`). Email those only to ask about specific gaps, and only if the
  owner asks.
- They have asked not to be contacted, or have already had an email from this
  skill with no reply. Send one invitation and at most one follow-up, then stop.
- The business is outside the US. EU and UK outreach triggers the GDPR items in
  `docs/legal.md`. Flag it and don't draft.

## The legal floor (CAN-SPAM)

`docs/legal.md` counts vendor outreach as marketing email. An invitation to use
the service is commercial even when it's free, so every draft carries:

- **An accurate From name and an honest subject line.** Write "Your listing on
  You Do, I Do". Never "Re:", "Inquiry for you", or anything that looks like a
  couple's lead.
- **A plain opt-out line**, e.g. "Not interested? Reply 'no thanks' and we
  won't email you again." The owner has to honour it. Keep a do-not-contact
  list in the admin notes field or a spreadsheet, and check it before each
  batch.
- **A physical mailing address in the footer.** There isn't one on file. Leave
  `[MAILING ADDRESS]` and remind the owner every time until they give you one.
  A PO box or a registered-agent address is fine. When they do, record it in
  `docs/legal.md` so the next run doesn't have to ask.

Keep it one-to-one. Write each email as a single message from the owner, sent
from their own inbox. Bulk sends through Resend or any blast tool need the full
marketing-email build in `docs/legal.md` first (unsubscribe link, consent
storage, suppression list). If the owner wants a mass send, say that and stop.

## What the email may and may not claim

**Say:**
- They're already listed. Name the page and link the claim URL.
- Claiming is free and lets them correct details, add photos, prices and links,
  and choose where inquiries go.
- What You Do, I Do is: a wedding-planning app for couples, with venue and
  vendor discovery built in.

**Never say:**
- "Free forever", "always free", or "no fees ever". `docs/monetization.md`
  plans light vendor pricing later. "Free" or "free to claim" is true today.
  Anything permanent is a promise the owner can't keep.
- Anything about future paid plans, featured placement, or rankings. That's
  Phase 1 and 2, and the owner announces it on their own terms.
- Inquiry counts, traffic, or "couples are looking at you", unless the owner
  confirms the numbers are real non-owner activity. Pre-launch inquiries are
  mostly the owner testing. Counting them as demand is a false claim.
- "Partner", "verified", "recommended", or "featured". None of those exist.
- Urgency or threats ("claim before it's removed"). Unclaimed listings stay up.

When they claim, the form shows `LegalNotice`, so the email doesn't need to
restate Terms §6 (the photo license). It's fine to say "you keep the rights to
your photos; you just let us show them on your listing".

## Voice and shape

Write as the owner, in first person, not as Wren the assistant. Wren is the
in-app bird, and the company is You Do, I Do. Keep it under about 120 words, in
plain text with no images, and with two links at most: their public listing
(`https://wrenwed.com/vendors/<slug>`, public without sign-in) and the claim URL. Address the
business by name and mention one specific thing about their listing.

```
Subject: Your listing on You Do, I Do

Hi {name} team,

I run You Do, I Do, a wedding-planning app for couples in {city}.
{Business} is already listed under {category}: {public listing URL}.

It's missing {gap, e.g. photos and a starting price}. Claiming it is free
and takes a few minutes. You can fix anything I got wrong, add photos and
links, and choose where couples' inquiries go:
{claim link}

Not interested? Reply "no thanks" and I won't email again.

{owner name}
You Do, I Do · wrenwed.com
[MAILING ADDRESS]
```

A follow-up, if the owner wants one, goes out 10 or more days later. It's two
lines in the same thread, with the same opt-out line and footer. Never send a
second follow-up.

## Output

Write the drafts to the scratchpad as one Markdown file, not into the repo.
Lead with a short list of who was skipped and why, then one block per vendor
with To, Subject and Body, ready to paste. End with the open placeholders the
owner must fill (`[MAILING ADDRESS]`, any `[CLAIM LINK]`). Don't commit the
drafts, because they contain contact emails.
