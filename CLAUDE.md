@AGENTS.md

# You Do, I Do: project rules

**You Do, I Do** (youdoido.com; wrenwed.com 301s to it) is a wedding-planning
SaaS: a couple app (guests, budget, seating, itinerary, checklist, venue/vendor
discovery) plus an admin at admin.youdoido.com. **Pre-launch, no outside users,
not monetized**; the owner builds and tests solo. **Wren** is the AI assistant
(the bird): copy where Wren reads/drafts/answers says "Wren", copy naming the
company says "You Do, I Do". Full wording and history of every rule below:
`docs/claude-reference.md`.

## Design
- **Palette** for any new or changed colour: Lemon `#FFF12F`, Gold `#FFD301`,
  Royal `#2243B6`, Sky `#00BFFE`, Aqua `#5AE4FF`; draw shades from these. The
  yellows, Sky and Aqua are fills only: navy or Royal text on them, never white
  or small text. Untouched navy `#14203d` / Sunshine `#e0a100` screens stay.
- **Colour roles:** blue (`--color-wren`) is Wren's and sits on navy; gold
  (`--color-brass`, `gold-*`) is the brand's, marks what matters most, and sits
  on white/cream. One or two highlights per page.
- Use the `design-expert` skill for any UI/layout/styling work; briefly
  recommend high-value design improvements. Propose a direction before a major
  visual change; never start an unasked redesign.
- **Desktop and mobile are two designs.** Wide screens get columns and side
  panels, phones one column and a menu. Use breakpoints, never one shared
  value that "works on both". Check new screens at 375px and ~1440px.
- **Page widths:** only the five names in `src/lib/layout.ts` (READING,
  STANDARD, WIDE, CANVAS, FULL) via `PageShell`; no hardcoded `max-w-*`. The
  nav always spans the full screen. Venues and Vendors are full-bleed
  Zillow-style browse screens (`src/components/search-shell.tsx`), no cap.
- **Venues and vendors are siblings:** a change to one gets checked against
  the other; do both in the PR or say why not.
- **Landing previews:** when a PR adds or changes a couple-facing feature,
  update its demo in `src/components/landing/feature-previews.tsx` (and the
  one-sentence blurb in `landing-features.tsx`) in the same PR, unasked.

## Shipping
- Visual/UI or risky changes: show a preview (screenshot) or confirm the plan
  before committing. Text-only, logic-only, migrations and RLS ship directly.
- Once the owner OKs a preview, open the PR without asking again. The merge is
  the owner's. Production deploys from `main` to Cloudflare Workers (build
  command `npm run cf:build`); failed builds → `/deploy-doctor`.
- **Batch PRs merge themselves:** a PR that only adds rows under
  `src/lib/batches/` is merged by the "Batches" GitHub Action once the build is
  green, and it runs `npm run import:batches`. One file per state
  (`venues/<state>.ts`, `vendors/<state>.ts`, `skipped/<state>.tsv`); the old
  `venue-batches.ts` / `vendor-batches.ts` are closed. Plan:
  `scripts/coverage-plan.mjs`, progress: `npm run coverage`. No marketing until
  every state has listings. How-to: `/add-venues`, `/add-vendors`.

## Skills to use
`/marketing` for any marketing, growth, SEO, social, ads or hello@ inbox work
(drafts only; nothing sent, posted, spent or published without approval).
Chief of Staff mode for business/product questions: answer from what's known,
call only the relevant agent in `.claude/agents/`, give one recommendation with
its trade-off; read `docs/ai-operating-system/README.md` first.

## Priorities until there are outside users
1. Product quality. 2. Wedding-industry fit (real couples and vendors).
3. Light financial discipline: watch infra cost; no billing ahead of
`docs/monetization.md`; flag decisions expensive to retrofit. 4. Growth and
monetization parked. Separate verified facts from guesses; never invent
metrics, research, feedback or completed work; flag the owner's judgment calls
and the one or two risks they haven't caught. Record owner decisions in
`docs/ai-operating-system/decisions.md`.

## Working efficiently (owner is on a usage budget)
- Short replies; no tables unless asked; don't restate the request or re-summarise.
- When the owner must do something themselves, give numbered steps with the
  exact menu path, button names, what the value looks like and where to paste
  it. Exceptions: merging a PR and running a migration (just give the link or
  file name).
- Ask for a screenshot before proposing a visual fix.
- Batch related changes into one PR.
- Don't re-read files already in context; read only the part needed.
- Suggest a fresh session when the subject changes. Clear finished tasks.
- Scheduled routines are the biggest usage cost; don't add or speed one up
  without the owner's OK.

## Read on demand (not every turn)
- `docs/claude-reference.md`: full wording and history of the rules above.
- `docs/monetization.md`: pricing roadmap and phase triggers.
- `docs/competitors.md`: The Knot, Zola, Joy; gaps, parked and shipped features.
- `docs/email-playbook.md`: inbound mail handling and reply policy.
- `docs/retention.md`: what would make users leave, and status.
- `docs/legal.md`: terms/privacy/consent; check before any new form or trigger.
- `docs/legal-audit.md`: legal risk register; update a risk when a fix ships.
- `docs/admin-blueprint.md`: admin roadmap (`youdoido-admin-master` skill).
- `docs/ai-operating-system/`: the AI team and Founder Briefing.
