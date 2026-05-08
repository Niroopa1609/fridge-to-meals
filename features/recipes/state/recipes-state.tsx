"use client"

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react"
import type { Recipe } from "@/components/recipe-card"
import type { RecipeGeneratorFormState, UiRecipe } from "@/features/recipe-generator/types"
import { getMealTypeApiValues } from "@/features/recipe-generator/constants"
import { generateRecipes } from "@/features/recipe-generator/services/recipes"
import { normalizeBackendRecipe } from "@/features/recipe-generator/services/recipe-mappers"
import { getRequestId } from "@/lib/request-id"
import { logError, logInfo } from "@/lib/logger"

type TodayPicksState = {
  fridgeCount: number | null
  recipes: Recipe[]
  warnings: string[]
  loading: boolean
  error: string | null
  hasLoaded: boolean
}

type RecipeGeneratorState = {
  ingredients: string[]
  cuisine: string
  mealPrepTime: string
  cookingStyle: string
  mealTypeIds: string[]
  recipes: UiRecipe[]
  isLoading: boolean
  showRecipes: boolean
}

type RecipesState = {
  todayPicks: TodayPicksState
  recipeGenerator: RecipeGeneratorState
}

type Action =
  | { type: "todayPicks/set"; patch: Partial<TodayPicksState> }
  | { type: "recipeGenerator/set"; patch: Partial<RecipeGeneratorState> }

const initialState: RecipesState = {
  todayPicks: {
    fridgeCount: null,
    recipes: [],
    warnings: [],
    loading: false,
    error: null,
    hasLoaded: false,
  },
  recipeGenerator: {
    ingredients: [],
    cuisine: "any",
    mealPrepTime: "any",
    cookingStyle: "any",
    mealTypeIds: [],
    recipes: [],
    isLoading: false,
    showRecipes: false,
  },
}

function reducer(state: RecipesState, action: Action): RecipesState {
  switch (action.type) {
    case "todayPicks/set":
      return { ...state, todayPicks: { ...state.todayPicks, ...action.patch } }
    case "recipeGenerator/set":
      return { ...state, recipeGenerator: { ...state.recipeGenerator, ...action.patch } }
    default:
      return state
  }
}

type RecipesContextValue = {
  state: RecipesState
  setTodayPicks: (patch: Partial<TodayPicksState>) => void
  setRecipeGenerator: (patch: Partial<RecipeGeneratorState>) => void
  generateManualRecipes: () => Promise<void>
}

const RecipesContext = createContext<RecipesContextValue | null>(null)

export function RecipesStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setTodayPicks = useCallback((patch: Partial<TodayPicksState>) => {
    dispatch({ type: "todayPicks/set", patch })
  }, [])

  const setRecipeGenerator = useCallback((patch: Partial<RecipeGeneratorState>) => {
    dispatch({ type: "recipeGenerator/set", patch })
  }, [])

  const generateManualRecipes = useCallback(async () => {
    const requestId = getRequestId()
    const { ingredients, mealTypeIds, cuisine, cookingStyle, mealPrepTime } = state.recipeGenerator
    if (ingredients.length === 0) {
      alert("Please add at least one ingredient")
      return
    }
    if (mealTypeIds.length === 0) {
      alert("Please select at least one meal type")
      return
    }

    dispatch({ type: "recipeGenerator/set", patch: { isLoading: true, showRecipes: false } })
    try {
      logInfo("ui.generateRecipes.click", requestId, {
        ingredientsCount: ingredients.length,
        mealTypeCount: mealTypeIds.length,
        cuisine,
        cookingStyle,
        mealPrepTime,
      })

      const mealTypes = getMealTypeApiValues(mealTypeIds)
      const data = await generateRecipes(
        {
          ingredients,
          cuisine: cuisine !== "any" ? cuisine : null,
          mealPrepTime: mealPrepTime !== "any" ? mealPrepTime : null,
          cookingStyle: cookingStyle !== "any" ? cookingStyle : null,
          mealTypes,
        },
        requestId
      )

      const nextRecipes = Array.isArray(data.recipes) ? data.recipes.map(normalizeBackendRecipe) : []
      dispatch({ type: "recipeGenerator/set", patch: { recipes: nextRecipes, showRecipes: true } })
    } catch (e) {
      logError("ui.generateRecipes.error", requestId)
      console.error(e)
      alert("Failed to generate recipes. Please try again.")
    } finally {
      dispatch({ type: "recipeGenerator/set", patch: { isLoading: false } })
    }
  }, [state.recipeGenerator])

  const value = useMemo<RecipesContextValue>(
    () => ({ state, setTodayPicks, setRecipeGenerator, generateManualRecipes }),
    [state, setTodayPicks, setRecipeGenerator, generateManualRecipes]
  )

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>
}

export function useRecipesState() {
  const ctx = useContext(RecipesContext)
  if (!ctx) throw new Error("useRecipesState must be used within RecipesStateProvider")
  return ctx
}

export function useTodayPicksState() {
  const { state, setTodayPicks } = useRecipesState()
  return { todayPicks: state.todayPicks, setTodayPicks }
}

export function useRecipeGeneratorState() {
  const { state, setRecipeGenerator, generateManualRecipes } = useRecipesState()
  const rg = state.recipeGenerator
  const formState: RecipeGeneratorFormState = useMemo(
    () => ({
      ingredients: rg.ingredients,
      cuisine: rg.cuisine,
      mealPrepTime: rg.mealPrepTime,
      cookingStyle: rg.cookingStyle,
      mealTypeIds: rg.mealTypeIds,
    }),
    [rg.cookingStyle, rg.cuisine, rg.ingredients, rg.mealPrepTime, rg.mealTypeIds]
  )

  const canGenerate = rg.ingredients.length > 0 && rg.mealTypeIds.length > 0 && !rg.isLoading

  return {
    formState,
    setIngredients: (v: string[]) => setRecipeGenerator({ ingredients: v }),
    setCuisine: (v: string) => setRecipeGenerator({ cuisine: v }),
    setMealPrepTime: (v: string) => setRecipeGenerator({ mealPrepTime: v }),
    setCookingStyle: (v: string) => setRecipeGenerator({ cookingStyle: v }),
    setMealTypeIds: (v: string[]) => setRecipeGenerator({ mealTypeIds: v }),
    recipes: rg.recipes,
    isLoading: rg.isLoading,
    showRecipes: rg.showRecipes,
    canGenerate,
    generate: generateManualRecipes,
    setShowRecipes: (v: boolean) => setRecipeGenerator({ showRecipes: v }),
    setRecipes: (v: UiRecipe[]) => setRecipeGenerator({ recipes: v }),
  }
}

