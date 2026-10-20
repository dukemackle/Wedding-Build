import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * `headers` ride along on every request, for row security that reads them
 * (the guest-site headers in ./guest-site.ts).
 */
export async function createClient({ headers }: { headers?: Record<string, string> } = {}) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(headers ? { global: { headers } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component; middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
