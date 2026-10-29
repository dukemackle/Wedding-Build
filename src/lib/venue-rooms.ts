import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { WORLD_SCALE } from "@/lib/venue-layout-geometry";

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

/**
 * Keeps a new or copied table/item inside a room copied from a venue plan,
 * whose floor can be narrower than the usual 1600-wide plan. Rooms without a
 * plan are left alone.
 */
export async function keepInRoom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string | null,
  position: { position_x: number; position_y: number },
  size: { width: number; height: number },
): Promise<{ position_x: number; position_y: number }> {
  if (!roomId) return position;
  const { data: room } = await supabase
    .from("venue_rooms")
    .select("width_m, length_m")
    .eq("id", roomId)
    .maybeSingle<{ width_m: number | null; length_m: number | null }>();
  if (room?.width_m == null || room.length_m == null) return position;
  const width = Number(room.width_m) * WORLD_SCALE;
  const length = Number(room.length_m) * WORLD_SCALE;
  return {
    position_x: Math.round(Math.max(0, Math.min(position.position_x, width - size.width))),
    position_y: Math.round(Math.max(0, Math.min(position.position_y, length - size.height))),
  };
}
