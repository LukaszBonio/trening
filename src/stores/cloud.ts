import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { useWorkoutsStore } from './workouts'
import { useBodyStore } from './body'
import { useSettingsStore } from './settings'
import { offlineQueue } from '../lib/offlineQueue'
import { setAuthToken } from '../lib/auth'

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://envscdgmonrlczfleoib.supabase.co'
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_KEY || 'sb_publishable_Nob9dd2IzFjYQsqPGwb4qg_4Mf5giRz'

export const useCloudStore = defineStore('cloud', () => {
  const client = ref<SupabaseClient | null>(null)
  const user = ref<User | null>(null)
  const syncStatus = ref<'idle' | 'syncing' | 'ok' | 'error' | 'queued'>('idle')
  const lastError = ref<string | null>(null)
  const lastSyncedAt = ref<number | null>(null)
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const queueSize = ref(offlineQueue.size())

  const authReady = ref(false)
  let _resolveAuthReady: () => void
  const _authReadyPromise = new Promise<void>((res) => { _resolveAuthReady = res })
  function waitForAuth(): Promise<void> { return _authReadyPromise }

  let _workoutSyncDebounce: ReturnType<typeof setTimeout> | null = null
  let _settingsSyncDebounce: ReturnType<typeof setTimeout> | null = null
  let _watchers: (() => void)[] = []
  let _lastUserId: string | null = null
  let _knownWorkoutIds = new Set<string>()
  let _knownBodyIds = new Set<string>()
  let _dirtyWorkoutIds = new Set<string>()
  let _dirtyBodyIds = new Set<string>()

  const isLoggedIn = computed(() => !!user.value)

  function init(): SupabaseClient {
    if (client.value) return client.value
    client.value = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    })

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { isOnline.value = true })
      window.addEventListener('offline', () => { isOnline.value = false })
    }

    offlineQueue.registerHandler('upsertWorkouts', async (rows: unknown[]) => {
      const { error } = await client.value!.from('workouts').upsert(rows)
      if (error) throw error
    })
    offlineQueue.registerHandler('deleteWorkouts', async (ids: string[]) => {
      const { error } = await client.value!.from('workouts').delete().in('id', ids)
      if (error) throw error
    })
    offlineQueue.registerHandler('upsertBody', async (rows: unknown[]) => {
      const { error } = await client.value!.from('body_log').upsert(rows)
      if (error && error.code !== '42P01') throw error
    })
    offlineQueue.registerHandler('deleteBody', async (ids: string[]) => {
      const { error } = await client.value!.from('body_log').delete().in('id', ids)
      if (error && error.code !== '42P01') throw error
    })
    offlineQueue.registerHandler('upsertSettings', async (data: unknown) => {
      const { error } = await client.value!.from('user_settings')
        .upsert({ user_id: user.value?.id, data })
      if (error && error.code !== '42P01') throw error
    })

    offlineQueue.on('change', () => { queueSize.value = offlineQueue.size() })
    offlineQueue.on('flush-end', () => { queueSize.value = offlineQueue.size() })

    client.value.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null
      setAuthToken(data.session?.access_token || null)
      user.value = u
      if (u) onLogin(u)
    }).catch((e) => {
      console.warn('[cloud] getSession failed:', e)
    }).finally(() => {
      authReady.value = true
      _resolveAuthReady()
    })

    client.value.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null
      setAuthToken(session?.access_token || null)
      const prevId = _lastUserId
      user.value = u
      _lastUserId = u?.id || null
      if (u && u.id !== prevId) onLogin(u)
      if (!u && prevId) onLogout()
    })

    return client.value
  }

  async function onLogin(_u: User): Promise<void> {
    _knownWorkoutIds = new Set()
    _knownBodyIds = new Set()
    _dirtyWorkoutIds = new Set()
    _dirtyBodyIds = new Set()
    await initialSync()
    armWatchers()
  }

  function onLogout(): void {
    _knownWorkoutIds = new Set()
    _knownBodyIds = new Set()
    _dirtyWorkoutIds = new Set()
    _dirtyBodyIds = new Set()
    for (const stop of _watchers) stop()
    _watchers = []
  }

  function armWatchers(): void {
    if (_watchers.length) return
    const workouts = useWorkoutsStore()
    const body = useBodyStore()
    const settings = useSettingsStore()

    _watchers.push(watch(() => workouts.history, () => {
      const currentIds = new Set(workouts.history.map(w => w.id))
      for (const id of currentIds) _dirtyWorkoutIds.add(id)
      scheduleDeltaSync()
    }, { deep: true }))
    _watchers.push(watch(() => body.entries, () => {
      const currentIds = new Set(body.entries.map(e => e.id))
      for (const id of currentIds) _dirtyBodyIds.add(id)
      scheduleDeltaSync()
    }, { deep: true }))
    _watchers.push(watch(() => settings.settings, () => scheduleSettingsSync(), { deep: true }))
  }

  async function initialSync(): Promise<void> {
    if (!user.value) return
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      const workouts = useWorkoutsStore()
      const body = useBodyStore()
      const settings = useSettingsStore()

      const { data: cloudWorkouts, error: wErr } = await client.value!
        .from('workouts').select('id, data, updated_at')
      if (wErr) throw wErr

      const wCloud = new Map(cloudWorkouts!.map((r: any) => [r.id, { data: r.data, dbUpdatedAt: r.updated_at }]))
      const wLocal = new Map(workouts.history.map(w => [w.id, w]))
      const wMerged = new Map()
      const allWorkoutIds = new Set([...wCloud.keys(), ...wLocal.keys()])
      for (const id of allWorkoutIds) {
        const cloudEntry = wCloud.get(id)
        const local = wLocal.get(id)
        if (!cloudEntry) { wMerged.set(id, local); continue }
        const cloud = cloudEntry.data as any
        if (!local) { wMerged.set(id, cloud); continue }
        const cloudTs = cloud.updatedAt || new Date(cloudEntry.dbUpdatedAt || 0).getTime() || 0
        const localTs = local.updatedAt || local.finishedAt || 0
        if (localTs > cloudTs) { wMerged.set(id, local) }
        else if (cloudTs > localTs) { wMerged.set(id, cloud) }
        else { wMerged.set(id, Object.keys(local).length >= Object.keys(cloud).length ? local : cloud) }
      }
      workouts.setHistory(Array.from(wMerged.values()))

      const wToUpload = Array.from(wLocal.entries())
        .filter(([id]) => !wCloud.has(id))
        .map(([id, w]) => ({ id, user_id: user.value!.id, data: w }))
      if (wToUpload.length) {
        const { error } = await client.value!.from('workouts').upsert(wToUpload)
        if (error) throw error
      }
      _knownWorkoutIds = new Set(wMerged.keys())

      const { data: cloudBody, error: bErr } = await client.value!
        .from('body_log').select('id, data, updated_at')
      if (bErr && bErr.code !== '42P01') throw bErr

      if (!bErr) {
        const bCloud = new Map(cloudBody!.map((r: any) => [r.id, { data: r.data, dbUpdatedAt: r.updated_at }]))
        const bLocal = new Map(body.entries.map(e => [e.id, e]))
        const bMerged = new Map()
        const allBodyIds = new Set([...bCloud.keys(), ...bLocal.keys()])
        for (const id of allBodyIds) {
          const cloudEntry = bCloud.get(id)
          const local = bLocal.get(id)
          if (!cloudEntry) { bMerged.set(id, local); continue }
          const cloud = cloudEntry.data as any
          if (!local) { bMerged.set(id, cloud); continue }
          const cloudTs = cloud.updatedAt || new Date(cloudEntry.dbUpdatedAt || 0).getTime() || 0
          const localTs = (local as any).updatedAt || 0
          if (localTs > cloudTs) { bMerged.set(id, local) }
          else if (cloudTs > localTs) { bMerged.set(id, cloud) }
          else { bMerged.set(id, Object.keys(local).length >= Object.keys(cloud).length ? local : cloud) }
        }
        body.replaceEntries(Array.from(bMerged.values()))

        const bToUpload = Array.from(bLocal.entries())
          .filter(([id]) => !bCloud.has(id))
          .map(([id, e]) => ({ id, user_id: user.value!.id, data: e }))
        if (bToUpload.length) {
          const { error } = await client.value!.from('body_log').upsert(bToUpload)
          if (error && error.code !== '42P01') throw error
        }
        _knownBodyIds = new Set(bMerged.keys())
      }

      const { data: cloudSettings, error: sErr } = await client.value!
        .from('user_settings').select('data, updated_at').eq('user_id', user.value!.id).maybeSingle()
      if (sErr && sErr.code !== '42P01' && sErr.code !== 'PGRST116') throw sErr

      if (cloudSettings?.data) {
        const remote = cloudSettings.data as Record<string, unknown>
        const local = settings.settings as Record<string, unknown>
        const cloudTs = new Date(cloudSettings.updated_at || 0).getTime()
        const localTs = (local._updatedAt as number) || 0
        if (cloudTs > localTs) {
          settings.applyRemote(remote as any)
        } else if (localTs > cloudTs) {
          const { error } = await client.value!.from('user_settings')
            .upsert({ user_id: user.value!.id, data: settings.settings })
          if (error && error.code !== '42P01') throw error
        }
      } else if (!sErr || sErr.code === 'PGRST116') {
        const { error } = await client.value!.from('user_settings')
          .upsert({ user_id: user.value!.id, data: settings.settings })
        if (error && error.code !== '42P01') throw error
      }

      syncStatus.value = 'ok'
      lastSyncedAt.value = Date.now()
    } catch (e: any) {
      syncStatus.value = 'error'
      lastError.value = e.message || String(e)
      console.error('[cloud] initialSync error:', e)
    }
  }

  function scheduleDeltaSync(): void {
    if (!user.value) return
    if (_workoutSyncDebounce) clearTimeout(_workoutSyncDebounce)
    _workoutSyncDebounce = setTimeout(() => deltaSync(), 1500)
  }

  function scheduleSettingsSync(): void {
    if (!user.value) return
    if (_settingsSyncDebounce) clearTimeout(_settingsSyncDebounce)
    _settingsSyncDebounce = setTimeout(() => settingsSync(), 800)
  }

  async function deltaSync(): Promise<void> {
    if (!user.value) return
    const workouts = useWorkoutsStore()
    const body = useBodyStore()
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      const wIds = new Set(workouts.history.map(w => w.id))
      const wDel = [..._knownWorkoutIds].filter(id => !wIds.has(id))
      const wUp = workouts.history
        .filter(w => _dirtyWorkoutIds.has(w.id))
        .map(w => ({ id: w.id, user_id: user.value!.id, data: w, updated_at: new Date().toISOString() }))
      if (wUp.length) offlineQueue.enqueue('upsertWorkouts', wUp)
      if (wDel.length) offlineQueue.enqueue('deleteWorkouts', wDel)
      _knownWorkoutIds = wIds
      _dirtyWorkoutIds = new Set()

      const bIds = new Set(body.entries.map(e => e.id))
      const bDel = [..._knownBodyIds].filter(id => !bIds.has(id))
      const bUp = body.entries
        .filter(e => _dirtyBodyIds.has(e.id))
        .map(e => ({ id: e.id, user_id: user.value!.id, data: e, updated_at: new Date().toISOString() }))
      if (bUp.length) offlineQueue.enqueue('upsertBody', bUp)
      if (bDel.length) offlineQueue.enqueue('deleteBody', bDel)
      _knownBodyIds = bIds
      _dirtyBodyIds = new Set()

      syncStatus.value = isOnline.value ? 'ok' : 'queued'
      lastSyncedAt.value = Date.now()
    } catch (e: any) {
      syncStatus.value = 'error'
      lastError.value = e.message || String(e)
      console.error('[cloud] deltaSync error:', e)
    }
  }

  async function settingsSync(): Promise<void> {
    if (!user.value) return
    const settings = useSettingsStore()
    offlineQueue.enqueue('upsertSettings', { ...settings.settings })
    lastSyncedAt.value = Date.now()
  }

  async function signUp(email: string, password: string) {
    lastError.value = null
    const { data, error } = await client.value!.auth.signUp({ email, password })
    if (error) { lastError.value = error.message; throw error }
    return data
  }

  async function signIn(email: string, password: string) {
    lastError.value = null
    const { data, error } = await client.value!.auth.signInWithPassword({ email, password })
    if (error) { lastError.value = error.message; throw error }
    return data
  }

  async function signOut(): Promise<void> {
    await client.value!.auth.signOut()
    user.value = null
  }

  // Wysyła e-mail z linkiem do zresetowania hasła. redirectTo musi być na liście
  // "Redirect URLs" w panelu Supabase (Auth → URL Configuration), inaczej Supabase
  // użyje domyślnego Site URL.
  async function resetPassword(email: string): Promise<void> {
    lastError.value = null
    const redirectTo = typeof window !== 'undefined'
      ? window.location.origin + (import.meta.env?.BASE_URL || '/')
      : undefined
    const { error } = await client.value!.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : {}
    )
    if (error) { lastError.value = error.message; throw error }
  }

  // Dokańcza reset: ustawia sesję z tokenów z linku e-mail, zmienia hasło, wylogowuje
  // (żeby user zalogował się świeżo nowym hasłem).
  async function completePasswordReset(
    tokens: { at: string; rt: string },
    newPassword: string
  ): Promise<void> {
    lastError.value = null
    const { error: sErr } = await client.value!.auth.setSession({
      access_token: tokens.at,
      refresh_token: tokens.rt
    })
    if (sErr) { lastError.value = sErr.message; throw sErr }
    const { error: uErr } = await client.value!.auth.updateUser({ password: newPassword })
    if (uErr) { lastError.value = uErr.message; throw uErr }
    await client.value!.auth.signOut()
    user.value = null
  }

  async function forceSync(): Promise<void> {
    await deltaSync()
    await settingsSync()
  }

  async function flushQueue(): Promise<void> {
    await offlineQueue.flush()
  }

  return {
    client, user, syncStatus, lastError, lastSyncedAt, isLoggedIn,
    isOnline, queueSize, authReady,
    init, waitForAuth, signUp, signIn, signOut, resetPassword, completePasswordReset, forceSync, flushQueue
  }
})
