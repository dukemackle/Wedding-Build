"use client";

import { useRef, useState, useTransition } from "react";
import type { ItineraryEvent } from "@/lib/supabase/types";
import { dateKey, formatFullDate, formatTime, parseDateKey, sortByTime } from "@/lib/itinerary";
import { ItineraryCalendar } from "@/components/itinerary-calendar";
import { addItineraryEvent, updateItineraryEvent, deleteItineraryEvent } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function EventFields({ event }: { event?: ItineraryEvent }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Title
        <input name="title" required defaultValue={event?.title ?? ""} className={inputClass} />
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
      <label className={`${labelClass} sm:col-span-2`}>
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

function AddEventForm({ date, onDone }: { date: string; onDone: () => void }) {
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
      className="mb-4 rounded-lg border border-hairline bg-parchment p-4"
    >
      <input type="hidden" name="event_date" value={date} />
      <EventFields />
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
          <input type="hidden" name="event_date" value={event.event_date} />
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
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-4 last:border-b-0">
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          {timeRange && (
            <span className="font-mono-numbers text-sm text-brass">{timeRange}</span>
          )}
          <span className="text-ink">{event.title}</span>
        </div>
        {event.location && <p className="mt-1 text-xs text-ink/50">{event.location}</p>}
        {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
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

export function ItineraryManager({
  events,
  weddingDate,
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
}) {
  const initialDate = weddingDate ? parseDateKey(weddingDate) : new Date();
  const [selectedDate, setSelectedDate] = useState(weddingDate ?? dateKey(new Date()));
  const [showAddForm, setShowAddForm] = useState(false);

  const dayEvents = events.filter((e) => e.event_date === selectedDate).sort(sortByTime);

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <div className="rounded-lg border border-hairline bg-card p-5 shadow-sm">
        <ItineraryCalendar
          events={events}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowAddForm(false);
          }}
          initialDate={initialDate}
          weddingDate={weddingDate}
        />
      </div>

      <div className="rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-forest">
            {formatFullDate(selectedDate)}
          </h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            {showAddForm ? "Close" : "+ Add event"}
          </button>
        </div>

        {showAddForm && (
          <AddEventForm date={selectedDate} onDone={() => setShowAddForm(false)} />
        )}

        {dayEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            Nothing scheduled for this day yet.
          </p>
        ) : (
          dayEvents.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
