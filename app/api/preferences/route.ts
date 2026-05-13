import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"

export const runtime = "nodejs"

function normalizeCuisines(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const uniq = new Map<string, string>()
  for (const c of raw) {
    if (c == null) continue
    const t = String(c).trim()
    if (!t) continue
    const key = t.toLowerCase()
    if (!uniq.has(key)) uniq.set(key, t)
    if (uniq.size >= 3) break
  }
  return [...uniq.values()]
}

export async function GET(req: Request) {
  try {
    const auth = await requireBearerUser(req)
    if ("error" in auth) return auth.error
    let supabase
    try {
      supabase = createAdminClient()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server misconfiguration"
      return NextResponse.json({ error: msg }, { status: 503 })
    }
    const { data: row } = await supabase.from("user_preferences").select("preferred_cuisines").eq("user_id", auth.user.uid).maybeSingle()
    if (!row) {
      return NextResponse.json({ preferredCuisines: [], hasCompletedOnboarding: false })
    }
    const preferredCuisines = normalizeCuisines(row.preferred_cuisines)
    return NextResponse.json({ preferredCuisines, hasCompletedOnboarding: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireBearerUser(req)
    if ("error" in auth) return auth.error
    const body = (await req.json()) as { preferredCuisines?: unknown }
    const preferredCuisines = normalizeCuisines(body.preferredCuisines)
    let supabase
    try {
      supabase = createAdminClient()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server misconfiguration"
      return NextResponse.json({ error: msg }, { status: 503 })
    }
    const now = new Date().toISOString()
    const { data: existing } = await supabase.from("user_preferences").select("id").eq("user_id", auth.user.uid).maybeSingle()
    if (existing?.id) {
      const { error } = await supabase
        .from("user_preferences")
        .update({ preferred_cuisines: preferredCuisines, updated_at: now })
        .eq("id", existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    } else {
      const { error } = await supabase.from("user_preferences").insert({
        id: crypto.randomUUID(),
        user_id: auth.user.uid,
        preferred_cuisines: preferredCuisines,
        created_at: now,
        updated_at: now,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ preferredCuisines, hasCompletedOnboarding: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
