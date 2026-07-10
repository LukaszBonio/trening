// ============================================================================
// TRENING PRO - Plany treningowe offline
// ============================================================================

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  tip: string;
}

export interface Plan {
  name: string;
  exercises: PlanExercise[];
}

export type PlanType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'upper_a'
  | 'upper_b'
  | 'lower_a'
  | 'lower_b'
  | 'fbw_a'
  | 'fbw_b'
  | 'fbw_c';

export type PlansMap = Record<PlanType, Plan[]>;

export const PLANS: PlansMap = {
  push: [
    {
      name: 'Push klasyczny',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '6-8', tip: 'Łopatki ściągnięte, mostek w górę' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Skos 30°, kontroluj ekscentryk' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '12-15', tip: 'Ścisk klatki na końcu ruchu' },
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '8-10', tip: 'Stabilny tułów, łokcie pod sztangą' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Do poziomu barków, łokcie lekko ugięte' },
        { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu przez cały ruch' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Łokcie nieruchome, kontroluj' }
      ]
    },
    {
      name: 'Push klatka górna',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 4, reps: '6-8', tip: 'Skos 30-45°, mostek w górę' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Pełen zakres ruchu' },
        { name: 'Rozpiętki na ławce skośnej', sets: 3, reps: '10-12', tip: 'Czuj rozciąganie klatki górnej' },
        { name: 'Wyciskanie arnolda', sets: 3, reps: '10-12', tip: 'Rotacja dłoni podczas ruchu' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne — do poziomu' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Rozszerz linę na końcu ruchu' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Triceps długa głowa' }
      ]
    },
    {
      name: 'Push siłowy',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 5, reps: '4-6', tip: 'Eksplozja w górę, kontrola w dół' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '6-8', tip: 'Ciężkie hantle, pełen zakres' },
        { name: 'Dipy na poręczach', sets: 3, reps: '8-12', tip: 'Pochyl tułów — klatka dolna' },
        { name: 'Wyciskanie żołnierskie', sets: 4, reps: '4-6', tip: 'Tułów napięty, sztanga w linii' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '10-12', tip: 'Płynny ruch, bez bujania' },
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '6-8', tip: 'Łokcie blisko ciała' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' }
      ]
    },
    {
      name: 'Push na rzeźbę',
      exercises: [
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '12-15', tip: 'Lekkie ciężary, perfekcyjna technika' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '12-15', tip: 'Tempo 2-1-2' },
        { name: 'Cable crossover', sets: 3, reps: '15-20', tip: 'Ścisk na końcu, krzyżuj dłonie' },
        { name: 'Wznosy hantli bokiem', sets: 4, reps: '15-20', tip: 'Barki boczne — wysoki volume' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '15-20', tip: 'Barki przednie naprzemiennie' },
        { name: 'Pushdown z liną', sets: 3, reps: '15-20', tip: 'Wykończ triceps' },
        { name: 'Cable triceps pushdown', sets: 3, reps: '15-20', tip: 'Pełen wyprost na końcu' }
      ]
    },
    {
      name: 'Push z hantlami',
      exercises: [
        { name: 'Wyciskanie hantli na ławce poziomej', sets: 3, reps: '8-10', tip: 'Pełna ścieżka, kontroluj na dole' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Skos 30°' },
        { name: 'Chest press na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja, ścisk klatki' },
        { name: 'Wyciskanie hantli nad głowę', sets: 3, reps: '8-10', tip: 'Siedząc lub stojąc' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Do poziomu barków' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' },
        { name: 'Kickback hantlem', sets: 3, reps: '12-15', tip: 'Tułów równoległy do podłogi' }
      ]
    },
    {
      name: 'Push z superseriami',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '8-10', tip: 'Superseria z rozpiętkami' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '12-15', tip: 'Bez przerwy po wyciskaniu' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '10-12', tip: 'Klatka górna' },
        { name: 'Wyciskanie żołnierskie hantlami', sets: 3, reps: '8-10', tip: 'Superseria z wznosami bokiem' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Bez przerwy po wyciskaniu' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-12', tip: 'Superseria z pushdownem' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Bez przerwy po francuskim' }
      ]
    },
    {
      name: 'Push pełna klatka',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 3, reps: '8-10', tip: 'Klatka górna' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 3, reps: '8-10', tip: 'Klatka środkowa' },
        { name: 'Dipy na poręczach', sets: 3, reps: '10-15', tip: 'Klatka dolna — pochyl tułów' },
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '8-10', tip: 'Barki przednie' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne' },
        { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '12-15', tip: 'Boczna głowa tricepsa' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Długa głowa tricepsa' }
      ]
    },
    {
      name: 'Push cable i maszyny',
      exercises: [
        { name: 'Cable crossover', sets: 3, reps: '12-15', tip: 'Ścisk klatki, skrzyżuj dłonie' },
        { name: 'Chest press na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja' },
        { name: 'Wyciskanie na suwnicy', sets: 3, reps: '10-12', tip: 'Kontrolowana trajektoria' },
        { name: 'Lateral raise na maszynie', sets: 4, reps: '12-15', tip: 'Barki boczne bez kompensacji' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '12-15', tip: 'Barki przednie naprzemiennie' },
        { name: 'Cable triceps pushdown', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu' },
        { name: 'Single arm pushdown', sets: 3, reps: '12-15', tip: 'Jednorącz — lepsza izolacja' }
      ]
    },
    {
      name: 'Push na masę',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '8-10', tip: 'Główne ćwiczenie — duży ciężar' },
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 4, reps: '8-10', tip: 'Klatka górna' },
        { name: 'Rozpiętki na maszynie', sets: 3, reps: '10-12', tip: 'Izolacja klatki' },
        { name: 'Wyciskanie żołnierskie', sets: 4, reps: '8-10', tip: 'Barki — kompletna partia' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne' },
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '8-10', tip: 'Triceps siłowo' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Wykończenie tricepsa' }
      ]
    },
    {
      name: 'Push dolna i górna klatka',
      exercises: [
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-10', tip: 'Klatka górna — skos 30°' },
        { name: 'Wyciskanie na suwnicy', sets: 3, reps: '10-12', tip: 'Stabilna trajektoria' },
        { name: 'Krzyżowanie linek dolne', sets: 3, reps: '12-15', tip: 'Klatka dolna — wyciąg dolny' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-15', tip: 'Barki boczne do poziomu' },
        { name: 'Wznosy hantli przodem', sets: 3, reps: '12-15', tip: 'Barki przednie' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-12', tip: 'Oburącz za głowę' },
        { name: 'Pushdown z liną', sets: 3, reps: '12-15', tip: 'Wykończenie' }
      ]
    }
  ],

  pull: [
    {
      name: 'Pull klasyczny',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 4, reps: '5-6', tip: 'Plecy proste, sztanga blisko ciała' },
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Ściągnij łopatki w dół' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 3, reps: '8-10', tip: 'Tułów stabilny, do brzucha' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, pełen zakres' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Łokcie wysoko, ciągnij do twarzy' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Bez bujania, kontroluj' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis — objętość ramion' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis i przedramię' }
      ]
    },
    {
      name: 'Pull bez martwego ciągu',
      exercises: [
        { name: 'Podciąganie nachwytem', sets: 4, reps: '6-10', tip: 'Broda nad drążek' },
        { name: 'Wiosłowanie sztangą', sets: 3, reps: '8-10', tip: 'Pochyl się 45°' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokim chwytem' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, kolano na ławce' },
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i rotatory' },
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Naprzemiennie, supinacja' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Supinacja i pronacja — pełne przedramię' }
      ]
    },
    {
      name: 'Pull grubość pleców',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 4, reps: '4-6', tip: 'Maksymalne ciężary' },
        { name: 'Wiosłowanie sztangą Pendlay', sets: 4, reps: '6-8', tip: 'Każde powt. z ziemi' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Skupienie na ściskaniu' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Wertykalnie — szerokość pleców' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Łokcie na poziomie barków' },
        { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '8-10', tip: 'Cięższe ciężary' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '12-15', tip: 'Neutralny chwyt — brachialis' }
      ]
    },
    {
      name: 'Pull szerokość pleców',
      exercises: [
        { name: 'Podciąganie szerokim chwytem', sets: 4, reps: '6-10', tip: 'Najszersze — główne' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Powolny ekscentryk' },
        { name: 'Wyciąg górny podchwytem', sets: 3, reps: '10-12', tip: 'Podchwyt — więcej dołu pleców' },
        { name: 'Wiosłowanie na wyciągu siedząc', sets: 3, reps: '10-12', tip: 'Horyzontalnie — grubość pleców' },
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Zdrowe barki tylne' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Klasyczne' },
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Rotacja nadgarstka na górze' }
      ]
    },
    {
      name: 'Pull z naciskiem na biceps',
      exercises: [
        { name: 'Podciąganie podchwytem wąskim', sets: 3, reps: '8-10', tip: 'Wąski chwyt — mocno biceps' },
        { name: 'Wiosłowanie sztangą wąskim chwytem', sets: 3, reps: '8-10', tip: 'Podchwyt, łokcie przy tułowiu' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokość pleców' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie, pełen zakres' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i rotatory' },
        { name: 'Uginanie ramion ze sztangą stojąc', sets: 4, reps: '8-10', tip: 'Klasyczne, bez bujania' },
        { name: 'Uginanie hantli na modlitewniku', sets: 3, reps: '10-12', tip: 'Izolacja bicepsa' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Przedramię i brachialis' }
      ]
    },
    {
      name: 'Pull siłowy',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
        { name: 'Podciąganie z obciążeniem', sets: 4, reps: '4-6', tip: 'Pas z talerzem' },
        { name: 'Wiosłowanie sztangą', sets: 4, reps: '5-6', tip: 'Cięższe ciężary' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '8-10', tip: 'Jednostronnie, dociążenie pleców' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Rotatory — zdrowie barków' },
        { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '6-8', tip: 'Cięższe ciężary' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '8-10', tip: 'Siłowo' },
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Pełna rotacja przedramienia' }
      ]
    },
    {
      name: 'Pull cable i wyciągi',
      exercises: [
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokim chwytem do klatki' },
        { name: 'Wyciąg górny podchwytem', sets: 3, reps: '10-12', tip: 'Podchwyt — biceps' },
        { name: 'Wiosłowanie na wyciągu siedząc', sets: 3, reps: '10-12', tip: 'Do brzucha' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie — uzupełnienie wyciągów' },
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Zdrowe barki' },
        { name: 'Uginanie z liną', sets: 3, reps: '12-15', tip: 'Biceps przez wyciąg' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Wykończenie brachialis' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '12-15', tip: 'Neutralny chwyt, stojąc' }
      ]
    },
    {
      name: 'Pull z superseriami',
      exercises: [
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Superseria z wiosłowaniem' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Bez przerwy po podciąganiu' },
        { name: 'Wiosłowanie sztangą', sets: 3, reps: '8-10', tip: 'Główne ćwiczenie pleców' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Wertykalnie — dobicie najszerszego' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-12', tip: 'Superseria z hantlami' },
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Bez przerwy' },
        { name: 'Uginanie zottmana', sets: 3, reps: '12-15', tip: 'Powolna rotacja — kontroluj' }
      ]
    },
    {
      name: 'Pull izolacja bicepsa',
      exercises: [
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Plecy — rozgrzewka' },
        { name: 'Wiosłowanie na maszynie', sets: 3, reps: '10-12', tip: 'Stabilna pozycja' },
        { name: 'Ściąganie drążka wyciągu górnego', sets: 3, reps: '10-12', tip: 'Szerokość pleców' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Jednostronnie — symetria pleców' },
        { name: 'Cable face pull', sets: 3, reps: '15-20', tip: 'Tylne barki i zdrowie rotatorów' },
        { name: 'Concentration curl hantlem', sets: 3, reps: '10-12', tip: 'Łokieć na udzie' },
        { name: 'Uginanie hantli na modlitewniku', sets: 3, reps: '10-12', tip: 'Długa głowa bicepsa' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-12', tip: 'Brachialis — objętość ramion' }
      ]
    },
    {
      name: 'Pull pełne plecy',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 3, reps: '5-6', tip: 'Plecy dolne' },
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '6-10', tip: 'Plecy szerokie' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 3, reps: '8-10', tip: 'Plecy środkowe' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '10-12', tip: 'Plecy — symetria jednostronna' },
        { name: 'Face pull', sets: 3, reps: '15-20', tip: 'Tylne barki — nie pomijaj!' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '8-10', tip: 'Biceps — główne' },
        { name: 'Uginanie hantli', sets: 3, reps: '10-12', tip: 'Naprzemiennie, supinacja' },
        { name: 'Uginanie zottmana', sets: 3, reps: '10-12', tip: 'Pronacja i supinacja naprzemiennie' }
      ]
    }
  ],

  legs: [
    {
      name: 'Legs klasyczny',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 4, reps: '6-8', tip: 'Sztanga na grzbiecie, biodra w dół' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy na środku platformy' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Biodra do tyłu, plecy proste' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-12', tip: 'Pełen zakres, nie szarp' },
        { name: 'Bulgarian split squat', sets: 3, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-15', tip: 'Pełna amplituda, zatrzymaj na górze' },
        { name: 'Plank', sets: 3, reps: '30-45 sek', tip: 'Ciało w linii prostej, oddychaj' }
      ]
    },
    {
      name: 'Legs z naciskiem na czworogłowy',
      exercises: [
        { name: 'Przysiad przedni', sets: 4, reps: '6-8', tip: 'Sztanga na barkach z przodu' },
        { name: 'Hack squat', sets: 3, reps: '10-12', tip: 'Stopy nisko — akcentuje czworogłowy' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring i pośladki' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '12-15', tip: 'Izolacja hamstring' },
        { name: 'Wykroki ze sztangą', sets: 3, reps: '10-12 na nogę', tip: 'Kolano nie wystaje za stopę' },
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Nogi proste, kontroluj opuszczanie' }
      ]
    },
    {
      name: 'Legs hamstring i pośladki',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 3, reps: '8-10', tip: 'Klasyczny przysiad' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy wyżej — więcej pośladków' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-8', tip: 'Hamstring — główne' },
        { name: 'Hip thrust', sets: 4, reps: '8-10', tip: 'Pośladki — ścisk na górze' },
        { name: 'Single leg hip thrust', sets: 2, reps: '10-12 na nogę', tip: 'Jednonóż — silniejsza izolacja' },
        { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Płaszczkowaty' },
        { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Aktywny core przez cały czas' }
      ]
    },
    {
      name: 'Legs siłowy',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
        { name: 'Leg press', sets: 3, reps: '6-8', tip: 'Bardzo ciężki' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '5-6', tip: 'Cięższe ciężary' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '8-10', tip: 'Kontroluj' },
        { name: 'Bulgarian split squat', sets: 3, reps: '6-8 na nogę', tip: 'Z ciężarem' },
        { name: 'Wspięcia na palce ze sztangą', sets: 3, reps: '8-10', tip: 'Łydki siłowo' },
        { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — napięty brzuch przez cały ruch' }
      ]
    },
    {
      name: 'Legs bez przysiadu',
      exercises: [
        { name: 'Leg press', sets: 4, reps: '8-12', tip: 'Bezpieczna alternatywa przysiadu' },
        { name: 'Hack squat', sets: 3, reps: '10-12', tip: 'Czworogłowy bez obciążenia kręgosłupa' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring i pośladki' },
        { name: 'Hip thrust', sets: 4, reps: '10-12', tip: 'Pośladki bez obciążenia kręgosłupa' },
        { name: 'Wykroki z hantlami', sets: 3, reps: '12-15', tip: 'Naprzemiennie w ruchu' },
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '12-15', tip: 'Łydki' },
        { name: 'Hanging leg raise', sets: 3, reps: '12-15', tip: 'Bez bujania, powoli w dół' }
      ]
    },
    {
      name: 'Legs na rzeźbę',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 3, reps: '12-15', tip: 'Lżejsze, więcej powtórzeń' },
        { name: 'Leg press', sets: 3, reps: '15-20', tip: 'Średni ciężar, tempo' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '12-15', tip: 'Tempo 2-1-2' },
        { name: 'Hip thrust', sets: 3, reps: '15-20', tip: 'Pośladki — rzeźba' },
        { name: 'Wykroki', sets: 3, reps: '15-20 na nogę', tip: 'Z hantlami w rękach' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '20-25', tip: 'Łydki — wysokie powt.' },
        { name: 'Plank', sets: 3, reps: '30-60 sek', tip: 'Biodra nie za wysoko, nie za nisko' }
      ]
    },
    {
      name: 'Legs z hip thrustem',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 3, reps: '8-10', tip: 'Klasyczny przysiad' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy wyżej — pośladki' },
        { name: 'Hip thrust', sets: 4, reps: '8-10', tip: 'Główne ćwiczenie pośladków' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '10-12', tip: 'Hamstring' },
        { name: 'Bulgarian split squat', sets: 3, reps: '10-12 na nogę', tip: 'Pochyl — więcej pośladków' },
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        { name: 'Ab wheel', sets: 3, reps: '10-12', tip: 'Kolana lub stopy — wybierz poziom' }
      ]
    },
    {
      name: 'Legs kondycyjny',
      exercises: [
        { name: 'Goblet squat', sets: 3, reps: '12-15', tip: 'Hantel pod brodą, dynamicznie' },
        { name: 'Leg press', sets: 3, reps: '15-20', tip: 'Średni ciężar, tempo' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '12-15', tip: 'Hamstring' },
        { name: 'Hip thrust', sets: 3, reps: '15-20', tip: 'Pośladki dynamicznie' },
        { name: 'Wykroki', sets: 3, reps: '15-20 na nogę', tip: 'Naprzemiennie, bez przerwy' },
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '20-30', tip: 'Łydki — kondycja' },
        { name: 'Hanging leg raise', sets: 3, reps: '10-12', tip: 'Na drążku, proste nogi do poziomu' }
      ]
    },
    {
      name: 'Legs sumo',
      exercises: [
        { name: 'Przysiad sumo', sets: 4, reps: '8-10', tip: 'Stopy szeroko, kolana śledzą stopy' },
        { name: 'Leg press', sets: 3, reps: '10-12', tip: 'Stopy szeroko — przywodziciele' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Hamstring i pośladki' },
        { name: 'Odwodzenie nóg na maszynie', sets: 3, reps: '12-15', tip: 'Przywodziciele i pośladki' },
        { name: 'Bulgarian split squat', sets: 3, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        { name: 'Wspięcia na palce stojąc', sets: 3, reps: '15-20', tip: 'Łydki' },
        { name: 'Plank', sets: 4, reps: '30-45 sek', tip: 'Seria po łydkach — dobry finisz' }
      ]
    },
    {
      name: 'Legs jednonóż',
      exercises: [
        { name: 'Bulgarian split squat', sets: 4, reps: '8-10 na nogę', tip: 'Tylna noga na ławce' },
        { name: 'Step-up', sets: 3, reps: '10-12 na nogę', tip: 'Pchaj piętą' },
        { name: 'Single leg RDL', sets: 3, reps: '10-12 na nogę', tip: 'Balans na jednej nodze' },
        { name: 'Single leg hip thrust', sets: 3, reps: '10-12 na nogę', tip: 'Ścisk pośladka' },
        { name: 'Wykroki z hantlami', sets: 3, reps: '12-15', tip: 'Naprzemiennie w ruchu' },
        { name: 'Wspięcia jednonóż', sets: 3, reps: '12-15 na nogę', tip: 'Pełen zakres łydki' },
        { name: 'Ab wheel', sets: 3, reps: '8-10', tip: 'Pełny rollout — core i biodra' }
      ]
    }
  ],

  upper_a: [
    {
      name: 'Upper A klasyczny',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '5-8', tip: 'Łopatki ściągnięte, eksplozja w górę' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '6-10', tip: 'Do brzucha, tułów stabilny' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Skos 30°, pełen zakres' },
        { name: 'Podciąganie szerokim chwytem', sets: 3, reps: '8-12', tip: 'Ściągnij łopatki w dół' },
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '6-10', tip: 'Stabilny tułów, łokcie pod sztangą' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Bez bujania, kontroluj' },
        { name: 'Wyprosty triceps na wyciągu', sets: 3, reps: '10-15', tip: 'Łokcie przy tułowiu' }
      ]
    },
    {
      name: 'Upper A siłowy',
      exercises: [
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 5, reps: '3-6', tip: 'Maksymalne ciężary, pełne skupienie' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '5-8', tip: 'Ciężko, plecy proste' },
        { name: 'Wyciskanie sztangi na ławce skośnej', sets: 3, reps: '6-8', tip: 'Klatka górna' },
        { name: 'Ściąganie drążka szerokim chwytem', sets: 3, reps: '8-10', tip: 'Lat pulldown — pełen zakres' },
        { name: 'Wyciskanie żołnierskie', sets: 4, reps: '4-6', tip: 'Tułów napięty, kontrola' },
        { name: 'Uginanie ramion ze sztangą', sets: 3, reps: '8-12', tip: 'Siłowo — biceps' },
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '6-10', tip: 'Triceps — łokcie blisko ciała' }
      ]
    },
    {
      name: 'Upper A z hantlami',
      exercises: [
        { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '8-10', tip: 'Pełna ścieżka, dotknij klatki' },
        { name: 'Wiosłowanie hantlem w opadzie', sets: 4, reps: '8-10', tip: 'Jednoręcz — lepsza izolacja' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
        { name: 'Podciąganie nachwytem', sets: 3, reps: '6-10', tip: 'Do brody, kontroluj opuszczanie' },
        { name: 'Wyciskanie hantli nad głowę', sets: 3, reps: '8-12', tip: 'Siedząc lub stojąc' },
        { name: 'Uginanie hantli naprzemiennie', sets: 3, reps: '10-15', tip: 'Supinacja na górze' },
        { name: 'Overhead triceps extension hantlem', sets: 3, reps: '10-15', tip: 'Oburącz za głowę' }
      ]
    }
  ],

  upper_b: [
    {
      name: 'Upper B klasyczny',
      exercises: [
        { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '6-10', tip: 'Pełen zakres, dłonie do siebie' },
        { name: 'Podciąganie nachwytem', sets: 4, reps: '6-10', tip: 'Szeroki chwyt, łopatki w dół' },
        { name: 'Wiosłowanie na maszynie siedzące', sets: 3, reps: '8-12', tip: 'Seated row — łokcie blisko ciała' },
        { name: 'Wyciskanie hantli siedząc nad głowę', sets: 3, reps: '8-12', tip: 'Barki — pełen zakres' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Do poziomu barków, łokcie ugięte' },
        { name: 'Uginanie hantli młotkowo', sets: 3, reps: '10-15', tip: 'Brachialis i przedramię' },
        { name: 'Pushdown z liną', sets: 3, reps: '10-15', tip: 'Rozszerz linę na końcu ruchu' }
      ]
    },
    {
      name: 'Upper B klatka górna',
      exercises: [
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 4, reps: '8-12', tip: 'Skos 30-45°, klatka górna' },
        { name: 'Ściąganie drążka szerokim chwytem', sets: 4, reps: '6-10', tip: 'Lat pulldown — szeroki chwyt' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 3, reps: '8-12', tip: 'Pełen zakres, do biodra' },
        { name: 'Wyciskanie arnolda', sets: 3, reps: '8-12', tip: 'Rotacja dłoni podczas ruchu' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Barki boczne' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Wąski chwyt — biceps krótki' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-15', tip: 'Triceps długa głowa' }
      ]
    },
    {
      name: 'Upper B cable i maszyny',
      exercises: [
        { name: 'Chest press na maszynie', sets: 4, reps: '8-12', tip: 'Stabilna pozycja, ścisk klatki' },
        { name: 'Ściąganie drążka wąskim chwytem', sets: 4, reps: '8-12', tip: 'Łokcie blisko ciała' },
        { name: 'Cable crossover', sets: 3, reps: '12-15', tip: 'Ścisk klatki, skrzyżuj dłonie' },
        { name: 'Wyciskanie hantli siedząc nad głowę', sets: 3, reps: '8-12', tip: 'Barki' },
        { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Łokcie wysoko, tylne barki' },
        { name: 'Uginanie na modlitewniku', sets: 3, reps: '10-15', tip: 'Łokieć unieruchomiony' },
        { name: 'Cable triceps pushdown', sets: 3, reps: '12-15', tip: 'Łokcie przy tułowiu' }
      ]
    }
  ],

  lower_a: [
    {
      name: 'Lower A klasyczny',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 4, reps: '5-8', tip: 'Głęboko, kolana śledzą stopy' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-10', tip: 'Hamstring — poczuj rozciąganie' },
        { name: 'Wykroki z hantlami', sets: 3, reps: '8-12', tip: 'Naprzemiennie, kolano nie za linię stopy' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Kontrolowane opuszczanie' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Pełen zakres, chwila na górze' },
        { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Nogi proste, kontroluj opuszczanie' }
      ]
    },
    {
      name: 'Lower A siłowy',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 5, reps: '3-6', tip: 'Maksymalne ciężary, pas bezpieczeństwa' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '5-8', tip: 'Ciężko, plecy proste przez cały ruch' },
        { name: 'Bulgarian split squat', sets: 3, reps: '6-8 na nogę', tip: 'Tylna noga na ławce, z ciężarem' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '8-12', tip: 'Hamstring izolacja' },
        { name: 'Wspięcia na palce ze sztangą', sets: 3, reps: '8-10', tip: 'Łydki siłowo' },
        { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — napięty brzuch' }
      ]
    },
    {
      name: 'Lower A quad dominant',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 4, reps: '6-10', tip: 'Wąski rozstaw — więcej czworogłowych' },
        { name: 'Leg press', sets: 3, reps: '8-12', tip: 'Stopy nisko i wąsko' },
        { name: 'Wyprosty nóg siedząc', sets: 3, reps: '10-15', tip: 'Izolacja czworogłowego' },
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '8-10', tip: 'Balans — dołóż hamstring' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '15-20', tip: 'Łydki — pełen zakres' },
        { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Biodra w linii, napięty brzuch' }
      ]
    }
  ],

  lower_b: [
    {
      name: 'Lower B pośladki i hamstring',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 4, reps: '3-6', tip: 'Plecy proste, sztanga blisko ciała' },
        { name: 'Front squat', sets: 4, reps: '6-10', tip: 'Łokcie wysokie, tułów pionowo' },
        { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Ścisk pośladków na górze' },
        { name: 'Wyprosty nóg siedząc', sets: 3, reps: '10-15', tip: 'Czworogłowy — wykończenie' },
        { name: 'Wspięcia na palce siedząc', sets: 4, reps: '12-20', tip: 'Płaszczkowaty — siedzenie' },
        { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Aktywny core' }
      ]
    },
    {
      name: 'Lower B hip hinge',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 3, reps: '4-6', tip: 'Siłowo — pas bezpieczeństwa' },
        { name: 'Hack squat', sets: 4, reps: '6-10', tip: 'Maszyna — czworogłowy bez kręgosłupa' },
        { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Pośladki — główne ćwiczenie Lower B' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Hamstring izolacja' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Łydki' },
        { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Core — rollout' }
      ]
    },
    {
      name: 'Lower B na maszynach',
      exercises: [
        { name: 'Leg press', sets: 4, reps: '8-12', tip: 'Stopy wysoko — więcej pośladków' },
        { name: 'Hack squat', sets: 3, reps: '8-12', tip: 'Stopy wąsko — czworogłowy' },
        { name: 'Hip thrust', sets: 4, reps: '8-12', tip: 'Ze sztangą — pośladki' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Maszyna hamstring' },
        { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Łydki na maszynie' },
        { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Na drążku' }
      ]
    }
  ],

  fbw_a: [
    {
      name: 'FBW A klasyczny',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 4, reps: '5-8', tip: 'Głęboko, kolana za palce stóp' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '5-8', tip: 'Łopatki ściągnięte' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '6-10', tip: 'Do brzucha, plecy proste' },
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '6-10', tip: 'Barki — stabilny tułów' },
        { name: 'Uginanie nóg leżąc', sets: 3, reps: '10-15', tip: 'Hamstring — kontroluj opuszczanie' },
        { name: 'Uginanie ze sztangą EZ', sets: 3, reps: '10-15', tip: 'Biceps — bez bujania' },
        { name: 'Hanging leg raise', sets: 3, reps: '10-15', tip: 'Core — nogi proste' }
      ]
    },
    {
      name: 'FBW A siłowy',
      exercises: [
        { name: 'Przysiad ze sztangą', sets: 5, reps: '3-5', tip: 'Maksymalne ciężary' },
        { name: 'Wyciskanie sztangi na ławce poziomej', sets: 4, reps: '4-6', tip: 'Eksplozja w górę' },
        { name: 'Wiosłowanie sztangą w opadzie', sets: 4, reps: '5-8', tip: 'Ciężko, kontrola' },
        { name: 'Wyciskanie żołnierskie', sets: 3, reps: '5-8', tip: 'Press siłowy' },
        { name: 'Martwy ciąg rumuński', sets: 3, reps: '6-8', tip: 'Hamstring i dolne plecy' },
        { name: 'Uginanie hantli młotkowo', sets: 2, reps: '10-12', tip: 'Brachialis' },
        { name: 'Ab wheel', sets: 3, reps: '8-12', tip: 'Rollout — core' }
      ]
    }
  ],

  fbw_b: [
    {
      name: 'FBW B pulling',
      exercises: [
        { name: 'Martwy ciąg klasyczny', sets: 3, reps: '3-5', tip: 'Plecy proste, sztanga blisko ciała' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 4, reps: '8-12', tip: 'Skos 30°, klatka górna' },
        { name: 'Podciąganie szerokim chwytem', sets: 4, reps: '6-10', tip: 'Do brody, łopatki w dół' },
        { name: 'Bulgarian split squat', sets: 3, reps: '8-12 na nogę', tip: 'Tylna noga na ławce' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Barki boczne' },
        { name: 'Wyciskanie wąskim chwytem', sets: 3, reps: '10-15', tip: 'Triceps — łokcie blisko' },
        { name: 'Plank', sets: 3, reps: '45-60 sek', tip: 'Core — napięty przez cały czas' }
      ]
    },
    {
      name: 'FBW B hantlowy',
      exercises: [
        { name: 'Martwy ciąg rumuński', sets: 4, reps: '6-10', tip: 'Hamstring i pośladki' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
        { name: 'Ściąganie drążka szerokim chwytem', sets: 4, reps: '8-12', tip: 'Lat pulldown' },
        { name: 'Wykroki z hantlami', sets: 3, reps: '10-12 na nogę', tip: 'Naprzemiennie w ruchu' },
        { name: 'Wznosy hantli bokiem', sets: 3, reps: '12-20', tip: 'Do poziomu barków' },
        { name: 'Francuskie wyciskanie sztangi', sets: 3, reps: '10-15', tip: 'Triceps długa głowa' },
        { name: 'Brzuszki na drążku', sets: 3, reps: '12-15', tip: 'Kontroluj górę i dół' }
      ]
    }
  ],

  fbw_c: [
    {
      name: 'FBW C kompletny',
      exercises: [
        { name: 'Front squat', sets: 4, reps: '6-10', tip: 'Łokcie wysokie, tułów pionowo' },
        { name: 'Wyciskanie hantli na ławce poziomej', sets: 4, reps: '6-10', tip: 'Pełen zakres, dłonie równoległe' },
        { name: 'Wiosłowanie hantlem jednoręcz', sets: 4, reps: '8-12', tip: 'Do biodra, łopatka w ruchu' },
        { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Pośladki — ścisk na górze' },
        { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Tylne barki i rotacja zewn.' },
        { name: 'Uginanie ze sztangą EZ', sets: 2, reps: '10-15', tip: 'Biceps' },
        { name: 'Wspięcia na palce stojąc', sets: 4, reps: '12-20', tip: 'Łydki — pełen zakres' }
      ]
    },
    {
      name: 'FBW C hack squat',
      exercises: [
        { name: 'Hack squat', sets: 4, reps: '8-12', tip: 'Maszyna — czworogłowy bez kręgosłupa' },
        { name: 'Wyciskanie hantli na ławce skośnej', sets: 3, reps: '8-12', tip: 'Klatka górna' },
        { name: 'Wiosłowanie na maszynie siedzące', sets: 4, reps: '8-12', tip: 'Łokcie blisko ciała' },
        { name: 'Hip thrust', sets: 3, reps: '8-12', tip: 'Ze sztangą — pośladki i hamstring' },
        { name: 'Face pull', sets: 3, reps: '12-20', tip: 'Tylne barki — zdrowe barki' },
        { name: 'Uginanie hantli naprzemiennie', sets: 2, reps: '10-15', tip: 'Biceps' },
        { name: 'Wspięcia na palce siedząc', sets: 4, reps: '15-20', tip: 'Płaszczkowaty' }
      ]
    }
  ]
};
