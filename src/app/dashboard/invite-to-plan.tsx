"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  cancelPlanningInvite,
  createPlanningInvite,
  removePlanner,
  setPlannerRole,
} from "./actions";
import type { Planner, PlannersData } from "./planners";
import type { WeddingRole } from "@/lib/supabase/types";

const SITE_URL = "https://youdoido.com";

function inviteLink(token: string) {
  return `${SITE_URL}/join-wedding?token=${token}`;
}

// Fills from the palette, navy text on all of them; the owner is navy itself.
const AVATAR_FILLS = ["bg-[#FFD301]", "bg-[#5AE4FF]", "bg-[#FFF12F]", "bg-[#00BFFE]"];

function Avatar({ planner, index, size }: { planner: Planner; index: number; size: "sm" | "md" }) {
  const fill =
    planner.role === "owner"
      ? "bg-forest text-parchment"
      : `${AVATAR_FILLS[(index - 1) % AVATAR_FILLS.length]} text-forest`;
  const dims = size === "sm" ? "h-[18px] w-[18px] text-[9px] ring-2 ring-white" : "h-9 w-9 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ${fill} ${dims}`}
    >
      {planner.email.charAt(0) || "?"}
    </span>
  );
}

const ROLE_LABEL: Record<WeddingRole, string> = { edit: "Can edit", view: "Can view" };

/**
 * "Invite to plan" -- the pill beside "Edit details" and the list it opens.
 *
 * Anyone the owner invites gets either edit access (a partner, a planner) or
 * view-only (a parent who wants to look without touching the budget). Each
 * link works once. Only the owner can invite, change roles or remove people;
 * everyone else sees the same pill as "Who's planning" and a read-only list.
 *
 * Desktop: a centred dialog. Phone: a sheet up from the bottom.
 */
export function InviteToPlan({
  data,
  currentUserId,
}: {
  data: PlannersData;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const isOwner = data.myRole === "owner";
  const others = data.planners.filter((p) => p.role !== "owner");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-forest transition-colors hover:bg-parchment"
      >
        {others.length > 0 && (
          <span className="flex -space-x-1.5">
            {others.slice(0, 3).map((p) => (
              <Avatar key={p.userId} planner={p} index={data.planners.indexOf(p)} size="sm" />
            ))}
          </span>
        )}
        {isOwner ? "Invite to plan" : "Who's planning"}
      </button>
      {open && (
        <PlannersDialog data={data} currentUserId={currentUserId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function PlannersDialog({
  data,
  currentUserId,
  onClose,
}: {
  data: PlannersData;
  currentUserId: string;
  onClose: () => void;
}) {
  const isOwner = data.myRole === "owner";
  const [newRole, setNewRole] = useState<WeddingRole>("edit");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(token));
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 1500);
    } catch {
      // clipboard access denied -- the link still shows in the list to copy by hand
    }
  }

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      setError(result.error);
    });
  }

  function handleNewInvite() {
    startTransition(async () => {
      const result = await createPlanningInvite(newRole);
      setError(result.error);
      if (result.invite) await copy(result.invite.token);
    });
  }

  const owner = data.planners.find((p) => p.role === "owner");

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center sm:px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isOwner ? "Invite to plan" : "Who's planning"}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card px-5 pb-8 pt-3 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-[#9a6b00]">
              {isOwner ? "Invite to plan" : "Planning together"}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-forest">Who&apos;s planning</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-ink/60">
          {isOwner
            ? "Send a link to anyone helping: your partner, a parent, your planner. Each link works once."
            : `Only ${owner?.email || "the wedding's owner"} can invite people or change access.`}
        </p>

        <ul className="mt-4">
          {data.planners.map((p, i) => (
            <li key={p.userId} className="flex items-center gap-3 border-t border-hairline py-3">
              <Avatar planner={p} index={i} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.email || "Unknown account"}</p>
                <p className="text-xs text-ink/55">
                  {p.role === "owner"
                    ? p.userId === currentUserId
                      ? "You · owner"
                      : "Owner"
                    : p.userId === currentUserId
                      ? `You · ${ROLE_LABEL[p.role].toLowerCase()}`
                      : ROLE_LABEL[p.role]}
                </p>
              </div>
              {isOwner && p.role !== "owner" && (
                <>
                  <select
                    value={p.role}
                    disabled={isPending}
                    onChange={(e) => run(() => setPlannerRole(p.userId, e.target.value))}
                    aria-label={`Access for ${p.email}`}
                    className="rounded-lg border border-hairline bg-white px-2 py-1 text-xs text-ink"
                  >
                    <option value="edit">Can edit</option>
                    <option value="view">Can view</option>
                  </select>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm(`Remove ${p.email}? They'll lose access straight away.`)) {
                        run(() => removePlanner(p.userId));
                      }
                    }}
                    className="text-xs text-ink/45 hover:text-ink hover:underline disabled:opacity-60"
                  >
                    Remove
                  </button>
                </>
              )}
            </li>
          ))}

          {isOwner &&
            data.invites.map((invite) => (
              <li key={invite.token} className="flex items-center gap-3 border-t border-hairline py-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink/25 text-sm text-ink/40"
                >
                  ?
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">Invite link</p>
                  <p className="text-xs text-[#9a6b00]">{ROLE_LABEL[invite.role]} · not used yet</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(invite.token)}
                  className="text-xs font-semibold text-[#2243B6] hover:underline"
                >
                  {copied === invite.token ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => cancelPlanningInvite(invite.token))}
                  className="text-xs text-ink/45 hover:text-ink hover:underline disabled:opacity-60"
                >
                  Cancel
                </button>
              </li>
            ))}
        </ul>

        {isOwner && (
          <div className="mt-4 rounded-xl border border-hairline bg-parchment p-4">
            <p className="text-xs font-semibold text-ink">New invite</p>
            <div className="mt-2 flex gap-2">
              <div role="radiogroup" aria-label="Access" className="flex flex-1 overflow-hidden rounded-lg border border-hairline bg-white text-sm">
                {(["edit", "view"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    role="radio"
                    aria-checked={newRole === role}
                    onClick={() => setNewRole(role)}
                    className={`flex-1 px-3 py-2 transition-colors ${
                      newRole === role ? "bg-forest text-parchment" : "text-ink hover:bg-parchment"
                    }`}
                  >
                    {ROLE_LABEL[role]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleNewInvite}
                disabled={isPending}
                className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
              >
                {isPending ? "..." : "Get link"}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-ink/50">
              The link is copied for you. &ldquo;Can view&rdquo; sees everything but can&apos;t change anything.
            </p>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      </div>
    </div>,
    document.body,
  );
}
