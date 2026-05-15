"use client"

import { ChefHat, Clock, Globe } from "lucide-react"
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

export function FilterSection({
  cuisine,
  prepTime,
  cookingStyle,
  onCuisineChange,
  onPrepTimeChange,
  onCookingStyleChange,
}: FilterSectionProps) {
  return (
    <section className="w-full max-w-full min-w-0 border-b border-[#E6E0D4]/40 pb-3 sm:pb-4">
      <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
        <span className="text-lg leading-none sm:text-xl" aria-hidden>
          👨‍🍳
        </span>
        <h2 className="font-serif text-sm font-semibold text-[#1F3A2B] sm:text-base md:text-lg">Recipe Preferences</h2>
      </div>

      <div className="grid w-full min-w-0 grid-cols-3 gap-1 sm:gap-2 md:gap-3">
        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <label className="flex min-w-0 items-center gap-0.5 text-[10px] font-semibold leading-tight text-[#1F3A2B] sm:gap-1 sm:text-xs md:text-sm">
            <Globe className="h-3 w-3 shrink-0 text-[#2E6B8E] sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" strokeWidth={2} aria-hidden />
            <span className="truncate">Cuisine</span>
          </label>
          <Select value={cuisine} onValueChange={onCuisineChange}>
            <SelectTrigger className="h-9 w-full min-w-0 max-w-full rounded-xl border border-[#E6E0D4]/90 bg-white px-2 text-xs text-[#1F3A2B] shadow-[0_2px_10px_-4px_rgba(47,74,22,0.08)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_4px_14px_-4px_rgba(47,74,22,0.1)] sm:h-10 sm:px-2.5 sm:text-sm md:h-11 md:px-3 md:text-base">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="text-sm md:text-base">
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

        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <label className="flex min-w-0 items-center gap-0.5 text-[10px] font-semibold leading-tight text-[#1F3A2B] sm:gap-1 sm:text-xs md:text-sm">
            <Clock className="h-3 w-3 shrink-0 text-[#C45C1A] sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" strokeWidth={2} aria-hidden />
            <span className="truncate">Prep Time</span>
          </label>
          <Select value={prepTime} onValueChange={onPrepTimeChange}>
            <SelectTrigger className="h-9 w-full min-w-0 max-w-full rounded-xl border border-[#E6E0D4]/90 bg-white px-2 text-xs text-[#1F3A2B] shadow-[0_2px_10px_-4px_rgba(47,74,22,0.08)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_4px_14px_-4px_rgba(47,74,22,0.1)] sm:h-10 sm:px-2.5 sm:text-sm md:h-11 md:px-3 md:text-base">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="text-sm md:text-base">
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="15">Quick (15 minutes)</SelectItem>
              <SelectItem value="30">Easy (30 minutes)</SelectItem>
              <SelectItem value="60">Hard (60 minutes)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <label className="flex min-w-0 items-center gap-0.5 text-[10px] font-semibold leading-tight text-[#1F3A2B] sm:gap-1 sm:text-xs md:text-sm">
            <ChefHat className="h-3 w-3 shrink-0 text-[#5A7F2E] sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" strokeWidth={2} aria-hidden />
            <span className="truncate">Cooking Style</span>
          </label>
          <Select value={cookingStyle} onValueChange={onCookingStyleChange}>
            <SelectTrigger className="h-9 w-full min-w-0 max-w-full rounded-xl border border-[#E6E0D4]/90 bg-white px-2 text-xs text-[#1F3A2B] shadow-[0_2px_10px_-4px_rgba(47,74,22,0.08)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_4px_14px_-4px_rgba(47,74,22,0.1)] sm:h-10 sm:px-2.5 sm:text-sm md:h-11 md:px-3 md:text-base">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent className="text-sm md:text-base">
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
    </section>
  )
}
