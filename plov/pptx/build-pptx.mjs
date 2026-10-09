#!/usr/bin/env node
// Сборка PowerPoint-версии «Плов как бесконечный ряд».
//   node plov/pptx/build-pptx.mjs                 — собрать plov/plov.pptx (захватит недостающие картинки)
//   node plov/pptx/build-pptx.mjs --capture       — заново снять все картинки из HTML
//   node plov/pptx/build-pptx.mjs --only 03,04 --out /tmp/x.pptx [--capture]
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { captureSlide, captureBackground } from './lib/capture.mjs';
import { SlideBuilder, defineMasters, F } from './lib/deck.mjs';
import { postProcess, notesFromHtml } from './lib/post.mjs';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const HERE = dirname(fileURLToPath(import.meta.url));
const PLOV = resolve(HERE, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes(`--${n}`);
const ONLY = opt('only') ? opt('only').split(',').map((s) => s.trim().padStart(2, '0')) : null;
const OUT = resolve(opt('out', join(PLOV, 'plov.pptx')));
const ASSETS = resolve(opt('assets', join(HERE, 'assets')));
const DECK = join(PLOV, 'plov.html');
const SFX = join(HERE, 'sfx', 'wav');

// 1. HTML-версия и звуки
if (!existsSync(DECK) || flag('rebuild-html')) execSync(`node ${join(PLOV, 'tools', 'build.mjs')}`, { stdio: 'inherit' });
if (!existsSync(join(SFX, 'stamp.wav'))) execSync(`python3 ${join(HERE, 'sfx', 'make_sfx.py')} ${SFX}`, { stdio: 'inherit' });
mkdirSync(ASSETS, { recursive: true });
const BG = join(ASSETS, 'bg.jpg');
if (!existsSync(BG) || flag('capture')) { console.log('[pptx] фон'); await captureBackground(DECK, BG); }

// 2. модули слайдов
const slideFiles = readdirSync(join(HERE, 'slides')).filter((f) => /^\d\d\.mjs$/.test(f)).sort()
  .filter((f) => !ONLY || ONLY.includes(f.slice(0, 2)));
const htmlFiles = readdirSync(join(PLOV, 'src', 'slides')).filter((f) => f.endsWith('.html'));

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Эркинбой';
pres.title = 'Плов как бесконечный ряд';
pres.subject = 'Математическая модель узбекского гостеприимства';
pres.theme = { headFontFace: F.display, bodyFontFace: F.body };
defineMasters(pres, BG);

const specs = [];
for (const f of slideFiles) {
  const id = f.slice(0, 2);
  const mod = await import(pathToFileURL(join(HERE, 'slides', f)).href);
  const outDir = join(ASSETS, id);
  if (mod.capture && (flag('capture') || !existsSync(join(outDir, 'rects.json')))) {
    console.log(`[pptx] захват ${id}`);
    await captureSlide(DECK, { slide: id, ...mod.capture }, outDir);
  }
  const S = new SlideBuilder(pres, { id, assetsDir: ASSETS });
  mod.build(S);
  const html = htmlFiles.find((h) => h.startsWith(id + '-'));
  const notes = notesFromHtml(html ? readFileSync(join(PLOV, 'src', 'slides', html), 'utf8') : '', S.notesExtra || '');
  if (notes) S.slide.addNotes(notes.replace(/\n/g, ' ')); // настоящие абзацы ставит постобработка
  specs.push({ anims: S.anims, transition: S.transition, notes });
}

// 3. запись и постобработка
const tmp = OUT.replace(/\.pptx$/, '.raw.pptx');
await pres.writeFile({ fileName: tmp });
const buf = await postProcess(tmp, specs, { sfxDir: SFX });
writeFileSync(OUT, buf);
// карта анимаций для QA (какие фигуры появляются/исчезают)
writeFileSync(OUT.replace(/\.pptx$/, '.anims.json'), JSON.stringify(specs.map((s) => s.anims), null, 0));
execSync(`rm -f "${tmp}"`);
console.log(`[pptx] ${OUT} — ${(buf.length / 1024 / 1024).toFixed(1)} МБ, слайдов ${specs.length}`);
