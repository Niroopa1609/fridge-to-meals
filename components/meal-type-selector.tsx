"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { MEAL_TYPES } from "@/features/recipe-generator/constants"

interface MealTypeSelectorProps {
  selectedTypes: string[]
  onSelectedTypesChange: (types: string[]) => void
}

export function MealTypeSelector({ selectedTypes, onSelectedTypesChange }: MealTypeSelectorProps) {
  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onSelectedTypesChange([])
      return
    }
    onSelectedTypesChange([typeId])
  }

  return (
    <section className="w-full max-w-full min-w-0 border-b border-[#E6E0D4]/40 pb-3 sm:pb-4">
      <div className="mb-1.5 flex items-start gap-1.5 sm:mb-2">
        <span className="text-lg leading-none sm:text-xl" aria-hidden>
          🍴
        </span>
        <h2 className="font-serif text-sm font-semibold text-[#1F3A2B] sm:text-base md:text-lg">
          Select a meal type <span className="text-[#F97316]">*</span>
        </h2>
      </div>

      <div className="grid w-full min-w-0 grid-cols-5 gap-1 sm:gap-1.5 md:flex md:flex-nowrap md:justify-between md:gap-1.5 md:overflow-visible lg:gap-2">
        {MEAL_TYPES.map((type) => {
          const selected = selectedTypes.includes(type.id)
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              aria-pressed={selected}
              className={cn(
                "relative flex min-h-[3.5rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-1 py-1.5 transition-all duration-200 sm:min-h-[3.75rem] sm:gap-1 sm:px-1 sm:py-2 md:min-h-[4rem] md:flex-1 md:py-2 lg:min-h-[4.25rem]",
                "hover:scale-[1.02] hover:shadow-[0_6px_16px_-6px_rgba(47,74,22,0.12)]",
                selected
                  ? "border-[#F97316] bg-[#FFF4EC] text-[#EA6A12] shadow-[0_4px_14px_-4px_rgba(249,115,22,0.25)]"
                  : "border-[#E4DDCF] bg-white text-[#2F4A16] shadow-[0_2px_10px_-4px_rgba(47,74,22,0.08)] hover:border-[#F97316]/35"
              )}
            >
              {selected ? (
                <span
                  className="absolute right-0.5 top-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm sm:h-3.5 sm:w-3.5 md:right-1 md:top-1 md:h-4 md:w-4"
                  aria-hidden
                >
                  <Heart className="h-1.5 w-1.5 fill-white text-white sm:h-2 sm:w-2" strokeWidth={2} />
                </span>
              ) : null}
              <span className="text-lg leading-none sm:text-xl md:text-2xl" aria-hidden>
                {type.emoji}
              </span>
              <span
                className={cn(
                  "w-full min-w-0 max-w-full px-0.5 text-center text-[9px] font-semibold leading-tight line-clamp-2 sm:text-[10px] md:text-[11px] lg:text-xs",
                  selected ? "text-[#EA6A12]" : "text-[#1F3A2B]"
                )}
              >
                {type.name}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
