// Szczegóły techniczne ćwiczeń PULL — patrz exerciseDetails.ts (typy i zasady).
import type { ExerciseDetails } from './exerciseDetails'

export const PULL_DETAILS: Record<string, ExerciseDetails> = {
  'podciaganie': {
    equipmentDetail: 'drążek do podciągania',
    attachment: null,
    startPosition: 'Chwyć drążek nachwytem szerzej niż barki. Zwiśnij na wyprostowanych ramionach, łopatki lekko ściągnięte, nogi skrzyżowane lub proste.',
    execution: [
      'Rozpocznij od ściągnięcia łopatek w dół i do tyłu.',
      'Podciągnij się, prowadząc łokcie w dół, aż broda minie drążek.',
      'Zatrzymaj się na moment w górnej pozycji, klatka blisko drążka.',
      'Opuść się kontrolowanie do pełnego wyprostu ramion.'
    ],
    rangeOfMotion: 'Od pełnego zwisu z wyprostowanymi ramionami do pozycji z brodą nad drążkiem.',
    musclesPrimary: ['najszerszy grzbietu'],
    musclesSecondary: ['obły większy', 'biceps ramienia', 'równoległoboczne', 'czworoboczny — część dolna'],
    commonMistakes: [
      'Bujanie ciałem i podciąganie na zamachu (kipping) zamiast siłą.',
      'Niepełny wyprost ramion w dole — praca na skróconym zakresie.',
      'Wzruszanie barków do uszu zamiast ściągania łopatek w dół.',
      'Podciąganie samymi rękami bez inicjacji grzbietem.'
    ],
    tips: [
      'Myśl o ciągnięciu łokci do bioder, nie o zginaniu rąk.',
      'Jeśli nie robisz pełnego zakresu — użyj gumy oporowej lub maszyny grawitron.',
      'Napnij brzuch i pośladki, by wyeliminować bujanie.'
    ]
  },
  'podciaganie-podchwytem': {
    equipmentDetail: 'drążek do podciągania',
    attachment: null,
    startPosition: 'Chwyć drążek podchwytem (dłonie do siebie) na szerokość barków. Zwiśnij na wyprostowanych ramionach, klatka lekko wypchnięta.',
    execution: [
      'Ściągnij łopatki i zainicjuj ruch grzbietem.',
      'Podciągnij się, prowadząc łokcie w dół i blisko tułowia, aż broda minie drążek.',
      'Napnij grzbiet i biceps w górnej pozycji.',
      'Opuść się kontrolowanie do pełnego wyprostu ramion.'
    ],
    rangeOfMotion: 'Od pełnego zwisu z wyprostowanymi ramionami do pozycji z brodą nad drążkiem.',
    musclesPrimary: ['najszerszy grzbietu', 'biceps ramienia'],
    musclesSecondary: ['obły większy', 'ramienny', 'równoległoboczne'],
    commonMistakes: [
      'Bujanie i zamach zamiast czystego podciągnięcia.',
      'Skracanie zakresu w dolnej fazie.',
      'Odchylanie tułowia mocno do tyłu.',
      'Zaniedbanie fazy negatywnej (opuszczanie „spadając").'
    ],
    tips: [
      'Podchwyt mocniej angażuje biceps — dobre przejście do podciągania nachwytem.',
      'Trzymaj łokcie blisko tułowia przez cały ruch.',
      'Kontroluj 2-3 sekundy opuszczanie, by dołożyć pracy mięśniom.'
    ]
  },
  'wioslowanie-australijskie': {
    equipmentDetail: 'niski drążek (smith/stojak) lub taśmy TRX',
    attachment: null,
    startPosition: 'Połóż się pod drążkiem ustawionym na wysokości bioder. Chwyć nachwytem szerzej niż barki, ciało w linii prostej od pięt po barki, pięty na podłodze.',
    execution: [
      'Napnij brzuch i pośladki, utrzymując ciało sztywne jak deska.',
      'Ściągnij łopatki i podciągnij klatkę do drążka, prowadząc łokcie do tyłu.',
      'Dotknij drążka górną częścią klatki lub zbliż się maksymalnie.',
      'Opuść się kontrolowanie do pełnego wyprostu ramion.'
    ],
    rangeOfMotion: 'Od wyprostu ramion w zwisie poziomym do klatki przy drążku.',
    musclesPrimary: ['najszerszy grzbietu', 'równoległoboczne', 'czworoboczny — część środkowa'],
    musclesSecondary: ['naramienny — część tylna', 'biceps ramienia'],
    commonMistakes: [
      'Opadanie bioder — ciało traci linię prostą.',
      'Niepełny zakres, brak kontaktu klatki z drążkiem.',
      'Ciągnięcie samymi rękami bez ściągania łopatek.',
      'Zadzieranie głowy zamiast neutralnej szyi.'
    ],
    tips: [
      'Im niżej drążek (bardziej poziome ciało), tym trudniej — reguluj wysokością.',
      'Ugięcie kolan i stopy płasko upraszcza ćwiczenie dla początkujących.',
      'Trzymaj napięty tułów przez cały ruch, jak w desce.'
    ]
  },
  'sciaganie-drazka-wyciagu-gornego': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'drążek szeroki do ściągania',
    startPosition: 'Usiądź przodem do wyciągu, uda zablokowane pod wałkami, stopy płasko na podłodze. Chwyć drążek nachwytem szerzej niż barki, tułów odchylony minimalnie do tyłu.',
    execution: [
      'Ściągnij łopatki w dół i do tyłu, zanim zaczniesz ciągnąć.',
      'Pociągnij drążek do górnej części klatki, prowadząc łokcie w dół i lekko za tułów.',
      'W dolnej pozycji zbliż łopatki do siebie i zatrzymaj ruch na moment.',
      'Kontrolowanie wypuść drążek do pełnego wyprostu ramion, nie unosząc barków do uszu.'
    ],
    rangeOfMotion: 'Od pełnego zwisu z wyprostowanymi ramionami do drążka przy górnej części klatki.',
    musclesPrimary: ['najszerszy grzbietu'],
    musclesSecondary: ['obły większy', 'biceps ramienia', 'czworoboczny — część dolna', 'równoległoboczne'],
    commonMistakes: [
      'Mocne odchylanie tułowia i ciągnięcie ciężaru masą ciała.',
      'Ściąganie drążka za kark — niepotrzebnie obciąża stawy barkowe.',
      'Niepełny wyprost ramion w górze i praca na skróconym zakresie.',
      'Ciągnięcie samymi rękami zamiast łokciami — biceps przejmuje pracę grzbietu.'
    ],
    tips: [
      'Myśl o chowaniu łokci do tylnych kieszeni — grzbiet włącza się mocniej.',
      'Przy klatce zatrzymaj drążek na sekundę i dopnij łopatki.',
      'Fazę powrotu prowadź 2-3 sekundy, czując rozciąganie najszerszych.'
    ]
  },
  'sciaganie-drazka-podchwytem': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'drążek prosty',
    startPosition: 'Usiądź pod wyciągiem górnym, uda pod wałkami. Chwyć drążek prosty podchwytem na szerokość barków, ramiona w pełni wyprostowane nad głową.',
    execution: [
      'Wypchnij klatkę do przodu i ściągnij łopatki w dół.',
      'Pociągnij drążek do górnej części klatki, łokcie prowadź blisko tułowia.',
      'Zatrzymaj drążek przy klatce, czując skurcz grzbietu i bicepsów.',
      'Powoli wróć do pełnego wyprostu ramion, kontrolując fazę negatywną.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion nad głową do drążka przy górnej części klatki.',
    musclesPrimary: ['najszerszy grzbietu'],
    musclesSecondary: ['biceps ramienia', 'ramienny', 'czworoboczny — część dolna'],
    commonMistakes: [
      'Bujanie tułowiem w rytm powtórzeń.',
      'Opuszczanie ciężaru bez kontroli i skracanie górnej części zakresu.',
      'Unoszenie barków do uszu w fazie wyprostu.',
      'Łamanie nadgarstków do środka przy dużym obciążeniu.'
    ],
    tips: [
      'Podchwyt mocniej angażuje biceps — trzymaj łokcie wąsko, a grzbiet nadal robi większość pracy.',
      'Prowadź fazę negatywną 2-3 sekundy, to najcenniejsza część ruchu.',
      'Jeśli nadgarstki przeszkadzają, przesuń się na drążek łamany.'
    ]
  },
  'sciaganie-drazka-na-prostych-ramionach': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'drążek prosty',
    startPosition: 'Stań przodem do wyciągu górnego, stopy na szerokość bioder, tułów lekko pochylony. Chwyć drążek nachwytem na szerokość barków — ramiona niemal proste, ciężar trzyma ręce na wysokości głowy.',
    execution: [
      'Napnij brzuch i usztywnij tułów — kąt pochylenia nie zmienia się.',
      'Prostymi ramionami pociągnij drążek szerokim łukiem w dół, aż do przednich ud.',
      'Na dole ściśnij grzbiet i zatrzymaj ruch na moment.',
      'Kontrolowanie unieś drążek z powrotem, czując rozciąganie najszerszych w górze.'
    ],
    rangeOfMotion: 'Od ramion uniesionych na wysokość głowy do drążka przy udach.',
    musclesPrimary: ['najszerszy grzbietu'],
    musclesSecondary: ['obły większy', 'triceps — głowa długa'],
    commonMistakes: [
      'Uginanie łokci podczas ruchu — ćwiczenie zamienia się w pushdown na triceps.',
      'Garbienie pleców i praca tułowiem zamiast ramionami.',
      'Zbyt duży ciężar, który skraca zakres w górnej fazie.',
      'Ciągnięcie drążka pionowo zamiast po łuku.'
    ],
    tips: [
      'Utrzymuj lekki, stały łuk w łokciach przez cały zakres.',
      'Myśl o prowadzeniu ruchu łokciami, nie dłońmi.',
      'W górze pozwól na pełne rozciągnięcie — tam ćwiczenie buduje najwięcej.'
    ]
  },
  'pullover-z-hantla': {
    equipmentDetail: 'hantla',
    attachment: 'ławka pozioma',
    startPosition: 'Połóż się w poprzek ławki poziomej — na ławce opierają się tylko łopatki, biodra niżej, stopy szeroko na podłodze. Trzymaj hantlę oburącz pod wewnętrznym talerzem, ramiona nad klatką.',
    execution: [
      'Ugnij lekko łokcie i utrzymaj ten kąt przez całą serię.',
      'Opuszczaj hantlę łukiem za głowę do wyraźnego rozciągnięcia najszerszych.',
      'Pociągnij hantlę tym samym łukiem z powrotem nad klatkę.',
      'Trzymaj biodra nisko — nie unoś ich podczas opuszczania ciężaru.'
    ],
    rangeOfMotion: 'Od hantli nad klatką do pozycji za głową, poniżej linii ławki.',
    musclesPrimary: ['najszerszy grzbietu'],
    musclesSecondary: ['piersiowy większy', 'triceps — głowa długa', 'zębaty przedni'],
    commonMistakes: [
      'Uginanie i prostowanie łokci — ruch zamienia się w wyciskanie francuskie.',
      'Unoszenie bioder w fazie opuszczania, co skraca rozciągnięcie.',
      'Zbyt głębokie opuszczenie bez kontroli przy dużym ciężarze.',
      'Szybkie, zamaszyste tempo bez pauzy w rozciągnięciu.'
    ],
    tips: [
      'Ruch zachodzi wyłącznie w stawach barkowych — łokcie są zamrożone.',
      'Zatrzymaj hantlę na sekundę w rozciągnięciu i dopiero wtedy ciągnij.',
      'Zacznij od lekkiego ciężaru — pozycja w poprzek ławki wymaga stabilizacji.'
    ]
  },
  'wioslowanie-sztanga-w-opadzie': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Chwyć sztangę nachwytem nieco szerzej niż barki. Pochyl tułów do około 45 stopni, kolana lekko ugięte, plecy neutralne — sztanga zwisa pod barkami.',
    execution: [
      'Napnij brzuch i ustabilizuj kąt tułowia — nie zmienia się do końca serii.',
      'Pociągnij sztangę do okolic pępka, prowadząc łokcie za plecy.',
      'Na górze ściśnij łopatki i zatrzymaj ruch na moment.',
      'Opuszczaj sztangę kontrolowanie do pełnego wyprostu ramion, nie zaokrąglając pleców.'
    ],
    rangeOfMotion: 'Od pełnego zwisu ramion do sztangi dotykającej okolic pępka.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'tylny akton barków', 'biceps ramienia', 'prostowniki grzbietu'],
    commonMistakes: [
      'Prostowanie tułowia i szarpanie ciężaru całym ciałem.',
      'Zaokrąglanie odcinka lędźwiowego pod obciążeniem.',
      'Ciągnięcie do klatki z łokciami uciekającymi na boki.',
      'Niepełne opuszczanie sztangi i praca na połowie zakresu.'
    ],
    tips: [
      'Tułów sztywny jak deska — jeśli kąt rośnie z każdym powtórzeniem, zmniejsz ciężar.',
      'Myśl o ciągnięciu łokci do bioder, nie sztangi do klatki.',
      'Sekunda pauzy z dopiętymi łopatkami na górze robi ogromną różnicę.'
    ]
  },
  'wioslowanie-hantla': {
    equipmentDetail: 'hantla',
    attachment: 'ławka płaska',
    startPosition: 'Oprzyj kolano i dłoń tej samej strony na ławce płaskiej, druga stopa stabilnie na podłodze. Plecy równolegle do podłogi, hantla zwisa w wyprostowanej ręce pod barkiem.',
    execution: [
      'Ściągnij łopatkę pracującej strony przed rozpoczęciem ruchu.',
      'Pociągnij łokciem do biodra, prowadząc hantlę wzdłuż tułowia.',
      'Na górze ściśnij grzbiet i zatrzymaj hantlę przy biodrze na moment.',
      'Opuszczaj powoli do pełnego wyprostu ręki z lekkim opadem łopatki.'
    ],
    rangeOfMotion: 'Od pełnego zwisu ręki do hantli przy biodrze.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'tylny akton barków', 'biceps ramienia'],
    commonMistakes: [
      'Rotowanie tułowia i podrzucanie hantli biodrem.',
      'Ciągnięcie łokcia do barku zamiast do biodra.',
      'Garbienie pleców i opuszczona głowa.',
      'Zbyt duży ciężar — ruch robi biceps, nie grzbiet.'
    ],
    tips: [
      'Wyobraź sobie, że wkładasz hantlę do tylnej kieszeni spodni.',
      'Pozwól łopatce zjechać w dół na końcu negatywu — pełny zakres pracy grzbietu.',
      'Wersja jednorącz pozwala wyrównać różnice między stronami — słabszą stroną zaczynaj.'
    ]
  },
  'wioslowanie-pendlay': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Sztanga leży na podłodze. Pochyl tułów do pozycji równoległej do podłogi, chwyć gryf nachwytem nieco szerzej niż barki, plecy neutralne, biodra wysoko.',
    execution: [
      'Napnij cały tułów i wybierz luz ze sztangi.',
      'Dynamicznie pociągnij sztangę do dolnej części klatki.',
      'Kontrolowanie opuść sztangę z powrotem na podłogę.',
      'Zresetuj pozycję i napięcie przed każdym kolejnym powtórzeniem.'
    ],
    rangeOfMotion: 'Od sztangi leżącej na podłodze do dotknięcia dolnej części klatki.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'prostowniki grzbietu', 'biceps ramienia', 'tylny akton barków'],
    commonMistakes: [
      'Unoszenie tułowia w trakcie ciągnięcia — pozycja ma zostać równoległa.',
      'Odbijanie sztangi od podłogi zamiast pełnego resetu.',
      'Zaokrąglanie pleców przy starcie z podłogi.',
      'Zbyt wolne, wiosłowe tempo — Pendlay ma być eksplozywny w górę.'
    ],
    tips: [
      'Każde powtórzenie to osobny start z martwego punktu — stąd siła tego wariantu.',
      'Ciągnij eksplozywnie, opuszczaj z kontrolą, resetuj oddech na dole.',
      'Jeśli nie utrzymujesz tułowia równolegle, zejdź z ciężaru.'
    ]
  },
  'wioslowanie-na-wyciagu-siedzac': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'uchwyt V',
    startPosition: 'Usiądź na siedzisku wyciągu dolnego, stopy oparte o platformy, kolana lekko ugięte. Chwyć uchwyt V, tułów wyprostowany pionowo, ramiona wyciągnięte do przodu.',
    execution: [
      'Wypchnij klatkę do przodu i ustabilizuj tułów.',
      'Pociągnij uchwyt do brzucha, prowadząc łokcie wzdłuż tułowia.',
      'Ściśnij łopatki na końcu ruchu i zatrzymaj na moment.',
      'Wróć kontrolowanie do wyprostu ramion, pozwalając łopatkom wysunąć się do przodu.'
    ],
    rangeOfMotion: 'Od ramion wyciągniętych do przodu do uchwytu przy brzuchu.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'biceps ramienia', 'tylny akton barków'],
    commonMistakes: [
      'Odchylanie tułowia do tyłu i ciągnięcie ciężaru plecami zamiast ramionami.',
      'Garbienie się w fazie powrotu.',
      'Wzruszanie barkami podczas ciągnięcia.',
      'Szarpanie ciężaru z wybicia zamiast płynnego ruchu.'
    ],
    tips: [
      'Tułów pracuje w wąskim zakresie — wychył maksymalnie kilka stopni.',
      'Uchwyt V wymusza chwyt neutralny i mocną pracę środka grzbietu.',
      'Na końcu każdego powtórzenia myśl o ściskaniu ołówka między łopatkami.'
    ]
  },
  'wioslowanie-t-bar': {
    equipmentDetail: 'sztanga w landmine (T-bar)',
    attachment: 'uchwyt V',
    startPosition: 'Stań okrakiem nad gryfem osadzonym w landmine, uchwyt V podłóż pod gryf tuż przy talerzach. Pochyl tułów do około 45 stopni, plecy neutralne, kolana lekko ugięte.',
    execution: [
      'Napnij brzuch i usztywnij pozycję tułowia.',
      'Pociągnij gryf do klatki, prowadząc łokcie blisko tułowia.',
      'Na górze ściśnij łopatki i przytrzymaj skurcz na moment.',
      'Opuszczaj ciężar kontrolowanie do pełnego wyprostu ramion.'
    ],
    rangeOfMotion: 'Od pełnego zwisu ramion do talerzy zbliżonych do klatki.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'tylny akton barków', 'biceps ramienia', 'prostowniki grzbietu'],
    commonMistakes: [
      'Prostowanie tułowia z każdym powtórzeniem przy zbyt dużym ciężarze.',
      'Zaokrąglanie odcinka lędźwiowego.',
      'Skracanie zakresu — talerze nie zbliżają się do klatki.',
      'Szarpanie ciężaru biodrami.'
    ],
    tips: [
      'Chwyt neutralny na uchwycie V pozwala ciągnąć ciężej niż nachwyt.',
      'Mniejsze talerze na gryfie wydłużają zakres ruchu.',
      'Utrzymuj stały kąt tułowia — to test uczciwości tego ćwiczenia.'
    ]
  },
  'wioslowanie-na-maszynie': {
    equipmentDetail: 'maszyna do wiosłowania (chest supported)',
    attachment: null,
    startPosition: 'Usiądź przodem do maszyny, klatka oparta o pad, stopy stabilnie na podłodze lub podestach. Chwyć uchwyty neutralnie lub nachwytem, ramiona wyprostowane.',
    execution: [
      'Dociśnij klatkę do padu i ściągnij łopatki w dół.',
      'Pociągnij uchwyty do tyłu, prowadząc łokcie wzdłuż tułowia.',
      'Ściśnij łopatki na końcu ruchu i zatrzymaj na 1-2 sekundy.',
      'Wróć powoli do pełnego wyprostu ramion bez odrywania klatki od padu.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do łokci wyraźnie za linią tułowia.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'tylny akton barków', 'biceps ramienia'],
    commonMistakes: [
      'Odrywanie klatki od padu i pomaganie tułowiem.',
      'Szarpanie ciężaru zamiast płynnego ciągnięcia.',
      'Wzruszanie barkami podczas skurczu.',
      'Za krótki powrót — brak pełnego rozciągnięcia grzbietu.'
    ],
    tips: [
      'Podparcie klatki eliminuje oszukiwanie — idealne miejsce na pracę nad czuciem grzbietu.',
      'Skup się na ściskaniu łopatek, dłonie traktuj jak haki.',
      'Wypróbuj oba chwyty: neutralny mocniej ładuje najszersze, nachwyt górę grzbietu.'
    ]
  },
  'wioslowanie-z-podparciem-klatki': {
    equipmentDetail: 'hantle',
    attachment: 'ławka skośna',
    startPosition: 'Ustaw oparcie ławki na 30-45 stopni i połóż się na niej klatką w dół, stopy oparte o podłogę. Hantle zwisają w wyprostowanych rękach pod barkami, chwyt neutralny.',
    execution: [
      'Dociśnij klatkę do oparcia i ściągnij łopatki w dół.',
      'Pociągnij hantle łokciami w górę, wzdłuż tułowia w stronę bioder.',
      'Na górze ściśnij łopatki i zatrzymaj skurcz na moment.',
      'Opuszczaj hantle powoli do pełnego zwisu ramion.'
    ],
    rangeOfMotion: 'Od pełnego zwisu ramion do łokci powyżej linii pleców.',
    musclesPrimary: ['najszerszy grzbietu', 'czworoboczny — część środkowa'],
    musclesSecondary: ['równoległoboczne', 'tylny akton barków', 'biceps ramienia'],
    commonMistakes: [
      'Odrywanie klatki od oparcia i szarpanie tułowiem.',
      'Ciągnięcie hantli do barków z łokciami na zewnątrz.',
      'Skracanie fazy negatywnej.',
      'Zbyt ciężkie hantle — zakres ruchu spada o połowę.'
    ],
    tips: [
      'Oparcie odbiera możliwość bujania — cały ciężar prowadzi grzbiet.',
      'Kieruj łokcie do bioder, a nie prosto w górę, żeby mocniej trafić w najszersze.',
      'Dobre ćwiczenie po martwych ciągach — nie obciąża dodatkowo lędźwi.'
    ]
  },
  'wzruszenia-sztanga': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Stań prosto ze sztangą trzymaną nachwytem na szerokość barków, ramiona wyprostowane, sztanga przed udami. Klatka w górę, brzuch napięty.',
    execution: [
      'Unieś barki pionowo w górę, jak najbliżej uszu.',
      'Zatrzymaj skurcz na 1-2 sekundy w najwyższym punkcie.',
      'Opuszczaj barki powoli do pełnego rozciągnięcia czworobocznych.',
      'Utrzymuj ramiona proste — łokcie nie pracują.'
    ],
    rangeOfMotion: 'Od barków opuszczonych w pełnym rozciągnięciu do uniesionych maksymalnie w górę.',
    musclesPrimary: ['czworoboczny — część górna'],
    musclesSecondary: ['dźwigacz łopatki', 'równoległoboczne', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Krążenie barkami — ruch ma iść pionowo w górę i w dół.',
      'Zbyt duży ciężar i drganie zamiast pełnego zakresu.',
      'Wypychanie głowy do przodu podczas skurczu.',
      'Pomaganie ugięciem łokci.'
    ],
    tips: [
      'Prowadź barki prosto do góry — krążenie nic nie dodaje, a obciąża staw.',
      'Pauza na szczycie jest ważniejsza niż kolejne kilogramy na gryfie.',
      'Jeśli chwyt puszcza przed czworobocznymi, użyj pasków.'
    ]
  },
  'wzruszenia-hantlami': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami po bokach ciała, chwyt neutralny, ramiona wyprostowane. Klatka w górę, barki cofnięte.',
    execution: [
      'Wzrusz barkami pionowo w górę, celując w uszy.',
      'Przytrzymaj skurcz na 1-2 sekundy na szczycie.',
      'Opuść barki powoli do pełnego rozciągnięcia.',
      'Trzymaj tułów nieruchomo — bez podskoków i pracy kolan.'
    ],
    rangeOfMotion: 'Od barków w pełnym opuszczeniu do maksymalnego uniesienia w górę.',
    musclesPrimary: ['czworoboczny — część górna'],
    musclesSecondary: ['dźwigacz łopatki', 'równoległoboczne', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Krążenie barkami zamiast ruchu pionowego.',
      'Odchylanie głowy i garbienie się pod ciężarem.',
      'Brak pauzy na górze i odbijanie w dolnej fazie.',
      'Uginanie łokci w trakcie unoszenia.'
    ],
    tips: [
      'Hantle po bokach dają naturalniejszy tor niż sztanga przed udami.',
      'Ustaw się bokiem do lustra — łatwiej wychwycisz krążenie barków.',
      'Wolne opuszczanie mocno zwiększa bodziec — licz do trzech w negatywie.'
    ]
  },
  'martwy-ciag-klasyczny': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Podejdź do sztangi tak, by gryf znajdował się nad śródstopiem. Stopy na szerokość bioder, chwyt nachwytem tuż za kolanami, biodra wyżej niż kolana, plecy neutralne, klatka w górę.',
    execution: [
      'Napnij cały tułów i wybierz luz ze sztangi przed oderwaniem jej od podłogi.',
      'Wstań, prowadząc sztangę pionowo, tuż przy goleniach i udach.',
      'Prostuj biodra i kolana równocześnie — napęd idzie z nóg i bioder, nie z pleców.',
      'Na górze w pełni wyprostuj biodra, bez przeprostu w odcinku lędźwiowym.',
      'Opuszczaj sztangę po tym samym torze, najpierw cofając biodra.'
    ],
    rangeOfMotion: 'Od sztangi leżącej na podłodze do pełnego wyprostu bioder i kolan w staniu.',
    musclesPrimary: ['prostowniki grzbietu', 'pośladkowy wielki', 'dwugłowy uda'],
    musclesSecondary: ['czworogłowy uda', 'czworoboczny — część górna', 'najszerszy grzbietu', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Zaokrąglanie pleców pod obciążeniem.',
      'Sztanga oddalająca się od ciała — dźwignia rośnie, lędźwie cierpią.',
      'Szarpanie sztangi z podłogi zamiast płynnego naprężenia.',
      'Unoszenie bioder przed sztangą i ciągnięcie samymi plecami.',
      'Przeprost tułowia z odchylaniem się do tyłu na górze.'
    ],
    tips: [
      'Trzymaj sztangę tak blisko, żeby przy wstawaniu szorowała o golenie i uda.',
      'Przed startem weź głęboki wdech w brzuch i utrzymaj ciśnienie do zakończenia powtórzenia.',
      'Myśl o wypychaniu podłogi nogami, a nie o podnoszeniu sztangi plecami.'
    ]
  },
  'martwy-ciag-rumunski': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Stań prosto ze sztangą trzymaną nachwytem na szerokość barków, sztanga przy udach. Stopy na szerokość bioder, kolana minimalnie ugięte — ten kąt nie zmienia się w trakcie ruchu.',
    execution: [
      'Cofnij biodra do tyłu, opuszczając sztangę wzdłuż ud.',
      'Utrzymuj plecy neutralne i klatkę w górze podczas schodzenia.',
      'Zejdź do wyraźnego rozciągnięcia tylnej taśmy ud, zwykle do połowy goleni.',
      'Wróć w górę, wypychając biodra do przodu i ściskając pośladki na końcu.'
    ],
    rangeOfMotion: 'Od pozycji stojącej do sztangi mniej więcej w połowie goleni, w granicach neutralnych pleców.',
    musclesPrimary: ['dwugłowy uda', 'pośladkowy wielki', 'prostowniki grzbietu'],
    musclesSecondary: ['czworoboczny — część górna', 'najszerszy grzbietu', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Zginanie kolan podczas schodzenia — ruch zamienia się w klasyczny martwy ciąg.',
      'Zaokrąglanie pleców przy schodzeniu za nisko.',
      'Sztanga odjeżdżająca od nóg zamiast sunąć wzdłuż ud.',
      'Ciągnięcie tułowiem w górę zamiast napędu z bioder.'
    ],
    tips: [
      'Głębokość wyznacza rozciągnięcie dwugłowych, nie dotknięcie podłogi.',
      'Wyobraź sobie, że zamykasz biodrami drzwi za sobą — to jest ten ruch.',
      'Kontroluj fazę schodzenia 2-3 sekundy, to tam dzieje się najwięcej.'
    ]
  },
  'martwy-ciag-rumunski-hantle': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami przed udami, chwyt nachwytem, stopy na szerokość bioder. Kolana minimalnie ugięte, plecy neutralne, barki cofnięte.',
    execution: [
      'Cofaj biodra, opuszczając hantle wzdłuż przedniej strony ud.',
      'Trzymaj hantle blisko nóg, plecy neutralne przez cały ruch.',
      'Zejdź do mocnego rozciągnięcia tylnej strony ud.',
      'Wypchnij biodra do przodu i wróć do pozycji stojącej, ściskając pośladki.'
    ],
    rangeOfMotion: 'Od pozycji stojącej do hantli w okolicach połowy goleni, bez utraty neutralnych pleców.',
    musclesPrimary: ['dwugłowy uda', 'pośladkowy wielki', 'prostowniki grzbietu'],
    musclesSecondary: ['czworoboczny — część górna', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Hantle wędrujące do przodu, z dala od nóg.',
      'Zaokrąglanie pleców w dolnej fazie.',
      'Uginanie kolan i zamiana ruchu w przysiad.',
      'Zbyt szybkie tempo bez czucia rozciągnięcia.'
    ],
    tips: [
      'Hantle pozwalają na większy zakres niż sztanga — ale schodź tylko tak nisko, jak pozwalają neutralne plecy.',
      'Prowadź hantle po udach jak po szynach.',
      'Patrz w podłogę kilka metrów przed sobą — szyja zostaje w linii kręgosłupa.'
    ]
  },
  'martwy-ciag-sumo': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Stań bardzo szeroko, palce stóp skierowane na zewnątrz około 45 stopni, golenie prostopadle do podłogi. Chwyć gryf nachwytem wąsko, wewnątrz kolan, tułów możliwie pionowo, plecy neutralne.',
    execution: [
      'Napnij tułów i rozepchnij kolana na zewnątrz, wybierając luz ze sztangi.',
      'Wstań, wypychając podłogę nogami — sztanga sunie pionowo przy ciele.',
      'Prostuj biodra i kolana jednocześnie, trzymając klatkę w górze.',
      'Na górze domknij biodra, bez odchylania się do tyłu.',
      'Opuszczaj sztangę kontrolowanie po tym samym torze.'
    ],
    rangeOfMotion: 'Od sztangi na podłodze do pełnego wyprostu bioder i kolan.',
    musclesPrimary: ['pośladkowy wielki', 'czworogłowy uda', 'prostowniki grzbietu'],
    musclesSecondary: ['przywodziciele uda', 'dwugłowy uda', 'czworoboczny — część górna', 'zginacze nadgarstka (chwyt)'],
    commonMistakes: [
      'Kolana zapadające się do środka podczas wstawania.',
      'Unoszenie bioder przed sztangą i przejęcie ciężaru przez plecy.',
      'Zbyt wąska postawa, która odbiera sens wariantu sumo.',
      'Odrywanie sztangi szarpnięciem zamiast stopniowego naprężenia.'
    ],
    tips: [
      'Tułów bardziej pionowo niż w klasyce — to odciąża lędźwie, ale wymaga mobilnych bioder.',
      'Aktywnie rozpychaj kolana na zewnątrz przez cały ruch.',
      'Start jest najtrudszą fazą sumo — bądź cierpliwy przy odrywaniu sztangi.'
    ]
  },
  'wyprosty-na-lawce-rzymskiej': {
    equipmentDetail: 'masa ciała',
    attachment: 'ławka rzymska',
    startPosition: 'Ustaw pad ławki rzymskiej tak, by jego krawędź wypadała tuż poniżej kolców biodrowych. Zablokuj stopy pod wałkami, ręce skrzyżuj na klatce.',
    execution: [
      'Opuść tułów w dół, zginając się w biodrach, plecy trzymaj neutralnie.',
      'Unieś tułów do linii prostej z nogami.',
      'Zatrzymaj się na moment w górze, ściskając pośladki.',
      'Wracaj w dół powoli, kontrolując cały zakres.'
    ],
    rangeOfMotion: 'Od tułowia opuszczonego w dół do linii prostej z nogami, bez przeprostu.',
    musclesPrimary: ['prostowniki grzbietu'],
    musclesSecondary: ['pośladkowy wielki', 'dwugłowy uda'],
    commonMistakes: [
      'Przeprost w górnej fazie — tułów wyżej niż linia nóg.',
      'Zamaszyste, szybkie powtórzenia bez kontroli.',
      'Pad ustawiony za wysoko, co blokuje ruch w biodrach.',
      'Zaokrąglanie pleców zamiast utrzymania neutralnej linii.'
    ],
    tips: [
      'Ruch kończy się w linii prostej — przeprost nic nie dodaje, a obciąża lędźwie.',
      'Chcesz mocniej poczuć pośladki? Skręć stopy lekko na zewnątrz i prowadź ruch biodrami.',
      'Gdy masa ciała przestaje wystarczać, przytul talerz do klatki.'
    ]
  },
  'wznosy-hantli-w-opadzie': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Pochyl tułów niemal równolegle do podłogi, kolana lekko ugięte, plecy neutralne. Hantle zwisają pod klatką, chwyt neutralny, łokcie minimalnie ugięte.',
    execution: [
      'Unieś ramiona łukiem na boki, prowadząc ruch łokciami.',
      'Zatrzymaj się, gdy łokcie osiągną linię barków.',
      'Ściśnij tylne aktony i łopatki na szczycie na moment.',
      'Opuszczaj hantle powoli, nie tracąc kąta tułowia.'
    ],
    rangeOfMotion: 'Od hantli zwisających pod klatką do łokci na wysokości linii barków.',
    musclesPrimary: ['tylny akton barków'],
    musclesSecondary: ['równoległoboczne', 'czworoboczny — część środkowa', 'podgrzebieniowy'],
    commonMistakes: [
      'Prostowanie tułowia i podbijanie ciężaru biodrami.',
      'Wzruszanie barkami — pracę przejmuje czworoboczny.',
      'Za duży ciężar i szarpany, krótki zakres.',
      'Ciągnięcie łokci do tyłu zamiast unoszenia na boki.'
    ],
    tips: [
      'To ćwiczenie na lekkie hantle i pełną kontrolę — ego zostaw przy wiosłowaniu.',
      'Myśl o rozlewaniu wody z kubków na boki, nie o podnoszeniu ciężaru.',
      'Czoło możesz oprzeć o skos ławki — od razu wyeliminujesz bujanie.'
    ]
  },
  'odwrotne-rozpietki-na-maszynie': {
    equipmentDetail: 'maszyna reverse pec deck',
    attachment: null,
    startPosition: 'Usiądź twarzą do oparcia maszyny, siedzisko ustaw tak, by uchwyty były na wysokości barków. Chwyć rączki neutralnie, ramiona wyciągnięte przed sobą, łokcie lekko ugięte.',
    execution: [
      'Dociśnij klatkę do oparcia i opuść barki w dół.',
      'Odwiedź ramiona szerokim łukiem do tyłu, do linii tułowia.',
      'Zatrzymaj skurcz na 1-2 sekundy, ściskając tylne aktony i łopatki.',
      'Wróć powoli do pozycji wyjściowej, utrzymując napięcie.'
    ],
    rangeOfMotion: 'Od ramion wyciągniętych przed klatką do odwiedzionych w linii tułowia.',
    musclesPrimary: ['tylny akton barków'],
    musclesSecondary: ['równoległoboczne', 'czworoboczny — część środkowa', 'podgrzebieniowy'],
    commonMistakes: [
      'Odrywanie klatki od oparcia i pomaganie tułowiem.',
      'Prowadzenie ruchu za daleko do tyłu z mocnym ściąganiem łopatek od startu.',
      'Wzruszanie barkami podczas odwodzenia.',
      'Uginanie łokci i zamiana rozpiętek w wiosłowanie.'
    ],
    tips: [
      'Kąt w łokciach ustaw raz i zamroź — ruch idzie tylko z barków.',
      'Pauza w skurczu decyduje o jakości — bez niej to machanie ciężarem.',
      'Lżejszy ciężar i pełny zakres budują tylne aktony szybciej niż połowiczne powtórzenia.'
    ]
  },
  'face-pull': {
    equipmentDetail: 'wyciąg górny',
    attachment: 'lina (rope)',
    startPosition: 'Ustaw bloczek na wysokości twarzy lub nieco wyżej. Chwyć końce liny chwytem młotkowym, zrób krok lub dwa w tył, przyjmij lekki rozkrok, ramiona wyciągnięte przed sobą.',
    execution: [
      'Pociągnij linę w stronę twarzy, rozciągając jej końce na boki.',
      'Prowadź łokcie wysoko i szeroko, na wysokości barków.',
      'W końcowej fazie wykonaj rotację zewnętrzną — dłonie wędrują obok uszu, przedramiona pionowo.',
      'Wróć powoli do wyprostu ramion, nie pozwalając barkom uciec do przodu.'
    ],
    rangeOfMotion: 'Od ramion wyprostowanych przed sobą do dłoni przy uszach z łokciami na wysokości barków.',
    musclesPrimary: ['tylny akton barków'],
    musclesSecondary: ['podgrzebieniowy', 'obły mniejszy', 'czworoboczny — część środkowa', 'równoległoboczne'],
    commonMistakes: [
      'Łokcie opadające w dół — ruch zamienia się w wiosłowanie.',
      'Ciągnięcie liny do klatki lub szyi zamiast do twarzy.',
      'Odchylanie tułowia do tyłu, żeby domknąć powtórzenie.',
      'Za duży ciężar uniemożliwiający rotację zewnętrzną na końcu.'
    ],
    tips: [
      'Na końcu ruchu przyjmij pozycję jak do gestu siłacza — to znak pełnej rotacji zewnętrznej.',
      'To ćwiczenie na zdrowie barków — licz jakość powtórzeń, nie kilogramy.',
      'Rozdzielaj końce liny maksymalnie na boki, jakbyś chciał ją rozerwać.'
    ]
  },
  'odwrotne-rozpietki-na-wyciagu': {
    equipmentDetail: 'brama (dwa wyciągi)',
    attachment: 'uchwyt pojedynczy (D-handle)',
    startPosition: 'Ustaw oba bloczki bramy na wysokości barków lub nieco wyżej i stań pośrodku. Chwyć uchwyty na krzyż — prawa ręka trzyma lewy, lewa prawy — ramiona skrzyżowane przed klatką, łokcie lekko ugięte.',
    execution: [
      'Ustabilizuj tułów i opuść barki w dół.',
      'Odwiedź ramiona szerokim łukiem na boki i do tyłu.',
      'Zatrzymaj ruch, gdy ramiona znajdą się w linii tułowia, i ściśnij tylne aktony.',
      'Wróć powoli do skrzyżowania ramion, utrzymując stałe napięcie linek.'
    ],
    rangeOfMotion: 'Od ramion skrzyżowanych przed klatką do odwiedzionych w linii tułowia.',
    musclesPrimary: ['tylny akton barków'],
    musclesSecondary: ['równoległoboczne', 'czworoboczny — część środkowa', 'podgrzebieniowy'],
    commonMistakes: [
      'Uginanie łokci w trakcie ruchu i ciągnięcie jak przy wiosłowaniu.',
      'Odchylanie tułowia do tyłu przy zbyt dużym obciążeniu.',
      'Wzruszanie barkami zamiast czystego odwodzenia.',
      'Utrata napięcia w fazie powrotu i luźne linki.'
    ],
    tips: [
      'Skrzyżowane linki dają opór już w pozycji startowej — wykorzystaj pełny zakres.',
      'Ustaw niewielki ciężar: przy tym ruchu dźwignia jest długa, a tylne aktony małe.',
      'Prowadź ruch grzbietami dłoni na zewnątrz, jakbyś rozsuwał zasłony.'
    ]
  },
  'uginanie-na-modlitewniku': {
    equipmentDetail: 'sztanga EZ',
    attachment: 'modlitewnik',
    startPosition: 'Usiądź przy modlitewniku, pachy oparte o górną krawędź pada, ramiona przylegają płasko do skosu. Chwyć gryf EZ podchwytem na szerokość barków.',
    execution: [
      'Ugnij ramiona, prowadząc gryf do pełnego skurczu bicepsów.',
      'Zatrzymaj się na moment w górze, nie unosząc ramion z pada.',
      'Opuszczaj gryf powoli do niemal pełnego wyprostu łokci.',
      'Utrzymuj nadgarstki w jednej linii z przedramionami.'
    ],
    rangeOfMotion: 'Od niemal pełnego wyprostu łokci do pełnego skurczu bicepsów.',
    musclesPrimary: ['biceps ramienia'],
    musclesSecondary: ['ramienny', 'ramienno-promieniowy'],
    commonMistakes: [
      'Odrywanie ramion i łokci od pada w górnej fazie.',
      'Skracanie dolnej części zakresu ze strachu przed rozciągnięciem.',
      'Opuszczanie ciężaru bez kontroli — modlitewnik nie wybacza tego łokciom.',
      'Unoszenie barków i wciąganie ich do pracy.'
    ],
    tips: [
      'Pad blokuje ramiona, więc każdy centymetr ruchu robi biceps — nie da się oszukać.',
      'Dolna faza jest najcięższa: schodź powoli i nie blokuj łokci gwałtownie.',
      'Gryf EZ ustawia nadgarstki w wygodnej pozycji przy pełnym zakresie.'
    ]
  },
  'uginanie-hantli-na-lawce-skosnej': {
    equipmentDetail: 'hantle',
    attachment: 'ławka skośna',
    startPosition: 'Ustaw oparcie ławki na około 45 stopni i usiądź, plecy i głowa przylegają do oparcia. Hantle zwisają w wyprostowanych rękach za linią tułowia, chwyt podchwytem.',
    execution: [
      'Trzymaj łokcie skierowane w dół, lekko za tułowiem.',
      'Ugnij ramiona, unosząc hantle bez wysuwania łokci do przodu.',
      'Ściśnij bicepsy na górze na moment.',
      'Opuszczaj hantle powoli do pełnego zwisu i rozciągnięcia.'
    ],
    rangeOfMotion: 'Od pełnego zwisu ramion za tułowiem do pełnego skurczu bicepsów.',
    musclesPrimary: ['biceps — głowa długa'],
    musclesSecondary: ['biceps — głowa krótka', 'ramienny'],
    commonMistakes: [
      'Wysuwanie łokci do przodu, co skraca rozciągnięcie długiej głowy.',
      'Odrywanie pleców i głowy od oparcia.',
      'Zbyt ciężkie hantle i bujanie ramionami.',
      'Skracanie dolnej fazy — a to dla niej wybiera się to ćwiczenie.'
    ],
    tips: [
      'Pozycja na skosie rozciąga długą głowę bicepsu jak żadne inne uginanie — celebruj dolną fazę.',
      'Możesz uginać obie ręce naraz lub naprzemiennie, kąt łokcia się nie zmienia.',
      'Zacznij od lżejszych hantli niż przy uginaniu stojąc — rozciągnięta pozycja jest wymagająca.'
    ]
  },
  'uginanie-koncentryczne': {
    equipmentDetail: 'hantla',
    attachment: 'ławka płaska',
    startPosition: 'Usiądź na ławce w rozkroku, pochyl tułów i oprzyj łokieć o wewnętrzną stronę uda. Hantla zwisa w wyprostowanej ręce, chwyt podchwytem.',
    execution: [
      'Ugnij ramię, prowadząc hantlę w stronę barku.',
      'Na górze zatrzymaj skurcz na sekundę i mocno ściśnij biceps.',
      'Opuszczaj hantlę powoli do pełnego wyprostu łokcia.',
      'Trzymaj łokieć wbity w udo — ramię nie zmienia pozycji.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu łokcia do hantli przy barku.',
    musclesPrimary: ['biceps — głowa długa'],
    musclesSecondary: ['ramienny'],
    commonMistakes: [
      'Odrywanie łokcia od uda i pomaganie barkiem.',
      'Bujanie tułowiem, żeby podbić ciężar.',
      'Brak pauzy w skurczu — a to sedno tego ćwiczenia.',
      'Niepełny wyprost łokcia na dole.'
    ],
    tips: [
      'To ćwiczenie na czucie mięśniowe i szczyt bicepsu — ciężar gra rolę drugoplanową.',
      'Na górze lekko supinuj nadgarstek (mały palec wyżej) dla mocniejszego skurczu.',
      'Patrz na pracujący biceps — kontakt wzrokowy realnie poprawia kontrolę ruchu.'
    ]
  },
  'spider-curl': {
    equipmentDetail: 'hantle',
    attachment: 'ławka skośna',
    startPosition: 'Połóż się klatką na oparciu ławki skośnej, stopy stabilnie na podłodze. Ramiona zwisają pionowo przed oparciem, hantle w podchwycie.',
    execution: [
      'Zamroź ramiona w pionie — pracują tylko przedramiona względem łokci.',
      'Ugnij ręce, prowadząc hantle do pełnego skurczu.',
      'Ściśnij bicepsy na górze na 1-2 sekundy.',
      'Opuszczaj powoli do pełnego wyprostu łokci.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion zwisających pionowo do pełnego skurczu bicepsów.',
    musclesPrimary: ['biceps ramienia'],
    musclesSecondary: ['ramienny', 'ramienno-promieniowy'],
    commonMistakes: [
      'Cofanie łokci w stronę tułowia podczas uginania.',
      'Odpychanie klatki od oparcia i praca tułowiem.',
      'Zbyt duży ciężar i połowiczny zakres.',
      'Opadanie hantli bez kontroli w fazie negatywnej.'
    ],
    tips: [
      'Pionowy zwis ramion odbiera każdą możliwość oszukiwania — zero rozpędu z bioder.',
      'Skurcz w górze jest tu mocniejszy niż na modlitewniku — wykorzystaj go pauzą.',
      'Dobierz hantle o 20-30 procent lżejsze niż do uginania stojąc.'
    ]
  },
  'uginanie-ramion-ze-sztanga': {
    equipmentDetail: 'sztanga prosta',
    attachment: null,
    startPosition: 'Stań prosto, stopy na szerokość bioder. Chwyć sztangę podchwytem na szerokość barków, ramiona wyprostowane, sztanga przy udach, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramiona, prowadząc sztangę łukiem do góry.',
      'Trzymaj łokcie nieruchomo przy tułowiu przez cały ruch.',
      'Ściśnij bicepsy w górze na moment.',
      'Opuszczaj sztangę powoli do pełnego wyprostu łokci.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion przy udach do sztangi na wysokości górnej części klatki.',
    musclesPrimary: ['biceps — głowa krótka'],
    musclesSecondary: ['biceps — głowa długa', 'ramienny', 'zginacze nadgarstka'],
    commonMistakes: [
      'Bujanie tułowiem i podbijanie sztangi biodrami.',
      'Wysuwanie łokci do przodu w górnej fazie — pracę przejmują barki.',
      'Skracanie dolnej fazy i brak pełnego wyprostu.',
      'Łamanie nadgarstków do siebie pod ciężarem.'
    ],
    tips: [
      'Przyklej łokcie do żeber i wyobraź sobie, że ramiona są przyspawane do tułowia.',
      'Jeśli musisz bujać, ciężar jest za duży — biceps rośnie od kontroli, nie od kilogramów.',
      'Oprzyj plecy o ścianę na serię kontrolną — od razu zobaczysz, ile robił rozpęd.'
    ]
  },
  'uginanie-ze-sztanga-ez': {
    equipmentDetail: 'sztanga EZ',
    attachment: null,
    startPosition: 'Stań prosto ze sztangą EZ trzymaną podchwytem na zewnętrznych skosach gryfu, nieco szerzej niż barki. Ramiona wyprostowane, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramiona, unosząc gryf łukiem do góry.',
      'Utrzymuj łokcie nieruchomo przy żebrach.',
      'Zatrzymaj skurcz na moment w górnej pozycji.',
      'Opuszczaj gryf kontrolowanie do pełnego wyprostu łokci.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do gryfu na wysokości górnej części klatki.',
    musclesPrimary: ['biceps — głowa krótka'],
    musclesSecondary: ['ramienny', 'ramienno-promieniowy'],
    commonMistakes: [
      'Bujanie tułowiem przy cięższych seriach.',
      'Unoszenie łokci i barków w górnej fazie.',
      'Opuszczanie gryfu bez kontroli.',
      'Zbyt wąski chwyt na skosach, który przenosi akcent poza głowę krótką.'
    ],
    tips: [
      'Skośne chwyty EZ odciążają nadgarstki — dobry wybór, gdy prosta sztanga je przeciąża.',
      'Szerszy chwyt na gryfie akcentuje głowę krótką, węższy przenosi pracę na długą.',
      'Prowadź negatyw 2-3 sekundy — to połowa efektu tego ćwiczenia.'
    ]
  },
  'uginanie-ramion-z-hantlami': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami po bokach ciała, chwyt neutralny, ramiona wyprostowane, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramię, jednocześnie obracając nadgarstek do supinacji (dłoń do góry).',
      'W górnej fazie skieruj mały palec lekko wyżej i ściśnij biceps.',
      'Opuszczaj hantlę powoli, wracając do chwytu neutralnego na dole.',
      'Powtarzaj naprzemiennie lub obiema rękami naraz, bez bujania tułowiem.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion przy udach do hantli przy barkach.',
    musclesPrimary: ['biceps — głowa krótka'],
    musclesSecondary: ['biceps — głowa długa', 'ramienny', 'zginacze nadgarstka'],
    commonMistakes: [
      'Podbijanie hantli biodrami i barkami.',
      'Brak supinacji — ruch traci główny atut hantli.',
      'Wysuwanie łokci do przodu w górnej fazie.',
      'Opuszczanie ciężaru grawitacyjnie, bez kontroli.'
    ],
    tips: [
      'Supinacja to funkcja bicepsu — obracaj nadgarstek aktywnie, nie przy okazji.',
      'Wersja naprzemienna pozwala lepiej skupić się na każdej ręce.',
      'Zakończ serię wolnymi negatywami, gdy nie masz już siły na pełne powtórzenia.'
    ]
  },
  'uginanie-ramion-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'drążek prosty',
    startPosition: 'Stań przodem do wyciągu dolnego, stopy na szerokość bioder, pół kroku od bloczka. Chwyć drążek prosty podchwytem na szerokość barków, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramiona, prowadząc drążek do górnej części klatki.',
      'Trzymaj łokcie nieruchomo przy żebrach.',
      'Ściśnij bicepsy w górze na moment.',
      'Opuszczaj drążek powoli do pełnego wyprostu, utrzymując napięcie linki.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do drążka przy górnej części klatki.',
    musclesPrimary: ['biceps — głowa krótka'],
    musclesSecondary: ['ramienny', 'ramienno-promieniowy'],
    commonMistakes: [
      'Odchylanie tułowia do tyłu przy domykaniu powtórzenia.',
      'Wysuwanie łokci do przodu i unoszenie barków.',
      'Stawanie zbyt blisko bloczka, co odbiera napięcie w dolnej fazie.',
      'Szarpanie ciężaru zamiast płynnego ruchu.'
    ],
    tips: [
      'Wyciąg trzyma napięcie także w dolnej fazie, gdzie hantle odpuszczają — nie marnuj tego skracaniem zakresu.',
      'Krok w tył od bloczka zwiększa napięcie na starcie ruchu.',
      'Świetna opcja na pompujące serie na koniec treningu.'
    ]
  },
  'uginanie-hantli-mlotkowo': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami po bokach ciała, chwyt neutralny — kciuki skierowane do góry. Ramiona wyprostowane, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramię, utrzymując chwyt neutralny przez cały ruch.',
      'Prowadź hantlę do przedniej części barku, łokieć zostaje przy tułowiu.',
      'Zatrzymaj skurcz na moment w górze.',
      'Opuszczaj powoli do pełnego wyprostu łokcia.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramienia do hantli przy przedniej części barku.',
    musclesPrimary: ['ramienny', 'ramienno-promieniowy'],
    musclesSecondary: ['biceps — głowa długa'],
    commonMistakes: [
      'Rotowanie nadgarstka w trakcie ruchu — chwyt młotkowy ma zostać neutralny.',
      'Bujanie tułowiem przy cięższych hantlach.',
      'Wysuwanie łokcia do przodu w górnej fazie.',
      'Zbyt szybkie opuszczanie bez kontroli.'
    ],
    tips: [
      'Chwyt młotkowy przenosi pracę na ramienny i przedramiona — to on buduje grubość ramienia.',
      'Zniesiesz tu więcej ciężaru niż w klasycznym uginaniu, ale forma nadal jest priorytetem.',
      'Wariant w poprzek ciała (do przeciwnego barku) dodatkowo dociąża ramienno-promieniowy.'
    ]
  },
  'uginanie-mlotkowo-na-wyciagu': {
    equipmentDetail: 'wyciąg dolny',
    attachment: 'lina (rope)',
    startPosition: 'Stań przodem do wyciągu dolnego, pół kroku od bloczka. Chwyć końce liny chwytem neutralnym, kciuki do góry, ramiona wyprostowane, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramiona, prowadząc linę do wysokości barków.',
      'Utrzymuj chwyt neutralny i łokcie nieruchomo przy żebrach.',
      'Ściśnij ramiona w górze na moment.',
      'Opuszczaj linę powoli do pełnego wyprostu, nie tracąc napięcia linki.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do dłoni na wysokości barków.',
    musclesPrimary: ['ramienny', 'ramienno-promieniowy'],
    musclesSecondary: ['biceps — głowa długa'],
    commonMistakes: [
      'Odchylanie tułowia, żeby dokończyć powtórzenie.',
      'Wysuwanie łokci do przodu i praca barkami.',
      'Luźna linka w dolnej fazie przez stanie za blisko bloczka.',
      'Szarpanie ciężaru w górę zamiast płynnego uginania.'
    ],
    tips: [
      'Lina naturalnie wymusza chwyt neutralny — idealna do pracy nad ramiennym.',
      'Stały opór wyciągu w całym zakresie czuć zwłaszcza na dole — nie skracaj wyprostu.',
      'Na górze możesz lekko rozsunąć końce liny dla mocniejszego skurczu.'
    ]
  },
  'uginanie-zottmana': {
    equipmentDetail: 'hantle',
    attachment: null,
    startPosition: 'Stań prosto z hantlami po bokach ciała, chwyt podchwytem (dłonie do przodu). Ramiona wyprostowane, łokcie przy tułowiu.',
    execution: [
      'Ugnij ramiona podchwytem, unosząc hantle do barków.',
      'W górnej pozycji obróć nadgarstki do nachwytu (dłonie w dół).',
      'Opuszczaj hantle powoli nachwytem do pełnego wyprostu łokci.',
      'Na dole wróć do podchwytu i rozpocznij kolejne powtórzenie.'
    ],
    rangeOfMotion: 'Od pełnego wyprostu ramion do hantli przy barkach, z rotacją nadgarstków na górze i na dole.',
    musclesPrimary: ['ramienno-promieniowy', 'prostowniki nadgarstka'],
    musclesSecondary: ['biceps ramienia', 'ramienny'],
    commonMistakes: [
      'Zbyt szybka faza opuszczania — cała wartość ćwiczenia leży w negatywie nachwytem.',
      'Rotacja nadgarstków w połowie ruchu zamiast w skrajnych pozycjach.',
      'Bujanie tułowiem przy zbyt ciężkich hantlach.',
      'Uciekające od tułowia łokcie.'
    ],
    tips: [
      'Dobierz ciężar pod najsłabsze ogniwo, czyli negatyw nachwytem — zwykle to 60-70 procent klasycznego uginania.',
      'Opuszczaj minimum 3 sekundy: to faza, która buduje przedramiona.',
      'Dwa ćwiczenia w jednym — biceps w drodze w górę, przedramiona w drodze w dół.'
    ]
  },
  'uginanie-nadgarstkow-ze-sztanga': {
    equipmentDetail: 'sztanga prosta',
    attachment: 'ławka płaska',
    startPosition: 'Usiądź na ławce, przedramiona oprzyj o uda podchwytem, nadgarstki i dłonie wystają poza kolana. Chwyć sztangę na szerokość bioder.',
    execution: [
      'Opuść nadgarstki maksymalnie w dół, pozwalając sztandze stoczyć się w stronę palców.',
      'Domknij dłonie i zegnij nadgarstki maksymalnie do góry.',
      'Zatrzymaj skurcz na sekundę w górze.',
      'Opuszczaj powoli — ruch zachodzi wyłącznie w nadgarstkach.'
    ],
    rangeOfMotion: 'Od nadgarstków maksymalnie opuszczonych w dół do pełnego zgięcia w górę.',
    musclesPrimary: ['zginacze nadgarstka'],
    musclesSecondary: ['zginacze palców'],
    commonMistakes: [
      'Odrywanie przedramion od ud i pomaganie łokciami.',
      'Praca na skróconym zakresie bez opuszczenia sztangi na palce.',
      'Zbyt duży ciężar i szarpane powtórzenia.',
      'Zbyt szybkie tempo bez pauzy w skurczu.'
    ],
    tips: [
      'Pełny zakres z opuszczeniem sztangi na palce robi więcej niż podwójny ciężar na pół zakresu.',
      'Przedramiona lubią wyższe liczby powtórzeń — celuj w 12-20 na serię.',
      'Rób je na końcu treningu — zmęczony chwyt popsułby wiosłowania i martwe ciągi.'
    ]
  }
}
