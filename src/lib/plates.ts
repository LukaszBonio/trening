const DEFAULT_PLATES: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
const DEFAULT_BAR: number = 20

export interface PlateColor {
  bg: string
  text: string
}

const PLATE_COLORS: Record<number, PlateColor> = {
  25:   { bg: '#dc2626', text: '#fff' },
  20:   { bg: '#2563eb', text: '#fff' },
  15:   { bg: '#facc15', text: '#000' },
  10:   { bg: '#16a34a', text: '#fff' },
  5:    { bg: '#f4f4f5', text: '#000' },
  2.5:  { bg: '#27272a', text: '#fff' },
  1.25: { bg: '#52525b', text: '#fff' }
}

export interface PlateEntry {
  weight: number
  count: number
  color: PlateColor | undefined
}

export interface PlateResult {
  plates: PlateEntry[]
  perSide: number
  remainder: number
  impossible: boolean
  barWeight: number
}

export function calculatePlates(
  targetWeight: number,
  barWeight: number = DEFAULT_BAR,
  available: number[] = DEFAULT_PLATES
): PlateResult {
  if (targetWeight < barWeight) {
    return { plates: [], perSide: 0, remainder: 0, impossible: true, barWeight }
  }
  const perSide = (targetWeight - barWeight) / 2
  let remaining = perSide
  const plates: PlateEntry[] = []
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
