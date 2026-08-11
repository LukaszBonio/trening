// Śledzenie ukończeń dni programu w obrębie bieżącego tygodnia treningowego.
// Tydzień zaczyna się w PONIEDZIAŁEK (ISO). „W tym tygodniu" = znacznik czasu
// w oknie [poniedziałek 00:00, następny poniedziałek 00:00).
// Używane przez ProgramPanel do pokazywania „Wykonano" zamiast „Trenuj".

/** Znacznik czasu początku tygodnia (poniedziałek 00:00 czasu lokalnego) dla danego ts. */
export function startOfTrainingWeek(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()          // 0=niedziela, 1=poniedziałek … 6=sobota
  const daysFromMonday = (day + 6) % 7
  d.setDate(d.getDate() - daysFromMonday)
  return d.getTime()
}

/** Czy dwa znaczniki czasu należą do tego samego tygodnia treningowego (pon–niedz)? */
export function isSameTrainingWeek(a: number, b: number): boolean {
  return startOfTrainingWeek(a) === startOfTrainingWeek(b)
}
