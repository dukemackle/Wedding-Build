---
name: launch-readiness
description: Go/no-go check before You Do, I Do opens to real outside couples, venues or vendors, or before any marketing starts. Checks legal and owner-only blockers, data safety, listing coverage, core couple journeys, email/SMS compliance, monitoring and support readiness. Use when the owner says /launch-readiness, "are we ready to launch", "can we start marketing", or before inviting the first outside users.
---

# /launch-readiness

Answer one question: **can real outside users be invited now, and if not,
what's left?** Read-only. Results go to the owner. Launching and marketing
are the owner's decisions.

## Checklist

Mark each **ready / not ready / unknown**, with evidence (file, register row,
command output). "Unknown" is an honest answer when only the owner can say.

1. **Legal and owner-only blockers.** Every Critical/High row in
   `docs/legal-audit.md` §12 is Fixed or Accepted. In particular: legal
   entity (R4), DMCA agent (R7), insurance (R9), Twilio A2P 10DLC (R2),
   backup key and plaintext backups in git history (R6), admin MFA (R16).
   Rows marked "fixed in branch": confirm the code is on `main` and the
   migration is run (ask the owner about the migration).
2. **Data safety.** Backups run and are encrypted (`scripts/backup.mjs`);
   restore has been tested (`scripts/restore.mjs`, ask when last); account
   deletion and data export work (`docs/retention.md`, R6).
3. **Listings.** `npm run coverage`: every state meets the owner's launch
   bar (see `docs/ai-operating-system/decisions.md`; if no bar is recorded,
   that's a decision for the owner). Listing-health queue is empty or
   triaged. Wording rules from R5 are in place.
4. **Core couple journeys.** Signup → onboarding → guests → budget →
   checklist → guest site → RSVP → vendor inquiry work end to end. Use the
   `couple-test` skill on any not checked since their last change.
5. **Email and SMS.** Resend domain verified for youdoido.com; CAN-SPAM
   pieces (R10); SMS consent and STOP (R2); inbound mail routed
   (`docs/email-playbook.md`).
6. **Monitoring.** Errors are visible somewhere the owner looks (Workers
   observability is on in `wrangler.jsonc`; is anyone reading it?);
   analytics exists and is disclosed in the privacy policy
   (`docs/ai-operating-system/integrations.md`).
7. **Support.** hello@youdoido.com is monitored, the help page
   (`src/app/help`) is current, feedback reaches `/admin/feedback`.
8. **Cost headroom.** `node scripts/weekly-review.mjs` free-tier numbers:
   how many more users before a paid tier is forced (finance-ops if unclear).

## Reply

Verdict first (**go / go with conditions / not yet**), then the not-ready
and unknown items as a numbered list, ordered by what blocks most, each with
who does it (owner, code, attorney). Short. Record the verdict and date in
`docs/ai-operating-system/decisions.md` only if the owner makes a launch
decision.
