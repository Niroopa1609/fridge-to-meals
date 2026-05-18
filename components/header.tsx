"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/auth-context"
import { SignInDialog } from "@/features/auth/components/signin-dialog"
import { SignUpDialog } from "@/features/auth/components/signup-dialog"
import { cn } from "@/lib/utils"

/** “To” uses brand orange (image 2). On green header bars, Fridge + Meals stay white like before for contrast; use tone onLight + #1F3A2B on a cream/white strip if needed later. */
const BRAND_ORANGE = "#F97316"

function IllustrationHomeLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/70",
        className
      )}
    >
      <span className="sr-only">Fridge To Meals — home</span>
      <Image
        src="/brand/fridge-meals-illustration.png"
        alt=""
        width={140}
        height={100}
        className="h-9 w-auto max-h-10 object-contain object-left sm:h-10 sm:max-h-11 md:h-11"
        priority
        unoptimized
      />
    </Link>
  )
}

/** Solid teardrop leaf — replaces the dot on dotless “ı” (tilted slightly clockwise). */
function LeafForIDot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g transform="rotate(40 6 7)">
        <path
           d="M6 1.15c2.95 1.35 5.05 4.85 4.35 8.65-.35 1.9-1.55 3.55-3.35 4.55l-.85.47-.85-.47c-1.8-1-3-2.65-3.35-4.55-.7-3.8 1.4-7.3 4.35-8.65Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

type BrandTitleTone = "onDarkHeader" | "onLight"

function FridgeBrandTitle({
  tone,
  className,
}: {
  tone: BrandTitleTone
  className?: string
}) {
  const fridgeMeals =
    tone === "onDarkHeader" ? "font-semibold text-white" : "font-semibold text-[#1F3A2B]"

  return (
    <span className={cn("inline-flex flex-wrap items-baseline justify-center gap-x-0 font-serif font-bold tracking-tight", className)}>
      <span className={cn(fridgeMeals)}>Fr</span>
      {/* Latin small letter dotless i (U+0131): no native tittle; leaf SVG replaces it */}
      <span className={cn("relative inline-block shrink-0 align-baseline", fridgeMeals)}>
        ı
        <span
          className="pointer-events-none absolute left-1/2 top-[0.22em] inline-flex items-end justify-center"
          style={{
            color: BRAND_ORANGE,
            transform: "translate(calc(-50% + 0.08em), calc(-99% + 0.36em))",
          }}
          aria-hidden
        >
          <LeafForIDot className="h-[0.34em] w-[0.29em] min-h-[7px] min-w-[6px]" />
        </span>
      </span>
      <span className={cn(fridgeMeals)}>dge</span>
      <span className="mx-[0.12em] font-bold sm:mx-[0.18em]" style={{ color: BRAND_ORANGE }}>
        To
      </span>
      <span className={cn(fridgeMeals)}> Meals</span>
    </span>
  )
}

function toTitleCaseName(name: string) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
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

  const dialogs = (
    <>
      <SignInDialog
        open={isSignInOpen}
        onOpenChange={(open) => {
          setIsSignInOpen(open)
          if (!open) setSignInPreface(null)
        }}
        preface={signInPreface}
      />
      <SignUpDialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </>
  )

  if (variant === "recipe") {
    return (
      <>
        <header
          className="w-full overflow-x-hidden text-white shadow-[0_10px_28px_-12px_rgba(35,74,15,0.35)]"
          style={{ background: "linear-gradient(to right, #234A0F, #2E5B12, #234A0F)" }}
        >
          <div className="mx-auto flex min-h-[3.75rem] w-full min-w-0 max-w-6xl flex-row items-center justify-between gap-2 px-4 py-2 sm:min-h-[4rem] sm:gap-2.5 sm:px-6 sm:py-2.5 lg:max-w-[1200px] lg:px-10">
            <div className="flex min-w-0 flex-1 items-center gap-2 pr-1 sm:gap-3 sm:pr-0">
              <IllustrationHomeLink className="ring-offset-2 ring-offset-[#234A0F]" />
              <div className="min-w-0">
                <Link href="/" aria-label="Fridge To Meals" className="block leading-[1.15]">
                  <FridgeBrandTitle tone="onDarkHeader" className="text-base sm:text-lg" />
                </Link>
                <p className="mt-0.5 text-[11px] font-normal leading-snug text-white/85 sm:text-xs">
                  Stop wondering what to cook <span aria-hidden>✨</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end justify-center gap-1 sm:flex-row sm:items-center sm:gap-2 md:gap-3">
              {isHydrated && user ? (
                <>
                  <span className="max-w-[5.5rem] truncate text-right text-[10px] font-medium leading-tight text-white/95 sm:max-w-none sm:text-base">
                    Hi {toTitleCaseName(user.name)} <span aria-hidden>👋</span>
                  </span>
                  <Button
                    variant="outline"
                    className="h-7 shrink-0 rounded-full border border-white/70 bg-transparent px-2.5 text-[10px] font-semibold leading-none text-white hover:bg-white/10 sm:h-10 sm:px-5 sm:text-sm"
                    onClick={async () => {
                      await logout()
                      router.push("/")
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <Button
                    variant="outline"
                    className="h-7 shrink-0 rounded-full border border-white/70 bg-transparent px-2.5 text-[10px] font-semibold leading-none text-white hover:bg-white/10 sm:h-9 sm:px-4 sm:text-xs"
                    onClick={openSignInFromHeader}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="h-7 shrink-0 rounded-full border border-white/70 bg-white px-2.5 text-[10px] font-semibold leading-none text-[#2F4A16] hover:bg-white/90 sm:h-9 sm:px-4 sm:text-xs"
                    onClick={() => setIsSignUpOpen(true)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        {dialogs}
      </>
    )
  }

  return (
    <>
      <header
        className="w-full overflow-x-hidden"
        style={{ background: "linear-gradient(to right, #3A4F16, #5C7A25)" }}
      >
        <div className="mx-auto grid min-h-[70px] w-full min-w-0 max-w-[1400px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-1 px-2 py-2 sm:gap-x-2 sm:px-3 md:h-[90px] md:gap-x-2 md:py-0 md:px-4 lg:px-8">
          <div className="flex min-w-0 items-center justify-self-start gap-1.5 md:gap-3">
            <IllustrationHomeLink className="ring-offset-2 ring-offset-[#3A4F16]" />
            <div className="min-w-0 text-[10px] font-medium leading-tight text-white/90 md:font-serif md:text-[15px] md:leading-[1.1] md:text-white">
              <div>Busy life.</div>
              <div>Meals decided.</div>
            </div>
          </div>

          <h1 className="min-w-0 justify-self-center text-center drop-shadow-sm sm:text-lg md:text-4xl md:drop-shadow-none lg:text-[50px]">
            <Link href="/" aria-label="Fridge To Meals" className="inline-block max-w-full px-0.5">
              <FridgeBrandTitle tone="onDarkHeader" className="text-[15px] md:text-4xl lg:text-[50px]" />
            </Link>
          </h1>

          <div className="flex min-w-0 justify-end justify-self-end">
            <div className="flex flex-col items-end justify-center gap-1 md:hidden">
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
                    className="h-6 shrink-0 rounded-full border border-white/60 bg-transparent px-2 text-[9px] font-medium leading-none text-white hover:bg-white/10"
                    onClick={openSignInFromHeader}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="h-6 shrink-0 rounded-full border border-white/60 bg-white px-2 text-[9px] font-semibold leading-none text-[#3A4F16] hover:bg-white/90"
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
      </header>
      {dialogs}
    </>
  )
}
