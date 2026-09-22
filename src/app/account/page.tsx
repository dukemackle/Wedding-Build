import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import type { Wedding } from "@/lib/supabase/types";
import { DeleteAccountForm } from "./delete-account-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  const isOwner = wedding?.user_id === user.id;
  const coupleNames = wedding
    ? [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ")
    : null;

  return (
    <PageShell email={user.email ?? ""} width="reading">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Your account</h1>

        <div className="mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/60">Email</dt>
              <dd className="font-medium text-ink">{user.email}</dd>
            </div>
            {wedding && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Wedding</dt>
                <dd className="font-medium text-ink">{coupleNames || "Untitled wedding"}</dd>
              </div>
            )}
            {wedding && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Your role</dt>
                <dd className="font-medium text-ink">{isOwner ? "Owner" : "Partner"}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-6">
          <h2 className="font-display text-xl font-semibold text-red-900">Delete account</h2>
          <p className="mt-2 text-sm text-red-900/80">
            {isOwner
              ? "This permanently deletes your login and this wedding -- guest list, budget, seating, photos, everything. It can't be undone."
              : wedding
                ? "This permanently deletes your login and removes your access to this wedding. The wedding itself stays with its owner."
                : "This permanently deletes your login. It can't be undone."}
          </p>
          <DeleteAccountForm />
        </div>
    </PageShell>
  );
}
