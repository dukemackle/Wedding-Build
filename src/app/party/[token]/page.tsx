import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { categoryArt, formatPrice, safeUrl, swatch } from "@/lib/attire";

type SharedItem = {
  name: string;
  category: string;
  designer: string | null;
  image_urls: string[] | null;
  retailer_url: string | null;
  vendor_name: string | null;
  buy_price: number | null;
  rent_price: number | null;
};

type SharedMember = {
  id: string;
  name: string;
  role: string | null;
  color: string | null;
  size: string | null;
  status: string;
  notes: string | null;
  item: SharedItem | null;
};

type SharedParty = {
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  members: SharedMember[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadParty(token: string): Promise<SharedParty | null> {
  if (!UUID.test(token)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_attire_party", { share_token: token });
  return (data as SharedParty | null) ?? null;
}

export const metadata: Metadata = {
  title: "Wedding party looks · Wren",
  // A private link: keep it out of search results.
  robots: { index: false, follow: false },
};

function couple(p: SharedParty) {
  return [p.partner_a_name, p.partner_b_name].filter(Boolean).join(" & ") || "The couple";
}

/**
 * What the couple's bridesmaids and groomsmen see: their own look, colour
 * and size, and where to get it. Read-only, and only by holding the link.
 */
export default async function SharedPartyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const party = await loadParty(token);
  if (!party) notFound();

  const date = party.wedding_date
    ? new Date(`${party.wedding_date}T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="flex-1 bg-parchment">
      <header className="border-b border-hairline bg-gradient-to-r from-[#f3efe6] to-[#f8f6f1] px-4 py-10 text-center sm:px-8 sm:py-14">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.25em] text-brass">The wedding party</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-6xl">{couple(party)}</h1>
        {date && <p className="mt-3 text-ink/70">{date}</p>}
        <p className="mx-auto mt-4 max-w-lg text-sm text-ink/70">
          Find your name to see your look, colour and size, and where to order it.
        </p>
      </header>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
        {party.members.length === 0 ? (
          <p className="py-16 text-center text-ink/60">Looks haven&apos;t been chosen yet. Check back soon.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {party.members.map((m) => {
              const item = m.item;
              const photo = item?.image_urls?.[0];
              const shop = safeUrl(item?.retailer_url);
              const buy = formatPrice(item?.buy_price);
              const rent = formatPrice(item?.rent_price);
              return (
                <li key={m.id} className="flex gap-4 overflow-hidden rounded-xl border border-hairline bg-card p-3 sm:flex-col sm:p-0">
                  <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-md bg-[#efe9df] sm:w-full sm:rounded-none">
                    {photo ? (
                      <Image src={photo} alt={item?.name ?? ""} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 112px" className="object-cover" />
                    ) : (
                      <div
                        className="absolute inset-0 bg-[length:58%] bg-center bg-no-repeat"
                        style={{ backgroundImage: item ? `url(${categoryArt(item.category)})` : undefined }}
                      />
                    )}
                    <span className="absolute left-2 top-2 rounded bg-card/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-forest">
                      {m.status}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col sm:p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-brass">{m.role ?? "Wedding party"}</p>
                    <h2 className="font-display text-2xl font-semibold text-forest">{m.name}</h2>
                    {item ? (
                      <>
                        <p className="mt-1 text-sm text-ink">
                          {item.name}
                          {item.designer && <span className="text-ink/55"> · {item.designer}</span>}
                        </p>
                        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                          {m.color && (
                            <div className="flex items-center gap-1.5">
                              <span className="h-4 w-4 rounded-full border border-ink/15" style={{ backgroundColor: swatch(m.color) }} />
                              <dd>{m.color}</dd>
                            </div>
                          )}
                          {m.size && (
                            <div>
                              <dt className="inline text-ink/50">Size </dt>
                              <dd className="inline">{m.size}</dd>
                            </div>
                          )}
                          {(buy || rent) && (
                            <div className="font-mono-numbers text-ink/70">
                              {[buy && `Buy ${buy}`, rent && `Rent ${rent}`].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </dl>
                        {m.notes && <p className="mt-3 rounded-md bg-parchment p-3 text-sm text-ink/80">{m.notes}</p>}
                        <div className="mt-auto flex flex-col gap-2 pt-4">
                          {shop && (
                            <a
                              href={shop}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="rounded-full bg-forest px-4 py-2.5 text-center text-sm font-medium text-parchment hover:bg-forest/90"
                            >
                              Order this look ↗
                            </a>
                          )}
                          {item.vendor_name && (
                            <p className="rounded-full border border-hairline px-4 py-2.5 text-center text-sm text-ink/80">
                              Fittings at {item.vendor_name}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-ink/60">Your look is still being chosen.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-12 text-center text-xs text-ink/40">
          Planned with <Link href="/" className="underline">Wren</Link>
        </p>
      </div>
    </main>
  );
}
