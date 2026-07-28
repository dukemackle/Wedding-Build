import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { WeddingDashboard } from "./wedding-dashboard";
import type { Wedding } from "@/lib/supabase/types";

export default async function DashboardPage() {
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
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="mb-6 flex w-full max-w-2xl items-center justify-between">
        <span className="font-mono-numbers text-sm text-ink/60">{user.email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="font-mono-numbers text-sm text-brass hover:underline"
          >
            Log out
          </button>
        </form>
      </div>

      <WeddingDashboard initialWedding={wedding} />
    </main>
  );
}
