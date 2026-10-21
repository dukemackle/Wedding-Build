import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import type { Wedding } from "@/lib/supabase/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { normalizeEmail } from "@/lib/unsubscribe";
import { PendingSubmit } from "@/components/pending-submit";
import { DeleteAccountForm } from "./delete-account-form";
import { setMarketingOptIn } from "./actions";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
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
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  // Service role: consent rows are keyed by email and have no RLS policies,
  // and this reads only the signed-in user's own address.
  const { data: consent } = user.email
    ? await createAdminSupabaseClient()
        .from("marketing_consents")
        .select("opted_in")
        .eq("email", normalizeEmail(user.email))
        .maybeSingle<{ opted_in: boolean }>()
    : { data: null };

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

        <form
          action={setMarketingOptIn}
          className="mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm"
        >
          <h2 className="font-display text-xl font-semibold text-forest">Email from us</h2>
          <label className="mt-3 flex items-start gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              name="marketing_opt_in"
              defaultChecked={consent?.opted_in ?? false}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
            />
            <span>
              Occasional planning tips and news from You Do, I Do. Emails about your own wedding,
              like RSVPs and reminders you set, come either way.
            </span>
          </label>
          <div className="mt-4 flex items-center gap-3">
            <PendingSubmit
              pendingText="Saving..."
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              Save
            </PendingSubmit>
            {saved === "email" && <span className="text-sm text-ink/60">Saved.</span>}
          </div>
        </form>

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
