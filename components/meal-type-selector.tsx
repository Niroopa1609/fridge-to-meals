"use client"

import { cn } from "@/lib/utils"
import { MEAL_TYPES } from "@/features/recipe-generator/constants"

interface MealTypeSelectorProps {
  selectedTypes: string[]
  onSelectedTypesChange: (types: string[]) => void
}

export function MealTypeSelector({
  selectedTypes,
  onSelectedTypesChange,
}: MealTypeSelectorProps) {
  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onSelectedTypesChange(selectedTypes.filter((t) => t !== typeId))
      return
    }
    onSelectedTypesChange([...selectedTypes, typeId])
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1F3A2B]">
        Select Meal Type <span className="text-[#F97316]">*</span>
      </label>
      <div className="flex w-full max-w-full min-w-0 items-center">
        <div className="grid w-full min-w-0 max-w-full grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              aria-pressed={selectedTypes.includes(type.id)}
              className={cn(
                "flex min-h-[58px] min-w-0 w-full max-w-full flex-col items-center justify-center rounded-lg border-2 px-0.5 py-0.5 transition-all",
                "gap-0.5 max-md:[&_svg]:!h-4 max-md:[&_svg]:!w-4",
                "md:min-h-[76px] md:gap-1.5 md:px-2.5 md:py-2 md:[&_svg]:!h-7 md:[&_svg]:!w-7",
                "lg:min-h-[82px] lg:[&_svg]:!h-8 lg:[&_svg]:!w-8",
                selectedTypes.includes(type.id)
                  ? "border-[#F97316] bg-[#FDE9DD] text-[#EA6A12]"
                  : "border-[#E2D9CC] bg-white text-[#4F6B1F] hover:border-[#F97316]/50"
              )}
            >
              {type.icon}
              <span
                className={cn(
                  "w-full min-w-0 max-w-full text-center text-[10px] font-medium leading-[1.15] max-md:break-words max-md:whitespace-normal",
                  "md:text-sm md:leading-tight"
                )}
              >
                {type.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
