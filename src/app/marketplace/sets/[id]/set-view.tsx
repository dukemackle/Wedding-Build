import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { formatPrice, liveSetItems, MIN_SET_ITEMS, type MarketSetWithItems } from "@/lib/marketplace";
import { BuyerActions } from "../../[id]/listing-actions";
import { SetCollage, SetPrice } from "../../set-card";
import { SetControls } from "./set-controls";

/** A whole-wedding set: the collage, the price for the lot, and every piece in it. */
export function SetView({
  set,
  viewer,
  threadId,
  defaultName,
}: {
  set: MarketSetWithItems;
  /** Null when logged out. */
  viewer: { id: string; email: string } | null;
  /** The viewer's conversation about the set's first piece, if any. */
  threadId: string | null;
  defaultName: string;
}) {
  const user = viewer;
  const isSeller = user?.id === set.seller_id;
  const live = liveSetItems(set.items);
  const shown = isSeller ? set.items : live;
  const cover = live[0] ?? set.items[0];
  const split = live.length < set.items.length;
  const available = (set.status === "active" || set.status === "pending") && live.length >= MIN_SET_ITEMS;

  return (
    <PageShell email={user?.email ?? null} width="wide">
      <Link href="/marketplace" className="text-sm text-brass hover:underline">
        &larr; Marketplace
      </Link>

      {/* Desktop: the collage and pieces on the left, price and the message
          button beside them. A phone stacks them, collage first. */}
      <div className="mt-4 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="min-w-0">
          <SetCollage items={live.length ? live : set.items} sizes="(min-width: 1024px) 700px, 100vw" />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a6b00]">
            Whole-wedding set · {live.length} pieces
          </p>
          {set.status !== "active" && (
            <span className="mt-2 inline-block rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-parchment">
              {set.status}
            </span>
          )}
          <h1 className="mt-1.5 font-display text-3xl font-semibold text-forest">{set.title}</h1>
          <SetPrice set={{ ...set, items: live }} className="mt-1 text-2xl" />
          <p className="mt-1 text-sm text-ink/50">
            {set.listing_type === "rent" ? "For rent as one lot" : "Everything below, for one price"}
            {cover ? ` · ${cover.city}, ${cover.state}` : ""}
          </p>

          <div className="mt-5">
            {isSeller ? (
              <>
                {split && (
                  <p className="mb-3 rounded-md border border-hairline bg-[#fbf8f1] px-3 py-2 text-sm text-ink/70">
                    {set.items.length - live.length === 1 ? "One piece has" : "Some pieces have"} sold on {set.items.length - live.length === 1 ? "its" : "their"} own.
                    {live.length < MIN_SET_ITEMS ? " With fewer than two left, the set is hidden." : " Check the set price still feels right."}
                  </p>
                )}
                <SetControls id={set.id} status={set.status} />
              </>
            ) : cover ? (
              <BuyerActions
                id={cover.id}
                signedIn={user !== null}
                saved={false}
                saveable={false}
                available={available}
                threadId={threadId}
                defaultName={defaultName}
                opening={`Hi! Is the whole set (${set.title}) still available?`}
              />
            ) : null}
          </div>

          {set.description && <p className="mt-6 whitespace-pre-line border-t border-hairline pt-5 text-ink/80">{set.description}</p>}

          <p className="mt-6 rounded-md bg-[#5AE4FF]/15 p-3 text-xs text-ink/70">
            <strong className="text-forest">Stay safe:</strong> meet somewhere public, look before you pay, and never pay
            ahead for shipping. You Do, I Do doesn&apos;t handle payments.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-forest">What&apos;s in the set</h2>
        <p className="mt-1 text-sm text-ink/60">Each piece is also listed on its own, if you only need some of it.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((l) => (
            <Link key={l.id} href={`/marketplace/${l.id}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-hairline bg-parchment">
                {l.photo_urls[0] && (
                  <Image
                    src={l.photo_urls[0]}
                    alt={l.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
                {l.status === "sold" && (
                  <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-0.5 text-[11px] font-semibold uppercase text-parchment">Sold</span>
                )}
              </div>
              <p className="mt-1.5 truncate text-sm font-medium text-forest">{l.title}</p>
              <p className="text-xs text-ink/55">
                {formatPrice(l.price_cents, l.listing_type)}
                {l.quantity > 1 ? ` · ${l.quantity} of them` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
