"use client"

import { apiFetch } from "@/lib/api"
import { getRequestId } from "@/lib/request-id"

export type UserPreferencesResponse = {
  preferredCuisines: string[]
  hasCompletedOnboarding: boolean
}

export async function fetchUserPreferences(accessToken: string): Promise<UserPreferencesResponse> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/user/preferences", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    requestId,
  })
  if (!res.ok) {
    throw new Error("Could not load preferences.")
  }
  const data = (await res.json()) as UserPreferencesResponse
  return {
    preferredCuisines: Array.isArray(data?.preferredCuisines) ? data.preferredCuisines : [],
    hasCompletedOnboarding: Boolean(data?.hasCompletedOnboarding),
  }
}

export async function saveUserPreferences(accessToken: string, preferredCuisines: string[]): Promise<UserPreferencesResponse> {
  const requestId = getRequestId()
  const { res } = await apiFetch("/api/user/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ preferredCuisines }),
    requestId,
    safeLogFields: { cuisinesCount: Array.isArray(preferredCuisines) ? preferredCuisines.length : 0 },
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new Error(msg || "Could not save preferences.")
  }
  const data = (await res.json()) as UserPreferencesResponse
  return {
    preferredCuisines: Array.isArray(data?.preferredCuisines) ? data.preferredCuisines : [],
    hasCompletedOnboarding: Boolean(data?.hasCompletedOnboarding),
  }
}

