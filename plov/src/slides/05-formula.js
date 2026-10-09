/* Слайд 5. Формула собирается под барабанную дробь; три члена объясняются карточками; затем мораль */
const ORDER = ['pn', 'coef', 'one'];
const SOUND = { pn: 'pop', coef: 'coin', one: 'plop' };

// позиция элемента в координатах слайда без учёта CSS-трансформаций
function pos(el, root) {
  let x = 0, y = 0, n = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

Deck.register('05', {
  init(api) {
    api.state.shown = new Set();
    api.state.moral = false;
    api.$('.s05-ico-pn').innerHTML = Art.plate({ w: 300, amount: 1, seed: 21, headroom: -.1 });
    api.$('.s05-ico-coef').innerHTML = Art.plate({ w: 300, amount: .3, seed: 22, headroom: -.1 });
    api.$('.s05-ico-one').innerHTML = Art.grandma({ variant: 'uz', mood: 'happy', holding: 'none' });
    api.$$('.s05-hot').forEach((b) => b.addEventListener('click', () => this.show(api, b.dataset.part)));
    api.$$('.s05-card').forEach((c) => c.addEventListener('click', () => this.show(api, c.dataset.part)));
  },
  enter(api, { first }) {
    api.el.classList.remove('is-built');
    if (first) api.timeout(() => api.sfx('drumroll', 1.5), 250);
    api.timeout(() => {
      api.el.classList.add('is-built');
      if (first) api.sfx('ding');
      // перерисовать проводки уже открытых карточек (после возврата на слайд)
      api.state.shown.forEach((p) => this.wire(api, p));
    }, 2350);
  },
  wire(api, part) {
    const term = api.$(`.s05-hot[data-part="${part}"]`);
    const card = api.$(`.s05-card[data-part="${part}"]`);
    const path = api.$(`.w-${part}`);
    const a = pos(term, api.el), b = pos(card, api.el);
    const x1 = a.x + a.w / 2, y1 = a.y + a.h - 6;
    const x2 = b.x + b.w / 2, y2 = b.y - 14;
    const my = (y1 + y2) / 2;
    path.setAttribute('d', `M${x1.toFixed(0)},${y1.toFixed(0)} C${x1.toFixed(0)},${my.toFixed(0)} ${x2.toFixed(0)},${my.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`);
    path.classList.add('is-on');
  },
  show(api, part) {
    if (!ORDER.includes(part)) return;
    const card = api.$(`.s05-card[data-part="${part}"]`);
    api.$$('.s05-hot').forEach((t) => t.classList.toggle('is-hl', t.dataset.part === part));
    if (api.state.shown.has(part)) { FX.replay(card, 'is-pulse'); api.sfx('tick'); return; }
    api.state.shown.add(part);
    card.classList.add('is-on');
    this.wire(api, part);
    api.sfx(SOUND[part]);
    if (part === 'one') FX.at(card.querySelector('.s05-ico'), 'plov', { count: 40, power: 14 });
    api.updateSteps();
  },
  showMoral(api) {
    api.state.moral = true;
    api.$$('.s05-hot').forEach((t) => t.classList.add('is-hl'));
    api.$('.s05-foot').classList.add('is-on');
    api.sfx('stamp');
    api.updateSteps();
  },
  next(api) {
    const part = ORDER.find((p) => !api.state.shown.has(p));
    if (part) { this.show(api, part); return true; }
    if (!api.state.moral) { this.showMoral(api); return true; }
    return false;
  },
  progress(api) { return { done: api.state.shown.size + (api.state.moral ? 1 : 0), total: 4 }; },
});
