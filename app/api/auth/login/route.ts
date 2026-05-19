import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyPassword } from "@/lib/server/password"
import { issueSession } from "@/lib/server/auth-session"

export const runtime = "nodejs"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; rememberDevice?: boolean }
    const email = normalizeEmail(body.email || "")
    const password = body.password || ""
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data: user, error } = await supabase.from("users").select("id, email, name, password_hash, created_at").eq("email", email).maybeSingle()
    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }
    if (!verifyPassword(password, String(user.password_hash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }
    const ua = req.headers.get("user-agent")
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const session = await issueSession(
      user.id,
      String(user.email),
      String(user.name),
      user.created_at ? String(user.created_at) : undefined,
      { userAgent: ua, ip, rememberDevice: body.rememberDevice !== false }
    )
    return NextResponse.json(session)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
