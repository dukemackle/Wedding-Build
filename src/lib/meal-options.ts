// Meal choices, used by both the public RSVP form and the couple's manual
// guest form, so catering headcounts can actually be tallied by choice
// instead of parsing arbitrary free text.

/** What a couple who hasn't set their menu offers (weddings.meal_options null). */
export const MEAL_OPTIONS = ["Chicken", "Fish", "Vegetarian", "Vegan", "Gluten-free", "Kids Meal", "Other"] as const;

export const MAX_MEAL_OPTIONS = 12;

/** The couple's menu, or the preset list until they've set one. */
export function mealChoices(options: string[] | null | undefined): string[] {
  return options ?? [...MEAL_OPTIONS];
}

/** A choice of one isn't a choice: guests are only asked with two or more. */
export function asksMeal(options: string[] | null | undefined): boolean {
  return mealChoices(options).length >= 2;
}
