"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { actionFailed } from "@/lib/action-error";
import { FONTS_HREF } from "@/lib/save-the-date/fonts";
import { INVITATIONS, MAX_INVITATIONS, newCard } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc } from "@/lib/save-the-date/types";
import { invitationIdFor, lookFromCard, suiteForCard } from "@/lib/suites";
import { createInvitation, createMatchingInvitation, deleteInvitation } from "./actions";
import type { Invitation } from "./load";

/**
 * Guests › Invitations: the couple's invitation designs, then every design
 * drawn with their own words. Picking one makes an invitation and opens it in
 * the studio. Designs match the save-the-dates of the same name.
 */
export function InvitationHome({
  invitations,
  canEdit,
  words,
  rsvpOpensOn,
  matchCard,
}: {
  invitations: Invitation[];
  canEdit: boolean;
  /** Their words, for drawing the designs before they've made one. */
  words: CardContent;
  /** When RSVPs open on the site (null = open now). */
  rsvpOpensOn: string | null;
  /** Their save the date, when its design is part of a suite (src/lib/suites.ts). */
  matchCard: { id: string; doc: CardDoc } | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const full = invitations.length >= MAX_INVITATIONS;
  const chosen = invitations.find((i) => i.chosen);
  const content = invitations[0]?.doc.content ?? words;

  const run = (action: () => Promise<{ error?: string } | undefined>) => {
    if (!canEdit) return;
    setError(null);
    start(async () => {
      const r = await action().catch((e: unknown) => {
        // A redirect into the studio surfaces here as a thrown navigation; let it through.
        if (e && typeof e === "object" && "digest" in e) throw e;
        return { error: actionFailed("reach the server") };
      });
      if (r?.error) setError(r.error);
    });
  };

  return (
    <div className={`flex flex-col ${pending ? "cursor-progress" : ""}`}>
      <link rel="stylesheet" href={FONTS_HREF} precedence="default" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Your invitations</h1>
          <p className="mt-1 max-w-2xl text-ink/60">
            The formal invitation, with an RSVP card on the back: a QR code straight to your RSVP form. Email it to each
            household, or download it to print. Each design matches the save-the-date of the same name.
          </p>
        </div>
        {invitations.length > 0 && canEdit && (
          <Link
            href={`/guests/invitations/send${chosen ? `?card=${chosen.id}` : ""}`}
            className="flex h-11 shrink-0 items-center self-start rounded-full bg-[#2243B6] px-5 text-sm font-medium text-white hover:bg-[#2243B6]/90 sm:self-auto"
          >
            Send
          </Link>
        )}
      </div>
      {rsvpOpensOn && (
        <p className="mt-3 max-w-2xl rounded-lg bg-[#FFF12F]/25 px-3 py-2.5 text-sm text-ink">
          RSVPs open on your website on{" "}
          {new Date(`${rsvpOpensOn}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Clear or
          change that date under <Link href="/dashboard" className="font-medium text-[#2243B6] underline">Dashboard › Wedding details</Link>{" "}
          when your invitations go out.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      {invitations.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
          {invitations.map((inv) => (
            <div key={inv.id} className="flex min-w-0 flex-col">
              <Link href={`/guests/invitations/edit/${inv.id}`} className="block overflow-hidden rounded-[10px] ring-1 ring-ink/10 transition hover:ring-ink/30">
                <CardSvg doc={inv.doc} className="block w-full" title={inv.name} />
              </Link>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <Link href={`/guests/invitations/edit/${inv.id}`} className="truncate font-medium text-ink hover:underline">
                  {inv.name}
                </Link>
                {canEdit && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm(`Delete “${inv.name}”?`) && run(() => deleteInvitation(inv.id))}
                    className="shrink-0 text-[13px] text-ink/50 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {matchCard && canEdit && (
        <MatchCard
          card={matchCard}
          content={content}
          invitations={invitations}
          disabled={pending || full}
          onMake={() => run(() => createMatchingInvitation(matchCard.id))}
        />
      )}

      <div className="mt-12 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-[28px]">
          {invitations.length ? "Start another" : "Pick a design"}
        </h2>
        <p className="text-sm text-ink/55">{INVITATIONS.length} designs, drawn with your details.</p>
      </div>
      {full && (
        <p className="mt-2 text-sm text-ink/60">That&apos;s {MAX_INVITATIONS} designs, the most you can keep. Delete one to start another.</p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
        {INVITATIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={pending || full || !canEdit}
            onClick={() => run(() => createInvitation(t.id))}
            className="group flex min-w-0 flex-col text-left disabled:cursor-not-allowed"
          >
            <span className="block overflow-hidden rounded-[10px] ring-1 ring-ink/10 transition group-hover:ring-ink/30 group-disabled:group-hover:ring-ink/10">
              <CardSvg doc={newCard(t.id, content, null, false)} className="block w-full" title={`${t.name} invitation`} />
            </span>
            <span className="mt-2.5 truncate font-medium text-ink">{t.name}</span>
            <span className="truncate text-[13px] text-ink/55">{t.family}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * "Match your save the date": the invitation in their card's suite, drawn in
 * the card's colourway and fonts, beside the card itself. Hidden once they
 * have that invitation in that look.
 */
function MatchCard({
  card,
  content,
  invitations,
  disabled,
  onMake,
}: {
  card: { id: string; doc: CardDoc };
  content: CardContent;
  invitations: Invitation[];
  disabled: boolean;
  onMake: () => void;
}) {
  const suite = suiteForCard(card.doc.template);
  const template = invitationIdFor(card.doc);
  if (!suite || !template) return null;
  const look = lookFromCard(card.doc);
  const have = invitations.some((i) => i.doc.template === template && i.doc.palette === look.palette && i.doc.fonts === look.fonts);
  if (have) return null;
  const words = { ...content, nameA: card.doc.content.nameA || content.nameA, nameB: card.doc.content.nameB || content.nameB };
  const preview: CardDoc = { ...newCard(template, words, null, false), ...look };
  return (
    <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-hairline bg-card p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="flex shrink-0 items-end gap-3">
        <div className="w-24 overflow-hidden rounded-md ring-1 ring-ink/10 sm:w-28">
          <CardSvg doc={card.doc} className="block w-full" title="Your save the date" />
        </div>
        <div className="w-32 overflow-hidden rounded-md shadow-md ring-1 ring-ink/10 sm:w-36">
          <CardSvg doc={preview} className="block w-full" title={`${suite.name} invitation`} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink/70">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brass" />
            The {suite.name} suite
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-forest">Match your save the date</h2>
          <p className="mt-1 max-w-xl text-sm text-ink/65">
            The {suite.name} invitation in your card&apos;s colours and lettering, with your details filled in. You can still
            change anything on it.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onMake}
          className="h-11 self-start rounded-full bg-[#14203d] px-5 text-sm font-medium text-white hover:bg-[#2243B6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Make the matching invitation
        </button>
      </div>
    </section>
  );
}
