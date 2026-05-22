"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { AuthUser, SignInPayload, SignUpPayload } from "@/features/auth/types"
import { signIn as apiSignIn, signUp as apiSignUp } from "@/features/auth/services/auth"
import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"
import { toast } from "sonner"
import { registerAuthSessionClient } from "@/lib/auth-session-client"
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/features/auth/auth-storage"
import { writeRememberDevicePreference } from "@/features/auth/remember-device"

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  rememberDevice: boolean
  isHydrated: boolean
  signUp: (payload: SignUpPayload) => Promise<void>
  signIn: (payload: SignInPayload) => Promise<void>
  refresh: () => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [rememberDevice, setRememberDevice] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  const accessTokenRef = useRef<string | null>(null)
  const refreshTokenRef = useRef<string | null>(null)
  const rememberDeviceRef = useRef(true)

  accessTokenRef.current = accessToken
  refreshTokenRef.current = refreshToken
  rememberDeviceRef.current = rememberDevice

  const persist = useCallback(
    (
      nextAccessToken: string | null,
      nextRefreshToken: string | null,
      nextUser: AuthUser | null,
      nextRememberDevice: boolean
    ) => {
      accessTokenRef.current = nextAccessToken
      refreshTokenRef.current = nextRefreshToken
      setAccessToken(nextAccessToken)
      setRefreshToken(nextRefreshToken)
      setUser(nextUser)
      setRememberDevice(nextRememberDevice)
      rememberDeviceRef.current = nextRememberDevice

      if (!nextAccessToken || !nextRefreshToken || !nextUser) {
        clearAuthSession()
        return
      }

      writeAuthSession(
        {
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
          user: nextUser,
          rememberDevice: nextRememberDevice,
        },
        nextRememberDevice
      )
    },
    []
  )

  useEffect(() => {
    const stored = readAuthSession()
    if (stored) {
      accessTokenRef.current = stored.session.accessToken
      refreshTokenRef.current = stored.session.refreshToken
      setAccessToken(stored.session.accessToken)
      setRefreshToken(stored.session.refreshToken)
      setUser(stored.session.user)
      setRememberDevice(stored.rememberDevice)
      rememberDeviceRef.current = stored.rememberDevice
    }
    setIsHydrated(true)
  }, [])

  const refresh = useCallback(async (): Promise<boolean> => {
    const token = refreshTokenRef.current
    if (!token) return false

    const requestId = getRequestId()
    const { res } = await apiFetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
      requestId,
    })
    if (!res.ok) {
      logError("auth.refresh.failed", requestId, { status: res.status })
      persist(null, null, null, rememberDeviceRef.current)
      return false
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string; user: AuthUser }
    persist(data.accessToken, data.refreshToken, data.user, rememberDeviceRef.current)
    return true
  }, [persist])

  useEffect(() => {
    registerAuthSessionClient({
      getAccessToken: () => accessTokenRef.current,
      refresh,
    })
    return () => registerAuthSessionClient(null)
  }, [refresh])

  useEffect(() => {
    if (!isHydrated || !refreshTokenRef.current) return
    void refresh()
  }, [isHydrated, refresh])

  useEffect(() => {
    let lastPromptAt = 0
    const handler = () => {
      const now = Date.now()
      if (now - lastPromptAt < 1500) return
      lastPromptAt = now

      if (!user && !accessToken && !refreshToken) return

      persist(null, null, null, rememberDeviceRef.current)
      toast.message("Session expired. Please sign in again.")
      window.dispatchEvent(new Event("auth:signin"))
    }
    window.addEventListener("auth:unauthorized", handler as EventListener)
    return () => window.removeEventListener("auth:unauthorized", handler as EventListener)
  }, [accessToken, persist, refreshToken, user])

  const signUp = async (payload: SignUpPayload) => {
    const requestId = getRequestId()
    logInfo("ui.signup.submit", requestId, { email: payload.email })
    const res = await apiSignUp(payload)
    writeRememberDevicePreference(true)
    persist(res.accessToken, res.refreshToken, res.user, true)
  }

  const signIn = async (payload: SignInPayload) => {
    const requestId = getRequestId()
    const remember = payload.rememberDevice !== false
    logInfo("ui.signin.submit", requestId, { email: payload.email, rememberDevice: remember })
    const res = await apiSignIn(payload)
    writeRememberDevicePreference(remember)
    persist(res.accessToken, res.refreshToken, res.user, remember)
  }

  const logout = async () => {
    const requestId = getRequestId()
    const token = refreshTokenRef.current
    try {
      if (token) {
        await apiFetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token }),
          requestId,
        })
      }
    } finally {
      persist(null, null, null, rememberDeviceRef.current)
    }
  }

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      refreshToken,
      rememberDevice,
      isHydrated,
      signUp,
      signIn,
      refresh,
      logout,
    }),
    [user, accessToken, refreshToken, rememberDevice, isHydrated, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
