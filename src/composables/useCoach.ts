import { ref } from 'vue'
import {
  runCoachAnalysis,
  runCoachChat,
  COACH_MIN_WORKOUTS,
  type CoachAnalysis,
  type CoachMessage
} from '../lib/coach'
import type { Workout } from '../lib/analytics'

// Stan modułowy (singleton) — czat i analiza przeżywają przełączanie zakładek w sesji.
const analysis = ref<CoachAnalysis | null>(null)
const analyzedAt = ref<number | null>(null)
const analyzing = ref(false)
const analyzeError = ref('')

const messages = ref<CoachMessage[]>([])
const chatBusy = ref(false)

let _analyzeCtrl: AbortController | null = null

export function useCoach() {
  async function analyze(history: Workout[]): Promise<void> {
    if (analyzing.value) return
    analyzeError.value = ''
    if (history.length < COACH_MIN_WORKOUTS) {
      analyzeError.value = `Potrzeba min. ${COACH_MIN_WORKOUTS} treningów do analizy.`
      return
    }
    if (_analyzeCtrl) _analyzeCtrl.abort()
    _analyzeCtrl = new AbortController()
    analyzing.value = true
    try {
      analysis.value = await runCoachAnalysis(history, { signal: _analyzeCtrl.signal })
      analyzedAt.value = Date.now()
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      analyzeError.value = !navigator.onLine
        ? 'Jesteś offline — analiza wymaga internetu.'
        : (e?.message || 'Nie udało się wykonać analizy.')
    } finally {
      analyzing.value = false
      _analyzeCtrl = null
    }
  }

  async function ask(text: string, ctx: { goalLabel: string; history: Workout[] }): Promise<void> {
    const clean = String(text || '').trim()
    if (!clean || chatBusy.value) return
    messages.value.push({ role: 'user', text: clean })
    chatBusy.value = true
    try {
      const reply = await runCoachChat({ goalLabel: ctx.goalLabel, history: ctx.history, messages: messages.value })
      messages.value.push({ role: 'assistant', text: reply || 'Nie mam na to dobrej odpowiedzi.' })
    } catch (e: any) {
      messages.value.push({
        role: 'assistant',
        text: !navigator.onLine
          ? '⚠️ Jesteś offline — czat z coachem wymaga internetu.'
          : '⚠️ Nie udało się połączyć z AI. Spróbuj ponownie za chwilę.'
      })
    } finally {
      chatBusy.value = false
    }
  }

  function clearChat(): void {
    messages.value = []
  }

  return {
    analysis, analyzedAt, analyzing, analyzeError,
    messages, chatBusy,
    analyze, ask, clearChat
  }
}
