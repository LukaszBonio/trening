import { detectMuscle, EXERCISE_TO_MUSCLE } from './muscles.js'

const _substitutesCache = new Map();

/**
 * @param {string} exerciseName
 * @param {number} max
 * @param {string|null} muscleHeadOverride
 */
export function findSubstitutes(exerciseName, max = 5, muscleHeadOverride = null) {
  const cacheKey = `${(exerciseName || '').toLowerCase().trim()}|${max}|${muscleHeadOverride || ''}`
  if (_substitutesCache.has(cacheKey)) return _substitutesCache.get(cacheKey)
  const targetMuscle = muscleHeadOverride || detectMuscle(exerciseName)
  if (!targetMuscle) { _substitutesCache.set(cacheKey, []); return [] }
  const currentNorm = exerciseName.toLowerCase().trim()

  const all = Object.entries(EXERCISE_TO_MUSCLE)
    .filter(([key, muscle]) => muscle === targetMuscle && key !== currentNorm)
    .map(([key]) => key)

  all.sort((a, b) => b.length - a.length)

  const filtered = []
  for (const key of all) {
    const isShortVariant = filtered.some(longer => longer.includes(key))
    if (!isShortVariant) filtered.push(key)
  }

  const seen = new Set()
  const deduped = []
  for (const key of filtered) {
    const norm = key.toLowerCase().replace(/[-\s]/g, '')
    if (seen.has(norm)) continue
    seen.add(norm)
    deduped.push(key)
  }

  const display = deduped
    .map(k => k.charAt(0).toUpperCase() + k.slice(1))
    .filter(d => d.toLowerCase() !== currentNorm)

  if (display.length <= max) {
    _substitutesCache.set(cacheKey, display)
    return display
  }

  const seed = exerciseName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shuffled = [...display].sort((a, b) => {
    const ha = (a.length + a.charCodeAt(0) + seed) % 100
    const hb = (b.length + b.charCodeAt(0) + seed) % 100
    return ha - hb
  })
  const result = shuffled.slice(0, max)
  _substitutesCache.set(cacheKey, result)
  return result
}

export function youtubeSearchUrl(exerciseName) {
  const query = encodeURIComponent(exerciseName + ' technika ćwiczenia')
  return `https://www.youtube.com/results?search_query=${query}`
}
