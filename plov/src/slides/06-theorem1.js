/* Слайд 6. Pₙ₊₁ = 0,3·Pₙ + 1, P₀ = 1 → 10/7. Ползунок 0–20 циклов дорисовывает график; печати «сходится / не спасает» */
const N_MAX = 20;
const LIM = 10 / 7;
const P = (n) => LIM - (3 / 7) * Math.pow(0.3, n); // точная формула, совпадает с рекуррентой
const POINTS = Array.from({ length: N_MAX + 1 }, (_, n) => [n, P(n)]);

Deck.register('06', {
  init(api) {
    const st = api.state;
    st.n = 0; st.verdict = false; st.slam2 = false; st.animating = false; st.anim = 0; st.shownN = null;
    st.plot = new Plot(api.$('.s06-chart'), {
      width: 1160, height: 660, margin: { l: 120, r: 40, t: 50, b: 100 },
      x: [0, N_MAX], y: [0.8, 1.6],
      xTicks: [0, 5, 10, 15, 20], yTicks: [0.8, 1, 1.2, 1.4, 1.6],
      fmtY: (v) => Fmt.num(v, 1),
      xLabel: 'циклы, <tspan font-style="italic">n</tspan>',
      // подпись оси поднята, индекс опущен на dy: не наезжает на деление «1,6»
      yLabel: '<tspan font-style="italic" dy="-14">P</tspan><tspan font-size="24" font-style="italic" dy="9">n</tspan>',
    });
    st.plot.hline('lim', LIM, { label: '10/7 ≈ 1,43', color: 'var(--gold)', labelX: 1110 });
    st.plot.series('P', { color: 'var(--blue)', dots: true, dotR: 8, revealAll: false }).data(POINTS);
    api.$('.s06-plate').innerHTML = Art.plate({ w: 300, amount: 1, seed: 31, headroom: -.05 });
    // гость — круглый стикер-реакция: только голова и плечи
    const guest = api.$('.s06-guest');
    guest.innerHTML = Art.guest({ mood: 'panic' });
    guest.querySelector('svg').setAttribute('viewBox', '40 64 280 280');

    const range = api.$('#s06-range');
    range.addEventListener('input', () => {
      range.step = '1';
      const n = clamp(Math.round(+range.value), 0, N_MAX);
      range.style.setProperty('--fill', `${(n / N_MAX) * 100}%`);
      this.setN(api, n, { user: true });
    });
    // после мыши фокус не остаётся на ползунке, иначе → / ← двигали бы ползунок, а не слайды
    const release = () => { const r = api.el.querySelector('#s06-range'); if (r && document.activeElement === r) r.blur(); };
    range.addEventListener('change', release);
    if (!api.el.dataset.s06up) { api.el.dataset.s06up = '1'; api.el.addEventListener('pointerup', release); } // секция переживает R
    // если на ползунок пришли с клавиатуры (Tab): на краях стрелки снова листают презентацию
    range.addEventListener('keydown', (e) => {
      const v = +range.value;
      const out = (e.code === 'ArrowRight' && v >= N_MAX) ? 'advance' : (e.code === 'ArrowLeft' && v <= 0) ? 'back' : null;
      if (!out) return;
      e.preventDefault();
      range.blur();
      Deck[out]();
    });
    this.render(api, 0, { quiet: true });
    this.slider(api, 0);
  },
  enter(api) {
    // после возврата на слайд — картинка уже доведена до конца в leave()
    api.state.plot.reveal('P', api.state.n);
  },
  leave(api) {
    const st = api.state;
    api.clearTimers();
    if (st.animating) this.finish(api, { quiet: true });
    if (st.verdict) this.slam2(api, { quiet: true });
  },
  // показания для (возможно дробного) положения t
  render(api, t, { quiet = false } = {}) {
    const st = api.state;
    const n = Math.round(t);
    if (st.shownN === n) return;
    st.shownN = n;
    api.$('.s06-nv').textContent = n;
    api.$('.s06-psub').textContent = n;
    api.$('.s06-pv').textContent = Fmt.num(P(n), 3);
    Art.setAmount(api.$('.s06-plate .art'), P(n), quiet ? 1 : 260, ease.outCubic);
    if (n > 0 && !quiet) api.sfx('tick');
  },
  // ползунок (бегунок и заливка) — в то же положение, что и график
  slider(api, t) {
    const range = api.$('#s06-range');
    range.value = t;
    range.style.setProperty('--fill', `${(t / N_MAX) * 100}%`);
  },
  setN(api, n, { user = false, ms } = {}) {
    const st = api.state;
    const from = st.plot.revealed('P');
    const range = api.$('#s06-range');
    st.n = n;
    const dur = ms ?? clamp(Math.abs(n - from) * 90, 250, 1400);
    const t0 = performance.now();
    const token = ++st.anim;
    st.animating = true;
    if (!user) range.step = 'any'; // бегунок едет плавно, а не прыжками по 1
    const step = () => {
      if (token !== st.anim) return;
      const k = clamp((performance.now() - t0) / dur, 0, 1);
      const t = lerp(from, n, ease.inOutCubic(k));
      st.plot.reveal('P', t);
      this.render(api, t);
      if (!user) this.slider(api, t);
      if (k < 1) { api.raf(step); return; }
      st.animating = false;
      if (!user) { range.step = '1'; this.slider(api, n); }
      if (user && n >= 12 && !st.verdict) api.timeout(() => this.verdict(api), 350);
    };
    api.raf(step);
    api.updateSteps();
  },
  // мгновенно довести график до цели (→ во время анимации и уход со слайда)
  finish(api, { quiet = false } = {}) {
    const st = api.state;
    st.anim++;
    st.animating = false;
    st.plot.reveal('P', st.n);
    this.render(api, st.n, { quiet });
    api.$('#s06-range').step = '1';
    this.slider(api, st.n);
  },
  sweep(api) {
    const from = api.state.plot.revealed('P');
    this.setN(api, N_MAX, { ms: clamp((N_MAX - from) * 120, 400, 2400) });
    api.sfx('whoosh');
  },
  verdict(api) {
    const st = api.state;
    if (st.verdict) return;
    st.verdict = true;
    api.$('.s06-st1').classList.add('is-slam'); api.sfx('stamp'); api.sfx('ding');
    FX.shakeStage();
    api.timeout(() => this.slam2(api), 1100);
    api.updateSteps();
  },
  slam2(api, { quiet = false } = {}) {
    const st = api.state;
    if (st.slam2) return;
    st.slam2 = true;
    api.$('.s06-st2').classList.add('is-slam');
    api.$('.s06-guest').classList.add('is-on');
    if (!quiet) { api.sfx('stamp'); api.sfx('fail'); FX.shakeStage(); }
  },
  next(api) {
    const st = api.state;
    if (st.animating && st.n >= N_MAX) { this.finish(api); return true; } // перемотка проезда
    if (st.n < N_MAX) { this.sweep(api); return true; }
    if (!st.verdict) { this.verdict(api); return true; }
    if (!st.slam2) { api.clearTimers(); this.slam2(api); return true; } // вторая печать — сразу
    return false;
  },
  progress(api) { return { done: (api.state.n >= N_MAX ? 1 : 0) + (api.state.verdict ? 1 : 0), total: 2 }; },
});
