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
      onSelectedTypesChange(selectedTypes.filter((t) => t !== typeId))
      return
    }
    onSelectedTypesChange([...selectedTypes, typeId])
  }

  return (
    <section className="w-full max-w-full min-w-0 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none" aria-hidden>
          🍴
        </span>
        <h2 className="font-serif text-lg font-semibold text-[#2F4A16] sm:text-xl">
          Select Meal Type <span className="text-[#F97316]">*</span>
        </h2>
      </div>

      <div className="-mx-1 w-full max-w-full min-w-0 overflow-x-auto overflow-y-visible pb-1 md:mx-0 md:overflow-visible">
        <div className="flex min-w-0 gap-2 px-1 md:grid md:w-full md:max-w-full md:grid-cols-7 md:gap-2 md:px-0 lg:gap-3">
          {MEAL_TYPES.map((type) => {
            const selected = selectedTypes.includes(type.id)
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                aria-pressed={selected}
                className={cn(
                  "relative flex min-h-[72px] w-[4.75rem] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border-2 px-1 py-2 transition-all sm:min-h-[80px] sm:w-[5.25rem] md:min-h-[88px] md:w-full md:max-w-full md:px-2 md:py-2.5 lg:min-h-[96px]",
                  selected
                    ? "border-[#F97316] bg-[#FFF4EC] text-[#EA6A12] shadow-md"
                    : "border-[#E8DFD0] bg-white text-[#4F6B1F] shadow-sm hover:border-[#F97316]/45"
                )}
              >
                {selected ? (
                  <span
                    className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F97316] text-white shadow-sm"
                    aria-hidden
                  >
                    <Heart className="h-3 w-3 fill-white text-white" strokeWidth={2} />
                  </span>
                ) : null}
                <span className="mb-1 text-[1.65rem] leading-none" aria-hidden>
                  {type.emoji}
                </span>
                <span
                  className={cn(
                    "w-full min-w-0 max-w-full text-center text-[10px] font-semibold leading-tight sm:text-xs",
                    selected ? "text-[#EA6A12]" : "text-[#2F4A16]"
                  )}
                >
                  {type.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
