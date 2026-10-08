"use client";

import { useMemo, useRef, useState, useTransition, type CSSProperties } from "react";
import type { Guest, ItineraryEvent } from "@/lib/supabase/types";
import {
  dateKey,
  formatFullDate,
  formatTime,
  groupEventsByDate,
  parseDateKey,
} from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";
import { ItineraryCalendar } from "@/components/itinerary-calendar";
import { addItineraryEvent, updateItineraryEvent, deleteItineraryEvent, setEventInvites } from "./actions";
import { BirdEmptyState } from "@/components/wren-moments";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
// Wide-screen day strip: up to 7 columns side by side, each capped so a
// two-day weekend doesn't stretch into two 640px cards.
const MAX_COLUMNS = 7;
const MAX_COLUMN_WIDTH = 340;
const COLUMN_GAP = 12;

const labelClass = "flex flex-col gap-1 text-sm text-ink";

/** The guest list, as far as choosing who's invited to an event needs it. */
export type InviteGuest = Pick<Guest, "id" | "name" | "household">;

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
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Title
        <input name="title" required defaultValue={event?.title ?? ""} className={inputClass} />
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
      <RsvpSwitches event={event} />
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

function AddEventForm({ defaultDate, onDone }: { defaultDate: string; onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addItineraryEvent(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
        onDone();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-6 rounded-lg border border-hairline bg-parchment p-4"
    >
      <EventFields defaultDate={defaultDate} />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add event"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EventRow({
  event,
  guests,
  invited,
}: {
  event: ItineraryEvent;
  guests: InviteGuest[];
  invited: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateItineraryEvent(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Remove "${event.title}" from the schedule?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", event.id);
      const result = await deleteItineraryEvent(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <form action={handleSave}>
          <input type="hidden" name="id" value={event.id} />
          <EventFields event={event} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  const timeRange = [formatTime(event.start_time), event.end_time && formatTime(event.end_time)]
    .filter(Boolean)
    .join(" – ");

  return (
    <div className="border-b border-hairline py-3 last:border-b-0">
      {timeRange && <p className="font-mono-numbers text-xs text-brass xl:text-[11px]">{timeRange}</p>}
      <p className="mt-0.5 text-ink">{event.title}</p>
      {event.rsvp && (
        <p className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-forest/40 bg-forest/10 px-2 py-0.5 text-[11px] text-forest">
            Guests RSVP
          </span>
          {event.invite_only && (
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="rounded-full border border-brass/40 bg-brass/10 px-2 py-0.5 text-[11px] text-brass hover:border-brass"
            >
              Invite only · {invited.length} {invited.length === 1 ? "guest" : "guests"} — choose
            </button>
          )}
        </p>
      )}
      {picking && event.invite_only && (
        <InvitePicker event={event} guests={guests} invited={invited} onClose={() => setPicking(false)} />
      )}
      {event.location && <p className="mt-1 text-xs text-ink/50">{event.location}</p>}
      {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
      {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 xl:gap-x-2">
        <button onClick={() => downloadIcs(event)} className="text-xs text-brass hover:underline">
          Add to calendar
        </button>
        <button onClick={() => setIsEditing(true)} className="text-xs text-brass hover:underline">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-ink/50 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function DayColumn({
  date,
  events,
  isWeddingDay,
  onAdd,
  guests,
  invites,
}: {
  date: string;
  events: ItineraryEvent[];
  isWeddingDay: boolean;
  onAdd: () => void;
  guests: InviteGuest[];
  invites: Record<string, string[]>;
}) {
  return (
    <div className="w-full min-w-[240px] flex-1 rounded-lg border border-hairline bg-card p-4 shadow-sm xl:min-w-0 xl:p-3">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <p className="font-display text-lg font-semibold text-forest xl:text-base">
            {formatFullDate(date)}
          </p>
          {isWeddingDay && (
            <span className="font-mono-numbers text-[11px] uppercase tracking-wide text-brass">
              Wedding day
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-full border border-hairline px-2.5 py-1 text-xs text-ink transition-colors hover:border-forest"
        >
          + Add
        </button>
      </div>

      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/50">Nothing scheduled yet.</p>
      ) : (
        events.map((event) => (
          <EventRow key={event.id} event={event} guests={guests} invited={invites[event.id] ?? []} />
        ))
      )}
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormDate, setAddFormDate] = useState(weddingDate ?? dateKey(new Date()));

  const days = useMemo(() => groupEventsByDate(events), [events]);
  const columnCount = Math.min(Math.max(days.length, 1), MAX_COLUMNS);

  function openAddForm(date: string) {
    setAddFormDate(date);
    setShowAddForm(true);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr] xl:grid-cols-[240px_1fr]">
      <div className="rounded-lg border border-hairline bg-card p-5 shadow-sm">
        <ItineraryCalendar
          events={events}
          selectedDate={addFormDate}
          onSelectDate={openAddForm}
          initialDate={weddingDate ? parseDateKey(weddingDate) : new Date()}
          weddingDate={weddingDate}
        />
        <p className="mt-3 text-xs text-ink/50">Pick a date to add an event to that day.</p>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/60">
            {days.length === 0
              ? "No days scheduled yet."
              : `${days.length} day${days.length === 1 ? "" : "s"} scheduled, side by side below.`}
          </p>
          <button
            onClick={() => (showAddForm ? setShowAddForm(false) : openAddForm(addFormDate))}
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            {showAddForm ? "Close" : "+ Add event"}
          </button>
        </div>

        {showAddForm && (
          <AddEventForm defaultDate={addFormDate} onDone={() => setShowAddForm(false)} />
        )}

        {days.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-card p-8 shadow-sm">
            <BirdEmptyState className="">
              <p className="text-sm text-ink/60">
                Nothing on the schedule yet. Add your first event to start building the weekend.
              </p>
            </BirdEmptyState>
          </div>
        ) : (
          <div
            className="scroll-visible flex items-start gap-4 overflow-x-auto pb-2 xl:grid xl:gap-3 xl:overflow-visible xl:[grid-template-columns:var(--day-cols)] xl:[max-width:var(--day-max)]"
            style={
              {
                "--day-cols": `repeat(${columnCount}, minmax(0, 1fr))`,
                "--day-max": `${columnCount * MAX_COLUMN_WIDTH + (columnCount - 1) * COLUMN_GAP}px`,
              } as CSSProperties
            }
          >
            {days.map((day) => (
              <DayColumn
                key={day.date}
                date={day.date}
                events={day.events}
                isWeddingDay={weddingDate === day.date}
                onAdd={() => openAddForm(day.date)}
                guests={guests}
                invites={invites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
