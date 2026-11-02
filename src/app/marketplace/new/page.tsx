import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { STATES } from "@/lib/wedding-options";
import { MARKET_CATEGORIES, formatPrice, sellerBadgeFor } from "@/lib/marketplace";
import { loadMarketWedding, loadPassItOn } from "@/lib/marketplace-server";
import { resaleShare } from "@/lib/pass-it-on";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Sell something", robots: { index: false } };

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; category?: string; pass?: string; from?: string; skip?: string; listed?: string }>;
}) {
  const { title, category, pass, from, skip, listed } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/new");

  // A couple's own name and wedding town fill the form in; anyone else
  // starts blank.
  const wedding = await loadMarketWedding(supabase, user.id);
  const state = (STATES as readonly string[]).includes(wedding?.ownVenueState ?? "")
    ? (wedding?.ownVenueState ?? undefined)
    : undefined;

  // "List my wedding": one draft from the budget at a time, the next one
  // after each is posted, until they're all listed or skipped.
  const skipped = (skip ?? "").split(",").filter(Boolean);
  const drafts = pass === "1" && wedding ? (await loadPassItOn(supabase, wedding.weddingId)).filter((d) => !skipped.includes(d.source)) : [];
  const draft = drafts.find((d) => d.source === from) ?? drafts[0];
  if (pass === "1" && !draft) redirect("/marketplace?view=selling");
  const skipHref = draft
    ? `/marketplace/new?pass=1&skip=${encodeURIComponent([...skipped, draft.source].join(","))}`
    : null;

  return (
    <PageShell email={user.email ?? ""} width="reading">
      {draft ? (
        <>
          {listed && (
            <p className="mb-5 rounded-lg border border-hairline bg-[#fbf8f1] px-4 py-3 text-sm text-forest" role="status">
              Listed. <Link href={`/marketplace/${listed}`} className="text-[#2243B6] underline">See it</Link>, or carry on with the next one.
            </p>
          )}
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a6b00]">
              Pass it on · {drafts.length === 1 ? "last one" : `${drafts.length} to go`}
            </p>
            {skipHref && (
              <Link href={skipHref} className="text-sm text-ink/60 hover:text-forest">
                Skip this one
              </Link>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{draft.title}</h1>
          <p className="mt-2 text-ink/70">
            Wren filled in what your budget knows. Add a photo or two, check the details, and it&apos;s listed.
          </p>
        </>
      ) : (
        <>
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Sell something</h1>
          <p className="mt-2 text-ink/70">
            Pass on what&apos;s left from your wedding to someone whose day is still coming.
          </p>
        </>
      )}
      <div className="mt-8">
        <ListingForm
          // A fresh form for each draft, so the last one's photos don't carry over.
          key={draft?.source ?? "new"}
          sellerId={user.id}
          defaults={{
            seller_name: wedding?.firstName || undefined,
            city: wedding?.ownVenueCity ?? wedding?.origin?.label ?? undefined,
            state,
            // From "Pass it on", or the dashboard's older title links.
            title: draft?.title ?? title?.slice(0, 80),
            category:
              draft?.category ?? (MARKET_CATEGORIES.some((c) => c.value === category) ? category : undefined),
            price: draft?.suggestCents ? String(draft.suggestCents / 100) : undefined,
          }}
          pass={
            draft
              ? {
                  source: draft.source,
                  skip: skipped.join(","),
                  hint: draft.paidCents && draft.suggestCents
                    ? `You paid ${formatPrice(draft.paidCents)}. Things like this tend to go for around ${Math.round(resaleShare(draft.category) * 100)}% of that, so Wren suggests ${formatPrice(draft.suggestCents)}.`
                    : null,
                }
              : undefined
          }
          badgePreview={wedding?.weddingDate ? sellerBadgeFor(wedding.weddingDate) : null}
        />
      </div>
    </PageShell>
  );
}
