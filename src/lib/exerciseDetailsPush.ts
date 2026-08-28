// Szczegóły techniczne ćwiczeń PUSH — patrz exerciseDetails.ts (typy i zasady).
import type { ExerciseDetails } from './exerciseDetails'

export const PUSH_DETAILS: Record<string, ExerciseDetails> = {
  'pike-push-up': {
    equipmentDetail: 'masa ciała (opcjonalnie podwyższenie pod stopy)',
    attachment: null,
    startPosition: 'Z pozycji podporu przodem unieś biodra wysoko, tworząc ciałem odwróconą literę „V". Dłonie nieco szerzej niż barki, nogi wyprostowane, wzrok na stopy.',
    execution: [
      'Ugnij łokcie, opuszczając głowę w kierunku podłogi między dłońmi.',
      'Zatrzymaj się tuż nad podłożem, utrzymując biodra wysoko.',
      'Wypchnij się dynamicznie do wyprostu ramion.',
      'Im wyżej ustawisz stopy (na podwyższeniu), tym większe obciążenie barków.'
    ],
    rangeOfMotion: 'Od wyprostu ramion w pozycji „V" do momentu, gdy czubek głowy jest tuż nad podłogą.',
    musclesPrimary: ['naramienny — część przednia', 'naramienny — część boczna'],
    musclesSecondary: ['triceps ramienia', 'czworoboczny — część górna', 'mięsień piłowaty przedni'],
    commonMistakes: [
      'Opuszczanie bioder i przechodzenie w zwykłe pompki (obciążenie ucieka z barków).',
      'Zbyt płytki zakres — głowa nie schodzi nisko.',
      'Rozjeżdżanie łokci szeroko na boki.',
      'Zadzieranie głowy zamiast prowadzenia jej między dłonie.'
    ],
    tips: [
      'Trzymaj biodra jak najwyżej przez cały ruch — to utrzymuje kąt barkowy.',
      'Zacznij ze stopami na podłodze; gdy jest za łatwo, oprzyj je na podwyższeniu.',
      'Napnij brzuch i pośladki, żeby tułów był stabilny.'
    ]
  },
  // ===== KLATKA — GÓRA =====
  'wyciskanie-sztangi-na-lawce-skosnej': {
    equipmentDetail: 'sztanga prosta + ławka skośna 30-45°',
    attachment: null,
    startPosition: 'Połóż się na ławce skośnej 30-45°, ściągnij łopatki i wciśnij je w oparcie, stopy płasko na podłodze. Chwyt nieco szerszy niż barki, sztanga nad linią obojczyków.',
    execution: [
      'Zdejmij sztangę ze stojaków i ustaw ją nad obojczykami na wyprostowanych ramionach.',
      'Opuść sztangę kontrolowanie do górnej części klatki, łokcie prowadź pod kątem około 45° od tułowia.',
      'Dotknij lekko klatki lub zatrzymaj sztangę tuż nad nią.',
      'Wyciśnij sztangę dynamicznie w górę, lekko w stronę oczu, do pełnego wyprostu ramion.',
      'Utrzymuj łopatki ściągnięte przez całą serię.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion nad obojczykami do dotknięcia sztangą górnej części klatki i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Zbyt strome ustawienie ławki (powyżej 45°) — pracę przejmują barki zamiast górnej klatki.',
      'Odrywanie bioder od ławki przy ciężkich seriach.',
      'Opuszczanie sztangi zbyt nisko, na środek klatki — zmienia tor i przeciąża barki.',
      'Odbijanie sztangi od klatki zamiast kontrolowanego dotknięcia.',
      'Luźne łopatki — brak stabilnej platformy do wyciskania.'
    ],
    tips: [
      'Zacznij od kąta 30° — daje najlepszy stosunek pracy górnej klatki do barków.',
      'Wyobraź sobie, że wciskasz się w ławkę, a nie tylko wypychasz sztangę.',
      'Przy ciężkich seriach poproś o asekurację — skos utrudnia odłożenie sztangi.'
    ]
  },
  'wyciskanie-hantli-na-lawce-skosnej': {
    equipmentDetail: 'hantle + ławka skośna 30-45°',
    attachment: null,
    startPosition: 'Usiądź na ławce skośnej 30-45° z hantlami na udach, następnie połóż się i wybij hantle kolanami do pozycji nad obojczykami. Łopatki ściągnięte, stopy płasko na podłodze.',
    execution: [
      'Ustaw hantle nad linią obojczyków na wyprostowanych ramionach, dłonie skierowane w przód.',
      'Opuść hantle kontrolowanie w dół i lekko na boki, łokcie około 45° od tułowia.',
      'Zejdź do poziomu, w którym czujesz wyraźne rozciągnięcie klatki.',
      'Wyciśnij hantle w górę i lekko ku środkowi, bez stukania nimi o siebie.',
      'Na górze utrzymaj napięcie klatki, nie blokuj agresywnie łokci.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion nad obojczykami do hantli na wysokości klatki z wyraźnym rozciągnięciem i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna'],
    commonMistakes: [
      'Zbyt szerokie rozstawianie łokci — przeciąża staw ramienny.',
      'Uderzanie hantlami o siebie na górze — spadek napięcia i utrata kontroli.',
      'Zbyt płytkie opuszczanie — skrócony zakres i słabsze rozciągnięcie klatki.',
      'Wykręcanie nadgarstków pod ciężarem.'
    ],
    tips: [
      'Hantle dają większy zakres ruchu niż sztanga — wykorzystaj to i schodź głęboko, ale kontrolowanie.',
      'Wyciskaj po lekkim łuku ku środkowi — zgodnie z funkcją klatki.',
      'Kładąc się, wybijaj hantle kolanami po jednej — oszczędzisz barki przy dużych ciężarach.'
    ]
  },
  'wyciskanie-na-maszynie-na-skosie': {
    equipmentDetail: 'maszyna incline chest press (siedząc)',
    attachment: null,
    startPosition: 'Usiądź na maszynie i ustaw siedzisko tak, by uchwyty znajdowały się na wysokości obojczyków. Plecy i głowa przylegają do oparcia, łopatki ściągnięte, stopy płasko na podłodze.',
    execution: [
      'Chwyć uchwyty pełnym chwytem, nadgarstki w linii przedramion.',
      'Wyciśnij uchwyty w przód i w górę do niemal pełnego wyprostu ramion.',
      'Zatrzymaj ruch na moment w skurczu, czując napięcie górnej klatki.',
      'Wróć kontrolowanie do pozycji startowej, aż poczujesz rozciągnięcie klatki.',
      'Nie odkładaj ciężaru na stos między powtórzeniami.'
    ],
    rangeOfMotion: 'Od uchwytów przy klatce na wysokości obojczyków do niemal pełnego wyprostu ramion w przód-górę.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna'],
    commonMistakes: [
      'Za nisko ustawione siedzisko — uchwyty na wysokości brzucha zamiast obojczyków.',
      'Odrywanie pleców od oparcia i wypychanie ciężaru tułowiem.',
      'Skracanie zakresu w fazie opuszczania.',
      'Pełne blokowanie łokci z odpoczynkiem na wyprostowanych ramionach.'
    ],
    tips: [
      'Maszyna stabilizuje tor ruchu — idealna na naukę czucia górnej klatki i na serie do upadku bez asekuracji.',
      'Ustaw siedzisko raz i zapisz numer otworu — powtarzalność ułatwia progresję.',
      'W ostatnim powtórzeniu zrób 2-3 sekundy pauzy w rozciągnięciu.'
    ]
  },
  'rozpietki-hantlami-na-lawce-skosnej': {
    equipmentDetail: 'hantle + ławka skośna 30-45°',
    attachment: null,
    startPosition: 'Połóż się na ławce skośnej 30-45°, hantle nad klatką na niemal wyprostowanych ramionach, dłonie zwrócone do siebie. Łopatki ściągnięte, lekki, stały łuk w łokciach.',
    execution: [
      'Opuszczaj hantle szerokim łukiem na boki, utrzymując stałe ugięcie łokci.',
      'Zejdź do momentu wyraźnego rozciągnięcia klatki, ramiona mniej więcej w linii barków.',
      'Zatrzymaj ruch na ułamek sekundy w rozciągnięciu.',
      'Ściągnij ramiona tym samym łukiem z powrotem nad klatkę, jakbyś obejmował duże drzewo.',
      'Na górze świadomie napnij klatkę bez stukania hantlami.'
    ],
    rangeOfMotion: 'Od hantli nad klatką do ramion rozłożonych szerokim łukiem na wysokości barków i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków', 'biceps — głowa krótka (stabilizacja)'],
    commonMistakes: [
      'Prostowanie i uginanie łokci w trakcie ruchu — rozpiętki zamieniają się w wyciskanie.',
      'Zbyt duży ciężar i opuszczanie ramion poniżej linii barków — ryzyko dla stawu ramiennego.',
      'Szarpany powrót zamiast kontrolowanego łuku.',
      'Brak ściągniętych łopatek — praca ucieka do barków.'
    ],
    tips: [
      'Rozciągaj do uczucia napięcia, nigdy bólu — to ćwiczenie rozciągające pod obciążeniem.',
      'Trzymaj ciężar o 30-40% mniejszy niż do wyciskania hantlami na tym samym skosie.',
      'Myśl o prowadzeniu łokci, nie dłoni — łatwiej utrzymasz stały łuk.'
    ]
  },
  'krzyzowanie-linek-dolne': {
    equipmentDetail: 'brama (dwa wyciągi) — bloczki w dolnej pozycji',
    attachment: 'uchwyty pojedyncze (D-handle)',
    startPosition: 'Stań w środku bramy z uchwytami w dłoniach, bloczki ustawione nisko. Zrób krok w przód, lekki wykrok, tułów minimalnie pochylony, ramiona opuszczone w dół i lekko za tułów.',
    execution: [
      'Prowadź ramiona łukiem z dołu do góry, w przód i ku środkowi.',
      'Utrzymuj lekkie, stałe ugięcie łokci przez cały ruch.',
      'Złącz dłonie na wysokości górnej części klatki lub oczu.',
      'Zatrzymaj skurcz na 1-2 sekundy, czując górną klatkę.',
      'Wróć kontrolowanie po tym samym łuku do pozycji startowej.'
    ],
    rangeOfMotion: 'Od ramion opuszczonych w dół przy biodrach do dłoni złączonych łukiem na wysokości górnej klatki.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków'],
    commonMistakes: [
      'Uginanie łokci i zamiana ruchu w wyciskanie do przodu.',
      'Bujanie tułowiem i pomaganie sobie nogami.',
      'Kończenie ruchu za nisko — bez złączenia rąk nad klatką ucieka szczytowy skurcz.',
      'Zbyt duży ciężar kosztem kontroli łuku.'
    ],
    tips: [
      'Wyciąg daje stały opór w całym zakresie — wykorzystaj to pauzą w pełnym skurczu.',
      'Ustaw stopy w lekkim wykroku dla stabilności i nie zmieniaj pozycji między powtórzeniami.',
      'To ćwiczenie akcesoryjne — celuj w wyższe zakresy powtórzeń (10-15) i idealną technikę.'
    ]
  },
  'pompki-z-nogami-na-podwyzszeniu': {
    equipmentDetail: 'masa ciała',
    attachment: 'ławka/podwyższenie pod stopy',
    startPosition: 'Przyjmij pozycję pompki z dłońmi na podłodze nieco szerzej niż barki i stopami na ławce lub skrzyni. Ciało napięte w jednej linii od głowy do pięt.',
    execution: [
      'Napnij brzuch i pośladki, usztywniając tułów jak deskę.',
      'Opuść klatkę kontrolowanie w stronę podłogi, łokcie około 45° od tułowia.',
      'Zejdź, aż klatka znajdzie się tuż nad podłogą.',
      'Wypchnij się dynamicznie do pełnego wyprostu ramion.',
      'Utrzymuj linię ciała przez całą serię, bez zwisających bioder.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion do klatki tuż nad podłogą i z powrotem, z ciałem w jednej linii.',
    musclesPrimary: ['klatka piersiowa — część obojczykowa (górna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna', 'mięśnie brzucha (stabilizacja)'],
    commonMistakes: [
      'Opadające biodra lub wypięte pośladki — utrata linii ciała.',
      'Skracanie zakresu i płytkie pompki.',
      'Zbyt wysokie podwyższenie na start — pracę przejmują barki, technika się sypie.',
      'Głowa wisząca w dół zamiast neutralnej pozycji szyi.'
    ],
    tips: [
      'Im wyżej stopy, tym większy akcent na górną klatkę i barki — zwiększaj wysokość stopniowo.',
      'Zacznij od ławki 30-40 cm; skrzynia po kolana to już spory przeskok trudności.',
      'Gdy zrobisz 15+ powtórzeń, dołóż obciążenie na plecy lub przejdź na wyższe podwyższenie.'
    ]
  },

  // ===== KLATKA — ŚRODEK =====
  'wyciskanie-sztangi-na-lawce-poziomej': {
    equipmentDetail: 'sztanga prosta + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej tak, by oczy były pod sztangą. Ściągnij łopatki i wciśnij je w ławkę, naturalny łuk w lędźwiach, stopy płasko i mocno na podłodze. Chwyt nieco szerszy niż barki.',
    execution: [
      'Zdejmij sztangę ze stojaków i ustaw ją nad barkami na wyprostowanych ramionach.',
      'Nabierz powietrza i opuść sztangę kontrolowanie na dolną część klatki.',
      'Prowadź łokcie pod kątem około 45-70° od tułowia, nadgarstki nad łokciami.',
      'Dotknij klatki i wyciśnij sztangę dynamicznie w górę, lekko w stronę stojaków.',
      'Wypuść powietrze w drugiej połowie wyciskania, utrzymując spięty tułów.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion nad barkami do dotknięcia sztangą dolnej części klatki i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Luźne łopatki i barki wędrujące w przód — mniej siły i większe ryzyko kontuzji.',
      'Odbijanie sztangi od klatki.',
      'Odrywanie bioder od ławki.',
      'Nierówny, ukośny tor sztangi przy braku kontroli.',
      'Zbyt szeroki chwyt na siłę — skraca zakres, ale przeciąża barki.'
    ],
    tips: [
      'Zbuduj sztywność od stóp: wciśnij pięty w podłogę i lekko napnij nogi (leg drive).',
      'Sztanga dotyka klatki mniej więcej na linii dolnej części mostka — tor lekkiego łuku, nie pionowej prostej.',
      'Trenuj z asekuracją lub zabezpieczeniami na stojakach przy seriach blisko upadku.'
    ]
  },
  'wyciskanie-hantli-na-lawce-poziomej': {
    equipmentDetail: 'hantle + ławka pozioma',
    attachment: null,
    startPosition: 'Usiądź na ławce z hantlami na udach, połóż się, wybijając hantle kolanami do pozycji nad klatką. Łopatki ściągnięte i wciśnięte w ławkę, stopy płasko na podłodze.',
    execution: [
      'Ustaw hantle nad klatką na wyprostowanych ramionach, dłonie w przód lub lekko skośnie.',
      'Opuść hantle kontrolowanie w dół, łokcie około 45° od tułowia.',
      'Zejdź nieco poniżej linii klatki, do wyraźnego rozciągnięcia.',
      'Wyciśnij hantle w górę i lekko ku środkowi do wyprostu ramion.',
      'Kontroluj hantle przez cały ruch — nie pozwól im uciekać na boki.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion nad klatką do hantli poniżej linii klatki i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna'],
    commonMistakes: [
      'Uderzanie hantlami o siebie na górze każdego powtórzenia.',
      'Zbyt płytkie opuszczanie — marnowanie głównej zalety hantli, czyli zakresu.',
      'Nierówne tempo pracy obu ramion.',
      'Rzucanie hantli na podłogę z wyprostowanych ramion po serii.'
    ],
    tips: [
      'Hantle wymuszają większą stabilizację niż sztanga — zacznij od mniejszego ciężaru, niż podpowiada intuicja.',
      'Po serii przyciągnij kolana do klatki i usiądź z hantlami — bezpieczniej dla barków.',
      'Lekko skośne ustawienie dłoni (45°) jest zwykle najprzyjaźniejsze dla nadgarstków i barków.'
    ]
  },
  'wyciskanie-na-maszynie': {
    equipmentDetail: 'maszyna chest press (siedząc)',
    attachment: null,
    startPosition: 'Usiądź i ustaw siedzisko tak, by uchwyty były na wysokości środka klatki. Plecy przylegają do oparcia, łopatki ściągnięte, stopy stabilnie na podłodze lub podnóżku.',
    execution: [
      'Chwyć uchwyty na szerokości nieco większej niż barki.',
      'Wyciśnij uchwyty w przód do niemal pełnego wyprostu ramion.',
      'Napnij klatkę w końcowej fazie ruchu.',
      'Wróć kontrolowanie, aż łokcie zejdą lekko za linię tułowia i poczujesz rozciągnięcie.',
      'Utrzymuj stały kontakt pleców z oparciem.'
    ],
    rangeOfMotion: 'Od uchwytów przy klatce do niemal pełnego wyprostu ramion w przód.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna'],
    commonMistakes: [
      'Odchylanie pleców i barków od oparcia podczas wyciskania.',
      'Zbyt płytki powrót — praca tylko w połowie zakresu.',
      'Blokowanie łokci i odpoczywanie na wyprostowanych ramionach.',
      'Unoszenie barków w stronę uszu przy zmęczeniu.'
    ],
    tips: [
      'Świetna opcja na końcówkę treningu klatki — dociskaj serie blisko upadku bez asekuracji.',
      'Eksperymentuj z tempem: 3 sekundy opuszczania znacząco podnosi trudność bez zwiększania ciężaru.',
      'Jeśli maszyna ma regulację startu, ustaw głębszy zakres, o ile barki na to pozwalają.'
    ]
  },
  'pompki-klasyczne': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Przyjmij podpór przodem: dłonie pod barkami lub minimalnie szerzej, nogi wyprostowane, ciało napięte w jednej linii od głowy do pięt.',
    execution: [
      'Napnij brzuch i pośladki, ustaw szyję neutralnie.',
      'Opuść ciało kontrolowanie, uginając łokcie pod kątem około 45° od tułowia.',
      'Zejdź klatką tuż nad podłogę.',
      'Wypchnij się dynamicznie do pełnego wyprostu ramion.',
      'Utrzymuj sztywną linię ciała w każdym powtórzeniu.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do klatki tuż nad podłogą i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna', 'mięśnie brzucha (stabilizacja)'],
    commonMistakes: [
      'Opadające biodra lub pośladki wypięte w górę.',
      'Łokcie rozstawione na 90° od tułowia — przeciążenie barków.',
      'Płytki zakres — ruch tylko w górnej połowie.',
      'Wysuwanie głowy w przód i dziobanie nosem podłogi zamiast pracy klatką.'
    ],
    tips: [
      'Ciało pracuje jak deska — jeśli tracisz linię, zrób pompki z kolan albo z rękami na podwyższeniu.',
      'Za łatwo? Dołóż obciążenie na plecy, zwolnij tempo lub unieś nogi.',
      'Wkręć dłonie lekko na zewnątrz w podłogę — ustabilizujesz barki.'
    ]
  },
  'rozpietki-hantlami-na-lawce-poziomej': {
    equipmentDetail: 'hantle + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej, hantle nad klatką na niemal wyprostowanych ramionach, dłonie zwrócone do siebie. Łopatki ściągnięte, lekki i stały łuk w łokciach.',
    execution: [
      'Opuszczaj hantle szerokim łukiem na boki, nie zmieniając kąta w łokciach.',
      'Zejdź do poziomu, w którym ramiona są mniej więcej równolegle do podłogi i czujesz rozciągnięcie klatki.',
      'Zatrzymaj ruch na moment w rozciągnięciu.',
      'Wróć tym samym łukiem nad klatkę, świadomie ściskając mięśnie piersiowe.',
      'Nie stykaj hantli na górze — utrzymaj ciągłe napięcie.'
    ],
    rangeOfMotion: 'Od hantli nad klatką do ramion rozłożonych łukiem na wysokości tułowia i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków'],
    commonMistakes: [
      'Uginanie łokci pod ciężarem i zamiana rozpiętek w wyciskanie.',
      'Schodzenie za nisko z dużym ciężarem — niebezpieczne dla stawu ramiennego.',
      'Szybki, niekontrolowany negatyw.',
      'Bujanie hantlami i praca na rozpędzie.'
    ],
    tips: [
      'Kluczowe jest czucie rozciągnięcia klatki na dole — pracuj w tempie 3 sekundy w dół.',
      'Ciężar dobieraj ostrożnie: rozpiętki to najgorsze ćwiczenie na bicie rekordów.',
      'Trzymaj hantle tak, jakby dłonie miały objąć beczkę — łuk stały od startu do końca.'
    ]
  },
  'rozpietki-na-maszynie': {
    equipmentDetail: 'maszyna butterfly (pec deck)',
    attachment: null,
    startPosition: 'Usiądź i ustaw siedzisko tak, by uchwyty były na wysokości środka klatki, a ramiona po chwycie równoległe do podłogi. Plecy przylegają do oparcia, łopatki lekko ściągnięte.',
    execution: [
      'Chwyć uchwyty z lekko ugiętymi łokciami.',
      'Prowadź ramiona łukiem do przodu, aż uchwyty zbliżą się do siebie przed klatką.',
      'Zatrzymaj skurcz na 1-2 sekundy, mocno ściskając klatkę.',
      'Wróć kontrolowanie do rozciągnięcia, nie pozwalając ciężarowi szarpnąć ramion do tyłu.',
      'Utrzymuj stały kontakt pleców z oparciem.'
    ],
    rangeOfMotion: 'Od ramion rozłożonych na boki na wysokości klatki do uchwytów złączonych przed klatką.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków'],
    commonMistakes: [
      'Zbyt głęboki start bez rozgrzewki — szarpnięcie w rozciągnięciu.',
      'Odrywanie pleców i pchanie ciężaru barkami.',
      'Brak pauzy w skurczu — przelatywanie przez najważniejszą fazę ruchu.',
      'Zbyt duży ciężar i praca samymi rękami zamiast klatką.'
    ],
    tips: [
      'Pauza 1-2 sekundy w skurczu to esencja tego ćwiczenia — bez niej tracisz połowę efektu.',
      'Idealne jako izolacja po ciężkim wyciskaniu lub jako wstępne zmęczenie przed nim.',
      'Ogranicz zakres w rozciągnięciu, jeśli czujesz dyskomfort w barkach — maszyna pozwala to ustawić.'
    ]
  },
  'krzyzowanie-linek': {
    equipmentDetail: 'brama (dwa wyciągi) — bloczki na wysokości barków',
    attachment: 'uchwyty pojedyncze (D-handle)',
    startPosition: 'Stań w środku bramy z uchwytami w dłoniach, bloczki mniej więcej na wysokości barków. Zrób krok w przód do lekkiego wykroku, tułów minimalnie pochylony, ramiona rozłożone na boki z lekko ugiętymi łokciami.',
    execution: [
      'Prowadź ramiona łukiem w przód i ku środkowi na wysokości środka klatki.',
      'Utrzymuj stałe, lekkie ugięcie łokci.',
      'Złącz lub skrzyżuj dłonie przed klatką dla pełnego skurczu.',
      'Zatrzymaj napięcie na 1 sekundę.',
      'Wróć kontrolowanie po tym samym łuku, aż poczujesz rozciągnięcie klatki.'
    ],
    rangeOfMotion: 'Od ramion rozłożonych na boki w lekkim rozciągnięciu do dłoni złączonych lub skrzyżowanych przed klatką.',
    musclesPrimary: ['klatka piersiowa — część mostkowa (środkowa)'],
    musclesSecondary: ['przedni akton barków'],
    commonMistakes: [
      'Pochylanie się coraz mocniej i pchanie ciężaru tułowiem.',
      'Uginanie łokci w trakcie — ruch zamienia się w wyciskanie.',
      'Kończenie przed złączeniem rąk — utrata szczytowego skurczu.',
      'Cofanie się i szarpanie ciężaru w fazie powrotu.'
    ],
    tips: [
      'Na zmianę krzyżuj raz prawą, raz lewą rękę na wierzchu — symetryczny skurcz.',
      'Stały opór wyciągu działa też w pozycji skurczu, czego brakuje rozpiętkom z hantlami — wykorzystaj to pauzą.',
      'Trzymaj lekki wykrok i nieruchome biodra — jedyne, co się porusza, to ramiona.'
    ]
  },

  // ===== KLATKA — DÓŁ =====
  'wyciskanie-sztangi-na-lawce-ujemnej': {
    equipmentDetail: 'sztanga prosta + ławka ujemna 15-30°',
    attachment: null,
    startPosition: 'Połóż się na ławce ujemnej 15-30° z nogami zablokowanymi na wałkach. Łopatki ściągnięte, chwyt nieco szerszy niż barki, sztanga nad dolną częścią klatki.',
    execution: [
      'Zdejmij sztangę ze stojaków (najlepiej z pomocą partnera) i ustaw nad dolną klatką.',
      'Opuść sztangę kontrolowanie na dolną część klatki, łokcie około 45° od tułowia.',
      'Dotknij klatki bez odbijania.',
      'Wyciśnij sztangę pionowo w górę do pełnego wyprostu ramion.',
      'Utrzymuj łopatki ściągnięte i pełną kontrolę toru przez całą serię.'
    ],
    rangeOfMotion: 'Od wyprostu ramion nad dolną klatką do dotknięcia sztangą dolnej części klatki i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część brzuszna (dolna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Zdejmowanie ciężkiej sztangi bez asekuracji — na ławce ujemnej trudno ją bezpiecznie odłożyć.',
      'Zbyt szybkie opuszczanie i odbijanie od klatki.',
      'Opuszczanie sztangi na szyję lub górną klatkę — zły tor dla tej pozycji.',
      'Zbyt duży kąt ujemny — skraca zakres bez dodatkowych korzyści.'
    ],
    tips: [
      'Kąt 15-30° w zupełności wystarcza do przeniesienia akcentu na dolną klatkę.',
      'Zawsze zaczepiaj nogi solidnie o wałki — to one trzymają cię na ławce.',
      'Na ławce ujemnej podnosi się zwykle więcej niż na poziomej — nie znaczy to, że trzeba od razu ładować rekordy.'
    ]
  },
  'wyciskanie-hantli-na-lawce-ujemnej': {
    equipmentDetail: 'hantle + ławka ujemna 15-30°',
    attachment: null,
    startPosition: 'Zablokuj nogi na wałkach ławki ujemnej i połóż się z hantlami przy klatce (najlepiej podanymi przez partnera). Łopatki ściągnięte, hantle nad dolną częścią klatki.',
    execution: [
      'Ustaw hantle na wyprostowanych ramionach nad dolną klatką.',
      'Opuść hantle kontrolowanie w dół i lekko na boki, łokcie około 45° od tułowia.',
      'Zejdź do wyraźnego rozciągnięcia klatki.',
      'Wyciśnij hantle w górę i lekko ku środkowi do wyprostu ramion.',
      'Kontroluj tor każdej hantli osobno — na skosie ujemnym łatwiej o utratę równowagi ciężaru.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion nad dolną klatką do hantli na wysokości klatki w rozciągnięciu i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część brzuszna (dolna)'],
    musclesSecondary: ['przedni akton barków', 'triceps — głowa boczna'],
    commonMistakes: [
      'Wchodzenie na ławkę z ciężkimi hantlami bez pomocy.',
      'Utrata kontroli nad torem hantli w pozycji głową w dół.',
      'Zbyt płytki zakres ze strachu przed rozciągnięciem.',
      'Nierówna praca ramion.'
    ],
    tips: [
      'Poproś partnera o podanie hantli po położeniu się — samodzielne układanie się z nimi to najsłabszy punkt ćwiczenia.',
      'Zacznij od wyraźnie lżejszych hantli niż na ławce poziomej, dopóki nie opanujesz stabilizacji.',
      'Po serii oddaj hantle partnerowi albo odłóż je kontrolowanie na uda przed podniesieniem tułowia.'
    ]
  },
  'pompki-na-poreczach': {
    equipmentDetail: 'masa ciała',
    attachment: 'poręcze (dip bars)',
    startPosition: 'Wejdź na poręcze do podporu na wyprostowanych ramionach, chwyt neutralny. Pochyl tułów w przód, nogi ugnij lub skrzyżuj z tyłu, łopatki ściągnięte w dół.',
    execution: [
      'Pochyl tułów w przód około 20-30° — to kieruje pracę na klatkę.',
      'Opuszczaj się kontrolowanie, uginając łokcie lekko na zewnątrz.',
      'Zejdź, aż barki znajdą się mniej więcej na wysokości łokci lub odrobinę niżej.',
      'Wypchnij się w górę do wyprostu ramion, utrzymując pochylenie tułowia.',
      'Nie prostuj tułowia na górze — stracisz akcent na klatkę.'
    ],
    rangeOfMotion: 'Od podporu na wyprostowanych ramionach do barków na wysokości łokci i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część brzuszna (dolna)'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa', 'przedni akton barków'],
    commonMistakes: [
      'Pionowy tułów z łokciami przy ciele — pracuje głównie triceps zamiast klatki.',
      'Schodzenie zbyt głęboko bez mobilności barków — ból przedniej części barku.',
      'Wzruszanie barków do uszu w dolnej pozycji.',
      'Bujanie nogami i pomaganie sobie rozpędem.'
    ],
    tips: [
      'Wariant na klatkę: tułów pochylony, łokcie lekko na zewnątrz, broda w stronę mostka.',
      'Jeśli brakuje siły, użyj gumy pod kolana lub maszyny wspomagającej; gdy jest za łatwo — pas z obciążeniem.',
      'Buduj głębokość stopniowo — pełny zakres pod kontrolą jest wart więcej niż głęboki i szarpany.'
    ]
  },
  'dipy-na-maszynie': {
    equipmentDetail: 'maszyna do asystowanych dipów/podciągnięć (grawitron) — dolne poręcze',
    attachment: null,
    startPosition: 'Ustaw ciężar wspomagania (im większy, tym łatwiej). Uklęknij lub stań na ruchomym padzie, chwyć dolne poręcze neutralnie i wyprostuj ramiona do podporu.',
    execution: [
      'Pochyl tułów w przód około 20-30° — to kieruje pracę na dolną klatkę.',
      'Opuszczaj się kontrolowanie, uginając łokcie lekko na zewnątrz.',
      'Zejdź, aż barki znajdą się mniej więcej na wysokości łokci.',
      'Wypchnij się do wyprostu ramion, utrzymując pochylenie tułowia.'
    ],
    rangeOfMotion: 'Od podporu na wyprostowanych ramionach do barków na wysokości łokci i z powrotem.',
    musclesPrimary: ['klatka piersiowa — część brzuszna (dolna)'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa', 'przedni akton barków'],
    commonMistakes: [
      'Zbyt duże wspomaganie — pad wypycha ciało zamiast pracy klatki i tricepsa.',
      'Pionowy tułów — akcent ucieka na triceps zamiast dolnej klatki.',
      'Wzruszanie barków do uszu w dolnej pozycji.',
      'Ucięty zakres — brak zejścia do poziomu łokci.'
    ],
    tips: [
      'Traktuj to jako progresję do pełnych dipów — stopniowo zmniejszaj wspomaganie.',
      'Pochylenie tułowia decyduje o akcencie: przód = klatka, pion = triceps.',
      'Ta sama maszyna co do asystowanych podciągnięć — wystarczy przełożyć chwyt na dolne poręcze.'
    ]
  },
  'krzyzowanie-linek-gorne': {
    equipmentDetail: 'brama (dwa wyciągi) — bloczki w górnej pozycji',
    attachment: 'uchwyty pojedyncze (D-handle)',
    startPosition: 'Stań w środku bramy z uchwytami w dłoniach, bloczki ustawione wysoko. Krok w przód do lekkiego wykroku, tułów nieznacznie pochylony, ramiona rozłożone w górze na boki z lekko ugiętymi łokciami.',
    execution: [
      'Prowadź ramiona łukiem z góry w dół i ku środkowi.',
      'Utrzymuj stałe, lekkie ugięcie łokci.',
      'Złącz dłonie na wysokości bioder lub podbrzusza.',
      'Ściśnij dolną część klatki i zatrzymaj skurcz na 1 sekundę.',
      'Wróć kontrolowanie po tym samym łuku do rozciągnięcia w górze.'
    ],
    rangeOfMotion: 'Od ramion rozłożonych w górze na boki do dłoni złączonych łukiem na wysokości bioder.',
    musclesPrimary: ['klatka piersiowa — część brzuszna (dolna)'],
    musclesSecondary: ['przedni akton barków'],
    commonMistakes: [
      'Pchanie ciężaru całym tułowiem zamiast pracy ramion po łuku.',
      'Uginanie i prostowanie łokci — ruch zamienia się w pushdown na triceps.',
      'Brak złączenia rąk na dole i skrócony skurcz.',
      'Garbienie się nad ciężarem przy zmęczeniu.'
    ],
    tips: [
      'Ruch z góry na dół podąża za włóknami dolnej klatki — celuj dłońmi w punkt tuż przed biodrami.',
      'Utrzymuj klatkę wypiętą, a barki z dala od uszu przez całą serię.',
      'Świetne domknięcie treningu klatki — wysokie powtórzenia i pauza w skurczu.'
    ]
  },

  // ===== BARKI — PRZÓD =====
  'wyciskanie-sztangi-nad-glowe': {
    equipmentDetail: 'sztanga prosta (stojąc)',
    attachment: null,
    startPosition: 'Stań w rozkroku na szerokość bioder, sztanga na przednich barkach na wysokości obojczyków, chwyt nieco szerszy niż barki, łokcie lekko przed sztangą. Napnij pośladki i brzuch.',
    execution: [
      'Napnij pośladki, brzuch i nogi — zbuduj sztywną kolumnę pod ciężarem.',
      'Wyciśnij sztangę pionowo w górę, cofając lekko głowę, by zeszła z toru.',
      'Gdy sztanga minie czoło, wsuń głowę w przód — przejdź głową przez okno ramion.',
      'Dopnij ruch do pełnego wyprostu nad głową, sztanga w linii środka stopy.',
      'Opuść sztangę kontrolowanie na obojczyki tym samym torem.'
    ],
    rangeOfMotion: 'Od sztangi na obojczykach do pełnego wyprostu ramion nad głową, w jednej linii z tułowiem.',
    musclesPrimary: ['przedni akton barków', 'boczny akton barków'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa', 'górna część mięśnia czworobocznego', 'mięśnie brzucha (stabilizacja)'],
    commonMistakes: [
      'Odchylanie tułowia w tył i przeprost lędźwi — wyciskanie zamienia się w skośne z przeciążeniem kręgosłupa.',
      'Brak napięcia pośladków i brzucha przed startem.',
      'Wyciskanie po torze przed głową, zamiast schodzenia głową z drogi sztangi.',
      'Niedopinanie ostatnich centymetrów ruchu nad głową.',
      'Pomaganie sobie nogami, gdy ćwiczenie ma być ścisłym wyciskaniem.'
    ],
    tips: [
      'Klucz to sekwencja głowy: cofnij — wyciśnij — wsuń głowę przez okno, gdy sztanga minie czoło.',
      'W górnej pozycji sztanga, barki i środek stopy tworzą jedną pionową linię.',
      'Ściśnij pośladki tak mocno, jakbyś trzymał między nimi monetę — chroni to lędźwie.'
    ]
  },
  'wyciskanie-hantli-nad-glowe': {
    equipmentDetail: 'hantle (stojąc lub siedząc)',
    attachment: null,
    startPosition: 'Stań w rozkroku na szerokość bioder (lub usiądź z podparciem), hantle na wysokości barków, dłonie w przód lub lekko skośnie, łokcie pod hantlami. Napnij brzuch i pośladki.',
    execution: [
      'Napnij tułów i ustaw łokcie bezpośrednio pod hantlami.',
      'Wyciśnij hantle w górę po lekkim łuku ku środkowi.',
      'Dopnij ramiona nad głową bez stukania hantlami o siebie.',
      'Opuść hantle kontrolowanie do wysokości barków tym samym torem.',
      'Utrzymuj nieruchomy tułów — bez odchylania i bujania.'
    ],
    rangeOfMotion: 'Od hantli na wysokości barków do pełnego wyprostu ramion nad głową i z powrotem.',
    musclesPrimary: ['przedni akton barków', 'boczny akton barków'],
    musclesSecondary: ['triceps — głowa boczna', 'górna część mięśnia czworobocznego', 'mięśnie brzucha (stabilizacja)'],
    commonMistakes: [
      'Odchylanie tułowia w tył przy zbyt dużym ciężarze.',
      'Zatrzymywanie ruchu przed pełnym wyprostem nad głową.',
      'Łokcie uciekające za tułów zamiast pozycji pod hantlami.',
      'Wypychanie hantli do przodu zamiast pionowo w górę.'
    ],
    tips: [
      'Wersja stojąca angażuje mocniej tułów, siedząca z oparciem pozwala na większy ciężar — wybierz zgodnie z celem.',
      'Hantle wymuszają samodzielną stabilizację każdego barku — to zaleta, ale wymaga ostrożniejszej progresji niż sztanga.',
      'Wyciskaj po łuku ku środkowi, tak by na górze hantle znalazły się blisko siebie nad głową.'
    ]
  },
  'wyciskanie-arnolda': {
    equipmentDetail: 'hantle (siedząc lub stojąc)',
    attachment: null,
    startPosition: 'Usiądź z podpartymi plecami (lub stań stabilnie), hantle przed barkami na wysokości obojczyków, dłonie skierowane do siebie, łokcie przed tułowiem — jak w górnej fazie uginania.',
    execution: [
      'Rozpocznij wyciskanie, jednocześnie prowadząc łokcie na boki.',
      'Płynnie obracaj nadgarstki na zewnątrz w trakcie ruchu w górę.',
      'W połowie ruchu dłonie patrzą już w przód, łokcie są pod hantlami.',
      'Dopnij ramiona nad głową w pełnym wyproście.',
      'Wróć tym samym łukiem, obracając dłonie z powrotem do siebie przy klatce.'
    ],
    rangeOfMotion: 'Od hantli przed obojczykami z dłońmi do siebie do pełnego wyprostu nad głową z dłońmi w przód.',
    musclesPrimary: ['przedni akton barków', 'boczny akton barków'],
    musclesSecondary: ['triceps — głowa boczna', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Skokowa, szarpana rotacja zamiast płynnego obrotu zsynchronizowanego z wyciskaniem.',
      'Zbyt duży ciężar — rotacja pod obciążeniem wymaga rezerwy siły.',
      'Odchylanie tułowia w tył w trakcie wyciskania.',
      'Niepełny zakres — start dopiero na wysokości barków zamiast sprzed obojczyków.'
    ],
    tips: [
      'Rotacja wydłuża czas pracy przedniego aktonu — traktuj to ćwiczenie jak wolniejsze, techniczne wyciskanie.',
      'Użyj ciężaru o 15-20% mniejszego niż w klasycznym wyciskaniu hantli.',
      'Cały ruch ma być jedną płynną spiralą — bez zatrzymania w połowie na obrót.'
    ]
  },
  'wyciskanie-nad-glowa-na-maszynie': {
    equipmentDetail: 'maszyna shoulder press (siedząc)',
    attachment: null,
    startPosition: 'Usiądź i ustaw siedzisko tak, by uchwyty startowały na wysokości uszu. Plecy i głowa przylegają do oparcia, stopy płasko na podłodze, chwyt na szerokości barków lub nieco szerzej.',
    execution: [
      'Napnij brzuch i wciśnij plecy w oparcie.',
      'Wyciśnij uchwyty w górę do niemal pełnego wyprostu ramion.',
      'Zatrzymaj ruch na moment na górze.',
      'Opuść uchwyty kontrolowanie do wysokości uszu.',
      'Utrzymuj barki z dala od uszu i stały kontakt pleców z oparciem.'
    ],
    rangeOfMotion: 'Od uchwytów na wysokości uszu do niemal pełnego wyprostu ramion nad głową.',
    musclesPrimary: ['przedni akton barków', 'boczny akton barków'],
    musclesSecondary: ['triceps — głowa boczna', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Za nisko ustawione siedzisko — start spod brody skraca zakres pracy barków.',
      'Wypychanie ciężaru mostkiem z odchylonymi plecami.',
      'Blokowanie łokci i odpoczynek na szczycie każdego powtórzenia.',
      'Opuszczanie ciężaru na stos zamiast zatrzymania w dolnym punkcie napięcia.'
    ],
    tips: [
      'Prowadnica eliminuje stabilizację — możesz bezpiecznie trenować blisko upadku mięśniowego bez asekuracji.',
      'Idealne jako główny ruch dla początkujących lub docisk po wyciskaniu wolnym ciężarem.',
      'Jeśli maszyna ma uchwyty neutralne i klasyczne, testuj oba — neutralny bywa łaskawszy dla barków.'
    ]
  },
  'wznosy-hantli-przodem': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań w lekkim rozkroku, hantle przed udami, dłonie skierowane do tułowia, łokcie minimalnie ugięte. Klatka wypięta, brzuch napięty.',
    execution: [
      'Unieś hantle przodem do wysokości oczu, prowadząc ruch z barków.',
      'Utrzymuj minimalne, stałe ugięcie łokci.',
      'Zatrzymaj ruch na moment na górze.',
      'Opuść hantle kontrolowanie do ud — negatyw trwa dłużej niż unoszenie.',
      'Nie bujaj tułowiem między powtórzeniami.'
    ],
    rangeOfMotion: 'Od hantli przy udach do wysokości oczu i z powrotem.',
    musclesPrimary: ['przedni akton barków'],
    musclesSecondary: ['boczny akton barków', 'górna część klatki piersiowej'],
    commonMistakes: [
      'Rozbujanie tułowia i podrzucanie hantli biodrami.',
      'Zbyt duży ciężar — ruch zamienia się w szarpanie.',
      'Unoszenie hantli powyżej głowy bez potrzeby.',
      'Wstrzymywanie oddechu i wzruszanie barków do uszu.'
    ],
    tips: [
      'Przedni akton pracuje ciężko przy każdym wyciskaniu — wznosy przodem stosuj oszczędnie, jako uzupełnienie.',
      'Lekki ciężar i pełna kontrola: jeśli musisz bujać, hantle są za ciężkie.',
      'Wariant naprzemienny (raz lewa, raz prawa) pomaga utrzymać stabilny tułów.'
    ]
  },
  'wznosy-przodem-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'uchwyt pojedynczy (D-handle)',
    startPosition: 'Stań tyłem do wyciągu dolnego z uchwytem w jednej dłoni, linka przechodzi z tyłu między nogami lub z boku. Ramię wzdłuż tułowia, łokieć minimalnie ugięty, tułów stabilny.',
    execution: [
      'Unieś ramię przodem do wysokości barku, prowadząc ruch z barku.',
      'Utrzymuj stałe, minimalne ugięcie łokcia.',
      'Zatrzymaj ruch na sekundę na górze.',
      'Opuść ramię kontrolowanie, opierając się stałemu oporowi wyciągu.',
      'Wykonaj pełną serię jedną ręką, potem zmień stronę.'
    ],
    rangeOfMotion: 'Od ramienia wzdłuż tułowia do wysokości barku i z powrotem.',
    musclesPrimary: ['przedni akton barków'],
    musclesSecondary: ['boczny akton barków', 'górna część klatki piersiowej'],
    commonMistakes: [
      'Pomaganie sobie skrętem lub odchyleniem tułowia.',
      'Szarpanie startu zamiast płynnego ruchu z dolnej pozycji.',
      'Uginanie łokcia w trakcie unoszenia.',
      'Opuszczanie ciężaru bez kontroli — utrata najcenniejszej fazy przy wyciągu.'
    ],
    tips: [
      'Wyciąg trzyma napięcie także na dole zakresu, gdzie hantle prawie nie pracują — nie skracaj negatywu.',
      'Wolną ręką przytrzymaj się ramy wyciągu — łatwiej wyeliminujesz bujanie.',
      'Słabszą stronę ćwicz jako pierwszą i wyrównuj liczbę powtórzeń do niej.'
    ]
  },

  // ===== BARKI — BOK =====
  'wznosy-hantli-bokiem': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań w lekkim rozkroku, hantle wzdłuż tułowia, dłonie skierowane do ciała, łokcie lekko ugięte. Klatka wypięta, barki ściągnięte w dół.',
    execution: [
      'Unieś hantle bokiem do wysokości barków, prowadząc ruch łokciami.',
      'Utrzymuj lekkie, stałe ugięcie łokci i nadgarstki w linii przedramion.',
      'Na górze łokieć jest minimalnie wyżej niż nadgarstek, mały palec lekko wyżej niż kciuk.',
      'Zatrzymaj ruch na moment na wysokości barków.',
      'Opuść hantle kontrolowanie, wyraźnie wolniej niż unosisz.'
    ],
    rangeOfMotion: 'Od hantli wzdłuż tułowia do wysokości barków i z powrotem.',
    musclesPrimary: ['boczny akton barków'],
    musclesSecondary: ['przedni akton barków', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Bujanie tułowiem i podbijanie hantli biodrami.',
      'Wzruszanie barków do uszu — pracę przejmuje kaptur zamiast bocznego aktonu.',
      'Unoszenie wyraźnie powyżej barków bez rotacji ramienia — konflikt w stawie.',
      'Prowadzenie ruchu nadgarstkami zamiast łokciami.',
      'Za duży ciężar i mikrozakres ruchu.'
    ],
    tips: [
      'Prowadź ruch łokciem, jakby ktoś ciągnął cię za łokcie sznurkami do sufitu.',
      'Wskazówka z małym palcem wyżej (jak przy wylewaniu wody z dzbanka) pomaga trafić w boczny akton.',
      'Boczny akton dobrze reaguje na wyższe zakresy — 12-20 powtórzeń z pełną kontrolą.'
    ]
  },
  'wznosy-hantli-bokiem-siedzac': {
    equipmentDetail: 'hantle + ławka pozioma',
    attachment: null,
    startPosition: 'Usiądź na końcu ławki z prostymi plecami, stopy płasko na podłodze, hantle wzdłuż tułowia, łokcie lekko ugięte.',
    execution: [
      'Napnij brzuch i ustabilizuj tułów w pionie.',
      'Unieś hantle bokiem do wysokości barków, prowadząc łokciami.',
      'Zatrzymaj ruch na moment na górze.',
      'Opuść hantle kontrolowanie do tułowia, opierając się grawitacji.',
      'Nie odchylaj się w tył ani nie kołysz tułowiem.'
    ],
    rangeOfMotion: 'Od hantli wzdłuż tułowia do wysokości barków i z powrotem.',
    musclesPrimary: ['boczny akton barków'],
    musclesSecondary: ['przedni akton barków', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Odchylanie tułowia w tył dla podbicia ciężaru.',
      'Wzruszanie barków przy zmęczeniu.',
      'Skracanie zakresu — hantle nie dochodzą do wysokości barków.',
      'Zbyt szybki, niekontrolowany negatyw.'
    ],
    tips: [
      'Pozycja siedząca odcina pomoc nóg i bioder — spodziewaj się ciężaru mniejszego niż na stojąco.',
      'To wariant weryfikujący technikę: jeśli na siedząco ciężar drastycznie spada, na stojąco było dużo bujania.',
      'Utrzymuj pauzę sekundy na górze przy każdym powtórzeniu.'
    ]
  },
  'wznosy-bokiem-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'uchwyt pojedynczy (D-handle)',
    startPosition: 'Stań bokiem do wyciągu dolnego, uchwyt w dłoni dalszej od maszyny, linka biegnie przed tułowiem lub za plecami. Ramię wzdłuż tułowia, łokieć lekko ugięty, wolna ręka na ramie.',
    execution: [
      'Unieś ramię bokiem do wysokości barku, prowadząc ruch łokciem.',
      'Utrzymuj lekkie, stałe ugięcie łokcia.',
      'Zatrzymaj ruch na sekundę na wysokości barku.',
      'Opuść ramię kontrolowanie, czując stały opór linki w całym zakresie.',
      'Po serii zmień stronę i powtórz tę samą liczbę powtórzeń.'
    ],
    rangeOfMotion: 'Od ramienia wzdłuż tułowia do wysokości barku i z powrotem.',
    musclesPrimary: ['boczny akton barków'],
    musclesSecondary: ['przedni akton barków', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Odchylanie tułowia od wyciągu dla podbicia ciężaru.',
      'Szarpany start i praca na rozpędzie linki.',
      'Wzruszanie barku do ucha w górnej fazie.',
      'Nierówna liczba powtórzeń na strony.'
    ],
    tips: [
      'W odróżnieniu od hantli wyciąg obciąża boczny akton już od pierwszych stopni ruchu — pracuj w pełnym zakresie.',
      'Poprowadzenie linki za plecami mocniej akcentuje boczny akton i wymusza czystszy tor.',
      'Trzymaj się ramy wolną ręką i zablokuj tułów — ruch wykonuje tylko ramię.'
    ]
  },
  'wznosy-bokiem-na-maszynie': {
    equipmentDetail: 'maszyna do wznosów bocznych',
    attachment: null,
    startPosition: 'Usiądź w maszynie i ustaw siedzisko tak, by osie obrotu ramion maszyny pokrywały się ze stawami barkowymi. Ramiona lub łokcie oprzyj o pady zgodnie z konstrukcją maszyny.',
    execution: [
      'Napnij brzuch i utrzymaj pion tułowia.',
      'Unieś ramiona bokiem do wysokości barków, pchając pady łokciami.',
      'Zatrzymaj skurcz na 1 sekundę na górze.',
      'Opuść ramiona kontrolowanie do pozycji startowej.',
      'Nie odkładaj ciężaru na stos między powtórzeniami.'
    ],
    rangeOfMotion: 'Od ramion wzdłuż tułowia do wysokości barków i z powrotem.',
    musclesPrimary: ['boczny akton barków'],
    musclesSecondary: ['przedni akton barków', 'górna część mięśnia czworobocznego'],
    commonMistakes: [
      'Złe ustawienie siedziska — oś obrotu maszyny poza osią barków.',
      'Wypychanie ciężaru nadgarstkami zamiast łokciami.',
      'Unoszenie ramion siłą kaptura ze wzruszaniem barków.',
      'Brak kontroli w fazie opuszczania.'
    ],
    tips: [
      'Maszyna prowadzi tor ruchu za ciebie — skup całą uwagę na czuciu bocznego aktonu.',
      'Dobre miejsce na techniki intensyfikujące: drop sety i częściowe powtórzenia po upadku są tu bezpieczne.',
      'Pchaj padami przez łokcie, dłonie trzymaj luźno — mniej pracy przedramion, więcej barków.'
    ]
  },
  'wioslowanie-sztangi-pod-brode': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Stań w rozkroku na szerokość bioder, sztanga w wyprostowanych ramionach przy udach, chwyt szerszy niż barki. Klatka wypięta, brzuch napięty.',
    execution: [
      'Poprowadź sztangę pionowo w górę blisko tułowia, ciągnąc łokciami, nie nadgarstkami.',
      'Unieś łokcie na boki i w górę, maksymalnie do wysokości barków.',
      'Sztanga kończy ruch na wysokości dolnej części klatki lub nieco wyżej.',
      'Zatrzymaj ruch na moment na górze.',
      'Opuść sztangę kontrolowanie do ud tym samym torem.'
    ],
    rangeOfMotion: 'Od sztangi przy udach do łokci na wysokości barków i z powrotem.',
    musclesPrimary: ['boczny akton barków', 'górna część mięśnia czworobocznego'],
    musclesSecondary: ['przedni akton barków', 'biceps — głowa krótka', 'przedramiona'],
    commonMistakes: [
      'Wąski chwyt i ciągnięcie sztangi pod samą brodę — ryzyko konfliktu w stawie barkowym.',
      'Prowadzenie ruchu nadgarstkami — łokcie zostają nisko, a nadgarstki się łamią.',
      'Podrzucanie ciężaru biodrami i tułowiem.',
      'Zbyt wysokie ciągnięcie łokci ponad linię barków.'
    ],
    tips: [
      'Szeroki chwyt (1,5 szerokości barków) kieruje pracę na boczne aktony i jest bezpieczniejszy dla barków niż wąski.',
      'Myśl: łokcie do sufitu, sztanga tylko podąża za nimi.',
      'Przy jakimkolwiek dyskomforcie barków zamień na wznosy bokiem — podobny efekt bez ryzyka.'
    ]
  },

  // ===== TRICEPS — GŁOWA DŁUGA =====
  'francuskie-wyciskanie-sztangi': {
    equipmentDetail: 'sztanga prosta + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej ze sztangą w wyprostowanych ramionach nad klatką, chwyt na szerokość barków lub węższy. Stopy płasko na podłodze, ramiona lekko odchylone w stronę głowy.',
    execution: [
      'Ustaw ramiona lekko za pion, w stronę głowy — to pozycja wyjściowa łokci.',
      'Uginając tylko łokcie, opuść sztangę za głowę, nie na czoło.',
      'Zatrzymaj ruch, gdy poczujesz mocne rozciągnięcie tricepsa.',
      'Wyprostuj łokcie, wracając do pozycji wyjściowej z ramionami lekko za pionem.',
      'Utrzymuj łokcie w stałej szerokości — nie rozjeżdżają się na boki.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion lekko za pionem do sztangi opuszczonej za głowę i z powrotem.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Opuszczanie sztangi na czoło zamiast za głowę — mniejsze rozciągnięcie głowy długiej.',
      'Ruszanie ramionami w przód i w tył — praca ucieka z tricepsa.',
      'Rozjeżdżające się łokcie na boki.',
      'Zbyt duży ciężar i odbijanie w dolnej fazie.'
    ],
    tips: [
      'Utrzymanie ramion lekko za pionem trzyma napięcie na tricepsie nawet w górnej pozycji.',
      'Głowa długa pracuje najmocniej w rozciągnięciu — kontroluj negatyw 2-3 sekundy.',
      'Jeśli proste ramię sztangi męczy nadgarstki, przejdź na wariant ze sztangą EZ.'
    ]
  },
  'francuskie-wyciskanie-sztanga-ez': {
    equipmentDetail: 'sztanga EZ + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej ze sztangą EZ w wyprostowanych ramionach nad klatką, chwyt za wewnętrzne skosy gryfu. Ramiona lekko odchylone w stronę głowy, stopy płasko na podłodze.',
    execution: [
      'Ustaw ramiona nieruchomo, lekko za pionem.',
      'Uginając wyłącznie łokcie, opuść gryf za głowę.',
      'Poczuj rozciągnięcie tricepsa w dolnej pozycji.',
      'Wyprostuj łokcie do pozycji wyjściowej, nie ruszając ramionami.',
      'Utrzymuj łokcie zwarte, mniej więcej na szerokość barków.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion lekko za pionem do gryfu opuszczonego za głowę i z powrotem.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Zamiana ćwiczenia w wyciskanie — ramiona wędrują w przód przy prostowaniu.',
      'Opuszczanie gryfu na twarz lub czoło.',
      'Rozjeżdżanie łokci na zewnątrz pod ciężarem.',
      'Szarpany negatyw bez kontroli.'
    ],
    tips: [
      'Skośny chwyt gryfu EZ ustawia nadgarstki w naturalnej pozycji — wybór pierwszej potrzeby przy bólu nadgarstków.',
      'Trzymaj ciężar umiarkowany: francuskie wyciskanie obciąża przyczep tricepsa przy łokciu.',
      'Seria kończy się, gdy nie umiesz utrzymać nieruchomych ramion — nie dociskaj oszukanych powtórzeń.'
    ]
  },
  'francuskie-wyciskanie-hantli': {
    equipmentDetail: 'hantle + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej z hantlami w wyprostowanych ramionach nad klatką, chwyt neutralny — dłonie skierowane do siebie. Ramiona lekko odchylone w stronę głowy.',
    execution: [
      'Ustabilizuj ramiona lekko za pionem.',
      'Uginając tylko łokcie, opuść hantle obok głowy, po jej bokach.',
      'Zejdź do pełnego rozciągnięcia tricepsa.',
      'Wyprostuj łokcie do pozycji wyjściowej bez ruchu ramion.',
      'Kontroluj obie hantle symetrycznie przez całą serię.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion nad klatką do hantli opuszczonych obok głowy i z powrotem.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Opuszczanie hantli na twarz zamiast obok głowy.',
      'Rozjeżdżanie łokci na boki.',
      'Nierówna praca ramion — jedna hantla wyprzedza drugą.',
      'Zbyt duży ciężar kosztem zakresu ruchu.'
    ],
    tips: [
      'Neutralny chwyt hantli jest najbardziej komfortowy dla łokci i nadgarstków ze wszystkich wariantów francuskiego wyciskania.',
      'Hantle wymuszają niezależną pracę ramion — dobre narzędzie do wyrównywania dysproporcji sił.',
      'Zacznij od lekkich hantli: kontrola dwóch niezależnych ciężarów nad twarzą wymaga wprawy.'
    ]
  },
  'wyprosty-triceps-nad-glowa-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'lina (rope)',
    startPosition: 'Stań tyłem do wyciągu dolnego z liną trzymaną oburącz za głową, łokcie skierowane w górę przy uszach. Zrób wykrok w przód i pochyl lekko tułów, dla stabilnej pozycji.',
    execution: [
      'Ustaw łokcie nieruchomo przy uszach, przedramiona za głową.',
      'Wyprostuj ramiona w pełni nad głową, rozciągając końce liny lekko na boki.',
      'Zatrzymaj pełny wyprost na sekundę.',
      'Wróć kontrolowanie, uginając łokcie za głowę do pełnego rozciągnięcia tricepsa.',
      'Utrzymuj nieruchome ramiona i tułów przez całą serię.'
    ],
    rangeOfMotion: 'Od przedramion ugiętych za głową do pełnego wyprostu ramion nad głową.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Rozjeżdżanie łokci na boki zamiast trzymania ich przy uszach.',
      'Pchanie ciężaru całym tułowiem z pogłębianiem wykroku.',
      'Niepełny wyprost — skurcz tricepsa ucięty w połowie.',
      'Zbyt płytkie zejście w rozciągnięcie.'
    ],
    tips: [
      'Pozycja nad głową maksymalnie rozciąga głowę długą — to jedno z najlepszych ćwiczeń na jej rozwój.',
      'Wyciąg utrzymuje opór także w rozciągnięciu — kontroluj powrót zamiast puszczać linę za głowę.',
      'Znajdź stabilny wykrok i trzymaj go — poprawianie pozycji w trakcie serii psuje napięcie.'
    ]
  },
  'wyprosty-triceps-nad-glowa-z-hantla': {
    equipmentDetail: 'hantla (oburącz)',
    attachment: null,
    startPosition: 'Usiądź lub stań z jedną hantlą trzymaną oburącz za wewnętrzną stronę górnego talerza. Wyprostuj ramiona nad głową, łokcie blisko uszu, brzuch napięty.',
    execution: [
      'Ustaw łokcie nieruchomo, skierowane w przód-górę przy uszach.',
      'Opuść hantlę kontrolowanie za głowę, uginając tylko łokcie.',
      'Zejdź do pełnego rozciągnięcia tricepsa.',
      'Wyprostuj ramiona z powrotem nad głowę do pełnego wyprostu.',
      'Utrzymuj klatkę wypiętą i lędźwie bez przeprostu.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion nad głową do hantli opuszczonej za głowę i z powrotem.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Rozjeżdżanie łokci szeroko na boki.',
      'Przeprost w lędźwiach przy wersji stojącej.',
      'Skracanie zakresu w rozciągnięciu.',
      'Zbyt luźny chwyt talerza — ryzyko wyślizgnięcia hantli za głową.'
    ],
    tips: [
      'Ułóż dłonie płasko pod górnym talerzem, kciuki wokół gryfu — pewny chwyt to podstawa bezpieczeństwa.',
      'Wersja siedząca z oparciem stabilizuje tułów i pozwala lepiej czuć triceps.',
      'Pracuj w pełnym zakresie: to rozciągnięcie za głową buduje głowę długą, nie sam wyprost.'
    ]
  },
  'wyprosty-triceps-nad-glowa-jednorecz': {
    equipmentDetail: 'hantla',
    attachment: null,
    startPosition: 'Usiądź lub stań z hantlą w jednej dłoni, wyprostuj ramię nad głową, łokieć przy uchu. Wolną ręką możesz podtrzymać łokieć pracującego ramienia od wewnątrz.',
    execution: [
      'Ustaw łokieć nieruchomo, skierowany w górę.',
      'Opuść hantlę kontrolowanie za głowę, w stronę przeciwległej łopatki.',
      'Zejdź do pełnego rozciągnięcia tricepsa.',
      'Wyprostuj ramię w pełni nad głową.',
      'Po serii zmień rękę i wykonaj tyle samo powtórzeń.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramienia nad głową do hantli za głową na wysokości karku i z powrotem.',
    musclesPrimary: ['triceps — głowa długa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa przyśrodkowa'],
    commonMistakes: [
      'Uciekanie łokcia w bok i w dół w trakcie serii.',
      'Pochylanie tułowia w stronę pracującego ramienia.',
      'Niepełny wyprost na górze.',
      'Za duży ciężar — jednorącz wymaga wyraźnie lżejszej hantli niż oburącz.'
    ],
    tips: [
      'Stabilizacja łokcia wolną ręką pomaga utrzymać idealny tor — korzystaj z niej zwłaszcza na początku.',
      'Wariant jednorącz ujawnia i wyrównuje różnice sił między ramionami.',
      'Pełne rozciągnięcie na dole jest ważniejsze niż ciężar — dobieraj hantlę pod zakres, nie pod ego.'
    ]
  },

  // ===== TRICEPS — GŁOWA BOCZNA =====
  'wyprosty-triceps-na-wyciagu': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'drążek prosty',
    startPosition: 'Stań przodem do wyciągu górnego, chwyć drążek nachwytem na szerokość barków. Łokcie przyklejone do tułowia, przedramiona uniesione, tułów minimalnie pochylony, stopy stabilnie.',
    execution: [
      'Dociśnij łokcie do tułowia i utrzymaj je nieruchomo.',
      'Wyprostuj ramiona, prowadząc drążek do ud.',
      'Zatrzymaj pełny wyprost na sekundę, napinając triceps.',
      'Wróć kontrolowanie do przedramion nieco powyżej równoległych do podłogi.',
      'Nie pozwól łokciom odjechać w przód przy powrocie.'
    ],
    rangeOfMotion: 'Od przedramion uniesionych powyżej równoległych do pełnego wyprostu ramion przy udach.',
    musclesPrimary: ['triceps — głowa boczna'],
    musclesSecondary: ['triceps — głowa przyśrodkowa', 'triceps — głowa długa'],
    commonMistakes: [
      'Łokcie odklejające się od tułowia i wędrujące w przód.',
      'Dociskanie ciężaru masą ciała i pochylaniem się nad drążkiem.',
      'Niepełny wyprost na dole — ucięty skurcz.',
      'Zbyt wysoki powrót z szarpnięciem barków.'
    ],
    tips: [
      'Wyobraź sobie, że łokcie są przyspawane do żeber — ruch odbywa się tylko w stawie łokciowym.',
      'Pauza sekundy w pełnym wyproście znacząco poprawia czucie tricepsa.',
      'Drążek prosty pozwala na nieco większe ciężary niż lina; oba warianty warto rotować.'
    ]
  },
  'pushdown-z-lina': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'lina (rope)',
    startPosition: 'Stań przodem do wyciągu górnego z liną chwyconą neutralnie za oba końce. Łokcie przy tułowiu, przedramiona uniesione, tułów lekko pochylony, stopy w lekkim rozkroku lub wykroku.',
    execution: [
      'Dociśnij łokcie do tułowia.',
      'Prostuj ramiona w dół, prowadząc końce liny wzdłuż tułowia.',
      'W dolnej fazie rozsuń końce liny na boki, do pełnego wyprostu i skurczu.',
      'Zatrzymaj skurcz na sekundę.',
      'Wróć kontrolowanie, pozwalając linie zejść się u góry.'
    ],
    rangeOfMotion: 'Od przedramion uniesionych powyżej równoległych do pełnego wyprostu z końcami liny rozsuniętymi przy udach.',
    musclesPrimary: ['triceps — głowa boczna'],
    musclesSecondary: ['triceps — głowa przyśrodkowa', 'triceps — głowa długa'],
    commonMistakes: [
      'Brak rozsunięcia liny na dole — utrata głównej zalety tego wariantu.',
      'Łokcie uciekające w przód i pompowanie ciężaru barkami.',
      'Zbyt duży ciężar i praca tułowiem.',
      'Powrót bez kontroli, z szarpnięciem w górnej fazie.'
    ],
    tips: [
      'Rozsunięcie końców liny na dole dodaje skurczowi rotację przedramion — czuć to wyraźnie w bocznej głowie.',
      'Lina wybacza nadgarstkom więcej niż drążek — dobry wybór przy ich przeciążeniu.',
      'Trzymaj biodra nieruchomo; jeśli musisz się kołysać, zmniejsz obciążenie.'
    ]
  },
  'wyprosty-triceps-na-wyciagu-jednorecz': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'uchwyt pojedynczy (D-handle)',
    startPosition: 'Stań przodem lub minimalnie bokiem do wyciągu górnego z uchwytem w jednej dłoni, chwyt neutralny lub podchwyt. Łokieć przyklejony do tułowia, przedramię uniesione.',
    execution: [
      'Dociśnij łokieć pracującego ramienia do tułowia.',
      'Wyprostuj ramię w dół do pełnego wyprostu.',
      'Zatrzymaj skurcz na sekundę, czując boczną część tricepsa.',
      'Wróć kontrolowanie do uniesionego przedramienia.',
      'Wykonaj serię jedną ręką, potem zmień stronę.'
    ],
    rangeOfMotion: 'Od przedramienia uniesionego powyżej równoległego do pełnego wyprostu ramienia przy udzie.',
    musclesPrimary: ['triceps — głowa boczna'],
    musclesSecondary: ['triceps — głowa przyśrodkowa', 'triceps — głowa długa'],
    commonMistakes: [
      'Łokieć odjeżdżający od tułowia w trakcie serii.',
      'Skręcanie tułowia dla dociśnięcia ciężaru.',
      'Nierówna liczba powtórzeń między rękami.',
      'Praca na rozpędzie z niekontrolowanym powrotem.'
    ],
    tips: [
      'Wariant jednorącz pozwala w pełni skupić się na czuciu każdej ręki i wyrównać dysproporcje.',
      'Podchwyt (dłoń do góry) mocniej akcentuje pełny wyprost — warto rotować z chwytem neutralnym.',
      'Zaczynaj od słabszej ręki i dopasuj do niej liczbę powtórzeń silniejszej.'
    ]
  },
  'wyprosty-hantla-w-opadzie': {
    equipmentDetail: 'hantla',
    attachment: null,
    startPosition: 'Oprzyj kolano i dłoń jednej strony o ławkę, tułów równolegle do podłogi, plecy proste. Hantla w wolnej dłoni, ramię przyklejone do tułowia, łokieć ugięty pod kątem prostym.',
    execution: [
      'Ustaw ramię równolegle do tułowia i utrzymaj je nieruchomo.',
      'Wyprostuj łokieć, prowadząc hantlę w tył i w górę.',
      'Zatrzymaj pełny wyprost na 1-2 sekundy.',
      'Wróć kontrolowanie do kąta prostego w łokciu.',
      'Po serii zmień stronę.'
    ],
    rangeOfMotion: 'Od łokcia ugiętego pod kątem prostym do pełnego wyprostu ramienia w tył.',
    musclesPrimary: ['triceps — głowa boczna'],
    musclesSecondary: ['triceps — głowa długa', 'tylny akton barków (stabilizacja)'],
    commonMistakes: [
      'Opadające ramię — łokieć wędruje w dół i ćwiczenie traci sens.',
      'Bujanie hantlą na rozpędzie zamiast kontrolowanego wyprostu.',
      'Zaokrąglone plecy w opadzie.',
      'Zbyt duży ciężar — w tej pozycji dźwignia jest bezlitosna.'
    ],
    tips: [
      'W pełnym wyproście grawitacja obciąża triceps maksymalnie — pauza w tym punkcie robi całą robotę.',
      'To ćwiczenie na czucie mięśniowe, nie na ciężar: lekka hantla i idealna technika.',
      'Utrzymuj tułów równolegle do podłogi; im bardziej się prostujesz, tym mniejszy opór w skurczu.'
    ]
  },

  // ===== TRICEPS — GŁOWA PRZYŚRODKOWA =====
  'wyprosty-triceps-na-maszynie': {
    equipmentDetail: 'maszyna do wyprostów tricepsa (seated triceps press)',
    attachment: null,
    startPosition: 'Usiądź w maszynie, oprzyj tylną część ramion (lub łokcie) o pad zgodnie z konstrukcją maszyny. Chwyć uchwyty, plecy o oparcie, stopy płasko na podłodze.',
    execution: [
      'Ustaw wysokość siedziska tak, by łokcie były na osi obrotu maszyny.',
      'Wyprostuj ramiona, popychając uchwyty po torze maszyny.',
      'Zatrzymaj pełny wyprost na sekundę, napinając triceps.',
      'Wróć kontrolowanie do zgięcia, nie odpuszczając napięcia.'
    ],
    rangeOfMotion: 'Od zgięcia łokci około 90° do pełnego wyprostu ramion.',
    musclesPrimary: ['triceps — głowa boczna'],
    musclesSecondary: ['triceps — głowa przyśrodkowa', 'triceps — głowa długa'],
    commonMistakes: [
      'Unoszenie bioder z siedziska, by dopchnąć ciężar.',
      'Niepełny wyprost — ucięty skurcz na końcu.',
      'Zbyt szybki, niekontrolowany powrót.',
      'Źle ustawiona wysokość siedziska — łokcie poza osią obrotu.'
    ],
    tips: [
      'Stały tor maszyny ułatwia izolację tricepsa — dobry wybór na start lub na dobicie po ćwiczeniach wolnych.',
      'Pauza sekundy w pełnym wyproście poprawia czucie mięśnia.',
      'Dobierz ciężar tak, byś nie musiał odrywać pleców od oparcia.'
    ]
  },
  'pushdown-podchwytem': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'drążek prosty lub EZ',
    startPosition: 'Stań przodem do wyciągu górnego, chwyć drążek PODCHWYTEM (dłonie do góry) na szerokość barków. Łokcie przyklejone do tułowia, tułów lekko pochylony, stopy stabilnie.',
    execution: [
      'Dociśnij łokcie do tułowia i utrzymaj je nieruchomo.',
      'Wyprostuj ramiona, prowadząc drążek w dół do ud.',
      'Zatrzymaj pełny wyprost na sekundę, napinając triceps.',
      'Wróć kontrolowanie do przedramion powyżej równoległych.'
    ],
    rangeOfMotion: 'Od przedramion uniesionych powyżej równoległych do pełnego wyprostu ramion przy udach.',
    musclesPrimary: ['triceps — głowa przyśrodkowa'],
    musclesSecondary: ['triceps — głowa boczna', 'triceps — głowa długa'],
    commonMistakes: [
      'Łokcie odklejające się od tułowia i wędrujące w przód.',
      'Dopychanie ciężaru masą ciała i pochylaniem się.',
      'Niepełny wyprost na dole — ucięty skurcz.',
      'Zbyt duży ciężar (podchwyt jest słabszy niż nachwyt).'
    ],
    tips: [
      'Podchwyt mocniej akcentuje głowę przyśrodkową tricepsa — dobra odmiana od klasycznego pushdown.',
      'Użyj mniejszego ciężaru niż w nachwycie — pozycja nadgarstka jest słabsza.',
      'Pauza sekundy w pełnym wyproście poprawia czucie mięśnia.'
    ]
  },
  'pompki-na-lawce': {
    equipmentDetail: 'masa ciała + ławka (opcjonalnie druga pod stopy)',
    attachment: null,
    startPosition: 'Usiądź na krawędzi ławki, oprzyj dłonie tuż obok bioder palcami do przodu. Przesuń biodra poza ławkę, nogi wyprostuj lub ugnij (łatwiej), pięty na podłodze.',
    execution: [
      'Opuszczaj biodra w dół, zginając łokcie do około 90°.',
      'Trzymaj łokcie skierowane do tyłu, blisko ciała (nie na boki).',
      'Wypchnij się z powrotem do wyprostu ramion, napinając triceps.',
      'Utrzymuj biodra blisko ławki przez cały ruch.'
    ],
    rangeOfMotion: 'Od wyprostu ramion do zgięcia łokci około 90° (ramiona równoległe do podłogi).',
    musclesPrimary: ['triceps — głowa przyśrodkowa', 'triceps — głowa boczna'],
    musclesSecondary: ['naramienny — część przednia', 'piersiowy większy'],
    commonMistakes: [
      'Odchodzenie biodrami za daleko od ławki (przeciąża barki).',
      'Rozchylanie łokci na boki zamiast do tyłu.',
      'Zbyt płytki zakres — łokcie nie schodzą do 90°.',
      'Wzruszanie barków do uszu w dolnej fazie.'
    ],
    tips: [
      'Ugięte nogi = łatwiej, wyprostowane lub stopy na drugiej ławce = trudniej.',
      'Trzymaj klatkę wysoko i barki ściągnięte, żeby chronić staw barkowy.'
    ]
  },
  'wyciskanie-waskim-chwytem': {
    equipmentDetail: 'sztanga prosta + ławka pozioma',
    attachment: null,
    startPosition: 'Połóż się na ławce poziomej, chwyt na szerokość barków (nie węziej), łopatki ściągnięte, stopy płasko na podłodze. Sztanga nad dolną częścią klatki.',
    execution: [
      'Zdejmij sztangę i ustaw ją nad dolną klatką na wyprostowanych ramionach.',
      'Opuść sztangę kontrolowanie na dolną część klatki, prowadząc łokcie blisko tułowia.',
      'Utrzymuj przedramiona pionowo, nadgarstki proste.',
      'Dotknij klatki i wyciśnij sztangę w górę do pełnego wyprostu.',
      'Na górze świadomie dopnij łokcie, napinając triceps.'
    ],
    rangeOfMotion: 'Od wyprostu ramion nad dolną klatką do dotknięcia sztangą klatki i z powrotem.',
    musclesPrimary: ['triceps — głowa przyśrodkowa', 'triceps — głowa boczna'],
    musclesSecondary: ['klatka piersiowa — część mostkowa (środkowa)', 'przedni akton barków'],
    commonMistakes: [
      'Zbyt wąski chwyt (dłonie stykające się) — przeciąża nadgarstki i łokcie, nie zwiększa pracy tricepsa.',
      'Rozjeżdżanie łokci na boki — ruch zamienia się w zwykłe wyciskanie.',
      'Odbijanie sztangi od klatki.',
      'Łamanie nadgarstków pod ciężarem.'
    ],
    tips: [
      'Chwyt na szerokość barków to optimum: triceps pracuje maksymalnie, a nadgarstki nie cierpią.',
      'To najcięższe ćwiczenie na triceps — traktuj je jak bazowy bój i rób na początku treningu.',
      'Łokcie suną wzdłuż tułowia, oddalone od niego o kilka centymetrów, nie przyciśnięte na siłę.'
    ]
  },
  'pompki-diamentowe': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Przyjmij pozycję pompki z dłońmi złączonymi pod środkiem klatki tak, by kciuki i palce wskazujące tworzyły diament. Ciało napięte w jednej linii.',
    execution: [
      'Napnij brzuch i pośladki, usztywnij linię ciała.',
      'Opuść klatkę kontrolowanie w stronę dłoni, prowadząc łokcie blisko tułowia.',
      'Zejdź, aż klatka niemal dotknie dłoni.',
      'Wypchnij się do pełnego wyprostu ramion, dopinając łokcie.',
      'Utrzymuj diament dokładnie pod klatką przez całą serię.'
    ],
    rangeOfMotion: 'Od wyprostowanych ramion do klatki tuż nad dłońmi i z powrotem.',
    musclesPrimary: ['triceps — głowa przyśrodkowa', 'triceps — głowa boczna'],
    musclesSecondary: ['klatka piersiowa — część mostkowa (środkowa)', 'przedni akton barków', 'mięśnie brzucha (stabilizacja)'],
    commonMistakes: [
      'Łokcie rozjeżdżające się na boki zamiast sunąć wzdłuż tułowia.',
      'Dłonie ustawione za wysoko, pod twarzą zamiast pod klatką.',
      'Opadające biodra przy zmęczeniu.',
      'Płytki zakres ruchu.'
    ],
    tips: [
      'To najtrudniejszy wariant pompki dla tricepsa — jeśli technika się sypie, wróć do pompek z węższym rozstawem dłoni.',
      'Przy dyskomforcie nadgarstków lekko rozsuń dłonie — nie muszą się stykać idealnie.',
      'Za łatwo? Unieś stopy na podwyższenie albo załóż plecak z obciążeniem.'
    ]
  }
}
