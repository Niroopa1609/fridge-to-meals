import type { SupabaseClient } from "@supabase/supabase-js"
import { logInfo, logError } from "@/lib/logger"
import { getTodayPicks } from "@/lib/server/todays-picks"
import type { TodayPickRecipeOut } from "@/lib/server/todays-picks"
import {
  isWebPushConfigured,
  sendPushToSubscription,
  type PushSubscriptionRow,
  type TodaysPicksPushPayload,
} from "@/lib/server/web-push"

const MEAL_ORDER = ["Breakfast", "Lunch", "Dinner"] as const

/** Calendar date in US Eastern (matches 5 AM EST/EDT morning job). */
export function pickDateEastern(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function mealKey(mealType: string): string {
  return mealType.trim().toLowerCase()
}

/** One title per meal for push body. */
export function pickMealTitles(recipes: TodayPickRecipeOut[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const meal of MEAL_ORDER) {
    const key = meal.toLowerCase()
    const hit = recipes.find((r) => {
      const m = mealKey(r.mealType || "")
      return m === key || m.startsWith(key)
    })
    const title = hit?.title?.trim()
    if (title) out[meal] = title
  }
  return out
}

export function buildTodaysPicksPushPayload(recipes: TodayPickRecipeOut[]): TodaysPicksPushPayload {
  const byMeal = pickMealTitles(recipes)
  const parts: string[] = []
  for (const meal of MEAL_ORDER) {
    const title = byMeal[meal]
    if (title) parts.push(`${meal}: ${title}`)
  }

  const mealLines = parts.length > 0 ? parts.join(" · ") : "Your meals are ready"
  const body = `${mealLines}. Open Fridge To Meals to view your recipes.`

  return {
    title: "Today's picks are ready",
    body: body.length > 240 ? `${body.slice(0, 237)}…` : body,
    url: "/todays-picks",
  }
}

export async function notifyTodaysPicksReady(
  supabase: SupabaseClient,
  userId: string,
  pickDate: string,
  recipes: TodayPickRecipeOut[],
  opts?: { force?: boolean }
): Promise<void> {
  if (!isWebPushConfigured()) return
  if (!recipes.length) return

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth, user_agent, last_notified_pick_date")
    .eq("user_id", userId)

  if (error || !subs?.length) return

  const pending = (subs as PushSubscriptionRow[]).filter(
    (s) => opts?.force === true || s.last_notified_pick_date !== pickDate
  )
  if (!pending.length) return

  const payload = buildTodaysPicksPushPayload(recipes)
  const goneIds: string[] = []
  const notifiedIds: string[] = []

  for (const sub of pending) {
    const result = await sendPushToSubscription(sub, payload)
    if (result.ok) notifiedIds.push(sub.id)
    else if (result.gone) goneIds.push(sub.id)
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

/**
 * 5 AM US Eastern: generate today's picks for subscribed users, then push meal titles.
 * Vercel cron should fire at 10:00 UTC (5 AM EST; 6 AM during EDT).
 */
export async function runMorningTodaysPicksPushCron(supabase: SupabaseClient): Promise<{
  scanned: number
  generated: number
  notified: number
  skippedNoFridge: number
  failed: number
}> {
  if (!isWebPushConfigured()) {
    return { scanned: 0, generated: 0, notified: 0, skippedNoFridge: 0, failed: 0 }
  }

  const pickDate = pickDateEastern()

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("user_id")

  if (error || !subs?.length) {
    return { scanned: 0, generated: 0, notified: 0, skippedNoFridge: 0, failed: 0 }
  }

  const userIds = [...new Set(subs.map((s) => s.user_id as string))]
  let generated = 0
  let notified = 0
  let skippedNoFridge = 0
  let failed = 0

  for (const userId of userIds) {
    try {
      const { count, error: fridgeErr } = await supabase
        .from("fridge_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)

      if (fridgeErr) throw new Error(fridgeErr.message)
      if (!count) {
        skippedNoFridge++
        continue
      }

      const result = await getTodayPicks(supabase, userId, true)
      if (!result.recipes?.length) {
        failed++
        continue
      }
      generated++

      await notifyTodaysPicksReady(supabase, userId, pickDate, result.recipes, { force: true })
      notified++
    } catch (e) {
      failed++
      const msg = e instanceof Error ? e.message : String(e)
      logError("push.morning_job.user_failed", crypto.randomUUID(), { userId, message: msg })
    }
  }

  logInfo("push.morning_job.complete", crypto.randomUUID(), {
    pickDate,
    scanned: userIds.length,
    generated,
    notified,
    skippedNoFridge,
    failed,
  })

  return {
    scanned: userIds.length,
    generated,
    notified,
    skippedNoFridge,
    failed,
  }
}

/** @deprecated Use runMorningTodaysPicksPushCron */
export async function runTodaysPicksPushCron(supabase: SupabaseClient) {
  return runMorningTodaysPicksPushCron(supabase)
}
