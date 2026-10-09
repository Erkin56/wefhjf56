/* Слайд 1. «Начать эксперимент» → три строки методологии по очереди */
Deck.register('01', {
  init(api) {
    api.$('.s01-kazan').innerHTML = Art.kazan({ w: 600 });
    api.$('.s01-researcher').innerHTML = Art.researcher({ mood: 'serious' });
    api.state.started = false;
    api.$('.s01-start').addEventListener('click', () => this.start(api));
  },
  enter(api) {
    // учёный «показывает» на казан указкой
    const r = api.$('.art-researcher');
    api.timeout(() => r.setAttribute('data-point', 'up'), 1300);
  },
  start(api) {
    if (api.state.started) return;
    api.state.started = true;
    api.el.classList.add('is-started');
    api.sfx('tada');
    const k = api.$('.s01-kazan');
    FX.replay(k, 'is-bounce'); // анимируем вложенный .art, а не обёртку с data-in
    FX.at(k, 'plov', { count: 90, power: 22, y: FX.centerOf(k).y - 120 });
    const lines = api.$$('.s01-line');
    const r = api.$('.art-researcher');
    api.timeout(() => { lines[0].classList.add('is-shown'); api.sfx('pop'); }, 450);
    api.timeout(() => { lines[1].classList.add('is-shown'); api.sfx('pop'); }, 1500);
    api.timeout(() => {
      lines[2].classList.add('is-shown'); api.sfx('boing');
      Art.mood(r, 'proud');
      api.$('.s01-me').classList.add('is-shown');
    }, 2700);
    api.updateSteps();
  },
  next(api) {
    if (!api.state.started) { this.start(api); return true; }
    return false;
  },
  progress(api) { return { done: api.state.started ? 1 : 0, total: 1 }; },
});
