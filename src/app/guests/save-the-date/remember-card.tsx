"use client";

import { useEffect } from "react";
import { rememberCard } from "./resume";

/** Marks this card as the one to reopen from Guests › Save the date. */
export function RememberCard({ id }: { id: string }) {
  useEffect(() => rememberCard(id), [id]);
  return null;
}
