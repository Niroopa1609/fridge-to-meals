"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/auth-context"
import { usePreferencesCache } from "@/features/user-preferences/context/preferences-cache-context"

export function OnboardingGate() {
  const { isHydrated, user, accessToken } = useAuth()
  const { loadPreferences } = usePreferencesCache()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) return

    void loadPreferences()
      .then((prefs) => {
        const onOnboarding = pathname?.startsWith("/onboarding")
        if (!prefs.hasCompletedOnboarding) {
          if (!onOnboarding) router.replace("/onboarding/cuisine")
          return
        }
        if (onOnboarding) router.replace("/")
      })
      .catch(() => {
        // If this fails, don't trap the user.
      })
  }, [accessToken, isHydrated, loadPreferences, pathname, router, user])

  return null
}
