"use client";

import { useState, useTransition } from "react";
import { setWeeklyDigest } from "./actions";

/** On/off for the Monday email. Saves on change and says so if it didn't. */
export function DigestToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setEnabled(next);
    setError(undefined);
    startTransition(async () => {
      const result = await setWeeklyDigest(next);
      if (result.error) {
        setEnabled(!next);
        setError(`That didn't save. ${result.error}`);
      }
    });
  }

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={enabled}
          disabled={isPending}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-hairline"
        />
        <span>
          <span className="font-medium">Monday planning email</span>
          <span className="mt-0.5 block text-ink/60">
            Payments due or overdue and checklist items coming up in the next two weeks. Only sent when something&apos;s
            due.
          </span>
        </span>
      </label>
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}
