# Disaster recovery plan

What Wren runs on, how it's backed up, and what to do when something breaks.
Written for a solo owner: every step says where to click. Never put a password,
API key or recovery code in this file. It's in the repo, and the repo is not a
safe. Those belong in the password manager.

**Status:** started 2026-09-25. Work through **Part 1** once, then the routine
in **Part 5** keeps it true.

---

## Part 1: one-time setup (do these in order)

The biggest risk to a solo business isn't a server crash. It's losing access
to an account. Most of this list protects your logins.

- [ ] **1. Get a password manager** (1Password or Bitwarden). Every account
  below gets a unique, generated password stored there. Turn on its emergency
  access feature (Part 4, "If you're unavailable").
- [ ] **2. Lock down `wrenwed.com@gmail.com` first.** It's the key to
  everything, because password resets for every other account go to it.
  Use a new password, turn on 2-step verification with an authenticator app
  (not SMS), add a recovery phone and recovery email (`dukemackle1@gmail.com`),
  and save the backup codes in the password manager. Then do the same for
  `dukemackle1@gmail.com`.
- [ ] **3. Turn on 2-step verification everywhere else**, and save each
  site's recovery codes in the password manager: GitHub, Supabase, Cloudflare,
  Resend, Anthropic console, Google Cloud (Drive picker), the domain registrar,
  and the bank.
- [ ] **4. Fill in the account inventory in Part 2**: which email owns each
  account, and when each bill renews.
- [ ] **5. Protect the domain.** At the registrar: auto-renew **on**, a card
  on file that won't expire soon, **registrar lock / transfer lock on**, and
  renew for several years if it's cheap. A lapsed domain takes down the site,
  every login link and every email at once, and squatters watch for lapses.
- [ ] **6. Turn on the nightly backup** (Part 3, "Setup"). About 10 minutes.
- [ ] **7. Do one practice restore** (Part 3, "Restore drill"). A backup you've
  never restored from is only a guess.
- [ ] **8. Protect `main` on GitHub.** Settings → Branches → add rule for
  `main`: block force pushes and deletions. Production deploys from `main`, so
  this stops one bad command from erasing history.
- [ ] **9. Keep a copy of the code off GitHub.** Once a month:
  `git clone --mirror https://github.com/dukemackle/Wedding-Build` onto an
  external drive or cloud folder. The code is also on every machine you've
  cloned it to, but this is a deliberate copy.
- [ ] **10. Set up uptime alerts.** Sign up for UptimeRobot (free) and add a
  check on `https://wrenwed.com` that emails and texts you when it's down.
  Otherwise the first you hear of an outage is a couple telling you.

---

## Part 2: account inventory

Everything the business depends on. Fill in the blanks. **Owner email** means
the email you sign in with, and the one that receives resets.

| Service | What it does for Wren | Owner email | Plan / renews | 2FA on? |
|---|---|---|---|---|
| Gmail `wrenwed.com@gmail.com` | Business email, account resets | | Free | |
| Domain registrar (____) | `wrenwed.com`, `admin.wrenwed.com` | | renews ____ | |
| GitHub `dukemackle/Wedding-Build` | All the code. Deploys come from `main` | | | |
| Cloudflare Workers `wedding-build` | Hosts the website; builds on every push to `main` | | | |
| Supabase (project `tbvkuvjxjqrauncavhgz`) | Database, logins, uploaded photos and contracts | | Free | |
| Resend | Sends emails (invites, password resets) | | | |
| Anthropic console | AI features (`ANTHROPIC_API_KEY`) | | | |
| Google Cloud | "Choose from Drive" button | | Free | |
| UptimeRobot | Downtime alerts | | Free | |
| Bank / card on file | Pays all of the above | | | |

**Where the secret keys live** (the values are in the password manager and in
the Cloudflare dashboard, never here): `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `ANTHROPIC_API_KEY` are Cloudflare Worker secrets
(Workers → `wedding-build` → Settings → Variables and Secrets). The public
settings are in `wrangler.jsonc`. The full list of keys is `.env.example`.

**Where your data lives:**
- **Database**: all tables in Supabase's `public` schema, logins in `auth`.
  The table structure can be rebuilt from `supabase/migrations/` (82 files,
  run in order). The *data* only exists in Supabase and in the backups.
- **Uploaded files**: Supabase Storage buckets `contracts`, `wedding-photos`,
  `guest-photos`.
- **Code and history**: GitHub, plus your local clones.

---

## Part 3: backups

### What's covered

| What | How often | Kept for | Where |
|---|---|---|---|
| Database (all app data, logins, file index) | Nightly, ~3am ET | 30 days | GitHub → Actions → Backup → run → Artifacts |
| Uploaded files (photos, contracts) | Sundays | 30 days | Same, file name ends `-with-files` |
| Code | Every push | Forever | GitHub, plus your monthly mirror (Part 1 #9) |

Backups are encrypted with your `BACKUP_PASSPHRASE`. Anyone who can see the
repo can download them but can't open them without it. **If you lose the
passphrase, the backups are useless.** It goes in the password manager.

Supabase's free plan does not include its own backups. That's why this
workflow exists. When real couples are on the app, upgrading to Supabase Pro
($25/month) adds Supabase's own daily backups, and it's worth it as a second
layer. That cost decision is yours to make; the natural time is the week
before launch.

### Setup (once, about 10 minutes)

1. **Get the database address.** Supabase → your project → **Connect** →
   **Session pooler** → copy the URI (it looks like
   `postgresql://postgres.tbvkuvjxjqrauncavhgz:[YOUR-PASSWORD]@aws-...pooler.supabase.com:5432/postgres`).
   Put your database password in place of `[YOUR-PASSWORD]`. If you don't know
   the password, reset it on Project Settings → Database. Nothing in the app
   uses it, so resetting is safe. Use the **Session pooler** URI, not "Direct
   connection": GitHub's servers can't reach the direct one.
2. **Make a passphrase.** Generate a long one in the password manager and save
   it as "Wren backup passphrase".
3. **Add three secrets on GitHub:** repo → Settings → Secrets and variables →
   Actions → New repository secret:
   - `SUPABASE_DB_URL`: the URI from step 1
   - `BACKUP_PASSPHRASE`: the passphrase from step 2
   - `SUPABASE_SERVICE_ROLE_KEY`: same value as the Cloudflare secret
4. **Test it now:** Actions tab → **Backup** → **Run workflow** → tick "Also
   back up uploaded files" → Run. After a few minutes it should go green, and
   the run page should show one artifact under **Artifacts**.
5. **Get told when it fails:** GitHub → your avatar → Settings →
   Notifications → Actions → "Only notify for failed workflows" (email on).

### Restore drill (do once now, then every 3 months)

This proves the backup works. Do it into a **new, empty Supabase project**,
never into production.

1. Download the newest artifact from Actions → Backup. It arrives as a `.zip`
   with a `.tar.gz.gpg` inside.
2. Decrypt and unpack (Terminal on a Mac):
   ```
   unzip wren-backup-*.zip
   gpg -d wren-backup-*.tar.gz.gpg > backup.tar.gz   # asks for the passphrase
   mkdir backup && tar -xzf backup.tar.gz -C backup
   ```
   You now have `public.sql`, `auth-and-storage-index.sql`, and a `storage/`
   folder if it was a weekly copy.
3. Create a scratch Supabase project, copy its **Session pooler** URI, and run:
   ```
   psql "$SCRATCH_URL" -f backup/auth-and-storage-index.sql
   psql "$SCRATCH_URL" -f backup/public.sql
   ```
   Logins go in first, because app rows point at user ids. A few
   "already exists" messages are normal, because a new project already
   has some of the built-in pieces.
4. Open the scratch project's Table Editor and check that the weddings,
   guests and vendors you expect are there. Then delete the scratch project.
5. Write the date in the log at the bottom of this file.

If a step fails, that's the drill working. Fix it now, while nothing is on
fire.

---

## Part 4: what to do when something goes wrong

First, for any incident: **write down the time and what you saw**, then work
the matching playbook. Afterwards, add a line to the log at the bottom.

### The site is down or showing errors
1. Check whether it's you or them: cloudflarestatus.com, status.supabase.com,
   and Resend's status page (linked from its site footer).
2. If a service is having an outage, there's nothing to fix. Wait, and post a
   short note wherever couples would look.
3. If it broke right after a merge, **roll back first and investigate after**.
   Cloudflare → Workers → `wedding-build` → **Deployments** → pick the last
   good version → **Rollback**. It takes seconds. Then revert the bad PR on
   GitHub (the PR page has a **Revert** button) so the next deploy doesn't
   bring the bug back.
4. If the build itself fails, see the Deployment note in `CLAUDE.md`. Both
   known failure modes and their fixes are there.
5. Runtime errors: Cloudflare → Workers → `wedding-build` → **Logs**.

### Data was deleted or corrupted (a bug, a bad migration, a mistake)
1. **Stop the damage.** If a deploy caused it, roll back (above).
2. Work out *what* is wrong and *since when*. It's usually one wedding or one
   table, not everything.
3. Take the newest backup from before the problem started, decrypt it (Restore
   drill steps 1–2), and restore it into a **scratch project** (step 3).
4. Copy just the affected rows back into production. Don't restore the whole
   database over the live one: that would wipe everything everyone did since
   the backup. This part is delicate, so it's a good one to do with Claude.
5. If couples could see it, tell the affected ones plainly what happened.

### An API key leaked (pushed to GitHub, pasted somewhere, laptop stolen)
Assume it's being used. Replace it, then update Cloudflare:
- **Supabase service role key**: the most dangerous one, because it bypasses
  all data protections. Supabase → Project Settings → API Keys → replace the
  secret / service_role key so the old one stops working.
- **Resend**: Resend → API Keys → delete the old key, create a new one.
- **Anthropic**: console.anthropic.com → API Keys → disable, create new.
  Check Usage for spend you didn't make.
- **Database password**: Supabase → Project Settings → Database → reset, then
  update the `SUPABASE_DB_URL` GitHub secret.

Then put the new values in Cloudflare → Workers → `wedding-build` → Settings →
Variables and Secrets, and in the password manager. The anon key and Google
keys in `wrangler.jsonc` / `.env.example` are public by design and don't need
this.

### You're locked out of an account
Use the recovery codes in the password manager. That's what they're for.
Without codes, every provider has an account-recovery flow, but it's slow
(days to weeks) and not guaranteed. This is why Part 1 #2–3 matter most.

If the **Gmail** is compromised (password changed, strange sent mail): recover
it first, before anything else, since it can reset everything else. Then change
the password on every account in Part 2, because an attacker with the Gmail may
have reset them.

### The domain stopped working
1. Check the registrar for a lapsed renewal or a failed card. Renew it. Most
   registrars give a grace period of about 30 days.
2. If the renewal is fine, check Cloudflare → the domain → DNS. The records
   pointing at the Worker may have been changed.
3. If a transfer happened that you didn't authorise, contact the registrar's
   support immediately. The transfer lock (Part 1 #5) is what prevents this.

### A laptop or phone is lost or stolen
Everything important is in the cloud, so this is about access, not data.
From another device: change the password-manager master password, sign the
lost device out of Google and GitHub (both have "devices / sessions" pages),
and if the device had a `.env.local` file on it, rotate the keys (see "An API
key leaked" above). Your authenticator app should be one that syncs or has a
backup (e.g. the password manager's built-in one), or losing the phone locks
you out of everything.

### Personal data may have been exposed (a data breach)
Guest lists hold names, addresses and emails of people who never signed up
themselves, so treat this seriously.
1. Close the hole: rotate keys, roll back, and disable the feature if needed.
2. Work out what was exposed and whose data it was.
3. Many US states, and the EU/UK if any users are there, require you to notify
   affected people, often within 30–72 hours. **Talk to a lawyer before
   sending anything.** This is a judgment call with legal weight.
4. Tell affected couples plainly: what happened, what data, what you've done.

### If you're unavailable (sick, travelling, worse)
Someone you trust should be able to keep the lights on or shut things down
properly. Set up the password manager's **emergency access** for that person.
It lets them request entry, which unlocks after a waiting period you choose
unless you decline. Put a note in it pointing them to this file. Before
launch this mostly means "don't let the domain lapse". After launch it means
"email the couples".

---

## Part 5: the routine

**Weekly (2 minutes):** glance at GitHub → Actions → Backup. Every run in the
last week should be green.

**Monthly (15 minutes):**
- Mirror the repo to your drive (Part 1 #9).
- Check each service's billing page: any surprise charges, any card expiring?
- Check Supabase → Reports for database size against the free-plan limit (500 MB).

**Every 3 months (30 minutes):**
- Restore drill (Part 3).
- Read through Part 2. Is anything new missing? Delete accounts you no longer use.
- Confirm you can still sign into every account with 2FA. Recovery codes that
  are out of date are as bad as none.

**Every year:** domain renewal date, and re-read this whole file.

---

## Business protection (worth a conversation, not a download)

These aren't technical, and each one is **your call**, ideally with an
accountant or lawyer, and not something to decide from a doc. Roughly in
order of when they matter:

- **An LLC.** It separates your personal assets from the business's
  liabilities. Cheap and simple in most states. Worth doing before real
  couples sign up.
- **A separate business bank account and card.** Pay every service in Part 2
  from it. Clean records make taxes easy, and it's what keeps the LLC's
  protection from being ignored.
- **Keep receipts.** One folder (e.g. Google Drive → "Wren / Receipts / 2026")
  for every invoice. Most of these costs are deductible.
- **Cyber / professional liability insurance.** You'll be holding strangers'
  personal data and couples' vendor contracts. Get a quote once you have
  users.
- **Terms and privacy policy.** `/terms` and `/privacy` exist. Have a lawyer
  review them before launch, and keep them in step with the product: when a
  feature changes what data you collect or share, the policy changes too.

---

## Incident & drill log

| Date | What happened / what was tested | Outcome, and what changed |
|---|---|---|
| 2026-09-25 | Plan written, backup workflow added | Setup (Part 1) not yet done |
