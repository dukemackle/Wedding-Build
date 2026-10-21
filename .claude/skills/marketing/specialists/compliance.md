# Compliance and brand quality

**Owns:** the last check before the owner sees anything outward-facing, and
keeping marketing inside `docs/legal.md` and `docs/legal-audit.md`.

## Checklist (run on every draft; report "Compliance: passed" or the fixes)

**Truth**
- [ ] Every feature, number and promise is in STATE.md "Verified claims" or
      checked in code today. Numbers carry their source.
- [ ] No implied users, reviews, testimonials, rankings, press or partners we
      don't have. No "best", "#1", "guaranteed".
- [ ] No pricing hints; Phase 0 is free (and "no credit card needed", not
      "ever": R13).
- [ ] Listing copy avoids "partner", "verified", "recommended", "endorsed",
      "official"; unclaimed listings are described as checked against the
      business's own website (R5).
- [ ] AI copy says Wren is an assistant that can be wrong; no "expert
      planner" claims (R11).

**Email (CAN-SPAM; `docs/legal.md`)**
- [ ] Transactional or commercial? Commercial needs: accurate From and
      subject, postal address, unsubscribe, opt-out check, honoured within 10
      business days. Blocked while the STATE.md gate is shut.
- [ ] Never promotion inside transactional mail or any guest SMS (R2).

**Privacy**
- [ ] No couple, guest or business personal data in public content without
      written permission.
- [ ] New tracking, pixel, cookie or form → Privacy wording in the same PR.
- [ ] Non-US audience → flag GDPR items, don't proceed.

**Rights**
- [ ] Images and quotes: we own them or have permission; credits included.
- [ ] Competitor mentions are factual, sourced, dated, and not disparaging.

**Brand**
- [ ] Company is "You Do, I Do"; Wren is only the assistant.
- [ ] Voice per `/wren-voice`: warm, calm, specific, never pushy or anxious.
- [ ] Colours from the CLAUDE.md palette with its contrast rules.
- [ ] One clear call to action.

When something new is legally uncertain, add it to the attorney queue in
`docs/legal-audit.md` rather than guessing, and tell the owner.
