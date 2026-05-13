"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Clock,
  Users,
  Leaf,
  Heart,
  ArrowRight,
  Minus,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RecipeShare } from "@/features/recipe-generator/components/recipe-share"
import { RecipeDetailMobileView } from "@/components/recipe-detail-mobile-view"
import { useAuth } from "@/features/auth/context/auth-context"
import { saveFavorite } from "@/features/favorites/services/favorites"
import { toast } from "sonner"

export interface Recipe {
  id: string
  title: string
  image: string
  mealType: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  time: string
  servings: number
  isVegetarian: boolean
  description: string
  ingredients: string[]
  instructions: string[]
  proTips: string[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

interface RecipeCardProps {
  recipe: Recipe
  isExpanded: boolean
  onToggleExpand: () => void
  isMobile?: boolean
  /** Mobile expanded detail: hide “Back to recipes” (e.g. Today’s Picks). Chevron collapse stays. */
  hideMobileRecipeBackLink?: boolean
}

export function RecipeCard({
  recipe,
  isExpanded,
  onToggleExpand,
  isMobile = false,
  hideMobileRecipeBackLink = false,
}: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isSavingFavorite, setIsSavingFavorite] = useState(false)
  const { accessToken, user, isHydrated } = useAuth()

  const animateFavoriteToFooter = (src: HTMLElement) => {
    const target = document.querySelector('[data-footer-favorites="true"]') as HTMLElement | null
    if (!src || !target) return

    const srcRect = src.getBoundingClientRect()
    const tgtRect = target.getBoundingClientRect()

    const startX = srcRect.left + srcRect.width / 2
    const startY = srcRect.top + srcRect.height / 2
    const endX = tgtRect.left + tgtRect.width / 2
    const endY = tgtRect.top + tgtRect.height / 2

    const el = document.createElement("div")
    el.style.position = "fixed"
    el.style.left = `${startX - 10}px`
    el.style.top = `${startY - 10}px`
    el.style.width = "20px"
    el.style.height = "20px"
    el.style.zIndex = "9999"
    el.style.pointerEvents = "none"
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="#F97316" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.35-9.33-8.42C.56 8.84 2.3 5.5 6 5.5c2.04 0 3.11 1.12 4 2.2.89-1.08 1.96-2.2 4-2.2 3.7 0 5.44 3.34 3.33 7.08C19 16.65 12 21 12 21z"/></svg>'
    document.body.appendChild(el)

    const duration = 750
    el.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.6)`, opacity: 0.2 },
      ],
      { duration, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
    )

    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 450, easing: "ease-out", delay: duration - 220 }
    )

    window.setTimeout(() => {
      el.remove()
    }, duration + 30)
  }

  const handleSaveFavorite = async (srcEl: HTMLElement) => {
    if (!isHydrated || !user || !accessToken) {
      toast("Please sign in to save favorites")
      window.dispatchEvent(new Event("auth:signin"))
      return
    }
    if (isSavingFavorite || isFavorited) return

    setIsSavingFavorite(true)
    try {
      const mainIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.slice(0, 5) : []
      await saveFavorite(
        {
          recipe,
          title: recipe.title,
          imageUrl: recipe.image,
          mealType: recipe.mealType,
          prepTime: recipe.time,
          difficulty: recipe.difficulty,
          mainIngredients,
        },
        accessToken
      )
      setIsFavorited(true)
      toast.success("Saved to Favorites")
      animateFavoriteToFooter(srcEl)
    } catch {
      toast.error("Could not save favorite. Please try again.")
    } finally {
      setIsSavingFavorite(false)
    }
  }

  const difficultyStyles = {
    EASY: "bg-[#FDE9DD] text-[#EA6A12]",
    MEDIUM: "bg-[#FDE9DD] text-[#EA6A12]",
    HARD: "bg-[#FDE9DD] text-[#EA6A12]",
  }

  // Collapsed card view
  if (!isExpanded) {
    if (isMobile) {
      return (
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex w-full items-start gap-3 rounded-xl border border-[#E2D9CC] bg-white p-3.5 text-left shadow-sm"
        >
          <div className="relative h-[88px] w-[112px] max-[480px]:w-[104px] shrink-0 overflow-hidden rounded-md bg-[#E4ECD4]/20">
            <Image src={recipe.image} alt={recipe.title} fill className="object-cover" sizes="120px" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col text-left">
            <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-[#1F3A2B]">
              {recipe.title}
            </h3>
            <div className="mt-1.5 flex min-w-0 items-center text-xs">
              <span className="flex shrink-0 items-center gap-1 text-[#1F3A2B]/70">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="min-w-0">{recipe.time}</span>
              </span>
              <span className="mx-2 h-3 w-px shrink-0 bg-[#1F3A2B]/25" aria-hidden />
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[#EA6A12]">
                {recipe.difficulty}
              </span>
              <span className="min-w-0 flex-1" aria-hidden />
            </div>
            <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
              <span className="inline-flex min-w-0 shrink rounded-full bg-[#E4ECD4] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#4F6B1F]">
                {recipe.mealType.toUpperCase()}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleSaveFavorite(e.currentTarget)
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E2D9CC] bg-white hover:bg-[#F7F3EB]"
                  aria-label={isFavorited ? "Saved to favorites" : "Save to favorites"}
                  disabled={isSavingFavorite}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isFavorited ? "fill-[#F97316] text-[#F97316]" : "text-[#4F6B1F]"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </button>
      )
    }

    return (
      <div className="overflow-hidden rounded-xl border border-[#E2D9CC] bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-[180px] sm:w-[280px] sm:rounded-l-xl lg:h-[190px] lg:w-[320px]">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
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
                <h3 className="font-serif text-[20px] font-bold text-[#1F3A2B] leading-tight">
                  {recipe.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#1F3A2B]/70">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {recipe.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {recipe.servings} servings
                  </span>
                  {recipe.isVegetarian && (
                    <span className="flex items-center gap-1.5 text-[#4F6B1F]">
                      <Leaf className="h-4 w-4" />
                      Vegetarian
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleSaveFavorite(e.currentTarget)}
                className="rounded-lg border border-[#E2D9CC] p-2 hover:bg-[#E4ECD4]"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isFavorited ? "fill-[#F97316] text-[#F97316]" : "text-[#4F6B1F]"
                  )}
                />
              </button>
            </div>

            {/* Desktop ingredients preview */}
            {!isMobile && (
              <div className="mt-3 hidden sm:block">
                <p className="text-xs font-semibold text-[#1F3A2B]">Ingredients</p>
                <div className="mt-2 grid grid-cols-2 gap-x-10 gap-y-1 lg:grid-cols-3">
                  {recipe.ingredients.slice(0, 6).map((ingredient, index) => (
                    <p
                      key={index}
                      className="text-xs text-[#1F3A2B]/70"
                    >
                      <span className="mr-2 text-[#F97316]">•</span>
                      {ingredient}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex items-center justify-end pt-4">
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#EA6A12] hover:text-[#F28C38]"
              >
                View Full Recipe
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Expanded card view - Mobile (shared with Favorites — see `RecipeDetailMobileView`)
  if (isMobile) {
    return (
      <RecipeDetailMobileView
        recipe={recipe}
        onBack={onToggleExpand}
        heartFilled={isFavorited}
        onHeartClick={(e) => void handleSaveFavorite(e.currentTarget)}
        heartAriaLabel={isFavorited ? "Saved to favorites" : "Save to favorites"}
        heartDisabled={isSavingFavorite || isFavorited}
        showBackLink={!hideMobileRecipeBackLink}
        collapseOnImage={hideMobileRecipeBackLink}
        heartOnImageBottomRight={hideMobileRecipeBackLink}
      />
    )
  }

  // Expanded card view - Desktop
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E2D9CC] bg-white shadow-sm">
      <div className="flex">
        <div className="relative h-auto w-[280px] shrink-0 lg:w-[320px]">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          <button
            onClick={(e) => handleSaveFavorite(e.currentTarget)}
            className="absolute right-3 top-3 rounded-lg bg-white p-2 shadow-md"
            aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                isFavorited ? "fill-[#F97316] text-[#F97316]" : "text-[#4F6B1F]"
              )}
            />
          </button>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
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
              <h3 className="font-serif text-xl font-bold text-[#1F3A2B]">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-[#1F3A2B]/70">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {recipe.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {recipe.servings} servings
                </span>
                {recipe.isVegetarian && (
                  <span className="flex items-center gap-1.5 text-[#4F6B1F]">
                    <Leaf className="h-4 w-4" />
                    Vegetarian
                  </span>
                )}
              </div>
              <p className="text-sm text-[#1F3A2B]/70 leading-relaxed">{recipe.description}</p>
              <div className="flex gap-3 pt-1">
                <RecipeShare recipe={recipe} />
              </div>
            </div>
            <button
              onClick={onToggleExpand}
              className="rounded-full bg-[#F97316] p-2 text-white hover:bg-[#F28C38]"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2D9CC] p-5">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span className="text-[#F97316]">📦</span> Ingredients
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {recipe.ingredients.map((ingredient, index) => (
                <p key={index} className="text-sm text-[#1F3A2B]/70">
                  <span className="mr-2 text-[#F97316]">•</span>
                  {ingredient}
                </p>
              ))}
            </div>
            </div>

            <div className="rounded-xl bg-[#E4ECD4] p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#1F3A2B]">
                <span>🥄</span> Pro Tips
              </h4>
              <ul className="space-y-1">
                {recipe.proTips.map((tip, index) => (
                  <li key={index} className="text-sm text-[#4F6B1F]">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-[#1F3A2B]">
              <span className="text-[#F97316]">🔥</span> Instructions
            </h4>
            <div className="space-y-2.5">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-[#1F3A2B]/70 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[#E2D9CC] pt-5">
          <div className="grid grid-cols-4 gap-4 rounded-xl bg-[#F7F3EB] p-4 text-center">
            <div>
              <p className="text-xl font-bold text-[#1F3A2B]">{recipe.nutrition.calories}</p>
              <p className="text-sm text-[#1F3A2B]/70">Calories</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#1F3A2B]">{recipe.nutrition.protein}</p>
              <p className="text-sm text-[#1F3A2B]/70">Protein</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#1F3A2B]">{recipe.nutrition.carbs}</p>
              <p className="text-sm text-[#1F3A2B]/70">Carbs</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#1F3A2B]">{recipe.nutrition.fat}</p>
              <p className="text-sm text-[#1F3A2B]/70">Fat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Collapsed preview card for other recipes when one is expanded
interface RecipePreviewCardProps {
  recipe: Recipe
  onExpand: () => void
}

export function RecipePreviewCard({ recipe, onExpand }: RecipePreviewCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const difficultyStyles = {
    EASY: "bg-[#FDE9DD] text-[#EA6A12]",
    MEDIUM: "bg-[#FDE9DD] text-[#EA6A12]",
    HARD: "bg-[#FDE9DD] text-[#EA6A12]",
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E2D9CC] bg-white p-3 shadow-sm">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-28">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded bg-[#E4ECD4] px-2 py-0.5 text-xs font-semibold uppercase text-[#4F6B1F]">
            {recipe.mealType}
          </span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-xs font-semibold",
              difficultyStyles[recipe.difficulty]
            )}
          >
            {recipe.difficulty}
          </span>
        </div>
        <h4 className="font-serif font-semibold text-[#1F3A2B] truncate">{recipe.title}</h4>
        <div className="flex items-center gap-3 text-xs text-[#1F3A2B]/70">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings} servings
          </span>
          {recipe.isVegetarian && (
            <span className="flex items-center gap-1 text-[#4F6B1F]">
              <Leaf className="h-3 w-3" />
              Vegetarian
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="rounded-lg border border-[#E2D9CC] p-1.5 hover:bg-[#E4ECD4]"
          aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isFavorited ? "fill-[#F97316] text-[#F97316]" : "text-[#4F6B1F]"
            )}
          />
        </button>
        <button
          onClick={onExpand}
          className="rounded-lg border border-[#E2D9CC] p-1.5 hover:bg-[#E4ECD4]"
        >
          <ChevronDown className="h-4 w-4 text-[#4F6B1F]" />
        </button>
      </div>
    </div>
  )
}
