const OPT_OUT_PREFIX = "fridge-to-meals.todaysPickPushOptOut."

export function getPushOptOut(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false
  return window.localStorage.getItem(`${OPT_OUT_PREFIX}${userId}`) === "1"
}

export function setPushOptOut(userId: string, optedOut: boolean): void {
  if (typeof window === "undefined" || !userId) return
  const key = `${OPT_OUT_PREFIX}${userId}`
  if (optedOut) window.localStorage.setItem(key, "1")
  else window.localStorage.removeItem(key)
}

export function notifyPushSubscriptionChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("todays-pick-notifications-changed"))
}

export const TODAYS_PICK_NOTIFICATIONS_COPY = {
  title: "Today's-Pick notifications",
  description:
    "Daily alert with Breakfast, Lunch, and Dinner ideas from your fridge.",
  enabledLabel: "Enabled",
  disabledLabel: "Disabled",
  blockedLabel: "Blocked",
  enabledToast: "Today's-Pick notifications enabled.",
  enabledToastDetail: "You'll get a daily alert with your meal ideas.",
  disabledToast: "Today's-Pick notifications turned off.",
  blockedHint:
    "Notifications are blocked in your browser. Allow notifications in browser settings, then turn this on again.",
  unsupportedHint: "Not supported in this browser.",
  notConfiguredHint: "Not available on this server right now.",
  } as const
