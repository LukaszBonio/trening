// Obsługa błędów ładowania leniwych chunków (dynamic import) po deployu PWA.
//
// Po nowym deployu stare chunki (hash w nazwie) znikają z serwera, a service worker
// (skipWaiting + cleanupOutdatedCaches) czyści je z cache w trakcie sesji. Wtedy każdy
// `import()` starego modułu pada z "Failed to fetch dynamically imported module".
// Przeładowanie strony na świeży index.html poda nowe hashe chunków i naprawia sytuację.
//
// Używane w: router (leniwe widoki, onError) oraz ExerciseInfoModal (leniwy arkusz techniki).

export function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch dynamically/i.test(msg)
}

const RELOAD_KEY = 'tp_chunk_reload_at'

/**
 * Przeładowuje stronę, ale najwyżej raz na `withinMs` (ochrona przed pętlą, gdy chunk
 * jest trwale niedostępny). Zwraca `true`, gdy faktycznie zainicjowano reload; `false`,
 * gdy pominięto z powodu throttlingu (czyli świeże przeładowanie NIE naprawiło problemu).
 * `withinMs = 0` wymusza reload (pomija throttling) — dla ręcznego przycisku "Odśwież".
 */
export function reloadForFreshChunks(withinMs = 10000): boolean {
  if (typeof window === 'undefined') return false
  let last = 0
  try { last = Number(sessionStorage.getItem(RELOAD_KEY) || 0) } catch { /* tryb prywatny */ }
  const now = Date.now()
  if (withinMs > 0 && now - last < withinMs) return false
  try { sessionStorage.setItem(RELOAD_KEY, String(now)) } catch { /* ignore */ }
  window.location.reload()
  return true
}
