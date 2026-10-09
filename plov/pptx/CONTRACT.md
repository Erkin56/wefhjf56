# Контракт: PowerPoint-версия (plov.pptx)

PowerPoint-версия повторяет HTML-презентацию `plov/plov.html` (исходники `plov/src/slides/NN-*.{html,css,js}`) настолько близко, насколько позволяет PowerPoint:
иллюстрации — картинками, снятыми с HTML-версии; весь значимый текст — живым текстом PowerPoint; интерактив — анимациями по щелчкам, триггерами и звуками.
Образец — `plov/pptx/slides/01.mjs`. Сборка — `plov/pptx/build-pptx.mjs`.

## Ваши файлы
Только `plov/pptx/slides/NN.mjs` своих слайдов (и папка `plov/pptx/assets/NN/`, которую пишет захват). Не трогайте `lib/*`, `build-pptx.mjs`, `qa-states.py`, чужие слайды, HTML-исходники. Не запускайте git.
Если в общей библиотеке чего-то не хватает — обойдитесь средствами своего модуля и напишите об этом в отчёте.

## Модуль слайда
```js
import { C, F } from '../lib/deck.mjs';
export const capture = { states: [ { name, actions, enterWait, wait, css, items: [...], measure: [...] } ] };
export function build(S) { S.start({...}); ...элементы...; S.click(...); S.transition = {...}; S.notesExtra = '...'; }
```

### Захват (`capture`)
Каждое состояние: свежая загрузка HTML → переход на слайд → `enterWait` мс (по умолчанию 2600) → `actions` → `wait` мс → захват.
- `actions`: `{ next: n, each: 2600 }` (n нажатий «Далее», пауза после каждого), `{ key: 'Digit1', each }`, `{ click: '.sel', each }`, `{ eval: 'js' }`, `{ wait: ms }`.
- `items`: `{ name, sel, pad = 16, hide: ['.sel внутри'], css: 'доп. CSS', kids: true (рамка только по потомкам, если сам контейнер растянут), self: true (только сам элемент), clip: {x,y,w,h} }` → `assets/NN/name.png` (прозрачный фон, ×2) и прямоугольник в `rects.json`.
- `measure`: `{ name, sel }` → только прямоугольник (для живого текста и фигур).
- Селекторы — внутри `#sNN` (подставляется сам); абсолютный селектор начинайте с `!`.
- Захват при изоляции прячет все слайды и показывает только выбранный элемент; частицы, фон, рамка беамера и панели скрыты.
- Пересъёмка: `--capture` (или удалите `assets/NN/`).

### Элементы (`S`) — координаты в пикселях сцены 1920×1080 (PX = 1/144″), кегль в pt = px/2
- `S.start({ layout: 'CHROME'|'BLANK', eyebrow, title, section })` — первым делом. CHROME = фон + академическая рамка (шапка, подвал с разделом и номером) + плейсхолдеры: надзаголовок (y 98) и заголовок (y 136, Arial Black 32 pt, слева, до двух строк). BLANK — только фон.
- `S.img(name, { file, rect })` — картинка из захвата (по умолчанию файл и прямоугольник — по имени).
- `S.text(name, text | runs[], rect, { font: 'display'|'body'|'serif'|'hand'|'mono', size, color, bold, italic, align, valign, spacing, lineMul, rotate, fill, fillT, line, lineW, radius, shadow, pad: {l,t,r,b}, inset, wrap })` — живой текст. `rect` — имя замера или `{x,y,w,h}` в px. `runs` — массив `{ text, options: { color, bold, italic, fontFace, fontSize, breakLine, superscript, subscript } }`.
- `S.shape(name, 'rect'|'round'|'ellipse'|'line'|'triangle'|..., rect, { fill, fillT, line, lineW, dash, radius, rotate, shadow })`.
- `S.button(name, label, rect, { fill, edge, color, size })` — объёмная кнопка (как .btn в HTML).
- `S.badge(name, 'fact'|'math'|'joke'|'outline', label, {x,y}, { size = 10, w })` — бейдж «Факт / Математика / Шутка».
- `S.stamp(name, text, rect, { color, size, rot, fill, fillT, lineW })`, `S.sticker(name, text, rect, { fill, color, size, rot })`.
- `S.chart(name, 'line'|'bar'|..., data, rect, options)` — родная диаграмма pptxgenjs (тёмная тема: прозрачная область, подписи `C.muted`, сетка `'3A3E45'`, шрифт осей Consolas). Цвета — hex без «#».
- Цвета `C.*` (bg, panel, line, cream, cream2, cream3, ink, ink2, muted, gold, gold2, red, red2, red3, blue, orange, green, factGreen, white). Шрифты `F.*`: display = Arial Black, body = Calibri, serif = Cambria, hand = Segoe Print, mono = Consolas.
- **Ширина текста.** Arial Black широкий: закладывайте ≈ символы × кегль(pt) × 1,6 px на строку заглавными (×1,45 строчными). Берите прямоугольник из `measure` и расширяйте `pad: { r: … }`. Никакой текст не должен обрезаться или налезать.
- Имена (`name`) уникальны в пределах слайда: по ним строятся анимации.

### Анимации
- `S.auto(...effects)` — при открытии слайда; `S.click(...effects)` — один щелчок/нажатие кликера (вызывайте по разу на шаг); `S.trigger('имяФигуры', ...effects)` — щелчок мышью по фигуре.
- effect = `{ t: 'name', fx, delay = 0, dur = 500, sound, ... }` — все эффекты щелчка стартуют вместе, порядок задаётся `delay` (мс).
- Вход: `appear fade zoom pop(over) slam(from) drop flyTop flyBottom flyLeft flyRight wipeLeft wipeRight wipeUp wipeDown expandX riseUp`.
- Выход: `hide fadeOut zoomOut collapseX flyOutTop flyOutBottom flyOutLeft flyOutRight sinkDown`.
- Выделение: `pulse(by, repeat)` `grow(by)` `spin(deg, repeat)` `teeter(deg)` `shake(amp)` `float(amp)` `heartbeat(by)` (бесконечный пульс).
- Путь: `move` c `path: 'M 0 0 L 0.12 0 E'` (доли ширины/высоты слайда), `autoRev`, `repeat`.
- Фигура с эффектом входа скрыта до него. Смена состояния картинки = выход старой + вход новой в одном щелчке (обычно `fadeOut`/`fade` с одинаковой задержкой).
- «Переворот карточки»: `collapseX` (200–250 мс) у лица и `expandX` с задержкой у оборота.
- Звуки (`sound`): click tick pop plop boing stamp ding whoosh swoosh tada fail alarm drumroll coin gulp sparkle.
- Переход к слайду: `S.transition = { kind: 'fade'|'push'|'wipe'|'zoom'|'cover'|'split'|'circle'|'dissolve', dir, spd: 'fast'|'med'|'slow' }`.
- Заметки докладчика берутся из HTML автоматически; добавьте `S.notesExtra` — короткая инструкция, что и куда щёлкать в PowerPoint.

## Принципы
- Шаги щелчков повторяют путь «Далее» HTML-слайда (те же такты, тот же порядок, похожие тайминги и звуки).
- Все надписи из задания клиента (см. `plov/CONTRACT.md` и HTML) — живым текстом PowerPoint, дословно, без ошибок. Иллюстрации, сложные приборы, декоративные элементы — картинками из захвата.
- Факты / математика / шутки помечены бейджами так же, как в HTML.
- Минимум текста, крупно; ничего не налезает на шапку (y < 64) и подвал (y > 1020) на CHROME-слайдах.

## Проверка (обязательна)
```bash
SK=$(ls -d /root/.claude/skills/synced/*/pptx)
node plov/pptx/build-pptx.mjs --only NN --out /tmp/pptx-NN/deck.pptx            # добавьте --capture для пересъёмки
python3 $SK/scripts/office/validate.py /tmp/pptx-NN/deck.pptx                     # должно быть «All validations PASSED!»
python3 plov/pptx/qa-states.py /tmp/pptx-NN/deck.pptx /tmp/pptx-NN/deck.anims.json /tmp/pptx-NN/qa $SK/scripts/office/soffice.py --dpi 96
```
`qa-states.py` рендерит состояние после каждого щелчка (`s01-k0.jpg` … `s01-kN.jpg`) и после каждого триггера (`s01-t1.jpg` …). Посмотрите каждый кадр (Read).
Рендер делает LibreOffice с подменой шрифтов (Arial Black → Unbounded, Segoe Print → Caveat, Consolas → JetBrains Mono): ширины близки к настоящим, но оставляйте запас ~10 %.
Движение по пути и выделение в рендере не видны — проверяйте их логику по коду.
