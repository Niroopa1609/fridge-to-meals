/** Platforms that use manual “Add to Home Screen” instructions. */
export type PhoneInstallPlatform = "ios" | "android"

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return true
  // iPadOS 13+ desktop mode reports as Mac; treat touch Mac as iPad.
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true
  return false
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /android/i.test(navigator.userAgent)
}

export function isPhoneInstallTarget(): boolean {
  return isIosDevice() || isAndroidDevice()
}

export function getPhoneInstallPlatform(): PhoneInstallPlatform | null {
  if (isIosDevice()) return "ios"
  if (isAndroidDevice()) return "android"
  return null
}

/** Install banner + step-by-step help only on phones (not desktop browsers). */
export function shouldShowPwaInstallBanner(): boolean {
  if (typeof window === "undefined") return false
  if (isAppInstalled()) return false
  return isPhoneInstallTarget()
}

/** True when running as an installed PWA (home screen). */
export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true
  const nav = navigator as Navigator & { standalone?: boolean }
  if (nav.standalone === true) return true
  return false
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function isBeforeInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return "prompt" in e && typeof (e as BeforeInstallPromptEvent).prompt === "function"
}
