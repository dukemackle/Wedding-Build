import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { ChecklistItem, Wedding } from "@/lib/supabase/types";
import { WIDE_WIDTH } from "@/lib/layout";
import { ChecklistManager } from "./checklist-manager";
import { ContractPanel, type PlanningContract } from "./contract-panel";

export default async function ChecklistPage() {
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

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Checklist
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before tracking planning tasks.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: items } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<ChecklistItem[]>();

  // Every contract, not just the ones uploaded here: one attached to a budget
  // line is read the same way, and its dates belong on the same page as the
  // checklist they'd become.
  const { data: contracts } = await supabase
    .from("budget_contracts")
    .select("id, file_name, category, summary, proposed_tasks, read_error, summarised_at, created_at")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })
    .returns<PlanningContract[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      {/* Wide: the plan is a stage list beside a detail panel on a big screen,
          which 768px can't hold. See src/lib/layout.ts for the three widths. */}
      <div className={`w-full ${WIDE_WIDTH}`}>
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Checklist
        </p>
        <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
          Planning to-dos
        </h1>

        <ChecklistManager items={items ?? []} />

        <ContractPanel contracts={contracts ?? []} />
      </div>
    </main>
  );
}
