import { NextResponse } from "next/server"
import { PASSWORD_RESET_SUCCESS_MESSAGE, requestPasswordReset } from "@/lib/server/password-reset"

export const runtime = "nodejs"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string }
    const email = normalizeEmail(body.email || "")
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 })
    }

    await requestPasswordReset(email)

    return NextResponse.json({ message: PASSWORD_RESET_SUCCESS_MESSAGE })
  } catch (e) {
    console.error("[forgot-password]", e)
    return NextResponse.json({ message: PASSWORD_RESET_SUCCESS_MESSAGE })
  }
}
