/** Strip quotes/whitespace from env VAPID keys (common copy-paste mistakes). */
export function normalizeVapidPublicKey(raw: string | undefined | null): string | null {
  if (raw == null) return null
  let key = raw.trim()
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim()
  }
  key = key.replace(/\s+/g, "")
  if (!key) return null
  if (!/^[A-Za-z0-9_-]+$/.test(key)) return null
  return key
}

export function vapidPublicKeyToUint8Array(key: string): Uint8Array {
  const normalized = normalizeVapidPublicKey(key)
  if (!normalized) {
    throw new Error("Invalid VAPID public key")
  }
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4)
  const base64Safe = (normalized + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64Safe)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export const INVALID_VAPID_KEY_MESSAGE =
  "Invalid notification key in server config. Run pnpm run generate:vapid-keys and set VAPID_PUBLIC_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local (no quotes, one line each). Restart the dev server."
