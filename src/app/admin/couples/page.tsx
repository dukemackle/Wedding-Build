import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { effectiveGuestCount } from "@/lib/budget-categories";
import type { Wedding } from "@/lib/supabase/types";
import { CouplesManager, type CoupleRow } from "./couples-manager";

export default async function AdminCouplesPage() {
  const admin = createAdminSupabaseClient();

  const [{ data: weddings }, { data: guests }, { data: usersPage }] = await Promise.all([
    admin
      .from("weddings")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Wedding[]>(),
    admin
      .from("guests")
      .select("wedding_id, status, plus_one")
      .returns<{ wedding_id: string; status: string; plus_one: boolean }[]>(),
    admin.auth.admin.listUsers({ perPage: 1000 }),
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

  const rows: CoupleRow[] = (weddings ?? []).map((wedding) => ({
    wedding,
    email: emailByUserId.get(wedding.user_id) ?? null,
    guestCount: effectiveGuestCount(wedding, guestsByWedding.get(wedding.id) ?? []),
  }));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Couples</h1>
      <CouplesManager rows={rows} />
    </div>
  );
}
