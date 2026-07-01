import { defineStore } from 'pinia'
import { computed } from 'vue'
import { usePersistentRef } from '../composables/usePersistentRef.js'

export const useProfileStore = defineStore('profile', () => {
  const profiles = usePersistentRef('tp_profiles_v1', [{ id: 'default', name: 'Ja', createdAt: Date.now() }])
  const activeId = usePersistentRef('tp_active_profile_v1', 'default')

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

  return { profiles, activeId, activeProfile, addProfile, removeProfile, setActive }
})
