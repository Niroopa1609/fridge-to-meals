"use client"

import { useMemo } from "react"
import { MessageSquareText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recipe } from "@/components/recipe-card"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* WhatsApp logo (green circle + white handset) */}
      <path
        fill="#25D366"
        d="M16 2.8C8.71 2.8 2.8 8.71 2.8 16c0 2.33.6 4.52 1.66 6.42L3.2 29.2l6.94-1.78A13.11 13.11 0 0 0 16 29.2c7.29 0 13.2-5.91 13.2-13.2S23.29 2.8 16 2.8Z"
      />
      <path
        fill="#FFFFFF"
        d="M22.02 18.82c-.25-.13-1.46-.72-1.69-.8-.23-.08-.4-.13-.57.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.04-.38-1.99-1.21-.74-.65-1.24-1.46-1.39-1.7-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.16.05-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.41-.56-.42h-.48c-.16 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.9 2.4 1.02 2.57.13.16 1.76 2.68 4.26 3.76.59.26 1.06.41 1.42.52.6.19 1.15.16 1.58.1.48-.07 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.29Z"
      />
      <path
        fill="#FFFFFF"
        d="M16 6.8c-5.08 0-9.2 4.12-9.2 9.2 0 1.62.42 3.14 1.17 4.48l-.76 2.76 2.84-.73A9.17 9.17 0 0 0 16 25.2c5.08 0 9.2-4.12 9.2-9.2S21.08 6.8 16 6.8Zm0 16.68a7.47 7.47 0 0 1-3.85-1.07l-.28-.17-1.66.43.45-1.6-.18-.29a7.47 7.47 0 1 1 5.52 2.7Z"
        opacity="0.9"
      />
    </svg>
  )
}

function EmailLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* Simple envelope mark to match reference */}
      <path
        fill="currentColor"
        d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Zm2.16-.25 5.45 4.18c.24.18.56.18.79 0l5.45-4.18H6.16Zm12.34 1.4-5.02 3.85a2.1 2.1 0 0 1-2.96 0L5.5 7.9v9.35c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V7.9Z"
      />
    </svg>
  )
}

function buildShareMessage(recipe: Recipe, url: string) {
  const lines: string[] = []
  lines.push(url)
  lines.push("Busy life. Meals decided.")
  lines.push("")
  lines.push(`Recipe: ${recipe.title}`)
  lines.push(`Meal Type: ${recipe.mealType}`)
  lines.push(`Prep Time: ${recipe.time}`)
  lines.push("")
  lines.push(recipe.description || "")
  lines.push("")
  lines.push("Ingredients:")
  for (const i of recipe.ingredients || []) lines.push(`- ${i}`)
  lines.push("")
  lines.push("Instructions:")
  ;(recipe.instructions || []).forEach((s, idx) => lines.push(`${idx + 1}. ${s}`))
  if (recipe.proTips?.length) {
    lines.push("")
    lines.push("Pro Tips:")
    for (const t of recipe.proTips) lines.push(`- ${t}`)
  }
  lines.push("")
  return lines.join("\n").trim()
}

export function RecipeShare({ recipe, showSms = true }: { recipe: Recipe; showSms?: boolean }) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return ""
    return window.location.href
  }, [])

  const message = useMemo(() => buildShareMessage(recipe, url), [recipe, url])

  const openWhatsApp = () => {
    const msg = encodeURIComponent(message)
    // Works on desktop (WhatsApp Web) and mobile (WhatsApp app if installed).
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer")
  }

  const openEmail = () => {
    const subject = encodeURIComponent(`Daily Meal Planner — ${recipe.title}`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const openSms = () => {
    const body = encodeURIComponent(message)
    window.location.href = `sms:?body=${body}`
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={openWhatsApp}
        aria-label="Share on WhatsApp"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2D9CC] bg-white text-[#4F6B1F] shadow-sm",
          "hover:bg-[#F7F3EB] hover:border-[#F97316]/50"
        )}
      >
        <WhatsAppIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={openEmail}
        aria-label="Share by Email"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2D9CC] bg-white text-black shadow-sm",
          "hover:bg-[#F7F3EB] hover:border-[#F97316]/50"
        )}
      >
        <EmailLogo className="h-5 w-5" />
      </button>

      {showSms ? (
        <button
          type="button"
          onClick={openSms}
          aria-label="Share by Message"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2D9CC] bg-white text-[#4F6B1F] shadow-sm sm:hidden",
            "hover:bg-[#F7F3EB] hover:border-[#F97316]/50"
          )}
        >
          <MessageSquareText className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  )
}

