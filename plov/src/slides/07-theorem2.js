/* Слайд 7. Теорема 2: «Куда исчезает плов?»
   Шуточная модель: P0 = 1, P(n+1) = 0,3·Pn + 1 (гость съедает 70 %, бабушка добавляет 1).
   На тарелке перед n-м приёмом: Pn = 10/7 − (3/7)·0,3^n → 10/7 ≈ 1,43.
   Съедено за N приёмов: E_N = Σ_{n=0}^{N−1} 0,7·Pn = N + 1 − P_N → ∞ (в пределе +1 порция за цикл).
   «Далее»: +1 цикл ×3 → перемотка до 20 → финал «Тарелка сходится. Гость расходится.» → стрелка в зал. */
const MAXN = 30;     // предел для мыши
const FF_TO = 20;    // куда перематываем
const MANUAL = 3;    // ручных циклов в сценарии «Далее»
const POP_AT = 12;   // на этом цикле отлетает пуговица

const P = [1];
for (let n = 0; n < MAXN; n++) P.push(0.3 * P[n] + 1);
const E = P.map((p, n) => n + 1 - p); // E[n+1] − E[n] = 0,7·P[n]

const at = (arr, v) => {
  const n = clamp(Math.floor(v), 0, arr.length - 1), f = v - n;
  return n + 1 < arr.length ? lerp(arr[n], arr[n + 1], f) : arr[n];
};
const fullOf = (e) => 1.1 * (1 - Math.exp(-e / 8));            // живот: мягко растёт, не больше 1,1
const moodOf = (n) => (n <= 1 ? 'neutral' : n <= 3 ? 'happy' : n < POP_AT ? 'full' : 'dizzy');
const FORMS = ['порция', 'порции', 'порций'];
const STAR = 'M0,-20 L4.9,-6.8 L19,-6.2 L8,2.6 L11.8,16.2 L0,8.5 L-11.8,16.2 L-8,2.6 L-19,-6.2 L-4.9,-6.8 Z';

// точки сцены в координатах сцены 1920×1080 (для частиц)
const SCENE = { x: 1140, y: 318 };
const MOUTH = { x: SCENE.x + 545, y: SCENE.y + 186 };
const MOUND = { x: SCENE.x + 175, y: SCENE.y + 215 };

Deck.register('07', {
  init(api) {
    const el = api.el;
    el.classList.remove('is-ffing', 'is-ffdone', 'is-dizzy');
    delete el.dataset.chrome;
    const st = api.state;
    Object.assign(st, {
      N: 1, v: 0, manual: 0, plateAmt: P[1],
      ffBusy: false, climax: false, arrow: false, popped: false, slope: false,
      tok: {}, groups: { cycle: [], climax: [] },
    });

    // график: обе серии на одной плоскости, ось Y плавно растёт вместе со съеденным
    const plot = new Plot(api.$('.s07-chart'), {
      width: 1030, height: 598, margin: { l: 120, r: 40, t: 44, b: 84 },
      x: [0, 5], y: [0, 3], xTickCount: 6, yTickCount: 5,
      fmtX: (v) => (Number.isInteger(v) ? Fmt.int(v) : ''),
      fmtY: (v) => (Number.isInteger(v) ? Fmt.int(v) : Fmt.num(v, 1)),
      xLabel: 'цикл <tspan font-style="italic">n</tspan>', yLabel: 'порции',
    });
    plot.hline('lim', 10 / 7, { label: '10/7 ≈ 1,43', color: 'var(--gold)' });
    plot.series('plate', { color: 'var(--blue)', dots: true, dotR: 7, revealAll: false }).data(P.map((p, n) => [n, p]));
    plot.series('eaten', { color: 'var(--orange)', dots: true, dotR: 7, revealAll: false }).data(E.map((e, n) => [n, e]));
    st.plot = plot;

    // персонажи и реквизит
    api.$('.s07-plate').innerHTML = Art.plate({ w: 230, amount: P[1] });
    api.$('.s07-kapgir-in').innerHTML = Art.kapgir();
    api.$('.s07-guest').innerHTML = Art.guest({ mood: 'neutral', full: 0 });
    const gsvg = api.$('.s07-guest svg');
    gsvg.insertAdjacentHTML('beforeend', `<g class="s07-btnpos"><g class="s07-btnin">
      <circle cx="180" cy="424" r="14" fill="#f6bb2a" stroke="#1b1814" stroke-width="4"/>
      <circle cx="175" cy="419" r="2.6" fill="#1b1814"/><circle cx="185" cy="419" r="2.6" fill="#1b1814"/>
      <circle cx="175" cy="429" r="2.6" fill="#1b1814"/><circle cx="185" cy="429" r="2.6" fill="#1b1814"/></g></g>
      <g class="s07-stars" transform="translate(180 84)">${[0, 1, 2].map((i) => `<path d="${STAR}" fill="#f6bb2a" stroke="#1b1814" stroke-width="3" stroke-linejoin="round">
        <animateMotion dur="1.5s" repeatCount="indefinite" begin="${(-0.5 * i).toFixed(1)}s" path="M92,0 A92,24 0 1,1 -92,0 A92,24 0 1,1 92,0"/></path>`).join('')}</g>`);

    Object.assign(st, {
      gsvg,
      $guest: api.$('.s07-guest'), $plate: api.$('.s07-plate'), $kapgir: api.$('.s07-kapgir'),
      $scale: api.$('.s07-scale-v'), $num: api.$('.s07-eaten-num'), $unit: api.$('.s07-eaten-unit'),
      $eaten: api.$('.s07-eaten'), $nv: api.$('.s07-nv'), $more: api.$('.s07-more'),
      $btn: api.$('.s07-btnin'), $chpok: api.$('.s07-chpok'), $floats: api.$('.s07-floats'),
      $slope: api.$('.s07-slope'), $final: api.$('.s07-final'), $l1: api.$('.s07-l1'), $l2: api.$('.s07-l2'),
    });

    this.setPlate(api, P[1]);
    this.setFull(api, E[1]);
    this.render(api, 0);
    this.syncUi(api);

    // после клика мышью снимаем фокус с кнопки: иначе пробел/Enter кликера «нажимают» уже скрытую кнопку
    // (core.js отдаёт Space/Enter сфокусированной кнопке), и «Далее» молчит
    const onClick = (sel, fn) => api.$(sel).addEventListener('click', (e) => { e.currentTarget.blur(); fn(); });
    onClick('.s07-more', () => this.addCycle(api, true));
    onClick('.s07-ff', () => this.fastForward(api));
    onClick('.s07-sum', () => this.climax(api));
    st.$final.addEventListener('click', () => { if (api.state.climax && !api.state.arrow) this.showArrow(api); });
  },

  enter(api, { first } = {}) {
    const st = api.state;
    if (first || st.v === 0) {
      // вступление: обе линии дорисовываются до первого цикла, счётчик бежит 0 → 0,70
      this.render(api, 0);
      api.timeout(() => { if (api.state.v < 1 && api.state.N === 1) this.animV(api, 1, 900); }, 650);
    }
  },

  leave(api) { this.settle(api); },

  /* ---------- общие помощники ---------- */
  anim(api, key, ms, fn, easing = ease.outCubic) {
    const st = api.state, tok = {};
    st.tok[key] = tok;
    return new Promise((res) => {
      const t0 = performance.now();
      const step = () => {
        if (st.tok[key] !== tok) return res(false);
        const k = ms > 0 ? clamp((performance.now() - t0) / ms, 0, 1) : 1;
        fn(easing(k), k);
        if (k < 1) api.raf(step); else res(true);
      };
      step();
    });
  },
  later(api, group, fn, ms) { const g = api.state.groups[group]; g.push(api.timeout(fn, ms)); },
  clearGroup(api, group) { const g = api.state.groups[group]; g.forEach(clearTimeout); g.length = 0; },

  // отрисовать график и счётчик при «непрерывном» номере цикла v
  render(api, v) {
    const st = api.state, plot = st.plot;
    st.v = v;
    const e = at(E, v);
    plot.reveal('plate', v);
    plot.reveal('eaten', v);
    plot.setDomain({ x: [0, Math.max(5, v + 1)], y: [0, Math.max(3, e * 1.25 + 0.5)] });
    st.$num.textContent = Number.isInteger(e) ? Fmt.int(e) : Fmt.num(e, 2);
    st.$unit.textContent = Fmt.plural(e, FORMS);
    if (st.slope) {
      const k = Math.max(2, v * 0.62);
      const s = st.$slope.style;
      s.left = `${(plot.sx(k) + 40).toFixed(1)}px`;
      s.top = `${(plot.sy(at(E, k)) + 40).toFixed(1)}px`;
    }
  },
  animV(api, to, ms, easing = ease.inOutCubic) {
    const from = api.state.v;
    return this.anim(api, 'v', ms, (k) => this.render(api, lerp(from, to, k)), easing);
  },
  setPlate(api, a) {
    const st = api.state;
    st.plateAmt = a;
    const g = st.$plate.querySelector('.mound');
    const s = Art.amountScale(Math.max(0, a));
    if (g) g.setAttribute('transform', `scale(${s.x.toFixed(4)},${s.y.toFixed(4)})`);
    st.$scale.textContent = Fmt.num(Math.max(0, a), 2);
  },
  plateTo(api, a, ms, easing = ease.outCubic) {
    const from = api.state.plateAmt;
    return this.anim(api, 'plate', ms, (k) => this.setPlate(api, lerp(from, a, k)), easing);
  },
  setFull(api, e) {
    const st = api.state, f = fullOf(e);
    st.gsvg.style.setProperty('--full', f.toFixed(3));
    st.$btn.classList.toggle('is-strain', f > 0.6 && !st.popped);
  },
  setMood(api, n, quiet = false) {
    const st = api.state, m = moodOf(n);
    Art.mood(st.gsvg, m);
    api.el.classList.toggle('is-dizzy', m === 'dizzy');
    if (n >= POP_AT && !st.popped) this.pop(api, quiet);
  },
  pop(api, quiet) {
    const st = api.state;
    st.popped = true;
    st.$btn.classList.remove('is-strain');
    st.$btn.classList.add('is-popped');
    if (quiet) return;
    api.sfx('boing');
    FX.replay(st.$chpok, 'is-shown');
    FX.at(st.$chpok, 'confetti', { count: 34, power: 14, spread: Math.PI * 2, gravity: 0.3, life: 55, size: 7 });
  },
  floatText(api, text, kind, x, y) {
    const d = document.createElement('div');
    d.className = `s07-float s07-float--${kind}`;
    d.textContent = text;
    d.style.left = `${x}px`; d.style.top = `${y}px`;
    api.state.$floats.appendChild(d);
    api.timeout(() => d.remove(), 1200);
  },
  syncUi(api) {
    const st = api.state, el = api.el;
    el.classList.toggle('is-ffing', st.ffBusy);
    el.classList.toggle('is-ffdone', !st.ffBusy && st.N >= FF_TO);
    st.$more.classList.toggle('is-busy', st.ffBusy || st.climax);
    st.$more.classList.toggle('is-disabled', st.N >= MAXN);
    st.$more.classList.toggle('btn--pulse', st.N < 2);
    if (!st.ffBusy) st.$nv.textContent = st.N;
  },

  /* ---------- действия ---------- */
  // +1 цикл: гость съедает 70 %, бабушкин капгир добавляет порцию
  addCycle(api, user) {
    const st = api.state;
    if (st.climax || st.ffBusy || st.N >= MAXN) return false;
    this.clearGroup(api, 'cycle');
    st.N += 1;
    if (user) st.manual += 1;
    const n = st.N, before = P[n - 1];

    FX.replay(st.$more, 'is-pressed');
    api.timeout(() => st.$more.classList.remove('is-pressed'), 160);
    api.sfx('gulp');
    FX.replay(st.$guest, 'is-gulp');
    FX.replay(st.$eaten, 'is-bump');
    this.plateTo(api, 0.3 * before, 260);
    FX.rice({ x: MOUND.x + 20, y: MOUND.y, count: 24, power: 26, angle: -0.43, spread: 0.3, size: 5, life: 34 });
    this.floatText(api, `+${Fmt.num(0.7 * before, 2)}`, 'eat', 560, 14);
    this.animV(api, n, 850);

    this.later(api, 'cycle', () => {
      FX.rice({ x: MOUTH.x, y: MOUTH.y, count: 10, power: 6, size: 4, life: 18 });
      this.setFull(api, E[n]);
      this.setMood(api, n);
    }, 260);
    this.later(api, 'cycle', () => FX.replay(st.$kapgir, 'is-swoop'), 300);
    this.later(api, 'cycle', () => {
      api.sfx('plop');
      this.plateTo(api, P[n], 520, ease.outBack);
      FX.replay(st.$plate, 'is-plop');
      FX.plov({ x: MOUND.x, y: MOUND.y - 30, count: 26, power: 9, size: 5, life: 36 });
      this.floatText(api, '+1', 'add', 330, 130);
    }, 720);
    if (n >= FF_TO && !st.slope) { st.slope = true; st.$slope.classList.add('is-shown'); }

    this.syncUi(api);
    api.updateSteps();
    return true;
  },

  // перемотка: непрерывная «развёртка» ряда до 20 циклов
  fastForward(api) {
    const st = api.state;
    if (st.climax || st.ffBusy || st.N >= FF_TO) return false;
    this.settleCycle(api);
    st.ffBusy = true;
    st.ffFrom = st.v;
    st.ffLast = Math.floor(st.v + 1e-6);
    st.N = FF_TO;
    api.sfx('whoosh');
    st.$kapgir.classList.remove('is-swoop');
    st.$kapgir.classList.add('is-turbo');
    st.$plate.classList.add('is-jiggle');
    this.plateTo(api, P[FF_TO], 500);
    this.anim(api, 'v', 2300, (k) => {
      const v = lerp(st.ffFrom, FF_TO, k);
      this.render(api, v);
      const cur = Math.floor(v + 1e-6);
      while (st.ffLast < cur) { st.ffLast += 1; this.ffTick(api, st.ffLast, false); }
    }, ease.inOutCubic).then((ok) => { if (ok) this.ffDone(api, false); });
    this.syncUi(api);
    api.updateSteps();
    return true;
  },
  ffTick(api, k, quiet) {
    const st = api.state;
    st.$nv.textContent = k;
    this.setFull(api, E[k]);
    this.setMood(api, k, quiet);
    if (quiet) return;
    api.sfx(k % 3 === 0 ? 'gulp' : 'tick');
    if (k % 2 === 0) {
      FX.replay(st.$guest, 'is-gulp');
      FX.rice({ x: MOUTH.x, y: MOUTH.y, count: 8, power: 7, size: 4, life: 18 });
    }
  },
  ffDone(api, quiet) {
    const st = api.state;
    st.ffBusy = false;
    st.$kapgir.classList.remove('is-turbo');
    st.$plate.classList.remove('is-jiggle');
    this.setPlate(api, P[st.N]);
    st.slope = true;
    this.render(api, st.N);
    st.$slope.classList.add('is-shown');
    if (!quiet) api.sfx('ding');
    this.syncUi(api);
    api.updateSteps();
  },
  // «Далее» во время перемотки: досрочно завершить
  finishFF(api, quiet = true) {
    const st = api.state;
    if (!st.ffBusy) return;
    st.tok.v = null;
    while (st.ffLast < FF_TO) { st.ffLast += 1; this.ffTick(api, st.ffLast, true); }
    this.ffDone(api, quiet);
  },
  // мгновенно довести незаконченный цикл (без звука)
  settleCycle(api) {
    const st = api.state;
    this.clearGroup(api, 'cycle');
    st.tok.v = null; st.tok.plate = null;
    st.$kapgir.classList.remove('is-swoop');
    this.setPlate(api, P[st.N]);
    this.setFull(api, E[st.N]);
    this.setMood(api, st.N, true);
    this.render(api, st.N);
  },
  settle(api) {
    const st = api.state;
    if (st.ffBusy) this.finishFF(api, true);
    else if (st.groups.cycle.length) this.settleCycle(api);
    if (st.climax && st.groups.climax.length) {
      this.clearGroup(api, 'climax');
      st.$l1.classList.add('is-shown');
      st.$l2.classList.add('is-shown');
    }
  },

  // кульминация на весь экран
  climax(api) {
    const st = api.state;
    if (st.climax) return false;
    this.settle(api);
    st.climax = true;
    api.el.dataset.chrome = 'off';
    st.$final.classList.add('is-on');
    api.sfx('drumroll', 1.1);
    this.later(api, 'climax', () => { st.$l1.classList.add('is-shown'); api.sfx('swoosh'); }, 300);
    this.later(api, 'climax', () => {
      st.$l2.classList.add('is-shown');
      FX.shakeStage();
      FX.plov({ x: 960, y: 600, count: 110, power: 24, life: 70 });
    }, 1150);
    this.syncUi(api);
    api.updateSteps();
    return true;
  },
  // стрелка в зал: «Плов не исчез. Он в вас.»
  showArrow(api) {
    const st = api.state;
    if (!st.climax || st.arrow) return false;
    this.clearGroup(api, 'climax');
    st.$l1.classList.add('is-shown');
    st.$l2.classList.add('is-shown');
    st.arrow = true;
    st.$final.classList.add('is-arrow');
    api.sfx('whoosh');
    api.timeout(() => api.sfx('boing'), 520);
    api.timeout(() => api.sfx('sparkle'), 900);
    api.updateSteps();
    return true;
  },

  next(api) {
    const st = api.state;
    if (st.ffBusy) { this.finishFF(api, false); return true; }
    if (!st.climax) {
      if (st.N < FF_TO && st.manual < MANUAL) { this.addCycle(api, true); return true; }
      if (st.N < FF_TO) { this.fastForward(api); return true; }
      this.climax(api);
      return true;
    }
    if (!st.arrow) { this.showArrow(api); return true; }
    return false;
  },

  progress(api) {
    const st = api.state;
    const cyc = st.N >= FF_TO ? MANUAL + 1 : Math.min(st.manual, MANUAL);
    return { done: cyc + (st.climax ? 1 : 0) + (st.arrow ? 1 : 0), total: MANUAL + 3 };
  },
});
