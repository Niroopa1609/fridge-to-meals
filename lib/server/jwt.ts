import * as jose from "jose"

export type AccessTokenPayload = {
  sub: string
  uid: string
  name: string
}

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET?.trim()
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 characters)")
  }
  return new TextEncoder().encode(s)
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const secret = getSecret()
  const minutes = Number(process.env.JWT_ACCESS_EXPIRES_MINUTES ?? "15")
  const exp = `${Math.max(5, minutes)}m`
  return new jose.SignJWT({ uid: payload.uid, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jose.jwtVerify(token, secret)
    const sub = typeof payload.sub === "string" ? payload.sub : ""
    const uid = typeof payload.uid === "string" ? payload.uid : ""
    const name = typeof payload.name === "string" ? payload.name : ""
    if (!sub || !uid) return null
    return { sub, uid, name }
  } catch {
    return null
  }
}
