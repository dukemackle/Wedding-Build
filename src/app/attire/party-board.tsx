"use client";

import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import type { AttireItem, AttirePartyMember } from "@/lib/supabase/types";
import { ATTIRE_CATEGORIES } from "@/lib/wedding-options";
import { ATTIRE_CATEGORY_META, PARTY_ROLES, PARTY_STATUSES, swatch } from "@/lib/attire";
import { addPartyMember, removePartyMember, setPartySharing, updatePartyMember } from "./actions";
import { AttireImage } from "./attire-card";

const STATUS_STYLE: Record<string, string> = {
  "To order": "bg-brass/10 text-brass border-brass/30",
  Ordered: "bg-forest/5 text-forest border-forest/20",
  Arrived: "bg-forest/10 text-forest border-forest/30",
  Fitted: "bg-forest text-parchment border-forest",
};

const field =
  "w-full min-w-0 rounded-md border border-hairline bg-card px-2.5 py-1.5 text-sm text-ink outline-none focus:border-forest";

function save(id: string, key: string, value: string) {
  const fd = new FormData();
  fd.set("id", id);
  fd.set(key, value);
  return updatePartyMember(fd);
}

/** The look picker: saved items first, then everything a party could wear. */
function LookSelect({
  value,
  items,
  savedIds,
  onChange,
  className = field,
}: {
  value: string;
  items: AttireItem[];
  savedIds: Set<string>;
  onChange: (id: string) => void;
  className?: string;
}) {
  const wearable = items.filter((i) => (i.is_active || i.id === value) && !i.category.startsWith("Ring"));
  const saved = wearable.filter((i) => savedIds.has(i.id));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">No look yet</option>
      {saved.length > 0 && (
        <optgroup label="Saved">
          {saved.map((i) => (
            <option key={`s-${i.id}`} value={i.id}>
              {i.name}
            </option>
          ))}
        </optgroup>
      )}
      {ATTIRE_CATEGORIES.filter((c) => !c.startsWith("Ring")).map((cat) => {
        const inCat = wearable.filter((i) => i.category === cat && !savedIds.has(i.id));
        if (!inCat.length) return null;
        return (
          <optgroup key={cat} label={ATTIRE_CATEGORY_META[cat].label}>
            {inCat.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

function MemberRow({
  member,
  item,
  items,
  savedIds,
  onChanged,
  onRemoved,
  onOpenItem,
}: {
  member: AttirePartyMember;
  item: AttireItem | undefined;
  items: AttireItem[];
  savedIds: Set<string>;
  onChanged: (patch: Partial<AttirePartyMember>) => void;
  onRemoved: () => void;
  onOpenItem: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function set(key: keyof AttirePartyMember, value: string) {
    onChanged({ [key]: value || null } as Partial<AttirePartyMember>);
    startTransition(async () => {
      const result = await save(member.id, key, value);
      setError(result?.error);
    });
  }

  function remove() {
    if (!confirm(`Remove ${member.name} from the party board?`)) return;
    const fd = new FormData();
    fd.set("id", member.id);
    onRemoved();
    startTransition(async () => {
      await removePartyMember(fd);
    });
  }

  const colorId = `colors-${member.id}`;
  const photo = item ? (
    <button
      type="button"
      onClick={() => onOpenItem(item.id)}
      className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded lg:w-12"
      aria-label={`View ${item.name}`}
    >
      <AttireImage item={item} sizes="56px" />
    </button>
  ) : (
    <div className="grid aspect-[3/4] w-14 shrink-0 place-items-center rounded border border-dashed border-hairline text-lg text-ink/30 lg:w-12">
      ?
    </div>
  );

  return (
    <li
      className={`rounded-lg border border-hairline bg-card p-4 transition-opacity lg:grid lg:grid-cols-[minmax(160px,1.1fr)_minmax(220px,1.6fr)_minmax(110px,0.8fr)_80px_120px_32px] lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:px-2 lg:py-3 ${
        isPending ? "opacity-70" : ""
      }`}
    >
      {/* Who */}
      <div className="flex items-start justify-between gap-2 lg:block">
        <div className="min-w-0">
          <input
            defaultValue={member.name}
            onBlur={(e) => e.target.value.trim() && e.target.value !== member.name && set("name", e.target.value)}
            className="w-full truncate bg-transparent font-medium text-ink outline-none focus:underline"
            aria-label="Name"
          />
          <select
            value={member.role ?? ""}
            onChange={(e) => set("role", e.target.value)}
            className="mt-0.5 bg-transparent text-xs uppercase tracking-wide text-ink/55 outline-none"
            aria-label="Role"
          >
            <option value="">Role…</option>
            {PARTY_ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={remove} className="text-ink/40 hover:text-red-700 lg:hidden" aria-label="Remove">
          ✕
        </button>
      </div>

      {/* Look */}
      <div className="mt-3 flex items-center gap-3 lg:mt-0">
        {photo}
        <div className="min-w-0 flex-1">
          <LookSelect
            value={member.attire_item_id ?? ""}
            items={items}
            savedIds={savedIds}
            onChange={(id) => set("attire_item_id", id)}
          />
          {item?.designer && <p className="mt-1 truncate text-xs text-ink/50">{item.designer}</p>}
        </div>
      </div>

      {/* Colour, size, status */}
      <div className="mt-3 grid grid-cols-[1fr_80px] gap-2 lg:contents">
        <div className="flex items-center gap-2 lg:mt-0">
          <span
            className="h-5 w-5 shrink-0 rounded-full border border-ink/15"
            style={{ backgroundColor: member.color ? swatch(member.color) : "transparent" }}
          />
          <input
            list={colorId}
            defaultValue={member.color ?? ""}
            onBlur={(e) => e.target.value !== (member.color ?? "") && set("color", e.target.value)}
            placeholder="Colour"
            className={field}
          />
          <datalist id={colorId}>
            {(item?.colors ?? []).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <input
          defaultValue={member.size ?? ""}
          onBlur={(e) => e.target.value !== (member.size ?? "") && set("size", e.target.value)}
          placeholder="Size"
          title={item?.size_range ? `Sizes ${item.size_range}` : undefined}
          className={field}
          aria-label="Size"
        />
      </div>
      <div className="mt-2 lg:mt-0">
        <select
          value={member.status}
          onChange={(e) => set("status", e.target.value)}
          className={`w-full rounded-full border px-3 py-1.5 text-sm font-medium outline-none ${
            STATUS_STYLE[member.status] ?? STATUS_STYLE["To order"]
          }`}
          aria-label="Status"
        >
          {PARTY_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={remove}
        className="hidden text-ink/40 hover:text-red-700 lg:block"
        aria-label={`Remove ${member.name}`}
      >
        ✕
      </button>
      {error && <p className="mt-2 text-xs text-red-700 lg:col-span-6">{error}</p>}
    </li>
  );
}

function ShareCard({ shareToken }: { shareToken: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = shareToken ? `${origin}/party/${shareToken}` : null;

  function toggle(enable: boolean) {
    if (!enable && !confirm("Turn off the link? Anyone who has it will stop seeing the board.")) return;
    const fd = new FormData();
    fd.set("enable", String(enable));
    startTransition(async () => {
      await setPartySharing(fd);
    });
  }

  return (
    <div className="rounded-xl bg-forest p-5 text-parchment">
      <p className="font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-brass">Share with the party</p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">One link, everyone matches</h3>
      <p className="mt-2 text-sm text-parchment/80">
        Each person sees their look, colour and size, and a link to order it. They can&apos;t edit anything.
      </p>
      {url ? (
        <>
          <div className="mt-4 flex gap-2">
            <input readOnly value={url} className="min-w-0 flex-1 rounded-md bg-parchment/10 px-3 py-2 font-mono-numbers text-xs text-parchment outline-none" onFocus={(e) => e.target.select()} />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="rounded-md bg-parchment px-3 py-2 text-sm font-medium text-forest"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Preview
            </a>
            <button type="button" onClick={() => toggle(false)} disabled={isPending} className="text-parchment/70 underline underline-offset-2">
              Turn off link
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => toggle(true)}
          disabled={isPending}
          className="mt-4 rounded-full border border-parchment px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create party link"}
        </button>
      )}
    </div>
  );
}

function AddMemberForm({
  items,
  savedIds,
}: {
  items: AttireItem[];
  savedIds: Set<string>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [look, setLook] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        fd.set("attire_item_id", look);
        startTransition(async () => {
          const result = await addPartyMember(fd);
          setError(result?.error);
          if (!result?.error) {
            formRef.current?.reset();
            setLook("");
          }
        });
      }}
      className="rounded-xl border border-hairline bg-card p-5"
    >
      <h3 className="font-display text-xl font-semibold text-forest">Add someone</h3>
      <div className="mt-3 flex flex-col gap-2">
        <input name="name" placeholder="Name" required className={field} />
        <select name="role" defaultValue="" className={field}>
          <option value="">Role…</option>
          {PARTY_ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <LookSelect value={look} items={items} savedIds={savedIds} onChange={setLook} />
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 rounded-full bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-60"
        >
          {isPending ? "Adding…" : "Add to party"}
        </button>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </form>
  );
}

export function PartyBoard({
  party,
  items,
  savedIds,
  shareToken,
  onOpenItem,
}: {
  party: AttirePartyMember[];
  items: AttireItem[];
  savedIds: Set<string>;
  shareToken: string | null;
  onOpenItem: (id: string) => void;
}) {
  // Local copy so edits show instantly; the server revalidates behind it.
  const [members, setMembers] = useState(party);
  const [lastParty, setLastParty] = useState(party);
  if (party !== lastParty) {
    setLastParty(party);
    setMembers(party);
  }
  const itemById = new Map(items.map((i) => [i.id, i]));

  const done = members.filter((m) => m.status !== "To order").length;
  const withLook = members.filter((m) => m.attire_item_id).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest sm:text-3xl">Party board</h2>
            <p className="mt-1 text-sm text-ink/60">
              Who&apos;s wearing what, in which colour and size, and whether it&apos;s been ordered.
            </p>
          </div>
          {members.length > 0 && (
            <div className="flex gap-5 font-mono-numbers text-sm">
              <span>
                <b className="text-forest">{withLook}</b>
                <span className="text-ink/50">/{members.length} have a look</span>
              </span>
              <span>
                <b className="text-forest">{done}</b>
                <span className="text-ink/50">/{members.length} ordered</span>
              </span>
            </div>
          )}
        </div>

        {members.length > 0 && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-hairline">
            <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${(done / members.length) * 100}%` }} />
          </div>
        )}

        {members.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-hairline bg-card p-10 text-center">
            <p className="font-display text-2xl text-forest">Nobody here yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Add your bridesmaids, groomsmen and anyone else you&apos;re dressing. Then give each of them a look from
              the catalog and send them one link.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 hidden grid-cols-[minmax(160px,1.1fr)_minmax(220px,1.6fr)_minmax(110px,0.8fr)_80px_120px_32px] gap-4 border-b border-hairline px-2 pb-2 text-[11px] uppercase tracking-[0.14em] text-ink/50 lg:grid">
              <span>Who</span>
              <span>Look</span>
              <span>Colour</span>
              <span>Size</span>
              <span>Status</span>
              <span />
            </div>
            <ul className="mt-4 flex flex-col gap-3 lg:mt-0 lg:gap-0">
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  item={m.attire_item_id ? itemById.get(m.attire_item_id) : undefined}
                  items={items}
                  savedIds={savedIds}
                  onOpenItem={onOpenItem}
                  onChanged={(patch) =>
                    setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, ...patch, status: patch.status ?? x.status } : x)))
                  }
                  onRemoved={() => setMembers((all) => all.filter((x) => x.id !== m.id))}
                />
              ))}
            </ul>
          </>
        )}
      </section>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <AddMemberForm items={items} savedIds={savedIds} />
        <ShareCard shareToken={shareToken} />
      </aside>
    </div>
  );
}
