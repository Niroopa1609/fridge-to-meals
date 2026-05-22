"use client"

import { useEffect } from "react"

/** Registers the service worker (required for Web Push). */
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
        /* non-fatal */
      }
    }

    void register()
  }, [])

  return null
}
