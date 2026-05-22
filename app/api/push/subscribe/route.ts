import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBearerUser, jsonError } from "@/lib/server/auth-request"
import { logError, logInfo } from "@/lib/logger"
import { getRequestId } from "@/lib/request-id"
import { isWebPushConfigured } from "@/lib/server/web-push"

export const runtime = "nodejs"

type SubscribeBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export async function GET(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  if (!isWebPushConfigured()) {
    return NextResponse.json({ enabled: false, subscribed: false })
  }
  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration"
    return NextResponse.json({ error: msg }, { status: 503 })
  }
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.uid)
  return NextResponse.json({
    enabled: true,
    subscribed: (count ?? 0) > 0,
  })
}

export async function POST(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error
  if (!isWebPushConfigured()) {
    return jsonError("Web push is not configured on this server", 503)
  }

  let body: SubscribeBody
  try {
    body = (await req.json()) as SubscribeBody
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  const endpoint = body.endpoint?.trim()
  const p256dh = body.keys?.p256dh?.trim()
  const authKey = body.keys?.auth?.trim()
  if (!endpoint || !p256dh || !authKey) {
    return jsonError("endpoint and keys.p256dh, keys.auth are required", 400)
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration"
    return NextResponse.json({ error: msg }, { status: 503 })
  }

  const now = new Date().toISOString()
  const userAgent = req.headers.get("user-agent")

  const { data: existing } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("endpoint", endpoint)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        user_id: auth.user.uid,
        p256dh,
        auth: authKey,
        user_agent: userAgent,
        updated_at: now,
      })
      .eq("id", existing.id)
    if (error) {
      logError("push.subscribe.update_failed", getRequestId(), {
        userId: auth.user.uid,
        message: error.message,
      })
      return jsonError(error.message, 400)
    }
  } else {
    const { error } = await supabase.from("push_subscriptions").insert({
      id: crypto.randomUUID(),
      user_id: auth.user.uid,
      endpoint,
      p256dh,
      auth: authKey,
      user_agent: userAgent,
      created_at: now,
      updated_at: now,
    })
    if (error) {
      logError("push.subscribe.insert_failed", getRequestId(), {
        userId: auth.user.uid,
        message: error.message,
      })
      return jsonError(error.message, 400)
    }
  }

  logInfo("push.subscribe.saved", getRequestId(), { userId: auth.user.uid })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const auth = await requireBearerUser(req)
  if ("error" in auth) return auth.error

  let endpoint: string | undefined
  try {
    const body = (await req.json()) as { endpoint?: string }
    endpoint = body.endpoint?.trim()
  } catch {
    /* remove all for user */
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration"
    return NextResponse.json({ error: msg }, { status: 503 })
  }

  let q = supabase.from("push_subscriptions").delete().eq("user_id", auth.user.uid)
  if (endpoint) q = q.eq("endpoint", endpoint)
  const { error } = await q
  if (error) return jsonError(error.message, 400)
  return NextResponse.json({ ok: true })
}
