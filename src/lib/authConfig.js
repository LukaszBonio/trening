// ============================================================
//  BRAMKA LOGOWANIA (auth gate) — feature flag
// ============================================================
// Gdy true: cała aplikacja wymaga zalogowania (router przekierowuje
// niezalogowanych na ekran /login).
//
// ⚠️ ŁATWE WYŁĄCZENIE / WYCOFANIE:
//   1. Najszybciej: ustaw REQUIRE_AUTH = false poniżej.
//      Guard w src/router/index.js stanie się no-opem, aplikacja
//      wróci do działania bez logowania (sync nadal opcjonalny).
//   2. Pełne usunięcie funkcji: usuń ten plik, blok router.beforeEach
//      w src/router/index.js, trasę 'login' oraz src/views/LoginView.vue.
//      Żaden inny kod nie zależy od tej flagi.
// ============================================================
export const REQUIRE_AUTH = true
