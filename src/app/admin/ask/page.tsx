import { requireAdmin } from "@/lib/admin";
import { getAdminQuestionAllowance } from "@/lib/ai/admin-assistant";
import { AskWren } from "./ask-wren";

export default async function AdminAskPage() {
  await requireAdmin();
  const allowance = await getAdminQuestionAllowance();

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Ask Wren</h1>
      <p className="mt-1 mb-6 text-sm text-ink/60">
        Questions about couples, vendors, venues and feedback. Read-only &mdash; Wren can look, never change
        anything. Test couples excluded.
      </p>
      <AskWren initialUsed={allowance.used} cap={allowance.cap} />
    </div>
  );
}
