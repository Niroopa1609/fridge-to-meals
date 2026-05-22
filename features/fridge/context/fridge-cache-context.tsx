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
  }, [])

  const loadFridgeItems = useCallback(
    async (opts?: { force?: boolean }) => {
      const token = accessToken
      const uid = user?.id
      if (!token || !uid) {
        setItems([])
        setError(null)
        return []
      }

      const force = opts?.force === true
      const cacheValid =
        !force &&
        cacheUserIdRef.current === uid &&
        fetchedAtRef.current > 0 &&
        Date.now() - fetchedAtRef.current < FRIDGE_CACHE_TTL_MS

      if (cacheValid) return itemsRef.current

      if (inFlightRef.current) return inFlightRef.current

      setLoading(true)
      setError(null)

      const promise = fetchFridgeItems(token)
        .then((data) => {
          cacheUserIdRef.current = uid
          fetchedAtRef.current = Date.now()
          setItems(data)
          return data
        })
        .catch((e) => {
          const msg = e instanceof Error ? e.message : "Could not load fridge."
          setError(msg)
          throw e
        })
        .finally(() => {
          inFlightRef.current = null
          setLoading(false)
        })

      inFlightRef.current = promise
      return promise
    },
    [accessToken, user?.id]
  )

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) {
      cacheUserIdRef.current = null
      fetchedAtRef.current = 0
      inFlightRef.current = null
      setItems([])
      setError(null)
      setLoading(false)
      return
    }
    if (cacheUserIdRef.current !== user.id) {
      cacheUserIdRef.current = null
      fetchedAtRef.current = 0
      setItems([])
    }
    void loadFridgeItems()
  }, [accessToken, isHydrated, loadFridgeItems, user])

  const value = useMemo<FridgeCacheContextValue>(
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
