// Слайд 4. Математический эксперимент «Можно ли доесть плов?»: прибор «На тарелке» и кнопки слева,
// гость за дастарханом, ляган и бабушка с капгиром справа, внизу — цепочка честной арифметики 1,00 → 0,30 → 1,30 → …
// Щелчки = шаги «Далее» HTML: 1) съесть 70 % (1 → 0,30); 2) бабушка добавляет (+1 → 1,30); 3) съесть (→ 0,39);
// 4) добавляет (→ 1,39); 5) стикер «Вы думали, что скоро пойдёте домой?».
import { C, F } from '../lib/deck.mjs';

// ---------- модель (как в 04-eat.js) ----------
const VALUES = [1, 0.3, 1.3, 0.39, 1.39];
const OPS = ['eat', 'add', 'eat', 'add'];
const amt = (a) => ({ x: Math.pow(a, 0.42), y: Math.pow(a, 0.78) }); // Art.amountScale
const fmt = (x) => x.toFixed(2).replace('.', ',');

// ---------- захват ----------
const MOUND = (a) => { const s = amt(a); return `#s04 .s04-plate .mound { transform: scale(${s.x.toFixed(4)}, ${s.y.toFixed(4)}) !important; }`; };
const MOOD = (who, m) => `#s04 .s04-${who} .mv { display: none !important; } #s04 .s04-${who} .mv-${m} { display: inline !important; }`;
// гость: нижний срез ниже, чем в HTML (он спрятан за дастарханом), чтобы покачивания не открывали край
const GUEST = (name, mood, full) => ({
  name, sel: '.s04-guestwrap', pad: 30,
  css: `#s04 .s04-guestwrap { clip-path: inset(-140px -90px 84px -90px) !important; } #s04 .s04-guest svg { --full: ${full} !important; } ${MOOD('guest', mood)}`,
});
const FREEZE = '#s04 .art .eyes { animation: none !important; } #s04 .art * { transition: none !important; }'
  + ' #s04 .s04-guest .art, #s04 .s04-grandma .art, #s04 .s04-plate .art, #s04 .s04-itemswrap .art { animation: none !important; transform: none !important; }';
// капгир снимаем квадратом 800×800 с центром в точке поворота (рука бабушки, transform-origin 45px 352px):
// тогда «вращение» PowerPoint (вокруг центра картинки) совпадает с HTML. Чтобы квадрат не вылез за кадр,
// при съёмке капгир сдвинут на (−400; −150) — в PowerPoint он встаёт на место по замеру .s04-kapwrap.
export const KAP_SHIFT = { x: -400, y: -150 };
const KAP_PIVOT = { x: 720 + 865 + 45 + KAP_SHIFT.x, y: 240 + 193 + 352 + KAP_SHIFT.y };
const KAP_CLIP = { x: KAP_PIVOT.x - 400, y: KAP_PIVOT.y - 400, w: 800, h: 800 };
const KAP_CSS = `#s04 .s04-kapwrap { left: ${865 + KAP_SHIFT.x}px !important; top: ${193 + KAP_SHIFT.y}px !important; } #s04 .s04-kap, #s04 .s04-kap .kmound { animation: none !important; transition: none !important; }`;
const RICE = (name, clicks, js, clip, wait = 60) => ({
  name, actions: [...(clicks ? [{ next: clicks, each: 2600 }] : []), { wait: 300 }, { eval: `(() => { FX.clear(); ${js} })()` }], wait,
  css: '#fx { display: block !important; visibility: visible !important; }',
  items: [{ name, sel: '!#fx', clip }],
});
const TRAIL = (k) => `.s04-trail > :nth-child(${k})`;
const FLAT_CAP = '#s04 .s04-cap, #s04 .s04-caption.is-on .s04-cap { animation: none !important; transform: none !important; opacity: 1 !important; }';

export const capture = {
  states: [
    {
      name: 'start',
      css: FREEZE,
      items: [
        { name: 'table', sel: '.s04-tablewrap', pad: 16 },
        { name: 'piala', sel: '.s04-piala', pad: 14 },
        { name: 'non', sel: '.s04-non', pad: 14 },
        ...VALUES.map((v, i) => ({ name: `plate${i}`, sel: '.s04-platewrap', pad: 16, css: MOUND(v) })),
        { name: 'gran', sel: '.s04-grandmawrap', pad: 30 },
        GUEST('guest0', 'polite', 0), GUEST('guest1', 'happy', 0.3), GUEST('guest2', 'surprised', 0.3),
        GUEST('guest3', 'full', 0.6), GUEST('guest4', 'panic', 0.6), GUEST('guest5', 'dizzy', 0.6),
        { name: 'kapStick', sel: '.s04-kapwrap', clip: KAP_CLIP, css: KAP_CSS + ' #s04 .s04-kap .kmound { visibility: hidden !important; }' },
        { name: 'kapMound', sel: '.s04-kapwrap', clip: KAP_CLIP, css: KAP_CSS + ' #s04 .s04-kapin { visibility: hidden !important; }' },
      ],
      measure: [
        { name: 'eyebrow', sel: '.s04-head .eyebrow' }, { name: 'title', sel: '.s04-head .h1' },
        { name: 'meter', sel: '.s04-meter' }, { name: 'label', sel: '.s04-meter-head .counter-label' },
        { name: 'head', sel: '.s04-meter-head' }, { name: 'read', sel: '.s04-read' }, { name: 'val', sel: '.s04-val' }, { name: 'unit', sel: '.s04-unit' },
        { name: 'track', sel: '.s04-track' }, { name: 'mark', sel: '.s04-mark' },
        ...[1, 2, 3].map((k) => ({ name: `sc${k - 1}`, sel: `.s04-scale span:nth-child(${k})` })),
        { name: 'eatBtn', sel: '.s04-eat' }, { name: 'addBtn', sel: '.s04-add' },
        { name: 'eatKey', sel: '.s04-eat .key' }, { name: 'addKey', sel: '.s04-add .key' },
        { name: 'trailBadge', sel: '.s04-trail-badge' }, { name: 'kapwrap', sel: '.s04-kapwrap' },
        { name: 'pop', sel: '.s04-pop' },
      ],
    },
    { name: 'say1', actions: [{ next: 2, each: 2600 }], measure: [{ name: 'say1', sel: '.s04-say-b' }] },
    { name: 'say2', actions: [{ next: 4, each: 2600 }], measure: [{ name: 'say2', sel: '.s04-say-b' }] },
    {
      name: 'final', actions: [{ next: 5, each: 2600 }], wait: 1200, css: FREEZE + FLAT_CAP,
      items: [
        { name: 'arrow', sel: `${TRAIL(2)} svg`, pad: 4 },
        { name: 'endChip', sel: '.s04-chip.is-end', pad: 30 },
      ],
      measure: [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => ({ name: `t${k}`, sel: TRAIL(k) })),
        ...[2, 4, 6, 8].map((k) => ({ name: `op${k}`, sel: `${TRAIL(k)} .s04-op` })),
        ...[2, 4, 6, 8, 10].map((k) => ({ name: `ar${k}`, sel: `${TRAIL(k)} svg` })),
        { name: 'endChipM', sel: '.s04-chip.is-end' },
        { name: 'cap', sel: '.s04-cap' }, { name: 'capSpan', sel: '.s04-cap span' }, { name: 'delta', sel: '.s04-delta' },
      ],
    },
    // рис: «съесть» — с горки к гостю (FX.rice), «добавить» — шлепок на горку (FX.plov), как в 04-eat.js
    RICE('riceEat', 0, `const m = FX.centerOf(document.querySelector('#s04 .s04-plate .mound'));
      FX.rice({ x: m.x - 30, y: m.y - m.h * .35, angle: -2.3, spread: .7, power: 19, count: 60, gravity: .5, life: 60 });`, { x: 780, y: 230, w: 560, h: 560 }, 120),
    RICE('riceAdd', 1, `const m = FX.centerOf(document.querySelector('#s04 .s04-plate .mound'));
      FX.plov({ x: m.x, y: m.y - m.h * .4, count: 46, power: 12 });`, { x: 990, y: 380, w: 460, h: 460 }, 100),
  ],
};

// ---------- помощники ----------
const run = (text, options = {}) => ({ text, options: { ...options } }); // копия: pptxgenjs меняет объект опций
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });
const grow = (r, l, t = l, rr = l, b = t) => ({ x: r.x - l, y: r.y - t, w: r.w + l + rr, h: r.h + t + b });
const X = (px) => +(px / 1920).toFixed(4); // доли слайда для путей
const Y = (px) => +(px / 1080).toFixed(4);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const unit = (v) => (Number.isInteger(v) ? (v === 1 ? 'порция' : 'порции') : 'порции'); // Fmt.portions: 1 порция, дробное — «порции»
const num = (v) => (Number.isInteger(v) ? String(v) : fmt(v));
const TWEEN = [0.15, 0.35, 0.6]; // кадры «бегущего» счётчика (650 мс, ease-out-cubic, как s04Tween)

export function build(S) {
  S.start({ layout: 'CHROME', section: 'Эксперимент' });
  const r = S.rects;

  // ---------- шапка ----------
  S.slide.addText('Можно ли доесть плов?', { placeholder: 'title' });
  S.shape('eyeDash', 'round', { x: 110, y: r.eyebrow.y + 13, w: 46, h: 3 }, { fill: C.gold, radius: 0.01 });
  S.text('eyebrow', 'МАТЕМАТИЧЕСКИЙ ЭКСПЕРИМЕНТ', { x: 170, y: r.eyebrow.y - 2, w: 760, h: r.eyebrow.h + 4 }, { size: 11, bold: true, color: C.gold, spacing: 2.4, valign: 'middle', wrap: false });

  // ---------- сцена: гость, дастархан, ляган, бабушка с капгиром ----------
  for (let i = 0; i < 6; i++) S.img(`guest${i}`); // polite → happy → surprised → full → panic → dizzy (живот растёт)
  S.img('table');
  S.img('piala');
  S.img('non');
  for (let i = 0; i < 5; i++) S.img(`plate${i}`); // горка 1 → 0,3 → 1,3 → 0,39 → 1,39
  S.img('gran');
  // капгир: квадрат с центром в руке бабушки (точка поворота) — см. KAP_SHIFT в захвате
  const kw = r.kapwrap;
  const KAP = { x: kw.x + 45 - 400, y: kw.y + 352 - 400, w: 800, h: 800 };
  S.img('kapStick', { rect: KAP });
  S.img('kapMound', { rect: KAP });

  // всплывающие «−70%» / «+1» над горкой (позиция — как в show(): над вершиной большей из двух горок)
  const popTop = (prev, next) => {
    const sy = amt(Math.min(Math.max(prev, next), 3.6)).y;
    const top = Math.round(744 - 176 * sy - 96 - 240);
    return 240 + Math.min(top, 400);
  };
  OPS.forEach((op, i) => {
    const y = popTop(VALUES[i], VALUES[i + 1]);
    S.text(`pop${i + 1}`, [run(op === 'eat' ? '−70%' : '+1', { outline: { size: 1.5, color: C.ink } })], { x: 1050, y: y - 14, w: 320, h: 92 },
      { font: 'display', size: 32, color: op === 'eat' ? C.cream : C.red, align: 'center', valign: 'middle', wrap: false });
  });

  // реплика бабушки (золотой пузырь с хвостиком справа)
  const bubble = (name, runs, rect) => {
    S.shape(`${name}t`, 'round', { x: rect.x + rect.w - 56 - 38, y: rect.y + rect.h - 24, w: 38, h: 38 }, { fill: C.gold, rotate: 45, radius: 6 / 144, shadow: SH(15, 8, 0.3) });
    S.text(name, runs, rect, { size: 16, bold: true, color: C.ink, fill: C.gold, radius: 30 / 144, valign: 'middle', inset: [14, 14, 9, 9], wrap: false, lineMul: 0.98, shadow: SH(15, 8, 0.35) });
    return [`${name}t`, name];
  };
  const say1 = bubble('say1', [run('Oling, oling!', { breakLine: true }), run('«Берите, берите!»', { fontSize: 12, color: C.ink2 })], r.say1);
  const say2 = bubble('say2', [run('Остывает же!')], r.say2);

  // рис (кадры FX-холста HTML): «съесть» — с горки к гостю, «добавить» — шлепок на горку
  S.img('riceEat1', { file: 'riceEat' });
  S.img('riceEat2', { file: 'riceEat' });
  S.img('riceAdd1', { file: 'riceAdd' });
  S.img('riceAdd2', { file: 'riceAdd' });

  // ---------- прибор «НА ТАРЕЛКЕ» ----------
  S.shape('meter', 'round', r.meter, { fill: C.panel, line: C.line, lineW: 0.75, radius: 24 / 144, shadow: SH(25, 12, 0.35) });
  S.text('label', 'НА ТАРЕЛКЕ', grow(r.label, 0, 2, 60, 2), { size: 10.5, bold: true, color: C.cream3, spacing: 1.7, valign: 'middle', wrap: false });
  OPS.forEach((op, i) => S.text(`d${i + 1}`, op === 'eat' ? '×0,3' : '+1', { x: 540, y: r.head.y - 4, w: 126, h: 48 },
    { font: 'serif', size: 20, color: op === 'eat' ? C.gold : C.red, align: 'right', valign: 'middle', wrap: false }));
  // значение: число (моно) + единица; «бегущие» промежуточные кадры между шагами
  const VAL_GLOW = { size: 12, opacity: 0.3, color: C.gold };
  const VBOX = { x: r.read.x - 4, y: r.read.y - 14, w: r.read.w + 30, h: r.read.h + 24 };
  const value = (name, v) => S.text(name, [
    run(num(v), { fontFace: F.mono, fontSize: 59, bold: true, color: C.gold, glow: VAL_GLOW, charSpacing: -1.8 }),
    run(`  ${unit(v)}`, { fontFace: F.body, fontSize: 18, bold: true, color: C.cream2 }),
  ], VBOX, { valign: 'bottom', wrap: false, inset: [0, 0, 6, 0] });
  value('v0', VALUES[0]);
  const frames = [];
  for (let s = 1; s <= 4; s++) {
    const a = VALUES[s - 1], b = VALUES[s];
    frames[s] = TWEEN.map((t, j) => { const n = `v${s}_${j}`; value(n, Math.round((a + (b - a) * easeOutCubic(t)) * 100) / 100); return n; });
    value(`v${s}`, b);
  }
  // шкала: дорожка, заливки (v/2 ширины), отметка «1», подписи 0 1 2
  const tr = r.track;
  S.shape('track', 'round', tr, { fill: C.bg, line: C.line, lineW: 1, radius: 13 / 144 });
  VALUES.forEach((v, i) => S.shape(`f${i}`, 'round', { x: tr.x, y: tr.y, w: Math.max(26, tr.w * Math.min(1, v / 2)), h: tr.h }, { fill: C.gold, radius: 13 / 144 }));
  S.shape('mark', 'rect', r.mark, { fill: C.cream, fillT: 20 });
  ['0', '1', '2'].forEach((t, k) => {
    const sc = r[`sc${k}`];
    S.text(`sc${k}`, t, { x: sc.x + sc.w / 2 - 20, y: sc.y, w: 40, h: sc.h }, { font: 'mono', size: 11, bold: true, color: C.muted, align: 'center', valign: 'middle', wrap: false });
  });

  // ---------- кнопки ----------
  const btn = (name, label, rect, key, keyRect, { fill, edge, color, keyFill }) => {
    S.text(name, label, rect, {
      font: 'display', size: 15.5, color, fill, radius: 0.5, align: 'left', valign: 'middle', wrap: false,
      inset: [(keyRect.x + keyRect.w + 16 - rect.x) / 2, 8, 0, 0], shadow: SH(0, 4.5, 1, edge),
    });
    S.text(`${name}Key`, key, keyRect, { font: 'mono', size: 9.5, bold: true, color, fill: keyFill, radius: 0.5, align: 'center', valign: 'middle', wrap: false });
  };
  btn('eatBtn', 'СЪЕСТЬ 70%', r.eatBtn, '1', r.eatKey, { fill: C.gold, edge: C.gold2, color: C.ink, keyFill: 'D4A124' });
  btn('addBtn', 'БАБУШКА ДОБАВЛЯЕТ', r.addBtn, '2', r.addKey, { fill: C.red, edge: C.red3, color: C.cream, keyFill: 'EC6553' });

  // ---------- цепочка «честной арифметики» ----------
  S.badge('trailBadge', 'math', 'Математика', { x: r.trailBadge.x, y: r.trailBadge.y - 1.5 }, { size: 10, w: r.trailBadge.w });
  const chip = (name, v, rect, gold) => S.text(name, fmt(v), rect, {
    font: 'mono', size: 18, bold: true, color: C.ink, fill: gold ? C.gold : C.cream, radius: 14 / 144, align: 'center', valign: 'middle', wrap: false,
    shadow: SH(0, 3, 1, gold ? C.gold2 : C.cream3),
  });
  VALUES.forEach((v, i) => {
    const cr = r[`t${2 * i + 1}`];
    if (i < 4) chip(`chip${i}`, v, cr, false);  // кремовая (уже не последняя)
    chip(`chipG${i}`, v, cr, true);              // золотая (последняя)
  });
  for (let k = 1; k <= 5; k++) {
    S.img(`ar${k}`, { file: 'arrow', rect: grow(r[`ar${2 * k}`], 4) });
    if (k <= 4) {
      const op = r[`op${2 * k}`];
      S.text(`op${k}`, OPS[k - 1] === 'eat' ? '×0,3' : '+1', grow(op, 6, 2), { font: 'serif', size: 13.5, color: OPS[k - 1] === 'eat' ? C.gold : C.red, align: 'center', valign: 'middle', wrap: false });
    }
  }
  S.img('endChip');

  // ---------- панчлайн-стикер ----------
  const cap = { x: 975, y: r.cap.y - 8, w: 1810 - 975, h: r.cap.h - 8 }; // шире, чем в HTML: Arial Black шире Unbounded
  S.shape('capRing', 'round', grow(cap, 8), { fill: C.bg, line: C.red, lineW: 2, radius: 28 / 144, rotate: -2.5, shadow: SH(22, 13, 0.5) });
  S.text('cap', [
    run('Вы думали, что скоро', { breakLine: true }),
    run('пойдёте домой?', { color: C.red }),
  ], cap, { font: 'display', size: 24, color: C.ink, fill: C.cream, line: C.bg, lineW: 3, radius: 20 / 144, rotate: -2.5, valign: 'middle', lineMul: 0.82, inset: [16, 12, 10, 9], wrap: false });

  // ================= анимации =================
  // эффекты щелчка — по времени (первый эффект фигуры решает, видна ли она до него)
  const click = (...effects) => S.click(...effects.map((e, i) => [e, i]).sort((a, b) => (a[0].delay ?? 0) - (b[0].delay ?? 0) || a[1] - b[1]).map(([e]) => e));
  const swap = (from, to, delay, dur = 250) => [{ t: from, fx: 'fadeOut', delay, dur }, { t: to, fx: 'fade', delay, dur }];
  const press = (name, sound2) => [
    { t: name, fx: 'pulse', by: 96, dur: 300, sound: 'click' },
    { t: `${name}Key`, fx: 'pulse', by: 90, dur: 300, ...(sound2 ? { sound: sound2 } : {}) },
  ];
  const riceFx = (t, delay, path, life) => [
    { t, fx: 'zoom', delay, dur: 250 },
    { t, fx: 'move', path, delay, dur: life + 300, accel: 50000, decel: 0 },
    { t, fx: 'fadeOut', delay: delay + life - 250, dur: 350 },
  ];
  // общий «show()»: счётчик бежит, заливка, дельта, всплывающая метка, новое звено цепочки
  const show = (s, T) => {
    const op = OPS[s - 1];
    const seq = [`v${s - 1}`, ...frames[s], `v${s}`];
    const tick = TWEEN.map((t) => T + Math.round(650 * t));
    const times = [...tick, T + 650];
    const fx = [];
    times.forEach((tm, j) => fx.push({ t: seq[j], fx: 'hide', delay: tm }, { t: seq[j + 1], fx: 'appear', delay: tm }));
    fx.push({ t: `v${s}`, fx: 'pulse', by: 110, dur: 450, delay: T + 650 });
    // заливка шкалы
    if (VALUES[s] > VALUES[s - 1]) fx.push({ t: `f${s}`, fx: 'wipeLeft', delay: T, dur: 700 }, { t: `f${s - 1}`, fx: 'hide', delay: T + 700 });
    else fx.push({ t: `f${s}`, fx: 'appear', delay: T }, { t: `f${s - 1}`, fx: 'fadeOut', delay: T, dur: 500 });
    // «×0,3» / «+1» в шапке прибора
    fx.push({ t: `d${s}`, fx: 'zoom', delay: T, dur: 240 }, { t: `d${s}`, fx: 'fadeOut', delay: T + 1200, dur: 400 });
    // «−70%» / «+1» над горкой: всплывает и тает
    fx.push(
      { t: `pop${s}`, fx: 'pop', delay: T, dur: 450, over: 1.1 },
      { t: `pop${s}`, fx: 'move', path: `M 0 ${Y(40)} L 0 ${Y(-70)} E`, delay: T, dur: 1300, decel: 60000 },
      { t: `pop${s}`, fx: 'fadeOut', delay: T + 975, dur: 325 },
    );
    // цепочка: прежнее звено становится кремовым, новое — золотое
    fx.push(
      { t: `chip${s - 1}`, fx: 'appear', delay: T }, { t: `chipG${s - 1}`, fx: 'fadeOut', delay: T, dur: 300 },
      { t: `ar${s}`, fx: 'fade', delay: T, dur: 350 }, { t: `op${s}`, fx: 'fade', delay: T, dur: 350 },
      { t: `chipG${s}`, fx: 'pop', delay: T, dur: 500, over: 1.08 },
      { t: `chipG${s}`, fx: 'move', path: `M ${X(-30)} 0 L 0 0 E`, delay: T, dur: 500 },
    );
    return fx;
  };
  // «съесть 70 %»: рис летит к гостю, гость жуёт («глоток» ×2), бабушка довольна, реплика исчезает
  const eat = (s, guestFrom, guestTo, sayOff) => [
    ...press('eatBtn', 'swoosh'),
    ...riceFx(`riceEat${(s + 1) / 2}`, 0, `M 0 0 L ${X(-40)} ${Y(30)} E`, 650),
    ...(sayOff ? sayOff.map((t) => ({ t, fx: 'fadeOut', delay: 300, dur: 250 })) : []),
    ...swap(`plate${s - 1}`, `plate${s}`, 120, 600),
    ...swap(guestFrom, guestTo, 260),
    { t: guestTo, fx: 'pulse', by: 103, dur: 350, repeat: 2, delay: 260, sound: 'gulp' },
    { t: guestTo, fx: 'pulse', by: 101, dur: 100, delay: 560, sound: 'gulp' },
    ...show(s, 120),
  ];
  // «бабушка добавляет»: наклон, капгир к лягану и обратно, шлепок, гость пугается
  const KAPS = ['kapStick', 'kapMound'];
  const serve = (delay = 0) => [
    ...KAPS.flatMap((t, i) => [
      { t, fx: 'move', path: `M 0 0 L ${X(-183)} ${Y(-78)} L ${X(-183)} ${Y(-64)} L 0 0 E`, delay, dur: 950, accel: 20000, decel: 20000 },
      { t, fx: 'spin', deg: -90, delay, dur: 330, ...(i === 0 ? { sound: 'whoosh' } : {}) },
      { t, fx: 'spin', deg: -30, delay: delay + 330, dur: 145 },
      { t, fx: 'spin', deg: 120, delay: delay + 475, dur: 475 },
    ]),
    { t: 'kapMound', fx: 'hide', delay: delay + 450 }, { t: 'kapMound', fx: 'fade', delay: delay + 780, dur: 170 },
    { t: 'gran', fx: 'teeter', deg: 5, delay, dur: 900 },
  ];
  const add = (s, guestFrom, guestTo, sayIn) => [
    ...press('addBtn'),
    ...serve(0),
    { t: sayIn[0], fx: 'fade', dur: 250 }, { t: sayIn[1], fx: 'pop', dur: 450, over: 1.08 },
    ...swap(`plate${s - 1}`, `plate${s}`, 500, 300),
    { t: `plate${s}`, fx: 'pulse', by: 108, dur: 600, delay: 500, sound: 'plop' },
    ...riceFx(`riceAdd${s / 2}`, 500, `M 0 0 L 0 ${Y(40)} E`, 600),
    ...swap(guestFrom, guestTo, 500),
    { t: guestTo, fx: 'shake', amp: 0.003, dur: 450, delay: 500 },
    ...show(s, 500),
  ];

  // вход на слайд (как data-in в HTML)
  const METER = ['meter', 'label', 'v0', 'track', 'f0', 'mark', 'sc0', 'sc1', 'sc2'];
  S.auto(
    { t: 'table', fx: 'riseUp', delay: 270, dur: 800 },
    ...METER.map((t) => ({ t, fx: 'riseUp', delay: 330, dur: 800 })),
    { t: 'guest0', fx: 'fade', delay: 400, dur: 800 },
    ...['piala', 'non'].map((t) => ({ t, fx: 'riseUp', delay: 450, dur: 800 })),
    { t: 'plate0', fx: 'pop', delay: 510, dur: 800, over: 1.06 },
    ...['eatBtn', 'eatBtnKey'].map((t) => ({ t, fx: 'pop', delay: 530, dur: 800, over: 1.06 })),
    { t: 'gran', fx: 'fade', delay: 570, dur: 800 },
    { t: 'gran', fx: 'move', path: `M ${X(80)} 0 L 0 0 E`, delay: 570, dur: 800 },
    ...['addBtn', 'addBtnKey'].map((t) => ({ t, fx: 'pop', delay: 620, dur: 800, over: 1.06 })),
    ...['trailBadge', 'chipG0'].map((t) => ({ t, fx: 'riseUp', delay: 670, dur: 800 })),
    ...KAPS.map((t) => ({ t, fx: 'fade', delay: 850, dur: 800 })),
  );

  click(...eat(1, 'guest0', 'guest1'));          // 1) 1 → 0,30
  click(...add(2, 'guest1', 'guest2', say1));    // 2) 0,30 → 1,30, «Oling, oling!»
  click(...eat(3, 'guest2', 'guest3', say1));    // 3) 1,30 → 0,39
  click(...add(4, 'guest3', 'guest4', say2));    // 4) 0,39 → 1,39, «Остывает же!»
  // 5) «Вы думали, что скоро пойдёте домой?» — гость в прострации, цепочка уходит в бесконечность
  click(
    { t: 'capRing', fx: 'slam', from: 2.2, dur: 600 },
    { t: 'cap', fx: 'slam', from: 2.2, dur: 600, sound: 'stamp' },
    ...say2.map((t) => ({ t, fx: 'fadeOut', dur: 250 })),
    ...swap('guest4', 'guest5', 0, 300),
    { t: 'ar5', fx: 'fade', delay: 350, dur: 350 },
    { t: 'endChip', fx: 'pop', delay: 350, dur: 500, over: 1.08, sound: 'sparkle' },
    { t: 'endChip', fx: 'move', path: `M ${X(-30)} 0 L 0 0 E`, delay: 350, dur: 500 },
  );

  // триггер: щелчок по бейджу «Математика» — звенья цепочки по очереди «отстукивают» (слайд не листается)
  S.trigger('trailBadge',
    { t: 'trailBadge', fx: 'pulse', by: 108, dur: 300, sound: 'tick' },
    ...VALUES.flatMap((_, i) => [
      { t: `chipG${i}`, fx: 'pulse', by: 112, dur: 300, delay: 150 + 160 * i, sound: 'tick' },
      ...(i < 4 ? [{ t: `chip${i}`, fx: 'pulse', by: 112, dur: 300, delay: 150 + 160 * i }] : []),
    ]),
    { t: 'endChip', fx: 'pulse', by: 112, dur: 300, delay: 950, sound: 'ding' },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: 5 щелчков (→, PageDown, кликер или щелчок мышью). 1 — «Съесть 70%» (1 → 0,30), 2 — «Бабушка добавляет» (→ 1,30), '
    + '3 — съесть (→ 0,39), 4 — добавить (→ 1,39), 5 — стикер «Вы думали, что скоро пойдёте домой?» (пауза на смех). '
    + 'В PowerPoint кнопки срабатывают только по порядку: любой щелчок = следующий шаг (клавиши 1/2 не работают). '
    + 'Щелчок мышью по бейджу «Математика» — звенья цепочки «отстукивают» (слайд не листается). Следующий щелчок — слайд 5.';
}
