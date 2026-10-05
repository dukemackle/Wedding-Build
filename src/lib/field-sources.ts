// Where each field on a venue or vendor listing came from, and when. Stored in
// `field_sources` (0099) as {"capacity": {"by": "venue", "at": "2026-10-05"}}.
//
// `last_verified_at` says someone checked the listing as a whole. This says
// which fields can be trusted: a capacity the venue confirmed beats one from a
// batch row, and /data-audit can re-check only the fields that have gone stale.
//
//   batch    from a batch file or paste import, researched off the business's site
//   website  read off the business's own site by the import script (addresses)
//   venue    confirmed by the venue through its claim link
//   vendor   confirmed by the vendor through its claim link
//   admin    edited by hand on /admin

export type FieldSource = "batch" | "website" | "venue" | "vendor" | "admin";
export type FieldSources = Record<string, { by: FieldSource; at: string }>;

// Bookkeeping, not facts about the business: never stamped. Map pins follow
// the address, and image_url is always photo_urls[0].
const UNTRACKED = new Set([
  "id",
  "slug",
  "latitude",
  "longitude",
  "image_url",
  "is_sample",
  "active",
  "source",
  "source_id",
  "last_verified_at",
  "verified_by",
  "address_checked_at",
  "field_sources",
  "created_at",
]);

const isEmpty = (value: unknown) =>
  value == null ||
  (typeof value === "string" && !value.trim()) ||
  (Array.isArray(value) && value.length === 0);

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const today = () => new Date().toISOString().slice(0, 10);

/**
 * `current` sources with `values` stamped as coming from `by` today. A field
 * written blank loses its stamp: there's nothing left to vouch for.
 *
 * With `changedOnly`, a field whose value matches `current` keeps its old
 * stamp -- an admin saving the form doesn't take credit for a capacity the
 * venue confirmed. Without it (a claim approval), every field sent is stamped,
 * because the venue looked at it and kept it.
 */
export function restamp(
  current: { field_sources?: FieldSources | null } | null,
  values: Record<string, unknown>,
  by: FieldSource,
  { changedOnly = false }: { changedOnly?: boolean } = {},
): FieldSources {
  const sources: FieldSources = { ...(current?.field_sources ?? {}) };
  const at = today();
  for (const [key, value] of Object.entries(values)) {
    if (UNTRACKED.has(key)) continue;
    if (isEmpty(value)) {
      delete sources[key];
      continue;
    }
    if (changedOnly && current && same((current as Record<string, unknown>)[key], value) && sources[key]) continue;
    sources[key] = { by, at };
  }
  return sources;
}
