import Image from "next/image";
import type { PublicGuestbookEntry } from "@/lib/supabase/types";

export function GuestbookView({ entries }: { entries: PublicGuestbookEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex gap-3 rounded-md border border-hairline bg-parchment p-4"
        >
          {entry.photo_url ? (
            <Image
              src={entry.photo_url}
              alt={entry.name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full border border-hairline object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-card font-display text-forest">
              {entry.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-ink">{entry.name}</p>
            {entry.message && <p className="mt-1 text-sm text-ink/70">{entry.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
