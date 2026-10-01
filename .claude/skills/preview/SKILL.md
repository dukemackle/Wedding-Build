---
name: preview
description: Screenshot a change at 375px (phone) and 1440px (desktop) so the owner sees both designs before anything ships. Use before committing any visual/UI change, or when the owner asks to see a page, a preview, or "what it looks like".
argument-hint: "[/path ...]  e.g. /preview /budget /guests"
---

# /preview

Desktop and mobile are two designs (CLAUDE.md), so every visual change is shown
at both widths before it's committed. This skill takes the screenshots.

## Steps

1. **Pick the pages.** Use the paths given as arguments. With none, use the
   pages the current diff touches (`git diff --name-only main...` plus unstaged:
   `src/app/<route>/...` → `/<route>`; a shared component → one or two pages
   that render it). A landing-preview change (`src/components/landing/`) → `/`.

2. **Start the app** if nothing answers on :3000
   (`curl -s -o /dev/null -w '%{http_code}' localhost:3000`):
   - `npm ci` first if `node_modules` is missing.
   - `npm run dev` with `run_in_background`, then wait for the port (Monitor
     with an until-loop on the curl above; first compile takes ~30–60s).
   - The app needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     (in `.env.local` or the cloud environment's variables). Without them
     every page, the home page included, is a Next.js "Runtime Error" overlay.
     The script flags this as a page error. Don't send those shots: tell the
     owner the env vars are missing (cloud sessions: Environment settings →
     environment variables).

3. **Shoot:**
   ```
   node .claude/skills/preview/shoot.mjs /budget /guests
   ```
   Options: `--full` (whole scrolling page instead of the first screen),
   `--base URL` (e.g. a Cloudflare preview deploy; in cloud sessions
   Chromium doesn't trust the egress proxy's certificate, so external URLs fail
   with ERR_CERT_AUTHORITY_INVALID. Use the local dev server there), `--out DIR` (default
   `preview/`, gitignored). Signed-in pages need `PREVIEW_EMAIL` and
   `PREVIEW_PASSWORD` (a test couple account) in the environment; the script
   signs in once through /login. Without them it shoots the login screen and
   warns — tell the owner those shots aren't the real page.

4. **Read every PNG yourself** (Read tool) before sending. Check for: content
   cut off or overlapping, horizontal scroll (the script flags it), a desktop
   shot that's just the phone column centred in whitespace, a seven-tab strip
   squeezed onto the phone, light yellows/Sky/Aqua used as text. Fix and
   reshoot rather than sending something broken.

5. **Send** the pairs with SendUserFile (`display: "render"`), phone and
   desktop for each page together. Caption in one or two lines: which parts
   belong to which layout, and anything the shots can't show (hover,
   animation, signed-out data). Then stop and wait for the owner's go-ahead —
   don't commit the visual change until they say it looks good (after that,
   per CLAUDE.md, open the PR without asking again).

## Notes

- Shots wait for network idle plus 0.8s for entrance animations. For a
  specific interaction (open a modal, drag the mobile sheet up), write a
  short one-off Playwright script in the scratchpad reusing `shoot.mjs`'s
  setup rather than growing this one.
- Venues and Vendors are full-bleed by design (map + results); don't flag
  their lack of a max-width.
- Delete `preview/` contents between rounds so old shots aren't resent.
