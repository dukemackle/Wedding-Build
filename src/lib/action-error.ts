/**
 * What to say when a server action throws instead of returning an error.
 *
 * Offline is the obvious cause, but the usual one is a deploy: a tab opened
 * before a new version went live still calls the old action ids, and the
 * server answers 404 for every one until the page is reloaded (2026-11-03,
 * "Add your own section" failing ten minutes after a deploy). Blaming the
 * connection then sends the couple off checking their wifi.
 */
export function actionFailed(what: string): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return `Couldn't ${what} — you're offline. Check your connection and try again.`;
  }
  return `Couldn't ${what} — we just updated the app. Reload the page and try again.`;
}
