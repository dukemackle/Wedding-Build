import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { SheetLink, SheetLinkKind } from "@/lib/supabase/types";
import { hashValue, type SiteRow } from "@/lib/sheet-sync";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** The link as the page sees it: no snapshot, which stays on the server. */
export type SheetLinkView = Omit<SheetLink, "snapshot" | "pending_snapshot" | "pending_token">;

export function sheetLinkView(link: SheetLink | null): SheetLinkView | null {
  if (!link) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { snapshot, pending_snapshot, pending_token, ...rest } = link;
  return rest;
}

export async function loadSheetLink(
  supabase: SupabaseServerClient,
  weddingId: string,
  kind: SheetLinkKind,
): Promise<SheetLink | null> {
  const { data } = await supabase
    .from("sheet_links")
    .select("*")
    .eq("wedding_id", weddingId)
    .eq("kind", kind)
    .maybeSingle<SheetLink>();
  return data ?? null;
}

/**
 * What's changed on the site since the sheet last saw it -- the banner's
 * "6 changes since your last sync (4 RSVPs)".
 *
 * Worked out from the snapshot rather than updated_at, because RSVPs, the
 * address collector and the seating chart all write guests and not all of
 * them touch updated_at. Cheap: a few hashes per row.
 */
export type SiteChanges = { added: number; edited: number; removed: number; rsvps: number };

export function siteChangesSince(link: SheetLink, rows: SiteRow[]): SiteChanges {
  const changes: SiteChanges = { added: 0, edited: 0, removed: 0, rsvps: 0 };
  // Never synced: nothing to compare against yet.
  if (!link.last_synced_at) return changes;
  const snapshot = link.snapshot ?? {};
  const onSite = new Set<string>();

  for (const row of rows) {
    onSite.add(row.id);
    const entry = snapshot[row.id];
    if (!entry) {
      changes.added++;
      continue;
    }
    let edited = false;
    for (const [field, hash] of Object.entries(entry)) {
      if (hashValue(row.values[field] ?? "") !== hash) {
        edited = true;
        if (field === "status") changes.rsvps++;
      }
    }
    if (edited) changes.edited++;
  }
  // A read-only link keeps deleted rows as tombstones (see the guest sync),
  // so only a two-way link counts them as news.
  if (link.mode === "drive") {
    for (const id of Object.keys(snapshot)) if (!onSite.has(id)) changes.removed++;
  }
  return changes;
}

/** How the "last synced by" line names someone. */
export function syncerName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const meta = user.user_metadata ?? {};
  const name = [meta.full_name, meta.name, meta.first_name].find(
    (value): value is string => typeof value === "string" && value.trim() !== "",
  );
  return name?.trim().split(/\s+/)[0] ?? user.email?.split("@")[0] ?? null;
}
