# 💪 Trening PRO

Osobista aplikacja treningowa z generowaniem planów przez AI (Claude), historią treningów, wykresami postępu i analizą partii mięśniowych. Obsługuje trzy systemy treningowe: **Push/Pull/Legs**, **Upper/Lower** i **Full Body**. Działa offline jako PWA — możesz zainstalować ją na telefonie i komputerze.

Plany treningowe generuje Claude — model AI z rozległą wiedzą z zakresu treningu siłowego i fizjologii sportu. Struktura planu (kolejność partii, zakresy powtórzeń, przerwy) dobierana jest zgodnie z Twoim celem treningowym. Claude analizuje historię ostatnich sesji i notatki po treningu, żeby każdy plan był lepiej dopasowany niż poprzedni.

> **Nie wymaga klucza API.** Aplikacja łączy się z AI przez bezpieczny serwer proxy (Cloudflare Worker) — klucz API jest ukryty po stronie serwera.

---

## ✨ Funkcje

### 🎯 Plany treningowe

- **3 systemy treningowe** do wyboru (dropdown na górze ekranu):
  - **PPL** — Push (klatka, barki, triceps) / Pull (plecy, biceps, przedramię) / Legs (nogi, core)
  - **Upper / Lower** — Siłowy · Objętościowy · Quad · Hinge (split 4-dniowy, zawsze cel masa+siła)
  - **Full Body** — Przysiad · Martwy · Hip Thrust (3 razy w tygodniu, całe ciało)
- **Sugestia następnego treningu** — aplikacja zapamiętuje ostatni typ i podpowiada co zrobić następnie
- **Generowanie planu przez Claude AI** — ćwiczenia pogrupowane wg partii mięśniowych, z opisem techniki
- **Zamienniki ćwiczeń** — przycisk ⇄ przy każdym ćwiczeniu proponuje 2–3 alternatywy angażujące tę samą partię (np. gdy wyciąg jest zajęty)
- **Spersonalizowane plany** — Claude analizuje Twoją historię treningów, unika powtarzania tych samych ćwiczeń
- **Wskazówki techniczne** przy każdym ćwiczeniu
- **🎬 Linki do YouTube** — otwiera wyszukiwanie techniki dla każdego ćwiczenia
- **🎯 Cel treningowy** — Redukcja / Masa / Siła / Rzeźba / Kondycja
- **📦 Plan offline** — 67 gotowych planów bez internetu i bez AI

### 📝 Rejestrowanie treningu — tryb krok po kroku

Po wygenerowaniu planu widzisz kompaktową listę ćwiczeń pogrupowanych po partii mięśniowej. Kliknij **Rozpocznij trening** aby wejść w tryb kart:

- **Jedno ćwiczenie / jedna seria na raz** — minimalne rozproszenie, maksymalny fokus
- **Pre-fill ciężaru** — seria 1 wczytuje ostatni używany ciężar, kolejne serie kopiują poprzednią
- **Timer odpoczynku** — automatycznie startuje po serii, czas dobierany wg celu (Redukcja: 60s, Masa: 90s, Siła: 120s)
- **Zmiana długości przerwy** na ekranie timera (60 / 90 / 120 / 180 s)
- **Pomiń przerwę** — przejście do następnej serii bez czekania
- **⇄ Zamień ćwiczenie** — dostępne przy serii 1 każdego ćwiczenia (gdy sprzęt zajęty)
- **🎬 Link YT** z techniką przy każdym ćwiczeniu
- **Wstecz** (krótkie kliknięcie = cofnij serię, długie przytrzymanie = menu nawigacji)
- **Pasek postępu** ćwiczeń na górze
- **Dane per seria** — każda seria zapisuje osobne kg × powt (np. 80kg×8, 80kg×6, 75kg×5)
- **Wibracja + dźwięk** gdy timer przerwy się kończy
- **Ekran podsumowania** — lista wyników, wolumen, notatka, zapis do historii

### 📊 Inne funkcje rejestrowania

- **💪 Kalkulator 1RM** (Brzycki + Epley)
- **⏱️ Stoper czasu treningu** — od "Rozpocznij" do zapisu
- **📅 Wybór daty treningu** — możliwość wpisania treningu z poprzedniego dnia
- **💾 Automatyczny zapis roboczy** — zamknięcie karty → baner przywracania po powrocie
- **📝 Notatka do treningu** — Claude uwzględnia ją przy kolejnym planie

### 📊 Analiza i statystyki

- **Statystyki tygodniowe** — liczba treningów, powtórzeń, wartości średnie
- **Wykres ostatnich 45 dni** — podział na Push / Pull / Legs
- **🔬 Analiza partii mięśniowych** — wybierz partię i pod-filtr głowy mięśnia; wykres per ćwiczenie
- **🔥 Najlepszy 1RM** — historyczny rekord siły dla każdego ćwiczenia
- **🧠 AI Coach** — Claude analizuje historię i wskazuje stagnację, postępy i sugestie
- **Historia z danymi per seria** — widoczne serie (80kg×8, 80kg×6, 75kg×5) dla treningów w trybie kart

### 📥 Import i eksport

- **Import z tekstu (AI)** — wklej opis treningu, Claude rozpozna dane
- **Import z pliku CSV** — wczytaj wcześniej wyeksportowany CSV (bez AI)
- **Eksport do CSV i PDF** — kopia zapasowa z pełnymi danymi
- **Wykrywanie duplikatów** przy imporcie

### 👥 Profile i dane

- **Wiele profili** — osobne dane dla każdej osoby
- **Historia** — ostatnie 200 treningów; przycisk "Pokaż wszystkie"
- **🛡️ Przypomnienie o kopii zapasowej** co 3 tygodnie

### 📱 PWA

- **Instalacja na telefonie i komputerze** — działa jak natywna aplikacja
- **Pełna obsługa trybu offline** (z wyjątkiem AI)
- **Automatyczne wykrywanie aktualizacji**

---

## 🗂️ Systemy treningowe

### PPL — Push / Pull / Legs

Klasyczny split 3-dniowy. Cel dobierany przez użytkownika.

| Tab | Partie mięśniowe | Ćwiczenia |
|---|---|---|
| Push | Klatka, barki, triceps | 7 |
| Pull | Plecy, tylne barki, biceps, przedramię | 8 |
| Legs | Czworogłowy, hamstring, pośladki, łydki, core | 7 |

### Upper / Lower — split 4-dniowy

Cel zawsze: **masa + siła**.

| Tab | Skupienie | Ćwiczenia |
|---|---|---|
| Siłowy | Klatka + plecy (bazowe), barki, biceps, triceps | 7 |
| Objętościowy | Klatka + plecy (hantlowe/maszyny), barki, biceps, triceps | 7 |
| Quad | Czworogłowy priorytet, hamstring, jednostronne, łydki, core | 6 |
| Hinge | Hip hinge priorytet, czworogłowy, pośladki, łydki, core | 6 |

**Układ tygodnia:** Pon — Siłowy · Wt — Quad · Czw — Objętościowy · Pt — Hinge

### Full Body — 3 razy w tygodniu

| Tab | Główne ruchy | Ćwiczenia |
|---|---|---|
| Przysiad | Przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core | 7 |
| Martwy | Martwy ciąg + skos + podciąganie + split squat + wznosy + triceps + core | 7 |
| Hip Thrust | Front squat + bench hantle + wiosłowanie + hip thrust + face pull + biceps/tri + łydki | 7 |

**Układ tygodnia:** Pon — Przysiad · Śr — Martwy · Pt — Hip Thrust

---

## 🎯 Cele treningowe

| Cel | Powtórzenia | Serie | Przerwa między seriami | Przerwa między ćwiczeniami |
|---|---|---|---|---|
| **Redukcja** | 12–15 | 3 | 60 s | 90 s |
| **Rzeźba** | 12–15 | 3–4 | 60 s | 90 s |
| **Masa** | 8–12 | 3–4 | 90 s | 120 s |
| **Siła** | 3–5 | 4–5 | 120 s | 180 s |
| **Kondycja** | 15–20 | 3 | 45 s | 60 s |

---

## 🚀 Pierwsze uruchomienie

1. Otwórz `https://LukaszBonio.github.io/trening/`
2. Przy pierwszym uruchomieniu pojawi się karta **„Jak zacząć?"** — znika po pierwszym zapisanym treningu
3. Wybierz system treningowy z dropdownu (PPL / Upper-Lower / Full Body) i konkretny dzień
4. Kliknij **Nowy plan** — plan pojawi się w ciągu kilku sekund
5. Przejrzyj ćwiczenia na liście (kliknij ćwiczenie aby rozwinąć szczegóły i zamienniki)
6. Kliknij **Rozpocznij trening** aby wejść w tryb krok po kroku
7. Po każdej serii wpisz powtórzenia i ciężar, kliknij **Gotowe** — timer odpoczynku startuje automatycznie
8. Po wszystkich seriach ostatniego ćwiczenia pojawia się ekran podsumowania → **Zapisz trening**

> Bez połączenia z internetem korzystaj z **Planu offline** (przycisk obok "Nowy plan").

---

## ⇄ Zamienniki ćwiczeń

Gdy sprzęt jest zajęty lub chcesz zmienić ćwiczenie:

**Na liście podglądu (przed startem):**
1. Kliknij ćwiczenie aby rozwinąć szczegóły
2. Kliknij jeden z zamienników — zmiana jest natychmiastowa

**W trybie kart (podczas treningu):**
1. Przycisk **⇄ zamień** widoczny przy serii 1 każdego ćwiczenia
2. Wybierz zamiennik z listy — trening kontynuuje z nowym ćwiczeniem
3. W historii zapisuje się co faktycznie zrobiłeś (z adnotacją o zamianie)

> Zamienniki dobierane przez AI angażują **dokładnie tę samą partię mięśniową** co oryginał, ale z innym sprzętem.

---

## 💾 Przywracanie niedokończonego treningu

Jeśli przypadkowo zamkniesz kartę podczas treningu:

1. Wróć na `https://LukaszBonio.github.io/trening/`
2. Na górze ekranu pojawi się baner **"Niedokończony trening"** z podglądem:
   - Typ treningu, liczba ćwiczeń, czas trwania, wpisane ciężary
3. Kliknij **Wróć do treningu** — wszystko wraca do stanu sprzed zamknięcia (łącznie z timerem)
4. Lub kliknij **Odrzuć** aby zacząć od nowa

> Trening jest automatycznie zapisywany co kilka sekund i tuż przed zamknięciem karty. Draft wygasa po 72 godzinach.

---

## ⏰ Timer odpoczynku

Timer startuje automatycznie po kliknięciu **Gotowe** w trybie kart:

- Czas dobierany wg celu (Redukcja: 60s, Masa: 90s, Siła: 120s)
- Dłuższy timer między ćwiczeniami (automatycznie)
- Presety **60 / 90 / 120 / 180 s** — kliknij aby zmienić na bieżąco
- **Pomiń przerwę** — natychmiastowe przejście do następnej serii
- **Wibracja + dźwięk** po zakończeniu (konfigurowalnie w profilu)
- **Głos po polsku** — komunikat "Czas na następną serię"

---

## 📦 Plan offline

Gdy nie masz dostępu do internetu:

1. Wybierz system i typ treningu
2. Kliknij **Plan offline**
3. Aplikacja wybiera plan z wbudowanej bazy — preferuje ćwiczenia i partie których nie robiłeś w ostatnich 7 dniach

Baza zawiera **67 gotowych planów** oraz **276+ ćwiczeń** zmapowanych na 25 głów mięśniowych.

---

## 💪 Kalkulator 1RM

**1RM (One-Rep Max)** — szacowany maksymalny ciężar w jednym powtórzeniu:

```
Brzycki:  1RM = ciężar × (36 / (37 − powtórzenia))
Epley:    1RM = ciężar × (1 + powtórzenia / 30)
```

Wynik = średnia z obu wzorów, zaokrąglona do 0,5 kg. Działa dla 2–12 powtórzeń.

---

## 📲 Instalacja jako aplikacja

### Android (Chrome)
- Menu Chrome (trzy kropki) → "Zainstaluj aplikację"

### iPhone (Safari)
- Safari → Udostępnij → **Dodaj do ekranu głównego**

### Windows i macOS (Chrome / Edge)
- W pasku adresu kliknij ikonę instalacji (monitor ze strzałką)

---

## 💰 Koszty

| Co | Koszt |
|---|---|
| Aplikacja | **Bezpłatna** |
| Hosting (GitHub Pages) | Bezpłatny |
| AI (Cloudflare Worker proxy) | Bezpłatny do 100k req/dzień |
| Plan offline | Bezpłatny |
| Import z CSV | Bezpłatny |

> AI działa przez bezpieczny serwer proxy — nie musisz podawać klucza API.

---

## 🛠️ Użyte technologie

- **HTML5, CSS3, Vanilla JavaScript** — bez zewnętrznych frameworków
- [Chart.js 4.4](https://www.chartjs.org/) — wykresy
- [jsPDF 2.5](https://github.com/parallax/jsPDF) — eksport do PDF
- [DOMPurify 3.1](https://github.com/cure53/DOMPurify) — ochrona przed XSS
- [Tabler Icons](https://tabler-icons.io/) — ikony
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — animacja po zapisaniu
- [Claude API](https://www.anthropic.com/) — generowanie planów i analiza AI (claude-sonnet-4-6)
- **Cloudflare Workers** — bezpieczny proxy dla API (klucz ukryty po stronie serwera)
- **Web Audio API** — dźwięk dzwonka
- **Web Speech API** — komunikat głosowy po polsku
- **Vibration API** — wibracja telefonu
- **localStorage** — trwałe przechowywanie danych lokalnie
- **Service Worker** — tryb offline i automatyczne aktualizacje

---

## 📁 Struktura repozytorium

```
trening/
├── index.html              # Główny plik aplikacji
├── db.js                   # Baza planów offline + słownik głów mięśniowych
├── manifest.json           # Konfiguracja PWA
├── sw.js                   # Service Worker (offline i auto-aktualizacje)
├── icon-192.png            # Ikona 192×192 px
├── icon-512.png            # Ikona 512×512 px
├── icon-maskable-512.png   # Ikona z obszarem bezpiecznym (Android)
└── README.md               # Ten plik
```

> Cloudflare Worker (`worker.js`) jest deployowany osobno na dash.cloudflare.com — nie jest częścią tego repozytorium.

---

## 🔒 Prywatność i bezpieczeństwo

- 🔐 **Klucz API** przechowywany wyłącznie na serwerze Cloudflare — niewidoczny dla użytkowników
- 📦 **Historia treningów** zapisywana lokalnie — nie jest nigdzie przesyłana
- 🚫 **Brak rejestracji, konta, śledzenia aktywności i reklam**
- 📡 Połączenie z internetem służy **wyłącznie** do komunikacji z Cloudflare Worker → Claude API
- 🛡️ **DOMPurify** — odpowiedzi z AI są sanityzowane przed wyświetleniem
- 🔍 **Walidacja danych** — uszkodzone wpisy są automatycznie filtrowane
- ⚡ **CORS whitelist** na Workerze — tylko `lukaszbonio.github.io` może używać proxy

---

## ⚠️ Ważne informacje

- Dane są przypisane do **konkretnej przeglądarki na konkretnym urządzeniu**
- Wyczyszczenie danych przeglądarki spowoduje utratę historii — **rób regularne kopie zapasowe**
- Limit historii: 200 ostatnich treningów na profil
- AI Coach analizuje maksymalnie 50 ostatnich treningów
- Przełączenie zakładki (Push → Pull) podczas aktywnego treningu wyświetli potwierdzenie

---

## 🐛 Zgłaszanie błędów

Kliknij **Zgłoś bug** w menu bocznym (ikona hamburger) — otworzy się email z pre-wypełnionym opisem problemu i informacjami technicznymi.

---

## 🔧 Rozwiązywanie problemów

### Aplikacja nie aktualizuje się po wgraniu nowej wersji
1. Poczekaj — aplikacja sama wykryje aktualizację
2. Wymuś odświeżenie: **Ctrl+Shift+R** (komputer) lub wyczyść cache Chrome (telefon)
3. Odinstaluj PWA i zainstaluj ponownie

### Komunikat głosowy nie działa
- Android: Ustawienia → Dostępność → Synteza mowy → dodaj polski głos
- iOS: dźwięk wymaga wcześniejszego dotknięcia ekranu (ograniczenie iOS)

### Baner „Zainstaluj" nie pojawia się na iPhonie
To ograniczenie Apple — na iOS instalacja wyłącznie ręcznie:
Safari → Udostępnij → **Dodaj do ekranu głównego**

---

## 📜 Licencja

Projekt prywatny, do użytku własnego.
