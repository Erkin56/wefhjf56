# Контракт для авторов слайдов

Презентация «Плов как бесконечный ряд: математическая модель узбекского гостеприимства».
Один автономный HTML-файл (`plov/plov.html`), собирается из `plov/src` скриптом `node plov/tools/build.mjs`.
Работает офлайн: никаких внешних URL (шрифты уже встроены base64, библиотек нет).

## Файлы слайда

Каждый слайд — три файла в `plov/src/slides/` с префиксом номера: `NN-имя.html`, `NN-имя.css`, `NN-имя.js`.
Трогайте **только свои файлы**. `core.css`, `core.js`, `chart.js`, `art.js`, `template.html`, `build.mjs` — общие, их не меняем
(если чего-то не хватает — сделайте локально в своём слайде и напишите об этом в отчёте).

### HTML
```html
<section class="slide" id="sNN" data-id="NN" data-title="Короткое имя" data-section="Раздел" data-time="1:10–1:50">
  ...контент...
  <aside class="notes">
    <p><span class="cue">1:10</span> <span class="say">Реплика докладчика.</span></p>
    <p><span class="cue">НАЖАТЬ</span> «НЕТ, СПАСИБО» (или →) — бабушка добавляет плов.</p>
    <p class="tip">Подсказка/пауза на смех.</p>
  </aside>
</section>
```
- `data-chrome="off"` скрывает академическую рамку (шапка «Антинаучная конференция…» и подвал «Эркинбой | раздел | NN / 10»). На обычных слайдах рамку оставляем — это пародия на beamer.
- Сцена 1920×1080, внутренние поля: сверху 104px, снизу 96px, по бокам 110px (`--pad-top/--pad-bottom/--pad-x`). Шапка занимает y 0–64, подвал y 1020–1080: туда контент не ставим.
- Появление при входе: атрибут `data-in` (`""`=снизу, `pop`, `left`, `right`, `fade`, `drop`) + `style="--d:300"` (задержка, мс).
  **Важно:** `data-in` держит анимацию с `fill-mode: both`. Нельзя потом менять `opacity/transform/animation` у того же элемента — он исчезнет или «застынет». Оборачивайте: `data-in` на обёртке, а классы/анимации — на вложенном элементе.
- Скрытые до события элементы: класс `.reveal` (или `.reveal reveal--pop`) → добавить `.is-shown`.

### CSS
- Все селекторы начинаются с `#sNN` (изоляция). Ключевые кадры называйте `sNN-…`.
- Цвета только через токены: `--bg --bg-2 --panel --line --cream --cream-2 --cream-3 --ink --ink-2 --muted --gold --gold-2 --red --red-2 --red-3 --blue --orange --rice --carrot --cobalt --turq`.
- Шрифты: `--f-display` (Unbounded — крупные заголовки, кнопки), `--f-body` (Manrope — текст), `--f-serif` (PT Serif — формулы, «академичное»), `--f-hand` (Caveat — рукописные пометки), `--f-mono` (JetBrains Mono — счётчики).
  В Caveat и PT Serif нет стрелок (→ ↓) — рисуйте стрелки SVG. В Unbounded нет ∞ ∑ √ — для математики берите `.math` (PT Serif).
- Минимум текста. Кегли: заголовок слайда `.h1` (76px), подзаголовки `.h2` (46px), основной текст ≥ 30px, сноски ≥ 20px. Проектор не прощает мелочь.

### JS
```js
Deck.register('NN', {
  init(api)  { /* один раз при загрузке: вставить SVG, повесить обработчики. Без таймеров. */ },
  enter(api, { first }) { /* при каждом входе на слайд: вступительные анимации */ },
  leave(api) { /* при уходе */ },
  next(api)  { /* «Далее» (→/PageDown/пробел/кликер). Выполнить СЛЕДУЮЩЕЕ интерактивное действие и вернуть true; если всё уже сделано — вернуть false (тогда откроется следующий слайд). */ },
  progress(api) { return { done: 1, total: 3 }; }, // точки шагов в подвале
  keys: { Digit1(api) {...}, Digit2(api) {...} },   // клавиши 1/2/3 для кнопок выбора (Numpad тоже работает)
});
```
- `api.el` — `<section>`, `api.$('.x')`, `api.$$('.x')`, `api.state` — состояние слайда.
- Таймеры **только** через `api.timeout(fn, ms)`, `api.interval(fn, ms)`, `api.raf(fn)`, `await api.wait(ms)` — их чистит перезапуск слайда (клавиша R восстанавливает исходный HTML и заново вызывает init+enter).
- После изменения состояния, влияющего на `progress`, вызовите `api.updateSteps()`.
- Каждая кнопка на слайде должна работать мышью; `next()` должен проходить те же шаги без мыши (для кликера). Мышь и `next()` используют одну функцию-действие.
- Звуки: `api.sfx('pop'|'plop'|'boing'|'stamp'|'ding'|'whoosh'|'swoosh'|'tada'|'fail'|'alarm'|'drumroll'|'coin'|'gulp'|'tick'|'sparkle'|'click')`.
- Частицы: `FX.at(el, 'plov'|'rice'|'confetti', {count, power, spread, angle})`, `FX.plov({x,y,...})` (координаты сцены), `FX.confetti()`, `FX.shakeStage()`, `FX.replay(el, 'класс')` — перезапуск CSS-анимации.
- Числа: `Fmt.num(1.4286, 2)` → «1,43» (десятичная запятая, неразрывные пробелы в тысячах), `Fmt.int(616000)` → «616 000», `Fmt.portions(n)` → «1 порция / 3 порции / 5 порций / 1,43 порции», `Fmt.plural(n, ['порция','порции','порций'])`.
- Анимация чисел: `Tween.num(from, to, ms, v => ..., ease.outCubic)` → Promise. Есть `clamp`, `lerp`, `ease.*`.

## Иллюстрации (`Art`, возвращают строку SVG; SVG растягивается на ширину контейнера)
- `Art.researcher({mood})` — Эркинбой в костюме, тюбетейке (дўппи) и очках, с указкой и блокнотом «n = 1». mood: `serious | smug | shock | happy | proud`. Указка: атрибут `data-point="up"|"down"` на SVG.
- `Art.grandma({variant:'uz'|'ru', mood, holding:'plate'|'pirozhki'|'none', amount})` — узбекская бабушка (белый платок, платье из хан-атласа, жилет) или русская (платок в цветочек, очки, фартук). mood: `kind | happy | determined | worried | shock | proud`.
- `Art.guest({mood, full})` — гость-студент в худи. mood: `neutral | polite | surprised | shock | panic | full | happy | dizzy`. Сытость: CSS-переменная `--full` (0…1+) на SVG: `svg.style.setProperty('--full', .6)` — живот плавно растёт.
- `Art.plate({w, amount})` — риштанский ляган с горкой плова; `Art.kazan({w, steam, fire, amount})` — казан с пловом, паром и огнём.
  Количество плова: `Art.setAmount(svgEl, amount, ms)` (Promise) — горка плавно растёт/уменьшается (1 = обычная порция).
- `Art.plovMound({w,h,seed})` — горка плова для своих SVG (основание на y=0), `Art.kapgir()` — капгир (шумовка для плова), `Art.teapot()` — чайник «пахта», `Art.piala()`, `Art.non()` — лепёшка.
- `Art.mood(el, 'shock')` — сменить выражение лица.
- Карта: `Art.UZ_OUTLINE`, `Art.UZ_CITIES` (15 городов, у Ташкента `capital:true`), `Art.uzProjection(w,h,pad)` → `(lon,lat)=>[x,y]`, `Art.uzOutlinePath(proj)`.
- Общие `<defs>`: паттерны `#p-rice #p-atlas #p-dots #p-flowers #p-cotton`, градиенты `#g-gold #g-kazan #g-mound #g-flame`, фильтры `#f-stamp #f-glow #f-soft` — можно ссылаться `url(#p-atlas)` из любого SVG.
- Стиль своих рисунков: плоская заливка, контур `#1b1814` 4–5px, `stroke-linejoin: round`.

## Графики (`Plot`, SVG)
```js
const p = new Plot(api.$('.chart'), { width: 1100, height: 620, x: [0, 20], y: [0, 2],
  xTicks: [0,5,10,15,20], yTicks: [0,.5,1,1.5,2], xLabel: 'n', yLabel: '<tspan font-style="italic">P</tspan><tspan baseline-shift="sub" font-size="22">n</tspan>' });
p.series('plate', { color: 'var(--blue)', dots: true, revealAll: false }).data(points); // points = [[x,y],...]
p.reveal('plate', 7.5);  p.animateReveal('plate', 20, 900);   // дробная дорисовка
p.hline('lim', 10/7, { label: '10/7 ≈ 1,43', color: 'var(--gold)' });
p.marker('m', x, y, 'текст');  p.setDomain({ y: [0, 50] }, 600);  // плавный перемасштаб
```
Стили серий/подписей настраивайте в своём CSS (`#sNN .plot .pg-...`).

## Компоненты (core.css)
`.btn` (золотая объёмная), `.btn--red`, `.btn--cream`, `.btn--ghost`, `.btn--xl`, `.btn--sm`, `.btn--pulse`, `<span class="key">1</span>` внутри кнопки — подсказка клавиши;
`.card` (кремовый блок, тёмный текст), `.card--dark`; `.badge badge--fact|--math|--joke|--outline`;
`.stamp` (+`--gold --cream --green`, поворот `style="--rot:-8deg"`, удар — класс `.is-slam`); `.sticker` (+`--gold --red`); `.bubble` (+`--right --top --red --gold`);
`.counter` + `.counter-label`; `.range` (большой ползунок; заливка трека — CSS-переменная `--fill: 40%` на самом input); `.eyebrow`, `.h-display`, `.h1`, `.h2`, `.lead`, `.hand`, `.math` (внутри `<var>`, `<sub>`, `<sup>`), `.footnote`.
Анимации-классы: `.anim-float`, `.anim-wobble`, `.anim-shake`, `.anim-jelly`; ключевые кадры `in-pop`, `jelly`, `shake`, `wobble`, `float`, `stamp-slam`, `steam`, `spin`.

## Наука vs шутка (обязательно)
- Реальные факты — бейдж `.badge--fact` («Факт»). Пример: «Культура и традиции плова» внесены ЮНЕСКО в Репрезентативный список нематериального культурного наследия человечества в 2016 году.
- Корректная математика — бейдж `.badge--math` («Математика»).
- Шуточные утверждения/модели — бейдж `.badge--joke` («Шутка» / «Шуточная модель»).
- Никаких выдуманных источников, «исследований», процентов опросов, логотипов организаций и QR-кодов. Стереотипы из слайда 2 — это гипотезы, а не результаты опроса.
- Юмор добрый, без унизительных стереотипов. Бабушка — заботливая, а не агрессивная. Никакого принуждения — только театральная забота.

## Русский язык
- Только русский (узбекские слова — редкие акценты с переводом: «Rahmat» = «спасибо», «Oling, oling!» = «Берите, берите!», «osh» = плов).
- Кавычки-ёлочки «…», внутри — „…“. Тире — длинное «—» с пробелами; диапазоны — «–» без пробелов (1:10–1:50). Буква «ё» там, где она есть (ещё, её, расходится не меняется). Десятичная запятая: 0,3; 1,43.
- Числа с единицами — через `Fmt.portions`, чтобы склонение было верным.
- Неразрывный пробел (`&nbsp;`) после коротких предлогов в крупных заголовках, если перенос выглядит плохо.

## Проверка (обязательна перед завершением)
```bash
# собрать СВОЮ копию (не трогаем общий plov/plov.html, чтобы не мешать параллельным авторам):
node plov/tools/build.mjs --out /tmp/plov-NN/deck.html
# скриншоты + сценарий; после каждого действия — кадр:
node plov/tools/shoot.mjs --file /tmp/plov-NN/deck.html --slide NN --out /tmp/plov-NN/shots --size 1920x1080 \
  --do "click #sNN .my-button; next; next; key Digit1; range #sNN .range 12; wait 500; shot"
```
- Смотрите каждый PNG (Read). Проверьте: ничего не обрезано и не наезжает, текст читаем, анимации завершаются в правильном состоянии, шапка/подвал не перекрыты, нет ошибок консоли (скрипт печатает их и выходит с кодом 1).
- Проверьте и мышь (`click`), и `next` (кликер), и клавишу `R` (перезапуск слайда: `key KeyR`), и повторный вход на слайд (`prev; next` после ухода).
- Таймер слайда короткий (см. `data-time`): взаимодействие с залом — несколько секунд, анимации — до 1,5–2 с на шаг.
