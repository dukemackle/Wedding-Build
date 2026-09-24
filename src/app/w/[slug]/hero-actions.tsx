"use client";

import type { PublicWedding } from "@/lib/supabase/types";
import { downloadIcs } from "@/lib/ics";

/**
 * The three things a guest opens the link to do, right under the names:
 * answer, save the date, and find the place.
 */
export function HeroActions({
  wedding,
  location,
  tone,
}: {
  wedding: PublicWedding;
  location: string;
  tone: "light" | "dark";
}) {
  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const primary =
    tone === "light"
      ? "bg-white text-forest hover:bg-white/90"
      : "bg-forest text-parchment hover:bg-forest/90";
  const secondary =
    tone === "light"
      ? "border border-white/60 text-white hover:bg-white/10"
      : "border border-forest/40 text-forest hover:bg-forest/5";
  const base = "btn-motion rounded-full px-4 py-2 text-sm sm:px-5 font-medium transition-colors";

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <a href="#rsvp" className={`${base} ${primary}`}>
        RSVP
      </a>
      {wedding.wedding_date && (
        <button
          type="button"
          onClick={() =>
            downloadIcs({
              id: `wedding-${wedding.id}`,
              wedding_id: wedding.id,
              user_id: "",
              event_date: wedding.wedding_date!,
              start_time: null,
              end_time: null,
              title: names ? `${names}'s wedding` : "Wedding",
              location: location || null,
              description: null,
              created_at: "",
              updated_at: "",
            })
          }
          className={`${base} ${secondary}`}
        >
          Add to calendar
        </button>
      )}
      {location && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} ${secondary}`}
        >
          Directions
        </a>
      )}
    </div>
  );
}
