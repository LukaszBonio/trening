# Trening Pro — Audyt UX/UI, research rynku i plan redesignu

> Dokument strategiczny. Łączy research liderów rynku fitness (2025–2026) z audytem obecnej aplikacji
> i proponuje pełny redesign: architekturę informacji, design system, zmiany per ekran, priorytety i plan wdrożenia.
> Data: czerwiec 2026.

---

## ✅ Status wdrożenia (aktualizacja czerwiec 2026)

Większość rekomendacji z tego dokumentu została **wdrożona**:

- **Quick Wins:** ✅ PR jako 1. klasa · ✅ Workout Recap · ✅ confetti-na-PR · ✅ count-up · ✅ onboarding · ✅ heatmapa. *(pełna tokenizacja CSS — świadomie odłożona)*
- **Średni priorytet:** ✅ zakładka „Ty/Profil" + reorg IA (Historia → Postępy) · ✅ proaktywny overload + steppery + timer ±15 s · ✅ osiągnięcia/odznaki · ✅ seria wybaczająca · ✅ proaktywny coach.
- **Premium:** ✅ AI konwersacyjny (czat) · ✅ Strength Score · ✅ udostępnianie (Web Share) · ✅ wideo techniki (linki YT) · ✅ log masy/samopoczucia (substytut wearables).
- **Pozostaje (wymaga backendu / natywności):** ⬜ synchronizacja w chmurze + konta · ⬜ powiadomienia push · ⬜ pełny social (obserwowanie/leaderboardy) · ⬜ realny sync wearables (niemożliwy z web PWA).

Poniższy dokument zachowano jako pełny zapis researchu i uzasadnień projektowych.

---

## Streszczenie wykonawcze (TL;DR)

**Trening Pro jest zaskakująco dobrze pozycjonowany.** Ma rzeczy, których brakuje wielu konkurentom: generowanie planów AI, design w stylu „premium dark", akcent w kolorze limonki (dokładnie ten trend, w który poszła Strava), typografię Inter + Space Grotesk (Strava używa Inter), tryb offline (PWA) oraz wielozmysłowy timer odpoczynku (wibracja + dźwięk + głos). To nie jest aplikacja do przepisania od zera.

**Ale przegrywa w trzech obszarach, które decydują o retencji:**

1. **Brak onboardingu** — użytkownik jest „wrzucany" do aplikacji bez przewodnika. Badania: decyzja o pozostaniu zapada w ~20 sekund.
2. **Słaba gamifikacja i celebracja postępów** — są streaki, ale nie ma rekordów (PR) jako obiektu pierwszej klasy, osiągnięć, „streak-freeze", świętowania nowych rekordów. To największy lewar retencji (Fitbod: +40% konsekwencji po 6 miesiącach dzięki PR + strength score).
3. **AI jest reaktywne, nie wszechobecne** — trzeba kliknąć „Analizuj". Trend 2026: AI wplecione w przepływ, proaktywne, z **adaptacyjnym progressive overload** (automatyczna podpowiedź „dorzuć 2,5 kg").

**Rekomendacja:** nie redesign od zera, lecz **ewolucja warstwami** — najpierw Quick Wins (onboarding, PR, celebracje), potem ujednolicenie design systemu w tokeny, potem funkcje premium (AI proaktywne, social, sync w chmurze).

---

## Spis treści

1. [Metodologia i źródła](#metodologia)
2. [Część I — Research rynku](#czesc-i)
3. [Część II — Audyt Trening Pro](#czesc-ii)
4. [Część III — Redesign: architektura informacji + design system](#czesc-iii)
5. [Część IV — Zmiany per ekran + makiety opisowe](#czesc-iv)
6. [Część V — Priorytety (Quick Wins → Premium)](#czesc-v)
7. [Część VI — Plan wdrożenia](#czesc-vi)
8. [Źródła](#zrodla)

---

<a name="metodologia"></a>
## 1. Metodologia i źródła

Research oparty na ~10 zapytaniach do aktualnych źródeł branżowych (2025–2026) pokrywających: trendy projektowe, analizę Hevy/Fitbod/Strong/Strava/Jefit, wzorce nawigacji mobilnej, dark mode design systems, UX logowania serii i timera, gamifikację/retencję, funkcje AI 2026 oraz wizualizację progresu siłowego. Audyt Trening Pro oparty na bezpośredniej analizie kodu (`index.html`, `db.js`, `sw.js`). Pełna lista linków w sekcji [Źródła](#zrodla).

---

<a name="czesc-i"></a>
## 2. Część I — Research rynku

### 2.1. Trendy projektowe 2025–2026

| Trend | Opis | Źródło |
|---|---|---|
| **AI wpleciony naturalnie** | AI przestaje być osobną zakładką — wnika w interfejs (podpowiedzi w trakcie, konwersacja, adaptacja w czasie rzeczywistym). | Lyssna, Fitbod |
| **Minimalizm** | „Nie przeładowuj UI" — jeden cel na ekran, dużo oddechu. | Fireart, Dataconomy |
| **Mikro-interakcje** | Subtelne animacje, dźwięki, mechaniki postępu zamieniają wysiłek w satysfakcję. | Lyssna |
| **Personalizacja predykcyjna** | Dashboard pokazuje osobiste osiągnięcia (rekordy, kalorie), integruje wearables i głos. | Diversido, Fireart |
| **Dark mode jako standard** | Ciemne UI „czują się premium". Token-based, warianty akcentów per tło. | Muzli, UX Design Institute |
| **Dostępność i etyka** | >1 mld osób z niepełnosprawnościami — dostępność to konieczność, nie dodatek. | Dataconomy |
| **Biometria i regeneracja** | Whoop (HRV → regeneracja), Peloton (strefy tętna → rekomendacje). | Dataconomy |

### 2.2. Analiza liderów

**Hevy — mistrz logowania.** Zaprojektowany „od logowania", nie dokładany jak afterthought. Kluczowe: **auto-fill poprzednich ciężarów/powtórzeń** (jedno tknięcie = zaloguj serię → timer startuje sam), RPE, supersety, własne ćwiczenia. Social w darmowym planie (obserwowanie, leaderboardy) — accountability wbudowane w UX.

**Fitbod — mistrz personalizacji i danych.** Każda zalogowana seria (reps, sets, ciężar, sprzęt, wysiłek, opuszczone dni) zasila następny trening. Dobiera ćwiczenia wg statusu regeneracji mięśni i progressive overload. **Strength scores + PR tracking → 40% wyższa konsekwencja po 6 mies.** Szlifowany onboarding → dashboard → guided workout → progress recap. Wideo techniki.

**Strava — mistrz identyfikacji wizualnej.** Migracja na **Inter** (UI) + custom typeface Boathouse (branding). Nowy system kolorów: **hyper green, electric blue, sand beige** — dynamiczny, energetyczny. Dba o czytelność danych (pace/dystans/przewyższenie).

**Strong / StrongLifts — prostota logowania.** Tylko ciężar + powtórzenia, bez zbędnych pól. Timer odpoczynku auto-start na dole ekranu, ±15/30 s, notyfikacja wizualna i dźwiękowa, timery na lock screen / Dynamic Island.

**Jefit — głębia danych.** 20+ mln pobrań, „Best Fitness App 2024". Wykresy: szacowane 1RM w czasie, volume load per partia, kalendarz-heatmapa częstotliwości, PR (1RM, 5RM, najcięższa seria z 12).

**Nike Training Club / Freeletics** — wysokoprodukcyjne wideo, onboarding oparty na celach, plany adaptacyjne, mocna warstwa motywacyjna.

### 2.3. Wzorce — szata graficzna

- **Kolor:** ciemne tła `#121212`/`#1E1E1E` (nie czysty czarny poza OLED), **neonowy akcent** (zielony `#22C55E` itp.), każdy akcent ma wariant dark-mode (przesunięcie ku jaśniejszemu/bardziej nasyconemu). Tekst off-white `#E0E0E0`–`#F0F0F0`, nie czysta biel (redukcja glare). Kontrast min. 4,5:1 (tekst), 3:1 (duży).
- **Typografia:** Inter to de facto standard UI w fitness. Cyfry tabularne dla danych. Lekkie fonty pogrubiać/powiększać na ciemnym tle.
- **Ikonografia:** spójny zestaw (Tabler/SF Symbols), 44×44 px touch target.
- **Karty/panele/wykresy:** wykresy są źródłem motywacji — „rosnąca linia mówi więcej niż surowe liczby".

### 2.4. Wzorce — UI

- **Nawigacja dolna (bottom tab): 3–5 pozycji**, ikona + etykieta, fixed, zasięg kciuka, 44 px. Złoty standard mobile/PWA.
- **Onboarding:** krótkie ekrany z realnymi korzyściami, „zacznij trening w 1 minutę", bez zmuszania do rejestracji.
- **Dashboard:** dzisiejszy trening, osobiste statystyki, postęp tygodnia, streak.
- **Logowanie serii:** minimalna liczba pól, pre-fill ostatnich wartości, jedno tknięcie = seria + auto-timer.

### 2.5. Wzorce — UX i retencja

- **Onboarding decyduje o pierwszych 20 s** — frictionless, „spróbuj bez konta".
- **Gamifikacja:** punkty/poziomy/odznaki/streaki/questy/awatary/leaderboardy/realne nagrody. Im więcej narzędzi, tym lepiej (nie sam licznik kroków + odznaka).
- **Streak-freeze:** streak zerujący się przez wyjazd służbowy „czuje się wrogo" — tacy użytkownicy rzadko wracają. Daj „zamrożenie".
- **Social proximity:** „847 osób w Twoim mieście zrobiło ten trening" motywuje bardziej niż globalny ranking.
- **Retencja >30 dni** waży więcej niż świetny onboarding z cichą krzywą retencji. Problem „14-day churn".

### 2.6. Funkcje AI 2026

Custom programy, coaching w czasie rzeczywistym, wskazówki techniki, **adaptacyjny progressive overload** (gdy regularnie domykasz górę zakresu powtórzeń → AI podbija ciężar), śledzenie zmęczenia mięśni (priorytet świeżych partii, anty-overtraining), świadomość sprzętu (dom/siłownia/podróż), interakcja konwersacyjna, integracja regeneracji/snu/odżywiania.

---

<a name="czesc-ii"></a>
## 3. Część II — Audyt Trening Pro

### 3.1. Mocne strony (nie ruszać / wzmacniać)

| Obszar | Dlaczego to atut |
|---|---|
| **Akcent limonkowy `#d4ff3a`** | Dokładnie trend „hyper/neon green" (Strava 2025, palety dark 2025). Wyróżnia markę. |
| **Typografia Inter + Space Grotesk** | Inter = standard fitness (Strava). Space Grotesk daje charakter nagłówkom/liczbom. |
| **Dark mode premium** | Zgodny z trendem „premium/futurystyczny". |
| **PWA offline** | 67 planów + pełne logowanie bez internetu. Przewaga nad wieloma SaaS. |
| **Generowanie planów AI** | Wyprzedza większość darmowych trackerów. |
| **Tryb kart (jedna seria na ekran)** | Zgodny z „focus mid-workout" (Hevy/Strong). |
| **Timer: wibracja + dźwięk + głos** | Wielozmysłowy feedback — funkcja klasy premium. |
| **1RM (Brzycki+Epley), cele treningowe** | Solidna podstawa programowania. |
| **Świeże ulepszenia** | Skeletony, wykresy wolumen/1RM, backup JSON + scalanie, naprawy mobile. |

### 3.2. Słabe punkty — UI

1. **Brak ekranu powitalnego / onboardingu** — aplikacja od razu pokazuje dashboard. Nowy użytkownik nie wie, od czego zacząć.
2. **Dwa różne modele nawigacji** (sidebar desktop vs bottom nav mobile) utrzymywane osobno — ryzyko rozjazdu (już raz: ukryty profil i bug-report na mobile).
3. **Gęstość dashboardu** — wiele paneli o podobnej wadze wizualnej; brak wyraźnego „bohatera" ekranu (jedna główna akcja).
4. **Rekordy (PR) niewyeksponowane** — 1RM liczone, ale schowane w analizie partii; brak kafla „Twoje rekordy".
5. **Brak mediów ćwiczeń** — tylko tekstowy „tip"; konkurenci pokazują wideo/animacje techniki.
6. **Monolit `index.html` (~290 KB)** — brak podziału, trudniejsza pielęgnacja; CSS inline rozproszone.
7. **Spójność tokenów** — kolory i odstępy częściowo „magic numbers" w stylach inline (np. `padding: 6px 12px` wprost w HTML) zamiast zmiennych.
8. **Heatmapa/kalendarz treningów** — brak (jest pasek 7 dni i wykres 45 dni, ale nie widok roczny częstotliwości).

### 3.3. Słabe punkty — UX

1. **Zero onboardingu** → wysokie ryzyko porzucenia w pierwszych 20 s (kluczowa metryka z badań).
2. **Brak kont i synchronizacji w chmurze** — dane lokalne; wyczyszczenie przeglądarki = utrata historii. Backup JSON pomaga, ale wymaga świadomego działania. Retencyjne ryzyko #1 dla długoterminowego użytkownika.
3. **Gamifikacja płytka** — jest streak, brak: PR-celebracji (poza confetti), odznak, poziomów/XP, „streak-freeze", celów z paskiem postępu, podsumowania po treningu („workout recap").
4. **AI reaktywne** — użytkownik musi sam kliknąć „Analizuj". Brak proaktywnych podpowiedzi w trakcie logowania (adaptacyjny overload: „ostatnio 3×8×60 kg — spróbuj 62,5 kg").
5. **Brak „workout recap"** — po zapisaniu treningu nie ma ekranu podsumowania (tonaż, czas, PR-y, porównanie do poprzedniego). To moment maksymalnej satysfakcji — marnowany.
6. **Logowanie — brak RPE/supersetów** (opcjonalnych) — zaawansowani użytkownicy Hevy tego oczekują; ale uwaga: nie kosztem prostoty.
7. **Brak powiadomień/przypomnień** (PWA push) — „czas na trening", „nie zgub streaka".
8. **Onboarding celu** — cel treningowy ustawiany, ale bez wyjaśnienia konsekwencji (ile serii/przerw) w formie przewodnika.

### 3.4. Tabela zgodności z best practices

| Praktyka | Status | Komentarz |
|---|:--:|---|
| Onboarding < 20 s, frictionless | ❌ | Brak całkowicie |
| Bottom nav 3–5, thumb-reach | ✅ | 5 pozycji, naprawione |
| Pre-fill ostatnich wartości | ✅ | Jest |
| Auto rest-timer po serii | ✅ | Jest + multi-sensory |
| PR tracking jako 1. klasa | ⚠️ | Liczone, nie wyeksponowane |
| Wizualizacja progresu | ✅ | Wolumen + 1RM (świeżo dodane) |
| Heatmapa częstotliwości | ❌ | Brak |
| Gamifikacja (XP/odznaki/freeze) | ⚠️ | Tylko streak |
| Workout recap | ❌ | Brak |
| AI adaptacyjne (overload) | ⚠️ | Generuje plan, nie adaptuje w locie |
| Wideo/animacje techniki | ❌ | Tylko tekst |
| Dark mode token-based | ⚠️ | Zmienne + inline magic numbers |
| Dostępność (focus, reduced-motion) | ✅ | `:focus-visible`, `prefers-reduced-motion` |
| Sync w chmurze / konta | ❌ | Roadmap |
| Powiadomienia push | ❌ | Brak |

Legenda: ✅ zgodne · ⚠️ częściowe · ❌ brak

---

<a name="czesc-iii"></a>
## 4. Część III — Redesign

### 4.1. Architektura informacji (nowa)

Obecnie: Pulpit · Plan na dziś · Historia · Statystyki i mięśnie · AI Coach (+ profil w nagłówku, bug w sidebarze).

**Propozycja — 5 głównych miejsc (utrzymanie 5 w bottom nav):**

```
┌─ Pulpit (Home)        → dziś + streak + 1 główna akcja "Rozpocznij"
├─ Trening (Plan)       → wybór systemu/dnia/celu + start; tryb kart
├─ Postępy (Stats)      → ⬅ scalone: statystyki + rekordy + wykresy + partie + kalendarz-heatmapa
├─ Coach (AI)           → analiza + czat + proaktywne podpowiedzi
└─ Ty (Profil)          → ⬅ NOWE: profile, cele, backup, ustawienia, osiągnięcia, zgłoś bug
```

**Kluczowa zmiana:** „Historia" przestaje być osobną zakładką — wchodzi jako sekcja w „Postępy" (oś czasu + heatmapa). Zwalnia to slot na **„Ty/Profil"** jako pełnoprawne miejsce (dziś profil jest tylko ikoną w nagłówku, a ustawienia/backup/bug rozrzucone). To rozwiązuje systemowo problem „na mobile nie ma profilu/ustawień".

Hierarchia onboardingu (poza bottom nav):
```
Splash → Welcome (3 ekrany korzyści) → Wybór celu → Pierwszy plan (AI lub offline) → Pulpit
                                         (bez wymogu konta — „spróbuj od razu")
```

### 4.2. Design System (tokeny)

#### 4.2.1. Kolory — semantyczne tokeny

```css
:root {
  /* MARKA / AKCENT (zostaje limonka — on-trend) */
  --brand:            #d4ff3a;   /* główny akcent */
  --brand-strong:     #c2f024;   /* hover/press */
  --brand-soft:       rgba(212,255,58,0.12); /* tła akcentowe */
  --brand-on:         #0a0a0b;   /* tekst na akcencie */

  /* POWIERZCHNIE (ciemne, nie czysta czerń) */
  --bg:               #0e0f12;   /* tło aplikacji */
  --surface-1:        #16171d;   /* karty */
  --surface-2:        #1d1f27;   /* karty podniesione / inputy */
  --surface-3:        #262933;   /* hover */

  /* TEKST (off-white, nie #fff) */
  --text:             #f0f1f4;   /* główny */
  --text-muted:       #a0a3ad;   /* drugorzędny */
  --text-dim:         #6b6f7a;   /* trzeciorzędny */

  /* OBRYSY */
  --border:           rgba(255,255,255,0.08);
  --border-strong:    rgba(255,255,255,0.16);

  /* SEMANTYKA TRENINGU (zachować — już istnieją) */
  --push:             #ff5f4a;
  --pull:             #4a8eff;
  --legs:             #b566ff;

  /* STANY */
  --success:          #4ade80;
  --warning:          #fbbf24;
  --danger:           #ef4444;
  --info:             #38bdf8;

  /* GRADIENTY MARKOWE (tło ambientowe) */
  --grad-brand:       linear-gradient(135deg, #d4ff3a, #a8e000);
}
```

Zasada dark-mode: akcent na ciemnym tle musi mieć **wariant** o zachowanej „wadze percepcyjnej". Limonka `#d4ff3a` jest jasna — **nie używać jej jako koloru tekstu na ciemnym tle dla długich treści** (kontrast OK dla dużych elementów/cyfr, gorzej dla małego tekstu — preferować `--text` i akcent tylko na liczby/ikony/przyciski).

#### 4.2.2. Typografia — skala

```
Display  Space Grotesk 700  32/38  (hero liczby, np. tonaż)
H1       Space Grotesk 600  24/30
H2       Space Grotesk 600  20/26
H3       Inter 600          16/22
Body     Inter 400/500      14/20
Caption  Inter 500          12/16  (etykiety stat)
Micro    Inter 500          11/14  (meta, daty)
Liczby   font-variant-numeric: tabular-nums  (wszystkie metryki)
```

#### 4.2.3. Spacing — skala 4 px

```
--sp-1: 4px   --sp-2: 8px   --sp-3: 12px  --sp-4: 16px
--sp-5: 20px  --sp-6: 24px  --sp-8: 32px  --sp-10: 40px  --sp-12: 48px
```
Reguła: marginesy/paddingi tylko z tej skali. Zlikwidować inline `padding: 6px 12px` itp. → klasy/tokeny.

#### 4.2.4. Promienie i elewacja

```
--radius-sm: 10px   --radius: 16px   --radius-lg: 22px   --radius-pill: 999px
--shadow-sm: 0 2px 8px rgba(0,0,0,.25)
--shadow:    0 8px 24px rgba(0,0,0,.35)
--shadow-lg: 0 16px 48px rgba(0,0,0,.45)
```

#### 4.2.5. Ruch (motion)

```
--dur-fast: 120ms   --dur: 220ms   --dur-slow: 360ms
--ease:        cubic-bezier(.2,.8,.2,1)        /* standard */
--ease-spring: cubic-bezier(.34,1.56,.64,1)    /* „pop" przy sukcesie */
```
Wszystko za `@media (prefers-reduced-motion: reduce)` → wyłączane (już jest). Mikro-interakcje: tap-scale 0.97, „pop" na zakończenie serii, liczniki animowane (count-up) dla statystyk, confetti tylko na PR (nie na każdym zapisie).

#### 4.2.6. Komponenty (biblioteka)

Karta · Kafel statystyki · Przycisk (primary/ghost/danger) · Segmented control (cele/tryb) · Modal · Toast · Banner · Pasek postępu · Pierścień (ring) progresu · Wykres (line/bar/heatmap) · Pole serii (weight×reps) · Pigułka typu (Push/Pull/Legs) · Odznaka osiągnięcia · Stepper (±2,5 kg) · Skeleton.

#### 4.2.7. Responsywność

```
Mobile   < 768px   bottom nav, 1 kolumna, header logo+profil
Tablet   768–1023  2 kolumny gridu, bottom nav
Desktop  ≥ 1024     stały sidebar, grid 12-col, max-width treści 1120px
```
Jeden komponent → różne layouty przez container queries / grid, nie osobne drzewa DOM.

#### 4.2.8. Dark mode

Aplikacja jest dark-only — to OK (premium). Opcjonalnie: light mode w przyszłości przez przełączenie tokenów (architektura tokenowa to umożliwia). Priorytet: kontrast 4,5:1 na tekście, akcent tylko na elementy „nośne".

---

<a name="czesc-iv"></a>
## 5. Część IV — Zmiany per ekran + makiety opisowe

### 5.1. Logowanie / rejestracja / onboarding

**Dziś:** brak (lokalny profil „Łukasz").
**Propozycja (frictionless, bez wymuszania konta):**

```
[Welcome 1]  Logo + "Twój trener siłowy w kieszeni"  → [Dalej]
[Welcome 2]  3 ikony korzyści: Plan AI · Śledź postęp · Działa offline
[Welcome 3]  "Jaki masz cel?"  [Masa] [Siła] [Redukcja] [Rzeźba] [Kondycja]
[Setup]      "Jak trenujesz?"  [PPL] [Upper/Lower] [Full Body]
[Gotowe]     "Twój pierwszy trening jest gotowy"  → [Rozpocznij]  /  [Konto później]
```
Konto/sync opcjonalne, oferowane PO pierwszym treningu („Zapisz postęp w chmurze, by nie zgubić danych"). Uzasadnienie biznesowe: pokonuje barierę 20 s i „14-day churn".

### 5.2. Dashboard / Pulpit (strona główna)

**Problem dziś:** wiele paneli o równej wadze, brak „bohatera".

**Makieta opisowa (mobile):**
```
┌─────────────────────────────────┐
│ Cześć, Łukasz 👋     [🔥 12 dni] │  ← greeting + streak (klikalne)
├─────────────────────────────────┤
│ ╭───────── HERO ──────────────╮ │
│ │ DZIŚ: Push · 7 ćwiczeń       │ │  ← jedna dominująca karta
│ │ ~52 min · ostatnio 253 rep   │ │
│ │      [ ▶ Rozpocznij ]        │ │  ← JEDNA główna akcja (brand)
│ ╰─────────────────────────────╯ │
├─────────────────────────────────┤
│ Ten tydzień                      │
│ [3/4 treningi] [12 480 kg tonaż] │  ← 2 kafle, count-up
├─────────────────────────────────┤
│ 🏆 Ostatni rekord                │  ← NOWE: PR jako 1. klasa
│ Wyciskanie 82,5 kg · +2,5 kg     │
├─────────────────────────────────┤
│ [Kalendarz-heatmapa 5 tyg.]      │  ← NOWE: częstotliwość
└─────────────────────────────────┘
```
Zasada: **jeden ekran = jedna główna decyzja** („Rozpocznij"). Reszta to skanowalne podsumowanie.

### 5.3. Ekran treningu (logowanie)

**Dziś:** tryb kart (dobry) + pre-fill + timer (dobre).
**Ulepszenia:**
- **Proaktywna podpowiedź overload** nad polem serii: „Ostatnio 3×8×60 kg ✓ — cel: 62,5 kg" (z `calculate1RM` + historii).
- **Pasek postępu serii** u góry: `● ● ○ ○ ○` (zrobione/zostało) — szybki przegląd.
- **Stepper ±2,5 kg / ±1 rep** kciukiem zamiast klawiatury (mniej tarcia).
- **Timer**: pozostaje auto-start; dodać „+15 s / −15 s" i widoczny zawsze pasek dolny (jak Hevy/Strong).
- **Superset/RPE jako opcje zaawansowane** (ukryte pod „⋯", nie zaśmiecają domyślnego widoku).
- **Po zakończeniu → Workout Recap** (patrz 5.4).

### 5.4. Workout Recap (NOWY ekran — wysoki impact)

Po „Zapisz trening":
```
┌─────────────────────────────────┐
│         🎉 Trening zapisany       │
│   Push · 52 min · 7 ćwiczeń       │
├─────────────────────────────────┤
│  Tonaż        12 480 kg  ▲ +6%   │
│  Serie        21               │
│  🏆 Nowe PR   Wyciskanie 82,5 kg │  ← confetti TYLKO tu
├─────────────────────────────────┤
│  vs. poprzedni Push:  ▲ lepiej   │
│  [Udostępnij]      [Gotowe]      │
└─────────────────────────────────┘
```
Uzasadnienie UX: to moment maksymalnej satysfakcji — buduje nawyk i daje treść do udostępnienia (organiczny growth).

### 5.5. Postępy (scalone Statystyki + Historia + Rekordy)

```
[Segmented: Przegląd | Ćwiczenia | Partie | Historia]

Przegląd:   kafle (tonaż tydz., treningi, streak) + heatmapa roku
Ćwiczenia:  lista z mini-sparklines + tap → 1RM trend + PR-y
Partie:     volume per partia + „sets/week" landmarks (norma objętości)
Historia:   oś czasu (dziś tu trafia była zakładka Historia)
```
Dodać: **kalendarz-heatmapa** (jak GitHub) — częstotliwość treningów; silny sygnał konsekwencji.

### 5.6. Coach (AI)

- **Proaktywny:** karta na Pulpicie „Coach zauważył: stagnacja w OHP (3 sesje 25 kg)" — bez klikania „Analizuj".
- **Konwersacyjny:** pole „Zapytaj coacha" (czat) zamiast tylko jednorazowej analizy.
- **Adaptacja planu:** „Zastosuj sugestie" → modyfikuje następny plan.

### 5.7. Profil / „Ty" (NOWA zakładka)

Zbiera dziś rozrzucone elementy: profile (przełączanie/scalanie), cele, **osiągnięcia/odznaki** (NOWE), backup JSON, ustawienia (timer, dźwięk, jednostki), połączenie AI, zgłoś bug. Rozwiązuje systemowo „brak ustawień na mobile".

### 5.8. Nawigacja

- **Mobile:** bottom nav 5 ikon (Pulpit/Trening/Postępy/Coach/Ty) — etykiety + ikony, 44 px, pin do widocznego dołu (już naprawione).
- **Desktop:** ten sam zestaw w sidebarze (jedna definicja źródłowa generująca oba widoki — koniec dryfu).
- FAB „Rozpocznij" opcjonalnie na Pulpicie zamiast w nav (nav zostaje czysty).

---

<a name="czesc-v"></a>
## 6. Część V — Priorytety

### 🟢 Quick Wins (duży efekt, mały nakład — 1–3 dni każdy)
1. **PR jako 1. klasa** — wykrywaj rekordy z istniejącego `calculate1RM` i historii; kafel na Pulpicie + badge w historii. *(masz już dane)*
2. **Workout Recap** — ekran podsumowania po zapisie (tonaż, serie, PR, porównanie). *(czysta kompozycja z istniejących danych)*
3. **Confetti tylko na PR** (nie na każdym zapisie) — wzmacnia wartość rekordu.
4. **Count-up animacje** statystyk (mikro-interakcja, „premium feel").
5. **Onboarding 3-ekranowy** (welcome → cel → system → start). *(reużywa istniejące modale celu/systemu)*
6. **Heatmapa-kalendarz** częstotliwości na „Postępy". *(dane w historii są)*
7. **Tokenizacja kolorów/spacingu** — przenieść inline magic numbers do zmiennych CSS (sprząta i przyspiesza dalsze prace).

### 🟡 Średni priorytet (1–2 tygodnie)
8. **Zakładka „Ty/Profil"** + reorg architektury informacji (Historia → Postępy).
9. **Proaktywne podpowiedzi overload** w logowaniu („cel: 62,5 kg").
10. **Stepper ±2,5 kg/±1 rep** + zawsze widoczny pasek timera z ±15 s.
11. **Osiągnięcia/odznaki** (pierwszy trening, 7-dniowy streak, 10 PR, 100 treningów).
12. **Streak-freeze** (1–2 „zamrożenia"/mies. — anty-„wrogi reset").
13. **Coach proaktywny** — karta-insight na Pulpicie generowana po zapisie.

### 🔴 Wysoki priorytet (strategiczne, 2–4 tygodnie)
14. **Konta + synchronizacja w chmurze** (opcjonalna) — rozwiązuje retencyjne ryzyko #1. Architektura: lekki backend (np. Cloudflare D1/KV + Worker, którego już używasz do AI) lub Supabase. Lokalne pozostaje źródłem prawdy offline; sync „last-write-wins" per workout id (masz już dedup po id z backupu JSON — reużyj).
15. **Powiadomienia push (PWA)** — „czas na trening", „nie zgub streaka".
16. **Ujednolicenie nawigacji** z jednego źródła (koniec sidebar vs bottom-nav dryfu).
17. **Podział monolitu** (opcjonalnie) — wydzielenie CSS/JS do modułów dla pielęgnacji.

### 💎 Premium (wyróżniki)
18. **AI konwersacyjny coach** (czat) + **adaptacyjny progressive overload** w czasie rzeczywistym.
19. **Wideo/animacje techniki** ćwiczeń (lub link do biblioteki).
20. **Social / proximity** — opcjonalne udostępnianie treningu, porównania ze znajomymi (accountability).
21. **Integracja wearables / Health** (HealthKit / Google Fit) — tętno, regeneracja.
22. **Strength Score** — pojedynczy zagregowany wskaźnik siły (jak Fitbod) napędzający motywację.

---

<a name="czesc-vi"></a>
## 7. Część VI — Plan wdrożenia (kolejność)

**Faza 0 — Fundament (tydzień 1)**
- Tokenizacja design systemu (kolory, spacing, typo, motion) → zmienne CSS. *(odblokowuje resztę, niskie ryzyko)*
- Refaktor inline magic numbers do klas/tokenów.

**Faza 1 — Motywacja i satysfakcja (tydzień 1–2)** ← największy ROI retencji
- PR jako 1. klasa + Workout Recap + confetti-na-PR + count-up.
- Heatmapa-kalendarz.

**Faza 2 — Onboarding i IA (tydzień 2–3)**
- Onboarding 3-ekranowy.
- Zakładka „Ty/Profil"; przeniesienie Historii do „Postępy"; ujednolicenie nav z jednego źródła.

**Faza 3 — Inteligentne logowanie (tydzień 3–4)**
- Proaktywny overload, stepper, pasek timera ±15 s.
- Osiągnięcia/odznaki + streak-freeze.
- Coach proaktywny (insight po zapisie).

**Faza 4 — Strategiczne (miesiąc 2)**
- Konta + sync w chmurze (reuse dedup-po-id z backupu JSON).
- Powiadomienia push PWA.

**Faza 5 — Premium (miesiąc 2–3+)**
- AI konwersacyjny + adaptacyjny overload, wideo techniki, social/proximity, wearables, Strength Score.

**Zasada wdrażania:** każda faza zamykana, testowana na mobile (375px) i desktop, commitowana i pushowana. Tokeny (Faza 0) jako pierwsze, bo wszystko inne na nich bazuje.

---

<a name="zrodla"></a>
## 8. Źródła

- [Best UX/UI Design Practices For Fitness Apps In 2025 — Dataconomy](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/)
- [Fitness App UI UX Design 2026 — Fireart](https://fireart.studio/blog/user-interface-design-for-a-fitness-app/)
- [App design trends for 2026 — Lyssna](https://www.lyssna.com/blog/app-design-trends/)
- [How UX/UI Design Drives Engagement in Health & Wellness Apps (2026) — Diversido](https://www.diversido.io/blog/how-does-ux-ui-impact-your-wellness-app)
- [How to Design a Fitness App: UX/UI Best Practices — Zfort](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention)
- [Strength Training App — Hevy](https://www.hevyapp.com/use-cases/strength-training-app/)
- [Hevy App Review — RepReturn](https://repreturn.com/hevy-app-review/)
- [Learn How to Use the Automatic Workout Rest Timer — Hevy](https://www.hevyapp.com/features/workout-rest-timer/)
- [How Fitbod Personalizes Your Workout Plan — Fitbod](https://fitbod.me/blog/how-fitbod-personalizes-your-workout-plan-using-smart-training-algorithms/)
- [How Fitbod Tracks Your Strength Progress With Real-Time Metrics And Scores — Fitbod](https://fitbod.me/blog/how-fitbod-tracks-your-strength-progress-with-real-time-metrics-and-scores/)
- [Best AI Fitness Apps 2026 — Fitbod](https://fitbod.me/blog/best-ai-fitness-apps-2026-the-complete-guide-to-ai-powered-muscle-building-apps/)
- [Fitness App Gamification: How to Fix the 14-Day Churn Problem — Mindster](https://mindster.com/mindster-blogs/fitness-app-user-retention/)
- [13 Proven Strategies to Increase App Retention — Orangesoft](https://orangesoft.co/blog/strategies-to-increase-fitness-app-engagement-and-retention)
- [Bottom Tab Bar Navigation Design Best Practices — UX Planet](https://uxplanet.org/bottom-tab-bar-navigation-design-best-practices-48d46a3b0c36)
- [The Complete Guide to User-Friendly Mobile Navigation in 2025 — Medium](https://medium.com/@secuodsoft/the-complete-guide-to-creating-user-friendly-mobile-navigation-in-2025-59c9dd620c1d)
- [What Font Does Strava Use in 2026? — Sensatype](https://sensatype.com/what-font-does-strava-use-in-2026)
- [Dark Mode Design Systems: Patterns, Tokens, Hierarchy — Muzli](https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/)
- [The Best Practices to Design Dark Mode for Mobile Apps in 2025 — Mindinventory](https://www.mindinventory.com/blog/how-to-design-dark-mode-for-mobile-apps/)
- [Best Strength Training Apps for 2026 — Jefit](https://www.jefit.com/wp/guide/best-strength-training-apps-for-2026-7-options-tested-by-lifters/)
- [How AI Is Revolutionizing Personal Fitness Coaching in 2026 — Vora](https://askvora.com/blog/ai-fitness-coaching-2026)
- [Fitness App UI Design: Key Principles — Stormotion](https://stormotion.io/blog/fitness-app-ux/)

> Uwaga: część źródeł to artykuły agencji/blogi produktowe — traktować jako wskazówki kierunkowe, nie twarde dane. Liczby (np. „+40% konsekwencji", „14-day churn") pochodzą z materiałów dostawców i służą jako sygnał trendu, nie jako zweryfikowany benchmark akademicki.
