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
const S03_GRAN = ['Oling, oling!<small>«Берите, берите!»</small>', 'Вы же ничего не&nbsp;ели!', 'Диета?!'];
const S03_GUEST_MOOD = ['surprised', 'panic', 'shock'];

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
    api.state.n = 0;
    api.state.final = false;
    api.state.busy = false;
    // после клика снимаем фокус, чтобы пробел/Enter не «нажимали» кнопку повторно мимо шагов слайда
    api.$('.s03-nobtn').addEventListener('click', (e) => { e.currentTarget.blur(); this.press(api); });
  },

  leave(api) {
    api.$('.s03-say--guest').classList.remove('is-on');
  },

  press(api) {
    if (api.state.final || api.state.busy) return;
    if (api.state.n >= 3) { this.finale(api); return; }
    this.refuse(api);
  },

  say(api, who, html) {
    const box = api.$(`.s03-say--${who}`);
    const b = box.querySelector('.s03-say-b');
    const was = box.classList.contains('is-on');
    b.innerHTML = `<span class="s03-say-t">${html}</span>`;
    box.classList.add('is-on');
    if (was) FX.replay(box, 'is-swap');
  },

  refuse(api) {
    if (api.state.busy) return;
    api.state.busy = true;
    const n = ++api.state.n;
    // после третьего отказа даём казану приземлиться, прежде чем принять следующее нажатие
    api.timeout(() => { api.state.busy = false; }, n === 3 ? 1900 : 650);
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
    if (api.state.hideT) clearTimeout(api.state.hideT);
    api.state.hideT = api.timeout(() => api.$('.s03-say--guest').classList.remove('is-on'), n === 3 ? 2600 : 2000);

    const gran = api.$('.s03-grandma');
    const granSvg = gran.querySelector('svg');
    const plateBox = api.$('.s03-plate');
    const plateSvg = plateBox.querySelector('svg');
    const row = api.$(`.s03-row[data-n="${n}"]`);

    if (n === 1) {
      api.timeout(() => {
        Art.mood(granSvg, 'happy');
        FX.replay(gran, 'is-serve');
        this.say(api, 'gran', S03_GRAN[0]);
        api.sfx('swoosh');
        const c = FX.centerOf(granSvg.querySelector('.held'));
        FX.plov({ x: c.x + 30, y: c.y - 40, angle: -Math.PI / 2 + .62, spread: .5, power: 17, count: 60, life: 70 });
      }, 280);
      api.timeout(() => {
        Art.setAmount(plateSvg, S03_PLATE[1], 700);
        FX.replay(plateBox, 'is-jelly');
        api.sfx('plop');
        row.classList.add('is-on');
        Art.mood(guestSvg, S03_GUEST_MOOD[0]);
      }, 900);
    } else if (n === 2) {
      api.timeout(() => {
        Art.mood(granSvg, 'determined');
        FX.replay(gran, 'is-jelly');
        this.say(api, 'gran', S03_GRAN[1]);
        api.sfx('pop');
      }, 280);
      api.timeout(() => {
        Art.setAmount(plateSvg, S03_PLATE[2], 950, ease.outElastic);
        FX.replay(plateBox, 'is-jelly');
        api.sfx('boing');
        const c = FX.centerOf(plateSvg.querySelector('.mound'));
        FX.plov({ x: c.x, y: c.y - 40, count: 50, power: 15 });
        row.classList.add('is-on');
        Art.mood(guestSvg, S03_GUEST_MOOD[1]);
      }, 650);
    } else {
      api.timeout(() => {
        Art.mood(granSvg, 'shock');
        FX.replay(gran, 'is-jelly');
        this.say(api, 'gran', S03_GRAN[2]);
        api.sfx('boing');
      }, 280);
      const kz = api.$('.s03-kazan');
      api.timeout(() => {
        api.sfx('whoosh');
        kz.classList.remove('is-set');
        FX.replay(kz, 'is-in');
      }, 700);
      api.timeout(() => {
        // приземление: удар, тряска, рис во все стороны
        FX.shakeStage();
        api.sfx('stamp');
        const c = FX.centerOf(kz.querySelector('.mound'));
        FX.plov({ x: c.x, y: c.y - 30, count: 110, power: 22 });
        api.$$('.s03-itemswrap > div').forEach((d, i) => api.timeout(() => FX.replay(d, 'is-hop'), i * 60));
        FX.replay(api.$('.s03-thud'), 'is-on');
        Art.mood(guestSvg, S03_GUEST_MOOD[2]);
        FX.replay(guestBox, 'is-jump');
      }, 1320);
      api.timeout(() => {
        Art.mood(granSvg, 'proud');
        row.classList.add('is-on');
        api.sfx('alarm');
      }, 1750);
      api.timeout(() => this.surrender(api), 2500);
      api.timeout(() => { kz.classList.add('is-set'); kz.classList.remove('is-in'); }, 2600);
    }
    api.updateSteps();
  },

  // кнопка «НЕТ, СПАСИБО» сдаётся: превращается в белый флаг
  surrender(api) {
    const btn = api.$('.s03-nobtn');
    if (btn.classList.contains('is-flag')) return;
    btn.classList.add('is-flag');
    FX.replay(btn, 'is-flip');
    api.timeout(() => {
      btn.classList.remove('btn--red');
      btn.classList.add('btn--cream');
      btn.innerHTML = '<svg class="s03-flag" viewBox="0 0 46 52" aria-hidden="true"><path class="fl-pole" d="M6,4 V50"/><path class="fl-cloth" d="M8,6 Q22,2 30,8 Q38,14 44,8 L44,30 Q38,36 30,30 Q22,24 8,28 Z"/></svg>СДАЮСЬ';
      btn.setAttribute('aria-label', 'Сдаюсь');
    }, 250);
    api.sfx('swoosh');
  },

  finale(api) {
    if (api.state.final) return;
    api.state.final = true;
    this.surrender(api);
    const btn = api.$('.s03-nobtn');
    FX.replay(btn, 'is-hit');
    api.timeout(() => btn.classList.add('is-gone'), 340);
    api.$('.s03-say--guest').classList.remove('is-on');
    api.el.classList.add('is-final');
    api.sfx('swoosh');
    api.timeout(() => api.sfx('fail'), 250);
    api.timeout(() => {
      api.el.classList.add('is-final-2');
      api.sfx('tada');
      const r = api.$('.s03-researcher svg');
      if (r) api.timeout(() => r.setAttribute('data-point', 'up'), 500);
    }, 1700);
    api.updateSteps();
  },

  next(api) {
    if (api.state.busy) return true; // идёт анимация шага — не перескакиваем
    if (api.state.n < 3) { this.refuse(api); return true; }
    if (!api.state.final) { this.finale(api); return true; }
    return false;
  },

  progress(api) { return { done: api.state.n + (api.state.final ? 1 : 0), total: 4 }; },
});
