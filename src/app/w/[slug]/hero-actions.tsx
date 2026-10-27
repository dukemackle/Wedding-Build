"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicWedding } from "@/lib/supabase/types";
import { downloadIcs } from "@/lib/ics";

type Ceremony = { start_time: string | null; end_time: string | null } | null;

const CeremonyContext = createContext<Ceremony>(null);

/** The schedule's ceremony on the wedding day, so "Add to calendar" carries its time. */
export function CeremonyProvider({ ceremony, children }: { ceremony: Ceremony; children: ReactNode }) {
  return <CeremonyContext.Provider value={ceremony}>{children}</CeremonyContext.Provider>;
}

const JUSTIFY = {
  center: "justify-center",
  start: "justify-start",
  responsive: "justify-center lg:justify-start",
  end: "justify-start lg:justify-end",
};

/**
 * The three things a guest opens the link to do, right under the names:
 * answer, save the date, and find the place.
 */
export function HeroActions({
  wedding,
  location,
  tone,
  align = "center",
}: {
  wedding: PublicWedding;
  location: string;
  tone: "light" | "dark";
  /** Centred under centred names; the side-set layouts line them up with their words. */
  align?: "center" | "start" | "responsive" | "end";
}) {
  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const ceremony = useContext(CeremonyContext);
  const primary =
    tone === "light"
      ? "bg-white text-[#14203d] hover:bg-white/90"
      : "bg-forest text-parchment hover:bg-forest/90";
  const secondary =
    tone === "light"
      ? "border border-white/60 text-white hover:bg-white/10"
      : "border border-forest/40 text-forest hover:bg-forest/5";
  const base = "btn-motion rounded-full px-4 py-2 text-sm sm:px-5 font-medium transition-colors";

  return (
    <div className={`mt-8 flex flex-wrap items-center gap-2 sm:gap-3 ${JUSTIFY[align]}`}>
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
              start_time: ceremony?.start_time ?? null,
              end_time: ceremony?.end_time ?? null,
              rsvp: false,
              invite_only: false,
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
