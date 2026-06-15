<div align="center">

# 💪 Trening Pro

### Inteligentna aplikacja treningowa z planami generowanymi przez AI

Twój osobisty trener siłowy w przeglądarce — generuje plany dopasowane do Twojego celu,
prowadzi Cię przez trening seria po serii i analizuje postępy. Działa offline jako PWA.

[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://lukaszbonio.github.io/trening/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-zero_build-F7DF1E?logo=javascript&logoColor=black)](#technology-stack)
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
- [Installation](#installation)
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
Plany generuje **Claude** (model `claude-sonnet-4-6`) z uwzględnieniem Twojego celu, historii
i notatek po treningu — dzięki czemu każdy kolejny plan jest lepiej dopasowany niż poprzedni.

Aplikacja jest **zero-build**: to jeden statyczny plik HTML z osadzonym CSS i JavaScriptem,
bez frameworków i bez kroku kompilacji. Hostowana jest na GitHub Pages, a klucz API ukryty jest
za serwerem proxy (Cloudflare Worker) — **użytkownik nie potrzebuje własnego klucza API.**

> **Dla kogo?** Dla osób trenujących siłowo, które chcą gotowego planu na dziś, prostego
> rejestrowania serii i czytelnej analizy postępów — bez zakładania konta i bez opłat.

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
- **3 systemy treningowe** — PPL (Push/Pull/Legs), Upper/Lower (4-dniowy), Full Body (3×/tydz.)
- **Generowanie planu przez AI** — ćwiczenia pogrupowane wg partii, z opisem techniki
- **Spersonalizowane** — Claude analizuje historię i unika powtarzania ćwiczeń
- **Sugestia następnego treningu** — aplikacja pamięta ostatni typ i podpowiada kolejny
- **Zamienniki ćwiczeń (⇄)** — alternatywy angażujące tę samą partię, gdy sprzęt zajęty
- **Cel treningowy** — Redukcja / Masa / Siła / Rzeźba / Kondycja (steruje seriami i przerwami)
- **Plan offline** — 67 gotowych planów i 276+ ćwiczeń bez internetu i bez AI

### 🏋️ Rejestrowanie treningu (tryb krok po kroku)
- **Tryb kart** — jedna seria na ekranie, maksymalny fokus
- **Pre-fill ciężaru** — wczytuje ostatni używany ciężar, kolejne serie kopiują poprzednią
- **Timer odpoczynku** — startuje automatycznie, czas wg celu, presety 60/90/120/180 s
- **Dane per seria** — np. `80kg×8, 80kg×6, 75kg×5`
- **Wibracja + dźwięk + komunikat głosowy** po zakończeniu przerwy
- **Kalkulator 1RM** (Brzycki + Epley), stoper czasu treningu, wybór daty
- **Autozapis roboczy** — baner przywracania niedokończonego treningu (TTL 72 h)

### 📊 Dashboard i analiza
- **Dashboard (Pulpit)** — ekran startowy: dzisiejszy trening, statystyki tygodnia,
  ostatnia aktywność, seria dni z rzędu, pasek 7 dni, szybkie akcje
- **Statystyki tygodniowe** i **wykres ostatnich 45 dni** (Push/Pull/Legs)
- **Analiza partii mięśniowych** — wykres siły per ćwiczenie, historyczny rekord 1RM
- **AI Coach** — Claude wskazuje stagnację, postępy i konkretne sugestie

### 📥 Dane
- **Import** z tekstu (AI) lub pliku CSV · **Eksport** do CSV i PDF · wykrywanie duplikatów
- **Wiele profili** · historia 200 ostatnich treningów · przypomnienia o kopii zapasowej

### 📱 PWA
- Instalacja na telefonie i komputerze · pełny tryb offline (poza AI) · auto-aktualizacje
- **Responsywny UI premium** — stały sidebar (desktop), dolny pasek nawigacji (mobile), tryb ciemny

---

## Quick Start

Aplikacja to **statyczny PWA bez kroku build** — wystarczy zaserwować pliki przez dowolny serwer HTTP.

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/LukaszBonio/trening.git
cd trening

# 2. Uruchom lokalny serwer (wybierz jedno)
python -m http.server 8000          # Python 3
npx serve .                         # Node.js
php -S localhost:8000               # PHP

# 3. Otwórz w przeglądarce
#    http://localhost:8000
```

> ⚠️ Otwieranie przez `file://` nie zadziała poprawnie — Service Worker i `fetch` wymagają
> kontekstu HTTP(S). Użyj serwera lokalnego (powyżej) lub hostingu.

**Build produkcyjny?** Nie ma żadnego — wgrywasz pliki tak jak są (patrz [Installation](#installation)).

---

## Installation

### A. Hosting aplikacji (frontend)

Dowolny statyczny hosting. Rekomendowany **GitHub Pages**:

```bash
# Wypchnij na branch main, włącz Pages: Settings → Pages → Source: main /(root)
git push origin main
# Aplikacja: https://<użytkownik>.github.io/trening/
```

Alternatywnie: Netlify, Vercel, Cloudflare Pages — przeciągnij katalog lub podłącz repo.

### B. Serwer proxy AI (Cloudflare Worker)

Funkcje AI (generowanie planów, AI Coach, import z tekstu) wymagają proxy, które ukrywa klucz
API Anthropic. **`worker.js` nie jest częścią tego repozytorium** — deployujesz go osobno:

```bash
# Wymaga konta Cloudflare i CLI Wrangler
npm install -g wrangler
wrangler login

# Ustaw klucz API jako sekret (NIE commituj go!)
wrangler secret put ANTHROPIC_API_KEY

# Deploy workera
wrangler deploy
```

Worker przyjmuje `POST` z body `{ model, max_tokens, messages }`, dołącza nagłówek
`x-api-key` i przekazuje żądanie do `https://api.anthropic.com/v1/messages`, zwracając odpowiedź.
Adres workera podajesz w aplikacji (stała `CLAUDE_API_URL` w `index.html` lub override w localStorage —
patrz [Environment Variables](#environment-variables)).

> Bez własnego workera możesz korzystać z **Planu offline** i pełnego rejestrowania treningów —
> nie działają jedynie funkcje oparte na AI.

---

## Environment Variables

Frontend jest **statyczny i nie używa zmiennych środowiskowych w czasie build**. Konfiguracja
dotyczy wyłącznie serwera proxy oraz (opcjonalnie) nadpisania adresu proxy po stronie klienta.

### Cloudflare Worker

| Zmienna | Typ | Wymagana | Opis |
|---|---|:---:|---|
| `ANTHROPIC_API_KEY` | secret | ✅ | Klucz API Anthropic — ukryty po stronie serwera |
| `ALLOWED_ORIGIN` | var | ⬜ | Whitelist CORS, np. `https://lukaszbonio.github.io` |

Przykładowy plik `.dev.vars` (lokalne testy Wrangler — **nie commituj**):

```ini
# .dev.vars
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGIN=https://lukaszbonio.github.io
```

### Konfiguracja po stronie klienta

| Klucz | Miejsce | Opis |
|---|---|---|
| `CLAUDE_API_URL` | stała w `index.html` | Domyślny adres workera proxy |
| `tp_proxy_url` | `localStorage` | Opcjonalne nadpisanie adresu proxy (Ustawienia → profil) |

---

## Architecture

Aplikacja jest klientocentryczna: cała logika i dane żyją w przeglądarce, a sieć służy wyłącznie
do wywołań AI przez proxy. Service Worker zapewnia działanie offline.

```mermaid
flowchart LR
    subgraph Client["📱 Przeglądarka (PWA)"]
        UI["index.html<br/>UI + logika · Vanilla JS"]
        DB["db.js<br/>67 planów offline · 276+ ćwiczeń"]
        SW["sw.js<br/>Service Worker · cache"]
        LS[("localStorage<br/>profile · historia · draft")]
    end
    subgraph Edge["☁️ Cloudflare"]
        W["Worker (proxy)<br/>klucz API ukryty · CORS"]
    end
    AI["🧠 Claude API<br/>claude-sonnet-4-6"]

    UI <-->|odczyt/zapis| LS
    UI -->|plan offline| DB
    SW -.->|serwuje z cache| UI
    UI -->|POST plan / analiza| W
    W -->|x-api-key| AI
    AI -->|JSON| W
    W -->|JSON| UI
```

### Przepływ użytkownika

```mermaid
flowchart TD
    A["Wybierz system<br/>PPL / Upper-Lower / FBW"] --> B["Wybierz dzień + cel"]
    B --> C{"Online?"}
    C -->|Tak| D["Generuj plan AI (Claude)"]
    C -->|Nie| E["Plan offline (baza)"]
    D --> F["Tryb kart: seria po serii"]
    E --> F
    F --> G["Timer odpoczynku"]
    G --> F
    F --> H["Podsumowanie → zapis do historii"]
    H --> I["Dashboard · Statystyki · AI Coach"]
```

### Struktura repozytorium

```
trening/
├── index.html              # Cała aplikacja: UI + CSS + logika (Vanilla JS)
├── db.js                   # Baza planów offline + słownik 25 głów mięśniowych
├── sw.js                   # Service Worker (offline, cache, auto-aktualizacje)
├── manifest.json           # Konfiguracja PWA (ikony, skróty, motyw)
├── icon-192.png            # Ikona 192×192
├── icon-512.png            # Ikona 512×512
├── icon-maskable-512.png   # Ikona maskable (Android)
└── README.md               # Ten plik
```

> Serwer proxy (`worker.js`) deployowany jest osobno na Cloudflare i nie znajduje się w repo.

### Główne moduły (wewnątrz `index.html`)

| Moduł | Odpowiedzialność |
|---|---|
| **State / Profiles** | Profile, historia, cache, wersjonowanie schematu w `localStorage` |
| **Plan engine** | `WORKOUT_SCHEMA`, generowanie planów AI + sugestie, zamienniki |
| **Workout (card mode)** | Tryb krok po kroku, timer odpoczynku, dane per seria, draft |
| **Dashboard / Stats** | Pulpit, statystyki, wykresy Chart.js, analiza partii i 1RM |
| **AI Coach** | Wywołania `callClaude()` + parsowanie/sanityzacja odpowiedzi |
| **PWA** | Rejestracja Service Workera, install prompt, obsługa aktualizacji |

---

## Technology Stack

| Warstwa | Technologia |
|---|---|
| **Język / runtime** | HTML5 · CSS3 · Vanilla JavaScript (ES2020+) — **bez frameworka, bez build** |
| **Wykresy** | [Chart.js 4.4](https://www.chartjs.org/) |
| **PDF / bezpieczeństwo** | [jsPDF 2.5](https://github.com/parallax/jsPDF) · [DOMPurify 3.1](https://github.com/cure53/DOMPurify) |
| **Ikony / UI** | [Tabler Icons](https://tabler-icons.io/) · [canvas-confetti](https://github.com/catdad/canvas-confetti) · Google Fonts (Inter, Space Grotesk) |
| **AI** | [Claude API](https://www.anthropic.com/) — `claude-sonnet-4-6` |
| **Backend (proxy)** | Cloudflare Workers (serverless, klucz API ukryty) |
| **Web API** | Service Worker · localStorage · Web Audio · Web Speech · Vibration |
| **Hosting** | GitHub Pages (frontend) + Cloudflare (proxy) |

---

## Jak korzystać (UX)

1. **Otwórz Dashboard** — zobacz dzisiejszy sugerowany trening, statystyki tygodnia i serię dni.
2. **Wybierz system i dzień** w widoku *Plan* (PPL / Upper-Lower / FBW) oraz **cel treningowy**.
3. **Wygeneruj plan** (AI) lub użyj **Planu offline**.
4. **Rozpocznij trening** — wpisuj powtórzenia i ciężar seria po serii; timer odpoczynku startuje sam.
5. **Zapisz** — wynik trafia do *Historii*, a *Statystyki* i *AI Coach* aktualizują się automatycznie.

**Główne ekrany:** `Pulpit` · `Plan na dziś` · `Historia` · `Statystyki i mięśnie` · `AI Coach`.

### Cele treningowe

| Cel | Powtórzenia | Serie | Przerwa (serie) | Przerwa (ćwiczenia) |
|---|---|---|---|---|
| **Redukcja** | 12–15 | 3 | 60 s | 90 s |
| **Rzeźba** | 12–15 | 3–4 | 60 s | 90 s |
| **Masa** | 8–12 | 3–4 | 90 s | 120 s |
| **Siła** | 3–5 | 4–5 | 120 s | 180 s |
| **Kondycja** | 15–20 | 3 | 45 s | 60 s |

### Kalkulator 1RM

```
Brzycki:  1RM = ciężar × (36 / (37 − powtórzenia))
Epley:    1RM = ciężar × (1 + powtórzenia / 30)
```
Wynik = średnia z obu wzorów, zaokrąglona do 0,5 kg (działa dla 2–12 powtórzeń).

---

## Systemy treningowe

<details>
<summary><b>PPL — Push / Pull / Legs (3-dniowy)</b></summary>

| Dzień | Partie | Ćwiczenia |
|---|---|---|
| Push | Klatka, barki, triceps | 7 |
| Pull | Plecy, tylne barki, biceps, przedramię | 8 |
| Legs | Czworogłowy, hamstring, pośladki, łydki, core | 7 |

</details>

<details>
<summary><b>Upper / Lower — split 4-dniowy (cel: masa + siła)</b></summary>

| Dzień | Skupienie | Ćwiczenia |
|---|---|---|
| Siłowy | Klatka + plecy (bazowe), barki, biceps, triceps | 7 |
| Objętościowy | Klatka + plecy (hantle/maszyny), barki, biceps, triceps | 7 |
| Quad | Czworogłowy priorytet, hamstring, jednostronne, łydki, core | 6 |
| Hinge | Hip hinge priorytet, czworogłowy, pośladki, łydki, core | 6 |

**Tydzień:** Pon — Siłowy · Wt — Quad · Czw — Objętościowy · Pt — Hinge

</details>

<details>
<summary><b>Full Body — 3 razy w tygodniu</b></summary>

| Dzień | Główne ruchy | Ćwiczenia |
|---|---|---|
| Przysiad | Przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core | 7 |
| Martwy | Martwy + skos + podciąganie + split squat + wznosy + triceps + core | 7 |
| Hip Thrust | Front squat + bench hantle + wiosło + hip thrust + face pull + biceps/tri + łydki | 7 |

**Tydzień:** Pon — Przysiad · Śr — Martwy · Pt — Hip Thrust

</details>

---

## FAQ

<details>
<summary><b>Czy potrzebuję klucza API, żeby korzystać z AI?</b></summary>

Nie. Aplikacja łączy się z Claude przez serwer proxy (Cloudflare Worker), gdzie klucz jest
ukryty. Jeśli hostujesz własną kopię, musisz wdrożyć własnego workera (patrz *Installation*).
</details>

<details>
<summary><b>Czy moje dane trafiają na serwer?</b></summary>

Nie. Historia i profile zapisywane są **wyłącznie lokalnie** (`localStorage`). Do internetu
wysyłany jest tylko prompt do generowania planu / analizy AI.
</details>

<details>
<summary><b>Czy działa offline?</b></summary>

Tak — dzięki Service Workerowi. Offline dostępne jest pełne rejestrowanie treningów oraz
**Plan offline** (67 gotowych planów). Funkcje AI wymagają połączenia.
</details>

<details>
<summary><b>Jak przenieść dane na inne urządzenie?</b></summary>

Wyeksportuj kopię (CSV/PDF) na starym urządzeniu, a następnie zaimportuj CSV na nowym.
Dane są przypisane do konkretnej przeglądarki — synchronizacja w chmurze jest na *Roadmap*.
</details>

<details>
<summary><b>Dlaczego na iPhonie nie ma przycisku „Zainstaluj"?</b></summary>

To ograniczenie iOS. Instalacja ręczna: **Safari → Udostępnij → Dodaj do ekranu głównego**.
</details>

---

## Roadmap

### 🅰️ Alpha — *obecna wersja*
- [x] 3 systemy treningowe (PPL / Upper-Lower / FBW)
- [x] Generowanie planów AI + Plan offline (67 planów)
- [x] Tryb kart, timer odpoczynku, dane per seria, draft
- [x] Historia, statystyki, wykresy, analiza partii, AI Coach
- [x] PWA (offline, instalacja) + Dashboard + UI premium

### 🅱️ Beta — *następne kroki*
- [ ] Opcjonalna synchronizacja w chmurze (backup konta)
- [ ] Skeleton loading i dopracowane stany ładowania
- [ ] Więcej typów wykresów (wolumen tygodniowy, trend 1RM)
- [ ] Rozszerzony import/eksport (JSON) + scalanie profili
- [ ] Testy automatyczne kluczowej logiki

### 1️⃣ Wersja 1.0
- [ ] Konta użytkowników i synchronizacja end-to-end
- [ ] Internacjonalizacja (EN) i przełącznik języka
- [ ] Integracje z wearables / Health
- [ ] Udostępnianie planów i wyników (social)
- [ ] Konfigurowalne motywy i akcenty

---

## Known Issues

- **Brak synchronizacji w chmurze** — dane są lokalne (per przeglądarka/urządzenie); wyczyszczenie
  danych przeglądarki = utrata historii. Rób regularne kopie zapasowe.
- **`worker.js` / `DEPLOY_WORKER.md` poza repo** — kod odwołuje się do `DEPLOY_WORKER.md`, którego
  nie ma w repozytorium; instrukcję deployu proxy znajdziesz w sekcji [Installation](#installation).
- **Monolit `index.html`** (~290 KB) — brak bundlera/modularyzacji; świadomy kompromis „zero-build".
- **AI wymaga online** — generowanie planów i AI Coach nie działają bez internetu.
- **iOS** — instalacja PWA tylko ręcznie; dźwięk wymaga wcześniejszej interakcji z ekranem.
- **`color-mix()` / `:has()`** — premium UI używa nowoczesnych funkcji CSS; na bardzo starych
  przeglądarkach degradują się łagodnie (bez utraty funkcji).

---

## Prywatność i bezpieczeństwo

- 🔐 **Klucz API** wyłącznie po stronie serwera (Cloudflare) — niewidoczny dla użytkownika
- 📦 **Dane lokalnie** — historia i profile nie są nigdzie wysyłane
- 🚫 **Brak rejestracji, kont, śledzenia i reklam**
- 🛡️ **DOMPurify** — odpowiedzi AI sanityzowane przed wyświetleniem; **CSP** + **SRI** na zasobach CDN
- ⚡ **CORS whitelist** na Workerze — proxy używa tylko zaufana domena

---

## License

Projekt prywatny, do użytku własnego. Wszelkie prawa zastrzeżone © Łukasz Bonio.

<div align="center">

---

**Zbudowano z 💪 i ☕ — plany napędzane przez [Claude](https://www.anthropic.com/).**

[⬆ Powrót na górę](#-trening-pro)

</div>
