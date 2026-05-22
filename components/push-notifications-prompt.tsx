"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { fixedBannerAboveMobileNav, fixedBannerStackedTier2 } from "@/lib/fixed-banner-layout"
import { useAuth } from "@/features/auth/context/auth-context"
import {
  getPushSubscriptionStatus,
  isPushSupported,
  subscribeToPushNotifications,
} from "@/lib/push-client"
import { getPushOptOut } from "@/lib/push-notifications-opt-out"
import { isAppInstalled, isPhoneInstallTarget } from "@/lib/pwa-install"

export function PushNotificationsPrompt() {
  const { user, isHydrated, accessToken } = useAuth()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isHydrated || !user?.id || !accessToken) return
    if (getPushOptOut(user.id)) return
    if (!isPushSupported()) return
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return

    let cancelled = false
    void (async () => {
      const status = await getPushSubscriptionStatus()
      if (cancelled) return
      if (!status.enabled) return
      if (status.subscribed) return
      if (typeof Notification !== "undefined" && Notification.permission === "denied") return
      setVisible(true)
    })()

    return () => {
      cancelled = true
    }
  }, [isHydrated, user?.id, accessToken])

  const enable = useCallback(async () => {
    setBusy(true)
    try {
      const result = await subscribeToPushNotifications()
      if (result.ok) {
        toast.success("Notifications enabled", {
          description: "We'll alert you when today's picks are ready.",
        })
        setVisible(false)
        return
      }
      toast.error("Could not enable notifications", { description: result.reason })
    } finally {
      setBusy(false)
    }
  }, [])

  if (!visible) return null

  const stackAboveInstallBanner = !isAppInstalled() && isPhoneInstallTarget()
  const pushBannerBottom = stackAboveInstallBanner
    ? fixedBannerStackedTier2
    : fixedBannerAboveMobileNav

  const installedHint =
    isAppInstalled() || !isPhoneInstallTarget()
      ? null
      : " Add the app to your home screen for reliable alerts on your phone."

  return (
    <div
      role="region"
      aria-label="Enable notifications"
      className={cn("fixed inset-x-0 z-40 mx-auto max-w-lg px-3", pushBannerBottom)}
    >
      <div className="flex items-start gap-3 rounded-xl border border-[#E2D9CC] bg-[#FFF7F1] p-3 shadow-[0_8px_28px_-8px_rgba(47,74,22,0.12)] sm:p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#F97316]">
          <Bell className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-[#1F3A2B]">Get notified when picks are ready</p>
          <p className="mt-1 text-[12px] leading-snug text-[#1F3A2B]/65 sm:text-[13px]">
            Get a daily alert around 5 AM Eastern with Breakfast, Lunch, and Dinner titles from your fridge.
            {installedHint}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 bg-[#F97316] text-white hover:bg-[#F28C38]"
              disabled={busy}
              onClick={() => void enable()}
            >
              {busy ? "Enabling…" : "Enable notifications"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
              onClick={() => setVisible(false)}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#1F3A2B]/50 hover:bg-[#F7F3EB] hover:text-[#1F3A2B]"
          aria-label="Dismiss notification prompt"
          onClick={() => setVisible(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
