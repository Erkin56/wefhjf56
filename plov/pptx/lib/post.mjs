// Пост-обработка .pptx после pptxgenjs: анимации (p:timing), переходы, звуки эффектов,
// русский язык текста (проверка орфографии в PowerPoint) и заметки абзацами.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import JSZip from 'jszip';
import { buildTiming, buildTransition } from './anim.mjs';

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** specs[i] = { anims, transition, notes } для слайда i+1 */
export async function postProcess(file, specs, { sfxDir, log = console.log } = {}) {
  const zip = await JSZip.loadAsync(readFileSync(file));
  const ctPath = '[Content_Types].xml';
  let ct = await zip.file(ctPath).async('string');
  const media = new Set();

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const n = i + 1;
    const slidePath = `ppt/slides/slide${n}.xml`;
    const relsPath = `ppt/slides/_rels/slide${n}.xml.rels`;
    let xml = await zip.file(slidePath).async('string');
    let rels = await zip.file(relsPath).async('string');

    // имена фигур → id и тип
    const ids = {}, kinds = {};
    const scan = (re, kind) => {
      for (const m of xml.matchAll(re)) {
        const block = m[0];
        const c = block.match(/<p:cNvPr id="(\d+)" name="([^"]*)"/);
        if (c) { ids[decode(c[2])] = +c[1]; kinds[decode(c[2])] = kind; }
      }
    };
    scan(/<p:sp>[\s\S]*?<\/p:sp>/g, 'sp');
    scan(/<p:pic>[\s\S]*?<\/p:pic>/g, 'pic');
    scan(/<p:graphicFrame>[\s\S]*?<\/p:graphicFrame>/g, 'chart');

    const sounds = {};
    let rid = 900;
    const sound = (name) => {
      if (sounds[name]) return sounds[name];
      const target = `sfx_${name}.wav`;
      if (!media.has(target)) {
        zip.file(`ppt/media/${target}`, readFileSync(join(sfxDir, `${name}.wav`)));
        media.add(target);
      }
      const id = `rId${rid++}`;
      rels = rels.replace('</Relationships>', `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio" Target="../media/${target}"/></Relationships>`);
      sounds[name] = id;
      return id;
    };

    const timing = spec.anims ? buildTiming(spec.anims, { ids, kinds, sound }) : '';
    const transition = buildTransition(spec.transition || {});
    if (!xml.includes('</p:clrMapOvr></p:sld>') && !xml.match(/<\/p:clrMapOvr>\s*<\/p:sld>/)) throw new Error(`slide${n}: неожиданная структура XML`);
    xml = xml.replace(/<\/p:clrMapOvr>\s*<\/p:sld>/, `</p:clrMapOvr>${transition}${timing}</p:sld>`);
    // русский язык для проверки орфографии
    xml = xml.replace(/lang="en-US"/g, 'lang="ru-RU"');
    zip.file(slidePath, xml);
    zip.file(relsPath, rels);

    // заметки: по абзацу на строку
    const notesPath = `ppt/notesSlides/notesSlide${n}.xml`;
    const nf = zip.file(notesPath);
    if (nf && spec.notes) {
      let nx = await nf.async('string');
      const paras = spec.notes.split('\n').map((line) => `<a:p><a:r><a:rPr lang="ru-RU" dirty="0"/><a:t>${esc(line)}</a:t></a:r></a:p>`).join('');
      nx = nx.replace(/(<p:ph type="body" idx="1"\/><\/p:nvPr><\/p:nvSpPr><p:spPr\/><p:txBody><a:bodyPr\/><a:lstStyle\/>)[\s\S]*?(<\/p:txBody>)/, `$1${paras}$2`);
      zip.file(notesPath, nx);
    }
    log(`  слайд ${n}: фигур ${Object.keys(ids).length}, щелчков ${spec.anims?.clicks?.length || 0}, триггеров ${spec.anims?.triggers?.length || 0}, звуков ${Object.keys(sounds).length}`);
  }
  if (media.size && !/Extension="wav"/.test(ct)) {
    ct = ct.replace('<Default Extension="xml"', '<Default Extension="wav" ContentType="audio/wav"/><Default Extension="xml"');
    zip.file(ctPath, ct);
  }
  const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return out;
}

/** Заметки докладчика из <aside class="notes"> HTML-слайда → простой текст */
export function notesFromHtml(html, extra = '') {
  const m = html.match(/<aside class="notes">([\s\S]*?)<\/aside>/);
  if (!m) return extra;
  const time = (html.match(/data-time="([^"]*)"/) || [])[1] || '';
  const lines = [...m[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((p) => decode(p[1]
    .replace(/<span class="cue">(.*?)<\/span>/g, '[$1]')
    .replace(/<span class="say">([\s\S]*?)<\/span>/g, '«$1»')
    .replace(/<span class="tip">([\s\S]*?)<\/span>/g, '($1)')
    .replace(/<sub>(.*?)<\/sub>/g, '$1')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()));
  return [`Время: ${time}`, ...lines, ...(extra ? ['', extra] : [])].join('\n');
}
