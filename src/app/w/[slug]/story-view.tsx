"use client";

import { isLibraryPhoto } from "@/lib/photo-credit";
import Image from "next/image";
import { useSiteDesign } from "@/components/guest-site-theme";
import { storyChapters, type StoryChapter } from "@/lib/site-story";

const CARD = "site-card rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm";
const PHOTO = "relative w-full overflow-hidden bg-[var(--site-photo)]";

/**
 * A Story section in the couple's chosen layout (SECTION_LAYOUTS.story).
 * Photos come from their Photos section, in order, one per chapter, so a
 * couple who has uploaded photos gets a laid-out story without uploading
 * twice; with none, every layout still works as words alone.
 */
export function StoryView({ heading, body, photos }: { heading: string | null; body: string; photos: string[] }) {
  const { layouts } = useSiteDesign();
  const chapters = storyChapters(body);
  const title = heading && (
    <h2 className="text-center font-display text-3xl font-semibold text-forest sm:text-4xl">{heading}</h2>
  );

  if (layouts.story === "timeline") {
    return (
      <div className={CARD}>
        {title}
        <ol className={`relative flex flex-col gap-10 ${heading ? "mt-10" : ""}`}>
          <span
            className="absolute bottom-2 left-[6px] top-2 w-px bg-[var(--site-accent)] opacity-40 md:left-1/2"
            aria-hidden="true"
          />
          {chapters.map((c, i) => {
            const right = i % 2 === 1;
            const photo = photos[i];
            return (
              <li key={i} className="relative grid gap-4 pl-8 md:grid-cols-2 md:items-center md:gap-16 md:pl-0">
                <span
                  className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-[var(--site-accent)] bg-card md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                  aria-hidden="true"
                />
                <div className={right ? "md:col-start-2" : "md:text-right"}>
                  <Chapter chapter={c} />
                </div>
                {photo && (
                  <div
                    className={`${PHOTO} aspect-[3/2] rounded-[min(var(--site-radius,1rem),1rem)] md:mx-auto md:max-w-md ${right ? "md:col-start-1 md:row-start-1" : ""}`}
                  >
                    <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  if (layouts.story === "alternating") {
    return (
      <div className={CARD}>
        {title}
        <div className={`flex flex-col gap-12 md:gap-16 ${heading ? "mt-10" : ""}`}>
          {chapters.map((c, i) => {
            const photo = photos[i];
            if (!photo) {
              return (
                <div key={i} className="mx-auto max-w-[60ch] text-center">
                  <Chapter chapter={c} />
                </div>
              );
            }
            const flip = i % 2 === 1;
            return (
              <div key={i} className="grid items-center gap-6 md:grid-cols-2 md:gap-14">
                <div className={`${PHOTO} mx-auto aspect-[4/5] max-w-xs rounded-t-full md:max-w-sm ${flip ? "md:order-2" : ""}`}>
                  <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
                </div>
                <div className={`text-center ${flip ? "md:text-right" : "md:text-left"}`}>
                  <Chapter chapter={c} large />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Editorial: one readable column under a wide photo, the first letter dropped.
  return (
    <div className={CARD}>
      {heading && (
        <h2 className="text-center font-display text-4xl italic text-forest sm:text-6xl">{heading}</h2>
      )}
      {photos[0] && (
        <div className={`${PHOTO} mt-8 aspect-[4/3] rounded-[min(var(--site-radius,1rem),1rem)] sm:aspect-[16/7]`}>
          <Image src={photos[0]} unoptimized={isLibraryPhoto(photos[0])} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        </div>
      )}
      <div
        className={`mx-auto flex max-w-[62ch] flex-col gap-5 leading-relaxed text-ink/80 sm:text-lg ${
          heading || photos[0] ? "mt-8" : ""
        }`}
      >
        {chapters.map((c, i) => (
          <div key={i}>
            {c.title && (
              <p className="mb-1 font-display text-xl text-forest">{[c.when, c.title].filter(Boolean).join(" · ")}</p>
            )}
            <p
              className={`whitespace-pre-line ${
                i === 0
                  ? "first-letter:float-left first-letter:pr-2 first-letter:pt-1 first-letter:font-display first-letter:text-[3.6em] first-letter:leading-[0.8] first-letter:text-[var(--site-accent)]"
                  : ""
              }`}
            >
              {c.title ? c.text : [c.when, c.text].filter(Boolean).join(" ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chapter({ chapter, large }: { chapter: StoryChapter; large?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {chapter.when && <p className="font-display text-2xl italic text-[var(--site-accent)]">{chapter.when}</p>}
      {chapter.title && (
        <h3 className={`font-display font-semibold text-forest ${large ? "text-3xl" : "text-2xl"}`}>{chapter.title}</h3>
      )}
      <p className="whitespace-pre-line leading-relaxed text-ink/80">{chapter.text}</p>
    </div>
  );
}
