/* Слайд 2. Три научные гипотезы.
   Три карточки (мышь, клавиши 1/2/3 или «Далее») переворачиваются и показывают результат:
   1) «ОПРОВЕРГНУТО» + карта Узбекистана с городами;
   2) генеалогическое древо вырывается за пределы экрана и возвращается в карточку + печать;
   3) медаль, ляган плова и факт про ЮНЕСКО (2016).
   Затем — вывод «по ГОСТу».
   «Далее»: карточка 1 → карточка 2 (древо на весь экран) → древо в карточку → карточка 3 → вывод → следующий слайд.
   Нажатие во время анимации не пропускает шаг, а сразу доводит текущую анимацию до конца. */

const S02_CX = 960;

// координаты элемента в системе сцены 1920×1080
function s02Rect(el) {
  const st = document.getElementById('stage').getBoundingClientRect();
  const s = st.width / 1920 || 1;
  const r = el.getBoundingClientRect();
  return { x: (r.left - st.left) / s, y: (r.top - st.top) / s, w: r.width / s, h: r.height / s };
}

/* ---------- маленькие человечки: лицо + платок или дўппи ---------- */
const S02_TONES = ['var(--red)', 'var(--gold)', 'var(--turq)', 'var(--cream)', 'var(--cobalt)', 'var(--orange)'];
function s02Avatar(x, y, r, kind, tone = 'var(--cream)', happy = false) {
  const f = (v) => v.toFixed(1);
  let s = `<circle class="av-face" cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
  // глаза и улыбка
  if (happy) {
    s += `<path class="av-line" d="M${f(x - r * .5)},${f(y - r * .02)} q${f(r * .15)},${f(-r * .2)} ${f(r * .3)},0 M${f(x + r * .2)},${f(y - r * .02)} q${f(r * .15)},${f(-r * .2)} ${f(r * .3)},0"/>`;
  } else {
    s += `<circle class="av-ink" cx="${f(x - r * .34)}" cy="${f(y - r * .02)}" r="${f(Math.max(1.6, r * .12))}"/><circle class="av-ink" cx="${f(x + r * .34)}" cy="${f(y - r * .02)}" r="${f(Math.max(1.6, r * .12))}"/>`;
  }
  s += `<path class="av-line" d="M${f(x - r * .3)},${f(y + r * .36)} q${f(r * .3)},${f(r * .26)} ${f(r * .6)},0"/>`;
  if (kind === 'f' || kind === 'g') {
    // платок
    s += `<path class="av-scarf" style="fill:${kind === 'g' ? 'var(--cream)' : tone}" d="M${f(x - r * 1.12)},${f(y + r * .62)} C${f(x - r * 1.3)},${f(y - r * .9)} ${f(x - r * .62)},${f(y - r * 1.36)} ${f(x)},${f(y - r * 1.36)} C${f(x + r * .62)},${f(y - r * 1.36)} ${f(x + r * 1.3)},${f(y - r * .9)} ${f(x + r * 1.12)},${f(y + r * .62)} L${f(x + r * .8)},${f(y + r * .52)} C${f(x + r * .86)},${f(y - r * .5)} ${f(x + r * .46)},${f(y - r * .76)} ${f(x)},${f(y - r * .76)} C${f(x - r * .46)},${f(y - r * .76)} ${f(x - r * .86)},${f(y - r * .5)} ${f(x - r * .8)},${f(y + r * .52)} Z"/>`;
  } else {
    // дўппи
    s += `<path class="av-cap" d="M${f(x - r * .86)},${f(y - r * .46)} L${f(x - r * .72)},${f(y - r * 1.1)} Q${f(x)},${f(y - r * 1.34)} ${f(x + r * .72)},${f(y - r * 1.1)} L${f(x + r * .86)},${f(y - r * .46)} Q${f(x)},${f(y - r * .66)} ${f(x - r * .86)},${f(y - r * .46)} Z"/>`;
    s += `<path class="av-capdot" d="M${f(x - r * .42)},${f(y - r * .62)} c${f(-r * .14)},${f(-r * .2)} ${f(-r * .04)},${f(-r * .38)} ${f(r * .1)},${f(-r * .38)} c${f(-r * .04)},${f(r * .12)} 0,${f(r * .26)} ${f(r * .1)},${f(r * .36)} Z M${f(x + r * .42)},${f(y - r * .62)} c${f(r * .14)},${f(-r * .2)} ${f(r * .04)},${f(-r * .38)} ${f(-r * .1)},${f(-r * .38)} c${f(r * .04)},${f(r * .12)} 0,${f(r * .26)} ${f(-r * .1)},${f(r * .36)} Z"/>`;
    if (kind === 'd') s += `<path class="av-beard" d="M${f(x - r * .7)},${f(y + r * .22)} Q${f(x)},${f(y + r * 1.55)} ${f(x + r * .7)},${f(y + r * .22)} Q${f(x)},${f(y + r * .66)} ${f(x - r * .7)},${f(y + r * .22)} Z"/>`;
  }
  return s;
}

/* ---------- генеалогическое древо (координаты сцены; выходит за края) ---------- */
const S02_TREE = [
  { y: 150, h: 66, fs: 28, nodes: [] }, // бабушка и дедушка — особый случай
  { y: 352, h: 58, fs: 25, pad: 40, nodes: [['Тётя № 1', null, 'f'], ['Дядя № 1', null, 'm'], ['Тётя № 2', null, 'f'], ['Мама', null, 'f'], ['Дядя № 2', null, 'm'], ['Тётя № 3', null, 'f'], ['Дядя № 3', null, 'm']] },
  { y: 556, h: 62, fs: 20, pad: 16, nodes: [
    ['Двоюродный', 'брат № 23', 'm'], ['Двоюродная', 'сестра № 19', 'f'], ['Двоюродный', 'брат № 15', 'm'], ['Двоюродная', 'сестра № 11', 'f'],
    ['Двоюродный', 'брат № 7', 'm'], ['Сестра', null, 'f'], ['Я', 'Эркинбой', 'm', 'me'], ['Брат', null, 'm'],
    ['Двоюродная', 'сестра № 4', 'f'], ['Двоюродный', 'брат № 8', 'm'], ['Двоюродная', 'сестра № 12', 'f'], ['Двоюродный', 'брат № 16', 'm'], ['Двоюродная', 'сестра № 20', 'f']] },
  { y: 762, h: 62, fs: 20, pad: 14, nodes: [
    ['Троюродный', 'брат № 31', 'm'], ['Невестка', null, 'f'], ['Сват', null, 'm'], ['Троюродная', 'тётя № 4', 'f'], ['Друг папы', '«как брат»', 'm'],
    ['Сват свата', null, 'm'], ['Сватья', null, 'f'], ['Шурин', null, 'm'], ['Золовка', null, 'f'], ['Соседи —', '«почти родственники»', 'f'],
    ['Деверь', null, 'm'], ['Свояченица', null, 'f'], ['Свояк', null, 'm'], ['Сноха', null, 'f'], ['Зять', null, 'm'],
    ['Соседка —', '«почти бабушка»', 'f'], ['Троюродный', 'дядя № 6', 'm'], ['Сват', null, 'm'], ['Троюродная', 'сестра № 9', 'f']] },
  { y: 952, h: 56, fs: 0, gap: 92, count: 33 },  // только лица — и дальше за край экрана
];
const S02_LEAVES = 2; // от каждого лица последнего ряда — ещё ветки вниз, за экран

function s02Delay(level, x) { return Math.round(60 + level * 165 + Math.min(Math.abs(x - S02_CX), 1500) / 1500 * 300); }

function s02NodeW(h, fs, l1, l2) {
  if (!fs) return h;
  const lines = [l1, l2].filter(Boolean);
  const maxLen = Math.max(...lines.map((t) => t.length));
  return Math.round(h + 6 + maxLen * fs * .6 + 24);
}

function s02BuildTree() {
  const f = (v) => v.toFixed(1);
  let edges = '', nodes = '', count = 0, tone = 0;
  const nextTone = () => S02_TONES[(tone++ * 7 + 3) % S02_TONES.length];
  const node = ({ x, y, h, fs, l1, l2, kind, cls = '', level }) => {
    count++;
    const dl = s02Delay(level, x);
    if (!fs) {
      // лицо без подписи
      const r = h / 2;
      return `<g transform="translate(${f(x)} ${f(y)})"><g class="tn-in" style="--dl:${dl}ms"><circle class="tn-box" r="${f(r)}"/>${s02Avatar(0, 3, r * .62, kind, nextTone())}</g></g>`;
    }
    const lines = [l1, l2].filter(Boolean);
    const w = s02NodeW(h, fs, l1, l2);
    const r = h / 2 - 8;
    const ax = -w / 2 + h / 2 + 2;
    const tx = ax + r + 12;
    let t;
    if (lines.length > 1) {
      t = `<text class="tn-t" x="${f(tx)}" y="${f(-3)}" font-size="${fs}">${l1}</text><text class="tn-t2" x="${f(tx)}" y="${f(fs + 1)}" font-size="${fs}">${l2}</text>`;
    } else {
      t = `<text class="tn-t" x="${f(tx)}" y="${f(fs * .36)}" font-size="${fs}">${l1}</text>`;
    }
    return `<g class="tn ${cls}" transform="translate(${f(x)} ${f(y)})"><g class="tn-in" style="--dl:${dl}ms"><rect class="tn-box" x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" rx="${f(h / 2)}"/>${s02Avatar(ax, 3, r, kind, nextTone(), kind === 'g' || kind === 'd')}${t}</g></g>`;
  };
  const edge = (px, py, cx, cy, level, sw) => {
    const my = (py + cy) / 2;
    const dl = Math.max(0, s02Delay(level, cx) - 120);
    edges += `<path class="te" pathLength="1" style="--dl:${dl}ms;stroke-width:${sw}" d="M${f(px)},${f(py)} C${f(px)},${f(my)} ${f(cx)},${f(my)} ${f(cx)},${f(cy)}"/>`;
  };

  // уровень 0: бабушка и дедушка
  const L0 = S02_TREE[0];
  nodes += `<g class="tn tn--root"><g class="tn-in" style="--dl:40ms"><path class="tn-link" d="M840,${L0.y} H1080"/><path class="tn-heart" d="M960,${L0.y + 12} c-14,-10 -22,-16 -22,-26 c0,-8 6,-13 12,-13 c5,0 8,3 10,7 c2,-4 5,-7 10,-7 c6,0 12,5 12,13 c0,10 -8,16 -22,26z"/></g></g>`;
  nodes += node({ x: 812, y: L0.y, h: L0.h, fs: L0.fs, l1: 'Бабушка', kind: 'g', cls: 'tn--root', level: 0 });
  nodes += node({ x: 1108, y: L0.y, h: L0.h, fs: L0.fs, l1: 'Дедушка', kind: 'd', cls: 'tn--root', level: 0 });

  let prev = [{ x: S02_CX, y: L0.y + 14, h: 0 }];
  const widths = [5, 4.5, 4, 3.5, 3];
  for (let li = 1; li < S02_TREE.length; li++) {
    const L = S02_TREE[li];
    const n = L.nodes ? L.nodes.length : L.count;
    const specs = Array.from({ length: n }, (_, j) => (L.nodes && L.nodes[j]) || [null, null, j % 2 ? 'f' : 'm']);
    // раскладка ряда: центральный узел — под центром, остальные плотно в обе стороны
    const ws = specs.map((sp) => s02NodeW(L.h, L.fs, sp[0], sp[1]));
    const xs = new Array(n);
    const mid = Math.floor((n - 1) / 2);
    const g = L.gap ? (L.gap - L.h) : L.pad;
    xs[mid] = S02_CX;
    for (let j = mid + 1; j < n; j++) xs[j] = xs[j - 1] + ws[j - 1] / 2 + g + ws[j] / 2;
    for (let j = mid - 1; j >= 0; j--) xs[j] = xs[j + 1] - ws[j + 1] / 2 - g - ws[j] / 2;
    const cur = [];
    for (let j = 0; j < n; j++) {
      const x = xs[j];
      const spec = specs[j];
      // родитель — ближайший по горизонтали узел предыдущего ряда
      let p = prev[0];
      for (const q of prev) if (Math.abs(q.x - x) < Math.abs(p.x - x)) p = q;
      edge(p.x, p.y + p.h / 2, x, L.y - L.h / 2, li, widths[li - 1]);
      nodes += node({ x, y: L.y, h: L.h, fs: L.fs, l1: spec[0], l2: spec[1], kind: spec[2], cls: spec[3] === 'me' ? 'tn--me' : '', level: li });
      cur.push({ x, y: L.y, h: L.h });
    }
    prev = cur;
  }
  // ветки, уходящие за нижний край экрана
  const last = S02_TREE.length;
  for (const q of prev) {
    for (let k = 0; k < S02_LEAVES; k++) {
      const x = q.x + (k - (S02_LEAVES - 1) / 2) * 40;
      edge(q.x, q.y + q.h / 2, x, 1170, last, 2.5);
      count++;
    }
  }
  return { svg: (cls) => `<svg class="s02-tree ${cls}" viewBox="0 0 1920 1080" aria-hidden="true">${edges}${nodes}</svg>`, count };
}

/* ---------- карта Узбекистана ---------- */
const S02_CITIES = [
  // [название, подпись: dx, dy, якорь]
  ['Ташкент', 0, 0, 'cap'],
  ['Самарканд', 0, -13, 'middle'],
  ['Бухара', -12, 7, 'end'],
  ['Хива', 0, 24, 'middle'],
  ['Нукус', 0, -13, 'middle'],
  ['Фергана', 0, 25, 'middle'],
  ['Карши', 0, 25, 'middle'],
];
function s02Map() {
  const W = 480, H = 270;
  const proj = Art.uzProjection(W, H, 14);
  let cities = '';
  for (const [name, dx, dy, anchor] of S02_CITIES) {
    const c = Art.UZ_CITIES.find((q) => q.name === name);
    if (!c) continue;
    const [x, y] = proj(c.lon, c.lat);
    if (anchor === 'cap') {
      const star = s02Star(x, y, 15, 6);
      cities += `<g class="s02-city s02-cap"><path class="s02-star" d="${star}"/><text x="${(x - 6).toFixed(1)}" y="${(y - 21).toFixed(1)}" text-anchor="middle">${name}<tspan class="s02-cap-sub"> — столица</tspan></text></g>`;
    } else {
      cities += `<g class="s02-city"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${name}</text></g>`;
    }
  }
  return `<svg class="s02-map" viewBox="0 0 ${W} ${H}" aria-label="Карта Узбекистана: Ташкент, Самарканд, Бухара, Хива, Нукус, Фергана, Карши"><path class="s02-uz" pathLength="100" d="${Art.uzOutlinePath(proj)}"/>${cities}</svg>`;
}

/* ---------- иконки лицевых сторон ---------- */
function s02IconMap() {
  const W = 400, H = 196;
  const proj = Art.uzProjection(W, H, 12);
  const tk = Art.UZ_CITIES.find((q) => q.capital);
  const [x, y] = proj(tk.lon, tk.lat);
  const pin = (dx, dy, s) => `<g transform="translate(${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}) scale(${s})"><path class="s02-pin" d="M0,0 C-10,-14 -17,-24 -17,-34 A17,17 0 1,1 17,-34 C17,-24 10,-14 0,0 Z"/><circle class="s02-pin-dot" cx="0" cy="-34" r="6.5"/></g>`;
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="s02-uzi" d="${Art.uzOutlinePath(proj)}"/>
    <g class="s02-pins">${pin(-20, 4, .9)}${pin(18, 6, .9)}${pin(-6, -10, 1)}${pin(8, 2, 1.12)}${pin(-30, -6, .8)}</g></svg>`;
}
function s02IconFamily() {
  const W = 400, H = 196;
  let s = '';
  const rows = [
    { y: 62, r: 21, n: 8, gap: 46 },
    { y: 108, r: 25, n: 7, gap: 54 },
    { y: 156, r: 30, n: 5, gap: 70 },
  ];
  let t = 0;
  for (const R of rows) {
    for (let j = 0; j < R.n; j++) {
      const x = W / 2 + (j - (R.n - 1) / 2) * R.gap;
      const kind = (j + R.n) % 2 ? 'f' : 'm';
      const tone = S02_TONES[(t++ * 5 + 1) % S02_TONES.length];
      const body = S02_TONES[(t * 3 + 2) % S02_TONES.length];
      const r = R.r;
      s += `<path class="av-body" style="fill:${body}" d="M${(x - r * 1.15).toFixed(1)},${(R.y + r * 2.3).toFixed(1)} Q${(x - r * 1.15).toFixed(1)},${(R.y + r * .82).toFixed(1)} ${x.toFixed(1)},${(R.y + r * .82).toFixed(1)} Q${(x + r * 1.15).toFixed(1)},${(R.y + r * .82).toFixed(1)} ${(x + r * 1.15).toFixed(1)},${(R.y + r * 2.3).toFixed(1)} Z"/>`;
      s += s02Avatar(x, R.y, r, kind, tone, (j + t) % 3 === 0);
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
}

/* ---------- золотая медаль с лавровым венком (своя, не логотип) ---------- */
function s02Star(x, y, R, r) {
  return Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; return `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`; }).join('') + 'Z';
}
function s02Medal() {
  const cx = 100, cy = 158, R = 82;
  let leaves = '';
  for (const side of [-1, 1]) {
    for (let k = 0; k < 7; k++) {
      const th = (side < 0 ? 112 + k * 19 : 68 - k * 19) * Math.PI / 180;
      const x = cx + R * Math.cos(th), y = cy + R * Math.sin(th);
      const rot = (th * 180 / Math.PI) + (side < 0 ? 90 + 28 : 90 - 28);
      leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="14" ry="6.5" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="var(--gold-2)" stroke="var(--ink)" stroke-width="3"/>`;
    }
  }
  const spark = (x, y, s, d = 0) => `<path class="s02-spark" style="animation-delay:${d}s" d="M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s} Z"/>`;
  return `<svg viewBox="0 0 200 250" aria-label="Золотая медаль">
    <path d="M60,0 L96,0 L118,100 L88,108 Z" fill="var(--red)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
    <path d="M140,0 L104,0 L82,100 L112,108 Z" fill="var(--cobalt)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78,0 L104,104" stroke="var(--cream)" stroke-width="5" opacity=".8"/>
    <path d="M${cx - 6},${cy + R + 4} A${R},${R} 0 0 1 ${cx - R * .62},${cy - R * .78}" fill="none" stroke="var(--gold-3)" stroke-width="4" stroke-linecap="round"/>
    <path d="M${cx + 6},${cy + R + 4} A${R},${R} 0 0 0 ${cx + R * .62},${cy - R * .78}" fill="none" stroke="var(--gold-3)" stroke-width="4" stroke-linecap="round"/>
    ${leaves}
    <circle cx="${cx}" cy="${cy}" r="62" fill="url(#g-gold)" stroke="var(--ink)" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="48" fill="none" stroke="var(--gold-2)" stroke-width="4"/>
    <path d="${s02Star(cx, cy + 3, 34, 14)}" fill="var(--cream)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
    <path d="M${cx - 40},${cy - 26} A48,48 0 0 1 ${cx - 8},${cy - 47}" fill="none" stroke="var(--cream)" stroke-width="6" stroke-linecap="round" opacity=".75"/>
    ${spark(28, 96, 14)}${spark(176, 120, 11, .6)}${spark(160, 236, 9, 1.2)}
  </svg>`;
}

Deck.register('02', {
  init(api) {
    const st = api.state;
    // tree: idle → growing → up (держится до нажатия) → settling → done
    Object.assign(st, { open: [false, false, false], gost: false, jobs: [], typer: null, tree: 'idle', countTok: null });
    st.cards = api.$$('.s02-card');
    st.stamps = st.cards.map((c) => c.querySelector('.s02-stamp'));

    // иллюстрации
    api.$('.s02-researcher').innerHTML = Art.researcher({ mood: 'serious' });
    st.r = api.$('.s02-researcher svg');
    api.$('.s02-icon--map').innerHTML = s02IconMap();
    api.$('.s02-icon--family').innerHTML = s02IconFamily();
    api.$('.s02-icon--plov').innerHTML = Art.plate({ w: 300, headroom: 0, seed: 5 });
    api.$('.s02-mapbox').innerHTML = s02Map();
    api.$('.s02-medal').innerHTML = s02Medal();
    api.$('.s02-plate').innerHTML = Art.plate({ w: 250, headroom: .4, seed: 7 });
    const tree = s02BuildTree();
    st.treeN = tree.count;
    api.$('.s02-treethumb').innerHTML = tree.svg('is-static');
    api.$('.s02-treefly-svg').innerHTML = tree.svg('');
    st.fly = api.$('.s02-treefly');
    st.flyTree = st.fly.querySelector('.s02-tree');
    st.dim = api.$('.s02-dim');
    st.quip = api.$('.s02-quip');
    st.countEl = st.fly.querySelector('.s02-treecount-v');

    // вывод по ГОСТу
    st.gostEl = api.$('.s02-gost');
    st.type = api.$('.s02-type');
    st.typeText = st.type.textContent;
    st.gostBtn = api.$('.s02-gostbtn');

    st.cards.forEach((c, i) => c.addEventListener('click', () => { c.blur(); this.open(api, i); }));
    st.gostBtn.addEventListener('click', () => { st.gostBtn.blur(); this.conclude(api); });
    // древо на весь экран: клик мышью — то же, что «Далее»
    st.fly.addEventListener('click', () => this.tap(api));
    st.dim.addEventListener('click', () => this.tap(api));
  },

  enter(api) {
    const st = api.state;
    api.timeout(() => st.r.setAttribute('data-point', 'down'), 1100);
  },

  leave(api) { this.complete(api); },

  /* ---------- таймлайн шагов: при быстром «Далее» или уходе со слайда — мгновенно доводим ---------- */
  seq(api, steps) {
    const st = api.state;
    for (const [ms, fn] of steps) {
      const job = { fn, done: false };
      job.t = api.timeout(() => { if (job.done) return; job.done = true; fn(false); }, ms);
      st.jobs.push(job);
    }
  },
  busy(api) { return api.state.jobs.some((j) => !j.done); },
  // довести текущую анимацию до конечного кадра (без звуков)
  flush(api) {
    const st = api.state;
    if (st.typer) { clearInterval(st.typer); st.typer = null; }
    let guard = 0;
    while (st.jobs.length && guard++ < 5) {
      const jobs = st.jobs.splice(0);
      for (const j of jobs) if (!j.done) { clearTimeout(j.t); j.done = true; j.fn(true); }
    }
  },
  // всё до конца, включая возврат древа в карточку (уход со слайда, R, другая карточка, вывод)
  complete(api) {
    this.flush(api);
    if (api.state.tree === 'up') this.settleTree(api, true);
  },
  // клик по древу / клавиша карточки, пока древо на весь экран
  tap(api) {
    if (this.busy(api)) this.flush(api);
    else if (api.state.tree === 'up') this.settleTree(api);
    api.updateSteps();
  },
  mood(api, m) {
    const st = api.state;
    if (st.r.getAttribute('data-mood') === m) return;
    Art.mood(st.r, m);
    FX.replay(api.$('.s02-researcher'), 'is-bounce');
  },

  /* ---------- открыть карточку ---------- */
  open(api, i) {
    const st = api.state;
    const card = st.cards[i];
    if (!card) return;
    if (st.tree === 'growing' || st.tree === 'up') { this.tap(api); return; }
    if (st.open[i]) {
      // повторное нажатие — печать «пристукивает» ещё раз
      if (this.busy(api)) { this.flush(api); return; }
      FX.replay(st.stamps[i], 'is-slam');
      api.sfx('stamp');
      return;
    }
    this.complete(api);
    st.open[i] = true;
    card.classList.add('is-open');
    card.setAttribute('aria-pressed', 'true');
    api.sfx('whoosh');
    api.updateSteps();
    if (i === 0) this.revealMap(api, card);
    else if (i === 1) this.revealTree(api, card);
    else this.revealPlov(api, card);
  },

  // 1. «Все узбеки из Ташкента» → ОПРОВЕРГНУТО + карта
  revealMap(api, card) {
    const st = api.state;
    const map = card.querySelector('.s02-map');
    const cities = Array.from(card.querySelectorAll('.s02-city'));
    this.seq(api, [
      [300, (s) => { map.classList.add('is-drawn'); if (!s) api.sfx('swoosh'); }],
      ...cities.map((c, k) => [560 + k * 80, (s) => { c.classList.add('is-shown'); if (!s) api.sfx(k ? 'pop' : 'sparkle'); }]),
      [1120, (s) => {
        st.stamps[0].classList.add('is-slam');
        this.mood(api, 'smug');
        if (!s) { api.sfx('stamp'); FX.shakeStage(); }
      }],
      [1300, (s) => { card.querySelector('.s02-fact').classList.add('is-shown'); this.afterReveal(api); }],
    ]);
  },

  // 2. «Много родственников» → древо вырывается на весь экран и держится до следующего нажатия
  revealTree(api, card) {
    const st = api.state;
    st.tree = 'growing';
    this.seq(api, [
      [120, (s) => this.treeGrow(api, card, s)],
      [1150, (s) => this.treeQuip(api, s)],
    ]);
  },
  treeGrow(api, card, silent) {
    const st = api.state, fly = st.fly;
    fly.classList.remove('is-out', 'is-settling');
    st.dim.classList.add('is-on');
    this.mood(api, 'shock');
    if (silent) {
      // сразу конечный кадр: древо на весь экран
      fly.style.transition = 'none';
      fly.style.transform = 'translate(0px, 0px) scale(1)';
      st.flyTree.classList.add('is-instant', 'is-grown');
      fly.classList.add('is-on');
      st.countTok = null;
      st.countEl.textContent = `n = ${Fmt.int(st.treeN)}`;
      return;
    }
    const r = s02Rect(card);
    const k0 = (r.w * .86) / 1920;
    const x0 = r.x + r.w / 2 - 960 * k0, y0 = r.y + r.h * .62 - 540 * k0;
    fly.style.transition = 'none';
    fly.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px) scale(${k0.toFixed(4)})`;
    st.flyTree.classList.remove('is-grown', 'is-instant');
    fly.classList.add('is-on');
    void fly.offsetWidth;
    fly.style.transition = 'transform 1s cubic-bezier(.2, .8, .25, 1)';
    fly.style.transform = 'translate(0px, 0px) scale(1)';
    st.flyTree.classList.add('is-grown');
    api.sfx('whoosh');
    // «чпок-чпок» по рядам и счётчик выборки
    this.seq(api, S02_TREE.map((_, li) => [60 + li * 165, (s) => { if (!s) api.sfx('pop'); }]));
    const tok = st.countTok = {};
    Tween.num(1, st.treeN, 1000, (v) => { if (st.countTok === tok) st.countEl.textContent = `n = ${Fmt.int(v)}`; }, ease.inOutCubic);
  },
  treeQuip(api, silent) {
    const st = api.state;
    st.tree = 'up';
    if (silent) {
      // догнать незаконченные переходы роста
      st.fly.style.transition = 'none';
      st.fly.style.transform = 'translate(0px, 0px) scale(1)';
      st.flyTree.classList.add('is-instant');
      st.countTok = null;
      st.countEl.textContent = `n = ${Fmt.int(st.treeN)}`;
    } else {
      api.sfx('boing');
    }
    st.quip.classList.add('is-on');
  },
  // древо возвращается в карточку: печать «ПОДТВЕРЖДЕНО…» и подпись
  settleTree(api, silent = false) {
    const st = api.state;
    const card = st.cards[1];
    st.tree = 'settling';
    api.updateSteps();
    const rest = [
      [560, (s) => this.treeDone(api, card, s)],
      [620, (s) => {
        st.stamps[1].classList.add('is-slam');
        this.mood(api, 'happy');
        if (!s) api.sfx('stamp');
      }],
      [800, () => { card.querySelector('.s02-fact').classList.add('is-shown'); st.tree = 'done'; this.afterReveal(api); }],
    ];
    if (silent) { rest.forEach(([, fn]) => fn(true)); return; }
    this.treeSettle(api, card);
    this.seq(api, rest);
  },
  treeSettle(api, card) {
    const st = api.state, fly = st.fly;
    const r = s02Rect(card.querySelector('.s02-treethumb'));
    const k = r.w / 1920;
    st.quip.classList.remove('is-on');
    fly.classList.add('is-settling');
    fly.style.transition = 'transform .6s cubic-bezier(.6, 0, .25, 1)';
    fly.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px) scale(${k.toFixed(4)})`;
    st.dim.classList.remove('is-on');
    api.sfx('swoosh');
  },
  treeDone(api, card, silent) {
    const st = api.state, fly = st.fly;
    st.countTok = null;
    card.querySelector('.s02-nv').textContent = Fmt.int(st.treeN);
    card.classList.add('is-tree');
    st.dim.classList.remove('is-on');
    st.quip.classList.remove('is-on');
    if (silent) {
      fly.style.transition = 'none';
      fly.classList.remove('is-on', 'is-out', 'is-settling');
      return;
    }
    fly.classList.add('is-out');
    api.timeout(() => { fly.classList.remove('is-on', 'is-out', 'is-settling'); fly.style.transition = 'none'; }, 320);
  },

  // 3. «Постоянно едят плов» → медаль, ляган, печать ЮНЕСКО, факт
  revealPlov(api, card) {
    const st = api.state;
    const medal = card.querySelector('.s02-medal');
    const plate = card.querySelector('.s02-plate');
    this.seq(api, [
      [300, (s) => { medal.classList.add('is-in'); if (!s) api.sfx('sparkle'); }],
      [560, (s) => { plate.classList.add('is-in'); if (!s) { api.sfx('plop'); FX.at(plate, 'plov', { count: 46, power: 15 }); } }],
      [1000, (s) => {
        st.stamps[2].classList.add('is-slam');
        this.mood(api, 'proud');
        // конфетти — из-под третьей карточки, чтобы не закрывать подпись второй
        if (!s) { api.sfx('stamp'); FX.confetti({ count: 110, x: 1540, spread: 1, life: 100 }); }
      }],
      [1120, (s) => { if (!s) api.sfx('tada'); }],
      [1250, (s) => { card.querySelector('.s02-fact').classList.add('is-shown'); this.afterReveal(api); }],
    ]);
  },

  afterReveal(api) {
    const st = api.state;
    if (st.open.every(Boolean) && st.tree === 'done' && !st.gost) st.gostBtn.classList.add('is-shown');
  },

  /* ---------- вывод: «Стереотипы необходимо оформлять по ГОСТу» ---------- */
  conclude(api) {
    const st = api.state;
    if (st.gost || !st.open.every(Boolean)) return;
    this.complete(api);
    st.gost = true;
    api.updateSteps();
    st.gostBtn.classList.remove('is-shown');
    st.gostEl.classList.add('is-on');
    st.type.textContent = '';
    st.type.classList.add('is-caret');
    api.sfx('whoosh');
    this.mood(api, 'serious');
    const text = st.typeText;
    const per = 20;
    this.seq(api, [
      [250, (s) => {
        if (s) return;
        let n = 0;
        st.typer = api.interval(() => {
          n++;
          st.type.textContent = text.slice(0, n);
          if (n % 3 === 1) api.sfx('tick');
          if (n >= text.length) { clearInterval(st.typer); st.typer = null; }
        }, per);
      }],
      [250 + text.length * per + 120, (s) => {
        if (st.typer) { clearInterval(st.typer); st.typer = null; }
        st.type.textContent = text;
        st.type.classList.remove('is-caret');
        st.gostEl.classList.add('is-done');
        if (!s) { api.sfx('stamp'); api.timeout(() => api.sfx('ding'), 160); }
      }],
    ]);
  },

  next(api) {
    const st = api.state;
    if (this.busy(api)) { this.flush(api); return true; } // идёт анимация — доводим её, шаг не пропускаем
    if (st.tree === 'up') { this.settleTree(api); return true; }
    const i = st.open.indexOf(false);
    if (i >= 0) { this.open(api, i); return true; }
    if (!st.gost) { this.conclude(api); return true; }
    this.complete(api);
    return false;
  },
  progress(api) {
    const st = api.state;
    if (!st.open) return { done: 0, total: 5 };
    const treeBack = st.tree === 'settling' || st.tree === 'done' ? 1 : 0;
    return { done: st.open.filter(Boolean).length + treeBack + (st.gost ? 1 : 0), total: 5 };
  },
  keys: {
    Digit1(api) { this.open(api, 0); },
    Digit2(api) { this.open(api, 1); },
    Digit3(api) { this.open(api, 2); },
  },
});
