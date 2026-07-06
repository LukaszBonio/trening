import { ref, computed } from 'vue'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

type VoiceCallback = (value: number) => void

const SpeechRecognitionImpl: typeof SpeechRecognition | undefined =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined

export function useVoiceInput() {
  const isListening = ref(false)
  const lastTranscript = ref('')
  const isSupported = computed(() => !!SpeechRecognitionImpl)

  let recognition: SpeechRecognition | null = null
  let _callback: VoiceCallback | null = null

  function parseNumber(text: string): number | null {
    const cleaned = text.trim().replace(',', '.')
    const match = cleaned.match(/(\d+\.?\d*)/)
    if (match) return parseFloat(match[1])
    return null
  }

  function startListening(callback: VoiceCallback): void {
    if (!SpeechRecognitionImpl || isListening.value) return
    _callback = callback
    recognition = new SpeechRecognitionImpl()
    recognition.lang = 'pl-PL'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = 0; i < event.results[0].length; i++) {
        const transcript = event.results[0][i].transcript
        lastTranscript.value = transcript
        const num = parseNumber(transcript)
        if (num !== null && num >= 0) {
          _callback?.(num)
          return
        }
      }
    }

    recognition.onend = () => { isListening.value = false }
    recognition.onerror = () => { isListening.value = false }

    recognition.start()
    isListening.value = true
  }

  function stopListening(): void {
    if (recognition) {
      recognition.abort()
      recognition = null
    }
    isListening.value = false
  }

  return { isListening, isSupported, lastTranscript, startListening, stopListening }
}
