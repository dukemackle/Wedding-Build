---
name: weekly-review
description: Weekly status for You Do, I Do -- signups, vendors, venues, and infra usage on Supabase, Cloudflare and Resend, with anything worth flagging. Use when the owner runs /weekly-review or asks how the week went / where the numbers are.
---

# Weekly review

A short status the owner can read in under a minute. Numbers first, then only
the things that need a decision or a click.

## 1. Pull the numbers

```bash
node scripts/weekly-review.mjs
```

It prints JSON and never stops on one bad source: anything it couldn't reach
is listed under `unavailable` with the reason. Keys come from the environment,
then `.env.local`/`.env`:

| Source | Keys |
| --- | --- |
| Counts, signups | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| DB + storage size | `SUPABASE_ACCESS_TOKEN` (Supabase personal access token) |
| Worker requests | `CLOUDFLARE_API_TOKEN` (Account Analytics: Read), `CLOUDFLARE_ACCOUNT_ID` |
| Emails sent | `RESEND_API_KEY` -- must be a full-access key; a send-only key gets 401 |
| Untagged test weddings | `ADMIN_EMAIL` |

If keys are missing in a cloud session, say which, and point the owner at the
environment's secrets (read `read_documentation` topic `environment.secrets`).
If a host is refused by the proxy, read `environment.network`. Don't invent
numbers for a missing source -- say "not pulled" and link the dashboard
(supabase.com/dashboard, dash.cloudflare.com, resend.com/emails).

## 2. Write the status

Keep it to roughly ten lines, plain text, no tables:

- **Couples:** real weddings total (+ this week), auth users, active in 30 days.
  Test weddings are excluded, as on the admin pages.
- **Vendors / venues:** totals (+ this week), pending submissions.
- **Activity:** real vendor + venue inquiries this week.
- **Infra:** each provider as "used / free-tier limit" -- Supabase DB MB/500 and
  storage MB/1000, Cloudflare peak day/100k, Resend 24h/100 and 30d/3,000.
- **Flags:** see below. If none, say "Nothing to flag."

## 3. What's worth flagging

Raise these, most important first. Skip anything that's normal.

- **First outside users.** We're pre-launch with no outside users, so any
  `weddingsRealThisWeek > 0` is news -- unless it's the owner (next point).
- **Owner weddings not marked test** (`untaggedOwnerWeddings`): they skew every
  growth number. Fix is the test toggle on /admin/couples.
- **Free tier past ~70%** on any limit (DB 350MB, storage 700MB, 70k
  requests/day, 70 emails/day, 2,100/month). Say what crosses next and roughly
  what the paid tier costs -- check the provider's pricing page rather than
  guessing.
- **Cloudflare errors above 1% of requests**, or a peak day far above the
  average (a bot or a loop, not growth, at this stage).
- **Resend bounces or complaints** -- those hurt the sending domain's
  reputation, which matters for every invite and inquiry email.
- **Data quality:** vendors/venues `missingGeo` (they don't show on the map),
  `sample` rows still live, `inactive` counts that jumped.
- **Queues waiting on the owner:** pending vendor/venue submissions, new
  feedback, pending guest posts.
- **Vendor build-out:** if no vendors were added this week, mention the next
  Austin categories from CLAUDE.md (hair & makeup, videography, cake,
  officiant, rentals) -- one line, not a plan.

Don't lead with growth or pricing advice; per CLAUDE.md that's parked until
there are real users. Don't commit or open a PR as part of a review.
