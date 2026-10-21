"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useSiteDesign } from "@/components/guest-site-theme";
import { SiteText } from "@/components/site-text";
import { isLibraryPhoto } from "@/lib/photo-credit";

const CARD = "site-card rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm";

/**
 * The RSVP section in the couple's chosen layout (SECTION_LAYOUTS.rsvp): the
 * form in a card, a full-width band in their colour with the form on a light
 * panel (the form's own text is dark, so it never sits on the colour), or a
 * photo beside the form. Without a photo, the split falls back to the card.
 */
export function RsvpSection({
  lead,
  deadline,
  photo,
  form,
}: {
  lead: ReactNode;
  deadline: string | null;
  photo: string | null;
  form: ReactNode;
}) {
  const { layouts } = useSiteDesign();

  if (layouts.rsvp === "band") {
    return (
      <div
        id="rsvp"
        className="scroll-mt-6 rounded-[min(var(--site-radius,1rem),1.5rem)] bg-[var(--site-accent)] px-5 py-10 text-[var(--site-on-accent)] sm:px-10 sm:py-14"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12">
          <div className="text-center lg:text-left">
            <SiteText slot="rsvp.title" className="font-display text-4xl italic sm:text-5xl">
              Will you join us?
            </SiteText>
            <p className="mt-3 opacity-90">{lead}</p>
            {deadline && (
              <p className="mt-4 inline-block rounded-full border border-current px-3 py-1 text-sm">
                Please RSVP by {deadline}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-card p-5 text-ink sm:p-8">{form}</div>
        </div>
      </div>
    );
  }

  const details = (
    <>
      <SiteText slot="rsvp.title" className="font-display text-2xl font-semibold text-forest">RSVP</SiteText>
      <p className="mt-1 text-sm text-ink/70">{lead}</p>
      {deadline && (
        <p className="mt-3 inline-block rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-sm text-brass">
          Please RSVP by {deadline}
        </p>
      )}
      {form}
    </>
  );

  if (layouts.rsvp === "split" && photo) {
    return (
      <div id="rsvp" className={`${CARD} grid scroll-mt-6 overflow-hidden !p-0 md:grid-cols-2`}>
        <div className="relative aspect-[4/3] bg-[var(--site-photo)] md:aspect-auto md:min-h-[28rem]">
          <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="p-6 sm:p-10">{details}</div>
      </div>
    );
  }

  return (
    <div id="rsvp" className={`${CARD} scroll-mt-6`}>
      {details}
    </div>
  );
}
