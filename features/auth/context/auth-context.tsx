"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { AuthUser, SignInPayload, SignUpPayload } from "@/features/auth/types"
import { signIn as apiSignIn, signUp as apiSignUp } from "@/features/auth/services/auth"
import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"
import { toast } from "sonner"

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isHydrated: boolean
  signUp: (payload: SignUpPayload) => Promise<void>
  signIn: (payload: SignInPayload) => Promise<void>
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = "dailyMealDecider.auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { accessToken?: string; refreshToken?: string; user?: AuthUser }
        if (parsed?.accessToken) setAccessToken(parsed.accessToken)
        if (parsed?.refreshToken) setRefreshToken(parsed.refreshToken)
        if (parsed?.user) setUser(parsed.user)
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Central handler for stale/expired tokens.
  useEffect(() => {
    let lastPromptAt = 0
    const handler = () => {
      const now = Date.now()
      if (now - lastPromptAt < 1500) return
      lastPromptAt = now

      // If we don't have a user/token, nothing to clear.
      if (!user && !accessToken && !refreshToken) return

      persist(null, null, null)
      toast.message("Session expired. Please sign in again.")
      window.dispatchEvent(new Event("auth:signin"))
    }
    window.addEventListener("auth:unauthorized", handler as EventListener)
    return () => window.removeEventListener("auth:unauthorized", handler as EventListener)
  }, [accessToken, refreshToken, user])

  const persist = (nextAccessToken: string | null, nextRefreshToken: string | null, nextUser: AuthUser | null) => {
    setAccessToken(nextAccessToken)
    setRefreshToken(nextRefreshToken)
    setUser(nextUser)
    if (!nextAccessToken || !nextRefreshToken || !nextUser) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: nextAccessToken, refreshToken: nextRefreshToken, user: nextUser })
    )
  }

  const signUp = async (payload: SignUpPayload) => {
    const requestId = getRequestId()
    logInfo("ui.signup.submit", requestId, { email: payload.email })
    const res = await apiSignUp(payload)
    persist(res.accessToken, res.refreshToken, res.user)
  }

  const signIn = async (payload: SignInPayload) => {
    const requestId = getRequestId()
    logInfo("ui.signin.submit", requestId, { email: payload.email })
    const res = await apiSignIn(payload)
    persist(res.accessToken, res.refreshToken, res.user)
  }

  const refresh = async () => {
    if (!refreshToken) return
    const requestId = getRequestId()
    const { res } = await apiFetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      requestId,
    })
    if (!res.ok) {
      logError("auth.refresh.failed", requestId, { status: res.status })
      persist(null, null, null)
      return
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string; user: AuthUser }
    persist(data.accessToken, data.refreshToken, data.user)
  }

  const logout = async () => {
    const requestId = getRequestId()
    try {
      if (refreshToken) {
        await apiFetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          requestId,
        })
      }
    } finally {
      persist(null, null, null)
    }
  }

  const value = useMemo<AuthState>(
    () => ({ user, accessToken, refreshToken, isHydrated, signUp, signIn, refresh, logout }),
    [user, accessToken, refreshToken, isHydrated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

