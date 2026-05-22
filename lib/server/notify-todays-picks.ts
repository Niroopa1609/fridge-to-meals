import type { SupabaseClient } from "@supabase/supabase-js"
import { logInfo } from "@/lib/logger"
import {
  isWebPushConfigured,
  sendPushToSubscription,
  type PushSubscriptionRow,
  type TodaysPicksPushPayload,
} from "@/lib/server/web-push"

const DEFAULT_PAYLOAD: TodaysPicksPushPayload = {
  title: "Today's picks are ready",
  body: "Open Fridge To Meals to see meals made from your fridge.",
  url: "/todays-picks",
}

export async function notifyTodaysPicksReady(
  supabase: SupabaseClient,
  userId: string,
  pickDate: string,
  recipeCount?: number
): Promise<void> {
  if (!isWebPushConfigured()) return
  if (recipeCount !== undefined && recipeCount < 1) return

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth, user_agent, last_notified_pick_date")
    .eq("user_id", userId)

  if (error || !subs?.length) return

  const pending = (subs as PushSubscriptionRow[]).filter(
    (s) => s.last_notified_pick_date !== pickDate
  )
  if (!pending.length) return

  const body =
    recipeCount && recipeCount > 0
      ? `${recipeCount} meal ideas from your fridge are waiting for you.`
      : DEFAULT_PAYLOAD.body

  const payload: TodaysPicksPushPayload = {
    ...DEFAULT_PAYLOAD,
    body,
  }

  const goneIds: string[] = []
  const notifiedIds: string[] = []

  for (const sub of pending) {
    const result = await sendPushToSubscription(sub, payload)
    if (result.ok) {
      notifiedIds.push(sub.id)
    } else if (result.gone) {
      goneIds.push(sub.id)
    }
  }

  if (goneIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", goneIds)
  }

  if (notifiedIds.length) {
    const now = new Date().toISOString()
    await supabase
      .from("push_subscriptions")
      .update({ last_notified_pick_date: pickDate, updated_at: now })
      .in("id", notifiedIds)
    logInfo("push.todays_picks.sent", crypto.randomUUID(), {
      userId,
      pickDate,
      count: notifiedIds.length,
    })
  }
}

/** Cron: notify users with today's cache who have not been notified yet today. */
export async function runTodaysPicksPushCron(supabase: SupabaseClient): Promise<{
  scanned: number
  notified: number
}> {
  if (!isWebPushConfigured()) return { scanned: 0, notified: 0 }

  const pickDate = new Date().toISOString().slice(0, 10)

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("user_id, last_notified_pick_date")
    .or(`last_notified_pick_date.is.null,last_notified_pick_date.neq.${pickDate}`)

  if (error || !subs?.length) return { scanned: 0, notified: 0 }

  const userIds = [...new Set(subs.map((s) => s.user_id as string))]
  let notified = 0

  for (const userId of userIds) {
    const { data: cache } = await supabase
      .from("today_picks_cache")
      .select("response_json")
      .eq("user_id", userId)
      .eq("pick_date", pickDate)
      .maybeSingle()

    if (!cache?.response_json) continue

    let recipeCount = 0
    try {
      const parsed = JSON.parse(cache.response_json) as { recipes?: unknown[] }
      recipeCount = parsed?.recipes?.length ?? 0
    } catch {
      continue
    }
    if (recipeCount < 1) continue

    await notifyTodaysPicksReady(supabase, userId, pickDate, recipeCount)
    notified++
  }

  return { scanned: userIds.length, notified }
}
