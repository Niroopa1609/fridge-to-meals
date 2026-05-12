import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"
import { getTodayPicks } from "@/lib/server/todays-picks"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  const url = new URL(req.url)
  if (url.searchParams.get("refresh") === "true") {
    return NextResponse.json({ message: "Use POST /api/recipes/today/refresh to refresh." }, { status: 400 })
  }
  try {
    const supabase = createAdminClient()
    const out = await getTodayPicks(supabase, auth.user.uid, false)
    return NextResponse.json(out)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load today's picks"
    return NextResponse.json({ error: msg, message: msg }, { status: 400 })
  }
}
