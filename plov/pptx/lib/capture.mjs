// Захват иллюстраций из HTML-версии (plov.html) для PowerPoint-версии.
// Для каждого состояния слайда: свежая загрузка → переход на слайд → действия (→, клавиши, клики) →
// пауза → по очереди изолируем элементы (всё остальное visibility:hidden, фон прозрачный) и снимаем PNG ×2.
// Координаты пишутся в пикселях сцены 1920×1080 (1 px = 1/144 дюйма слайда 13,333″).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }

const PREP_CSS = `
  html, body, #viewport, #stage { background: transparent !important; }
  #stage-bg, #fx, #navbar, #hint-start, .edge, #chrome, #notes-panel, #help, #blackout, #stage-timer { display: none !important; }
  .slide .notes { display: none !important; }
`;

/**
 * spec = { slide: '03', states: [ { name, actions: [...], wait, css, items: [{ name, sel, pad, hide: [sel], css }], measure: [{ name, sel }] } ] }
 * actions: { next: n } | { key: 'Digit1' } | { click: sel } | { wait: ms } | { eval: 'js' }
 * sel — внутри секции слайда (#sNN подставляется автоматически), либо абсолютный, если начинается с '!'.
 */
export async function captureSlide(deckFile, spec, outDir, { dpr = 2, log = console.log } = {}) {
  mkdirSync(outDir, { recursive: true });
  const rectsFile = join(outDir, 'rects.json');
  const rects = existsSync(rectsFile) ? JSON.parse(readFileSync(rectsFile, 'utf8')) : {};
  const browser = await pw.chromium.launch();
  try {
    for (const st of spec.states) {
      const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`file://${deckFile}#1`);
      await page.evaluate(() => document.fonts.ready);
      // звук не нужен, частицы спрятаны
      await page.evaluate(() => { try { if (!Sfx.muted) Sfx.toggle(); } catch (e) { /* */ } });
      const idx = await page.evaluate((id) => Deck.slides.findIndex((s) => s.dataset.id === id), spec.slide);
      if (idx < 0) throw new Error(`Слайд ${spec.slide} не найден`);
      await page.evaluate((i) => Deck.go(i), idx);
      await page.waitForTimeout(st.enterWait ?? 2600);
      for (const a of st.actions || []) {
        if (a.next) for (let k = 0; k < a.next; k++) { await page.evaluate(() => Deck.advance()); await page.waitForTimeout(a.each ?? 2600); }
        if (a.key) { await page.keyboard.press(a.key); await page.waitForTimeout(a.each ?? 1500); }
        if (a.click) { await page.evaluate((s) => { const el = document.querySelector(s); el && el.click(); }, a.click.startsWith('!') ? a.click.slice(1) : `#s${spec.slide} ${a.click}`); await page.waitForTimeout(a.each ?? 1500); }
        if (a.eval) { await page.evaluate(a.eval); }
        if (a.wait) await page.waitForTimeout(a.wait);
      }
      await page.waitForTimeout(st.wait ?? 600);
      await page.addStyleTag({ content: PREP_CSS + (st.css || '') });
      await page.waitForTimeout(150);

      for (const m of st.measure || []) {
        const sel = m.sel.startsWith('!') ? m.sel.slice(1) : `#s${spec.slide} ${m.sel}`;
        const r = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, sel);
        if (!r) { log(`  ! measure: нет ${sel}`); continue; }
        rects[m.name] = round(r);
      }

      for (const it of st.items || []) {
        const sel = it.sel.startsWith('!') ? it.sel.slice(1) : `#s${spec.slide} ${it.sel}`;
        const box = await page.evaluate(({ s, hide, css, pad, self, kids }) => {
          const el = document.querySelector(s);
          if (!el) return null;
          const saved = [];
          const setVis = (n, v) => { saved.push([n, n.style.visibility]); n.style.visibility = v; };
          document.querySelectorAll('#stage > .slide').forEach((sl) => setVis(sl, 'hidden'));
          setVis(el, 'visible');
          for (const h of hide || []) el.querySelectorAll(h).forEach((n) => setVis(n, 'hidden'));
          let style = null;
          if (css) { style = document.createElement('style'); style.textContent = css; document.head.appendChild(style); }
          // объединённая рамка элемента и всех видимых потомков (у SVG бывает overflow: visible)
          const all = self ? [el] : kids ? [...el.querySelectorAll('*')] : [el, ...el.querySelectorAll('*')];
          let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
          for (const n of all) {
            const cs = getComputedStyle(n);
            if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
            const b = n.getBoundingClientRect();
            if (b.width < .5 || b.height < .5) continue;
            x1 = Math.min(x1, b.left); y1 = Math.min(y1, b.top); x2 = Math.max(x2, b.right); y2 = Math.max(y2, b.bottom);
          }
          window.__restore = () => { saved.reverse().forEach(([n, v]) => { n.style.visibility = v; }); if (style) style.remove(); };
          if (!isFinite(x1)) return { empty: true };
          x1 = Math.max(0, x1 - pad); y1 = Math.max(0, y1 - pad); x2 = Math.min(1920, x2 + pad); y2 = Math.min(1080, y2 + pad);
          return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }, { s: sel, hide: it.hide, css: it.css, pad: it.pad ?? 16, self: !!it.self, kids: !!it.kids });
        if (!box || box.empty) { log(`  ! ${it.name}: нет видимого элемента ${sel}`); await page.evaluate(() => window.__restore && window.__restore()); continue; }
        if (it.clip) Object.assign(box, it.clip);
        const file = join(outDir, `${it.name}.png`);
        await page.waitForTimeout(60);
        await page.screenshot({ path: file, clip: { x: box.x, y: box.y, width: box.w, height: box.h }, omitBackground: true });
        await page.evaluate(() => window.__restore && window.__restore());
        rects[it.name] = round(box);
        log(`  📸 ${spec.slide}/${it.name} ${Math.round(box.w)}×${Math.round(box.h)} @ ${Math.round(box.x)},${Math.round(box.y)}`);
      }
      if (errors.length) log(`  ! ошибки страницы: ${errors.join(' | ')}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  writeFileSync(rectsFile, JSON.stringify(rects, null, 1));
  return rects;
}

/** Фон сцены (миллиметровка, свечение, орнамент) — один JPEG на всю презентацию */
export async function captureBackground(deckFile, outFile) {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(`file://${deckFile}#5`);
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: `.slide, #chrome, #fx, #navbar, #hint-start, .edge { display: none !important; }` });
  await page.waitForTimeout(150);
  await page.screenshot({ path: outFile, type: 'jpeg', quality: 92 });
  await browser.close();
}

const round = (r) => ({ x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.w.toFixed(1), h: +r.h.toFixed(1) });
