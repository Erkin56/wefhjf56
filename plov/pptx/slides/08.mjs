// Слайд 8. Коэффициент бабушки: гигантская формула k = …, ползунок, модель Pₙ₊₁ = 0,3·Pₙ + kⁿ, показания и гора плова.
// Щелчки = шаги «Далее» HTML: 1) k → 1 (сходится к 10/7, «В природе не встречается»); 2) k → 1,5 (расходится);
// 3) k → 2 (критический уровень: гора на весь экран, тревога, сирена, «Аварийный сброс»);
// 4) аварийный сброс → 1,5 + две бабушки и печать «Международная научная константа».
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { C, F } from '../lib/deck.mjs';

// ползунок HTML: input x 156…968, дорожка 16 px по центру (y 514), центр ручки = 184 + 756·(k − 1)
const TRACK = { x: 156, y: 506, w: 812, h: 16 };
const KX = (k) => 184 + 756 * (k - 1);
const KY = 514;
const DX = +((KX(2) - KX(1.5)) / 1920).toFixed(6); // смещение ручки на полшкалы, доля ширины слайда
const CLIP = { x: 0, y: 64, w: 1920, h: 956 };     // гора k = 2 и жар — между шапкой и подвалом
const FREEZE = '#s08.is-critical .s08-quake { animation: none !important; transform: none !important; }';
const ALERT_CSS = (bg, fg, glow) => `#s08 .s08-alert-box { animation: none !important; background: ${bg} !important; color: ${fg} !important;${glow ? '' : ' box-shadow: 0 0 0 10px var(--ink), 0 0 0 16px var(--gold) !important;'} }`;

export const capture = {
  states: [
    {
      name: 'k15', wait: 900,
      items: [
        { name: 'world15', sel: '.s08-mtn', kids: true, clip: { x: 1000, y: 330, w: 850, h: 690 } },
        { name: 'chips15', sel: '.s08-chips', pad: 8 },
        { name: 'bars15', sel: '.s08-bars', pad: 6 },
      ],
      measure: [
        { name: 'panel', sel: '.s08-panel' }, { name: 'badgeK', sel: '.s08-badge-k' },
        { name: 'formula', sel: '.s08-formula' }, { name: 'k', sel: '.s08-k' }, { name: 'ksub', sel: '.s08-ksub' },
        { name: 'eq', sel: '.s08-eq' }, { name: 'kval', sel: '.s08-kval' },
        { name: 'range', sel: '.s08-range' },
        { name: 'tick1', sel: '.s08-ticks span:nth-child(1)' }, { name: 'tick2', sel: '.s08-ticks span:nth-child(2)' }, { name: 'tick3', sel: '.s08-ticks span:nth-child(3)' },
        { name: 'model', sel: '.s08-model' }, { name: 'badgeM', sel: '.s08-badge-m' }, { name: 'eqno', sel: '.s08-eqno' },
        { name: 'rec', sel: '.s08-rec' }, { name: 'addsL', sel: '.s08-adds-l' }, { name: 'chips', sel: '.s08-chips' },
        { name: 'vchip', sel: '.s08-vchip' }, { name: 'vmath', sel: '.s08-vmath' },
        { name: 'roLabel', sel: '.s08-ro-label' }, { name: 'roVal', sel: '.s08-ro-val' }, { name: 'roNum', sel: '.s08-ro-num' }, { name: 'roUnit', sel: '.s08-ro-unit' },
        { name: 'bars', sel: '.s08-bars' }, { name: 'sparkCap', sel: '.s08-spark-cap' },
        { name: 'head', sel: '.s08-head' }, { name: 'eyebrow', sel: '.s08-head .eyebrow' }, { name: 'title', sel: '.s08-title' },
      ],
    },
    {
      name: 'k1', actions: [{ next: 1, each: 2600 }],
      items: [
        { name: 'world1', sel: '.s08-mtn', kids: true, clip: { x: 1075, y: 640, w: 700, h: 380 } },
        { name: 'chips1', sel: '.s08-chips', pad: 8 },
        { name: 'bars1', sel: '.s08-bars', pad: 6 },
      ],
      measure: [{ name: 'vchip1', sel: '.s08-vchip' }, { name: 'vmath1', sel: '.s08-vmath' }, { name: 'roVal1', sel: '.s08-ro-val' }, { name: 'kval1', sel: '.s08-kval' }],
    },
    {
      name: 'k1m', actions: [{ next: 1, each: 2600 }],
      css: '#s08 .s08-ideal .sticker { transform: none !important; }',
      measure: [{ name: 'ideal', sel: '.s08-ideal .sticker' }],
    },
    {
      name: 'k2', actions: [{ next: 3, each: 2600 }], css: FREEZE,
      items: [
        { name: 'world2', sel: '.s08-mtn', kids: true, clip: CLIP },
        { name: 'heatA', sel: '.s08-heat', self: true, clip: CLIP, css: '#s08 .s08-heat::after { animation: none !important; opacity: 0 !important; }' },
        { name: 'heatB', sel: '.s08-heat', self: true, clip: CLIP, css: '#s08 .s08-heat { background: none !important; } #s08 .s08-heat::after { animation: none !important; opacity: 1 !important; }' },
        { name: 'alertA', sel: '.s08-alert', pad: 110, hide: ['.s08-siren', '.s08-alert-t'], css: ALERT_CSS('var(--red)', 'var(--cream)', true) },
        { name: 'alertB', sel: '.s08-alert-box', pad: 20, hide: ['.s08-siren', '.s08-alert-t'], css: ALERT_CSS('var(--red-3)', 'var(--gold)', false) },
        { name: 'rays', sel: '.s08-siren-rays', pad: 4, css: '#s08 .s08-siren-rays { animation: none !important; }' },
        { name: 'siren', sel: '.s08-siren', self: true, pad: 4, hide: ['.s08-siren-rays'] },
        { name: 'fill2', sel: '.s08-range', clip: { x: KX(1.5), y: 500, w: 412, h: 28 }, css: '#s08 .s08-range::-webkit-slider-thumb { opacity: 0 !important; box-shadow: none !important; }' },
        { name: 'chips2', sel: '.s08-chips', pad: 8 },
        { name: 'bars2', sel: '.s08-bars', pad: 6 },
      ],
      measure: [{ name: 'kval2', sel: '.s08-kval' }, { name: 'roVal2', sel: '.s08-ro-val' }, { name: 'sos', sel: '.s08-reset' }, { name: 'headFlood', sel: '.s08-head' }],
    },
    {
      name: 'k2m', actions: [{ next: 3, each: 2600 }],
      css: FREEZE + ' #s08 .s08-alert, #s08.is-critical .s08-alert, #s08 .s08-peak, #s08.is-offtop .s08-peak { transform: none !important; }',
      measure: [
        { name: 'alertBox', sel: '.s08-alert-box' }, { name: 'alertT', sel: '.s08-alert-t' }, { name: 'sirenM', sel: '.s08-siren' },
        { name: 'peak', sel: '.s08-peak' }, { name: 'peakT', sel: '.s08-peak .hand' }, { name: 'peakSvg', sel: '.s08-peak svg' },
      ],
    },
    {
      name: 'const', actions: [{ next: 4, each: 2600 }], wait: 1500,
      items: [
        { name: 'gmaUz', sel: '.s08-gma--uz .s08-gma-art', pad: 24 },
        { name: 'gmaRu', sel: '.s08-gma--ru .s08-gma-art', pad: 24 },
      ],
      measure: [{ name: 'roValC', sel: '.s08-ro-val' }],
    },
    {
      name: 'cm', actions: [{ next: 4, each: 2600 }], wait: 1500,
      css: '#s08 .s08-stamp { animation: none !important; transform: none !important; opacity: 1 !important; } #s08 .s08-tag, #s08.is-const .s08-tag, #s08.is-const .s08-gma--ru .s08-tag { transform: translate(-50%, 0) !important; } #s08 .s08-const.is-on .s08-badge-c { transform: none !important; }',
      measure: [
        { name: 'stamp', sel: '.s08-stamp' }, { name: 'tagUz', sel: '.s08-gma--uz .s08-tag' }, { name: 'tagRu', sel: '.s08-gma--ru .s08-tag' },
        { name: 'badgeC', sel: '.s08-badge-c' }, { name: 'const', sel: '.s08-const' },
      ],
    },
  ],
};

// --- текстовые «прогоны» ---
const run = (text, options = {}) => ({ text, options });
const m = (text, o = {}) => run(text, { fontFace: F.serif, ...o });          // математика прямым
const v = (text, o = {}) => run(text, { fontFace: F.serif, italic: true, ...o }); // переменная курсивом
const sub = (text, o = {}) => v(text, { baseline: -500, ...o });     // нижний индекс −25 % (как в HTML, а не −40 %)
const sup = (text, o = {}) => v(text, { superscript: true, ...o });
const SH = (blur, offset, opacity) => ({ type: 'outer', color: '000000', blur, offset, angle: 90, opacity });


// Гора k = 2 + жар: два полноэкранных PNG с альфой весят ~11 МБ. Склеиваем их с фоном сцены в два JPEG
// (обычный жар и «вспышка» сильного жара) — ~1,3 МБ. Если Python/PIL недоступен — берём PNG как есть.
const PY = `
import sys
from PIL import Image
d, bg, outA, outB = sys.argv[1:5]
w2 = Image.open(d + '/world2.png').convert('RGBA')
ha = Image.open(d + '/heatA.png').convert('RGBA')
hb = Image.open(d + '/heatB.png').convert('RGBA')
base = Image.open(bg).convert('RGBA').crop((0, 64, 1920, 1020)).resize(w2.size, Image.LANCZOS)
a = Image.alpha_composite(Image.alpha_composite(base, w2), ha)
b = Image.alpha_composite(a, hb)
a.convert('RGB').save(outA, 'JPEG', quality=88, optimize=True, progressive=True)
b.convert('RGB').save(outB, 'JPEG', quality=88, optimize=True, progressive=True)
`;
function flattenCritical(S) {
  const src = ['world2.png', 'heatA.png', 'heatB.png'].map((f) => join(S.dir, f)).concat(join(S.dir, '..', 'bg.jpg'));
  const out = [join(S.dir, 'world2-flat.jpg'), join(S.dir, 'world2b-flat.jpg')];
  try {
    const newest = Math.max(...src.map((f) => statSync(f).mtimeMs));
    if (out.some((f) => !existsSync(f) || statSync(f).mtimeMs < newest)) {
      execFileSync('python3', ['-c', PY, S.dir, src[3], ...out], { stdio: 'pipe' });
    }
    return out;
  } catch (e) {
    console.warn(`  ! слайд 08: JPEG-склейка не удалась (${e.message.split('\n')[0]}), беру PNG`);
    return null;
  }
}

export function build(S) {
  S.start({ layout: 'CHROME', section: 'Главное открытие' });
  const r = S.rects;

  // ---------- фон: ляган и гора плова (три состояния), жар ----------
  S.img('world15');
  S.img('world1');
  const flat = flattenCritical(S);
  if (flat) {
    S.imgFile('world2', flat[0], CLIP, { alt: 'Гора плова на весь экран, жар' });
    S.imgFile('world2b', flat[1], CLIP, { alt: 'Вспышка жара' });
  } else {
    S.img('world2');
    S.img('world2b', { file: 'heatB' });
  }

  // подложка заголовка: гора k = 2 дорастает до него
  S.shape('headBg', 'round', { x: 88, y: 92, w: 1480, h: 146 }, { fill: C.bg, fillT: 6, radius: 0.125, shadow: SH(24, 8, 0.45) });
  // заголовок — плейсхолдеры мастера, поверх горы
  S.slide.addText('КОЭФФИЦИЕНТ БАБУШКИ', { placeholder: 'eyebrow' });
  S.slide.addText('Главное открытие исследования', { placeholder: 'title' });

  // ---------- левая панель ----------
  S.shape('panel', 'round', 'panel', { fill: C.panel, line: C.line, lineW: 1.5, radius: 0.19, shadow: SH(40, 16, 0.6) });
  S.badge('badgeK', 'joke', 'Шуточная константа', { x: 630, y: r.badgeK.y + 1 }, { w: 350 });

  // гигантская формула k_бабушки = …
  const KT = 243; // верх строки формулы: базовая линия ≈ 443, как в HTML
  S.text('k', [v('k')], { x: 150, y: KT, w: 116, h: 240 }, { size: 100, color: C.gold, wrap: false });
  S.text('ksub', [v('бабушки')], { x: 248, y: 424, w: 236, h: 70 }, { size: 24, color: C.cream2, wrap: false });
  S.text('eq', [m('=')], { x: 477, y: 280, w: 100, h: 180 }, { size: 78, color: C.cream3, wrap: false });
  const kv = (name, text, color, w) => S.text(name, [m(text)], { x: 596, y: KT, w, h: 240 }, { size: 100, color, wrap: false });
  kv('kv15', '1,5', C.gold, 300);
  kv('kv1', '1', C.gold, 170);
  kv('kv2', '2', C.red, 170);

  // ползунок: родная дорожка, заливка и ручка (ручка ездит по пути)
  S.shape('track', 'round', TRACK, { fill: C.line, radius: 0.06 });
  S.shape('fill15', 'round', { x: TRACK.x, y: TRACK.y, w: KX(1.5) + 14 - TRACK.x, h: TRACK.h }, { fill: C.gold, radius: 0.06 });
  S.img('fill2');
  const knob = (name, line) => S.shape(name, 'ellipse', { x: KX(name === 'knob' ? 1.5 : 2) - 24.5, y: KY - 24.5, w: 49, h: 49 }, { fill: C.cream, line, lineW: 3.5, shadow: SH(10, 4, 0.5) });
  knob('knob', C.gold);
  knob('knob2', C.red);
  [['tick1', '1', 1], ['tick2', '1,5', 1.5], ['tick3', '2', 2]].forEach(([n, t, k]) =>
    S.text(n, t, { x: KX(k) - 50, y: 545, w: 100, h: 36 }, { font: 'mono', size: 13, bold: true, color: C.muted, align: 'center' }));

  // модель (математика)
  S.shape('model', 'round', 'model', { fill: C.cream, radius: 0.15, shadow: SH(30, 12, 0.35) });
  S.badge('badgeM', 'math', 'Математика', { x: 716, y: r.badgeM.y + 1 }, { w: 222 });
  S.text('eqno', [m('(2)')], { x: 862, y: 624, w: 76, h: 50 }, { size: 19, color: C.ink2, align: 'right' });
  S.text('rec', [
    v('P'), sub('0', { italic: false }), m(' = 1,  '), v('P'), sub('n'), sub('+1', { italic: false }),
    m(' = 0,3 · '), v('P'), sub('n'), m(' + '), v('k', { color: C.red2 }), sup('n', { color: C.red2 }),
  ], { x: 186, y: 607, w: 670, h: 66 }, { font: 'serif', size: 26, color: C.ink, wrap: false });
  const am = { color: C.red2, fontSize: 17 };
  S.text('addsL', [
    run('добавки ', { bold: true }), v('a', am), sub('n', am), m(' = ', am), v('k', am), sup('n', am), run(':', { bold: true }),
  ], { x: 186, y: 682, w: 240, h: 48 }, { size: 16, color: C.ink2, valign: 'middle', wrap: false });
  S.img('chips15');
  S.img('chips1');
  S.img('chips2');

  // вердикт: «расходится» / «сходится к 10/7»
  const chip = (name, text, fill, w) => S.text(name, text, { x: 186, y: 745, w, h: 58 }, {
    font: 'display', size: 15, color: C.cream, fill, radius: 0.1, align: 'center', valign: 'middle', spacing: 0.3, wrap: false,
  });
  chip('vDiv', 'РАСХОДИТСЯ', C.red, 318);
  chip('vConv', 'СХОДИТСЯ К 10/7', '1FA3B4', 392);
  const arrow = (o = {}) => run('→', { fontFace: F.body, ...o });
  S.text('vmDiv', [v('P'), sub('n'), m(' ≈ '), v('k'), sup('n'), m('/('), v('k'), m(' − 0,3) '), arrow(), m(' ∞')],
    { x: 522, y: 747, w: 380, h: 54 }, { font: 'serif', size: 18, color: C.ink, valign: 'middle', wrap: false });
  S.text('vmConv', [v('P'), sub('n'), m(' '), arrow(), m(' 1/(1 − 0,3)')],
    { x: 596, y: 747, w: 320, h: 54 }, { font: 'serif', size: 18, color: C.ink, valign: 'middle', wrap: false });

  // показания
  S.text('roLabel', 'Через 10 циклов на тарелке:', { x: 154, y: 822, w: 470, h: 40 }, { size: 15, bold: true, color: C.cream2, wrap: false });
  const ro = (name, num, color) => S.text(name, [
    run(num, { fontFace: F.mono, fontSize: 50, bold: true, color }), run(' порции', { fontFace: F.body, fontSize: 21, bold: true, color: C.cream }),
  ], { x: 150, y: 858, w: 500, h: 112 }, { valign: 'bottom', wrap: false });
  ro('ro15', '48,1', C.gold);
  ro('ro1', '1,43', C.gold);
  ro('ro2', '602', C.red);
  S.img('bars15');
  S.img('bars1');
  S.img('bars2');
  S.text('sparkCap', [v('P', { fontSize: 11 }), sub('n', { fontSize: 11 }), m(', ', { fontSize: 11 }), v('n', { fontSize: 11 }), m(' = 0…10', { fontSize: 11 }), run(' · лог. шкала')],
    { x: 676, y: 935, w: 300, h: 32 }, { size: 10, bold: true, color: C.muted, wrap: false, valign: 'middle' });

  // ---------- k = 1: «В природе не встречается» ----------
  const ir = { x: r.ideal.x - 14, y: r.ideal.y, w: r.ideal.w + 28, h: r.ideal.h };
  // внешнее кольцо cream-3 (в HTML: 6 px фона + 3 px кольца)
  S.shape('idealRing', 'round', { x: ir.x - 7.5, y: ir.y - 7.5, w: ir.w + 15, h: ir.h + 15 }, { fill: C.bg, line: C.cream3, lineW: 1.5, radius: 0.23, rotate: -4 });
  S.sticker('ideal', 'В ПРИРОДЕ НЕ ВСТРЕЧАЕТСЯ', ir, { fill: C.gold, size: 16, rot: -4 });

  // ---------- k = 2: «вершина — где-то там» ----------
  S.text('peak', [run('вершина — где-то там '), run('↑', { fontFace: 'Arial', bold: true })], { x: 1256, y: 838, w: 566, h: 82 }, {
    font: 'hand', size: 20, bold: true, color: C.gold, fill: C.ink, line: C.gold2, lineW: 2, radius: 0.1, align: 'center', valign: 'middle', rotate: -4, wrap: false,
    shadow: SH(16, 8, 0.5),
  });

  // ---------- контрольная группа: две бабушки ----------
  S.img('gmaUz');
  S.img('gmaRu');
  const tag = (name, city, rect, rot) => S.text(name, [
    run(`${city}: `, { bold: true }), v('k', { color: C.red2, fontSize: 16 }), m(' = 1,5', { color: C.red2, fontSize: 16 }),
  ], rect, { size: 14, color: C.ink, fill: C.cream, line: C.bg, lineW: 2, radius: 0.08, align: 'center', valign: 'middle', rotate: rot, wrap: false, shadow: SH(18, 8, 0.4) });
  tag('tagUz', 'Ташкент', { x: r.tagUz.x - 8, y: r.tagUz.y, w: r.tagUz.w + 16, h: r.tagUz.h }, -3);
  tag('tagRu', 'Петербург', { x: r.tagRu.x - 8, y: r.tagRu.y, w: r.tagRu.w + 16, h: r.tagRu.h }, 3);

  // ---------- критический уровень ----------
  S.img('alertA');
  S.img('alertB');
  const alertTxt = (name, color) => S.text(name, 'КРИТИЧЕСКИЙ\nУРОВЕНЬ\nГОСТЕПРИИМСТВА', { x: r.alertT.x - 2, y: r.alertT.y - 8, w: 590, h: r.alertT.h + 16 }, {
    font: 'display', size: 21.5, color, lineMul: 0.8, valign: 'middle', rotate: -2, wrap: false,
  });
  alertTxt('alertTA', C.cream);
  alertTxt('alertTB', C.gold);
  S.img('rays');
  S.img('siren');
  S.button('sos', 'АВАРИЙНЫЙ СБРОС', 'sos', { fill: C.red, edge: C.red3, color: C.cream, size: 17 });

  // ---------- международная научная константа ----------
  S.stamp('stamp', 'МЕЖДУНАРОДНАЯ\nНАУЧНАЯ КОНСТАНТА', 'stamp', { color: C.gold, size: 22, rot: -5, fill: C.bg, fillT: 10, lineW: 4, lines: 0.82 });
  S.badge('badgeC', 'joke', 'Шутка', { x: r.badgeC.x - 4, y: r.badgeC.y + 1 }, { w: r.badgeC.w + 8 });

  // ================= анимации =================
  const swap = (from, to, at, dur, o = {}) => [
    { t: from, fx: 'fadeOut', delay: at, dur },
    { t: to, fx: o.fx || 'fade', delay: at + (o.lag || 0), dur: o.dur || dur, sound: o.sound },
  ];
  // при входе: гора «вырастает» из лягана
  S.auto({ t: 'world15', fx: 'wipeUp', delay: 300, dur: 700, sound: 'plop' });

  // 1) k → 1: ряд сходится к 10/7
  S.click(
    { t: 'knob', fx: 'move', path: `M 0 0 L ${-DX} 0 E`, dur: 1000, accel: 40000, decel: 40000, sound: 'tick' },
    { t: 'fill15', fx: 'fadeOut', dur: 900 },
    // старое значение держится, пока ручка едет; новое «прыгает» на место к концу хода
    { t: 'kv15', fx: 'fadeOut', delay: 650, dur: 200 },
    { t: 'kv1', fx: 'pop', delay: 820, dur: 500 },
    { t: 'ro15', fx: 'fadeOut', delay: 650, dur: 200 },
    { t: 'ro1', fx: 'pop', delay: 820, dur: 450 },
    { t: 'bars15', fx: 'fadeOut', dur: 900, delay: 100, sound: 'tick' },
    { t: 'bars1', fx: 'fade', dur: 900, delay: 0 },
    ...swap('chips15', 'chips1', 650, 300, { sound: 'tick' }),
    ...swap('world15', 'world1', 0, 1000),
    { t: 'vDiv', fx: 'hide', delay: 1000 },
    { t: 'vConv', fx: 'pop', delay: 1000, dur: 550, sound: 'ding' },
    { t: 'vmDiv', fx: 'hide', delay: 1000 },
    { t: 'vmConv', fx: 'fade', delay: 1000, dur: 350 },
    { t: 'idealRing', fx: 'pop', delay: 1250, dur: 550 },
    { t: 'ideal', fx: 'pop', delay: 1250, dur: 550 },
  );

  // 2) k → 1,5: ряд расходится
  S.click(
    { t: 'knob', fx: 'move', path: `M ${-DX} 0 L 0 0 E`, dur: 900, accel: 0, decel: 0, sound: 'tick' },
    { t: 'fill15', fx: 'wipeLeft', dur: 900 }, // «Слева»: заливка растёт слева направо
    { t: 'idealRing', fx: 'zoomOut', dur: 250 },
    { t: 'ideal', fx: 'zoomOut', dur: 250 },
    { t: 'vConv', fx: 'hide', delay: 60 },
    { t: 'vDiv', fx: 'pop', delay: 60, dur: 550, sound: 'boing' },
    { t: 'vmConv', fx: 'hide', delay: 60 },
    { t: 'vmDiv', fx: 'fade', delay: 60, dur: 350 },
    { t: 'kv1', fx: 'fadeOut', delay: 550, dur: 200 },
    { t: 'kv15', fx: 'pop', delay: 720, dur: 500 },
    { t: 'ro1', fx: 'fadeOut', delay: 550, dur: 200 },
    { t: 'ro15', fx: 'pop', delay: 720, dur: 450 },
    ...swap('bars1', 'bars15', 0, 900),
    ...swap('chips1', 'chips15', 550, 300, { sound: 'tick' }),
    ...swap('world1', 'world15', 0, 900),
  );

  // 3) k → 2: критический уровень гостеприимства
  const T = 1300; // ползунок доехал до 2
  const flash = [];
  for (let i = 0; i < 6; i++) { // мигание табло и жара (как steps(1) .5s в HTML), ~3 с; в конце — сильный жар + красное табло
    const t0 = T + i * 500;
    flash.push(
      { t: 'world2b', fx: 'appear', delay: t0 }, { t: 'world2b', fx: 'hide', delay: t0 + 250 },
      { t: 'alertB', fx: 'appear', delay: t0 + 250 }, { t: 'alertB', fx: 'hide', delay: t0 + 500 },
      { t: 'alertTB', fx: 'appear', delay: t0 + 250 }, { t: 'alertTB', fx: 'hide', delay: t0 + 500 },
    );
  }
  flash.push({ t: 'world2b', fx: 'appear', delay: T + 3000 });
  const shakes = [];
  for (const d of [T, T + 520, T + 1040]) {
    for (const t of ['world2', 'world2b', 'alertA', 'alertB', 'alertTA', 'alertTB', 'rays', 'siren']) shakes.push({ t, fx: 'shake', delay: d, dur: 480, amp: 0.004 });
  }
  S.click(
    { t: 'knob', fx: 'move', path: `M 0 0 L ${DX} 0 E`, dur: T, accel: 0, decel: 0, sound: 'tick' },
    { t: 'fill2', fx: 'wipeLeft', dur: T },
    { t: 'kv15', fx: 'fadeOut', delay: T - 300, dur: 200 },
    { t: 'ro15', fx: 'fadeOut', delay: T - 300, dur: 200 },
    { t: 'track', fx: 'pulse', delay: 450, dur: 200, by: 100.5, sound: 'tick' }, // «трещотка» шагов ползунка
    ...swap('bars15', 'bars2', 0, T),
    ...swap('chips15', 'chips2', 900, 300, { sound: 'tick' }),
    { t: 'world2', fx: 'wipeUp', dur: T },
    { t: 'world15', fx: 'hide', delay: T },
    { t: 'headBg', fx: 'fade', delay: 800, dur: 450 },
    { t: 'peak', fx: 'riseUp', delay: 1000, dur: 500 },
    { t: 'kv2', fx: 'pop', delay: T, dur: 500 },
    { t: 'ro2', fx: 'pop', delay: T, dur: 450 },
    { t: 'knob2', fx: 'fade', delay: T - 100, dur: 200 },
    { t: 'alertA', fx: 'pop', delay: T, dur: 450, sound: 'alarm' },
    { t: 'alertTA', fx: 'pop', delay: T, dur: 450 },
    { t: 'siren', fx: 'pop', delay: T, dur: 450 },
    { t: 'rays', fx: 'pop', delay: T, dur: 450 },
    { t: 'rays', fx: 'spin', delay: T, dur: 1000, deg: 360, repeat: 'indefinite' },
    { t: 'sos', fx: 'riseUp', delay: T + 250, dur: 500 },
    { t: 'sos', fx: 'heartbeat', delay: T + 800, dur: 1800, by: 104 },
    ...flash,
    ...shakes,
  );

  // 4) «Аварийный сброс»: обратно к 1,5 — бабушки из Ташкента и Петербурга дают одно и то же k
  S.click(
    { t: 'knob2', fx: 'fadeOut', dur: 150, sound: 'whoosh' },
    { t: 'knob', fx: 'move', path: `M ${DX} 0 L 0 0 E`, dur: 1100, accel: 40000, decel: 40000 },
    { t: 'fill2', fx: 'fadeOut', dur: 1000 },
    { t: 'alertA', fx: 'zoomOut', dur: 250 },
    { t: 'alertTA', fx: 'zoomOut', dur: 250 },
    { t: 'siren', fx: 'zoomOut', dur: 250 },
    { t: 'rays', fx: 'zoomOut', dur: 250 },
    { t: 'sos', fx: 'zoomOut', dur: 250 },
    { t: 'peak', fx: 'fadeOut', dur: 300 },
    { t: 'world2b', fx: 'fadeOut', dur: 700 },
    { t: 'headBg', fx: 'fadeOut', delay: 300, dur: 400 },
    ...swap('world2', 'world15', 0, 1100),
    { t: 'kv2', fx: 'fadeOut', delay: 750, dur: 200 },
    { t: 'kv15', fx: 'pop', delay: 920, dur: 500 },
    { t: 'ro2', fx: 'fadeOut', delay: 750, dur: 200 },
    { t: 'ro15', fx: 'pop', delay: 920, dur: 450 },
    ...swap('bars2', 'bars15', 0, 1100),
    ...swap('chips2', 'chips15', 800, 300),
    { t: 'gmaUz', fx: 'riseUp', delay: 150, dur: 650, sound: 'pop' },
    { t: 'gmaRu', fx: 'riseUp', delay: 400, dur: 650, sound: 'pop' },
    { t: 'tagUz', fx: 'pop', delay: 900, dur: 500 },
    { t: 'tagRu', fx: 'pop', delay: 1050, dur: 500 },
    { t: 'stamp', fx: 'slam', delay: 1150, dur: 500, sound: 'stamp' },
    { t: 'badgeC', fx: 'pop', delay: 1250, dur: 450 },
    { t: 'gmaUz', fx: 'pulse', delay: 1500, dur: 500, by: 106, sound: 'tada' },
    { t: 'gmaRu', fx: 'pulse', delay: 1550, dur: 500, by: 106 },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 4 щелчка (→, PageDown, кликер или щелчок мышью). 1 — ползунок к k = 1 («сходится к 10/7», «В природе не встречается»). 2 — обратно к 1,5 («расходится»). 3 — k = 2: гора плова на весь экран, сирена и мигающее табло. 4 — «Аварийный сброс» (щелчок по кнопке или →): k = 1,5, две бабушки и печать «Международная научная константа». Ползунок здесь не перетаскивается — он едет сам по щелчкам. Следующий щелчок — слайд 9.';
}
