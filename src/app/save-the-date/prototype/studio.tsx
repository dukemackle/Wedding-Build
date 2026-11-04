"use client";

import { SendPanel, type SendGuest } from "@/app/guests/save-the-date/send/send-panel";
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
        <Reveal doc={{ ...newCard(id), back: { on: true, travel: "Rooms held at the Hotel Californian until May 1" } }} guest="Sam & Riley" siteHref="#" site="youdoido.com/w/alex-and-jordan" />
      </div>
    );
  }
  // "backs": every design's front beside its Details back (print QA).
  if (view === "backs")
    return (
      <div className="min-h-dvh bg-[#efebe4] p-6">
        <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
          {TEMPLATES.map((t) => {
            const doc = { ...newCard(t.id), back: { on: true, travel: "Rooms held at the Hotel Californian until May 1" } };
            return (
              <figure key={t.id} className="grid grid-cols-2 gap-2">
                <CardSvg doc={doc} className="w-full shadow-lg" />
                <CardSvg doc={doc} side="back" site="youdoido.com/w/alex-and-jordan-x1y2z3" className="w-full shadow-lg" />
                <figcaption className="col-span-2 text-xs text-ink/70">{t.name}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    );
  if (view.startsWith("gallery")) return <Gallery view={view} />;
  // "send": the Send page with sample guests (nothing can actually send here).
  if (view === "send")
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <SendPanel
          cardId="sample"
          doc={newCard("heirloom")}
          version="v1"
          imageVersion="v1"
          fontsHref={FONTS_HREF}
          slug="alex-and-jordan-x1y2z3"
          locked={false}
          guests={SAMPLE_GUESTS}
          canEdit
          replyTo="alex@example.com"
        />
      </div>
    );
  // "autosave": the real card's saving, against a stubbed /api/save-the-date (tests only).
  if (view === "autosave") return <SaveTheDateStudio initial={newCard("heirloom", undefined, null, false)} cardId="sample" version="v1" persist photos={["/landing/hero-couple-1000.webp"]} />;
  // "back": the studio showing a card's back (Heirloom), as a couple sees it after adding one.
  if (view === "back" || view === "both")
    return <SaveTheDateStudio initial={{ ...newCard("heirloom"), back: { on: true, travel: "Rooms held at the Hotel Californian until May 1" } }} view={view} site="youdoido.com/w/alex-and-jordan" />;
  return <SaveTheDateStudio initial={newCard(TEMPLATES.some((t) => t.id === view) ? view : "editorial")} view={view} site="youdoido.com/w/alex-and-jordan" />;
}

const SAMPLE_GUESTS: SendGuest[] = [
  { id: "1", name: "Sam Rivera", household: "Rivera", email: "sam@example.com", code: "K7M2QX", sentAt: "2026-11-01T15:00:00Z", openedAt: "2026-11-02T09:00:00Z", bounced: false },
  { id: "2", name: "Riley Rivera", household: "Rivera", email: "riley@example.com", code: "K7M2QY", sentAt: "2026-11-01T15:00:00Z", openedAt: null, bounced: false },
  { id: "3", name: "Priya Shah", household: null, email: "priya@example.com", code: "P4TRS9", sentAt: null, openedAt: null, bounced: false },
  { id: "4", name: "Marcus Lee", household: "The Lee Family", email: "marcus@example", code: "M3LEE2", sentAt: null, openedAt: null, bounced: true },
  { id: "5", name: "Grandma Rose", household: "The Lee Family", email: null, code: "G2ROSE", sentAt: null, openedAt: null, bounced: false },
  { id: "6", name: "Jordan's college roommate, Chris Okafor", household: null, email: "chris.okafor.longaddress@example.com", code: "C5OKAF", sentAt: null, openedAt: null, bounced: false },
];

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

