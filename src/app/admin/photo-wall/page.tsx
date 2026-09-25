import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { GuestPost, Wedding } from "@/lib/supabase/types";
import { PhotoWallManager } from "./photo-wall-manager";

export default async function AdminPhotoWallPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: posts }, { data: weddings }] = await Promise.all([
    admin
      .from("guest_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300)
      .returns<GuestPost[]>(),
    admin
      .from("weddings")
      .select("id, partner_a_name, partner_b_name, public_slug")
      .returns<Pick<Wedding, "id" | "partner_a_name" | "partner_b_name" | "public_slug">[]>(),
  ]);

  const coupleByWeddingId = Object.fromEntries(
    (weddings ?? []).map((w) => [
      w.id,
      {
        name: [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || "Untitled wedding",
        slug: w.public_slug,
      },
    ]),
  );

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-2 font-display text-3xl font-semibold text-forest">Photo wall</h1>
      <p className="mb-6 text-xs text-ink/50">
        Everything guests have posted to any couple&apos;s wall, newest first. Couples approve
        their own posts; hide or delete here only when something shouldn&apos;t be up.
      </p>
      <PhotoWallManager posts={posts ?? []} coupleByWeddingId={coupleByWeddingId} />
    </div>
  );
}
