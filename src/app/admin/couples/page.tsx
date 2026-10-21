import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { listAllUsers, selectAll } from "@/lib/supabase/fetch-all";
import { effectiveGuestCount } from "@/lib/budget-categories";
import type { AdminCoupleNotes, Wedding } from "@/lib/supabase/types";
import { CouplesManager, type CoupleRow } from "./couples-manager";

export default async function AdminCouplesPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();

  const [{ data: weddings }, { data: guests }, { data: usersPage }, { data: notes }] =
    await Promise.all([
      selectAll<Wedding>(admin, "weddings", "*", { column: "created_at", ascending: false }),
      selectAll<{ wedding_id: string; status: string; plus_one: boolean }>(admin, "guests", "wedding_id, status, plus_one"),
      listAllUsers(admin),
      selectAll<Pick<AdminCoupleNotes, "wedding_id" | "tags">>(admin, "admin_couple_notes", "wedding_id, tags"),
    ]);

  const guestsByWedding = new Map<string, { status: string; plus_one: boolean }[]>();
  for (const guest of guests ?? []) {
    const list = guestsByWedding.get(guest.wedding_id) ?? [];
    list.push({ status: guest.status, plus_one: guest.plus_one });
    guestsByWedding.set(guest.wedding_id, list);
  }

  const emailByUserId = new Map<string, string>();
  for (const user of usersPage?.users ?? []) {
    if (user.email) emailByUserId.set(user.id, user.email);
  }

  const tagsByWeddingId = new Map<string, string[]>();
  for (const note of notes ?? []) {
    tagsByWeddingId.set(note.wedding_id, note.tags);
  }

  const rows: CoupleRow[] = (weddings ?? []).map((wedding) => ({
    wedding,
    email: emailByUserId.get(wedding.user_id) ?? null,
    guestCount: effectiveGuestCount(wedding, guestsByWedding.get(wedding.id) ?? []),
    tags: tagsByWeddingId.get(wedding.id) ?? [],
  }));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Couples</h1>
      <CouplesManager rows={rows} />
    </div>
  );
}
