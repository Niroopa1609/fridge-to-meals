"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { fixedBannerAboveMobileNav } from "@/lib/fixed-banner-layout"
import { PwaInstallHelpDialog } from "@/components/pwa-install-help-dialog"
import {
  getPhoneInstallPlatform,
  isBeforeInstallPromptEvent,
  isPhoneInstallTarget,
  markPwaInstalled,
  shouldHidePwaInstallBanner,
  type BeforeInstallPromptEvent,
  type PhoneInstallPlatform,
} from "@/lib/pwa-install"

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [installHelpPlatform, setInstallHelpPlatform] = useState<PhoneInstallPlatform | null>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (!isPhoneInstallTarget()) return

    let cancelled = false

    void (async () => {
      if (await shouldHidePwaInstallBanner()) return
      if (cancelled) return
      setVisible(true)
    })()

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      if (isBeforeInstallPromptEvent(e)) {
        setInstallPrompt(e)
      }
    }

    const onInstalled = () => {
      markPwaInstalled()
      setVisible(false)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      cancelled = true
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    setInstallHelpPlatform(null)
  }, [])

  const runInstall = useCallback(async () => {
    const platform = getPhoneInstallPlatform()

    if (platform === "ios") {
      setInstallHelpPlatform("ios")
      return
    }

    if (installPrompt) {
      setInstalling(true)
      try {
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        setInstallPrompt(null)
        if (outcome === "accepted") {
          markPwaInstalled()
          setVisible(false)
        }
      } catch {
        /* user dismissed native prompt */
      } finally {
        setInstalling(false)
      }
      return
    }

    if (platform === "android") {
      setInstallHelpPlatform("android")
    }
  }, [installPrompt])

  if (!visible) return null

  return (
    <>
      <div
        role="region"
        aria-label="Install app"
        className={cn(
          "fixed inset-x-0 z-40 mx-auto max-w-lg px-3",
          fixedBannerAboveMobileNav
        )}
      >
        <div className="flex items-start gap-3 rounded-xl border border-[#E2D9CC] bg-white p-3 shadow-[0_8px_28px_-8px_rgba(47,74,22,0.18)] sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF7F1] text-[#F97316]">
            <Smartphone className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-[#1F3A2B]">Add to your home screen</p>
            <p className="mt-1 text-[12px] leading-snug text-[#1F3A2B]/65 sm:text-[13px]">
              Get today&apos;s meal picks each morning.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="h-9 bg-[#F97316] text-white hover:bg-[#F28C38]"
                disabled={installing}
                onClick={() => void runInstall()}
              >
                <Bell className="mr-1.5 h-4 w-4" aria-hidden />
                {installing ? "Installing…" : "Install app"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
                onClick={close}
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#1F3A2B]/50 hover:bg-[#F7F3EB] hover:text-[#1F3A2B]"
            aria-label="Dismiss install suggestion"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PwaInstallHelpDialog
        platform={installHelpPlatform}
        onClose={() => setInstallHelpPlatform(null)}
      />
    </>
  )
}
