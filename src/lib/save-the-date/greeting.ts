import type { Guest } from "@/lib/supabase/types";

/** The household greeting on a card email: "Sam & Riley", or "The Alvarez household". */
export function greetingFor(guest: Guest, everyone: Guest[]) {
  const key = guest.household?.trim().toLowerCase();
  const members = key ? everyone.filter((g) => g.household?.trim().toLowerCase() === key) : [guest];
  const names = members.map((g) => g.name.trim()).filter(Boolean);
  if (names.length && names.length <= 2) return names.join(" & ");
  const h = guest.household!.trim();
  return /\s/.test(h) ? h : `The ${h} household`;
}
