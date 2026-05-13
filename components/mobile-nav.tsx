"use client"

import { CalendarDays, Heart, Refrigerator, Sparkles } from "lucide-react"
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
    { id: "planner", label: "Recipe Generator", icon: CalendarDays },
    { id: "favorites", label: "Favorites", icon: Heart },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full min-w-0 border-t border-[#E2D9CC] bg-white">
      <div className="flex h-16 w-full min-w-0 items-stretch">
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
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-center transition-colors",
              "text-[10px] font-medium leading-tight sm:gap-1 sm:px-1 sm:text-xs",
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
      {/* iPhone home indicator spacing */}
      <div className="h-1 w-32 mx-auto mb-1 rounded-full bg-[#1F3A2B]" />
    </nav>
  )
}

