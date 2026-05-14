"use client"

import { ChefHat, Heart, Refrigerator, Sparkles } from "lucide-react"
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
    { id: "today", label: "Today\u2019s Picks", icon: Sparkles },
    { id: "fridge", label: "My Fridge", icon: Refrigerator, isPrimary: true },
    { id: "planner", label: "Recipe Generator", icon: ChefHat },
    { id: "favorites", label: "Favorites", icon: Heart },
  ]

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-4 pt-2">
      <nav className="pointer-events-auto w-full max-w-md rounded-full border border-[#E8DFD0] bg-white/95 px-1 py-1.5 shadow-[0_12px_40px_-8px_rgba(47,74,22,0.18)] backdrop-blur-sm">
        <div className="flex w-full min-w-0 items-stretch justify-between gap-0.5">
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
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-2 text-center transition-colors",
                "text-[10px] font-semibold leading-tight sm:text-[11px]",
                tab.id !== "planner" && !isAuthed && "opacity-50",
                activeTab === tab.id ? "text-[#F97316]" : "text-[#9CA3AF] hover:text-[#6B7280]"
              )}
            >
              <span
                className={cn(
                  "relative flex h-8 w-full items-center justify-center",
                  activeTab === tab.id && "after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-[#F97316]"
                )}
              >
                <tab.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    tab.isPrimary && "h-5 w-5",
                    activeTab === tab.id ? "text-[#F97316]" : "text-[#9CA3AF]",
                    tab.id !== "planner" && !isAuthed && "text-[#9CA3AF]"
                  )}
                  strokeWidth={activeTab === tab.id ? 2.25 : 2}
                />
              </span>
              <span className="line-clamp-2 w-full min-w-0 max-w-full px-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
