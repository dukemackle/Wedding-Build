"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding } from "@/lib/supabase/types";

// Every bucket that stores objects under a `<wedding_id>/` prefix. Deleting
// the wedding row cascades the database records but never touches storage, so
// anything missing from this list survives the account deletion as an
// orphaned file. Contracts especially: signed agreements carrying names,
// addresses, and signatures must not outlive a request to delete the account.
const WEDDING_BUCKETS = ["guest-photos", "wedding-photos", "contracts"] as const;

async function deleteWeddingFiles(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  weddingId: string,
) {
  for (const bucket of WEDDING_BUCKETS) {
    const { data: files } = await admin.storage.from(bucket).list(weddingId);
    if (files && files.length > 0) {
      await admin.storage.from(bucket).remove(files.map((f) => `${weddingId}/${f.name}`));
    }
  }
}

// Deleting your account is permanent -- it removes your login and, if
// you're the wedding's owner, the wedding itself and everything on it
// (guest list, budget, photos, contracts, all of it). A partner deleting their own
// account instead just drops their access; the wedding stays with the
// owner untouched.
export async function deleteAccount(formData: FormData): Promise<{ error?: string }> {
  const confirmation = (formData.get("confirmation") as string) || "";
  if (confirmation !== "DELETE") {
    return { error: 'Type "DELETE" to confirm.' };
  }

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

  const admin = createAdminSupabaseClient();

  // Someone else's wedding they were invited onto just loses them: their
  // wedding_members row goes with the auth user (on delete cascade).
  if (wedding && wedding.user_id === user.id) {
    if (wedding.member_ids.length > 0) {
      return {
        error:
          "Remove everyone else first (Dashboard -> Invite to plan) -- deleting your account would delete the wedding for them too.",
      };
    }

    await deleteWeddingFiles(admin, wedding.id);

    const { error: deleteWeddingError } = await admin
      .from("weddings")
      .delete()
      .eq("id", wedding.id);
    if (deleteWeddingError) {
      return { error: deleteWeddingError.message };
    }
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    return { error: deleteUserError.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
