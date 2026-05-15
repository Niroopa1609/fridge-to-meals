import nodemailer from "nodemailer"
import { toTitleCaseWords } from "@/lib/server/name-normalize"

function mailConfigured(): boolean {
  return Boolean(process.env.MAIL_HOST?.trim() && process.env.MAIL_USERNAME?.trim())
}

function createTransporter() {
  if (!mailConfigured()) return null
  const host = process.env.MAIL_HOST!.trim()
  const port = Number(process.env.MAIL_PORT || "587")
  const user = process.env.MAIL_USERNAME!.trim()
  const pass = process.env.MAIL_PASSWORD ?? ""
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function normalizeDisplayName(displayName: string): string {
  const normalized = toTitleCaseWords(displayName)
  return normalized.trim() || "there"
}

function fromAddress(): { name: string; address: string } {
  return { name: "Fridge To Meals", address: process.env.MAIL_USERNAME!.trim() }
}

export async function sendWelcomeEmail(toEmail: string, displayName: string): Promise<void> {
  if (!toEmail.trim()) {
    console.warn("[mail] Welcome email not sent (recipient email is blank).")
    return
  }
  if (!mailConfigured()) {
    console.warn(
      "[mail] Welcome email not sent (MAIL_HOST / MAIL_USERNAME unset). Intended recipient:",
      toEmail
    )
    return
  }

  const transporter = createTransporter()
  if (!transporter) return

  const fullName = normalizeDisplayName(displayName)
  const body = `Hi ${fullName},

You're all set with Fridge To meals.

Busy life. Meals decided.

Keep your fridge updated, and we'll recommend recipes instantly—no thinking required.

Save, cook, and enjoy.

Best regards,
Fridge To Meals team`

  await transporter.sendMail({
    from: fromAddress(),
    to: toEmail,
    subject: "You're all set with Fridge To Meals",
    text: body,
  })
  console.info("[mail] Welcome email sent to", toEmail)
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string, displayName: string): Promise<void> {
  if (!toEmail.trim()) return
  if (!mailConfigured()) {
    console.warn(
      "[mail] Password reset email not sent (MAIL_HOST / MAIL_USERNAME unset). Intended recipient:",
      toEmail,
      "Reset URL:",
      resetUrl
    )
    return
  }

  const transporter = createTransporter()
  if (!transporter) return

  const name = normalizeDisplayName(displayName)
  const body = `Hi ${name},

We received a request to reset your Fridge To Meals password.

Reset your password using this link (valid for 1 hour):
${resetUrl}

If you did not request this, you can ignore this email.

Best regards,
Fridge To Meals`

  await transporter.sendMail({
    from: { name: "Fridge To Meals", address: process.env.MAIL_USERNAME!.trim() },
    to: toEmail,
    subject: "Reset your Fridge To Meals password",
    text: body,
  })
  console.info("[mail] Password reset email sent to", toEmail)
}
