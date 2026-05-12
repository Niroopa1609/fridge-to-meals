import { createBrowserClient } from "@supabase/ssr"
import { normalizeEnvSecret, normalizeSupabaseUrl } from "@/lib/supabase/env-normalize"

/**
 * Browser-safe Supabase client (anon key only).
 * Custom auth uses JWT + Bearer headers; this client is available for future Supabase Auth / RLS flows.
 */
export function createBrowserSupabase() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anon = normalizeEnvSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createBrowserClient(url, anon)
}
