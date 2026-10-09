/* Слайд 4. Математический эксперимент «Можно ли доесть плов?».
   «СЪЕСТЬ 70%» — на тарелке остаётся 0,3 от того, что было; «БАБУШКА ДОБАВЛЯЕТ» — +1 порция.
   Внизу — цепочка значений с точной арифметикой (1,00 → 0,30 → 1,30 → 0,39 → 1,39 → …).
   «Далее»: съесть → добавить → съесть → добавить → панчлайн → следующий слайд.
   Мышью (и клавишами 1/2) кнопки работают в любом порядке; количество не бывает отрицательным. */

// тот же дастархан, что и на слайде 3, только с короткими ножками
function s04Table() {
  let band = '', tassels = '';
  for (let x = 24; x < 850; x += 40) band += `<path class="tb-dia" d="M${x},109 l10,-9 l10,9 l-10,9 z"/>`;
  for (let x = 30; x < 840; x += 40) tassels += `<path class="tb-tassel" d="M${x - 7},150 L${x + 7},150 L${x},170 Z"/>`;
  return `<svg viewBox="0 0 860 200" aria-hidden="true">
    <ellipse class="tb-shadow" cx="430" cy="190" rx="420" ry="11"/>
    <path class="tb-leg" d="M70,148 L76,188 L116,188 L122,148 Z"/>
    <path class="tb-leg" d="M738,148 L744,188 L784,188 L790,148 Z"/>
    <path class="tb-top" d="M44,14 L816,14 L856,76 L4,76 Z"/>
    <path class="tb-line" d="M72,26 L788,26 L818,64 L42,64 Z"/>
    <path class="tb-skirt" d="M4,76 L856,76 L850,150 L10,150 Z"/>
    <rect class="tb-band" x="6" y="96" width="848" height="26"/>${band}${tassels}
  </svg>`;
}

// капгир с горкой плова (вложенный SVG капгира без класса .art, чтобы не растягивался)
function s04Kapgir() {
  const k = Art.kapgir().replace('class="art art-kapgir"', 'class="s04-kapin" x="0" y="0" width="120" height="420"');
  return `<svg viewBox="0 -60 120 480" aria-hidden="true">
    ${k}
    <g class="kmound" transform="translate(60,74)">${Art.plovMound({ w: 104, h: 48, seed: 12, garlic: false })}</g>
  </svg>`;
}

const S04_EAT = 0.3;
const S04_MAX_VIS = 3.6;   // дальше горка не растёт визуально (чтобы не закрыть заголовок)
const S04_SAY = ['Oling, oling!<small>«Берите, берите!»</small>', 'Остывает же!', 'Ещё горяченький!', 'Последний разочек!'];
const S04_GUEST_ADD = ['surprised', 'panic', 'shock'];
const s04Round = (x) => Math.round(x * 1e10) / 1e10;
const s04Exact2 = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-7;
const s04Chip = (x) => (s04Exact2(x) ? Fmt.num(x, 2) : '≈' + Fmt.num(x, 2));
// классы разовых CSS-анимаций: на скрытом слайде они ставятся на паузу и «доигрывали» бы при возвращении
const S04_TRANSIENT = [
  ['.s04-pop', 'is-on'], ['.s04-delta', 'is-on'], ['.s04-guest', 'is-chew is-shake'], ['.s04-plate', 'is-jelly'],
  ['.s04-grandma', 'is-serve is-jelly'], ['.s04-kap', 'is-serve'], ['.s04-btn', 'is-hit'], ['.s04-val', 'is-bump'], ['.s04-say', 'is-swap'],
];

// анимация через api.raf: её останавливает api.clearTimers() (перемотка шага, уход со слайда, клавиша R)
function s04Tween(api, ms, fn, easing = ease.outCubic) {
  const t0 = performance.now();
  const step = (now) => {
    const t = clamp((now - t0) / ms, 0, 1);
    if (fn(easing(t), t) === false) return;
    if (t < 1) api.raf(step);
  };
  api.raf(step);
}
// горка плова на лягане (как Art.setAmount, но останавливаемая); ms = 0 — сразу
function s04Amount(api, svg, amount, ms = 0, easing = ease.outBack) {
  const g = svg && svg.querySelector('.mound');
  if (!g) return;
  const from = parseFloat(svg.dataset.amount || '1');
  svg.dataset.amount = amount;
  g.style.display = '';
  const tok = svg._s04tok = (svg._s04tok || 0) + 1; // пишет только самая свежая анимация
  const put = (v) => { const s = Art.amountScale(Math.max(0, v)); g.setAttribute('transform', `scale(${s.x.toFixed(4)},${s.y.toFixed(4)})`); };
  if (!ms) { put(amount); return; }
  s04Tween(api, ms, (k) => { if (svg._s04tok !== tok) return false; put(lerp(from, amount, k)); return true; }, easing);
}

Deck.register('04', {
  init(api) {
    api.$('.s04-table').innerHTML = s04Table();
    api.$('.s04-guest').innerHTML = Art.guest({ mood: 'polite', full: 0 });
    api.$('.s04-plate').innerHTML = Art.plate({ w: 380, amount: 1, seed: 6, headroom: .6 });
    api.$('.s04-grandma').innerHTML = Art.grandma({ variant: 'uz', mood: 'kind', holding: 'none', seed: 9 });
    api.$('.s04-kap').innerHTML = s04Kapgir();
    api.$('.s04-piala').innerHTML = Art.piala();
    api.$('.s04-non').innerHTML = Art.non();
    Object.assign(api.state, { amount: 1, steps: 0, last: null, caption: false, busy: false, seq: 0, full: 0, adds: 0, eats: 0, values: [1], ops: [] });
    // после клика снимаем фокус: дальше → / кликер идут по шагам слайда, а не «нажимают» кнопку ещё раз
    api.$('.s04-eat').addEventListener('click', (e) => { e.currentTarget.blur(); this.eat(api); api.updateSteps(); });
    api.$('.s04-add').addEventListener('click', (e) => { e.currentTarget.blur(); this.add(api); api.updateSteps(); });
    this.renderMeter(api, 1);
    this.renderTrail(api);
  },

  // уход со слайда: текущий шаг досматривается мгновенно и молча — никаких «глотков» на соседнем слайде
  leave(api) {
    this.settle(api);
    S04_TRANSIENT.forEach(([sel, cls]) => api.$$(sel).forEach((el) => el.classList.remove(...cls.split(' '))));
    FX.clear(); // рис этого слайда не сыплется на следующий
  },

  /* ---------- отображение ---------- */
  renderMeter(api, v, final = true) {
    // «1 порция» / «0,30 порции»: число и единица разделены пробелом (возможно, неразрывным)
    const [, num, unit] = Fmt.portions(v).match(/^(.*?)[\s  ]+(\S+)$/);
    api.$('.s04-val').innerHTML = (final && !s04Exact2(v) ? '<small>≈</small>' : '') + num;
    api.$('.s04-unit').textContent = unit;
    const track = api.$('.s04-track');
    api.$('.s04-fill').style.width = `${clamp(v / 2, 0, 1) * 100}%`;
    track.classList.toggle('is-over', v > 2);
  },

  renderTrail(api, animate = false) {
    const st = api.state, box = api.$('.s04-trail');
    const arrow = (op, isNew) => `<span class="s04-arrow${op ? ' op-' + op : ''}${isNew ? ' is-new' : ''}">${op ? `<span class="s04-op math">${op === 'eat' ? '×0,3' : '+1'}</span>` : ''}<svg viewBox="0 0 70 26"><path d="M2,13 H64 M52,3 L66,13 L52,23"/></svg></span>`;
    const dots = '<svg class="s04-dots" viewBox="0 0 50 36" aria-label="…"><circle cx="8" cy="20" r="5.5"/><circle cx="25" cy="20" r="5.5"/><circle cx="42" cy="20" r="5.5"/></svg>';
    const build = (from) => {
      let h = '';
      if (from > 0) h += `<span class="s04-chip is-dots">${dots}</span>` + arrow(null);
      for (let i = from; i < st.values.length; i++) {
        const last = i === st.values.length - 1;
        if (i > 0 && i > from) h += arrow(st.ops[i - 1], animate && last);
        h += `<span class="s04-chip${last ? ' is-last' : ''}${animate && last ? ' is-new' : ''}">${s04Chip(st.values[i])}</span>`;
      }
      if (st.caption) h += arrow(null) + `<span class="s04-chip is-end">${dots}</span>`;
      return h;
    };
    // показываем столько последних значений, сколько помещается в строку
    let from = 0;
    box.innerHTML = build(from);
    while (box.scrollWidth > box.clientWidth + 1 && from < st.values.length - 2) { from++; box.innerHTML = build(from); }
  },

  say(api, html) {
    const box = api.$('.s04-say');
    const was = box.classList.contains('is-on');
    box.querySelector('.s04-say-b').innerHTML = `<span class="s04-say-t">${html}</span>`;
    box.classList.add('is-on');
    if (was) FX.replay(box, 'is-swap');
  },

  // общая часть шага: новое значение, счётчик, цепочка, дельта
  commit(api, op, next, delayMs) {
    const st = api.state;
    const prev = st.amount;
    st.amount = next;
    st.values.push(next);
    st.ops.push(op);
    st.steps++;
    st.last = op;
    if (op === 'eat') st.eats++; else st.adds++;
    api.timeout(() => this.show(api, op, prev, next), delayMs);
  },

  show(api, op, prev, next) {
    const st = api.state;
    const plateSvg = api.$('.s04-plate svg');
    const delta = api.$('.s04-delta');
    delta.className = `s04-delta math is-${op}`;
    delta.textContent = op === 'eat' ? '×0,3' : '+1';
    FX.replay(delta, 'is-on');
    s04Amount(api, plateSvg, Math.min(next, S04_MAX_VIS), op === 'eat' ? 750 : 650, op === 'eat' ? ease.outCubic : ease.outBack);
    const val = api.$('.s04-val');
    const seq = ++st.seq;
    s04Tween(api, 650, (k, t) => {
      if (st.seq !== seq) return false;
      if (t < 1) { this.renderMeter(api, lerp(prev, next, k), false); return true; }
      this.renderMeter(api, next);
      FX.replay(val, 'is-bump');
      return true;
    });
    // метка «−70%» / «+1» — над вершиной горки (берём большую из двух: до и после)
    const pop = api.$('.s04-pop');
    const sy = Art.amountScale(Math.min(Math.max(prev, next), S04_MAX_VIS)).y;
    const top = Math.round(744 - 176 * sy - 96 - 240);
    if (st.caption) { pop.style.left = ''; pop.style.top = `${clamp(top, 200, 400)}px`; } // под панчлайном
    else if (top >= 90) { pop.style.left = ''; pop.style.top = `${Math.min(top, 400)}px`; }
    else { pop.style.left = '600px'; pop.style.top = '84px'; } // горка уже высокая: метка сбоку от вершины, ниже заголовка
    pop.className = `s04-pop is-${op}`;
    pop.querySelector('.s04-pop-t').textContent = op === 'eat' ? '−70%' : '+1';
    FX.replay(pop, 'is-on');
    this.renderTrail(api, true);
    api.updateSteps();
  },

  // начало шага; если предыдущий ещё анимируется — сначала мгновенно досматриваем его (нажатие не теряется)
  begin(api, ms) {
    const st = api.state;
    if (st.busy) this.settle(api);
    st.busy = true;
    api.timeout(() => { st.busy = false; }, ms);
  },

  // мгновенно привести сцену к текущему состоянию: остановить анимации шага, без звуков
  settle(api) {
    const st = api.state;
    api.clearTimers();
    st.busy = false;
    st.seq++;
    s04Amount(api, api.$('.s04-plate svg'), Math.min(st.amount, S04_MAX_VIS));
    this.renderMeter(api, st.amount);
    this.renderTrail(api);
    const gs = api.$('.s04-guest svg'), gm = api.$('.s04-grandma svg');
    gs.style.setProperty('--full', st.full.toFixed(2));
    if (st.caption) { Art.mood(gs, 'dizzy'); Art.mood(gm, 'kind'); }
    else if (st.last === 'eat') { Art.mood(gs, st.eats === 1 ? 'happy' : 'full'); Art.mood(gm, 'proud'); }
    else if (st.last === 'add') { Art.mood(gs, S04_GUEST_ADD[Math.min(st.adds - 1, S04_GUEST_ADD.length - 1)]); Art.mood(gm, 'happy'); }
    if (st.caption || st.last === 'eat') api.$('.s04-say').classList.remove('is-on');
  },

  /* ---------- действия ---------- */
  eat(api) {
    this.begin(api, 800);
    const st = api.state;
    const btn = api.$('.s04-eat');
    FX.replay(btn, 'is-hit');
    api.sfx('click');
    const next = s04Round(st.amount * S04_EAT); // 70% съели, 30% осталось; никогда не меньше нуля
    // рис летит к гостю
    const plateSvg = api.$('.s04-plate svg');
    const m = FX.centerOf(plateSvg.querySelector('.mound'));
    FX.rice({ x: m.x - 30, y: m.y - m.h * .35, angle: -2.3, spread: .7, power: 19, count: Math.round(30 + 30 * Math.min(1, st.amount)), gravity: .5, life: 60 });
    api.timeout(() => api.$('.s04-say').classList.remove('is-on'), 300);
    api.sfx('swoosh');
    const g = api.$('.s04-guest');
    const gs = g.querySelector('svg');
    st.full = Math.min(1.2, st.full + .3);
    const firstBite = st.eats === 0;
    const full = st.full;
    api.timeout(() => {
      FX.replay(g, 'is-chew');
      Art.mood(gs, firstBite ? 'happy' : 'full');
      gs.style.setProperty('--full', full.toFixed(2));
      api.sfx('gulp');
    }, 260);
    api.timeout(() => api.sfx('gulp'), 560);
    const gm = api.$('.s04-grandma svg');
    api.timeout(() => Art.mood(gm, 'proud'), 400);
    this.commit(api, 'eat', next, 120);
  },

  add(api) {
    this.begin(api, 950);
    const st = api.state;
    const btn = api.$('.s04-add');
    FX.replay(btn, 'is-hit');
    api.sfx('click');
    const next = s04Round(st.amount + 1);
    const gm = api.$('.s04-grandma');
    Art.mood(gm.querySelector('svg'), 'happy');
    FX.replay(gm, 'is-serve');
    this.say(api, S04_SAY[st.adds % S04_SAY.length]);
    FX.replay(api.$('.s04-kap'), 'is-serve');
    api.sfx('whoosh');
    const g = api.$('.s04-guest');
    const plateBox = api.$('.s04-plate');
    const mood = S04_GUEST_ADD[Math.min(st.adds, S04_GUEST_ADD.length - 1)];
    api.timeout(() => {
      api.sfx('plop');
      FX.replay(plateBox, 'is-jelly');
      const m = FX.centerOf(plateBox.querySelector('.mound'));
      FX.plov({ x: m.x, y: m.y - m.h * .4, count: 46, power: 12 });
      Art.mood(g.querySelector('svg'), mood);
      FX.replay(g, 'is-shake');
    }, 500);
    this.commit(api, 'add', next, 500);
  },

  showCaption(api) {
    const st = api.state;
    if (st.caption) return;
    if (st.busy) this.settle(api);
    st.caption = true;
    api.$('.s04-say').classList.remove('is-on');
    api.$('.s04-caption').classList.add('is-on');
    api.sfx('stamp');
    Art.mood(api.$('.s04-guest svg'), 'dizzy');
    Art.mood(api.$('.s04-grandma svg'), 'kind');
    api.timeout(() => { this.renderTrail(api); api.sfx('sparkle'); }, 350);
    api.updateSteps();
  },

  next(api) {
    const st = api.state;
    if (st.steps < 4) { if (st.last === 'eat') this.add(api); else this.eat(api); return true; }
    if (!st.caption) { this.showCaption(api); return true; }
    if (st.busy) { this.settle(api); return true; } // после панчлайна кнопки мышью ещё работают: досматриваем их шаг
    return false;
  },

  keys: {
    Digit1(api) { this.eat(api); },
    Digit2(api) { this.add(api); },
  },

  progress(api) { return { done: Math.min(api.state.steps, 4) + (api.state.caption ? 1 : 0), total: 5 }; },
});
