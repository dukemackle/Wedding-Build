// Merges open batch-only PRs whose Cloudflare build is green, so the batch
// builders' PRs go in without a Claude run. Called by .github/workflows/batches.yml:
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/merge-batch-prs.mjs
//
// A PR qualifies when every file it changes is a batch file, it isn't a
// draft, GitHub says it merges cleanly, and the head commit's "Workers Builds"
// check succeeded. Anything else (a failed build, a conflict) is left alone
// for the "Venue & vendor batches" routine. Prints how many it merged as the
// last line, `merged=<n>`, for the workflow to read.

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
if (!TOKEN || !REPO) {
  console.error("GITHUB_TOKEN and GITHUB_REPOSITORY must be set.");
  process.exit(1);
}

const isBatchFile = (f) =>
  f.startsWith("src/lib/batches/") || f === "src/lib/venue-batches.ts" || f === "src/lib/vendor-batches.ts";

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
  const body = res.status === 204 ? null : await res.json();
  return { ok: res.ok, status: res.status, body };
}

const pulls = (await gh("/pulls?state=open&per_page=100")).body ?? [];
let merged = 0;

for (const pr of pulls) {
  if (pr.draft) continue;
  const files = (await gh(`/pulls/${pr.number}/files?per_page=100`)).body ?? [];
  if (!files.length || files.length === 100 || !files.every((f) => isBatchFile(f.filename))) continue;

  const sha = pr.head.sha;
  const runs = (await gh(`/commits/${sha}/check-runs?per_page=100`)).body?.check_runs ?? [];
  const build = runs.find((r) => r.name.startsWith("Workers Builds"));
  if (build?.conclusion !== "success") {
    console.log(`#${pr.number}: build ${build ? build.conclusion ?? build.status : "not reported"}, skipped`);
    continue;
  }

  // mergeable is null while GitHub works it out; the next run picks it up.
  const detail = (await gh(`/pulls/${pr.number}`)).body;
  if (detail?.mergeable !== true) {
    console.log(`#${pr.number}: mergeable=${detail?.mergeable}, skipped`);
    continue;
  }

  const res = await gh(`/pulls/${pr.number}/merge`, {
    method: "PUT",
    body: JSON.stringify({ sha, merge_method: "merge" }),
  });
  if (res.ok) {
    merged++;
    console.log(`#${pr.number}: merged (${pr.title})`);
  } else {
    console.log(`#${pr.number}: merge refused, ${res.status} ${res.body?.message ?? ""}`);
  }
}

console.log(`merged=${merged}`);
