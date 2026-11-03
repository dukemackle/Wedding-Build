"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { enablePublicSite } from "@/app/guests/actions";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { personalCardPath } from "@/lib/invite-codes";
import { MAX_PER_SEND, cardEmailSubject } from "@/lib/save-the-date/email";
import { cardJpeg } from "@/lib/save-the-date/export";
import { formatDate } from "@/lib/save-the-date/format";
import type { CardDoc } from "@/lib/save-the-date/types";
import { putToSignedUrl } from "@/lib/signed-upload";
import { sendSaveTheDates, setSaveTheDateImage, startSaveTheDatePhotoUpload } from "../actions";

export type SendGuest = {
  id: string;
  name: string;
  household: string | null;
  email: string | null;
  code: string;
  sentAt: string | null;
  openedAt: string | null;
  bounced: boolean;
};

type Status = "opened" | "sent" | "bounced" | "noEmail" | "notSent";

function statusOf(g: SendGuest): Status {
  if (g.openedAt) return "opened";
  if (g.bounced) return "bounced";
  if (g.sentAt) return "sent";
  if (!g.email) return "noEmail";
  return "notSent";
}

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function StatusLabel({ g }: { g: SendGuest }) {
  const s = statusOf(g);
  const style: Record<Status, string> = {
    opened: "bg-[#2243B6]/[0.08] text-[#2243B6]",
    sent: "bg-ink/[0.06] text-ink/80",
    bounced: "bg-[#fef3f2] text-[#b42318]",
    noEmail: "text-ink/45",
    notSent: "text-ink/55",
  };
  const text: Record<Status, string> = {
    opened: `Opened ${g.openedAt ? day(g.openedAt) : ""}`,
    sent: `Emailed ${g.sentAt ? day(g.sentAt) : ""}`,
    bounced: "Email bounced",
    noEmail: "No email",
    notSent: "Not sent",
  };
  return (
    // Dates read in the guest's own time zone, so the server's copy may differ.
    <span suppressHydrationWarning className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${style[s]}`}>
      {text[s]}
    </span>
  );
}

/** Sendable by email: has an address that hasn't bounced. */
const emailable = (g: SendGuest) => !!g.email && !g.bounced;

export function SendPanel({
  doc,
  version,
  imageVersion,
  fontsHref,
  slug,
  locked,
  guests,
  canEdit,
  replyTo,
}: {
  doc: CardDoc;
  /** The card's updated_at. */
  version: string;
  /** The updated_at its stored picture shows, if any. */
  imageVersion: string | null;
  fontsHref: string;
  /** The guest site's address; links can't exist without it. */
  slug: string | null;
  /** The site has a password: the shared link would only reach its gate. */
  locked: boolean;
  guests: SendGuest[];
  canEdit: boolean;
  replyTo: string;
}) {
  const router = useRouter();
  const svg = useRef<SVGSVGElement | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(guests.filter((g) => emailable(g) && !g.sentAt).map((g) => g.id)),
  );
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { opened: 0, sent: 0, notSent: 0, noEmail: 0, bounced: 0 };
    for (const g of guests) c[statusOf(g)]++;
    return c;
  }, [guests]);
  const chosen = guests.filter((g) => selected.has(g.id));
  const again = chosen.filter((g) => g.sentAt).length;

  // The card's picture (for the email and link previews), redrawn once
  // whenever the card has changed since the last one. Made from the very
  // drawing on this page, after its fonts have loaded.
  const picture = useRef<Promise<void> | null>(null);
  const pictureFor = useRef(imageVersion);
  const ensurePicture = () => {
    if (pictureFor.current === version) return Promise.resolve();
    picture.current ??= (async () => {
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));
      if (!svg.current) throw new Error("The card isn't drawn yet.");
      const blob = await cardJpeg(svg.current);
      const started = await startSaveTheDatePhotoUpload("card.jpg");
      if (!started.path || !started.signedUrl) throw new Error(started.error ?? "Couldn't save the card's picture.");
      await putToSignedUrl(started.signedUrl, blob);
      const saved = await setSaveTheDateImage(started.path, version);
      if (saved.error) throw new Error(saved.error);
      pictureFor.current = version;
    })().finally(() => {
      picture.current = null;
    });
    return picture.current;
  };
  useEffect(() => {
    if (canEdit && slug) ensurePicture().catch(() => {});
    // Once per card version; ensurePicture reads the refs it needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, slug, version]);

  const link = (code?: string) =>
    slug ? `${window.location.origin}${code ? personalCardPath(slug, code) : `/w/${slug}/s`}` : "";

  const copy = async (key: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  const share = async (g: SendGuest) => {
    const url = link(g.code);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Save the date", text: `${g.name.split(" ")[0]}, save the date!`, url });
      } catch {
        /* closed the share sheet */
      }
    } else copy(g.id, url);
  };

  const send = async () => {
    setBusy("Getting your card ready…");
    setNotice(null);
    try {
      await ensurePicture();
      setBusy(`Sending ${chosen.length}…`);
      const result = await sendSaveTheDates(
        chosen.map((g) => g.id),
        window.location.origin,
      );
      if (result.error) {
        setNotice({ tone: "bad", text: result.error });
      } else {
        const skipped = result.skipped ? ` ${result.skipped} skipped (no working email).` : "";
        setNotice({ tone: "good", text: `Sent to ${result.sent} ${result.sent === 1 ? "guest" : "guests"}.${skipped}` });
        setSelected(new Set());
        router.refresh();
      }
    } catch (e) {
      setNotice({ tone: "bad", text: e instanceof Error ? e.message : "Couldn't send. Nothing went out." });
    } finally {
      setBusy(null);
      setConfirming(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const notSentYet = guests.filter((g) => emailable(g) && !g.sentAt);

  const turnOnSite = async () => {
    setBusy("Turning on your guest site…");
    const r = await enablePublicSite();
    setBusy(null);
    if (r.error) setNotice({ tone: "bad", text: r.error });
    else router.refresh();
  };

  const tooMany = chosen.length > MAX_PER_SEND;
  const sendLabel = chosen.length ? `Email ${chosen.length} ${chosen.length === 1 ? "guest" : "guests"}` : "Email guests";

  return (
    <div className="text-ink">
      <link rel="stylesheet" href={fontsHref} precedence="default" />
      <Link href="/guests/save-the-date" className="text-sm text-ink/60 hover:text-ink">
        ← Back to your card
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
        {/* The card and where things stand: beside the list on desktop, under it on a phone. */}
        <aside className="order-last lg:order-none lg:sticky lg:top-24 lg:self-start">
          <div className="mx-auto w-[56%] max-w-[260px] lg:w-full lg:max-w-none">
            <CardSvg
              doc={doc}
              svgRef={(el) => {
                svg.current = el;
              }}
              className="w-full rounded-[3px] shadow-[0_18px_40px_-16px_rgba(20,32,61,.45)]"
            />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              ["Opened", counts.opened],
              ["Emailed", counts.sent + counts.opened],
              ["Not sent", counts.notSent],
            ].map(([label, n]) => (
              <div key={label} className="rounded-lg bg-white px-2 py-3 ring-1 ring-hairline">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-ink/55">{label}</dt>
                <dd className="mt-1 font-display text-2xl">{n}</dd>
              </div>
            ))}
          </dl>
          {slug && !locked && (
            <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-hairline">
              <p className="text-sm font-medium">Group link</p>
              <p className="mt-1 text-xs text-ink/60">For a group chat or social post. Opens addressed to &ldquo;you&rdquo;, so it isn&apos;t counted per guest.</p>
              <button
                type="button"
                onClick={() => copy("group", link())}
                className="mt-3 w-full rounded-full border border-hairline px-4 py-2 text-sm hover:border-ink/30"
              >
                {copied === "group" ? "Copied" : "Copy group link"}
              </button>
            </div>
          )}
        </aside>

        <section className="min-w-0">
          <h1 className="font-display text-3xl lg:text-4xl">Send your save the date</h1>
          <p className="mt-2 max-w-2xl text-ink/70">
            Each guest gets their own link: an envelope with their name on it, which opens to your card. Email it from
            here, or copy a link to text it yourself.
          </p>

          {!slug && (
            <div className="mt-6 rounded-xl bg-[#FFF12F]/25 p-5 ring-1 ring-[#FFD301]/60">
              <p className="font-medium">Turn on your guest site first</p>
              <p className="mt-1 text-sm text-ink/75">
                Your save-the-date links live at your guest site&apos;s address, and the card&apos;s &ldquo;See our wedding
                website&rdquo; button goes there.
              </p>
              {canEdit && (
                <button type="button" onClick={turnOnSite} className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                  Turn on my guest site
                </button>
              )}
            </div>
          )}

          {notice && (
            <p
              role="status"
              className={`mt-6 rounded-lg px-4 py-3 text-sm ${notice.tone === "good" ? "bg-[#2243B6]/[0.07] text-[#2243B6]" : "bg-[#fef3f2] text-[#b42318]"}`}
            >
              {notice.text}
            </p>
          )}

          {guests.length === 0 ? (
            <div className="mt-8 rounded-xl bg-white p-8 text-center ring-1 ring-hairline">
              <p className="font-medium">No guests yet</p>
              <p className="mt-1 text-sm text-ink/65">Add your guest list, with emails, and they&apos;ll show up here.</p>
              <Link href="/guests" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                Go to your guest list
              </Link>
            </div>
          ) : (
            <>
              {/* Selection and the one action. On a phone it rides along the bottom. */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(notSentYet.map((g) => g.id)))}
                  className="rounded-full border border-hairline px-3 py-1.5 hover:border-ink/30"
                >
                  Select not sent ({notSentYet.length})
                </button>
                <button type="button" onClick={() => setSelected(new Set())} className="rounded-full border border-hairline px-3 py-1.5 hover:border-ink/30">
                  Clear
                </button>
                <span className="ml-1 text-ink/55">{chosen.length} selected</span>
                {canEdit && slug && (
                  <button
                    type="button"
                    disabled={!chosen.length || !!busy}
                    onClick={() => setConfirming(true)}
                    className="ml-auto hidden rounded-full bg-ink px-5 py-2.5 font-medium text-white disabled:opacity-40 lg:inline-flex"
                  >
                    {sendLabel}
                  </button>
                )}
              </div>

              <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-xl bg-white ring-1 ring-hairline">
                {guests.map((g) => {
                  const can = emailable(g);
                  return (
                    <li key={g.id} className="flex items-center gap-3 px-4 py-3 lg:gap-4">
                      <input
                        type="checkbox"
                        aria-label={`Email ${g.name}`}
                        checked={selected.has(g.id)}
                        disabled={!can}
                        onChange={() => toggle(g.id)}
                        className="h-5 w-5 shrink-0 accent-[#2243B6] disabled:opacity-30"
                      />
                      <div className="min-w-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_8.5rem] lg:items-center lg:gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{g.name}</p>
                          {g.household && <p className="truncate text-xs text-ink/50">{g.household}</p>}
                        </div>
                        <p className="truncate text-sm text-ink/60 max-lg:mt-0.5">{g.email ?? "—"}</p>
                        <div className="max-lg:mt-1.5">
                          <StatusLabel g={g} />
                        </div>
                      </div>
                      {slug && (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => copy(g.id, link(g.code))}
                            className="rounded-full px-3 py-2 text-xs font-medium text-ink/70 hover:bg-ink/5"
                          >
                            {copied === g.id ? "Copied" : "Copy link"}
                          </button>
                          <button
                            type="button"
                            onClick={() => share(g)}
                            className="hidden rounded-full px-3 py-2 text-xs font-medium text-ink/70 hover:bg-ink/5 max-lg:inline-flex"
                          >
                            Share
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-ink/50">
                &ldquo;Opened&rdquo; means they opened their envelope. We don&apos;t track reading emails.
              </p>
            </>
          )}
        </section>
      </div>

      {/* Phone: the send button stays in reach. */}
      {canEdit && slug && guests.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <button
            type="button"
            disabled={!chosen.length || !!busy}
            onClick={() => setConfirming(true)}
            className="w-full rounded-full bg-ink py-3 font-medium text-white disabled:opacity-40"
          >
            {busy ?? sendLabel}
          </button>
        </div>
      )}
      <div className="h-20 lg:hidden" aria-hidden />

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f1424]/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="send-title">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <h2 id="send-title" className="font-display text-2xl">
              Email your save the date to {chosen.length} {chosen.length === 1 ? "guest" : "guests"}?
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-ink/55">Subject</dt>
                <dd>
                  {cardEmailSubject({
                    names: [doc.content.nameA, doc.content.nameB].filter(Boolean).join(" & ") || "Our wedding",
                    when: doc.content.dateText.trim() || (doc.content.date ? formatDate(doc.content.date, "long") : ""),
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-ink/55">Replies go to</dt>
                <dd>{replyTo}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-1 text-sm text-ink/70">
              <li>Each email has your card and their own link.</li>
              {again > 0 && (
                <li className="text-[#9a6b00]">
                  {again} of them already got it, and will get it again.
                </li>
              )}
              <li>Emails can&apos;t be unsent.</li>
            </ul>
            {tooMany && <p className="mt-3 text-sm text-[#b42318]">You can send up to {MAX_PER_SEND} at a time. Pick fewer and send the rest after.</p>}
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={!!busy}
                className="flex-1 rounded-full border border-hairline py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!!busy || tooMany}
                className="flex-1 rounded-full bg-ink py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ?? `Send ${chosen.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
