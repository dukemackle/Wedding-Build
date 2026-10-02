import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";

export const VIEW_ONLY_ERROR =
  "You have view-only access to this wedding. Ask the owner to switch you to Can edit.";
const NO_WEDDING_ERROR = "Set up your wedding on the Dashboard first.";

/**
 * The signed-in user's wedding, for a server action that changes it.
 *
 * RLS already stops a view-only member writing, but a blocked update or
 * delete just matches no rows and comes back without an error, so the action
 * would report success while nothing changed. A view-only member therefore
 * gets `wedding: null` here, and `noWedding` carries the message to show
 * instead of "set up your wedding".
 *
 * If the role can't be read, this treats the member as view-only: a planner
 * told to retry is better than one told a change saved when it didn't.
 */
export async function requireEditableWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  if (wedding && wedding.user_id !== user.id) {
    const { data: membership } = await supabase
      .from("wedding_members")
      .select("role")
      .eq("wedding_id", wedding.id)
      .eq("user_id", user.id)
      .maybeSingle<{ role: string }>();

    if (membership?.role !== "edit") {
      return { supabase, user, wedding: null, noWedding: VIEW_ONLY_ERROR };
    }
  }

  return { supabase, user, wedding, noWedding: NO_WEDDING_ERROR };
}
