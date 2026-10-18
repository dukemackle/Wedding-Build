import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PhotoGallery } from "@/components/photo-gallery";
import { categoryLabel, conditionLabel, formatPrice, guestFit, listedAgo } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";
import { BuyerActions, SellerControls } from "./listing-actions";

/** One listing, for its own page. */
export function ListingView({
  listing,
  viewer,
  saved,
  threadId = null,
  defaultName = "",
  guestCount = 0,
}: {
  listing: MarketListing;
  /** Null when logged out. */
  viewer: { id: string; email: string } | null;
  saved: boolean;
  /** The viewer's conversation about this listing, if any. */
  threadId?: string | null;
  defaultName?: string;
  /** The viewer's guest count, for "Enough for your 150 guests". */
  guestCount?: number;
}) {
  const fit = guestFit(listing.quantity, guestCount);
  const isSeller = viewer?.id === listing.seller_id;
  const details = [
    ["Condition", conditionLabel(listing.condition)],
    ["Category", categoryLabel(listing.category)],
    ["Quantity", String(listing.quantity)],
    ["Pickup", `${listing.city}, ${listing.state}`],
  ];

  return (
    <PageShell email={viewer ? viewer.email : null} width="wide">
      <Link href="/marketplace" className="text-sm text-brass hover:underline">
        &larr; Marketplace
      </Link>

      {/* Desktop: the photos take the left three-fifths and the details sit
          beside them, so price and the message button are on screen with the
          first photo. A phone stacks them, photos first. */}
      <div className="mt-4 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="min-w-0">
          <PhotoGallery photos={listing.photo_urls} alt={listing.title} />
          {listing.description && (
            <section className="mt-8 hidden lg:block">
              <h2 className="font-display text-xl font-semibold text-forest">Description</h2>
              <p className="mt-2 whitespace-pre-line text-ink/80">{listing.description}</p>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {listing.status !== "active" && (
            <span className="mb-2 inline-block rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-parchment">
              {listing.status === "removed" ? "Taken down" : listing.status}
            </span>
          )}
          <h1 className="font-display text-3xl font-semibold text-forest">{listing.title}</h1>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatPrice(listing.price_cents, listing.listing_type)}</p>
          <p className="mt-1 text-sm text-ink/50">
            Listed {listedAgo(listing.created_at)} in {listing.city}, {listing.state}
          </p>
          {listing.listing_type === "rent" && (
            <p className="mt-2 rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink/70">
              <strong className="text-forest">For rent:</strong> borrow it for your wedding and give it back after.
              Agree the dates and any deposit with {listing.seller_name} in messages.
            </p>
          )}
          {fit && (
            <p className="mt-2 inline-block rounded-full bg-[#00BFFE]/15 px-2.5 py-0.5 text-xs font-medium text-[#2243B6]">
              {fit}
            </p>
          )}

          <div className="mt-5">
            {isSeller ? (
              <SellerControls id={listing.id} status={listing.status} />
            ) : (
              <BuyerActions
                id={listing.id}
                signedIn={viewer !== null}
                saved={saved}
                available={listing.status === "active" || listing.status === "pending"}
                threadId={threadId}
                defaultName={defaultName}
              />
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hairline pt-5 text-sm">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-ink/50">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <section className="mt-6 border-t border-hairline pt-5 lg:hidden">
              <h2 className="font-display text-xl font-semibold text-forest">Description</h2>
              <p className="mt-2 whitespace-pre-line text-ink/80">{listing.description}</p>
            </section>
          )}

          <div className="mt-6 flex items-center gap-3 rounded-lg border border-hairline bg-card p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2243B6] font-display text-lg font-semibold text-white">
              {listing.seller_name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="font-medium text-forest">{listing.seller_name}</p>
              {listing.seller_badge ? (
                // Gold: the one thing on this page that says "a real couple".
                <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#FFD301] px-2 py-0.5 text-xs font-medium text-[#14203d]">
                  <span aria-hidden>♥</span> {listing.seller_badge} · planned on You Do, I Do
                </p>
              ) : (
                <p className="text-xs text-ink/50">Seller</p>
              )}
            </div>
          </div>

          <p className="mt-4 rounded-md bg-[#5AE4FF]/15 p-3 text-xs text-ink/70">
            <strong className="text-forest">Stay safe:</strong> meet somewhere public, look before you pay, and never pay
            ahead for shipping. You Do, I Do doesn&apos;t handle payments.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
