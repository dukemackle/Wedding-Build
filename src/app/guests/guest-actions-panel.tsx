"use client";

import { useEffect, useState, type ReactNode } from "react";

export type PanelRow = {
  key: string;
  title: string;
  /** One line on what it's for, shown while the row is closed. */
  detail: string;
  /** The count that says whether it needs you: "3", "9 missing". */
  pill?: string;
  content: ReactNode;
  /** Nothing behind it (no stragglers, no songs yet): left off the list. */
  hidden?: boolean;
};

/** The phone's bottom-bar Add guest; the list listens for it. */
export const ADD_GUEST_EVENT = "guests:add-guest";

/**
 * Everything that acts on the list rather than being the list: reaching
 * guests (RSVPs, addresses, invites, reminders) and what guests sent back
 * (photos, messages, songs, the table QR code).
 *
 * Desktop: a sticky column beside the list, two tabs, each a short list of
 * rows that open one at a time, so the column reads as a menu rather than
 * four forms. Phone: the same panel as a bottom sheet behind the bottom
 * bar, so the list is the first thing on the page.
 */
export function GuestActionsPanel({
  invitations,
  fromGuests,
  newRsvpCount,
  canEdit,
}: {
  invitations: PanelRow[];
  fromGuests: PanelRow[];
  newRsvpCount: number;
  canEdit: boolean;
}) {
  const inv = invitations.filter((r) => !r.hidden);
  const from = fromGuests.filter((r) => !r.hidden);
  const [tab, setTab] = useState<"inv" | "from">("inv");
  const [openRow, setOpenRow] = useState<string | null>(newRsvpCount > 0 ? "new" : null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  // Links from elsewhere on the page ("#invitations", the stage header's "#nudge") land here.
  useEffect(() => {
    const open = () => {
      const row = { "#invitations": "addresses", "#nudge": "nudge" }[window.location.hash];
      if (!row) return;
      setTab("inv");
      setOpenRow(row);
      if (window.matchMedia("(max-width: 1023px)").matches) setSheetOpen(true);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const rows = tab === "inv" || from.length === 0 ? inv : from;
  const current = tab === "inv" || from.length === 0 ? "inv" : "from";

  const tabClass = (active: boolean) =>
    `flex-1 border-b-2 px-2 py-3 text-sm font-medium transition-colors ${
      active ? "border-forest text-forest" : "border-transparent text-ink/55 hover:text-forest"
    }`;

  return (
    <>
      {sheetOpen && (
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          onClick={() => setSheetOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}
      <aside
        id="invitations"
        aria-label="Invitations and messages from guests"
        className={`${
          sheetOpen ? "fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-[20px] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgb(20_32_61/0.25)]" : "hidden"
        } scroll-mt-4 border border-hairline bg-card lg:static lg:z-auto lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:rounded-lg lg:pb-0 lg:shadow-sm`}
      >
        {sheetOpen && <div className="mx-auto mb-1 mt-2 h-1 w-10 rounded-full bg-hairline lg:hidden" aria-hidden="true" />}
        <div className="flex border-b border-hairline" role="tablist">
          <button type="button" role="tab" aria-selected={current === "inv"} onClick={() => setTab("inv")} className={tabClass(current === "inv")}>
            Invitations
            {newRsvpCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#2243B6] px-1.5 font-mono-numbers text-[11px] text-white">{newRsvpCount}</span>
            )}
          </button>
          {from.length > 0 && (
            <button type="button" role="tab" aria-selected={current === "from"} onClick={() => setTab("from")} className={tabClass(current === "from")}>
              From your guests
            </button>
          )}
        </div>
        <ul>
          {rows.map((row) => {
            const open = openRow === row.key;
            return (
              <li key={row.key} className="border-b border-hairline last:border-b-0">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenRow(open ? null : row.key)}
                  className={`block w-full px-4 py-3 text-left transition-colors ${open ? "bg-[#eef3ff]" : "hover:bg-parchment"}`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-forest">{row.title}</span>
                    {row.pill && <span className="shrink-0 font-mono-numbers text-xs text-[#2243B6]">{row.pill}</span>}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink/60">{row.detail}</span>
                </button>
                {open && <div className="border-t border-hairline px-4 py-4">{row.content}</div>}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Phone: the list comes first; these two are always in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-hairline bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        {canEdit && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(ADD_GUEST_EVENT))}
            className="min-h-11 flex-1 rounded-full bg-forest px-4 text-sm font-semibold text-parchment"
          >
            + Add guest
          </button>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="min-h-11 flex-1 rounded-full border border-forest bg-card px-4 text-sm font-semibold text-forest"
        >
          Invites{from.length > 0 ? " & messages" : ""}
          {newRsvpCount > 0 && (
            <span className="ml-1.5 rounded-full bg-[#2243B6] px-1.5 font-mono-numbers text-[11px] text-white">{newRsvpCount}</span>
          )}
        </button>
      </div>
    </>
  );
}
