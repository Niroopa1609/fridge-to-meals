import { createHash, randomBytes } from "crypto"

export function generateRefreshTokenRaw(): string {
  return randomBytes(32).toString("base64url")
}

/** Match Spring AuthService.sha256Base64Url */
export function sha256Base64Url(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("base64url")
}
