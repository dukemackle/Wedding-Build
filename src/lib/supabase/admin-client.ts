import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses row-level security entirely via the service-role key -- only
// ever construct this after requireAdmin()/isCurrentUserAdmin() has
// confirmed the caller. Never import this from client code.
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
