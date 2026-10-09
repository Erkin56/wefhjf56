# -*- coding: utf-8 -*-
"""Раздел «НЕ ПУТАЙ»: восемь самых опасных пар."""

def _blk(n, title, fig, formula, examples, error):
    out = [("h2", "%d.  %s" % (n, title)), ("fig", fig)]
    if formula:
        out.append(("band", "ФОРМУЛА", formula))
    out.append(("ex", examples))
    out.append(("warn", "ТИПИЧНАЯ ОШИБКА", error))
    return out


COMPARE = [
    ("section", "НЕ ПУТАЙ", "Восемь пар, на которых спотыкаются чаще всего", 19.0),
    ("p", "Этот раздел — концентрат книги. Для каждой пары здесь есть схема, "
          "короткая формула, несколько примеров и одна ошибка, "
          "которую русскоязычные делают регулярно. "
          "Листайте его перед разговором — он работает как разминка."),
    ("sp", 4),
]

COMPARE += _blk(1, "GELMEK ↔ GİTMEK", "nc1",
    "gelmek — движение К точке отсчёта  ·  gitmek — движение ОТ точки отсчёта",
    [("Ali buraya geliyor.", "Али идёт сюда."),
     ("Ali okula gidiyor.", "Али идёт в школу."),
     ("— Ayşe! — Geliyorum!", "— Айше! — Иду!"),
     ("Ben gidiyorum, hoşça kal.", "Я ухожу, пока.")],
    "«Иду!» в ответ на зов — это Geliyorum!, а не Gidiyorum! "
    "Сказав Gidiyorum, вы сообщаете, что уходите совсем.")


COMPARE += _blk(2, "GETİRMEK ↔ GÖTÜRMEK", "nc2",
    "getirmek — предмет движется КО МНЕ  ·  götürmek — предмет движется ОТ МЕНЯ",
    [("Bana su getir.", "Принеси мне воды."),
     ("Bu kitabı okula götür.", "Отнеси эту книгу в школу."),
     ("Çocuğu buraya getir.", "Приведи ребёнка сюда."),
     ("Çocuğu okula götürüyorum.", "Я отвожу ребёнка в школу.")],
    "«Отнеси это домой» — Bunu eve götür, а не getir. "
    "Getir вы говорите только тогда, когда предмет должен оказаться у вас.")


COMPARE += _blk(3, "GİRMEK ↔ ÇIKMAK", "nc3",
    "bir yerE girmek — внутрь  ·  bir yerDEN çıkmak — наружу",
    [("Eve girdim.", "Я вошёл в дом."),
     ("Evden çıktım.", "Я вышел из дома."),
     ("İçeri gir.", "Заходи внутрь."),
     ("Dışarı çık.", "Выйди наружу.")],
    "Evden girdim и eve çıktım — обе фразы неверны. "
    "Girmek всегда идёт с дательным (-E), çıkmak — с исходным (-DEN).")


COMPARE += _blk(4, "BİNMEK ↔ İNMEK", "nc4",
    "bir şeyE binmek — сесть в транспорт  ·  bir şeyDEN inmek — выйти из транспорта",
    [("Otobüse bindim.", "Я сел в автобус."),
     ("Otobüsten indim.", "Я вышел из автобуса."),
     ("Taksiye binelim.", "Давай сядем в такси."),
     ("Bir sonraki durakta ineceğim.", "Я выйду на следующей остановке.")],
    "Otobüsten bindim — частая и очень заметная ошибка. "
    "Садятся всегда «в» (-E), выходят всегда «из» (-DEN).")


COMPARE += _blk(5, "GELMEK ↔ DÖNMEK", "nc5",
    "gelmek — прибыть в точку отсчёта  ·  dönmek — вернуться в исходную точку",
    [("Eve geldim.", "Я пришёл домой."),
     ("Eve döndüm.", "Я вернулся домой."),
     ("Tatilden döndük.", "Мы вернулись из отпуска."),
     ("Ne zaman döneceksin?", "Когда ты вернёшься?")],
    "Если вы просто пришли в гости впервые, говорить döndüm нельзя: "
    "dönmek предполагает, что вы уже были там раньше и теперь возвращаетесь.")


COMPARE += _blk(6, "GİTMEK ↔ YÜRÜMEK", "nc6",
    "gitmek отвечает на вопрос КУДА  ·  yürümek — на вопрос КАК",
    [("Okula gidiyorum.", "Я иду (еду) в школу."),
     ("Okula yürüyerek gidiyorum.", "Я иду в школу пешком."),
     ("Her gün yarım saat yürüyorum.", "Я каждый день хожу полчаса."),
     ("Parkta yürüdük.", "Мы гуляли в парке.")],
    "Русское «идти» нельзя автоматически переводить как yürümek. "
    "Если важно направление, нужен gitmek; yürümek отвечает на вопрос «как».")


COMPARE += _blk(7, "VARMAK ↔ GELMEK", "nc7",
    "gelmek — движение к точке отсчёта  ·  varmak — факт окончания пути",
    [("Ali eve geldi.", "Али пришёл домой."),
     ("Ali eve vardı.", "Али добрался до дома."),
     ("Saat kaçta varıyoruz?", "Во сколько мы прибываем?"),
     ("Ne zaman geleceksin?", "Когда ты придёшь?")],
    "Varmak не используют, когда важна точка отсчёта говорящего. "
    "На вопрос «Ты скоро придёшь ко мне?» отвечают geliyorum, а не varıyorum.")


COMPARE += [
    ("h2", "8.  GEZMEK ↔ DOLAŞMAK ↔ YÜRÜMEK"),
    ("fig", "gez_dolas_yuru"),
    ("band", "ФОРМУЛА",
     "gezmek — осматривать место  ·  dolaşmak — перемещаться по территории  ·  "
     "yürümek — идти ногами"),
    ("ex", [("İstanbul'u gezdik.", "Мы осмотрели Стамбул."),
            ("Sokaklarda dolaştık.", "Мы бродили по улицам."),
            ("Yarım saat yürüdük.", "Мы шли полчаса."),
            ("Hafta sonu gezmeye gidelim.", "Давай в выходные пойдём погуляем.")]),
    ("warn", "ТИПИЧНАЯ ОШИБКА",
     "Эти три глагола не синонимы. Gezmek — осматривать место, "
     "dolaşmak — перемещаться по территории без маршрута, "
     "yürümek — идти ногами. «Мы гуляли по городу» чаще всего şehri gezdik."),
]
