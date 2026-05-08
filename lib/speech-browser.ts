/**
 * Typed helpers for hybrid voice input (Web Speech vs MediaRecorder).
 */

import type { IngredientVoiceRecognitionCtor } from "@/lib/ingredient-voice-types"

export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof navigator !== "undefined"
}

type WindowWithSpeech = Window & {
  SpeechRecognition?: IngredientVoiceRecognitionCtor
  webkitSpeechRecognition?: IngredientVoiceRecognitionCtor
}

/** Web Speech API constructor if exposed by the browser (Chrome, Edge, Safari). */
export function getSpeechRecognitionConstructor(): IngredientVoiceRecognitionCtor | null {
  if (!isBrowserEnvironment()) return null
  const w = window as WindowWithSpeech
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
  return ctor ?? null
}

/** True when `window.SpeechRecognition || window.webkitSpeechRecognition` is present. */
export function isWebSpeechRecognitionAvailable(): boolean {
  if (!isBrowserEnvironment()) return false
  const w = window as WindowWithSpeech
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export function isGetUserMediaAvailable(): boolean {
  if (!isBrowserEnvironment() || typeof navigator === "undefined") return false
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

export function isMediaRecorderAvailable(): boolean {
  if (!isBrowserEnvironment()) return false
  return typeof MediaRecorder !== "undefined"
}

export function canUseMediaRecorderFallback(): boolean {
  return isGetUserMediaAvailable() && isMediaRecorderAvailable()
}

export function pickRecorderMimeType(): string | undefined {
  if (!isMediaRecorderAvailable()) return undefined
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/aac",
    "audio/ogg;codecs=opus",
  ]
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

export function extensionForMime(mime: string | undefined): string {
  if (!mime) return "webm"
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) return "m4a"
  if (mime.includes("ogg")) return "ogg"
  return "webm"
}
