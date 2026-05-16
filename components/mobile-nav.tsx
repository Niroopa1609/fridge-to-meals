"use client"

import type { LucideIcon } from "lucide-react"
import { ChefHat, Heart, Refrigerator, ScrollText, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { user, isHydrated } = useAuth()
  const isAuthed = Boolean(isHydrated && user)

  const tabs: {
    id: string
    label: string
    icon: LucideIcon
    isPrimary?: boolean
  }[] = [
    { id: "today", label: "Today\u2019s Picks", icon: Star },
    { id: "fridge", label: "My Fridge", icon: Refrigerator, isPrimary: true },
    { id: "planner", label: "Recipe Generator", icon: ChefHat },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "terms", label: "Terms", icon: ScrollText },
  ]

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 w-full max-w-full min-w-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto mx-auto flex h-[3.25rem] w-full max-w-3xl min-w-0 items-stretch rounded-full border border-[#E6E0D4]/90 bg-white/95 px-0.5 shadow-[0_10px_36px_-12px_rgba(47,74,22,0.14),0_2px_12px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-shadow duration-200 sm:h-14 sm:px-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.label}
            data-footer-favorites={tab.id === "favorites" ? "true" : undefined}
            onClick={() => {
              if (tab.id === "planner" || tab.id === "terms") {
                onTabChange(tab.id)
                return
              }
              if (!isAuthed) {
                window.dispatchEvent(new Event("auth:signin"))
                return
              }
              onTabChange(tab.id)
            }}
            disabled={false}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-center transition-all duration-200",
              "text-[9px] font-semibold leading-tight sm:gap-1 sm:px-0.5 sm:text-[11px]",
              tab.id !== "planner" &&
                tab.id !== "terms" &&
                !isAuthed &&
                "opacity-55 text-[#1F3A2B]/45",
              activeTab === tab.id ? "text-[#F97316]" : "text-[#1F3A2B]/60 hover:text-[#1F3A2B]"
            )}
          >
            <tab.icon
              className={cn(
                "h-[0.9375rem] w-[0.9375rem] shrink-0 sm:h-[1.15rem] sm:w-[1.15rem]",
                tab.isPrimary && "sm:h-5 sm:w-5",
                activeTab === tab.id && "text-[#F97316] fill-[#F97316]/20",
                tab.id !== "planner" && tab.id !== "terms" && !isAuthed && "text-[#1F3A2B]/45"
              )}
            />
            <span className="line-clamp-2 w-full min-w-0 max-w-full break-words px-0">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
