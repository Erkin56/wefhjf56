// Слайд 6. «Теорема 1 — Математика спасает тарелку!» (2:40–3:00).
// Слева родной точечный график с линиями Pₙ, n = 0…20 (P₀ = 1, Pₙ = 10/7 − (3/7)·0,3ⁿ; синяя линия с «полыми» точками)
// и золотой пунктир предела 10/7 ≈ 1,43; справа карточка теоремы (живой текст, дроби — столбиком из живых чисел),
// табло «После цикла» с ляганом и «ползунок» «Количество циклов».
// Щелчки = шаги «Далее» HTML: 1) ползунок сам едет 0 → 20 (бегунок — движение по пути), синхронно график
// дорисовывается слева направо (~2,4 с), табло тикает n = 0…20, Pₙ = 1,000 → 1,429, горка плова растёт;
// 2) печать «ТАРЕЛКА СХОДИТСЯ», через ~1,1 с — «НО ГОСТЯ ЭТО НЕ СПАСАЕТ», гость в панике и грустный тромбон.
// Триггеры: щелчок мышью по печати — удар печати ещё раз; по гостю — паника со звуком.
import { C, F } from '../lib/deck.mjs';

const LIM = 10 / 7;
const P = (n) => LIM - (3 / 7) * Math.pow(0.3, n); // точная формула, совпадает с рекуррентой
const N = 20;
const fmt3 = (v) => v.toFixed(3).replace('.', ',');
const MOUND = (a) => `#s06 .s06-plate .mound { transform: scale(${Math.pow(a, 0.42).toFixed(4)}, ${Math.pow(a, 0.78).toFixed(4)}) !important; }`;
const PX = (v) => v / 144; // px сцены → дюймы (радиусы скругления)
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });
const r5 = (v) => +v.toFixed(5);

/* ------------------------------------------------------------ захват ------------------------------------------------------------ */
export const capture = {
  states: [
    {
      name: 'start',
      items: [
        // ляган на табло: горка плова для P₀, P₁, P₂ и P₂₀ (Art.amountScale = (a^0,42; a^0,78))
        { name: 'plate0', sel: '.s06-plate', self: true, pad: 0, css: MOUND(P(0)) },
        { name: 'plate1', sel: '.s06-plate', self: true, pad: 0, css: MOUND(P(1)) },
        { name: 'plate2', sel: '.s06-plate', self: true, pad: 0, css: MOUND(P(2)) },
        { name: 'plate20', sel: '.s06-plate', self: true, pad: 0, css: MOUND(P(20)) },
      ],
      measure: [
        { name: 'chartSvg', sel: '.s06-chart svg' },
        { name: 'thm', sel: '.s06-thm' }, { name: 'badge', sel: '.s06-badge' }, { name: 'thmT', sel: '.s06-thm-t' },
        { name: 'lim', sel: '.s06-lim' }, { name: 'limop', sel: '.s06-limop' }, { name: 'limsub', sel: '.s06-limsub' },
        { name: 'limM1', sel: '.s06-lim > .math:nth-child(1)' }, { name: 'limFrac', sel: '.s06-lim > .s06-frac' },
        { name: 'limFracN', sel: '.s06-lim > .s06-frac span:first-child' }, { name: 'limFracD', sel: '.s06-lim > .s06-frac span:last-child' },
        { name: 'limM3', sel: '.s06-lim > .math:last-child' },
        { name: 'proof', sel: '.s06-proof' }, { name: 'proofI', sel: '.s06-proof i' },
        { name: 'proofM1', sel: '.s06-proof > .math:nth-of-type(1)' }, { name: 'proofM2', sel: '.s06-proof > .math:nth-of-type(2)' },
        { name: 'pf1', sel: '.s06-proof .s06-frac:nth-of-type(1)' }, { name: 'pf2', sel: '.s06-proof .s06-frac:nth-of-type(2)' },
        { name: 'pf1n', sel: '.s06-proof .s06-frac:nth-of-type(1) span:first-child' }, { name: 'pf1d', sel: '.s06-proof .s06-frac:nth-of-type(1) span:last-child' },
        { name: 'pf2n', sel: '.s06-proof .s06-frac:nth-of-type(2) span:first-child' }, { name: 'pf2d', sel: '.s06-proof .s06-frac:nth-of-type(2) span:last-child' },
        { name: 'readout', sel: '.s06-readout' }, { name: 'plate', sel: '.s06-plate' }, { name: 'cntLbl', sel: '.s06-vals .counter-label' },
        { name: 'nLine', sel: '.s06-n' }, { name: 'pLine', sel: '.s06-p' }, { name: 'pv', sel: '.s06-pv' }, { name: 'unit', sel: '.s06-unit' },
        { name: 'ctlL', sel: '.s06-ctl-l' }, { name: 'range', sel: '#s06-range' }, { name: 'ticks', sel: '.s06-ticks' },
        { name: 'tk0', sel: '.s06-ticks span:nth-child(1)' }, { name: 'tk5', sel: '.s06-ticks span:nth-child(2)' }, { name: 'tk10', sel: '.s06-ticks span:nth-child(3)' },
        { name: 'tk15', sel: '.s06-ticks span:nth-child(4)' }, { name: 'tk20', sel: '.s06-ticks span:nth-child(5)' },
      ],
    },
    {
      name: 'final',
      actions: [{ next: 2, each: 3000 }],
      wait: 2000,
      css: '#s06 .s06-guest.is-on .art, #s06 .s06-verdict .stamp, #s06 .art .eyes { animation: none !important; }',
      items: [
        // гость-стикер в панике (круг с красным кольцом, повёрнут −8°)
        { name: 'guest', sel: '.s06-guest', self: true, pad: 30 },
      ],
      measure: [
        // печати повёрнуты: здесь — их описанные прямоугольники, размеры без поворота считаем ниже
        { name: 'st1', sel: '.s06-st1' }, { name: 'st2', sel: '.s06-st2' }, { name: 'guestBox', sel: '.s06-guest' },
      ],
    },
  ],
};

/* ------------------------------------------------------------ сборка ------------------------------------------------------------ */
const run = (text, options = {}) => ({ text, options: { ...options } }); // копия: pptxgenjs меняет объект опций
const SUB = -400; // нижний индекс: смещение −20 % кегля; кегль индекса PowerPoint уменьшает сам
const SUP = 600;  // верхний индекс: +30 %
const m = (text, o = {}) => run(text, { fontFace: F.serif, ...o });               // математика прямым
const v = (text, o = {}) => run(text, { fontFace: F.serif, italic: true, ...o });  // переменная курсивом
const arrow = (o = {}) => run('→', { ...o, fontFace: F.body, italic: false });    // стрелка — шрифтом текста (как в HTML)

// размер повёрнутого прямоугольника по его описанному прямоугольнику (поворот вокруг центра)
function unrotate(bb, deg) {
  const a = Math.abs(deg) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), d = c * c - s * s;
  const w = (bb.w * c - bb.h * s) / d, h = (bb.h * c - bb.w * s) / d;
  const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
const grow = (b, d) => ({ x: b.x - d, y: b.y - d, w: b.w + 2 * d, h: b.h + 2 * d });

export function build(S) {
  S.start({ layout: 'CHROME', eyebrow: 'Теорема 1', title: 'Математика спасает тарелку!', section: 'Теорема 1' });
  const r = S.rects;
  // номер слайда — своим текстом: у pptxgenjs поле номера получает id, совпадающий с id 24-й фигуры (ломает анимации)
  S.slide._slideNumberProps = null;
  S.text('sldNum', String(+S.id), { x: 1700, y: 1032, w: 110, h: 36 }, { font: 'mono', size: 11, bold: true, color: C.cream, align: 'right', valign: 'middle', wrap: false });

  // ================= график (как Plot в HTML: svg 70,290 1160×660, поля l120 r40 t50 b100) =================
  const cs = r.chartSvg;
  const PL = cs.x + 120, PT = cs.y + 50, PW = cs.w - 160, PH = cs.h - 150; // 190, 340, 1000, 510
  const X = (n) => PL + (PW * n) / N;
  const Y = (val) => PT + PH - (PH * (val - 0.8)) / 0.8;
  const xs = Array.from({ length: N + 1 }, (_, n) => n);
  const data = (k) => [{ name: 'цикл n', values: xs.slice(0, k + 1) }, { name: 'на тарелке, Pn', values: xs.slice(0, k + 1).map((n) => +P(n).toFixed(5)) }];
  const layoutOf = (plot, f) => ({ x: r5((plot.x - f.x) / f.w), y: r5((plot.y - f.y) / f.h), w: r5(plot.w / f.w), h: r5(plot.h / f.h) });
  const PLOT = { x: PL, y: PT, w: PW, h: PH };
  const axes = { catAxisMinVal: 0, catAxisMaxVal: N, catAxisMajorUnit: 5, valAxisMinVal: 0.8, valAxisMaxVal: 1.6, valAxisMajorUnit: 0.2, showLegend: false, showTitle: false };
  const GRID = '2E3034';
  // сетка (подписи осей — живым текстом ниже: десятичная запятая, как в HTML)
  const GF = grow(PLOT, 20);
  S.chart('chartGrid', 'scatter', data(0), GF, {
    ...axes, layout: layoutOf(PLOT, GF), chartColors: [C.blue], lineSize: 0, lineDataSymbol: 'none',
    catAxisHidden: true, valAxisHidden: true, catAxisLineShow: false, valAxisLineShow: false,
    catGridLine: { color: GRID, size: 1 }, valGridLine: { color: GRID, size: 1 },
  });
  // предел 10/7: пунктир под линией графика
  const yl = Y(LIM);
  S.shape('limLine', 'line', { x: PL, y: yl, w: PW, h: 0 }, { line: C.gold, lineW: 2, dash: 'dash' });
  S.text('limLbl', '10/7 ≈ 1,43', { x: PL + PW - 10 - 320, y: yl - 16 - 38, w: 320, h: 46 }, {
    font: 'serif', bold: true, size: 15, color: C.gold, align: 'right', valign: 'bottom', wrap: false, shadow: SH(6, 0, 1, C.bg),
  });
  // оси со стрелками
  S.slide.addShape(S.pres.ShapeType.line, { ...S.box({ x: PL, y: PT + PH, w: PW + 32, h: 0 }), objectName: S._name('xAxis'), line: { color: C.cream3, width: 2, endArrowType: 'triangle' } });
  S.slide.addShape(S.pres.ShapeType.line, { ...S.box({ x: PL, y: PT - 32, w: 0, h: PH + 32 }), objectName: S._name('yAxis'), line: { color: C.cream3, width: 2, beginArrowType: 'triangle' } });
  // подписи делений и осей
  for (const val of [0.8, 1, 1.2, 1.4, 1.6]) {
    S.text(`yt${Math.round(val * 10)}`, val.toFixed(1).replace('.', ','), { x: PL - 18 - 90, y: Y(val) - 20, w: 90, h: 40 }, { font: 'mono', size: 12, bold: true, color: C.muted, align: 'right', valign: 'middle', wrap: false });
  }
  for (const n of [0, 5, 10, 15, 20]) {
    S.text(`xt${n}`, String(n), { x: X(n) - 40, y: PT + PH + 12, w: 80, h: 40 }, { font: 'mono', size: 12, bold: true, color: C.muted, align: 'center', valign: 'middle', wrap: false });
  }
  S.text('yLab', [v('P', { fontSize: 17 }), v('n', { fontSize: 17, baseline: SUB })], { x: PL - 18 - 120, y: PT - 30 - 44, w: 120, h: 50 }, { font: 'serif', size: 17, color: C.cream, align: 'right', valign: 'bottom', wrap: false });
  S.text('xLab', [m('циклы, ', { fontSize: 17, italic: true }), v('n', { fontSize: 17 })], { x: PL + PW - 260, y: PT + PH + 80 - 38, w: 260, h: 48 }, { font: 'serif', italic: true, size: 17, color: C.cream, align: 'right', valign: 'bottom', wrap: false });

  // ряд Pₙ: две совмещённые диаграммы (линия с синими кругами + тёмные середины = «полые» точки, как в HTML)
  const SF = grow(PLOT, 24);
  const series = { ...axes, layout: layoutOf(PLOT, SF), catAxisHidden: true, valAxisHidden: true, catAxisLineShow: false, valAxisLineShow: false, catGridLine: { style: 'none' }, valGridLine: { style: 'none' } };
  S.chart('chartLine', 'scatter', data(N), SF, { ...series, chartColors: [C.blue], lineSize: 4, lineDataSymbol: 'circle', lineDataSymbolSize: 10, lineDataSymbolLineSize: 0.75, lineDataSymbolLineColor: C.blue });
  S.chart('chartDots', 'scatter', data(N), SF, { ...series, chartColors: [C.bg], lineSize: 0, lineDataSymbol: 'circle', lineDataSymbolSize: 6, lineDataSymbolLineSize: 0.5, lineDataSymbolLineColor: C.bg });
  // «голова» линии: на старте — в P₀, после проезда — в P₂₀
  S.shape('head0', 'ellipse', { x: X(0) - 13, y: Y(P(0)) - 13, w: 26, h: 26 }, { fill: C.blue, line: C.bg, lineW: 2.5 });
  S.shape('head20', 'ellipse', { x: X(N) - 13, y: Y(P(N)) - 13, w: 26, h: 26 }, { fill: C.blue, line: C.bg, lineW: 2.5 });

  // ================= карточка теоремы =================
  const th = r.thm;
  S.shape('thmCard', 'round', th, { fill: C.cream, radius: PX(22), shadow: SH(25, 12, 0.35) });
  S.badge('thmBadge', 'math', 'Математика', { x: r.badge.x - 6, y: r.badge.y + 1.5 }, { size: 10, w: r.badge.w + 6 });
  const ink = { color: C.ink, fontSize: 14.5 };
  S.text('thmT', [
    m('Теорема 1.', { ...ink, bold: true }), m(' Пусть ', ink), v('P', ink), m('0', { ...ink, baseline: SUB }), m(' = 1', { ...ink, breakLine: true }),
    m('и ', ink), v('P', ink), v('n', { ...ink, baseline: SUB }), m('+1', { ...ink, baseline: SUB }), m(' = 0,3·', ink), v('P', ink), v('n', { ...ink, baseline: SUB }), m(' + 1. Тогда', ink),
  ], { x: r.thmT.x, y: r.thmT.y - 2, w: th.x + th.w - r.thmT.x - 12, h: r.thmT.h + 6 }, { font: 'serif', size: 14.5, color: C.ink, lineMul: 1.12, wrap: false });

  // lim P = 10/7 ≈ 1,43 (27 pt; дробь столбиком: числитель, черта, знаменатель)
  const big = { color: C.ink, fontSize: 27 };
  const lo = r.limop, ls = r.limsub;
  S.text('limWord', [m('lim', big)], { x: lo.x - 10, y: lo.y - 12, w: lo.w + 20, h: 60 }, { font: 'serif', size: 27, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  S.text('limSub', [v('n', { color: C.ink, fontSize: 11.5 }), arrow({ color: C.ink, fontSize: 11.5 }), m('∞', { color: C.ink, fontSize: 11.5 })], { x: ls.x - 14, y: ls.y - 2, w: ls.w + 28, h: ls.h + 4 }, { font: 'serif', size: 11.5, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  const limY = r.lim.y + r.lim.h / 2; // ось строки (центр дроби)
  const M1R = r.limM1.x + r.limM1.w;   // правый край «Pₙ =»
  S.text('limP', [v('P', big), v('n', { ...big, baseline: SUB }), m(' =', big)], { x: M1R - 140, y: limY - 34, w: 146, h: 60 }, { font: 'serif', size: 27, color: C.ink, align: 'right', valign: 'middle', wrap: false });
  const fr = r.limFrac, fN = r.limFracN, fD = r.limFracD;
  const fcx = fr.x + fr.w / 2;
  S.text('limNum', '10', { x: fcx - 40, y: fN.y - 4, w: 80, h: fN.h }, { font: 'serif', size: 21, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  S.shape('limBar', 'line', { x: fr.x + 2, y: fN.y + fN.h - 1.5, w: fr.w - 4, h: 0 }, { line: C.ink, lineW: 1.5 });
  S.text('limDen', '7', { x: fcx - 40, y: fD.y + 2, w: 80, h: fD.h }, { font: 'serif', size: 21, color: C.ink, align: 'center', valign: 'middle', wrap: false });
  S.text('limVal', [m('≈ 1,43', big)], { x: r.limM3.x - 4, y: limY - 34, w: th.x + th.w - r.limM3.x - 8, h: 60 }, { font: 'serif', size: 27, color: C.ink, valign: 'middle', wrap: false });

  // Доказательство: Pₙ = 10/7 − 3/7·0,3ⁿ, а 0,3ⁿ → 0. ∎ (14 pt; дроби 12,5 pt столбиком)
  const pr = { color: C.ink2, fontSize: 14 };
  const sm = { color: C.ink2, fontSize: 12.5 };
  const row1 = r.proofI.y + r.proofI.h / 2, row2 = r.proofM2.y + r.proofM2.h / 2;
  const box1 = (x, w, align = 'left') => ({ x, y: row1 - 22, w, h: 44, align });
  // формула строки 1 сдвинута вправо на DX: курсив «Доказательство:» в Cambria шире, чем в HTML (PT Serif)
  const DX = 40;
  const sh = (b) => ({ ...b, x: b.x + DX });
  const f1 = sh(r.pf1), f2 = sh(r.pf2);
  S.text('prI', [run('Доказательство:', { ...pr, fontFace: F.serif, italic: true })], box1(r.proofI.x, 300), { font: 'serif', size: 14, color: C.ink2, valign: 'middle', wrap: false });
  S.text('prP', [v('P', pr), v('n', { ...pr, baseline: SUB }), m(' =', pr)], { ...box1(f1.x - 6 - 90, 90), align: 'right' }, { font: 'serif', size: 14, color: C.ink2, align: 'right', valign: 'middle', wrap: false });
  const frac = (k, f, n, d, num, den) => {
    const cx = f.x + f.w / 2;
    S.text(`pf${k}n`, num, { x: cx - 30, y: n.y - 3, w: 60, h: n.h + 2 }, { font: 'serif', size: 12.5, color: C.ink2, align: 'center', valign: 'middle', wrap: false });
    S.shape(`pf${k}bar`, 'line', { x: f.x + 1, y: n.y + n.h - 1, w: f.w - 2, h: 0 }, { line: C.ink2, lineW: 1 });
    S.text(`pf${k}d`, den, { x: cx - 30, y: d.y + 1, w: 60, h: d.h + 2 }, { font: 'serif', size: 12.5, color: C.ink2, align: 'center', valign: 'middle', wrap: false });
  };
  frac(1, f1, sh(r.pf1n), sh(r.pf1d), '10', '7');
  frac(2, f2, sh(r.pf2n), sh(r.pf2d), '3', '7');
  S.text('prMinus', [m('−', pr)], { ...box1(f1.x + f1.w, f2.x - f1.x - f1.w) }, { font: 'serif', size: 14, color: C.ink2, align: 'center', valign: 'middle', wrap: false });
  S.text('prPow', [m('·0,3', pr), v('n', { ...pr, baseline: SUP }), m(',', pr)], box1(f2.x + f2.w, 110), { font: 'serif', size: 14, color: C.ink2, valign: 'middle', wrap: false });
  S.text('prEnd', [m('а 0,3', pr), v('n', { ...pr, baseline: SUP }), m(' ', pr), arrow(pr), m(' 0. ∎', pr)], { x: r.proof.x, y: row2 - 22, w: 300, h: 44 }, { font: 'serif', size: 14, color: C.ink2, valign: 'middle', wrap: false });

  // ================= табло «После цикла» =================
  const ro = r.readout;
  S.shape('readout', 'round', ro, { fill: C.panel, line: C.line, lineW: 0.75, radius: PX(22), shadow: SH(25, 12, 0.35) });
  S.img('plate0'); S.img('plate1'); S.img('plate2'); S.img('plate20');
  S.text('cntLbl', 'ПОСЛЕ ЦИКЛА', { x: r.cntLbl.x, y: r.cntLbl.y - 4, w: 320, h: r.cntLbl.h + 8 }, { size: 10, bold: true, color: C.muted, spacing: 1.6, valign: 'middle', wrap: false });
  const nl = r.nLine, pl = r.pLine;
  for (let n = 0; n <= N; n++) {
    S.text(`n${n}`, [run('n = ', { fontFace: F.mono, fontSize: 17, color: C.cream3 }), run(String(n), { fontFace: F.mono, fontSize: 17, bold: true, color: C.cream })],
      { x: nl.x, y: nl.y - 3, w: 330, h: nl.h + 6 }, { font: 'mono', size: 17, valign: 'middle', wrap: false });
    S.text(`p${n}`, [
      v('P', { color: C.cream, fontSize: 19 }), m(String(n), { color: C.cream, fontSize: 19, baseline: SUB }), m(' = ', { color: C.cream, fontSize: 19 }),
      run(fmt3(P(n)), { fontFace: F.mono, fontSize: 19, bold: true, color: C.blue }), run(' порции', { fontFace: F.body, fontSize: 13, bold: true, color: C.muted }),
    ], { x: pl.x, y: pl.y - 3, w: ro.x + ro.w - pl.x - 6, h: pl.h + 6 }, { font: 'serif', size: 19, valign: 'middle', wrap: false });
  }

  // ================= «ползунок» «Количество циклов» =================
  S.text('ctlL', 'КОЛИЧЕСТВО ЦИКЛОВ', { x: r.ctlL.x, y: r.ctlL.y - 4, w: 560, h: r.ctlL.h + 8 }, { size: 11, bold: true, color: C.gold, spacing: 1.5, valign: 'middle', wrap: false });
  const rg = r.range, tcy = rg.y + rg.h / 2;
  S.shape('track', 'round', { x: rg.x, y: tcy - 7, w: rg.w, h: 14 }, { fill: C.line, radius: PX(7) });
  S.shape('trackFill', 'round', { x: rg.x, y: tcy - 7, w: rg.w, h: 14 }, { fill: C.gold, radius: PX(7) });
  S.shape('knob', 'ellipse', { x: rg.x + 26 - 22.5, y: tcy - 22.5, w: 45, h: 45 }, { fill: C.cream, line: C.gold, lineW: 3.5, shadow: SH(8, 3, 0.5) });
  for (const t of [0, 5, 10, 15, 20]) {
    const tk = r[`tk${t}`];
    S.text(`tick${t}`, String(t), { x: tk.x + tk.w / 2 - 30, y: tk.y - 4, w: 60, h: tk.h + 8 }, { font: 'mono', size: 10, color: C.muted, align: 'center', valign: 'middle', wrap: false });
  }

  // ================= печати и гость =================
  const b1 = unrotate(r.st1, 6), b2 = unrotate(r.st2, 5);
  S.shape('st1Ring', 'round', grow(b1, 8), { line: C.gold, lineW: 2, radius: PX(26), rotate: -6 });
  S.stamp('st1', 'ТАРЕЛКА СХОДИТСЯ', b1, { color: C.gold, size: 27, rot: -6, fill: C.bg, fillT: 20, lineW: 4 });
  S.stamp('st2', 'НО ГОСТЯ ЭТО НЕ СПАСАЕТ', b2, { color: C.red, size: 20, rot: 5, fill: C.bg, fillT: 15, lineW: 4 });
  S.img('guest');

  // ================= анимации =================
  // 1) проезд 0 → 20 циклов: график вытесняется слева направо за T; бегунок и золотая заливка идут синхронно
  const T = 2400;
  const d0 = Math.round((T * (PL - SF.x)) / SF.w);  // момент, когда «шторка» доходит до n = 0
  const D = Math.round((T * PW) / SF.w);           // …и проходит от n = 0 до n = 20
  const tn = (k) => Math.round(d0 + (D * (k - 0.5)) / N); // показания меняются, когда график проходит n − ½ (как Math.round в HTML)
  const instant = (from, to, at, sound) => [{ t: from, fx: 'hide', delay: at }, { t: to, fx: 'appear', delay: at, sound }];
  const ticks = [];
  for (let k = 1; k <= N; k++) ticks.push(...instant(`n${k - 1}`, `n${k}`, tn(k), 'tick'), ...instant(`p${k - 1}`, `p${k}`, tn(k)));
  const plate = (from, to, at) => [{ t: from, fx: 'fadeOut', delay: at, dur: 220 }, { t: to, fx: 'fade', delay: at, dur: 220 }];
  S.click(
    { t: 'head0', fx: 'fadeOut', dur: 150, sound: 'whoosh' },
    { t: 'chartLine', fx: 'wipeLeft', dur: T },
    { t: 'chartDots', fx: 'wipeLeft', dur: T },
    { t: 'head20', fx: 'pop', delay: T - 60, dur: 300 },
    { t: 'knob', fx: 'move', path: `M 0 0 L ${r5((rg.w - 52) / 1920)} 0 E`, delay: d0, dur: D, accel: 0, decel: 0 },
    { t: 'trackFill', fx: 'wipeLeft', delay: d0, dur: D },
    ...ticks,
    ...plate('plate0', 'plate1', tn(1)), ...plate('plate1', 'plate2', tn(2)), ...plate('plate2', 'plate20', tn(3)),
    { t: 'p20', fx: 'pulse', delay: d0 + D + 60, dur: 400, by: 106 },
  );
  // 2) «ТАРЕЛКА СХОДИТСЯ» (удар + звон), через 1,1 с — «НО ГОСТЯ ЭТО НЕ СПАСАЕТ», гость в панике, грустный тромбон
  const S2 = 1100;
  S.click(
    { t: 'st1Ring', fx: 'slam', dur: 500, sound: 'stamp' },
    { t: 'st1', fx: 'slam', dur: 500 },
    { t: 'st1', fx: 'shake', delay: 480, dur: 360, amp: 0.003, sound: 'ding' },
    { t: 'st1Ring', fx: 'shake', delay: 480, dur: 360, amp: 0.003 },
    { t: 'st2', fx: 'slam', delay: S2, dur: 500, sound: 'stamp' },
    { t: 'guest', fx: 'pop', delay: S2 + 60, dur: 600, sound: 'fail' },
    { t: 'guest', fx: 'shake', delay: S2 + 600, dur: 960, amp: 0.0018 },
    { t: 'st2', fx: 'shake', delay: S2 + 480, dur: 360, amp: 0.003 },
  );

  // триггеры: печать — ещё один удар; гость — паника
  S.trigger('st1', { t: 'st1Ring', fx: 'slam', dur: 500, sound: 'stamp' }, { t: 'st1', fx: 'slam', dur: 500 });
  S.trigger('st2', { t: 'st2', fx: 'slam', dur: 500, sound: 'stamp' });
  S.trigger('guest', { t: 'guest', fx: 'shake', dur: 960, amp: 0.0018, sound: 'fail' });

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 2 щелчка (→, PageDown, кликер). 1 — «ползунок» сам проезжает 20 циклов (≈ 2,4 с): график Pₙ дорисовывается, '
    + 'табло тикает n = 0…20, P = 1,000 → 1,429 порции. 2 — печать «ТАРЕЛКА СХОДИТСЯ», через секунду «НО ГОСТЯ ЭТО НЕ СПАСАЕТ» и гость в панике. '
    + 'Щелчок мышью по печати — удар ещё раз, по гостю — паника. Следующий щелчок — слайд 7.';
}
