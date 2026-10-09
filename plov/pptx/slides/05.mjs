// Слайд 5. «Формула узбекского гостеприимства» (2:15–2:40).
// Формула Pₙ₊₁ = 0,3 · Pₙ + 1 — живым текстом (Cambria, курсивное P, настоящие нижние индексы) в «академической»
// золотой рамке с уголками и номером (1). При открытии слайда члены формулы падают по одному под барабанную дробь,
// затем звон, «ЭВРИКА!» и блик по рамке.
// Щелчки = шаги «Далее» HTML: 1) Pₙ — подсветка + карточка «плов до очередного приёма пищи»; 2) 0,3 — «доля,
// оставшаяся после еды»; 3) +1 — «новая порция от бабушки» (и брызги плова); 4) мораль + бейджи, подсвечена вся формула.
// Триггеры: щелчок мышью по члену формулы — член и его карточка «подпрыгивают»; по «ЭВРИКА!» — покачивание со звоном.
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { C, F } from '../lib/deck.mjs';

const PX = (v) => v / 144; // px сцены → дюймы (радиусы скругления)
const SH = (blur, offset, opacity, color = '000000') => ({ type: 'outer', color, blur, offset, angle: 90, opacity });
const r4 = (v) => +v.toFixed(4);

/* ------------------------------------------------------------ захват ------------------------------------------------------------ */
export const capture = {
  states: [
    {
      name: 'start',
      // «Эврика!» без поворота — для размеров наклейки (поворот 7° ставим сами)
      css: '#s05 .s05-eureka { transform: none !important; transition: none !important; }',
      items: [
        // рамка с уголками, свечением и тенью — без формулы, номера и наклейки (сверху обрезано: не заходит на заголовок)
        { name: 'frame', sel: '.s05-frame', pad: 110, hide: ['.s05-formula', '.s05-eqno', '.s05-eureka'], clip: { x: 80, y: 212, w: 1760, h: 430 } },
      ],
      measure: [
        { name: 'frameBox', sel: '.s05-frame' },
        { name: 'tLhs', sel: '.t-lhs' }, { name: 'tEq', sel: '.t-eq' }, { name: 'tCoef', sel: '.t-coef' }, { name: 'tDot', sel: '.t-dot' },
        { name: 'tPn', sel: '.t-pn' }, { name: 'tPlus', sel: '.t-plus' }, { name: 'tOne', sel: '.t-one' },
        { name: 'eqno', sel: '.s05-eqno' }, { name: 'eureka', sel: '.s05-eureka' },
      ],
    },
    {
      name: 'all',
      actions: [{ next: 4, each: 1500 }],
      wait: 1500,
      css: '#s05 .s05-wires .w.is-on { animation: none !important; } #s05 .s05-card, #s05 .art .eyes { animation: none !important; }',
      items: [
        // пунктирные «проводки» от членов формулы к карточкам
        { name: 'wPn', sel: '.s05-wires .w-pn', pad: 8 },
        { name: 'wCoef', sel: '.s05-wires .w-coef', pad: 8 },
        { name: 'wOne', sel: '.s05-wires .w-one', pad: 8 },
        // иконки карточек: полная тарелка, тарелка с остатком, бабушка
        { name: 'icoPn', sel: '.s05-ico-pn', self: true, pad: 0 },
        { name: 'icoCoef', sel: '.s05-ico-coef', self: true, pad: 0 },
        { name: 'icoOne', sel: '.s05-ico-one', self: true, pad: 0 },
      ],
      measure: [
        { name: 'cPn', sel: '.k-pn' }, { name: 'cCoef', sel: '.k-coef' }, { name: 'cOne', sel: '.k-one' },
        { name: 'symPn', sel: '.k-pn .s05-sym' }, { name: 'symCoef', sel: '.k-coef .s05-sym' }, { name: 'symOne', sel: '.k-one .s05-sym' },
        { name: 'pPn', sel: '.k-pn p' }, { name: 'pCoef', sel: '.k-coef p' }, { name: 'pOne', sel: '.k-one p' },
        { name: 'moral', sel: '.s05-moral' }, { name: 'moralB', sel: '.s05-moral span' },
        { name: 'b1', sel: '.s05-badges .badge:nth-child(1)' }, { name: 'b2', sel: '.s05-badges .badge:nth-child(2)' },
      ],
    },
  ],
};

/* --------------------------------------------- блик по рамке: мягкая светлая полоса (PNG пишем сами) --------------------------------------------- */
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return (buf) => { let c = 0xffffffff; for (const b of buf) c = t[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
})();
function writePng(file, w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
// как ::after в HTML: linear-gradient(100deg, transparent, rgba(255,236,170,.22), transparent)
function sheenFile(S) {
  const f = join(S.dir, 'sheen.png');
  if (existsSync(f)) return f;
  const w = 260, h = 136, px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = (x + (y - h / 2) * Math.tan(Math.PI / 18) - w / 2) / (w * 0.36); // наклон 10°
      const a = Math.max(0, 1 - u * u) ** 2;
      const i = (y * w + x) * 4;
      px[i] = 255; px[i + 1] = 236; px[i + 2] = 170; px[i + 3] = Math.round(255 * 0.24 * a);
    }
  }
  writePng(f, w, h, px);
  return f;
}

/* ------------------------------------------------------------ сборка ------------------------------------------------------------ */
// текстовые «прогоны» формулы
const run = (text, options = {}) => ({ text, options: { ...options } }); // копия: pptxgenjs меняет объект опций
const SUB = -400; // нижний индекс: смещение −20 % кегля (как vertical-align в HTML); кегль индекса PowerPoint уменьшает сам

export function build(S) {
  S.start({ layout: 'CHROME', eyebrow: 'Основное уравнение', title: 'Формула узбекского гостеприимства', section: 'Модель' });
  const r = S.rects;
  // номер слайда — своим текстом: у pptxgenjs поле номера получает id, совпадающий с id 24-й фигуры (ломает анимации)
  S.slide._slideNumberProps = null;
  S.text('sldNum', String(+S.id), { x: 1700, y: 1032, w: 110, h: 36 }, { font: 'mono', size: 11, bold: true, color: C.cream, align: 'right', valign: 'middle', wrap: false });

  // ================= рамка и формула =================
  S.img('frame');
  const fb = r.frameBox;
  S.imgFile('sheen', sheenFile(S), { x: fb.x + 2, y: fb.y + 2, w: 560, h: fb.h - 4 }, { alt: 'Блик по рамке' });
  S.text('eqno', '(1)', { x: r.eqno.x - 20, y: r.eqno.y - 4, w: r.eqno.w + 40, h: r.eqno.h + 8 }, { font: 'serif', size: 23, color: C.muted, align: 'center', valign: 'middle', wrap: false });

  // члены формулы: обычный вид и «подсветка» (цвет, свечение, тонированная плашка, ×1,08 как scale в HTML)
  const BASE = 445;            // базовая линия формулы (в HTML 448 px; −3 px — запас: рендер LibreOffice/Caladea садит Cambria ниже)
  const ASC = 0.95;            // подъём строки Cambria (доля кегля) для верхнего края текстовой рамки
  const FS = 88, HL = 1.08;    // 176 px = 88 pt
  const TERMS = [
    { k: 'Lhs', color: C.cream, runs: (o) => [run('P', { ...o, italic: true }), run('n', { ...o, italic: true, baseline: SUB }), run('+1', { ...o, baseline: SUB })] },
    { k: 'Eq', color: C.cream3, runs: () => '=' },
    { k: 'Coef', color: C.cream, runs: () => '0,3', hl: { color: C.gold, glow: C.gold, glowA: 0.7, bg: C.gold, bgT: 90 } },
    { k: 'Dot', color: C.cream3, runs: () => '·' },
    { k: 'Pn', color: C.cream, runs: (o) => [run('P', { ...o, italic: true }), run('n', { ...o, italic: true, baseline: SUB })], hl: { color: C.white, glow: C.white, glowA: 0.55, bg: C.cream, bgT: 92 } },
    { k: 'Plus', color: C.cream3, runs: () => '+' },
    { k: 'One', color: C.cream, runs: () => '1', hl: { color: C.red, glow: C.red, glowA: 0.7, bg: C.red, bgT: 90 } },
  ];
  const termBox = (t, s) => {
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    const w = t.w * s + 40, top = cy - s * (cy - (BASE - ASC * FS * 2));
    return { x: cx - w / 2, y: top, w, h: 236 * s };
  };
  for (const T of TERMS) {
    const t = r[`t${T.k}`];
    if (T.hl) {
      const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
      S.shape(`hlBg${T.k}`, 'round', { x: cx - (t.w * HL) / 2, y: cy - (t.h * HL) / 2, w: t.w * HL, h: t.h * HL }, { fill: T.hl.bg, fillT: T.hl.bgT, radius: PX(19) });
    }
    S.text(`t${T.k}`, T.runs({ color: T.color }), termBox(t, 1), { font: 'serif', size: FS, color: T.color, align: 'center', wrap: false });
    if (T.hl) {
      S.text(`hl${T.k}`, T.runs({ color: T.hl.color }), termBox(t, HL), {
        font: 'serif', size: +(FS * HL).toFixed(1), color: T.hl.color, align: 'center', wrap: false, shadow: SH(17, 0, T.hl.glowA, T.hl.glow),
      });
    }
  }
  // невидимые «горячие зоны» над членами формулы — для триггеров (под наклейкой «Эврика!»)
  for (const k of ['Coef', 'Pn', 'One']) {
    const t = r[`t${k}`];
    S.shape(`hot${k}`, 'rect', { x: t.x + 6, y: 312, w: t.w - 12, h: 166 }, { fill: C.bg, fillT: 100 });
  }

  // «ЭВРИКА!»: кремовое внешнее кольцо + золотая наклейка с тёмным кантом, поворот 7°
  const eu = r.eureka;
  S.shape('eurekaRing', 'round', { x: eu.x - 9, y: eu.y - 9, w: eu.w + 18, h: eu.h + 18 }, { fill: C.cream3, radius: PX(23), rotate: 7, shadow: SH(15, 9, 0.4) });
  S.text('eureka', 'ЭВРИКА!', { x: eu.x - 3, y: eu.y - 3, w: eu.w + 6, h: eu.h + 6 }, {
    font: 'display', size: 15, color: C.ink, align: 'center', valign: 'middle', rotate: 7, fill: C.gold, line: C.bg, lineW: 3, radius: PX(17), wrap: false,
  });

  // ================= проводки и карточки =================
  S.img('wPn'); S.img('wCoef'); S.img('wOne');
  // брызги плова из иконки бабушки (как FX.at(…, 'plov') в HTML)
  const io = r.icoOne, pcx = io.x + io.w / 2, pcy = io.y + io.h / 2 - 10;
  const SPLASH = [
    [-170, -150, 'r'], [-120, -210, 'c'], [-60, -240, 'r'], [10, -250, 'r'], [70, -220, 'c'],
    [130, -190, 'r'], [185, -140, 'r'], [-200, -90, 'c'], [215, -80, 'r'], [-30, -180, 'c'], [40, -170, 'r'], [150, -240, 'r'],
  ];
  const splash = [], grains = [];
  SPLASH.forEach(([vx, vy, kind], i) => {
    const name = `grain${i}`;
    const sz = kind === 'c' ? { w: 18, h: 6 } : { w: 12, h: 7 };
    grains.push([name, kind, sz, i]);
    // вылет вверх-в сторону и падение (кубическая кривая; доли ширины/высоты слайда)
    const fx = (v) => r4(v / 1920), fy = (v) => r4(v / 1080);
    const path = `M 0 0 C ${fx(vx * 0.35)} ${fy(vy * 0.8)} ${fx(vx * 0.75)} ${fy(vy * 0.9)} ${fx(vx)} ${fy(vy * 0.35 + 140)} E`;
    const d = 140 + (i % 4) * 25;
    splash.push(
      { t: name, fx: 'appear', delay: d },
      { t: name, fx: 'move', path, delay: d, dur: 900, decel: 20000 },
      { t: name, fx: 'fadeOut', delay: d + 620, dur: 280 },
    );
  });

  const CARDS = [
    { k: 'Coef', ring: C.gold, sym: [run('0,3:', { color: C.gold2 })], text: 'доля, оставшаяся\nпосле еды' },
    { k: 'Pn', ring: C.cream3, sym: [run('P', { color: C.ink, italic: true }), run('n', { color: C.ink, italic: true, baseline: SUB }), run(':', { color: C.ink })], text: 'плов до очередного\nприёма пищи' },
    { k: 'One', ring: C.red, sym: [run('+1:', { color: C.red })], text: 'новая порция\nот бабушки' },
  ];
  for (const K of CARDS) {
    const c = r[`c${K.k}`];
    // кольцо 4 px снаружи карточки (box-shadow 0 0 0 4px) + мягкая тень
    S.shape(`card${K.k}`, 'round', { x: c.x - 2, y: c.y - 2, w: c.w + 4, h: c.h + 4 }, { fill: C.cream, line: K.ring, lineW: 2, radius: PX(26), shadow: SH(25, 13, 0.45) });
    // брызги лежат под иконкой бабушки (в обычном режиме их не видно), вылетают из-за неё
    if (K.k === 'One') {
      for (const [name, kind, sz, i] of grains) {
        S.shape(name, kind === 'c' ? 'rect' : 'ellipse', { x: pcx - sz.w / 2, y: pcy - sz.h / 2, ...sz }, { fill: kind === 'c' ? C.orange : C.cream, line: kind === 'c' ? undefined : C.cream3, lineW: 0.5, rotate: (i * 47) % 180 });
      }
    }
    S.img(`ico${K.k}`);
    const sy = r[`sym${K.k}`], p = r[`p${K.k}`];
    S.text(`sym${K.k}`, K.sym, { x: sy.x, y: sy.y - 8, w: c.x + c.w - sy.x - 10, h: sy.h + 16 }, { font: 'serif', size: 32, valign: 'middle', wrap: false });
    S.text(`txt${K.k}`, K.text, { x: p.x, y: p.y - 2, w: c.x + c.w - p.x - 8, h: p.h + 8 }, { font: 'body', size: 15.5, bold: true, color: C.ink, lineMul: 0.97, wrap: false });
  }

  // ================= мораль и бейджи =================
  S.text('moral1', 'Для магистерской диссертации формула простая.', { x: r.moral.x, y: r.moral.y - 4, w: 1320, h: 52 }, { font: 'serif', italic: true, size: 20, color: C.cream2, valign: 'middle', wrap: false });
  S.text('moral2', 'ДЛЯ ЖЕЛУДКА ПОСЛЕДСТВИЯ СЕРЬЁЗНЫЕ.', { x: r.moralB.x, y: r.moralB.y - 2, w: 1340, h: r.moralB.h + 6 }, { font: 'display', size: 22, color: C.red, valign: 'middle', wrap: false });
  S.badge('b1', 'math', 'Арифметика честная', { x: r.b1.x - 10, y: r.b1.y + 1.5 }, { size: 10, w: r.b1.w + 10 });
  S.badge('b2', 'joke', 'Модель шуточная', { x: r.b2.x - 10, y: r.b2.y + 1.5 }, { size: 10, w: r.b2.w + 10 });

  // ================= анимации =================
  // при открытии: рамка проявляется, члены формулы падают по одному под барабанную дробь; звон, «Эврика!», блик
  const DROP = 60 / 1080;
  const drops = [];
  ['Lhs', 'Eq', 'Coef', 'Dot', 'Pn', 'Plus', 'One'].forEach((k, i) => {
    const d = [350, 600, 850, 1050, 1250, 1450, 1650][i];
    drops.push(
      { t: `t${k}`, fx: 'fade', delay: d, dur: 380 },
      { t: `t${k}`, fx: 'move', path: `M 0 ${r4(-DROP)} L 0 ${r4(DROP * 0.08)} L 0 0 E`, delay: d, dur: 700, decel: 60000 },
    );
  });
  const BUILT = 2350;
  S.auto(
    { t: 'frame', fx: 'fade', delay: 150, dur: 500 },
    { t: 'eqno', fx: 'fade', delay: 250, dur: 450, sound: 'drumroll' },
    ...drops,
    { t: 'eurekaRing', fx: 'pop', delay: BUILT, dur: 500, sound: 'ding' },
    { t: 'eureka', fx: 'pop', delay: BUILT, dur: 500 },
    { t: 'sheen', fx: 'fade', delay: BUILT, dur: 250 },
    { t: 'sheen', fx: 'move', path: `M 0 0 L ${r4((fb.w - 4 - 560) / 1920)} 0 E`, delay: BUILT, dur: 1300, decel: 70000 },
    { t: 'sheen', fx: 'fadeOut', delay: BUILT + 950, dur: 350 },
  );

  // подсветка члена формулы: обычный текст гаснет, подсвеченный (с плашкой) проявляется — и обратно
  const hlOn = (k, at = 0) => [
    { t: `t${k}`, fx: 'fadeOut', delay: at, dur: 300 },
    { t: `hlBg${k}`, fx: 'fade', delay: at, dur: 300 },
    { t: `hl${k}`, fx: 'fade', delay: at, dur: 300 },
  ];
  const hlOff = (k, at = 0) => [
    { t: `hl${k}`, fx: 'fadeOut', delay: at, dur: 300 },
    { t: `hlBg${k}`, fx: 'fadeOut', delay: at, dur: 300 },
    { t: `t${k}`, fx: 'fade', delay: at, dur: 300 },
  ];
  const card = (k, wipe, at = 120) => [
    { t: `w${k}`, fx: wipe, delay: 60, dur: 450 },
    ...['card', 'ico', 'sym', 'txt'].map((p) => ({ t: `${p}${k}`, fx: 'riseUp', delay: at, dur: 500 })),
    { t: `card${k}`, fx: 'pulse', delay: at + 520, dur: 360, by: 103 },
  ];

  // 1) Pₙ — плов до очередного приёма пищи
  S.click({ ...hlOn('Pn')[0], sound: 'pop' }, ...hlOn('Pn').slice(1), ...card('Pn', 'wipeLeft'));
  // 2) 0,3 — доля, оставшаяся после еды
  S.click({ ...hlOn('Coef')[0], sound: 'coin' }, ...hlOn('Coef').slice(1), ...hlOff('Pn'), ...card('Coef', 'wipeLeft'));
  // 3) +1 — новая порция от бабушки (брызги плова)
  S.click({ ...hlOn('One')[0], sound: 'plop' }, ...hlOn('One').slice(1), ...hlOff('Coef'), ...card('One', 'wipeDown'),
    { t: 'icoOne', fx: 'pulse', delay: 640, dur: 400, by: 106 }, ...splash);
  // 4) мораль: подсвечена вся формула, две строки и бейджи
  S.click(
    ...hlOn('Pn'), ...hlOn('Coef'),
    { t: 'moral1', fx: 'riseUp', delay: 0, dur: 550, sound: 'stamp' },
    { t: 'moral2', fx: 'riseUp', delay: 0, dur: 550 },
    { t: 'b1', fx: 'riseUp', delay: 80, dur: 550 },
    { t: 'b2', fx: 'riseUp', delay: 80, dur: 550 },
    { t: 'moral2', fx: 'pulse', delay: 650, dur: 400, by: 104 },
  );

  // триггеры: щелчок мышью по члену формулы — член и его карточка «подпрыгивают» (как повторный клик в HTML)
  for (const k of ['Pn', 'Coef', 'One']) {
    S.trigger(`hot${k}`,
      { t: `t${k}`, fx: 'pulse', dur: 420, by: 108, sound: 'tick' },
      { t: `hl${k}`, fx: 'pulse', dur: 420, by: 108 },
      ...['card', 'ico', 'sym', 'txt'].map((p) => ({ t: `${p}${k}`, fx: 'pulse', delay: 60, dur: 480, by: 104 })),
    );
  }
  S.trigger('eureka',
    { t: 'eureka', fx: 'teeter', dur: 700, deg: 6, sound: 'ding' },
    { t: 'eurekaRing', fx: 'teeter', dur: 700, deg: 6 },
  );

  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: формула собирается сама при открытии слайда (барабанная дробь ≈ 2,4 с, затем звон и «ЭВРИКА!»). '
    + 'Щелчки (→, PageDown, кликер): 1 — Pₙ «плов до очередного приёма пищи»; 2 — 0,3 «доля, оставшаяся после еды»; '
    + '3 — +1 «новая порция от бабушки»; 4 — мораль «Для магистерской… / Для желудка…». '
    + 'Щелчок мышью по члену формулы — член и его карточка «подпрыгивают»; по «ЭВРИКА!» — покачивание со звоном. Следующий щелчок — слайд 6.';
}
