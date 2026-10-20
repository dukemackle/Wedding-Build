# Design principles

The test for any screen: *would a couple show this to a friend, and could they
use it at 11pm on a phone without help?* Both halves matter.

## 1. Calm luxury, not luxury-store intimidation

Premium comes from restraint: generous space, a few beautiful type moments,
real photography, precise alignment. Not from gradients, gloss, or gold on
everything. One or two highlights per page (CLAUDE.md); if everything shines,
nothing does.

## 2. Typography leads

- One display moment per screen. Cormorant (`font-display`) is the voice of
  the brand; it's beautiful large and weak small. Don't set it below ~18px.
- IBM Plex Sans carries everything that must be read. Body text ≥ 15px on
  phones; never ship 11px text a couple has to read (eyebrows and labels can
  be small, sentences can't).
- Plex Mono for numbers and eyebrow labels, which is a deliberate stationery
  feel. Keep tracking consistent (pick 0.18em) rather than per-screen.
- Line length ≤ ~70 characters (READING width exists for this).
- Hierarchy through size and weight steps, not colour alone.

## 3. One clear next step

Every planning screen should answer "what should we do now?" A wedding is
months of decisions with dependencies (venue → date → vendors → invitations
→ RSVPs → seating). Reflect that order; don't present ten equal tiles and
leave the couple to work it out.

## 4. Wedding reality beats SaaS convention

- Couples are often two people with different levels of involvement, plus
  parents with opinions and money. Design for sharing and for "what will my
  mum see".
- Many couples don't have a date, venue or budget yet. Never make those
  required to start.
- Budget anxiety is real: show money calmly, never in alarm red unless
  something is genuinely overdue.
- Guest-list politics: never expose a guest's group, tier or notes on
  anything a guest could see.
- Day-of: itinerary, run sheet and seating must print well and read on a
  phone in sunlight.

## 5. Two designs, not one that stretches

Desktop gets columns, side panels and denser tables; a phone gets one column,
big targets and sheets. Neither is the other's fallback (CLAUDE.md has the
full rule and the Venues/Vendors exception).

## 6. Every state is designed

Empty, loading, partial, error, success, and "not set up yet" are screens in
their own right. An empty state says what this is for and offers the one
action that fills it (the checklist's "Build my plan" is the model). A dead
end that only says "set up your wedding first" is a missed handoff.

## 7. Motion means something

Motion confirms an action, shows where something went, or marks a milestone.
It never delays a task or loops in a planning tool. See
[ANIMATION-GUIDELINES.md](ANIMATION-GUIDELINES.md).

## 8. Accessible by default

WCAG 2.2 AA: 4.5:1 body text, visible keyboard focus everywhere, targets
≥ 24px (44px preferred on touch), labels on every input, alt text that
describes, reduced motion honoured. The light brand colours are fills, never
text on white (CLAUDE.md).

## 9. Honest and trustworthy

Claims match the product. Sample data is labelled as a sample. Listing data
says where it came from and how fresh it is. Trust is the product for venues
and vendors, and it's the reason couples keep their guest list here.

## 10. Original

Learn from the best sites (INSPIRATION-LIBRARY.md), then make something that
could only be You Do, I Do: the rings, Wren, stationery-like type, warm
paper and gold.

## Avoid

Generic AI-landing aesthetics (centred hero, purple gradient, three icon
cards, "Everything you need in one place"); stock-component greys leaking in;
excessive gradients; overcrowded dashboards; motion for its own sake; tiny or
low-contrast text; decoration that sits over a task; a desktop layout that's
just the phone layout with margins.
