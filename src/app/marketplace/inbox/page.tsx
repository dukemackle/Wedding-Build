import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { loadInbox } from "@/lib/marketplace-server";
import { InboxHeader, InboxList } from "./inbox-list";

export const metadata: Metadata = { title: "Marketplace messages", robots: { index: false } };

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/inbox");
  const threads = await loadInbox(user.id);

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <InboxHeader />
      <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-card lg:grid lg:h-[70vh] lg:grid-cols-[22rem_1fr]">
        <div className="lg:overflow-y-auto lg:border-r lg:border-hairline">
          <InboxList threads={threads} userId={user.id} />
        </div>
        <div className="hidden items-center justify-center text-sm text-ink/50 lg:flex">
          {threads.length > 0 ? "Choose a conversation." : ""}
        </div>
      </div>
    </PageShell>
  );
}
