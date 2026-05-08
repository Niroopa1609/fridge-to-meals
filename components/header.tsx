"use client"

import { useEffect, useState } from "react"
import { Home, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"
import { SignInDialog } from "@/features/auth/components/signin-dialog"
import { SignUpDialog } from "@/features/auth/components/signup-dialog"

function toTitleCaseName(name: string) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export function Header() {
  const router = useRouter()
  const { user, logout, isHydrated } = useAuth()
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)

  useEffect(() => {
    const handler = () => setIsSignInOpen(true)
    window.addEventListener("auth:signin", handler as EventListener)
    return () => window.removeEventListener("auth:signin", handler as EventListener)
  }, [])

  return (
    <header 
      className="w-full"
      style={{ background: 'linear-gradient(to right, #3A4F16, #5C7A25)' }}
    >
      <div className="mx-auto grid h-[70px] max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-4 md:h-[90px] lg:px-8">
        {/* Left - Logo and tagline */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10 md:h-10 md:w-10"
            aria-label="Home"
          >
            <Home className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
          </button>
          <div className="hidden font-serif text-[17px] leading-[1.1] text-white md:block">
            <div className="font-medium">Busy life.</div>
            <div className="font-medium">Meals decided.</div>
          </div>
        </div>

        {/* Center - Title */}
        <h1 className="font-serif text-xl font-semibold tracking-wide text-white md:text-4xl lg:text-[44px]">
          <Link href="/" className="inline-block">
            Fridge To Meals
          </Link>
        </h1>

        {/* Right - Auth buttons (desktop) / Menu (mobile) */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden items-center gap-3 md:flex">
            {isHydrated && user ? (
              <div className="flex flex-col items-center">
                <Button
                  variant="outline"
                  className="h-9 rounded-md border border-white/60 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/10 md:h-10"
                  onClick={async () => {
                    await logout()
                    router.push("/")
                  }}
                >
                  Logout
                </Button>
                <p className="mt-1 font-serif text-[15px] font-semibold tracking-wide text-white/95">
                  Hi {toTitleCaseName(user.name)}
                </p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-9 rounded-md border border-white/60 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/10 md:h-10"
                  onClick={() => setIsSignInOpen(true)}
                >
                  Sign In
                </Button>
                <Button
                  className="h-9 rounded-md border border-white/60 bg-white px-5 text-sm font-semibold text-[#3A4F16] hover:bg-white/90 md:h-10"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>

      <SignInDialog open={isSignInOpen} onOpenChange={setIsSignInOpen} />
      <SignUpDialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </header>
  )
}
