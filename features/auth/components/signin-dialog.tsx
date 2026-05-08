"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"

export function SignInDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signIn({ email, password })
      onOpenChange(false)
      onSuccess?.()
      setPassword("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#E2D9CC] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#1F3A2B]">Sign In</DialogTitle>
          <DialogDescription className="text-[#1F3A2B]/60">
            Sign in to save recipes, track your fridge, and get daily meal picks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="border-[#E2D9CC] bg-white"
              type="email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F3A2B]">Password</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-[#E2D9CC] bg-white"
              type="password"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
              }}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-[#F97316]/30 bg-[#FDE9DD] px-3 py-2 text-sm text-[#EA6A12]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
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
              disabled={isLoading || email.trim().length === 0 || password.length === 0}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

