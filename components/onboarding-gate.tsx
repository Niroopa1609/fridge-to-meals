"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context/auth-context"
import { fetchUserPreferences } from "@/features/user-preferences/services/user-preferences"

export function OnboardingGate() {
  const { isHydrated, user, accessToken } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const lastCheckedForUserId = useRef<string | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!isHydrated) return
    if (!user || !accessToken) return

    // Avoid spamming the endpoint on re-renders.
    if (lastCheckedForUserId.current === user.id) return
    if (inFlight.current) return
    inFlight.current = true

    fetchUserPreferences(accessToken)
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
        // If this fails, don't trap the user.
        lastCheckedForUserId.current = user.id
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [accessToken, isHydrated, pathname, router, user])

  return null
}

