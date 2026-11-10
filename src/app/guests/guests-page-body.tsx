import type { KeepApartPair } from "@/lib/keep-apart";
import type {
  ContactSubmission,
  Guest,
  GuestPost,
  ItineraryEvent,
  RsvpSubmission,
  Wedding,
} from "@/lib/supabase/types";
import { EventHeadcounts } from "./event-headcounts";
import { PageHeader } from "@/components/page-header";
import { RsvpMilestone } from "./rsvp-milestone";
import { FULL_WIDTH } from "@/lib/layout";
import { GuestsManager } from "./guests-manager";
import { PendingRsvps } from "./public-site-panel";
import { BulkInviteForm } from "./bulk-invite-form";
import { RsvpReminders } from "./rsvp-reminders";
import { GuestbookFeed } from "./guestbook-feed";
import { SongRequests } from "./song-requests";
import { ContactCollectorPanel } from "./contact-collector-panel";
import { GuestPostsFeed } from "./guest-posts-feed";
import { PhotoWallQr } from "./photo-wall-qr";
import { GuestSheetSync } from "./guest-sheet-sync";
import { StageHeader } from "./stage-header";
import { MealsPanel, StatusLine, type StatusItem } from "./status-line";
import { GuestActionsPanel } from "./guest-actions-panel";
import { googleClientId } from "@/lib/google-sheets";
import { timeAgo } from "@/lib/time-ago";
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
  photoWallEvents = [],
  photoWallTables = [],
  shareUrl = null,
  shareQrSvg = null,
  sheetLink = null,
  sheetChanges = null,
  canEdit = true,
  venueCapacity = null,
  costPerGuest = null,
  today = new Date().toISOString().slice(0, 10),
  keepApart = [],
}: {
  /** Guests not to seat together (0166); empty for a view-only member. */
  keepApart?: KeepApartPair[];
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
  /** The whole itinerary, for the photo wall's chapters (0159). */
  photoWallEvents?: ItineraryEvent[];
  /** Seating tables, for which tables have posted. */
  photoWallTables?: { id: string; name: string }[];
  /** The photo wall's posting page, when the guest site is on. */
  shareUrl?: string | null;
  shareQrSvg?: string | null;
  sheetLink?: SheetLinkView | null;
  sheetChanges?: SiteChanges | null;
  canEdit?: boolean;
  /** What the booked venue holds, for the stage header's fit line. */
  venueCapacity?: number | null;
  /** The Budget's estimate of one more guest, for the tier costs. */
  costPerGuest?: number | null;
  today?: string;
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
  const confirmedGuests = guests.filter((g) => g.status === "confirmed");

  // Meals for the caterer: a +1 has their own meal (0165), and one not chosen
  // yet still counts, so the tally adds up to the headcount.
  const mealCounts = new Map<string, number>();
  for (const guest of confirmedGuests) {
    const key = guest.meal || "Not selected";
    mealCounts.set(key, (mealCounts.get(key) ?? 0) + 1);
    if (guest.plus_one) {
      const plusOneKey = guest.plus_one_meal || "Not selected";
      mealCounts.set(plusOneKey, (mealCounts.get(plusOneKey) ?? 0) + 1);
    }
  }
  const mealBreakdown = Array.from(mealCounts.entries()).sort(
    (a, b) => Number(a[0] === "Not selected") - Number(b[0] === "Not selected") || b[1] - a[1],
  );

  // Per-event yeses (plus-ones counted), the same sums the event panel shows.
  const eventYes = rsvpEvents.map((event) => {
    const asked = event.invite_only
      ? guests.filter((g) => (eventInvites[event.id] ?? []).includes(g.id))
      : guests;
    const yes = asked
      .filter((g) => g.event_rsvps?.[event.id] === true)
      .reduce((n, g) => n + 1 + (g.plus_one ? 1 : 0), 0);
    return { title: event.title, yes };
  });

  const sheetChangeCount = sheetChanges ? sheetChanges.added + sheetChanges.edited + sheetChanges.removed : 0;
  const sheetOffered = Boolean(sheetLink) || (canEdit && Boolean(googleClientId()));
  const statusItems: StatusItem[] = [];
  if (sheetOffered) {
    statusItems.push({
      key: "sheet",
      attention: Boolean(sheetLink) && canEdit && sheetChangeCount > 0,
      label: !sheetLink ? (
        "Keep a Google Sheet in sync"
      ) : sheetChangeCount > 0 && sheetLink.mode === "drive" ? (
        <span key="l">Google Sheet · {sheetChangeCount} {sheetChangeCount === 1 ? "change" : "changes"} to sync</span>
      ) : (
        <span key="l" className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
          Google Sheet{sheetLink.last_synced_at ? ` synced ${timeAgo(sheetLink.last_synced_at)}` : " linked"}
        </span>
      ),
      panel: (
        <GuestSheetSync
          key="p"
          link={sheetLink}
          changes={sheetChanges}
          canEdit={canEdit}
          partnerAName={wedding.partner_a_name}
          partnerBName={wedding.partner_b_name}
        />
      ),
    });
  }
  if (eventYes.length > 0) {
    statusItems.push({
      key: "events",
      label: (
        <span key="l">
          {eventYes.slice(0, 3).map((e, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {e.title} <b className="font-mono-numbers font-semibold text-forest">{e.yes}</b>
            </span>
          ))}
          {eventYes.length > 3 && ` · ${eventYes.length - 3} more`}
        </span>
      ),
      panel: <EventHeadcounts key="p" events={rsvpEvents} guests={guests} invites={eventInvites} />,
    });
  }
  if (confirmedGuests.length > 0) {
    statusItems.push({
      key: "meals",
      label: (
        <span key="l">
          Meals{" "}
          {mealBreakdown.slice(0, 3).map(([meal, count], i) => (
            <span key={meal}>
              {i > 0 && " · "}
              <b className="font-mono-numbers font-semibold text-forest">{count}</b>{" "}
              {meal === "Not selected" ? "not chosen" : meal.toLowerCase()}
            </span>
          ))}
          {mealBreakdown.length > 3 && " · …"}
        </span>
      ),
      panel: <MealsPanel key="p" breakdown={mealBreakdown} />,
    });
  }

  const toolbar =
    guests.length > 0 || statusItems.length > 0 ? (
      <>
        {guests.length > 0 && (
          <StageHeader
            guests={guests}
            venueCapacity={venueCapacity}
            costPerGuest={costPerGuest}
            rsvpDeadline={wedding.rsvp_deadline}
            today={today}
            bare
          />
        )}
        <StatusLine items={statusItems} />
      </>
    ) : undefined;

  // Wide: the list and the panel that acts on it side by side, the panel
  // sticky so it stays beside 270 rows. Phone: the list first, the panel a
  // bottom sheet behind the bottom bar. Uncapped: see src/lib/layout.ts.
  return (
    <div className={`w-full ${FULL_WIDTH} pb-24 lg:pb-0`}>
      <PageHeader eyebrow="Guests" title="Everyone you" accent="want there" photo="guests" toolbar={toolbar}>
        Addresses, RSVPs and meals in one list, with the counts kept for you.
      </PageHeader>
      <RsvpMilestone confirmed={confirmedGuests.length} weddingId={wedding.id} />

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 lg:col-span-8 xl:col-span-9">
          <GuestsManager
            guests={guests}
            spreadsheetUrl={wedding.spreadsheet_url}
            partnerAName={wedding.partner_a_name}
            partnerBName={wedding.partner_b_name}
            sideAColor={wedding.side_a_color}
            sideBColor={wedding.side_b_color}
            sideBothColor={wedding.side_both_color}
            mealOptions={wedding.meal_options}
            publicSlug={wedding.public_slug}
            canEdit={canEdit}
            keepApart={keepApart}
          />
        </div>

        <div className="min-w-0 lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4">
          <GuestActionsPanel
            canEdit={canEdit}
            newRsvpCount={wedding.public_slug ? pendingRsvps.length : 0}
            invitations={[
              {
                key: "new",
                title: "New RSVPs",
                detail: "Replies from your site waiting to be matched",
                pill: String(pendingRsvps.length),
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
                title: "Collect addresses",
                detail: "Send one link; guests fill in their own and you approve each",
                pill: missingAddressCount > 0 ? `${missingAddressCount} missing` : undefined,
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
                title: "Invite by email",
                detail: "Email your site link to guests who have an email",
                content: <BulkInviteForm guests={guests} publicSlug={wedding.public_slug} origin={origin} />,
              },
              {
                key: "nudge",
                title: "Nudge who hasn\u2019t replied",
                detail: "A friendly reminder before your RSVP date",
                pill: String(stragglerCount),
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
            fromGuests={[
              {
                key: "wall",
                title: "Photo wall",
                detail: "Photos guests shared from the day",
                pill: pendingPostCount > 0 ? `${pendingPostCount} to review` : String(guestPosts.length),
                hidden: guestPosts.length === 0,
                content: <GuestPostsFeed posts={guestPosts} events={photoWallEvents} tables={photoWallTables} />,
              },
              {
                key: "guestbook",
                title: "RSVP messages",
                detail: "Notes guests left with their reply",
                pill: String(guestbookCount),
                hidden: guestbookCount === 0,
                content: <GuestbookFeed guests={guests} publicSiteOn={Boolean(wedding.public_slug)} />,
              },
              {
                key: "songs",
                title: "Song requests",
                detail: "What guests want to dance to",
                pill: String(songCount),
                hidden: songCount === 0,
                content: <SongRequests guests={guests} />,
              },
              {
                key: "qr",
                title: "Table QR code",
                detail: "For guests to add photos on the day",
                hidden: !shareUrl || !shareQrSvg,
                content: shareUrl && shareQrSvg ? <PhotoWallQr svg={shareQrSvg} shareUrl={shareUrl} /> : null,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
