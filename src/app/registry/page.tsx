import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import type { PublicRegistryGift, RegistryClaim, RegistryItem, Wedding } from "@/lib/supabase/types";
import { usd } from "@/lib/registry";
import { RegistryManager } from "@/app/guests/registry-manager";
import { ClaimsSection, FundsSection, GiftSettings, GiftsSection } from "./registry-editor";

const sectionClass = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const sectionHeadingClass = "font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-ink/50";

/**
 * The couple's registry: gifts from any store that guests claim before they
 * buy (so nobody doubles up), cash funds paid straight to the couple, and
 * links to registries kept at a store. Guests see it on the guest site.
 */
export default async function RegistryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Set up your wedding first</h1>
          <p className="mt-4 text-ink/70">Add your wedding details on the Dashboard, then build your registry here.</p>
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

  const [{ data: gifts }, { data: claims }, { data: storeLinks }] = await Promise.all([
    supabase
      .from("public_registry_gifts")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<PublicRegistryGift[]>(),
    supabase
      .from("registry_claims")
      .select("id, gift_id, wedding_id, guest_name, quantity, amount, message, created_at")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .returns<RegistryClaim[]>(),
    supabase
      .from("registry_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<RegistryItem[]>(),
  ]);

  const allGifts = gifts ?? [];
  const allClaims = claims ?? [];
  const items = allGifts.filter((g) => g.kind === "gift");
  const claimedCount = items.filter((g) => g.claimed >= g.quantity).length;
  const raised = allGifts.filter((g) => g.kind === "fund").reduce((sum, g) => sum + Number(g.raised), 0);

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Guests</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Registry</h1>
          <p className="mt-2 text-sm text-ink/70">
            Everything you&apos;d love, in one place on your guest site.{" "}
            <span className="font-mono-numbers text-ink">
              {claimedCount} of {items.length} gifts claimed
              {raised > 0 ? ` · ${usd(raised)} to your funds` : ""}
            </span>
          </p>
        </div>
        {wedding.public_slug ? (
          <a
            href={`/w/${wedding.public_slug}#registry`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brass hover:underline"
          >
            See it on your guest site ↗
          </a>
        ) : (
          <Link href="/guests" className="text-sm text-brass hover:underline">
            Turn on your guest site so guests can see it
          </Link>
        )}
      </div>

      {/* Phone: one column, the gifts first. Desktop: the gifts and funds take
          the wide column, and who's giving what sits beside them. */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-10">
          <GiftsSection gifts={allGifts} claims={allClaims} />
          <FundsSection gifts={allGifts} claims={allClaims} />
        </div>
        <div className="flex flex-col gap-6">
          <ClaimsSection gifts={allGifts} claims={allClaims} />
          <GiftSettings wedding={wedding} />
          <section className={sectionClass}>
            <h2 className={sectionHeadingClass}>Registries at a store</h2>
            <div className="mt-3">
              <RegistryManager registryItems={storeLinks ?? []} />
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
