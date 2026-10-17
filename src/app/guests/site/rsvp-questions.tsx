"use client";

import { useState, useTransition } from "react";
import { MAX_MEAL_OPTIONS, asksMeal, mealChoices } from "@/lib/meal-options";
import { Switch } from "./editor-tabs";
import { saveRsvpQuestions } from "./rsvp-actions";

const FIELD =
  "min-w-0 flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const EXAMPLES = ["Braised short rib", "Roasted salmon", "Wild mushroom risotto", "Kids' chicken tenders"];

/** What the RSVP form asks beyond yes or no, in the RSVP section's row. */
export function RsvpQuestions({ mealOptions, askDietary }: { mealOptions: string[] | null; askDietary: boolean }) {
  const [askMeal, setAskMeal] = useState(asksMeal(mealOptions));
  // A menu turned off is saved empty; turning it back on starts two blank dishes.
  const [meals, setMeals] = useState(() => {
    const list = mealChoices(mealOptions);
    return list.length > 0 ? list : ["", ""];
  });
  const [dietary, setDietary] = useState(askDietary);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; saved?: boolean }>({});
  const filled = meals.filter((m) => m.trim()).length;

  function edit(next: string[]) {
    setMeals(next);
    setMessage({});
  }

  function save() {
    startTransition(async () => {
      const result = await saveRsvpQuestions({ askMeal, meals, askDietary: dietary }).catch(() => ({
        error: "Couldn't save that — check your connection.",
      }));
      setMessage(result.error ? { error: result.error } : { saved: true });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Ask guests to choose a meal</p>
          <p className="text-xs text-ink/60">Off for one set meal, a buffet or family style.</p>
        </div>
        <Switch
          on={askMeal}
          label="Ask guests to choose a meal"
          onToggle={() => {
            setAskMeal(!askMeal);
            setMessage({});
          }}
        />
      </div>

      {askMeal && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-ink">Your menu</p>
          {meals.map((meal, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={meal}
                onChange={(e) => edit(meals.map((m, j) => (j === i ? e.target.value : m)))}
                placeholder={`e.g. ${EXAMPLES[i % EXAMPLES.length]}`}
                aria-label={`Dish ${i + 1}`}
                maxLength={80}
                className={FIELD}
              />
              <button
                type="button"
                onClick={() => edit(meals.filter((_, j) => j !== i))}
                aria-label={`Remove ${meal || `dish ${i + 1}`}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/[0.05] hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
          {meals.length < MAX_MEAL_OPTIONS && (
            <button
              type="button"
              onClick={() => edit([...meals, ""])}
              className="self-start text-sm font-medium text-forest hover:underline"
            >
              + Add a dish
            </button>
          )}
          {filled < 2 && (
            <p className="text-xs text-[#8a5a00]">
              With fewer than two dishes there&apos;s nothing to choose, so guests won&apos;t be asked.
            </p>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Ask about allergies and dietary needs</p>
          <p className="text-xs text-ink/60">Your caterer needs these whatever the menu. Answers show on the guest list.</p>
        </div>
        <Switch
          on={dietary}
          label="Ask about allergies and dietary needs"
          onToggle={() => {
            setDietary(!dietary);
            setMessage({});
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {message.error && <p className="text-sm text-red-700">{message.error}</p>}
        {message.saved && <p className="text-sm text-ink/60">Saved — it&apos;s on your site now.</p>}
      </div>
    </div>
  );
}
