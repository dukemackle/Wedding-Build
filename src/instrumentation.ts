import type { Instrumentation } from "next";

// Control flow Next.js throws on purpose (redirect(), notFound(), dynamic
// rendering bail-outs). Not errors, so not logged.
const EXPECTED_DIGESTS = /^(NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK|DYNAMIC_SERVER_USAGE|BAILOUT_TO_CLIENT_SIDE_RENDERING)/;

function areaFor(routePath: string) {
  if (routePath.startsWith("/w/")) return "guest_site" as const;
  if (routePath.startsWith("/admin")) return "admin" as const;
  if (routePath.startsWith("/api/")) return "api" as const;
  return "app" as const;
}

/**
 * Every server error Next.js catches -- a page, route handler or server action
 * that throws -- lands in app_errors for the admin Home. Only the route
 * pattern is kept (`/w/[slug]`), not the URL or headers.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, _request, context) => {
  const digest = typeof error === "object" && error && "digest" in error ? String(error.digest) : undefined;
  if (digest && EXPECTED_DIGESTS.test(digest)) return;
  const { logError } = await import("@/lib/error-log");
  const source = (context.routePath || "unknown").replace(/^\/src/, "").replace(/^\/app/, "") || "/";
  await logError(areaFor(source), `${source} (${context.routeType})`, error, digest);
};
