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
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-[#1F3A2B]">
          <CuisineIcon />
          <span>Cuisine</span>
        </label>
        <Select value={cuisine} onValueChange={onCuisineChange}>
          <SelectTrigger className="w-full bg-white border-[#E2D9CC] text-[#1F3A2B] h-11 rounded-lg">
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

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-[#1F3A2B]">
          <ClockIcon />
          <span>Meal Prep Time</span>
        </label>
        <Select value={prepTime} onValueChange={onPrepTimeChange}>
          <SelectTrigger className="w-full bg-white border-[#E2D9CC] text-[#1F3A2B] h-11 rounded-lg">
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

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-[#1F3A2B]">
          <CookingIcon />
          <span>Cooking Style</span>
        </label>
        <Select value={cookingStyle} onValueChange={onCookingStyleChange}>
          <SelectTrigger className="w-full bg-white border-[#E2D9CC] text-[#1F3A2B] h-11 rounded-lg">
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
