import type { SignInPayload, SignInResponse, SignUpPayload } from "@/features/auth/types"
import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"

export async function signUp(payload: SignUpPayload): Promise<SignInResponse> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    requestId,
    safeLogFields: { action: "signup", email: payload.email },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Signup failed: ${res.status}`)
  }
  return (await res.json()) as SignInResponse
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    requestId,
    safeLogFields: { action: "login", email: payload.email },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Signin failed: ${res.status}`)
  }
  return (await res.json()) as SignInResponse
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    requestId,
    safeLogFields: { action: "forgot_password" },
  })
  const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
  if (!res.ok) {
    throw new Error(body?.error || "Could not send reset link.")
  }
  return {
    message: body?.message || "If an account exists for this email, we'll send a password reset link.",
  }
}
