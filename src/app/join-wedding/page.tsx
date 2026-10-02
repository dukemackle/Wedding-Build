import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { inviteBlocker, resolveInvite, ROLE_PROMISE } from "@/lib/wedding-invites";
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
        This link is incomplete. Ask whoever sent it to copy it again from their Dashboard.
      </InviteMessage>
    );
  }

  const invite = await resolveInvite(token);

  if (!invite) {
    return (
      <InviteMessage title="Invite link not valid">
        This invite link was cancelled or has already been used. Ask whoever sent it for a fresh
        one from their Dashboard.
      </InviteMessage>
    );
  }

  const { wedding } = invite;
  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/join-wedding?token=${token}`;
    return (
      <InviteMessage
        title={`Join ${coupleNames || "this wedding"} on You Do, I Do`}
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

  const blocker = await inviteBlocker(wedding, user.id);

  if (blocker === "own") {
    return (
      <InviteMessage title="This is your own wedding">
        You&apos;re already the owner of this wedding -- there&apos;s nothing to accept.
        <Link href="/dashboard" className="mt-4 block font-medium text-brass hover:underline">
          Go to Dashboard
        </Link>
      </InviteMessage>
    );
  }

  if (blocker === "already") {
    return (
      <InviteMessage title="You're already planning this wedding">
        <Link href="/dashboard" className="mt-4 block font-medium text-brass hover:underline">
          Go to Dashboard
        </Link>
      </InviteMessage>
    );
  }

  if (blocker === "other") {
    return (
      <InviteMessage title="This account has its own wedding">
        {user.email} is already planning a different wedding. Log out and accept this invite with
        another email.
      </InviteMessage>
    );
  }

  return (
    <InviteMessage
      title={`Join ${coupleNames || "this wedding"} on You Do, I Do`}
      description={ROLE_PROMISE[invite.role]}
    >
      {blocker === "replace" && (
        <p className="mt-4 text-sm text-ink/70">
          You&apos;ve already started a wedding on this account. It has no guests yet, so
          accepting deletes it and moves you onto this one.
        </p>
      )}
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
          You Do, I Do invite
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest">{title}</h1>
        {description && <p className="mt-4 text-ink/70">{description}</p>}
        {children}
      </div>
    </main>
  );
}
