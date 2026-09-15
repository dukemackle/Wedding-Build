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
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  const admin = createAdminSupabaseClient();

  if (wedding) {
    if (wedding.user_id === user.id) {
      if (wedding.partner_user_id) {
        return {
          error:
            "Remove your partner's access first (Dashboard -> Wedding access) -- deleting your account would delete the wedding for them too.",
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
    } else {
      const { error: clearPartnerError } = await admin
        .from("weddings")
        .update({ partner_user_id: null })
        .eq("id", wedding.id);
      if (clearPartnerError) {
        return { error: clearPartnerError.message };
      }
    }
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    return { error: deleteUserError.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
