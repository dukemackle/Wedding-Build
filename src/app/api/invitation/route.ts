import { saveInvitation } from "@/app/guests/invitations/actions";

// The invitation editor's autosave (as /api/save-the-date), as a plain route rather than a Server
// Action call, for the reason in /api/site-design: an action's ID changes
// with every build, so an editor tab opened before a deploy would fail every
// save after it. This URL doesn't change between builds.
//
//   POST {"id": "<card id>", "doc": {...}, "version": "<updated_at>"}

export async function POST(request: Request) {
  // Cookies ride along on cross-site POSTs, so only accept our own pages.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return Response.json({ error: "That request didn't come from the editor." }, { status: 403 });
  }

  let body: { id?: unknown; doc?: unknown; version?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return Response.json({ error: "That invitation couldn't be saved." }, { status: 400 });
  }
  const version = typeof body.version === "string" ? body.version : null;
  const id = typeof body.id === "string" ? body.id : "";
  return Response.json(await saveInvitation(id, body.doc, version));
}
