# -*- coding: utf-8 -*-
"""50 заданий «Проверь себя» и ответы."""

A = [  # 1-9: gelmek или gitmek
 "Anne çağırıyor. — ____! (geliyorum / gidiyorum)",
 "Yarın sana ____. (geliyorum / gidiyorum)",
 "Her sabah işe ____. (geliyorum / gidiyorum)",
 "Buraya ____! (gel / git)",
 "Oraya ____, orası tehlikeli. (gelme / gitme)",
 "Partide olacağım. Sen de ____ musun? (geliyor / gidiyor)",
 "Ben artık ____, hoşça kal. (geliyorum / gidiyorum)",
 "— Nereden ____? — İşten. (geliyorsun / gidiyorsun)",
 "Sen git, ben sonra ____. (gelirim / giderim)",
]

B = [  # 10-16: getirmek или götürmek
 "Bana bir bardak su ____. (getir / götür)",
 "Bu kitabı kütüphaneye ____. (getir / götür)",
 "Çocuğu buraya ____. (getir / götür)",
 "Çocuğu okula ben ____. (getiriyorum / götürüyorum)",
 "Misafirliğe giderken pasta ____. (getirdik / götürdük)",
 "Evrakları müdüre ____, lütfen. (getir / götür)",
 "Yukarıdan havlu ____ misin? (getirir / götürür)",
]

C = [  # 17-26: падеж
 "Otobüs____ bindim. (-e / -ten)",
 "Otobüs____ indim. (-e / -ten)",
 "Ev____ girdim. (-e / -den)",
 "Ev____ çıktım. (-e / -den)",
 "Üçüncü kat____ çıktım. (-a / -tan)",
 "Merdivenler____ indik. (-e / -den)",
 "Cadde____ geçtim. (-yi / -den)",
 "Yanım____ geçti. (-ı / -dan)",
 "İstanbul____ taşındık. (-a / -dan)",
 "Otel____ ayrıldık. (-e / -den)",
]

D = [  # 27-36: вставьте нужный глагол
 "Uçak Antalya'ya ____. (приземлился)",
 "Sokaklarda iki saat ____. (мы бродили)",
 "Bütün gün İstanbul'u ____. (мы осматривали)",
 "Köşeden sağa ____. (поверните)",
 "Eve saat yedide ____. (я вернулся)",
 "Havaalanına nasıl ____? (я могу добраться)",
 "Otobüs durağa ____. (подъехал)",
 "Gemi limandan ____. (отошёл)",
 "Köpek bahçeden ____. (убежала)",
 "Saat dokuzda İstanbul'a ____. (мы прибыли)",
]

E = [  # 37-42: исправьте ошибку
 "Otobüsten bindim.",
 "Evden girdim.",
 "Caddeden geçtim.",
 "İstanbul'a gezdim.",
 "Ben okula gitiyorum.",
 "Otobüsü kaçtım.",
]

F = [  # 43-46: переведите на турецкий
 "Принеси мне воды.",
 "Я выйду на следующей остановке.",
 "Отвези меня в аэропорт, пожалуйста.",
 "Мы переезжаем в новый дом.",
]

G = [  # 47-50: по рисунку
 "Схема A: какой глагол описывает это движение?",
 "Схема B: какой глагол описывает это движение?",
 "Схема C: какой глагол нужен, если предмет несут?",
 "Схема D: какой глагол и какой падеж нужен для автобуса?",
]

ANSWERS = [
 "Geliyorum!", "sana geliyorum", "işe gidiyorum", "Buraya gel!", "Oraya gitme",
 "geliyor musun", "gidiyorum", "Nereden geliyorsun?", "ben sonra gelirim",
 "getir", "götür", "getir", "götürüyorum", "götürdük", "götür", "getirir",
 "otobüse bindim", "otobüsten indim", "eve girdim", "evden çıktım",
 "üçüncü kata çıktım", "merdivenlerden indik", "caddeyi geçtim",
 "yanımdan geçti", "İstanbul'a taşındık", "otelden ayrıldık",
 "indi", "dolaştık", "gezdik", "dönün", "döndüm", "ulaşabilirim",
 "yaklaştı", "uzaklaştı", "kaçtı", "vardık",
 "Otobüse bindim.", "Eve girdim.", "Caddeyi geçtim.", "İstanbul'u gezdim.",
 "Ben okula gidiyorum.", "Otobüsü kaçırdım.",
 "Bana su getir.", "Bir sonraki durakta ineceğim.",
 "Beni havaalanına götür, lütfen.", "Yeni bir eve taşınıyoruz.",
 "gelmek (движение к точке отсчёта)", "gitmek (движение от точки отсчёта)",
 "getirmek (предмет движется к точке отсчёта)",
 "inmek, исходный падеж: otobüsten inmek",
]

assert len(A + B + C + D + E + F + G) == 50
assert len(ANSWERS) == 50

EXERCISES = [
    ("section", "ПРОВЕРЬ СЕБЯ", "50 заданий. Ответы — в конце раздела", 19.0),
    ("p", "Не подглядывайте в ответы сразу. Если сомневаетесь, "
          "сначала нарисуйте стрелку: кто движется, откуда и куда."),
    ("h3", "Задания 1–9  ·  gelmek или gitmek"),
    ("q", A, 1),
    ("h3", "Задания 10–16  ·  getirmek или götürmek"),
    ("q", B, 10),
    ("h3", "Задания 17–26  ·  выберите падеж"),
    ("q", C, 17),
    ("h3", "Задания 27–36  ·  вставьте нужный глагол"),
    ("q", D, 27),
    ("h3", "Задания 37–42  ·  исправьте ошибку"),
    ("q", E, 37),
    ("h3", "Задания 43–46  ·  переведите на турецкий"),
    ("q", F, 43),
    ("h3", "Задания 47–50  ·  определите движение по схеме"),
    ("fig", "quiz_dir"),
    ("q", G, 47),
    ("sp", 6),
    ("band", "ПЕРЕД ТЕМ КАК СМОТРЕТЬ ОТВЕТЫ",
     "Пройдитесь по заданиям ещё раз и для каждого нарисуйте стрелку: "
     "кто движется, откуда, куда и по отношению к кому. "
     "Если стрелка получилась, глагол почти всегда подставляется сам."),
]

ANSWERS_BLOCK = [
    ("section", "ОТВЕТЫ", "Задания 1–50", 19.0),
    ("ans", ANSWERS, 1, 2),
    ("note", "Если ошиблись",
     "Вернитесь к главе, где разбирается нужный глагол, и ещё раз посмотрите "
     "на схему. В девяти случаях из десяти ошибка возникает не из-за слова, "
     "а из-за того, что стрелка была повёрнута не в ту сторону."),
]
