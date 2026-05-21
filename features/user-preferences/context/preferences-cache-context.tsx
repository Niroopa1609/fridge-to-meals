"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useAuth } from "@/features/auth/context/auth-context"
import {
  fetchUserPreferences,
  saveUserPreferences,
  type UserPreferencesResponse,
} from "@/features/user-preferences/services/user-preferences"

const PREFERENCES_CACHE_TTL_MS = 60_000

type PreferencesCacheContextValue = {
  preferredCuisines: string[]
  hasCompletedOnboarding: boolean
  loading: boolean
  error: string | null
  hasLoaded: boolean
  loadPreferences: (opts?: { force?: boolean }) => Promise<UserPreferencesResponse>
  savePreferences: (preferredCuisines: string[]) => Promise<UserPreferencesResponse>
  invalidatePreferences: () => void
}

const PreferencesCacheContext = createContext<PreferencesCacheContextValue | null>(null)

const emptyPrefs: UserPreferencesResponse = {
  preferredCuisines: [],
  hasCompletedOnboarding: false,
}

export function PreferencesCacheProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isHydrated } = useAuth()
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([])
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const cacheUserIdRef = useRef<string | null>(null)
  const fetchedAtRef = useRef(0)
  const inFlightRef = useRef<Promise<UserPreferencesResponse> | null>(null)
  const prefsRef = useRef<UserPreferencesResponse>(emptyPrefs)
  prefsRef.current = { preferredCuisines, hasCompletedOnboarding }

  const applyPrefs = useCallback((data: UserPreferencesResponse) => {
    setPreferredCuisines(data.preferredCuisines)
    setHasCompletedOnboarding(data.hasCompletedOnboarding)
    prefsRef.current = data
  }, [])

  const invalidatePreferences = useCallback(() => {
    fetchedAtRef.current = 0
  }, [])

  const loadPreferences = useCallback(
    async (opts?: { force?: boolean }): Promise<UserPreferencesResponse> => {
      const force = opts?.force === true
      if (!accessToken || !user) {
        applyPrefs(emptyPrefs)
        cacheUserIdRef.current = null
        fetchedAtRef.current = 0
        setHasLoaded(false)
        return emptyPrefs
      }

      const uid = user.id
      const now = Date.now()
      const cacheValid =
        !force &&
        cacheUserIdRef.current === uid &&
        fetchedAtRef.current > 0 &&
        now - fetchedAtRef.current < PREFERENCES_CACHE_TTL_MS

      if (cacheValid) return prefsRef.current

      if (inFlightRef.current && !force) {
        return inFlightRef.current
      }

      const run = (async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchUserPreferences(accessToken)
          applyPrefs(data)
          cacheUserIdRef.current = uid
          fetchedAtRef.current = Date.now()
          return data
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Could not load preferences."
          setError(msg)
          applyPrefs(emptyPrefs)
          throw e
        } finally {
          setHasLoaded(true)
          setLoading(false)
          inFlightRef.current = null
        }
      })()

      inFlightRef.current = run
      return run
    },
    [accessToken, applyPrefs, user]
  )

  const savePreferences = useCallback(
    async (cuisines: string[]): Promise<UserPreferencesResponse> => {
      if (!accessToken || !user) {
        throw new Error("Sign in to save preferences.")
      }
      setLoading(true)
      setError(null)
      try {
        const data = await saveUserPreferences(accessToken, cuisines)
        applyPrefs(data)
        cacheUserIdRef.current = user.id
        fetchedAtRef.current = Date.now()
        setHasLoaded(true)
        return data
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not save preferences."
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [accessToken, applyPrefs, user]
  )

  useEffect(() => {
    if (!isHydrated) return
    if (user && accessToken) return
    applyPrefs(emptyPrefs)
    setError(null)
    setLoading(false)
    setHasLoaded(false)
    cacheUserIdRef.current = null
    fetchedAtRef.current = 0
    inFlightRef.current = null
  }, [accessToken, applyPrefs, isHydrated, user])

  const value = useMemo(
    () => ({
      preferredCuisines,
      hasCompletedOnboarding,
      loading,
      error,
      hasLoaded,
      loadPreferences,
      savePreferences,
      invalidatePreferences,
    }),
    [
      preferredCuisines,
      hasCompletedOnboarding,
      loading,
      error,
      hasLoaded,
      loadPreferences,
      savePreferences,
      invalidatePreferences,
    ]
  )

  return (
    <PreferencesCacheContext.Provider value={value}>{children}</PreferencesCacheContext.Provider>
  )
}

export function usePreferencesCache(): PreferencesCacheContextValue {
  const ctx = useContext(PreferencesCacheContext)
  if (!ctx) {
    throw new Error("usePreferencesCache must be used within PreferencesCacheProvider")
  }
  return ctx
}
