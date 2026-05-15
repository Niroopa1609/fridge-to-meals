import { createAdminClient } from "@/lib/supabase/admin"
import { sendPasswordResetEmail } from "@/lib/server/mail"
import { generateRefreshTokenRaw, sha256Base64Url } from "@/lib/server/refresh-token"

const RESET_EXPIRES_MS = 60 * 60 * 1000

export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "If an account exists for this email, we'll send a password reset link."

function appBaseUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")
}

export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase()
  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("email", normalized)
    .maybeSingle()

  if (!user) return

  const rawToken = generateRefreshTokenRaw()
  const tokenHash = sha256Base64Url(rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + RESET_EXPIRES_MS)

  await supabase
    .from("password_reset_tokens")
    .update({ used_at: now.toISOString() })
    .eq("user_id", user.id)
    .is("used_at", null)
    .gt("expires_at", now.toISOString())

  const { error } = await supabase.from("password_reset_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    const missingTable =
      error.code === "PGRST205" ||
      String(error.message || "").includes("password_reset_tokens")
    console.error("[password-reset] failed to store token", error)
    if (missingTable) {
      console.error(
        "[password-reset] Run supabase/migrations/20250515120000_password_reset_tokens.sql in Supabase SQL Editor, or: node scripts/apply-password-reset-table.mjs"
      )
    }
    return
  }

  const resetUrl = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`
  try {
    await sendPasswordResetEmail(String(user.email), resetUrl, String(user.name))
    console.info("[password-reset] reset email sent to", user.email)
  } catch (e) {
    console.error("[password-reset] failed to send email", e)
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const raw = token.trim()
  if (!raw || newPassword.length < 8) return false

  const tokenHash = sha256Base64Url(raw)
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: row } = await supabase
    .from("password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (!row || row.used_at || row.expires_at <= now) return false

  const { hashPassword } = await import("@/lib/server/password")
  const password_hash = hashPassword(newPassword)

  const { error: userError } = await supabase.from("users").update({ password_hash }).eq("id", row.user_id)
  if (userError) return false

  await supabase.from("password_reset_tokens").update({ used_at: now }).eq("id", row.id)

  await supabase
    .from("refresh_tokens")
    .update({ revoked_at: now })
    .eq("user_id", row.user_id)
    .is("revoked_at", null)

  return true
}
