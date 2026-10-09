#!/usr/bin/env node
// Собирает презентацию в один автономный HTML-файл (шрифты, CSS и JS встроены).
// Использование: node plov/tools/build.mjs [--out путь/к/файлу.html]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUT = outIdx >= 0 ? resolve(args[outIdx + 1]) : join(ROOT, 'plov.html');
// --only 01,07 — собрать только эти слайды (для быстрой изолированной проверки)
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 ? args[onlyIdx + 1].split(',').map((x) => x.trim().padStart(2, '0')) : null;

const read = (p) => readFileSync(p, 'utf8');

// ---------- шрифты ----------
const FONTS = [
  ['Unbounded', 'Unbounded.woff2', '300 900', 'normal'],
  ['Manrope', 'Manrope.woff2', '200 800', 'normal'],
  ['PT Serif', 'PTSerif-Regular.woff2', '400', 'normal'],
  ['PT Serif', 'PTSerif-Italic.woff2', '400', 'italic'],
  ['PT Serif', 'PTSerif-Bold.woff2', '700', 'normal'],
  ['Caveat', 'Caveat.woff2', '400 700', 'normal'],
  ['JetBrains Mono', 'JetBrainsMono.woff2', '100 800', 'normal'],
];
const fontCss = FONTS.map(([family, file, weight, style]) => {
  const b64 = readFileSync(join(SRC, 'fonts', file)).toString('base64');
  return `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:${weight};font-style:${style};font-display:block}`;
}).join('\n');

// ---------- слайды ----------
const slideDir = join(SRC, 'slides');
const files = (existsSync(slideDir) ? readdirSync(slideDir).sort() : [])
  .filter((f) => /^\d\d-/.test(f) && (!ONLY || ONLY.includes(f.slice(0, 2))));
const byExt = (ext) => files.filter((f) => f.endsWith(ext)).map((f) => join(slideDir, f));

const slideHtml = byExt('.html').map((f) => {
  const html = read(f);
  if (!/<section[^>]*class="[^"]*\bslide\b[^"]*"[^>]*data-id="\d\d"/.test(html)) {
    console.warn(`[build] ВНИМАНИЕ: ${f} — нет <section class="slide" data-id="NN">`);
  }
  return `<!-- ${f.split('/').pop()} -->\n${html}`;
}).join('\n');

const css = [join(SRC, 'core.css'), ...byExt('.css')].map((f) => `/* ${f.split('/').pop()} */\n${read(f)}`).join('\n');

const jsFiles = [join(SRC, 'core.js'), join(SRC, 'chart.js'), join(SRC, 'art.js'), ...byExt('.js')];
// каждый файл — в своём <script>: синтаксическая ошибка одного слайда не ломает остальные
const js = jsFiles.filter(existsSync).map((f) => {
  const code = read(f);
  if (/<\/script/i.test(code)) throw new Error(`${f}: содержит </script — экранируйте как <\\/script`);
  return `// ===== ${f.split('/').pop()} =====\n;(function(){\n${code}\n})();`;
}).join('\n</script>\n<script>\n') + '\n</script>\n<script>\nDeck.boot();';

let out = read(join(SRC, 'template.html'));
out = out.replace('/*@FONTS@*/', () => fontCss)
  .replace('/*@CSS@*/', () => css)
  .replace('<!--@SLIDES@-->', () => slideHtml)
  .replace('/*@JS@*/', () => js);

writeFileSync(OUT, out);
const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`[build] ${OUT} — ${kb} КБ, слайдов: ${byExt('.html').length}`);
