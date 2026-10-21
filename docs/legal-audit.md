# Legal and liability audit: You Do, I Do

First audit: **2026-10-19**, run as a read-only review of the repo on branch
`claude/hopeful-turing-bznfw0`. I did not look at the live site, production
data, the Supabase/Cloudflare/Twilio dashboards, or any contracts.
This is risk analysis. It is not legal advice, and items marked
**Attorney: Required** need a licensed lawyer before you act on them.
Legal sources were checked against primary sources on 2026-10-19 unless
marked *(from memory, re-verify)*.

How to keep this file current: section 12 is the live **risk register**.
Update a row's status when work ships. Re-run the audit (section 13) before
the 50-state marketing push, before charging anyone, and when a launch-review
trigger fires. `docs/legal.md` stays the short "what each form needs" rulebook.
This file holds the reasons and the backlog.

---

## 1. Executive summary

The basics are better than most pre-launch apps have:
- Real Terms and Privacy pages, with a consent notice on most forms.
- An account-delete button.
- Contact details hidden on listings, and descriptions written in our own words.
- No payment handling, no trackers.
- A removal path for listings, and an outreach gate that blocks cold email until CAN-SPAM pieces exist.

Five problems should be fixed **before any real couple, guest or vendor relies on the product**:

1. **Guest-site data is readable by anyone, platform-wide.** The public
   database views let anyone with the (public) anon key list every published
   wedding, with the couple's names, date, venue, payment handles, confirmed
   guests' names and photos, and wedding party. That works even when the couple
   set a password. The registry function also hands the couple's shipping
   address to anyone who calls it.
2. **Guest texts carry an ad.** Every schedule-change SMS ends "Planning your
   own wedding? Try You Do, I Do free". That makes it a marketing text under the
   TCPA, sent without marketing consent and with no STOP wording. It also
   contradicts the Privacy Policy ("never marketing").
3. **The Privacy Policy doesn't match the code in several places**, chiefly that
   Wren's assistant can read the guest list. A privacy policy that misstates
   what happens is the classic FTC "deceptive practice" case, and California's
   CalOPPA applies at any size.
4. **There's no legal entity behind the Terms.** The Terms say only "You Do, I
   Do", governing law is a live `[STATE — to be finalized]` placeholder, and
   there's no indemnity, DMCA process or dispute clause. If someone sues today,
   they very likely sue **you personally**.
5. **Listings say "✓ Details verified"** on businesses that never claimed them,
   with no "not affiliated / unclaimed" notice. Before thousands of listings go
   out nationwide, that wording is the main false-endorsement and
   misrepresentation exposure.

Most fixes are small: copy edits, one migration, a few hundred dollars of
paperwork (an LLC, a $6 DMCA agent filing, a PO box), and insurance quotes.

---

## Owner answers (2026-10-19)

- **Entity:** none yet.
- **Insurance:** none.
- **PO box or virtual mailbox:** declined. CAN-SPAM still requires *a* valid postal address in commercial email, and the DMCA agent filing needs one too. Until one is chosen, no commercial email goes out. The outreach gate stays shut.
- **Outside users:** none yet. No real weddings, guests or texts, so nothing already sent needs remedying.
- **Twilio and Supabase:** the number isn't registered for business texting with the carriers (A2P 10DLC). "Confirm email" in Supabase is not known to be on.

## 2. What exists today (verified in code)

**Live features:**
- Couple app: guests, RSVPs, budget, seating and venue layout, itinerary, checklist, attire, registry, bookings.
- Public guest sites at `/w/[slug]` with an optional password.
- Venue and vendor directory: about 7.5k venue and 11.7k vendor rows in batch files, plus claim and `/list`.
- Inquiries emailed through the app.
- A peer marketplace (sell, rent, messaging).
- Wren AI on Anthropic: planning chat, contract reader, thank-you drafts, site copy, listing reader and writer, admin assistant.
- Opt-in schedule SMS to guests via Twilio.
- Weekly backups.

**Not built:**
- Payments, subscriptions, ads, sponsored placement, reviews and ratings, analytics or pixels.
- Bulk outreach sending (the `vendor-outreach` skill drafts only).

**Planned:** paid vendor listings (`docs/monetization.md` Phase 1–3), featured placement, AI triage of inbound email, and 50-state marketing.

---

## 3. Top 10 risks (full detail)

### R1. Guest-site data is enumerable and the password can be bypassed
- **Severity:** Critical (confirmed)
- **Evidence:** these views are granted to `anon` and run as their owner, so they bypass row security:
  - `public_weddings` (`supabase/migrations/0115_registry_gifts.sql:110-142`): names, date, venue address, Venmo/PayPal/Cash App/Zelle handles.
  - `public_confirmed_guests` (`0027_public_guest_wall.sql:8-14`): names and photos of every confirmed guest on every public wedding.
  - `public_party_members` (`0112:115-121`).
  - `public_guestbook_entries` (`0079:125-137`).
  - `public_registry_gifts` (`0115:83-108`).
  - The anon key is public by design (`wrangler.jsonc`), so `select * from public_weddings` lists the whole platform. `0112:9-12` admits the password "stops strangers and search engines, not a determined developer".
  - `claim_registry_gift` (`0115:146-178`) returns `gift_ship_to` to any anonymous caller, with no password check and no rate limit.
  - `unlock_guest_site` (`0112:76-107`) allows 4-character passwords and has no rate limit.
  - The `guest-photos` bucket accepts anonymous uploads to any path, and photos are public before the couple approves them (`0026:32-44`; `src/app/w/[slug]/actions.ts:35-43`).
- **Applicable authority:**
  - FTC Act §5, 15 U.S.C. 45 (deception or unfair data security). A "password-protected site" that isn't is a misrepresentation. https://www.law.cornell.edu/uscode/text/15/45
  - State "reasonable security" laws, e.g. Cal. Civ. Code 1798.81.5 *(from memory, re-verify)*.
  - Breach statutes in all 50 states are triggered only by certain data elements (SSN, account credentials and similar), so this is likely **not** a notifiable breach. It is the kind of exposure that produces press and lost trust. https://www.ncsl.org/technology-and-communication/security-breach-notification-laws
- **Consequences:**
  - A scraper builds a list of upcoming weddings with dates and venues (empty homes, gift tables).
  - Payment handles plus the couple's home address get exposed.
  - A guest's "private" site is found by an ex or a stalker.
  - The FTC or a state AG could treat the password feature as deceptive.
- **Fix:**
  - Replace the broad views with `security definer` functions keyed by one slug, e.g. `guest_site(p_slug, p_token)`, that return a single site and check the gate token when a password is set.
  - Revoke `select` on the views from anon.
  - Return `ship_to` only through a gated call, and only after a claim.
  - Rate-limit `unlock_guest_site` (attempts per slug per hour, stored in a table) and require 8+ characters for new passwords.
  - Restrict `guest-photos` inserts to `pending/<wedding_id>/…`, add a size and type check, and make pending photos private until approved.
- **Implementation:** one migration, plus the guest-site data loaders that read those views. Regression risk: guest-site pages, OG previews, registry. Test a locked site, an unlocked site, the registry claim, and an RSVP with a photo.
- **Priority:** Now, before any real wedding goes public.
- **Attorney:** Not currently identified as necessary.

### R2. The guest schedule SMS contains marketing; no STOP or consent record
- **Severity:** High (confirmed)
- **Evidence:**
  - `src/app/itinerary/actions.ts:97` appends "Planning your own wedding? Try You Do, I Do free: youdoido.com".
  - The opt-in checkbox "Text me for schedule updates" (`src/app/w/[slug]/rsvp-form.tsx:247-261`) says nothing about who sends texts, how often, rates or STOP/HELP.
  - No consent timestamp or wording is stored (`0058_guest_sms_opt_in.sql`).
  - There is no STOP handling in `src/lib/sms.ts`.
  - Privacy §1 promises "never marketing" (`src/app/privacy/page.tsx:107-108`).
- **Applicable authority:**
  - TCPA, 47 U.S.C. 227, and 47 CFR 64.1200. A text that includes advertising needs **prior express written consent** to marketing, and dual-purpose messages are treated as marketing. https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200
  - Revocation by any reasonable means, honoured within 10 business days (effective April 11, 2025).
  - Statutory damages of $500–$1,500 per text, with class actions common.
  - State mini-TCPAs (Florida, Oklahoma, Maryland) are stricter.
  - *McLaughlin Chiropractic v. McKesson* (U.S. 2025) means courts no longer defer to FCC readings, so outcomes vary by court. https://www.supremecourt.gov/opinions/24pdf/23-1226_l5gm.pdf
  - Carrier A2P 10DLC registration is a carrier rule, not law, but unregistered traffic gets blocked.
- **Consequences:** a 150-guest wedding with five schedule changes is 750 texts, which is a $375k–$1.1M statutory exposure in theory. One annoyed guest is enough to start a case.
- **Fix:**
  - Delete the tagline (one line).
  - End messages with "Reply STOP to opt out."
  - Store `sms_opt_in_at` and the exact consent text version.
  - Reword the checkbox: "Text me schedule changes for [names]'s wedding from You Do, I Do. A few messages at most. Msg & data rates may apply. Reply STOP to opt out."
  - Confirm Twilio's default STOP handling is on for the number, and record opt-outs back to the guest.
  - No texts between 9pm and 8am in the guest's timezone. Queue them instead, or skip if the change is urgent and the couple confirms.
- **Priority:** Now. The tagline removal is a copy-level fix.
- **Attorney:** Recommended only if marketing texts are ever wanted.

### R3. The Privacy Policy doesn't match what the code does
- **Severity:** High (confirmed)
- **Evidence:**
  - **Planning assistant:** Privacy says it gets "date, guest count, budget figures, checklist" (`privacy/page.tsx:191-193`). In the code it also gets guest names, households, meals, sides, tables and plus-ones (`src/lib/ai/assistant-tools.ts:137-145`, `find_guests`), booked vendors with amounts, and family-dynamics interview answers (`src/lib/ai/wedding-assistant.ts:181-217,281`).
  - **AI features:** "Four parts use AI" (`:170`) leaves out the listing reader and writer and the thank-you drafts, which send guest names and gifts (`src/app/guests/thank-you-actions.ts:48-56`).
  - **Admin AI:** Privacy says admin AI work never includes the guest list (`:198-201`). That holds, but "questions you've asked Wren" can contain guest details.
  - **Not mentioned at all:**
    - Google Fonts loaded from Google on guest sites (`src/lib/site-design.ts:1588-1590`).
    - Unencrypted weekly backups to Google Drive and a GitHub repo, including auth user records (`scripts/backup.mjs:85-87,133-146`).
    - Business data gathered from public websites (`privacy/page.tsx:115-131` covers submitters only).
    - The cap hand-off that pre-fills ChatGPT or Claude links with wedding basics (`wedding-assistant.ts:224-234`).
  - **SMS:** "never marketing" is false today (R2).
  - **Rights:** §6 has a one-line generic rights statement.
- **Applicable authority:**
  - FTC Act §5: deceptive privacy statements.
  - **CalOPPA**, Cal. Bus. & Prof. Code 22575–22579. It applies to any commercial website collecting personal information from California residents, regardless of size: the policy must list the categories collected and the third parties shared with, and say how Do-Not-Track is handled *(from memory, re-verify)*. https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22575
  - The CCPA/CPRA most likely **doesn't apply yet**. Its thresholds are $26.625M revenue, *or* buying, selling or sharing personal information of 100k+ California consumers, *or* 50%+ of revenue from selling or sharing. https://cppa.ca.gov/regulations/
  - Texas TDPSA and Nebraska have no volume threshold, but exempt SBA "small businesses". You almost certainly qualify, though even small businesses need consent before selling sensitive data.
- **Consequences:** a deception claim. Every later privacy dispute starts from the policy being wrong.
- **Fix:** correct the policy line by line:
  - assistant data;
  - all AI features;
  - Google Fonts (or self-host the fonts, which is better);
  - backups and how long they're kept;
  - publicly sourced business data and how to remove it;
  - SMS wording;
  - Do-Not-Track statement;
  - a contact for rights requests with a 30-day target.

  Also show the same list in plain words in the Wren chat: "Wren can see your guest list, budget and checklist".
- **Priority:** Now. Copy only, but it must ship in the same PR as R2 and R6 so it matches the code.
- **Attorney:** Recommended, as part of the full policy review in R4.

### R4. No legal entity; the Terms have gaps that put you personally at risk
- **Severity:** High (confirmed from the repo; entity status unknown)
- **Evidence:**
  - The Terms name only "You Do, I Do" (`src/app/terms/page.tsx:18`).
  - §12 governing law is a placeholder (`:177-181`).
  - The Terms (AI section added 2026-10-19 on main) have none of the following:
    - indemnification;
    - a dispute or arbitration clause;
    - a DMCA process;
    - a minimum age;
    - SMS terms;
    - a marketplace release;
    - a postal address.
  - §9 caps liability at "$0" while the service is free (`:146-154`).
  - Guests are said to be bound "by submitting" (§1), but the RSVP and contact forms show no notice (`rsvp-form.tsx`, `src/app/w/[slug]/contact/contact-form.tsx`). Without notice, that is browsewrap.
- **Applicable authority:**
  - Contract formation online. *Berman v. Freedom Financial*, 30 F.4th 849 (9th Cir. 2022) requires reasonably conspicuous notice plus an unambiguous act of assent. *Meyer v. Uber*, 868 F.3d 66 (2d Cir. 2017) upheld sign-in-wrap. *Nguyen v. Barnes & Noble*, 763 F.3d 1171 (9th Cir. 2014) rejected bare browsewrap. *(Case cites from memory, re-verify.)* Your signup sign-in-wrap is probably fine; guest forms aren't.
  - Liability caps of $0 and one-sided terms risk being struck down as unconscionable (e.g. Cal. Civ. Code 1670.5, 1668). A floor such as "the greater of fees paid or $100" holds up better.
  - Personal liability: without an LLC or corporation, a sole proprietor's personal assets answer for business debts and judgments. Even with an LLC, veil-piercing and personal-participation rules apply.
- **Consequences:** personal exposure for every claim in this list. A court may decline to enforce key clauses. There's no way to hand users' legal claims against vendors back to them.
- **Fix (owner):**
  - Form an LLC: usually your home state, or Delaware/Wyoming only if there's a reason.
  - Get an EIN and a business bank account, and keep business money separate.
  - Assign the domain, code and IP to the LLC in writing.
  - Get a business address or PO box.
- **Fix (code):**
  - Name the entity and address in the Terms, Privacy and email footers.
  - Fill in governing law.
  - Add §§ on indemnity, DMCA, minimum age (18 to hold an account), AI output, SMS, marketplace, and disputes.
  - Add `LegalNotice` to the RSVP and contact forms.
  - Turn on "terms version accepted" logging (section 9).
- **Priority:** LLC and insurance in the next 30 days. Terms redraft after that, then attorney review before launch.
- **Attorney:** **Required** for the Terms rewrite, arbitration and class-waiver choice, and entity setup (or use a formation service plus an attorney review).

### R5. Listings: "Details verified" wording; no unclaimed or not-affiliated notice
- **Severity:** High (confirmed)
- **Evidence:**
  - "✓ Details verified <Month Year>" shows whenever `last_verified_at` is set. That date is set by an admin click or an audit run, not by the business (`src/lib/public-listings.ts:63-71`; `src/app/vendors/[id]/vendor-listing.tsx:118-120`; `src/app/venues/[id]/venue-listing.tsx:186-191`; `src/app/admin/_listing/audit-actions.ts:181-186`).
  - Unclaimed listings are deliberately unlabelled (`public-listings.ts:24-32`).
  - The accuracy disclaimer lives in Terms §6, not on the listing (`terms/page.tsx:105-117`).
  - The price-tier badge has no estimate wording (`vendor-listing.tsx:107-111`).
  - About 1.75k vendor emails are personal `@gmail.com` addresses (individual sole proprietors).
- **Applicable authority:**
  - Lanham Act §43(a), 15 U.S.C. 1125(a): false association or endorsement. Nominative fair use allows naming a business to identify it if you use only what's needed and imply no sponsorship (*New Kids*, 9th Cir. 1992; *Toyota v. Tabari*, 9th Cir. 2010). https://www.law.cornell.edu/uscode/text/15/1125
  - FTC Act §5 and state UDAP laws, on "verified" claims couples rely on.
  - Facts like name, address, phone and category aren't copyrightable (*Feist*, 499 U.S. 340 (1991)), so the directory itself is on solid ground.
  - Section 230 (47 U.S.C. 230, unchanged as of 2026-10; sunset bills pending) **does not protect content we write ourselves**. Batch descriptions and price tiers are ours.
- **Consequences:**
  - A couple books on a "verified" capacity or price that was wrong.
  - A business objects to looking affiliated.
  - At 18k listings, even a 2% error rate is 360 wrong pages.
- **Fix:**
  - Replace "Details verified" with "Checked against their website, <Month Year>" for unclaimed listings. Keep "Confirmed by the venue" for claimed ones.
  - Add a small line on unclaimed listings: "This listing is from public information. [Business] hasn't claimed it and isn't affiliated with You Do, I Do. Is this yours?" This can sit in the existing "Is this your business?" box, so it doesn't read as second-rate.
  - Add "estimate" wording to tier badges.
  - Add "Remove my listing" as a report reason that goes straight to the hide queue.
- **Priority:** Before the 50-state push. Copy-level.
- **Attorney:** Recommended (one look at the listing-page wording, bundled with R4).

### R6. Account deletion leaves data behind; no data export; backups are unencrypted and kept forever
- **Severity:** High (confirmed)
- **Evidence:**
  - `src/app/account/actions.ts:20` lists storage with a single `list(weddingId)`. That call is not recursive and stops at 100 items, so `gallery/`, `venue/`, `party/` and `blocks/` files stay **publicly reachable** after deletion.
  - `assistant_conversations` and `feedback_submissions` survive with `user_id` set to null (`0056`).
  - Backups go unencrypted to Drive (12 copies kept) **and** to a GitHub repo, where git history keeps them forever (`scripts/backup.mjs`).
  - There is no self-serve export (`docs/retention.md` lists export as a must-have).
- **Applicable authority:** FTC §5 (the policy promises deletion, §5 at `privacy/page.tsx:281-297`); state privacy laws if and when they apply (deletion and portability rights); breach laws if a backup copy leaks.
- **Fix:**
  - Recursive, paginated storage delete across all buckets.
  - Delete or anonymise conversation and feedback text.
  - Encrypt backups before upload (age or GPG, key kept off GitHub).
  - Move the GitHub copy to Drive only, or prune history.
  - Say "deleted from backups within 90 days" in Privacy.
  - Add a "Download my data" ZIP: JSON plus the existing CSVs.
- **Priority:** Deletion fix now. Encryption within 30 days. Export within 60.
- **Attorney:** Not currently identified as necessary.

### R7. No DMCA agent or repeat-infringer policy; open public upload bucket
- **Severity:** High (confirmed)
- **Evidence:**
  - There is no DMCA section in the Terms, and no designated agent is referenced anywhere.
  - The playbook escalates takedowns (`docs/email-playbook.md:81`), but there's no published process.
  - Couples, guests, vendors and marketplace sellers can all upload photos.
  - The `guest-photos` bucket is anonymous-writable (R1).
- **Applicable authority:** 17 U.S.C. 512(c) safe harbor requires all of:
  - an agent designated in the Copyright Office directory ($6, renewed every 3 years);
  - a published notice-and-takedown process;
  - a reasonably carried-out repeat-infringer policy (§512(i)).

  Sources: https://www.copyright.gov/dmca-directory/ and 37 CFR 201.38. Separately, any service that learns of apparent child sexual abuse material must report it to NCMEC (18 U.S.C. 2258A) *(from memory, re-verify)*. Open anonymous uploads make that a real operational concern.
- **Consequences:** without the agent filing, you lose safe-harbor protection for user uploads, and statutory copyright damages run up to $150k per work for wilful infringement.
- **Fix:**
  - Register an agent at copyright.gov ($6; use privacy@ or a dmca@ alias and the PO box).
  - Add a Terms § "Copyright complaints", with the notice elements, counter-notice and repeat-infringer policy.
  - Add `/copyright` linked from the footer.
  - Add an admin takedown that hides a photo and logs it.
  - Lock down the bucket (R1).
- **Priority:** Next 30 days ($6 plus a short page).
- **Attorney:** Recommended (template review).

### R8. Claiming a listing doesn't prove ownership
- **Severity:** Medium-High (confirmed)
- **Evidence:**
  - Claim tokens are permanent and never expire (`src/lib/venue-claim-server.ts:71-88`; `vendor-claim-server.ts:24-36`).
  - For a listing without a stored email, a couple can type **any** recipient and the inquiry email includes the claim link (`src/app/vendors/actions.ts:25-39,69`). Anyone with a free account can get a claim link that way.
  - Ownership proof is a checkbox, and the admin review screen warns only when the email domain differs (`submission-review.tsx:61-63`).
  - An approved claim can change `contact_email`, which redirects all future leads (`src/app/admin/vendors/claim-actions.ts:63-76`).
  - Old approved submitters keep edit-link access (`src/app/list/actions.ts:129-165`).
- **Authority:** none specific. The risk is practical: impersonation, lead theft, and disputes between rival claimants. It also becomes misrepresentation once paid placement exists.
- **Fix:**
  - Leave the claim link out of inquiries sent to a couple-typed address.
  - Give tokens a 60-day expiry and rotate them after approval.
  - Approval checklist: email on the website's domain, or a phone call-back to the listed number, or a code sent to the listed email.
  - Notify the old `contact_email` when it changes.
  - Revoke previous editors on an ownership change.
- **Priority:** Before outreach starts.
- **Attorney:** Not currently identified as necessary.

### R9. No business insurance known
- **Severity:** High (unconfirmed; owner to answer)
- **Evidence:** nothing in the repo or docs mentions insurance.
- **Why it matters:** a disclaimer limits what a court awards; insurance pays for the defence, which is the expensive part even when you win. The realistic claims here are a privacy or security incident (R1, R6), a listing or AI-error dispute, a copyright or trademark letter (R7, R5), and a TCPA class action (R2).
- **Recommended coverage** to quote through a broker who handles tech startups:
  - Tech E&O plus cyber, often sold together (most important).
  - Media liability: copyright, trademark, defamation. Sometimes included in tech E&O.
  - General liability: cheap, often a lease or event requirement.

  Ask specifically whether TCPA claims are excluded (they often are), which is another reason to fix R2 rather than rely on cover. D&O isn't needed until there are investors or a board.
- **Priority:** Next 30 days (quotes), bound before public launch.
- **Attorney:** No. A **licensed insurance broker** is required.

### R10. Commercial content in email without CAN-SPAM pieces
- **Severity:** Medium (confirmed)
- **Evidence:**
  - No email has a postal address or unsubscribe link (`src/lib/resend.ts:21`).
  - Inquiry emails go to about 6k batch-researched addresses of businesses that never signed up. The footer adds a "claim your listing (free)" pitch and a lead count (`src/lib/inquiry-footer.ts:13-30`). That count includes the owner's test weddings (`src/lib/listing-leads.ts:19-41`, no `is_test` filter).
  - The admin bulk email to couples has free-form subject and body, with no opt-in check, unsubscribe or address (`src/app/admin/couples/actions.ts:9-60`).
  - The marketplace price-drop email has only "unsave it to stop" (`src/lib/marketplace-server.ts:185-218`).
  - Planned outreach is correctly gated, but the postal address box is unchecked (`docs/email-playbook.md:134-136`).
- **Applicable authority:**
  - CAN-SPAM, 15 U.S.C. 7701–7713 and 16 CFR 316. Email whose **primary purpose** is commercial, B2B included, needs:
    - honest headers and subject;
    - identification as an ad (unless the recipient consented);
    - a physical postal address (a PO box is fine);
    - a working opt-out honoured within 10 business days.
  - Penalty: $53,088 per email (2025 figure kept for 2026). https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-316 ; https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
  - A couple's inquiry is most likely **not** commercial in primary purpose, because the subject and body are the couple's request, so it's probably fine with the footer kept short.
  - Bulk admin email and price-drop alerts are closer to commercial.
  - A lead count inflated by test data is a separate FTC §5 accuracy problem.
- **Fix:**
  - Postal address in every email footer once the PO box exists.
  - A one-click "stop emails like this" link plus a suppression check on bulk and price-drop mail; reuse `outreach_opt_outs` plus a profile flag.
  - Limit admin bulk email to account and service notices until a marketing opt-in exists (`docs/legal.md` trigger).
  - Filter `is_test` weddings out of `leadCounts`.
- **Priority:** Lead-count filter now. Address and unsubscribe before outreach or any bulk send.
- **Attorney:** Not currently identified as necessary.

---

## 4. Other findings (shorter form)

| # | Issue | Sev. | Evidence | Authority | Fix | When | Attorney |
|---|---|---|---|---|---|---|---|
| R11 | Wren chat has no AI or "may be wrong" notice; personality prompt says "experienced wedding planner"; conversations kept indefinitely | Med | `wedding-assistant.ts:279,372-379`; `wedding-assistant-widget.tsx:272` | Cal. B&P 17940 (bot disclosure, applies when used to deceive in order to sell; low risk but cheap to meet); Utah AI Policy Act (disclose when asked); FTC §5 | One line under the input: "Wren is AI and can get things wrong. Check prices, dates and contracts with your vendor." Keep conversations 12 months, then purge | 30 days | No |
| R12 | Guest health-adjacent data (allergies, accessibility) collected with no notice | Med | `rsvp-form.tsx:235-236,288`; `0116` | Washington My Health My Data Act, RCW 19.373: no size threshold, private right of action. Coverage of "nut allergy" is **uncertain**, with no guidance. https://app.leg.wa.gov/RCW/default.aspx?cite=19.373 | LegalNotice on RSVP; field help text "shared only with the couple"; never sent to AI or vendors; add a Privacy line | 30 days | **Recommended** (ask whether MHMDA reaches this) |
| R13 | Marketing claims: "no credit card, ever" vs Terms §2 future pricing; "50 states covered" while coverage is still being built | Med | `src/app/page.tsx:13-15,102` | FTC §5; state UDAP | "No credit card needed"; "50 states" → actual count, or wait until `npm run coverage` is clean | Now (copy) | No |
| R14 | Scraping posture: `verify-batches.mjs` sends a spoofed Chrome User-Agent; no robots.txt check; Instagram-only vendors found by search | Med | `scripts/verify-batches.mjs:84-98`; `add-vendors/SKILL.md:47-60` | CFAA unlikely for public pages (*Van Buren*, 2021; *hiQ*, 9th Cir. 2022), but contract claims survive (hiQ's 2022 consent judgment). Meta terms bar automated collection | Honest UA (`YouDoIDoBot/1.0 +url`); honour robots.txt and blocks; no logged-in access; take facts only from Instagram, read manually | 30 days | No |
| R15 | Accessibility gaps | Med | 10 inputs with `outline-none` and no focus style (e.g. `listing-modal.tsx:51`); ~158 unlabelled inputs (Wren textarea `widget:419-434`); no focus trap in 9 dialogs; RSVP error not announced (`rsvp-form.tsx:321`); `text-ink/40–55` and `text-wren` contrast below 4.5:1 | ADA Title III: courts split on web-only businesses; DOJ guidance 2022 https://www.ada.gov/resources/web-guidance/. Cal. Unruh Act: $4,000 per violation (Civ. 52) | Target WCAG 2.2 AA: shared focus-visible style; labels; one `Dialog` component with focus trap; `role="alert"` on errors; contrast pass. Automated checks alone don't prove compliance | 60 days | No |
| R16 | Admin access relies on email allowlist; personal Gmail committed in `wrangler.jsonc:37`; signup minimum password 6 | Med | `src/lib/admin.ts:15-26`; `signup/page.tsx:42` | FTC Safeguards-style "reasonable security" | Confirm Supabase "Confirm email" is ON; require MFA on admin accounts; minimum 8 characters; move the admin list to a secret | 30 days | No |
| R17 | No rate limits or CAPTCHA on anonymous forms (RSVP, reports, contact, claim, unlock) | Med | `w/[slug]/actions.ts:116` (honeypot only) | — | Turnstile (free on Cloudflare) on anonymous forms; per-IP limits | 60 days | No |
| R18 | Cap hand-off pre-fills ChatGPT or Claude links with wedding basics | Low | `wedding-assistant.ts:224-234` | FTC §5 if undisclosed | Disclose in Privacy; the user clicks, so this is fine once said | With R3 | No |
| R19 | Marketplace: no age minimum; no seller terms beyond §4 | Low | `src/lib/marketplace.ts:52-68` (good banned-items list) | §230 covers user posts; CPSC recalled goods (already banned) | 18+ in Terms; marketplace § (as-is, between users, no warranty from us) | With R4 | Recommended (with R4) |
| R20 | Google Fonts fetched from Google on guest sites | Low | `site-design.ts:1588-1590` | US: disclosure only. EU: LG München 2022 (GDPR) | Self-host fonts or disclose | With R3 | No |

---

## 5. Existing protections (keep these)

- **Terms and Privacy:** both exist and are dated. Signup uses sign-in-wrap. `LegalNotice` is on 11 forms. Footers link to both.
- **Listings:**
  - Contact emails and phones hidden; inquiries go through the app (`public-listings.ts:9-20`).
  - Descriptions in our own words, never copied (`add-vendors/SKILL.md:91-94`).
  - No scraped photos or logos; no Google or Yelp data; Census and OSM geocoding.
  - Field provenance tracked (`field_sources`); removal policy "hide, never argue".
  - Reports flow to `/admin/listing-health`; only verified-and-described listings are indexable.
- **Outreach:** drafts only; gate checklist; banned words ("partner", "verified", "recommended"); opt-out table; bounce suppression.
- **AI:**
  - The contract reader says "starting point, not legal advice" and flags uncertain terms.
  - AI never sends or changes data without the couple confirming.
  - Anthropic doesn't train on API data (per Privacy; confirm in Anthropic's commercial terms).
- **Payments:** none. Registry money goes straight to Venmo, PayPal and the like. The marketplace says "we don't handle payments" and has a banned-items list.
- **Security basics:** RLS is on for every table; the contracts bucket is private; batch secrets are 32+ characters and compared in constant time; the webhook is signed; no secrets in git history beyond the public anon key.
- **Data safety:** weekly backups with a restore drill that passed.

## 6. Missing protections (summary)

- Legal entity.
- Postal address.
- DMCA agent and process.
- Insurance.
- Governing law.
- Indemnity and dispute clauses.
- Guest-form notices.
- SMS consent records and STOP.
- Accurate privacy statements.
- Unclaimed-listing disclosure.
- Ownership verification on claims.
- Complete deletion and export.
- Backup encryption.
- Admin MFA.
- Rate limiting.
- An accessibility baseline.
- Terms-version acceptance log.

## 7. Policies and agreements needed

| Document | Needed when | Notes |
|---|---|---|
| Terms of Service (couples, guests, marketplace) | Now (rewrite) | One document with sections. Guests get a short "Guest terms" § surfaced on RSVP |
| Privacy Policy | Now (corrections) | Add a California / "your rights" section now, even though CCPA doesn't apply yet. It's cheap and builds trust |
| Listing Terms (businesses: claim, `/list`, photo license, accuracy, removal) | Before outreach | Short; linked from claim and `/list` |
| Copyright / DMCA policy | 30 days | `/copyright` page |
| SMS terms | With R2 | Two lines in Terms plus the checkbox wording |
| Acceptable use / community rules (marketplace, guestbook) | 60 days | Fold into Terms |
| Paid Listing / Advertiser Agreement | **Before Phase 1 charging** | Auto-renewal disclosures: Cal. B&P 17600 et seq. as amended by AB 2863 (effective July 1, 2025): express consent, online cancel, annual reminders. Also ROSCA. The FTC click-to-cancel rule was vacated (8th Cir., July 2025). Sponsored placement needs a "Sponsored" label (FTC Endorsement Guides, 16 CFR 255) |
| Processor DPAs | 60 days | Accept the standard DPAs from Supabase, Cloudflare, Resend, Twilio, Anthropic and Google (mostly click-through) |

## 8. Required operational procedures

1. **Listing removal:** hide within 1 business day, confirm, log it (exists as policy; add a log table or note).
2. **Copyright/trademark notice:** check the notice elements, hide the item, notify the uploader, accept a counter-notice, track repeat infringers.
3. **Privacy request:** verify the requester through the account email, answer within 30 days, log date and outcome.
4. **Security incident:** contain, assess which data elements were exposed, check state notification triggers, notify within the shortest state deadline (30 days in CO, FL and WA), and call the insurer first if covered.
5. **Wedding-week support:** anything about a wedding less than 14 days away escalates (exists in the playbook). Add a public status note if the guest site is down.
6. **Claim verification checklist** (R8).
7. **Feature launch review** (section 10).

## 9. Necessary technical changes (grouped into proposed PRs)

- **PR A: copy and logic, low risk (≈1 PR).** Covers R2 tagline and STOP line and checkbox wording; R3 privacy corrections; R5 listing wording; R11 AI line; R12 RSVP notice; R13 landing copy; R10 `is_test` lead filter; `backups/` in `.gitignore`; R21 alt text.
- **PR B: data exposure (migration + loaders).** Covers R1 views to gated functions, `ship_to` gating, unlock rate limit, bucket policy; R6 recursive delete; SMS consent columns (`sms_opt_in_at`, `sms_consent_version`) and quiet hours.
- **PR C: claims (R8).** Token expiry and rotation, no claim link to couple-typed addresses, notice when the contact email changes.
- **PR D: Terms and DMCA page draft (R4, R7).** For attorney review; publish only after your sign-off. Add `terms_version` and `accepted_at` on profiles and listing submissions (evidence trail).
- **PR E: accessibility pass (R15)** and Turnstile (R17).
- **Ops, not code:**
  - backup encryption;
  - admin MFA;
  - Supabase email-confirm check;
  - Twilio STOP and 10DLC check;
  - DPAs.

## 10. Feature launch review (use before shipping anything new)

Answer each question; any "yes" means update `docs/legal.md` and this register:
- Does it collect a new kind of personal data, or data about people who aren't the user (guests, kids, vendors)? Add a notice next to the submit button, a Privacy line, and RLS.
- Is anything new public or visible to anon? Check the views and functions against R1.
- Does it send email or SMS? Decide transactional or commercial, opt-out, postal address, quiet hours.
- Does AI see new data, or speak for us? Update Privacy's AI list; disclose to the user.
- Does it say something about a business (verified, recommended, ranked, sponsored)? Keep to facts; label paid placement.
- Does it take money or renew automatically? Stop, and do section 7's paid-listing items first.
- Does it let users upload? DMCA path, file limits, moderation.
- Is it new to EU/UK users, or aimed at under-13s? Triggers in `docs/legal.md`.

## 11. Attorney and professional review queue

| # | Question / document | Who | Why |
|---|---|---|---|
| A1 | Entity choice and state; IP assignment to the entity | Attorney or formation service + CPA | Personal liability, tax |
| A2 | Terms rewrite: liability cap floor, indemnity, arbitration and class waiver (pros and cons for a consumer app), governing law | Attorney | Enforceability varies by state |
| A3 | Listing page wording and the unclaimed-listing model | Attorney (light touch) | Lanham Act, UDAP |
| A4 | Do guests' allergy and accessibility notes fall under Washington MHMDA? | Privacy attorney | No guidance exists; private right of action |
| A5 | Privacy Policy final review | Attorney | CalOPPA; FTC |
| A6 | Paid listing agreement and auto-renewal flow (before Phase 1) | Attorney | State auto-renewal laws |
| A7 | Insurance: tech E&O, cyber, media, GL; TCPA exclusions | Licensed broker | Coverage |
| A8 | Sales tax on paid listings (before Phase 1) | CPA | Digital-services tax varies by state |

## 12. Risk register (live)

| ID | Risk | Sev. | Likelihood | Status | Owner |
|---|---|---|---|---|---|
| R1 | Guest-site data enumerable / password bypass | Critical | High | Fixed, live 2026-10-19 (migration 0121): one site per request, password enforced in the database, address gated, unlock rate-limited, guest uploads server-side only. Pending photos still public until approved | Code |
| R2 | Marketing in guest SMS; no STOP or consent record | High | Med | Fixed, live 2026-10-21 (0122): ad removed, sender + STOP in every text, consent wording and time stored, STOP replies (Twilio 21610) clear the opt-in. Twilio number not yet registered for A2P 10DLC (owner) | Code + owner |
| R3 | Privacy Policy mismatches | High | High | Fixed, live 2026-10-21 (Oct 19 policy); attorney review still queued (A5) | Code + attorney |
| R4 | No entity; Terms gaps | High | Med | Open | Owner + attorney |
| R5 | "Verified" listing wording; no unclaimed notice | High | Med | Fixed, live 2026-10-21: "Checked against their website", unclaimed/not-affiliated note, "take it down" report reason (0123) | Code |
| R6 | Incomplete deletion; unencrypted backups; no export | High | Med | Deletion fix live. Backups encrypted (AES-256-GCM, `BACKUP_ENCRYPTION_KEY`) once the owner sets the key; files deleted from Storage leave the mirror after Drive's 30-day trash. Open: plaintext copies in the GitHub repo's history (owner: recreate the repo), data export | Code + owner |
| R7 | No DMCA agent or process | High | Med | Open | Owner + code |
| R8 | Weak claim verification | Med-High | Med | Mostly fixed: no claim link to a couple-typed address; links last 90 days (refreshed after 60); a new link after every approved claim; the old contact address is emailed when it's replaced; only the latest approved submitter can request links. Open: claim-form photo uploads go straight from the browser to public buckets | Code |
| R9 | No insurance known | High | Low–Med | Open (ask owner) | Owner + broker |
| R10 | CAN-SPAM pieces missing; test-inflated lead counts | Med | Med | Partly fixed: test weddings left out of lead counts. Unsubscribe built 2026-10-20 (0124: signup opt-in, /account toggle, /unsubscribe, one-click header, `sendMarketingEmail` refuses without address). Open: postal address (owner getting a PO box, 2026-10-20) and the two secrets | Code + owner |
| R11 | Wren AI notice | Med | — | Fixed, live 2026-10-21 (line under the chat input); retention purge open | Code |
| R12 | Guest health-adjacent data | Med | — | Partly fixed: notice on RSVP and address forms, Privacy line. MHMDA question still with attorney (A4) | Code + attorney |
| R13 | "No credit card, ever" | Med | — | Fixed, live 2026-10-21 ("needed"). "50 states" is accurate: every state meets coverage pass 1 | Code |
| R16 | Admin access | Med | — | Partly fixed: admin also requires a confirmed email. Owner: confirm "Confirm email" is on, admin MFA | Code + owner |
| R14, R15, R17–R20 | See section 4 | Med–Low | — | Open | Code |

Status values: Open, In progress, Fixed (date, PR), Accepted (reason, date).

**Check (2026-10-21):** migrations 0121–0123 are run in production (0121 and 0122 checked in the database, 0123 confirmed by the owner); the "fixed in branch" rows above now say "Fixed, live 2026-10-21".

## 13. Change monitoring (not automatic)

Nothing watches the law continuously yet. A quarterly entry already fits the
`/data-refresh` routine's "legal pages" item. On each run, check:
- the Section 230 sunset bills (H.R. 6746; the Senate Graham–Durbin bill);
- the TCPA "revoke-all" rule (delayed to Jan. 31, 2027);
- Colorado SB 26-189 rulemaking (effective Jan. 1, 2027; very likely not applicable);
- federal AI preemption;
- new state privacy laws with low thresholds;
- the FTC negative-option rulemaking;
- CCPA threshold adjustment (Jan. 1, 2027).

Update section 12 and the "Last updated" dates.

## 14. 30 / 60 / 90 days

- **Now (this week):**
  - PR A (copy and logic) and PR B (data exposure).
  - Owner: confirm Supabase email confirmation is on; turn on MFA for admin accounts.
- **30 days:**
  - Form the LLC.
  - Get a PO box.
  - Designate the DMCA agent ($6).
  - Get insurance quotes.
  - PR C (claims).
  - PR D drafted for the attorney.
  - Backup encryption.
  - Honest scraper User-Agent and robots.txt.
- **60 days:**
  - Attorney review (A2–A5), then publish the Terms and Privacy.
  - Data export.
  - Accessibility pass and Turnstile.
  - DPAs accepted.
  - Unsubscribe and address in email footers.
- **90 days (before 50-state marketing or outreach):**
  - Insurance bound.
  - Outreach gate fully ticked.
  - `/data-audit` clean on each metro before its outreach.
  - Re-run this audit.
  - Paid-listing agreement drafted only if Phase 1 is close.

**Before expanding nationwide:** R1–R10 closed or accepted in writing.
