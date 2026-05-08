"use client"

import type React from "react"
import { Check, Leaf, Soup, Salad, Pizza, UtensilsCrossed, Sandwich, Flame, Fish, Beef, Drumstick, Sprout, Wheat } from "lucide-react"
import { cn } from "@/lib/utils"

export type CuisineOption = { label: string; icon: React.ComponentType<{ className?: string }> }

export const CUISINE_OPTIONS: CuisineOption[] = [
  { label: "Indian", icon: UtensilsCrossed },
  { label: "South Indian", icon: Soup },
  { label: "North Indian", icon: Flame },
  { label: "Indo-Chinese", icon: Salad },
  { label: "Chinese", icon: Soup },
  { label: "Thai", icon: Salad },
  { label: "Mexican", icon: Sandwich },
  { label: "Italian", icon: Pizza },
  { label: "Mediterranean", icon: Leaf },
  { label: "American", icon: Beef },
  { label: "Middle Eastern", icon: Wheat },
  { label: "Japanese", icon: Fish },
  { label: "Korean", icon: Drumstick },
  { label: "Continental", icon: UtensilsCrossed },
  { label: "Vegetarian", icon: Sprout },
  { label: "Vegan", icon: Leaf },
]

export function CuisinePicker({
  selected,
  max,
  disabled,
  onToggle,
}: {
  selected: string[]
  max: number
  disabled?: boolean
  onToggle: (cuisine: string) => void
}) {
  const selectedSet = new Set(selected.map((s) => s.toLowerCase()))

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {CUISINE_OPTIONS.map(({ label, icon: Icon }) => {
        const isSelected = selectedSet.has(label.toLowerCase())
        const tileDisabled = disabled || (!isSelected && selected.length >= max)
        return (
          <button
            key={label}
            type="button"
            disabled={tileDisabled}
            onClick={() => onToggle(label)}
            className={cn(
              "group relative rounded-2xl border p-4 text-left transition",
              isSelected
                ? "border-[#4F6B1F] bg-[#4F6B1F] text-white"
                : "border-[#E2D9CC] bg-[#F6F8EE] text-[#1F3A2B] hover:bg-[#EEF3DE]",
              tileDisabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className={cn("flex items-center justify-between", isSelected ? "text-white" : "text-[#4F6B1F]")}>
              <Icon className="h-6 w-6" aria-hidden />
              {isSelected ? (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#4F6B1F]">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
            </div>
            <div className={cn("mt-5 text-sm font-semibold", isSelected ? "text-white" : "text-[#1F3A2B]")}>
              {label}
            </div>
          </button>
        )
      })}
    </div>
  )
}

