/* Слайд 8. Коэффициент бабушки.
   Модель: P0 = 1, P(n+1) = 0,3·P(n) + k^n (добавки a_n = k^n, первая — одна порция).
   k = 1 → ряд сходится к 10/7; любое k > 1 → расходится (P(n) ≈ k^n / (k − 0,3)).
   Шаги «Далее»: 1) k → 1; 2) k → 1,5; 3) k → 2 (критический уровень); 4) аварийный сброс + две бабушки. */
const S08 = (() => {
  const INK = '#1b1814';
  const RX = 1425;                 // центр лягана по x (координаты сцены)
  const PW = 540;                  // ширина лягана
  const PRY = Math.round(PW * .17); // полуось эллипса лягана
  const PY = 878;                  // центр лягана по y
  const BASE_Y = PY + Math.round(PRY * .35); // основание горки
  const CYCLES = 10;
  const TARGETS = [1, 1.5, 2];
  const STIFF = 120, DAMP = 16;    // пружина горки

  // P(n) строго по рекуррентной формуле
  function P(k, n) { let p = 1; for (let i = 0; i < n; i++) p = 0.3 * p + Math.pow(k, i); return p; }
  function series(k, n) { const out = [1]; let p = 1; for (let i = 0; i < n; i++) { p = 0.3 * p + Math.pow(k, i); out.push(p); } return out; }
  const L1 = Math.log10(P(1, CYCLES)), L2 = Math.log10(P(2, CYCLES));
  // размер горки — по логарифму порций через 10 циклов (k = 1 → обычная порция, k = 2 → вся сцена)
  function moundSize(k) {
    const t = clamp((Math.log10(P(k, CYCLES)) - L1) / (L2 - L1), 0, 1);
    return { w: 340 + 2700 * Math.pow(t, 3.4), h: 156 + 1110 * Math.pow(t, 2.3) };
  }
  // 1,50 → «1,5»; 1,00 → «1»; 2,25 → «2,25»
  const trim = (x) => Fmt.num(x, 2).replace(/,?0+$/, '');
  // «48,1 порции», «1,43 порции», «602 порции» — склонение через Fmt.portions
  function portions(v) {
    const d = v < 10 ? 2 : v < 100 ? 1 : 0;
    const s = Fmt.portions(d === 0 ? Math.round(v) : v, d);
    const m = s.match(/^(.*\S)\s+(\S+)$/);
    return m ? { num: m[1], unit: m[2] } : { num: s, unit: '' };
  }
  const frac = (x) => x - Math.floor(x);

  /* ---------- рисунок: ляган + гора плова ---------- */
  function plateSvg() {
    const cx = RX, cy = PY, w = PW, ry = PRY;
    let rim = '';
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const x = cx + Math.cos(a) * (w / 2 - 22), y = cy + Math.sin(a) * (ry - 9);
      rim += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4.5" fill="${i % 2 ? '#f5ebd5' : '#1fa3b4'}" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return `
      <ellipse cx="${cx}" cy="${cy + ry * .5}" rx="${w / 2 + 40}" ry="${ry + 14}" fill="rgba(0,0,0,.45)" filter="url(#f-soft)"/>
      <ellipse cx="${cx}" cy="${cy + 10}" rx="${w / 2}" ry="${ry}" fill="#173a86" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${ry}" fill="#2453b0" stroke="${INK}" stroke-width="5"/>
      <g>${rim}</g>
      <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 40}" ry="${ry - 16}" fill="#f5ebd5" stroke="#1f3f95" stroke-width="4"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 70}" ry="${ry - 28}" fill="none" stroke="#1fa3b4" stroke-width="3" stroke-dasharray="6 10"/>`;
  }
  const MEAT = 'M-20,6 q-4,-16 12,-20 q18,-4 26,8 q6,14 -8,20 q-18,6 -30,-8z';
  const NBITS = 300;
  // детали горки: морковь, нут, изюм, мясо — низкодисперсная последовательность, чтобы любые первые m штук лежали равномерно
  function makeBits() {
    const bits = [];
    for (let i = 0; i < NBITS; i++) {
      const u = (frac(.5 + i * .7548776662) - .5) * .86;
      const v = .05 + frac(.5 + i * .5698402910) * .86;
      const a = Math.round(frac(i * .6180339887) * 140 - 70);
      const kind = i % 17 === 8 ? 'meat' : i % 7 === 4 ? 'pea' : i % 7 === 5 ? 'raisin' : 'carrot';
      bits.push({ u, v, a, kind });
    }
    return bits;
  }
  function bitSvg(b, i) {
    let inner;
    if (b.kind === 'carrot') inner = `<rect x="-13" y="-3.3" width="26" height="6.6" rx="3" fill="${i % 2 ? '#f08a1f' : '#e7741a'}"/>`;
    else if (b.kind === 'pea') inner = '<circle r="6" fill="#e9c27a" stroke="#1b1814" stroke-width="2"/>';
    else if (b.kind === 'raisin') inner = '<ellipse rx="5" ry="3.4" fill="#4a1f2a"/>';
    else inner = `<path d="${MEAT}" fill="${i % 2 ? '#8a4322' : '#743516'}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    return `<g class="s08-bit" style="display:none"><g transform="rotate(${b.a})">${inner}</g></g>`;
  }
  const TOP_MEAT = [[-.18, .78], [.2, .74], [.02, .88], [-.34, .52], [.36, .5]];
  const GARLIC = `
      <path d="M-30,0 C-34,-30 -14,-46 0,-50 C14,-46 34,-30 30,0 C18,10 -18,10 -30,0Z" fill="#f7efe0" stroke="${INK}" stroke-width="4"/>
      <path d="M-14,4 C-20,-18 -10,-38 0,-48 M14,4 C20,-18 10,-38 0,-48 M0,6 V-48" stroke="#c9b9a0" stroke-width="3" fill="none"/>
      <path d="M0,-50 q-2,-12 4,-18" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;

  function buildWorld(api) {
    const s = api.state;
    s.bits = makeBits();
    const svg = api.$('.s08-mtn');
    svg.innerHTML = `
      <g class="s08-plate">${plateSvg()}</g>
      <g class="s08-mound" transform="translate(${RX},${BASE_Y})">
        <path class="s08-d s08-d1" fill="url(#p-rice)"/>
        <path class="s08-d s08-d2" fill="url(#g-mound)"/>
        <g class="s08-bits">${s.bits.map(bitSvg).join('')}</g>
        <g class="s08-topmeat">${TOP_MEAT.map((_, i) => `<g><path d="${MEAT}" fill="${i % 2 ? '#8a4322' : '#743516'}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></g>`).join('')}</g>
        <path class="s08-d s08-d3" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <g class="s08-garlic">${GARLIC}</g>
      </g>`;
    s.nodes = {
      d: api.$$('.s08-d'),
      bits: api.$$('.s08-bit'),
      topMeat: api.$$('.s08-topmeat > g'),
      garlic: api.$('.s08-garlic'),
    };
    s.bitsShown = 0;
  }

  function renderMound(api) {
    const s = api.state, { w, h } = s.dim, nd = s.nodes;
    if (!nd) return;
    const W = Math.max(40, w), H = Math.max(20, h);
    const grow = clamp((W - 340) / 2700, 0, 1);
    // чем больше гора, тем острее вершина: «горка» превращается в «гору»
    const sh = clamp(grow * 5, 0, 1);
    const c1x = lerp(.5, .4, sh), c1y = lerp(.62, .5, sh), c2x = lerp(.3, .17, Math.min(1, grow * 2.2));
    const f1 = (x) => x.toFixed(1);
    const d = `M${f1(-W / 2)},0 C${f1(-W * c1x)},${f1(-H * c1y)} ${f1(-W * c2x)},${f1(-H)} 0,${f1(-H)} C${f1(W * c2x)},${f1(-H)} ${f1(W * c1x)},${f1(-H * c1y)} ${f1(W / 2)},0 Z`;
    nd.d.forEach((p) => p.setAttribute('d', d));
    const bs = 1 + .8 * grow;  // детали чуть крупнеют, но рис остаётся рисом
    const m = Math.round(clamp(24 * Math.pow((W * H) / 53000, .55), 18, NBITS));
    const pw = .5 + .5 * sh;
    const top = (x) => H * Math.pow(Math.max(0, 1 - Math.pow((2 * x) / W, 2)), pw) * .86;
    for (let i = 0; i < nd.bits.length; i++) {
      const el = nd.bits[i];
      if (i >= m) { if (i < s.bitsShown) el.style.display = 'none'; continue; }
      const b = s.bits[i];
      const x = b.u * W, y = -b.v * top(x);
      const sc = bs;
      el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
      if (i >= s.bitsShown) el.style.display = '';
    }
    s.bitsShown = m;
    nd.topMeat.forEach((g, i) => {
      const [fx, fy] = TOP_MEAT[i];
      g.setAttribute('transform', `translate(${(fx * W).toFixed(1)},${(-fy * H).toFixed(1)}) scale(${bs.toFixed(3)})`);
    });
    nd.garlic.setAttribute('transform', `translate(0,${(-H + 6).toFixed(1)}) scale(${(bs * 1.05).toFixed(3)})`);
    const peakY = BASE_Y - H - 50 * bs;
    api.el.classList.toggle('is-flood', peakY < 212 && W > 700);
    api.el.classList.toggle('is-offtop', BASE_Y - H < -40);
  }

  // пружина: горка догоняет целевой размер с лёгким «желе»
  function kick(api) {
    const s = api.state;
    if (s.springOn) return;
    s.springOn = true;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000)); last = now;
      const d = s.dim, tg = s.tgt;
      d.vw += (STIFF * (tg.w - d.w) - DAMP * d.vw) * dt; d.w += d.vw * dt;
      d.vh += (STIFF * (tg.h - d.h) - DAMP * d.vh) * dt; d.h += d.vh * dt;
      const settled = Math.abs(tg.w - d.w) < .6 && Math.abs(tg.h - d.h) < .6 && Math.abs(d.vw) < 3 && Math.abs(d.vh) < 3;
      if (settled) { d.w = tg.w; d.h = tg.h; d.vw = 0; d.vh = 0; }
      renderMound(api);
      if (settled) { s.springOn = false; return; }
      api.raf(step);
    };
    api.raf(step);
  }

  return { P, series, moundSize, trim, portions, buildWorld, renderMound, kick, TARGETS, RX, BASE_Y, CYCLES };
})();

Deck.register('08', {
  init(api) {
    const s = api.state;
    Object.assign(s, {
      k: 1.5, step: 0, conv: null, crit: false, constShown: false, anim: null,
      lastTick: 30, dim: { w: 340, h: 156, vw: 0, vh: 0 }, tgt: S08.moundSize(1.5), springOn: false,
    });
    // R перезапускает только содержимое слайда: классы состояния на самой секции снимаем вручную
    api.el.classList.remove('is-const', 'is-conv', 'is-critical', 'is-flood', 'is-offtop');
    api.el.style.removeProperty('--heat');
    S08.buildWorld(api);
    api.$('.s08-gma--uz .s08-gma-art').innerHTML = Art.grandma({ variant: 'uz', mood: 'kind', holding: 'plate', amount: 1.1 });
    api.$('.s08-gma--ru .s08-gma-art').innerHTML = Art.grandma({ variant: 'ru', mood: 'kind', holding: 'pirozhki' });
    api.$('.s08-bars').innerHTML = '<i></i>'.repeat(S08.CYCLES + 1);
    s.ui = {
      range: api.$('.s08-range'), kval: api.$('.s08-kval'), chips: api.$$('.s08-chip:not(.s08-chip--more)'),
      num: api.$('.s08-ro-num'), unit: api.$('.s08-ro-unit'), bars: api.$$('.s08-bars i'),
      vchip: api.$('.s08-vchip'), vtext: api.$('.s08-vchip-t'), vmath: api.$('.s08-vmath'),
    };
    const r = s.ui.range;
    r.addEventListener('input', () => this.userSet(api, parseFloat(r.value)));
    // после перетаскивания возвращаем клавиатуру колоде, чтобы кликер (→) листал шаги, а не двигал ползунок
    r.addEventListener('change', () => r.blur());
    r.addEventListener('pointerup', () => api.timeout(() => r.blur(), 0));
    api.$('.s08-reset').addEventListener('click', (e) => { e.currentTarget.blur(); this.emergency(api); });
    this.apply(api, s.k, { silent: true });
    s.dim.w = s.tgt.w; s.dim.h = s.tgt.h;
    S08.renderMound(api);
  },

  enter(api) {
    const s = api.state;
    // горка «вырастает» при входе на слайд
    s.dim.w = Math.max(200, s.tgt.w * .35); s.dim.h = Math.max(80, s.tgt.h * .25);
    s.dim.vw = 0; s.dim.vh = 0;
    S08.renderMound(api);
    api.timeout(() => { S08.kick(api); api.sfx('plop'); }, 420);
  },

  leave(api) {
    const s = api.state;
    api.clearTimers();
    s.springOn = false;
    s.resetting = false;
    if (s.anim) { const to = s.anim.to; s.anim = null; s.ui.range.step = '0.05'; this.apply(api, to, { silent: true }); }
    if (s.constShown) this.finishConst(api);
  },

  /* ----- единая точка изменения k: мышь, «Далее», аварийный сброс ----- */
  apply(api, kIn, { silent = false } = {}) {
    const s = api.state, ui = s.ui;
    const k = clamp(kIn, 1, 2);
    s.k = k;
    if (Math.abs(parseFloat(ui.range.value) - k) > 1e-9) ui.range.value = String(k);
    ui.range.style.setProperty('--fill', `calc(28px + (100% - 56px) * ${(k - 1).toFixed(4)})`);
    ui.kval.textContent = S08.trim(k);
    ui.chips.forEach((c, i) => { c.textContent = S08.trim(Math.pow(k, i)); });

    // показания: ровно по рекуррентной формуле
    const ps = S08.series(k, S08.CYCLES);
    const v = ps[S08.CYCLES];
    const f = S08.portions(v);
    ui.num.textContent = f.num; ui.unit.textContent = f.unit;
    const lo = Math.log10(.5), hi = Math.log10(1000);
    ui.bars.forEach((b, i) => {
      b.style.height = `${(clamp((Math.log10(ps[i]) - lo) / (hi - lo), 0, 1) * 100).toFixed(1)}%`;
      b.classList.toggle('is-hot', ps[i] >= 100);
    });

    // сходится ровно при k = 1; при любом k > 1 — расходится
    const conv = k <= 1 + 1e-9;
    if (conv !== s.conv) {
      const was = s.conv;
      s.conv = conv;
      api.el.classList.toggle('is-conv', conv);
      ui.vtext.textContent = conv ? 'сходится к 10/7' : 'расходится';
      ui.vmath.innerHTML = conv
        ? '<var>P</var><sub><var>n</var></sub> <span class="s08-arr">→</span> 1/(1 − 0,3)'
        : '<var>P</var><sub><var>n</var></sub> ≈ <var>k</var><sup><var>n</var></sup>/(<var>k</var> − 0,3) <span class="s08-arr">→</span> ∞';
      if (!silent && was !== null) {
        FX.replay(ui.vchip, 'is-pop');
        if (conv) {
          api.sfx('ding');
          const c = FX.centerOf(ui.vchip);
          FX.rice({ x: c.x + c.w / 2, y: c.y, count: 26, power: 10, angle: -Math.PI / 4, spread: 1.8 });
        }
        else api.sfx('boing');
      }
    }

    // критический уровень: ровно k = 2
    const crit = k >= 2 - 1e-9;
    if (crit !== s.crit) {
      s.crit = crit;
      api.el.classList.toggle('is-critical', crit);
      if (!silent && crit) {
        api.sfx('alarm');
        FX.shakeStage();
        api.timeout(() => FX.shakeStage(), 520);
        api.timeout(() => FX.shakeStage(), 1040);
        FX.plov({ x: S08.RX, y: 560, count: 170, power: 36, spread: 2.2 });
        api.$$('.s08-gma-art .art').forEach((g) => Art.mood(g, 'shock'));
      } else if (!silent && !crit && !s.resetting) {
        api.sfx('swoosh');
      }
      if (!crit && s.constShown && !s.resetting) api.$$('.s08-gma-art .art').forEach((g) => Art.mood(g, 'proud'));
    }
    api.el.style.setProperty('--heat', clamp((k - 1.55) / .45, 0, 1).toFixed(3));

    // «трещотка» шагов 0,05 + плов сыплется, когда k растёт
    const tick = Math.round(k * 20);
    if (!silent && tick !== s.lastTick) {
      api.sfx('tick');
      if (tick > s.lastTick && k > 1.02) {
        const top = Math.max(150, S08.BASE_Y - s.dim.h * .85);
        FX.plov({ x: S08.RX + (Math.random() - .5) * 120, y: top, count: 8 + Math.round((k - 1) * 22), power: 11 + (k - 1) * 10, spread: 1.6 });
      }
    }
    s.lastTick = tick;

    // авто-шаг: если ползунок дошёл до цели текущего шага — шаг выполнен
    if (!s.anim && !s.constShown && s.step < 3 && Math.abs(k - S08.TARGETS[s.step]) < 1e-6) {
      s.step++;
      api.updateSteps();
    }

    s.tgt = S08.moundSize(k);
    if (s.nodes) S08.kick(api);
  },

  userSet(api, raw) {
    const s = api.state;
    if (s.anim) { s.anim = null; s.ui.range.step = '0.05'; }
    this.apply(api, Math.round(raw * 20) / 20);
  },

  animateTo(api, to, ms = 1000, easing = ease.inOutCubic) {
    const s = api.state, r = s.ui.range;
    const from = s.k;
    const token = { to };
    s.anim = token;
    r.step = 'any';
    const t0 = performance.now();
    const loop = (now) => {
      if (s.anim !== token) return;
      const t = clamp((now - t0) / ms, 0, 1);
      if (t < 1) { this.apply(api, lerp(from, to, easing(t))); api.raf(loop); return; }
      s.anim = null;
      r.step = '0.05';
      this.apply(api, to);
      FX.replay(s.ui.kval, 'is-bump');
    };
    api.raf(loop);
  },

  emergency(api) {
    const s = api.state;
    const first = !s.constShown;
    s.constShown = true;
    s.step = 3;
    api.updateSteps();
    api.sfx('whoosh');
    s.resetting = true;
    api.timeout(() => { s.resetting = false; }, 1200);
    this.animateTo(api, 1.5, 1100, ease.inOutCubic);
    const arts = api.$$('.s08-gma-art .art');
    if (!first) { api.timeout(() => api.sfx('boing'), 900); return; }
    api.el.classList.add('is-const');
    arts.forEach((g) => Art.mood(g, 'kind'));
    Art.mood(arts[0], 'happy');
    api.timeout(() => api.sfx('pop'), 320);
    api.timeout(() => api.sfx('pop'), 580);
    api.timeout(() => {
      const st = api.$('.s08-stamp');
      st.classList.add('is-slam');
      api.$('.s08-const').classList.add('is-on');
      api.sfx('stamp');
      FX.at(st, 'rice', { count: 40, power: 14 });
    }, 1150);
    api.timeout(() => {
      api.sfx('tada');
      arts.forEach((g) => Art.mood(g, 'proud'));
      FX.confetti({ x: S08.RX, count: 140 });
    }, 1500);
    api.updateSteps();
  },

  // итоговое состояние «константы» (если ушли со слайда посреди анимации)
  finishConst(api) {
    api.el.classList.add('is-const');
    api.$('.s08-stamp').classList.add('is-slam');
    api.$('.s08-const').classList.add('is-on');
    api.$$('.s08-gma-art .art').forEach((g) => Art.mood(g, 'proud'));
  },

  next(api) {
    const s = api.state;
    if (s.constShown) return false;
    if (s.step < 3) {
      const to = S08.TARGETS[s.step];
      const ms = [1000, 900, 1300][s.step];
      s.step++;
      api.updateSteps();
      this.animateTo(api, to, ms);
      return true;
    }
    this.emergency(api);
    return true;
  },

  progress(api) {
    const s = api.state;
    return { done: Math.min(s.step, 3) + (s.constShown ? 1 : 0), total: 4 };
  },
});
