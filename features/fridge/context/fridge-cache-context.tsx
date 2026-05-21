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
import { fetchFridgeItems, type FridgeItemDto } from "@/features/fridge/services/fridge"

const FRIDGE_CACHE_TTL_MS = 60_000

type FridgeCacheContextValue = {
  items: FridgeItemDto[]
  loading: boolean
  error: string | null
  loadFridgeItems: (opts?: { force?: boolean }) => Promise<FridgeItemDto[]>
  invalidateFridge: () => void
  removeItemLocally: (itemId: string) => void
}

const FridgeCacheContext = createContext<FridgeCacheContextValue | null>(null)

export function FridgeCacheProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isHydrated } = useAuth()
  const [items, setItems] = useState<FridgeItemDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheUserIdRef = useRef<string | null>(null)
  const fetchedAtRef = useRef(0)
  const inFlightRef = useRef<Promise<FridgeItemDto[]> | null>(null)
  const itemsRef = useRef<FridgeItemDto[]>([])
  itemsRef.current = items

  const invalidateFridge = useCallback(() => {
    fetchedAtRef.current = 0
  }, [])

  const removeItemLocally = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((x) => x.id !== itemId))
    fetchedAtRef.current = Date.now()
  }, [])

  const loadFridgeItems = useCallback(
    async (opts?: { force?: boolean }): Promise<FridgeItemDto[]> => {
      const force = opts?.force === true
      if (!accessToken || !user) {
        setItems([])
        cacheUserIdRef.current = null
        fetchedAtRef.current = 0
        return []
      }

      const uid = user.id
      const now = Date.now()
      const cacheValid =
        !force &&
        cacheUserIdRef.current === uid &&
        fetchedAtRef.current > 0 &&
        now - fetchedAtRef.current < FRIDGE_CACHE_TTL_MS

      if (cacheValid) return itemsRef.current

      if (inFlightRef.current && !force) {
        return inFlightRef.current
      }

      const run = (async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchFridgeItems(accessToken)
          setItems(data)
          cacheUserIdRef.current = uid
          fetchedAtRef.current = Date.now()
          return data
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Could not load your saved fridge."
          setError(msg)
          throw e
        } finally {
          setLoading(false)
          inFlightRef.current = null
        }
      })()

      inFlightRef.current = run
      return run
    },
    [accessToken, user]
  )

  useEffect(() => {
    if (!isHydrated) return
    if (user && accessToken) return
    setItems([])
    setError(null)
    setLoading(false)
    cacheUserIdRef.current = null
    fetchedAtRef.current = 0
    inFlightRef.current = null
  }, [accessToken, isHydrated, user])

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      loadFridgeItems,
      invalidateFridge,
      removeItemLocally,
    }),
    [items, loading, error, loadFridgeItems, invalidateFridge, removeItemLocally]
  )

  return <FridgeCacheContext.Provider value={value}>{children}</FridgeCacheContext.Provider>
}

export function useFridgeCache(): FridgeCacheContextValue {
  const ctx = useContext(FridgeCacheContext)
  if (!ctx) throw new Error("useFridgeCache must be used within FridgeCacheProvider")
  return ctx
}
