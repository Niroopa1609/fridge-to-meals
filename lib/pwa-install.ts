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

const PWA_INSTALLED_STORAGE_KEY = "fridge-to-meals.pwaInstalled"

/** Persist after install so the banner stays hidden in the browser tab too. */
export function markPwaInstalled(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, "1")
  } catch {
    /* private mode / blocked storage */
  }
}

export function hasMarkedPwaInstalled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/** Chromium: detect installed PWA when user opens the site in a normal tab. */
export async function hasRelatedPwaInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const nav = navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<{ id?: string; platform?: string }[]>
  }
  if (typeof nav.getInstalledRelatedApps !== "function") return false
  try {
    const apps = await nav.getInstalledRelatedApps()
    return apps.length > 0
  } catch {
    return false
  }
}

/** Hide install UI when running as PWA, after install, or related app already on device. */
export async function shouldHidePwaInstallBanner(): Promise<boolean> {
  if (isAppInstalled()) return true
  if (hasMarkedPwaInstalled()) return true
  if (await hasRelatedPwaInstalled()) {
    markPwaInstalled()
    return true
  }
  return false
}

/** Install banner + step-by-step help only on phones (not desktop browsers). */
export async function shouldShowPwaInstallBanner(): Promise<boolean> {
  if (typeof window === "undefined") return false
  if (!isPhoneInstallTarget()) return false
  if (await shouldHidePwaInstallBanner()) return false
  return true
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
