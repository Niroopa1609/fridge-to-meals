"use client"

import { useEffect } from "react"

/**
 * Registers the service worker (required for Web Push). Network-only fetch handler.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
      } catch {
        // Non-fatal: PWA install may still work where SW registration is blocked
      }
    }

    void register()
  }, [])

  return null
}
