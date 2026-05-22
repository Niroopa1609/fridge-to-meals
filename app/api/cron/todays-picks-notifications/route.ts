import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { runMorningTodaysPicksPushCron } from "@/lib/server/notify-todays-picks"
import { isWebPushConfigured } from "@/lib/server/web-push"

export const runtime = "nodejs"
/** Morning job generates picks per user; allow long runs on Vercel Pro. */
export const maxDuration = 300

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = req.headers.get("authorization")
  if (auth === `Bearer ${secret}`) return true
  return req.headers.get("x-cron-secret") === secret
}

export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isWebPushConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "web_push_not_configured" })
  }
  try {
    const supabase = createAdminClient()
    const result = await runMorningTodaysPicksPushCron(supabase)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cron failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return GET(req)
}
