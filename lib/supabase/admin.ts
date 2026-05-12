import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { normalizeEnvSecret, normalizeSupabaseUrl } from "@/lib/supabase/env-normalize"

let cached: { url: string; key: string; client: SupabaseClient } | null = null

/**
 * Server-only Supabase client with the service role key.
 * Use only in Route Handlers / Server Actions after validating the end user (e.g. JWT).
 */
export function createAdminClient(): SupabaseClient {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = normalizeEnvSecret(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Use the Project URL from Supabase → Settings → API (https://<ref>.supabase.co only, no /rest/v1). " +
        "No quotes around values in .env.local."
    )
  }
  if (cached?.url === url && cached?.key === key) return cached.client
  cached = {
    url,
    key,
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  }
  return cached.client
}
