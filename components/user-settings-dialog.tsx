"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TodaysPickNotificationsToggle } from "@/components/todays-pick-notifications-toggle"

type UserSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
}

export function UserSettingsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E2D9CC] bg-[#FAF7F0] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#1F3A2B]">Settings</DialogTitle>
          <p className="text-sm text-[#1F3A2B]/65">Account settings for {userName}</p>
        </DialogHeader>
        <div className="rounded-lg border border-[#E2D9CC] bg-white p-4">
          <TodaysPickNotificationsToggle userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
