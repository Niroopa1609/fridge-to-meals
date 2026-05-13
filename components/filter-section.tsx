"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterSectionProps {
  cuisine: string
  prepTime: string
  cookingStyle: string
  onCuisineChange: (value: string) => void
  onPrepTimeChange: (value: string) => void
  onCookingStyleChange: (value: string) => void
}

// Globe/Earth icon for Cuisine
function CuisineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 4.5 9 15 15 0 0 1-4.5 9" />
      <path d="M12 3a15 15 0 0 0-4.5 9 15 15 0 0 0 4.5 9" />
    </svg>
  )
}

// Clock icon for Meal Prep Type
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  )
}

// Pan/Cooking icon for Cooking Style
function CookingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5">
      <path d="M4 16h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" />
      <path d="M4 16c0-4 3-7 8-7s8 3 8 7" />
      <path d="M12 9V5" strokeLinecap="round" />
      <path d="M9 7V4" strokeLinecap="round" />
      <path d="M15 7V4" strokeLinecap="round" />
    </svg>
  )
}

export function FilterSection({
  cuisine,
  prepTime,
  cookingStyle,
  onCuisineChange,
  onPrepTimeChange,
  onCookingStyleChange,
}: FilterSectionProps) {
  return (
    <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-1.5 sm:grid-cols-3 sm:gap-2">
      <div className="min-w-0 space-y-1.5">
        <label className="flex min-w-0 items-center gap-1 whitespace-nowrap text-sm font-medium leading-tight text-[#1F3A2B] sm:gap-1.5 sm:leading-normal">
          <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px]">
            <CuisineIcon />
          </span>
          <span className="min-w-0">Cuisine</span>
        </label>
        <Select value={cuisine} onValueChange={onCuisineChange}>
          <SelectTrigger className="h-11 w-full min-w-0 max-w-full rounded-lg border-[#E2D9CC] bg-white px-2 text-xs text-[#1F3A2B] sm:px-3 sm:text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="Indian">Indian</SelectItem>
              <SelectItem value="South Indian">South Indian</SelectItem>
              <SelectItem value="North Indian">North Indian</SelectItem>
              <SelectItem value="Indo-Chinese">Indo-Chinese</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Thai">Thai</SelectItem>
              <SelectItem value="Mexican">Mexican</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
              <SelectItem value="Mediterranean">Mediterranean</SelectItem>
              <SelectItem value="American">American</SelectItem>
              <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
              <SelectItem value="Continental">Continental</SelectItem>
              <SelectItem value="Vegetarian">Vegetarian</SelectItem>
              <SelectItem value="Vegan">Vegan</SelectItem>
        </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1.5">
        <label className="flex min-w-0 items-center gap-1 whitespace-nowrap text-sm font-medium leading-tight text-[#1F3A2B] sm:gap-1.5 sm:leading-normal">
          <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px]">
            <ClockIcon />
          </span>
          <span className="min-w-0">Prep Time</span>
        </label>
        <Select value={prepTime} onValueChange={onPrepTimeChange}>
          <SelectTrigger className="h-11 w-full min-w-0 max-w-full rounded-lg border-[#E2D9CC] bg-white px-2 text-xs text-[#1F3A2B] sm:px-3 sm:text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="15">Quick (15 minutes)</SelectItem>
            <SelectItem value="30">Easy (30 minutes)</SelectItem>
            <SelectItem value="60">Hard (60 minutes)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1.5">
        <label className="flex min-w-0 items-center gap-1 whitespace-nowrap text-sm font-medium leading-tight text-[#1F3A2B] sm:gap-1.5 sm:leading-normal">
          <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px]">
            <CookingIcon />
          </span>
          <span className="min-w-0">Cooking Style</span>
        </label>
        <Select value={cookingStyle} onValueChange={onCookingStyleChange}>
          <SelectTrigger className="h-11 w-full min-w-0 max-w-full rounded-lg border-[#E2D9CC] bg-white px-2 text-xs text-[#1F3A2B] sm:px-3 sm:text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="Stovetop">Stovetop</SelectItem>
            <SelectItem value="Oven / Bake">Oven / Bake</SelectItem>
            <SelectItem value="Instant Pot">Instant Pot</SelectItem>
            <SelectItem value="Instant POT- OPOS">Instant POT- OPOS</SelectItem>
            <SelectItem value="Air Fryer">Air Fryer</SelectItem>
            <SelectItem value="Microwave">Microwave</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
