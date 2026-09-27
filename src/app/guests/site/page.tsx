import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type {
  RegistryItem,
  Wedding,
  WeddingAccommodation,
  WeddingFaq,
  WeddingGalleryPhoto,
  SiteBlock,
} from "@/lib/supabase/types";
import { blockKey, parseSiteDesign, type SectionId } from "@/lib/site-design";
import { PublicSitePanel } from "../public-site-panel";
import { HeroPhotoPanel } from "../hero-photo-panel";
import { GalleryPanel } from "../gallery-panel";
import { Accommodations, DressAndTravel, Faqs } from "../guest-site-details";
import { RegistryManager } from "../registry-manager";
import { SiteEditor } from "./site-editor";
import type { ChecklistItem, SectionInfo } from "./editor-tabs";
import { BlockEditor } from "./block-editor";

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

  const { data: blocks } = await supabase
    .from("site_blocks")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<SiteBlock[]>();

  // Counts for the Sections tab's status lines. Head-only: just the numbers.
  const [{ count: eventCount }, { count: confirmedCount }, { count: postCount }] = await Promise.all([
    supabase.from("itinerary_events").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
    supabase
      .from("guests")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id)
      .eq("status", "confirmed"),
    supabase.from("guest_posts").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
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
      blocks,
    ]),
  );

  const photoCount = galleryPhotos?.length ?? 0;
  const stayCount = accommodations?.length ?? 0;
  const faqCount = faqs?.length ?? 0;
  const registryCount = registryItems?.length ?? 0;
  const events = eventCount ?? 0;
  const hidden = " — hidden until you add one";

  const sectionInfo: Record<SectionId, SectionInfo> = {
    rsvp: wedding.rsvp_deadline
      ? { status: `Replies by ${formatDate(wedding.rsvp_deadline)}` }
      : {
          status: "Deadline not set",
          warn: true,
          link: { href: "/dashboard", label: "Set an RSVP deadline on the Dashboard" },
        },
    photos: {
      status: [
        wedding.hero_photo_url ? "Banner photo" : "No banner photo",
        photoCount ? `${photoCount} in the gallery` : "no gallery yet",
      ].join(" · "),
      warn: !wedding.hero_photo_url,
      editor: (
        <div className="flex flex-col gap-8">
          <HeroPhotoPanel photoUrl={wedding.hero_photo_url} />
          <div className="border-t border-hairline pt-6">
            <GalleryPanel photos={galleryPhotos ?? []} />
          </div>
        </div>
      ),
    },
    weekend: {
      status: !events
        ? `Nothing scheduled${hidden.replace("one", "an event")}`
        : wedding.itinerary_published
          ? `${events} event${events === 1 ? "" : "s"}, from your itinerary`
          : `${events} event${events === 1 ? "" : "s"}, not published yet`,
      warn: events > 0 && !wedding.itinerary_published,
      link: { href: "/itinerary", label: "Edit and publish your itinerary" },
    },
    wall: {
      status: postCount ? `${postCount} post${postCount === 1 ? "" : "s"} from guests` : "Guests can share photos and notes",
    },
    guests: {
      status: confirmedCount
        ? `${confirmedCount} confirmed guest${confirmedCount === 1 ? "" : "s"}`
        : "Appears once guests say yes",
    },
    travel: {
      status: stayCount
        ? `${stayCount} place${stayCount === 1 ? "" : "s"} to stay`
        : wedding.dress_code || wedding.travel_notes
          ? "No hotels yet"
          : `Not filled in${hidden.replace("one", "details")}`,
      warn: stayCount === 0,
      editor: (
        <div className="flex flex-col gap-8">
          <DressAndTravel wedding={wedding} />
          <div className="border-t border-hairline pt-6">
            <Accommodations items={accommodations ?? []} />
          </div>
        </div>
      ),
    },
    faq: {
      status: faqCount ? `${faqCount} question${faqCount === 1 ? "" : "s"}` : `No questions${hidden}`,
      editor: <Faqs faqs={faqs ?? []} />,
    },
    registry: {
      status: registryCount ? `${registryCount} link${registryCount === 1 ? "" : "s"}` : `No links${hidden}`,
      editor: <RegistryManager registryItems={registryItems ?? []} />,
    },
  };

  // Custom blocks, keyed as they appear in the design's section list.
  const blockInfo = Object.fromEntries(
    (blocks ?? []).map((b) => {
      const kind = { story: "Story", photo: "Photo", quote: "Quote" }[b.kind];
      const filled = b.kind === "photo" ? Boolean(b.photo_url) : Boolean(b.body);
      const info: SectionInfo = {
        name: b.heading && b.kind !== "quote" ? `${kind}: ${b.heading}` : kind,
        status: !filled
          ? "Empty — hidden until you fill it in"
          : b.kind === "photo"
            ? b.heading ?? "Photo added"
            : `“${b.body!.slice(0, 60)}${b.body!.length > 60 ? "…" : ""}”`,
        warn: !filled,
        editor: <BlockEditor block={b} />,
      };
      return [blockKey(b.id), info];
    }),
  );

  const checklist: ChecklistItem[] = [
    { label: "Turn on your guest site", done: Boolean(wedding.public_slug) },
    { label: "Add a banner photo", done: Boolean(wedding.hero_photo_url) },
    { label: "Set an RSVP deadline", done: Boolean(wedding.rsvp_deadline), href: "/dashboard", action: "Dashboard" },
    { label: "Add somewhere to stay", done: stayCount > 0 },
    {
      label: "Publish your weekend schedule",
      done: events > 0 && wedding.itinerary_published,
      href: "/itinerary",
      action: "Itinerary",
    },
  ];

  return (
    <main className="flex flex-1 flex-col items-center px-6 pt-16 pb-16">
      <AppNav email={user.email ?? ""} />
      <div className="-mx-6 -mt-8 w-[calc(100%+3rem)] border-t border-hairline px-6">
        <SiteEditor
          draft={draft}
          published={published}
          publicSlug={wedding.public_slug}
          origin={origin}
          contentKey={contentKey}
          sitePanel={<PublicSitePanel publicSlug={wedding.public_slug} origin={origin} />}
          sectionInfo={{ ...sectionInfo, ...blockInfo }}
          checklist={checklist}
          hasPhoto={Boolean(wedding.hero_photo_url)}
        />
      </div>
    </main>
  );
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });
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
