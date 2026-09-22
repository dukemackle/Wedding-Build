import type {
  ContactSubmission,
  Guest,
  RegistryItem,
  RsvpSubmission,
  Wedding,
  WeddingAccommodation,
  WeddingFaq,
} from "@/lib/supabase/types";
import { WIDE_WIDTH } from "@/lib/layout";
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
}: {
  wedding: Wedding;
  guests: Guest[];
  registryItems: RegistryItem[];
  faqs: WeddingFaq[];
  accommodations: WeddingAccommodation[];
  rsvpSubmissions: RsvpSubmission[];
  contactSubmissions: ContactSubmission[];
  origin: string;
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
  const songCount = guests.filter((g) => g.song_request).length;
  const pendingRsvps = rsvpSubmissions;

  // Wide: the guest list is a table with a dozen columns, and the rest of the
  // page is two columns of cards beside it on a big screen. See
  // src/lib/layout.ts for the three widths.
  return (
    <div className={`w-full ${WIDE_WIDTH}`}>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Guests
      </p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
        Guest list & RSVPs
      </h1>

      <div className="flex flex-col gap-8">
        {/* The reason for the page, so it goes first and gets the full
            width: the table is the widest thing here. */}
        <GuestsManager guests={guests} spreadsheetUrl={wedding.spreadsheet_url} />

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left, and wider: the things with work in them today. */}
          <div className="min-w-0 lg:col-span-7">
            <TabbedCard
              title="Invitations & RSVPs"
              description="Three ways to reach your guests — collect their addresses, email them the link, or chase the ones who haven't replied."
              tabs={[
                {
                  key: "new",
                  label: `New RSVPs (${pendingRsvps.length})`,
                  hidden: !wedding.public_slug || pendingRsvps.length === 0,
                  content: <PendingRsvps submissions={pendingRsvps} />,
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

          {/* Right: the guest site — set up once, then left alone. */}
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-5">
            <TabbedCard
              title="Your guest site"
              header={
                <PublicSitePanel publicSlug={wedding.public_slug} origin={origin} />
              }
              description="Everything guests see on your public page."
              tabs={[
                {
                  key: "banner",
                  label: "Banner",
                  content: <HeroPhotoPanel photoUrl={wedding.hero_photo_url} />,
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
            wants the room, and there's nothing to set up here — the card
            only appears once guests have left something. */}
        <TabbedCard
          title="From your guests"
          tabs={[
            {
              key: "guestbook",
              label: `Guestbook (${guestbookCount})`,
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
          ]}
          />
      </div>
    </div>
  );
}
