import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useWorkoutsStore } from './workouts.js'
import { useBodyStore } from './body.js'
import { useSettingsStore } from './settings.js'
import { offlineQueue } from '../lib/offlineQueue.js'

const SUPABASE_URL = 'https://envscdgmonrlczfleoib.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Nob9dd2IzFjYQsqPGwb4qg_4Mf5giRz'

export const useCloudStore = defineStore('cloud', () => {
  const client = ref(null)
  const user = ref(null)
  const syncStatus = ref('idle')
  const lastError = ref(null)
  const lastSyncedAt = ref(null)
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const queueSize = ref(offlineQueue.size())

  // authReady = sesja została odczytana z localStorage (getSession zakończony).
  // Router guard czeka na to przed decyzją o przekierowaniu, żeby nie wyrzucić
  // zalogowanego użytkownika na ekran logowania zanim sesja się wczyta.
  const authReady = ref(false)
  let _resolveAuthReady
  const _authReadyPromise = new Promise((res) => { _resolveAuthReady = res })
  function waitForAuth() { return _authReadyPromise }

  let _workoutSyncDebounce = null
  let _settingsSyncDebounce = null
  let _watchers = []
  let _lastUserId = null
  let _knownWorkoutIds = new Set()
  let _knownBodyIds = new Set()
  let _dirtyWorkoutIds = new Set()
  let _dirtyBodyIds = new Set()

  const isLoggedIn = computed(() => !!user.value)

  function init() {
    if (client.value) return client.value
    client.value = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    })

    // Online/offline tracking
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { isOnline.value = true })
      window.addEventListener('offline', () => { isOnline.value = false })
    }

    // Register queue handlers
    offlineQueue.registerHandler('upsertWorkouts', async (rows) => {
      const { error } = await client.value.from('workouts').upsert(rows)
      if (error) throw error
    })
    offlineQueue.registerHandler('deleteWorkouts', async (ids) => {
      const { error } = await client.value.from('workouts').delete().in('id', ids)
      if (error) throw error
    })
    offlineQueue.registerHandler('upsertBody', async (rows) => {
      const { error } = await client.value.from('body_log').upsert(rows)
      if (error && error.code !== '42P01') throw error
    })
    offlineQueue.registerHandler('deleteBody', async (ids) => {
      const { error } = await client.value.from('body_log').delete().in('id', ids)
      if (error && error.code !== '42P01') throw error
    })
    offlineQueue.registerHandler('upsertSettings', async (data) => {
      const { error } = await client.value.from('user_settings')
        .upsert({ user_id: user.value?.id, data })
      if (error && error.code !== '42P01') throw error
    })

    // Track queue size for UI
    offlineQueue.on('change', () => { queueSize.value = offlineQueue.size() })
    offlineQueue.on('flush-end', () => { queueSize.value = offlineQueue.size() })

    client.value.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null
      user.value = u
      if (u) onLogin(u)
    }).catch((e) => {
      // Offline bez zapisanej sesji: getSession odczytuje z localStorage,
      // ale na wszelki wypadek nie blokujemy startu aplikacji.
      console.warn('[cloud] getSession failed:', e)
    }).finally(() => {
      authReady.value = true
      _resolveAuthReady()
    })

    client.value.auth.onAuthStateChange((event, session) => {
      const u = session?.user || null
      const prevId = _lastUserId
      user.value = u
      _lastUserId = u?.id || null
      if (u && u.id !== prevId) onLogin(u)
      if (!u && prevId) onLogout()
    })

    return client.value
  }

  async function onLogin(u) {
    _knownWorkoutIds = new Set()
    _knownBodyIds = new Set()
    _dirtyWorkoutIds = new Set()
    _dirtyBodyIds = new Set()
    await initialSync()
    armWatchers()
  }

  function onLogout() {
    _knownWorkoutIds = new Set()
    _knownBodyIds = new Set()
    _dirtyWorkoutIds = new Set()
    _dirtyBodyIds = new Set()
    for (const stop of _watchers) stop()
    _watchers = []
  }

  function armWatchers() {
    if (_watchers.length) return
    const workouts = useWorkoutsStore()
    const body = useBodyStore()
    const settings = useSettingsStore()

    _watchers.push(watch(() => workouts.history, () => {
      // Deep watcher fires on any change — mark all current IDs as dirty
      // since pinpointing which specific record changed without JSON diffing is expensive
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

  async function initialSync() {
    if (!user.value) return
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      const workouts = useWorkoutsStore()
      const body = useBodyStore()
      const settings = useSettingsStore()

      // --- Workouts ---
      const { data: cloudWorkouts, error: wErr } = await client.value
        .from('workouts').select('id, data')
      if (wErr) throw wErr

      const wCloud = new Map(cloudWorkouts.map(r => [r.id, r.data]))
      const wLocal = new Map(workouts.history.map(w => [w.id, w]))
      const wMerged = new Map()
      // Merge all IDs from both sources
      const allWorkoutIds = new Set([...wCloud.keys(), ...wLocal.keys()])
      for (const id of allWorkoutIds) {
        const cloud = wCloud.get(id)
        const local = wLocal.get(id)
        if (!cloud) { wMerged.set(id, local); continue }
        if (!local) { wMerged.set(id, cloud); continue }
        // Both exist — compare timestamps, keep newer; tie-break by field count
        const cloudTs = cloud.finishedAt || cloud.date || ''
        const localTs = local.finishedAt || local.date || ''
        if (localTs > cloudTs) { wMerged.set(id, local) }
        else if (cloudTs > localTs) { wMerged.set(id, cloud) }
        else { wMerged.set(id, Object.keys(local).length >= Object.keys(cloud).length ? local : cloud) }
      }
      workouts.setHistory(Array.from(wMerged.values()))

      const wToUpload = Array.from(wLocal.entries())
        .filter(([id]) => !wCloud.has(id))
        .map(([id, w]) => ({ id, user_id: user.value.id, data: w }))
      if (wToUpload.length) {
        const { error } = await client.value.from('workouts').upsert(wToUpload)
        if (error) throw error
      }
      _knownWorkoutIds = new Set(wMerged.keys())

      // --- Body log ---
      const { data: cloudBody, error: bErr } = await client.value
        .from('body_log').select('id, data')
      if (bErr && bErr.code !== '42P01') throw bErr  // 42P01 = table doesn't exist yet

      if (!bErr) {
        const bCloud = new Map(cloudBody.map(r => [r.id, r.data]))
        const bLocal = new Map(body.entries.map(e => [e.id, e]))
        const bMerged = new Map()
        const allBodyIds = new Set([...bCloud.keys(), ...bLocal.keys()])
        for (const id of allBodyIds) {
          const cloud = bCloud.get(id)
          const local = bLocal.get(id)
          if (!cloud) { bMerged.set(id, local); continue }
          if (!local) { bMerged.set(id, cloud); continue }
          const cloudTs = cloud.date || ''
          const localTs = local.date || ''
          if (localTs > cloudTs) { bMerged.set(id, local) }
          else if (cloudTs > localTs) { bMerged.set(id, cloud) }
          else { bMerged.set(id, Object.keys(local).length >= Object.keys(cloud).length ? local : cloud) }
        }
        body.replaceEntries(Array.from(bMerged.values()))

        const bToUpload = Array.from(bLocal.entries())
          .filter(([id]) => !bCloud.has(id))
          .map(([id, e]) => ({ id, user_id: user.value.id, data: e }))
        if (bToUpload.length) {
          const { error } = await client.value.from('body_log').upsert(bToUpload)
          if (error && error.code !== '42P01') throw error
        }
        _knownBodyIds = new Set(bMerged.keys())
      }

      // --- Settings (single row per user) ---
      const { data: cloudSettings, error: sErr } = await client.value
        .from('user_settings').select('data').eq('user_id', user.value.id).maybeSingle()
      if (sErr && sErr.code !== '42P01' && sErr.code !== 'PGRST116') throw sErr

      if (cloudSettings?.data) {
        // Cloud settings exist — apply to local (cloud wins on initial)
        settings.applyRemote(cloudSettings.data)
      } else if (!sErr || sErr.code === 'PGRST116') {
        // No cloud settings → upload local
        const { error } = await client.value.from('user_settings')
          .upsert({ user_id: user.value.id, data: settings.settings })
        if (error && error.code !== '42P01') throw error
      }

      syncStatus.value = 'ok'
      lastSyncedAt.value = Date.now()
    } catch (e) {
      syncStatus.value = 'error'
      lastError.value = e.message || String(e)
      console.error('[cloud] initialSync error:', e)
    }
  }

  function scheduleDeltaSync() {
    if (!user.value) return
    if (_workoutSyncDebounce) clearTimeout(_workoutSyncDebounce)
    _workoutSyncDebounce = setTimeout(() => deltaSync(), 1500)
  }

  function scheduleSettingsSync() {
    if (!user.value) return
    if (_settingsSyncDebounce) clearTimeout(_settingsSyncDebounce)
    _settingsSyncDebounce = setTimeout(() => settingsSync(), 800)
  }

  async function deltaSync() {
    if (!user.value) return
    const workouts = useWorkoutsStore()
    const body = useBodyStore()
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      // Workouts — only upsert dirty (new/changed) records
      const wIds = new Set(workouts.history.map(w => w.id))
      const wDel = [..._knownWorkoutIds].filter(id => !wIds.has(id))
      const wUp = workouts.history
        .filter(w => _dirtyWorkoutIds.has(w.id))
        .map(w => ({ id: w.id, user_id: user.value.id, data: w }))
      if (wUp.length) offlineQueue.enqueue('upsertWorkouts', wUp)
      if (wDel.length) offlineQueue.enqueue('deleteWorkouts', wDel)
      _knownWorkoutIds = wIds
      _dirtyWorkoutIds = new Set()

      // Body log — only upsert dirty records
      const bIds = new Set(body.entries.map(e => e.id))
      const bDel = [..._knownBodyIds].filter(id => !bIds.has(id))
      const bUp = body.entries
        .filter(e => _dirtyBodyIds.has(e.id))
        .map(e => ({ id: e.id, user_id: user.value.id, data: e }))
      if (bUp.length) offlineQueue.enqueue('upsertBody', bUp)
      if (bDel.length) offlineQueue.enqueue('deleteBody', bDel)
      _knownBodyIds = bIds
      _dirtyBodyIds = new Set()

      syncStatus.value = isOnline.value ? 'ok' : 'queued'
      lastSyncedAt.value = Date.now()
    } catch (e) {
      syncStatus.value = 'error'
      lastError.value = e.message || String(e)
      console.error('[cloud] deltaSync error:', e)
    }
  }

  async function settingsSync() {
    if (!user.value) return
    const settings = useSettingsStore()
    offlineQueue.enqueue('upsertSettings', { ...settings.settings })
    lastSyncedAt.value = Date.now()
  }

  async function signUp(email, password) {
    lastError.value = null
    const { data, error } = await client.value.auth.signUp({ email, password })
    if (error) { lastError.value = error.message; throw error }
    return data
  }

  async function signIn(email, password) {
    lastError.value = null
    const { data, error } = await client.value.auth.signInWithPassword({ email, password })
    if (error) { lastError.value = error.message; throw error }
    return data
  }

  async function signOut() {
    await client.value.auth.signOut()
    user.value = null
  }

  async function forceSync() {
    await deltaSync()
    await settingsSync()
  }

  async function flushQueue() {
    await offlineQueue.flush()
  }

  return {
    client, user, syncStatus, lastError, lastSyncedAt, isLoggedIn,
    isOnline, queueSize, authReady,
    init, waitForAuth, signUp, signIn, signOut, forceSync, flushQueue
  }
})
