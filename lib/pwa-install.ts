export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
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
