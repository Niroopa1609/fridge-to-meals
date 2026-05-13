"use client"

import type { Recipe } from "@/components/recipe-card"
import { RecipeCard, RecipePreviewCard } from "@/components/recipe-card"

type Props = {
  recipes: Recipe[]
  expandedRecipeId: string | null
  onToggleExpand: (recipeId: string) => void
  isMobile: boolean
  title?: string
  subtitle?: string
  rightAction?: React.ReactNode
  containerClassName?: string
  /** Today’s Picks: hide “Back to recipes” on mobile expanded detail */
  hideMobileRecipeBackLink?: boolean
}

export function RecipesSection({
  recipes,
  expandedRecipeId,
  onToggleExpand,
  isMobile,
  title = "Your Recipes",
  subtitle,
  rightAction,
  containerClassName,
  hideMobileRecipeBackLink = false,
}: Props) {
  return (
    <div
      className={
        containerClassName ??
        "mx-auto mt-6 w-full min-w-0 max-w-[1360px] rounded-xl border border-[#E2D9CC] bg-white p-4 shadow-sm sm:p-6"
      }
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-bold text-[#1F3A2B] sm:text-xl">{title}</h3>
          <div className="mt-2 h-0.5 w-12 bg-[#F97316]" />
          {subtitle ? <p className="mt-2 text-sm text-[#1F3A2B]/60">{subtitle}</p> : null}
        </div>
        {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id
          if (expandedRecipeId && !isExpanded) {
            return (
              <RecipePreviewCard
                key={recipe.id}
                recipe={recipe}
                onExpand={() => onToggleExpand(recipe.id)}
              />
            )
          }
          return (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isExpanded={isExpanded}
              onToggleExpand={() => onToggleExpand(recipe.id)}
              isMobile={isMobile}
              hideMobileRecipeBackLink={hideMobileRecipeBackLink}
            />
          )
        })}
      </div>
    </div>
  )
}

