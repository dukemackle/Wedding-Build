import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { effectiveGuestCount } from "@/lib/budget-categories";
import type { Wedding } from "@/lib/supabase/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminCouplesPage() {
  const admin = createAdminSupabaseClient();

  const [{ data: weddings }, { data: guests }] = await Promise.all([
    admin
      .from("weddings")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Wedding[]>(),
    admin
      .from("guests")
      .select("wedding_id, status, plus_one")
      .returns<{ wedding_id: string; status: string; plus_one: boolean }[]>(),
  ]);

  const guestsByWedding = new Map<string, { status: string; plus_one: boolean }[]>();
  for (const guest of guests ?? []) {
    const list = guestsByWedding.get(guest.wedding_id) ?? [];
    list.push({ status: guest.status, plus_one: guest.plus_one });
    guestsByWedding.set(guest.wedding_id, list);
  }

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Couples</h1>
      <div className="w-full overflow-x-auto rounded-lg border border-hairline bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Couple</th>
              <th className="px-4 py-3 font-medium">Wedding date</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Guests</th>
              <th className="px-4 py-3 font-medium">Referral code</th>
              <th className="px-4 py-3 font-medium">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {(weddings ?? []).map((wedding) => {
              const names = [wedding.partner_a_name, wedding.partner_b_name]
                .filter(Boolean)
                .join(" & ");
              return (
                <tr key={wedding.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3 text-ink">{names || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(wedding.wedding_date)}</td>
                  <td className="px-4 py-3 text-ink/70">{wedding.region ?? "—"}</td>
                  <td className="px-4 py-3 font-mono-numbers text-ink/70">
                    {effectiveGuestCount(wedding, guestsByWedding.get(wedding.id) ?? [])}
                  </td>
                  <td className="px-4 py-3 font-mono-numbers text-ink/70">
                    {wedding.referral_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(wedding.created_at)}</td>
                </tr>
              );
            })}
            {(weddings ?? []).length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-ink/50" colSpan={6}>
                  No couples yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
