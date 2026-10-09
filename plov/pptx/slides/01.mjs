// Слайд 1. Титул: заголовок, казан с формулами, исследователь; «Начать эксперимент» → три строки методологии.
import { C } from '../lib/deck.mjs';

export const capture = {
  states: [
    {
      name: 'start',
      items: [
        { name: 'inf', sel: '.s01-inf', pad: 8 },
        { name: 'formulas', sel: '.s01-formulas', pad: 30, kids: true },
        { name: 'kazan', sel: '.s01-kazan', pad: 24 },
        { name: 'res0', sel: '.s01-researcher', pad: 20 },
      ],
      measure: [
        { name: 'eyebrow', sel: '.s01-left .eyebrow' },
        { name: 'l1', sel: '.s01-l1' }, { name: 'l2', sel: '.s01-l2' }, { name: 'l3', sel: '.s01-l3' },
        { name: 'sub', sel: '.s01-sub' },
        { name: 'authorB', sel: '.s01-author b' }, { name: 'authorS', sel: '.s01-author span' },
        { name: 'start', sel: '.s01-start' },
      ],
    },
    {
      name: 'started',
      actions: [{ next: 1, each: 3200 }],
      items: [
        { name: 'res1', sel: '.s01-researcher', pad: 20 },
        { name: 'me', sel: '.s01-me', pad: 10 },
      ],
      measure: [
        { name: 'card', sel: '.s01-ethics' },
        { name: 'line1', sel: '.s01-line1' }, { name: 'line2', sel: '.s01-line2' }, { name: 'line3', sel: '.s01-line3' },
        { name: 'badge', sel: '.s01-badge' },
      ],
    },
  ],
};

export function build(S) {
  S.start({ layout: 'BLANK', section: 'Введение' });
  const r = S.rects;

  S.img('formulas');
  S.img('kazan');
  S.img('res0');
  S.img('res1');

  // левая колонка — живой текст
  S.text('eyebrow', '—  АНТИНАУЧНАЯ КОНФЕРЕНЦИЯ · РГПУ ИМ. А. И. ГЕРЦЕНА', 'eyebrow', { size: 11, bold: true, color: C.gold, spacing: 3.5, pad: { r: 120 } });
  S.text('l1', 'ПЛОВ КАК', 'l1', { font: 'display', size: 54, color: C.cream, pad: { r: 200, b: 8 } });
  S.text('l2', 'БЕСКОНЕЧНЫЙ', 'l2', { font: 'display', size: 54, color: C.gold, pad: { r: 100, b: 8 } });
  S.text('l3', 'РЯД', { ...r.l3, w: 330 }, { font: 'display', size: 54, color: C.cream, pad: { b: 8 } });
  S.img('inf');
  S.text('sub', 'Почему узбекское гостеприимство противоречит математике?', 'sub', { font: 'serif', italic: true, size: 22, color: C.cream, pad: { r: 60 } });
  S.text('authorB', 'Эркинбой', 'authorB', { font: 'display', size: 17, color: C.cream, pad: { r: 200 } });
  S.text('authorS', 'магистрант, лингвист · родом из Узбекистана · в Петербурге с 2014 года', 'authorS', { size: 13, bold: true, color: C.muted, pad: { r: 80 } });

  // кнопка и карточка методологии
  S.button('startBtn', 'НАЧАТЬ ЭКСПЕРИМЕНТ', 'start', { size: 22 });
  S.text('card', '', 'card', { fill: C.cream, radius: 0.12, rotate: -1.5, shadow: { type: 'outer', color: '000000', blur: 18, offset: 8, angle: 90, opacity: 0.35 } });
  S.badge('badge', 'joke', 'Шуточная методология', { x: r.badge.x, y: r.badge.y - 2 }, { size: 9.5, w: r.badge.w + 6 });
  S.text('line1', 'Исследование проводилось на людях.', 'line1', { size: 20, bold: true, color: C.ink, rotate: -1.5, pad: { r: 30 } });
  S.text('line2', 'Точнее, на одном человеке.', 'line2', { size: 20, bold: true, color: C.ink, rotate: -1.5, pad: { r: 30 } });
  S.text('line3', 'НА МНЕ.', 'line3', { font: 'display', size: 32, color: C.red, rotate: -1.5, pad: { r: 60 } });
  S.img('me');

  // анимации
  S.auto(
    { t: 'formulas', fx: 'float', dur: 3200, amp: 0.012 },
    { t: 'startBtn', fx: 'heartbeat', dur: 1600, by: 104 },
  );
  S.click(
    { t: 'startBtn', fx: 'zoomOut', dur: 300, sound: 'tada' },
    { t: 'kazan', fx: 'pulse', dur: 600, by: 106 },
    { t: 'card', fx: 'pop', dur: 550, delay: 120 },
    { t: 'badge', fx: 'pop', dur: 450, delay: 300 },
    { t: 'line1', fx: 'fade', dur: 400, delay: 350, sound: 'pop' },
    { t: 'line2', fx: 'fade', dur: 400, delay: 900, sound: 'pop' },
    { t: 'line3', fx: 'pop', dur: 600, delay: 1500, sound: 'boing' },
    { t: 'res0', fx: 'fadeOut', dur: 250, delay: 1500 },
    { t: 'res1', fx: 'fade', dur: 250, delay: 1500 },
    { t: 'me', fx: 'pop', dur: 500, delay: 1650 },
  );
  S.transition = { kind: 'fade', spd: 'med' };
  S.notesExtra = 'PowerPoint: один щелчок (или →, PageDown, кликер) — «Начать эксперимент»; три строки появятся сами. Следующий щелчок — слайд 2.';
}
