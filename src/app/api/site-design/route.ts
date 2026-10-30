import { publishSiteDesign, saveSiteDraft } from "@/app/guests/site/actions";

// The site editor's autosave and Publish, as a plain route rather than a
// Server Action call. A Server Action is addressed by an ID baked into each
// build, so after every deploy an editor tab opened before it got a 404 on
// every save ("Couldn't save — check your connection") until it was
// reloaded. With batch PRs deploying several times an hour, that was most
// editing sessions. This URL doesn't change between builds.
//
//   POST {"publish"?: boolean, "designId": "<uuid>", "design": {...}, "version": "<updated_at>" | null}

export async function POST(request: Request) {
  // Cookies ride along on cross-site POSTs, so only accept our own pages
  // (the same check Next.js makes on Server Actions).
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return Response.json({ error: "That request didn't come from the editor." }, { status: 403 });
  }

  let body: { publish?: unknown; designId?: unknown; design?: unknown; version?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return Response.json({ error: "That design couldn't be saved." }, { status: 400 });
  }
  const designId = typeof body.designId === "string" ? body.designId : "";
  const version = typeof body.version === "string" ? body.version : null;
  const result = body.publish
    ? await publishSiteDesign(designId, body.design, version)
    : await saveSiteDraft(designId, body.design, version);
  return Response.json(result);
}
