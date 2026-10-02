import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses row-level security entirely via the service-role key -- only
// construct this after requireAdmin()/isCurrentUserAdmin() has confirmed
// the caller, or (the other legitimate uses) to look up a wedding invite by
// its token in join-wedding/, where the invitee isn't yet a member of the
// wedding so the normal RLS-scoped client can't see it -- that action does
// its own checks before writing anything -- and to read the emails of a
// wedding's members for the dashboard's "Who's planning" list, after the
// RLS-scoped client has shown the caller is on that wedding. Never import
// this from client code.
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
