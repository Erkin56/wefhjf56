// Слайд 10. Защита диссертации (4:30–5:00). Сцены внутри одного слайда, как в HTML:
//   A — три вывода (щелчки 1–3), B — Узбекский культурный центр (щелчок 4), C — «Как дела?» (щелчок 5)
//   с двумя кнопками-триггерами («Ответить кратко» → «Нормально.», «Ответить по-узбекски» → бесконечный ответ),
//   E — «RAHMAT! СПАСИБО!» (щелчок 6). Рамка беамера (шапка/подвал) — своя, уходит со сценой C.
import { join } from 'node:path';
import { C } from '../lib/deck.mjs';

/* ------------------------------------------------------------------ захват ------------------------------------------------------------------ */
const mood = (sel, m) => ({ eval: `Art.mood(document.querySelector('#s10 ${sel} .art'), '${m}')` });
const NOANIM = '#s10 .btn--pulse, #s10 .s10-res-in, #s10 .s10-wave, #s10 .s10-e-bow { animation: none !important; }';
// «плоский» замер повёрнутых элементов: без поворота, анимаций и переходов
const FLAT = (sels) => `${sels.map((s) => `#s10 ${s}`).join(', ')} { transform: none !important; animation: none !important; transition: none !important; }`;
const CLEAR = (sel) => `#s10 ${sel} { color: transparent !important; }`;

// конфетти для финала рисуем прямо в странице (canvas) и снимаем тем же захватом — пересъёмка воспроизводит их
function drawConfetti() {
  const host = document.querySelector('#s10');
  const COLS = ['#e8432d', '#f6bb2a', '#f5ebd5', '#52b6ff', '#ff8a35', '#1fa3b4', '#4cc27a'];
  let seed = 20141;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const layer = (id, n, zone, size = 1) => {
    const c = document.createElement('canvas');
    c.id = id; c.width = 3840; c.height = 2160;
    c.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:60;pointer-events:none;visibility:visible';
    const g = c.getContext('2d');
    g.scale(2, 2);
    for (const side of [0, 1]) {
      for (let i = 0; i < n; i++) {
        let [x, y] = zone();
        if (side) x = 1920 - x;
        g.save(); g.translate(x, y); g.rotate(rnd() * Math.PI);
        g.fillStyle = COLS[Math.floor(rnd() * COLS.length)];
        const w = (12 + rnd() * 13) * size, h = (5 + rnd() * 4) * size;
        if (rnd() < 0.1) { g.beginPath(); g.arc(0, 0, (4 + rnd() * 3) * size, 0, 7); g.fill(); } else g.fillRect(-w / 2, -h / 2, w, h);
        g.restore();
      }
    }
    host.appendChild(c);
  };
  // центр (RAHMAT!/СПАСИБО! и подпись внизу) остаётся чистым
  const clampX = (x, y) => Math.max(10, Math.min(y < 790 ? 455 : 590, x));
  layer('s10-confa', 230, () => { const y = 1070 - Math.pow(rnd(), 1.5) * 560; return [clampX(250 + gauss() * 250, y), y]; });
  layer('s10-confb', 130, () => { const y = 380 + rnd() * 520; return [clampX(210 + gauss() * 230, y), y]; });
  layer('s10-confc', 55, () => [10 + rnd() * 300, 330 + rnd() * 420], 0.85);
}

const STATES = [
  {
    name: 'a0',
    items: [
      { name: 'resA0', sel: '.s10-a-res', pad: 24 },
      ...[1, 2, 3].map((k) => ({ name: `red${k}`, sel: `.s10-row--${k} .s10-redact`, pad: 2, self: true, css: '#s10 .s10-redact::after { visibility: hidden !important; }' })),
    ],
    measure: [
      { name: 'eyebrowA', sel: '.s10-a-head .eyebrow' }, { name: 'titleA', sel: '.s10-a-title' },
      ...[1, 2, 3].flatMap((k) => [{ name: `row${k}`, sel: `.s10-row--${k}` }, { name: `num${k}`, sel: `.s10-row--${k} .s10-num` }]),
    ],
  },
  { name: 'a2', actions: [{ next: 2, each: 2600 }], items: [{ name: 'resA2', sel: '.s10-a-res', pad: 24 }] },
  { name: 'a3s', actions: [{ next: 3, each: 2600 }, mood('.s10-a-res', 'shock'), { wait: 300 }], items: [{ name: 'resA3s', sel: '.s10-a-res', pad: 24 }] },
  { name: 'a3g', actions: [{ next: 3, each: 2600 }, mood('.s10-a-gma', 'happy'), { wait: 300 }], items: [{ name: 'gmaA3h', sel: '.s10-a-gma', pad: 24 }] },
  {
    name: 'a3',
    actions: [{ next: 3, each: 2600 }],
    wait: 1500,
    items: [
      { name: 'mini1', sel: '.s10-mini--1', pad: 14 },
      { name: 'mini2', sel: '.s10-mini--2', pad: 14 },
      { name: 'mini3', sel: '.s10-mini--3', pad: 14 },
      { name: 'resA3', sel: '.s10-a-res', pad: 24 },
      { name: 'gmaA3', sel: '.s10-a-gma', pad: 24 },
    ],
    measure: [
      { name: 'row3o', sel: '.s10-row--3' }, { name: 'num3o', sel: '.s10-row--3 .s10-num' },
      ...[1, 2, 3].flatMap((k) => [
        { name: `text${k}`, sel: `.s10-row--${k} .s10-text` }, { name: `f${k}`, sel: `.s10-row--${k} .s10-formula` },
        { name: `badge${k}`, sel: `.s10-row--${k} .s10-badge` },
      ]),
      { name: 'em3', sel: '.s10-row--3 .s10-text em' },
      { name: 'qedR', sel: '.s10-qed' }, { name: 'plus1R', sel: '.s10-plus1' }, { name: 'goB', sel: '.s10-go-b' },
    ],
  },
  {
    name: 'a3flat',
    actions: [{ next: 3, each: 2600 }],
    css: FLAT(['.s10-qed', '.s10-plus1']) + '#s10 .s10-qed, #s10 .s10-plus1 { opacity: 1 !important; }',
    measure: [{ name: 'qed', sel: '.s10-qed' }, { name: 'plus1', sel: '.s10-plus1' }],
  },
  {
    name: 'b',
    actions: [{ next: 4, each: 2600 }],
    wait: 2600,
    items: [{ name: 'pc', sel: '.s10-pc', hide: ['.s10-pc-st'], pad: 60 }],
    measure: [
      { name: 'stR', sel: '.s10-pc-st' }, { name: 'eyebrowB', sel: '.s10-b-eyebrow' }, { name: 'titleB', sel: '.s10-b-title' },
      { name: 'cardR', sel: '.s10-b-card' }, { name: 'badgeB', sel: '.s10-b-badge' }, { name: 'l1B', sel: '.s10-b-l1' },
      { name: 'l2B', sel: '.s10-b-l2' }, { name: 'fB', sel: '.s10-b-f' }, { name: 'goC', sel: '.s10-go-c' },
    ],
  },
  {
    name: 'bflat',
    actions: [{ next: 4, each: 2600 }],
    wait: 2600,
    css: FLAT(['.s10-pc', '.s10-pc-st', '.s10-b-card']),
    measure: [{ name: 'st', sel: '.s10-pc-st' }, { name: 'stB', sel: '.s10-pc-st b' }, { name: 'stS', sel: '.s10-pc-st span' }, { name: 'card', sel: '.s10-b-card' }],
  },
  {
    name: 'c',
    actions: [{ next: 5, each: 2600 }],
    wait: 1500,
    css: NOANIM,
    items: [
      { name: 'spot', sel: '.s10-spot', pad: 0, self: true, clip: { x: 160, y: 0, w: 1600, h: 800 } }, // радиальный свет; за краями — прозрачно
      { name: 'guestP', sel: '.s10-guest', pad: 24 },
      { name: 'resC', sel: '.s10-res', pad: 24 },
      { name: 'qBig', sel: '.s10-qbub', pad: 70, css: CLEAR('.s10-qbub') },
    ],
    measure: [
      { name: 'qbub', sel: '.s10-qbub' }, { name: 'uzL1', sel: '.s10-uz-l1' }, { name: 'uzL2', sel: '.s10-uz-l2' },
      { name: 'uzBadge', sel: '.s10-uz-l2 .badge' }, { name: 'btnS', sel: '.s10-btn-short' }, { name: 'btnU', sel: '.s10-btn-uz' },
    ],
  },
  { name: 'gs', actions: [{ next: 5, each: 2600 }, mood('.s10-guest-in', 'surprised'), { wait: 300 }], items: [{ name: 'guestS', sel: '.s10-guest', pad: 24 }] },
  { name: 'gd', actions: [{ next: 5, each: 2600 }, mood('.s10-guest-in', 'dizzy'), { wait: 300 }], items: [{ name: 'guestD', sel: '.s10-guest', pad: 24 }] },
  {
    name: 'short',
    actions: [{ next: 5, each: 2600 }, { key: 'Digit1', each: 2200 }],
    css: NOANIM,
    items: [{ name: 'normB', sel: '.s10-normal-bub', pad: 40, css: CLEAR('.s10-normal-bub') }],
    measure: [{ name: 'normalR', sel: '.s10-normal-bub' }, { name: 'andallR', sel: '.s10-andall' }],
  },
  {
    name: 'shortflat',
    actions: [{ next: 5, each: 2600 }, { key: 'Digit1', each: 2200 }],
    css: NOANIM + FLAT(['.s10-normal', '.s10-andall']),
    measure: [{ name: 'normal', sel: '.s10-normal-bub' }, { name: 'andall', sel: '.s10-andall' }],
  },
  {
    name: 'd',
    actions: [{ next: 5, each: 2600 }, { key: 'Digit2', each: 3400 }],
    css: NOANIM,
    items: [
      { name: 'resD', sel: '.s10-res', pad: 24 },
      { name: 'qSmall', sel: '.s10-qbub', pad: 30, css: CLEAR('.s10-qbub') },
    ],
    measure: [
      { name: 'qsm', sel: '.s10-qbub' }, { name: 'panel', sel: '.s10-panel' }, { name: 'rahmat', sel: '.s10-rahmat' },
      { name: 'rahmatTr', sel: '.s10-rahmat-tr' }, { name: 'pbadge', sel: '.s10-panel-badge' }, { name: 'phead', sel: '.s10-panel-head' },
      { name: 'view', sel: '.s10-view' }, { name: 'track', sel: '.s10-track' }, { name: 'item1', sel: '.s10-item' },
      { name: 'count', sel: '.s10-count' }, { name: 'countLbl', sel: '.s10-count .counter-label' }, { name: 'countN', sel: '.s10-count-n' },
      { name: 'countOf', sel: '.s10-count-of' }, { name: 'goE', sel: '.s10-go-e' },
    ],
  },
  {
    name: 'e',
    actions: [{ next: 7, each: 2600 }],
    wait: 5000,
    css: NOANIM,
    items: [
      { name: 'resE', sel: '.s10-e-res', pad: 24 },
      { name: 'gmaE', sel: '.s10-e-gma', pad: 24 },
    ],
    measure: [
      { name: 'el1', sel: '.s10-e-l1' }, { name: 'el2', sel: '.s10-e-l2' }, { name: 'eRahmat', sel: '.s10-e-rahmat' },
      { name: 'eSpasibo', sel: '.s10-e-spasibo' }, { name: 'eStill', sel: '.s10-e-still' },
    ],
  },
  {
    name: 'confetti',
    enterWait: 600,
    actions: [{ eval: `(${drawConfetti.toString()})()` }, { wait: 200 }],
    // у холстов инлайн visibility: visible — соседние слои прячем правилом !important, иначе каждый снимок содержит все три
    items: ['a', 'b', 'c'].map((k) => ({
      name: `conf${k.toUpperCase()}`, sel: `#s10-conf${k}`, pad: 0, self: true,
      css: ['a', 'b', 'c'].filter((o) => o !== k).map((o) => `#s10-conf${o}`).join(', ') + ' { visibility: hidden !important; }',
    })),
  },
];
// захват при изоляции: активная сцена (visibility: visible в CSS) не должна «просвечивать» соседями
const SCENE = '#s10 .s10-scene { visibility: inherit !important; }';
export const capture = { states: STATES.map((st) => ({ ...st, css: SCENE + (st.css || '') })) };

/* ------------------------------------------------------------------ данные ------------------------------------------------------------------ */
const NB = ' ';
const nb = (s) => s.replace(/~/g, NB); // «~» в строках ниже — неразрывный пробел, как &nbsp; в 10-finale.js
// «Как дела?» по-узбекски: первые 12 пунктов из S10.ITEMS (10-finale.js); lines — сколько строк отводим пункту
const TAGS = {
  'семья': { fill: C.gold, color: C.ink, w: 86 },
  'родня': { fill: '2453B0', color: C.cream, w: 87 },
  'соседи': { fill: '1FA3B4', color: C.ink, w: 98 },
  'знакомые': { fill: C.orange, color: C.ink, w: 130 },
  'бабушка': { fill: C.red, color: C.cream, w: 114 },
};
const LIST = [
  ['семья', 'Родители передают вам привет.', 1],
  ['родня', 'Дядя из~Самарканда спрашивает, когда я~женюсь.', 1],
  ['семья', 'Мама спрашивает, есть~ли у~меня шапка.', 1],
  ['родня', 'Двоюродный брат тоже стал лингвистом. Это у~нас семейное.', 2],
  ['соседи', 'Соседи достроили второй этаж.', 1],
  ['бабушка', 'У~бабушки всё хорошо. Её~кот тоже поправился~— на~два килограмма.', 2],
  ['знакомые', 'В~субботу свадьба. Вы~тоже приглашены.', 1],
  ['родня', 'Племянник пошёл в~первый класс и~уже знает, что такое предел.', 2],
  ['семья', 'Папа спрашивает, хорошо~ли я~питаюсь.', 1],
  ['соседи', 'Сосед купил машину. Цвет выбирала вся махалля — весь квартал.', 2],
  ['бабушка', 'Бабушка спрашивает,|почему вы~до~сих пор не~поели.', 2],   // «|» — явный перенос строки
  ['знакомые', 'Одноклассник открыл чайхану.|Передаёт привет.', 2],
];
const T0 = 650, DT = 720; // первый пункт через 0,65 с после нажатия, дальше каждые 0,72 с (как setInterval в HTML)
const tItem = (k) => T0 + (k - 1) * DT;
const PX = (v) => v / 144; // px сцены → дюймы (радиусы скругления)

/* ------------------------------------------------------------------ сборка ------------------------------------------------------------------ */
export function build(S) {
  S.start({ layout: 'BLANK', section: 'Выводы' });
  const r = S.rects;
  const shadow = (blur, offset, opacity) => ({ type: 'outer', color: '000000', blur, offset, angle: 90, opacity });
  const arrowRuns = (label) => [{ text: `${label}  ` }, { text: '→', options: { fontFace: 'Arial', bold: true, fontSize: 17 } }];
  const ARR = { fontFace: 'Arial' }; // стрелки в формулах — шрифтом текста, как .s10-arr в HTML

  // ===== рамка беамера (сцены A и B) =====
  const chrome = [];
  const ch = { font: 'body', size: 9.5, bold: true, color: C.muted, spacing: 1.2, valign: 'middle' };
  chrome.push(S.text('chHead', 'АНТИНАУЧНАЯ КОНФЕРЕНЦИЯ · РГПУ ИМ. А. И. ГЕРЦЕНА', { x: 110, y: 14, w: 900, h: 36 }, ch));
  chrome.push(S.text('chTitle', 'Плов как бесконечный ряд', { x: 1300, y: 14, w: 510, h: 36 }, { font: 'serif', italic: true, size: 10.5, color: C.cream3, align: 'right', valign: 'middle' }));
  chrome.push(S.shape('chLineT', 'line', { x: 0, y: 64, w: 1920, h: 0 }, { line: C.cream, lineW: 0.75, lineT: 88 }));
  chrome.push(S.shape('chLineB', 'line', { x: 0, y: 1020, w: 1920, h: 0 }, { line: C.cream, lineW: 0.75, lineT: 88 }));
  chrome.push(S.text('chAuthor', 'ЭРКИНБОЙ', { x: 110, y: 1032, w: 160, h: 36 }, { ...ch, color: C.gold }));
  chrome.push(S.text('chSection', 'ВЫВОДЫ', { x: 260, y: 1032, w: 700, h: 36 }, { ...ch, color: C.cream3 }));
  chrome.push(S.text('chNum', '10', { x: 1700, y: 1032, w: 110, h: 36 }, { font: 'mono', size: 11, bold: true, color: C.cream, align: 'right', valign: 'middle' }));

  // ===== СЦЕНА A: научные выводы =====
  const A = new Set(); // фигуры сцены A, видимые к щелчку 4
  const a = (n) => { A.add(n); return n; };
  a(S.shape('eyebrowDashA', 'rect', { x: 110, y: r.eyebrowA.y + 13, w: 46, h: 3 }, { fill: C.gold }));
  a(S.text('eyebrowA', 'ЗАЩИТА ДИССЕРТАЦИИ', { x: 170, y: r.eyebrowA.y - 2, w: 700, h: 32 }, { size: 11, bold: true, color: C.gold, spacing: 2.6, valign: 'middle' }));
  a(S.text('titleA', 'НАУЧНЫЕ ВЫВОДЫ', { x: 110, y: r.titleA.y - 22, w: 1215, h: 120 }, { font: 'display', size: 42, color: C.cream, valign: 'middle', wrap: false }));

  const RR = PX(26);
  const rowOpen = { 1: r.row1, 2: r.row2, 3: r.row3o };
  for (const k of [1, 2, 3]) {
    const rc = r[`row${k}`];
    a(S.shape(`row${k}_c`, 'round', rc, { fill: C.panel, fillT: 45, line: C.line, lineW: 1.5, dash: 'dash', radius: RR }));
    S.shape(`row${k}_call`, 'round', rc, { line: C.gold2, lineW: 1.5, dash: 'dash', radius: RR });
  }
  A.add('row1_call');
  for (const k of [1, 2, 3]) {
    const ro = rowOpen[k];
    S.shape(`row${k}_oG`, 'round', ro, { fill: k === 3 ? C.red : C.gold, radius: RR, shadow: shadow(20, 10, 0.35) });
    S.shape(`row${k}_o`, 'round', { x: ro.x + 8, y: ro.y, w: ro.w - 8, h: ro.h }, { fill: C.panel, radius: RR });
  }
  // номера в кружках: закрытый (контур) и раскрытый (заливка)
  const numO = { 1: r.num1, 2: r.num2, 3: r.num3o };
  for (const k of [1, 2, 3]) {
    a(S.text(`num${k}_c`, String(k), r[`num${k}`], { font: 'display', size: 27, color: C.gold2, align: 'center', valign: 'middle', line: C.gold2, lineW: 2.5, radius: PX(50), inset: 0, wrap: false }));
    S.text(`num${k}_o`, String(k), numO[k], {
      font: 'display', size: 27, color: k === 3 ? C.cream : C.ink, align: 'center', valign: 'middle', fill: k === 3 ? C.red : C.gold, radius: PX(50), inset: 0, wrap: false,
    });
  }
  // «засекречено до защиты»
  for (const k of [1, 2, 3]) {
    const rd = r[`red${k}`];
    a(S.img(`red${k}`));
    a(S.text(`red${k}L`, 'ЗАСЕКРЕЧЕНО ДО ЗАЩИТЫ', { x: rd.x + rd.w / 2 - 205, y: rd.y + rd.h / 2 - 19, w: 410, h: 38 }, {
      size: 10, bold: true, color: C.muted, spacing: 2.2, align: 'center', valign: 'middle', fill: C.bg, radius: PX(6), wrap: false,
    }));
  }
  // тексты выводов
  const disp = { font: 'display', color: C.cream, wrap: false };
  S.text('text1', 'Тарелка сходится', { x: r.text1.x, y: r.text1.y - 14, w: 770, h: 84 }, { ...disp, size: 30 });
  S.text('text2', 'Гость расходится', { x: r.text2.x, y: r.text2.y - 14, w: 770, h: 84 }, { ...disp, size: 30 });
  S.text('text3a', 'С бабушкой расходится', { x: r.text3.x, y: r.text3.y - 12, w: 760, h: 64 }, { ...disp, size: 23 });
  S.text('text3b', 'вообще всё', { x: r.em3.x, y: r.em3.y - 20, w: 700, h: 104 }, { ...disp, size: 37, color: C.red });
  const it = (text, o = {}) => ({ text, options: { italic: true, ...o } });
  const rm = (text, o = {}) => ({ text, options: { italic: false, ...o } });
  const sub = { subscript: true };
  const fml = { font: 'serif', size: 17.5, color: C.cream3, wrap: false, valign: 'middle' };
  S.text('f1', [rm('lim'), it('n', sub), rm('→', { ...sub, ...ARR }), rm('∞', sub), rm(' '), it('P'), it('n', sub), rm(' = 10/7 ≈ 1,43')], { x: r.f1.x, y: r.f1.y - 2, w: 760, h: 50 }, fml);
  S.text('f2', [it('E'), it('n', sub), rm(' = '), it('n'), rm(' + 1 − '), it('P'), it('n', sub), rm(' '), rm('→', ARR), rm(' ∞')], { x: r.f2.x, y: r.f2.y - 2, w: 760, h: 50 }, fml);
  S.text('f3', [rm('lim'), rm('бабушка', sub), rm(' (всё) = ∞')], { x: r.f3.x, y: r.f3.y - 2, w: 760, h: 50 }, fml);
  for (const k of [1, 2, 3]) S.img(`mini${k}`);
  S.badge('badge1', 'math', 'Математика', { x: 1256 - 230, y: r.badge1.y + 1 }, { w: 230 });
  S.badge('badge2', 'math', 'Математика', { x: 1256 - 230, y: r.badge2.y + 1 }, { w: 230 });
  S.badge('badge3', 'joke', 'Шутка', { x: 1256 - 150, y: r.badge3.y + 1 }, { w: 150 });

  // персонажи, печать, «+1», кнопка
  a(S.img('resA0'));
  S.img('resA2');
  S.img('resA3s');
  S.img('resA3');
  S.img('gmaA3h');
  S.img('gmaA3');
  S.shape('qedRing', 'round', { x: r.qed.x - 11, y: r.qed.y - 11, w: r.qed.w + 22, h: r.qed.h + 22 }, { line: C.gold, lineW: 2, radius: PX(28), rotate: -9 });
  S.stamp('qed', 'Ч. Т. Д.', r.qed, { color: C.gold, size: 33, rot: -9, fill: C.bg, fillT: 65, lineW: 4 });
  const p1 = { x: r.plus1R.x + r.plus1R.w / 2, y: r.plus1R.y + r.plus1R.h / 2 };
  S.sticker('plus1', '+1', { x: p1.x - 58, y: p1.y - 42, w: 116, h: 84 }, { fill: C.red, color: C.cream, size: 23, rot: -8 });
  S.button('goB', arrowRuns('ПРАКТИЧЕСКОЕ ПРИМЕНЕНИЕ'), { x: r.goB.x - 20, y: r.goB.y, w: r.goB.w + 20, h: r.goB.h }, { size: 12 });

  // ===== СЦЕНА B: культурный центр =====
  const B = [];
  B.push(S.img('pc'));
  const stc = { x: r.stR.x + r.stR.w / 2, y: r.stR.y + r.stR.h / 2 };
  B.push(S.text('stB', [
    { text: 'Xush kelibsiz!', options: { fontFace: 'Arial Black', fontSize: 17, breakLine: true } },
    { text: 'добро пожаловать', options: { fontFace: 'Segoe Print', fontSize: 14, bold: true } },
  ], { x: stc.x - 185, y: stc.y - 56, w: 370, h: 112 }, {
    font: 'display', color: C.ink, align: 'center', valign: 'middle', rotate: 5.6, fill: C.gold, radius: PX(16), lineMul: 0.9,
    line: C.bg, lineW: 3, shadow: shadow(6, 4, 0.45), wrap: false,
  }));
  B.push(S.shape('eyebrowDashB', 'rect', { x: r.eyebrowB.x, y: r.eyebrowB.y + 13, w: 46, h: 3 }, { fill: C.gold }));
  B.push(S.text('eyebrowB', 'ПРАКТИЧЕСКОЕ ПРИМЕНЕНИЕ', { x: r.eyebrowB.x + 60, y: r.eyebrowB.y - 2, w: 560, h: 32 }, { size: 11, bold: true, color: C.gold, spacing: 2.6, valign: 'middle', wrap: false }));
  B.push(S.text('titleB', [
    { text: 'Приходите', options: { breakLine: true } },
    { text: 'знакомиться', options: { breakLine: true } },
    { text: 'с ' }, { text: 'узбекской', options: { color: C.gold, breakLine: true } },
    { text: 'культурой', options: { color: C.gold } },
  ], { x: r.titleB.x, y: r.titleB.y - 8, w: 640, h: 272 }, { font: 'display', size: 30, color: C.cream, lineMul: 0.8, wrap: false }));
  const card = r.card;
  B.push(S.text('cardB', '', card, { fill: C.cream, radius: PX(22), rotate: 1, shadow: shadow(25, 12, 0.35) }));
  B.push(S.badge('badgeB', 'joke', 'Шутка', { x: r.badgeB.x - 4, y: r.badgeB.y + 2 }, { w: 146 }));
  B.push(S.text('l1B', 'Плов не обещаем.', { x: r.l1B.x, y: r.l1B.y - 8, w: 520, h: 64 }, { font: 'display', size: 20, color: C.red2, rotate: 1, valign: 'middle', wrap: false }));
  B.push(S.text('l2B', 'Но формулу вы уже знаете:', { x: r.l2B.x, y: r.l2B.y, w: 520, h: 50 }, { size: 17, bold: true, color: C.ink, rotate: 1, valign: 'middle', wrap: false }));
  B.push(S.shape('sepB', 'line', { x: r.fB.x, y: r.fB.y + 2, w: r.fB.w, h: 0 }, { line: C.cream3, lineW: 1, dash: 'dash', rotate: 1 }));
  B.push(S.text('fB', [it('P'), it('n', sub), rm('+1', sub), rm(' = 0,3·'), it('P'), it('n', sub), rm(' + 1')], { x: r.fB.x, y: r.fB.y + 12, w: 520, h: 72 }, {
    font: 'serif', size: 25, color: C.ink, rotate: 1, valign: 'middle', wrap: false,
  }));
  B.push(S.button('goC', arrowRuns('ВОПРОСЫ ИЗ ЗАЛА'), r.goC, { size: 12 }));

  // ===== СЦЕНА C: «Как дела?» =====
  S.img('spot');
  S.img('guestP');
  S.img('guestS');
  S.img('guestD');
  S.img('resC');
  S.img('resD');
  S.img('qBig');
  const qb = r.qbub;
  S.text('qText', 'Как дела?', { x: qb.x, y: qb.y + 44 + 75 - 100, w: qb.w, h: 200 }, { font: 'display', size: 72, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  S.text('uzL1', 'Yaxshimisiz? Uydagilar yaxshimi?', { x: 500, y: r.uzL1.y - 4, w: 1032, h: 64 }, { font: 'serif', italic: true, size: 26, color: C.gold, align: 'center', valign: 'middle', wrap: false });
  S.badge('uzBadge', 'fact', 'Факт', { x: r.uzBadge.x - 6, y: r.uzBadge.y + 1 }, { w: 120 });
  S.text('uzL2', 'так спрашивают по-узбекски: «Как вы? Как домашние?»', { x: r.uzBadge.x + 128, y: r.uzL2.y - 2, w: 860, h: 42 }, { size: 15, bold: true, color: C.cream2, valign: 'middle', wrap: false });
  S.button('btnS', 'ОТВЕТИТЬ КРАТКО', r.btnS, { fill: C.cream, edge: C.cream3, color: C.ink, size: 19 });
  S.button('btnSg', 'ОТВЕТИТЬ КРАТКО', r.btnS, { fill: '8F8B84', edge: '6E6B64', color: '2A2723', size: 19 });
  S.button('btnU', 'ОТВЕТИТЬ ПО-УЗБЕКСКИ', r.btnU, { fill: C.red, edge: C.red3, color: C.cream, size: 19 });

  // «Нормально.» (триггер «Ответить кратко»)
  S.img('normB');
  const nc = { x: r.normalR.x + r.normalR.w / 2, y: r.normalR.y + r.normalR.h / 2 };
  const nw = r.normal.w, nh = r.normal.h;
  S.text('normT', 'Нормально.', { x: nc.x - nw / 2, y: nc.y - nh / 2 - 4, w: nw, h: nh }, { font: 'display', size: 29, color: C.ink, align: 'center', valign: 'middle', rotate: 2, wrap: false });
  S.shape('strike', 'round', { x: nc.x - nw / 2 + 24, y: nc.y - 1, w: nw - 48, h: 10 }, { fill: C.red, radius: PX(5), rotate: -1 });
  const ac = { x: r.andallR.x + r.andallR.w / 2, y: r.andallR.y + r.andallR.h / 2 };
  S.text('andall', '…и всё?', { x: ac.x - 120, y: ac.y - 40, w: 240, h: 80 }, { font: 'hand', size: 22, bold: true, color: C.gold, align: 'center', valign: 'middle', rotate: -8, wrap: false });

  // ===== СЦЕНА D: ответ по-узбекски (триггер «Ответить по-узбекски») =====
  S.img('qSmall');
  const qs = r.qsm;
  S.text('qTextS', 'Как дела?', { x: qs.x, y: qs.y + qs.h / 2 - 42, w: qs.w, h: 76 }, { font: 'display', size: 26, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  const pn = r.panel;
  S.text('panel', '', pn, { fill: C.panel, line: C.line, lineW: 0.75, radius: PX(32), shadow: shadow(30, 15, 0.5) });
  S.text('rahmat', 'Rahmat, yaxshi!', { x: r.rahmat.x, y: r.rahmat.y - 14, w: 790, h: 96 }, { font: 'display', size: 33, color: C.gold, valign: 'middle', wrap: false });
  S.text('rahmatTr', '«Спасибо, хорошо!» А теперь подробнее:', { x: r.rahmatTr.x, y: r.rahmatTr.y, w: 640, h: 42 }, { size: 15.5, bold: true, color: C.cream2, valign: 'middle', wrap: false });
  S.badge('pbadge', 'joke', 'Шутка', { x: 1370 - 146, y: r.pbadge.y + 1 }, { w: 146 });
  S.shape('pheadLine', 'line', { x: pn.x, y: 210, w: pn.w, h: 0 }, { line: C.line, lineW: 1.5 });
  S.shape('track', 'round', { x: 1372, y: 238, w: 8, h: 788 }, { fill: C.line, radius: PX(4) });
  const THUMBS = [[1, 100], [5, 60], [9, 43], [12, 35]];
  THUMBS.forEach(([, pct], i) => { const h = Math.round(788 * pct / 100); S.shape(`thumb${i}`, 'round', { x: 1372, y: 238 + 788 - h, w: 8, h }, { fill: C.gold, radius: PX(4) }); });

  // пункты списка: карточка, номер, метка-«пилюля», текст (метка стоит перед первой строкой — табуляция в тексте)
  let y = 226;
  const items = [];
  LIST.forEach(([tag, text, lines], i) => {
    const k = i + 1, tg = TAGS[tag];
    const h = lines === 1 ? 46 : 76;
    const parts = nb(text).split('|');
    S.text(`it${k}`, '', { x: 562, y, w: 796, h }, { fill: C.cream, radius: PX(14), shadow: shadow(10, 5, 0.3) });
    S.text(`itN${k}`, String(k), { x: 572, y: y + 7, w: 46, h: 32 }, { font: 'mono', size: 12.5, bold: true, color: C.ink, fill: C.gold, radius: PX(9), align: 'center', valign: 'middle', inset: 0, wrap: false });
    S.text(`itTag${k}`, tag.toUpperCase(), { x: 630, y: y + 11, w: tg.w, h: 25 }, { size: 9, bold: true, color: tg.color, fill: tg.fill, radius: PX(12.5), spacing: 1, align: 'center', valign: 'middle', inset: 0, wrap: false });
    // метка стоит перед первой строкой: текст начинается с неразрывных пробелов на ширину метки
    // (Calibri: пробел = 0,226 кегля; табуляцию с позицией LibreOffice при импорте игнорирует)
    const pad = NB.repeat(Math.ceil((tg.w + 8) / (0.2261 * 25)));
    const runs = parts.map((p, j) => ({ text: (j ? '' : pad) + p, options: j < parts.length - 1 ? { breakLine: true } : {} }));
    S.text(`itT${k}`, runs, { x: 630, y: y + 8, w: 716, h: lines * 31 + 4 }, { size: 12.5, bold: true, color: C.ink, valign: 'top', inset: 0 });
    items.push(k);
    y += h + 7;
  });

  // счётчик «пункт N из ∞» и «Регламент!»
  S.text('cntLbl', 'ПУНКТ', { x: 1450, y: r.countLbl.y, w: 360, h: 32 }, { size: 12, bold: true, color: C.muted, spacing: 3, align: 'right', valign: 'middle' });
  S.text('cntOf', 'из ∞', { x: 1660, y: r.countOf.y, w: 150, h: 78 }, { font: 'mono', size: 30, bold: true, color: C.cream, align: 'right', valign: 'middle', wrap: false });
  for (let k = 0; k <= LIST.length; k++) {
    S.text(`cnt${k}`, String(k), { x: 1440, y: r.countN.y - 6, w: 210, h: 144 }, { font: 'mono', size: 66, bold: true, color: C.gold, align: 'right', valign: 'middle', wrap: false });
  }
  S.button('goE', 'РЕГЛАМЕНТ!', { x: r.goE.x - 10, y: r.goE.y, w: r.goE.w + 10, h: r.goE.h }, { fill: C.red, edge: C.red3, color: C.cream, size: 12 });

  // ===== СЦЕНА E: финал (накрывает всё прежнее непрозрачным фоном) =====
  S.imgFile('cover', join(S.dir, '..', 'bg.jpg'), { x: 0, y: 0, w: 1920, h: 1080 });
  S.text('el1', 'МОИ ПЯТЬ МИНУТ ЗАКОНЧИЛИСЬ.', { x: 60, y: r.el1.y - 16, w: 1800, h: 100 }, { font: 'display', size: 35, color: C.cream, align: 'center', valign: 'middle', wrap: false });
  S.text('el2', [
    { text: 'ДЛЯ УЗБЕКА ЭТО ТОЛЬКО НАЧАЛО', options: { breakLine: true } },
    { text: 'ОТВЕТА НА ВОПРОС ' }, { text: '«КАК ДЕЛА?»', options: { color: C.gold } },
  ], { x: 160, y: r.el2.y - 8, w: 1600, h: 136 }, { font: 'display', size: 25, color: C.cream2, align: 'center', valign: 'middle', lineMul: 0.85, wrap: false });
  S.img('resE');
  S.img('gmaE');
  S.text('eRahmat', 'RAHMAT!', { x: 440, y: r.eRahmat.y + r.eRahmat.h / 2 - 95, w: 1040, h: 190 }, {
    font: 'display', size: 72, color: C.gold, align: 'center', valign: 'middle', wrap: false,
    shadow: { type: 'outer', color: '8F6208', blur: 0, offset: 5, angle: 90, opacity: 1 },
  });
  S.text('eSpasibo', 'СПАСИБО!', { x: 440, y: r.eSpasibo.y + r.eSpasibo.h / 2 - 95, w: 1040, h: 190 }, {
    font: 'display', size: 72, color: C.red, align: 'center', valign: 'middle', wrap: false,
    shadow: { type: 'outer', color: C.red3, blur: 0, offset: 5, angle: 90, opacity: 1 },
  });
  S.text('eStill', [
    { text: 'ответ продолжается: пункт ' }, { text: String(LIST.length), options: { color: C.gold } }, { text: ' из ∞' },
  ], { x: 560, y: r.eStill.y - 4, w: 800, h: 42 }, { font: 'mono', size: 13, bold: true, color: C.muted, align: 'center', valign: 'middle', wrap: false });
  S.img('confA');
  S.img('confB');
  S.img('confC');

  /* ------------------------------------------------------------------ анимации ------------------------------------------------------------------ */
  // щелчки 1–3: выводы (как conclude() в HTML: swoosh, затем ding / coin / boing)
  const reveal = (k, { snd, resFrom, resTo }) => {
    const fx = [
      { t: `row${k}_call`, fx: 'fadeOut', dur: 250, sound: 'swoosh' },
      { t: `row${k}_oG`, fx: 'fade', dur: 400 },
      { t: `row${k}_o`, fx: 'fade', dur: 400 },
      { t: `num${k}_c`, fx: 'fadeOut', dur: 200 },
      { t: `num${k}_o`, fx: 'pop', dur: 600, over: 1.2 },
      { t: `red${k}`, fx: 'collapseX', dur: 450 },
      { t: `red${k}L`, fx: 'collapseX', dur: 400 },
      { t: `badge${k}`, fx: 'pop', dur: 450, delay: 550 },
      { t: `mini${k}`, fx: k === 3 ? 'zoom' : 'wipeLeft', dur: k === 3 ? 600 : 1000, delay: 300 },
      { t: `f${k}`, fx: 'fade', dur: 400, delay: 300 },
    ];
    if (k < 3) {
      fx.push({ t: `text${k}`, fx: 'fade', dur: 400, delay: 250, sound: snd });
      fx.push({ t: `row${k + 1}_call`, fx: 'fade', dur: 300, delay: 200 });
      A.add(`row${k + 1}_call`);
    }
    if (resFrom) fx.push({ t: resFrom, fx: 'fadeOut', dur: 250 }, { t: resTo, fx: 'fade', dur: 250 });
    A.delete(`row${k}_call`); A.delete(`num${k}_c`); A.delete(`red${k}`); A.delete(`red${k}L`);
    [`row${k}_oG`, `row${k}_o`, `num${k}_o`, `badge${k}`, `mini${k}`, `f${k}`].forEach((n) => A.add(n));
    return fx;
  };
  S.click(...reveal(1, { snd: 'ding' }));
  A.add('text1');
  S.click(...reveal(2, { snd: 'coin', resFrom: 'resA0', resTo: 'resA2' }));
  A.add('text2'); A.delete('resA0'); A.add('resA2');
  // третий вывод: бабушка, «+1», «Ч. Т. Д.» (как в HTML: boing 0,38 с, plop 1 с, stamp 1,52 с)
  S.click(
    ...reveal(3, {}),
    { t: 'text3a', fx: 'fade', dur: 400, delay: 250 },
    { t: 'text3b', fx: 'pop', dur: 500, delay: 380, over: 1.15, sound: 'boing' },
    { t: 'resA2', fx: 'fadeOut', dur: 200, delay: 380 },
    { t: 'resA3s', fx: 'fade', dur: 200, delay: 380 },
    { t: 'gmaA3h', fx: 'flyRight', dur: 700, delay: 450 },
    { t: 'plus1', fx: 'pop', dur: 500, delay: 1050, sound: 'plop' },
    { t: 'qedRing', fx: 'slam', dur: 420, delay: 1250 },
    { t: 'qed', fx: 'slam', dur: 420, delay: 1250 },
    { t: 'resA3s', fx: 'fadeOut', dur: 200, delay: 1520, sound: 'stamp' },
    { t: 'resA3', fx: 'fade', dur: 200, delay: 1520 },
    { t: 'gmaA3h', fx: 'fadeOut', dur: 200, delay: 1520 },
    { t: 'gmaA3', fx: 'fade', dur: 200, delay: 1520 },
    { t: 'goB', fx: 'pop', dur: 500, delay: 1900 },
  );
  ['text3a', 'text3b', 'resA3', 'gmaA3', 'plus1', 'qedRing', 'qed', 'goB'].forEach((n) => A.add(n));
  A.delete('resA2');

  // щелчок 4: сцена A уходит, приходит культурный центр (whoosh, sparkle 0,7 с, pop 1,35 с, ding 1,6 с)
  S.click(
    ...[...A].map((t, i) => ({ t, fx: 'fadeOut', dur: 400, ...(i === 0 ? { sound: 'whoosh' } : {}) })),
    { t: 'pc', fx: 'riseUp', dur: 800, delay: 150 },
    { t: 'eyebrowDashB', fx: 'fade', dur: 450, delay: 350 },
    { t: 'eyebrowB', fx: 'fade', dur: 450, delay: 350 },
    { t: 'titleB', fx: 'fade', dur: 500, delay: 600, sound: 'sparkle' },
    { t: 'stB', fx: 'pop', dur: 550, delay: 1300, sound: 'pop' },
    ...['cardB', 'badgeB', 'l1B', 'l2B', 'sepB', 'fB'].map((t, i) => ({ t, fx: 'riseUp', dur: 500, delay: 1500, ...(i === 0 ? { sound: 'ding' } : {}) })),
    { t: 'goC', fx: 'pop', dur: 500, delay: 2100 },
  );

  // щелчок 5: «Как дела?» (swoosh, pop 0,52 с, click 1,15 с); рамка беамера уходит
  S.click(
    ...[...B, ...chrome].map((t, i) => ({ t, fx: 'fadeOut', dur: 400, ...(i === 0 ? { sound: 'swoosh' } : {}) })),
    { t: 'spot', fx: 'fade', dur: 800, delay: 150 },
    { t: 'guestP', fx: 'flyLeft', dur: 800, delay: 250 },
    { t: 'resC', fx: 'flyRight', dur: 800, delay: 350 },
    { t: 'qBig', fx: 'pop', dur: 650, delay: 400, over: 1.06, sound: 'pop' },
    { t: 'qText', fx: 'fade', dur: 300, delay: 750 },
    { t: 'uzL1', fx: 'riseUp', dur: 500, delay: 900 },
    { t: 'uzBadge', fx: 'riseUp', dur: 500, delay: 950 },
    { t: 'uzL2', fx: 'riseUp', dur: 500, delay: 950 },
    { t: 'btnS', fx: 'pop', dur: 550, delay: 1150, over: 1.06, sound: 'click' },
    { t: 'btnU', fx: 'pop', dur: 550, delay: 1150, over: 1.06 },
    { t: 'btnU', fx: 'heartbeat', dur: 1800, by: 104, delay: 1800 },
  );

  // ТРИГГЕР «Ответить кратко»: «Нормально.» → гость удивлён → «…и всё?» → зачёркивание
  S.trigger('btnS',
    { t: 'btnS', fx: 'hide', sound: 'click' },
    { t: 'btnSg', fx: 'appear' },
    { t: 'uzL1', fx: 'fadeOut', dur: 300 },
    { t: 'uzBadge', fx: 'fadeOut', dur: 300 },
    { t: 'uzL2', fx: 'fadeOut', dur: 300 },
    { t: 'normB', fx: 'pop', dur: 450, delay: 120, sound: 'pop' },
    { t: 'normT', fx: 'fade', dur: 250, delay: 330 },
    { t: 'andall', fx: 'pop', dur: 450, delay: 1100 },
    { t: 'guestP', fx: 'fadeOut', dur: 200, delay: 1150 },
    { t: 'guestS', fx: 'fade', dur: 200, delay: 1150, sound: 'tick' },
    { t: 'strike', fx: 'wipeLeft', dur: 350, delay: 1800, sound: 'swoosh' },
  );

  // ТРИГГЕР «Ответить по-узбекски»: панель «Rahmat, yaxshi!» и пункты сами, один за другим
  const uz = [
    { t: 'btnU', fx: 'zoomOut', dur: 300, sound: 'whoosh' },
    { t: 'btnS', fx: 'fadeOut', dur: 250 },
    { t: 'btnSg', fx: 'fadeOut', dur: 250 },
    { t: 'uzL1', fx: 'fadeOut', dur: 300 },
    { t: 'uzBadge', fx: 'fadeOut', dur: 300 },
    { t: 'uzL2', fx: 'fadeOut', dur: 300 },
    { t: 'normB', fx: 'fadeOut', dur: 350, delay: 400 },
    { t: 'normT', fx: 'fadeOut', dur: 350, delay: 400 },
    { t: 'strike', fx: 'fadeOut', dur: 350, delay: 400 },
    { t: 'andall', fx: 'fadeOut', dur: 300 },
    { t: 'guestS', fx: 'hide' },
    { t: 'guestP', fx: 'appear' },
    { t: 'resC', fx: 'fadeOut', dur: 250 },
    { t: 'resD', fx: 'fade', dur: 250 },
    { t: 'resD', fx: 'float', dur: 360, amp: 0.006, delay: 400 },
    { t: 'qText', fx: 'fadeOut', dur: 250 },
    { t: 'qBig', fx: 'zoomOut', dur: 450 },
    { t: 'qSmall', fx: 'fade', dur: 450, delay: 250 },
    { t: 'qTextS', fx: 'fade', dur: 450, delay: 250 },
    ...['panel', 'rahmat', 'rahmatTr', 'pbadge', 'pheadLine', 'track', 'thumb0'].map((t) => ({ t, fx: 'riseUp', dur: 600, delay: 250 })),
    { t: 'cntLbl', fx: 'fade', dur: 400, delay: 500 },
    { t: 'cntOf', fx: 'fade', dur: 400, delay: 500 },
    { t: 'cnt0', fx: 'fade', dur: 400, delay: 500 },
    { t: 'goE', fx: 'pop', dur: 500, delay: 2600 },
  ];
  for (const k of items) {
    const t = tItem(k);
    for (const n of [`it${k}`, `itN${k}`, `itTag${k}`, `itT${k}`]) uz.push({ t: n, fx: 'riseUp', dur: 450, delay: t, ...(n === `it${k}` ? { sound: k % 4 === 1 ? 'pop' : 'tick' } : {}) });
    uz.push({ t: `cnt${k - 1}`, fx: 'hide', delay: t }, { t: `cnt${k}`, fx: 'pop', dur: 300, over: 1.14, delay: t });
  }
  THUMBS.slice(1).forEach(([k], i) => uz.push({ t: `thumb${i}`, fx: 'hide', delay: tItem(k) }, { t: `thumb${i + 1}`, fx: 'appear', delay: tItem(k) }));
  // гость постепенно осознаёт масштаб ответа: с 3-го пункта удивлён, с 11-го — голова кругом
  uz.push(
    { t: 'guestP', fx: 'fadeOut', dur: 200, delay: tItem(3) }, { t: 'guestS', fx: 'fade', dur: 200, delay: tItem(3) },
    { t: 'guestS', fx: 'teeter', dur: 500, deg: 4, delay: tItem(3) + 200 },
    { t: 'guestS', fx: 'fadeOut', dur: 200, delay: tItem(11) }, { t: 'guestD', fx: 'fade', dur: 200, delay: tItem(11) },
    { t: 'guestD', fx: 'teeter', dur: 500, deg: 4, delay: tItem(11) + 200 },
  );
  S.trigger('btnU', ...uz);

  // щелчок 6: финал — всё прежнее накрыто фоном; RAHMAT! СПАСИБО! (whoosh, swoosh 0,75 с, tada 1,25 с, boing 1,7 с, sparkle 2,3 с)
  S.click(
    { t: 'cover', fx: 'fade', dur: 450, sound: 'whoosh' },
    { t: 'el1', fx: 'fade', dur: 600, delay: 250 },
    { t: 'resE', fx: 'flyLeft', dur: 800, delay: 700 },
    { t: 'el2', fx: 'fade', dur: 600, delay: 750, sound: 'swoosh' },
    { t: 'gmaE', fx: 'flyRight', dur: 800, delay: 900 },
    { t: 'eRahmat', fx: 'pop', dur: 800, delay: 1200, over: 1.12 },
    { t: 'confA', fx: 'zoom', dur: 500, delay: 1250, sound: 'tada' },
    { t: 'eSpasibo', fx: 'pop', dur: 800, delay: 1650, over: 1.12 },
    { t: 'confB', fx: 'zoom', dur: 500, delay: 1700, sound: 'boing' },
    { t: 'gmaE', fx: 'teeter', dur: 1000, deg: 4, delay: 1800 },
    { t: 'resE', fx: 'pulse', dur: 700, by: 104, delay: 1900 },
    { t: 'confC', fx: 'fade', dur: 500, delay: 2300, sound: 'sparkle' },
    { t: 'eStill', fx: 'fade', dur: 600, delay: 2600 },
    // густое конфетти оседает и тает, как частицы в HTML, — герои остаются видны; редкий слой C остаётся
    { t: 'confA', fx: 'move', path: 'M 0 0 L 0 0.05 E', dur: 2600, delay: 1250, accel: 60000, decel: 0 },
    { t: 'confA', fx: 'fadeOut', dur: 1000, delay: 3000 },
    { t: 'confB', fx: 'move', path: 'M 0 0 L 0 0.05 E', dur: 2600, delay: 1700, accel: 60000, decel: 0 },
    { t: 'confB', fx: 'fadeOut', dur: 1000, delay: 3400 },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: щелчки 1–3 (→, PageDown, кликер) — три вывода, на третьем бабушка, «+1» и печать «Ч. Т. Д.»; '
    + 'щелчок 4 — культурный центр; щелчок 5 — «Как дела?». Дальше МЫШЬЮ по кнопкам: «Ответить кратко» — «Нормально.», '
    + '«Ответить по-узбекски» — панель «Rahmat, yaxshi!», пункты бегут сами (12 штук, счётчик «пункт N из ∞»). '
    + 'Щелчок 6 (→, кликер или мышью мимо кнопок, например по «Регламент!») — финал «RAHMAT! СПАСИБО!». Кликер кнопки не нажимает — для ответа по-узбекски нужна мышь.';
}
