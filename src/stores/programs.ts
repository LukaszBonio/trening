import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCloudStore } from './cloud'
import type { GeneratedProgram } from '../lib/ai'

// Faza 1: jeden aktywny program tygodniowy. Zapis lokalny (localStorage) + best-effort
// sync do Supabase (tabela `programs`, kolumna data jsonb). Sync nie blokuje UI —
// program zawsze zapisuje się lokalnie, chmura dogania kiedy online/zalogowany.

const LOCAL_KEY = 'tp_program_v1'

export interface StoredProgram extends GeneratedProgram {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

function loadLocal(): StoredProgram | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function newId(): string {
  // UUID — kolumna `id` w tabeli Supabase `programs` jest typu uuid.
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}
  // Fallback (starsze środowiska) — v4-podobny UUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function defaultName(gen: GeneratedProgram): string {
  return `${gen.splitLabel} · ${gen.daysPerWeek}× / tydz`
}

export const useProgramsStore = defineStore('programs', () => {
  const current = ref<StoredProgram | null>(loadLocal())
  const cloud = useCloudStore()

  const hasProgram = computed(() => !!current.value)

  function persist(): void {
    try {
      if (current.value) localStorage.setItem(LOCAL_KEY, JSON.stringify(current.value))
      else localStorage.removeItem(LOCAL_KEY)
    } catch {}
  }

  // Best-effort zapis do chmury — cicho ignoruje offline / brak tabeli / brak logowania.
  async function syncUp(p: StoredProgram): Promise<void> {
    const c = cloud.client
    if (!c || !cloud.user || !cloud.isOnline) return
    try {
      await c.from('programs').upsert({
        id: p.id,
        user_id: cloud.user.id,
        data: p,
        updated_at: new Date(p.updatedAt).toISOString()
      })
    } catch { /* dane bezpieczne lokalnie */ }
  }

  // Zapisz wygenerowany program jako bieżący (zastępuje poprzedni).
  function save(gen: GeneratedProgram, name?: string): StoredProgram {
    const now = Date.now()
    const p: StoredProgram = {
      ...gen,
      id: current.value?.id || newId(),
      name: name || defaultName(gen),
      createdAt: current.value?.createdAt || now,
      updatedAt: now
    }
    current.value = p
    persist()
    void syncUp(p)
    return p
  }

  async function clear(): Promise<void> {
    const id = current.value?.id
    current.value = null
    persist()
    const c = cloud.client
    if (id && c && cloud.user && cloud.isOnline) {
      try { await c.from('programs').delete().eq('id', id) } catch {}
    }
  }

  // Pobierz najnowszy program z chmury; przyjmij, jeśli lokalnie pusto lub chmura nowsza.
  async function pull(): Promise<void> {
    const c = cloud.client
    if (!c || !cloud.user) return
    try {
      const { data, error } = await c.from('programs')
        .select('data, updated_at')
        .eq('user_id', cloud.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
      if (error || !data || !data.length) return
      const remote = data[0].data as StoredProgram
      const localUpdated = current.value?.updatedAt || 0
      const remoteUpdated = new Date(data[0].updated_at).getTime()
      if (!current.value || remoteUpdated > localUpdated) {
        current.value = remote
        persist()
      }
    } catch { /* offline / brak tabeli — zostajemy przy lokalnym */ }
  }

  return { current, hasProgram, save, clear, pull }
})
