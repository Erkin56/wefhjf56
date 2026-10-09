/* Слайд 9. Мини-игра «Попробуй сбежать».
   Три отговорки (кнопки А/Б/В, клавиши 1/2/3): гость идёт к двери, бабушка отвечает, на столе появляется
   новый «аргумент» (чай, будильник с ещё одной тарелкой, плов прямо на диссертации), гость довольный
   возвращается, печать «Попытка не удалась» + грустный тромбон, индикатор вероятности побега падает.
   «Далее»: А → Б → В (какие остались) → итог «0%» и утешительный приз → следующий слайд.
   Никакого принуждения: бабушка только предлагает, гость каждый раз сам радостно возвращается. */
const S09 = (() => {
  const INK = '#1b1814';
  const REPLIES = [
    'Значит, тебе ещё и&nbsp;чай нужен!',
    'Вот и&nbsp;поешь, чтобы завтра силы были!',
    'Сначала поешь нормально. Потом занимайся своей наукой!',
  ];
  const GMA_MOOD = ['happy', 'proud', 'worried'];
  const ODDS = [100, 60, 25, 5];   // шуточная «вероятность побега» после 0, 1, 2, 3 попыток; итог — 0
  const FULL = [0, .3, .6, .9];    // сытость гостя
  const GMA_PLATE = [1, 1.35, 1.7, 2.05];
  const ROT = [-7, -5, -8];
  const WALK = 300;                // сколько пикселей до двери
  const STAMP_AT = 1400;           // когда в попытке падает печать (мс)

  /* ---------- короткие звуки ----------
     В core нет укороченных вариантов «fail» (≈1,9 с) и «alarm» (≈1,4 с), а попытка длится 1,5 с,
     поэтому здесь — свой маленький синтезатор с тем же тембром. Уважает выключенный звук (M). */
  const Snd = (() => {
    let ctx = null, out = null;
    function ac() {
      if (window.Sfx && Sfx.muted) return null;
      try {
        if (!ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          ctx = new AC();
          out = ctx.createGain(); out.gain.value = .55; out.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
      } catch (e) { return null; }
    }
    function tone(c, { type = 'sawtooth', f0, f1 = null, t = 0, dur = .2, vol = .14 }) {
      const now = c.currentTime + t;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, now);
      if (f1) o.frequency.linearRampToValueAtTime(f1, now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + .005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g); g.connect(out);
      o.start(now); o.stop(now + dur + .05);
    }
    const safe = (fn) => () => { try { const c = ac(); if (c) fn(c); } catch (e) { /* звук не критичен */ } };
    return {
      // грустный тромбон: 3 × 0,18 с + 0,4 с ≈ 0,95 с
      fail: safe((c) => {
        [392, 370, 349.2].forEach((f, i) => tone(c, { f0: f, t: i * .18, dur: .17 }));
        tone(c, { f0: 329.6, f1: 309.8, t: .54, dur: .42 });
      }),
      // будильник: два «дзынь-дзынь» ≈ 0,7 с
      ring: safe((c) => {
        for (let i = 0; i < 2; i++) {
          tone(c, { type: 'square', f0: 880, t: i * .36, dur: .17, vol: .09 });
          tone(c, { type: 'square', f0: 660, t: i * .36 + .18, dur: .17, vol: .09 });
        }
      }),
    };
  })();

  /* ---------- рисунки ---------- */
  function star(cx, cy, R, r, n = 8) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
      d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  }

  // резная деревянная дверь (как в Хиве) с табличкой «ВЫХОД»; за дверью — вечер, луна и звёзды
  function door() {
    let stars = '';
    [[58, 140, 3], [190, 128, 2.5], [150, 206, 2], [74, 250, 2.2], [196, 300, 2.6], [110, 330, 1.8], [168, 400, 2]].forEach(([x, y, r]) => {
      stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f5ebd5"/>`;
    });
    return `<svg class="art s09-door-svg" viewBox="0 0 260 540">
      <defs>
        <linearGradient id="s09-night" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0d1a3a"/><stop offset="1" stop-color="#24427e"/></linearGradient>
        <linearGradient id="s09-spillg" x1="0" x2="1"><stop offset="0" stop-color="#52b6ff" stop-opacity=".35"/><stop offset="1" stop-color="#52b6ff" stop-opacity="0"/></linearGradient>
      </defs>
      <g class="s09-exit">
        <rect class="s09-exit-glow" x="26" y="-6" width="208" height="72" rx="16" fill="#3ddc84" filter="url(#f-soft)"/>
        <rect x="34" y="0" width="192" height="60" rx="10" fill="#1e9e57" stroke="${INK}" stroke-width="5"/>
        <rect x="43" y="9" width="174" height="42" rx="6" fill="none" stroke="#bff3d2" stroke-width="2.5" opacity=".6"/>
        <text class="s09-exit-t" x="110" y="41" text-anchor="middle">ВЫХОД</text>
        <path d="M176,30 H206 M195,19 L207,30 L195,41" stroke="#f5ebd5" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M80,60 V78 M180,60 V78" stroke="${INK}" stroke-width="4"/>
      </g>
      <path class="s09-spill" d="M28,540 L232,540 L330,600 L-60,600 Z" fill="url(#s09-spillg)"/>
      <rect x="8" y="78" width="244" height="462" rx="6" fill="#4a2e1a" stroke="${INK}" stroke-width="5"/>
      <path d="M18,88 H242" stroke="#6b4426" stroke-width="5"/>
      <rect x="28" y="98" width="204" height="442" fill="url(#s09-night)" stroke="${INK}" stroke-width="4"/>
      ${stars}
      <path d="M186,168 a26,26 0 1 1 -22,-40 a20,20 0 1 0 22,40 Z" fill="#f6bb2a" stroke="${INK}" stroke-width="3"/>
      <g class="s09-leaf">
        <rect x="28" y="98" width="204" height="442" fill="#8a5530" stroke="${INK}" stroke-width="5"/>
        <rect x="48" y="120" width="164" height="182" rx="12" fill="#734222" stroke="${INK}" stroke-width="4"/>
        <rect x="48" y="322" width="164" height="196" rx="12" fill="#734222" stroke="${INK}" stroke-width="4"/>
        <rect x="62" y="134" width="136" height="154" rx="8" fill="none" stroke="#c98a4a" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
        <rect x="62" y="336" width="136" height="168" rx="8" fill="none" stroke="#c98a4a" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
        <path d="${star(130, 211, 46, 24)}" fill="#a86a38" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="${star(130, 211, 20, 11)}" fill="#f6bb2a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${star(130, 420, 52, 27)}" fill="#a86a38" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="${star(130, 420, 22, 12)}" fill="#f6bb2a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="196" y="300" width="16" height="44" rx="8" fill="#cf9214" stroke="${INK}" stroke-width="4"/>
        <circle cx="204" cy="314" r="9" fill="#f6bb2a" stroke="${INK}" stroke-width="4"/>
      </g>
    </svg>`;
  }

  // ковёр под столом (вид в перспективе)
  function rug() {
    return `<svg viewBox="0 0 1420 76">
      <path d="M110,0 L1310,0 L1420,70 L0,70 Z" fill="#7d1a0d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M150,10 L1270,10 L1350,60 L70,60 Z" fill="#b32a18" stroke="#f6bb2a" stroke-width="3" stroke-dasharray="14 8" stroke-linejoin="round"/>
      <path d="M260,22 L1160,22 L1210,48 L210,48 Z" fill="none" stroke="#1b1814" stroke-width="3" stroke-opacity=".35"/>
    </svg>`;
  }

  // хонтахта — низкий столик под дастарханом
  function table() {
    let scal = 'M850,96 L850,140';
    for (let x = 850; x > 10; x -= 42) scal += ` Q${x - 21},${156} ${Math.max(10, x - 42)},140`;
    scal += ' L10,96 Z';
    return `<svg class="art s09-table-svg" viewBox="0 0 860 214">
      <ellipse cx="430" cy="200" rx="430" ry="16" fill="rgba(0,0,0,.4)" filter="url(#f-soft)"/>
      <path d="M70,130 L60,200 L96,200 L104,130 Z M756,130 L764,200 L800,200 L790,130 Z" fill="#5a3418" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M40,20 L820,20 L850,96 L10,96 Z" fill="#f5ebd5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M66,31 L794,31 L816,85 L44,85 Z" fill="none" stroke="#1fa3b4" stroke-width="4" stroke-dasharray="1 13" stroke-linecap="round"/>
      <path d="${scal}" fill="url(#p-atlas)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M10,104 L850,104" stroke="${INK}" stroke-width="4" opacity=".5"/>
    </svg>`;
  }

  // будильник: стрелки на 6:00
  function clock() {
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI / 6) * i, r1 = i % 3 ? 42 : 38, r2 = 47;
      ticks += `<path d="M${(85 + r1 * Math.sin(a)).toFixed(1)},${(106 - r1 * Math.cos(a)).toFixed(1)} L${(85 + r2 * Math.sin(a)).toFixed(1)},${(106 - r2 * Math.cos(a)).toFixed(1)}"/>`;
    }
    return `<svg class="art s09-clock-svg" viewBox="0 0 170 190">
      <g class="s09-ringlines" fill="none" stroke="#f6bb2a" stroke-width="6" stroke-linecap="round">
        <path d="M14,28 L-6,12 M6,52 L-16,48 M156,28 L176,12 M164,52 L186,48 M85,-6 V-22"/>
      </g>
      <path d="M44,170 L28,188 M126,170 L142,188" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <path d="M18,54 A30,30 0 0 1 62,20 Z" fill="#f6bb2a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M152,54 A30,30 0 0 0 108,20 Z" fill="#f6bb2a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M85,38 V18" stroke="${INK}" stroke-width="6"/>
      <circle cx="85" cy="14" r="8" fill="#cf9214" stroke="${INK}" stroke-width="4"/>
      <circle cx="85" cy="106" r="66" fill="#e8432d" stroke="${INK}" stroke-width="5"/>
      <circle cx="85" cy="106" r="52" fill="#f5ebd5" stroke="${INK}" stroke-width="4"/>
      <g stroke="${INK}" stroke-width="4" stroke-linecap="round">${ticks}</g>
      <path d="M85,106 V138" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M85,106 V66" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="85" cy="106" r="6" fill="#e8432d" stroke="${INK}" stroke-width="3"/>
      <path d="M44,74 Q56,60 74,56" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    </svg>`;
  }

  // магистерская диссертация в переплёте (лежит, корешок к зрителю)
  function thesis() {
    return `<svg class="art s09-thesis-svg" viewBox="0 0 300 132">
      <path d="M34,8 L292,8 L266,54 L8,54 Z" fill="#9b2416" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50,16 L274,16 L256,46 L30,46 Z" fill="none" stroke="#f6bb2a" stroke-width="2.5" opacity=".8"/>
      <path d="M266,54 L292,8 L292,82 L266,128 Z" fill="#f5ebd5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M272,66 L288,38 M272,80 L288,52 M272,94 L288,66 M272,108 L288,80" stroke="#a39d90" stroke-width="2.5"/>
      <rect x="8" y="54" width="258" height="74" rx="4" fill="#7d1a0d" stroke="${INK}" stroke-width="5"/>
      <path d="M16,64 H258 M16,118 H258" stroke="#f6bb2a" stroke-width="2.5" opacity=".8"/>
      <text class="s09-thesis-t" x="137" y="100" text-anchor="middle">ДИССЕРТАЦИЯ</text>
    </svg>`;
  }

  // контейнер «плов с собой» с бантом
  function box() {
    const mound = Art.plovMound({ w: 168, h: 66, seed: 12, garlic: false });
    return `<svg class="art s09-box-svg" viewBox="0 0 240 210">
      <defs><clipPath id="s09-boxclip"><path d="M30,84 L210,84 L196,188 Q120,198 44,188 Z"/></clipPath></defs>
      <ellipse cx="120" cy="196" rx="96" ry="10" fill="rgba(0,0,0,.35)"/>
      <path d="M30,84 L210,84 L196,188 Q120,198 44,188 Z" fill="#fbf6ea" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <g clip-path="url(#s09-boxclip)"><g transform="translate(120,190)">${mound}</g></g>
      <path d="M30,84 L210,84 L196,188 Q120,198 44,188 Z" fill="rgba(210,240,250,.28)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M48,98 L58,176" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
      <rect x="20" y="62" width="200" height="28" rx="10" fill="#9fd6e0" stroke="${INK}" stroke-width="5"/>
      <rect x="108" y="62" width="24" height="132" fill="#e8432d" stroke="${INK}" stroke-width="4"/>
      <path d="M120,60 C92,24 60,36 74,60 C84,74 108,68 120,60 Z" fill="#e8432d" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M120,60 C148,24 180,36 166,60 C156,74 132,68 120,60 Z" fill="#e8432d" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M114,62 L96,92 M126,62 L144,90" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <path d="M114,62 L96,92 M126,62 L144,90" stroke="#e8432d" stroke-width="6" stroke-linecap="round"/>
      <circle cx="120" cy="60" r="11" fill="#b32a18" stroke="${INK}" stroke-width="4"/>
    </svg>`;
  }

  /* ---------- шаги и состояние ---------- */
  // запустить последовательность шагов [мс, fn(loud), 'stamp'?]; незавершённую — можно мгновенно «досыпать» через settle
  function play(api, steps) {
    const s = api.state;
    const tok = ++s.tok;
    const q = steps.map(([ms, fn, tag]) => ({ ms, fn, tag, done: false }));
    s.queue = q;
    q.forEach((st) => api.timeout(() => {
      if (s.tok !== tok || st.done) return;
      st.done = true; st.fn(true);
      if (q.every((x) => x.done)) s.queue = null;
    }, st.ms));
  }
  // досыпать незавершённую попытку: всё ставится сразу, печать всё равно «падает» (анимация + звук, если audible)
  function settle(api, audible) {
    const s = api.state;
    if (!s.queue) return false;
    const q = s.queue;
    s.queue = null; s.tok++;
    const stampPending = q.some((st) => !st.done && st.tag === 'stamp');
    q.forEach((st) => { if (!st.done) { st.done = true; st.fn(false); } });
    if (audible && stampPending) api.sfx('stamp');
    return true;
  }
  const busy = (api) => !!api.state.queue;

  function setOdds(api, v) {
    const hud = api.$('.s09-hud');
    api.$('.s09-hud-num').textContent = Fmt.int(v);
    api.$$('.s09-hud-bar i').forEach((seg, i) => seg.classList.toggle('is-off', v <= i * 10 + .001));
    hud.classList.toggle('lvl-mid', v < 50 && v >= 15);
    hud.classList.toggle('lvl-low', v < 15);
    hud.classList.toggle('is-zero', v <= 0);
  }
  function tweenOdds(api, to, ms, loud) {
    const s = api.state;
    const tok = ++s.oddsTok;
    const from = s.odds;
    s.odds = to;
    if (!loud) { setOdds(api, to); return; }
    let last = Math.round(from);
    Tween.num(from, to, ms, (v) => {
      if (s.oddsTok !== tok || !api.el.isConnected) return;
      const r = Math.round(v);
      if (r !== last && r % 4 === 0) api.sfx('tick');
      last = r;
      setOdds(api, v);
    }, ease.outCubic).then(() => { if (s.oddsTok === tok && api.el.isConnected) setOdds(api, to); });
  }

  function say(api, html, loud) {
    const bub = api.$('.s09-bub');
    api.$('.s09-bub-t').innerHTML = html;
    bub.classList.add('is-shown');
    if (loud) FX.replay(bub, 'is-pop');
  }

  function showSum(api, on) {
    const w = api.$('.s09-sumwrap'), b = w.querySelector('button');
    w.classList.toggle('is-shown', on);
    b.classList.toggle('btn--pulse', on);
    b.tabIndex = on ? 0 : -1;
  }

  function guestArt(api) { return api.$('.s09-guest .art-guest'); }
  function gmaArt(api) { return api.$('.s09-gma .art-grandma'); }

  // печать «Попытка не удалась» — прямо на выбранной отговорке (не закрывает «аргументы» бабушки на столе)
  function stampOn(api, i, n, loud) {
    const s = api.state;
    const st = api.$('.s09-stamp'), wrap = api.$('.s09-stampwrap'), opts = api.$('.s09-opts');
    const w = api.$$('.s09-optwrap')[i];
    wrap.style.setProperty('--sx', `${opts.offsetLeft + w.offsetLeft + w.offsetWidth / 2}px`);
    wrap.style.setProperty('--sy', `${opts.offsetTop + w.offsetTop + w.offsetHeight / 2 - 10}px`);
    st.style.setProperty('--rot', `${ROT[n - 1]}deg`);
    st.classList.remove('is-off');
    FX.replay(st, 'is-slam');
    // печать висит, пока звучит тромбон, и уходит; при «перемотке» — не меньше секунды, чтобы её увидели
    const tok = ++s.stampTok;
    api.timeout(() => { if (s.stampTok === tok) st.classList.add('is-off'); }, loud ? 1700 : 1100);
  }

  // одна попытка сбежать
  function attempt(api, i) {
    const s = api.state;
    if (s.final) return false;
    const btn = api.$$('.s09-opt')[i];
    if (s.used.includes(i)) {
      FX.replay(btn, 'is-nope'); api.sfx('tick');
      return false;
    }
    settle(api, true);                     // прошлая попытка (если ещё идёт) мгновенно завершается — с печатью
    s.used.push(i);
    const n = s.used.length;               // номер попытки 1…3
    api.updateSteps();

    const guest = api.$('.s09-guest'), bob = api.$('.s09-guest-bob'), doorEl = api.$('.s09-door');
    const gma = api.$('.s09-gma');

    // мгновенный отклик кнопки — и мышью, и клавишей, и кликером
    api.sfx('click');
    FX.replay(btn, 'is-pressed');
    api.timeout(() => btn.classList.remove('is-pressed'), 160);
    btn.classList.add('is-chosen');

    play(api, [
      [0, (loud) => {
        api.$('.s09-bub').classList.remove('is-shown');
        Art.mood(guestArt(api), 'polite');
        if (loud) { bob.classList.add('is-walking'); api.sfx('whoosh'); }
        guest.style.setProperty('--gx', `${WALK}px`);
      }],
      [260, (loud) => { if (loud) { doorEl.classList.add('is-open'); api.sfx('swoosh'); } }],
      [520, (loud) => {
        bob.classList.remove('is-walking');
        Art.mood(gmaArt(api), GMA_MOOD[i]);
        if (loud) FX.replay(gma, 'is-talk');
        say(api, REPLIES[i], loud);
        if (loud) api.sfx('pop');
        Art.mood(guestArt(api), 'surprised');
        // визуальный «аргумент» бабушки
        if (i === 0) {
          api.$('.s09-teapot').classList.add('is-in');
          if (loud) api.timeout(() => api.sfx('swoosh'), 60);
        } else if (i === 1) {
          const c = api.$('.s09-clock');
          c.classList.add('is-in');
          if (loud) { c.classList.add('is-ringing'); Snd.ring(); api.timeout(() => c.classList.remove('is-ringing'), 720); }
        } else {
          api.$('.s09-thesis').classList.add('is-in');
          if (loud) api.sfx('swoosh');
        }
      }],
      [760, (loud) => {
        if (i === 0) {
          api.$('.s09-piala').classList.add('is-in');
          if (loud) api.sfx('ding');
        } else if (i === 1) {
          api.$('.s09-plate2').classList.add('is-in');
        } else {
          api.$('.s09-plate3').classList.add('is-in');
        }
        Art.setAmount(gmaArt(api), GMA_PLATE[n], loud ? 500 : 1);
      }],
      [900, (loud) => {
        doorEl.classList.remove('is-open');
        Art.mood(guestArt(api), 'happy');
        guestArt(api).style.setProperty('--full', FULL[n]);
        if (loud) bob.classList.add('is-walking');
        guest.style.setProperty('--gx', '0px');
        if (i > 0 && loud) {
          // тарелка приземлилась
          api.sfx('plop');
          const tgt = api.$(i === 1 ? '.s09-plate2' : '.s09-plate3');
          FX.at(tgt, 'plov', { count: 40, power: 12, y: FX.centerOf(tgt).y + 20 });
          if (i === 2) FX.replay(api.$('.s09-thesis'), 'is-squash');
        }
      }],
      [STAMP_AT, (loud) => {
        bob.classList.remove('is-walking');
        if (loud) FX.replay(bob, 'is-happy');
        if (n === 3) Art.mood(guestArt(api), 'full');
        btn.classList.remove('is-chosen', 'is-pressed');
        btn.classList.add('is-used');
        btn.setAttribute('aria-disabled', 'true');
        stampOn(api, i, n, loud);
        if (loud) {
          api.sfx('stamp'); FX.shakeStage(); FX.replay(api.$('.s09-hud'), 'is-hit');
          api.timeout(() => Snd.fail(), 90);
        }
        tweenOdds(api, ODDS[n], 900, loud);
        Art.mood(gmaArt(api), 'kind');
        // после третьей попытки — кнопка «Подвести итог» (для мыши; кликер просто жмёт →)
        if (n === 3) api.timeout(() => { if (!s.final) showSum(api, true); }, loud ? 700 : 0);
      }, 'stamp'],
    ]);
    return true;
  }

  // итог: 0% и утешительный приз
  function finale(api) {
    const s = api.state;
    if (s.final || s.used.length < 3) return false;
    settle(api, true);
    s.final = true;
    s.stampTok++;
    showSum(api, false);
    api.updateSteps();
    play(api, [
      [0, (loud) => {
        showSum(api, false);
        s.stampTok++;
        api.$('.s09-stamp').classList.remove('is-slam', 'is-off');
        api.$('.s09-bub').classList.remove('is-shown');
        api.$('.s09-opts').classList.add('is-gone');
        if (loud) api.sfx('drumroll', .8);
      }],
      [300, (loud) => {
        api.$('.s09-final').classList.add('is-shown');
        tweenOdds(api, 0, 700, loud);
      }],
      [1080, (loud) => {
        const z = api.$('.s09-zero');
        z.classList.add('is-on');
        if (loud) { FX.replay(z, 'is-hit'); FX.replay(api.$('.s09-hud'), 'is-hit'); api.sfx('stamp'); }
        Art.mood(guestArt(api), 'happy');
        guestArt(api).style.setProperty('--full', 1);
      }],
      [1500, (loud) => {
        api.$('.s09-prize').classList.add('is-shown');
        Art.mood(gmaArt(api), 'proud');
        if (loud) {
          api.sfx('tada');
          FX.at(api.$('.s09-box'), 'confetti', { count: 110, power: 20, spread: 2.2 });
          FX.replay(api.$('.s09-guest-bob'), 'is-happy');
        }
      }],
    ]);
    return true;
  }

  return {
    init(api) {
      api.state = Object.assign(api.state, { used: [], final: false, odds: ODDS[0], oddsTok: 0, tok: 0, stampTok: 0, queue: null });
      api.$('.s09-rug').innerHTML = rug();
      api.$('.s09-door').innerHTML = door();
      api.$('.s09-table').innerHTML = table();
      api.$('.s09-guest-bob').innerHTML = Art.guest({ mood: 'polite', full: 0 });
      api.$('.s09-gma').innerHTML = Art.grandma({ variant: 'uz', mood: 'kind', holding: 'plate', amount: GMA_PLATE[0], seed: 9 });
      api.$('.s09-non').innerHTML = Art.non();
      api.$('.s09-plate0').innerHTML = Art.plate({ w: 260, amount: 1.15, seed: 5, headroom: .55 });
      api.$('.s09-teapot .s09-gag').innerHTML = Art.teapot();
      api.$('.s09-piala .s09-gag').innerHTML = Art.piala();
      api.$('.s09-clock-in').innerHTML = clock();
      api.$('.s09-plate2 .s09-gag').innerHTML = Art.plate({ w: 250, amount: 1.25, seed: 8, headroom: .6 });
      api.$('.s09-thesis .s09-gag').innerHTML = thesis();
      api.$('.s09-plate3 .s09-gag').innerHTML = Art.plate({ w: 220, amount: 1.1, seed: 14, headroom: .6 });
      api.$('.s09-box').innerHTML = box();
      setOdds(api, ODDS[0]);
      api.$$('.s09-opt').forEach((b) => b.addEventListener('click', () => {
        attempt(api, +b.dataset.i);
        b.blur();
        api.updateSteps();
      }));
      api.$('.s09-sum').addEventListener('click', (e) => { finale(api); e.currentTarget.blur(); api.updateSteps(); });
    },
    enter(api) {
      const s = api.state;
      // приветствие бабушки, пока никто не пытался уйти
      if (!s.used.length && !s.final) {
        api.timeout(() => {
          if (s.used.length || !api.isActive()) return;
          say(api, '<i>Oling, oling!</i><small>«Берите, берите!»</small>', true);
          FX.replay(api.$('.s09-gma'), 'is-talk');
          api.sfx('pop');
        }, 1100);
      }
    },
    leave(api) {
      // досыпать незавершённый шаг и остановить «бегущие» цифры (иначе после R старый твин допишет в новый DOM)
      settle(api, false);
      api.state.oddsTok++;
      setOdds(api, api.state.odds);
      FX.clear(); // конфетти «утешительного приза» не должно сыпаться на следующий слайд
    },
    next(api) {
      const s = api.state;
      // попытка ещё идёт — нажатие её «перематывает»: печать падает сразу (со звуком), ничего не теряется
      if (busy(api)) { settle(api, true); return true; }
      const free = [0, 1, 2].find((i) => !s.used.includes(i));
      if (free !== undefined) return attempt(api, free);
      if (!s.final) return finale(api);
      return false;
    },
    progress(api) { const s = api.state; return { done: (s.used ? s.used.length : 0) + (s.final ? 1 : 0), total: 4 }; },
    keys: {
      Digit1(api) { attempt(api, 0); },
      Digit2(api) { attempt(api, 1); },
      Digit3(api) { attempt(api, 2); },
    },
  };
})();

Deck.register('09', S09);
