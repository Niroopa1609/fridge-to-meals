import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser } from "@/lib/server/auth-request"
import { getTodayPicks } from "@/lib/server/todays-picks"
import { abortAwareCatch, abortedResponse } from "@/lib/server/route-abort"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const signal = req.signal
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  try {
    const supabase = createAdminClient()
    const out = await getTodayPicks(supabase, auth.user.uid, true, signal)
    if (signal.aborted) return abortedResponse()
    return NextResponse.json(out)
  } catch (e) {
    const aborted = abortAwareCatch(e)
    if (aborted) return aborted
    if (signal.aborted) return abortedResponse()
    const msg = e instanceof Error ? e.message : "Failed to refresh today's picks"
    return NextResponse.json({ error: msg, message: msg }, { status: 400 })
  }
}
