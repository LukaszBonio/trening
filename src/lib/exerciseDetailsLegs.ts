// Szczegóły techniczne ćwiczeń LEGS — patrz exerciseDetails.ts (typy i zasady).
import type { ExerciseDetails } from './exerciseDetails'

export const LEGS_DETAILS: Record<string, ExerciseDetails> = {
  'przysiad-masa-ciala': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Stań w rozkroku na szerokość barków, palce stóp lekko na zewnątrz. Ramiona wyciągnij przed siebie dla równowagi, tułów wyprostowany.',
    execution: [
      'Zainicjuj ruch odprowadzeniem bioder w tył, jak przy siadaniu na krzesło.',
      'Schodź w dół, aż uda będą co najmniej równolegle do podłogi.',
      'Kolana podążają w linii palców stóp, pięty przyklejone do podłoża.',
      'Wypchnij się piętami do pozycji stojącej, napinając pośladki na górze.'
    ],
    rangeOfMotion: 'Od pozycji stojącej do przysiadu poniżej równoległej ud do podłogi.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'przywodziciele', 'mięśnie grzbietu — stabilizacja'],
    commonMistakes: [
      'Odrywanie pięt od podłogi i przenoszenie ciężaru na palce.',
      'Zapadanie kolan do środka.',
      'Zaokrąglanie pleców w dolnej fazie.',
      'Zbyt płytki zakres — brak zejścia do równoległej.'
    ],
    tips: [
      'Wyobraź sobie siadanie na niskie krzesło tuż za tobą.',
      'Rozłóż ciężar na całą stopę, akcent na pięty i zewnętrzną krawędź.',
      'Gdy staje się za łatwe — spowolnij fazę schodzenia lub dodaj pauzę na dole.'
    ]
  },
  'wykroki-masa-ciala': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Stań prosto, stopy na szerokość bioder, ręce na biodrach. Tułów pionowo, brzuch napięty.',
    execution: [
      'Zrób długi krok w przód i opuść biodra, aż oba kolana zegną się do ~90°.',
      'Kolano tylnej nogi schodzi prawie do podłogi, przednie nad kostką.',
      'Odepchnij się piętą przedniej nogi i wróć do pozycji startowej.',
      'Powtórz na drugą nogę (naprzemiennie lub seriami na nogę).'
    ],
    rangeOfMotion: 'Od pozycji stojącej do wykroku z oboma kolanami zgiętymi do kąta prostego.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'mięśnie stabilizujące biodro'],
    commonMistakes: [
      'Za krótki krok — kolano przednie wychodzi mocno przed palce.',
      'Pochylanie tułowia do przodu.',
      'Zapadanie przedniego kolana do środka.',
      'Odbijanie się kolanem od podłogi.'
    ],
    tips: [
      'Trzymaj tułów pionowo, ciężar na pięcie przedniej nogi.',
      'Wykrok wstecz (w tył) bywa łagodniejszy dla kolan niż w przód.',
      'Gdy jest za łatwo — chwyć hantle lub wydłuż pauzę na dole.'
    ]
  },
  'przysiad-ze-sztanga': {
    equipmentDetail: 'sztanga prosta + stojaki (klatka)',
    attachment: null,
    startPosition: 'Stopy na szerokość barków, palce lekko na zewnątrz. Sztanga wysoko na trapezach, łopatki ściągnięte, klatka wypięta.',
    execution: [
      'Nabierz powietrza i napnij brzuch przed pierwszym powtórzeniem.',
      'Zejdź kontrolowanie w dół, cofając biodra i uginając kolana jednocześnie.',
      'Prowadź kolana w linii palców stóp, pięty trzymaj na podłodze.',
      'Zejdź na głębokość, przy której biodro schodzi poniżej linii kolan (wg mobilności).',
      'Wstań dynamicznie, wypychając podłogę całą stopą, i wypuść powietrze na górze.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu bioder i kolan do pozycji, w której biodro jest poniżej linii kolan.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'przywodziciele', 'prostowniki grzbietu', 'core'],
    commonMistakes: [
      'Kolana uciekające do środka podczas wstawania.',
      'Odrywanie pięt od podłogi w dolnej fazie.',
      'Zaokrąglanie odcinka lędźwiowego na dole przysiadu.',
      'Zbyt płytki przysiad przy zbyt dużym ciężarze.',
      'Unoszenie bioder szybciej niż klatki (przysiad zamienia się w skłon).'
    ],
    tips: [
      'Głębokość dobieraj do mobilności — plecy mają zostać neutralne przez cały zakres.',
      'Patrz w punkt na podłodze 2-3 m przed sobą, nie w sufit.',
      'Rozpychaj podłogę stopami na boki — to pomaga trzymać kolana w linii palców.'
    ]
  },
  'przysiad-przedni': {
    equipmentDetail: 'sztanga prosta + stojaki (klatka)',
    attachment: null,
    startPosition: 'Sztanga spoczywa na przednich barkach, łokcie wysoko uniesione przed siebie. Stopy na szerokość barków, palce lekko na zewnątrz.',
    execution: [
      'Napnij brzuch i utrzymaj łokcie wysoko przez cały ruch.',
      'Zejdź kontrolowanie w dół, trzymając tułów maksymalnie pionowo.',
      'Prowadź kolana w linii palców, pozwól im wyjść do przodu.',
      'Zejdź do pełnej głębokości bez utraty pozycji łokci.',
      'Wstań, wypychając podłogę całą stopą i nie pochylając klatki.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu do głębokiego przysiadu z biodrem poniżej linii kolan, przy pionowym tułowiu.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'core', 'prostowniki grzbietu'],
    commonMistakes: [
      'Opadające łokcie — sztanga stacza się z barków.',
      'Pochylanie tułowia do przodu jak w przysiadzie tylnym.',
      'Odrywanie pięt przy ograniczonej mobilności stawu skokowego.',
      'Podpieranie sztangi nadgarstkami zamiast oparcia jej na barkach.'
    ],
    tips: [
      'Jeśli chwyt klasyczny boli nadgarstki, użyj chwytu skrzyżowanego lub pasków.',
      'Myśl: łokcie do sufitu — to ustawia cały tułów.',
      'Zacznij od lżejszego ciężaru niż w przysiadzie tylnym, technika jest trudniejsza.'
    ]
  },
  'przysiad-z-hantlem': {
    equipmentDetail: 'hantla lub kettlebell',
    attachment: null,
    startPosition: 'Trzymaj hantlę pionowo oburącz przy klatce (chwyt goblet), łokcie skierowane w dół. Stopy na szerokość barków, palce lekko na zewnątrz.',
    execution: [
      'Napnij brzuch i trzymaj hantlę blisko mostka.',
      'Zejdź kontrolowanie w dół, prowadząc kolana w linii palców.',
      'Na dole łokcie schodzą między kolana — to naturalny wskaźnik głębokości.',
      'Wstań, wypychając podłogę całą stopą, bez pochylania klatki.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu do głębokiego przysiadu, w którym łokcie mijają wewnętrzną stronę kolan.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'core', 'przywodziciele'],
    commonMistakes: [
      'Odsuwanie hantli od klatki — ciężar zaczyna ciągnąć tułów w przód.',
      'Kolana uciekające do środka.',
      'Zbyt płytki przysiad mimo lekkiego obciążenia.',
      'Zaokrąglanie pleców przy podnoszeniu hantli z podłogi.'
    ],
    tips: [
      'Najlepsze ćwiczenie do nauki wzorca przysiadu — ciężar z przodu sam ustawia pion tułowia.',
      'Gdy hantla robi się za ciężka do wygodnego trzymania, przejdź na przysiad ze sztangą.'
    ]
  },
  'hack-squat': {
    equipmentDetail: 'hack squat',
    attachment: null,
    startPosition: 'Plecy i głowa płasko na oparciu, barki pod padami. Stopy na platformie na szerokość bioder, nisko i lekko na zewnątrz.',
    execution: [
      'Zwolnij zabezpieczenia i przejmij ciężar na nogi.',
      'Zejdź kontrolowanie w dół do co najmniej kąta prostego w kolanach.',
      'Prowadź kolana w linii palców, pięty trzymaj na platformie.',
      'Wypchnij platformę całą stopą, nie blokując kolan z impetem na górze.'
    ],
    rangeOfMotion: 'Od wyprostowanych nóg do kolan zgiętych co najmniej do 90 stopni, głębiej wg mobilności.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'przywodziciele'],
    commonMistakes: [
      'Odrywanie bioder i lędźwi od oparcia na dole ruchu.',
      'Zbyt płytkie powtórzenia z przesadnym obciążeniem.',
      'Odrywanie pięt przy stopach ustawionych za nisko.',
      'Gwałtowne blokowanie kolan na górze.'
    ],
    tips: [
      'Stopy nisko na platformie mocniej ładują czworogłowe, wyżej — więcej pośladków.',
      'Maszyna prowadzi tor ruchu, więc możesz bezpiecznie trenować blisko upadku mięśniowego.'
    ]
  },
  'przysiad-na-suwnicy': {
    equipmentDetail: 'suwnica Smitha',
    attachment: null,
    startPosition: 'Sztanga suwnicy na trapezach, stopy wysunięte lekko przed linię bioder, na szerokość barków. Palce lekko na zewnątrz.',
    execution: [
      'Odblokuj sztangę obrotem nadgarstków i napnij brzuch.',
      'Zejdź kontrolowanie w dół, uginając kolana i biodra.',
      'Prowadź kolana w linii palców, ciężar trzymaj na całych stopach.',
      'Zejdź do co najmniej kąta prostego w kolanach.',
      'Wstań, wypychając podłogę, i zablokuj sztangę dopiero po zakończeniu serii.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu do kolan zgiętych do 90 stopni lub głębiej, po torze wyznaczonym prowadnicą.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'dwugłowy uda'],
    commonMistakes: [
      'Stopy dokładnie pod sztangą — kolana uciekają mocno w przód.',
      'Kolana schodzące do środka.',
      'Zbyt płytkie przysiady.',
      'Odbijanie się od dolnej pozycji bez kontroli.'
    ],
    tips: [
      'Wysunięcie stóp przed siebie pozwala głębiej usiąść i mocniej zaangażować pośladki.',
      'Prowadnica stabilizuje tor, więc skup się na tempie i głębokości, nie na balansie.'
    ]
  },
  'wyciskanie-nogami': {
    equipmentDetail: 'suwnica (leg press 45°)',
    attachment: null,
    startPosition: 'Usiądź głęboko w siedzisku, lędźwie i biodra przyklejone do oparcia. Stopy na środku platformy na szerokość bioder, palce lekko na zewnątrz.',
    execution: [
      'Wypchnij platformę i zwolnij zabezpieczenia.',
      'Opuszczaj platformę kontrolowanie, uginając kolana w linii palców.',
      'Zatrzymaj się, zanim biodra zaczną odrywać się od oparcia.',
      'Wypchnij platformę całą stopą, zatrzymując ruch tuż przed pełnym zablokowaniem kolan.'
    ],
    rangeOfMotion: 'Od nóg prawie wyprostowanych do kolan zgiętych ok. 90 stopni lub głębiej, dopóki lędźwie zostają na oparciu.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'dwugłowy uda', 'przywodziciele'],
    commonMistakes: [
      'Odrywanie bioder i lędźwi od oparcia przy zbyt głębokim opuszczaniu.',
      'Gwałtowne blokowanie kolan z hukiem na górze.',
      'Bardzo krótkie, częściowe powtórzenia z ogromnym ciężarem.',
      'Kolana schodzące do środka podczas wypychania.',
      'Wypychanie z palców zamiast z całej stopy.'
    ],
    tips: [
      'Głębokość ogranicza pozycja miednicy — schodź tylko tak nisko, jak lędźwie zostają przyklejone.',
      'Stopy wyżej na platformie przenoszą akcent na pośladki i dwugłowe.',
      'Ręce trzymaj na uchwytach, nie na kolanach.'
    ]
  },
  'przysiad-bulgarski': {
    equipmentDetail: 'hantle',
    attachment: 'ławka lub skrzynia pod tylną stopę',
    startPosition: 'Stań w wykroku tyłem do ławki, podbicie tylnej stopy oparte na ławce. Hantle w opuszczonych rękach wzdłuż tułowia, tułów pionowo.',
    execution: [
      'Zejdź kontrolowanie w dół, uginając przednie kolano.',
      'Prowadź kolano w linii palców przedniej stopy.',
      'Opuść tylne kolano tuż nad podłogę.',
      'Wstań, wypychając podłogę całą przednią stopą.',
      'Wykonaj wszystkie powtórzenia na jedną nogę, potem zmień stronę.'
    ],
    rangeOfMotion: 'Od wyprostowanej przedniej nogi do tylnego kolana tuż nad podłogą.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'przywodziciele', 'core'],
    commonMistakes: [
      'Zbyt krótki wykrok — przednie kolano ucieka daleko przed palce.',
      'Przenoszenie ciężaru na tylną nogę i odpychanie się nią.',
      'Chybotanie tułowiem na boki zamiast stabilnej pracy w pionie.',
      'Zbyt wysokie podparcie tylnej stopy ciągnące miednicę w skręt.'
    ],
    tips: [
      'Najpierw znajdź dystans wykroku bez ciężaru, dopiero potem bierz hantle.',
      'Lekki pochył tułowia w przód mocniej ładuje pośladek, pion — czworogłowy.',
      'Zaczynaj serię od słabszej nogi.'
    ]
  },
  'wykroki-z-hantlami': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto, stopy na szerokość bioder, hantle w opuszczonych rękach wzdłuż tułowia.',
    execution: [
      'Zrób długi krok w przód, utrzymując tułów pionowo.',
      'Zejdź w dół, aż tylne kolano prawie dotknie podłogi.',
      'Przednie kolano prowadź w linii palców, ciężar na całej przedniej stopie.',
      'Wypchnij się z przedniej nogi i wróć do pozycji wyjściowej.',
      'Zmieniaj nogi naprzemiennie lub rób serie na jedną stronę.'
    ],
    rangeOfMotion: 'Od pozycji stojącej do tylnego kolana tuż nad podłogą, oba kolana zgięte ok. 90 stopni.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core'],
    commonMistakes: [
      'Za krótki krok — kolano ucieka daleko przed palce i przeciąża staw.',
      'Uderzanie tylnym kolanem o podłogę.',
      'Pochylanie i skręcanie tułowia przy powrocie.',
      'Stawianie stóp w jednej linii jak na linie — brak stabilności.'
    ],
    tips: [
      'Trzymaj stopy na szerokości bioder jak na torach, nie w jednej linii.',
      'Ruch w dół pionowo (winda), nie do przodu — kolano zostaje nad stopą.'
    ]
  },
  'wykroki-ze-sztanga': {
    equipmentDetail: 'sztanga prosta + stojaki',
    attachment: null,
    startPosition: 'Sztanga na trapezach jak w przysiadzie, łopatki ściągnięte. Stopy na szerokość bioder, brzuch napięty.',
    execution: [
      'Zrób kontrolowany, długi krok w przód.',
      'Zejdź w dół, aż tylne kolano znajdzie się tuż nad podłogą.',
      'Utrzymuj tułów pionowo, a sztangę stabilnie nad środkiem ciężkości.',
      'Wypchnij się z przedniej nogi i dostaw stopę do pozycji wyjściowej.'
    ],
    rangeOfMotion: 'Od pozycji stojącej do tylnego kolana tuż nad podłogą.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core', 'prostowniki grzbietu'],
    commonMistakes: [
      'Chwiejny krok przy zbyt dużym ciężarze na plecach.',
      'Pochylanie tułowia w przód i utrata pozycji sztangi.',
      'Kolano przedniej nogi zapadające się do środka.',
      'Zbyt krótki krok przeciążający kolano.'
    ],
    tips: [
      'Wersja ze sztangą wymaga dobrej równowagi — opanuj najpierw wykroki z hantlami.',
      'Rób ruch wolniej niż z hantlami, każdy krok ma być pewny i stabilny.'
    ]
  },
  'wykroki-chodzace': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami w opuszczonych rękach, przed sobą wolna przestrzeń na kilkanaście kroków.',
    execution: [
      'Zrób długi krok w przód i zejdź, aż tylne kolano znajdzie się tuż nad podłogą.',
      'Wypchnij się z przedniej nogi i płynnie przenieś tylną nogę w kolejny krok.',
      'Utrzymuj tułów pionowo, bez kiwania na boki.',
      'Kontynuuj naprzemiennie do końca dystansu lub liczby powtórzeń.'
    ],
    rangeOfMotion: 'Każdy krok od pozycji stojącej do tylnego kolana tuż nad podłogą i przejście w następny wykrok.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'przywodziciele', 'core'],
    commonMistakes: [
      'Kiwanie tułowiem na boki przy przenoszeniu nogi.',
      'Zbyt krótkie kroki — praca tylko na kolanach.',
      'Przyspieszanie i gubienie równowagi zamiast płynnego tempa.',
      'Patrzenie pod stopy z zaokrągleniem pleców.'
    ],
    tips: [
      'Zatrzymaj się na ułamek sekundy w dolnej pozycji, jeśli tracisz stabilność.',
      'Wzrok przed siebie, klatka wypięta — równowaga zaczyna się od postawy.'
    ]
  },
  'wchodzenie-na-skrzynie': {
    equipmentDetail: 'hantle',
    attachment: 'skrzynia lub ławka (wysokość ok. kolana)',
    startPosition: 'Stań przodem do skrzyni z hantlami w opuszczonych rękach. Postaw całą stopę jednej nogi na skrzyni.',
    execution: [
      'Przenieś ciężar na nogę na skrzyni i napnij pośladek.',
      'Wstań na skrzynię siłą górnej nogi, bez odpychania się dolną stopą.',
      'Wyprostuj biodro w pełni na górze.',
      'Zejdź kontrolowanie tą samą nogą prowadzącą i powtórz.',
      'Po skończonej serii zmień nogę.'
    ],
    rangeOfMotion: 'Od stopy na skrzyni i ciała na dole do pełnego wyprostu biodra i kolana na górze.',
    musclesPrimary: ['czworogłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core'],
    commonMistakes: [
      'Odpychanie się dolną stopą — praca ucieka z nogi górnej.',
      'Wchodzenie z rozpędu i opadanie bez kontroli.',
      'Za wysoka skrzynia wymuszająca zaokrąglenie pleców.',
      'Tylko część stopy na skrzyni.'
    ],
    tips: [
      'Test uczciwości: dolna stopa dotyka podłogi tylko palcami, bez wybicia.',
      'Zacznij od skrzyni na wysokość kolana i podnoś ją wraz z siłą.'
    ]
  },
  'wyprosty-nog': {
    equipmentDetail: 'maszyna do prostowania nóg',
    attachment: null,
    startPosition: 'Usiądź tak, by oś obrotu maszyny była w linii kolan, plecy oparte. Wałek na dolnej części piszczeli, tuż nad stopami.',
    execution: [
      'Chwyć uchwyty przy siedzisku i ustabilizuj biodra.',
      'Wyprostuj nogi w pełni, unosząc wałek do góry.',
      'Zatrzymaj się na 1-2 sekundy w pełnym wyproście.',
      'Opuszczaj kontrolowanie, nie pozwalając ciężarowi opaść z hukiem.'
    ],
    rangeOfMotion: 'Od kolan zgiętych ok. 90 stopni do pełnego wyprostu nóg.',
    musclesPrimary: ['czworogłowy uda'],
    musclesSecondary: ['core (stabilizacja tułowia)'],
    commonMistakes: [
      'Kopanie ciężaru z impetem zamiast płynnego wyprostu.',
      'Brak pełnego wyprostu na górze.',
      'Unoszenie bioder z siedziska przy dużym obciążeniu.',
      'Opuszczanie bez kontroli w fazie negatywnej.'
    ],
    tips: [
      'Pauza w pełnym wyproście robi tu największą różnicę — nie skracaj jej.',
      'Palce stóp lekko na siebie akcentują część przyśrodkową, na zewnątrz — boczną.'
    ]
  },
  'uginanie-nog-lezac': {
    equipmentDetail: 'maszyna do uginania nóg (leżąc)',
    attachment: null,
    startPosition: 'Połóż się na brzuchu, biodra dociśnięte do pada, oś obrotu maszyny w linii kolan. Wałek tuż nad piętami.',
    execution: [
      'Chwyć uchwyty i dociśnij biodra do ławki.',
      'Ugnij nogi, przyciągając wałek maksymalnie do pośladków.',
      'Zatrzymaj się na moment w pełnym zgięciu.',
      'Opuszczaj kontrolowanie do prawie pełnego wyprostu.'
    ],
    rangeOfMotion: 'Od nóg prawie wyprostowanych do pełnego zgięcia kolan z wałkiem przy pośladkach.',
    musclesPrimary: ['dwugłowy uda'],
    musclesSecondary: ['brzuchaty łydki', 'pośladkowy wielki'],
    commonMistakes: [
      'Unoszenie bioder znad pada podczas uginania.',
      'Szarpanie ciężaru zamiast płynnego zgięcia.',
      'Niepełny zakres — wałek nie dochodzi do pośladków.',
      'Opuszczanie ciężaru bez kontroli.'
    ],
    tips: [
      'Palce stóp zaciągnięte na siebie zwiększają udział łydki, wyprostowane — izolują dwugłowe.',
      'Faza negatywna 2-3 sekundy buduje tu najwięcej.'
    ]
  },
  'uginanie-nog-siedzac': {
    equipmentDetail: 'maszyna do uginania nóg (siedząc)',
    attachment: null,
    startPosition: 'Usiądź z plecami na oparciu, oś obrotu maszyny w linii kolan, wałek nad piętami, pad dociskający uda tuż nad kolanami.',
    execution: [
      'Zablokuj uda padem i chwyć uchwyty.',
      'Ugnij nogi, ciągnąc wałek pod siedzisko najgłębiej jak potrafisz.',
      'Zatrzymaj się na moment w pełnym zgięciu.',
      'Wracaj kontrolowanie do prawie pełnego wyprostu, czując rozciągnięcie tylnej strony ud.'
    ],
    rangeOfMotion: 'Od nóg prawie wyprostowanych przed sobą do pełnego zgięcia kolan pod siedziskiem.',
    musclesPrimary: ['dwugłowy uda'],
    musclesSecondary: ['brzuchaty łydki'],
    commonMistakes: [
      'Zsuwanie bioder z siedziska podczas zgięcia.',
      'Skracanie zakresu w fazie rozciągnięcia.',
      'Zbyt luźny pad na udach — kolana odrywają się od pozycji.',
      'Praca szarpnięciami zamiast płynnym tempem.'
    ],
    tips: [
      'Pozycja siedząca rozciąga dwugłowe mocniej niż leżąca — wykorzystaj to pełnym zakresem.',
      'Pochylenie tułowia lekko w przód dodatkowo zwiększa rozciągnięcie mięśnia.'
    ]
  },
  'nordic-curl': {
    equipmentDetail: 'masa ciała',
    attachment: 'stabilizacja stóp (drabinka, wałek lub partner)',
    startPosition: 'Uklęknij na miękkim podłożu, stopy i kostki zablokowane pod drabinką lub przytrzymane przez partnera. Ciało od kolan do głowy w jednej linii.',
    execution: [
      'Napnij pośladki, brzuch i tylną stronę ud.',
      'Opuszczaj tułów w przód najwolniej jak potrafisz, prostując się wyłącznie w kolanach.',
      'Utrzymuj biodra wyprostowane — nie łam się w pasie.',
      'Gdy nie utrzymasz już napięcia, zamortyzuj upadek rękami.',
      'Odepchnij się lekko dłońmi i wróć do klęku, pomagając sobie dwugłowymi.'
    ],
    rangeOfMotion: 'Od pionowego klęku do tułowia opuszczonego możliwie blisko podłogi.',
    musclesPrimary: ['dwugłowy uda'],
    musclesSecondary: ['pośladkowy wielki', 'brzuchaty łydki', 'core'],
    commonMistakes: [
      'Łamanie się w biodrach — ruch zamienia się w skłon.',
      'Opadanie bez kontroli po kilku pierwszych stopniach.',
      'Zbyt słabe zablokowanie stóp.',
      'Zbyt duża objętość na start — silne zakwasy dwugłowych.'
    ],
    tips: [
      'Zacznij od samej fazy opuszczania (negatywy) — powrót siłą przyjdzie z czasem.',
      'Guma wpięta wyżej lub odpychanie rękami odciążą ruch na początku.',
      'Podłóż pad lub matę pod kolana.'
    ]
  },
  'glute-ham-raise': {
    equipmentDetail: 'masa ciała',
    attachment: 'ławka GHD (glute ham developer)',
    startPosition: 'Uda oparte o pad ławki GHD, stopy zablokowane między wałkami, kolana tuż za padem. Ciało w linii prostej równolegle do podłogi.',
    execution: [
      'Napnij pośladki i tylną stronę ud.',
      'Unieś tułów, uginając kolana i wciskając palce stóp w platformę.',
      'Dojdź do pozycji pionowej klęku bez zginania bioder.',
      'Opuszczaj się kontrolowanie do pozycji poziomej, prostując kolana.'
    ],
    rangeOfMotion: 'Od tułowia w poziomie do pionowego klęku na padzie i z powrotem.',
    musclesPrimary: ['dwugłowy uda', 'pośladkowy wielki'],
    musclesSecondary: ['prostowniki grzbietu', 'brzuchaty łydki'],
    commonMistakes: [
      'Zginanie bioder i wypinanie pośladków podczas unoszenia.',
      'Prostowanie ruchu wyłącznie plecami z przeprostem lędźwi.',
      'Opadanie bez kontroli w fazie negatywnej.',
      'Za daleko ustawiony pad — kolana nie mają podparcia.'
    ],
    tips: [
      'Trzymaj biodra wyprostowane — pracować mają kolana i biodra, nie lędźwie.',
      'Jeśli pełny ruch jest za trudny, ogranicz zakres lub pomagaj sobie odepchnięciem rąk.'
    ]
  },
  'wypychanie-bioder': {
    equipmentDetail: 'sztanga prosta + ławka (+ pad na biodra)',
    attachment: null,
    startPosition: 'Górna krawędź łopatek oparta o ławkę, sztanga z padem leży na biodrach. Stopy na szerokość bioder, pięty pod kolanami.',
    execution: [
      'Napnij brzuch i dociśnij brodę lekko do klatki.',
      'Wypchnij biodra w przód siłą pośladków do pełnego wyprostu.',
      'Na górze uda równolegle do podłogi, piszczele pionowo.',
      'Ściśnij mocno pośladki i przytrzymaj 1-2 sekundy.',
      'Opuszczaj biodra kontrolowanie, nie odkładając ciężaru całkiem na podłogę.'
    ],
    rangeOfMotion: 'Od bioder tuż nad podłogą do pełnego wyprostu bioder w linii barki-kolana.',
    musclesPrimary: ['pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'czworogłowy uda', 'core'],
    commonMistakes: [
      'Przeprost lędźwi zamiast pełnego wyprostu bioder.',
      'Zadzieranie głowy i wyginanie szyi na górze.',
      'Stopy za daleko — pracują głównie dwugłowe, za blisko — czworogłowe.',
      'Skracanie ruchu na górze bez pełnego ściśnięcia pośladków.'
    ],
    tips: [
      'Na górze zrób lekki tyłopochył miednicy (podwiń ogon) — czujesz wtedy czysto pośladki.',
      'Patrz przed siebie, nie w sufit — to chroni odcinek szyjny i lędźwiowy.',
      'Bez pada na biodrach ciężka sztanga będzie bolesna — nie pomijaj go.'
    ]
  },
  'hip-thrust-na-maszynie': {
    equipmentDetail: 'maszyna do wypychania bioder (glute drive / hip thrust machine)',
    attachment: null,
    startPosition: 'Usiądź w maszynie, oprzyj plecy o pad, stopy płasko na platformie na szerokość bioder. Opuść pad biodrowy na biodra i zabezpiecz. Ustaw ciężar.',
    execution: [
      'Napnij pośladki i wypchnij biodra w górę, popychając pad.',
      'Dojdź do pełnego wyprostu bioder — tułów i uda w jednej linii.',
      'Ściśnij pośladki na szczycie na 1-2 sekundy.',
      'Opuść biodra kontrolowanie, nie odpuszczając całkowicie napięcia na dole.'
    ],
    rangeOfMotion: 'Od bioder opuszczonych poniżej linii kolan do pełnego wyprostu bioder z tułowiem i udami w jednej linii.',
    musclesPrimary: ['pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'czworogłowy uda', 'przywodziciele'],
    commonMistakes: [
      'Przeprost lędźwi zamiast wyprostu w biodrach — ból dolnego odcinka.',
      'Niepełny wyprost bioder na górze — ucięty skurcz pośladków.',
      'Odpychanie palcami stóp zamiast całą stopą/piętami.',
      'Zbyt szybkie opuszczanie bez kontroli.'
    ],
    tips: [
      'Maszyna zdejmuje niewygodę układania sztangi na biodrach — świetna na dużą objętość pośladków.',
      'Prowadź ruch piętami i skup się na ściśnięciu pośladków, nie na samym zakresie.',
      'Broda lekko schowana, żebra w dół — to chroni odcinek lędźwiowy.'
    ]
  },
  'most-biodrowy': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Połóż się na plecach, kolana zgięte, stopy płasko na podłodze na szerokość bioder, pięty blisko pośladków. Ręce wzdłuż tułowia.',
    execution: [
      'Napnij brzuch i dociśnij lędźwie do podłogi.',
      'Wypchnij biodra w górę siłą pośladków.',
      'Na górze ciało tworzy linię od barków do kolan.',
      'Ściśnij pośladki i przytrzymaj 2 sekundy.',
      'Opuść biodra kontrolowanie tuż nad podłogę i powtórz.'
    ],
    rangeOfMotion: 'Od bioder na podłodze do pełnego wyprostu bioder w linii barki-kolana.',
    musclesPrimary: ['pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core'],
    commonMistakes: [
      'Wypychanie bioder przeprostem lędźwi zamiast pracą pośladków.',
      'Odpychanie się piętami zbyt daleko od pośladków — przejmują dwugłowe.',
      'Brak pauzy i ściśnięcia na górze.',
      'Zbyt szybkie, odbijane powtórzenia.'
    ],
    tips: [
      'Gdy wersja obunóż robi się za łatwa, przejdź na jednonóż albo dołóż obciążenie.',
      'Wciskaj całe stopy w podłogę, ruch prowadź piętami.'
    ]
  },
  'most-biodrowy-ze-sztanga': {
    equipmentDetail: 'sztanga prosta + pad na biodra',
    attachment: null,
    startPosition: 'Połóż się na plecach, sztanga z padem na biodrach, kolana zgięte, stopy płasko na podłodze na szerokość bioder.',
    execution: [
      'Ustabilizuj sztangę dłońmi i napnij brzuch.',
      'Wypchnij biodra w górę siłą pośladków do pełnego wyprostu.',
      'Ściśnij pośladki na górze i przytrzymaj moment.',
      'Opuszczaj kontrolowanie tuż nad podłogę, utrzymując napięcie.'
    ],
    rangeOfMotion: 'Od bioder na podłodze do pełnego wyprostu bioder w linii barki-kolana.',
    musclesPrimary: ['pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core'],
    commonMistakes: [
      'Przeprost lędźwi na górze zamiast wyprostu bioder.',
      'Sztanga tocząca się po biodrach bez stabilizacji rękami.',
      'Niepełny wyprost bioder przy zbyt dużym ciężarze.',
      'Odbijanie ciężaru od podłogi.'
    ],
    tips: [
      'Zakres jest krótszy niż w hip thruście z ławki — traktuj to jako wariant przejściowy lub domowy.',
      'Pad na sztangę to konieczność przy pracy z obciążeniem.'
    ]
  },
  'odwodzenie-nog-na-maszynie': {
    equipmentDetail: 'maszyna do odwodzenia nóg (abduktor)',
    attachment: null,
    startPosition: 'Usiądź z plecami na oparciu, zewnętrzna strona kolan oparta o pady, stopy na podestach. Biodra dociśnięte do siedziska.',
    execution: [
      'Chwyć uchwyty i ustabilizuj tułów.',
      'Odwiedź kolana na boki możliwie szeroko, siłą bocznych partii bioder.',
      'Zatrzymaj się na 1-2 sekundy w pełnym rozwarciu.',
      'Wracaj kontrolowanie, nie pozwalając ciężarowi ściągnąć kolan z hukiem.'
    ],
    rangeOfMotion: 'Od kolan złączonych do maksymalnego rozwarcia nóg na boki.',
    musclesPrimary: ['pośladkowy średni'],
    musclesSecondary: ['pośladkowy wielki (górna część)', 'napinacz powięzi szerokiej'],
    commonMistakes: [
      'Odbijanie ciężaru krótkimi, szybkimi ruchami.',
      'Odchylanie tułowia w tył i pomaganie zamachem.',
      'Brak pauzy w pełnym rozwarciu.',
      'Zbyt duże obciążenie kosztem zakresu.'
    ],
    tips: [
      'Lekki pochył tułowia w przód mocniej angażuje pośladkowy średni.',
      'To ćwiczenie akcesoryjne — pracuj na pełnym zakresie i czuciu, nie na rekordach.'
    ]
  },
  'odwodzenie-nogi-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'opaska na kostkę',
    startPosition: 'Zapnij opaskę na kostce, stań przodem do wyciągu i chwyć ramę dla równowagi. Tułów lekko pochylony, noga robocza swobodnie z tyłu.',
    execution: [
      'Napnij brzuch i ustabilizuj miednicę.',
      'Odwiedź nogę do tyłu siłą pośladka, nie zginając kolana ponad lekki kąt.',
      'Ściśnij pośladek na końcu ruchu i przytrzymaj moment.',
      'Wracaj kontrolowanie do lekkiego zakroku nogi w przód.',
      'Po serii zmień nogę.'
    ],
    rangeOfMotion: 'Od nogi lekko przed ciałem do pełnego wyprostu biodra w tył bez ruchu lędźwi.',
    musclesPrimary: ['pośladkowy wielki'],
    musclesSecondary: ['dwugłowy uda', 'core'],
    commonMistakes: [
      'Wyginanie lędźwi zamiast pracy w biodrze.',
      'Zamach nogą z rozpędu zamiast kontrolowanego prowadzenia.',
      'Skręcanie miednicy podczas odwodzenia.',
      'Zbyt duży ciężar skracający zakres.'
    ],
    tips: [
      'Ruch kończy się tam, gdzie kończy się wyprost biodra — dalej pracują już tylko lędźwie.',
      'Myśl o pchaniu pięty w tył i w górę po lekkim łuku.'
    ]
  },
  'przywodzenie-nog-na-maszynie': {
    equipmentDetail: 'maszyna do przywodzenia nóg (adduktor)',
    attachment: null,
    startPosition: 'Usiądź z plecami na oparciu, wewnętrzna strona kolan oparta o pady, nogi rozwarte w pozycji startowej ustawionej wg mobilności.',
    execution: [
      'Chwyć uchwyty i dociśnij biodra do siedziska.',
      'Przywiedź kolana do siebie siłą wewnętrznej strony ud.',
      'Zatrzymaj się na moment przy złączonych padach.',
      'Wracaj kontrolowanie do pełnego, komfortowego rozwarcia.'
    ],
    rangeOfMotion: 'Od nóg rozwartych na szerokość ustawioną wg mobilności do kolan złączonych.',
    musclesPrimary: ['przywodziciele'],
    musclesSecondary: ['core (stabilizacja miednicy)'],
    commonMistakes: [
      'Zbyt szerokie ustawienie startowe i szarpanie z przeciążonego rozciągnięcia.',
      'Odbijanie padów od siebie krótkimi ruchami.',
      'Unoszenie bioder z siedziska.',
      'Praca rozpędem zamiast stałym napięciem.'
    ],
    tips: [
      'Zwiększaj rozwarcie startowe stopniowo z serii na serię — przywodziciele lubią rozciągnięcie, ale nie nagłe.',
      'Faza powrotna 2-3 sekundy daje tu najlepszy bodziec.'
    ]
  },
  'przysiad-sumo-z-hantlem': {
    equipmentDetail: 'hantla lub kettlebell',
    attachment: null,
    startPosition: 'Stopy szeroko, palce skierowane na zewnątrz ok. 45 stopni. Hantla trzymana oburącz przed sobą, zwisająca między nogami.',
    execution: [
      'Napnij brzuch i wypnij klatkę.',
      'Zejdź w dół, rozchylając kolana w linii palców.',
      'Opuść hantlę między nogami, trzymając tułów możliwie pionowo.',
      'Zejdź do ud równoległych do podłogi lub głębiej.',
      'Wstań, wypychając podłogę i ściskając pośladki na górze.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu do ud co najmniej równoległych do podłogi.',
    musclesPrimary: ['czworogłowy uda', 'przywodziciele'],
    musclesSecondary: ['pośladkowy wielki', 'core'],
    commonMistakes: [
      'Kolana zapadające się do środka mimo szerokiej postawy.',
      'Pochylanie tułowia w przód i praca plecami.',
      'Zbyt wąska postawa odbierająca ćwiczeniu sens.',
      'Odrywanie pięt na dole.'
    ],
    tips: [
      'Szeroka postawa i palce na zewnątrz mocno angażują wewnętrzną stronę ud — czuj rozciągnięcie przy schodzeniu.',
      'Kolana rozpychaj na zewnątrz przez cały ruch, śladem palców stóp.'
    ]
  },
  'wspięcia-na-palce-stojac': {
    equipmentDetail: 'maszyna do wspięć łydek (stojąc)',
    attachment: null,
    startPosition: 'Barki pod padami maszyny, przednia część stóp na krawędzi podestu, pięty swobodnie poza nim. Nogi wyprostowane, tułów pionowo.',
    execution: [
      'Opuść pięty maksymalnie w dół, czując pełne rozciągnięcie łydek.',
      'Wspnij się na palce najwyżej jak potrafisz.',
      'Zatrzymaj się na 1 sekundę na samej górze.',
      'Opuszczaj się kontrolowanie do pełnego rozciągnięcia.'
    ],
    rangeOfMotion: 'Od pięt opuszczonych maksymalnie poniżej podestu do pełnego wspięcia na palce.',
    musclesPrimary: ['brzuchaty łydki'],
    musclesSecondary: ['płaszczkowaty'],
    commonMistakes: [
      'Krótkie, sprężynujące ruchy bez pełnego rozciągnięcia na dole.',
      'Brak pauzy na górze.',
      'Uginanie kolan i pomaganie udami.',
      'Zbyt szybkie tempo odbierające łydkom napięcie.'
    ],
    tips: [
      'Łydki dobrze reagują na objętość i pełny zakres — lepiej lżej i głębiej niż ciężko i płytko.',
      'Licz w dolnej pozycji do dwóch, zanim ruszysz w górę.'
    ]
  },
  'wspięcia-na-palce-siedzac': {
    equipmentDetail: 'maszyna do wspięć łydek (siedząc)',
    attachment: null,
    startPosition: 'Usiądź, pady na udach tuż nad kolanami, przednia część stóp na krawędzi podestu, pięty poza nim.',
    execution: [
      'Zwolnij zabezpieczenie i opuść pięty maksymalnie w dół.',
      'Wypchnij pady w górę, wspinając się na palce najwyżej jak potrafisz.',
      'Przytrzymaj skurcz 1 sekundę na górze.',
      'Opuszczaj pięty kontrolowanie do pełnego rozciągnięcia.'
    ],
    rangeOfMotion: 'Od pięt maksymalnie poniżej podestu do pełnego wspięcia na palce przy zgiętych kolanach.',
    musclesPrimary: ['płaszczkowaty'],
    musclesSecondary: ['brzuchaty łydki'],
    commonMistakes: [
      'Sprężynowanie na ścięgnie Achillesa zamiast pracy mięśniem.',
      'Skracanie zakresu na dole.',
      'Zbyt duży ciężar kosztem pauzy na górze.',
      'Pady ustawione za wysoko — luz w połowie ruchu.'
    ],
    tips: [
      'Zgięte kolano wyłącza brzuchaty i przenosi pracę na płaszczkowaty — dlatego warto robić wersję siedzącą obok stojącej.',
      'Płaszczkowaty lubi wyższe zakresy powtórzeń (12-20) i wolne tempo.'
    ]
  },
  'wspięcia-na-palce-ze-sztanga': {
    equipmentDetail: 'sztanga prosta + stojaki',
    attachment: 'podwyższenie pod palce (stopień lub talerz)',
    startPosition: 'Sztanga na trapezach jak w przysiadzie, przednia część stóp na podwyższeniu, pięty nad podłogą. Nogi wyprostowane, brzuch napięty.',
    execution: [
      'Ustabilizuj sylwetkę — ciężar nad środkiem stopy.',
      'Opuść pięty w dół do pełnego rozciągnięcia łydek.',
      'Wspnij się na palce najwyżej jak potrafisz, bez bujania tułowiem.',
      'Przytrzymaj moment na górze i opuszczaj kontrolowanie.'
    ],
    rangeOfMotion: 'Od pięt opuszczonych poniżej poziomu podwyższenia do pełnego wspięcia na palce.',
    musclesPrimary: ['brzuchaty łydki'],
    musclesSecondary: ['płaszczkowaty', 'core'],
    commonMistakes: [
      'Bujanie tułowiem i utrata równowagi ze sztangą.',
      'Praca bez podwyższenia — brak fazy rozciągnięcia.',
      'Uginanie kolan i pomaganie nogami.',
      'Zbyt szybkie tempo.'
    ],
    tips: [
      'Rób ten wariant w klatce lub przy stojakach — równowaga bywa zdradliwa.',
      'Jeśli chwiejesz się z ciężarem, zrób wersję na maszynie lub suwnicy Smitha.'
    ]
  },
  'wspięcia-na-palce-na-leg-press': {
    equipmentDetail: 'suwnica (leg press 45°)',
    attachment: null,
    startPosition: 'Usiądź jak do wyciskania nogami, nogi prawie wyprostowane, przednia część stóp na dolnej krawędzi platformy, pięty poza nią.',
    execution: [
      'Utrzymuj kolana nieruchomo, prawie wyprostowane, ale niezablokowane.',
      'Opuść platformę piętami do pełnego rozciągnięcia łydek.',
      'Wypchnij platformę palcami najdalej jak potrafisz.',
      'Przytrzymaj skurcz 1 sekundę i wracaj kontrolowanie.'
    ],
    rangeOfMotion: 'Od pełnego rozciągnięcia łydek do pełnego wyprostu stopy palcami.',
    musclesPrimary: ['brzuchaty łydki'],
    musclesSecondary: ['płaszczkowaty'],
    commonMistakes: [
      'Blokowanie kolan i przenoszenie obciążenia na staw.',
      'Zsuwanie się stóp z krawędzi platformy przy niedbałym ustawieniu.',
      'Krótkie, szybkie ruchy bez rozciągnięcia.',
      'Zdejmowanie zabezpieczeń przy pozycji stóp na samej krawędzi — ryzyko ześlizgnięcia.'
    ],
    tips: [
      'Trzymaj zabezpieczenia maszyny w zasięgu — gdyby stopa się zsunęła, platforma ma się zatrzymać.',
      'Wygodna alternatywa dla wspięć stojąc, bez obciążania kręgosłupa.'
    ]
  },
  'wspięcia-na-palce-jednonoz': {
    equipmentDetail: 'masa ciała',
    attachment: 'podwyższenie pod palce (stopień)',
    startPosition: 'Stań przednią częścią jednej stopy na krawędzi stopnia, pięta poza nim. Druga noga zgięta, dłoń oparta o ścianę lub poręcz dla równowagi.',
    execution: [
      'Opuść piętę maksymalnie w dół, czując rozciągnięcie łydki.',
      'Wspnij się na palce najwyżej jak potrafisz.',
      'Przytrzymaj skurcz 1 sekundę na górze.',
      'Opuszczaj kontrolowanie i powtórz, potem zmień nogę.'
    ],
    rangeOfMotion: 'Od pięty opuszczonej maksymalnie poniżej stopnia do pełnego wspięcia na palce jednej nogi.',
    musclesPrimary: ['brzuchaty łydki'],
    musclesSecondary: ['płaszczkowaty'],
    commonMistakes: [
      'Odpychanie się ręką od ściany zamiast używania jej tylko do balansu.',
      'Pomaganie drugą nogą.',
      'Krótki zakres bez pełnego rozciągnięcia na dole.',
      'Zbyt szybkie, odbijane powtórzenia.'
    ],
    tips: [
      'Gdy zrobisz 20+ pełnych powtórzeń, dołóż hantlę w rękę po stronie nogi pracującej.',
      'Wersja jednonóż szybko ujawnia i wyrównuje różnice między łydkami.'
    ]
  },
  'brzuszki': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Połóż się na plecach, kolana zgięte, stopy płasko na podłodze. Dłonie przy skroniach, łokcie na boki.',
    execution: [
      'Dociśnij lędźwie do podłogi i napnij brzuch.',
      'Zwiń tułów, odrywając łopatki od podłogi w stronę miednicy.',
      'Zatrzymaj się na moment w skurczu, wydychając powietrze.',
      'Opuszczaj się kontrolowanie, nie kładąc głowy całkiem na podłodze.'
    ],
    rangeOfMotion: 'Od łopatek na podłodze do ich pełnego oderwania przy przyklejonych lędźwiach.',
    musclesPrimary: ['prosty brzucha'],
    musclesSecondary: ['skośne brzucha'],
    commonMistakes: [
      'Ciągnięcie za szyję splecionymi dłońmi.',
      'Unoszenie całych pleców jak w siadzie — pracują zginacze bioder, nie brzuch.',
      'Szybkie, zamachowe powtórzenia.',
      'Wstrzymywanie oddechu.'
    ],
    tips: [
      'To ruch zwijania, nie siadania — myśl o zbliżaniu żeber do miednicy.',
      'Trudniejsza wersja: ręce wyciągnięte za głowę albo talerz na klatce.'
    ]
  },
  'brzuszki-na-wyciagu': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'lina (rope)',
    startPosition: 'Uklęknij przodem do wyciągu, końce liny trzymaj przy skroniach lub karku. Biodra lekko cofnięte, tułów pochylony.',
    execution: [
      'Napnij brzuch i ustabilizuj biodra — mają zostać nieruchomo.',
      'Zwiń tułów, prowadząc łokcie w stronę kolan.',
      'Zbliż żebra do miednicy i wydychaj powietrze w skurczu.',
      'Wracaj kontrolowanie do lekkiego rozciągnięcia brzucha.'
    ],
    rangeOfMotion: 'Od tułowia lekko wyprostowanego do pełnego zwinięcia z łokciami przy kolanach.',
    musclesPrimary: ['prosty brzucha'],
    musclesSecondary: ['skośne brzucha'],
    commonMistakes: [
      'Ciągnięcie ciężaru rękami i barkami zamiast zwijania tułowia.',
      'Ruch z bioder — kłanianie się zamiast spięcia brzucha.',
      'Zbyt duży ciężar wymuszający zamach.',
      'Brak kontroli w fazie powrotnej.'
    ],
    tips: [
      'Ręce to tylko haki — trzymają linę, a ciągnie brzuch.',
      'Zablokuj biodra w jednej pozycji, ruch dzieje się wyłącznie w kręgosłupie piersiowym i lędźwiowym.'
    ]
  },
  'brzuszki-na-maszynie': {
    equipmentDetail: 'maszyna do brzuszków (ab crunch machine)',
    attachment: null,
    startPosition: 'Usiądź w maszynie, oprzyj plecy o oparcie, chwyć uchwyty nad barkami lub oprzyj klatkę o pad zgodnie z konstrukcją. Ustaw ciężar, stopy zahacz pod wałkami.',
    execution: [
      'Napnij brzuch i zwiń tułów w przód, prowadząc klatkę w stronę bioder.',
      'Skup ruch na skracaniu odległości mostek–miednica, nie na pchaniu ramionami.',
      'Zatrzymaj skurcz na sekundę w maksymalnym zwinięciu.',
      'Wróć kontrolowanie do rozciągnięcia mięśni brzucha, nie odpuszczając napięcia.'
    ],
    rangeOfMotion: 'Od lekkiego rozciągnięcia (tułów wyprostowany) do maksymalnego zwinięcia tułowia w przód.',
    musclesPrimary: ['prosty brzucha'],
    musclesSecondary: ['skośne brzucha'],
    commonMistakes: [
      'Ciągnięcie uchwytów ramionami zamiast zwijania brzuchem.',
      'Praca w biodrach (kiwanie tułowia) zamiast zginania kręgosłupa.',
      'Zbyt duży ciężar i szarpanie na rozpęd.',
      'Niepełny powrót — brak fazy rozciągnięcia brzucha.'
    ],
    tips: [
      'Maszyna pozwala progresywnie obciążać brzuch ciężarem — więcej niż zwykłe brzuszki.',
      'Wydech przy zwijaniu pomaga mocniej napiąć prosty brzucha.',
      'Prowadź ruch mostkiem do miednicy, nie głową do kolan.'
    ]
  },
  'unoszenie-nog-w-zwisie': {
    equipmentDetail: 'masa ciała',
    attachment: 'drążek do podciągania',
    startPosition: 'Zwis na drążku nachwytem na szerokość barków, ramiona wyprostowane, ciało nieruchome, brzuch wstępnie napięty.',
    execution: [
      'Ustabilizuj zwis — łopatki lekko ściągnięte w dół.',
      'Unieś nogi kontrolowanie przed siebie, podwijając przy tym miednicę.',
      'Dojdź nogami co najmniej do poziomu bioder, a docelowo wyżej.',
      'Opuszczaj nogi powoli, nie pozwalając ciału się rozbujać.'
    ],
    rangeOfMotion: 'Od nóg zwisających pionowo do uniesionych co najmniej do poziomu, z podwinięciem miednicy.',
    musclesPrimary: ['prosty brzucha (dolna część)'],
    musclesSecondary: ['zginacze bioder', 'skośne brzucha', 'przedramiona (chwyt)'],
    commonMistakes: [
      'Bujanie ciałem i unoszenie nóg rozpędem.',
      'Brak podwinięcia miednicy — pracują głównie zginacze bioder.',
      'Zbyt szybkie opuszczanie nóg.',
      'Skracanie zakresu przy zmęczonym chwycie.'
    ],
    tips: [
      'Klucz to ruch miednicy: na górze podwiń ją jak przy zwijaniu — wtedy pracuje brzuch.',
      'Za trudne? Zacznij od unoszenia kolan do klatki i stopniowo prostuj nogi.'
    ]
  },
  'skrety-rosyjskie': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Usiądź na podłodze, tułów odchylony ok. 45 stopni, kolana zgięte, stopy uniesione nad podłogę. Dłonie złączone przed klatką.',
    execution: [
      'Napnij brzuch i utrzymaj plecy proste mimo odchylenia.',
      'Obróć tułów w jedną stronę, prowadząc dłonie w kierunku podłogi obok biodra.',
      'Wróć przez środek i obróć się na drugą stronę.',
      'Pracuj płynnie, kontrolując rotację całym tułowiem, nie tylko rękami.'
    ],
    rangeOfMotion: 'Rotacja tułowia od dotknięcia podłogi po jednej stronie biodra do drugiej.',
    musclesPrimary: ['skośne brzucha'],
    musclesSecondary: ['prosty brzucha', 'zginacze bioder'],
    commonMistakes: [
      'Machanie samymi rękami przy nieruchomym tułowiu.',
      'Garbienie pleców w odchyleniu.',
      'Zbyt szybkie tempo bez kontroli rotacji.',
      'Opieranie stóp o podłogę, gdy wersja z uniesionymi jest celem.'
    ],
    tips: [
      'Prowadź wzrok za dłońmi — wymusza to prawdziwą rotację tułowia.',
      'Progresja: talerz lub piłka w dłoniach, regresja: pięty oparte o podłogę.'
    ]
  },
  'deska': {
    equipmentDetail: 'masa ciała',
    attachment: null,
    startPosition: 'Podpór na przedramionach, łokcie pod barkami, stopy na szerokość bioder. Ciało w jednej linii od głowy do pięt.',
    execution: [
      'Napnij brzuch i pośladki, podwiń lekko miednicę.',
      'Dociśnij przedramiona do podłogi i odepchnij się od niej łopatkami.',
      'Utrzymuj linię ciała bez opadania i unoszenia bioder.',
      'Oddychaj spokojnie i trzymaj pozycję zaplanowany czas.'
    ],
    rangeOfMotion: 'Pozycja statyczna — utrzymanie prostej linii ciała bez ruchu w stawach.',
    musclesPrimary: ['core (mięśnie głębokie)', 'prosty brzucha'],
    musclesSecondary: ['skośne brzucha', 'pośladkowy wielki', 'prostowniki grzbietu'],
    commonMistakes: [
      'Opadające biodra i wyginanie lędźwi.',
      'Biodra zadarte wysoko do góry — pozycja namiotu.',
      'Zadzieranie głowy i spinanie karku.',
      'Wstrzymywanie oddechu.'
    ],
    tips: [
      'Lepsze są krótsze serie w idealnej pozycji (20-45 s) niż długie minuty w byle jakiej.',
      'Mocne spięcie pośladków od razu prostuje linię bioder.'
    ]
  },
  'ab-wheel-rollout': {
    equipmentDetail: 'masa ciała',
    attachment: 'kółko treningowe (ab wheel)',
    startPosition: 'Uklęknij na macie, kółko pod barkami, ramiona wyprostowane. Miednica lekko podwinięta, brzuch mocno napięty.',
    execution: [
      'Napnij brzuch i pośladki przed każdym powtórzeniem.',
      'Wyjedź kółkiem w przód powoli, prowadząc ciało w jednej linii.',
      'Zatrzymaj się w najdalszej pozycji, w której lędźwie się nie zapadają.',
      'Wróć, ciągnąc kółko do kolan siłą brzucha i najszerszych.'
    ],
    rangeOfMotion: 'Od kółka pod barkami do najdalszego wyjazdu w przód bez utraty neutralnych lędźwi.',
    musclesPrimary: ['prosty brzucha', 'core (mięśnie głębokie)'],
    musclesSecondary: ['skośne brzucha', 'najszerszy grzbietu', 'zginacze bioder'],
    commonMistakes: [
      'Zapadanie się lędźwi w przeprost przy zbyt dalekim wyjeździe.',
      'Łamanie ruchu w biodrach — pośladki uciekają w tył przy powrocie.',
      'Zbyt szybkie tempo bez napięcia brzucha.',
      'Pełny wyjazd na start zamiast stopniowego wydłużania zakresu.'
    ],
    tips: [
      'Zakres zwiększaj stopniowo — wyjeżdżaj tylko tak daleko, jak utrzymasz podwiniętą miednicę.',
      'Ścianę przed sobą możesz użyć jako ogranicznika zakresu na początku nauki.'
    ]
  }
}
