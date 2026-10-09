#!/usr/bin/env node
// Скриншоты и прогон сценариев в Chromium (Playwright) для проверки слайдов.
//
//   node plov/tools/shoot.mjs --file plov/plov.html --slide 3 --out /tmp/shots \
//        --do "click .s03-no; click .s03-no; next; key Digit1; range #s06-range 12; wait 500; eval Deck.advance()"
//
// После каждого действия (кроме wait/shot) — пауза --step-wait мс (по умолчанию 1100) и скриншот.
// Первый скриншот — через --wait мс после открытия слайда (по умолчанию 1800).
// Команды: next | prev | click <css> | key <KeyboardEvent.code> | range <css> <value> | wait <ms> | shot | eval <js>
// Опции: --size 1600x900 (по умолчанию), --no-auto (скрин только по shot), --all (по одному кадру на каждый слайд).
// В конце печатает ошибки консоли/страницы. Код выхода 1, если были ошибки страницы.
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch {
  const root = execSync('npm root -g').toString().trim();
  pw = require(join(root, 'playwright'));
}
const { chromium } = pw;

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : def; };
const flag = (name) => argv.includes(`--${name}`);
const file = resolve(opt('file', 'plov/plov.html'));
const out = resolve(opt('out', '/tmp/plov-shots'));
const [vw, vh] = opt('size', '1600x900').split('x').map(Number);
const firstWait = +opt('wait', 1800);
const stepWait = +opt('step-wait', 1100);
const auto = !flag('no-auto');
const all = flag('all');
const slide = +opt('slide', 1);
const script = opt('do', '');

if (!existsSync(file)) { console.error('Нет файла', file); process.exit(2); }
mkdirSync(out, { recursive: true });

const executablePath = existsSync('/opt/pw-browsers/chromium') ? undefined : undefined;
const browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
const errors = [], logs = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });

let n = 0;
const shot = async (label) => {
  const p = join(out, `s${String(slide).padStart(2, '0')}-${String(n++).padStart(2, '0')}${label ? '-' + label.replace(/[^\w-]+/g, '_').slice(0, 30) : ''}.png`);
  await page.screenshot({ path: p });
  console.log('📸', p);
};

if (all) {
  await page.goto(`file://${file}#1`);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => Deck.slides.length);
  for (let i = 1; i <= total; i++) {
    await page.evaluate((k) => Deck.go(k - 1), i);
    await page.waitForTimeout(firstWait);
    const p = join(out, `all-${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: p });
    console.log('📸', p);
  }
} else {
  // --slide — это data-id слайда (01…10), а не порядковый номер: работает и со сборкой --only
  await page.goto(`file://${file}#1`);
  await page.evaluate(() => document.fonts.ready);
  const idx = await page.evaluate((id) => Deck.slides.findIndex((s) => s.dataset.id === String(id).padStart(2, '0')), slide);
  if (idx < 0) { console.error(`Слайд ${slide} не найден в сборке`); process.exit(2); }
  if (idx > 0) await page.evaluate((i) => Deck.go(i), idx);
  await page.waitForTimeout(firstWait);
  await shot('start');
  const cmds = script.split(';').map((s) => s.trim()).filter(Boolean);
  for (const c of cmds) {
    const [cmd, ...rest] = c.split(/\s+/);
    const arg = rest.join(' ');
    let doShot = auto;
    try {
      if (cmd === 'next') await page.keyboard.press('ArrowRight');
      else if (cmd === 'prev') await page.keyboard.press('ArrowLeft');
      else if (cmd === 'click') await page.click(arg, { timeout: 4000 });
      else if (cmd === 'key') await page.keyboard.press(arg);
      else if (cmd === 'range') {
        const [sel, val] = [rest[0], rest[1]];
        await page.$eval(sel, (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, val);
      } else if (cmd === 'wait') { await page.waitForTimeout(+arg); doShot = false; }
      else if (cmd === 'shot') { await shot(arg || 'shot'); doShot = false; }
      else if (cmd === 'eval') { const r = await page.evaluate(arg); if (r !== undefined) console.log('↳', JSON.stringify(r)); }
      else { console.warn('Неизвестная команда', cmd); doShot = false; }
    } catch (e) { errors.push(`action "${c}": ${e.message.split('\n')[0]}`); }
    if (doShot) { await page.waitForTimeout(stepWait); await shot(c); }
  }
}
const state = await page.evaluate(() => ({ index: Deck.index, id: Deck.current.dataset.id, hash: location.hash }));
console.log('Состояние:', JSON.stringify(state));
if (logs.length) console.log('Консоль:\n  ' + logs.join('\n  '));
if (errors.length) { console.log('ОШИБКИ:\n  ' + errors.join('\n  ')); }
else console.log('Ошибок страницы нет.');
await browser.close();
process.exit(errors.length ? 1 : 0);
