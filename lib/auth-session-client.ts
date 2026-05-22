import { readAuthSession } from "@/features/auth/auth-storage"

type AuthSessionClient = {
  getAccessToken: () => string | null
  refresh: () => Promise<boolean>
}

let client: AuthSessionClient | null = null
let refreshInFlight: Promise<boolean> | null = null

export function registerAuthSessionClient(next: AuthSessionClient | null) {
  client = next
}

/** Token from in-memory ref (synced on login) or storage fallback right after sign-up. */
export function getClientAccessToken(): string | null {
  const fromRef = client?.getAccessToken() ?? null
  if (fromRef) return fromRef
  if (typeof window === "undefined") return null
  return readAuthSession()?.session.accessToken ?? null
}

export async function tryRefreshSession(): Promise<boolean> {
  if (!client) return false
  if (!refreshInFlight) {
    refreshInFlight = client.refresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}
