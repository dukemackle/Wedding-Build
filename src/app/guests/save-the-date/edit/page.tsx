import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import { SaveTheDateStudio } from "@/components/save-the-date/studio";
import { loadCard } from "../load-card";
import { NoWedding } from "../no-wedding";

export const metadata: Metadata = { title: "Save the date" };

/**
 * Guests › Save the date › Edit: the Save the Date Studio on the couple's own
 * card. ?t=<template> (from the home's template grid) swaps the design on
 * open, keeping their words and photo. Every change autosaves (see
 * /api/save-the-date).
 */
export default async function EditSaveTheDatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [card, query] = await Promise.all([loadCard(), searchParams]);
  if (!card.wedding) {
    return (
      <PageShell email={card.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }
  const t = typeof query.t === "string" ? query.t : undefined;

  return (
    <main className="flex flex-1 flex-col pt-16">
      <AppNav email={card.user.email ?? ""} />
      <div className="border-t border-hairline">
        <SaveTheDateStudio
          initial={card.card}
          version={card.row?.updated_at ?? null}
          persist={card.canEdit}
          photos={card.photos}
          backHref="/guests/save-the-date"
          backLabel="Designs"
          sendHref="/guests/save-the-date/send"
          startTemplate={card.canEdit ? t : undefined}
          note="View only · ask the owner for edit access to change the card"
        />
      </div>
    </main>
  );
}
