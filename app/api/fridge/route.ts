import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"

export const runtime = "nodejs"

const ALLOWED = new Set(["Vegetables", "Fruits", "Dairy", "Proteins", "Pantry", "Others"])

function normalizeCategory(raw: string | undefined) {
  const c = raw?.trim() || ""
  return ALLOWED.has(c) ? c : "Others"
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
    const { data, error } = await supabase
      .from("fridge_items")
      .select("id, name, category, created_at")
      .eq("user_id", auth.user.uid)
      .order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const items = (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      createdAt: r.created_at,
    }))
    return NextResponse.json(items)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireBearerUser(req)
    if ("error" in auth) return auth.error
    const body = (await req.json()) as { items?: { name?: string; category?: string }[] }
    const items = Array.isArray(body.items) ? body.items : []
    if (!items.length) return NextResponse.json({ added: 0 })

    let supabase
    try {
      supabase = createAdminClient()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server misconfiguration"
      return NextResponse.json({ error: msg }, { status: 503 })
    }
    const seenLower = new Set<string>()
    let added = 0
    for (const payload of items) {
      const name = (payload.name || "").trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seenLower.has(key)) continue
      seenLower.add(key)

      const category = normalizeCategory(payload.category)
      const { error } = await supabase.from("fridge_items").insert({
        id: crypto.randomUUID(),
        user_id: auth.user.uid,
        name,
        category,
      })
      if (error?.code === "23505") continue
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      added++
    }
    return NextResponse.json({ added })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
