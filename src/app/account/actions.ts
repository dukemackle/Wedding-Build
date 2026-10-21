"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding } from "@/lib/supabase/types";
import { normalizeEmail, recordOptOut } from "@/lib/unsubscribe";

// Every bucket that stores objects under a `<wedding_id>/` prefix. Deleting
// the wedding row cascades the database records but never touches storage, so
// anything missing from this list survives the account deletion as an
// orphaned file. Contracts especially: signed agreements carrying names,
// addresses, and signatures must not outlive a request to delete the account.
const WEDDING_BUCKETS = ["guest-photos", "wedding-photos", "contracts"] as const;

type Admin = ReturnType<typeof createAdminSupabaseClient>;

const PAGE = 100;

// Every file under a prefix, folders included: list() returns one level and
// at most a page at a time, so gallery/, venue/, party/ and blocks/ subfolders
// (and anything past the first 100) used to survive a deletion, still public.
async function listFiles(admin: Admin, bucket: string, prefix: string): Promise<string[]> {
  const paths: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await admin.storage.from(bucket).list(prefix, { limit: PAGE, offset });
    if (!data || data.length === 0) break;
    for (const entry of data) {
      const path = `${prefix}/${entry.name}`;
      // Folders come back with no id.
      if (entry.id === null) paths.push(...(await listFiles(admin, bucket, path)));
      else paths.push(path);
    }
    if (data.length < PAGE) break;
  }
  return paths;
}

async function removeFiles(admin: Admin, bucket: string, prefix: string) {
  const paths = await listFiles(admin, bucket, prefix);
  for (let i = 0; i < paths.length; i += 1000) {
    await admin.storage.from(bucket).remove(paths.slice(i, i + 1000));
  }
}

async function deleteWeddingFiles(admin: Admin, weddingId: string) {
  for (const bucket of WEDDING_BUCKETS) {
    await removeFiles(admin, bucket, weddingId);
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

  // Marketplace photos sit under the seller's own id, not a wedding's; the
  // listings themselves cascade with the auth user.
  await removeFiles(admin, "market-photos", user.id);

  // Wren chats and feedback outlive the wedding row (on delete set null, 0056)
  // for the aggregate counts; their words go with the account.
  await admin.from("assistant_conversations").delete().eq("user_id", user.id);
  await admin.from("feedback_submissions").delete().eq("user_id", user.id);

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    return { error: deleteUserError.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}

/**
 * The settings toggle docs/legal.md asks for. Ticking it is a fresh opt-in,
 * so it also lifts an earlier unsubscribe for this address; unticking it is
 * an unsubscribe like any other.
 */
export async function setMarketingOptIn(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const email = normalizeEmail(user.email);
  if (formData.get("marketing_opt_in") === "on") {
    const admin = createAdminSupabaseClient();
    const now = new Date().toISOString();
    await admin.from("outreach_opt_outs").delete().eq("email", email);
    await admin.from("marketing_consents").upsert(
      {
        email,
        user_id: user.id,
        opted_in: true,
        opted_in_at: now,
        opted_out_at: null,
        source: "account",
        updated_at: now,
      },
      { onConflict: "email" },
    );
  } else {
    await recordOptOut(email, "account");
  }
  redirect("/account?saved=email");
}
