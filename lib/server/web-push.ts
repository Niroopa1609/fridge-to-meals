import webpush from "web-push"

export type PushSubscriptionRow = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  last_notified_pick_date: string | null
}

export type TodaysPicksPushPayload = {
  title: string
  body: string
  url: string
}

export function isWebPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

function configureWebPush(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:support@fridgetomeals.com",
    publicKey,
    privateKey
  )
  return true
}

export async function sendPushToSubscription(
  sub: Pick<PushSubscriptionRow, "endpoint" | "p256dh" | "auth">,
  payload: TodaysPicksPushPayload
): Promise<{ ok: true } | { ok: false; gone: boolean }> {
  if (!configureWebPush()) return { ok: false, gone: false }

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  }

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    return { ok: true }
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode
    if (status === 404 || status === 410) return { ok: false, gone: true }
    return { ok: false, gone: false }
  }
}
