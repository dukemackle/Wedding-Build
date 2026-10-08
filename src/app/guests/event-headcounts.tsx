"use client";

import { useState, useTransition } from "react";
import type { Guest, ItineraryEvent } from "@/lib/supabase/types";
import { formatFullDate, formatTime } from "@/lib/itinerary";
import { setGuestEventAnswer } from "./actions";

type Answer = boolean | null;

/**
 * Who's coming to each RSVP event, for weddings over several (mehndi,
 * sangeet, reception...). A headcount per event, counting plus-ones, and
 * under each the guests asked -- everyone for an open event, the chosen few
 * for an invite-only one -- whose answers the couple can set by hand for
 * people who replied by phone or in person.
 */
export function EventHeadcounts({
  events,
  guests,
  invites,
}: {
  events: ItineraryEvent[];
  guests: Guest[];
  invites: Record<string, string[]>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  if (events.length === 0) return null;

  return (
    <div className="rounded-lg border border-hairline bg-card p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-forest">Who&apos;s coming to what</h2>
      <p className="mt-1 text-sm text-ink/60">
        Counts include plus-ones. Open an event to see everyone asked and change an answer.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {events.map((event) => {
          const asked = event.invite_only
            ? guests.filter((g) => (invites[event.id] ?? []).includes(g.id))
            : guests;
          const answer = (g: Guest): Answer => g.event_rsvps?.[event.id] ?? null;
          const people = (g: Guest) => 1 + (g.plus_one ? 1 : 0);
          const yes = asked.filter((g) => answer(g) === true).reduce((n, g) => n + people(g), 0);
          const no = asked.filter((g) => answer(g) === false).length;
          const waiting = asked.filter((g) => answer(g) === null).length;
          const when = [formatFullDate(event.event_date), event.start_time && formatTime(event.start_time)]
            .filter(Boolean)
            .join(" · ");
          return (
            <button
              key={event.id}
              type="button"
              aria-expanded={open === event.id}
              onClick={() => setOpen(open === event.id ? null : event.id)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                open === event.id ? "border-forest bg-forest/5" : "border-hairline hover:border-ink/30"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{event.title}</span>
                {event.invite_only && (
                  <span className="shrink-0 rounded-full border border-brass/40 px-1.5 text-[10px] text-brass">
                    Invite only
                  </span>
                )}
              </span>
              <span className="block text-xs text-ink/60">{when}</span>
              <span className="mt-2 block font-display text-3xl text-forest">{yes}</span>
              <span className="block text-xs text-ink/60">
                coming · {no} not · {waiting} waiting
              </span>
            </button>
          );
        })}
      </div>
      {open && (
        <EventGuests
          key={open}
          event={events.find((e) => e.id === open)!}
          guests={
            events.find((e) => e.id === open)!.invite_only
              ? guests.filter((g) => (invites[open] ?? []).includes(g.id))
              : guests
          }
        />
      )}
    </div>
  );
}

function EventGuests({ event, guests }: { event: ItineraryEvent; guests: Guest[] }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(guests.map((g) => [g.id, g.event_rsvps?.[event.id] ?? null])),
  );
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  function set(guestId: string, value: Answer) {
    const before = answers[guestId];
    setAnswers((a) => ({ ...a, [guestId]: value }));
    startTransition(async () => {
      const result = await setGuestEventAnswer(guestId, event.id, value);
      if (result.error) {
        setError(result.error);
        setAnswers((a) => ({ ...a, [guestId]: before }));
      }
    });
  }

  if (guests.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        No one is invited yet. Choose guests for it on the Itinerary page.
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-hairline pt-3">
      {error && <p className="mb-2 text-sm text-red-800">{error}</p>}
      <ul className="grid gap-x-6 sm:grid-cols-2">
        {guests.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 border-b border-hairline py-1.5">
            <span className="min-w-0 truncate text-sm text-ink">
              {g.name}
              {g.plus_one && <span className="ml-1 text-xs text-ink/50">+1</span>}
            </span>
            <span role="group" aria-label={`${g.name}, ${event.title}`} className="flex shrink-0 gap-1">
              {(
                [
                  [true, "Yes"],
                  [false, "No"],
                  [null, "—"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={answers[g.id] === value}
                  onClick={() => set(g.id, value)}
                  className={`min-h-9 min-w-11 rounded-md border px-2 text-xs ${
                    answers[g.id] === value
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-hairline text-ink/70 hover:border-ink/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
