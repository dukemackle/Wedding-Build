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
  the listing-photo license; Privacy §1 covers submitter name and email.
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

**SMS beyond the current opt-in text updates:** explicit opt-in per number,
STOP handling, and record of consent (TCPA). Current texts are
wedding-schedule only and never marketing — keep it that way or revisit.

**EU/UK users** (marketing to them, or real sign-ups arriving):
- Cookie banner only if non-essential cookies/analytics are added; today
  there's only the auth session cookie, which needs none.
- Privacy Policy: name the legal basis for each use, list data subject rights
  (access, correction, deletion, export, objection), name processors
  (Supabase, Cloudflare, Resend, AI providers) and cross-border transfers.
- A working data export and account deletion path.
- Processor DPAs with Supabase/Cloudflare/Resend (all offer standard ones).

**Analytics or ad pixels:** disclose in Privacy; in the EU, a consent banner
before they load.

**Payments/billing:** Terms need pricing, refunds, auto-renewal disclosure
(state auto-renewal laws require clear terms and easy cancellation); the
payment provider handles card data.

**Guests under 13 or kids' data:** Privacy §7 says the service isn't for
children; a feature that collects kids' names beyond a guest count needs a
second look (COPPA).
