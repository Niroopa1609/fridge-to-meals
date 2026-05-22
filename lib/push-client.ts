import { apiFetch } from "@/lib/api"
import { getClientAccessToken } from "@/lib/auth-session-client"
import { notifyPushSubscriptionChanged } from "@/lib/push-notifications-opt-out"
import {
  INVALID_VAPID_KEY_MESSAGE,
  normalizeVapidPublicKey,
  vapidPublicKeyToUint8Array,
} from "@/lib/vapid-key"

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null
  const existing = await navigator.serviceWorker.getRegistration("/")
  if (existing) return existing
  try {
    return await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    })
  } catch {
    return null
  }
}

async function getVapidPublicKey(): Promise<string | null> {
  const fromEnv = normalizeVapidPublicKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
  if (fromEnv) return fromEnv
  const { res } = await apiFetch("/api/push/vapid-key")
  if (!res.ok) return null
  const data = (await res.json()) as { enabled?: boolean; publicKey?: string | null }
  if (!data.enabled || !data.publicKey) return null
  return normalizeVapidPublicKey(data.publicKey)
}

export async function getPushSubscriptionStatus(): Promise<{
  enabled: boolean
  subscribed: boolean
}> {
  const token = getClientAccessToken()
  if (!token) return { enabled: false, subscribed: false }
  const { res } = await apiFetch("/api/push/subscribe", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return { enabled: false, subscribed: false }
  return (await res.json()) as { enabled: boolean; subscribed: boolean }
}

export async function subscribeToPushNotifications(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  try {
    if (!isPushSupported()) {
      return { ok: false, reason: "Push notifications are not supported in this browser." }
    }

    const publicKey = await getVapidPublicKey()
    if (!publicKey) {
      return { ok: false, reason: "Push is not configured on the server." }
    }

    let applicationServerKey: Uint8Array
    try {
      applicationServerKey = vapidPublicKeyToUint8Array(publicKey)
    } catch {
      return { ok: false, reason: INVALID_VAPID_KEY_MESSAGE }
    }

    const token = getClientAccessToken()
    if (!token) {
      return { ok: false, reason: "Sign in to enable notifications." }
    }

    const registration = await ensureServiceWorker()
    if (!registration) {
      return { ok: false, reason: "Could not register the app for notifications." }
    }

    await navigator.serviceWorker.ready

    let permission = Notification.permission
    if (permission === "default") {
      permission = await Notification.requestPermission()
    }
    if (permission !== "granted") {
      return { ok: false, reason: "Notification permission was denied." }
    }

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not subscribe to push."
        return { ok: false, reason: msg }
      }
    }

    const json = subscription.toJSON()
    const { res } = await apiFetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, reason: err.error || "Failed to save subscription." }
    }

    notifyPushSubscriptionChanged()
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not enable notifications."
    return { ok: false, reason: msg }
  }
}

/** Removes all push_subscriptions rows for the signed-in user (and browser subscription if present). */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  const token = getClientAccessToken()
  const reg = await navigator.serviceWorker.getRegistration("/")
  const sub = await reg?.pushManager.getSubscription()
  if (token) {
    await apiFetch("/api/push/subscribe", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: sub?.endpoint ? JSON.stringify({ endpoint: sub.endpoint }) : "{}",
    })
  }
  await sub?.unsubscribe()
  notifyPushSubscriptionChanged()
}

export type TodaysPickNotificationSettingState =
  | "loading"
  | "on"
  | "off"
  | "blocked"
  | "unsupported"
  | "not_configured"

/** `on` / `off` reflect push_subscriptions via GET /api/push/subscribe. */
export async function getTodaysPickNotificationSettingState(): Promise<TodaysPickNotificationSettingState> {
  if (!isPushSupported()) return "unsupported"
  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    return "blocked"
  }
  const status = await getPushSubscriptionStatus()
  if (!status.enabled) return "not_configured"
  return status.subscribed ? "on" : "off"
}
