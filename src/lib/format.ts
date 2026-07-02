export function formatDuration(sec: number | null | undefined): string {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

export function formatClock(sec: number): string {
  const v = Math.max(0, sec | 0)
  const m = Math.floor(v / 60)
  const s = v % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return iso || ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}
