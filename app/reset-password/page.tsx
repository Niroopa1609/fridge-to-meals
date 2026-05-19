"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(null)
    setSuccess(null)
    if (!token) {
      setError("This reset link is invalid or incomplete.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null
      if (!res.ok) {
        throw new Error(body?.error || "Password reset failed.")
      }
      setSuccess(body?.message || "Your password has been updated. You can sign in now.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Password reset failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-[#E2D9CC] bg-white p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-[#1F3A2B]">Reset Password</h1>
        <p className="mt-2 text-sm text-[#1F3A2B]/65">Choose a new password for your account.</p>

        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">New password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#E2D9CC] bg-white"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Confirm password</label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border-[#E2D9CC] bg-white"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit()
              }}
            />
          </div>

          {success ? (
            <div className="rounded-lg border border-[#4F6B1F]/25 bg-[#E8F4DC] px-3 py-2 text-sm text-[#2E5B12]">
              {success}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-[#F97316]/30 bg-[#FDE9DD] px-3 py-2 text-sm text-[#EA6A12]">
              {error}
            </div>
          ) : null}

          <Button
            className="w-full bg-[#2E5B12] text-white hover:bg-[#234A0F]"
            onClick={() => void submit()}
            disabled={loading || Boolean(success)}
          >
            {loading ? "Updating…" : "Update Password"}
          </Button>

          <p className="text-center text-sm">
            <Link href="/" className="font-medium text-[#F97316] hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[#1F3A2B]/60">
          Loading…
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
