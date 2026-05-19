import type { AuthUser } from "@/features/auth/types"
import { readRememberDevicePreference } from "@/features/auth/remember-device"

export const AUTH_STORAGE_KEY = "dailyMealDecider.auth"

export type StoredAuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
  rememberDevice?: boolean
}

export function getAuthStorage(rememberDevice?: boolean): Storage {
  const remember = rememberDevice ?? readRememberDevicePreference()
  return remember ? localStorage : sessionStorage
}

export function readAuthSession(): { session: StoredAuthSession; rememberDevice: boolean } | null {
  if (typeof window === "undefined") return null

  const fromLocal = localStorage.getItem(AUTH_STORAGE_KEY)
  const fromSession = sessionStorage.getItem(AUTH_STORAGE_KEY)
  const raw = fromLocal ?? fromSession
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) return null
    const rememberDevice = Boolean(fromLocal) || parsed.rememberDevice === true
    return {
      session: {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        user: parsed.user,
        rememberDevice,
      },
      rememberDevice,
    }
  } catch {
    return null
  }
}

export function writeAuthSession(session: StoredAuthSession, rememberDevice: boolean): void {
  if (typeof window === "undefined") return
  const payload: StoredAuthSession = { ...session, rememberDevice }
  const storage = getAuthStorage(rememberDevice)
  const other = rememberDevice ? sessionStorage : localStorage
  other.removeItem(AUTH_STORAGE_KEY)
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
