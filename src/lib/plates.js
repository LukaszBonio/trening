// Standardowe talerze siłowe (kg), od największego do najmniejszego
const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]
const DEFAULT_BAR = 20

// Kolory typowe dla talerzy siłowych
const PLATE_COLORS = {
  25:   { bg: '#dc2626', text: '#fff' },
  20:   { bg: '#2563eb', text: '#fff' },
  15:   { bg: '#facc15', text: '#000' },
  10:   { bg: '#16a34a', text: '#fff' },
  5:    { bg: '#f4f4f5', text: '#000' },
  2.5:  { bg: '#27272a', text: '#fff' },
  1.25: { bg: '#52525b', text: '#fff' }
}

/**
 * Rozkłada ciężar na talerze (per stronę sztangi).
 * Zwraca { plates: [{ weight, count }], remainder } gdzie remainder>0 = nie da się dokładnie.
 */
export function calculatePlates(targetWeight, barWeight = DEFAULT_BAR, available = DEFAULT_PLATES) {
  if (targetWeight < barWeight) {
    return { plates: [], perSide: 0, remainder: 0, impossible: true, barWeight }
  }
  const perSide = (targetWeight - barWeight) / 2
  let remaining = perSide
  const plates = []
  for (const w of available) {
    if (remaining >= w) {
      const count = Math.floor(remaining / w)
      plates.push({ weight: w, count, color: PLATE_COLORS[w] })
      remaining = +(remaining - count * w).toFixed(3)
    }
  }
  return {
    plates,
    perSide,
    remainder: +remaining.toFixed(3),
    impossible: false,
    barWeight
  }
}

export { DEFAULT_PLATES, DEFAULT_BAR, PLATE_COLORS }
