import type { CSSProperties } from "react";
import type { EventAudience } from "@/lib/supabase/types";
import {
  audienceOf,
  formatLength,
  formatTime,
  fromMinutes,
  isCeremony,
  placeEvents,
  sortByTime,
  spanOf,
  type TimelineEvent,
} from "@/lib/itinerary";
import { AudienceTag, LockIcon } from "@/components/audience-tag";

/** Pixels per hour on the wide timeline: a 15-minute event still fits a line. */
const HOUR = 84;
/** Below this height a block shows one line: time and title. */
const ONE_LINE = 40;

// Guest events are the plain default; only the exceptions get a colour, and
// the ceremony is the day's one gold moment.
const BLOCK: Record<EventAudience, string> = {
  guests: "border-hairline bg-card border-l-forest",
  party: "border-[#2243B6]/20 bg-[#eef1fb] border-l-[#2243B6]",
  private: "border-hairline border-l-ink/40",
};
const HATCH: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(135deg, #f6f5f1 0 6px, #fbfaf7 6px 12px)",
};
const CEREMONY = "border-l-brass shadow-[0_0_0_1px_#f0d27a,0_4px_14px_rgb(224_161_0/0.18)]";

type Props<E extends TimelineEvent> = {
  events: E[];
  selectedId?: string | null;
  onSelect?: (event: E) => void;
  /** "What guests see": fade what they won't. */
  guestView?: boolean;
  /** Events with something worth a second look. */
  flagged?: Set<string>;
};

function blockClass(event: TimelineEvent, selected: boolean, faded: boolean) {
  const audience = audienceOf(event);
  return [
    "rounded-[10px] border border-l-4 text-left transition-[opacity,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2243B6]",
    BLOCK[audience],
    isCeremony(event) ? CEREMONY : "shadow-[0_1px_3px_rgb(20_32_61/0.06)] hover:shadow-[0_3px_10px_rgb(20_32_61/0.1)]",
    selected ? "outline-2 outline-offset-2 outline-[#2243B6]" : "",
    faded ? "opacity-35" : "",
  ].join(" ");
}

function Exceptions({ event }: { event: TimelineEvent }) {
  const audience = audienceOf(event);
  if (isCeremony(event)) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-[#FFD301] px-2 py-0.5 text-[11px] font-semibold text-forest">
        Ceremony
      </span>
    );
  }
  return audience === "guests" ? null : <AudienceTag audience={audience} />;
}

function FlagDot({ on }: { on: boolean }) {
  return on ? (
    <span
      title="Worth a second look"
      aria-label="Worth a second look"
      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#e0a100] ring-2 ring-[#e0a100]/25"
    />
  ) : null;
}

function timeRange(start: number, end: number, open: boolean) {
  const from = formatTime(fromMinutes(start % 1440));
  return open ? from : `${from} – ${formatTime(fromMinutes(end % 1440))}`;
}

/** Events with no start time: kept above the timeline rather than guessed into it. */
function AnyTime<E extends TimelineEvent>({ events, selectedId, onSelect, guestView, flagged }: Props<E>) {
  const untimed = events.filter((e) => !e.start_time);
  if (untimed.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="font-mono-numbers text-[11px] uppercase tracking-wide text-ink/50">Any time</span>
      {untimed.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onSelect?.(e)}
          style={audienceOf(e) === "private" ? HATCH : undefined}
          className={`${blockClass(e, selectedId === e.id, Boolean(guestView) && audienceOf(e) !== "guests")} flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink`}
        >
          {e.title}
          <FlagDot on={Boolean(flagged?.has(e.id))} />
        </button>
      ))}
    </div>
  );
}

/** Wide screens: an hour ruler with each event drawn to its length. */
export function DayTimeline<E extends TimelineEvent>(props: Props<E>) {
  const { events, selectedId, onSelect, guestView, flagged } = props;
  const placed = placeEvents(events);
  if (placed.length === 0) return <AnyTime {...props} />;

  const first = Math.floor(Math.min(...placed.map((p) => p.start)) / 60);
  const last = Math.max(Math.ceil(Math.max(...placed.map((p) => p.end)) / 60), first + 3);
  const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  return (
    <>
      <AnyTime {...props} />
      <div className="relative ml-[70px]" style={{ height: (last - first) * HOUR + 8 }}>
        {hours.map((h) => (
          <div
            key={h}
            className="absolute -left-[70px] right-0 border-t border-hairline"
            style={{ top: (h - first) * HOUR }}
          >
            <span className="absolute -top-2 left-0 bg-card pr-2 font-mono-numbers text-[11px] text-ink/50">
              {formatTime(fromMinutes((h % 24) * 60))?.replace(":00", "")}
            </span>
          </div>
        ))}
        {placed.map(({ event, start, end, lane, lanes, span: across }) => {
          const height = ((end - start) / 60) * HOUR - 3;
          const oneLine = height < ONE_LINE;
          const width = 100 / lanes;
          const open = spanOf(event)?.open ?? false;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect?.(event)}
              aria-label={`${event.title}, ${timeRange(start, end, open)}`}
              className={`${blockClass(event, selectedId === event.id, Boolean(guestView) && audienceOf(event) !== "guests")} absolute overflow-hidden ${
                oneLine ? "flex items-center gap-2 px-2.5" : "flex flex-col items-stretch justify-start px-2.5 py-1.5"
              }`}
              style={{
                top: ((start - first * 60) / 60) * HOUR + 1,
                height: Math.max(height, 20),
                left: `calc(${lane * width}% + ${lane ? 4 : 0}px)`,
                width: `calc(${across * width}% - ${lane > 0 || lane + across < lanes ? 4 : 0}px)`,
                ...(audienceOf(event) === "private" ? HATCH : {}),
              }}
            >
              {oneLine ? (
                <>
                  <span className="shrink-0 font-mono-numbers text-[11px] text-ink/60">
                    {formatTime(fromMinutes(start % 1440))}
                  </span>
                  <span className="truncate text-[13px] font-semibold text-ink">{event.title}</span>
                  <FlagDot on={Boolean(flagged?.has(event.id))} />
                  {isCeremony(event) && (
                    <span className="ml-auto">
                      <Exceptions event={event} />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-mono-numbers text-[11px] text-ink/60">{timeRange(start, end, open)}</span>
                    <span className="flex items-center gap-1.5">
                      <FlagDot on={Boolean(flagged?.has(event.id))} />
                      <Exceptions event={event} />
                    </span>
                  </span>
                  <span className="block truncate text-sm font-semibold leading-tight text-ink">{event.title}</span>
                  {event.location && height > 58 && (
                    <span className="block truncate text-xs text-ink/55">{event.location}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Phones: one column, times down a rail, each event's length under its time. */
export function DayList<E extends TimelineEvent>({ events, selectedId, onSelect, guestView, flagged }: Props<E>) {
  const sorted = [...events].sort((a, b) => sortByTime(a, b));
  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute bottom-0 left-[64px] top-0 border-l border-hairline" />
      {sorted.map((e) => {
        const span = spanOf(e);
        const audience = audienceOf(e);
        return (
          <li key={e.id} className="grid grid-cols-[58px_1fr] gap-2.5">
            <p className="pt-2.5 text-right font-mono-numbers text-[11px] leading-tight text-ink/60">
              {span ? formatTime(e.start_time) : "Any time"}
              {span && !span.open && (
                <span className="block text-[10px] text-ink/40">{formatLength(span.end - span.start)}</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => onSelect?.(e)}
              style={audience === "private" ? HATCH : undefined}
              className={`${blockClass(e, selectedId === e.id, Boolean(guestView) && audience !== "guests")} my-1 ml-1.5 px-3 py-2`}
            >
              {(audience !== "guests" || isCeremony(e) || flagged?.has(e.id)) && (
                <span className="mb-0.5 flex items-center gap-1.5">
                  <FlagDot on={Boolean(flagged?.has(e.id))} />
                  {isCeremony(e) ? (
                    <Exceptions event={e} />
                  ) : audience === "party" ? (
                    <span className="text-[11px] font-semibold text-[#2243B6]">Party &amp; family</span>
                  ) : audience === "private" ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-ink/60">
                      <LockIcon /> Just us &amp; vendors
                    </span>
                  ) : null}
                </span>
              )}
              <span className="block font-semibold text-ink">{e.title}</span>
              {e.location && <span className="block text-xs text-ink/55">{e.location}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function TimelineLegend() {
  const item = "inline-flex items-center gap-1.5";
  const swatch = "inline-block h-2.5 w-2.5 rounded-[3px]";
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
      <span className={item}><span className={`${swatch} border border-ink/25 bg-card`} />Guests</span>
      <span className={item}><span className={`${swatch} border border-[#2243B6] bg-[#eef1fb]`} />Wedding party &amp; family</span>
      <span className={item}><span className={`${swatch} bg-ink/10`} /><LockIcon />Just us &amp; vendors</span>
      <span className={item}><span className={`${swatch} bg-[#FFD301]`} />Ceremony</span>
    </p>
  );
}
