// The project URL and anon key are public (they ship to every browser), so a
// fixed fallback is safe. On Cloudflare Workers process.env is filled in per
// request, and during bursts (cold starts, crawlers) a render sometimes read it
// empty and crashed with "URL and Key are required" -- see /admin/errors.
// Same values as wrangler.jsonc; keep them in sync if the project ever changes.
const FALLBACK_URL = "https://tbvkuvjxjqrauncavhgz.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidmt1dmp4anFyYXVuY2F2aGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNjg4MDAsImV4cCI6MjEwMDg0NDgwMH0.EZzq9BWfgHLTfP2HWW3QpOQPtbYwSnc4ufBkVnAy8mg";

export const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
export const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
