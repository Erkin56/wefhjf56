#!/usr/bin/env node
// Прогон всей презентации «как на сцене»: только клавиша → (кликер), скриншот после каждого нажатия.
//   node plov/tools/playthrough.mjs --file plov/plov.html --out /tmp/pt [--size 1920x1080] [--wait 1600] [--max 80]
// Печатает таблицу: нажатие → слайд, шаги (done/total), ошибки. Код выхода 1 при ошибках страницы.
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const file = resolve(opt('file', 'plov/plov.html'));
const out = resolve(opt('out', '/tmp/plov-playthrough'));
const [vw, vh] = opt('size', '1920x1080').split('x').map(Number);
const wait = +opt('wait', 1600);
const max = +opt('max', 80);
mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
await page.goto(`file://${file}#1`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(wait + 600);

const state = () => page.evaluate(() => {
  const el = Deck.current;
  const dots = [...document.querySelectorAll('#chrome-steps i')];
  return { i: Deck.index, id: el.dataset.id, title: el.dataset.title, done: dots.filter((d) => d.classList.contains('done')).length, total: dots.length };
});
let s = await state();
await page.screenshot({ path: join(out, `p00-s${s.id}.png`) });
console.log(`00  слайд ${s.id} «${s.title}» шаги ${s.done}/${s.total}`);
let last = null, sameCount = 0;
for (let k = 1; k <= max; k++) {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(wait);
  s = await state();
  const key = `${s.id}:${s.done}`;
  await page.screenshot({ path: join(out, `p${String(k).padStart(2, '0')}-s${s.id}.png`) });
  console.log(`${String(k).padStart(2, '0')}  слайд ${s.id} «${s.title}» шаги ${s.done}/${s.total}`);
  if (key === last) { sameCount++; if (sameCount >= 2) { console.log('— конец (состояние не меняется)'); break; } } else sameCount = 0;
  last = key;
}
if (errors.length) console.log('ОШИБКИ:\n  ' + errors.join('\n  ')); else console.log('Ошибок страницы нет.');
await browser.close();
process.exit(errors.length ? 1 : 0);
