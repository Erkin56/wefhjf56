# -*- coding: utf-8 -*-
"""Раздел «Глагол + падеж»."""

CASES = [
    ("section", "ГЛАГОЛ + ПАДЕЖ", "Управление — это часть значения глагола", 19.0),
    ("p", "Падеж при турецком глаголе движения нельзя вывести из русского перевода. "
          "«Сесть в автобус» — по-русски винительный, по-турецки дательный. "
          "«Выйти из автобуса» — по-русски родительный, по-турецки исходный. "
          "Поэтому глагол нужно учить <b>вместе с окончанием</b>, одним куском."),
    ("band", "ЧЕТЫРЕ ОКОНЧАНИЯ, КОТОРЫЕ РЕШАЮТ ВСЁ",
     "-E / -A — дательный: куда, к кому\n"
     "-DEN / -DAN — исходный: откуда, от кого, через что\n"
     "-DE / -DA — местный: где\n"
     "-İ / -I / -U / -Ü — винительный: что именно (пересечь, осмотреть)"),
    ("h2", "Движение к цели: дательный падеж"),
    ("table", ["Модель", "Перевод", "Пример"],
     [["bir yer<b>e</b> gitmek", "идти куда-либо", "Okula gidiyorum."],
      ["bir yer<b>e</b> gelmek", "приходить куда-либо", "Eve geliyorum."],
      ["bir yer<b>e</b> getirmek", "приносить куда-либо", "Buraya getir."],
      ["bir yer<b>e</b> götürmek", "относить куда-либо", "Okula götür."],
      ["bir yer<b>e</b> girmek", "входить куда-либо", "Eve girdim."],
      ["bir şey<b>e</b> binmek", "садиться на транспорт", "Otobüse bindim."],
      ["bir yer<b>e</b> dönmek", "возвращаться куда-либо", "Eve döndüm."],
      ["bir yer<b>e</b> çıkmak", "подниматься куда-либо", "Üçüncü kata çıktım."],
      ["bir yer<b>e</b> varmak", "прибывать куда-либо", "İstanbul'a vardık."],
      ["bir yer<b>e</b> ulaşmak", "добираться куда-либо", "Havaalanına ulaştım."],
      ["bir yer<b>e</b> yaklaşmak", "приближаться к чему-либо", "Eve yaklaşıyoruz."],
      ["bir yer<b>e</b> taşınmak", "переезжать куда-либо", "İstanbul'a taşındım."],
      ["sağ<b>a</b> / sol<b>a</b> dönmek", "поворачивать направо / налево", "Sağa dön."]],
     [0.30, 0.33, 0.37], {"tr_cols": (0, 2)}),
    ("h2", "Движение от источника: исходный падеж"),
    ("table", ["Модель", "Перевод", "Пример"],
     [["bir yer<b>den</b> gelmek", "приходить откуда-либо", "İşten geliyorum."],
      ["bir yer<b>den</b> çıkmak", "выходить откуда-либо", "Evden çıktım."],
      ["bir şey<b>den</b> inmek", "выходить из транспорта", "Otobüsten indim."],
      ["bir yer<b>den</b> dönmek", "возвращаться откуда-либо", "Tatilden döndüm."],
      ["bir yer<b>den</b> ayrılmak", "покидать место", "Otelden ayrıldık."],
      ["bir yer<b>den</b> uzaklaşmak", "удаляться от чего-либо", "Kıyıdan uzaklaştık."],
      ["bir yer<b>den</b> kaçmak", "убегать откуда-либо", "Evden kaçtı."],
      ["bir yer<b>den</b> geçmek", "проходить мимо / через", "Köprüden geçtik."],
      ["bir yer<b>den</b> almak", "забирать откуда-либо", "Okuldan aldım."],
      ["bir yer<b>den</b> bir yer<b>e</b> uçmak", "лететь откуда куда",
       "İzmir'den Ankara'ya uçtum."]],
     [0.33, 0.31, 0.36], {"tr_cols": (0, 2)}),
    ("h2", "Место и объект: местный и винительный"),
    ("table", ["Модель", "Перевод", "Пример"],
     [["bir yer<b>de</b> inmek", "выходить (на остановке)", "Durakta ineceğim."],
      ["bir yer<b>de</b> yürümek", "ходить где-либо", "Parkta yürüdük."],
      ["bir yer<b>de</b> dolaşmak", "бродить где-либо", "Sokaklarda dolaştık."],
      ["bir yer<b>de</b> gezmek", "гулять где-либо", "Parkta geziyoruz."],
      ["bir yer<b>i</b> geçmek", "пересекать что-либо", "Caddeyi geçtim."],
      ["bir yer<b>i</b> gezmek", "осматривать что-либо", "İstanbul'u gezdik."],
      ["bir yer<b>i</b> dolaşmak", "обходить что-либо", "Mağazaları dolaştım."],
      ["bir şey<b>i</b> getirmek", "приносить что-либо", "Kitabı getirdim."],
      ["bir şey<b>i</b> götürmek", "уносить что-либо", "Çantayı götürdü."],
      ["araba sürmek", "водить машину", "Araba sürmeyi biliyorum."]],
     [0.31, 0.32, 0.37], {"tr_cols": (0, 2)}),
    ("warn", "ПРОВЕРЯЙТЕ УПРАВЛЕНИЕ, А НЕ ПЕРЕВОД",
     "Русский перевод не подсказывает турецкий падеж. "
     "«Подняться на третий этаж» — üçüncü katA çıkmak (дательный), "
     "но «подняться по лестнице» — merdivenlerDEN çıkmak (исходный): "
     "этаж — это цель, а лестница — путь."),
]
