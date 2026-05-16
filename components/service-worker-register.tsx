"use client"

import { useEffect } from "react"

/**
 * Registers the app shell service worker in production only (HTTPS).
 * Keeps a network-only fetch handler so API/auth behavior stays unchanged.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
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
