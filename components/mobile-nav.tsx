"use client"

import { ChefHat, Heart, Refrigerator, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/context/auth-context"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { user, isHydrated } = useAuth()
  const isAuthed = Boolean(isHydrated && user)

  const tabs = [
    { id: "today", label: "Today\u2019s Picks", icon: Star },
    { id: "fridge", label: "My Fridge", icon: Refrigerator, isPrimary: true },
    { id: "planner", label: "Recipe Generator", icon: ChefHat },
    { id: "favorites", label: "Favorites", icon: Heart },
  ]

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 w-full max-w-full min-w-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto mx-auto flex h-[3.25rem] w-full max-w-2xl min-w-0 items-stretch rounded-full border border-[#E6E0D4]/90 bg-white/95 px-1 shadow-[0_10px_36px_-12px_rgba(47,74,22,0.14),0_2px_12px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-shadow duration-200 sm:h-14 sm:px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.label}
            data-footer-favorites={tab.id === "favorites" ? "true" : undefined}
            onClick={() => {
              if (tab.id === "planner") {
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
              "text-[9px] font-semibold leading-tight sm:gap-1 sm:px-1 sm:text-[11px]",
              tab.id !== "planner" && !isAuthed && "opacity-55 text-[#1F3A2B]/45",
              activeTab === tab.id ? "text-[#F97316]" : "text-[#1F3A2B]/60 hover:text-[#1F3A2B]"
            )}
          >
            <tab.icon
              className={cn(
                "h-4 w-4 shrink-0 sm:h-5 sm:w-5",
                tab.isPrimary && "sm:h-6 sm:w-6",
                activeTab === tab.id && "text-[#F97316] fill-[#F97316]/20",
                tab.id !== "planner" && !isAuthed && "text-[#1F3A2B]/45"
              )}
            />
            <span className="line-clamp-2 w-full min-w-0 max-w-full break-words px-0.5">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}

