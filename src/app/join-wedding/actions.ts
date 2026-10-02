"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { inviteBlocker, resolveInvite } from "@/lib/wedding-invites";

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

  const invite = await resolveInvite(token);
  if (!invite) {
    return { error: "This invite link is invalid, was cancelled, or has already been used." };
  }

  const blocker = await inviteBlocker(invite.wedding, user.id);
  if (blocker === "own") {
    return { error: "This is your own wedding -- nothing to accept." };
  }
  if (blocker === "other") {
    return {
      error:
        "This account is already planning a different wedding. Log in with another email to accept.",
    };
  }

  const admin = createAdminSupabaseClient();
  if (blocker !== "already") {
    const { error } = await admin
      .from("wedding_members")
      .insert({ wedding_id: invite.wedding.id, user_id: user.id, role: invite.role });
    if (error) {
      return { error: error.message };
    }
  }

  // Each link works once.
  await admin.from("wedding_invites").delete().eq("token", invite.token);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
