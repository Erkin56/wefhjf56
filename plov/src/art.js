/* Art — иллюстрации кодом (SVG): исследователь, бабушки, гость, казан, ляган с пловом,
   чайник «пахта», пиала, лепёшка, карта. Единый стиль: плоские заливки, тёмный контур 5px.
   Каждая функция возвращает строку SVG. Настроение персонажа: data-mood="…" или Art.mood(el, '…'). */
'use strict';

const INK = '#1b1814';

// детерминированный ГСЧ, чтобы рисунок не «прыгал» между перезагрузками
function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const Art = {};

/* ---------- общие defs: паттерны, фильтры, градиенты ---------- */
Art.injectDefs = function () {
  const host = document.getElementById('art-defs');
  if (!host || host.dataset.ready) return;
  host.dataset.ready = '1';
  // рисинки для текстуры плова
  const r = rng(7); let grains = '';
  for (let i = 0; i < 34; i++) {
    const x = (r() * 64).toFixed(1), y = (r() * 64).toFixed(1), a = (r() * 180).toFixed(0);
    const c = ['#fbf1d6', '#f7e3ad', '#fff6dd', '#efcf7c', '#f3dc9c'][(r() * 5) | 0];
    grains += `<ellipse cx="${x}" cy="${y}" rx="5.2" ry="2.1" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`;
  }
  // атлас (икат): вертикальные «языки пламени»
  const atlas = `
    <rect width="72" height="96" fill="#c2185b"/>
    <path d="M0 0 h18 c-10 12 10 24 0 36 c10 12 -10 24 0 36 c-10 12 0 18 0 24 h-18z" fill="#f6bb2a"/>
    <path d="M18 0 h18 c-8 12 8 24 0 36 c8 12 -8 24 0 36 c-8 12 0 18 0 24 h-18 c10 -6 -10 -12 0 -24 c-10 -12 10 -24 0 -36 c10 -12 -10 -24 0 -36z" fill="#1f8a5b"/>
    <path d="M36 0 h14 c-8 12 8 24 0 36 c8 12 -8 24 0 36 c-8 12 0 18 0 24 h-14 c8 -6 -8 -12 0 -24 c-8 -12 8 -24 0 -36 c8 -12 -8 -24 0 -36z" fill="#f5ebd5"/>
    <path d="M50 0 h22 v96 h-22 c-8 -6 8 -12 0 -24 c8 -12 -8 -24 0 -36 c-8 -12 8 -24 0 -36 c8 -12 -8 -24 0 -36z" fill="#2453b0"/>`;
  host.innerHTML = `
  <defs>
    <pattern id="p-rice" patternUnits="userSpaceOnUse" width="64" height="64">
      <rect width="64" height="64" fill="#f2d48a"/>${grains}
    </pattern>
    <pattern id="p-atlas" patternUnits="userSpaceOnUse" width="72" height="96">${atlas}</pattern>
    <pattern id="p-dots" patternUnits="userSpaceOnUse" width="34" height="34">
      <rect width="34" height="34" fill="#3b5ba8"/><circle cx="8" cy="8" r="4" fill="#f5ebd5"/><circle cx="25" cy="25" r="4" fill="#f5ebd5"/>
    </pattern>
    <pattern id="p-flowers" patternUnits="userSpaceOnUse" width="56" height="56">
      <rect width="56" height="56" fill="#d1352a"/>
      <g fill="#f6bb2a"><circle cx="14" cy="14" r="5"/><circle cx="14" cy="5" r="4.5"/><circle cx="14" cy="23" r="4.5"/><circle cx="5" cy="14" r="4.5"/><circle cx="23" cy="14" r="4.5"/></g>
      <circle cx="14" cy="14" r="3.5" fill="#d1352a"/>
      <g fill="#f5ebd5"><circle cx="42" cy="42" r="4"/><circle cx="42" cy="34" r="3.5"/><circle cx="42" cy="50" r="3.5"/><circle cx="34" cy="42" r="3.5"/><circle cx="50" cy="42" r="3.5"/></g>
      <path d="M30 18 q6 -6 12 0 q-6 6 -12 0z" fill="#2e8b57"/>
    </pattern>
    <pattern id="p-cotton" patternUnits="userSpaceOnUse" width="60" height="60">
      <rect width="60" height="60" fill="#1f3f95"/>
      <g fill="#f5ebd5"><circle cx="15" cy="15" r="6"/><circle cx="23" cy="13" r="5"/><circle cx="19" cy="21" r="5"/></g>
      <path d="M19 25 q-2 8 -8 12" stroke="#d6a33a" stroke-width="2" fill="none"/>
      <g fill="#f5ebd5"><circle cx="45" cy="44" r="6"/><circle cx="52" cy="42" r="5"/><circle cx="48" cy="50" r="5"/></g>
      <path d="M48 54 q-2 6 -8 8" stroke="#d6a33a" stroke-width="2" fill="none"/>
    </pattern>
    <radialGradient id="g-mound" cx="40%" cy="25%" r="80%">
      <stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/>
      <stop offset=".55" stop-color="#f6bb2a" stop-opacity="0"/>
      <stop offset="1" stop-color="#b8650c" stop-opacity=".45"/>
    </radialGradient>
    <linearGradient id="g-kazan" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#1c1c20"/><stop offset=".35" stop-color="#3b3b42"/><stop offset=".5" stop-color="#4a4a52"/><stop offset="1" stop-color="#151518"/>
    </linearGradient>
    <linearGradient id="g-gold" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#f6bb2a"/><stop offset="1" stop-color="#b9780c"/>
    </linearGradient>
    <radialGradient id="g-flame" cx="50%" cy="80%" r="70%">
      <stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#ffb22e"/><stop offset="1" stop-color="#e8432d"/>
    </radialGradient>
    <filter id="f-stamp" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -8 5.7" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in" result="c"/>
      <feTurbulence type="turbulence" baseFrequency=".04" numOctaves="1" seed="9" result="w"/>
      <feDisplacementMap in="c" in2="w" scale="3"/>
    </filter>
    <filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>`;
};

/* плитка орнамента-гириха для фона */
Art.ornamentTile = function () {
  const c = 65, R = 34, r = 15;
  let star = '';
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2, rad = i % 2 ? r : R;
    star += `${i ? 'L' : 'M'}${(c + rad * Math.cos(a)).toFixed(1)},${(c + rad * Math.sin(a)).toFixed(1)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" viewBox="0 0 130 130" fill="none" stroke="#f6bb2a" stroke-width="2.2">
    <path d="${star}Z"/><circle cx="65" cy="65" r="8"/>
    <path d="M65 0 V31 M65 99 V130 M0 65 H31 M99 65 H130 M0 0 L41 41 M130 0 L89 41 M0 130 L41 89 M130 130 L89 89"/>
    <path d="M0 22 Q22 22 22 0 M108 0 Q108 22 130 22 M0 108 Q22 108 22 130 M108 130 Q108 108 130 108"/></svg>`;
};

/* ---------- плов ---------- */
// горка плова: основание на y=0, центр по x=0, ширина w, высота h
Art.plovMound = function ({ w = 300, h = 140, seed = 3, garlic = true, meat = true } = {}) {
  const r = rng(seed);
  const dome = `M${-w / 2},0 C${-w / 2},${-h * .62} ${-w * .3},${-h} 0,${-h} C${w * .3},${-h} ${w / 2},${-h * .62} ${w / 2},0 Z`;
  let bits = '';
  // морковь соломкой
  for (let i = 0; i < Math.round(w / 14); i++) {
    const t = r(), x = (r() - .5) * w * .82;
    const top = -h * Math.sqrt(Math.max(0, 1 - Math.pow(x / (w / 2), 2))) * .92;
    const y = top + r() * (-top - 10) + 4;
    const a = (r() * 140 - 70).toFixed(0);
    bits += `<rect x="${(x - 13).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="26" height="6.5" rx="3" fill="${t > .5 ? '#f08a1f' : '#e7741a'}" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  // нут и изюм
  for (let i = 0; i < Math.round(w / 40); i++) {
    const x = (r() - .5) * w * .7, top = -h * Math.sqrt(Math.max(0, 1 - Math.pow(x / (w / 2), 2))) * .85;
    const y = top + r() * (-top - 16) + 8;
    bits += r() > .5
      ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#e9c27a" stroke="${INK}" stroke-width="2"/>`
      : `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="3.4" fill="#4a1f2a"/>`;
  }
  // кусочки мяса сверху
  let meatBits = '';
  if (meat) {
    [[-.18, .78], [.2, .74], [.02, .88], [-.34, .52], [.36, .5]].forEach(([fx, fy], i) => {
      const x = fx * w, y = -fy * h;
      meatBits += `<path d="M${x - 20},${y + 6} q-4,-16 12,-20 q18,-4 26,8 q6,14 -8,20 q-18,6 -30,-8z" fill="${i % 2 ? '#8a4322' : '#743516'}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    });
  }
  // головка чеснока на вершине
  const g = garlic ? `
    <g transform="translate(0,${-h + 6})">
      <path d="M-30,0 C-34,-30 -14,-46 0,-50 C14,-46 34,-30 30,0 C18,10 -18,10 -30,0Z" fill="#f7efe0" stroke="${INK}" stroke-width="4"/>
      <path d="M-14,4 C-20,-18 -10,-38 0,-48 M14,4 C20,-18 10,-38 0,-48 M0,6 V-48" stroke="#c9b9a0" stroke-width="3" fill="none"/>
      <path d="M0,-50 q-2,-12 4,-18" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>` : '';
  return `<g class="plov-mound">
    <path d="${dome}" fill="url(#p-rice)"/>
    <path d="${dome}" fill="url(#g-mound)"/>
    <g>${bits}</g>${meatBits}
    <path d="${dome}" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    ${g}
  </g>`;
};

// ляган (риштанская керамика) с пловом. amount — сколько порций (1 = обычная горка)
Art.plate = function ({ w = 520, amount = 1, seed = 3, garlic = true, empty = false } = {}) {
  const ry = w * .17, cx = w / 2 + 20, cy = w * .62;
  const r = rng(seed + 11);
  let rim = '';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const x = cx + Math.cos(a) * (w / 2 - 22), y = cy + Math.sin(a) * (ry - 9);
    rim += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4.5" fill="${i % 2 ? '#f5ebd5' : '#1fa3b4'}" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  const mw = w * .66, mh = w * .3;
  const s = Art.amountScale(amount);
  return `<svg class="art art-plate" viewBox="0 ${-w * .9} ${w + 40} ${w * .9 + cy + ry + 30}" data-amount="${amount}">
    <ellipse cx="${cx}" cy="${cy + ry * .35}" rx="${w / 2 + 6}" ry="${ry + 6}" fill="rgba(0,0,0,.35)" filter="url(#f-soft)"/>
    <ellipse cx="${cx}" cy="${cy + 10}" rx="${w / 2}" ry="${ry}" fill="#173a86" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${ry}" fill="#2453b0" stroke="${INK}" stroke-width="5"/>
    <g>${rim}</g>
    <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 40}" ry="${ry - 16}" fill="#f5ebd5" stroke="#1f3f95" stroke-width="4"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 70}" ry="${ry - 28}" fill="none" stroke="#1fa3b4" stroke-width="3" stroke-dasharray="6 10"/>
    <g class="mound-pos" transform="translate(${cx},${cy + ry * .35})">
      <g class="mound" transform="scale(${s.x.toFixed(3)},${s.y.toFixed(3)})" style="${empty ? 'display:none' : ''}">${Art.plovMound({ w: mw, h: mh, seed, garlic })}</g>
    </g>
  </svg>`;
};

// как количество порций превращается в размер горки (ширина растёт медленнее высоты)
Art.amountScale = function (amount) {
  const a = Math.max(0, amount);
  return { x: Math.pow(a, .42), y: Math.pow(a, .78) };
};
// плавно изменить горку плова в SVG ляганa/казана: Art.setAmount(svgEl, 0.3, 700)
Art.setAmount = function (svg, amount, ms = 700, easing = ease.outBack) {
  const g = svg.querySelector('.mound'); if (!g) return Promise.resolve();
  const from = parseFloat(svg.dataset.amount || '1');
  svg.dataset.amount = amount;
  g.style.display = '';
  return Tween.num(from, amount, ms, (v) => {
    const s = Art.amountScale(Math.max(0, v));
    g.setAttribute('transform', `scale(${s.x.toFixed(4)},${s.y.toFixed(4)})`);
  }, easing);
};

/* ---------- казан ---------- */
Art.kazan = function ({ w = 600, steam = true, fire = true, seed = 5, amount = 1 } = {}) {
  const s = Art.amountScale(amount);
  const st = steam ? `
    <g class="steam" fill="none" stroke="#f5ebd5" stroke-width="10" stroke-linecap="round" opacity=".7">
      <path class="st st1" d="M220,120 q-24,-40 0,-80 q24,-40 0,-80"/>
      <path class="st st2" d="M300,110 q24,-40 0,-80 q-24,-40 0,-80"/>
      <path class="st st3" d="M380,120 q-24,-40 0,-80 q24,-40 0,-80"/>
    </g>` : '';
  const fr = fire ? `
    <g class="fire">
      <path class="fl fl1" d="M190,560 q-30,-60 10,-110 q0,40 30,60 q10,-30 0,-60 q50,40 30,110z" fill="url(#g-flame)" stroke="${INK}" stroke-width="4"/>
      <path class="fl fl2" d="M270,566 q-30,-70 20,-130 q-4,50 26,70 q14,-34 4,-64 q50,50 24,124z" fill="url(#g-flame)" stroke="${INK}" stroke-width="4"/>
      <path class="fl fl3" d="M360,560 q-28,-56 10,-104 q2,36 28,54 q12,-26 2,-54 q46,40 26,104z" fill="url(#g-flame)" stroke="${INK}" stroke-width="4"/>
    </g>
    <rect x="130" y="556" width="340" height="24" rx="10" fill="#4a3a2e" stroke="${INK}" stroke-width="5"/>` : '';
  return `<svg class="art art-kazan" viewBox="0 -280 ${w} ${w + 300}" data-amount="${amount}">
    ${st}
    ${fr}
    <g class="mound-pos" transform="translate(300,236)">
      <g class="mound" transform="scale(${s.x.toFixed(3)},${s.y.toFixed(3)})">${Art.plovMound({ w: 470, h: 200, seed, garlic: true })}</g>
    </g>
    <path d="M40,236 Q46,300 82,360 Q140,470 300,480 Q460,470 518,360 Q554,300 560,236 Z" fill="url(#g-kazan)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M96,300 Q150,430 300,446" fill="none" stroke="#6a6a74" stroke-width="7" stroke-linecap="round" opacity=".6"/>
    <path d="M26,226 Q300,262 574,226 L574,250 Q300,286 26,250 Z" fill="#26262b" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M40,252 q-40,6 -36,40 q4,24 30,20" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M40,252 q-40,6 -36,40 q4,24 30,20" fill="none" stroke="#3b3b42" stroke-width="6" stroke-linecap="round"/>
    <path d="M560,252 q40,6 36,40 q-4,24 -30,20" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M560,252 q40,6 36,40 q-4,24 -30,20" fill="none" stroke="#3b3b42" stroke-width="6" stroke-linecap="round"/>
  </svg>`;
};

/* ---------- капгир (шумовка для плова) ---------- */
Art.kapgir = function () {
  let holes = '';
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) if (Math.abs(i) + Math.abs(j) < 3) holes += `<circle cx="${60 + i * 16}" cy="${60 + j * 14}" r="4" fill="${INK}"/>`;
  return `<svg class="art art-kapgir" viewBox="0 0 120 420">
    <rect x="54" y="110" width="12" height="300" rx="6" fill="#c9cbd1" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="60" cy="60" rx="54" ry="50" fill="#d9dbe0" stroke="${INK}" stroke-width="5"/>${holes}
  </svg>`;
};

/* ---------- лица: варианты настроений (показываются через CSS по data-mood) ---------- */
const MOODS = ['serious', 'smug', 'shock', 'happy', 'kind', 'determined', 'worried', 'neutral', 'polite', 'surprised', 'panic', 'full', 'dizzy', 'proud'];
Art.MOODS = MOODS;
Art.mood = function (el, mood) { const svg = el.matches('svg') ? el : el.querySelector('svg.art'); if (svg) svg.setAttribute('data-mood', mood); };

/* ---------- исследователь Эркинбой ---------- */
Art.researcher = function ({ mood = 'serious', note = 'n = 1' } = {}) {
  return `<svg class="art art-researcher" viewBox="-140 0 500 660" data-mood="${mood}">
    <ellipse cx="180" cy="638" rx="120" ry="14" fill="rgba(0,0,0,.35)"/>
    <!-- ноги -->
    <path d="M140,470 L134,612 L174,612 L180,470 Z" fill="#202a42" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M180,470 L186,612 L226,612 L220,470 Z" fill="#202a42" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M128,604 Q118,632 148,634 L178,634 Q184,614 174,604 Z" fill="#141518" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M186,604 Q180,632 210,634 L240,634 Q244,614 228,604 Z" fill="#141518" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <!-- левая рука с блокнотом -->
    <path d="M244,304 Q274,318 278,382 L282,452 Q268,464 252,454 L246,382 Z" fill="#2c3a5e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <!-- пиджак -->
    <path d="M112,300 Q100,320 102,380 L106,488 Q180,502 254,488 L258,380 Q260,320 248,300 Q216,282 180,284 Q144,282 112,300 Z" fill="#2c3a5e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150,288 L180,372 L210,288 Q180,298 150,288 Z" fill="#f5ebd5" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M170,292 L190,292 L186,305 L174,305 Z" fill="#cf9214" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M174,305 L186,305 L195,372 L180,392 L165,372 Z" fill="#f6bb2a" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M168,340 L192,330 M166,360 L194,350" stroke="#cf9214" stroke-width="4"/>
    <path d="M146,290 L178,370 L152,336 L126,318 L138,296 Z" fill="#23304f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M214,290 L182,370 L208,336 L234,318 L222,296 Z" fill="#23304f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M216,346 L240,342 L236,352 L220,354 Z" fill="#e8432d" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="180" cy="420" r="6" fill="#f6bb2a" stroke="${INK}" stroke-width="3"/>
    <circle cx="180" cy="452" r="6" fill="#f6bb2a" stroke="${INK}" stroke-width="3"/>
    <!-- блокнот -->
    <g transform="rotate(-8 300 452)">
      <rect x="262" y="400" width="82" height="104" rx="8" fill="#f5ebd5" stroke="${INK}" stroke-width="5"/>
      <path d="M274,400 v-8 M290,400 v-8 M306,400 v-8 M322,400 v-8" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <text x="306" y="446" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="30" fill="#e8432d">${note}</text>
      <path d="M282,470 h46 M282,484 h34" stroke="#a39d90" stroke-width="3"/>
    </g>
    <circle cx="270" cy="462" r="15" fill="#d9a06e" stroke="${INK}" stroke-width="5"/>
    <!-- правая рука с указкой -->
    <g class="arm-point">
      <line x1="58" y1="226" x2="-118" y2="36" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <line x1="58" y1="226" x2="-118" y2="36" stroke="#d9a441" stroke-width="7" stroke-linecap="round"/>
      <circle cx="-118" cy="36" r="10" fill="#e8432d" stroke="${INK}" stroke-width="4"/>
      <path d="M116,302 Q86,300 66,262 L50,234 Q60,216 78,226 L96,256 Q110,276 126,284 Z" fill="#2c3a5e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="58" cy="226" r="18" fill="#d9a06e" stroke="${INK}" stroke-width="5"/>
    </g>
    <!-- голова -->
    <rect x="163" y="248" width="34" height="44" fill="#b97f52" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="106" cy="192" rx="14" ry="20" fill="#d9a06e" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="254" cy="192" rx="14" ry="20" fill="#d9a06e" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="180" cy="188" rx="74" ry="84" fill="#d9a06e" stroke="${INK}" stroke-width="5"/>
    <path d="M106,176 Q102,124 140,108 L220,108 Q258,124 254,176 Q246,150 230,144 L130,144 Q114,150 106,176 Z" fill="#1a1614" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <!-- дўппи (тюбетейка): чёрная с белыми «перчиками» -->
    <path d="M106,134 L114,80 Q180,58 246,80 L254,134 Q180,122 106,134 Z" fill="#141416" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M148,122 C132,106 138,84 158,80 C151,94 153,108 164,119 Z" fill="#f5ebd5"/>
    <path d="M212,122 C228,106 222,84 202,80 C209,94 207,108 196,119 Z" fill="#f5ebd5"/>
    <path d="M118,126 C112,112 116,96 124,90 C122,102 124,112 128,122 Z" fill="#f5ebd5" opacity=".9"/>
    <path d="M242,126 C248,112 244,96 236,90 C238,102 236,112 232,122 Z" fill="#f5ebd5" opacity=".9"/>
    <path d="M172,74 q8,-8 16,0 q-8,8 -16,0z" fill="#f5ebd5"/>
    <path d="M110,130 Q180,118 250,130" fill="none" stroke="#f5ebd5" stroke-width="3" stroke-dasharray="7 5"/>
    <!-- лицо -->
    <path d="M180,194 Q172,214 184,218" fill="none" stroke="#a86d43" stroke-width="4" stroke-linecap="round"/>
    <g class="eyes">
      <g class="mv mv-serious mv-smug mv-happy mv-proud"><ellipse cx="154" cy="186" rx="6" ry="7.5" fill="${INK}"/><ellipse cx="206" cy="186" rx="6" ry="7.5" fill="${INK}"/></g>
      <g class="mv mv-shock"><circle cx="154" cy="186" r="12" fill="#fff"/><circle cx="206" cy="186" r="12" fill="#fff"/><circle cx="154" cy="187" r="5" fill="${INK}"/><circle cx="206" cy="187" r="5" fill="${INK}"/></g>
    </g>
    <g class="glasses" fill="rgba(255,255,255,.14)" stroke="${INK}" stroke-width="5">
      <circle cx="154" cy="186" r="24"/><circle cx="206" cy="186" r="24"/>
      <path d="M178,184 Q180,178 182,184 M130,182 L112,178 M230,182 L248,178" fill="none"/>
      <path d="M140,172 q8,-6 16,-4" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>
    </g>
    <g fill="none" stroke="#1a1614" stroke-width="7" stroke-linecap="round">
      <path class="mv mv-serious mv-proud" d="M138,154 L168,158 M192,158 L222,154"/>
      <path class="mv mv-smug" d="M138,146 L168,154 M192,158 L222,156"/>
      <path class="mv mv-happy" d="M138,152 Q153,146 168,152 M192,152 Q207,146 222,152"/>
      <path class="mv mv-shock" d="M136,142 Q152,132 168,142 M192,142 Q208,132 224,142"/>
    </g>
    <g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
      <path class="mv mv-serious" d="M166,238 Q180,240 194,238"/>
      <path class="mv mv-smug" d="M164,238 Q184,244 200,228"/>
      <path class="mv mv-happy mv-proud" d="M160,230 Q180,250 200,230"/>
    </g>
    <ellipse class="mv mv-shock" cx="180" cy="238" rx="13" ry="17" fill="#5a1d12" stroke="${INK}" stroke-width="5"/>
  </svg>`;
};

/* ---------- бабушка: variant 'uz' (узбекская) или 'ru' (русская) ---------- */
Art.grandma = function ({ variant = 'uz', mood = 'kind', holding = 'plate', amount = 1, seed = 4 } = {}) {
  const uz = variant === 'uz';
  const dressFill = uz ? 'url(#p-atlas)' : 'url(#p-dots)';
  const skin = '#e2ab7f', skin2 = '#bf8458';
  // что в руках
  let held = '';
  if (holding === 'plate') {
    const s = Art.amountScale(amount);
    held = `<g class="held">
      <ellipse cx="220" cy="414" rx="156" ry="36" fill="#173a86" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="220" cy="406" rx="156" ry="36" fill="#2453b0" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="220" cy="406" rx="128" ry="25" fill="#f5ebd5" stroke="#1f3f95" stroke-width="4"/>
      <g class="mound-pos" transform="translate(220,412)"><g class="mound" transform="scale(${s.x.toFixed(3)},${s.y.toFixed(3)})">${Art.plovMound({ w: 210, h: 100, seed, garlic: true })}</g></g>
    </g>`;
  } else if (holding === 'pirozhki') {
    let pz = '';
    [[150, 394], [196, 386], [244, 386], [290, 394], [172, 364], [220, 358], [266, 364]].forEach(([x, y], i) => {
      pz += `<g transform="translate(${x},${y}) rotate(${i % 2 ? -8 : 6})"><path d="M-30,6 Q-30,-22 0,-24 Q30,-22 30,6 Q0,16 -30,6Z" fill="#d98a2b" stroke="${INK}" stroke-width="4"/><path d="M-18,-10 Q0,-18 16,-10" stroke="#f6c46a" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    });
    held = `<g class="held">
      <ellipse cx="220" cy="414" rx="150" ry="34" fill="#e6dcc6" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="220" cy="408" rx="150" ry="34" fill="#f8f4ea" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="220" cy="408" rx="120" ry="22" fill="none" stroke="#2453b0" stroke-width="4" stroke-dasharray="3 9"/>
      ${pz}</g>`;
  }
  const hands = holding === 'none'
    ? `<circle cx="206" cy="420" r="19" fill="${skin}" stroke="${INK}" stroke-width="5"/><circle cx="234" cy="420" r="19" fill="${skin}" stroke="${INK}" stroke-width="5"/>`
    : `<circle cx="74" cy="408" r="19" fill="${skin}" stroke="${INK}" stroke-width="5"/><circle cx="366" cy="408" r="19" fill="${skin}" stroke="${INK}" stroke-width="5"/>`;
  const sleeves = holding === 'none'
    ? `<path d="M152,306 Q118,350 138,410 L196,420 Q176,380 176,330 Z" fill="${dressFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M288,306 Q322,350 302,410 L244,420 Q264,380 264,330 Z" fill="${dressFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="M150,306 Q100,330 70,394 L96,416 Q130,370 172,338 Z" fill="${dressFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M290,306 Q340,330 370,394 L344,416 Q310,370 268,338 Z" fill="${dressFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const vest = uz ? `
    <path d="M152,302 Q136,390 140,486 L192,486 L206,334 Q192,304 152,302 Z" fill="#1d4a3b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M288,302 Q304,390 300,486 L248,486 L234,334 Q248,304 288,302 Z" fill="#1d4a3b" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M198,340 L190,480 M242,340 L250,480" stroke="#f6bb2a" stroke-width="5" stroke-dasharray="2 8" stroke-linecap="round"/>`
    : `<path d="M168,336 L156,600 L284,600 L272,336 Q220,350 168,336 Z" fill="#f8f4ea" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M160,560 L280,560 L284,600 L156,600 Z" fill="#d1352a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
       <rect x="190" y="440" width="60" height="50" rx="8" fill="none" stroke="#d1352a" stroke-width="4"/>`;
  // платок
  const scarfBack = uz
    ? `<path d="M128,214 Q120,108 220,100 Q320,108 312,214 Q330,286 304,330 L136,330 Q110,286 128,214 Z" fill="#f7f2e6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="M130,206 Q126,100 220,96 Q314,100 310,206 Q306,262 264,286 L176,286 Q134,262 130,206 Z" fill="url(#p-flowers)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const scarfFront = uz
    ? `<path d="M144,176 Q148,118 220,114 Q292,118 296,176 Q262,144 220,144 Q178,144 144,176 Z" fill="#f7f2e6" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M150,170 Q182,146 220,146 Q258,146 290,170" fill="none" stroke="#f6bb2a" stroke-width="6" stroke-dasharray="1 10" stroke-linecap="round"/>`
    : `<path d="M142,180 Q144,112 220,108 Q296,112 298,180 Q262,146 220,146 Q178,146 142,180 Z" fill="url(#p-flowers)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M196,282 L220,304 L244,282 L262,318 L220,312 L178,318 Z" fill="url(#p-flowers)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <circle cx="220" cy="292" r="12" fill="#d1352a" stroke="${INK}" stroke-width="4"/>`;
  const glasses = uz ? '' : `<g fill="rgba(255,255,255,.18)" stroke="${INK}" stroke-width="4"><circle cx="190" cy="200" r="20"/><circle cx="250" cy="200" r="20"/><path d="M210,198 Q220,192 230,198" fill="none"/></g>`;
  return `<svg class="art art-grandma art-grandma--${variant}" viewBox="0 0 440 660" data-mood="${mood}">
    <ellipse cx="220" cy="642" rx="160" ry="14" fill="rgba(0,0,0,.35)"/>
    <ellipse cx="180" cy="628" rx="28" ry="12" fill="#3a2016" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="262" cy="628" rx="28" ry="12" fill="#3a2016" stroke="${INK}" stroke-width="4"/>
    ${scarfBack}
    <path d="M150,300 Q120,420 84,622 Q220,646 356,622 Q320,420 290,300 Q220,284 150,300 Z" fill="${dressFill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    ${vest}
    ${sleeves}
    ${held}
    ${hands}
    <ellipse cx="220" cy="204" rx="76" ry="80" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <path d="M154,170 Q186,152 220,152 Q254,152 286,170 Q254,162 220,162 Q186,162 154,170 Z" fill="#cfc9be"/>
    ${scarfFront}
    <circle cx="176" cy="232" r="17" fill="#f0806a" opacity=".45"/>
    <circle cx="264" cy="232" r="17" fill="#f0806a" opacity=".45"/>
    <path d="M218,206 Q210,224 222,228" fill="none" stroke="${skin2}" stroke-width="4" stroke-linecap="round"/>
    <g fill="none" stroke="${skin2}" stroke-width="3" stroke-linecap="round"><path d="M160,200 l-10,-4 M160,208 l-10,2 M280,200 l10,-4 M280,208 l10,2"/><path d="M200,252 q-6,4 -4,10 M240,252 q6,4 4,10"/></g>
    <g class="eyes" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
      <path class="mv mv-kind mv-happy mv-proud" d="M176,204 Q190,190 204,204 M236,204 Q250,190 264,204"/>
      <g class="mv mv-determined mv-worried mv-shock" stroke="none"><ellipse cx="190" cy="202" rx="7.5" ry="9.5" fill="${INK}"/><ellipse cx="250" cy="202" rx="7.5" ry="9.5" fill="${INK}"/><circle cx="193" cy="198" r="2.6" fill="#fff"/><circle cx="253" cy="198" r="2.6" fill="#fff"/></g>
    </g>
    ${glasses}
    <g fill="none" stroke="#9c958a" stroke-width="6" stroke-linecap="round">
      <path class="mv mv-kind mv-happy mv-proud" d="M172,180 Q188,172 204,178 M236,178 Q252,172 268,180"/>
      <path class="mv mv-determined" d="M170,176 L206,186 M270,176 L234,186"/>
      <path class="mv mv-worried mv-shock" d="M172,186 L204,172 M268,186 L236,172"/>
    </g>
    <path class="mv mv-kind mv-happy mv-proud" d="M194,244 Q220,272 246,244 Q220,252 194,244 Z" fill="#7a2416" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path class="mv mv-determined" d="M198,246 Q222,262 246,242" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <ellipse class="mv mv-worried mv-shock" cx="220" cy="250" rx="10" ry="12" fill="#7a2416" stroke="${INK}" stroke-width="5"/>
  </svg>`;
};

/* ---------- гость (студент) ---------- */
Art.guest = function ({ mood = 'neutral', full = 0 } = {}) {
  const skin = '#f2c7a2', skin2 = '#cf9a73', hood = '#3a8c7e', hood2 = '#2b6b60';
  const torso = 'M108,300 Q96,340 100,400 L104,488 Q180,500 256,488 L260,400 Q264,340 252,300 Q216,284 180,284 Q144,284 108,300 Z';
  return `<svg class="art art-guest" viewBox="0 0 360 660" data-mood="${mood}" style="--full:${full}">
    <ellipse cx="180" cy="640" rx="120" ry="14" fill="rgba(0,0,0,.35)"/>
    <path d="M140,470 L134,610 L174,610 L180,470 Z" fill="#3d5a80" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M180,470 L186,610 L226,610 L220,470 Z" fill="#3d5a80" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M126,602 Q116,634 150,636 L180,636 Q186,614 174,602 Z" fill="#f5ebd5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M186,602 Q180,634 212,636 L242,636 Q246,614 228,602 Z" fill="#f5ebd5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M120,628 h56 M188,628 h54" stroke="#e8432d" stroke-width="6"/>
    <!-- руки -->
    <path d="M110,306 Q80,330 76,400 L78,452 Q92,462 104,452 L108,400 Z" fill="${hood}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M250,306 Q280,330 284,400 L282,452 Q268,462 256,452 L252,400 Z" fill="${hood}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="90" cy="460" r="17" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <circle cx="270" cy="460" r="17" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <!-- туловище + живот (контур — общий) -->
    <g stroke="${INK}" stroke-width="10" stroke-linejoin="round" fill="none">
      <path d="${torso}"/><ellipse class="belly" cx="180" cy="420" rx="78" ry="70" vector-effect="non-scaling-stroke"/>
    </g>
    <g fill="${hood}">
      <path d="${torso}"/><ellipse class="belly" cx="180" cy="420" rx="78" ry="70"/>
    </g>
    <path class="belly" d="M134,440 L226,440 L236,482 L124,482 Z" fill="${hood2}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <path d="M160,296 Q180,318 200,296" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M166,304 L162,350 M194,304 L198,350" stroke="#f5ebd5" stroke-width="4" stroke-linecap="round"/>
    <!-- голова -->
    <rect x="163" y="252" width="34" height="40" fill="${skin2}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="108" cy="194" rx="13" ry="18" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="252" cy="194" rx="13" ry="18" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="180" cy="190" rx="72" ry="80" fill="${skin}" stroke="${INK}" stroke-width="5"/>
    <g class="mv mv-full"><circle cx="124" cy="222" r="24" fill="${skin}" stroke="${INK}" stroke-width="4"/><circle cx="236" cy="222" r="24" fill="${skin}" stroke="${INK}" stroke-width="4"/></g>
    <path d="M108,176 Q96,100 172,94 Q248,88 256,156 Q252,176 248,180 Q240,136 200,132 Q190,150 160,146 Q140,144 128,158 Q114,166 108,176 Z" fill="#6b4426" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150,100 q10,-24 34,-20 q-8,10 -4,22" fill="#6b4426" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="140" cy="226" r="14" fill="#f0806a" opacity=".35"/><circle cx="220" cy="226" r="14" fill="#f0806a" opacity=".35"/>
    <path d="M180,196 Q174,212 184,214" fill="none" stroke="${skin2}" stroke-width="4" stroke-linecap="round"/>
    <!-- глаза -->
    <g class="eyes">
      <g class="mv mv-neutral mv-polite mv-panic"><ellipse cx="152" cy="190" rx="8" ry="10" fill="${INK}"/><ellipse cx="208" cy="190" rx="8" ry="10" fill="${INK}"/><circle cx="155" cy="186" r="2.8" fill="#fff"/><circle cx="211" cy="186" r="2.8" fill="#fff"/></g>
      <g class="mv mv-surprised mv-shock"><circle cx="152" cy="190" r="15" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="208" cy="190" r="15" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="152" cy="192" r="5" fill="${INK}"/><circle cx="208" cy="192" r="5" fill="${INK}"/></g>
      <path class="mv mv-full mv-happy" d="M140,192 Q152,182 164,192 M196,192 Q208,182 220,192" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <g class="mv mv-dizzy" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"><path d="M152,190 m-2,0 a2,2 0 1,1 4,0 a5,5 0 1,1 -10,0 a8,8 0 1,1 16,0 a11,11 0 1,1 -22,0"/><path d="M208,190 m-2,0 a2,2 0 1,1 4,0 a5,5 0 1,1 -10,0 a8,8 0 1,1 16,0 a11,11 0 1,1 -22,0"/></g>
    </g>
    <g fill="none" stroke="#6b4426" stroke-width="6" stroke-linecap="round">
      <path class="mv mv-neutral mv-full mv-dizzy mv-happy" d="M136,166 Q150,160 166,166 M194,166 Q210,160 224,166"/>
      <path class="mv mv-polite" d="M136,162 Q150,154 166,160 M194,160 Q210,154 224,162"/>
      <path class="mv mv-surprised mv-shock" d="M134,152 Q150,140 166,150 M194,150 Q210,140 226,152"/>
      <path class="mv mv-panic" d="M136,170 L166,158 M224,170 L194,158"/>
    </g>
    <!-- рот -->
    <g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
      <path class="mv mv-neutral" d="M168,236 Q180,240 192,236"/>
      <path class="mv mv-polite mv-happy" d="M162,230 Q180,248 198,230"/>
      <path class="mv mv-panic" d="M158,240 Q166,230 174,240 Q182,250 190,240 Q198,230 204,240"/>
      <path class="mv mv-full" d="M172,238 L188,238"/>
      <path class="mv mv-dizzy" d="M166,240 Q180,230 194,240"/>
    </g>
    <ellipse class="mv mv-surprised mv-shock" cx="180" cy="240" rx="11" ry="15" fill="#5a1d12" stroke="${INK}" stroke-width="5"/>
    <g class="mv mv-panic mv-full"><path d="M256,132 q-12,18 0,24 q12,-6 0,-24z" fill="#8fd3ff" stroke="${INK}" stroke-width="3"/></g>
  </svg>`;
};

/* ---------- стол: чайник «пахта», пиала, лепёшка ---------- */
Art.teapot = function () {
  return `<svg class="art art-teapot" viewBox="0 0 260 220">
    <path d="M196,110 q48,-20 52,-58 q-16,6 -20,16 q-10,26 -40,30z" fill="url(#p-cotton)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M58,100 q-44,-10 -42,40 q4,30 44,26" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M58,100 q-44,-10 -42,40 q4,30 44,26" fill="none" stroke="#1f3f95" stroke-width="6" stroke-linecap="round"/>
    <path d="M60,74 Q46,150 80,196 L180,196 Q214,150 200,74 Q130,58 60,74 Z" fill="url(#p-cotton)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M70,80 Q130,96 192,80" fill="none" stroke="#d6a33a" stroke-width="5"/>
    <ellipse cx="130" cy="70" rx="58" ry="14" fill="#1f3f95" stroke="${INK}" stroke-width="5"/>
    <path d="M100,62 Q130,30 160,62 Z" fill="url(#p-cotton)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="130" cy="34" r="9" fill="#d6a33a" stroke="${INK}" stroke-width="4"/>
  </svg>`;
};
Art.piala = function ({ tea = true } = {}) {
  return `<svg class="art art-piala" viewBox="0 0 140 90">
    <path d="M10,20 Q14,76 70,82 Q126,76 130,20 Z" fill="url(#p-cotton)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <ellipse cx="70" cy="20" rx="60" ry="12" fill="${tea ? '#b8651b' : '#f5ebd5'}" stroke="${INK}" stroke-width="5"/>
    <path d="M18,30 Q70,44 122,30" fill="none" stroke="#d6a33a" stroke-width="4"/>
  </svg>`;
};
Art.non = function () {
  let dots = '';
  for (let a = 0; a < 360; a += 30) for (const rr of [14, 30]) dots += `<circle cx="${(110 + Math.cos(a * Math.PI / 180) * rr * 1.4).toFixed(1)}" cy="${(60 + Math.sin(a * Math.PI / 180) * rr * .55).toFixed(1)}" r="3" fill="#7a4512"/>`;
  return `<svg class="art art-non" viewBox="0 0 220 120">
    <ellipse cx="110" cy="66" rx="104" ry="46" fill="#a9581a" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="110" cy="60" rx="104" ry="46" fill="#d98a2b" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="110" cy="60" rx="62" ry="26" fill="#f0c27a" stroke="#a9581a" stroke-width="4"/>
    ${dots}
  </svg>`;
};

/* ---------- карта Узбекистана (упрощённый контур, проекция «долгота × cos φ») ---------- */
Art.UZ_OUTLINE = [[55.97, 41.31], [55.93, 45.0], [58.5, 45.59], [58.69, 45.5], [60.24, 44.78], [61.06, 44.41], [62.01, 43.5], [63.19, 43.65], [64.9, 43.73], [66.1, 43.0], [66.02, 41.99], [66.51, 41.99], [66.71, 41.17], [67.99, 41.14], [68.26, 40.66], [68.63, 40.67], [69.07, 41.38], [70.39, 42.08], [70.96, 42.27], [71.26, 42.17], [70.42, 41.52], [71.16, 41.14], [71.87, 41.39], [73.06, 40.87], [71.77, 40.15], [71.01, 40.24], [70.6, 40.22], [70.46, 40.5], [70.67, 40.96], [69.33, 40.73], [69.01, 40.09], [68.54, 39.53], [67.7, 39.58], [67.44, 39.14], [68.18, 38.9], [68.39, 38.16], [67.83, 37.14], [67.08, 37.36], [66.52, 37.36], [66.55, 37.97], [65.22, 38.4], [64.17, 38.89], [63.52, 39.36], [62.37, 40.05], [61.88, 41.08], [61.55, 41.27], [60.47, 41.22], [60.08, 41.43], [59.98, 42.22], [58.63, 42.75], [57.79, 42.17], [56.93, 41.83], [57.1, 41.32], [55.97, 41.31]];
Art.UZ_CITIES = [
  { name: 'Ташкент', lon: 69.24, lat: 41.3, capital: true },
  { name: 'Самарканд', lon: 66.96, lat: 39.65 },
  { name: 'Бухара', lon: 64.42, lat: 39.77 },
  { name: 'Хива', lon: 60.36, lat: 41.38 },
  { name: 'Нукус', lon: 59.61, lat: 42.46 },
  { name: 'Фергана', lon: 71.78, lat: 40.39 },
  { name: 'Андижан', lon: 72.34, lat: 40.78 },
  { name: 'Наманган', lon: 71.67, lat: 41.0 },
  { name: 'Карши', lon: 65.79, lat: 38.86 },
  { name: 'Термез', lon: 67.28, lat: 37.22 },
  { name: 'Навои', lon: 65.38, lat: 40.1 },
  { name: 'Джизак', lon: 67.84, lat: 40.12 },
  { name: 'Ургенч', lon: 60.63, lat: 41.55 },
  { name: 'Коканд', lon: 70.94, lat: 40.53 },
  { name: 'Гулистан', lon: 68.78, lat: 40.49 },
];
// проекция: возвращает функцию (lon, lat) → [x, y] для области w×h
Art.uzProjection = function (w = 1000, h = 600, pad = 30) {
  const k = Math.cos(41 * Math.PI / 180);
  const xs = Art.UZ_OUTLINE.map(([lo]) => lo * k), ys = Art.UZ_OUTLINE.map(([, la]) => la);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((w - 2 * pad) / (maxX - minX), (h - 2 * pad) / (maxY - minY));
  const ox = pad + ((w - 2 * pad) - (maxX - minX) * s) / 2, oy = pad + ((h - 2 * pad) - (maxY - minY) * s) / 2;
  return (lon, lat) => [ox + (lon * k - minX) * s, oy + (maxY - lat) * s];
};
Art.uzOutlinePath = function (proj) {
  return Art.UZ_OUTLINE.map(([lo, la], i) => { const [x, y] = proj(lo, la); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join('') + 'Z';
};

/* ---------- стили иллюстраций ---------- */
(() => {
  const moodCss = MOODS.map((m) => `.art[data-mood="${m}"] .mv-${m}{display:inline}`).join('\n');
  const css = `
  .art .mv { display: none; }
  ${moodCss}
  .art .eyes { transform-box: fill-box; transform-origin: 50% 50%; animation: blink 5.5s infinite; }
  .art-guest .belly { transform-box: fill-box; transform-origin: 50% 25%; transform: scale(calc(1 + var(--full, 0) * .85), calc(1 + var(--full, 0) * .45)); transition: transform .7s var(--ease-back); }
  .art-researcher .arm-point { transform-box: view-box; transform-origin: 116px 300px; transition: transform .5s var(--ease-back); }
  .art-researcher.is-pointing .arm-point, .art-researcher[data-point="up"] .arm-point { transform: rotate(14deg); }
  .art-researcher[data-point="down"] .arm-point { transform: rotate(-38deg); }
  .art-kazan .st { animation: steam 2.6s ease-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .art-kazan .st2 { animation-delay: .9s; } .art-kazan .st3 { animation-delay: 1.7s; }
  .art-kazan .fl { transform-box: fill-box; transform-origin: 50% 100%; animation: flame .5s ease-in-out infinite alternate; }
  .art-kazan .fl2 { animation-delay: .17s; } .art-kazan .fl3 { animation-delay: .33s; }
  @keyframes flame { from { transform: scale(1, 1); } to { transform: scale(.92, 1.12); } }
  @media (prefers-reduced-motion: reduce) { .art .eyes, .art-kazan .st, .art-kazan .fl { animation: none; } }`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

window.Art = Art;
window.rng = rng;
