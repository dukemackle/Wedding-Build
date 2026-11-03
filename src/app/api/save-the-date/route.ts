import { saveSaveTheDate } from "@/app/guests/save-the-date/actions";

// The save-the-date editor's autosave, as a plain route rather than a Server
// Action call, for the reason in /api/site-design: an action's ID changes
// with every build, so an editor tab opened before a deploy would fail every
// save after it. This URL doesn't change between builds.
//
//   POST {"doc": {...}, "version": "<updated_at>" | null}

export async function POST(request: Request) {
  // Cookies ride along on cross-site POSTs, so only accept our own pages.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return Response.json({ error: "That request didn't come from the editor." }, { status: 403 });
  }

  let body: { doc?: unknown; version?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return Response.json({ error: "That card couldn't be saved." }, { status: 400 });
  }
  const version = typeof body.version === "string" ? body.version : null;
  return Response.json(await saveSaveTheDate(body.doc, version));
}
