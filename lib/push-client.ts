import { apiFetch } from "@/lib/api"
import { getClientAccessToken } from "@/lib/auth-session-client"

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64Safe)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

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
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  if (fromEnv) return fromEnv
  const { res } = await apiFetch("/api/push/vapid-key")
  if (!res.ok) return null
  const data = (await res.json()) as { enabled?: boolean; publicKey?: string | null }
  return data.enabled && data.publicKey ? data.publicKey : null
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
  if (!isPushSupported()) {
    return { ok: false, reason: "Push notifications are not supported in this browser." }
  }

  const publicKey = await getVapidPublicKey()
  if (!publicKey) {
    return { ok: false, reason: "Push is not configured on the server." }
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
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
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

  return { ok: true }
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  const token = getClientAccessToken()
  if (token) {
    const reg = await navigator.serviceWorker.getRegistration("/")
    const sub = await reg?.pushManager.getSubscription()
    await apiFetch("/api/push/subscribe", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint: sub?.endpoint }),
    })
    await sub?.unsubscribe()
  }
}
