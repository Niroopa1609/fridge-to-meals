import { useAuth } from "@/features/auth/context/auth-context"

// Lightweight helper for places that already have access to the token.
export function buildAuthHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Optional convenience hook for client components.
export function useAuthedFetch() {
  const { accessToken } = useAuth()
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers: HeadersInit = {
      ...(init?.headers || {}),
      ...buildAuthHeaders(accessToken),
    }
    return fetch(input, { ...init, headers })
  }
}

