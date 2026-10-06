"use client";

import { useEffect, useState } from "react";
import type { SheetLinkKind, SheetSyncSummary } from "@/lib/supabase/types";
import type { SheetLinkView, SiteChanges } from "@/lib/sheet-link-server";
import { buildSheetWrites, type SheetLayout, type SheetRow, type SyncConflict } from "@/lib/sheet-sync";
import {
  addTab,
  cachedToken,
  createSpreadsheet,
  fileModifiedTime,
  googleClientId,
  loadGoogleIdentity,
  readTab,
  requestToken,
  spreadsheetMeta,
  writeTab,
  type SheetTab,
} from "@/lib/google-sheets";
import { confirmSheetWrite, linkSheet, unlinkSheet } from "@/lib/sheet-link-actions";
import { DrivePickerButton, type PickedDoc } from "@/components/drive-picker";

export type SyncActionResult = {
  error?: string;
  decision?: { conflicts: SyncConflict[]; missing: { id: string; name: string }[] };
  summary?: SheetSyncSummary;
  write?: {
    token: string;
    matches: { line: number; id: string }[];
    appendIds: string[];
    deletedLines: number[];
    final: Record<string, Record<string, string>>;
  };
};

type Stage = "idle" | "reading" | "applying" | "writing";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  reading: "Reading your sheet…",
  applying: "Updating the site…",
  writing: "Writing to your sheet…",
};

function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** "Pulled 3 from your sheet (Aunt May, Bob…) · sent 4 to it". */
export function describeSummary(summary: SheetSyncSummary, twoWay: boolean) {
  const parts: string[] = [];
  const pulled = summary.added + summary.updated;
  if (pulled > 0) {
    const who = summary.names.length > 0 ? ` (${summary.names.join(", ")}${pulled > summary.names.length ? "…" : ""})` : "";
    parts.push(`pulled ${pulled} from your sheet${who}`);
  }
  if (twoWay && summary.sent > 0) parts.push(`sent ${summary.sent} to it`);
  if (summary.removedFromSheet > 0) parts.push(`removed ${summary.removedFromSheet} deleted here`);
  if (summary.deletedOnSite > 0) parts.push(`deleted ${summary.deletedOnSite} here`);
  if (summary.conflicts > 0) parts.push(`${plural(summary.conflicts, "clash", "clashes")} settled`);
  if (summary.skippedRows > 0) parts.push(`${plural(summary.skippedRows, "row")} in the sheet need fixing`);
  if (parts.length === 0) return "Already in step";
  const text = parts.join(" · ");
  return text[0].toUpperCase() + text.slice(1);
}

function SheetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2" width="11" height="12" rx="1.5" />
      <path d="M2.5 6h11M2.5 10h11M6.5 6v8" />
    </svg>
  );
}

/**
 * A Google Sheet kept in step with this page's list.
 *
 * Generic over the page: the page passes its own sync action and the reader
 * that turns a grid into rows and a layout, and this does the Google side --
 * the token, reading the tab, writing back what the server decided, and
 * telling the server the write landed.
 */
export function SheetSyncBar({
  kind,
  link,
  changes,
  canEdit,
  noun,
  newSheetTitle,
  tabTitle,
  createInWorkbook = false,
  readGrid,
  sync,
  fieldLabel,
  valueLabel,
}: {
  kind: SheetLinkKind;
  link: SheetLinkView | null;
  changes: SiteChanges | null;
  canEdit: boolean;
  noun: { one: string; many: string };
  newSheetTitle: string;
  tabTitle: string;
  /** Budget: a picked workbook gets a new tab rather than its own tab read. */
  createInWorkbook?: boolean;
  readGrid: (grid: string[][]) => { error?: string; rows: SheetRow[]; layout: SheetLayout };
  sync: (formData: FormData) => Promise<SyncActionResult>;
  fieldLabel: (field: string) => string;
  valueLabel: (field: string, value: string) => string;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | undefined>();
  const [summary, setSummary] = useState<SheetSyncSummary | null>(null);
  const [decision, setDecision] = useState<SyncActionResult["decision"] | null>(null);
  const [policy, setPolicy] = useState<"site" | "sheet">("site");
  const [deleteIds, setDeleteIds] = useState<Set<string>>(new Set());
  const [sheetEdited, setSheetEdited] = useState(false);
  const [tabChoice, setTabChoice] = useState<{ doc: PickedDoc; token: string; tabs: SheetTab[]; title: string; url: string } | null>(null);
  const [chosenTab, setChosenTab] = useState<string>("");
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const clientId = googleClientId();
  const twoWay = link?.mode === "drive";
  const busy = stage !== "idle";

  // Loaded ahead of the click: asking for a token opens a popup, and Safari
  // only allows that inside the click itself. See requestToken.
  useEffect(() => {
    if (clientId) loadGoogleIdentity().catch(() => {});
  }, [clientId]);

  // "Your sheet was edited since your last sync" -- only when Google already
  // trusts this tab. Asking for a token on page load would mean a popup
  // nobody asked for, so without one the banner just offers the sync.
  useEffect(() => {
    if (!twoWay || !link?.sheet_modified_at) return;
    const token = cachedToken();
    if (!token) return;
    let cancelled = false;
    fileModifiedTime(token, link.file_id)
      .then((modified) => {
        if (cancelled || !modified) return;
        // A few seconds' grace: our own write lands just before we read the time.
        setSheetEdited(Date.parse(modified) - Date.parse(link.sheet_modified_at!) > 5000);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [twoWay, link?.file_id, link?.sheet_modified_at]);

  type SyncOptions = { confirm?: boolean; deleteIds?: Set<string>; policy?: "site" | "sheet" };

  /**
   * One sync against `target` -- the page's link, or one just made whose
   * re-render hasn't arrived yet. Read the tab, let the server decide and
   * apply, write back what it says, then tell it the write landed.
   */
  async function runSync(target: SheetLinkView, token: string | null, options: SyncOptions = {}) {
    const isTwoWay = target.mode === "drive";
    setError(undefined);
    setSummary(null);
    try {
      const formData = new FormData();
      let grid: string[][] = [];
      let tab: SheetTab | undefined;
      if (isTwoWay) {
        if (!token) throw new Error("Couldn't reach Google — please try again.");
        setStage("reading");
        const meta = await spreadsheetMeta(token, target.file_id);
        tab = meta.tabs.find((t) => String(t.sheetId) === target.sheet_gid);
        if (!tab) {
          throw new Error("The linked tab is gone from your sheet. Unlink, then choose the sheet again.");
        }
        grid = await readTab(token, target.file_id, tab);
        formData.set("grid", JSON.stringify(grid));
      }
      formData.set("policy", options.policy ?? "site");
      formData.set("delete_ids", JSON.stringify([...(options.deleteIds ?? [])]));
      if (options.confirm) formData.set("confirm", "true");

      setStage("applying");
      const result = await sync(formData);
      if (result.error) throw new Error(result.error);
      if (result.decision) {
        setDecision(result.decision);
        return;
      }
      setDecision(null);

      if (result.write && tab && token) {
        setStage("writing");
        const read = readGrid(grid);
        const { cells, deleteRows } = buildSheetWrites({
          grid,
          layout: read.layout,
          sheetRows: read.rows,
          matches: result.write.matches,
          finalValues: new Map(Object.entries(result.write.final)),
          appendIds: result.write.appendIds,
          deletedLines: result.write.deletedLines,
        });
        await writeTab(token, target.file_id, tab, cells, deleteRows);
        const modified = await fileModifiedTime(token, target.file_id).catch(() => null);
        const confirm = new FormData();
        confirm.set("kind", kind);
        confirm.set("token", result.write.token);
        if (modified) confirm.set("modified_time", modified);
        const confirmed = await confirmSheetWrite(confirm);
        if (confirmed.error) throw new Error(confirmed.error);
      }
      setSheetEdited(false);
      setSummary(result.summary ?? null);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "Sync didn't finish — please try again. Nothing is lost; the next sync picks up where this one stopped.",
      );
    } finally {
      setStage("idle");
    }
  }

  function startSync(options: SyncOptions = {}) {
    if (!link) return;
    if (!twoWay) {
      void runSync(link, null, options);
      return;
    }
    // Nothing awaited before the token request -- see requestToken.
    requestToken()
      .then((token) => runSync(link, token, options))
      .catch((cause: Error) => setError(cause.message));
  }

  async function linkAndSync(fields: { file_id: string; gid: string; title: string; url: string }, token: string) {
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("mode", "drive");
    for (const [key, value] of Object.entries(fields)) formData.set(key, value);
    const result = await linkSheet(formData);
    if (result.error) throw new Error(result.error);
    setTabChoice(null);
    // The first sync, straight away and with the same token.
    const made: SheetLinkView = {
      ...(link ?? ({} as SheetLinkView)),
      kind,
      mode: "drive",
      file_id: fields.file_id,
      sheet_gid: fields.gid,
      title: fields.title,
      url: fields.url,
    };
    await runSync(made, token);
  }

  function createSheet() {
    setError(undefined);
    requestToken()
      .then(async (token) => {
        setStage("reading");
        const made = await createSpreadsheet(token, newSheetTitle, tabTitle);
        await linkAndSync({ file_id: made.fileId, gid: made.gid, title: made.title, url: made.url }, token);
      })
      .catch((cause: Error) => {
        setStage("idle");
        setError(cause.message);
      });
  }

  async function picked(doc: PickedDoc, token: string) {
    setError(undefined);
    try {
      setStage("reading");
      const meta = await spreadsheetMeta(token, doc.id);
      if (createInWorkbook) {
        // Their budget layout is theirs; ours goes in a tab of its own.
        const existing = meta.tabs.find((t) => t.title === tabTitle);
        const gid = existing ? String(existing.sheetId) : await addTab(token, doc.id, tabTitle);
        await linkAndSync({ file_id: doc.id, gid, title: meta.title, url: meta.url }, token);
        return;
      }
      if (meta.tabs.length === 1) {
        await linkAndSync({ file_id: doc.id, gid: String(meta.tabs[0].sheetId), title: meta.title, url: meta.url }, token);
        return;
      }
      const likely = meta.tabs.find((t) => new RegExp(noun.many, "i").test(t.title)) ?? meta.tabs[0];
      setChosenTab(String(likely.sheetId));
      setTabChoice({ doc, token, tabs: meta.tabs, title: meta.title, url: meta.url });
      setStage("idle");
    } catch (cause) {
      setStage("idle");
      setError(cause instanceof Error ? cause.message : "Couldn't open that sheet.");
    }
  }

  async function unlink() {
    const formData = new FormData();
    formData.set("kind", kind);
    const result = await unlinkSheet(formData);
    if (result.error) setError(result.error);
    setConfirmUnlink(false);
    setSummary(null);
  }

  const totalChanges = changes ? changes.added + changes.edited + changes.removed : 0;
  const pickerClass =
    "rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50";

  // ---- Not linked yet -------------------------------------------------------
  if (!link) {
    if (!clientId || !canEdit) return null;
    return (
      <section className="rounded-lg border border-hairline bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <SheetIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            <div>
              <p className="text-sm font-medium text-forest">Keep a Google Sheet in sync</p>
              <p className="text-xs text-ink/60">
                Edit your {noun.many} in either place — changes go both ways when you sync, and RSVPs show up in the sheet.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={createSheet}
              disabled={busy}
              className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
            >
              {busy ? STAGE_LABEL[stage] || "Working…" : "Create a linked sheet"}
            </button>
            <DrivePickerButton
              kind="google-sheet"
              label={createInWorkbook ? "Add to my sheet" : "Choose my sheet"}
              onDoc={(doc, token) => void picked(doc, token)}
              disabled={busy}
              className={pickerClass}
            />
          </div>
        </div>
        {tabChoice && (
          <TabPicker
            tabs={tabChoice.tabs}
            value={chosenTab}
            onChange={setChosenTab}
            onCancel={() => setTabChoice(null)}
            onLink={() => {
              const choice = tabChoice;
              setStage("reading");
              linkAndSync(
                { file_id: choice.doc.id, gid: chosenTab, title: choice.title, url: choice.url },
                choice.token,
              ).catch((cause: Error) => {
                setStage("idle");
                setError(cause.message);
              });
            }}
          />
        )}
        {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
        {summary && <p className="mt-2 text-xs text-forest">Linked. {describeSummary(summary, true)}.</p>}
      </section>
    );
  }

  // ---- Linked ---------------------------------------------------------------
  const showBanner = canEdit && !busy && !decision && (totalChanges > 0 || sheetEdited) && !summary;
  const bannerText = [
    totalChanges > 0 && twoWay
      ? `${plural(totalChanges, "change")} here since your last sync${changes && changes.rsvps > 0 ? ` (${plural(changes.rsvps, "RSVP")})` : ""}`
      : null,
    sheetEdited ? "your sheet was edited since your last sync" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <SheetIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">
              Linked to{" "}
              {link.url ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium text-forest underline-offset-2 hover:underline">
                  {link.title ?? "your Google Sheet"}
                </a>
              ) : (
                <span className="font-medium text-forest">{link.title ?? "your Google Sheet"}</span>
              )}
              {!twoWay && <span className="text-ink/50"> · read only</span>}
            </p>
            <p className="text-xs text-ink/60">
              {busy
                ? STAGE_LABEL[stage]
                : link.last_synced_at
                  ? `Last synced ${timeAgo(link.last_synced_at)}${link.last_synced_by_name ? ` by ${link.last_synced_by_name}` : ""}${link.last_summary ? ` · ${describeSummary(link.last_summary, twoWay)}` : ""}`
                  : "Not synced yet"}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => startSync()}
              disabled={busy}
              className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
            >
              {busy ? "Syncing…" : twoWay ? "Sync now" : "Pull changes"}
            </button>
            {!confirmUnlink ? (
              <button type="button" onClick={() => setConfirmUnlink(true)} disabled={busy} className="px-1 text-xs text-ink/50 hover:text-ink">
                Unlink
              </button>
            ) : (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-ink/60">Stop syncing? The sheet stays in your Drive.</span>
                <button type="button" onClick={() => void unlink()} className="font-medium text-red-800 hover:underline">
                  Unlink
                </button>
                <button type="button" onClick={() => setConfirmUnlink(false)} className="text-ink/60 hover:underline">
                  Keep
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {showBanner && bannerText && (
        <button
          type="button"
          onClick={() => startSync()}
          className="flex w-full items-center justify-between gap-3 border-t border-brass/30 bg-brass/10 px-4 py-2 text-left text-sm text-forest transition-colors hover:bg-brass/15"
        >
          <span>
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brass align-middle" aria-hidden="true" />
            {bannerText[0].toUpperCase() + bannerText.slice(1)}
          </span>
          <span className="shrink-0 text-xs font-medium text-brass">Sync now →</span>
        </button>
      )}

      {!twoWay && canEdit && clientId && !busy && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-2 text-xs text-ink/60">
          <span>Pulls from the shared link only. To send RSVPs and edits back to the sheet too:</span>
          <DrivePickerButton
            kind="google-sheet"
            label="Connect it with Google"
            onDoc={(doc, token) => void picked(doc, token)}
            className="text-xs font-medium text-brass hover:underline"
          />
        </div>
      )}

      {decision && (
        <DecisionPanel
          decision={decision}
          twoWay={twoWay}
          noun={noun}
          policy={policy}
          setPolicy={setPolicy}
          deleteIds={deleteIds}
          setDeleteIds={setDeleteIds}
          fieldLabel={fieldLabel}
          valueLabel={valueLabel}
          busy={busy}
          onCancel={() => setDecision(null)}
          onConfirm={() => startSync({ confirm: true, policy, deleteIds })}
        />
      )}

      {tabChoice && (
        <div className="border-t border-hairline px-4 py-3">
          <TabPicker
            tabs={tabChoice.tabs}
            value={chosenTab}
            onChange={setChosenTab}
            onCancel={() => setTabChoice(null)}
            onLink={() => {
              const choice = tabChoice;
              setStage("reading");
              linkAndSync(
                { file_id: choice.doc.id, gid: chosenTab, title: choice.title, url: choice.url },
                choice.token,
              ).catch((cause: Error) => {
                setStage("idle");
                setError(cause.message);
              });
            }}
          />
        </div>
      )}

      {(error || summary) && (
        <div className="border-t border-hairline px-4 py-2 text-xs">
          {error && <p className="text-red-800">{error}</p>}
          {summary && <p className="text-forest">Synced. {describeSummary(summary, twoWay)}.</p>}
        </div>
      )}
    </section>
  );
}

function TabPicker({
  tabs,
  value,
  onChange,
  onLink,
  onCancel,
}: {
  tabs: SheetTab[];
  value: string;
  onChange: (value: string) => void;
  onLink: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm text-ink">
        Which tab?
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-hairline bg-card px-3 py-1.5 text-ink outline-none focus:border-forest"
        >
          {tabs.map((tab) => (
            <option key={tab.sheetId} value={String(tab.sheetId)}>
              {tab.title}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onLink} className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment hover:bg-forest/90">
        Link this tab
      </button>
      <button type="button" onClick={onCancel} className="px-2 py-1.5 text-sm text-ink/60 hover:text-ink">
        Cancel
      </button>
    </div>
  );
}

function DecisionPanel({
  decision,
  twoWay,
  noun,
  policy,
  setPolicy,
  deleteIds,
  setDeleteIds,
  fieldLabel,
  valueLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  decision: NonNullable<SyncActionResult["decision"]>;
  twoWay: boolean;
  noun: { one: string; many: string };
  policy: "site" | "sheet";
  setPolicy: (policy: "site" | "sheet") => void;
  deleteIds: Set<string>;
  setDeleteIds: (ids: Set<string>) => void;
  fieldLabel: (field: string) => string;
  valueLabel: (field: string, value: string) => string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { conflicts, missing } = decision;
  const show = (field: string, value: string) => (value ? valueLabel(field, value) : "(blank)");

  return (
    <div className="border-t border-hairline px-4 py-3">
      <p className="text-sm font-medium text-forest">
        Before syncing, {conflicts.length > 0 && missing.length > 0 ? "two things need" : "this needs"} your call
      </p>

      {conflicts.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-ink/70">
            {plural(conflicts.length, "detail")} changed in both places since your last sync:
          </p>
          <ul className="mt-1.5 flex max-h-48 flex-col gap-1 overflow-y-auto">
            {conflicts.map((conflict) => (
              <li key={`${conflict.id}-${conflict.field}`} className="grid gap-x-3 rounded border border-hairline bg-parchment px-2 py-1.5 text-xs sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]">
                <span className="font-medium text-ink">
                  {conflict.name} <span className="font-normal text-ink/50">· {fieldLabel(conflict.field)}</span>
                </span>
                <span className={policy === "site" ? "text-forest" : "text-ink/45 line-through"}>Here: {show(conflict.field, conflict.site)}</span>
                <span className={policy === "sheet" ? "text-forest" : "text-ink/45 line-through"}>Sheet: {show(conflict.field, conflict.sheet)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="sheet-policy" checked={policy === "site"} onChange={() => setPolicy("site")} />
              Keep what&rsquo;s here
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="sheet-policy" checked={policy === "sheet"} onChange={() => setPolicy("sheet")} />
              Use the sheet&rsquo;s
            </label>
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-ink/70">
            {plural(missing.length, noun.one, noun.many)} {missing.length === 1 ? "was" : "were"} deleted from the sheet.{" "}
            {twoWay ? "Unticked ones are put back in it." : "Unticked ones stay on your list here."}
          </p>
          <ul className="mt-1.5 flex max-h-40 flex-col gap-1 overflow-y-auto">
            {missing.map((row) => (
              <li key={row.id}>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={deleteIds.has(row.id)}
                    onChange={(e) => {
                      const next = new Set(deleteIds);
                      if (e.target.checked) next.add(row.id);
                      else next.delete(row.id);
                      setDeleteIds(next);
                    }}
                  />
                  <span>
                    {row.name} <span className="text-xs text-ink/50">— delete here too</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-50"
        >
          {busy ? "Syncing…" : "Sync"}
        </button>
        <button type="button" onClick={onCancel} className="px-2 py-1.5 text-sm text-ink/60 hover:text-ink">
          Not now
        </button>
      </div>
    </div>
  );
}
