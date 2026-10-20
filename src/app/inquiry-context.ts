"use server";

import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";

export type InquiryContext = {
  names: string[];
  date: string | null;
  season: string | null;
  guests: number | null;
  state: string | null;
};

/**
 * What the inquiry form fills in for the couple: their names, date (or
 * season) and rough headcount, so the venue or vendor gets the three things
 * they always ask first without the couple typing them again.
 *
 * Read when the form opens rather than passed down, because the form is
 * used from four places (both listing pages and both search panels).
 */
export async function inquiryContext(): Promise<InquiryContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, partner_a_name, partner_b_name, wedding_date, season, state, guest_count_override")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Pick<Wedding, "id" | "partner_a_name" | "partner_b_name" | "wedding_date" | "season" | "state" | "guest_count_override">>();
  if (!wedding) return null;

  let guests: number | null = wedding.guest_count_override;
  if (guests == null) {
    const { data: rows } = await supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id);
    // The whole list, not just yeses: early on nobody has answered yet.
    const listed = (rows ?? []).reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
    guests = listed > 0 ? listed : null;
  }

  return {
    names: [wedding.partner_a_name, wedding.partner_b_name].filter((n): n is string => Boolean(n?.trim())),
    date: wedding.wedding_date,
    season: wedding.season,
    guests,
    state: wedding.state,
  };
}
