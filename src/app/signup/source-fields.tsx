"use client";

import { useEffect, useState } from "react";
import { COUPLE_HEARD_FROM, readFirstTouch } from "@/lib/attribution";

/** "How did you hear about us?" (optional, though not labelled so) plus the remembered first visit, for the signup form. */
export function SourceFields() {
  const [firstTouch, setFirstTouch] = useState("");
  useEffect(() => {
    const ft = readFirstTouch();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    if (ft) setFirstTouch(JSON.stringify(ft));
  }, []);
  return (
    <>
      <input type="hidden" name="first_touch" value={firstTouch} />
      <label className="flex flex-col gap-1 text-sm text-ink">
        How did you hear about us?
        <select
          name="heard_from"
          defaultValue=""
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        >
          <option value="">Choose one</option>
          {COUPLE_HEARD_FROM.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
