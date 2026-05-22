# 💪 Trening Pro

Osobista aplikacja treningowa z generowaniem planów przez AI (Claude), historią treningów, wykresami postępu i analizą partii mięśniowych. Obsługuje trzy systemy treningowe: **Push/Pull/Legs**, **Upper/Lower** i **Full Body**. Działa offline jako PWA — możesz zainstalować ją na telefonie i komputerze.

Plany treningowe generuje Claude — model AI z rozległą wiedzą z zakresu treningu siłowego i fizjologii sportu. Struktura planu (kolejność partii, zakresy powtórzeń, przerwy) dobierana jest zgodnie z Twoim celem treningowym. Claude analizuje historię ostatnich sesji i notatki po treningu, żeby każdy plan był lepiej dopasowany niż poprzedni.

---

## ✨ Funkcje

### 🎯 Plany treningowe

- **3 systemy treningowe** do wyboru (dropdown na górze ekranu):
  - **PPL** — Push (klatka, barki, triceps) / Pull (plecy, biceps, przedramię) / Legs (nogi, core)
  - **Upper / Lower** — Siłowy · Objętościowy · Quad · Hinge (split 4-dniowy, zawsze cel masa+siła)
  - **Full Body** — Przysiad · Martwy · Hip Thrust (3 razy w tygodniu, całe ciało)
- **Sugestia następnego treningu** — aplikacja zapamiętuje ostatni typ i podpowiada co zrobić następnie; sugerowany tab lekko pulsuje
- **Generowanie planu przez Claude AI** — ćwiczenia pogrupowane klasterowo wg partii mięśniowych, z opisem techniki wykonania
- **Nawigacja po partiach mięśniowych** — ćwiczenia podzielone na grupy (np. klatka → barki → triceps), przechodź przez nie kolejno przyciskami
- **Spersonalizowane plany** — Claude analizuje Twoją historię treningów, unika powtarzania tych samych ćwiczeń
- **Wskazówki techniczne** przy każdym ćwiczeniu
- **🎬 Linki do YouTube** — przycisk „Pokaż" przy każdym ćwiczeniu otwiera wyszukiwanie techniki
- **🎯 Cel treningowy** — klikalny badge przy tabach (Redukcja / Masa / Siła / Rzeźba / Kondycja); Upper/Lower zawsze masa+siła (zablokowane)
- **📦 Plan offline** — 67 gotowych planów bez internetu i bez kosztów API:
  - 10 × Push, 10 × Pull, 10 × Legs
  - 3 × Siłowy, 3 × Objętościowy, 3 × Quad, 3 × Hinge
  - 2 × Przysiad, 2 × Martwy, 2 × Hip Thrust
  - Inteligentny wybór uzupełniający brakujące partie

### 📝 Rejestrowanie treningu

- **Powtórzenia × serie** — wpisujesz liczbę powtórzeń, aplikacja liczy łączną sumę automatycznie
- **Ciężar w kg** — śledzenie postępu obciążeń
- **🏷️ Hint ostatniego ciężaru** — pod polem ciężaru wyświetla się ostatnio używane obciążenie (np. `🏋️ ostatnio: 80 kg`); przy pierwszym użyciu ćwiczenia — sugerowany ciężar startowy
- **💪 Kalkulator 1RM** — szacowany maksymalny ciężar jednopowtórzeniowy (wzory Brzycki i Epley)
- **⏱️ Stoper czasu treningu** — mierzy czas całej sesji od wygenerowania planu do zapisu
- **📅 Wybór daty treningu** — możliwość wpisania treningu z poprzedniego dnia
- **⏰ Timer odpoczynku (FAB)** z presetami 60 s / 90 s / 120 s, SVG pierścień wizualizujący czas
- **🖐️ Przeciągany timer** — timer można swobodnie przesuwać palcem po ekranie, pozycja zapamiętywana
- **🎤 Komunikat głosowy po polsku** — informuje o końcu przerwy (Web Speech API)
- **🔔 Dźwięk dzwonka i wibracja** — konfigurowalne niezależnie
- **💾 Automatyczny zapis roboczy** — odświeżenie strony przywraca poprzedni trening
- **⚠️ Przypomnienie o zapisaniu** — pojawia się gdy wszystkie pola są wypełnione
- **📊 Kołowy progress ring** — pokazuje procentowy postęp wypełnienia ćwiczeń w sesji
- **✅ Wizualne oznaczenie ukończonych ćwiczeń** — karta zielenieje i przekreśla nazwę po wpisaniu powtórzeń
- **🚫 Zakończ bez zapisywania** — czyści plan bez wpisu do historii
- **📝 Notatka do treningu** — pole tekstowe z feedbackiem po sesji; Claude uwzględnia ją przy kolejnym planie tego samego typu

### 📊 Analiza i statystyki

- **Statystyki tygodniowe** — liczba treningów, powtórzeń, wartości średnie
- **Wykres ostatnich 45 dni** — podział na Push / Pull / Legs
- **🔬 Analiza partii mięśniowych** — wybierz partię główną (np. Biceps), a następnie pod-filtr głowy mięśnia (np. Głowa długa / Głowa krótka / Wszystkie); wykres pokazuje osobną linię dla każdego ćwiczenia należącego do wybranej partii
- **🔥 Najlepszy 1RM** — historyczny rekord siły dla każdego ćwiczenia w danej partii
- **🧠 AI Coach** — Claude analizuje historię treningów i wskazuje stagnację, postępy oraz sugestie
- **💪 Statystyki partii mięśniowych** — podział na klatka górna/środkowa/dolna, biceps, plecy, czworogłowy, hamstring i inne (ostatnie 45 dni)

### 📥 Import treningu

- **Import z tekstu (AI)** — wklej opis treningu w dowolnym formacie, Claude rozpozna dane
- **Import z pliku CSV** — wczytaj wcześniej wyeksportowany plik CSV (bezpłatnie, bez API)
- **Podgląd przed zapisem** — sprawdź poprawność zanim dane trafią do historii
- **Obsługa niestandardowej liczby serii** — np. 2×8 zamiast 3×8
- **Wykrywanie duplikatów** — treningi już obecne w historii nie zostaną dodane ponownie

### 👥 Profile i dane

- **Wiele profili** — osobne profile dla Ciebie, partnera lub znajomych
- **Trwała historia** — dane przechowywane lokalnie w przeglądarce
- **Czytelna data w historii** — format DD.MM.YYYY · HH:MM z oznaczeniem „dziś" i „wczoraj"
- **Eksport do CSV i PDF** — kopia zapasowa z pełnymi danymi (1RM, czas treningu, ciężary)
- **🛡️ Przypomnienie o kopii zapasowej** co 3 tygodnie

### 📱 Progresywna Aplikacja Webowa (PWA)

- **Instalacja na telefonie** — działa jak natywna aplikacja
- **Instalacja na komputerze** — Chrome i Edge
- **Pełna obsługa trybu offline** (z wyjątkiem generowania planów przez AI i AI Coach)
- **Automatyczne wykrywanie aktualizacji** — aplikacja wyświetli powiadomienie o nowej wersji
- **Nawigacja górna na mobile** — pasek nawigacji z ikonami sekcji (Plan / Historia / Stats / Analiza / Coach)
- **Ekran startowy** z logo i animacją przy uruchomieniu
- **Ikona na ekranie głównym** i ciemny motyw (dark mode)
- **Wskaźnik trybu offline** — widoczna informacja o braku połączenia

---

## 🗂️ Systemy treningowe

### PPL — Push / Pull / Legs

Klasyczny split 3-dniowy. Cel dobierany przez użytkownika (Redukcja / Masa / Siła / Rzeźba / Kondycja).

| Tab | Partie mięśniowe | Ćwiczenia |
|---|---|---|
| Push | Klatka, barki, triceps | 7 |
| Pull | Plecy, tylne barki, biceps, przedramię | 8 |
| Legs | Czworogłowy, hamstring, pośladki, łydki, core | 7 |

### Upper / Lower — split 4-dniowy

Cel zawsze: **masa + siła** (zablokowane — nie można zmienić). Warianty Siłowy i Objętościowy różnią się ćwiczeniami, żeby unikać stagnacji.

| Tab | Skupienie | Ćwiczenia |
|---|---|---|
| Siłowy | Klatka + plecy (bazowe sztangowe), barki, biceps, triceps | 7 |
| Objętościowy | Klatka + plecy (hantlowe/maszyny), barki, biceps, triceps | 7 |
| Quad | Czworogłowy priorytet (przysiad), hamstring, jednostronne, łydki, core | 6 |
| Hinge | Hip hinge priorytet (martwy ciąg), czworogłowy, pośladki, łydki, core | 6 |

**Układ tygodnia:** Pon — Siłowy · Wt — Quad · Czw — Objętościowy · Pt — Hinge

**Progresja:** górna część +2,5 kg · dolna część +5 kg gdy osiągniesz górny zakres powtórzeń

### Full Body — 3 razy w tygodniu

Każdy trening angażuje całe ciało. Warianty rotują ćwiczeniami.

| Tab | Główne ruchy | Ćwiczenia |
|---|---|---|
| Przysiad | Przysiad + bench + wiosłowanie + OHP + hamstring + biceps + core | 7 |
| Martwy | Martwy ciąg + skos + podciąganie + split squat + wznosy + triceps + core | 7 |
| Hip Thrust | Front squat + bench hantle + wiosłowanie + hip thrust + face pull + biceps/tri + łydki | 7 |

**Układ tygodnia:** Pon — Przysiad · Śr — Martwy · Pt — Hip Thrust

---

## 🎯 Cele treningowe (PPL i Full Body)

| Cel | Powtórzenia | Serie | Przerwy |
|---|---|---|---|
| **Redukcja** | 12–15 | 3 | 45–60 s |
| **Rzeźba** | 12–15 | 3–4 | 45–60 s |
| **Masa** | 8–12 | 3–4 | 60–90 s |
| **Siła** | 3–5 | 4–5 | 3–5 min |
| **Kondycja** | 15–20 | 3 | 30–45 s |

Cel zapisany jest w profilu. Zmieniasz go klikając badge przy tabach — bez żadnych wyskakujących okienek. Upper/Lower zawsze trenuje pod masę+siłę (badge z kłódką, niezmienialny).

---

## 🚀 Pierwsze uruchomienie

1. Otwórz `https://LukaszBonio.github.io/trening/`
2. Przy pierwszym uruchomieniu pojawi się karta **„Jak zacząć?"** z 3 krokami — znika po zapisaniu pierwszego treningu
3. Kliknij ikonę profilu (litera w kółku, prawy górny róg) i wklej klucz API Anthropic (zaczyna się od `sk-ant-...`)
   - Utwórz klucz na [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys
   - Wymagane doładowanie konta (minimum 5 USD)
4. Wybierz system treningowy z dropdownu (PPL / Upper-Lower / Full Body) i konkretny dzień
5. Kliknij **Generuj plan** — plan pojawi się w ciągu 2–3 sekund
6. Ćwicz — przechodź przez partie mięśniowe, wpisuj powtórzenia i ciężary, korzystaj z timera
7. Po ostatniej partii kliknij **Zakończ trening** — dane trafią do historii

> Bez klucza API korzystaj z **Planu offline** — działa bez internetu i bez kosztów.

---

## 🏋️ Nawigacja po partiach mięśniowych

Po wygenerowaniu planu ćwiczenia są pogrupowane wg partii (np. klatka → barki → triceps dla Push). Aplikacja pokazuje je po jednej grupie na raz:

- Przycisk **Dalej** → przejdź do kolejnej partii (wartości wpisane w poprzedniej są zapamiętane)
- Przycisk **Poprzednia** → wróć i popraw
- Na ostatniej partii pojawia się przycisk **Zakończ trening**

---

## 💡 Sugestia następnego treningu

Aplikacja śledzi kolejność treningów i podpowiada co zrobić następnym razem:

- Pod dropdownem pojawia się baner: *„Ostatnio: Push · wczoraj — sugerowany: Pull"*
- Sugerowany tab lekko pulsuje z żółtą kropką
- Po kliknięciu sugerowanego taba pulsowanie znika
- Działa dla wszystkich trybów — PPL, Upper/Lower i Full Body

---

## 🔬 Analiza partii mięśniowych

W zakładce **Analiza** możesz śledzić progresję dla dowolnej partii mięśniowej:

1. Wybierz partię główną z listy (np. **Biceps**, **Klatka piersiowa**, **Plecy**)
2. Opcjonalnie zawęź do konkretnej głowy mięśnia (np. Głowa długa / Głowa krótka / Wszystkie)
3. Wykres pokazuje osobną kolorową linię dla każdego ćwiczenia należącego do tej partii
4. Pod wykresem — rekord, ostatni ciężar, szacowany 1RM i trend dla każdego ćwiczenia

Dostępne partie: Klatka piersiowa, Plecy, Barki, Biceps, Triceps, Czworogłowy, Hamstring, Pośladki, Łydki, Core, Przedramię.

---

## ⏰ Timer odpoczynku

Timer wyświetla się jako pływający element (FAB) z wizualnym pierścieniem SVG. Możesz go **przesunąć palcem** w dowolne miejsce ekranu — pozycja jest zapamiętywana.

- **60 s / 90 s / 120 s** — szybkie presety
- **Start / Pauza** — kliknięcie pierścienia
- **Głos, dźwięk, wibracja** — konfigurowalne niezależnie
- Domyślny preset dobierany automatycznie wg wybranego celu treningowego

---

## 📅 Wpisywanie treningu z poprzedniego dnia

Jeśli zapomniałeś uruchomić aplikację na siłowni:

1. Wygeneruj plan normalnie
2. Tuż nad listą ćwiczeń znajdziesz pole **Data treningu**
3. Kliknij w datę i wybierz właściwy dzień
4. Pojawi się badge **„zmieniono"** — aplikacja wie że wpisujesz trening wsteczny
5. Wpisz wyniki i zapisz — trening trafi do historii z właściwą datą

---

## 📝 Notatka do treningu

Po wygenerowaniu planu nad przyciskiem „Zakończ trening" pojawia się pole notatki. Możesz wpisać dowolny komentarz:

- *„za dużo ćwiczeń, byłem wykończony"* → Claude wygeneruje mniej ćwiczeń przy kolejnym planie
- *„za mało, miałem dużo energii"* → Claude doda więcej ćwiczeń
- *„bolało kolano przy martwym ciągu"* → Claude uniknie ćwiczeń obciążających kolana
- *„świetna sesja, dobry ciężar"* → Claude utrzyma podobną intensywność

Notatka jest zapisywana razem z treningiem i widoczna w historii. Claude czyta **ostatnią notatkę dla danego typu** (Push / Siłowy / Przysiad itp.) przy każdym kolejnym generowaniu planu.

---

## 📦 Plan offline

Gdy nie masz dostępu do internetu lub nie chcesz korzystać z API:

1. Wybierz system i typ treningu
2. Kliknij przycisk **Plan offline** (obok „Generuj plan")
3. Aplikacja wybiera plan z wbudowanej bazy — preferuje ćwiczenia i partie których nie robiłeś w ostatnich 7 dniach
4. Plan działa tak samo jak plan z AI — timer, zapis, statystyki

Baza zawiera **67 gotowych planów** oraz **276+ ćwiczeń** zmapowanych na 25 głów mięśniowych.

> Plan offline nie wymaga klucza API — działa całkowicie lokalnie, bez kosztów.

---

## 💪 Kalkulator 1RM — jak to działa

**1RM (One-Rep Max)** to szacowany maksymalny ciężar w jednym powtórzeniu. Aplikacja oblicza go jako średnią z dwóch wzorów:

```
Brzycki:  1RM = ciężar × (36 / (37 − powtórzenia))
Epley:    1RM = ciężar × (1 + powtórzenia / 30)
```

**Przykład:** Wyciskanie 80 kg × 8 powtórzeń → szacowany 1RM ≈ 99 kg

Kalkulator działa dla zakresu 2–12 powtórzeń. Wynik zaokrąglany do 0,5 kg.

---

## 📥 Import z pliku CSV

Jeśli wcześniej wykonałeś eksport historii do CSV, możesz go z powrotem wczytać:

1. Otwórz panel **Historia** → kliknij przycisk **Import**
2. Wybierz zakładkę **Plik CSV**
3. Kliknij strefę lub przeciągnij plik CSV bezpośrednio na nią
4. Aplikacja wyświetli podgląd — ile treningów zostanie dodanych, ile pominiętych
5. Kliknij **Importuj** — dane trafią do historii

> Import z CSV nie wymaga klucza API — działa całkowicie lokalnie, bez kosztów.

---

## 📲 Instalacja jako aplikacja

### Android (Chrome)
- Po wejściu na stronę pojawi się baner **„Zainstaluj jako aplikację"**
- Możesz też wejść w menu Chrome (trzy kropki) → „Zainstaluj aplikację"

### iPhone (Safari)
- Otwórz stronę w Safari
- Kliknij przycisk **Udostępnij** (kwadrat ze strzałką skierowaną w górę)
- Wybierz **Dodaj do ekranu głównego**

### Windows i macOS (Chrome / Edge)
- W pasku adresu kliknij ikonę instalacji (monitor ze strzałką)

---

## 💰 Koszty

| Co | Koszt |
|---|---|
| Hosting (GitHub Pages) | Bezpłatny |
| Aplikacja | Bezpłatna |
| Generowanie planu (AI) | ~0,005–0,01 USD (2–4 grosze) |
| AI Coach | ~0,01–0,02 USD (4–8 groszy) |
| Import z tekstu (AI) | ~0,005 USD (2 grosze) |
| Plan offline | Bezpłatny |
| Import z pliku CSV | Bezpłatny |
| Minimum doładowania API | 5 USD |

> 💡 AI Coach analizuje maksymalnie 50 ostatnich treningów, dzięki czemu koszt pojedynczej analizy pozostaje niski niezależnie od długości historii.

---

## 🛠️ Użyte technologie

- **HTML5, CSS3, Vanilla JavaScript** — bez zewnętrznych frameworków
- [Chart.js 4.4](https://www.chartjs.org/) — wykresy
- [jsPDF 2.5](https://github.com/parallax/jsPDF) — eksport do PDF
- [Tabler Icons](https://tabler-icons.io/) — ikony
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — animacja po zapisaniu treningu
- [Claude API](https://www.anthropic.com/) — generowanie planów i analiza AI (model claude-sonnet-4-6)
- **Web Audio API** — dźwięk dzwonka generowany przez syntezator
- **Web Speech API** — komunikat głosowy po polsku (synteza mowy)
- **Vibration API** — wibracja telefonu po zakończeniu przerwy
- **localStorage** — trwałe przechowywanie danych lokalnie
- **Service Worker** — tryb offline, PWA i automatyczne aktualizacje

---

## 📁 Struktura repozytorium

```
trening/
├── index.html              # Główny plik aplikacji
├── db.js                   # Baza planów offline + słownik głów mięśniowych
├── manifest.json           # Konfiguracja PWA
├── sw.js                   # Service Worker (offline i automatyczne aktualizacje)
├── icon-192.png            # Ikona aplikacji 192×192 px
├── icon-512.png            # Ikona aplikacji 512×512 px
├── icon-maskable-512.png   # Ikona z obszarem bezpiecznym dla Androida
└── README.md               # Ten plik
```

---

## 🔒 Prywatność i bezpieczeństwo

- 🔐 **Klucz API** przechowywany wyłącznie lokalnie w przeglądarce (localStorage)
- 📦 **Historia treningów** zapisywana lokalnie — nie jest nigdzie przesyłana
- 🚫 **Brak rejestracji, konta, śledzenia aktywności i reklam**
- 📡 Połączenie z internetem służy **wyłącznie** do komunikacji z Claude API
- 🛡️ **Walidacja danych** — uszkodzone wpisy w pamięci lokalnej są automatycznie filtrowane, w tym robocze drafty treningu
- 🔍 **Ochrona przed XSS** — odpowiedzi z AI są bezpiecznie przetwarzane przed wyświetleniem
- ⚡ **Cache profilu w pamięci** — historia nie jest deserializowana z localStorage przy każdej operacji

---

## ⚠️ Ważne informacje

- Dane są przypisane do **konkretnej przeglądarki na konkretnym urządzeniu**
- Wyczyszczenie danych przeglądarki spowoduje utratę historii — **rób regularne kopie zapasowe**
- Zainstalowana PWA ma **oddzielny cache** od przeglądarki — wyczyszczenie cache Chrome nie usuwa danych aplikacji
- Limit historii: 200 ostatnich treningów na profil
- Limit tekstu przy imporcie przez AI: 4000 znaków
- AI Coach analizuje maksymalnie 50 ostatnich treningów
- Przełączenie zakładki (np. Push → Pull) podczas aktywnego treningu wyświetli potwierdzenie — dane nie zostaną utracone bez zgody

---

## 🐛 Rozwiązywanie problemów

### Aplikacja nie aktualizuje się po wgraniu nowej wersji
1. Poczekaj chwilę — aplikacja sama wykryje aktualizację i wyświetli powiadomienie
2. Wymuś odświeżenie: **Ctrl+Shift+R** (komputer) lub wyczyść pamięć podręczną Chrome (telefon)
3. Od wersji SW v10 index.html ładowany jest zawsze z sieci (network-first) — po jednym odświeżeniu masz najnowszą wersję
4. Odinstaluj aplikację PWA i zainstaluj ją ponownie

### Baner „Zainstaluj" nie pojawia się na Androidzie
- Upewnij się że używasz Chrome
- Sprawdź menu Chrome (trzy kropki) → „Zainstaluj aplikację"
- Baner pojawia się dopiero podczas drugiej wizyty, minimum 5 minut po pierwszej

### Baner „Zainstaluj" nie pojawia się na iPhonie
To zamierzone ograniczenie Apple — PWA na iOS instaluje się wyłącznie ręcznie:
Safari → Udostępnij → **Dodaj do ekranu głównego**

### Komunikat głosowy nie działa
- Sprawdź czy telefon ma zainstalowany polski głos: Ustawienia → Dostępność → Synteza mowy
- Na iPhonie dźwięk wymaga wcześniejszego dotknięcia ekranu (ograniczenie systemu iOS)

---

## 📜 Licencja

Projekt prywatny, do użytku własnego.
