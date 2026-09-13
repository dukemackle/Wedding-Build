import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding } from "@/lib/supabase/types";
import { AcceptInviteForm } from "./accept-form";

export default async function JoinWeddingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <InviteMessage title="Missing invite link">
        This link is incomplete. Ask your partner to resend it from their Dashboard.
      </InviteMessage>
    );
  }

  // Not a member of this wedding yet, so this has to bypass RLS -- same
  // reasoning as the accept action.
  const admin = createAdminSupabaseClient();
  const { data: wedding } = await admin
    .from("weddings")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <InviteMessage title="Invite link not valid">
        This invite link has expired, been revoked, or was already used. Ask your partner for a
        fresh one from their Dashboard.
      </InviteMessage>
    );
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/join-wedding?token=${token}`;
    return (
      <InviteMessage
        title={`Join ${coupleNames || "this wedding"} on Wren`}
        description="Log in or create an account to accept this invite."
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="flex-1 rounded-md bg-forest px-4 py-2 text-center font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Log in
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="flex-1 rounded-md border border-hairline px-4 py-2 text-center font-medium text-ink transition-colors hover:border-forest"
          >
            Sign up
          </Link>
        </div>
      </InviteMessage>
    );
  }

  if (wedding.user_id === user.id) {
    return (
      <InviteMessage title="This is your own wedding">
        You&apos;re already the owner of this wedding -- there&apos;s nothing to accept.
        <Link href="/dashboard" className="mt-4 block font-medium text-brass hover:underline">
          Go to Dashboard
        </Link>
      </InviteMessage>
    );
  }

  if (wedding.partner_user_id && wedding.partner_user_id !== user.id) {
    return (
      <InviteMessage title="Invite already used">
        This invite link has already been accepted. Ask the owner for a fresh one if you still
        need access.
      </InviteMessage>
    );
  }

  return (
    <InviteMessage
      title={`Join ${coupleNames || "this wedding"} on Wren`}
      description="Accepting gives you full access to the guest list, budget, seating, and everything else on this wedding."
    >
      <AcceptInviteForm token={token} />
    </InviteMessage>
  );
}

function InviteMessage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Wren invite
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest">{title}</h1>
        {description && <p className="mt-4 text-ink/70">{description}</p>}
        {children}
      </div>
    </main>
  );
}
