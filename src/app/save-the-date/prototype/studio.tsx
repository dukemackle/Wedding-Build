"use client";

import { CardSvg } from "@/components/save-the-date/card-svg";
import { Reveal } from "@/components/save-the-date/reveal";
import { FONTS_HREF, SaveTheDateStudio } from "@/components/save-the-date/studio";
import { TEMPLATES, newCard } from "@/lib/save-the-date/templates";
import type { CardContent } from "@/lib/save-the-date/types";

export function Studio({ view }: { view: string }) {
  if (view.startsWith("reveal")) {
    const id = view.split("-")[1] ?? "midnight";
    return (
      <div className="h-dvh">
        <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
        <Reveal doc={newCard(id)} guest="Sam & Riley" siteHref="#" />
      </div>
    );
  }
  if (view.startsWith("gallery")) return <Gallery view={view} />;
  // "autosave": the real card's saving, against a stubbed /api/save-the-date (tests only).
  if (view === "autosave") return <SaveTheDateStudio initial={newCard("heirloom", undefined, null, false)} persist photos={["/landing/hero-couple-1000.webp"]} />;
  return <SaveTheDateStudio initial={newCard(TEMPLATES.some((t) => t.id === view) ? view : "editorial")} view={view} />;
}

const STRESS: CardContent = {
  nameA: "Maximiliana-Josephine",
  nameB: "Bartholomew Alexander",
  date: null,
  dateText: "Summer 2028",
  place: "Château de la Napoule, Mandelieu-la-Napoule, France",
  note: "Formal invitation to follow",
  headline: "",
};

/**
 * QA sheet: every template, with the sample couple ("gallery"), the
 * stress case ("gallery-long": long names, a written date, a long place)
 * or no photo ("gallery-nophoto").
 */
function Gallery({ view }: { view: string }) {
  const long = view === "gallery-long";
  return (
    <div className="min-h-dvh bg-[#efebe4] p-6">
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {TEMPLATES.map((t) => {
          const base = newCard(t.id, long ? STRESS : undefined);
          const doc = view === "gallery-nophoto" ? { ...base, photo: null } : base;
          return (
            <figure key={t.id}>
              <CardSvg doc={doc} className="w-full shadow-lg" />
              <figcaption className="mt-2 text-xs text-ink/70">
                {t.name} · {t.family}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

