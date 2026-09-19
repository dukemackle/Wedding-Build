import Link from "next/link";
import { ChecklistIcon } from "@/components/icons";
import type { ChecklistItem } from "@/lib/supabase/types";

function formatDueDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * The next few tasks, as the right-hand column of the snapshot card.
 *
 * Deliberately not its own box any more: "where things stand" and "what's
 * next" are one thought, and two stacked cards pushed the second below the
 * fold on a laptop -- where it's useless, because the point of it is being
 * seen without looking.
 */
export function ChecklistPreview({ items }: { items: ChecklistItem[] }) {
  const upcoming = items
    .filter((item) => !item.completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return a.created_at.localeCompare(b.created_at);
    })
    .slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChecklistIcon className="h-5 w-5 text-forest" />
          <span className="font-display text-2xl font-semibold text-forest">Next up</span>
        </div>
        <Link href="/checklist" className="text-sm font-medium text-brass hover:text-forest">
          View checklist &rarr;
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">
          {items.length === 0
            ? "No plan yet — Wren can build one for you on the Checklist page."
            : "All caught up! 🎉"}
        </p>
      ) : (
        <div className="mt-4">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-hairline py-3 last:border-b-0"
            >
              <span className="text-ink">{item.title}</span>
              {item.due_date && (
                <span className="font-mono-numbers text-xs text-ink/50">
                  {formatDueDate(item.due_date)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
