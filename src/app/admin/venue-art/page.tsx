import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VenueArt } from "@/lib/supabase/types";
import { VENUE_ART_BUCKET } from "@/lib/venue-art";
import { AdminEyebrow } from "@/app/admin/admin-nav";
import { VenueArtManager, type ArtVenue } from "./venue-art-manager";

type VenueRow = Omit<ArtVenue, "art">;

export default async function AdminVenueArtPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const fields = "id, name, slug, city, state, photo_urls, photo_marketing_ok, photo_marketing_ok_at, photo_credit";

  const [{ data: consenting }, { data: art }] = await Promise.all([
    admin.from("venues").select(fields).eq("photo_marketing_ok", true).order("name").returns<VenueRow[]>(),
    admin.from("venue_art").select("*").order("created_at").returns<VenueArt[]>(),
  ]);

  // Venues with art but no consent any more still show, flagged for deletion.
  const known = new Set((consenting ?? []).map((v) => v.id));
  const withdrawnIds = [...new Set((art ?? []).map((a) => a.venue_id))].filter((id) => !known.has(id));
  const { data: withdrawn } = withdrawnIds.length
    ? await admin.from("venues").select(fields).in("id", withdrawnIds).returns<VenueRow[]>()
    : { data: [] as VenueRow[] };

  // Private bucket: view the paintings through short-lived signed URLs.
  const paths = (art ?? []).flatMap((a) => [a.wide_path, a.tall_path]).filter((p): p is string => !!p);
  const signed: Record<string, string> = {};
  if (paths.length) {
    const { data } = await admin.storage.from(VENUE_ART_BUCKET).createSignedUrls(paths, 60 * 60);
    for (const s of data ?? []) if (s.path && s.signedUrl) signed[s.path] = s.signedUrl;
  }

  const venues: ArtVenue[] = [...(consenting ?? []), ...(withdrawn ?? [])].map((v) => ({
    ...v,
    art: (art ?? [])
      .filter((a) => a.venue_id === v.id)
      .map((a) => ({
        ...a,
        wideUrl: a.wide_path ? (signed[a.wide_path] ?? null) : null,
        tallUrl: a.tall_path ? (signed[a.tall_path] ?? null) : null,
      })),
  }));

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Venue art</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-ink/60">
        Venues that agreed to their photos being featured. Pick their best ceremony shot, copy the prompt into
        ChatGPT, then upload the wide and tall paintings here. Nothing reaches couples yet.
      </p>
      <VenueArtManager venues={venues} />
    </div>
  );
}
