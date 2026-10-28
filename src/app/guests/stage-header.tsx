import Link from "next/link";
import type { ReactNode } from "react";
import type { Guest } from "@/lib/supabase/types";
import { guestListStage, type GuestListStage } from "@/lib/guest-tidy";

/**
 * Where the list stands, at the top of the page. The number that matters
 * changes as the planning moves on: while the list is being built it's how
 * many people against what the venue holds and what each tier costs; once
 * invites are out it's who's coming; after the deadline it's the final count.
 */

const STEPS: { stage: GuestListStage; label: string }[] = [
  { stage: "building", label: "Building your list" },
  { stage: "invites", label: "Invites out" },
  { stage: "final", label: "Final count" },
];

// Brand palette (CLAUDE.md): royal for what's settled, the two yellows for
// the maybes. Yellows are fills only.
const TIER_COLORS = { must: "#2243B6", would: "#FFD301", room: "#FFF12F" };
const REPLY_COLORS = { yes: "#2243B6", no: "#8A90A0", waiting: "#F3F1EC" };

function people(guests: Guest[]) {
  return guests.reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
}

function money(amount: number) {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(`${toIso}T12:00:00`) - Date.parse(`${fromIso}T12:00:00`)) / 86_400_000);
}

function Stepper({ stage }: { stage: GuestListStage }) {
  const current = STEPS.findIndex((s) => s.stage === stage);
  return (
    <ol className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.06em]" aria-label="Guest list stage">
      {STEPS.map((step, i) => (
        <li
          key={step.stage}
          aria-current={i === current ? "step" : undefined}
          className={
            i === current
              ? "rounded-full bg-forest px-3 py-1.5 font-semibold text-parchment"
              : `rounded-full border border-hairline px-3 py-1.5 ${i < current ? "text-ink/70" : "text-ink/55"} ${i === current + 1 ? "" : "max-sm:hidden"}`
          }
        >
          {i < current ? "✓ " : `${i + 1} · `}
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function Bar({
  segments,
  scale,
  marker,
}: {
  segments: { value: number; color: string }[];
  scale: number;
  marker?: { at: number; label: string };
}) {
  const pct = (n: number) => `${Math.min(100, (n / (scale || 1)) * 100)}%`;
  return (
    <div className={`relative ${marker ? "pt-6" : ""}`}>
      {marker && (
        <>
          <span
            className="absolute top-0 whitespace-nowrap text-xs font-semibold text-forest"
            style={{ left: pct(marker.at), transform: `translateX(${marker.at / scale > 0.8 ? "-100%" : "-50%"})` }}
          >
            {marker.label}
          </span>
          <span
            aria-hidden="true"
            className="absolute top-[18px] -bottom-1.5 w-0.5 bg-forest"
            style={{ left: pct(marker.at) }}
          />
        </>
      )}
      <div className="flex h-6 overflow-hidden rounded-md border border-hairline bg-parchment sm:h-7">
        {segments.map((s, i) =>
          s.value > 0 ? <div key={i} style={{ width: pct(s.value), backgroundColor: s.color }} /> : null,
        )}
      </div>
    </div>
  );
}

function Key({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-3 w-3 rounded-[3px] shadow-[inset_0_0_0_1px_rgb(20_32_61/0.12)]"
        style={{ backgroundColor: color }}
      />
      <span>
        <span className="font-mono-numbers font-medium text-forest">{count}</span> {label}
      </span>
    </span>
  );
}

export function StageHeader({
  guests,
  venueCapacity,
  costPerGuest,
  rsvpDeadline,
  today,
}: {
  guests: Guest[];
  /** What the booked venue holds; null with no venue or no listed capacity. */
  venueCapacity: number | null;
  /** The Budget's estimate of what one more guest adds. */
  costPerGuest: number | null;
  rsvpDeadline: string | null;
  /** YYYY-MM-DD, passed in so server and tests agree on the day. */
  today: string;
}) {
  if (guests.length === 0) return null;
  const stage = guestListStage(guests, rsvpDeadline, today);

  return (
    <section
      aria-label="Where your list stands"
      className="flex flex-col gap-6 rounded-lg border border-hairline bg-card p-4 shadow-sm sm:p-6 lg:flex-row lg:gap-8"
    >
      {stage === "building" ? (
        <BuildingStage guests={guests} venueCapacity={venueCapacity} costPerGuest={costPerGuest} />
      ) : (
        <ReplyStage guests={guests} stage={stage} rsvpDeadline={rsvpDeadline} today={today} />
      )}
    </section>
  );
}

function Aside({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-hairline pt-4 lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <p className="text-[11px] uppercase tracking-[0.1em] text-ink/55">What it means</p>
      {children}
    </div>
  );
}

function BuildingStage({
  guests,
  venueCapacity,
  costPerGuest,
}: {
  guests: Guest[];
  venueCapacity: number | null;
  costPerGuest: number | null;
}) {
  const must = people(guests.filter((g) => g.priority === "must_invite"));
  const would = people(guests.filter((g) => g.priority === "would_like"));
  const room = people(guests.filter((g) => g.priority === "if_room"));
  const total = must + would + room;
  const cap = venueCapacity && venueCapacity > 0 ? venueCapacity : null;

  // One invitation per household; a guest with none set is their own.
  const households = new Set(
    guests.map((g) => g.household?.trim().toLowerCase() || `guest:${g.id}`),
  ).size;

  let fit: ReactNode;
  if (!cap) {
    fit = (
      <>
        Book your venue to see whether everyone fits.{" "}
        <Link href="/venues" className="font-medium text-[#9a6b00] hover:underline">
          Browse venues
        </Link>
      </>
    );
  } else if (must > cap) {
    fit = (
      <>
        Your must-invites alone are <b>{must - cap} over</b> what the venue holds.
      </>
    );
  } else if (must + would > cap) {
    fit = (
      <>
        Your must-invites fit with <b>{cap - must} {cap - must === 1 ? "seat" : "seats"}</b> to spare.
        Adding everyone you&rsquo;d like puts you <b>{must + would - cap} over</b> the venue.
      </>
    );
  } else if (total > cap) {
    fit = (
      <>
        Must-invites and would-likes fit. Adding the if-there&rsquo;s-room guests puts you{" "}
        <b>{total - cap} over</b>.
      </>
    );
  } else {
    fit = (
      <>
        Everyone fits, with <b>{cap - total} {cap - total === 1 ? "seat" : "seats"}</b> to spare.
      </>
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Stepper stage="building" />
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-5xl font-semibold leading-none text-forest sm:text-6xl">{total}</span>
          <span className="text-ink/80">
            {total === 1 ? "person" : "people"} on your list
            {households < guests.length && (
              <span className="text-ink/55"> · {households} invitations</span>
            )}
          </span>
        </p>
        <div>
          <Bar
            scale={Math.max(total, cap ?? 0)}
            marker={cap ? { at: cap, label: `Venue holds ${cap}` } : undefined}
            segments={[
              { value: must, color: TIER_COLORS.must },
              { value: would, color: TIER_COLORS.would },
              { value: room, color: TIER_COLORS.room },
            ]}
          />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/80">
            <Key color={TIER_COLORS.must} count={must} label="must invite" />
            <Key color={TIER_COLORS.would} count={would} label="would like" />
            <Key color={TIER_COLORS.room} count={room} label="if there's room" />
          </div>
        </div>
      </div>
      <Aside>
        <p className="leading-relaxed text-ink">{fit}</p>
        {costPerGuest != null && costPerGuest > 0 && (would > 0 || room > 0) && (
          <>
            <dl className="flex flex-col gap-1 text-sm text-forest">
              {would > 0 && (
                <div className="flex justify-between">
                  <dt>Would like</dt>
                  <dd className="font-mono-numbers">+{money(would * costPerGuest)}</dd>
                </div>
              )}
              {room > 0 && (
                <div className="flex justify-between">
                  <dt>If there&rsquo;s room</dt>
                  <dd className="font-mono-numbers">+{money(room * costPerGuest)}</dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-ink/55">
              At about {money(costPerGuest)} a guest, from your{" "}
              <Link href="/budget" className="underline hover:text-forest">
                Budget
              </Link>
              &rsquo;s estimate.
            </p>
          </>
        )}
      </Aside>
    </>
  );
}

function ReplyStage({
  guests,
  stage,
  rsvpDeadline,
  today,
}: {
  guests: Guest[];
  stage: GuestListStage;
  rsvpDeadline: string | null;
  today: string;
}) {
  const yes = guests.filter((g) => g.status === "confirmed");
  const no = guests.filter((g) => g.status === "declined").length;
  const waitingGuests = guests.filter((g) => g.status !== "confirmed" && g.status !== "declined");
  const waiting = waitingGuests.length;
  const withEmail = waitingGuests.filter((g) => g.email).length;
  const coming = people(yes);

  let when: string;
  if (!rsvpDeadline) when = "no RSVP deadline set yet";
  else if (stage === "final") when = `RSVPs closed ${longDate(rsvpDeadline)}`;
  else {
    const days = daysBetween(today, rsvpDeadline);
    when = `RSVPs close ${longDate(rsvpDeadline)}, ${days === 0 ? "today" : days === 1 ? "tomorrow" : `${days} days from now`}`;
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Stepper stage={stage} />
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-5xl font-semibold leading-none text-forest sm:text-6xl">{coming}</span>
          <span className="text-ink/80">
            {stage === "final" ? "coming" : "coming so far"}
            {coming !== yes.length && ", plus-ones included"}
            <span className="text-ink/55"> · {when}</span>
          </span>
        </p>
        <div>
          <Bar
            scale={guests.length}
            segments={[
              { value: yes.length, color: REPLY_COLORS.yes },
              { value: no, color: REPLY_COLORS.no },
              { value: waiting, color: REPLY_COLORS.waiting },
            ]}
          />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/80">
            <Key color={REPLY_COLORS.yes} count={yes.length} label="said yes" />
            <Key color={REPLY_COLORS.no} count={no} label="can't make it" />
            <Key color={REPLY_COLORS.waiting} count={waiting} label="haven't replied" />
          </div>
        </div>
      </div>
      <Aside>
        <p className="leading-relaxed text-ink">
          {waiting === 0 ? (
            <>Everyone has answered. {coming} is the number your Budget and caterer work from.</>
          ) : stage === "final" ? (
            <>
              {coming} is the number your Budget works from. <b>{waiting}</b> still haven&rsquo;t
              replied: chase them, or mark them as not coming.
            </>
          ) : (
            <>
              <b>{waiting}</b> haven&rsquo;t replied yet.
              {withEmail > 0 && (
                <>
                  {" "}
                  {withEmail === waiting ? "All" : withEmail} of them have an email address, so you can
                  nudge them from{" "}
                  <a href="#invitations" className="font-medium text-[#9a6b00] hover:underline">
                    Invitations &amp; RSVPs
                  </a>
                  .
                </>
              )}
            </>
          )}
        </p>
      </Aside>
    </>
  );
}
