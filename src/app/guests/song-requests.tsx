import type { Guest } from "@/lib/supabase/types";

export function SongRequests({ guests }: { guests: Guest[] }) {
  const entries = guests.filter((g) => g.song_request);

  if (entries.length === 0) return null;

  return (
    <div>
      <p className="text-sm text-ink/70">
        Songs guests suggested when they RSVP&apos;d — hand this list to your DJ or band.
      </p>
      <div className="mt-4">
        {entries.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between gap-4 border-b border-hairline py-3 last:border-b-0"
          >
            <span className="text-ink">{guest.song_request}</span>
            <span className="shrink-0 text-xs text-ink/50">{guest.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
