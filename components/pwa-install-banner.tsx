"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Share, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { isAppInstalled, isBeforeInstallPromptEvent, isIosDevice } from "@/lib/pwa-install"
import type { BeforeInstallPromptEvent } from "@/lib/pwa-install"

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [iosHelpOpen, setIosHelpOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Drop legacy key from earlier builds that hid the banner permanently after dismiss.
    try {
      localStorage.removeItem("fridgeToMeals.pwaInstallDismissed")
    } catch {
      /* ignore */
    }

    if (isAppInstalled()) return

    setVisible(true)

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      if (isBeforeInstallPromptEvent(e)) {
        setInstallPrompt(e)
      }
    }

    const onInstalled = () => setVisible(false)

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    setIosHelpOpen(false)
  }, [])

  const runInstall = useCallback(async () => {
    if (isIosDevice()) {
      setIosHelpOpen(true)
      return
    }
    if (!installPrompt) {
      setIosHelpOpen(true)
      return
    }
    setInstalling(true)
    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
    } catch {
      /* user dismissed native prompt */
    } finally {
      setInstalling(false)
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
          "bottom-[5.25rem] sm:bottom-4"
        )}
      >
        <div className="flex items-start gap-3 rounded-xl border border-[#E2D9CC] bg-white p-3 shadow-[0_8px_28px_-8px_rgba(47,74,22,0.18)] sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF7F1] text-[#F97316]">
            <Smartphone className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-[#1F3A2B]">Add to your home screen</p>
            <p className="mt-1 text-[12px] leading-snug text-[#1F3A2B]/65 sm:text-[13px]">
              We&apos;ll notify you when today&apos;s picks are ready. Open the app from your home screen for
              the best experience.
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

      <Dialog open={iosHelpOpen} onOpenChange={setIosHelpOpen}>
        <DialogContent className="border-[#E2D9CC] bg-[#FAF7F0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#1F3A2B]">Add to Home Screen</DialogTitle>
            <p className="text-sm text-[#1F3A2B]/65">
              On iPhone or iPad, install from Safari so we can send morning alerts when your picks are ready.
            </p>
          </DialogHeader>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-[#1F3A2B]/80">
            <li className="pl-1">
              Tap the <Share className="inline h-4 w-4 align-text-bottom" aria-hidden /> Share button in Safari
              (bottom of the screen).
            </li>
            <li className="pl-1">Scroll and tap <span className="font-semibold">Add to Home Screen</span>.</li>
            <li className="pl-1">
              Tap <span className="font-semibold">Add</span>, then open Fridge To Meals from your home screen.
            </li>
          </ol>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
              onClick={() => setIosHelpOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
