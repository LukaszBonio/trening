import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'tp_profiles_v1'
const ACTIVE_KEY = 'tp_active_profile_v1'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {}
  return [{ id: 'default', name: 'Ja', createdAt: Date.now() }]
}

function loadActiveId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || 'default'
  } catch {
    return 'default'
  }
}

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref(loadProfiles())
  const activeId = ref(loadActiveId())

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeId.value) || profiles.value[0] || null
  )

  function addProfile(name) {
    const id = `p_${Date.now()}`
    profiles.value.push({ id, name, createdAt: Date.now() })
    return id
  }

  function removeProfile(id) {
    profiles.value = profiles.value.filter(p => p.id !== id)
    if (activeId.value === id) {
      activeId.value = profiles.value[0]?.id || 'default'
    }
  }

  function setActive(id) {
    activeId.value = id
  }

  watch(profiles, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch {}
  }, { deep: true })

  watch(activeId, (v) => {
    try { localStorage.setItem(ACTIVE_KEY, v) } catch {}
  })

  return { profiles, activeId, activeProfile, addProfile, removeProfile, setActive }
})
