import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PhotoGallery } from "@/components/photo-gallery";
import {
  PICKUP_OPTIONS,
  categoryLabel,
  conditionLabel,
  formatPrice,
  guestFit,
  listedAgo,
} from "@/lib/marketplace";
import type { MarketListing, MarketSet } from "@/lib/supabase/types";
import { BuyerActions, SellerControls } from "./listing-actions";
import { ApproxLocation, ShareButton } from "./listing-extras";

/** One listing, for its own page. */
export function ListingView({
  listing,
  viewer,
  saved,
  threadId = null,
  defaultName = "",
  guestCount = 0,
  joined = null,
  sellerListings = [],
  similar = [],
  set = null,
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
  /** The year the seller joined, for "Joined You Do, I Do in 2026". */
  joined?: number | null;
  /** The seller's other live listings. */
  sellerListings?: MarketListing[];
  /** "More like this": same category, nearby. */
  similar?: MarketListing[];
  /** The whole-wedding set it's part of, when that set is live (or the viewer's own). */
  set?: MarketSet | null;
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
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold text-forest">{listing.title}</h1>
            <ShareButton
              title={listing.title}
              className="mt-1 shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-forest hover:border-forest"
            />
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold text-ink">
            {formatPrice(listing.price_cents, listing.listing_type)}
            {listing.original_price_cents && (
              <s className="text-lg font-normal text-ink/40">{formatPrice(listing.original_price_cents)}</s>
            )}
            {listing.negotiable && <span className="text-sm font-medium text-ink/60">or best offer</span>}
          </p>
          <p className="mt-1 text-sm text-ink/50">
            Listed {listedAgo(listing.created_at)} in {listing.city}, {listing.state}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs text-ink/70">
            {PICKUP_OPTIONS.filter((o) => listing.pickup_options.includes(o.value)).map((o) => (
              <li key={o.value} className="rounded-full border border-hairline px-2.5 py-0.5">
                {o.label}
              </li>
            ))}
          </ul>
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

          {set && (
            <Link
              href={`/marketplace/sets/${set.id}`}
              className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#FFD301] bg-[#fffbe6] px-3.5 py-2.5 text-sm text-forest hover:border-[#e0a100]"
            >
              <span>
                Part of <strong className="font-semibold">{set.title}</strong>
              </span>
              <span className="shrink-0 font-semibold">
                {formatPrice(set.price_cents, set.listing_type)} for the set <span aria-hidden>→</span>
              </span>
            </Link>
          )}

          <div className="mt-5">
            {isSeller ? (
              <>
                <SellerControls id={listing.id} status={listing.status} />
                {!listing.set_id && (listing.status === "active" || listing.status === "pending") && (
                  <Link href={`/marketplace/sets/new?with=${listing.id}`} className="mt-3 inline-block text-sm text-[#2243B6] hover:underline">
                    Bundle it into a whole-wedding set
                  </Link>
                )}
              </>
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

          {listing.latitude != null && listing.longitude != null && (
            <div className="mt-6">
              <ApproxLocation latitude={listing.latitude} longitude={listing.longitude} />
              <p className="mt-1 text-xs text-ink/50">
                {listing.city}, {listing.state} · Location is approximate
              </p>
            </div>
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
              {joined && <p className="mt-0.5 text-xs text-ink/50">Joined You Do, I Do in {joined}</p>}
            </div>
          </div>

          <p className="mt-4 rounded-md bg-[#5AE4FF]/15 p-3 text-xs text-ink/70">
            <strong className="text-forest">Stay safe:</strong> meet somewhere public, look before you pay, and never pay
            ahead for shipping. You Do, I Do doesn&apos;t handle payments.
          </p>
        </div>
      </div>

      {sellerListings.length > 0 && (
        <MiniGrid title={`More from ${listing.seller_name}`} listings={sellerListings} />
      )}
      {similar.length > 0 && <MiniGrid title="More like this nearby" listings={similar} />}
    </PageShell>
  );
}

function MiniGrid({ title, listings }: { title: string; listings: MarketListing[] }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {listings.map((l) => (
          <Link key={l.id} href={`/marketplace/${l.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-hairline bg-parchment">
              {l.photo_urls[0] && (
                <Image
                  src={l.photo_urls[0]}
                  alt={l.title}
                  fill
                  sizes="(min-width: 1024px) 16vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-forest">{formatPrice(l.price_cents, l.listing_type)}</p>
            <p className="truncate text-sm text-ink">{l.title}</p>
            <p className="truncate text-xs text-ink/50">
              {l.city}, {l.state}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
