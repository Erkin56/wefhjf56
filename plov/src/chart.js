/* Plot — лёгкий SVG-график для «научных» слайдов (без библиотек).
   const p = new Plot(container, { width: 1100, height: 620, x: [0, 20], y: [0, 2],
     xTicks: [0,5,10,15,20], yTicks: [0, .5, 1, 1.5, 2], xLabel: 'n', yLabel: 'Pₙ' });
   p.series('plate', { color: 'var(--blue)', dots: true }).data([[0,1],[1,1.3],...]);
   p.reveal('plate', 7.5);                 // показать первые 7,5 точки (дробно — с плавной дорисовкой)
   p.animateReveal('plate', 20, 900);       // анимировать до 20
   p.hline('lim', 10/7, { label: '10/7 ≈ 1,43', dashed: true, color: 'var(--gold)' });
   p.setDomain({ y: [0, 50] }, 600);        // плавно перемасштабировать ось */
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};

class Plot {
  constructor(container, o = {}) {
    this.o = Object.assign({
      width: 1100, height: 620,
      margin: { l: 110, r: 40, t: 30, b: 90 },
      x: [0, 10], y: [0, 1],
      xTicks: null, yTicks: null, xTickCount: 6, yTickCount: 5,
      fmtX: (v) => Fmt.num(v, Number.isInteger(v) ? 0 : 1),
      fmtY: (v) => Fmt.num(v, Number.isInteger(v) ? 0 : (Math.abs(v) < 10 ? 2 : 0)),
      xLabel: '', yLabel: '',
      grid: true,
    }, o);
    this.dom = { x: this.o.x.slice(), y: this.o.y.slice() };
    this.items = new Map(); // id → {kind, ...}
    this.svg = mk('svg', { class: 'plot', viewBox: `0 0 ${this.o.width} ${this.o.height}`, width: this.o.width, height: this.o.height, role: 'img' });
    this.gGrid = mk('g', { class: 'plot-grid' }, this.svg);
    this.gAxes = mk('g', { class: 'plot-axes' }, this.svg);
    this.gBack = mk('g', { class: 'plot-back' }, this.svg);
    this.gSeries = mk('g', { class: 'plot-series' }, this.svg);
    this.gFront = mk('g', { class: 'plot-front' }, this.svg);
    const clipId = 'clip' + Math.random().toString(36).slice(2, 8);
    const defs = mk('defs', {}, this.svg);
    const cp = mk('clipPath', { id: clipId }, defs);
    this.clipRect = mk('rect', {}, cp);
    this.gSeries.setAttribute('clip-path', `url(#${clipId})`);
    this.gBack.setAttribute('clip-path', `url(#${clipId})`);
    (typeof container === 'string' ? document.querySelector(container) : container).appendChild(this.svg);
    this.render();
  }
  get iw() { return this.o.width - this.o.margin.l - this.o.margin.r; }
  get ih() { return this.o.height - this.o.margin.t - this.o.margin.b; }
  sx(x) { const [a, b] = this.dom.x; return this.o.margin.l + ((x - a) / (b - a)) * this.iw; }
  sy(y) { const [a, b] = this.dom.y; return this.o.margin.t + this.ih - ((y - a) / (b - a)) * this.ih; }

  niceTicks([a, b], count) {
    const span = b - a; if (span <= 0) return [a];
    const raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
    const out = []; for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  render() {
    const o = this.o, L = o.margin.l, T = o.margin.t, W = this.iw, H = this.ih;
    this.clipRect.setAttribute('x', L - 6); this.clipRect.setAttribute('y', T - 40);
    this.clipRect.setAttribute('width', W + 12); this.clipRect.setAttribute('height', H + 46);
    // сетка и оси
    this.gGrid.innerHTML = ''; this.gAxes.innerHTML = '';
    const xt = (this.o.xTicks && !this._xAuto ? this.o.xTicks : this.niceTicks(this.dom.x, o.xTickCount)).filter((v) => v >= this.dom.x[0] - 1e-9 && v <= this.dom.x[1] + 1e-9);
    const yt = (this.o.yTicks && !this._yAuto ? this.o.yTicks : this.niceTicks(this.dom.y, o.yTickCount)).filter((v) => v >= this.dom.y[0] - 1e-9 && v <= this.dom.y[1] + 1e-9);
    for (const v of yt) {
      const y = this.sy(v);
      if (o.grid) mk('line', { x1: L, x2: L + W, y1: y, y2: y, class: 'pg-line' }, this.gGrid);
      mk('text', { x: L - 18, y: y + 8, 'text-anchor': 'end', class: 'pg-tick' }, this.gAxes).textContent = o.fmtY(v);
    }
    for (const v of xt) {
      const x = this.sx(v);
      if (o.grid) mk('line', { x1: x, x2: x, y1: T, y2: T + H, class: 'pg-line pg-line--v' }, this.gGrid);
      mk('text', { x, y: T + H + 40, 'text-anchor': 'middle', class: 'pg-tick' }, this.gAxes).textContent = o.fmtX(v);
    }
    mk('line', { x1: L, x2: L + W + 18, y1: T + H, y2: T + H, class: 'pg-axis' }, this.gAxes);
    mk('line', { x1: L, x2: L, y1: T + H, y2: T - 18, class: 'pg-axis' }, this.gAxes);
    mk('path', { d: `M${L + W + 18},${T + H - 8} l14,8 l-14,8 z`, class: 'pg-arrow' }, this.gAxes);
    mk('path', { d: `M${L - 8},${T - 18} l8,-14 l8,14 z`, class: 'pg-arrow' }, this.gAxes);
    if (o.xLabel) mk('text', { x: L + W, y: T + H + 80, 'text-anchor': 'end', class: 'pg-label' }, this.gAxes).innerHTML = o.xLabel;
    if (o.yLabel) mk('text', { x: L - 18, y: T - 30, 'text-anchor': 'end', class: 'pg-label' }, this.gAxes).innerHTML = o.yLabel;
    for (const [id, it] of this.items) this.renderItem(id, it);
  }

  /* ---- серии ---- */
  series(id, opts = {}) {
    if (!this.items.has(id)) {
      const g = mk('g', { class: `pg-series pg-${id}` }, this.gSeries);
      const area = opts.area ? mk('path', { class: 'pg-area', fill: opts.color || 'var(--gold)', 'fill-opacity': opts.areaOpacity ?? .14 }, g) : null;
      const path = mk('path', { class: 'pg-path', fill: 'none', stroke: opts.color || 'var(--gold)', 'stroke-width': opts.width || 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      if (opts.dashed) path.setAttribute('stroke-dasharray', '14 14');
      if (opts.glow !== false) path.setAttribute('filter', 'url(#f-glow)');
      const dots = mk('g', { class: 'pg-dots' }, g);
      const head = mk('circle', { class: 'pg-head', r: opts.headR || 13, fill: opts.color || 'var(--gold)', stroke: 'var(--bg)', 'stroke-width': 5 }, g);
      this.items.set(id, { kind: 'series', g, path, area, dots, head, pts: [], t: 0, o: opts });
    }
    const it = this.items.get(id);
    const self = this;
    return {
      // при первом вызове серия видна целиком (если не revealAll:false); дальше t сохраняется — анимируйте animateReveal
      data(pts) {
        it.pts = pts;
        if (!it._init) { it.t = it.o.revealAll === false ? 0 : Math.max(0, pts.length - 1); it._init = true; }
        else it.t = clamp(it.t, 0, Math.max(0, pts.length - 1));
        self.renderItem(id, it); return this;
      },
      reveal(t) { self.reveal(id, t); return this; },
      el: it.g,
    };
  }
  reveal(id, t) { const it = this.items.get(id); if (!it) return; it.t = clamp(t, 0, Math.max(0, it.pts.length - 1)); this.renderItem(id, it); }
  revealed(id) { const it = this.items.get(id); return it ? it.t : 0; }
  animateReveal(id, to, ms = 800, easing = ease.inOutCubic) {
    const it = this.items.get(id); if (!it) return Promise.resolve();
    const from = it.t;
    if (it._anim) it._anim.cancel = true;
    const token = { cancel: false }; it._anim = token;
    return new Promise((res) => {
      const t0 = performance.now();
      const step = (now) => {
        if (token.cancel) return res();
        const k = clamp((now - t0) / ms, 0, 1);
        this.reveal(id, lerp(from, to, easing(k)));
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  renderItem(id, it) {
    if (it.kind === 'series') {
      const pts = it.pts; if (!pts.length) { it.path.setAttribute('d', ''); it.head.style.display = 'none'; return; }
      const n = Math.floor(it.t), f = it.t - n;
      const vis = pts.slice(0, n + 1).map(([x, y]) => [this.sx(x), this.sy(y)]);
      if (f > 0 && pts[n + 1]) {
        const [x0, y0] = pts[n], [x1, y1] = pts[n + 1];
        vis.push([this.sx(lerp(x0, x1, f)), this.sy(lerp(y0, y1, f))]);
      }
      const step = it.o.step; // ступенчатая линия
      let d = '';
      vis.forEach(([x, y], i) => {
        if (i === 0) d += `M${x.toFixed(1)},${y.toFixed(1)}`;
        else if (step) d += `H${x.toFixed(1)}V${y.toFixed(1)}`;
        else d += `L${x.toFixed(1)},${y.toFixed(1)}`;
      });
      it.path.setAttribute('d', d);
      if (it.area) {
        const base = this.sy(Math.max(this.dom.y[0], 0));
        it.area.setAttribute('d', vis.length ? `${d}L${vis[vis.length - 1][0].toFixed(1)},${base}L${vis[0][0].toFixed(1)},${base}Z` : '');
      }
      it.dots.innerHTML = '';
      if (it.o.dots) {
        for (let i = 0; i <= n && i < pts.length; i++) {
          mk('circle', { cx: this.sx(pts[i][0]), cy: this.sy(pts[i][1]), r: it.o.dotR || 8, fill: 'var(--bg)', stroke: it.o.color || 'var(--gold)', 'stroke-width': 4 }, it.dots);
        }
      }
      const last = vis[vis.length - 1];
      if (it.o.head !== false && last) { it.head.style.display = ''; it.head.setAttribute('cx', last[0]); it.head.setAttribute('cy', last[1]); }
      else it.head.style.display = 'none';
    } else if (it.kind === 'hline') {
      const y = this.sy(it.y);
      const L = this.o.margin.l, R = this.o.margin.l + this.iw;
      it.line.setAttribute('x1', L); it.line.setAttribute('x2', R);
      it.line.setAttribute('y1', y); it.line.setAttribute('y2', y);
      if (it.text) { it.text.setAttribute('x', it.o.labelX ?? (R - 10)); it.text.setAttribute('y', y - 16); }
      const vis = it.y >= this.dom.y[0] && it.y <= this.dom.y[1];
      it.g.style.opacity = vis ? '' : 0;
    } else if (it.kind === 'marker') {
      it.g.setAttribute('transform', `translate(${this.sx(it.x)},${this.sy(it.y)})`);
    }
  }

  hline(id, y, opts = {}) {
    let it = this.items.get(id);
    if (!it) {
      const g = mk('g', { class: `pg-hline pg-${id}` }, this.gBack);
      const line = mk('line', { stroke: opts.color || 'var(--gold)', 'stroke-width': opts.width || 4, 'stroke-dasharray': opts.dashed === false ? '' : '16 12' }, g);
      const text = opts.label ? mk('text', { 'text-anchor': opts.anchor || 'end', class: 'pg-hlabel', fill: opts.color || 'var(--gold)' }, g) : null;
      if (text) text.innerHTML = opts.label;
      it = { kind: 'hline', g, line, text, y, o: opts };
      this.items.set(id, it);
    }
    it.y = y; this.renderItem(id, it);
    return it.g;
  }
  marker(id, x, y, html = '', opts = {}) {
    let it = this.items.get(id);
    if (!it) {
      const g = mk('g', { class: `pg-marker pg-${id}` }, this.gFront);
      mk('circle', { r: opts.r || 14, fill: opts.color || 'var(--red)', stroke: 'var(--cream)', 'stroke-width': 4 }, g);
      if (html) { const t = mk('text', { x: opts.dx ?? 24, y: opts.dy ?? -22, class: 'pg-mlabel', fill: opts.textColor || 'var(--cream)', 'text-anchor': opts.anchor || 'start' }, g); t.innerHTML = html; }
      it = { kind: 'marker', g, x, y, o: opts };
      this.items.set(id, it);
    }
    it.x = x; it.y = y; this.renderItem(id, it);
    return it.g;
  }
  remove(id) { const it = this.items.get(id); if (it) { it.g.remove(); this.items.delete(id); } }

  setDomain({ x, y } = {}, ms = 0, easing = ease.inOutCubic) {
    const from = { x: this.dom.x.slice(), y: this.dom.y.slice() };
    const to = { x: x || from.x, y: y || from.y };
    if (x) this._xAuto = !!this.o.autoTicks || this._xAuto;
    if (y) this._yAuto = true;
    if (!ms) { this.dom = to; this.render(); return Promise.resolve(); }
    if (this._domAnim) this._domAnim.cancel = true;
    const token = { cancel: false }; this._domAnim = token;
    return new Promise((res) => {
      const t0 = performance.now();
      const step = (now) => {
        if (token.cancel) return res();
        const k = easing(clamp((now - t0) / ms, 0, 1));
        this.dom = { x: [lerp(from.x[0], to.x[0], k), lerp(from.x[1], to.x[1], k)], y: [lerp(from.y[0], to.y[0], k), lerp(from.y[1], to.y[1], k)] };
        this.render();
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
}

/* стили графика — внедряем один раз */
(() => {
  const css = `
  .plot { overflow: visible; font-family: var(--f-mono); }
  .plot .pg-line { stroke: rgba(245,235,213,.09); stroke-width: 2; }
  .plot .pg-axis { stroke: var(--cream-3); stroke-width: 4; stroke-linecap: round; }
  .plot .pg-arrow { fill: var(--cream-3); }
  .plot .pg-tick { fill: var(--muted); font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .plot .pg-label { fill: var(--cream); font-family: var(--f-serif); font-style: italic; font-size: 34px; }
  .plot .pg-hlabel { font-family: var(--f-serif); font-size: 30px; font-weight: 700; paint-order: stroke; stroke: var(--bg); stroke-width: 8px; }
  .plot .pg-mlabel { font-family: var(--f-body); font-weight: 800; font-size: 28px; paint-order: stroke; stroke: var(--bg); stroke-width: 8px; }
  .plot .pg-head { transition: opacity .2s; }`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

window.Plot = Plot;
window.svgEl = mk;
