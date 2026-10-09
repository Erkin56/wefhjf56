/* Слайд 1. «Начать эксперимент» → три строки методологии по очереди.
   «Далее» во время появления строк сразу показывает их все (ничего не пропускаем),
   следующее «Далее» — переход к слайду 2. */
const S01_LINES = [300, 800, 1400]; // мс: строка 1, строка 2, «НА МНЕ.»

Deck.register('01', {
  init(api) {
    // R восстанавливает только innerHTML: класс секции снимаем сами
    api.el.classList.remove('is-started');
    api.$('.s01-kazan').innerHTML = Art.kazan({ w: 600 });
    api.$('.s01-researcher').innerHTML = Art.researcher({ mood: 'serious' });
    Object.assign(api.state, { started: false, revealed: false, timers: [] });
    api.$('.s01-start').addEventListener('click', (e) => {
      e.currentTarget.blur(); // иначе пробел/Enter «нажимали» бы невидимую кнопку
      this.start(api);
    });
  },
  enter(api) {
    // учёный «показывает» на казан указкой
    const r = api.$('.art-researcher');
    api.timeout(() => r.setAttribute('data-point', 'up'), 1300);
  },
  leave(api) {
    // ушли посреди появления строк — доводим без звуков, чтобы таймеры не играли на слайде 2
    if (api.state.started && !api.state.revealed) this.finish(api, true);
  },
  start(api) {
    const st = api.state;
    if (st.started) return;
    st.started = true;
    api.el.classList.add('is-started');
    api.sfx('tada');
    const k = api.$('.s01-kazan');
    FX.replay(k, 'is-bounce'); // анимируем вложенный .art, а не обёртку с data-in
    FX.at(k, 'plov', { count: 90, power: 22, y: FX.centerOf(k).y - 120 });
    const lines = api.$$('.s01-line');
    st.timers = [
      api.timeout(() => { lines[0].classList.add('is-shown'); api.sfx('pop'); }, S01_LINES[0]),
      api.timeout(() => { lines[1].classList.add('is-shown'); api.sfx('pop'); }, S01_LINES[1]),
      api.timeout(() => { this.finish(api); }, S01_LINES[2]),
    ];
    api.updateSteps();
  },
  // показать всё сразу: строка «На мне.», «это я», гордый исследователь
  finish(api, silent = false) {
    const st = api.state;
    if (st.revealed) return;
    st.timers.forEach(clearTimeout);
    st.timers = [];
    st.revealed = true;
    api.$$('.s01-line').forEach((l) => l.classList.add('is-shown'));
    const r = api.$('.art-researcher');
    r.setAttribute('data-point', 'up');
    Art.mood(r, 'proud');
    api.$('.s01-me').classList.add('is-shown');
    if (!silent) api.sfx('boing');
  },
  next(api) {
    const st = api.state;
    if (!st.started) { this.start(api); return true; }
    if (!st.revealed) { this.finish(api); return true; }
    return false;
  },
  progress(api) { return { done: api.state.started ? 1 : 0, total: 1 }; },
});
