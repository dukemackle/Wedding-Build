import Image from "next/image";
import type { PublicGuestbookEntry } from "@/lib/supabase/types";

export function GuestbookView({ entries }: { entries: PublicGuestbookEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {entries.map((entry) =>
        entry.photo_url ? (
          <div
            key={entry.id}
            className="overflow-hidden rounded-lg border border-hairline bg-parchment shadow-sm"
          >
            <Image
              src={entry.photo_url}
              alt={entry.name}
              width={300}
              height={300}
              className="aspect-square w-full object-cover"
            />
            <div className="p-3">
              <p className="text-sm text-ink">{entry.name}</p>
              {entry.message && (
                <p className="mt-1 line-clamp-3 text-xs text-ink/70">{entry.message}</p>
              )}
            </div>
          </div>
        ) : (
          <div
            key={entry.id}
            className="col-span-2 flex gap-3 rounded-md border border-hairline bg-parchment p-4 sm:col-span-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-card font-display text-forest">
              {entry.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-ink">{entry.name}</p>
              {entry.message && <p className="mt-1 text-sm text-ink/70">{entry.message}</p>}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
