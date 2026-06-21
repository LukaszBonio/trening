// Pure functions: derive achievements from history + body log.
// Each achievement = { id, icon, title, desc, unlockedAt: ISO|null, progress?: {current, target} }

import { currentStreak, personalRecords } from './analytics.js'

function date(workout) { return new Date(workout.date) }

function firstWorkoutBy(history, predicate) {
  const sorted = [...history].sort((a, b) => date(a) - date(b))
  return sorted.find(predicate)?.date || null
}

export function computeAchievements(history, bodyEntries) {
  const list = []

  // Count-based
  const counts = [1, 10, 25, 50, 100, 250]
  const sorted = [...history].sort((a, b) => date(a) - date(b))
  for (const n of counts) {
    const w = sorted[n - 1]
    list.push({
      id: `count_${n}`,
      icon: n === 1 ? 'ti-flame' : 'ti-trophy',
      title: n === 1 ? 'Pierwszy trening' : `${n} treningów`,
      desc: n === 1 ? 'Start drogi 🚀' : `${n} sesji w bazie`,
      unlockedAt: w ? w.date : null,
      progress: w ? null : { current: sorted.length, target: n }
    })
  }

  // Streak
  const streak = currentStreak(history)
  const streakMilestones = [2, 4, 8, 12]
  for (const m of streakMilestones) {
    list.push({
      id: `streak_${m}`,
      icon: 'ti-bolt',
      title: `${m} tyg. z rzędu`,
      desc: `Streak ${m} tygodni bez przerwy`,
      unlockedAt: streak >= m ? new Date().toISOString() : null,
      progress: streak >= m ? null : { current: streak, target: m }
    })
  }

  // Push/Pull/Legs balance
  for (const t of ['push', 'pull', 'legs']) {
    const n = history.filter(w => w.type === t).length
    list.push({
      id: `${t}_10`,
      icon: t === 'push' ? 'ti-arrow-up' : t === 'pull' ? 'ti-arrow-down' : 'ti-run',
      title: `${t.toUpperCase()} ×10`,
      desc: `10 sesji ${t.toUpperCase()}`,
      unlockedAt: n >= 10 ? firstWorkoutBy(history, w => w.type === t && history.filter(h => h.type === t && date(h) <= date(w)).length === 10) : null,
      progress: n >= 10 ? null : { current: n, target: 10 }
    })
  }

  // First PR ≥ 100kg
  const prs = personalRecords(history)
  const hundredKg = prs.find(p => p.weight >= 100)
  list.push({
    id: 'pr_100kg',
    icon: 'ti-weight',
    title: '100 kg klub',
    desc: 'Pierwsza seria z ciężarem ≥ 100 kg',
    unlockedAt: hundredKg ? hundredKg.date : null
  })

  // Body log entries
  if (bodyEntries && bodyEntries.length) {
    const milestones = [1, 10, 30]
    for (const m of milestones) {
      list.push({
        id: `body_${m}`,
        icon: 'ti-scale',
        title: m === 1 ? 'Pierwszy pomiar' : `${m} pomiarów wagi`,
        desc: m === 1 ? 'Świadomość = progres' : `${m} zapisów wagi ciała`,
        unlockedAt: bodyEntries.length >= m ? bodyEntries.sort((a, b) => a.date.localeCompare(b.date))[m - 1].date : null,
        progress: bodyEntries.length >= m ? null : { current: bodyEntries.length, target: m }
      })
    }
  }

  return list
}

export function unlockedCount(achievements) {
  return achievements.filter(a => a.unlockedAt).length
}
