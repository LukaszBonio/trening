// Barrel re-export — moduły wydzielone do muscles.js, plans.js, substitutions.js
export { MUSCLE_NAMES, EXERCISE_TO_MUSCLE, detectMuscle, getMuscleName, detectEquipment } from './muscles.js'
export { PLANS, getRandomPlan } from './plans.js'
export { findSubstitutes, youtubeSearchUrl } from './substitutions.js'
