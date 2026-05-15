const ENABLED_KEY = "ftm_remember_email_enabled"
const EMAIL_KEY = "ftm_remember_email"

export function readRememberedEmail(): { email: string; remember: boolean } {
  if (typeof window === "undefined") {
    return { email: "", remember: false }
  }
  const remember = localStorage.getItem(ENABLED_KEY) === "1"
  const email = remember ? (localStorage.getItem(EMAIL_KEY) ?? "").trim() : ""
  return { email, remember }
}

export function writeRememberedEmail(email: string, remember: boolean): void {
  if (typeof window === "undefined") return
  const normalized = email.trim().toLowerCase()
  if (remember && normalized) {
    localStorage.setItem(ENABLED_KEY, "1")
    localStorage.setItem(EMAIL_KEY, normalized)
  } else {
    localStorage.removeItem(ENABLED_KEY)
    localStorage.removeItem(EMAIL_KEY)
  }
}
