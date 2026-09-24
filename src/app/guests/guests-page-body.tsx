import type {
  ContactSubmission,
  Guest,
  GuestPost,
  RegistryItem,
  RsvpSubmission,
  Wedding,
  WeddingAccommodation,
  WeddingFaq,
  WeddingGalleryPhoto,
} from "@/lib/supabase/types";
import { FULL_WIDTH } from "@/lib/layout";
import { GuestsManager } from "./guests-manager";
import { RegistryManager } from "./registry-manager";
import { HeroPhotoPanel } from "./hero-photo-panel";
import { PendingRsvps, PublicSitePanel } from "./public-site-panel";
import { Accommodations, DressAndTravel, Faqs } from "./guest-site-details";
import { BulkInviteForm } from "./bulk-invite-form";
import { RsvpReminders } from "./rsvp-reminders";
import { GuestbookFeed } from "./guestbook-feed";
import { SongRequests } from "./song-requests";
import { ContactCollectorPanel } from "./contact-collector-panel";
import { TabbedCard } from "./card";
import { GalleryPanel } from "./gallery-panel";
import { GuestPostsFeed } from "./guest-posts-feed";
import { PhotoWallQr } from "./photo-wall-qr";

/**
 * Everything on the guests page below the nav.
 *
 * Separate from the page itself so the arrangement can be rendered against
 * made-up data -- a wide screen and a phone, side by side -- without a login
 * or a database behind it.
 */
export function GuestsPageBody({
  wedding,
  guests,
  registryItems,
  faqs,
  accommodations,
  rsvpSubmissions,
  contactSubmissions,
  origin,
  galleryPhotos = [],
  guestPosts = [],
  shareUrl = null,
  shareQrSvg = null,
}: {
  wedding: Wedding;
  guests: Guest[];
  registryItems: RegistryItem[];
  faqs: WeddingFaq[];
  accommodations: WeddingAccommodation[];
  rsvpSubmissions: RsvpSubmission[];
  contactSubmissions: ContactSubmission[];
  origin: string;
  galleryPhotos?: WeddingGalleryPhoto[];
  guestPosts?: GuestPost[];
  /** The photo wall's posting page, when the guest site is on. */
  shareUrl?: string | null;
  shareQrSvg?: string | null;
}) {
  // Street address is the field that matters for posting an invitation; a
  // guest with a city but no street still can't be mailed anything.
  const missingAddressCount = guests.filter((g) => !g.address_line1).length;

  // Which tabs have anything behind them. Worked out here so an empty one is
  // left off the strip entirely rather than offering a click that leads to
  // nothing -- the reminders block, for one, renders nothing without
  // stragglers.
  const stragglerCount = guests.filter(
    (g) => g.email && g.invite_sent_at && (g.status === "invited" || g.status === "pending"),
  ).length;
  const guestbookCount = guests.filter((g) => g.photo_url || g.message).length;
  const pendingPostCount = guestPosts.filter((p) => p.status === "pending").length;
  const songCount = guests.filter((g) => g.song_request).length;
  const pendingRsvps = rsvpSubmissions;

  // Wide: the list and the two panels that act on it side by side, all three
  // visible without scrolling. They used to be stacked -- first the whole page,
  // then the panels in one column beside the list -- and either way the guest
  // site sat under something 270 rows or two screens tall. Uncapped: three
  // columns fill any screen, so the list gets the room rather than the
  // margins. See src/lib/layout.ts for the widths.
  return (
    <div className={`w-full ${FULL_WIDTH}`}>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Guests
      </p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
        Guest list & RSVPs
      </h1>

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Three columns from 1280px: the list takes half, in the middle,
              with invitations to its left and the guest site to its right --
              both on screen from the start instead of stacked. Between 1024 and 1280 there isn't room for
              three, so the list keeps two thirds and the panels stack beside
              it. Stacked on a phone, list first -- there is no beside. The
              list stays first in the markup for that; `order` moves it to the
              middle only at xl. */}
          <div className="min-w-0 lg:col-span-8 lg:row-span-2 xl:order-2 xl:col-span-6 xl:row-span-1">
            <GuestsManager
              guests={guests}
              spreadsheetUrl={wedding.spreadsheet_url}
              partnerAName={wedding.partner_a_name}
              partnerBName={wedding.partner_b_name}
              sideAColor={wedding.side_a_color}
              sideBColor={wedding.side_b_color}
            />
          </div>

          <div className="min-w-0 lg:col-span-4 xl:order-1 xl:col-span-3">
            <TabbedCard
              title="Invitations & RSVPs"
              description="Three ways to reach your guests — collect their addresses, email them the link, or chase the ones who haven't replied."
              tabs={[
                {
                  key: "new",
                  label: `New RSVPs (${pendingRsvps.length})`,
                  hidden: !wedding.public_slug || pendingRsvps.length === 0,
                  content: (
                    <PendingRsvps
                      submissions={pendingRsvps}
                      guests={guests}
                      partnerAName={wedding.partner_a_name}
                      partnerBName={wedding.partner_b_name}
                    />
                  ),
                },
                {
                  key: "addresses",
                  label: "Collect addresses",
                  content: (
                    <ContactCollectorPanel
                      slug={wedding.public_slug}
                      origin={origin}
                      submissions={contactSubmissions}
                      guests={guests}
                      missingAddressCount={missingAddressCount}
                    />
                  ),
                },
                {
                  key: "invite",
                  label: "Invite by email",
                  content: (
                    <BulkInviteForm
                      guests={guests}
                      publicSlug={wedding.public_slug}
                      origin={origin}
                    />
                  ),
                },
                {
                  key: "nudge",
                  label: `Nudge stragglers (${stragglerCount})`,
                  hidden: !wedding.public_slug || stragglerCount === 0,
                  content: (
                    <RsvpReminders
                      guests={guests}
                      publicSlug={wedding.public_slug}
                      origin={origin}
                      rsvpDeadline={wedding.rsvp_deadline}
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* The guest site — set up once, then left alone. */}
          <div className="min-w-0 lg:col-span-4 xl:order-3 xl:col-span-3">
            <TabbedCard
              title="Your guest site"
              header={
                <PublicSitePanel publicSlug={wedding.public_slug} origin={origin} />
              }
              description="Everything guests see on your public page."
              tabs={[
                {
                  key: "photos",
                  label: `Photos (${galleryPhotos.length})`,
                  content: (
                    <div className="flex flex-col gap-8">
                      <HeroPhotoPanel photoUrl={wedding.hero_photo_url} />
                      <div className="border-t border-hairline pt-6">
                        <GalleryPanel photos={galleryPhotos} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: "details",
                  label: "Details",
                  content: <DressAndTravel wedding={wedding} />,
                },
                {
                  key: "stays",
                  label: `Stays (${accommodations.length})`,
                  content: <Accommodations items={accommodations} />,
                },
                {
                  key: "faq",
                  label: `FAQ (${faqs.length})`,
                  content: <Faqs faqs={faqs} />,
                },
                {
                  key: "registry",
                  label: "Registry",
                  content: <RegistryManager registryItems={registryItems} />,
                },
              ]}
            />
          </div>
        </div>

        {/* Full width, under both columns: a wall of photos and messages
            wants the room. Once the guest site is on, the table QR code keeps
            it on the page; before that it only appears once guests have left
            something. */}
        <TabbedCard
          title="From your guests"
          tabs={[
            {
              key: "wall",
              label: pendingPostCount > 0
                ? `Photo wall (${pendingPostCount} to review)`
                : `Photo wall (${guestPosts.length})`,
              hidden: guestPosts.length === 0,
              content: <GuestPostsFeed posts={guestPosts} />,
            },
            {
              key: "guestbook",
              label: `RSVP messages (${guestbookCount})`,
              hidden: guestbookCount === 0,
              content: (
                <GuestbookFeed
                  guests={guests}
                  publicSiteOn={Boolean(wedding.public_slug)}
                />
              ),
            },
            {
              key: "songs",
              label: `Song requests (${songCount})`,
              hidden: songCount === 0,
              content: <SongRequests guests={guests} />,
            },
            {
              key: "qr",
              label: "Table QR code",
              hidden: !shareUrl || !shareQrSvg,
              content:
                shareUrl && shareQrSvg ? <PhotoWallQr svg={shareQrSvg} shareUrl={shareUrl} /> : null,
            },
          ]}
          />
      </div>
    </div>
  );
}
