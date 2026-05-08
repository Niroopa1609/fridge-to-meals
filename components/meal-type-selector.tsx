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
      <div className="flex items-center">
        <div className="grid w-full min-w-0 flex-1 grid-cols-7 gap-1 md:gap-2 lg:gap-3">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              aria-pressed={selectedTypes.includes(type.id)}
              className={cn(
                "flex min-h-0 min-w-0 w-full flex-col items-center justify-center rounded-lg border-2 transition-all",
                /* Mobile: one row, compact — equal columns; icons override constants.tsx h-7/sm:h-8 */
                "h-[60px] gap-0.5 px-0.5 py-1 max-md:[&_svg]:!h-5 max-md:[&_svg]:!w-5",
                /* Desktop: match previous layout */
                "md:h-[76px] md:gap-1.5 md:px-2.5 md:py-2 md:[&_svg]:!h-7 md:[&_svg]:!w-7",
                "lg:h-[82px] lg:[&_svg]:!h-8 lg:[&_svg]:!w-8",
                selectedTypes.includes(type.id)
                  ? "border-[#F97316] bg-[#FDE9DD] text-[#EA6A12]"
                  : "border-[#E2D9CC] bg-white text-[#4F6B1F] hover:border-[#F97316]/50"
              )}
            >
              {type.icon}
              <span
                className={cn(
                  "w-full min-w-0 max-w-full text-center font-medium leading-tight",
                  "truncate max-md:text-[9px] max-md:px-px",
                  "md:overflow-visible md:whitespace-normal md:px-0 md:text-sm"
                )}
                title={type.name}
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
