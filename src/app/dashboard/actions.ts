"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveWedding(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const guestCountOverrideRaw = formData.get("guest_count_override") as string;

  const { error } = await supabase.from("weddings").upsert(
    {
      user_id: user.id,
      partner_a_name: formData.get("partner_a_name") as string,
      partner_b_name: formData.get("partner_b_name") as string,
      wedding_date: (formData.get("wedding_date") as string) || null,
      region: formData.get("region") as string,
      season: formData.get("season") as string,
      style_tier: formData.get("style_tier") as string,
      venue_type: formData.get("venue_type") as string,
      guest_count_override: guestCountOverrideRaw
        ? Number(guestCountOverrideRaw)
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}
