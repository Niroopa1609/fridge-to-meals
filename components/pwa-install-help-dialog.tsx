"use client"

import { MoreVertical, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PhoneInstallPlatform } from "@/lib/pwa-install"

type PwaInstallHelpDialogProps = {
  platform: PhoneInstallPlatform | null
  onClose: () => void
}

function HelpIntro({ platform }: { platform: PhoneInstallPlatform }) {
  if (platform === "ios") {
    return (
      <p className="text-sm text-[#1F3A2B]/65">
        On iPhone or iPad, install from Safari so we can send morning alerts when your picks are ready.
      </p>
    )
  }
  return (
    <p className="text-sm text-[#1F3A2B]/65">
      On Android, install from Chrome (or your browser menu) for home-screen access and reliable morning
      alerts.
    </p>
  )
}

function HelpSteps({ platform }: { platform: PhoneInstallPlatform }) {
  if (platform === "ios") {
    return (
      <ol className="list-decimal space-y-3 pl-5 text-sm text-[#1F3A2B]/80">
        <li className="pl-1">
          Tap the <Share className="inline h-4 w-4 align-text-bottom" aria-hidden /> Share button in
          Safari.
        </li>
        <li className="pl-1">
          Scroll and tap <span className="font-semibold">Add to Home Screen</span>.
        </li>
        <li className="pl-1">
          Tap <span className="font-semibold">Add</span>, then open Fridge To Meals from your home screen.
        </li>
      </ol>
    )
  }

  return (
    <ol className="list-decimal space-y-3 pl-5 text-sm text-[#1F3A2B]/80">
      <li className="pl-1">
        Tap the <MoreVertical className="inline h-4 w-4 align-text-bottom" aria-hidden /> menu (three
        dots) in Chrome.
      </li>
      <li className="pl-1">
        Tap <span className="font-semibold">Install app</span> or{" "}
        <span className="font-semibold">Add to Home screen</span>.
      </li>
      <li className="pl-1">
        Confirm, then open Fridge To Meals from your home screen or app drawer.
      </li>
    </ol>
  )
}

export function PwaInstallHelpDialog({ platform, onClose }: PwaInstallHelpDialogProps) {
  return (
    <Dialog open={platform != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#E2D9CC] bg-[#FAF7F0] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#1F3A2B]">Add to Home Screen</DialogTitle>
          {platform ? <HelpIntro platform={platform} /> : null}
        </DialogHeader>
        {platform ? <HelpSteps platform={platform} /> : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-[#E2D9CC] text-[#1F3A2B] hover:bg-[#F7F3EB]"
            onClick={onClose}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
