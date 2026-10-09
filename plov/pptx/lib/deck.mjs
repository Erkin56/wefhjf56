// Построитель слайдов PowerPoint-версии: координаты в пикселях сцены HTML (1920×1080) → дюймы (÷144).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PX = 1 / 144;
export const pt = (px) => px / 2; // кегль: 1 px сцены = 0,5 pt

export const C = {
  bg: '17181B', bg2: '1F2125', panel: '26292E', line: '3A3E45',
  cream: 'F5EBD5', cream2: 'E9DCBD', cream3: 'D8C79F', ink: '1B1814', ink2: '4A4236', muted: 'A39D90',
  gold: 'F6BB2A', gold2: 'CF9214', red: 'E8432D', red2: 'B32A18', red3: '7D1A0D',
  blue: '52B6FF', orange: 'FF8A35', green: '4CC27A', factGreen: '1F6B3A', white: 'FFFFFF', black: '000000',
};
// шрифты, которые есть в Office/Windows: Arial Black — заголовки, Calibri — текст, Cambria — формулы,
// Segoe Print — «рукописные» пометки, Consolas — счётчики
export const F = { display: 'Arial Black', body: 'Calibri', serif: 'Cambria', hand: 'Segoe Print', mono: 'Consolas' };

export class SlideBuilder {
  constructor(pres, { id, assetsDir, layout = 'CHROME', section = '' }) {
    this.pres = pres;
    this.id = id;
    this.dir = join(assetsDir, id);
    const rf = join(this.dir, 'rects.json');
    this.rects = existsSync(rf) ? JSON.parse(readFileSync(rf, 'utf8')) : {};
    this.layout = layout;
    this.section = section;
    this.anims = { auto: [], clicks: [], triggers: [] };
    this.transition = { kind: 'fade', spd: 'med' };
    this.names = new Set();
    this.slide = null;
  }
  // создать слайд (вызывается в начале build)
  start({ layout, title, eyebrow, section } = {}) {
    if (layout) this.layout = layout;
    const sec = section || this.section;
    if (sec) {
      this.pres._plovSections = this.pres._plovSections || new Set();
      if (!this.pres._plovSections.has(sec)) { this.pres.addSection({ title: sec }); this.pres._plovSections.add(sec); }
    }
    this.slide = this.pres.addSlide({ masterName: this.layout === 'BLANK' ? 'PLOV_BLANK' : 'PLOV_CHROME', sectionTitle: sec || undefined });
    if (this.layout !== 'BLANK') {
      if (eyebrow) this.slide.addText(eyebrow.toUpperCase(), { placeholder: 'eyebrow' });
      if (title) this.slide.addText(title, { placeholder: 'title' });
      this.slide.addText((section || this.section || '').toUpperCase(), { placeholder: 'section' });
    }
    return this.slide;
  }
  _name(n) {
    if (this.names.has(n)) throw new Error(`Слайд ${this.id}: имя ${n} уже занято`);
    this.names.add(n);
    return n;
  }
  rect(r) {
    if (typeof r === 'string') {
      const v = this.rects[r];
      if (!v) throw new Error(`Слайд ${this.id}: нет размеров для «${r}» (захват не сделан?)`);
      return v;
    }
    return r;
  }
  box(r, pad = {}) {
    const v = this.rect(r);
    const { l = 0, t = 0, r: rr = 0, b = 0 } = pad;
    return { x: (v.x - l) * PX, y: (v.y - t) * PX, w: (v.w + l + rr) * PX, h: (v.h + t + b) * PX };
  }
  /** картинка из захвата: имя файла = имя захвата */
  img(name, { file, rect, alt, rotate, transparency } = {}) {
    const f = join(this.dir, `${file || name}.png`);
    if (!existsSync(f)) throw new Error(`Слайд ${this.id}: нет картинки ${f}`);
    const b = this.box(rect || file || name);
    this.slide.addImage({ path: f, ...b, objectName: this._name(name), altText: alt || name, rotate, transparency });
    return name;
  }
  /** готовая картинка по пути (общие ассеты) */
  imgFile(name, path, rectPx, opts = {}) {
    this.slide.addImage({ path, ...this.box(rectPx), objectName: this._name(name), altText: opts.alt || name, ...opts });
    return name;
  }
  /** текстовая надпись; rect в px сцены или имя замера */
  text(name, text, rect, o = {}) {
    const b = this.box(rect, o.pad);
    const opts = {
      ...b, objectName: this._name(name), isTextBox: true, margin: o.margin ?? 0,
      fontFace: o.font ? (F[o.font] || o.font) : F.body, fontSize: o.size ?? 16, color: o.color ?? C.cream,
      bold: o.bold, italic: o.italic, align: o.align || 'left', valign: o.valign || 'top',
      charSpacing: o.spacing, lineSpacingMultiple: o.lineMul, rotate: o.rotate, fit: 'none', wrap: o.wrap !== false,
      paraSpaceAfter: o.paraAfter,
    };
    if (o.fill) opts.fill = { color: o.fill, transparency: o.fillT ?? 0 };
    if (o.line) opts.line = { color: o.line, width: o.lineW ?? 1 };
    if (o.radius) { opts.shape = this.pres.ShapeType.roundRect; opts.rectRadius = o.radius; }
    if (o.shadow) opts.shadow = { ...o.shadow };
    if (o.inset != null) opts.margin = o.inset;
    this.slide.addText(text, opts);
    return name;
  }
  /** фигура (прямоугольник, скруглённый, эллипс, линия) */
  shape(name, kind, rect, o = {}) {
    const t = { rect: 'rect', round: 'roundRect', ellipse: 'ellipse', line: 'line', triangle: 'triangle', arrowDown: 'downArrow' }[kind] || kind;
    const b = this.box(rect);
    const opts = { ...b, objectName: this._name(name), rotate: o.rotate };
    if (o.fill) opts.fill = { color: o.fill, transparency: o.fillT ?? 0 }; else opts.fill = { type: 'none' };
    if (o.line) opts.line = { color: o.line, width: o.lineW ?? 1, dashType: o.dash, transparency: o.lineT ?? 0 }; else opts.line = { type: 'none' };
    if (t === 'roundRect') opts.rectRadius = o.radius ?? 0.15;
    if (o.shadow) opts.shadow = { ...o.shadow };
    if (o.flipV) opts.flipV = true;
    this.slide.addShape(this.pres.ShapeType[t] || t, opts);
    return name;
  }
  /** объёмная «игровая» кнопка как в HTML */
  button(name, label, rect, { fill = C.gold, edge = C.gold2, color = C.ink, size = 17, font = 'display', radius = 0.5 } = {}) {
    return this.text(name, label, rect, {
      font, size, color, bold: true, align: 'center', valign: 'middle', fill, radius,
      shadow: { type: 'outer', color: edge, blur: 0, offset: 4.5, angle: 90, opacity: 1 },
    });
  }
  /** бейдж «Факт / Математика / Шутка» */
  badge(name, kind, label, xy, { size = 10, w } = {}) {
    const st = { fact: [C.cream, C.factGreen], math: [C.gold, C.ink], joke: [C.red, C.cream], outline: [null, C.cream3] }[kind];
    // ширина в px сцены: (символы + маркер) × (кегль·2·0,66 + разрядка) + поля
    const width = w ?? Math.round((label.length + 3) * (size * 2 * 0.66 + 3) + 36);
    return this.text(name, `●  ${label.toUpperCase()}`, { x: xy.x, y: xy.y, w: width, h: size * 3.4 }, {
      font: 'body', size, bold: true, color: st[1], fill: st[0] || undefined, radius: 0.5, align: 'center', valign: 'middle', spacing: 1.5, wrap: false,
    });
  }
  /** штамп-печать */
  stamp(name, text, rect, { color = C.red, size = 26, rot = -8, fill = C.bg, fillT = 30, lineW = 4.5, lines } = {}) {
    return this.text(name, text, rect, {
      font: 'display', size, color, align: 'center', valign: 'middle', rotate: rot,
      fill, fillT, line: color, lineW, radius: 0.12, lineMul: lines,
    });
  }
  /** стикер (кремовая наклейка) */
  sticker(name, text, rect, { fill = C.cream, color = C.ink, size = 15, rot = 4, font = 'display' } = {}) {
    return this.text(name, text, rect, {
      font, size, color, bold: true, align: 'center', valign: 'middle', rotate: rot, fill, radius: 0.18,
      line: C.bg, lineW: 3, shadow: { type: 'outer', color: '000000', blur: 6, offset: 4, angle: 90, opacity: 0.45 },
    });
  }
  /** диаграмма (нативная) */
  chart(name, type, data, rect, opts = {}) {
    this.slide.addChart(this.pres.ChartType[type] || type, data, { ...this.box(rect), objectName: this._name(name), ...opts });
    return name;
  }
  notes(text) { this.slide.addNotes(text); }

  // ---- анимации ----
  auto(...effects) { this.anims.auto.push(...effects); }
  click(...effects) { this.anims.clicks.push(effects); }
  trigger(on, ...effects) { this.anims.triggers.push({ on, effects }); }
}

/** Мастер-слайды: фон и академическая «рамка» как в HTML */
export function defineMasters(pres, bgPath) {
  const chromeText = { fontFace: F.body, fontSize: 9.5, color: C.muted, bold: true, charSpacing: 1.2, margin: 0, valign: 'middle' };
  pres.defineSlideMaster({
    title: 'PLOV_BLANK',
    background: { path: bgPath },
    objects: [],
  });
  pres.defineSlideMaster({
    title: 'PLOV_CHROME',
    background: { path: bgPath },
    objects: [
      { text: { text: 'АНТИНАУЧНАЯ КОНФЕРЕНЦИЯ · РГПУ ИМ. А. И. ГЕРЦЕНА', options: { x: 110 * PX, y: 14 * PX, w: 900 * PX, h: 36 * PX, ...chromeText } } },
      { text: { text: 'Плов как бесконечный ряд', options: { x: 1300 * PX, y: 14 * PX, w: 510 * PX, h: 36 * PX, ...chromeText, fontFace: F.serif, italic: true, bold: false, fontSize: 10.5, color: C.cream3, align: 'right', charSpacing: 0 } } },
      { line: { x: 0, y: 64 * PX, w: 13.333, h: 0, line: { color: C.cream, width: 0.75, transparency: 88 } } },
      { line: { x: 0, y: 1020 * PX, w: 13.333, h: 0, line: { color: C.cream, width: 0.75, transparency: 88 } } },
      { text: { text: 'ЭРКИНБОЙ', options: { x: 110 * PX, y: 1032 * PX, w: 160 * PX, h: 36 * PX, ...chromeText, color: C.gold } } },
      { placeholder: { options: { name: 'section', type: 'body', x: 260 * PX, y: 1032 * PX, w: 700 * PX, h: 36 * PX, ...chromeText, color: C.cream3 }, text: '' } },
      { placeholder: { options: { name: 'eyebrow', type: 'body', x: 110 * PX, y: 98 * PX, w: 1400 * PX, h: 34 * PX, fontFace: F.body, fontSize: 11, bold: true, color: C.gold, charSpacing: 3.5, margin: 0, valign: 'middle' }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: 110 * PX, y: 136 * PX, w: 1700 * PX, h: 150 * PX, fontFace: F.display, fontSize: 32, color: C.cream, margin: 0, valign: 'top', align: 'left' }, text: '' } },
    ],
    slideNumber: { x: 1700 * PX, y: 1032 * PX, w: 110 * PX, h: 36 * PX, fontFace: F.mono, fontSize: 11, color: C.cream, bold: true, align: 'right' },
  });
}
