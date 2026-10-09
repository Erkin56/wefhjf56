// Слайд 9. Мини-игра «Попробуй сбежать» (3:55–4:30).
// Три отговорки А/Б/В — ТРИГГЕРЫ (щелчок мышью по кнопке, в любом порядке): гость идёт к двери и обратно (путь),
// бабушка отвечает репликой, на столе появляется её «аргумент» (чай с пиалой / будильник и ещё тарелка /
// плов прямо на диссертации), на отговорку падает печать «ПОПЫТКА НЕ УДАЛАСЬ» с грустным тромбоном,
// кнопка гаснет и перечёркивается, индикатор «Вероятность побега» падает.
// Основная последовательность (кликер, →): щелчок 1 — итог «0 %» и утешительный приз «плов с собой».
//
// Порядок попыток любой. Всё, что в HTML зависит от числа попыток (проценты и сегменты индикатора, живот гостя,
// горка плова у бабушки), здесь привязано к «уровню» отговорки (А = 1, Б = 2, В = 3) и сложено стопкой:
// верхний (больший) уровень перекрывает нижние. В порядке А → Б → В это ровно HTML (60 % → 25 % → 5 %),
// в любом другом порядке индикатор только падает, а гость и горка только растут.
import { C } from '../lib/deck.mjs';

const PX = (v) => v / 144; // px сцены → дюймы (радиусы скругления)
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });

/* ------------------------------------------------------------------ захват ------------------------------------------------------------------ */
const FREEZE = [
  '#s09 .art .eyes { animation: none !important; }',
  '#s09 .s09-exit-glow { animation: none !important; opacity: .55 !important; }',
  '#s09 .s09-hud-bar i { animation: none !important; }',
  '#s09 .s09-box .art { animation: none !important; }',
  // «Подвести итог» (.is-shown: visibility: visible) иначе просвечивает в изолированных снимках
  '#s09 .s09-sumwrap { visibility: hidden !important; }',
].join(' ');
const CLEARBUB = '#s09 .s09-bub-t, #s09 .s09-bub-t * { color: transparent !important; }';
const MOOD = (sel, m) => `#s09 ${sel} .art .mv { display: none !important; } #s09 ${sel} .art .mv-${m} { display: inline !important; }`;
const STAMPFLAT = '#s09 .s09-stamp { animation: none !important; opacity: 1 !important; transform: none !important; }';
const OPT = (k, sub = '') => `.s09-optwrap:nth-child(${k}) ${sub || '.s09-opt'}`;
const GAGS = ['.s09-teapot', '.s09-piala', '.s09-clock', '.s09-plate2', '.s09-thesis', '.s09-plate3'];

// конфетти «утешительного приза»: веер вокруг контейнера (в HTML это частицы FX — их захват прячет)
function drawConfetti() {
  const host = document.querySelector('#s09');
  const COLS = ['#e8432d', '#f6bb2a', '#f5ebd5', '#52b6ff', '#ff8a35', '#1fa3b4', '#4cc27a'];
  const CX = 548, CY = 330, W = 760, H = 600;
  let seed = 909;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const c = document.createElement('canvas');
  c.id = 's09-conf'; c.width = W * 2; c.height = H * 2;
  c.style.cssText = `position:absolute;left:${CX - W / 2}px;top:${CY - H / 2}px;width:${W}px;height:${H}px;z-index:60;pointer-events:none;visibility:visible`;
  const g = c.getContext('2d');
  g.scale(2, 2);
  let n = 0;
  for (let i = 0; i < 2000 && n < 150; i++) {
    const up = rnd() < 0.78;
    const a = up ? -Math.PI * (0.06 + rnd() * 0.88) : rnd() * Math.PI * 2;
    const rr = 80 + 270 * Math.sqrt(rnd());
    const x = CX + Math.cos(a) * rr * 1.05, y = CY + Math.sin(a) * rr * 0.8;
    if (x > 640 && x < 1050 && y > 236 && y < 400) continue; // наклейка «Утешительный приз» остаётся чистой
    if (x > 462 && x < 640 && y > 262 && y < 420) continue;  // и сам контейнер
    if (y < 76 || y > CY + H / 2 - 12 || x < CX - W / 2 + 12 || x > CX + W / 2 - 12) continue;
    n++;
    g.save(); g.translate(x - (CX - W / 2), y - (CY - H / 2)); g.rotate(rnd() * Math.PI);
    g.fillStyle = COLS[Math.floor(rnd() * COLS.length)];
    const w = 12 + rnd() * 13, h = 5 + rnd() * 4;
    if (rnd() < 0.12) { g.beginPath(); g.arc(0, 0, 4 + rnd() * 3, 0, 7); g.fill(); } else g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
  }
  host.appendChild(c);
}

const usedMeasure = (k) => [
  { name: `used${k}`, sel: OPT(k) }, { name: `usedT${k}`, sel: OPT(k, '.s09-opt-t') }, { name: `usedL${k}`, sel: OPT(k, '.s09-letter') },
];
const after = (k, X, talkMood) => ({
  name: `after${k}`,
  actions: [{ next: k, each: 2600 }],
  wait: 1300,
  css: FREEZE + STAMPFLAT,
  items: [
    { name: `g${k}`, sel: '.s09-guest', pad: 40 },
    { name: `gma${X}`, sel: '.s09-gma', pad: 44 },
    { name: `gmaT${X}`, sel: '.s09-gma', pad: 44, css: MOOD('.s09-gma', talkMood) },
    { name: `bub${X}`, sel: '.s09-bub', pad: 64, css: CLEARBUB },
    { name: `bar${['60', '25', '5'][k - 1]}`, sel: '.s09-hud-bar', pad: 2 },
    ...(k === 3 ? [
      ...GAGS.map((s) => ({ name: s.slice(5), sel: s, pad: 20 })),
      { name: 'clockRing', sel: '.s09-clock', pad: 20, css: '#s09 .s09-ringlines { opacity: 1 !important; transition: none !important; }' },
    ] : []),
  ],
  measure: [
    { name: `bub${X}Box`, sel: '.s09-bub' }, { name: `bub${X}T`, sel: '.s09-bub-t' },
    { name: `stamp${X}`, sel: '.s09-stamp' },
    ...usedMeasure(k),
  ],
});

export const capture = {
  states: [
    {
      name: 'start',
      css: FREEZE,
      items: [
        { name: 'rug', sel: '.s09-rug', pad: 4 },
        { name: 'door', sel: '.s09-door', pad: 44 },
        { name: 'table', sel: '.s09-tablewrap', pad: 24, hide: GAGS },
        { name: 'g0', sel: '.s09-guest', pad: 40 },
        { name: 'gma0', sel: '.s09-gma', pad: 44 },
        { name: 'bub0', sel: '.s09-bub', pad: 64, css: CLEARBUB },
        { name: 'bar100', sel: '.s09-hud-bar', pad: 2 },
      ],
      measure: [
        { name: 'eyebrow', sel: '.s09-head .eyebrow' }, { name: 'title', sel: '.s09-title' },
        { name: 'hud', sel: '.s09-hud' }, { name: 'hudLabel', sel: '.s09-hud-label' }, { name: 'hudVal', sel: '.s09-hud-val' },
        { name: 'hudBar', sel: '.s09-hud-bar' }, { name: 'hudBadge', sel: '.s09-hud-badge' },
        { name: 'bub0Box', sel: '.s09-bub' }, { name: 'bub0T', sel: '.s09-bub-t' },
        ...[1, 2, 3].flatMap((k) => [
          { name: `opt${k}`, sel: OPT(k) }, { name: `let${k}`, sel: OPT(k, '.s09-letter') }, { name: `optT${k}`, sel: OPT(k, '.s09-opt-t') },
        ]),
      ],
    },
    {
      name: 'doorOpen',
      css: FREEZE,
      actions: [{ eval: "document.querySelector('#s09 .s09-door').classList.add('is-open')" }, { wait: 900 }],
      items: [{ name: 'doorOpen', sel: '.s09-door', pad: 44 }],
    },
    after(1, 'A', 'happy'),
    after(2, 'B', 'proud'),
    after(3, 'C', 'worried'),
    {
      name: 'final',
      actions: [{ next: 4, each: 2600 }],
      wait: 2600,
      css: FREEZE,
      items: [
        { name: 'g4', sel: '.s09-guest', pad: 40 },
        { name: 'gmaF', sel: '.s09-gma', pad: 44 },
        { name: 'bar0', sel: '.s09-hud-bar', pad: 2 },
        { name: 'box', sel: '.s09-box', pad: 36 },
      ],
      measure: [
        { name: 'finalCard', sel: '.s09-final-card' }, { name: 'finalBadge', sel: '.s09-final-badge' },
        { name: 'finalT', sel: '.s09-final-t' }, { name: 'zero', sel: '.s09-zero' }, { name: 'prizeR', sel: '.s09-prize-st' },
      ],
    },
    {
      name: 'finalFlat',
      actions: [{ next: 4, each: 2600 }],
      wait: 2600,
      css: FREEZE + '#s09 .s09-prize-st { transform: none !important; }',
      measure: [{ name: 'prizeSt', sel: '.s09-prize-st' }, { name: 'prizeSpan', sel: '.s09-prize-st span' }, { name: 'prizeB', sel: '.s09-prize-st b' }],
    },
    {
      name: 'confetti',
      enterWait: 600,
      actions: [{ eval: `(${drawConfetti.toString()})()` }, { wait: 200 }],
      items: [{ name: 'confetti', sel: '#s09-conf', pad: 0, self: true }],
    },
  ],
};

/* ------------------------------------------------------------------ данные ------------------------------------------------------------------ */
const NB = ' ';
const OPTS = [
  { X: 'A', letter: 'А', lines: ['Спасибо,', 'я уже наелся'] },
  { X: 'B', letter: 'Б', lines: ['Мне завтра', 'рано вставать'] },
  { X: 'C', letter: 'В', lines: ['Мне нужно писать', 'магистерскую диссертацию'] },
];
// ширины строк отговорок (Calibri Bold 17 pt = 34 px сцены; Carlito — метрический двойник Calibri) — длина красного зачёркивания
const LINE_W = { A: [131, 191], B: [170, 204], C: [276, 412] };
// реплики бабушки — переносы как в HTML (text-wrap: balance)
const REPLY = {
  A: ['Значит, тебе', `ещё и${NB}чай нужен!`],
  B: [`Вот и${NB}поешь, чтобы`, 'завтра силы были!'],
  C: ['Сначала поешь', 'нормально.', 'Потом занимайся', 'своей наукой!'],
};
const ROT = { A: -7, B: -5, C: -8 };       // наклон печати (как ROT[n − 1] в HTML)
const LVL = { A: '60', B: '25', C: '5' };  // «вероятность побега» после попытки этого уровня
const LVLC = { 100: C.gold, 60: C.gold, 25: C.orange, 5: C.red, 0: C.red };
const ENTR = new Set(['appear', 'fade', 'zoom', 'pop', 'slam', 'drop', 'flyTop', 'flyBottom', 'flyLeft', 'flyRight', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown', 'expandX', 'riseUp']);

/* ------------------------------------------------------------------ сборка ------------------------------------------------------------------ */
export function build(S) {
  S.start({ layout: 'CHROME', eyebrow: 'Мини-игра · попробуй сбежать', title: 'Как выйти из узбекского застолья?', section: 'Мини-игра' });
  const r = S.rects;
  // объектов больше 24: поле номера pptxgenjs (всегда id 25) совпало бы с id фигуры — свой номер, как на слайде 7
  S.slide._slideNumberProps = null;
  S.text('sldNum', String(+S.id), { x: 1700, y: 1032, w: 110, h: 36 }, { font: 'mono', size: 11, bold: true, color: C.cream, align: 'right', valign: 'middle', wrap: false });

  const hidden = new Set(); // фигуры, скрытые до своей анимации
  const H = (n) => { hidden.add(n); return n; };

  // ===== сцена: ковёр, дверь, гость, хонтахта с «аргументами», бабушка =====
  S.img('rug');
  S.img('door');
  S.img(H('doorOpen'));
  const guests = ['g0', 'g1', 'g2', 'g3', 'g4'];
  guests.forEach((g, i) => S.img(i ? H(g) : g));
  S.img('table');
  // z-порядок «аргументов» — как z-index в HTML: чайник 1, пиала и тарелка 3, будильник и диссертация 4, тарелка на диссертации 5
  ['teapot', 'piala', 'plate2', 'clock', 'clockRing', 'thesis', 'plate3'].forEach((n) => S.img(H(n)));
  const gmas = ['gma0', 'gmaTA', 'gmaA', 'gmaTB', 'gmaB', 'gmaTC', 'gmaC', 'gmaF'];
  gmas.forEach((g, i) => S.img(i ? H(g) : g));

  // ===== реплики бабушки: пузырь — картинка из HTML, текст — живой =====
  const bubText = (name, runs, box) => S.text(H(name), runs, { x: box.x + 32, y: box.y + 12, w: box.w - 40, h: box.h - 26 }, {
    size: 21, bold: true, color: C.ink, valign: 'middle', lineMul: 0.9,
  });
  const bubbles = [];
  S.img(H('bub0'));
  bubText('bub0T', [
    { text: 'Oling, oling!', options: { color: C.red2, breakLine: true } },
    { text: '«Берите, берите!»', options: { color: C.ink2, fontSize: 14 } },
  ], r.bub0Box);
  bubbles.push('bub0', 'bub0T');
  for (const { X } of OPTS) {
    S.img(H(`bub${X}`));
    const ln = REPLY[X];
    bubText(`bub${X}T`, ln.map((t, i) => ({ text: t, options: i < ln.length - 1 ? { breakLine: true } : {} })), r[`bub${X}Box`]);
    bubbles.push(`bub${X}`, `bub${X}T`);
  }

  // ===== утешительный приз (итог) =====
  S.img(H('box'));
  const ps = r.prizeSt;
  S.text(H('prize'), [
    { text: 'УТЕШИТЕЛЬНЫЙ ПРИЗ:', options: { fontFace: 'Calibri', fontSize: 11.5, bold: true, charSpacing: 1.6, breakLine: true } },
    { text: `плов с${NB}собой`, options: { fontFace: 'Arial Black', fontSize: 19 } },
  ], { x: ps.x - 6, y: ps.y - 2, w: ps.w + 14, h: ps.h + 4 }, {
    font: 'display', color: C.ink, valign: 'middle', rotate: 5, fill: C.gold, radius: PX(14), line: C.bg, lineW: 3,
    shadow: SH(15, 9, 0.4), inset: [11, 4, 4, 4], lineMul: 0.95, wrap: false,
  });
  S.img(H('confetti'));

  // ===== индикатор «Вероятность побега» =====
  const hud = [];
  const hu = (n) => { hud.push(n); return n; };
  hu(S.shape('hud', 'round', r.hud, { fill: C.panel, line: C.line, lineW: 1, radius: PX(22), shadow: SH(20, 10, 0.4) }));
  hu(S.shape(H('hudZero'), 'round', r.hud, { line: C.red, lineW: 1.5, radius: PX(22), shadow: SH(18, 0, 0.6, C.red) }));
  hu(S.text('hudLabel', 'ВЕРОЯТНОСТЬ ПОБЕГА', { x: r.hudLabel.x, y: r.hudLabel.y - 4, w: 280, h: 34 }, {
    size: 10, bold: true, color: C.cream2, spacing: 1.6, valign: 'middle', wrap: false,
  }));
  // проценты — стопкой: у каждого непрозрачная подложка цвета панели, меньшее значение лежит выше
  for (const v of ['100', '60', '25', '5', '0']) {
    hu(S.text(v === '100' ? `n${v}` : H(`n${v}`), `${v}%`, { x: 1638, y: 264, w: 150, h: 70 }, {
      font: 'mono', size: 28, bold: true, color: LVLC[v], align: 'right', valign: 'middle', fill: C.panel, wrap: false,
    }));
  }
  for (const v of ['100', '60', '25', '5', '0']) hu(S.img(v === '100' ? `bar${v}` : H(`bar${v}`)));
  hu(S.badge('hudBadge', 'joke', 'Шуточная модель', { x: r.hud.x + r.hud.w - 22 - 300, y: r.hudBadge.y + 1 }, { size: 10, w: 300 }));

  // ===== три отговорки =====
  const optShapes = [];   // кнопки в исходном виде (к итогу обычно уже скрыты под погашенными)
  const usedAll = [];     // погашенные кнопки (к итогу обычно видны)
  const hot = [];         // невидимые «кнопки»-триггеры
  const used = {};        // фигуры погашенного состояния (для «нет»)
  const lab = (name, k, dy, color) => {
    const o = r[`opt${k}`], t = r[`optT${k}`];
    const lines = OPTS[k - 1].lines;
    return S.text(name, lines.map((s, i) => ({ text: s, options: i ? {} : { breakLine: true } })), { x: t.x, y: o.y + dy, w: o.x + o.w - t.x - 8, h: o.h }, {
      size: 17, bold: true, color, valign: 'middle', lineMul: 0.92, wrap: false,
    });
  };
  OPTS.forEach(({ X, letter }, i) => {
    const k = i + 1;
    const o = r[`opt${k}`], u = r[`used${k}`], L = r[`let${k}`], UL = r[`usedL${k}`];
    const RR = PX(26);
    optShapes.push(S.text(`face${k}`, '', o, { fill: C.cream, radius: RR, shadow: SH(0.5, 4.5, 1, C.cream3) }));
    optShapes.push(S.text(H(`ch${k}`), '', o, { fill: C.gold, radius: RR, line: C.cream, lineW: 2.5, shadow: SH(0.5, 4.5, 1, C.gold2) }));
    optShapes.push(S.text(`let${k}`, letter, L, { font: 'display', size: 20, color: C.gold, fill: C.ink, radius: PX(39), align: 'center', valign: 'middle', inset: 0, wrap: false }));
    optShapes.push(lab(`lab${k}`, k, 0, C.ink));
    // погашенная кнопка (как .is-used: панель, серый текст, красное зачёркивание, красный кружок с крестиком)
    const us = [];
    us.push(S.shape(H(`used${k}`), 'round', u, { fill: C.panel, line: C.line, lineW: 1.5, radius: RR }));
    us.push(lab(H(`usedT${k}`), k, 8, C.muted));
    const lw = LINE_W[X], lh = 1.2 * 34 * 0.92, top = u.y + (u.h - 2 * lh) / 2;
    lw.forEach((w, j) => us.push(S.shape(H(`strike${k}${j}`), 'round', { x: r[`optT${k}`].x - 2, y: top + lh * j + lh * 0.56 - 2.5, w: w + 4, h: 5 }, { fill: C.red, radius: PX(2.5) })));
    us.push(S.shape(H(`usedC${k}`), 'ellipse', UL, { fill: C.red }));
    const cx = UL.x + UL.w / 2, cy = UL.y + UL.h / 2;
    for (const [j, rot] of [[0, 45], [1, -45]]) us.push(S.shape(H(`usedX${k}${j}`), 'round', { x: cx - 18, y: cy - 4.5, w: 36, h: 9 }, { fill: C.cream, radius: PX(4.5), rotate: rot }));
    used[k] = us;
    usedAll.push(...us);
  });
  // печати «Попытка не удалась» — на своей отговорке
  for (const { X } of OPTS) {
    S.stamp(H(`stamp${X}`), [{ text: 'ПОПЫТКА', options: { breakLine: true } }, { text: `НЕ${NB}УДАЛАСЬ` }], r[`stamp${X}`], {
      color: C.red, size: 22, rot: ROT[X], fill: C.bg, fillT: 14, lineW: 4, lines: 0.92,
    });
  }
  // невидимые кнопки поверх: «нет» (для погашенной отговорки) и сама отговорка (верхняя, прячется после попытки)
  OPTS.forEach((_, i) => {
    const k = i + 1, o = r[`opt${k}`];
    const hr = { x: o.x - 4, y: o.y - 4, w: o.w + 8, h: o.h + 18 };
    hot.push(S.shape(`nope${k}`, 'round', hr, { fill: C.bg, fillT: 100, radius: PX(28) }));
    hot.push(S.shape(`hit${k}`, 'round', hr, { fill: C.bg, fillT: 100, radius: PX(28) }));
  });

  // ===== итог =====
  const fc = r.finalCard;
  S.text(H('finalCard'), '', fc, { fill: C.cream, radius: PX(26), shadow: SH(25, 12, 0.35) });
  S.badge(H('finalBadge'), 'joke', 'Шутка', { x: r.finalBadge.x, y: r.finalBadge.y + 1 }, { size: 10, w: 140 });
  // фраза и «0%» — две фигуры (у «0%» свой удар печатью). Arial Black заметно уже Unbounded из HTML, поэтому фраза
  // центрирована в своей колонке, а «0%» — в правой: зазор между ними есть при любой из двух ширин шрифта
  S.text(H('finalT'), 'Вероятность побега в рамках нашей шуточной модели:', { x: r.finalT.x, y: fc.y, w: 1386, h: fc.h }, {
    font: 'display', size: 19, color: C.ink, align: 'center', valign: 'middle', wrap: false,
  });
  S.text(H('zero'), '0%', { x: 1560, y: fc.y - 6, w: fc.x + fc.w - 36 - 1560, h: fc.h + 12 }, {
    font: 'display', size: 39, color: C.red, align: 'center', valign: 'middle', wrap: false,
  });

  /* ------------------------------------------------------------------ анимации ------------------------------------------------------------------ */
  const all = (names, e) => names.map((t, i) => ({ t, ...e, ...(i && e.sound ? { sound: undefined } : {}) }));
  const otherBubbles = (X) => bubbles.filter((b) => !b.startsWith(`bub${X}`));
  const auto = [];
  // при открытии: кнопки-отговорки въезжают (как data-in), через 1,1 с бабушка: «Oling, oling!»
  OPTS.forEach((_, i) => {
    const d = 450 + 90 * i, k = i + 1;
    auto.push({ t: `face${k}`, fx: 'riseUp', dur: 600, delay: d }, { t: `let${k}`, fx: 'riseUp', dur: 600, delay: d }, { t: `lab${k}`, fx: 'riseUp', dur: 600, delay: d });
  });
  auto.push(
    { t: 'bub0', fx: 'pop', dur: 450, delay: 1100, sound: 'pop' },
    { t: 'bub0T', fx: 'pop', dur: 450, delay: 1100 },
    ...all(gmas, { fx: 'teeter', dur: 600, deg: 2, delay: 1100 }),
  );

  // ЩЕЛЧОК 1 (кликер, →): итог «0%» и утешительный приз
  S.click(
    // кнопки уезжают вниз; то, что к этому моменту может быть уже скрыто, убирается мгновенно (без эффекта выхода)
    ...all(usedAll, { fx: 'sinkDown', dur: 400, sound: 'drumroll' }),
    ...all(optShapes, { fx: 'hide' }),
    ...all(hot, { fx: 'hide' }),
    ...all(bubbles, { fx: 'hide' }),
    ...all(OPTS.map(({ X }) => `stamp${X}`), { fx: 'hide' }),
    ...all(['finalCard', 'finalBadge', 'finalT'], { fx: 'riseUp', dur: 600, delay: 300 }),
    { t: 'bar0', fx: 'fade', dur: 600, delay: 300 },
    { t: 'n0', fx: 'fade', dur: 400, delay: 700, sound: 'tick' },
    { t: 'zero', fx: 'slam', dur: 600, delay: 1080, sound: 'stamp' },
    { t: 'hudZero', fx: 'fade', dur: 400, delay: 1080 },
    ...all(hud, { fx: 'shake', dur: 500, amp: 0.004, delay: 1080 }),
    { t: 'g4', fx: 'fade', dur: 400, delay: 1080 },
    ...all(guests.slice(0, 4), { fx: 'hide', delay: 1500 }),
    { t: 'gmaF', fx: 'fade', dur: 300, delay: 1500 },
    ...all(gmas.slice(0, 7), { fx: 'hide', delay: 1850 }),
    { t: 'box', fx: 'pop', dur: 600, delay: 1500, over: 1.15, sound: 'tada' },
    { t: 'confetti', fx: 'zoom', dur: 500, delay: 1500 },
    { t: 'prize', fx: 'pop', dur: 500, delay: 1750 },
    { t: 'g4', fx: 'pulse', dur: 500, by: 105, delay: 1550 },
    { t: 'confetti', fx: 'fadeOut', dur: 900, delay: 2700 },
    { t: 'box', fx: 'float', dur: 3200, amp: 0.006, delay: 2300 },
  );

  // ТРИГГЕРЫ А / Б / В: попытка сбежать (в любом порядке)
  const walkers = guests.slice(0, 4);
  OPTS.forEach(({ X }, i) => {
    const k = i + 1;
    const lower = (list, upto) => list.slice(0, upto);
    const fx = [
      // отклик кнопки: щелчок, золотая подсветка, нажатие
      { t: `ch${k}`, fx: 'fade', dur: 200, sound: 'click' },
      ...all([`face${k}`, `ch${k}`, `let${k}`, `lab${k}`], { fx: 'move', path: 'M 0 0 L 0 0.0074 E', dur: 90, autoRev: true, decel: 0 }),
      // прежняя реплика уходит
      ...all(otherBubbles(X), { fx: 'hide' }),
      // гость идёт к двери и возвращается
      ...all(walkers, { fx: 'move', path: 'M 0 0 L 0.15625 0 E', dur: 700, autoRev: true, accel: 30000, decel: 30000, sound: 'whoosh' }),
      ...all(walkers, { fx: 'teeter', dur: 1400, deg: 3 }),
      { t: 'doorOpen', fx: 'fade', dur: 250, delay: 260, sound: 'swoosh' },
      { t: 'doorOpen', fx: 'fadeOut', dur: 400, delay: 820 },
      // бабушка отвечает
      { t: `gmaT${X}`, fx: 'fade', dur: 200, delay: 520 },
      ...all(gmas, { fx: 'teeter', dur: 600, deg: 2, delay: 520 }),
      ...all(otherBubbles(X), { fx: 'hide', delay: 520 }),
      { t: `bub${X}`, fx: 'pop', dur: 450, delay: 520, sound: 'pop' },
      { t: `bub${X}T`, fx: 'pop', dur: 450, delay: 520 },
    ];
    // её «аргумент» на столе
    if (X === 'A') {
      fx.push(
        { t: 'teapot', fx: 'fade', dur: 300, delay: 560, sound: 'swoosh' },
        { t: 'teapot', fx: 'move', path: 'M -0.1354 0 L 0 0 E', dur: 700, delay: 560, decel: 70000 },
        { t: 'piala', fx: 'pop', dur: 500, delay: 760, over: 1.2, sound: 'ding' },
      );
    } else if (X === 'B') {
      fx.push(
        { t: 'clockRing', fx: 'pop', dur: 450, delay: 520, over: 1.2, sound: 'alarm' },
        { t: 'clockRing', fx: 'teeter', dur: 560, deg: 9, delay: 600 },
        { t: 'clockRing', fx: 'hide', delay: 1240 },
        { t: 'clock', fx: 'appear', delay: 1240 },
        { t: 'plate2', fx: 'drop', dur: 600, delay: 760 },
        { t: 'plate2', fx: 'pulse', dur: 260, by: 104, delay: 1140, sound: 'plop' },
      );
    } else {
      fx.push(
        { t: 'thesis', fx: 'fade', dur: 250, delay: 520, sound: 'swoosh' },
        { t: 'thesis', fx: 'move', path: 'M -0.09375 0 L 0 0 E', dur: 550, delay: 520, decel: 70000 },
        { t: 'plate3', fx: 'drop', dur: 600, delay: 760 },
        { t: 'thesis', fx: 'pulse', dur: 300, by: 105, delay: 1140, sound: 'plop' },
      );
    }
    fx.push(
      // гость возвращается довольный и потолстевший (уровень попытки: А — 1, Б — 2, В — 3)
      { t: `g${k}`, fx: 'fade', dur: 300, delay: 1000 },
      ...all(lower(guests, k), { fx: 'hide', delay: 1350 }),
      // бабушка снова добрая, горка плова у неё выросла
      { t: `gma${X}`, fx: 'fade', dur: 250, delay: 1400 },
      { t: `gmaT${X}`, fx: 'hide', delay: 1650 },
      ...all(lower(gmas, 1 + 2 * i), { fx: 'hide', delay: 1650 }),
      // печать на отговорку, грустный тромбон, кнопка гаснет и перечёркивается
      { t: `stamp${X}`, fx: 'slam', dur: 450, delay: 1400, sound: 'stamp' },
      { t: `hit${k}`, fx: 'hide', delay: 1400 },
      { t: `ch${k}`, fx: 'fadeOut', dur: 200, delay: 1400 },
      ...all([`used${k}`, `usedT${k}`], { fx: 'fade', dur: 200, delay: 1400 }),
      ...all([`face${k}`, `let${k}`, `lab${k}`], { fx: 'hide', delay: 1620 }),
      ...all([`strike${k}0`, `strike${k}1`], { fx: 'wipeLeft', dur: 300, delay: 1500 }),
      ...all([`usedC${k}`, `usedX${k}0`, `usedX${k}1`], { fx: 'pop', dur: 450, delay: 1460, over: 1.2, sound: 'fail' }),
      // индикатор: вероятность побега падает (на уровень этой отговорки)
      ...all(hud, { fx: 'shake', dur: 500, amp: 0.004, delay: 1400 }),
      { t: `bar${LVL[X]}`, fx: 'fade', dur: 400, delay: 1500 },
      { t: `n${LVL[X]}`, fx: 'pop', dur: 450, delay: 1500 },
      // печать висит, пока звучит тромбон, и уходит
      { t: `stamp${X}`, fx: 'fadeOut', dur: 450, delay: 3100 },
    );
    S.trigger(`hit${k}`, ...fx);
  });
  // повторный щелчок по погашенной отговорке — «нет»: кнопка вздрагивает
  OPTS.forEach((_, i) => {
    const k = i + 1;
    S.trigger(`nope${k}`, ...all(used[k], { fx: 'shake', dur: 400, amp: 0.004, sound: 'tick' }));
  });

  // Начальная видимость в PowerPoint определяется ПЕРВЫМ эффектом фигуры (основная последовательность, затем триггеры).
  // Скрытым фигурам, у которых первый эффект — не вход (выход на итоге, «шаги» гостя в чужом триггере и т. п.),
  // добавляем в начало «появление + исчезновение» в момент открытия слайда: они стартуют скрытыми.
  const first = {};
  for (const e of [...auto, ...S.anims.clicks.flat(), ...S.anims.triggers.flatMap((t) => t.effects)]) if (!(e.t in first)) first[e.t] = e.fx;
  const pre = [];
  for (const n of hidden) {
    if (!(n in first)) throw new Error(`Слайд 09: скрытая фигура ${n} без анимации`);
    if (!ENTR.has(first[n])) pre.push({ t: n, fx: 'appear' }, { t: n, fx: 'hide' });
  }
  const autoEntered = new Set(auto.filter((e) => ENTR.has(e.fx)).map((e) => e.t));
  for (const [n, fx] of Object.entries(first)) {
    if (!hidden.has(n) && !autoEntered.has(n) && ENTR.has(fx)) throw new Error(`Слайд 09: видимая фигура ${n} начинается со входа ${fx}`);
  }
  S.auto(...pre, ...auto);

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: попытки — ЩЕЛЧКОМ МЫШИ по кнопкам А, Б, В (это триггеры, порядок любой, как подскажет зал; кликер и клавиши 1/2/3 их не нажимают). '
    + 'Каждая попытка идёт сама ~1,5 с: гость к двери и обратно, реплика бабушки, «аргумент» на столе, печать «Попытка не удалась» с тромбоном, индикатор падает '
    + '(в порядке А → Б → В — 60 % → 25 % → 5 %, в другом порядке он показывает наименьший достигнутый уровень). Щелчок по погашенной кнопке — только «нет». '
    + 'После трёх попыток — щелчок 1 (→, PageDown, кликер или мышью мимо кнопок): итог «0%» и утешительный приз «плов с собой». Следующий щелчок — слайд 10. '
    + 'Не нажимайте → до попыток: он сразу покажет итог.';
}
