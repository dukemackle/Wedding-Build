import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { ChevronDownIcon } from "@/components/icons";
import type {
  RegistryItem,
  Wedding,
  WeddingAccommodation,
  WeddingFaq,
  WeddingGalleryPhoto,
} from "@/lib/supabase/types";
import { parseSiteDesign } from "@/lib/site-design";
import { GuestsSubTabs } from "../sub-tabs";
import { PublicSitePanel } from "../public-site-panel";
import { HeroPhotoPanel } from "../hero-photo-panel";
import { GalleryPanel } from "../gallery-panel";
import { Accommodations, DressAndTravel, Faqs } from "../guest-site-details";
import { RegistryManager } from "../registry-manager";
import { SiteEditor } from "./site-editor";

/**
 * Guests › Guest site: the editor for the page guests see.
 * See docs/guest-site-editor.md for the agreed design and build phases.
 */
export default async function GuestSitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Set up your wedding first</h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before designing your guest site.
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

  const [
    { data: galleryPhotos },
    { data: faqs },
    { data: accommodations },
    { data: registryItems },
  ] = await Promise.all([
    supabase
      .from("wedding_gallery_photos")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .returns<WeddingGalleryPhoto[]>(),
    supabase
      .from("wedding_faqs")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .returns<WeddingFaq[]>(),
    supabase
      .from("wedding_accommodations")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .returns<WeddingAccommodation[]>(),
    supabase
      .from("registry_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<RegistryItem[]>(),
  ]);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${protocol}://${host}` : "";

  const published = parseSiteDesign(wedding.site_design);
  const draft = wedding.site_design_draft ? parseSiteDesign(wedding.site_design_draft) : published;

  // Anything the preview shows that the Sections tab can change. When it
  // changes, the preview reloads to pick it up.
  const contentKey = hash(
    JSON.stringify([
      wedding.public_slug,
      wedding.hero_photo_url,
      wedding.dress_code,
      wedding.travel_notes,
      galleryPhotos,
      faqs,
      accommodations,
      registryItems,
    ]),
  );

  const sectionsPanel = (
    <div className="flex flex-col gap-5">
      <PublicSitePanel publicSlug={wedding.public_slug} origin={origin} />
      <div className="flex flex-col">
        <Section title="Photos" status={`${galleryPhotos?.length ?? 0} in the gallery`}>
          <div className="flex flex-col gap-8">
            <HeroPhotoPanel photoUrl={wedding.hero_photo_url} />
            <div className="border-t border-hairline pt-6">
              <GalleryPanel photos={galleryPhotos ?? []} />
            </div>
          </div>
        </Section>
        <Section
          title="Dress code & travel"
          status={wedding.dress_code || wedding.travel_notes ? "Filled in" : "Not filled in yet"}
        >
          <DressAndTravel wedding={wedding} />
        </Section>
        <Section title="Where to stay" status={countLabel(accommodations?.length ?? 0, "place")}>
          <Accommodations items={accommodations ?? []} />
        </Section>
        <Section title="FAQ" status={countLabel(faqs?.length ?? 0, "question")}>
          <Faqs faqs={faqs ?? []} />
        </Section>
        <Section title="Registry" status={countLabel(registryItems?.length ?? 0, "link")}>
          <RegistryManager registryItems={registryItems ?? []} />
        </Section>
      </div>
    </div>
  );

  return (
    <main className="flex flex-1 flex-col items-center px-6 pt-16 pb-16">
      <AppNav email={user.email ?? ""} />
      <div className="-mx-6 -mt-8 w-[calc(100%+3rem)] border-b border-hairline bg-card px-6 lg:px-8">
        <GuestsSubTabs active="/guests/site" />
      </div>
      <div className="w-full">
        <SiteEditor
          draft={draft}
          published={published}
          publicSlug={wedding.public_slug}
          origin={origin}
          contentKey={contentKey}
          sectionsPanel={sectionsPanel}
        />
      </div>
    </main>
  );
}

function countLabel(n: number, noun: string) {
  return n === 0 ? "None yet" : `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/** One piece of the site's content, folded away until it's opened. */
function Section({ title, status, children }: { title: string; status: string; children: ReactNode }) {
  return (
    <details className="group border-b border-hairline last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 marker:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink">{title}</span>
          <span className="block text-xs text-ink/60">{status}</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-6 pt-1">{children}</div>
    </details>
  );
}

// FNV-1a: enough to notice a change, not a security boundary.
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
