import { requireAdmin } from "@/lib/admin";
import { LeadsList, ResearchList } from "./leads-list";
import { loadLeads } from "./load";

export default async function AdminLeadsPage() {
  await requireAdmin();
  const { open, research } = await loadLeads();
  const vendors = open.filter((l) => l.kind === "vendor");
  const venues = open.filter((l) => l.kind === "venue");

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Businesses couples booked that we don&apos;t list</h1>
      <p className="mt-2 mb-6 max-w-3xl text-sm text-ink/60">
        Names couples typed into &ldquo;Purchased from&rdquo; on their budget without picking a listing. Nothing here
        is public, and nothing goes live from here: &ldquo;Research it&rdquo; queues the name for the next batch,
        and &ldquo;Link to it&rdquo; points the couple&apos;s budget line at the listing we already have.
      </p>

      <div className="flex flex-col gap-8">
        <LeadsList title="Vendors" leads={vendors} />
        <LeadsList title="Venues" leads={venues} />
        <ResearchList leads={research} />
      </div>
    </div>
  );
}
