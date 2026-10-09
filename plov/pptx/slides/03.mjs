// Слайд 3. Эксперимент «Нет, спасибо»: протокол со счётчиком отказов и кнопка «НЕТ, СПАСИБО» слева,
// сцена за дастарханом справа (гость, бабушка с лаганом, растущая горка, казан с неба), финал «Нужна математика!».
// Щелчки = шаги «Далее» HTML: 1–3) отказы № 1–3 (реплики, счётчик, строки протокола, горка растёт,
// на третьем — казан падает с «БУМ!» и тряской, кнопка превращается в «СДАЮСЬ»); 4) затемнение и карточка
// «Прагматика… Лингвистика бессильна. Нужна математика!» с формулами и Эркинбоем.
import { C, F } from '../lib/deck.mjs';

// ---------- захват ----------
const amt = (a) => ({ x: Math.pow(a, 0.42), y: Math.pow(a, 0.78) }); // Art.amountScale
const MOUND = (a) => { const s = amt(a); return `#s03 .s03-plate .mound { transform: scale(${s.x.toFixed(4)}, ${s.y.toFixed(4)}) !important; }`; };
const MOOD = (who, m) => `#s03 .s03-${who} .mv { display: none !important; } #s03 .s03-${who} .mv-${m} { display: inline !important; }`;
// гость за столом: нижний край ниже, чем в HTML (он всё равно спрятан за дастарханом) — чтобы прыжок не открыл срез
const GUEST_CLIP = '#s03 .s03-guestwrap { clip-path: inset(-140px -90px 70px -90px) !important; }';
const FREEZE = '#s03 .art .eyes, #s03 .art-kazan .st, #s03 .s03-flag .fl-cloth { animation: none !important; }'
  + ' #s03 .s03-guest .art, #s03 .s03-grandma .art, #s03 .s03-plate .art, #s03 .s03-itemswrap .art { animation: none !important; transform: none !important; }'
  + ' #s03 .art * { transition: none !important; }';
// протокол без наклона (наклон −0,8° задаём в PowerPoint), строки — без сдвига
const FLAT = '#s03 .s03-proto { transform: none !important; transition: none !important; }'
  + ' #s03 .s03-row-txt { transform: none !important; transition: none !important; animation: none !important; }'
  + ' #s03 .s03-thud .sticker { transform: none !important; animation: none !important; }';
const SAY_ON = '#s03 .s03-say-b { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; }';
// все реплики сразу — клонами пузырей (те же классы, тот же якорь), чтобы замерить каждую
const BUBBLES = `(() => {
  const sc = document.querySelector('#s03 .s03-scene');
  const add = (who, html, k) => {
    const d = document.createElement('div');
    d.className = 's03-say s03-say--' + who + ' is-on mm-' + who + k;
    d.innerHTML = '<div class="bubble' + (who === 'guest' ? ' bubble--right' : '') + ' s03-say-b"><span class="s03-say-t">' + html + '</span></div>';
    sc.appendChild(d);
  };
  ${JSON.stringify(['Нет, спасибо!', 'Нет-нет, правда, спасибо!', 'Спасибо, я на&nbsp;диете!'])}.forEach((h, i) => add('guest', h, i + 1));
  ${JSON.stringify(['Oling, oling!<small>«Берите, берите!»</small>', 'Вы же ничего не&nbsp;ели!', 'Диета?!<small>Тогда только<br>маленький казанчик.</small>', 'Вам нужно<br>подкрепиться!'])}.forEach((h, i) => add('gran', h, i + 1));
})()`; // тексты — дословно из 03-refusal.js (S03_GUEST, S03_GRAN, S03_CLIMAX)
const RES_SHOW = '#s03 .s03-final-r { opacity: 1 !important; transform: none !important; transition: none !important; }';
const ROW = (n) => `.s03-row[data-n="${n}"]`;

const BURST = (name, clicks, js, clip, wait = 60) => ({
  name, actions: [...(clicks ? [{ next: clicks, each: 2600 }] : []), { wait: 300 }, { eval: `(() => { FX.clear(); ${js} })()` }], wait,
  // у казана после приземления явно visibility: visible — при изоляции прячем его отдельно
  css: '#fx { display: block !important; visibility: visible !important; } #s03 .s03-kazan { visibility: hidden !important; }',
  items: [{ name, sel: '!#fx', clip }],
});

export const capture = {
  states: [
    {
      name: 'start',
      actions: [{ eval: BUBBLES }],
      css: FREEZE + FLAT + SAY_ON,
      items: [
        { name: 'table', sel: '.s03-tablewrap', pad: 16 },
        { name: 'teapot', sel: '.s03-teapot', pad: 14 },
        { name: 'non', sel: '.s03-non', pad: 14 },
        { name: 'piala', sel: '.s03-piala', pad: 14 },
        { name: 'plate1', sel: '.s03-platewrap', pad: 16 },
        { name: 'plate2', sel: '.s03-platewrap', pad: 16, css: MOUND(1.7) },
        { name: 'plate3', sel: '.s03-platewrap', pad: 16, css: MOUND(2.4) },
        // kind / happy / proud у бабушки рисуются одинаково (общие .mv-kind.mv-happy.mv-proud) — одна картинка gran0
        ...[[0, 'kind'], [2, 'determined'], [3, 'shock']].map(([i, m]) => ({ name: `gran${i}`, sel: '.s03-grandmawrap', pad: 30, css: MOOD('grandma', m) })),
        ...['polite', 'surprised', 'panic', 'shock'].map((m, i) => ({ name: `guest${i}`, sel: '.s03-guestwrap', pad: 30, css: GUEST_CLIP + MOOD('guest', m) })),
        { name: 'kazan', sel: '.s03-kazanwrap', pad: 30, css: '#s03 .s03-kazan { opacity: 1 !important; visibility: visible !important; animation: none !important; transform: none !important; }' },
        { name: 'protoBg', sel: '.s03-proto', pad: 60, hide: ['.s03-proto-badge', '.s03-proto-title', '.s03-score-label', '.s03-count', '.s03-row-no', '.s03-row-txt'] },
        { name: 'res0', sel: '.s03-final-r', pad: 30, css: RES_SHOW },
        { name: 'res1', sel: '.s03-final-r', pad: 30, css: RES_SHOW + ' #s03 .s03-researcher .arm-point { transform: rotate(14deg) !important; }' },
      ],
      measure: [
        { name: 'eyebrow', sel: '.s03-head .eyebrow' }, { name: 'title', sel: '.s03-head .h1' },
        { name: 'proto', sel: '.s03-proto' }, { name: 'protoBadge', sel: '.s03-proto-badge' },
        { name: 'protoTitle', sel: '.s03-proto-title' }, { name: 'scoreLabel', sel: '.s03-score-label' },
        { name: 'scoreBox', sel: '.s03-score-box' }, { name: 'count', sel: '.s03-count' },
        ...[1, 2, 3].flatMap((n) => [{ name: `no${n}`, sel: `${ROW(n)} .s03-row-no` }, { name: `txt${n}`, sel: `${ROW(n)} .s03-row-txt` }, { name: `row${n}`, sel: ROW(n) }]),
        { name: 'btn', sel: '.s03-nobtn' },
        ...[1, 2, 3].map((k) => ({ name: `sayG${k}`, sel: `.mm-guest${k} .s03-say-b` })),
        ...[1, 2, 3, 4].map((k) => ({ name: `sayR${k}`, sel: `.mm-gran${k} .s03-say-b` })),
        { name: 'thud', sel: '.s03-thud .sticker' },
      ],
    },
    {
      // после третьего отказа: кнопка-флаг «СДАЮСЬ», строка № 3
      name: 'surrender', actions: [{ next: 3, each: 2600 }], wait: 900,
      css: FREEZE + FLAT,
      items: [{ name: 'flag', sel: '.s03-nobtn .s03-flag', pad: 6, css: '#s03 .s03-nobtn { animation: none !important; }' }],
      measure: [{ name: 'flagBtn', sel: '.s03-nobtn' }, { name: 'flagSvg', sel: '.s03-nobtn .s03-flag' }, { name: 'txt3on', sel: `${ROW(3)} .s03-row-txt` }],
    },
    // рис из FX-холста (#fx) — тот же вызов FX.plov, что в 03-refusal.js, снимок через ≈ 0,25 с после выброса
    BURST('burst1', 0, `const c = FX.centerOf(document.querySelector('#s03 .s03-grandma .held'));
      FX.plov({ x: c.x + 30, y: c.y - 40, angle: -Math.PI / 2 + .62, spread: .5, power: 17, count: 60, life: 70 });`, { x: 820, y: 240, w: 560, h: 560 }),
    BURST('burst2', 1, `const c = FX.centerOf(document.querySelector('#s03 .s03-plate .mound'));
      FX.plov({ x: c.x, y: c.y - 40, count: 50, power: 15 });`, { x: 900, y: 200, w: 560, h: 620 }),
    BURST('burst3', 3, `const c = FX.centerOf(document.querySelector('#s03 .s03-kazan .mound'));
      FX.plov({ x: c.x, y: c.y - 30, count: 110, power: 22 });`, { x: 1300, y: 230, w: 620, h: 650 }, 140),
    {
      // финал: карточка без наклона (наклон −1,2° задаём в PowerPoint), формулы без дрейфа
      name: 'final', actions: [{ next: 4, each: 2600 }], wait: 1200,
      css: FREEZE + '#s03 .s03-final-card { transform: none !important; transition: none !important; } #s03 .s03-glyph { animation: none !important; translate: none !important; rotate: none !important; transform: none !important; }',
      measure: [
        { name: 'card', sel: '.s03-final-card' }, { name: 'cardBadge', sel: '.s03-final-badge' },
        { name: 'prag', sel: '.s03-prag' }, { name: 'ft1', sel: '.s03-ft1' }, { name: 'ft2', sel: '.s03-ft2' },
        ...[1, 2, 3, 4, 5].map((k) => ({ name: `g${k}`, sel: `.s03-glyph.g${k}` })),
        { name: 'resBox', sel: '.s03-final-r' },
      ],
    },
  ],
};

// ---------- помощники ----------
const run = (text, options = {}) => ({ text, options: { ...options } }); // копия: pptxgenjs меняет объект опций
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });
const grow = (r, l, t = l, rr = l, b = t) => ({ x: r.x - l, y: r.y - t, w: r.w + l + rr, h: r.h + t + b });
// поворот прямоугольника вокруг общего центра (карточка протокола наклонена на −0,8°, финальная — на −1,2°)
function rotAround(r, pivot, deg) {
  const a = (deg * Math.PI) / 180;
  const cx = r.x + r.w / 2 - pivot.x, cy = r.y + r.h / 2 - pivot.y;
  const nx = pivot.x + cx * Math.cos(a) - cy * Math.sin(a), ny = pivot.y + cx * Math.sin(a) + cy * Math.cos(a);
  return { x: nx - r.w / 2, y: ny - r.h / 2, w: r.w, h: r.h };
}
const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const X = (px) => +(px / 1920).toFixed(4); // доли слайда для путей
const Y = (px) => +(px / 1080).toFixed(4);

const GUEST_SAY = [
  [run('Нет, спасибо!')],
  [run('Нет-нет, правда, спасибо!')],
  [run('Спасибо, я на диете!')],
];
const SMALL = { fontSize: 12, color: C.ink2 };
const GRAN_SAY = [
  [run('Oling, oling!', { breakLine: true }), run('«Берите, берите!»', SMALL)],
  [run('Вы же ничего не ели!')],
  [run('Диета?!', { breakLine: true }), run('Тогда только', { ...SMALL, breakLine: true }), run('маленький казанчик.', SMALL)],
  [run('Вам нужно', { breakLine: true }), run('подкрепиться!')],
];

export function build(S) {
  S.start({ layout: 'CHROME', section: 'Эксперимент' });
  const r = S.rects;

  // ---------- шапка ----------
  S.slide.addText('Работает ли отказ от еды?', { placeholder: 'title' });
  S.shape('eyeDash', 'round', { x: 110, y: r.eyebrow.y + 13, w: 46, h: 3 }, { fill: C.gold, radius: 0.01 });
  S.text('eyebrow', 'ЭКСПЕРИМЕНТ «НЕТ, СПАСИБО»', { x: 170, y: r.eyebrow.y - 2, w: 760, h: r.eyebrow.h + 4 }, { size: 11, bold: true, color: C.gold, spacing: 2.4, valign: 'middle', wrap: false });

  // ---------- сцена: гость за дастарханом, ляган, бабушка, казан ----------
  for (let i = 0; i < 4; i++) S.img(`guest${i}`);                // polite → surprised → panic → shock
  S.img('table');
  for (const n of ['piala', 'non', 'teapot']) S.img(n);
  for (let i = 1; i <= 3; i++) S.img(`plate${i}`);               // горка 1 → 1,7 → 2,4
  for (const i of [0, 2, 3]) S.img(`gran${i}`);                  // добрая/довольная/гордая → решительная → в шоке
  S.img('kazan');

  // реплики: пузырь (живой текст на заливке) + хвостик (скруглённый квадрат под 45°)
  const bubble = (name, runs, rect, { fill, tailRight }) => {
    const tx = tailRight ? rect.x + rect.w - 56 - 38 : rect.x + 56;
    S.shape(`${name}t`, 'round', { x: tx, y: rect.y + rect.h - 24, w: 38, h: 38 }, { fill, rotate: 45, radius: 6 / 144, shadow: SH(15, 8, 0.3) });
    S.text(name, runs, rect, {
      size: 16, bold: true, color: C.ink, fill, radius: 30 / 144, valign: 'middle', inset: [14, 14, 9, 9], wrap: false, lineMul: 0.98,
      shadow: SH(15, 8, 0.35),
    });
    return [`${name}t`, name];
  };
  const gS = GUEST_SAY.map((runs, i) => bubble(`gS${i + 1}`, runs, r[`sayG${i + 1}`], { fill: C.cream, tailRight: true }));
  const rS = GRAN_SAY.map((runs, i) => bubble(`rS${i + 1}`, runs, r[`sayR${i + 1}`], { fill: C.gold, tailRight: false }));

  // рис, разлетающийся из лягана / казана (кадр FX-холста HTML)
  for (const n of ['burst1', 'burst2', 'burst3']) S.img(n);

  // «БУМ!» — красный стикер с кремовой окантовкой
  const thud = r.thud;
  S.shape('thudRing', 'round', grow(thud, 7.5), { fill: C.bg, line: C.cream3, lineW: 1.5, radius: 21 / 144, rotate: -8, shadow: SH(15, 9, 0.4) });
  S.text('thud', 'БУМ!', thud, { font: 'display', size: 25, color: C.cream, fill: C.red, radius: 14 / 144, line: C.bg, lineW: 3, rotate: -8, align: 'center', valign: 'middle', wrap: false });

  // ---------- протокол наблюдений (наклон −0,8° вокруг центра карточки) ----------
  const P = center(r.proto), ROT = -0.8;
  const pr = (rect) => rotAround(rect, P, ROT);
  const ptext = (name, text, rect, o) => S.text(name, text, pr(rect), { ...o, rotate: ROT });
  S.img('protoBg', { rotate: ROT });
  ptext('protoBadge', '●  ШУТОЧНЫЙ ЭКСПЕРИМЕНТ', r.protoBadge, { size: 10, bold: true, color: C.cream, fill: C.red, radius: 0.5, align: 'center', valign: 'middle', spacing: 1.4, wrap: false });
  ptext('protoTitle', 'ПРОТОКОЛ\nНАБЛЮДЕНИЙ', grow(r.protoTitle, 0, 4, 40, 4), { font: 'display', size: 13.5, color: C.ink, lineMul: 0.84, valign: 'middle' });
  ptext('scoreLabel', 'СЧЁТЧИК\nОТКАЗОВ', grow(r.scoreLabel, 30, 2, 0, 2), { size: 10, bold: true, color: C.ink2, spacing: 1.2, align: 'right', valign: 'middle', lineMul: 0.92 });
  const CNT_GLOW = { size: 9, opacity: 0.45, color: C.red };
  for (let k = 0; k <= 3; k++) {
    ptext(`c${k}`, [run(String(k), { glow: CNT_GLOW })], r.scoreBox, { font: 'mono', size: 38, bold: true, color: C.red, align: 'center', valign: 'middle', wrap: false });
  }
  const NO = (n) => `ОТКАЗ № ${n}.`;
  for (let n = 1; n <= 3; n++) {
    const nr = grow(r[`no${n}`], 0, 2, 0, 2);
    ptext(`no${n}g`, NO(n), nr, { size: 10.5, bold: true, color: C.cream3, spacing: 1.26, valign: 'middle', wrap: false });
    ptext(`no${n}r`, NO(n), nr, { size: 10.5, bold: true, color: C.red2, spacing: 1.26, valign: 'middle', wrap: false });
  }
  ptext('txt1', 'Начало переговоров', grow(r.txt1, 0, 2, 0, 4), { size: 17, bold: true, color: C.ink, valign: 'middle', wrap: false });
  ptext('txt2', 'Активизация гостеприимства', grow(r.txt2, 0, 2, 0, 4), { size: 19, bold: true, color: C.ink, valign: 'middle', wrap: false });
  ptext('txt3', 'ВАМ НУЖНО\nПОДКРЕПИТЬСЯ!', grow(r.txt3, 0, 4, 0, 6), { font: 'display', size: 20.5, color: C.red, lineMul: 0.8, valign: 'middle' });

  // ---------- кнопка «НЕТ, СПАСИБО» → «⚐ СДАЮСЬ» ----------
  const btnStyle = (fill, edge, color) => ({
    font: 'display', size: 23, color, align: 'center', valign: 'middle', fill, radius: 0.5, wrap: false,
    shadow: SH(0, 4.5, 1, edge),
  });
  S.text('noBtnP', 'НЕТ, СПАСИБО', r.btn, btnStyle(C.red, C.red3, C.cream)); // пульсирует до первого нажатия
  S.text('noBtn', 'НЕТ, СПАСИБО', r.btn, btnStyle(C.red, C.red3, C.cream));
  const fb = r.flagBtn, fs = r.flagSvg;
  S.text('flagBtn', 'СДАЮСЬ', fb, { ...btnStyle(C.cream, C.cream3, C.ink), inset: [(fs.x + fs.w + 16 - fb.x) / 2, 32, 0, 0] });
  S.img('flag');

  // ---------- финал: затемнение, карточка, формулы, Эркинбой ----------
  S.shape('dim', 'rect', { x: 0, y: 64, w: 1920, h: 956 }, { fill: '0C0D0F', fillT: 9 });
  const K = center(r.card), KROT = -1.2;
  const kr = (rect) => rotAround(rect, K, KROT);
  S.shape('card', 'round', grow(r.card, 3), { fill: C.cream, line: C.gold, lineW: 3, radius: 30 / 144, rotate: KROT, shadow: SH(40, 20, 0.6) });
  S.text('cardBadge', '●  ШУТКА', kr(grow(r.cardBadge, 6, 0)), { size: 10, bold: true, color: C.cream, fill: C.red, radius: 0.5, align: 'center', valign: 'middle', spacing: 1.4, wrap: false, rotate: KROT });
  S.text('prag', [
    run('Прагматика:', { bold: true, color: C.ink }),
    run(' речевой акт «нет, спасибо» интерпретируется как просьба о добавке.', { color: C.ink2 }),
  ], kr(grow(r.prag, 0, 0, 40, 8)), { size: 16, color: C.ink2, lineMul: 1.06, valign: 'top', rotate: KROT });
  S.text('ft1', 'Лингвистика бессильна.', kr(grow(r.ft1, 0, 6, 0, 10)), { font: 'display', size: 30, color: C.ink, valign: 'middle', wrap: false, rotate: KROT });
  S.text('ft2', 'Нужна математика!', kr(grow(r.ft2, 0, 6, 0, 14)), { font: 'display', size: 41, color: C.red, valign: 'middle', wrap: false, rotate: KROT });
  S.img('res0');
  S.img('res1');
  // формулы-«светлячки»
  const GL = (color) => ({ glow: { size: 12, opacity: 0.35, color: C.gold }, color });
  const it = (t, o = {}) => run(t, { italic: true, ...o });
  const glyph = (k, runs, size, color) => S.text(`g${k}`, runs, grow(r[`g${k}`], 12, 0, 24, 0), { font: 'serif', size, color, valign: 'middle', wrap: false });
  glyph(1, [run('∑', GL(C.gold))], 46, C.gold);
  glyph(2, [it('P', GL(C.cream)), it('n', { ...GL(C.cream), subscript: true }), run('+1', { ...GL(C.cream), subscript: true })], 35, C.cream);
  glyph(3, [run('lim', GL(C.cream3))], 32, C.cream3);
  glyph(4, [run('∞', GL(C.red))], 40, C.red);
  glyph(5, [run('0,3·', GL(C.gold)), it('P', GL(C.gold)), it('n', { ...GL(C.gold), subscript: true }), run(' + 1', GL(C.gold))], 28, C.gold);

  // ================= анимации =================
  // эффекты щелчка — по времени (порядок в области анимации = порядок на экране; первый эффект фигуры решает, видна ли она до него)
  const click = (...effects) => S.click(...effects.map((e, i) => [e, i]).sort((a, b) => (a[0].delay ?? 0) - (b[0].delay ?? 0) || a[1] - b[1]).map(([e]) => e));
  const burst = (t, delay, { zoom = 300, fall = 0.03, life = 800 } = {}) => [
    { t, fx: 'zoom', delay, dur: zoom },
    { t, fx: 'move', path: `M 0 0 L 0 ${fall} E`, delay, dur: life + 300, accel: 60000, decel: 0 },
    { t, fx: 'fadeOut', delay: delay + life - 300, dur: 400 },
  ];
  const swap = (from, to, delay, dur = 250) => [{ t: from, fx: 'fadeOut', delay, dur }, { t: to, fx: 'fade', delay, dur }];
  const sayIn = ([tail, body], delay, sound) => [
    { t: tail, fx: 'fade', delay, dur: 250 },
    { t: body, fx: 'pop', delay, dur: 450, over: 1.08, ...(sound ? { sound } : {}) },
  ];
  const sayOut = ([tail, body], delay, fx = 'fadeOut', dur = 250) => [{ t: tail, fx, delay, dur }, { t: body, fx, delay, dur }];
  const rowOn = (n, delay) => [
    ...swap(`no${n}g`, `no${n}r`, delay, 300),
    ...(n < 3
      ? [{ t: `txt${n}`, fx: 'fade', delay, dur: 350 }, { t: `txt${n}`, fx: 'move', path: `M ${X(-24)} 0 L 0 0 E`, delay, dur: 500 }]
      : [{ t: 'txt3', fx: 'slam', from: 1.9, delay, dur: 550, sound: 'alarm' }]),
  ];
  const press = (t) => ({ t, fx: 'pulse', by: 96, dur: 320, sound: 'click' });

  // вход на слайд (как data-in в HTML): протокол и стол поднимаются, ляган и кнопка «выпрыгивают», бабушка — слева
  const PROTO = ['protoBg', 'protoBadge', 'protoTitle', 'scoreLabel', 'c0', 'no1g', 'no2g', 'no3g'];
  S.auto(
    { t: 'table', fx: 'riseUp', delay: 270, dur: 800 },
    ...PROTO.map((t) => ({ t, fx: 'riseUp', delay: 350, dur: 800 })),
    { t: 'guest0', fx: 'fade', delay: 450, dur: 800 },
    ...['piala', 'non', 'teapot'].map((t) => ({ t, fx: 'riseUp', delay: 500, dur: 800 })),
    { t: 'plate1', fx: 'pop', delay: 570, dur: 800, over: 1.06 },
    { t: 'noBtnP', fx: 'pop', delay: 570, dur: 800, over: 1.06 },
    { t: 'gran0', fx: 'fade', delay: 650, dur: 800 },
    { t: 'gran0', fx: 'move', path: `M ${X(-80)} 0 L 0 0 E`, delay: 650, dur: 800 },
    { t: 'noBtnP', fx: 'heartbeat', delay: 1400, dur: 1800, by: 104 },
  );

  // 1) Отказ № 1: «Нет, спасибо!» — «Oling, oling!», горка растёт, строка «Начало переговоров»
  click(
    { t: 'noBtnP', fx: 'hide' }, { t: 'noBtn', fx: 'appear' }, press('noBtn'),
    { t: 'c0', fx: 'hide' }, { t: 'c1', fx: 'slam', from: 1.7, dur: 500 },
    ...sayIn(gS[0], 0), { t: 'guest0', fx: 'teeter', deg: 4, dur: 500 },
    { t: 'gran0', fx: 'teeter', deg: 5, dur: 700, delay: 280, sound: 'swoosh' }, // happy: подаёт лаган
    ...sayIn(rS[0], 280), ...burst('burst1', 280, { zoom: 250, fall: 0.025, life: 750 }),
    ...swap('plate1', 'plate2', 900, 300), { t: 'plate2', fx: 'pulse', by: 108, dur: 600, delay: 900, sound: 'plop' },
    ...rowOn(1, 900),
    ...swap('guest0', 'guest1', 900),
    ...sayOut(gS[0], 2000),
  );

  // 2) Отказ № 2: «Нет-нет, правда, спасибо!» — «Вы же ничего не ели!», горка ещё выше, «Активизация гостеприимства»
  click(
    press('noBtn'),
    { t: 'c1', fx: 'hide' }, { t: 'c2', fx: 'slam', from: 1.7, dur: 500 },
    ...sayIn(gS[1], 0), { t: 'guest1', fx: 'teeter', deg: 4, dur: 500 },
    ...swap('gran0', 'gran2', 280), { t: 'gran2', fx: 'pulse', by: 105, dur: 700, delay: 280, sound: 'pop' },
    ...sayOut(rS[0], 280, 'hide'), ...sayIn(rS[1], 280),
    ...swap('plate2', 'plate3', 650, 300), { t: 'plate3', fx: 'pulse', by: 110, dur: 700, delay: 650, sound: 'boing' },
    ...burst('burst2', 650, { zoom: 300, fall: 0.03, life: 800 }),
    ...rowOn(2, 650),
    ...swap('guest1', 'guest2', 650),
    ...sayOut(gS[1], 2000),
  );

  // 3) Отказ № 3: «Спасибо, я на диете!» — «Диета?! Тогда только маленький казанчик.» — казан с неба, БУМ!, тряска,
  //    «Вам нужно подкрепиться!», кнопка сдаётся
  const LAND = 1470;
  const SHAKE = ['protoBg', 'protoBadge', 'protoTitle', 'scoreLabel', 'c3', 'no1r', 'no2r', 'no3g', 'txt1', 'txt2', 'noBtn',
    'table', 'plate3', 'gran3', ...gS[2], ...rS[2], 'eyeDash', 'eyebrow'];
  click(
    press('noBtn'),
    { t: 'c2', fx: 'hide' }, { t: 'c3', fx: 'slam', from: 1.7, dur: 500 },
    ...sayIn(gS[2], 0), { t: 'guest2', fx: 'teeter', deg: 4, dur: 500 },
    ...swap('gran2', 'gran3', 260), { t: 'gran3', fx: 'pulse', by: 105, dur: 700, delay: 260, sound: 'boing' },
    ...sayOut(rS[1], 260, 'hide'), ...sayIn(rS[2], 260),
    // казан падает (удар — на 62 % эффекта «drop», т. е. в момент LAND)
    { t: 'kazan', fx: 'drop', delay: 850, dur: 1000, sound: 'whoosh' },
    // удар: «БУМ!», тряска сцены, посуда подпрыгивает, гость в шоке подскакивает
    { t: 'thudRing', fx: 'pop', delay: LAND, dur: 300, over: 1.12 },
    { t: 'thud', fx: 'pop', delay: LAND, dur: 300, over: 1.12, sound: 'stamp' },
    ...SHAKE.map((t) => ({ t, fx: 'shake', amp: 0.005, dur: 450, delay: LAND })),
    ...burst('burst3', LAND, { zoom: 350, fall: 0.05, life: 1100 }),
    ...['piala', 'non', 'teapot'].map((t, i) => ({ t, fx: 'move', path: `M 0 0 L 0 ${Y(-36)} E`, autoRev: true, dur: 210, delay: LAND + 60 * i })),
    ...swap('guest2', 'guest3', LAND, 150),
    { t: 'guest3', fx: 'move', path: `M 0 0 L 0 ${Y(-42)} E`, autoRev: true, dur: 180, delay: LAND },
    // бабушка довольна: «Вам нужно подкрепиться!» — строка № 3 протокола
    ...swap('gran3', 'gran0', 1650), ...sayOut(rS[2], 1650, 'hide'), ...sayIn(rS[3], 1650),
    ...rowOn(3, 1650),
    // кнопка «НЕТ, СПАСИБО» переворачивается и становится белым флагом «СДАЮСЬ»
    { t: 'noBtn', fx: 'collapseX', delay: 2000, dur: 250, sound: 'swoosh' },
    { t: 'flagBtn', fx: 'expandX', delay: 2250, dur: 250 },
    { t: 'flag', fx: 'expandX', delay: 2250, dur: 250 },
    { t: 'thudRing', fx: 'fadeOut', delay: LAND + 1200, dur: 300 },
    { t: 'thud', fx: 'fadeOut', delay: LAND + 1200, dur: 300 },
    ...sayOut(gS[2], 2600),
  );

  // 4) Финал: затемнение, «Прагматика…», «Лингвистика бессильна.» → «Нужна математика!», формулы, Эркинбой с указкой
  const FIN = 900;
  click(
    press('flagBtn'), { t: 'flag', fx: 'pulse', by: 96, dur: 320 },
    { t: 'dim', fx: 'fade', dur: 600, sound: 'swoosh' },
    ...['card', 'prag', 'ft1'].map((t) => ({ t, fx: 'riseUp', dur: 700 })),
    { t: 'cardBadge', fx: 'pop', delay: 250, dur: 450, sound: 'fail' },
    { t: 'flagBtn', fx: 'sinkDown', delay: 340, dur: 500 }, { t: 'flag', fx: 'sinkDown', delay: 340, dur: 500 },
    { t: 'ft2', fx: 'riseUp', delay: FIN, dur: 600, sound: 'tada' },
    { t: 'res0', fx: 'fade', delay: FIN, dur: 500 },
    { t: 'res0', fx: 'move', path: `M ${X(120)} 0 L 0 0 E`, delay: FIN, dur: 700 },
    ...swap('res0', 'res1', FIN + 600, 300),
    ...[1, 2, 3, 4, 5].map((k) => ({ t: `g${k}`, fx: 'pop', delay: FIN + 50 + 100 * (k - 1), dur: 600, over: 1.12 })),
    ...[1, 2, 3, 4, 5].map((k) => ({ t: `g${k}`, fx: 'float', delay: FIN + 1200 + 300 * k, dur: 2600 + 300 * k, amp: 0.012 })),
  );

  // триггер: щелчок по казану — ещё один «БУМ!» (слайд при этом не листается)
  S.trigger('kazan',
    { t: 'kazan', fx: 'shake', amp: 0.005, dur: 450, sound: 'stamp' },
    { t: 'thudRing', fx: 'pop', dur: 300, over: 1.12 }, { t: 'thud', fx: 'pop', dur: 300, over: 1.12 },
    { t: 'thudRing', fx: 'fadeOut', delay: 1200, dur: 300 }, { t: 'thud', fx: 'fadeOut', delay: 1200, dur: 300 },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 4 щелчка (→, PageDown, кликер или щелчок по кнопке «НЕТ, СПАСИБО»). '
    + '1–3 — отказы № 1, 2, 3: реплики, счётчик, строки протокола, горка растёт; на третьем казан падает с неба («БУМ!», тряска), кнопка становится «СДАЮСЬ» — пауза на смех. '
    + '4 — затемнение и карточка «Лингвистика бессильна. Нужна математика!». Щелчок мышью по казану — ещё один «БУМ!» (слайд не листается). Следующий щелчок — слайд 4.';
}
