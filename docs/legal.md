# Legal and consent: what's in place, and what future features trigger

Read before shipping anything that collects someone's details, sends email, or
opens Wren to a new audience. Wren is not a lawyer's sign-off; flag real
legal questions to the owner rather than deciding them.

## In place (2026-09-27)

- **Couples:** signup shows "By signing up, you agree to…" next to the button
  (sign-in-wrap). No checkbox. Legal basis for processing their data is running
  the service they asked for, not consent.
- **Vendors/venues:** `/list` and both `/claim/...` forms show `LegalNotice`
  (`src/components/legal-notice.tsx`) beside the submit button. Terms §6 has
  the listing-photo license (listing, search, previews, and the guest sites of
  couples who chose that venue); Privacy §1 covers submitter name and email.
- **Guests:** the guest site footer (`guest-site-theme.tsx`) links Terms and
  Privacy. Guests have no account; their data goes to the couple.
- Site-wide footer links Terms and Privacy.
- **Inbound email (2026-10-05):** mail to @youdoido.com lands in Google
  Workspace, and bounces/complaints are kept in `email_bounces`; Privacy §1
  ("When you email us") covers both. Every inquiry footer offers
  "changed or taken down? Email hello@youdoido.com".
- **Before AI reads inbound mail** (the triage in `docs/email-playbook.md`):
  Privacy §1/§3 must say an AI provider processes support email, and every
  AI-sent reply signs as Wren, You Do, I Do's assistant (California's bot
  disclosure law; honest anyway).

- **Listing reports and contact taps (2026-10-05):** the "Something wrong
  with this listing?" form shows `LegalNotice`; Privacy §1 covers the
  optional reporter email and the anonymous tap counts on listing links.

- **Registry claims (2026-10-12):** the guest site's "I'm getting this" and
  "Give to this fund" dialogs show `LegalNotice`; Privacy §1 (from guests)
  covers the name, quantity/amount and message. Fund money never passes
  through us, so the payments trigger below doesn't apply.

- **Marketplace sell form (2026-10-18):** shows `LegalNotice`; Privacy §1
  (from you) covers the public listing, first name and pickup town; Terms §4
  says sales are between buyer and seller and we don't handle payment.
  Messaging (part 2, 2026-10-18): the message box and report forms show
  `LegalNotice`; Privacy §1 covers messages, that reported conversations are
  read by us, and the new-message email.
  Part 3: the opt-in seller badge (month and year of the wedding only) is
  in the same Privacy line; rentals are between the two people, like sales.

- **Policy catch-up (2026-10-19):** guest wall posts (form shows
  `LegalNotice`; Privacy §1 from guests, Terms §5 approval), the assistant's
  guest-list/itinerary/seating lookups and Confirm-only changes, the vendor
  listing reader and writer (Privacy §1 vendors and §2 AI, now six), the Help
  feedback form, marketplace message emails (§2), and the attire share link
  (Privacy §4). Terms §1 now covers vendors and marketplace users, §4 covers
  rentals, and a new §7 says AI output is a draft to check, not advice.
- **California (2026-10-20):** the owner is in California, so Terms §13 is
  California law. Privacy §1 has the Do Not Track line CalOPPA asks for.
  CCPA/CPRA doesn't apply yet (it starts at $25M+ revenue, 100k+ consumers'
  data a year, or half of revenue from selling/sharing data); revisit if any
  of those come close. If the business is later formed in another state,
  revisit §13.
- **Free photo library (2026-10-21):** the banner panel searches Unsplash
  (`src/lib/unsplash.ts`). Privacy §1 says visitors' browsers load those
  banners from Unsplash; the sharing list says search words go to Unsplash
  from our server and the pick is reported to it. Unsplash's API terms
  require hotlinking, the download ping and a photographer credit, all in
  place. Photos of people aren't model-released: the picker tells couples to
  choose places and details. Still open for the attorney: whether a stock
  photo of an identifiable person on a couple's site exposes us or only them.

Rule: any new form that sends Wren a person's details gets `LegalNotice`
next to its submit button, and the Privacy Policy's "Information we collect"
gets a line for it. Bump the "Last updated" date on any policy change.

## Triggers: build these when the feature ships, not before

**Marketing email** (newsletter, product updates, promos, re-engagement,
vendor outreach blasts):
- Separate, unticked opt-in checkbox at signup, apart from the terms notice.
  Never bundled into agreeing to terms.
- Store consent: `marketing_opt_in boolean` + `marketing_opt_in_at timestamptz`
  on the profile (cheap now, painful to reconstruct later).
- Unsubscribe link in every marketing email, honoured promptly (CAN-SPAM);
  a physical mailing address in the footer (CAN-SPAM).
- Settings toggle to change it.
- Transactional email (auth, RSVP notifications, vendor replies) needs none
  of this.

**Built 2026-10-20** (migration 0124): consent lives in `marketing_consents`
(keyed by email, so it also covers businesses and works for unsubscribe
without sign-in) rather than on a profile, since there is no profiles table.
Signup has the unticked box; /account has the toggle; /unsubscribe and the
RFC 8058 one-click `/api/unsubscribe` write both `marketing_consents` and
`outreach_opt_outs`. Every marketing send must go through `sendMarketingEmail`
(`src/lib/marketing-email.ts`), which refuses to send without
`MARKETING_POSTAL_ADDRESS` and `UNSUBSCRIBE_SECRET`, skips opted-out and
bounced addresses, and mails couples only with a confirmed opt-in. Still open:
the postal address itself (owner getting a PO box), and the two secrets.

**SMS beyond the current opt-in text updates:** explicit opt-in per number,
STOP handling, and record of consent (TCPA). Current texts are
wedding-schedule only and never marketing — keep it that way or revisit.
Since 2026-10-19 the RSVP checkbox shows `SMS_CONSENT_DETAIL`
(`src/lib/sms-consent.ts`), which is stored with the opt-in (0122). Every
text names the sender and says "Reply STOP". Never add a line promoting
anything to a guest text: one line of promotion makes it a marketing text.

**Guest sites:** read through `createGuestSiteClient` (`src/lib/supabase/guest-site.ts`),
never a plain client. The database shows one site per request, and only
past its password (0121). A new guest-site table gets a policy built on
`public_weddings`, or on `guest_site_open()` / `guest_site_named()`.

**EU/UK users** (marketing to them, or real sign-ups arriving):
- Cookie banner only if non-essential cookies/analytics are added; today
  there's only the auth session cookie, which needs none.
- Privacy Policy: name the legal basis for each use, list data subject rights
  (access, correction, deletion, export, objection), name processors
  (Supabase, Cloudflare, Resend, AI providers) and cross-border transfers.
- A working data export and account deletion path.
- Processor DPAs with Supabase/Cloudflare/Resend (all offer standard ones).

**Analytics or ad pixels:** disclose in Privacy; in the EU, a consent banner
before they load. (First-party milestone events in `events`, 2026-10-21, are
server-side, cookieless, hold no typed content and are disclosed in Privacy
under "Automatically"; they need no banner. A new event that would carry
personal data does.)

**Payments/billing:** Terms need pricing, refunds, auto-renewal disclosure
(state auto-renewal laws require clear terms and easy cancellation); the
payment provider handles card data.

**Guests under 13 or kids' data:** Privacy §7 says the service isn't for
children; a feature that collects kids' names beyond a guest count needs a
second look (COPPA).
