"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { Guest } from "@/lib/supabase/types";
import { setGuestbookVisibility } from "./actions";

function GuestbookEntry({ guest, publicSiteOn }: { guest: Guest; publicSiteOn: boolean }) {
  const [hidden, setHidden] = useState(guest.guestbook_hidden);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  function handleToggle() {
    const nextHidden = !hidden;
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set("hidden", String(nextHidden));
    startTransition(async () => {
      const result = await setGuestbookVisibility(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setHidden(nextHidden);
      }
    });
  }

  return (
    <div className="flex gap-4 border-b border-hairline py-4 last:border-b-0">
      {guest.photo_url ? (
        <Image
          src={guest.photo_url}
          alt={guest.name}
          width={80}
          height={80}
          className="h-[72px] w-[72px] shrink-0 rounded-lg border border-hairline object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-hairline bg-parchment font-display text-2xl text-forest">
          {guest.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink">{guest.name}</span>
          {hidden && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/50">
              Hidden from site
            </span>
          )}
        </div>
        {guest.message && <p className="mt-1 text-sm text-ink/80">{guest.message}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      {publicSiteOn && (
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="shrink-0 self-start text-xs text-brass hover:underline disabled:opacity-60"
        >
          {hidden ? "Show on site" : "Hide from site"}
        </button>
      )}
    </div>
  );
}

export function GuestbookFeed({
  guests,
  publicSiteOn,
}: {
  guests: Guest[];
  publicSiteOn: boolean;
}) {
  const entries = guests.filter((g) => g.photo_url || g.message);

  if (entries.length === 0) return null;

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">Guestbook</h2>
      <p className="mt-1 text-sm text-ink/70">
        {publicSiteOn
          ? "Photos and messages guests left with their RSVP — visible on your guest site unless hidden."
          : "Photos and messages guests left with their RSVP. Turn on your guest site above to share these."}
      </p>
      <div className="mt-4">
        {entries.map((guest) => (
          <GuestbookEntry key={guest.id} guest={guest} publicSiteOn={publicSiteOn} />
        ))}
      </div>
    </div>
  );
}
