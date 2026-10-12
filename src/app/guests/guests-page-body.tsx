import type {
  ContactSubmission,
  Guest,
  GuestPost,
  ItineraryEvent,
  RsvpSubmission,
  Wedding,
} from "@/lib/supabase/types";
import { EventHeadcounts } from "./event-headcounts";
import { FULL_WIDTH } from "@/lib/layout";
import { GuestsManager } from "./guests-manager";
import { PendingRsvps } from "./public-site-panel";
import { BulkInviteForm } from "./bulk-invite-form";
import { RsvpReminders } from "./rsvp-reminders";
import { GuestbookFeed } from "./guestbook-feed";
import { SongRequests } from "./song-requests";
import { ContactCollectorPanel } from "./contact-collector-panel";
import { TabbedCard } from "./card";
import { GuestPostsFeed } from "./guest-posts-feed";
import { PhotoWallQr } from "./photo-wall-qr";
import { GuestSheetSync } from "./guest-sheet-sync";
import type { SheetLinkView, SiteChanges } from "@/lib/sheet-link-server";

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
  rsvpSubmissions,
  rsvpEvents = [],
  eventInvites = {},
  contactSubmissions,
  origin,
  guestPosts = [],
  shareUrl = null,
  shareQrSvg = null,
  sheetLink = null,
  sheetChanges = null,
  canEdit = true,
}: {
  wedding: Wedding;
  guests: Guest[];
  rsvpSubmissions: RsvpSubmission[];
  /** Schedule events guests RSVP to separately (0109). */
  rsvpEvents?: ItineraryEvent[];
  /** Event id -> guest ids, for invite-only events. */
  eventInvites?: Record<string, string[]>;
  contactSubmissions: ContactSubmission[];
  origin: string;
  guestPosts?: GuestPost[];
  /** The photo wall's posting page, when the guest site is on. */
  shareUrl?: string | null;
  shareQrSvg?: string | null;
  sheetLink?: SheetLinkView | null;
  sheetChanges?: SiteChanges | null;
  canEdit?: boolean;
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
  // The one line a folded Invitations card shows on a phone.
  const rsvpSummary =
    [
      pendingRsvps.length > 0 && `${pendingRsvps.length} new RSVP${pendingRsvps.length === 1 ? "" : "s"}`,
      stragglerCount > 0 && `${stragglerCount} to nudge`,
      missingAddressCount > 0 && `${missingAddressCount} missing an address`,
    ]
      .filter(Boolean)
      .join(" · ") || "Collect addresses, send invites, chase replies.";

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
        <GuestSheetSync
          link={sheetLink}
          changes={sheetChanges}
          canEdit={canEdit}
          partnerAName={wedding.partner_a_name}
          partnerBName={wedding.partner_b_name}
        />

        <EventHeadcounts events={rsvpEvents} guests={guests} invites={eventInvites} />

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Two columns from 1024px: the list takes two thirds (three
              quarters from 1280px) with invitations beside it, both on screen
              from the start. Stacked on a phone, invitations first, folded to one
              line: the list runs to hundreds of rows and RSVPs shouldn't sit
              under all of them. The guest site has its own tab, Guests › Guest site. */}
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <GuestsManager
              guests={guests}
              spreadsheetUrl={wedding.spreadsheet_url}
              partnerAName={wedding.partner_a_name}
              partnerBName={wedding.partner_b_name}
              sideAColor={wedding.side_a_color}
              sideBColor={wedding.side_b_color}
              sideBothColor={wedding.side_both_color}
            />
          </div>

          {/* Sticky, so it stays beside the list as you scroll 270 rows
              rather than ending halfway down and leaving a column of nothing. */}
          <div className="order-first min-w-0 lg:order-none lg:sticky lg:top-4 lg:col-span-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto xl:col-span-3">
            <TabbedCard
              title="Invitations & RSVPs"
              description="Three ways to reach your guests — collect their addresses, email them the link, or chase the ones who haven't replied."
              collapsible={{
                // Open on arrival when there's something waiting on the couple.
                defaultOpen: pendingRsvps.length > 0,
                summary: rsvpSummary,
              }}
              tabs={[
                {
                  key: "new",
                  label: `New RSVPs (${pendingRsvps.length})`,
                  hidden: !wedding.public_slug || pendingRsvps.length === 0,
                  content: (
                    <PendingRsvps
                      events={rsvpEvents}
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
