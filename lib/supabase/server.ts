import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { normalizeEnvSecret, normalizeSupabaseUrl } from "@/lib/supabase/env-normalize"

/**
 * Supabase server client bound to cookies (anon key).
 * With custom JWT auth, DB access still goes through createAdminClient() after verifying the user.
 * This client is the right place to attach Supabase Auth sessions later without exposing the service role.
 */
export async function createServerSupabase() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anon = normalizeEnvSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  const cookieStore = await cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component without mutable cookies — ignore.
        }
      },
    },
  })
}
