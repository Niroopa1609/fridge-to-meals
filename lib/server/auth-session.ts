import { createAdminClient } from "@/lib/supabase/admin"
import { signAccessToken } from "@/lib/server/jwt"
import { generateRefreshTokenRaw, sha256Base64Url } from "@/lib/server/refresh-token"

export type AuthUserOut = {
  id: string
  name: string
  email: string
  createdAt?: string
}

function refreshExpiresAtIso(): string {
  const days = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "30")
  return new Date(Date.now() + days * 86400000).toISOString()
}

export async function issueSession(
  userId: string,
  email: string,
  name: string,
  createdAtIso: string | undefined,
  meta: { userAgent: string | null; ip: string | null }
): Promise<{ accessToken: string; refreshToken: string; user: AuthUserOut }> {
  const supabase = createAdminClient()
  const accessToken = await signAccessToken({ sub: email, uid: userId, name })
  const refreshToken = generateRefreshTokenRaw()
  const tokenHash = sha256Base64Url(refreshToken)
  const now = new Date().toISOString()
  const { error } = await supabase.from("refresh_tokens").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    token_hash: tokenHash,
    created_at: now,
    expires_at: refreshExpiresAtIso(),
    last_used_at: now,
    user_agent: meta.userAgent,
    ip: meta.ip,
  })
  if (error) throw new Error(error.message)
  return {
    accessToken,
    refreshToken,
    user: { id: userId, name, email, createdAt: createdAtIso },
  }
}

export async function revokeRefreshToken(rawRefresh: string): Promise<void> {
  const supabase = createAdminClient()
  const hash = sha256Base64Url(rawRefresh.trim())
  const now = new Date().toISOString()
  const { data } = await supabase.from("refresh_tokens").select("id, revoked_at").eq("token_hash", hash).maybeSingle()
  if (!data?.id || data.revoked_at) return
  await supabase.from("refresh_tokens").update({ revoked_at: now }).eq("id", data.id)
}

export async function rotateRefreshToken(
  rawRefresh: string,
  meta: { userAgent: string | null; ip: string | null }
): Promise<{ accessToken: string; refreshToken: string; user: AuthUserOut } | null> {
  const supabase = createAdminClient()
  const hash = sha256Base64Url(rawRefresh.trim())
  const { data: row, error } = await supabase
    .from("refresh_tokens")
    .select("id, user_id, expires_at, revoked_at")
    .eq("token_hash", hash)
    .maybeSingle()
  if (error || !row) return null
  const now = Date.now()
  if (row.revoked_at) return null
  if (new Date(row.expires_at).getTime() <= now) return null

  const { data: userRow } = await supabase.from("users").select("id, email, name, created_at").eq("id", row.user_id).single()
  if (!userRow) return null

  const revokedAt = new Date().toISOString()
  await supabase
    .from("refresh_tokens")
    .update({ revoked_at: revokedAt, last_used_at: revokedAt })
    .eq("id", row.id)

  return issueSession(
    userRow.id,
    String(userRow.email),
    String(userRow.name),
    userRow.created_at ? String(userRow.created_at) : undefined,
    meta
  )
}
