"use client"

import { useEffect, useState } from "react"
import { Home, LogOut, Menu, User } from "lucide-react"
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

function firstName(displayName: string) {
  const t = toTitleCaseName(displayName)
  const part = t.split(/\s+/)[0]
  return part || "there"
}

function BowlLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.12" />
      <path
        d="M20 8C17 13 14 15 12 20C10 25 11 32 20 38C29 32 30 25 28 20C26 15 23 13 20 8Z"
        fill="#F97316"
      />
      <path
        d="M14 22C15 24 17 26 20 26C23 26 25 24 26 22"
        stroke="#2F4A16"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type HeaderVariant = "default" | "recipe"

export function Header({ variant = "default" }: { variant?: HeaderVariant }) {
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

  if (variant === "recipe") {
    return (
      <header className="w-full overflow-x-hidden bg-[#2F4A16] text-white">
        <div className="mx-auto w-full max-w-[1440px] rounded-b-[1.75rem] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)] md:rounded-b-none md:shadow-none">
          <div className="flex flex-col gap-3 px-4 pb-5 pt-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-3 lg:px-10">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <button
                type="button"
                className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 md:mt-0"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" strokeWidth={2} />
              </button>
              <div className="flex min-w-0 items-start gap-3">
                <BowlLogo className="h-10 w-10 shrink-0 md:h-11 md:w-11" />
                <div className="min-w-0 space-y-0.5">
                  <h1 className="font-serif text-xl font-bold leading-tight tracking-wide md:text-2xl lg:text-[1.75rem]">
                    <Link href="/" className="text-white hover:text-white/95">
                      Fridge To Meals
                    </Link>
                  </h1>
                  <p className="text-xs font-medium leading-snug text-white/85 md:text-sm">
                    Smart meals from what you have ✨
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3 md:justify-end">
              {isHydrated && user ? (
                <>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="text-sm font-semibold text-white md:text-base">
                      Hi {firstName(user.name)} 👋
                    </p>
                    <span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white"
                      aria-hidden
                    >
                      <User className="h-5 w-5" strokeWidth={2} />
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 w-full gap-2 rounded-xl border-white/50 bg-transparent px-4 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto md:h-9"
                    onClick={async () => {
                      await logout()
                      router.push("/")
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                  <Button
                    variant="outline"
                    className="h-10 flex-1 rounded-xl border-white/55 bg-transparent text-sm font-semibold text-white hover:bg-white/10 sm:flex-none sm:px-5"
                    onClick={openSignInFromHeader}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="h-10 flex-1 rounded-xl border border-white/40 bg-white px-4 text-sm font-semibold text-[#2F4A16] hover:bg-white/90 sm:flex-none sm:px-5"
                    onClick={() => setIsSignUpOpen(true)}
                  >
                    Sign Up
                  </Button>
                </div>
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

  return (
    <header
      className="w-full overflow-x-hidden"
      style={{ background: "linear-gradient(to right, #3A4F16, #5C7A25)" }}
    >
      <div className="mx-auto grid min-h-[70px] w-full min-w-0 max-w-[1400px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-1 px-2 py-2 sm:gap-x-2 sm:px-3 md:h-[90px] md:gap-x-2 md:py-0 md:px-4 lg:px-8">
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

        <h1 className="min-w-0 justify-self-center text-center font-serif text-[15px] font-bold tracking-wide text-white drop-shadow-sm sm:text-lg md:text-4xl md:drop-shadow-none lg:text-[50px]">
          <Link href="/" className="inline-block max-w-full truncate px-0.5 font-bold">
            Fridge To Meals
          </Link>
        </h1>

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
