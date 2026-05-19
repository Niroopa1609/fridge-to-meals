const PREF_KEY = "ftm_remember_device"

/** User preference for the sign-in checkbox (defaults to true). */
export function readRememberDevicePreference(): boolean {
  if (typeof window === "undefined") return true
  const v = localStorage.getItem(PREF_KEY)
  if (v === null) return true
  return v === "1"
}

export function writeRememberDevicePreference(remember: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PREF_KEY, remember ? "1" : "0")
}
