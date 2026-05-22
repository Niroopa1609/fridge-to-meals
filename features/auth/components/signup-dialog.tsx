"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckIcon, CircleIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/features/auth/context/auth-context"
import { isPushSupported, subscribeToPushNotifications } from "@/lib/push-client"

function isValidEmail(value: string) {
  const t = value.trim()
  if (!t) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

export function SignUpDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [enableTodaysPickNotifications, setEnableTodaysPickNotifications] = useState(true)
  const pushAvailable = isPushSupported()

  const submit = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signUp({ name, email, password })

      if (enableTodaysPickNotifications && pushAvailable) {
        const pushResult = await subscribeToPushNotifications()
        if (pushResult.ok) {
          toast.success("Today's-Pick notifications enabled.", {
            description: "You'll get a daily alert around 5 AM Eastern with your meal ideas.",
          })
        } else {
          toast.message("Account created", {
            description: pushResult.reason,
          })
        }
      } else {
        toast.success("Welcome to Fridge To Meals! Your account is ready.")
      }

      onOpenChange(false)
      onSuccess?.()
      setPassword("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  const emailOk = isValidEmail(email)
  const passwordLengthOk = password.length >= 8
  const createAccountDisabled =
    isLoading ||
    name.trim().length === 0 ||
    !emailOk ||
    !passwordLengthOk

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#E2D9CC] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#1F3A2B]">Sign Up</DialogTitle>
          <DialogDescription className="text-[#1F3A2B]/60">
            Sign up to keep recipes handy & track your fridge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User Name"
              className="border-[#E2D9CC] bg-white"
              type="text"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="border-[#E2D9CC] bg-white"
              type="email"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border-[#E2D9CC] bg-white"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
            />
            <ul className="mt-1.5 space-y-1" aria-live="polite">
              <li className="flex items-center gap-2 text-sm">
                {passwordLengthOk ? (
                  <CheckIcon className="size-4 shrink-0 text-[#4F6B1F]" aria-hidden />
                ) : (
                  <CircleIcon className="size-4 shrink-0 text-[#1F3A2B]/35" aria-hidden />
                )}
                <span
                  className={
                    passwordLengthOk ? "text-[#4F6B1F]" : "text-[#1F3A2B]/60"
                  }
                >
                  At least 8 characters
                </span>
              </li>
            </ul>
          </div>

          {pushAvailable ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E2D9CC] bg-[#FBF8F2] px-3 py-3">
              <Checkbox
                checked={enableTodaysPickNotifications}
                onCheckedChange={(v) => setEnableTodaysPickNotifications(v === true)}
                disabled={isLoading}
                className="mt-0.5 border-[#E2D9CC] data-[state=checked]:border-[#F97316] data-[state=checked]:bg-[#F97316]"
              />
              <span className="text-sm leading-snug text-[#1F3A2B]">
                <span className="font-medium">Enable Today&apos;s-Pick notifications</span>
                <span className="mt-1 block text-[#1F3A2B]/60">
                  Every morning alert with Breakfast, Lunch, and Dinner ideas from your fridge.
                </span>
              </span>
            </label>
          ) : null}

          {error && (
            <div className="rounded-lg border border-[#F97316]/30 bg-[#FDE9DD] px-3 py-2 text-sm text-[#EA6A12]">
              {error}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                className="border-[#E2D9CC] text-[#1F3A2B]"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#F97316] text-white hover:bg-[#F28C38]"
                onClick={submit}
                disabled={createAccountDisabled}
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </div>
            {createAccountDisabled && !isLoading && (
              <p className="text-right text-xs text-[#1F3A2B]/60">
                Enter a valid email and password to continue.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

