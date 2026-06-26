// Wspólne helpery formatujące — wcześniej zduplikowane w HistoryView, WorkoutView, CompletionSummary.

/**
 * Format duration in seconds as "Xm Ys".
 * Zwraca '—' dla 0/null/undefined.
 */
export function formatDuration(sec) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

/**
 * Format MM:SS — dla timera (zawsze pokaż 00:00, nie '—').
 */
export function formatClock(sec) {
  const v = Math.max(0, sec | 0)
  const m = Math.floor(v / 60)
  const s = v % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Format daty wraz z godziną w lokalnym formacie polskim.
 */
export function formatDateTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}
