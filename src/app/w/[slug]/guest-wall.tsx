import Image from "next/image";
import type { PublicConfirmedGuest } from "@/lib/supabase/types";

export function GuestWall({ guests }: { guests: PublicConfirmedGuest[] }) {
  if (guests.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">
        {guests.length} {guests.length === 1 ? "person is" : "people are"} going
      </h2>
      <div className="mt-4 flex flex-wrap gap-4">
        {guests.map((guest) => (
          <div key={guest.id} className="flex w-16 flex-col items-center gap-1">
            {guest.photo_url ? (
              <Image
                src={guest.photo_url}
                alt={guest.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border border-hairline object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-hairline bg-parchment font-display text-lg text-forest">
                {guest.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="w-full truncate text-center text-xs text-ink/70">
              {guest.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
