"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"
import { requestPasswordReset } from "@/features/auth/services/auth"
import { RememberEmailCheckbox } from "@/features/auth/components/remember-email-checkbox"
import { readRememberedEmail, writeRememberedEmail } from "@/features/auth/remember-email"

const RESET_SUCCESS_MESSAGE =
  "If an account exists for this email, we'll send a password reset link."

type DialogView = "signin" | "forgot"

export function SignInDialog({
  open,
  onOpenChange,
  onSuccess,
  preface,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** Optional short message shown above the default description (e.g. why sign-in was prompted). */
  preface?: string | null
}) {
  const { signIn } = useAuth()
  const [view, setView] = useState<DialogView>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)
  const [rememberEmail, setRememberEmail] = useState(false)

  useEffect(() => {
    if (!open) {
      setView("signin")
      setError(null)
      setForgotSuccess(null)
      setIsLoading(false)
      return
    }
    const saved = readRememberedEmail()
    setRememberEmail(saved.remember)
    if (saved.email) setEmail(saved.email)
  }, [open])

  const handleRememberEmailChange = (checked: boolean) => {
    setRememberEmail(checked)
    writeRememberedEmail(email, checked)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (rememberEmail) writeRememberedEmail(value, true)
  }

  const submitSignIn = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signIn({ email, password })
      writeRememberedEmail(email, rememberEmail)
      onOpenChange(false)
      onSuccess?.()
      setPassword("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const submitForgotPassword = async () => {
    setError(null)
    setForgotSuccess(null)
    setIsLoading(true)
    try {
      const res = await requestPasswordReset(email)
      setForgotSuccess(res.message || RESET_SUCCESS_MESSAGE)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E2D9CC] bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#1F3A2B]">
            {view === "signin" ? "Sign In" : "Forgot Password"}
          </DialogTitle>
          {view === "signin" ? (
            preface ? (
              <DialogDescription className="text-sm font-medium text-[#1F3A2B]">{preface}</DialogDescription>
            ) : (
              <DialogDescription className="text-[#1F3A2B]/60">
                Sign in to save recipes, track your fridge, and get daily meal picks.
              </DialogDescription>
            )
          ) : (
            <DialogDescription className="text-[#1F3A2B]/60">
              Enter your email and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          )}
        </DialogHeader>

        {view === "signin" ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F3A2B]">Email</label>
              <Input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="user@example.com"
                className="border-[#E2D9CC] bg-white placeholder:text-[#1F3A2B]/35"
                type="email"
                autoComplete="email"
              />
              <RememberEmailCheckbox
                id="signin-remember-email"
                checked={rememberEmail}
                onCheckedChange={handleRememberEmailChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F3A2B]">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-[#E2D9CC] bg-white placeholder:text-[#1F3A2B]/35"
                type="password"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitSignIn()
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setView("forgot")
                  setError(null)
                  setForgotSuccess(null)
                }}
                className="text-xs font-medium text-[#F97316] underline-offset-2 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-[#F97316]/30 bg-[#FDE9DD] px-3 py-2 text-sm text-[#EA6A12]">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="outline"
                className="w-full border-[#E2D9CC] text-[#1F3A2B] sm:w-auto"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="w-full bg-[#F97316] text-white hover:bg-[#F28C38] sm:w-auto"
                onClick={() => void submitSignIn()}
                disabled={isLoading || email.trim().length === 0 || password.length === 0}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F3A2B]">Email</label>
              <Input
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="user@example.com"
                className="border-[#E2D9CC] bg-white placeholder:text-[#1F3A2B]/35"
                type="email"
                autoComplete="email"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitForgotPassword()
                }}
              />
            </div>

            {forgotSuccess ? (
              <div className="rounded-lg border border-[#4F6B1F]/25 bg-[#E8F4DC] px-3 py-2 text-sm text-[#2E5B12]">
                {forgotSuccess}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-[#F97316]/30 bg-[#FDE9DD] px-3 py-2 text-sm text-[#EA6A12]">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setView("signin")
                  setError(null)
                  setForgotSuccess(null)
                }}
                className="text-left text-xs font-medium text-[#F97316] underline-offset-2 hover:underline"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="w-full border-[#E2D9CC] text-[#1F3A2B] sm:w-auto"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full bg-[#2E5B12] text-white hover:bg-[#234A0F] sm:w-auto"
                  onClick={() => void submitForgotPassword()}
                  disabled={isLoading || email.trim().length === 0 || Boolean(forgotSuccess)}
                >
                  {isLoading ? "Sending…" : "Send Reset Link"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
