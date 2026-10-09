/* Ядро презентации: навигация, шаги слайдов, заметки, окно докладчика,
   синтезированные звуки (WebAudio, без файлов), частицы-рисинки, утилиты. */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1),
};

/* ---------------- Форматирование чисел по-русски ---------------- */
const Fmt = {
  // 1.4286 → «1,43»; большие числа — с неразрывными пробелами: 616 000
  num(x, digits = 2) {
    if (!isFinite(x)) return '∞';
    const s = Math.abs(x) >= 1e15 ? x.toExponential(2) : x.toFixed(digits);
    let [int, frac] = s.split('.');
    const neg = int.startsWith('-');
    if (neg) int = int.slice(1);
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + int + (frac ? ',' + frac : '');
  },
  int(x) { return Fmt.num(Math.round(x), 0); },
  // склонение: Fmt.plural(5, ['порция','порции','порций']); дробные числа → форма [1] («1,43 порции»)
  plural(n, forms) {
    if (!Number.isInteger(n)) return forms[1];
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  },
  // 1 → «1 порция», 5 → «5 порций», 1.43 → «1,43 порции»
  portions(n, digits = 2) {
    const forms = ['порция', 'порции', 'порций'];
    if (Number.isInteger(n)) return `${Fmt.int(n)} ${Fmt.plural(n, forms)}`;
    return `${Fmt.num(n, digits)} ${forms[1]}`;
  },
  time(sec) {
    const s = Math.max(0, Math.floor(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  },
};

/* ---------------- Звуки (синтез) ---------------- */
const Sfx = (() => {
  let ctx = null, master = null, muted = false;
  try { muted = localStorage.getItem('plov-muted') === '1'; } catch (e) { /* нет хранилища */ }
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = .55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone({ type = 'sine', f0 = 440, f1 = null, t = 0, dur = .2, vol = .4, attack = .005, curve = 'exp' }) {
    const c = ac(); if (!c) return;
    const now = c.currentTime + t;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, now);
    if (f1) (curve === 'exp' ? o.frequency.exponentialRampToValueAtTime(f1, now + dur) : o.frequency.linearRampToValueAtTime(f1, now + dur));
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + dur + .05);
  }
  function noise({ t = 0, dur = .2, vol = .3, freq = 1200, q = .8, type = 'lowpass', f1 = null }) {
    const c = ac(); if (!c) return;
    const now = c.currentTime + t;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter(); filt.type = type; filt.Q.value = q;
    filt.frequency.setValueAtTime(freq, now);
    if (f1) filt.frequency.exponentialRampToValueAtTime(f1, now + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(now); src.stop(now + dur + .02);
  }
  const lib = {
    click: () => tone({ type: 'square', f0: 1800, dur: .03, vol: .08 }),
    pop: () => tone({ type: 'sine', f0: 420, f1: 980, dur: .12, vol: .35 }),
    plop: () => { tone({ type: 'sine', f0: 320, f1: 110, dur: .18, vol: .45 }); noise({ dur: .08, vol: .12, freq: 900 }); },
    boing: () => { tone({ type: 'sine', f0: 180, f1: 520, dur: .09, vol: .35 }); tone({ type: 'triangle', f0: 520, f1: 240, t: .09, dur: .35, vol: .3, curve: 'lin' }); },
    stamp: () => { noise({ dur: .16, vol: .55, freq: 500 }); tone({ type: 'sine', f0: 110, f1: 45, dur: .22, vol: .7 }); },
    ding: () => { tone({ f0: 1318.5, dur: 1.2, vol: .25 }); tone({ f0: 1975.5, dur: .9, vol: .12 }); tone({ f0: 2637, dur: .5, vol: .06 }); },
    whoosh: () => noise({ dur: .45, vol: .22, freq: 300, f1: 3000, type: 'bandpass', q: 1.2 }),
    swoosh: () => noise({ dur: .3, vol: .18, freq: 2500, f1: 400, type: 'bandpass', q: 1.5 }),
    tada: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ type: 'triangle', f0: f, t: i * .09, dur: i === 3 ? .9 : .25, vol: .28 })),
    fail: () => [392, 370, 349.2, 329.6].forEach((f, i) => tone({ type: 'sawtooth', f0: f, f1: i === 3 ? f * .94 : null, t: i * .32, dur: i === 3 ? .9 : .3, vol: .14, curve: 'lin' })),
    alarm: () => { for (let i = 0; i < 4; i++) { tone({ type: 'square', f0: 880, t: i * .36, dur: .17, vol: .09 }); tone({ type: 'square', f0: 660, t: i * .36 + .18, dur: .17, vol: .09 }); } },
    drumroll: (dur = 1.2) => {
      for (let t = 0; t < dur; t += .045) noise({ t, dur: .05, vol: .1 + .2 * (t / dur), freq: 1800 });
      noise({ t: dur, dur: .9, vol: .4, freq: 6000, type: 'highpass', q: .5 });
      tone({ f0: 90, f1: 40, t: dur, dur: .4, vol: .6 });
    },
    coin: () => { tone({ type: 'square', f0: 988, dur: .08, vol: .12 }); tone({ type: 'square', f0: 1319, t: .08, dur: .3, vol: .12 }); },
    gulp: () => { tone({ type: 'sine', f0: 220, f1: 90, dur: .12, vol: .4 }); tone({ type: 'sine', f0: 180, f1: 70, t: .14, dur: .12, vol: .3 }); },
    tick: () => tone({ type: 'sine', f0: 2200, dur: .025, vol: .07 }),
    sparkle: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone({ f0: f, t: i * .05, dur: .25, vol: .08 })),
  };
  return {
    play(name, ...args) { if (muted || !lib[name]) return; try { lib[name](...args); } catch (e) { /* звук не критичен */ } },
    unlock() { try { ac(); } catch (e) { /* */ } },
    toggle() { muted = !muted; try { localStorage.setItem('plov-muted', muted ? '1' : '0'); } catch (e) { /* */ } return !muted; },
    get muted() { return muted; },
    names: Object.keys(lib),
  };
})();

/* ---------------- Частицы: рис, морковь, конфетти ---------------- */
const FX = (() => {
  let cv, cx, parts = [], running = false;
  const COLORS = { rice: ['#fbf1d6', '#f6e6b8', '#fff8e6', '#efd590'], carrot: ['#f08a1f', '#e8771a', '#f6a23c'], confetti: ['#f6bb2a', '#e8432d', '#f5ebd5', '#52b6ff', '#ff8a35'] };
  function init() { cv = $('#fx'); cx = cv.getContext('2d'); }
  function loop() {
    cx.clearRect(0, 0, 1920, 1080);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
      const a = Math.min(1, p.life / 25);
      cx.save(); cx.globalAlpha = a; cx.translate(p.x, p.y); cx.rotate(p.rot);
      cx.fillStyle = p.color;
      if (p.kind === 'rice') { cx.beginPath(); cx.ellipse(0, 0, p.s * 1.9, p.s * .7, 0, 0, Math.PI * 2); cx.fill(); }
      else if (p.kind === 'carrot') { cx.fillRect(-p.s * 2.2, -p.s * .5, p.s * 4.4, p.s); }
      else { cx.fillRect(-p.s, -p.s * .45, p.s * 2, p.s * .9); }
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, 1920, 1080); }
  }
  function spawn(kind, { x = 960, y = 540, count = 60, power = 18, spread = Math.PI * 2, angle = -Math.PI / 2, size = 6, gravity = .55, life = 90 } = {}) {
    if (!cx) init();
    const pal = COLORS[kind] || COLORS.rice;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - .5) * spread;
      const v = power * (.35 + Math.random() * .75);
      parts.push({ kind, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: gravity, drag: .985, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .35, s: size * (.7 + Math.random() * .6), life: life * (.7 + Math.random() * .6), color: pal[(Math.random() * pal.length) | 0] });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  // координаты элемента в системе сцены 1920×1080
  function centerOf(el) {
    const st = $('#stage').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = st.width / 1920;
    return { x: (r.left + r.width / 2 - st.left) / s, y: (r.top + r.height / 2 - st.top) / s, w: r.width / s, h: r.height / s };
  }
  return {
    rice(opts) { spawn('rice', opts); },
    plov(opts = {}) { spawn('rice', { ...opts, count: Math.round((opts.count || 60) * .8) }); spawn('carrot', { ...opts, count: Math.round((opts.count || 60) * .25), size: 5 }); },
    confetti(opts = {}) { spawn('confetti', { count: 160, power: 26, size: 9, gravity: .45, life: 160, y: 1100, angle: -Math.PI / 2, spread: 1.2, ...opts }); },
    at(el, kind = 'plov', opts = {}) { const c = centerOf(el); (kind === 'plov' ? this.plov : kind === 'confetti' ? this.confetti : this.rice).call(this, { x: c.x, y: c.y, ...opts }); },
    shakeStage() { const st = $('#stage'); st.classList.remove('is-shaking'); void st.offsetWidth; st.classList.add('is-shaking'); setTimeout(() => st.classList.remove('is-shaking'), 450); },
    // перезапуск CSS-анимации класса на элементе
    replay(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); },
    centerOf,
    clear() { parts = []; },
  };
})();

/* Плавная анимация числа: Tween.num(from, to, ms, onUpdate, easing) → Promise */
const Tween = {
  num(from, to, ms, onUpdate, easing = ease.outCubic) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      function step(now) {
        const t = clamp((now - t0) / ms, 0, 1);
        onUpdate(lerp(from, to, easing(t)), t);
        if (t < 1) requestAnimationFrame(step); else resolve();
      }
      requestAnimationFrame(step);
    });
  },
};

/* ---------------- Колода ---------------- */
const Deck = (() => {
  const defs = {};
  let slides = [], index = 0, booted = false;
  const scopes = new Map(); // id → {timers:Set, intervals:Set, rafs:Set}
  const initialHtml = new Map();
  const visited = new Set();
  let clock = { started: null, slideStart: performance.now(), paused: false };
  let presenter = null;

  function scopeOf(id) {
    if (!scopes.has(id)) scopes.set(id, { timers: new Set(), intervals: new Set(), rafs: new Set() });
    return scopes.get(id);
  }
  function clearScope(id) {
    const s = scopeOf(id);
    s.timers.forEach(clearTimeout); s.intervals.forEach(clearInterval); s.rafs.forEach(cancelAnimationFrame);
    s.timers.clear(); s.intervals.clear(); s.rafs.clear();
  }
  function makeApi(el, id) {
    const sc = scopeOf(id);
    const api = {
      id, el,
      $: (s) => el.querySelector(s),
      $$: (s) => Array.from(el.querySelectorAll(s)),
      timeout(fn, ms) { const t = setTimeout(() => { sc.timers.delete(t); fn(); }, ms); sc.timers.add(t); return t; },
      interval(fn, ms) { const t = setInterval(fn, ms); sc.intervals.add(t); return t; },
      raf(fn) { const t = requestAnimationFrame((ts) => { sc.rafs.delete(t); fn(ts); }); sc.rafs.add(t); return t; },
      wait(ms) { return new Promise((r) => api.timeout(r, ms)); },
      clearTimers() { clearScope(id); },
      sfx: (n, ...a) => Sfx.play(n, ...a),
      fx: FX,
      isActive: () => slides[index] === el,
      state: {},
      updateSteps: () => renderChrome(),
    };
    return api;
  }

  function register(id, def) { defs[String(id).padStart(2, '0')] = def; }

  function def(el) { return defs[el.dataset.id] || {}; }
  function api(el) { if (!el._api) el._api = makeApi(el, el.dataset.id); return el._api; }

  function callHook(el, hook, ...args) {
    const d = def(el);
    if (typeof d[hook] === 'function') {
      try { return d[hook].call(d, api(el), ...args); } catch (e) { console.error(`[slide ${el.dataset.id}] ${hook}:`, e); }
    }
    return undefined;
  }

  function scale() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    $('#stage').style.setProperty('--scale', s);
    // если снизу есть поле (экран 16:10 или 4:3) — панель управления уезжает туда и не закрывает подвал слайда
    const band = (window.innerHeight - 1080 * s) / 2;
    $('#navbar').style.bottom = band >= 44 ? `${Math.max(0, Math.round((band - 44) / 2))}px` : '';
  }

  function renderChrome() {
    const el = slides[index];
    const n = index + 1, total = slides.length;
    $('#chrome-num').innerHTML = `<b>${String(n).padStart(2, '0')}</b> / ${String(total).padStart(2, '0')}`;
    $('#chrome-section').textContent = el.dataset.section || '';
    $('#nb-num').textContent = `${n} / ${total}`;
    $('#chrome').classList.toggle('is-off', el.dataset.chrome === 'off');
    const p = callHook(el, 'progress');
    const box = $('#chrome-steps');
    box.innerHTML = '';
    if (p && p.total) {
      for (let i = 0; i < p.total; i++) { const d = document.createElement('i'); if (i < p.done) d.className = 'done'; box.appendChild(d); }
    }
    renderNotes();
  }

  function notesHtml(el) { const n = el.querySelector('.notes'); return n ? n.innerHTML : ''; }

  function renderNotes() {
    const el = slides[index];
    $('#np-title').textContent = `${index + 1}. ${el.dataset.title || ''}`;
    $('#np-time').textContent = el.dataset.time || '';
    $('#np-body').innerHTML = notesHtml(el);
    updatePresenter();
  }

  function go(i, opts = {}) {
    i = clamp(i, 0, slides.length - 1);
    if (i === index && booted && !opts.force) return;
    const prevEl = slides[index];
    const nextEl = slides[i];
    if (prevEl && prevEl !== nextEl) {
      callHook(prevEl, 'leave');
      prevEl.classList.remove('is-active');
      prevEl.classList.add('is-leaving');
      setTimeout(() => prevEl.classList.remove('is-leaving'), 700);
    }
    index = i;
    nextEl.classList.add('is-active');
    clock.slideStart = performance.now();
    const first = !visited.has(nextEl.dataset.id);
    visited.add(nextEl.dataset.id);
    callHook(nextEl, 'enter', { first });
    if (history.replaceState) history.replaceState(null, '', `#${i + 1}`);
    renderChrome();
  }

  function startClock() { if (!clock.started) clock.started = performance.now(); }

  // «Далее»: сначала шаги текущего слайда, потом следующий слайд
  function advance() {
    startClock();
    const el = slides[index];
    const consumed = callHook(el, 'next');
    if (consumed) { renderChrome(); return; }
    go(index + 1);
  }
  function back() { go(index - 1); }

  function resetSlide(el = slides[index]) {
    const id = el.dataset.id;
    callHook(el, 'leave');
    clearScope(id);
    FX.clear();
    el.innerHTML = initialHtml.get(id);
    el._api = null;
    callHook(el, 'init');
    el.classList.remove('is-active'); void el.offsetWidth; el.classList.add('is-active');
    callHook(el, 'enter', { first: true, reset: true });
    renderChrome();
  }

  /* ----- окно докладчика ----- */
  function openPresenter() {
    try {
      if (presenter && !presenter.closed) { presenter.focus(); return; }
      presenter = window.open('', 'plov-presenter', 'width=1100,height=760');
      if (!presenter) { toggleNotes(true); return; }
      const d = presenter.document;
      d.open();
      d.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Докладчик — Плов как бесконечный ряд</title>
<style>
body{margin:0;background:#111214;color:#f5ebd5;font-family:Manrope,'Segoe UI',Arial,sans-serif;display:grid;grid-template-rows:auto 1fr auto;height:100vh}
header{display:flex;gap:24px;align-items:center;padding:14px 22px;border-bottom:1px solid #333;background:#18191c}
.big{font-family:'JetBrains Mono',Consolas,monospace;font-size:44px;font-weight:800;color:#f6bb2a}
.big.late{color:#e8432d}.lbl{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a39d90}
.cur{font-size:22px;font-weight:800}.win{font-family:'JetBrains Mono',monospace;color:#a39d90;font-size:18px}
main{padding:18px 26px;overflow:auto;font-size:26px;line-height:1.5}
.pres-notes p{margin:.35em 0}.cue{display:inline-block;background:#f6bb2a;color:#1b1814;font-weight:800;border-radius:6px;padding:0 .4em;margin-right:.3em;font-size:.85em}
.say{color:#fff}.say::before{content:'«';color:#f6bb2a}.say::after{content:'»';color:#f6bb2a}.tip{color:#a39d90;font-style:italic}
footer{display:flex;gap:12px;padding:12px 22px;border-top:1px solid #333;background:#18191c;align-items:center}
button{font:inherit;font-size:20px;font-weight:800;background:#f6bb2a;color:#1b1814;border:0;border-radius:999px;padding:12px 26px;cursor:pointer}
button.alt{background:#2a2c31;color:#f5ebd5}.next{margin-left:auto;color:#a39d90;font-size:18px}
</style></head><body>
<header><div><div class="lbl">Всего</div><div class="big" id="p-total">0:00</div></div>
<div><div class="lbl">На слайде</div><div class="big" id="p-slide">0:00</div></div>
<div style="margin-left:12px"><div class="cur" id="p-cur"></div><div class="win" id="p-win"></div></div></header>
<main><div class="pres-notes" id="p-notes"></div></main>
<footer><button class="alt" id="p-prev">‹ Назад</button><button id="p-next">Далее ›</button><button class="alt" id="p-reset">Перезапуск слайда</button><span class="next" id="p-after"></span></footer>
</body></html>`);
      d.close();
      const send = (act) => window.postMessage({ plov: act }, '*');
      // после клика кнопка теряет фокус, иначе пробел/Enter повторили бы «Перезапуск» или «Назад»
      [['p-next', 'next'], ['p-prev', 'prev'], ['p-reset', 'reset']].forEach(([id, act]) => {
        d.getElementById(id).onclick = (e) => { send(act); e.currentTarget.blur(); };
      });
      presenter.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); startClock(); advance(); return; }
        onKey(e);
      });
      updatePresenter();
    } catch (e) {
      console.warn('Окно докладчика недоступно, показываю заметки на экране', e);
      toggleNotes(true);
    }
  }
  function updatePresenter() {
    if (!presenter || presenter.closed) return;
    try {
      const d = presenter.document, el = slides[index];
      d.getElementById('p-cur').textContent = `${index + 1} / ${slides.length}. ${el.dataset.title || ''}`;
      d.getElementById('p-win').textContent = `План: ${el.dataset.time || ''}`;
      d.getElementById('p-notes').innerHTML = notesHtml(el);
      const nx = slides[index + 1];
      d.getElementById('p-after').textContent = nx ? `Дальше: ${nx.dataset.title || ''}` : 'Это последний слайд';
    } catch (e) { /* окно закрыто */ }
  }
  function planEnd(el) {
    const m = (el.dataset.time || '').match(/(\d+):(\d\d)\s*[–-]\s*(\d+):(\d\d)/);
    return m ? (+m[3]) * 60 + (+m[4]) : null;
  }
  function tickClock() {
    const now = performance.now();
    const total = clock.started ? (now - clock.started) / 1000 : 0;
    const onSlide = (now - clock.slideStart) / 1000;
    const end = planEnd(slides[index]);
    const late = end != null && clock.started && total > end + 3;
    const txt = `${Fmt.time(total)} · слайд ${Fmt.time(onSlide)}`;
    $('#np-clock').textContent = txt;
    const st = $('#stage-timer');
    st.textContent = `${Fmt.time(total)} / 5:00`;
    st.classList.toggle('is-late', !!late);
    if (presenter && !presenter.closed) {
      try {
        const d = presenter.document;
        d.getElementById('p-total').textContent = Fmt.time(total);
        d.getElementById('p-total').classList.toggle('late', total > 300);
        d.getElementById('p-slide').textContent = Fmt.time(onSlide);
        d.getElementById('p-slide').classList.toggle('late', !!late);
      } catch (e) { /* */ }
    }
  }

  function toggleNotes(force) {
    const p = $('#notes-panel');
    p.hidden = typeof force === 'boolean' ? !force : !p.hidden;
  }
  function toggleFullscreen() {
    const d = document;
    try {
      if (!d.fullscreenElement && !d.webkitFullscreenElement) {
        const r = d.documentElement;
        (r.requestFullscreen || r.webkitRequestFullscreen).call(r);
      } else {
        (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      }
    } catch (e) { /* полноэкранный режим недоступен */ }
  }
  function toggleSound() {
    const on = Sfx.toggle();
    $('#nb-sound').classList.toggle('is-off', !on);
    if (on) Sfx.play('pop');
  }

  function onKey(e) {
    if (e.defaultPrevented) return;
    const tag = (e.target && e.target.tagName) || '';
    const isRange = tag === 'INPUT' && e.target.type === 'range';
    if ((tag === 'INPUT' && !isRange) || tag === 'TEXTAREA') return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    Sfx.unlock();
    hideHint();
    const code = e.code || '';
    // слайдовые клавиши (цифры 1–3 и т. п.)
    const el = slides[index];
    const d = def(el);
    const norm = code.replace(/^Numpad(\d)$/, 'Digit$1');
    if (d.keys && typeof d.keys[norm] === 'function') {
      e.preventDefault();
      startClock();
      try { d.keys[norm].call(d, api(el), e); } catch (err) { console.error(err); }
      renderChrome();
      return;
    }
    // ползунок со стрелками влево/вправо оставляем ползунку
    if (isRange && (code === 'ArrowLeft' || code === 'ArrowRight')) return;
    if (!$('#blackout').hidden && code !== 'KeyB' && code !== 'Period') { $('#blackout').hidden = true; e.preventDefault(); return; }
    switch (code) {
      case 'ArrowRight': case 'PageDown': case 'Space': case 'Enter': case 'NumpadEnter':
        if ((code === 'Space' || code === 'Enter') && tag === 'BUTTON') return; // активируем саму кнопку
        e.preventDefault(); advance(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': e.preventDefault(); back(); break;
      case 'ArrowDown': e.preventDefault(); startClock(); go(index + 1); break;
      case 'ArrowUp': e.preventDefault(); go(index - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(slides.length - 1); break;
      case 'KeyF': e.preventDefault(); toggleFullscreen(); break;
      case 'KeyN': e.preventDefault(); toggleNotes(); break;
      case 'KeyP': e.preventDefault(); openPresenter(); break;
      case 'KeyH': case 'Slash': e.preventDefault(); $('#help').hidden = !$('#help').hidden; break;
      case 'Escape': $('#help').hidden = true; break;
      case 'KeyR': e.preventDefault(); resetSlide(); break;
      case 'KeyM': e.preventDefault(); toggleSound(); break;
      case 'KeyT': e.preventDefault(); $('#stage-timer').hidden = !$('#stage-timer').hidden; break;
      case 'KeyB': case 'Period': e.preventDefault(); $('#blackout').hidden = !$('#blackout').hidden; break;
      default: break;
    }
  }

  let hintGone = false;
  function hideHint() { if (!hintGone) { hintGone = true; $('#hint-start').classList.add('is-gone'); } }

  function boot() {
    slides = $$('#stage > .slide').sort((a, b) => a.dataset.id.localeCompare(b.dataset.id));
    slides.forEach((el) => {
      initialHtml.set(el.dataset.id, el.innerHTML);
      el.setAttribute('aria-roledescription', 'слайд');
      el.setAttribute('aria-label', `${el.dataset.id}. ${el.dataset.title || ''}`);
    });
    document.documentElement.style.setProperty('--ornament', `url("data:image/svg+xml,${encodeURIComponent(window.Art ? Art.ornamentTile() : '')}")`);
    if (window.Art) Art.injectDefs();
    slides.forEach((el) => callHook(el, 'init'));
    scale();
    window.addEventListener('resize', scale);
    document.addEventListener('fullscreenchange', scale);
    document.addEventListener('keydown', onKey);
    window.addEventListener('message', (e) => {
      const act = e.data && e.data.plov;
      if (act === 'next') advance(); else if (act === 'prev') back(); else if (act === 'reset') resetSlide();
    });
    // мышь: панель, края экрана
    $('#navbar').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      Sfx.unlock(); hideHint();
      ({ prev: back, next: advance, fullscreen: toggleFullscreen, sound: toggleSound, notes: () => toggleNotes(), presenter: openPresenter, help: () => { $('#help').hidden = !$('#help').hidden; } })[b.dataset.act]();
      b.blur();
    });
    $('#edge-prev').addEventListener('click', () => { Sfx.unlock(); back(); });
    $('#edge-next').addEventListener('click', () => { Sfx.unlock(); advance(); });
    $('#help').addEventListener('click', () => { $('#help').hidden = true; });
    $('#blackout').addEventListener('click', () => { $('#blackout').hidden = true; });
    $('#nb-sound').classList.toggle('is-off', Sfx.muted);
    // свайпы на тач-экранах
    let tx = null;
    $('#viewport').addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    $('#viewport').addEventListener('touchend', (e) => {
      if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 80 && !e.target.closest('button, input')) { dx < 0 ? advance() : back(); }
    });
    // интерфейс появляется при движении мыши
    let uiT;
    document.addEventListener('mousemove', () => { document.body.classList.add('show-ui'); clearTimeout(uiT); uiT = setTimeout(() => document.body.classList.remove('show-ui'), 2200); });
    document.addEventListener('pointerdown', () => { Sfx.unlock(); hideHint(); }, { capture: true });
    // кнопка на слайде после клика мышью теряет фокус: пробел/Enter снова листают, а не жмут её повторно
    // (e.detail === 0 — нажатие с клавиатуры через Tab, фокус оставляем)
    $('#stage').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && e.detail > 0) b.blur(); });
    // ползунок после перетаскивания мышью отпускает фокус: стрелки снова управляют слайдами
    $('#stage').addEventListener('pointerup', (e) => { if (e.target.matches && e.target.matches('input[type="range"]')) setTimeout(() => e.target.blur(), 0); });
    document.addEventListener('fullscreenchange', hideHint);
    // любой клик по кнопке на слайде запускает общий таймер
    $('#stage').addEventListener('click', (e) => { if (e.target.closest('button, input')) startClock(); });
    setTimeout(hideHint, 7000);
    setInterval(tickClock, 250);
    const h = parseInt((location.hash || '').slice(1), 10);
    index = 0;
    booted = false;
    go(isFinite(h) && h >= 1 ? h - 1 : 0, { force: true });
    booted = true;
  }

  return {
    register, boot, go, advance, back, resetSlide, openPresenter, toggleNotes,
    get index() { return index; },
    get slides() { return slides; },
    get current() { return slides[index]; },
    api: (id) => { const el = slides.find((s) => s.dataset.id === String(id).padStart(2, '0')); return el ? api(el) : null; },
    renderChrome,
  };
})();

Object.assign(window, { Deck, Sfx, FX, Fmt, Tween, ease, clamp, lerp, $, $$ });
