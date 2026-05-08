"use client"

import type { ReactNode } from "react"

export type MealTypeOption = {
  id: string
  name: string
  apiValue: string
  icon: ReactNode
}

export const MEAL_TYPES: MealTypeOption[] = [
  {
    id: "soup",
    name: "Soup",
    apiValue: "Soup",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <path d="M7 16h18v2c0 5-4 9-9 9s-9-4-9-9v-2Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M11 12c0-2 1-3 2-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 12c0-2 1-4 2-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 12c0-2-1-3-2-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "salad",
    name: "Salad",
    apiValue: "Salad",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <path
          d="M16 6C13 10 11 12 10 15c-1 4 1 9 6 12c5-3 7-8 6-12c-1-3-3-5-6-9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M16 10v14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "starter",
    name: "Appetizer",
    apiValue: "Appetizer",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <ellipse cx="16" cy="20" rx="9.5" ry="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M6 22c2.5 3 6 4.5 10 4.5S23.5 25 26 22"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="19" r="1.2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="18.5" r="1.2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="20" cy="19" r="1.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    id: "breakfast",
    name: "Breakfast",
    apiValue: "Breakfast",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 5V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 23V27" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 16H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M23 16H27" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.5 8.5l2.6 2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M20.9 20.9l2.6 2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.5 23.5l2.6-2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M20.9 11.1l2.6-2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "lunch",
    name: "Lunch",
    apiValue: "Lunch",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <rect x="6" y="15" width="20" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 18H26" stroke="currentColor" strokeWidth="1.7" />
        <path d="M11 12c0-2 1-3 2-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 12c0-2 1-4 2-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 12c0-2-1-3-2-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "snack",
    name: "Snack",
    apiValue: "Snack",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <path
          d="M16 12c-3.8 0-6.5 2.9-6.5 6.7c0 4.7 3 7.3 6.5 7.3s6.5-2.6 6.5-7.3C22.5 14.9 19.8 12 16 12Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M16 12c0-2.5 1.2-4 3.2-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M13.2 11c-1.1-1-2.3-1-3.2 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dinner",
    name: "Dinner",
    apiValue: "Dinner",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 sm:h-8 sm:w-8">
        <ellipse cx="16" cy="24" rx="10" ry="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 24c0-7 4.5-12 10-12s10 5 10 12" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 10v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="16" cy="9" r="1.7" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
]

export const getMealTypeApiValues = (mealTypeIds: string[]) => {
  const byId = new Map(MEAL_TYPES.map((t) => [t.id, t] as const))
  return mealTypeIds.map((id) => byId.get(id)?.apiValue).filter((v): v is string => Boolean(v))
}

