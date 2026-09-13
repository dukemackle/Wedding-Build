import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses row-level security entirely via the service-role key -- only
// construct this after requireAdmin()/isCurrentUserAdmin() has confirmed
// the caller, or (the other legitimate use) to look up a wedding by its
// invite_token in join-wedding/actions.ts, where the invitee isn't yet a
// member of the wedding so the normal RLS-scoped client can't see it --
// that action does its own ownership/membership checks before writing
// anything. Never import this from client code.
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
