"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  IngredientVoiceRecognition,
  IngredientVoiceRecognitionResultEvent,
} from "@/lib/ingredient-voice-types"
import { parseIngredientText } from "@/lib/parse-ingredient-text"
import {
  canUseMediaRecorderFallback,
  getSpeechRecognitionConstructor,
  isWebSpeechRecognitionAvailable,
  pickRecorderMimeType,
} from "@/lib/speech-browser"
import { transcribeSpeechAudio } from "@/features/recipe-generator/services/speech-transcribe"
import { getRequestId } from "@/lib/request-id"

const MSG_PERMISSION =
  "Microphone permission was denied. Please enable microphone access or type ingredients."
const MSG_VOICE_FAIL = "Voice input did not work on this device. Please type ingredients."

type VoicePhase = "idle" | "web_listening" | "media_recording" | "transcribing"

export type IngredientVoiceUi = {
  phase: VoicePhase
  statusMessage: string | null
  errorMessage: string | null
  isMicBusy: boolean
}

function getStatusForPhase(phase: VoicePhase): string | null {
  if (phase === "web_listening") return "Listening… say ingredients"
  if (phase === "media_recording") return "Recording… tap the mic to stop"
  if (phase === "transcribing") return "Transcribing…"
  return null
}

function appendRecognitionResults(ev: IngredientVoiceRecognitionResultEvent, finals: { current: string }, interim: { current: string }) {
  for (let i = ev.resultIndex; i < ev.results.length; i++) {
    const row = ev.results[i]
    if (!row) continue
    const piece = row[0]?.transcript ?? ""
    if (row.isFinal) {
      finals.current += piece
      interim.current = ""
    } else {
      interim.current = piece
    }
  }
}

export function useIngredientVoiceInput(options: { onVoiceTags: (tags: string[]) => void }) {
  const { onVoiceTags } = options
  const onVoiceTagsRef = useRef(onVoiceTags)
  onVoiceTagsRef.current = onVoiceTags

  const [phase, setPhase] = useState<VoicePhase>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const phaseRef = useRef<VoicePhase>("idle")
  phaseRef.current = phase

  const recognitionRef = useRef<IngredientVoiceRecognition | null>(null)
  const stoppedByUserRef = useRef(false)
  const suppressRecognitionCommitRef = useRef(false)
  const transcriptFinalRef = useRef("")
  const transcriptInterimRef = useRef("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunksRef = useRef<Blob[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recorderMimeRef = useRef<string | undefined>(undefined)

  const commitRawTranscript = useCallback((raw: string) => {
    const tags = parseIngredientText(raw)
    if (tags.length === 0) {
      setErrorMessage(MSG_VOICE_FAIL)
      return
    }
    setErrorMessage(null)
    onVoiceTagsRef.current(tags)
  }, [])

  const stopMediaStream = useCallback(() => {
    const s = mediaStreamRef.current
    if (s) {
      for (const t of s.getTracks()) t.stop()
    }
    mediaStreamRef.current = null
  }, [])

  const cleanupWebRecognition = useCallback(() => {
    const r = recognitionRef.current
    recognitionRef.current = null
    if (!r) return
    try {
      r.onresult = null
      r.onerror = null
      r.onend = null
      r.abort()
    } catch {
      /* ignore */
    }
  }, [])

  const finishMediaAndUpload = useCallback(async () => {
    const rec = mediaRecorderRef.current
    if (!rec || rec.state === "inactive") {
      setPhase("idle")
      return
    }

    setPhase("transcribing")
    const mime = recorderMimeRef.current

    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve()
      try {
        if (rec.state === "recording") {
          rec.requestData()
        }
      } catch {
        /* ignore */
      }
      try {
        rec.stop()
      } catch {
        resolve()
      }
    })

    mediaRecorderRef.current = null
    stopMediaStream()

    const chunks = mediaChunksRef.current
    mediaChunksRef.current = []
    const blob = new Blob(chunks, { type: mime ?? "audio/webm" })

    if (blob.size < 32) {
      setErrorMessage(MSG_VOICE_FAIL)
      setPhase("idle")
      return
    }

    try {
      const text = await transcribeSpeechAudio(blob, mime, getRequestId())
      commitRawTranscript(text)
    } catch {
      setErrorMessage(MSG_VOICE_FAIL)
    } finally {
      setPhase("idle")
    }
  }, [commitRawTranscript, stopMediaStream])

  const startMediaRecording = useCallback(async () => {
    setErrorMessage(null)
    if (!canUseMediaRecorderFallback()) {
      setErrorMessage(MSG_VOICE_FAIL)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const mime = pickRecorderMimeType()
      recorderMimeRef.current = mime
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mediaChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data)
      }
      recorder.onerror = () => {
        setErrorMessage(MSG_VOICE_FAIL)
        stopMediaStream()
        setPhase("idle")
        mediaRecorderRef.current = null
      }
      mediaRecorderRef.current = recorder
      const sliceMs = 250
      recorder.start(sliceMs)
      setPhase("media_recording")
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ""
      if (name === "NotAllowedError" || name === "SecurityError") {
        setErrorMessage(MSG_PERMISSION)
      } else {
        setErrorMessage(MSG_VOICE_FAIL)
      }
      stopMediaStream()
      setPhase("idle")
    }
  }, [stopMediaStream])

  const startWebListening = useCallback(() => {
    setErrorMessage(null)
    const Ctor = getSpeechRecognitionConstructor()
    if (!Ctor) {
      setErrorMessage(MSG_VOICE_FAIL)
      return
    }

    stoppedByUserRef.current = false
    transcriptFinalRef.current = ""
    transcriptInterimRef.current = ""

    const finals = { current: "" }
    const interim = { current: "" }

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US"

    recognition.onresult = (ev) => {
      appendRecognitionResults(ev, finals, interim)
      transcriptFinalRef.current = finals.current
      transcriptInterimRef.current = interim.current
    }

    recognition.onerror = (ev) => {
      const code = ev.error
      if (code === "aborted" && stoppedByUserRef.current) {
        return
      }
      suppressRecognitionCommitRef.current = true
      if (code === "not-allowed") {
        setErrorMessage(MSG_PERMISSION)
      } else {
        setErrorMessage(MSG_VOICE_FAIL)
      }
      recognitionRef.current = null
      setPhase("idle")
    }

    recognition.onend = () => {
      recognitionRef.current = null
      const skipCommit = suppressRecognitionCommitRef.current
      suppressRecognitionCommitRef.current = false
      const combined = (transcriptFinalRef.current + transcriptInterimRef.current).trim()
      transcriptFinalRef.current = ""
      transcriptInterimRef.current = ""
      finals.current = ""
      interim.current = ""
      setPhase("idle")
      if (!skipCommit && combined) {
        commitRawTranscript(combined)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setPhase("web_listening")
    } catch {
      recognitionRef.current = null
      setErrorMessage(MSG_VOICE_FAIL)
      setPhase("idle")
    }
  }, [commitRawTranscript])

  const stopWebListening = useCallback(() => {
    const r = recognitionRef.current
    if (!r) return
    stoppedByUserRef.current = true
    try {
      r.stop()
    } catch {
      try {
        r.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      setPhase("idle")
    }
  }, [])

  const handleMicClick = useCallback(() => {
    if (phaseRef.current === "transcribing") return

    if (phaseRef.current === "web_listening") {
      stopWebListening()
      return
    }

    if (phaseRef.current === "media_recording") {
      void finishMediaAndUpload()
      return
    }

    if (isWebSpeechRecognitionAvailable()) {
      startWebListening()
      return
    }

    if (canUseMediaRecorderFallback()) {
      void startMediaRecording()
      return
    }

    setErrorMessage(MSG_VOICE_FAIL)
  }, [finishMediaAndUpload, startMediaRecording, startWebListening, stopWebListening])

  useEffect(() => {
    return () => {
      cleanupWebRecognition()
      const rec = mediaRecorderRef.current
      if (rec && rec.state !== "inactive") {
        try {
          rec.stop()
        } catch {
          /* ignore */
        }
      }
      mediaRecorderRef.current = null
      stopMediaStream()
    }
  }, [cleanupWebRecognition, stopMediaStream])

  const ui: IngredientVoiceUi = {
    phase,
    statusMessage: errorMessage ? null : getStatusForPhase(phase),
    errorMessage,
    isMicBusy: phase === "transcribing",
  }

  return { handleMicClick, voiceUi: ui }
}
