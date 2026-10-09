// Слайд 2. Три научные гипотезы: три карточки переворачиваются и показывают «результаты».
import { C, F } from '../lib/deck.mjs';

const CARD = (i) => `.s02-card[data-i="${i}"]`;
// печати и вывод — без наклона/анимации, чтобы замерить «ровный» прямоугольник (наклон задаём в PowerPoint)
const FLAT = '#s02 .s02-stamp, #s02 .s02-stamp.is-slam { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }'
  + ' #s02 .s02-quip .sticker { transform: none !important; transition: none !important; }'
  + ' #s02 .s02-gostbtn, #s02 .s02-gostbtn.is-shown { animation: none !important; transition: none !important; transform: none !important; }';
const GOST_FLAT = '#s02 .s02-gost, #s02 .s02-gost.is-on { transform: none !important; transition: none !important; }'
  + ' #s02 .s02-gost.is-done .s02-sheet { animation: none !important; }'
  + ' #s02 .s02-gost-badge, #s02 .s02-gost.is-done .s02-gost-badge { transform: none !important; transition: none !important; }';
// у «включённых» оверлеев в CSS явно visibility: visible — при изоляции их надо прятать отдельно
const HIDE_OVER = '#s02 .s02-dim, #s02 .s02-quip, #s02 .s02-treecount { visibility: hidden !important; }';
const RES_CLIP = { y: 40, h: 320 }; // исследователь ниже верхнего края карточки не нужен

export const capture = {
  states: [
    {
      name: 'start',
      items: [
        { name: 'res0', sel: '.s02-researcher', pad: 20, clip: RES_CLIP },
        ...[0, 1, 2].map((i) => ({ name: `front${i}`, sel: `${CARD(i)} .s02-front`, pad: 44, hide: ['.s02-num', '.s02-claim', '.s02-check'] })),
      ],
      measure: [
        ...[0, 1, 2].flatMap((i) => [
          { name: `card${i}`, sel: CARD(i) },
          { name: `num${i}`, sel: `${CARD(i)} .s02-num` },
          { name: `claim${i}`, sel: `${CARD(i)} .s02-claim` },
          { name: `chk${i}`, sel: `${CARD(i)} .s02-check` },
          { name: `key${i}`, sel: `${CARD(i)} .s02-check .key` },
        ]),
        { name: 'foot', sel: '.s02-foot' },
        { name: 'title', sel: '.s02-title' },
        { name: 'eyebrow', sel: '.s02-head .eyebrow' },
      ],
    },
    {
      name: 'open1', actions: [{ next: 1, each: 2600 }], css: FLAT,
      items: [
        { name: 'back0', sel: `${CARD(0)} .s02-back`, pad: 44, hide: ['.s02-bhead', '.s02-stampzone', '.s02-mapbox', '.s02-fact'] },
        { name: 'map', sel: `${CARD(0)} .s02-mapbox`, pad: 10, hide: ['.s02-city'] },
        ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ name: `city${k}`, sel: `${CARD(0)} .s02-map > g:nth-of-type(${k + 1})`, pad: 6 })),
        { name: 'res1', sel: '.s02-researcher', pad: 20, clip: RES_CLIP },
      ],
      measure: [
        { name: 'bnum0', sel: `${CARD(0)} .s02-bnum` }, { name: 'bclaim0', sel: `${CARD(0)} .s02-bclaim` },
        { name: 'stamp0', sel: `${CARD(0)} .s02-stamp` },
        { name: 'fact0', sel: `${CARD(0)} .s02-fact` }, { name: 'fbadge0', sel: `${CARD(0)} .s02-fact .badge` },
      ],
    },
    {
      name: 'tree', actions: [{ next: 2, each: 2600 }], css: FLAT,
      items: [
        { name: 'treeFull', sel: '.s02-treefly-svg', clip: { x: 0, y: 64, w: 1920, h: 956 }, css: HIDE_OVER },
      ],
      measure: [
        { name: 'tc', sel: '.s02-treecount' }, { name: 'tcBadge', sel: '.s02-tc-top .badge' },
        { name: 'tcLabel', sel: '.s02-tc-top .counter-label' }, { name: 'tcVal', sel: '.s02-treecount-v' },
        { name: 'quip', sel: '.s02-quip .sticker' },
      ],
    },
    {
      name: 'settled', actions: [{ next: 3, each: 2600 }], css: FLAT,
      items: [
        { name: 'back1', sel: `${CARD(1)} .s02-back`, pad: 44, hide: ['.s02-bhead', '.s02-stampzone', '.s02-treebox', '.s02-fact'] },
        { name: 'thumb', sel: `${CARD(1)} .s02-treebox`, self: true, pad: 0, hide: ['.s02-n'] },
        { name: 'res3', sel: '.s02-researcher', pad: 20, clip: RES_CLIP },
      ],
      measure: [
        { name: 'bnum1', sel: `${CARD(1)} .s02-bnum` }, { name: 'bclaim1', sel: `${CARD(1)} .s02-bclaim` },
        { name: 'stamp1', sel: `${CARD(1)} .s02-stamp` }, { name: 'stBig', sel: `${CARD(1)} .s02-st-big` }, { name: 'stSmall', sel: `${CARD(1)} .s02-st-small` },
        { name: 'fact1', sel: `${CARD(1)} .s02-fact` }, { name: 'fbadge1', sel: `${CARD(1)} .s02-fact .badge` },
        { name: 'nlab', sel: `${CARD(1)} .s02-n` }, { name: 'thumbIn', sel: `${CARD(1)} .s02-treethumb` },
      ],
    },
    {
      name: 'open3', actions: [{ next: 4, each: 2600 }], css: FLAT,
      items: [
        { name: 'back2', sel: `${CARD(2)} .s02-back`, pad: 44, hide: ['.s02-bhead', '.s02-stampzone', '.s02-award', '.s02-fact'] },
        { name: 'medal', sel: `${CARD(2)} .s02-medal`, pad: 16 },
        { name: 'plate', sel: `${CARD(2)} .s02-plate`, pad: 12 },
        { name: 'res4', sel: '.s02-researcher', pad: 20, clip: RES_CLIP },
      ],
      measure: [
        { name: 'bnum2', sel: `${CARD(2)} .s02-bnum` }, { name: 'bclaim2', sel: `${CARD(2)} .s02-bclaim` },
        { name: 'stamp2', sel: `${CARD(2)} .s02-stamp` },
        { name: 'fact2', sel: `${CARD(2)} .s02-fact` }, { name: 'fbadge2', sel: `${CARD(2)} .s02-fact .badge` },
        { name: 'gostBtn', sel: '.s02-gostbtn' },
      ],
    },
    {
      name: 'gost', actions: [{ next: 5, each: 2600 }], css: GOST_FLAT,
      items: [
        { name: 'sheet', sel: '.s02-sheet', pad: 40, hide: ['.s02-gost-text', '.s02-sheet-label', '.s02-tb'], css: '#s02 .s02-gost-badge { visibility: hidden !important; }' },
        { name: 'tb', sel: '.s02-tb', pad: 4, css: '#s02 .s02-gost { visibility: hidden !important; } #s02 .s02-tb, #s02 .s02-tb * { color: transparent !important; }' },
      ],
      measure: [
        { name: 'gost', sel: '.s02-gost' }, { name: 'sheetM', sel: '.s02-sheet' }, { name: 'field', sel: '.s02-sheet-field' },
        { name: 'glabel', sel: '.s02-sheet-label' }, { name: 'gtext', sel: '.s02-gost-text' }, { name: 'gtype', sel: '.s02-type' },
        ...[1, 2, 3, 4, 5, 6].map((k) => ({ name: `tb${k}`, sel: `.s02-tb > span:nth-child(${k})` })),
        { name: 'gbadge', sel: '.s02-gost-badge' },
      ],
    },
  ],
};


// --- помощники ---
const run = (text, options = {}) => ({ text, options });
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });
const grow = (r, l, t = l, rr = l, b = t) => ({ x: r.x - l, y: r.y - t, w: r.w + l + rr, h: r.h + t + b });
const SP = (n) => ' '.repeat(n); // отступ первой строки под бейдж (Calibri: пробел = 0,226 em)

// поворот прямоугольника вокруг общего центра (весь лист «по ГОСТу» наклонён на −0,6°)
function rotAround(r, pivot, deg) {
  const a = deg * Math.PI / 180;
  const cx = r.x + r.w / 2 - pivot.x, cy = r.y + r.h / 2 - pivot.y;
  const nx = pivot.x + cx * Math.cos(a) - cy * Math.sin(a), ny = pivot.y + cx * Math.sin(a) + cy * Math.cos(a);
  return { x: nx - r.w / 2, y: ny - r.h / 2, w: r.w, h: r.h };
}

const CLAIMS = ['«Все узбеки\nиз Ташкента»', '«У узбеков много\nродственников»', '«Узбеки постоянно\nедят плов»'];
const TOPICS = ['Тема: Ташкент', 'Тема: родственники', 'Тема: плов'];
const COUNT = [1, 9, 37, 93, 128, 139, 140]; // счётчик выборки: ease-in-out за 1 с, как в HTML
const TREE_K0 = +(0.86 * 540 / 1920).toFixed(3); // древо вылетает из карточки 2 в масштабе ≈ 24 %
const THUMB_K = 492 / 1920;                  // и возвращается в миниатюру (25,6 %)

export function build(S) {
  S.start({ layout: 'CHROME', section: 'Гипотезы' });
  const r = S.rects;

  // ---------- шапка ----------
  S.slide.addText('Что российские студенты\nзнают об узбеках?', { placeholder: 'title' });
  S.shape('eyeDash', 'round', { x: 110, y: 113, w: 46, h: 3 }, { fill: C.gold, radius: 0.01 });
  S.text('eyebrow', 'ТРИ НАУЧНЫЕ ГИПОТЕЗЫ', { x: 170, y: r.eyebrow.y, w: 640, h: r.eyebrow.h }, { size: 11, bold: true, color: C.gold, spacing: 3.5, valign: 'middle', wrap: false });

  // ---------- исследователь (за карточками): настроения serious → smug → happy → proud → serious ----------
  for (const n of ['res0', 'res1', 'res3', 'res4']) S.img(n);

  // ---------- карточки ----------
  const front = (i) => [`front${i}`, `num${i}`, `claim${i}`, `chk${i}`, `key${i}`];
  const back = (i) => [`back${i}`, `bnum${i}`, `bclaim${i}`];
  for (let i = 0; i < 3; i++) {
    // лицевая сторона: кремовая карточка-гипотеза
    S.img(`front${i}`);
    S.text(`num${i}`, `ГИПОТЕЗА № ${i + 1}`, r[`num${i}`], { size: 11, bold: true, color: C.red2, spacing: 3, valign: 'middle', wrap: false, pad: { r: 80 } });
    const cl = r[`claim${i}`];
    S.text(`claim${i}`, CLAIMS[i], { x: cl.x - 10, y: cl.y, w: cl.w + 20, h: cl.h }, { font: 'display', size: 18.5, color: C.ink, align: 'center', valign: 'middle', lineMul: 0.88 });
    const ck = r[`chk${i}`], ky = r[`key${i}`];
    S.text(`chk${i}`, 'ПРОВЕРИТЬ', ck, {
      font: 'display', size: 12, color: C.cream, align: 'center', valign: 'middle', fill: C.red, radius: 0.5, wrap: false,
      inset: [(ky.x + ky.w + 14 - ck.x) / 2, 13, 0, 0], shadow: SH(0, 3, 1, C.red3),
    });
    S.text(`key${i}`, String(i + 1), ky, { font: 'mono', size: 7, bold: true, color: C.cream, fill: 'EC6553', radius: 0.5, align: 'center', valign: 'middle', wrap: false });

    // оборот: тёмный «протокол»
    S.img(`back${i}`);
    S.text(`bnum${i}`, `РЕЗУЛЬТАТ № ${i + 1}`, r[`bnum${i}`], { size: 10, bold: true, color: C.gold, spacing: 2.5, valign: 'middle', wrap: false, pad: { r: 60 } });
    S.text(`bclaim${i}`, TOPICS[i], r[`bclaim${i}`], { size: 10, color: C.muted, align: 'right', valign: 'middle', wrap: false, pad: { l: 90 } });
  }

  // карточка 1: карта и города
  S.img('map');
  for (let k = 0; k < 7; k++) S.img(`city${k}`);
  // карточка 2: миниатюра древа и «n = 140»
  S.img('thumb');
  S.text('nlab', 'n = 140', grow(r.nlab, 10, 0, 0, 0), { font: 'mono', size: 11, bold: true, color: C.gold, fill: C.bg, radius: 0.07, align: 'center', valign: 'middle', wrap: false });
  // карточка 3: медаль и ляган
  S.img('medal');
  S.img('plate');

  // печати
  S.stamp('stamp0', 'ОПРОВЕРГНУТО', r.stamp0, { color: C.red, size: 21, rot: -7, fillT: 65, lineW: 3.5 });
  S.stamp('stamp1', [
    run('ПОДТВЕРЖДЕНО', { fontSize: 17.5, breakLine: true }),
    run('В РАМКАХ СЕМЕЙНОГО', { fontSize: 10, breakLine: true }),
    run('ИССЛЕДОВАНИЯ', { fontSize: 10 }),
  ], grow(r.stamp1, 0, 5), { color: C.green, size: 17.5, rot: -5, fillT: 65, lineW: 3.5, lines: 0.98 });
  S.stamp('stamp2', 'КУЛЬТУРА ПЛОВА\nПРИЗНАНА ЮНЕСКО, 2016', r.stamp2, { color: C.gold, size: 11.5, rot: -4, fillT: 65, lineW: 3.5, lines: 0.92 });

  // факты и шутка с бейджами (первая строка — с отступом под бейдж)
  const fb = (name, kind, label, b) => S.badge(name, kind, label, { x: b.x, y: b.y }, { size: 10, w: b.w });
  fb('fb0', 'fact', 'Факт', r.fbadge0);
  S.text('fact0', `${SP(24)}Узбекистан — это 12 областей,\nРеспублика Каракалпакстан и город Ташкент.`,
    { x: r.fact0.x, y: r.fact0.y + 1, w: r.fact0.w + 10, h: 66 }, { size: 11, bold: true, color: C.cream2, lineMul: 1.08 });
  fb('fb1', 'joke', 'Шутка', r.fbadge1);
  S.text('fact1', `${SP(22)}Это уже не семья.\nЭто научная выборка.`,
    { x: r.fact1.x, y: r.fact1.y - 2, w: r.fact1.w + 10, h: 76 }, { size: 14, bold: true, color: C.cream, lineMul: 1.0 });
  fb('fb2', 'fact', 'Факт', r.fbadge2);
  S.text('fact2', `${SP(25)}«Культура и традиции плова»\nвнесены в Репрезентативный список\nнематериального культурного наследия\nчеловечества ЮНЕСКО в 2016 году.`,
    { x: r.fact2.x, y: r.fact2.y + 2, w: r.fact2.w + 10, h: 114 }, { size: 10.5, bold: true, color: C.cream2, lineMul: 1.04 });

  // ---------- низ: сноска, кнопка вывода, лист «по ГОСТу» ----------
  S.text('foot', 'Гипотезы, а не результаты\nопроса: опрос не проводился.', grow(r.foot, 0, 0, 60, 8), { size: 11, bold: true, color: C.muted, lineMul: 1.04 });
  S.text('gostBtn', 'СФОРМУЛИРОВАТЬ ВЫВОД', r.gostBtn, {
    font: 'display', size: 12, color: C.ink, align: 'center', valign: 'middle', fill: C.cream, radius: 0.5, wrap: false, shadow: SH(0, 3, 1, C.cream3),
  });

  const G = { x: r.gost.x + r.gost.w / 2, y: r.gost.y + r.gost.h / 2 };
  const ROT = -0.6;
  const g = (rect) => rotAround(rect, G, ROT);
  S.img('sheet', { rect: g(r.sheet), rotate: ROT });
  S.img('tbFaint', { file: 'tb', rect: g(r.tb), rotate: ROT, transparency: 80 });
  S.img('tbFull', { file: 'tb', rect: g(r.tb), rotate: ROT });
  S.text('glabel', 'Вывод', g(grow(r.glabel, 0, 0, 30, 0)), { size: 10, bold: true, italic: true, color: C.ink2, spacing: 0.4, valign: 'middle', rotate: ROT, wrap: false });
  S.text('gtext', 'Стереотипы необходимо оформлять по ГОСТу', g(grow(r.gtype, 0, 0, 60, 0)), { size: 21.5, bold: true, italic: true, color: C.ink, valign: 'middle', rotate: ROT, wrap: false });
  const tb = (k, text, val) => S.text(`tb${k}`, text, g(r[`tb${k}`]), {
    size: 10, italic: true, bold: true, color: val ? C.ink : C.ink2, valign: 'middle', rotate: ROT, wrap: false, inset: [6, 0, 0, 0],
  });
  tb(1, 'Разраб.'); tb(2, 'Эркинбой', true); tb(3, 'Утв.'); tb(4, 'Бабушка', true); tb(5, 'Лист 1');
  tb(6, [run('Листов '), run('∞', { fontFace: F.serif, italic: false, fontSize: 13 })], true);
  // бейдж «Шутка» лежит на наклонённом листе — наклонён вместе с ним
  S.text('gbadge', '●  ШУТКА', g(grow(r.gbadge, 0, -1, 0, -2)), {
    size: 10, bold: true, color: C.cream, fill: C.red, radius: 0.5, align: 'center', valign: 'middle', spacing: 1.5, rotate: ROT, wrap: false,
  });

  // ---------- древо на весь экран ----------
  S.shape('dim', 'rect', { x: 0, y: 64, w: 1920, h: 956 }, { fill: C.bg });
  S.img('treeFull');
  S.shape('tcPanel', 'round', r.tc, { fill: C.panel, line: C.gold, lineW: 1.5, radius: 0.125, shadow: SH(30, 14, 0.5) });
  S.badge('tcBadge', 'joke', 'Шутка', { x: r.tcBadge.x, y: r.tcBadge.y }, { size: 10, w: r.tcBadge.w });
  S.text('tcLabel', 'РАЗМЕР ВЫБОРКИ', grow(r.tcLabel, 0, 0, 20, 0), { size: 10, bold: true, color: C.muted, spacing: 2, valign: 'middle', wrap: false });
  COUNT.forEach((v, k) => S.text(`cnt${k}`, `n = ${v}`, grow(r.tcVal, 60, 4, 0, 4), { font: 'mono', size: 32, bold: true, color: C.gold, align: 'right', valign: 'middle', wrap: false }));
  const q = grow(r.quip, 52, 2);
  S.shape('quipRing', 'round', grow(q, 7.5), { fill: C.bg, line: C.cream3, lineW: 1.5, radius: 0.12, rotate: -1 });
  S.sticker('quip', 'Это уже не семья. Это научная выборка.', q, { size: 23, rot: -1 });

  // ================= анимации =================
  const flip = (i, sound) => [
    ...front(i).map((t, k) => ({ t, fx: 'collapseX', dur: 250, ...(k === 0 && sound ? { sound } : {}) })),
    ...back(i).map((t) => ({ t, fx: 'expandX', dur: 300, delay: 250 })),
  ];
  const mood = (from, to, at) => [
    { t: from, fx: 'fadeOut', delay: at, dur: 250 },
    { t: to, fx: 'fade', delay: at, dur: 250 },
    { t: to, fx: 'pulse', delay: at + 250, dur: 500, by: 104 },
  ];
  const fact = (i, at) => [`fb${i}`, `fact${i}`].map((t) => ({ t, fx: 'riseUp', delay: at, dur: 500 }));

  // вход на слайд: карточки поднимаются по очереди, исследователь проявляется
  S.auto(
    ...[0, 1, 2].flatMap((i) => front(i).map((t) => ({ t, fx: 'riseUp', dur: 800, delay: 350 + 100 * i }))),
    { t: 'res0', fx: 'fade', dur: 800, delay: 570 },
  );

  // 1) «Все узбеки из Ташкента» → карта, города, «ОПРОВЕРГНУТО»
  S.click(
    ...flip(0, 'whoosh'),
    { t: 'map', fx: 'wipeLeft', delay: 300, dur: 850, sound: 'swoosh' },
    ...[0, 1, 2, 3, 4, 5, 6].map((k) => ({ t: `city${k}`, fx: 'pop', delay: 560 + 80 * k, dur: 450, ...(k === 0 ? { sound: 'sparkle' } : k % 2 === 0 ? { sound: 'pop' } : {}) })),
    { t: 'stamp0', fx: 'slam', delay: 1120, dur: 500, sound: 'stamp' },
    ...mood('res0', 'res1', 1120),
    ...fact(0, 1300),
  );

  // 2) «У узбеков много родственников» → древо вырывается на весь экран, счётчик выборки, панчлайн
  const D = 120;
  S.click(
    ...flip(1),
    { t: 'dim', fx: 'fade', delay: D, dur: 350 },
    { t: 'treeFull', fx: 'slam', from: TREE_K0, delay: D, dur: 1000, sound: 'whoosh' },
    { t: 'treeFull', fx: 'move', path: 'M 0 0.103 L 0 0 E', delay: D, dur: 1000, decel: 80000 },
    ...['tcPanel', 'tcBadge', 'tcLabel', 'cnt0'].map((t) => ({ t, fx: 'zoom', delay: D, dur: 900 })),
    ...COUNT.slice(1).flatMap((_, k) => {
      const at = D + [240, 400, 560, 720, 880, 1000][k];
      return [{ t: `cnt${k}`, fx: 'hide', delay: at }, { t: `cnt${k + 1}`, fx: 'appear', delay: at, ...(k < 5 ? { sound: 'pop' } : {}) }];
    }),
    { t: 'quipRing', fx: 'pop', delay: 1150, dur: 500 },
    { t: 'quip', fx: 'pop', delay: 1150, dur: 500, sound: 'boing' },
  );

  // 3) древо возвращается в карточку → «ПОДТВЕРЖДЕНО в рамках семейного исследования»
  const dy = +((r.thumbIn.y + 542 * THUMB_K - 542) / 1080).toFixed(4);
  S.click(
    { t: 'quipRing', fx: 'zoomOut', dur: 250 },
    { t: 'quip', fx: 'zoomOut', dur: 250 },
    ...['tcPanel', 'tcBadge', 'tcLabel', 'cnt6'].map((t) => ({ t, fx: 'fadeOut', dur: 300 })),
    { t: 'treeFull', fx: 'grow', by: +(THUMB_K * 100).toFixed(3), dur: 600, sound: 'swoosh' },
    { t: 'treeFull', fx: 'move', path: `M 0 0 L 0 ${dy} E`, dur: 600, accel: 40000, decel: 40000 },
    { t: 'dim', fx: 'fadeOut', dur: 400 },
    { t: 'treeFull', fx: 'fadeOut', delay: 560, dur: 300 },
    { t: 'thumb', fx: 'fade', delay: 520, dur: 300 },
    { t: 'nlab', fx: 'fade', delay: 760, dur: 300 },
    { t: 'stamp1', fx: 'slam', delay: 620, dur: 500, sound: 'stamp' },
    ...mood('res1', 'res3', 620),
    ...fact(1, 800),
  );

  // 4) «Узбеки постоянно едят плов» → медаль, ляган, печать ЮНЕСКО; появляется «Сформулировать вывод»
  S.click(
    ...flip(2, 'whoosh'),
    { t: 'medal', fx: 'expandX', delay: 300, dur: 500, sound: 'sparkle' },
    { t: 'medal', fx: 'move', path: 'M 0 -0.139 L 0 0 E', delay: 300, dur: 600, decel: 60000 },
    { t: 'plate', fx: 'pop', delay: 560, dur: 550, sound: 'plop' },
    { t: 'stamp2', fx: 'slam', delay: 1000, dur: 500, sound: 'stamp' },
    ...mood('res3', 'res4', 1000),
    { t: 'medal', fx: 'pulse', delay: 1120, dur: 500, by: 108, sound: 'tada' },
    ...fact(2, 1250),
    { t: 'gostBtn', fx: 'pop', delay: 1500, dur: 500 },
    { t: 'gostBtn', fx: 'heartbeat', delay: 2000, dur: 1800, by: 104 },
  );

  // 5) вывод «по ГОСТу»: лист выезжает, текст «печатается», штамп-бейдж
  const T = 250, TD = 1270;
  S.click(
    { t: 'gostBtn', fx: 'zoomOut', dur: 250, sound: 'whoosh' },
    ...['sheet', 'tbFaint', 'glabel'].map((t) => ({ t, fx: 'riseUp', dur: 600 })),
    { t: 'gtext', fx: 'wipeLeft', delay: T, dur: 950 },
    ...[0, 180, 360, 540, 720, 900].map((d) => ({ t: 'glabel', fx: 'pulse', by: 100, dur: 120, delay: T + d, sound: 'tick' })),
    ...mood('res4', 'res0', 0),
    { t: 'tbFull', fx: 'fade', delay: TD, dur: 300 },
    ...[1, 2, 3, 4, 5, 6].map((k) => ({ t: `tb${k}`, fx: 'fade', delay: TD, dur: 300 })),
    { t: 'gbadge', fx: 'pop', delay: TD, dur: 450, sound: 'stamp' },
    { t: 'gbadge', fx: 'pulse', delay: TD + 450, dur: 400, by: 106, sound: 'ding' },
  );

  // триггеры: щелчок по печати — она «пристукивает» ещё раз (как повторный клик по открытой карточке в HTML)
  for (let i = 0; i < 3; i++) S.trigger(`stamp${i}`, { t: `stamp${i}`, fx: 'slam', dur: 500, sound: 'stamp' });

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 5 щелчков (→, PageDown, кликер или щелчок мышью по свободному месту). '
    + '1 — карточка 1: карта и печать «ОПРОВЕРГНУТО». 2 — карточка 2: древо вырывается на весь экран, счётчик выборки, «Это уже не семья. Это научная выборка.» (пауза на смех). '
    + '3 — древо возвращается в карточку, печать «ПОДТВЕРЖДЕНО». 4 — карточка 3: медаль, ляган, печать ЮНЕСКО и кнопка «Сформулировать вывод». '
    + '5 — лист «по ГОСТу». В PowerPoint карточки открываются только по порядку (клавиши 1/2/3 не работают). Щелчок мышью по любой печати — она стучит ещё раз (слайд при этом не листается). Следующий щелчок — слайд 3.';
}
