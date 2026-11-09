import { refuseBatchCaller } from "@/lib/batch-secret";
import { isAutomationJob, logAutomationRun } from "@/lib/automation-log";

// Where scheduled jobs report a run for /admin/automations. Same shared
// secret as the batch endpoints (BATCH_IMPORT_SECRET), which the Batches
// GitHub Action and the batch-builder routines already hold.
//
//   curl -X POST https://youdoido.com/api/automation-log \
//     -H "Authorization: Bearer $BATCH_IMPORT_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"job":"batches","ok":true,"summary":"merged 2"}'
//
// `summary` is counts and links only: no names, emails or secrets.

export async function POST(request: Request) {
  const refused = refuseBatchCaller(request);
  if (refused) return refused;
  let body: { job?: unknown; ok?: unknown; summary?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!isAutomationJob(body.job)) return Response.json({ error: "Unknown job." }, { status: 400 });
  if (typeof body.ok !== "boolean") return Response.json({ error: "ok must be true or false." }, { status: 400 });
  const summary = typeof body.summary === "string" ? body.summary : undefined;
  await logAutomationRun(body.job, body.ok, summary);
  return Response.json({ ok: true });
}
