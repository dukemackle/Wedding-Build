import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { AssistantChat } from "@/components/wedding-assistant-widget";
import { FeedbackForm } from "./feedback-form";

export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <div className="w-full max-w-2xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Help &amp; feedback
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          How can we help?
        </h1>

        <div className="mt-6 flex h-[28rem] flex-col overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
          <AssistantChat />
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Wren&apos;s also just a click away from the bird icon in the bottom-right corner of any
          page.
        </p>

        <div className="mt-6 rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-forest">Send feedback</h2>
          <p className="mt-1 text-sm text-ink/70">
            Found a bug, or have an idea for something that would make planning easier? This goes
            straight to the team building Wren.
          </p>
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
