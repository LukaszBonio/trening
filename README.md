<div align="center">

# 💪 Trening Pro

### Inteligentna aplikacja treningowa z planami generowanymi przez AI

Twój osobisty trener siłowy w przeglądarce — generuje plany dopasowane do Twojego celu,
prowadzi Cię przez trening seria po serii i analizuje postępy. Działa offline jako PWA.

[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://lukaszbonio.github.io/trening/)
[![Vue 3](https://img.shields.io/badge/Vue_3-Composition_API-4FC08D?logo=vue.js&logoColor=white)](#technology-stack)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![AI](https://img.shields.io/badge/AI-Claude_Sonnet_4.6-D97757?logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Offline](https://img.shields.io/badge/Offline-ready-4ade80)](#features)
[![License](https://img.shields.io/badge/license-Personal-lightgrey)](#license)

[**🚀 Demo na żywo**](https://lukaszbonio.github.io/trening/) · [**📦 Repozytorium**](https://github.com/LukaszBonio/trening) · [**🐛 Zgłoś błąd**](https://github.com/LukaszBonio/trening/issues)

</div>

---

## 📖 Spis treści

- [O projekcie](#o-projekcie)
- [Demo](#demo)
- [Features](#features)
- [Quick Start](#quick-start)
- [Instalacja na telefonie](#instalacja-na-telefonie-jak-natywna-aplikacja)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Jak korzystać (UX)](#jak-korzystać-ux)
- [Systemy treningowe](#systemy-treningowe)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Known Issues](#known-issues)
- [Prywatność i bezpieczeństwo](#prywatność-i-bezpieczeństwo)
- [License](#license)

---

## O projekcie

**Trening Pro** to aplikacja webowa (PWA) do planowania i rejestrowania treningów siłowych.
Plany generuje **Claude** (model `claude-sonnet-4-6`) z uwzględnieniem Twojego celu i historii.

Aplikacja zbudowana jest na **Vue 3 + TypeScript + Vite + Pinia** — 6 widoków, 21 komponentów, 6 composables,
8 stores, 21 lib modules z **185 testami** (Vitest). PWA z Service Workerem zapewnia działanie offline.
Klucz API jest ukryty za serwerem proxy (Cloudflare Worker z JWT auth) — **użytkownik nie potrzebuje własnego klucza API.**

> **Dla kogo?** Dla osób trenujących siłowo, które chcą gotowego planu na dziś, prostego
> rejestrowania serii i czytelnej analizy postępów — za darmo, z synchronizacją między urządzeniami.

---

## Demo

| | Link |
|---|---|
| 🚀 **Aplikacja na żywo** | <https://lukaszbonio.github.io/trening/> |
| 📦 **Kod źródłowy** | <https://github.com/LukaszBonio/trening> |

> Otwórz na telefonie i **dodaj do ekranu głównego**, aby korzystać jak z natywnej aplikacji.

---

## Features

### 🎯 Plany treningowe
- **10 typów treningu w 3 systemach** — Push/Pull/Legs, Upper A/B, Lower A/B, FBW A/B/C
- **Plan korekcyjny „Ćwiczenia dla Ani”** — dedykowany, bezpieczny program dla początkujących ze schorzeniami kręgosłupa/kolana; wybór dostępnego sprzętu (masa ciała / gumy / hantle / maszyny), progresja przez trudność
- **49 gotowych planów offline** + **kuratorowana baza 113 ćwiczeń** (Push/Pull/Legs) z pełnymi metadanymi: głowa mięśniowa, sprzęt, wzorzec ruchu, typ (compound/isolation), poziom
- **Generator AI** — Claude dobiera ćwiczenia **z bazy** (kanoniczne nazwy, bez duplikatów) wg celu, sprzętu i wykluczeń; analizuje historię i dobiera progresję obciążeń
- **Edytor własnych planów** — twórz, edytuj, duplikuj plany z drag-drop reorderingu ćwiczeń
- **Zamiana ćwiczeń w locie** — podczas treningu podmień ćwiczenie na równoważny wariant (ta sama głowa mięśniowa, zachowany sprzęt)
- **Ulubione** — gwiazdka przypina najczęściej używane plany na górze listy
- **Powtórz ostatni trening** — jeden klik, ciężary z poprzedniej sesji pre-fillowane

### 🧠 AI Coach *(osobna zakładka)*
- **Analiza postępów** — Claude analizuje trendy **każdego ćwiczenia osobno** (najcięższa seria per sesja) i wykrywa stagnację / progres / regres, z konkretnymi liczbami z historii
- **Typowane insighty** — karty `progres · sukces · uwaga · wskazówka` + jednozdaniowe podsumowanie
- **Czat z trenerem** — pytania o technikę, progresję, układ tygodnia; odpowiedzi oparte na Twoim celu i ostatnich treningach, z gotowymi podpowiedziami
- **Tygodniowy raport AI** — osobny digest ostatnich 14 dni (highlights + sugestie, cache 7 dni)

### 🏋️ Rejestrowanie treningu
- **Tryb kart** (domyślny) — jedna partia mięśniowa na ekran, swipe między kartami
- **Tryb listy** — wszystkie ćwiczenia w jednym widoku (toggle w ustawieniach)
- **Logowanie serii** — ciężar, powtórzenia, RPE (1-10), notatki tekstowe
- **Timer odpoczynku** — auto-start po zaznaczeniu serii, presety 60/90/120/180s, ±15s, drift-corrected (działa z zablokowanym ekranem)
- **Powiadomienia + wibracja** — koniec przerwy działa nawet w tle
- **Live duration** — zegar treningu w nagłówku sesji (mm:ss)
- **Kalkulator talerzy** — wpisz ciężar, zobacz rozkład per stronę (kolory IPF)
- **Auto-zapis draft** — przerwana sesja persystuje w localStorage, wraca po reload
- **Workout summary** — modal po zakończeniu: serie, tonaż, RPE, **nowe rekordy + konfetti**

### 📊 Statystyki i analiza
- **5 kafelków na górze** — treningi total, streak (tygodni), 7 dni, łączne serie, wolumen
- **Wolumen w czasie** (line chart) i **treningi w tygodniach** (bar chart)
- **Kalendarz heatmap** — GitHub-style siatka 26 tygodni, klik dnia → szczegóły
- **Per-exercise progress** — wybierz ćwiczenie, zobacz krzywą **1RM / top weight / wolumen**
- **Top 10 PR** — ranking rekordów osobistych ze wzorem Epley (1RM ≈ weight × (1 + reps/30))
- **Wolumen wg partii mięśniowej** — paski z rankingiem najbardziej trenowanych grup
- **Analiza wzorców ruchowych** — compound/isolation ratio, push/pull balance, rozkład wzorców ruchowych (horizontal push/pull, vertical push/pull, squat, hinge, itd.)
- **11 osiągnięć** — milestones (1/10/25/50/100/250 treningów, streak 2/4/8/12 tyg., PPL ×10, 100 kg club)

### 🔐 Logowanie i synchronizacja w chmurze
- **Wymagane konto** (Supabase, email + hasło) — cała aplikacja jest za bramką logowania
- **Reset hasła** — link e-mail → dedykowany formularz „Ustaw nowe hasło” w aplikacji
- **Pokaż / ukryj hasło** — przełącznik (ikona oka) przy polach hasła
- **Sesja zapamiętana** — po pierwszym logowaniu online aplikacja działa też offline (token w `localStorage`, auto-refresh)
- **Sync deltami** — workouts, settings synchronizują się automatycznie (debounce 1.5s)
- **Offline queue** — gdy brak internetu, operacje kolejkowane → auto-flush po `online` event
- **Exponential backoff** — retry 6× z 1s/2s/4s/8s/16s/32s, drop po wyczerpaniu
- **Last-write-wins** by `id` — proste, działa dla solo dewa
- **Row Level Security** — Supabase RLS, każdy user widzi tylko swoje dane

### 📥 Dane
- **Import/Export JSON** — backup historii treningów + profili
- **PDF export** per trening — jsPDF z tabelą serii, RPE, notatkami, paginacją
- **Zapisz trening jako plan** — historię można zamienić w custom plan jednym klikiem

### 🎨 Personalizacja
- **Motyw ciemny / jasny** — toggle w ustawieniach
- **Kolor akcentu** — 8 wariantów, applied via CSS variables na żywo
- **Domyślny czas timera** — 60/90/120/150/180/240s
- **Jednostki** — kilogramy lub funty
- **RPE display toggle** — pokaż/ukryj pole RPE
- **Reduced motion** — auto-respect `prefers-reduced-motion`

### 📱 PWA
- **Instalacja** na telefonie i komputerze; pełny tryb offline (poza AI)
- **Splash screen** z animacją logo
- **Mobile bottom nav** — sticky bottom z safe-area-inset
- **Page transitions** — fade + slide między widokami
- **Onboarding tour** — 4 ekrany przy pierwszym uruchomieniu
- **Skeleton loaders** dla wykresów Chart.js

---

## Quick Start

Najprostszy sposób — **po prostu otwórz aplikację w przeglądarce:**

👉 **[https://lukaszbonio.github.io/trening/](https://lukaszbonio.github.io/trening/)**

Nie trzeba nic instalować ani płacić — wystarczy darmowe konto (email + hasło). Po pierwszym
zalogowaniu online aplikacja działa również offline.

---

## Instalacja na telefonie (jak natywna aplikacja)

Możesz dodać aplikację do ekranu głównego telefonu — będzie wyglądać i działać jak normalna aplikacja, łącznie z trybem offline.

### Android (Chrome)
1. Otwórz aplikację w Chrome
2. Kliknij **⋮** (trzy kropki) w prawym górnym rogu
3. Wybierz **"Dodaj do ekranu głównego"**
4. Potwierdź — gotowe!

### iPhone / iPad (Safari)
1. Otwórz aplikację w **Safari** (inny browser nie zadziała)
2. Kliknij ikonę **Udostępnij** (kwadrat ze strzałką w górę) na dole ekranu
3. Wybierz **"Dodaj do ekranu głównego"**
4. Potwierdź — gotowe!

> Po instalacji aplikacja działa **w pełni offline** — możesz trenować bez internetu. Tylko funkcje AI (generowanie planów) wymagają połączenia.

---

## Development

```bash
# Klonuj repo
git clone https://github.com/LukaszBonio/trening.git
cd trening

# Instaluj zależności
npm install

# Dev server (z HMR)
npm run dev          # → http://localhost:5173

# Testy
npm test             # 185 testów (Vitest)

# Production build
npm run build        # → dist/

# Preview produkcyjnego buildu
npm run preview
```

**Wymagania:** Node 18+, npm 9+.

**Dev:** Vite + HMR, lazy-loaded routes, Pinia DevTools (przez Vue DevTools).

**Testy:** `npm test` — 185 testów Vitest (composables, lib modules, stores). Env `node` (bez jsdom).

**Build:** ~2.5s, **37 plików w PWA precache (~2.9 MB)** — Chart.js i jsPDF wydzielone do osobnych chunków, lazy-loaded per route.

---

## Environment Variables

Frontend nie używa zmiennych w build time. Konfiguracja dotyczy proxy + opcjonalnie klienta.

### Cloudflare Worker

| Zmienna | Typ | Wymagana | Opis |
|---|---|:---:|---|
| `ANTHROPIC_API_KEY` | secret | ✅ | Klucz API Anthropic — ukryty po stronie serwera |
| `ALLOWED_ORIGIN` | var | ⬜ | Whitelist CORS, np. `https://lukaszbonio.github.io` |

### Supabase (wymagane — logowanie + sync między urządzeniami)

Schemat tabel w `docs/SUPABASE_SCHEMA.sql`. Tabele:
- `workouts` — historia treningów (id text, user_id uuid, data jsonb)
- `body_log` — pomiary wagi ciała (id text, user_id uuid, data jsonb)
- `user_settings` — preferencje per user (user_id uuid, data jsonb)

Każda tabela ma Row Level Security wymuszające `auth.uid() = user_id`.

### Konfiguracja po stronie klienta

| Klucz | Miejsce | Opis |
|---|---|---|
| `SUPABASE_URL` / `SUPABASE_KEY` | `src/stores/cloud.ts` | Publishable key Supabase |
| `DEFAULT_PROXY` | `src/lib/ai.ts` | Cloudflare Worker URL |
| `tp_proxy_url` | `localStorage` | Opcjonalne nadpisanie proxy do testów |

---

## Architecture

Vue 3 SPA z modularnym state managementem i warstwą composables. Logika i dane żyją w przeglądarce
(`localStorage`). Service Worker (vite-plugin-pwa) zapewnia działanie offline. Sieć jest potrzebna
do logowania (bramka auth na całą aplikację), sync z Supabase oraz generowania planów przez Claude API.
Po pierwszym zalogowaniu online sesja jest zapamiętana, więc aplikacja działa też offline.

```mermaid
flowchart LR
    subgraph Client["📱 Przeglądarka (Vue PWA)"]
        UI["Vue 3 components<br/>+ Vue Router (6 widoków)"]
        Stores["Pinia stores (8)<br/>workouts · session · cloud<br/>timer · body · settings<br/>customPlans · favorites"]
        Composables["Composables (6)<br/>useRestTimer · useSetNavigation<br/>usePersistentRef · useDialog<br/>useToast · useCoach"]
        Libs["Lib modules (21)<br/>muscles · plans · exerciseDb · substitutions<br/>analytics · ai · coach · pdf · plates<br/>workoutSchema · offlineQueue<br/>weeklyReport · notifications"]
        SW["Service Worker<br/>(generated by Vite PWA)"]
        LS[("localStorage<br/>history · drafts · settings · queue")]
    end
    subgraph Edge["☁️ Cloudflare"]
        W["Worker (proxy)<br/>klucz API ukryty"]
    end
    subgraph Cloud["☁️ Supabase (wymagany — login)"]
        Auth["Auth<br/>email+hasło"]
        DB[("PostgreSQL + RLS<br/>workouts · body_log · settings")]
    end
    AI["🧠 Claude API"]

    UI <-->|reactive| Stores
    UI -->|logic| Composables
    Stores <-->|persist| LS
    Stores -->|import| Libs
    SW -.->|cache| UI
    Stores -->|generate plan| W
    W -->|x-api-key| AI
    Stores -->|sync queue| Auth
    Auth --> DB
```

### Przepływ użytkownika

```mermaid
flowchart TD
    L["🔐 Logowanie / rejestracja<br/>(wymagane)"] --> A
    A["Wybierz typ<br/>(Push/Pull/Legs/Upper/Lower/FBW)"] --> B{"Źródło planu?"}
    B -->|Biblioteka| C1["49 gotowych planów"]
    B -->|AI| C2["Claude generuje plan"]
    B -->|Custom| C3["Edytor: dodaj ćwiczenia"]
    C1 --> D["Tryb kart: partia po partii"]
    C2 --> D
    C3 --> D
    D --> E["Loguj serie + RPE + notatki"]
    E --> F["Rest timer + powiadomienie"]
    F --> E
    D --> G["Zakończ → summary z konfetti"]
    G --> H["Historia · Statystyki · Achievements"]
    H -.->|auto| I["Sync z Supabase"]
```

### Struktura repozytorium

```
trening/
├── index.html                  # Entry point z inline splash screen
├── vite.config.js              # Vite + PWA plugin config
├── package.json
├── src/
│   ├── main.ts                 # Bootstrap (Pinia + Router + App)
│   ├── App.vue                 # Layout, tabs desktop, bottom nav mobile, onboarding
│   ├── router/                 # Vue Router (hash mode, lazy-loaded views)
│   ├── views/                  # 6 widoków
│   │   ├── LoginView.vue       #   Logowanie / rejestracja / reset hasła (bramka auth)
│   │   ├── WorkoutView.vue     #   Wybór planu (+ plan Ani) + aktywna sesja
│   │   ├── StatsView.vue       #   Statystyki, wykresy, achievements, PR, raport tygodniowy
│   │   ├── CoachView.vue       #   AI Coach — analiza postępów + czat
│   │   ├── HistoryView.vue     #   Lista treningów, edycja, PDF, zapis jako plan
│   │   └── YouView.vue         #   Konto, ustawienia, backup
│   ├── components/             # 21 komponentów (BaseCard, WorkoutCards, RestTimer, AICoach, ...)
│   ├── composables/            # 6 composables (useRestTimer, useSetNavigation, useCoach, ...)
│   ├── stores/                 # 8 Pinia stores (workouts, session, cloud, ...)
│   ├── lib/                    # 21 pure modules (muscles, plans, exerciseDb, ai, coach, ...)
│   └── styles/global.css       # CSS variables (dark/light themes)
├── test/                       # 14 plików testowych Vitest (185 testów)
├── public/                     # Static assets (icons, manifest)
├── docs/SUPABASE_SCHEMA.sql    # SQL do wykonania w Supabase
└── legacy/                     # Stary monolit (8270 LOC index.html) — referencja
```

### Główne moduły

| Moduł | Odpowiedzialność |
|---|---|
| **stores/session.ts** | Aktywna sesja: dodawanie serii, toggle, persistencja draft |
| **stores/workouts.ts** | Historia treningów, CRUD, persistencja, computed (last, count) |
| **stores/cloud.ts** | Supabase auth, init/delta sync, integracja z offlineQueue |
| **stores/customPlans.ts** | Własne plany użytkownika (CRUD) |
| **stores/favorites.ts** | Ulubione plany (library + custom) |
| **composables/useRestTimer** | Timer odpoczynku: drift-corrected countdown, wake lock, notification, flash |
| **composables/useSetNavigation** | Nawigacja po seriach: advance, goBack, jump, progress |
| **composables/usePersistentRef** | Ref z auto-persist do localStorage (5 stores go używa) |
| **composables/useDialog** | Modale confirm/prompt przez provide/inject |
| **composables/useToast** | Powiadomienia toast z auto-dismiss |
| **components/BaseCard** | Slot-based karta z props title/collapsible/tag |
| **composables/useCoach** | Stan AI Coacha (singleton): analiza postępów + czat, abort, offline |
| **lib/muscles.ts** | Słownik 25 głów mięśniowych, detectMuscle, detectEquipment |
| **lib/plans.ts** | 49 gotowych planów (10 typów), getRandomPlan |
| **lib/exerciseDb.ts** | Kuratorowana baza 113 ćwiczeń z metadanymi — źródło doboru dla AI |
| **lib/coach.ts** | AI Coach: buildery promptów (analiza trendów per ćwiczenie + czat) + walidacja |
| **lib/substitutions.ts** | findSubstitutes, youtubeSearchUrl |
| **lib/workoutSchema.ts** | Grupowanie ćwiczeń po partii dla trybu kart (hybrid: muscle + index) |
| **lib/analytics.ts** | Estimated 1RM (Epley), PR detection, streak, exerciseProgress, analiza wzorców ruchowych |
| **lib/ai.ts** | Claude API client + JSON validation |
| **lib/offlineQueue.ts** | Persistent queue z exponential backoff retry |
| **lib/plates.ts** | Kalkulator talerzy (kolory IPF) |
| **lib/pdf.ts** | Eksport treningu do PDF (jsPDF) |
| **lib/weeklyReport.ts** | Tygodniowy raport AI z cache (14 dni historii → highlights + sugestie) |

---

## Technology Stack

| Warstwa | Technologia |
|---|---|
| **Framework** | [Vue 3.5](https://vuejs.org/) (Composition API + `<script setup>`) |
| **Build / Dev** | [Vite 5.4](https://vitejs.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) |
| **Testy** | [Vitest 3.2](https://vitest.dev/) — 185 testów (14 plików), env `node` |
| **State** | [Pinia 2.2](https://pinia.vuejs.org/) — 8 stores, reactive, persistent |
| **Routing** | [Vue Router 4](https://router.vuejs.org/) — hash mode, lazy-loaded views |
| **Wykresy** | [Chart.js 4.4](https://www.chartjs.org/) — line, bar, lazy-loaded chunk |
| **PDF** | [jsPDF 2.5](https://github.com/parallax/jsPDF) — eksport treningu |
| **Konfetti** | [canvas-confetti](https://github.com/catdad/canvas-confetti) — workout completion |
| **Cloud** | [Supabase](https://supabase.com/) — auth + PostgreSQL z RLS |
| **AI** | [Claude API](https://www.anthropic.com/) — `claude-sonnet-4-6` przez Cloudflare Worker proxy |
| **Ikony / fonty** | [Tabler Icons](https://tabler-icons.io/) · Google Fonts (Inter, Space Grotesk) |
| **Web API** | Service Worker · localStorage · Notification API · Vibration · Drag-Drop · Screen Wake Lock |
| **Hosting** | GitHub Pages (frontend) + Cloudflare (proxy) + Supabase (cloud sync) |

---

## Jak korzystać (UX)

1. **Zaloguj się / zarejestruj** — aplikacja wymaga konta (potem działa też offline).
2. **Onboarding** — przy pierwszym wejściu 4 ekrany wprowadzenia (skip / dalej).
3. **Wybierz typ treningu** w zakładce "Trening" (Push / Pull / Legs / Upper / Lower / FBW).
4. **Wybierz źródło planu:** Plany (biblioteka), AI (generator) lub Nowy (własny edytor).
5. **Trening** w trybie kart — jedna partia mięśniowa na ekran, swipe lub strzałki ◄ ► między.
6. **Loguj serie** — ciężar, powtórzenia, RPE; check ⭕ uruchamia timer odpoczynku.
7. **Zakończ trening** — modal z podsumowaniem, konfetti, detekcja nowych PR.
8. **Statystyki** automatycznie się aktualizują — wykresy, heatmap, achievements.

**5 zakładek:** Trening · Statystyki · **Coach** (AI: analiza + czat) · Historia · Ty (konto, ustawienia, backup).

### Cele AI generatora

| Cel | Powtórzenia | Filozofia |
|---|---|---|
| **Masa mięśniowa** | 8–12 | 3-4 serie, tempo umiarkowane |
| **Siła** | 3–6 | 4-5 serii, ciężary submaksymalne |
| **Wytrzymałość** | 12–20 | 3 serie, krótsze przerwy |
| **Redukcja / rzeźba** | 10–15 | Podwyższona intensywność |
| **Rekompozycja** | 6–12 | Mix siłowo-objętościowy |

### Estimated 1RM (formuła Epley)

```
1RM = ciężar × (1 + powtórzenia / 30)
```

Używana do PR detection, per-exercise progress, achievement "100 kg klub".

---

## Systemy treningowe

<details>
<summary><b>PPL — Push / Pull / Legs (3-dniowy)</b></summary>

| Dzień | Partie (karty) | Ćwiczenia |
|---|---|---|
| Push | Klatka, barki, triceps | 7 |
| Pull | Plecy, tylne barki, biceps, przedramię | 8 |
| Legs | Czworogłowy, hamstring, pośladki, łydki, core | 7 |

</details>

<details>
<summary><b>Upper / Lower — split 4-dniowy (cel: masa + siła)</b></summary>

| Dzień | Skupienie (karty) | Ćwiczenia |
|---|---|---|
| Upper A | Klatka + plecy (bazowe), barki, biceps, triceps | 7 |
| Upper B | Klatka + plecy (hantle/maszyny), barki, biceps, triceps | 7 |
| Lower A | Czworogłowy priorytet, hamstring, łydki, core | 6 |
| Lower B | Hip hinge priorytet, czworogłowy, łydki, core | 6 |

</details>

<details>
<summary><b>FBW — Full Body (3 razy w tygodniu)</b></summary>

| Dzień | Główne ruchy (karty) | Ćwiczenia |
|---|---|---|
| FBW A | Przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core | 7 |
| FBW B | Martwy + skos + podciąganie + split squat + wznosy + triceps + core | 7 |
| FBW C | Front squat + bench hantle + wiosło + hip thrust + face pull + biceps + łydki | 7 |

</details>

<details>
<summary><b>Ćwiczenia dla Ani — plan korekcyjny (osoba początkująca)</b></summary>

Dedykowany, bezpieczny program dla początkujących ze schorzeniami kręgosłupa (dyskopatia, rwa),
miednicy i kolana (po MCL). Generowany przez AI z kuratorowanego menu bezpiecznych ćwiczeń,
z **wyborem dostępnego sprzętu** (masa ciała / gumy / hantle / maszyny) i **progresją przez trudność**,
nie przez ryzykowne obciążanie kręgosłupa. AI analizuje historię i stopniowo podnosi poziom.

| Slot | Cel |
|---|---|
| 1–2 | Aktywacja i stabilizacja core (kręgosłup neutralny) |
| 3–4 | Pośladki + stabilizacja miednicy |
| 5 | Tylna taśma (dwugłowe uda) bez obciążania lędźwi |
| 6 | Czworogłowy / stabilizacja kolana (kontrolowany zakres) |
| 7–8 | Plecy + korekcja postawy i ustawienia łopatek/głowy |

> Trening wzmacniająco-korekcyjny, nie porada medyczna — przy schorzeniach warto skonsultować z fizjoterapeutą.

</details>

---

## FAQ

<details>
<summary><b>Czy potrzebuję klucza API, żeby korzystać z AI?</b></summary>

Nie. Aplikacja łączy się z Claude przez serwer proxy (Cloudflare Worker), gdzie klucz jest
ukryty. Jeśli hostujesz własną kopię, musisz wdrożyć własnego workera.
</details>

<details>
<summary><b>Czy potrzebuję konta?</b></summary>

Tak. Cała aplikacja jest za bramką logowania (konto Supabase: email + hasło). Pierwsze
logowanie wymaga internetu; potem sesja jest zapamiętana i aplikacja działa również offline.
</details>

<details>
<summary><b>Czy moje dane trafiają na serwer?</b></summary>

Tak — treningi + ustawienia synchronizują się do Supabase (z RLS, czyli tylko ty widzisz swoje
dane). Kopia lokalna nadal żyje w `localStorage`, więc aplikacja działa offline między sesjami.
</details>

<details>
<summary><b>Czy działa offline?</b></summary>

Tak, po pierwszym zalogowaniu online. Service Worker cacheuje całą aplikację, a sesja jest
zapamiętana w `localStorage`. Sync operacje są kolejkowane w `offlineQueue` i wykonują się gdy
wraca internet. Funkcje AI (generator) i pierwsze logowanie wymagają połączenia.
</details>

<details>
<summary><b>Jak przenieść dane na inne urządzenie?</b></summary>

**Najwygodniej:** zaloguj się tym samym kontem → wszystko zsynchronizuje się automatycznie.
**Alternatywnie:** eksport JSON z jednego urządzenia, import na drugim.
</details>

<details>
<summary><b>Dlaczego trening jest pokazywany jako karty zamiast listy?</b></summary>

Tryb kart (jedna partia mięśniowa na ekran) jest domyślny — minimalizuje scroll i poznawcze obciążenie
podczas treningu. Możesz przełączyć na tryb listy w **Ty → Ustawienia → Tryb sesji treningowej**.
</details>

---

## Roadmap

### ✅ V2 — *Vue migration*

**Architektura:**
- [x] Vue 3 + Vite + Pinia (port z 8270-LOC monolitu vanilla JS)
- [x] 8 Pinia stores, 21 komponentów, 6 composables, 6 widoków z lazy-loadingiem
- [x] Vue Router (hash mode), page transitions
- [x] 185 testów Vitest (14 plików) — composables, lib modules, stores

**Refactoring (V2.1):**
- [x] `db.js` (1280 LOC) → `muscles.js` + `plans.js` + `substitutions.js` (barrel re-export)
- [x] `WorkoutCards.vue` — wydzielone `useRestTimer` + `useSetNavigation` (script ~284→~140 LOC)
- [x] `usePersistentRef` — localStorage boilerplate wydzielony z 5 stores
- [x] `BaseCard` slot component — 17 powtórzeń `div.card` → jeden komponent
- [x] Cloudflare Worker — ES256/JWKS auth (JWT z Supabase)
- [x] Supabase RLS — pełne CRUD policy na 3 tabelach

**Funkcjonalność:**
- [x] 10 typów treningu, 49 gotowych planów, custom plans editor
- [x] AI Generator (Claude przez Cloudflare Worker proxy)
- [x] Tygodniowy raport AI — analiza 14 dni historii, highlights + sugestie
- [x] Tryb kart (partia po partii) + tryb listy
- [x] RPE, notatki, timer odpoczynku, kalkulator talerzy, live duration
- [x] Statystyki: per-exercise progress, PR ranking, kalendarz heatmap, achievements, analiza wzorców ruchowych
- [x] Bramka logowania na całą aplikację (Supabase auth, sesja zapamiętana)
- [x] Cloud sync (Supabase) z offline queue + retry
- [x] PDF export, backup JSON, save workout as template
- [x] Dark / light theme, color accent picker, mobile bottom nav
- [x] Push notifications, konfetti, onboarding tour, skeleton loaders

### ✅ V3 — *obecna wersja*
- [x] TypeScript migration — cały `src/` (lib, stores, composables, router, main)
- [x] Drift-corrected timer — absolutny `endTime` + `Date.now()`, re-sync na `visibilitychange`; fallback wideo trzyma ekran gdy Wake Lock zawodzi (Android/oszczędzanie baterii)
- [x] Timestamp-based conflict resolution — `updatedAt` per rekord, porównanie z DB `updated_at`, nowszy wygrywa
- [x] Kuratorowana baza 113 ćwiczeń — AI dobiera z niej ćwiczenia (kanoniczne nazwy, poprawne metadane, bez duplikatów)
- [x] Plan korekcyjny „Ćwiczenia dla Ani” — wybór sprzętu, przeciwwskazania, progresja przez trudność
- [x] AI Coach — analiza trendów per ćwiczenie + czat z trenerem (osobna zakładka)
- [x] Reset hasła (e-mail → nowy formularz) + pokaż/ukryj hasło
- [x] Fix: martwe zakładki po deployu — auto-reload przy błędzie ładowania chunku widoku

### 🔮 V4 — *następne kroki*
- [ ] Internacjonalizacja (EN) i przełącznik języka
- [ ] Rozszerzenie bazy ćwiczeń na pozostałe typy (Upper/Lower/FBW) + tryb strict wszędzie
- [ ] Pełny social (obserwowanie, leaderboardy)
- [ ] Integracje z wearables / Health
- [ ] Apple Watch / WearOS companion

---

## Known Issues

- **Pierwsze logowanie wymaga internetu** — bramka auth potrzebuje połączenia, by odczytać/utworzyć
  sesję. Po zalogowaniu token jest zapamiętany i aplikacja działa offline.
- **AI wymaga online** — generator planów nie działa bez internetu.
- **Timer odpoczynku w tle** — gdy telefon zablokowany, JS się usypia. Powiadomienie jest zapisane
  w SW, ale dokładność może spaść. Background Sync API w roadmap.
- **iOS** — instalacja PWA tylko ręcznie; dźwięk wymaga wcześniejszej interakcji z ekranem.
- **`color-mix()`** — używane w CSS, na bardzo starych przeglądarkach degraduje się łagodnie.

---

## Prywatność i bezpieczeństwo

- 🔐 **Klucz API** wyłącznie po stronie serwera (Cloudflare) — niewidoczny dla użytkownika
- 📦 **Dane w `localStorage`** — kopia lokalna + synchronizacja z chmurą po zalogowaniu
- ☁️ **Supabase** — konta email/hasło z izolacją per-user (Row Level Security w bazie)
- 🚫 **Brak śledzenia i reklam** — konto służy tylko do logowania i synchronizacji
- 🛡️ **CSP** + **integrity** na zasobach CDN
- ⚡ **CORS whitelist** na Cloudflare Workerze

---

## License

Projekt prywatny, do użytku własnego. Wszelkie prawa zastrzeżone © Łukasz Bonio.

<div align="center">

---

**Zbudowano z 💪 i ☕ — Vue 3 + Vite + Pinia + [Claude](https://www.anthropic.com/).**

[⬆ Powrót na górę](#-trening-pro)

</div>
