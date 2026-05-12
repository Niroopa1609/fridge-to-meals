import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { hashPassword } from "@/lib/server/password"
import { toTitleCaseWords } from "@/lib/server/name-normalize"
import { issueSession } from "@/lib/server/auth-session"

export const runtime = "nodejs"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function friendlySupabaseMessage(msg: string): string {
  if (/invalid path specified in the request url/i.test(msg)) {
    return (
      "Supabase URL is misconfigured. Set NEXT_PUBLIC_SUPABASE_URL to your Project URL only " +
      "(https://<project-ref>.supabase.co — no /rest/v1, no quotes). Restart npm run dev after saving .env.local."
    )
  }
  return msg
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; password?: string }
    const email = normalizeEmail(body.email || "")
    const password = body.password || ""
    const nameRaw = body.name || ""
    if (!email || !password || !nameRaw.trim()) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data: exists } = await supabase.from("users").select("id").eq("email", email).maybeSingle()
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    const name = toTitleCaseWords(nameRaw)
    const id = crypto.randomUUID()
    const password_hash = hashPassword(password)
    const { data: inserted, error } = await supabase
      .from("users")
      .insert({ id, email, name, password_hash })
      .select("id, email, name, created_at")
      .single()
    if (error || !inserted) {
      return NextResponse.json(
        { error: friendlySupabaseMessage(error?.message || "Signup failed") },
        { status: 400 }
      )
    }
    const ua = req.headers.get("user-agent")
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const session = await issueSession(
      inserted.id,
      String(inserted.email),
      String(inserted.name),
      inserted.created_at ? String(inserted.created_at) : undefined,
      { userAgent: ua, ip }
    )
    return NextResponse.json(session, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Signup failed"
    return NextResponse.json({ error: friendlySupabaseMessage(msg) }, { status: 500 })
  }
}
