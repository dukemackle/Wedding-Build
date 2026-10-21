// The shared secret behind the batch routine's endpoints (/api/import-batches
// and /api/batch-sync): BATCH_IMPORT_SECRET, set in Cloudflare and in the
// routine's environment, rather than an admin login the routine doesn't have.

/** Constant-time compare, so the secret can't be guessed a character at a time. */
function matches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** A response to send back when the request isn't the routine's, else null. */
export function refuseBatchCaller(request: Request): Response | null {
  return refuseUnlessSecret(request, process.env.BATCH_IMPORT_SECRET, "Batch import isn't switched on.");
}

/**
 * The same check against any shared secret, for other scheduled callers
 * (the spend reminders use SPEND_REMINDER_SECRET) so each can be replaced
 * without breaking the rest.
 */
export function refuseUnlessSecret(request: Request, secret: string | undefined, offMessage: string): Response | null {
  // Unset means switched off, not open to anyone.
  if (!secret || secret.length < 32) {
    return Response.json({ error: offMessage }, { status: 503 });
  }
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!matches(given, secret)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return null;
}
