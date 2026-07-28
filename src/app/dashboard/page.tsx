import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-10 text-center shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Signed in
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Welcome
        </h1>
        <p className="mt-3 font-mono-numbers text-sm text-ink/80">{user.email}</p>
        <p className="mt-6 text-sm text-ink/60">
          This is a placeholder — the real Dashboard module comes in Step 3.
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
