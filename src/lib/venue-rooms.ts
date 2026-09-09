import "server-only";
import type { createClient } from "@/lib/supabase/server";

const DEFAULT_ROOM_NAME = "Main Venue";

// Tables/items added outside of Rooms mode (Seating, Whole Venue) still
// need a room_id so Rooms mode shows them without a separate migration
// step -- so every wedding gets a "Main Venue" room lazily, the first
// time anything is added.
export async function getOrCreateDefaultRoom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weddingId: string,
  userId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("venue_rooms")
    .select("id")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("venue_rooms")
    .insert({ wedding_id: weddingId, user_id: userId, name: DEFAULT_ROOM_NAME })
    .select("id")
    .single<{ id: string }>();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not create a default room.");
  }

  return created.id;
}
