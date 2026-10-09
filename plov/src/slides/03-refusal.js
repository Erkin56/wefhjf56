/* Слайд 3. Эксперимент «Нет, спасибо».
   Кнопка (мышь или «Далее») — три отказа: 1) бабушка добавляет плов; 2) порция растёт;
   3) с неба падает казан (тряска сцены). Затем — финал «Лингвистика бессильна. Нужна математика!». */

// низкий столик-хонтахта с дастарханом (цвета — токенами в CSS)
function s03Table() {
  let band = '', tassels = '';
  for (let x = 24; x < 850; x += 40) band += `<path class="tb-dia" d="M${x},109 l10,-9 l10,9 l-10,9 z"/>`;
  for (let x = 30; x < 840; x += 40) tassels += `<path class="tb-tassel" d="M${x - 7},150 L${x + 7},150 L${x},170 Z"/>`;
  return `<svg viewBox="0 0 860 250" aria-hidden="true">
    <ellipse class="tb-shadow" cx="430" cy="238" rx="420" ry="12"/>
    <path class="tb-leg" d="M70,148 L76,236 L116,236 L122,148 Z"/>
    <path class="tb-leg" d="M738,148 L744,236 L784,236 L790,148 Z"/>
    <path class="tb-top" d="M44,14 L816,14 L856,76 L4,76 Z"/>
    <path class="tb-line" d="M72,26 L788,26 L818,64 L42,64 Z"/>
    <path class="tb-skirt" d="M4,76 L856,76 L850,150 L10,150 Z"/>
    <rect class="tb-band" x="6" y="96" width="848" height="26"/>${band}${tassels}
  </svg>`;
}

const S03_PLATE = [1, 1.7, 2.4];
const S03_GUEST = ['Нет, спасибо!', 'Нет-нет, правда, спасибо!', 'Спасибо, я на&nbsp;диете!'];
const S03_GRAN = ['Oling, oling!<small>«Берите, берите!»</small>', 'Вы же ничего не&nbsp;ели!', 'Диета?!<small>Тогда только<br>маленький казанчик.</small>'];
const S03_CLIMAX = 'Вам нужно<br>подкрепиться!'; // бабушка сама произносит кульминацию, когда казан уже стоит
const S03_GRAN_MOOD = ['happy', 'determined', 'proud'];
const S03_GUEST_MOOD = ['surprised', 'panic', 'shock'];
// сколько длится шаг; нажатие в это время не теряется, а ставится в очередь
const S03_LOCK = [650, 650, 2200];
// классы разовых CSS-анимаций: на скрытом слайде они ставятся на паузу и «доигрывали» бы при возвращении
const S03_TRANSIENT = [
  ['.s03-thud', 'is-on'], ['.s03-guest', 'is-jump is-recoil'], ['.s03-itemswrap > div', 'is-hop'],
  ['.s03-plate', 'is-jelly'], ['.s03-grandma', 'is-serve is-jelly'], ['.s03-nobtn', 'is-hit is-flip'],
  ['.s03-count', 'is-bump'], ['.s03-say', 'is-swap'],
];

// горка плова на лягане: своя анимация через api.raf — её останавливает api.clearTimers() (уход со слайда, R, перемотка)
function s03Amount(api, svg, amount, ms = 0, easing = ease.outBack) {
  const g = svg && svg.querySelector('.mound');
  if (!g) return;
  const from = parseFloat(svg.dataset.amount || '1');
  svg.dataset.amount = amount;
  g.style.display = '';
  const tok = svg._s03tok = (svg._s03tok || 0) + 1; // пишет только самая свежая анимация
  const put = (v) => { const s = Art.amountScale(Math.max(0, v)); g.setAttribute('transform', `scale(${s.x.toFixed(4)},${s.y.toFixed(4)})`); };
  if (!ms) { put(amount); return; }
  const t0 = performance.now();
  const step = (now) => {
    if (svg._s03tok !== tok) return;
    const t = clamp((now - t0) / ms, 0, 1);
    put(lerp(from, amount, easing(t)));
    if (t < 1) api.raf(step);
  };
  api.raf(step);
}

Deck.register('03', {
  init(api) {
    api.$('.s03-table').innerHTML = s03Table();
    api.$('.s03-guest').innerHTML = Art.guest({ mood: 'polite' });
    api.$('.s03-grandma').innerHTML = Art.grandma({ variant: 'uz', mood: 'kind', holding: 'plate', amount: 1, seed: 9 });
    api.$('.s03-plate').innerHTML = Art.plate({ w: 300, amount: S03_PLATE[0], seed: 6, headroom: 1 });
    api.$('.s03-kazan').innerHTML = Art.kazan({ w: 600, steam: true, fire: false, amount: 1.25, seed: 8 });
    api.$('.s03-teapot').innerHTML = Art.teapot();
    api.$('.s03-non').innerHTML = Art.non();
    api.$('.s03-piala').innerHTML = Art.piala();
    api.$('.s03-researcher').innerHTML = Art.researcher({ mood: 'proud' });
    // клавиша R восстанавливает HTML слайда, но не классы самой <section> — снимаем их здесь
    api.el.classList.remove('is-final', 'is-final-2');
    Object.assign(api.state, { n: 0, final: false, final2: false, busy: false, queued: false, landed: false });
    // после клика снимаем фокус, чтобы пробел/Enter не «нажимали» кнопку повторно мимо шагов слайда
    api.$('.s03-nobtn').addEventListener('click', (e) => { e.currentTarget.blur(); this.step(api); api.updateSteps(); });
  },

  // уход со слайда: досматриваем текущий шаг мгновенно и молча, чтобы ничего не «стреляло» на соседнем слайде
  leave(api) {
    this.settle(api);
    api.$('.s03-say--guest').classList.remove('is-on');
    S03_TRANSIENT.forEach(([sel, cls]) => api.$$(sel).forEach((el) => el.classList.remove(...cls.split(' '))));
    api.$$('.s03-row').forEach((r) => r.classList.add('is-static'));
    FX.clear(); // рис этого слайда не сыплется на следующий
  },

  /* Одно «нажатие» — и мышью, и клавишей. Во время анимации шага нажатие ставится в очередь
     и выполнится, как только шаг доиграет; второе нетерпеливое нажатие мгновенно досматривает шаг
     (см. hurry). Так ни одно нажатие не теряется. */
  step(api) {
    const st = api.state;
    if (st.busy) {
      if (!st.queued) {
        st.queued = true;
        const btn = api.$('.s03-nobtn');
        if (!btn.classList.contains('is-gone')) FX.replay(btn, 'is-hit'); // кнопка отзывается сразу
        return true;
      }
      return this.hurry(api);
    }
    if (st.n < 3) { this.refuse(api); return true; }
    if (!st.final) { this.finale(api); return true; }
    if (!st.final2) { this.finish(api); return true; } // панчлайн «Нужна математика!» — не проскакиваем
    return false;
  },

  // второе нажатие во время анимации: шаг доигрывается мгновенно. Кульминацию не теряем:
  // если казан ещё в полёте — он сразу приземляется с «БУМ!», а отложенный шаг выполнится чуть позже.
  hurry(api) {
    const st = api.state;
    const needLand = st.n >= 3 && !st.landed && !st.final;
    this.settle(api);
    if (needLand) {
      this.land(api);
      st.busy = true;
      st.queued = true;
      api.timeout(() => this.unlock(api), 700);
      return true;
    }
    return this.step(api);
  },

  unlock(api) {
    const st = api.state;
    st.busy = false;
    if (st.queued) { st.queued = false; this.step(api); api.updateSteps(); }
  },

  say(api, who, html, quiet = false) {
    const box = api.$(`.s03-say--${who}`);
    const b = box.querySelector('.s03-say-b');
    const was = box.classList.contains('is-on');
    b.innerHTML = `<span class="s03-say-t">${html}</span>`;
    box.classList.add('is-on');
    if (was && !quiet) FX.replay(box, 'is-swap');
  },

  refuse(api) {
    const st = api.state;
    st.busy = true;
    const n = ++st.n;
    api.timeout(() => this.unlock(api), S03_LOCK[n - 1]);
    const btn = api.$('.s03-nobtn');
    btn.classList.remove('btn--pulse');
    FX.replay(btn, 'is-hit');
    api.sfx('click');

    // счётчик
    const cnt = api.$('.s03-count');
    cnt.textContent = String(n);
    FX.replay(cnt, 'is-bump');

    // гость отказывается
    const guestBox = api.$('.s03-guest');
    const guestSvg = guestBox.querySelector('svg');
    this.say(api, 'guest', S03_GUEST[n - 1]);
    FX.replay(guestBox, 'is-recoil');
    if (st.hideT) clearTimeout(st.hideT);
    st.hideT = api.timeout(() => api.$('.s03-say--guest').classList.remove('is-on'), n === 3 ? 2600 : 2000);

    const gran = api.$('.s03-grandma');
    const granSvg = gran.querySelector('svg');
    const plateBox = api.$('.s03-plate');
    const plateSvg = plateBox.querySelector('svg');
    const row = api.$(`.s03-row[data-n="${n}"]`);

    if (n === 1) {
      api.timeout(() => {
        Art.mood(granSvg, S03_GRAN_MOOD[0]);
        FX.replay(gran, 'is-serve');
        this.say(api, 'gran', S03_GRAN[0]);
        api.sfx('swoosh');
        const c = FX.centerOf(granSvg.querySelector('.held'));
        FX.plov({ x: c.x + 30, y: c.y - 40, angle: -Math.PI / 2 + .62, spread: .5, power: 17, count: 60, life: 70 });
      }, 280);
      api.timeout(() => {
        s03Amount(api, plateSvg, S03_PLATE[1], 700);
        FX.replay(plateBox, 'is-jelly');
        api.sfx('plop');
        row.classList.add('is-on');
        Art.mood(guestSvg, S03_GUEST_MOOD[0]);
      }, 900);
    } else if (n === 2) {
      api.timeout(() => {
        Art.mood(granSvg, S03_GRAN_MOOD[1]);
        FX.replay(gran, 'is-jelly');
        this.say(api, 'gran', S03_GRAN[1]);
        api.sfx('pop');
      }, 280);
      api.timeout(() => {
        s03Amount(api, plateSvg, S03_PLATE[2], 950, ease.outElastic);
        FX.replay(plateBox, 'is-jelly');
        api.sfx('boing');
        const c = FX.centerOf(plateSvg.querySelector('.mound'));
        FX.plov({ x: c.x, y: c.y - 40, count: 50, power: 15 });
        row.classList.add('is-on');
        Art.mood(guestSvg, S03_GUEST_MOOD[1]);
      }, 650);
    } else {
      // «Диета?! Тогда только маленький казанчик.» — и с неба падает огромный казан
      api.timeout(() => {
        Art.mood(granSvg, 'shock');
        FX.replay(gran, 'is-jelly');
        this.say(api, 'gran', S03_GRAN[2]);
        api.sfx('boing');
      }, 260);
      const kz = api.$('.s03-kazan');
      st.landed = false;
      api.timeout(() => {
        api.sfx('whoosh');
        kz.classList.remove('is-set');
        FX.replay(kz, 'is-in');
      }, 850);
      api.timeout(() => this.land(api), 1470);
      api.timeout(() => {
        Art.mood(granSvg, S03_GRAN_MOOD[2]);
        this.say(api, 'gran', S03_CLIMAX);
        row.classList.add('is-on');
        api.sfx('alarm');
      }, 1650);
      api.timeout(() => this.surrender(api), 2000);
      api.timeout(() => { kz.classList.add('is-set'); kz.classList.remove('is-in'); }, 2150);
    }
    api.updateSteps();
  },

  // приземление казана: удар, тряска, рис во все стороны, гость подпрыгивает
  land(api) {
    api.state.landed = true;
    const kz = api.$('.s03-kazan');
    const guestBox = api.$('.s03-guest');
    FX.shakeStage();
    api.sfx('stamp');
    const c = FX.centerOf(kz.querySelector('.mound'));
    FX.plov({ x: c.x, y: c.y - 30, count: 110, power: 22 });
    api.$$('.s03-itemswrap > div').forEach((d, i) => api.timeout(() => FX.replay(d, 'is-hop'), i * 60));
    FX.replay(api.$('.s03-thud'), 'is-on');
    Art.mood(guestBox.querySelector('svg'), S03_GUEST_MOOD[2]);
    FX.replay(guestBox, 'is-jump');
  },

  // кнопка «НЕТ, СПАСИБО» сдаётся: превращается в белый флаг (quiet — сразу, без анимации и звука)
  surrender(api, quiet = false) {
    const btn = api.$('.s03-nobtn');
    if (btn.querySelector('.s03-flag')) return; // флаг уже поднят
    if (btn.classList.contains('is-flag') && !quiet) return; // анимация уже идёт
    btn.classList.add('is-flag');
    const flag = () => {
      if (btn.querySelector('.s03-flag')) return;
      btn.classList.remove('btn--red', 'btn--pulse');
      btn.classList.add('btn--cream');
      btn.innerHTML = '<svg class="s03-flag" viewBox="0 0 46 52" aria-hidden="true"><path class="fl-pole" d="M6,4 V50"/><path class="fl-cloth" d="M8,6 Q22,2 30,8 Q38,14 44,8 L44,30 Q38,36 30,30 Q22,24 8,28 Z"/></svg>СДАЮСЬ';
      btn.setAttribute('aria-label', 'Сдаюсь');
    };
    if (quiet) { flag(); return; }
    FX.replay(btn, 'is-flip');
    api.timeout(flag, 250);
    api.sfx('swoosh');
  },

  // мгновенно привести сцену к концу текущего шага: останавливает таймеры шага, без звуков
  settle(api) {
    const st = api.state, n = st.n;
    api.clearTimers();
    st.busy = false;
    st.queued = false;
    if (n > 0) {
      api.$$('.s03-row').forEach((r) => { if (+r.dataset.n <= n) r.classList.add('is-on'); });
      s03Amount(api, api.$('.s03-plate svg'), S03_PLATE[Math.min(n, 2)]);
      Art.mood(api.$('.s03-grandma svg'), S03_GRAN_MOOD[n - 1]);
      Art.mood(api.$('.s03-guest svg'), S03_GUEST_MOOD[n - 1]);
      this.say(api, 'gran', n >= 3 ? S03_CLIMAX : S03_GRAN[n - 1], true);
    }
    if (n >= 3) {
      st.landed = true;
      const kz = api.$('.s03-kazan');
      kz.classList.add('is-set');
      kz.classList.remove('is-in');
      this.surrender(api, true);
    }
    if (st.final) {
      api.$('.s03-nobtn').classList.add('is-gone');
      this.finish(api, true);
    }
  },

  finale(api) {
    const st = api.state;
    this.settle(api); // хвосты третьего отказа (строка протокола, флаг, казан) — сразу
    st.final = true;
    const btn = api.$('.s03-nobtn');
    FX.replay(btn, 'is-hit');
    api.timeout(() => btn.classList.add('is-gone'), 340);
    api.$('.s03-say--guest').classList.remove('is-on');
    api.el.classList.add('is-final');
    api.sfx('swoosh');
    api.timeout(() => api.sfx('fail'), 250);
    api.timeout(() => this.finish(api), 900);
    api.updateSteps();
  },

  // вторая строка финала: «Нужна математика!», формулы и Эркинбой с указкой
  finish(api, quiet = false) {
    const st = api.state;
    if (st.final2) return;
    st.final2 = true;
    api.el.classList.add('is-final-2');
    const r = api.$('.s03-researcher svg');
    if (quiet) { if (r) r.setAttribute('data-point', 'up'); return; }
    api.sfx('tada');
    if (r) api.timeout(() => r.setAttribute('data-point', 'up'), 500);
    api.updateSteps();
  },

  next(api) { return this.step(api); },

  progress(api) { return { done: api.state.n + (api.state.final ? 1 : 0), total: 4 }; },
});
