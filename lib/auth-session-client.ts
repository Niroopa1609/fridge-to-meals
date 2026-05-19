type AuthSessionClient = {
  getAccessToken: () => string | null
  refresh: () => Promise<boolean>
}

let client: AuthSessionClient | null = null
let refreshInFlight: Promise<boolean> | null = null

export function registerAuthSessionClient(next: AuthSessionClient | null) {
  client = next
}

export function getClientAccessToken(): string | null {
  return client?.getAccessToken() ?? null
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
