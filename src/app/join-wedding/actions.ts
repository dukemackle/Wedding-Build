"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding } from "@/lib/supabase/types";

export async function acceptWeddingInvite(formData: FormData): Promise<{ error?: string }> {
  const token = (formData.get("token") as string) || "";
  if (!token) {
    return { error: "Missing invite link." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join-wedding?token=${token}`)}`);
  }

  // The invitee isn't a member of this wedding yet, so the normal
  // RLS-scoped client can't see the row -- look it up with the
  // service-role client, same as the page does to preview the invite.
  const admin = createAdminSupabaseClient();
  const { data: wedding } = await admin
    .from("weddings")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return { error: "This invite link is invalid or has already been revoked." };
  }
  if (wedding.user_id === user.id) {
    return { error: "This is your own wedding -- nothing to accept." };
  }
  if (wedding.partner_user_id && wedding.partner_user_id !== user.id) {
    return { error: "This invite has already been used by someone else." };
  }

  const { error } = await admin
    .from("weddings")
    .update({ partner_user_id: user.id, invite_token: null })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
