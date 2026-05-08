"use client"

import { useRecipeGeneratorState } from "@/features/recipes/state/recipes-state"

export function useRecipeGenerator() {
  return useRecipeGeneratorState()
}

