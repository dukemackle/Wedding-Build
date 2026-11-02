"use client";

import type { ItineraryEvent } from "@/lib/supabase/types";
import { formatFullDate, formatTime, groupEventsByDate } from "@/lib/itinerary";
import { downloadIcs } from "@/lib/ics";
import { useSiteDesign } from "@/components/guest-site-theme";
import { defaultWeekendLayout } from "@/lib/site-design";
import type { ReactNode } from "react";

export function ItineraryView({
  events,
  weddingDate,
}: {
  events: ItineraryEvent[];
  weddingDate: string | null;
}) {
  const days = groupEventsByDate(events);
  const { pageStyle, layouts } = useSiteDesign();
  // With no layout picked, the schedule follows the page style.
  const layout = layouts.weekend ?? defaultWeekendLayout(pageStyle);

  if (days.length === 0) {
    return <p className="text-sm text-ink/50">Nothing scheduled yet.</p>;
  }

  if (layout === "timeline") return <Timeline days={days} weddingDate={weddingDate} />;
  if (layout === "list") return <List days={days} />;
  if (layout === "centre") return <CentreLine days={days} weddingDate={weddingDate} />;
  if (layout === "tickets") return <Tickets days={days} />;
  if (layout === "days") return <DayColumns days={days} weddingDate={weddingDate} />;
  if (layout === "menu") return <Menu days={days} weddingDate={weddingDate} />;

  return (
    // Phones stack the days; from md up they sit side by side as columns.
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-2">
      {days.map((day) => (
        <div
          key={day.date}
          className="w-full rounded-lg md:min-w-[220px] md:flex-1 border border-hairline bg-card p-4 shadow-sm"
        >
          <div className="mb-3 border-b border-hairline pb-3">
            <p className="font-display text-lg font-semibold text-forest">
              {formatFullDate(day.date)}
            </p>
            {weddingDate === day.date && (
              <span className="font-mono-numbers text-[11px] uppercase tracking-wide text-brass">
                Wedding day
              </span>
            )}
          </div>

          {day.events.map((event) => {
            const timeRange = [
              formatTime(event.start_time),
              event.end_time && formatTime(event.end_time),
            ]
              .filter(Boolean)
              .join(" – ");

            return (
              <div key={event.id} className="border-b border-hairline py-3 last:border-b-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    {timeRange && (
                      <span className="font-mono-numbers text-xs text-brass">{timeRange}</span>
                    )}
                    <span className="text-ink">{event.title}</span>
                  </div>
                  <button
                    onClick={() => downloadIcs(event)}
                    className="shrink-0 text-xs text-brass hover:underline"
                  >
                    Add to calendar
                  </button>
                </div>
                {event.location && <p className="mt-1 text-xs text-ink/50">{event.location}</p>}
                {event.description && (
                  <p className="mt-1 text-sm text-ink/70">{event.description}</p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * The storybook schedule: each day under an arch, its events down a line with
 * a small drawing for each (rings, a glass, a plate...), picked from the
 * event's name. Days sit side by side from md up, one under another on a phone.
 */
function Timeline({ days, weddingDate }: { days: ReturnType<typeof groupEventsByDate>; weddingDate: string | null }) {
  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:[justify-content:safe_center] md:overflow-x-auto md:pb-2">
      {days.map((day) => (
        <div
          key={day.date}
          className="w-full max-w-md rounded-[999px_999px_var(--site-radius)_var(--site-radius)] bg-card px-5 pb-8 pt-16 shadow-sm md:min-w-[300px] md:flex-1 sm:px-8"
        >
          <div className="mb-6 text-center">
            {weddingDate === day.date && (
              <p className="font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-brass">Wedding day</p>
            )}
            <p className="mt-1 font-display text-2xl italic text-forest">{formatFullDate(day.date)}</p>
          </div>
          <ol className="relative flex flex-col gap-6">
            <span className="absolute bottom-5 left-[calc(4.75rem+0.75rem+1.25rem)] top-5 w-px bg-[var(--site-accent)] opacity-40" aria-hidden="true" />
            {day.events.map((event) => (
              <li key={event.id} className="relative grid grid-cols-[4.75rem_2.5rem_minmax(0,1fr)] items-start gap-x-3">
                <span className="whitespace-nowrap pt-2.5 text-right font-mono-numbers text-sm text-ink/70">
                  {event.start_time ? formatTime(event.start_time) : ""}
                </span>
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--site-accent)] bg-card text-[var(--site-accent)]">
                  <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {eventIcon(event.title)}
                  </svg>
                </span>
                <div className="min-w-0 pt-1.5">
                  <p className="font-display text-lg leading-snug text-forest">{event.title}</p>
                  {event.location && <p className="text-sm text-ink/60">{event.location}</p>}
                  {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
                  <button onClick={() => downloadIcs(event)} className="mt-1 text-xs text-brass hover:underline">
                    Add to calendar
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

/**
 * The plain list: one row per event, when · what · where. On a computer the
 * rows line up as columns; on a phone each row stacks.
 */
function List({ days }: { days: ReturnType<typeof groupEventsByDate> }) {
  const many = days.length > 1;
  return (
    <div role="table" aria-label="Schedule" className="mx-auto w-full max-w-4xl">
      <div role="row" className="hidden border-b border-hairline pb-3 font-mono-numbers text-xs uppercase tracking-[0.2em] text-ink/60 md:grid md:grid-cols-[11rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem] md:gap-6">
        <span role="columnheader">When</span>
        <span role="columnheader">What</span>
        <span role="columnheader">Where</span>
        <span role="columnheader"><span className="sr-only">Calendar</span></span>
      </div>
      {days.flatMap((day) =>
        day.events.map((event) => {
          const when = [many ? shortDay(day.date) : null, event.start_time ? formatTime(event.start_time) : null]
            .filter(Boolean)
            .join(", ");
          return (
            <div
              key={event.id}
              role="row"
              className="grid gap-1 border-b border-hairline py-4 last:border-b-0 md:grid-cols-[11rem_minmax(0,1.3fr)_minmax(0,1fr)_7rem] md:items-baseline md:gap-6"
            >
              <span role="cell" className="font-mono-numbers text-xs uppercase tracking-[0.15em] text-brass md:text-sm md:normal-case md:tracking-normal md:text-ink/80">
                {when}
              </span>
              <span role="cell" className="min-w-0">
                <span className="block font-display text-xl text-forest">{event.title}</span>
                {event.description && <span className="mt-1 block text-sm text-ink/70">{event.description}</span>}
              </span>
              <span role="cell" className="text-sm text-ink/70">{event.location}</span>
              <span role="cell">
                <button onClick={() => downloadIcs(event)} className="text-xs text-brass hover:underline md:text-sm">
                  Add to calendar
                </button>
              </span>
            </div>
          );
        }),
      )}
    </div>
  );
}

/**
 * The invitation page's schedule: each day's name sits on a line down the
 * middle, its events either side of it in turn, the way a printed order of
 * the day reads. A phone keeps the line at the left with everything beside it.
 */
function CentreLine({ days, weddingDate }: { days: ReturnType<typeof groupEventsByDate>; weddingDate: string | null }) {
  let n = 0;
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <span className="absolute bottom-0 left-[7px] top-0 w-px bg-hairline md:left-1/2" aria-hidden="true" />
      {days.map((day) => (
        <div key={day.date} className="relative pb-8 last:pb-0">
          <p className="relative flex items-center gap-3 py-2 md:justify-center">
            <span className="relative z-10 h-[15px] w-[15px] shrink-0 rounded-full border border-[var(--site-accent)] bg-parchment md:hidden" aria-hidden="true" />
            <span className="relative z-10 bg-parchment font-display text-xl italic text-[var(--site-accent)] md:px-6 md:text-2xl">
              {formatFullDate(day.date)}
            </span>
            {weddingDate === day.date && (
              <span className="relative z-10 bg-parchment font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-ink/60 md:hidden">
                Wedding day
              </span>
            )}
          </p>
          <ol className="mt-4 flex flex-col gap-7">
            {day.events.map((event) => {
              const left = n++ % 2 === 0;
              return (
                <li key={event.id} className="pl-8 md:grid md:grid-cols-2 md:gap-x-24 md:pl-0">
                  <div className={`min-w-0 ${left ? "md:text-right" : "md:col-start-2"}`}>
                    {event.start_time && (
                      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-ink/60">{formatTime(event.start_time)}</p>
                    )}
                    <p className="font-display text-2xl leading-snug text-forest md:text-3xl">{event.title}</p>
                    {event.location && <p className="text-sm text-ink/70">{event.location}</p>}
                    {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
                    <button onClick={() => downloadIcs(event)} className="mt-1 text-xs text-brass hover:underline">
                      Add to calendar
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

/**
 * The postcard page's schedule: a ticket for each event, the day and time on
 * a coloured stub torn along a dotted line. Two to a row on a computer, one
 * under another on a phone.
 */
function Tickets({ days }: { days: ReturnType<typeof groupEventsByDate> }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 md:gap-6">
      {days.flatMap((day) =>
        day.events.map((event) => {
          const time = formatTime(event.start_time);
          return (
            <li key={event.id} className="site-ticket flex min-w-0 overflow-hidden rounded-[min(var(--site-radius,1rem),1.25rem)] bg-card">
              <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-[var(--site-accent)] px-2 py-5 text-center text-[var(--site-on-accent)] sm:w-32">
                <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] opacity-90">{shortDay(day.date).split(",")[0]}</span>
                <span className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{time ? time.replace(/\s?[AP]M$/, "") : "\u2014"}</span>
                {time && (
                  <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] opacity-90">{time.endsWith("PM") ? "pm" : "am"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1 border-l-[3px] border-dashed border-parchment px-5 py-5 sm:px-7">
                <p className="font-display text-2xl leading-tight text-forest">{event.title}</p>
                {(event.location || event.description) && (
                  <p className="mt-1 text-sm text-ink/70">{[event.location, event.description].filter(Boolean).join(" \u00b7 ")}</p>
                )}
                <button onClick={() => downloadIcs(event)} className="mt-2 text-xs text-brass hover:underline">
                  Add to calendar
                </button>
              </div>
            </li>
          );
        }),
      )}
    </ol>
  );
}

/**
 * Day columns: each day's name set large over its date, its events under it,
 * the days side by side on a computer with a fine rule between them, one
 * under another on a phone.
 */
function DayColumns({ days, weddingDate }: { days: ReturnType<typeof groupEventsByDate>; weddingDate: string | null }) {
  return (
    <div className="site-days grid gap-10 md:grid-flow-col md:auto-cols-fr md:gap-0">
      {days.map((day) => {
        const when = new Date(`${day.date}T00:00:00`);
        return (
          <div key={day.date} className="site-day min-w-0 md:px-8 md:first:pl-0 md:last:pr-0">
            <p className="font-display text-5xl leading-none text-forest lg:text-6xl">
              {when.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <p className="mt-2 font-mono-numbers text-xs uppercase tracking-[0.22em] text-brass">
              {when.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              {weddingDate === day.date ? " \u00b7 Wedding day" : ""}
            </p>
            <ol className="mt-5 flex flex-col gap-4">
              {day.events.map((event) => (
                <li key={event.id}>
                  <p className="font-semibold text-ink">{event.title}</p>
                  <p className="text-sm text-ink/70">
                    {[event.start_time ? formatTime(event.start_time) : null, event.location].filter(Boolean).join(" \u00b7 ")}
                  </p>
                  {event.description && <p className="mt-1 text-sm text-ink/70">{event.description}</p>}
                  <button onClick={() => downloadIcs(event)} className="mt-1 text-xs text-brass hover:underline">
                    Add to calendar
                  </button>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The menu: each day's name small and centred, then its events with their
 * times, joined by a dotted line the way a dinner menu sets dishes and prices.
 */
function Menu({ days, weddingDate }: { days: ReturnType<typeof groupEventsByDate>; weddingDate: string | null }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {days.map((day) => (
        <div key={day.date} className="mt-8 first:mt-0">
          <p className="text-center font-mono-numbers text-xs uppercase tracking-[0.24em] text-brass">
            {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {weddingDate === day.date ? " \u00b7 Wedding day" : ""}
          </p>
          <ol className="mt-3 flex flex-col gap-2">
            {day.events.map((event) => (
              <li key={event.id}>
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 font-display text-xl text-forest sm:text-2xl">{event.title}</span>
                  <span className="mb-1.5 min-w-4 flex-1 border-b-2 border-dotted border-hairline" aria-hidden="true" />
                  <span className="shrink-0 font-mono-numbers text-sm text-ink sm:text-base">
                    {event.start_time ? formatTime(event.start_time) : ""}
                  </span>
                </div>
                {(event.location || event.description) && (
                  <p className="text-sm text-ink/60">{[event.location, event.description].filter(Boolean).join(" \u00b7 ")}</p>
                )}
                <button onClick={() => downloadIcs(event)} className="text-xs text-brass hover:underline">
                  Add to calendar
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function shortDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const ICONS: [RegExp, ReactNode][] = [
  [/ceremon|vows|nikah|chuppah|mandap|wedding|church|temple/i, <path key="a" d="M8 27V14a8 8 0 0 1 16 0v13M5 27h22M12.5 27v-8a3.5 3.5 0 0 1 7 0v8" />],
  [/cocktail|drink|toast|welcome|happy hour|bar|cider|beer|wine/i, <path key="g" d="M10 5h12l-1.5 9a4.5 4.5 0 0 1-9 0zM16 18.5V27M11.5 27h9M11 10h10" />],
  [/dinner|lunch|reception|supper|feast|banquet|walima|meal|bbq/i, <path key="p" d="M4 7v6a2 2 0 0 0 2 2v11M6 7v5M17 7a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM17 11a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />],
  [/danc|party|music|band|dj|sangeet|after/i, <path key="m" d="M12 23V8l12-3v15M9.5 20.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM21.5 17.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />],
  [/brunch|breakfast|coffee|tea|farewell/i, <path key="c" d="M6 12h16v6a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM22 14h3a3 3 0 0 1 0 6h-3M10 5v3M14 5v3M18 5v3" />],
  [/send.?off|sparkler|fireworks|exit/i, <path key="s" d="M16 4v7M16 21v7M4 16h7M21 16h7M8.5 8.5l3.5 3.5M20 20l3.5 3.5M23.5 8.5L20 12M12 20l-3.5 3.5" />],
  [/shuttle|bus|travel|depart|arriv|transport/i, <path key="b" d="M6 22V9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v13zM6 16h20M10 26v-4M22 26v-4M10 19h2M20 19h2" />],
  [/rehears|mehndi|henna|haldi|photo/i, <path key="h" d="M12 28V12a2 2 0 0 1 4 0v8M16 11a2 2 0 0 1 4 0v9M20 13a2 2 0 0 1 4 0v8c0 5-3 7-7 7h-1c-3 0-5-2-6-4l-3-6a2 2 0 0 1 3-2l2 3" />],
];

/** The drawing for an event, from its name; rings when nothing fits. */
function eventIcon(title: string) {
  return (
    ICONS.find(([re]) => re.test(title))?.[1] ?? (
      <path d="M12 12a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 12a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM18 9l2-3 2 3-2 2z" />
    )
  );
}
