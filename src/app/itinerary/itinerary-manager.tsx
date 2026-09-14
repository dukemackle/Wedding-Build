"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { ItineraryEvent } from "@/lib/supabase/types";
import {
  dateKey,
  formatFullDate,
  formatTime,
  groupEventsByDate,
  parseDateKey,
} from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";
import { ItineraryCalendar } from "@/components/itinerary-calendar";
import { addItineraryEvent, updateItineraryEvent, deleteItineraryEvent } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

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

function EventRow({ event }: { event: ItineraryEvent }) {
  const [isEditing, setIsEditing] = useState(false);
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
      {timeRange && <p className="font-mono-numbers text-xs text-brass">{timeRange}</p>}
      <p className="mt-0.5 text-ink">{event.title}</p>
      {event.location && <p className="mt-1 text-xs text-ink/50">{event.location}</p>}
      {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
      {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      <div className="mt-2 flex items-center gap-3">
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
}: {
  date: string;
  events: ItineraryEvent[];
  isWeddingDay: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="w-full min-w-[220px] flex-1 rounded-lg border border-hairline bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <p className="font-display text-lg font-semibold text-forest">{formatFullDate(date)}</p>
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
        events.map((event) => <EventRow key={event.id} event={event} />)
      )}
    </div>
  );
}

export function ItineraryManager({
  events,
  weddingDate,
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormDate, setAddFormDate] = useState(weddingDate ?? dateKey(new Date()));

  const days = useMemo(() => groupEventsByDate(events), [events]);

  function openAddForm(date: string) {
    setAddFormDate(date);
    setShowAddForm(true);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
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
          <div className="rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-ink/50">
              Nothing on the schedule yet — add your first event to start building the weekend.
            </p>
          </div>
        ) : (
          <div className="scroll-visible flex items-start gap-4 overflow-x-auto pb-2">
            {days.map((day) => (
              <DayColumn
                key={day.date}
                date={day.date}
                events={day.events}
                isWeddingDay={weddingDate === day.date}
                onAdd={() => openAddForm(day.date)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
