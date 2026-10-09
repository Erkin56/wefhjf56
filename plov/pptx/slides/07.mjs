// Слайд 7. Теорема 2 «Куда исчезает плов?»: родные точечные диаграммы с линиями (синяя — на тарелке Pₙ → 10/7,
// оранжевая — съедено всего Eₙ = n + 1 − Pₙ → ∞), табло «Съедено всего», весы с ляганом, капгир бабушки и гость.
// Щелчки = шаги «Далее» HTML: 1–3) +1 цикл (гость съедает 70 %, капгир добавляет порцию, новый отрезок графика
// дорисовывается, ось перемасштабируется); 4) перемотка до 20 циклов (график дорисовывается ~2,3 с, счётчик бежит,
// «Чпок!» на 12-м цикле); 5) кульминация на весь экран «ТАРЕЛКА СХОДИТСЯ. / ГОСТЬ РАСХОДИТСЯ.»;
// 6) «Плов не исчез. Он в вас.» и большая стрелка в зал.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { C, F } from '../lib/deck.mjs';

// ---------- модель (как в 07-theorem2.js) ----------
const P = [1];
for (let n = 0; n < 20; n++) P.push(0.3 * P[n] + 1);
const E = P.map((p, n) => n + 1 - p);
const fmt = (x) => x.toFixed(2).replace('.', ',');

// ---------- геометрия графика (как Plot в HTML: рамка 110,262 1030×598, поля l120 r40 t44 b84) ----------
const PL = 230, PT = 306, PW = 870, PH = 470;
const SC = {
  A: { xm: 5, ym: 3, xu: 1, yu: 1 },                 // циклы 1–2
  B: { xm: 5, ym: E[3] * 1.25 + 0.5, xu: 1, yu: 1 },  // цикл 3
  C: { xm: 5, ym: E[4] * 1.25 + 0.5, xu: 1, yu: 1 },  // цикл 4
  D: { xm: 21, ym: E[20] * 1.25 + 0.5, xu: 5, yu: 5 }, // 20 циклов
};
const X = (x, s) => PL + (PW * x) / s.xm;
const Y = (y, s) => PT + PH - (PH * y) / s.ym;
const GRID = '2E3034';
const r5 = (v) => +v.toFixed(5);

// перемотка: отрезок 4…20 дорисовывается вытеснением слева направо, счётчик тикает, когда «шторка» доходит до точки k
const FF0 = 100, FFD = 2200, SEGPAD = 22;
const segFrame = (a, b, s) => ({ x: X(a, s) - SEGPAD, y: PT - SEGPAD, w: X(b, s) - X(a, s) + 2 * SEGPAD, h: PH + 2 * SEGPAD });
const FFR = segFrame(4, 20, SC.D);
const tk = (k) => Math.round(FF0 + (FFD * (X(k, SC.D) - FFR.x)) / FFR.w);

const NOANIM_GUEST = '#s07 .s07-guest, #s07.is-dizzy .s07-guest, #s07 .s07-guest.is-gulp { animation: none !important; transform: none !important; } #s07 .s07-guest svg * { transition: none !important; } #s07 .s07-btnin.is-strain { animation: none !important; }';
const FULL = (f) => `${NOANIM_GUEST} #s07 .s07-guest svg { --full: ${f} !important; }`;
const GUEST = (name, css = NOANIM_GUEST) => ({ name, sel: '.s07-guestwrap', pad: 36, css });

export const capture = {
  states: [
    {
      name: 'start',
      css: '#s07 .s07-ffsticker, #s07 .s07-sum, #s07 .s07-chpok, #s07 .s07-more { transform: none !important; animation: none !important; }',
      items: [
        { name: 'bench', sel: '.s07-benchwrap', pad: 12, hide: ['.s07-scale-v'] },
        { name: 'plate1', sel: '.s07-platewrap', pad: 16 },
        // горка после «съел 70 %»: Art.amountScale(0,39) = (0,673; 0,480)
        { name: 'plateLow', sel: '.s07-platewrap', pad: 16, css: '#s07 .s07-plate .mound { transform: scale(0.6732, 0.4797) !important; }' },
        { name: 'kapgir', sel: '.s07-kapgir', clip: { x: 1112, y: 178, w: 288, h: 306 }, css: '#s07 .s07-kapgir-in { opacity: 1 !important; animation: none !important; transform: rotate(140deg) !important; }' },
        GUEST('guest1'),
      ],
      measure: [
        { name: 'chartSvg', sel: '.s07-chart svg' },
        { name: 'legP', sel: '.s07-leg--plate' }, { name: 'legE', sel: '.s07-leg--eaten' },
        { name: 'legPi', sel: '.s07-leg--plate i' }, { name: 'legEi', sel: '.s07-leg--eaten i' },
        { name: 'legPt', sel: '.s07-leg--plate .s07-leg-t' }, { name: 'legPm', sel: '.s07-leg--plate .math' },
        { name: 'legEt', sel: '.s07-leg--eaten .s07-leg-t' }, { name: 'legEm', sel: '.s07-leg--eaten .math' },
        { name: 'ff', sel: '.s07-ff' }, { name: 'ffSt', sel: '.s07-ffsticker' }, { name: 'sum', sel: '.s07-sum' },
        { name: 'b1', sel: '.s07-f:nth-child(1) .badge' }, { name: 'm1', sel: '.s07-f:nth-child(1) .math' },
        { name: 'b2', sel: '.s07-f:nth-child(2) .badge' }, { name: 'm2', sel: '.s07-f:nth-child(2) .math' },
        { name: 'score', sel: '.s07-score' }, { name: 'cntLbl', sel: '.s07-score .counter-label' },
        { name: 'nlab', sel: '.s07-n' }, { name: 'num', sel: '.s07-eaten-num' }, { name: 'unit', sel: '.s07-eaten-unit' },
        { name: 'more', sel: '.s07-more' }, { name: 'scaleV', sel: '.s07-scale-v' }, { name: 'chpok', sel: '.s07-chpok' },
        { name: 'head', sel: '.s07-head' }, { name: 'title', sel: '.s07-title' },
      ],
    },
    { name: 'c2', actions: [{ next: 1, each: 2600 }], items: [GUEST('guest2')] },
    { name: 'c3', actions: [{ next: 2, each: 2600 }], items: [GUEST('guest3')] },
    {
      name: 'c4', actions: [{ next: 3, each: 2600 }],
      items: [
        GUEST('guest4'),
        GUEST('guest8', FULL(0.67)), // цикл 8: fullOf(E₈) ≈ 0,67
        { name: 'btnFly', sel: '.s07-btnin', self: true, pad: 6, css: FULL(0.67) },
      ],
    },
    {
      name: 'ff', actions: [{ next: 4, each: 2600 }], wait: 1600,
      css: '#s07 .s07-slope, #s07 .s07-slope.is-shown { transform: translate(-50%, 0) !important; }',
      items: [
        GUEST('guest12', FULL(0.84)), // цикл 12: fullOf(E₁₂) ≈ 0,84, пуговица уже отлетела
        GUEST('guest20'),
        { name: 'plateFull', sel: '.s07-platewrap', pad: 16 },
      ],
      measure: [{ name: 'slope', sel: '.s07-slope' }],
    },
    {
      name: 'climax', actions: [{ next: 5, each: 2600 }], wait: 1500,
      items: [{ name: 'finalBg', sel: '.s07-final', self: true, pad: 0, hide: ['.s07-final-top', '.s07-final-lines', '.s07-final-sub', '.s07-bigarrow'] }],
      measure: [{ name: 'finBadge', sel: '.s07-final-top .badge' }, { name: 'l1', sel: '.s07-l1' }, { name: 'l2', sel: '.s07-l2' }],
    },
    {
      name: 'arrow', actions: [{ next: 6, each: 2600 }], wait: 2200,
      css: '#s07 .s07-final.is-arrow .s07-bigarrow svg { animation: none !important; transform: rotateX(44deg) !important; }',
      items: [{ name: 'arrow', sel: '.s07-bigarrow', pad: 44, css: '#s07 .s07-final { background: none !important; }' }],
      measure: [{ name: 'l1s', sel: '.s07-l1' }, { name: 'l2s', sel: '.s07-l2' }, { name: 'sub', sel: '.s07-final-sub' }, { name: 'subB', sel: '.s07-final-sub b' }],
    },
  ],
};

// --- текстовые «прогоны» ---
const run = (text, options = {}) => ({ text, options: { ...options } }); // копия: pptxgenjs меняет объект опций
const m = (text, o = {}) => run(text, { fontFace: F.serif, ...o });               // математика прямым
const v = (text, o = {}) => run(text, { fontFace: F.serif, italic: true, ...o });  // переменная курсивом
const sub = (text, o = {}) => v(text, { baseline: -500, ...o });                  // нижний индекс −25 %
const arrow = (o = {}) => run('→', { fontFace: F.body, ...o });
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });

// фон кульминации: PNG 3840×2160 → JPEG 1920×1080 (~100 КБ вместо 1,3 МБ); без PIL — PNG как есть
const PY = `
import sys
from PIL import Image
Image.open(sys.argv[1]).convert('RGB').resize((1920, 1080), Image.LANCZOS).save(sys.argv[2], 'JPEG', quality=90, optimize=True, progressive=True)
`;
function finalBgFile(S) {
  const src = join(S.dir, 'finalBg.png');
  const out = join(S.dir, 'finalBg.jpg');
  try {
    if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) execFileSync('python3', ['-c', PY, src, out], { stdio: 'pipe' });
    return out;
  } catch (e) {
    console.warn(`  ! слайд 07: JPEG не получился (${e.message.split('\n')[0]}), беру PNG`);
    return src;
  }
}

export function build(S) {
  S.start({ layout: 'CHROME', eyebrow: 'Теорема 2', title: 'Куда исчезает плов?', section: 'Теорема 2' });
  const r = S.rects;
  // Номер слайда: pptxgenjs ставит поле номера последним (поверх полноэкранной кульминации) и всегда с id = 25,
  // а это id 24-го объекта слайда (дубликат ломает ссылки анимаций). Поэтому здесь — свой номер под кульминацией.
  S.slide._slideNumberProps = null;
  S.text('sldNum', String(+S.id), { x: 1700, y: 1032, w: 110, h: 36 }, { font: 'mono', size: 11, bold: true, color: C.cream, align: 'right', valign: 'middle', wrap: false });

  // ================= график =================
  // предел 10/7 — пунктир под линиями (как gBack в HTML); на каждый масштаб — своя линия
  const lim = 10 / 7;
  for (const k of 'ABCD') {
    const y = Y(lim, SC[k]);
    S.shape(`hline${k}`, 'line', { x: PL, y, w: PW, h: 0 }, { line: C.gold, lineW: 2, dash: 'dash' });
  }
  // оси со стрелками (линии диаграммы скрыты, чтобы стрелки шли за поле как в HTML)
  S.slide.addShape(S.pres.ShapeType.line, { ...S.box({ x: PL, y: PT + PH, w: PW + 32, h: 0 }), objectName: S._name('xAxis'), line: { color: C.cream3, width: 2, endArrowType: 'triangle' } });
  S.slide.addShape(S.pres.ShapeType.line, { ...S.box({ x: PL, y: PT - 32, w: 0, h: PH + 32 }), objectName: S._name('yAxis'), line: { color: C.cream3, width: 2, beginArrowType: 'triangle' } });
  S.text('yLab', 'порции', { x: 80, y: 240, w: 132, h: 46 }, { font: 'serif', italic: true, size: 16, color: C.cream, align: 'right', valign: 'bottom', wrap: false });
  S.text('xLab', 'цикл n', { x: 940, y: 820, w: 160, h: 46 }, { font: 'serif', italic: true, size: 16, color: C.cream, align: 'right', valign: 'bottom', wrap: false });

  // родные точечные диаграммы с линиями: «база» (оси, сетка, уже нарисованная часть) и «отрезок» нового цикла
  const series = (a, b) => {
    const xs = []; for (let n = a; n <= b; n++) xs.push(n);
    return [
      { name: 'цикл n', values: xs },
      { name: 'на тарелке, Pn', values: xs.map((n) => +P[n].toFixed(4)) },
      { name: 'съедено всего, En', values: xs.map((n) => +E[n].toFixed(4)) },
    ];
  };
  const look = {
    chartColors: [C.blue, C.orange], lineSize: 4, lineDataSymbol: 'circle', lineDataSymbolSize: 8,
    lineDataSymbolLineSize: 1.5, lineDataSymbolLineColor: C.bg, showLegend: false, showTitle: false,
  };
  const layoutOf = (plot, f) => ({ x: r5((plot.x - f.x) / f.w), y: r5((plot.y - f.y) / f.h), w: r5(plot.w / f.w), h: r5(plot.h / f.h) });
  const BASEF = { x: 150, y: 284, w: 974, h: 550 };
  const baseChart = (name, s, upto) => S.chart(name, 'scatter', series(0, upto), BASEF, {
    ...look,
    layout: layoutOf({ x: PL, y: PT, w: PW, h: PH }, BASEF),
    catAxisMinVal: 0, catAxisMaxVal: s.xm, catAxisMajorUnit: s.xu,
    valAxisMinVal: 0, valAxisMaxVal: r5(s.ym), valAxisMajorUnit: s.yu, valAxisLabelFormatCode: '0',
    valAxisHidden: true, // подписи оси Y — родным текстом (как в HTML: справа на 18 px левее оси), сетка остаётся
    catAxisLineShow: false, valAxisLineShow: false,
    catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontFace: F.mono, valAxisLabelFontFace: F.mono,
    catAxisLabelFontSize: 12, valAxisLabelFontSize: 12, catAxisLabelFontBold: true, valAxisLabelFontBold: true,
    catGridLine: { color: GRID, size: 1 }, valGridLine: { color: GRID, size: 1 },
  });
  const segChart = (name, s, a, b) => {
    const f = segFrame(a, b, s);
    return S.chart(name, 'scatter', series(a, b), f, {
      ...look,
      layout: layoutOf({ x: X(a, s), y: PT, w: X(b, s) - X(a, s), h: PH }, f),
      catAxisMinVal: a, catAxisMaxVal: b, valAxisMinVal: 0, valAxisMaxVal: r5(s.ym),
      catAxisHidden: true, valAxisHidden: true, catAxisLineShow: false, valAxisLineShow: false,
      catGridLine: { style: 'none' }, valGridLine: { style: 'none' },
    });
  };
  baseChart('chartA', SC.A, 0);
  segChart('seg1', SC.A, 0, 1);
  segChart('seg2', SC.A, 1, 2);
  baseChart('chartB', SC.B, 2);
  segChart('seg3', SC.B, 2, 3);
  baseChart('chartC', SC.C, 3);
  segChart('seg4', SC.C, 3, 4);
  baseChart('chartD', SC.D, 4);
  segChart('seg20', SC.D, 4, 20);

  // «головы» линий: крупные точки на последнем значении
  const heads = (n, s) => {
    for (const [k, val, color] of [['P', P[n], C.blue], ['E', E[n], C.orange]]) {
      S.shape(`head${k}${n}`, 'ellipse', { x: X(n, s) - 13, y: Y(val, s) - 13, w: 26, h: 26 }, { fill: color, line: C.bg, lineW: 2.5 });
    }
  };
  heads(0, SC.A); heads(1, SC.A); heads(2, SC.A); heads(3, SC.B); heads(4, SC.C); heads(20, SC.D);

  // подписи оси Y для каждого масштаба
  const yt = {};
  for (const k of 'ABCD') {
    const s = SC[k];
    yt[k] = [];
    for (let val = 0; val <= s.ym + 1e-9; val += s.yu) {
      yt[k].push(S.text(`yt${k}${val}`, String(val), { x: 140, y: Y(val, s) - 18, w: 72, h: 36 }, { font: 'mono', size: 12, bold: true, color: C.muted, align: 'right', valign: 'middle', wrap: false }));
    }
  }
  const ytSwap = (a, b) => [...yt[a].map((t) => ({ t, fx: 'fadeOut', dur: 300 })), ...yt[b].map((t) => ({ t, fx: 'fade', dur: 300 }))];

  // подпись предела над пунктиром (справа, как в HTML)
  for (const k of 'ABCD') {
    const y = Y(lim, SC[k]);
    S.text(`lim${k}`, '10/7 ≈ 1,43', { x: 780, y: y - 52, w: 310, h: 44 }, { font: 'serif', bold: true, size: 16, color: C.gold, align: 'right', valign: 'bottom', wrap: false });
  }

  // легенда
  S.shape('legPi', 'round', 'legPi', { fill: C.blue, radius: 0.028, shadow: SH(7, 0, 0.6, C.blue) });
  S.shape('legEi', 'round', 'legEi', { fill: C.orange, radius: 0.028, shadow: SH(7, 0, 0.6, C.orange) });
  const lb = { fontFace: F.body, bold: true, fontSize: 15, color: C.cream };
  const ms = (c) => ({ color: c, fontSize: 17, bold: true });
  S.text('legP', [
    run('на тарелке   ', lb), v('P', ms(C.blue)), sub('n', { color: C.blue, fontSize: 13, bold: true }), m('  ', ms(C.blue)), arrow(ms(C.blue)), m('  10/7 ≈ 1,43', ms(C.blue)),
  ], { x: 330, y: r.legP.y - 4, w: 540, h: 52 }, { valign: 'middle', wrap: false });
  S.text('legE', [
    run('съедено всего   ', lb), v('E', ms(C.orange)), sub('n', { color: C.orange, fontSize: 13, bold: true }), m('  ', ms(C.orange)), arrow(ms(C.orange)), m('  ∞', ms(C.orange)),
  ], { x: 330, y: r.legE.y - 4, w: 540, h: 52 }, { valign: 'middle', wrap: false });

  // «Перемотка: 20 циклов» (контурная кнопка) → мигающий стикер «Перемотка» → «Подвести итог»
  const ffIcon = (size) => run('►►  ', { fontFace: 'Arial', fontSize: size });
  S.text('ff', [ffIcon(10), run('ПЕРЕМОТКА: 20 ЦИКЛОВ')], 'ff', {
    font: 'display', size: 11, color: C.cream, align: 'center', valign: 'middle', line: C.cream3, lineW: 1.5, radius: 0.5, wrap: false,
  });
  S.sticker('ffSt', [ffIcon(11), run('ПЕРЕМОТКА')], { x: 262, y: r.ffSt.y, w: 310, h: r.ffSt.h }, { fill: C.red, color: C.cream, size: 12, rot: -3 });
  S.button('sum', 'ПОДВЕСТИ ИТОГ', { x: 266, y: r.sum.y, w: 330, h: r.sum.h }, { fill: C.red, edge: C.red3, color: C.cream, size: 11 });

  // рукописная пометка у оранжевой линии (−22°)
  const sc = { x: r.slope.x + r.slope.w / 2, y: r.slope.y + r.slope.h / 2 };
  S.text('slope', '≈ +1 порция за цикл', { x: sc.x - 300, y: sc.y - 42, w: 600, h: 84 }, {
    font: 'hand', bold: true, size: 22, color: C.gold, align: 'center', valign: 'middle', rotate: -22, wrap: false, shadow: SH(8, 0, 1, C.bg),
  });

  // ================= формулы =================
  S.badge('b1', 'joke', 'Шуточная модель', { x: r.b1.x, y: r.b1.y + 1 }, { size: 10, w: 304 });
  const f = { fontSize: 18, color: C.cream };
  const fs = (t, o = {}) => sub(t, { fontSize: 13, color: C.cream, ...o });
  S.text('m1', [
    v('P', f), fs('0', { italic: false }), m(' = 1,   ', f), v('P', f), fs('n'), fs('+1', { italic: false }), m(' = 0,3·', f), v('P', f), fs('n'), m(' + 1', f),
  ], { x: 432, y: r.m1.y - 2, w: 560, h: 52 }, { font: 'serif', size: 18, color: C.cream, valign: 'middle', wrap: false });
  S.badge('b2', 'math', 'Математика', { x: r.b2.x, y: r.b2.y + 1 }, { size: 10, w: 250 });
  S.text('m2', [
    v('E', f), fs('N'), m(' = ', f), v('N', f), m(' + 1 − ', f), v('P', f), fs('N'), m('  ', f), arrow(f), m('  ∞', f),
  ], { x: 380, y: r.m2.y - 2, w: 520, h: 52 }, { font: 'serif', size: 18, color: C.cream, valign: 'middle', wrap: false });

  // ================= табло «Съедено всего» =================
  S.shape('score', 'round', 'score', { fill: C.panel, line: C.line, lineW: 1, radius: 24 / 144, shadow: SH(25, 12, 0.35) });
  S.text('cntLbl', 'СЪЕДЕНО ВСЕГО', { x: r.cntLbl.x, y: r.cntLbl.y - 4, w: 330, h: 34 }, { size: 10, bold: true, color: C.muted, spacing: 2, valign: 'middle', wrap: false });
  const cyc = (k) => S.text(`cyc${k}`, [
    run('цикл  ', { fontFace: F.mono, fontSize: 12, bold: true, color: C.muted }), run(String(k), { fontFace: F.mono, fontSize: 15, bold: true, color: C.cream }),
  ], { x: 1560, y: 114, w: 218, h: 46 }, { align: 'right', valign: 'middle', wrap: false });
  const num = (name, val) => S.text(name, [
    run(val, { fontFace: F.mono, fontSize: 48, bold: true, color: C.orange }), run('  порции', { fontFace: F.body, fontSize: 20, bold: true, color: C.cream }),
  ], { x: 1228, y: 156, w: 570, h: 116 }, { valign: 'middle', wrap: false });
  for (let k = 1; k <= 20; k++) cyc(k);
  num('num0', '0,00');
  for (let k = 1; k <= 20; k++) num(`num${k}`, fmt(E[k]));

  // ================= сцена: весы, ляган, капгир, гость =================
  S.img('bench');
  const sv = (name, val) => S.text(name, val, { x: 1262, y: 652, w: 108, h: 46 }, { font: 'mono', size: 17, bold: true, color: C.blue, align: 'center', valign: 'middle', wrap: false });
  sv('sv1', fmt(P[1]));
  for (let n = 2; n <= 4; n++) { sv(`svLow${n}`, fmt(0.3 * P[n - 1])); sv(`sv${n}`, fmt(P[n])); }
  S.img('plate1');
  S.img('plateLow');
  S.img('plateFull');
  S.img('kapgir');
  for (const g of ['guest1', 'guest2', 'guest3', 'guest4', 'guest8', 'guest12', 'guest20']) S.img(g);
  S.img('btnFly');
  const ch = { x: r.chpok.x + r.chpok.w / 2, y: r.chpok.y + r.chpok.h / 2 };
  S.sticker('chpok', 'ЧПОК!', { x: ch.x - 115, y: ch.y - 38, w: 230, h: 76 }, { fill: C.red, color: C.cream, size: 19, rot: 10 });
  // всплывающие «+0,91» (съел) и «+1» (добавили)
  const halo = SH(8, 0, 1, C.bg);
  for (let n = 2; n <= 4; n++) {
    S.text(`eat${n}`, `+${fmt(0.7 * P[n - 1])}`, { x: 1590, y: 324, w: 220, h: 58 }, { font: 'mono', size: 20, bold: true, color: C.orange, align: 'center', valign: 'middle', wrap: false, shadow: halo });
  }
  S.text('add1', '+1', { x: 1395, y: 430, w: 150, h: 86 }, { font: 'hand', size: 27, bold: true, color: C.gold, align: 'center', valign: 'middle', wrap: false, shadow: halo });

  // главная кнопка: A — пульсирует до первого нажатия, B — после
  S.button('moreA', 'ЕЩЁ ОДНУ ПОРЦИЮ!', 'more', { size: 18 });
  S.button('moreB', 'ЕЩЁ ОДНУ ПОРЦИЮ!', 'more', { size: 18 });

  // ================= кульминация (накрывает всё, включая рамку беамера) =================
  S.imgFile('finalBg', finalBgFile(S), { x: 0, y: 0, w: 1920, h: 1080 }, { alt: 'Фон кульминации' });
  S.badge('finBadge', 'joke', 'Шуточный вывод', { x: 960 - 155, y: r.finBadge.y + 1 }, { size: 10, w: 310 });
  const big = (name, text, cy, size, color, extra = {}) => S.text(name, text, { x: 40, y: cy - 75, w: 1840, h: 150 }, {
    font: 'display', size, color, align: 'center', valign: 'middle', wrap: false, ...extra,
  });
  const c1 = r.l1.y + r.l1.h / 2, c2 = r.l2.y + r.l2.h / 2;      // центры строк до стрелки
  const c1s = r.l1s.y + r.l1s.h / 2, c2s = r.l2s.y + r.l2s.h / 2;  // после: строки уехали вверх и уменьшились до 80 %
  const glow = SH(30, 0, 0.45, C.red);
  big('l1', 'ТАРЕЛКА СХОДИТСЯ.', c1, 60, C.cream);
  big('l2', 'ГОСТЬ РАСХОДИТСЯ.', c2, 60, C.red, { shadow: glow });
  const small = (name, text, cy, color, extra = {}) => S.text(name, text, { x: 40, y: cy - 60, w: 1840, h: 120 }, {
    font: 'display', size: 48, color, align: 'center', valign: 'middle', wrap: false, ...extra,
  });
  small('l1s', 'ТАРЕЛКА СХОДИТСЯ.', c1s, C.cream);
  small('l2s', 'ГОСТЬ РАСХОДИТСЯ.', c2s, C.red, { shadow: glow });
  S.text('sub', [run('Плов не исчез. ', { color: C.cream }), run('Он в вас.', { color: C.gold })],
    { x: 40, y: r.sub.y - 6, w: 1840, h: r.sub.h + 12 }, { font: 'display', size: 38, align: 'center', valign: 'middle', wrap: false });
  S.img('arrow');

  // ================= анимации =================
  const swap = (from, to, at, dur = 200, o = {}) => [
    { t: from, fx: o.out || 'fadeOut', delay: at, dur },
    { t: to, fx: o.in || 'fade', delay: at, dur, sound: o.sound },
  ];
  const instant = (from, to, at, sound) => [{ t: from, fx: 'hide', delay: at }, { t: to, fx: 'appear', delay: at, sound }];

  // при входе: линии дорисовываются до первого цикла, счётчик 0,00 → 0,70; кнопка пульсирует
  S.auto(
    { t: 'headP0', fx: 'fadeOut', delay: 650, dur: 150 },
    { t: 'headE0', fx: 'fadeOut', delay: 650, dur: 150 },
    { t: 'seg1', fx: 'wipeLeft', delay: 650, dur: 900 },
    { t: 'headP1', fx: 'pop', delay: 1450, dur: 300 },
    { t: 'headE1', fx: 'pop', delay: 1450, dur: 300 },
    ...swap('num0', 'num1', 1050, 150),
    { t: 'num1', fx: 'pulse', delay: 1100, dur: 450, by: 107 },
    { t: 'moreA', fx: 'heartbeat', delay: 0, dur: 1800, by: 104 },
  );

  // 1–3) «ЕЩЁ ОДНУ ПОРЦИЮ!»: гость съедает 70 %, капгир бабушки добавляет порцию
  const KX = -0.1198, KY = -0.1389; // капгир влетает слева сверху (−230; −150 px)
  const cycle = (n, { rescale, oldCharts = [], newChart, oldLim, newLim }) => {
    const prevPlate = n === 2 ? 'plate1' : 'plateFull';
    const segAt = rescale ? 250 : 60, segDur = rescale ? 650 : 760;
    const fx = [
      { t: 'moreB', fx: 'move', path: 'M 0 0 L 0 0.0074 E', dur: 140, autoRev: true, sound: 'gulp' },
      { t: `guest${n - 1}`, fx: 'pulse', dur: 400, by: 104 },
      ...swap(prevPlate, 'plateLow', 0, 220),
      ...instant(n === 2 ? 'sv1' : `sv${n - 1}`, `svLow${n}`, 120),
      { t: `eat${n}`, fx: 'riseUp', delay: 60, dur: 380 },
      { t: `eat${n}`, fx: 'fadeOut', delay: 820, dur: 300 },
      // график: (перемасштабирование) + новый отрезок
      ...oldCharts.map((c) => ({ t: c, fx: 'fadeOut', dur: 300 })),
      ...(rescale ? [{ t: newChart, fx: 'fade', dur: 300 }, ...swap(`hline${oldLim}`, `hline${newLim}`, 0, 300), ...swap(`lim${oldLim}`, `lim${newLim}`, 0, 300), ...ytSwap(oldLim, newLim)] : []),
      { t: `headP${n - 1}`, fx: 'fadeOut', dur: 120 },
      { t: `headE${n - 1}`, fx: 'fadeOut', dur: 120 },
      { t: `seg${n}`, fx: 'wipeLeft', delay: segAt, dur: segDur },
      { t: `headP${n}`, fx: 'pop', delay: segAt + segDur - 80, dur: 300 },
      { t: `headE${n}`, fx: 'pop', delay: segAt + segDur - 80, dur: 300 },
      // табло
      ...instant(`cyc${n - 1}`, `cyc${n}`, 0),
      ...swap(`num${n - 1}`, `num${n}`, 380, 150),
      { t: `num${n}`, fx: 'pulse', delay: 430, dur: 450, by: 107 },
      // гость наедается
      ...swap(`guest${n - 1}`, `guest${n}`, 260, 220),
      // капгир: влёт, «высыпает» порцию, исчезает
      { t: 'kapgir', fx: 'fade', delay: 300, dur: 220 },
      { t: 'kapgir', fx: 'move', path: `M ${KX} ${KY} L 0 0 E`, delay: 300, dur: 285 },
      { t: 'kapgir', fx: 'teeter', delay: 585, dur: 300, deg: 8 },
      { t: 'kapgir', fx: 'fadeOut', delay: 890, dur: 330 },
      // ляган снова полон: +1
      ...swap('plateLow', 'plateFull', 720, 160),
      { t: 'plateFull', fx: 'pulse', delay: 720, dur: 500, by: 105, sound: 'plop' },
      ...instant(`svLow${n}`, `sv${n}`, 720),
      { t: 'add1', fx: 'riseUp', delay: 720, dur: 380 },
      { t: 'add1', fx: 'fadeOut', delay: 1400, dur: 300 },
    ];
    if (n === 2) fx.unshift(...instant('moreA', 'moreB', 0));
    return fx;
  };
  S.click(...cycle(2, { rescale: false }));
  S.click(...cycle(3, { rescale: true, oldCharts: ['chartA', 'seg1', 'seg2'], newChart: 'chartB', oldLim: 'A', newLim: 'B' }));
  S.click(...cycle(4, { rescale: true, oldCharts: ['chartB', 'seg3'], newChart: 'chartC', oldLim: 'B', newLim: 'C' }));

  // 4) перемотка до 20 циклов
  const T = FF0 + FFD; // 2300 мс
  const ticks = [];
  for (let k = 5; k <= 20; k++) {
    const t = tk(k);
    ticks.push(...instant(`num${k - 1}`, `num${k}`, t, k % 3 === 0 ? 'gulp' : 'tick'), ...instant(`cyc${k - 1}`, `cyc${k}`, t));
  }
  const t8 = tk(8), t12 = tk(12), t20 = tk(20);
  const jiggle = [], turbo = [], sway = [];
  for (let t = 0; t < T; t += 300) jiggle.push({ t: 'plateFull', fx: 'shake', delay: t, dur: 300, amp: 0.0016 });
  for (let t = 200; t < T - 200; t += 400) turbo.push({ t: 'kapgir', fx: 'teeter', delay: t, dur: 400, deg: 10 });
  for (let i = 0; i < 8; i++) sway.push({ t: 'guest20', fx: 'teeter', delay: t20 + 300 + i * 1600, dur: 1600, deg: i % 2 ? -1.5 : 1.5 });
  S.click(
    { t: 'ff', fx: 'zoomOut', dur: 250, sound: 'whoosh' },
    { t: 'ffSt', fx: 'pop', delay: 100, dur: 300 },
    { t: 'ffSt', fx: 'pulse', delay: 400, dur: 500, by: 106, repeat: 4 },
    { t: 'ffSt', fx: 'zoomOut', delay: T, dur: 250 },
    { t: 'sum', fx: 'pop', delay: T + 50, dur: 400, sound: 'ding' },
    { t: 'sum', fx: 'heartbeat', delay: T + 500, dur: 1800, by: 104 },
    // график: новый масштаб (0…21 × 0…25), отрезок 4…20 вытесняется слева направо
    { t: 'chartC', fx: 'fadeOut', dur: 300 },
    { t: 'seg4', fx: 'fadeOut', dur: 300 },
    { t: 'chartD', fx: 'fade', dur: 300 },
    ...swap('hlineC', 'hlineD', 0, 300),
    ...swap('limC', 'limD', 0, 300),
    ...ytSwap('C', 'D'),
    { t: 'headP4', fx: 'fadeOut', dur: 150 },
    { t: 'headE4', fx: 'fadeOut', dur: 150 },
    { t: 'seg20', fx: 'wipeLeft', delay: FF0, dur: FFD },
    { t: 'headP20', fx: 'pop', delay: T - 50, dur: 300 },
    { t: 'headE20', fx: 'pop', delay: T - 50, dur: 300 },
    { t: 'slope', fx: 'pop', delay: T + 50, dur: 500 },
    // табло бежит
    ...ticks,
    { t: 'num20', fx: 'pulse', delay: t20 + 50, dur: 450, by: 108 },
    // гость: полнеет, на 12-м цикле — «Чпок!», к 20-му кружится голова
    { t: 'guest4', fx: 'pulse', delay: tk(6), dur: 300, by: 104 },
    ...swap('guest4', 'guest8', t8, 160),
    { t: 'guest8', fx: 'pulse', delay: tk(10), dur: 300, by: 104 },
    ...swap('guest8', 'guest12', t12, 160),
    { t: 'guest12', fx: 'pulse', delay: tk(14), dur: 300, by: 104 },
    { t: 'guest12', fx: 'pulse', delay: tk(18), dur: 300, by: 104 },
    ...swap('guest12', 'guest20', t20, 200),
    ...sway,
    { t: 'btnFly', fx: 'appear', delay: t12 },
    { t: 'btnFly', fx: 'move', path: 'M 0 0 L 0.1354 -0.3889 E', delay: t12, dur: 1000 },
    { t: 'btnFly', fx: 'spin', delay: t12, dur: 1000, deg: 900 },
    { t: 'btnFly', fx: 'fadeOut', delay: t12 + 700, dur: 300 },
    { t: 'chpok', fx: 'pop', delay: t12, dur: 450, sound: 'boing' },
    { t: 'chpok', fx: 'fadeOut', delay: t12 + 1350, dur: 300 },
    // капгир в режиме «турбо», ляган трясётся
    { t: 'kapgir', fx: 'fade', delay: 0, dur: 200 },
    ...turbo,
    { t: 'kapgir', fx: 'fadeOut', delay: T, dur: 250 },
    ...jiggle,
  );

  // 5) кульминация: барабанная дробь → «ТАРЕЛКА СХОДИТСЯ.» → удар «ГОСТЬ РАСХОДИТСЯ.» (тарелка дроби на 1,4 с)
  const HIT = 1400;
  S.click(
    { t: 'finalBg', fx: 'fade', dur: 450, sound: 'drumroll' },
    { t: 'finBadge', fx: 'fade', delay: 200, dur: 500 },
    { t: 'l1', fx: 'riseUp', delay: 300, dur: 600, sound: 'swoosh' },
    { t: 'l2', fx: 'slam', delay: HIT, dur: 550, sound: 'stamp' },
    { t: 'l1', fx: 'shake', delay: HIT + 150, dur: 500, amp: 0.006 },
    { t: 'finBadge', fx: 'shake', delay: HIT + 150, dur: 500, amp: 0.006 },
    { t: 'l2', fx: 'shake', delay: HIT + 450, dur: 500, amp: 0.006 },
  );

  // 6) строки уезжают вверх (80 %), «Плов не исчез. Он в вас.» и стрелка в зал
  const MV = 800;
  const d1 = r5((c1s - c1) / 1080), d2 = r5((c2s - c2) / 1080);
  S.click(
    { t: 'l1', fx: 'move', path: `M 0 0 L 0 ${d1} E`, dur: MV, sound: 'whoosh' },
    { t: 'l1', fx: 'grow', dur: MV, by: 80 },
    { t: 'l2', fx: 'move', path: `M 0 0 L 0 ${d2} E`, dur: MV },
    { t: 'l2', fx: 'grow', dur: MV, by: 80 },
    ...instant('l1', 'l1s', MV + 20),
    ...instant('l2', 'l2s', MV + 20),
    { t: 'sub', fx: 'riseUp', delay: 250, dur: 600 },
    { t: 'arrow', fx: 'drop', delay: 500, dur: 700, sound: 'boing' },
    { t: 'sub', fx: 'pulse', delay: 900, dur: 400, by: 104, sound: 'sparkle' },
    { t: 'arrow', fx: 'heartbeat', delay: 1250, dur: 900, by: 106 },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 6 щелчков (→, PageDown, кликер или щелчок мышью — в том числе по кнопкам на слайде). '
    + '1–3 — «ЕЩЁ ОДНУ ПОРЦИЮ!»: +1 цикл (гость съедает 70 %, капгир бабушки добавляет порцию, график дорисовывается, табло 1,61 → 2,58 → 3,57). '
    + '4 — перемотка до 20 циклов (≈ 2,3 с: график, счётчик до 19,57, «Чпок!» на 12-м цикле, «≈ +1 порция за цикл»). '
    + '5 — кульминация на весь экран: барабанная дробь, «ТАРЕЛКА СХОДИТСЯ. ГОСТЬ РАСХОДИТСЯ.» Пауза на смех. '
    + '6 — «Плов не исчез. Он в вас.» и стрелка в зал. Следующий щелчок — слайд 8.';
}
