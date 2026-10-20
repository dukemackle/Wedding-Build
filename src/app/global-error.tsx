"use client";

import "./globals.css";

/**
 * The last resort, for an error in the root layout itself. It replaces the
 * whole document, so it can't use the layout's fonts, nav or Wren, and is
 * kept deliberately plain: the global stylesheet for colours, system fonts,
 * one way to retry and one way home.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen items-center justify-center bg-parchment px-6 text-ink"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <title>Something went wrong · You Do, I Do</title>
        <main className="w-full max-w-md rounded-lg border border-hairline bg-card px-8 py-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-forest" style={{ fontFamily: "Georgia, serif" }}>
            You Do, I Do didn’t load
          </h1>
          <p className="mt-3 text-ink/80">
            It’s a problem on our side. Anything you’d already saved is safe.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => retry()}
              className="min-h-11 rounded-md bg-forest px-5 py-2 text-sm font-medium text-parchment"
            >
              Try again
            </button>
            {/* A full page load, not a client navigation: the app shell is what failed. */}
            <button
              type="button"
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- the router is part of what failed
              onClick={() => window.location.assign("/")}
              className="min-h-11 rounded-md border border-hairline px-5 py-2 text-sm"
            >
              Go to the home page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
