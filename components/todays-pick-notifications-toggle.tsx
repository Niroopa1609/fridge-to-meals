"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  getTodaysPickNotificationSettingState,
  isPushSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  type TodaysPickNotificationSettingState,
} from "@/lib/push-client"
import {
  setPushOptOut,
  TODAYS_PICK_NOTIFICATIONS_COPY,
} from "@/lib/push-notifications-opt-out"

type Props = {
  userId: string
  className?: string
}

export function TodaysPickNotificationsToggle({ userId, className }: Props) {
  const [state, setState] = useState<TodaysPickNotificationSettingState>("loading")
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setState(await getTodaysPickNotificationSettingState())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onChanged = () => void refresh()
    window.addEventListener("todays-pick-notifications-changed", onChanged)
    return () => window.removeEventListener("todays-pick-notifications-changed", onChanged)
  }, [refresh])

  if (!isPushSupported()) {
    return (
      <p className={cn("text-sm text-[#1F3A2B]/65", className)}>
        {TODAYS_PICK_NOTIFICATIONS_COPY.unsupportedHint}
      </p>
    )
  }

  const switchOn = state === "on"
  const switchDisabled =
    busy || state === "loading" || state === "blocked" || state === "not_configured"

  const statusLabel =
    state === "on"
      ? TODAYS_PICK_NOTIFICATIONS_COPY.enabledLabel
      : state === "blocked"
        ? TODAYS_PICK_NOTIFICATIONS_COPY.blockedLabel
        : TODAYS_PICK_NOTIFICATIONS_COPY.disabledLabel

  const onToggle = async (checked: boolean) => {
    if (state === "blocked" || state === "not_configured" || state === "loading") return

    setBusy(true)
    try {
      if (checked) {
        const result = await subscribeToPushNotifications()
        if (!result.ok) {
          toast.error("Could not enable notifications", { description: result.reason })
          await refresh()
          return
        }
        setPushOptOut(userId, false)
        toast.success(TODAYS_PICK_NOTIFICATIONS_COPY.enabledToast, {
          description: TODAYS_PICK_NOTIFICATIONS_COPY.enabledToastDetail,
        })
        setState("on")
      } else {
        await unsubscribeFromPushNotifications()
        setPushOptOut(userId, true)
        toast.success(TODAYS_PICK_NOTIFICATIONS_COPY.disabledToast)
        setState("off")
      }
    } finally {
      setBusy(false)
    }
  }

  let hint: string | null = null
  if (state === "blocked") hint = TODAYS_PICK_NOTIFICATIONS_COPY.blockedHint
  else if (state === "not_configured") hint = TODAYS_PICK_NOTIFICATIONS_COPY.notConfiguredHint
  else if (state === "off") hint = "Turn on to get morning meal ideas from your fridge."

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1F3A2B]">
            {TODAYS_PICK_NOTIFICATIONS_COPY.title}
          </p>
          <p className="mt-1 text-sm text-[#1F3A2B]/65">
            {TODAYS_PICK_NOTIFICATIONS_COPY.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={cn(
              "text-xs font-medium",
              state === "on" ? "text-[#4F6B1F]" : state === "blocked" ? "text-[#EA6A12]" : "text-[#1F3A2B]/55"
            )}
          >
            {state === "loading" ? "…" : statusLabel}
          </span>
          <Switch
            checked={switchOn}
            disabled={switchDisabled}
            onCheckedChange={(v) => void onToggle(v === true)}
            aria-label={`${TODAYS_PICK_NOTIFICATIONS_COPY.title} ${statusLabel}`}
            className="data-[state=checked]:bg-[#F97316]"
          />
        </div>
      </div>
      {hint ? (
        <p
          className={cn(
            "text-xs leading-snug",
            state === "blocked" ? "text-[#EA6A12]" : "text-[#1F3A2B]/55"
          )}
        >
          {hint}
        </p>
      ) : null}
      <p className="text-xs text-[#1F3A2B]/45">{TODAYS_PICK_NOTIFICATIONS_COPY.optionalNote}</p>
    </div>
  )
}
