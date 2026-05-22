"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/auth-context"
import { usePreferencesCache } from "@/features/user-preferences/context/preferences-cache-context"

export function OnboardingGate() {
  const { isHydrated, user, accessToken } = useAuth()
  const { loadPreferences } = usePreferencesCache()
  const router = useRouter()
  const pathname = usePathname()

  const lastCheckedForUserId = useRef<string | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) return

    if (lastCheckedForUserId.current === user.id) return
    if (inFlight.current) return
    inFlight.current = true

    loadPreferences()
      .then((prefs) => {
        lastCheckedForUserId.current = user.id

        const onOnboarding = pathname?.startsWith("/onboarding")
        if (!prefs.hasCompletedOnboarding) {
          if (!onOnboarding) router.replace("/onboarding/cuisine")
          return
        }
        if (onOnboarding) router.replace("/")
      })
      .catch(() => {
        lastCheckedForUserId.current = user.id
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [accessToken, isHydrated, loadPreferences, pathname, router, user])

  return null
}
