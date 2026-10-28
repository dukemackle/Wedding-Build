"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { EventAudience, Guest, ItineraryEvent } from "@/lib/supabase/types";
import {
  AUDIENCES,
  audienceOf,
  dateKey,
  dayLabel,
  eventsToShift,
  findFlags,
  formatLength,
  formatShortDate,
  formatTime,
  fromMinutes,
  groupEventsByDate,
  guessAudience,
  isCeremony,
  parseDateKey,
  spanOf,
} from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";
import {
  addItineraryEvent,
  updateItineraryEvent,
  deleteItineraryEvent,
  setEventInvites,
  shiftItineraryEvents,
} from "./actions";
import { BirdEmptyState } from "@/components/wren-moments";
import { PlusIcon } from "@/components/page-header";
import { AUDIENCE_FILL, LockIcon } from "@/components/audience-tag";
import { DayList, DayTimeline, TimelineLegend } from "@/components/itinerary-timeline";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

/** The guest list, as far as choosing who's invited to an event needs it. */
export type InviteGuest = Pick<Guest, "id" | "name" | "household">;

function AudiencePicker({ value, onChange }: { value: EventAudience; onChange: (a: EventAudience) => void }) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-medium text-ink">Who sees this</legend>
      <div className="mt-1.5 grid gap-2">
        {AUDIENCES.map((a) => (
          <label
            key={a.value}
            className={`flex cursor-pointer items-start gap-2.5 rounded-lg border-[1.5px] bg-card px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/40 ${
              value === a.value ? "border-forest bg-[#FFF12F]/10" : "border-hairline hover:border-forest/40"
            }`}
          >
            <input
              type="radio"
              name="audience"
              value={a.value}
              checked={value === a.value}
              onChange={() => onChange(a.value)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-forest"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                {a.value === "private" ? (
                  <LockIcon />
                ) : (
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${AUDIENCE_FILL[a.value]}`} />
                )}
                {a.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink/60">{a.help}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function RsvpSwitches({ event }: { event?: ItineraryEvent }) {
  const [asks, setAsks] = useState(event?.rsvp ?? false);
  return (
    <div className="flex flex-col gap-2 rounded-md border border-hairline bg-parchment/60 px-3 py-2.5 text-sm text-ink sm:col-span-2">
      <input type="hidden" name="rsvp_fields" value="1" />
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="rsvp"
          checked={asks}
          onChange={(e) => setAsks(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-forest"
        />
        <span>
          Ask guests to RSVP to this one
          <span className="block text-xs text-ink/60">
            For weekends with several events: guests answer yes or no to each.
          </span>
        </span>
      </label>
      {asks && (
        <label className="ml-6 flex items-start gap-2">
          <input
            type="checkbox"
            name="invite_only"
            defaultChecked={event?.invite_only ?? false}
            className="mt-0.5 h-4 w-4 accent-forest"
          />
          <span>
            Invite only
            <span className="block text-xs text-ink/60">
              Only the guests you choose see it and are asked, and it stays off your public schedule.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

function EventFields({ event, defaultDate }: { event?: ItineraryEvent; defaultDate?: string }) {
  const [audience, setAudience] = useState<EventAudience>(event ? audienceOf(event) : "guests");
  // A new event follows its title ("Hair & makeup" -> wedding party) until
  // the couple picks an audience themselves.
  const [picked, setPicked] = useState(Boolean(event));
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Title
        <input
          name="title"
          required
          defaultValue={event?.title ?? ""}
          onChange={(e) => !picked && setAudience(guessAudience(e.target.value))}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Date
        <input
          type="date"
          name="event_date"
          required
          defaultValue={event?.event_date ?? defaultDate ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Start time
        <input
          type="time"
          name="start_time"
          defaultValue={event?.start_time?.slice(0, 5) ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        End time
        <input
          type="time"
          name="end_time"
          defaultValue={event?.end_time?.slice(0, 5) ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Location
        <input
          name="location"
          placeholder="Optional"
          defaultValue={event?.location ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Notes
        <textarea
          name="description"
          rows={2}
          placeholder="Optional — dress code, who's involved, reminders..."
          defaultValue={event?.description ?? ""}
          className={inputClass}
        />
      </label>
      <AudiencePicker
        value={audience}
        onChange={(a) => {
          setPicked(true);
          setAudience(a);
        }}
      />
      {audience === "guests" ? (
        <RsvpSwitches event={event} />
      ) : (
        <input type="hidden" name="rsvp_fields" value="1" />
      )}
    </div>
  );
}

/**
 * Who's invited to an invite-only event: the guest list with a tick each,
 * a household at a time if they like, and a search for long lists.
 */
function InvitePicker({
  event,
  guests,
  invited,
  onClose,
}: {
  event: ItineraryEvent;
  guests: InviteGuest[];
  invited: string[];
  onClose: () => void;
}) {
  const [chosen, setChosen] = useState(() => new Set(invited));
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const map = new Map<string, InviteGuest[]>();
    for (const g of guests) {
      if (term && !g.name.toLowerCase().includes(term) && !(g.household ?? "").toLowerCase().includes(term)) continue;
      const key = g.household?.trim() || "";
      map.set(key, [...(map.get(key) ?? []), g]);
    }
    return [...map.entries()].sort(([a], [b]) => (a ? (b ? a.localeCompare(b) : -1) : 1));
  }, [guests, search]);

  function toggle(ids: string[], on: boolean) {
    setChosen((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const result = await setEventInvites(event.id, [...chosen]);
      if (result.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <div className="mt-3 rounded-md border border-hairline bg-parchment p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">Who&apos;s invited to {event.title}?</p>
        <p className="font-mono-numbers text-xs text-ink/60">{chosen.size} chosen</p>
      </div>
      {guests.length === 0 ? (
        <p className="mt-2 text-sm text-ink/60">Add guests on the Guests page first.</p>
      ) : (
        <>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search names or households"
            aria-label="Search guests"
            className={`${inputClass} mt-2 w-full text-sm`}
          />
          <div className="mt-2 max-h-72 overflow-y-auto">
            {groups.map(([household, members]) => {
              const all = members.every((m) => chosen.has(m.id));
              return (
                <div key={household || "none"} className="border-b border-hairline py-2 last:border-b-0">
                  {household && (
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
                      <input
                        type="checkbox"
                        checked={all}
                        onChange={(e) => toggle(members.map((m) => m.id), e.target.checked)}
                        className="h-4 w-4 accent-forest"
                      />
                      {household}
                    </label>
                  )}
                  <div className={`mt-1 grid gap-1 sm:grid-cols-2 ${household ? "pl-6" : ""}`}>
                    {members.map((g) => (
                      <label key={g.id} className="flex min-h-9 items-center gap-2 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={chosen.has(g.id)}
                          onChange={(e) => toggle([g.id], e.target.checked)}
                          className="h-4 w-4 accent-forest"
                        />
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isPending || guests.length === 0}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save guests"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-ink/60 hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}

const SHIFTS = [-60, -45, -30, -15, 15, 30, 45, 60];

/**
 * "Move this and everything after": the change couples make most, done in
 * one go instead of editing every later event by hand.
 */
function ShiftControl({ event, dayEvents }: { event: ItineraryEvent; dayEvents: ItineraryEvent[] }) {
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  if (!event.start_time) return null;

  const moving = eventsToShift(dayEvents, event);
  const ceremony = dayEvents.find(isCeremony);
  const ceremonyStays = ceremony && ceremony.id !== event.id && !moving.includes(ceremony) && spanOf(ceremony)!.start > spanOf(event)!.start;

  function move() {
    setError(undefined);
    startTransition(async () => {
      const result = await shiftItineraryEvents(event.id, minutes);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mt-5 rounded-lg border border-hairline bg-parchment px-3 py-2.5 text-sm text-ink">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="shift-by">Move this{moving.length > 1 ? " and everything after" : ""} by</label>
        <select
          id="shift-by"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="rounded-md border border-hairline bg-card px-2 py-1 text-sm"
        >
          {SHIFTS.map((m) => (
            <option key={m} value={m}>
              {m > 0 ? "+" : "−"}
              {formatLength(Math.abs(m))}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={move}
          disabled={isPending}
          className="rounded-full border border-forest px-3 py-1 text-xs font-medium text-forest hover:bg-forest hover:text-parchment disabled:opacity-50"
        >
          {isPending ? "Moving…" : "Move"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-ink/60">
        {moving.length === 1 ? "Moves just this event." : `Moves ${moving.length} events.`}
        {ceremonyStays && ` The ceremony stays at ${formatTime(ceremony.start_time)}.`}
      </p>
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  );
}

type PanelMode = { kind: "add"; date: string } | { kind: "edit"; event: ItineraryEvent };

/**
 * Adding or changing an event. Wide screens: a card beside the timeline.
 * Phones: the same card as a sheet up from the bottom, over a scrim.
 */
function EventPanel({
  mode,
  dayEvents,
  guests,
  invites,
  onClose,
}: {
  mode: PanelMode;
  dayEvents: ItineraryEvent[];
  guests: InviteGuest[];
  invites: Record<string, string[]>;
  onClose: () => void;
}) {
  const [error, setError] = useState<string>();
  const [picking, setPicking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const event = mode.kind === "edit" ? mode.event : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = event ? await updateItineraryEvent(formData) : await addItineraryEvent(formData);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  function remove() {
    if (!event || !confirm(`Remove "${event.title}" from the schedule?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", event.id);
      const result = await deleteItineraryEvent(formData);
      if (result?.error) setError(result.error);
      else onClose();
    });
  }

  return (
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-forest/35 lg:hidden" />
      <section
        aria-label={event ? `Edit ${event.title}` : "Add an event"}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[20px] border border-hairline bg-card px-4 pb-6 pt-2.5 shadow-[0_-8px_30px_rgb(20_32_61/0.2)] lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-[18px] lg:px-5 lg:pb-5 lg:pt-4 lg:shadow-[0_2px_10px_rgb(20_32_61/0.05)]"
      >
        <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-10 rounded-full bg-ink/15 lg:hidden" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold leading-tight text-forest">
            {event ? event.title : "Add an event"}
          </h2>
          <button type="button" onClick={onClose} className="shrink-0 pt-1 text-sm text-ink/60 hover:underline">
            Close
          </button>
        </div>
        <form action={submit}>
          {event && <input type="hidden" name="id" value={event.id} />}
          <EventFields event={event} defaultDate={mode.kind === "add" ? mode.date : undefined} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {event && (
              <button type="button" onClick={remove} disabled={isPending} className="mr-auto text-sm text-ink/60 hover:underline">
                Remove
              </button>
            )}
            {event && (
              <button type="button" onClick={() => downloadIcs(event)} className="btn-secondary">
                Add to calendar
              </button>
            )}
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Saving…" : event ? "Save" : "Add event"}
            </button>
          </div>
        </form>
        {event?.rsvp && event.invite_only && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-xs text-ink hover:border-brass"
            >
              Invite only · {(invites[event.id] ?? []).length} chosen — {picking ? "hide" : "choose guests"}
            </button>
            {picking && (
              <InvitePicker event={event} guests={guests} invited={invites[event.id] ?? []} onClose={() => setPicking(false)} />
            )}
          </div>
        )}
        {event && <ShiftControl event={event} dayEvents={dayEvents} />}
      </section>
    </>
  );
}

/** The day's shape in four numbers, beside the timeline. */
function Glance({ date, weddingDate, events, flags }: { date: string; weddingDate: string | null; events: ItineraryEvent[]; flags: number }) {
  const spans = events.map(spanOf).filter((s) => s !== null);
  const ceremony = events.find(isCeremony);
  const at = (m: number | undefined) => (m === undefined ? "—" : formatTime(fromMinutes(m % 1440)));
  const tiles = [
    { label: "Starts", value: at(spans.length ? Math.min(...spans.map((s) => s.start)) : undefined) },
    ceremony?.start_time
      ? { label: "Ceremony", value: formatTime(ceremony.start_time) }
      : { label: "Events", value: String(events.length) },
    { label: "Wraps up", value: at(spans.length ? Math.max(...spans.map((s) => s.end)) : undefined) },
    { label: "Needs a look", value: flags ? `${flags} ${flags === 1 ? "thing" : "things"}` : "All clear", warn: flags > 0 },
  ];
  const label = dayLabel(date, weddingDate);
  return (
    <div className="hidden rounded-[18px] border border-hairline bg-card px-5 py-4 shadow-[0_2px_10px_rgb(20_32_61/0.05)] lg:block">
      <h2 className="mb-3 font-display text-[22px] font-semibold text-forest">
        {label === "Wedding day" ? "Your wedding day" : formatShortDate(date)} at a glance
      </h2>
      <dl className="grid grid-cols-2 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[10px] border border-hairline bg-parchment px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-ink/55">{t.label}</dt>
            <dd className={`font-mono-numbers text-[15px] ${t.warn ? "text-[#9a6b00]" : "text-ink"}`}>{t.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ItineraryManager({
  events,
  weddingDate,
  guests = [],
  invites = {},
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
  /** For choosing who's invited to invite-only events. */
  guests?: InviteGuest[];
  /** Event id -> the guest ids invited to it. */
  invites?: Record<string, string[]>;
}) {
  const days = useMemo(() => {
    const grouped = groupEventsByDate(events);
    if (weddingDate && !grouped.some((d) => d.date === weddingDate)) {
      grouped.push({ date: weddingDate, events: [] });
      grouped.sort((a, b) => a.date.localeCompare(b.date));
    }
    return grouped;
  }, [events, weddingDate]);

  const [guestView, setGuestView] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [panel, setPanel] = useState<{ kind: "add"; date: string } | { kind: "edit"; id: string } | null>(null);

  const day =
    days.find((d) => d.date === pickedDay) ?? days.find((d) => d.date === weddingDate) ?? days[0] ?? null;
  const flags = useMemo(() => (day ? findFlags(day.events) : []), [day]);
  const flagged = useMemo(() => new Set(flags.map((f) => f.eventId)), [flags]);
  // The event being edited comes from the latest props, so a save or a
  // "move everything after" shows straight away in the open panel.
  const editing = panel?.kind === "edit" ? events.find((e) => e.id === panel.id) : undefined;
  const mode: PanelMode | null =
    panel?.kind === "add" ? panel : editing ? { kind: "edit", event: editing } : null;

  const nextDay = () => {
    const last = days.at(-1)?.date ?? weddingDate ?? dateKey(new Date());
    const d = parseDateKey(last);
    d.setDate(d.getDate() + 1);
    return dateKey(d);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Days">
          {days.map((d) => {
            const on = d.date === day?.date;
            return (
              <button
                key={d.date}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setPickedDay(d.date);
                  setPanel(null);
                }}
                className={`shrink-0 rounded-[14px] border bg-card px-3.5 py-2 text-left shadow-[0_1px_2px_rgb(20_32_61/0.04)] transition-colors md:min-w-[150px] ${
                  on ? "border-forest ring-1 ring-forest" : "border-hairline hover:border-forest/40"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-[0.06em] text-ink/55 md:text-[11px]">
                  {formatShortDate(d.date)}
                </span>
                <span className="font-display text-[17px] font-semibold text-forest md:text-[19px]">
                  {dayLabel(d.date, weddingDate)}
                </span>
                <span className="hidden text-xs text-ink/55 md:inline">
                  {" "}· {d.events.length} {d.events.length === 1 ? "event" : "events"}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPanel({ kind: "add", date: nextDay() })}
            className="shrink-0 rounded-[14px] border border-dashed border-ink/25 px-3.5 py-2 text-sm text-ink/60 hover:border-forest hover:text-ink"
          >
            + Add a day
          </button>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
          {events.length > 0 && (
            <div role="group" aria-label="Show" className="inline-flex rounded-full border border-hairline bg-card p-0.5 text-xs">
              {[
                { on: false, label: "Everything" },
                { on: true, label: "What guests see" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={guestView === o.on}
                  onClick={() => setGuestView(o.on)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
                    guestView === o.on ? "bg-forest text-parchment" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setPanel({ kind: "add", date: day?.date ?? weddingDate ?? dateKey(new Date()) })}
            className="btn-primary whitespace-nowrap"
          >
            <PlusIcon /> Add event
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[18px] border border-hairline bg-card p-4 shadow-[0_2px_10px_rgb(20_32_61/0.05)] sm:p-6">
          {!day || day.events.length === 0 ? (
            <BirdEmptyState className="">
              <p className="text-sm text-ink/60">
                {events.length === 0
                  ? "Nothing on the schedule yet. Start with the ceremony time and build the day around it."
                  : "Nothing on this day yet."}
              </p>
            </BirdEmptyState>
          ) : (
            <>
              {flags.length > 0 && (
                <ul className="mb-4 flex flex-col gap-2">
                  {flags.map((f, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border border-[#f3dc7a] bg-[#fff8d6] px-3 py-2 text-[13px] text-ink"
                    >
                      <span className="font-medium">{f.message}</span>
                      <button
                        type="button"
                        onClick={() => setPanel({ kind: "edit", id: f.eventId })}
                        className="font-medium text-[#2243B6] hover:underline sm:ml-auto"
                      >
                        Open it
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mb-4 hidden lg:block">
                <TimelineLegend />
              </div>
              <div className="hidden lg:block">
                <DayTimeline
                  events={day.events}
                  selectedId={editing?.id}
                  onSelect={(e) => setPanel({ kind: "edit", id: e.id })}
                  guestView={guestView}
                  flagged={flagged}
                />
              </div>
              <div className="lg:hidden">
                <DayList
                  events={day.events}
                  selectedId={editing?.id}
                  onSelect={(e) => setPanel({ kind: "edit", id: e.id })}
                  guestView={guestView}
                  flagged={flagged}
                />
              </div>
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          {day && day.events.length > 0 && (
            <Glance date={day.date} weddingDate={weddingDate} events={day.events} flags={flags.length} />
          )}
          {mode ? (
            <EventPanel
              key={mode.kind === "edit" ? `${mode.event.id}-${mode.event.updated_at}` : `add-${mode.date}`}
              mode={mode}
              dayEvents={day?.events ?? []}
              guests={guests}
              invites={invites}
              onClose={() => setPanel(null)}
            />
          ) : (
            <p className="hidden rounded-[18px] border border-dashed border-hairline px-5 py-4 text-sm text-ink/60 lg:block">
              Pick an event on the timeline to change it, or move it and everything after in one go.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
