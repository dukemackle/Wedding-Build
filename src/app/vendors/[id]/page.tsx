import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { FadeInSection } from "@/components/fade-in-section";
import { ChevronDownIcon } from "@/components/icons";
import type { Vendor, VendorFaq, Wedding } from "@/lib/supabase/types";
import { VendorDetailClient } from "./vendor-detail-client";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle<Vendor>();

  if (!vendor) {
    notFound();
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  const [{ data: faqs }, { data: favorite }] = await Promise.all([
    supabase
      .from("vendor_faqs")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("sort_order", { ascending: true })
      .returns<VendorFaq[]>(),
    wedding
      ? supabase
          .from("vendor_favorites")
          .select("vendor_id")
          .eq("wedding_id", wedding.id)
          .eq("vendor_id", vendor.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const { data: similarVendors } = vendor.category
    ? await supabase
        .from("vendors")
        .select("*")
        .eq("active", true)
        .eq("category", vendor.category)
        .neq("id", vendor.id)
        .limit(3)
        .returns<Vendor[]>()
    : { data: [] as Vendor[] };

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <div className="w-full max-w-4xl">
        <Link href="/vendors" className="text-sm text-brass hover:underline">
          &larr; Back to vendors
        </Link>

        <FadeInSection>
          <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
            {vendor.image_url && (
              <Image
                src={vendor.image_url}
                alt={vendor.name}
                width={900}
                height={500}
                className="aspect-[16/9] w-full border-b border-hairline object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="font-display text-3xl font-semibold text-forest">{vendor.name}</h1>
                {vendor.price_tier && (
                  <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                    {vendor.price_tier}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
                {[[vendor.city, vendor.state].filter(Boolean).join(", "), vendor.category]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {vendor.is_sample && (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">
                  Sample listing
                </p>
              )}
              {vendor.description && <p className="mt-4 text-ink/80">{vendor.description}</p>}
            </div>
          </div>
        </FadeInSection>

        {wedding && (
          <FadeInSection delayMs={40}>
            <div className="mt-6">
              <VendorDetailClient vendor={vendor} isFavorited={Boolean(favorite)} />
            </div>
          </FadeInSection>
        )}

        {(vendor.about || vendor.included || vendor.amenities.length > 0) && (
          <FadeInSection delayMs={60}>
            <div className="mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm">
              {vendor.about && (
                <>
                  <h2 className="font-display text-xl font-semibold text-forest">
                    About this vendor
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{vendor.about}</p>
                </>
              )}

              {vendor.included && (
                <div className={vendor.about ? "mt-6 border-t border-hairline pt-6" : ""}>
                  <h2 className="font-display text-xl font-semibold text-forest">
                    What&apos;s included
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">{vendor.included}</p>
                </div>
              )}

              {vendor.amenities.length > 0 && (
                <div
                  className={
                    vendor.about || vendor.included ? "mt-6 border-t border-hairline pt-6" : ""
                  }
                >
                  <h2 className="font-display text-xl font-semibold text-forest">
                    Services &amp; extras
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {vendor.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border-hairline bg-parchment px-3 py-1 text-sm text-ink"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeInSection>
        )}

        {faqs && faqs.length > 0 && (
          <FadeInSection delayMs={80}>
            <div className="mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-forest">
                Frequently asked questions
              </h2>
              <div className="mt-2">
                {faqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="group border-b border-hairline py-3 last:border-b-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-ink marker:hidden">
                      {faq.question}
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink/70">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </FadeInSection>
        )}

        {similarVendors && similarVendors.length > 0 && (
          <FadeInSection delayMs={120}>
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-forest">
                More {vendor.category?.toLowerCase() ?? "vendors"} like this
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVendors.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vendors/${v.id}`}
                    className="rounded-lg border border-hairline bg-parchment p-4 transition-colors hover:border-forest"
                  >
                    <p className="font-display text-sm font-semibold text-forest">{v.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50">
                      {[v.city, v.state].filter(Boolean).join(", ")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </main>
  );
}
