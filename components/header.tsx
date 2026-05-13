"use client"

import { useEffect, useState } from "react"
import { Home } from "lucide-react"
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
  const [signInPreface, setSignInPreface] = useState<string | null>(null)

  const openSignInFromHeader = () => {
    setSignInPreface(null)
    setIsSignInOpen(true)
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message
      setSignInPreface(msg?.trim() ? msg!.trim() : null)
      setIsSignInOpen(true)
    }
    window.addEventListener("auth:signin", handler as EventListener)
    return () => window.removeEventListener("auth:signin", handler as EventListener)
  }, [])

  return (
    <header
      className="w-full overflow-x-hidden"
      style={{ background: "linear-gradient(to right, #3A4F16, #5C7A25)" }}
    >
      <div className="mx-auto grid min-h-[70px] w-full min-w-0 max-w-[1400px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-1 px-2 py-2 sm:gap-x-2 sm:px-3 md:h-[90px] md:gap-x-2 md:py-0 md:px-4 lg:px-8">
        {/* Left - Home + tagline (mobile + desktop) */}
        <div className="flex min-w-0 justify-self-start items-center gap-0.5 md:gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10 md:h-10 md:w-10"
            aria-label="Home"
          >
            <Home className="h-4 w-4 md:h-6 md:w-6" strokeWidth={2} />
          </button>
          <div className="min-w-0 text-[10px] font-medium leading-tight text-white/90 md:font-serif md:text-[15px] md:leading-[1.1] md:text-white">
            <div>Busy life.</div>
            <div>Meals decided.</div>
          </div>
        </div>

        {/* Center - Title (true horizontal center: equal 1fr side columns) */}
        <h1 className="min-w-0 justify-self-center text-center font-serif text-[15px] font-bold tracking-wide text-white drop-shadow-sm sm:text-lg md:text-4xl md:drop-shadow-none lg:text-[50px]">
          <Link href="/" className="inline-block max-w-full truncate px-0.5 font-bold">
            Fridge To Meals
          </Link>
        </h1>

        {/* Right - Auth */}
        <div className="flex min-w-0 justify-end justify-self-end">
          <div className="flex flex-col items-center justify-center gap-1 md:hidden">
            {isHydrated && user ? (
              <>
                <Button
                  variant="outline"
                  className="h-7 rounded-md border border-white/60 bg-transparent px-2.5 text-xs font-medium text-white hover:bg-white/10"
                  onClick={async () => {
                    await logout()
                    router.push("/")
                  }}
                >
                  Logout
                </Button>
                <p className="w-full max-w-[7rem] truncate text-center text-[10px] font-semibold leading-tight text-white/95 sm:max-w-[9rem] sm:text-xs">
                  Hi {toTitleCaseName(user.name)}
                </p>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-7 rounded-md border border-white/60 bg-transparent px-2.5 text-xs font-medium text-white hover:bg-white/10"
                  onClick={openSignInFromHeader}
                >
                  Sign In
                </Button>
                <Button
                  className="h-7 rounded-md border border-white/60 bg-white px-2.5 text-xs font-semibold text-[#3A4F16] hover:bg-white/90"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

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
                  onClick={openSignInFromHeader}
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
        </div>
      </div>

      <SignInDialog
        open={isSignInOpen}
        onOpenChange={(open) => {
          setIsSignInOpen(open)
          if (!open) setSignInPreface(null)
        }}
        preface={signInPreface}
      />
      <SignUpDialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </header>
  )
}
