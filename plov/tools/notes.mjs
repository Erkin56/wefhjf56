#!/usr/bin/env node
// Собирает заметки докладчика из <aside class="notes"> всех слайдов в plov/speaker-notes.md (шпаргалка для печати).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(ROOT, 'src', 'slides');
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();

const attr = (html, name) => (html.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || '';
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—').replace(/&amp;/g, '&');

function toMd(notes) {
  return notes
    .replace(/\r/g, '')
    .replace(/<sub>(.*?)<\/sub>/g, '_$1')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<span class="cue">(.*?)<\/span>/g, '**[$1]**')
    .replace(/<span class="say">([\s\S]*?)<\/span>/g, '«$1»')
    .replace(/<span class="tip">([\s\S]*?)<\/span>/g, '_($1)_')
    .replace(/<p class="tip">([\s\S]*?)<\/p>/g, '\n- _$1_\n')
    .replace(/<p>([\s\S]*?)<\/p>/g, '\n- $1\n')
    .replace(/<[^>]+>/g, '')
    .split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
}

let md = `# Плов как бесконечный ряд — шпаргалка докладчика\n\n`;
md += `Всего 5:00. Клавиши: → / PageDown / пробел — следующий шаг или слайд; ← — назад; F — полный экран; P — окно докладчика с таймером; N — заметки на экране; R — перезапуск слайда; M — звук; B — чёрный экран; 1/2/3 — кнопки на слайдах 2, 4, 9 и 10.\n`;
for (const f of files) {
  const html = readFileSync(join(dir, f), 'utf8');
  const id = attr(html, 'data-id');
  const title = decode(attr(html, 'data-title'));
  const time = attr(html, 'data-time');
  const notes = (html.match(/<aside class="notes">([\s\S]*?)<\/aside>/) || [])[1] || '';
  md += `\n## ${Number(id)}. ${title} (${time})\n\n${decode(toMd(notes))}\n`;
}
const out = join(ROOT, 'speaker-notes.md');
writeFileSync(out, md);
console.log(`[notes] ${out}: слайдов ${files.length}`);
