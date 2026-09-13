import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { AssistantConversation, FeedbackSubmission, Wedding } from "@/lib/supabase/types";
import { AdminFeedbackManager } from "./admin-feedback-manager";

export default async function AdminFeedbackPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: feedback }, { data: conversations }, { data: weddings }] = await Promise.all([
    admin
      .from("feedback_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<FeedbackSubmission[]>(),
    admin
      .from("assistant_conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<AssistantConversation[]>(),
    admin
      .from("weddings")
      .select("id, partner_a_name, partner_b_name")
      .returns<Pick<Wedding, "id" | "partner_a_name" | "partner_b_name">[]>(),
  ]);

  const coupleNameByWeddingId = Object.fromEntries(
    (weddings ?? []).map((w) => [
      w.id,
      [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || "Untitled wedding",
    ]),
  );

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Feedback</h1>
      <AdminFeedbackManager
        feedback={feedback ?? []}
        coupleNameByWeddingId={coupleNameByWeddingId}
        conversations={conversations ?? []}
      />
    </div>
  );
}
