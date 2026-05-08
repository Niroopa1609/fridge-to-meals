/**
 * Web Speech recognition surface used for ingredient capture.
 * (DOM lib may omit the main SpeechRecognition interface while including result types.)
 */
export interface IngredientVoiceRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onend: ((this: IngredientVoiceRecognition, ev: Event) => void) | null
  onerror: ((this: IngredientVoiceRecognition, ev: IngredientVoiceRecognitionErrorEvent) => void) | null
  onresult: ((this: IngredientVoiceRecognition, ev: IngredientVoiceRecognitionResultEvent) => void) | null
}

export interface IngredientVoiceRecognitionResultEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

export interface IngredientVoiceRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

export type IngredientVoiceRecognitionCtor = new () => IngredientVoiceRecognition
