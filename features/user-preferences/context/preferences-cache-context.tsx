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
  const snapshotRef = useRef<UserPreferencesResponse>(emptyPrefs)
  snapshotRef.current = { preferredCuisines, hasCompletedOnboarding }

  const applyPrefs = useCallback((data: UserPreferencesResponse) => {
    setPreferredCuisines(data.preferredCuisines)
    setHasCompletedOnboarding(data.hasCompletedOnboarding)
    setHasLoaded(true)
  }, [])

  const invalidatePreferences = useCallback(() => {
    fetchedAtRef.current = 0
  }, [])

  const loadPreferences = useCallback(
    async (opts?: { force?: boolean }) => {
      const token = accessToken
      const uid = user?.id
      if (!token || !uid) {
        setPreferredCuisines([])
        setHasCompletedOnboarding(false)
        setHasLoaded(false)
        setError(null)
        return emptyPrefs
      }

      const force = opts?.force === true
      const cacheValid =
        !force &&
        cacheUserIdRef.current === uid &&
        fetchedAtRef.current > 0 &&
        Date.now() - fetchedAtRef.current < PREFERENCES_CACHE_TTL_MS &&
        hasLoaded

      if (cacheValid) return snapshotRef.current

      if (inFlightRef.current) return inFlightRef.current

      setLoading(true)
      setError(null)

      const promise = fetchUserPreferences(token)
        .then((data) => {
          cacheUserIdRef.current = uid
          fetchedAtRef.current = Date.now()
          applyPrefs(data)
          return data
        })
        .catch((e) => {
          const msg = e instanceof Error ? e.message : "Could not load preferences."
          setError(msg)
          setHasLoaded(true)
          throw e
        })
        .finally(() => {
          inFlightRef.current = null
          setLoading(false)
        })

      inFlightRef.current = promise
      return promise
    },
    [accessToken, applyPrefs, hasLoaded, user?.id]
  )

  const savePreferences = useCallback(
    async (cuisines: string[]) => {
      const token = accessToken
      if (!token) throw new Error("Sign in to save preferences.")
      setLoading(true)
      setError(null)
      try {
        const data = await saveUserPreferences(token, cuisines)
        const uid = user?.id
        if (uid) {
          cacheUserIdRef.current = uid
          fetchedAtRef.current = Date.now()
        }
        applyPrefs(data)
        return data
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not save preferences."
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [accessToken, applyPrefs, user?.id]
  )

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) {
      cacheUserIdRef.current = null
      fetchedAtRef.current = 0
      inFlightRef.current = null
      setPreferredCuisines([])
      setHasCompletedOnboarding(false)
      setHasLoaded(false)
      setError(null)
      setLoading(false)
      return
    }
    if (cacheUserIdRef.current !== user.id) {
      cacheUserIdRef.current = null
      fetchedAtRef.current = 0
      setPreferredCuisines([])
      setHasCompletedOnboarding(false)
      setHasLoaded(false)
    }
    void loadPreferences()
  }, [accessToken, isHydrated, loadPreferences, user])

  const value = useMemo<PreferencesCacheContextValue>(
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
