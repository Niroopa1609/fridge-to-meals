"use client"

import type { MouseEvent } from "react"
import Image from "next/image"
import { ArrowLeft, ChevronUp, Clock, Heart, Leaf, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeShare } from "@/features/recipe-generator/components/recipe-share"
import type { Recipe } from "@/components/recipe-card"

export type RecipeDetailMobileViewProps = {
  recipe: Recipe
  onBack: () => void
  heartFilled: boolean
  onHeartClick: (e: MouseEvent<HTMLButtonElement>) => void
  heartAriaLabel: string
  heartDisabled?: boolean
  /** Match Today's Picks share row (SMS); default true. */
  showShareSms?: boolean
  /** When false, hides the "Back to recipes" text link; collapse still calls `onBack`. Default true. */
  showBackLink?: boolean
  /** When true, collapse (chevron) sits on the image top-right instead of the header row. */
  collapseOnImage?: boolean
  /** When true, heart sits on the image bottom-right instead of top-right. */
  heartOnImageBottomRight?: boolean
}

const difficultyStyles = {
  EASY: "bg-[#FDE9DD] text-[#EA6A12]",
  MEDIUM: "bg-[#FDE9DD] text-[#EA6A12]",
  HARD: "bg-[#FDE9DD] text-[#EA6A12]",
} as const

export function RecipeDetailMobileView({
  recipe,
  onBack,
  heartFilled,
  onHeartClick,
  heartAriaLabel,
  heartDisabled = false,
  showShareSms = true,
  showBackLink = true,
  collapseOnImage = false,
  heartOnImageBottomRight = false,
}: RecipeDetailMobileViewProps) {
  const showHeaderCollapse = !collapseOnImage
  const showHeaderRow = showBackLink || showHeaderCollapse

  return (
    <div className="w-full max-w-full min-w-0 space-y-4">
      {showHeaderRow ? (
        <div
          className={cn(
            "flex w-full min-w-0 max-w-full items-center gap-2",
            showBackLink && showHeaderCollapse ? "justify-between" : "justify-end"
          )}
        >
          {showBackLink ? (
            <button
              type="button"
              onClick={onBack}
              className="flex min-w-0 max-w-full flex-1 items-center gap-1.5 text-left text-sm font-medium text-[#4F6B1F]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">Back to recipes</span>
            </button>
          ) : null}
          {showHeaderCollapse ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2D9CC] bg-white text-[#4F6B1F] shadow-sm hover:bg-[#F7F3EB]"
              aria-label="Collapse recipe"
            >
              <ChevronUp className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="relative aspect-[4/3] w-full max-w-full min-w-0 overflow-hidden rounded-xl">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          sizes="100vw"
        />
        {collapseOnImage ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute right-3 top-3 z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2D9CC] bg-white/95 text-[#4F6B1F] shadow-md backdrop-blur-[2px] hover:bg-white"
            aria-label="Collapse recipe"
          >
            <ChevronUp className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onHeartClick}
          disabled={heartDisabled}
          className={cn(
            "absolute right-3 z-[1] rounded-lg bg-white p-2 shadow-md disabled:pointer-events-none disabled:opacity-50",
            heartOnImageBottomRight ? "bottom-3 top-auto" : "top-3"
          )}
          aria-label={heartAriaLabel}
        >
          <Heart
            className={cn(
              "h-5 w-5",
              heartFilled ? "fill-[#F97316] text-[#F97316]" : "text-[#4F6B1F]"
            )}
          />
        </button>
      </div>

      <div className="w-full min-w-0 max-w-full space-y-3">
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <span className="rounded bg-[#E4ECD4] px-2.5 py-1 text-xs font-semibold uppercase text-[#4F6B1F]">
            {recipe.mealType}
          </span>
          <span
            className={cn(
              "rounded px-2.5 py-1 text-xs font-semibold",
              difficultyStyles[recipe.difficulty]
            )}
          >
            {recipe.difficulty}
          </span>
        </div>

        <h2 className="min-w-0 max-w-full break-words font-serif text-2xl font-bold text-[#1F3A2B]">
          {recipe.title}
        </h2>

        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#1F3A2B]/70">
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />
            {recipe.time}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" />
            {recipe.servings} servings
          </span>
          {recipe.isVegetarian ? (
            <span className="flex min-w-0 items-center gap-1.5 text-[#4F6B1F]">
              <Leaf className="h-4 w-4 shrink-0" />
              Vegetarian
            </span>
          ) : null}
        </div>

        <p className="min-w-0 max-w-full text-sm leading-relaxed text-[#1F3A2B]/70">{recipe.description}</p>

        <div className="flex min-w-0 max-w-full flex-wrap gap-3">
          <RecipeShare recipe={recipe} showSms={showShareSms} />
        </div>
      </div>

      <Tabs defaultValue="ingredients" className="w-full min-w-0 max-w-full">
        <TabsList className="grid w-full min-w-0 max-w-full grid-cols-3 rounded-lg bg-[#F7F3EB]">
          <TabsTrigger
            value="ingredients"
            className="min-w-0 rounded-lg px-1 text-[#1F3A2B] data-[state=active]:bg-white sm:px-2"
          >
            <span className="mr-1 shrink-0 text-[#F97316] sm:mr-1.5">📦</span>
            <span className="truncate text-xs sm:text-sm">Ingredients</span>
          </TabsTrigger>
          <TabsTrigger
            value="instructions"
            className="min-w-0 rounded-lg px-1 text-[#1F3A2B] data-[state=active]:bg-white sm:px-2"
          >
            <span className="mr-1 shrink-0 text-[#F97316] sm:mr-1.5">🔥</span>
            <span className="truncate text-xs sm:text-sm">Instructions</span>
          </TabsTrigger>
          <TabsTrigger
            value="nutrition"
            className="min-w-0 rounded-lg px-1 text-[#1F3A2B] data-[state=active]:bg-white sm:px-2"
          >
            <span className="mr-1 shrink-0 text-[#F97316] sm:mr-1.5">❤️</span>
            <span className="truncate text-xs sm:text-sm">Nutrition</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ingredients" className="min-w-0 max-w-full space-y-4 pt-4">
          <div className="min-w-0 max-w-full rounded-xl border border-[#E2D9CC] bg-white p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span className="text-[#F97316]">📦</span> Ingredients
            </h4>
            <div className="grid min-w-0 grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <p key={index} className="min-w-0 break-words text-sm text-[#1F3A2B]/70">
                  <span className="mr-2 text-[#F97316]">•</span>
                  {ingredient}
                </p>
              ))}
            </div>
          </div>

          <div className="min-w-0 max-w-full space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span className="text-[#F97316]">🔥</span> Instructions
            </h4>
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex min-w-0 max-w-full gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-[#1F3A2B]/70">{instruction}</p>
              </div>
            ))}
          </div>

          <div className="min-w-0 max-w-full rounded-xl bg-[#E4ECD4] p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span>🥄</span> Pro Tips
            </h4>
            <ul className="space-y-1">
              {recipe.proTips.map((tip, index) => (
                <li key={index} className="min-w-0 break-words text-sm text-[#4F6B1F]">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid min-w-0 max-w-full grid-cols-4 gap-2 rounded-xl bg-[#F7F3EB] p-4 text-center">
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.calories}</p>
              <p className="text-xs text-[#1F3A2B]/70">Calories</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.protein}</p>
              <p className="text-xs text-[#1F3A2B]/70">Protein</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.carbs}</p>
              <p className="text-xs text-[#1F3A2B]/70">Carbs</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.fat}</p>
              <p className="text-xs text-[#1F3A2B]/70">Fat</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="instructions" className="min-w-0 max-w-full space-y-4 pt-4">
          <div className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex min-w-0 max-w-full gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-[#1F3A2B]/70">{instruction}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="nutrition" className="min-w-0 max-w-full pt-4">
          <div className="grid min-w-0 max-w-full grid-cols-4 gap-2 rounded-xl bg-[#F7F3EB] p-4 text-center">
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.calories}</p>
              <p className="text-xs text-[#1F3A2B]/70">Calories</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.protein}</p>
              <p className="text-xs text-[#1F3A2B]/70">Protein</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.carbs}</p>
              <p className="text-xs text-[#1F3A2B]/70">Carbs</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#1F3A2B]">{recipe.nutrition.fat}</p>
              <p className="text-xs text-[#1F3A2B]/70">Fat</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
