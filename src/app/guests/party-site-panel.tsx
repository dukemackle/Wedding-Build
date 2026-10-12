"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { AttirePartyMember } from "@/lib/supabase/types";
import { shrinkImage } from "@/lib/shrink-image";
import { setPartyPhoto, updatePartySiteDetails } from "./guest-site-actions";

/**
 * The Wedding party section's editor: the people already on the attire party
 * board, each with a photo, a line for guests, and whether they're shown.
 * Names and roles are edited on the board itself, so there's one list.
 */
export function PartySitePanel({ members }: { members: AttirePartyMember[] }) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-ink/70">
        Your wedding party comes from the party board on{" "}
        <Link href="/attire" className="text-forest underline">
          Attire
        </Link>
        . Add your bridesmaids, groomsmen and the rest there, then give each a photo and a line here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink/70">
        A photo and a line about each of them for your guests. Names and roles come from the party board on{" "}
        <Link href="/attire" className="text-forest underline">
          Attire
        </Link>
        .
      </p>
      <ul className="flex flex-col divide-y divide-hairline">
        {members.map((m) => (
          <PartyRow key={m.id} member={m} />
        ))}
      </ul>
    </div>
  );
}

function PartyRow({ member }: { member: AttirePartyMember }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [shown, setShown] = useState(member.on_site);

  function save(fields: Record<string, string>) {
    const fd = new FormData();
    fd.set("id", member.id);
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    startTransition(async () => {
      const result = await updatePartySiteDetails(fd);
      setError(result?.error);
    });
  }

  function photo(file: File | null) {
    const fd = new FormData();
    fd.set("id", member.id);
    startTransition(async () => {
      if (file) fd.set("photo", await shrinkImage(file, 1200));
      const result = await setPartyPhoto(fd);
      setError(result?.error);
    });
  }

  const inputId = `party-photo-${member.id}`;
  return (
    <li className={`flex gap-3 py-4 first:pt-0 ${isPending ? "opacity-70" : ""} ${shown ? "" : "opacity-60"}`}>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <label
          htmlFor={inputId}
          className="relative grid h-16 w-16 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-ink/30 bg-parchment text-[11px] text-ink/60 hover:border-forest"
        >
          {member.photo_url ? (
            <Image src={member.photo_url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            "+ Photo"
          )}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => photo(e.target.files?.[0] ?? null)}
        />
        {member.photo_url && (
          <button type="button" onClick={() => photo(null)} className="text-[11px] text-ink/50 hover:text-red-700">
            Remove
          </button>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="min-w-0 truncate font-medium text-ink">
            {member.name}
            {member.role && <span className="ml-2 text-xs uppercase tracking-wide text-ink/55">{member.role}</span>}
          </p>
          <label className="flex items-center gap-1.5 text-xs text-ink/70">
            <input
              type="checkbox"
              checked={shown}
              onChange={(e) => {
                setShown(e.target.checked);
                save({ on_site: String(e.target.checked) });
              }}
              className="h-4 w-4 accent-[#2243B6]"
            />
            Show
          </label>
        </div>
        <textarea
          defaultValue={member.site_blurb ?? ""}
          maxLength={280}
          rows={2}
          placeholder="Roommate since freshman year, and the reason we met."
          onBlur={(e) => e.target.value.trim() !== (member.site_blurb ?? "") && save({ site_blurb: e.target.value })}
          className="w-full resize-none rounded-md border border-hairline bg-card px-2.5 py-1.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-forest"
          aria-label={`A line about ${member.name}`}
        />
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </li>
  );
}
