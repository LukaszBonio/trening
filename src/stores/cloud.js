import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useWorkoutsStore } from './workouts.js'

const SUPABASE_URL = 'https://envscdgmonrlczfleoib.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Nob9dd2IzFjYQsqPGwb4qg_4Mf5giRz'

export const useCloudStore = defineStore('cloud', () => {
  const client = ref(null)
  const user = ref(null)
  const syncStatus = ref('idle')   // 'idle' | 'syncing' | 'ok' | 'error'
  const lastError = ref(null)
  const lastSyncedAt = ref(null)

  let _syncDebounce = null
  let _historyWatcher = null
  let _lastUserId = null
  let _knownIds = new Set()  // ids already in cloud (tracked locally to compute delta)

  const isLoggedIn = computed(() => !!user.value)

  function init() {
    if (client.value) return client.value
    client.value = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    })

    client.value.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null
      user.value = u
      if (u) onLogin(u)
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
    _knownIds = new Set()
    await initialSync()
    armHistoryWatcher()
  }

  function onLogout() {
    _knownIds = new Set()
    if (_historyWatcher) { _historyWatcher(); _historyWatcher = null }
  }

  function armHistoryWatcher() {
    if (_historyWatcher) return
    const workouts = useWorkoutsStore()
    _historyWatcher = watch(
      () => workouts.history,
      () => scheduleDeltaSync(),
      { deep: true }
    )
  }

  async function initialSync() {
    if (!user.value) return
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      const workouts = useWorkoutsStore()

      // Pull cloud workouts
      const { data: cloudRows, error: pullErr } = await client.value
        .from('workouts')
        .select('id, data')
      if (pullErr) throw pullErr

      const cloudById = new Map(cloudRows.map(r => [r.id, r.data]))
      const localById = new Map(workouts.history.map(w => [w.id, w]))

      // Merge: last-write-wins by id; for now prefer local (more recently edited)
      const merged = new Map(cloudById)
      for (const [id, w] of localById) merged.set(id, w)

      // Update local
      workouts.setHistory(Array.from(merged.values()))

      // Compute and push delta (local items not in cloud)
      const toUpload = Array.from(localById.entries())
        .filter(([id]) => !cloudById.has(id))
        .map(([id, w]) => ({ id, user_id: user.value.id, data: w }))

      if (toUpload.length) {
        const { error: upErr } = await client.value.from('workouts').upsert(toUpload)
        if (upErr) throw upErr
      }

      _knownIds = new Set(merged.keys())
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
    if (_syncDebounce) clearTimeout(_syncDebounce)
    _syncDebounce = setTimeout(() => deltaSync(), 1500)
  }

  async function deltaSync() {
    if (!user.value) return
    const workouts = useWorkoutsStore()
    syncStatus.value = 'syncing'
    lastError.value = null
    try {
      const currentIds = new Set(workouts.history.map(w => w.id))

      // New or changed → upsert all current (cheap; rows are small)
      const toUpload = workouts.history.map(w => ({
        id: w.id,
        user_id: user.value.id,
        data: w
      }))

      // Deleted → ids in _knownIds but not in currentIds
      const toDelete = [..._knownIds].filter(id => !currentIds.has(id))

      if (toUpload.length) {
        const { error: upErr } = await client.value.from('workouts').upsert(toUpload)
        if (upErr) throw upErr
      }
      if (toDelete.length) {
        const { error: delErr } = await client.value
          .from('workouts')
          .delete()
          .in('id', toDelete)
        if (delErr) throw delErr
      }

      _knownIds = currentIds
      syncStatus.value = 'ok'
      lastSyncedAt.value = Date.now()
    } catch (e) {
      syncStatus.value = 'error'
      lastError.value = e.message || String(e)
      console.error('[cloud] deltaSync error:', e)
    }
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
  }

  return {
    client, user, syncStatus, lastError, lastSyncedAt, isLoggedIn,
    init, signUp, signIn, signOut, forceSync
  }
})
