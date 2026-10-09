/* Слайд 10. Защита диссертации.
   Сцены внутри одного слайда: A — три вывода; B — приглашение в Узбекский культурный центр;
   C — «Как дела?» (1 — кратко, 2 — по-узбекски); D — бесконечный ответ; E — «RAHMAT! СПАСИБО!».
   Состояние → классы на <section> (s10-sc-*, s10-c1..3, s10-short); анимации — в CSS,
   поэтому уход со слайда и повторный вход не ломают картинку. */
const S10 = {
  INK: '#1b1814',
  GAP: 14,
  TAGS: { 'семья': 'fam', 'родня': 'kin', 'соседи': 'nbr', 'знакомые': 'frd', 'бабушка': 'gma' },
  // «Как дела?» по-узбекски: семья, родня, соседи, знакомые… (шутка, без насмешки)
  ITEMS: [
    ['семья', 'Родители передают вам привет.'],
    ['родня', 'Дядя из&nbsp;Самарканда спрашивает, когда я&nbsp;женюсь.'],
    ['семья', 'Мама спрашивает, есть&nbsp;ли у&nbsp;меня шапка.'],
    ['родня', 'Двоюродный брат тоже стал лингвистом. Это у&nbsp;нас семейное.'],
    ['соседи', 'Соседи достроили второй этаж.'],
    ['бабушка', 'У&nbsp;бабушки всё хорошо. Её&nbsp;кот тоже поправился&nbsp;— на&nbsp;два килограмма.'],
    ['знакомые', 'В&nbsp;субботу свадьба. Вы&nbsp;тоже приглашены.'],
    ['родня', 'Племянник пошёл в&nbsp;первый класс и&nbsp;уже знает, что такое предел.'],
    ['семья', 'Папа спрашивает, хорошо&nbsp;ли я&nbsp;питаюсь.'],
    ['соседи', 'Сосед купил машину. Цвет выбирала вся махалля — весь квартал.'],
    ['бабушка', 'Бабушка спрашивает, почему вы&nbsp;до&nbsp;сих пор не&nbsp;поели.'],
    ['знакомые', 'Одноклассник открыл чайхану. Передаёт привет.'],
    ['родня', 'Тётя из&nbsp;Ферганы передала сухофрукты: через проводника, двух соседей и&nbsp;знакомого знакомого.'],
    ['семья', 'Младшая сестра поступила на&nbsp;математику. Будет считать родственников.'],
    ['соседи', 'Соседский мальчик вырос. Теперь он&nbsp;тоже спрашивает, когда я&nbsp;женюсь.'],
    ['родня', 'Дедушка смотрит футбол и&nbsp;даёт советы тренеру. Через телевизор.'],
    ['знакомые', 'Знакомый знакомого тоже живёт в&nbsp;Петербурге. Передаёт привет.'],
    ['родня', 'Двоюродная сестра выходит замуж. Вы, конечно, тоже приглашены.'],
    ['знакомые', 'Свадьба скромная: всего четыреста гостей.'],
    ['родня', 'Дядя из&nbsp;Самарканда снова спрашивает, когда я&nbsp;женюсь.'],
    ['семья', 'Мама передаёт: приезжайте в&nbsp;гости. Все.'],
    ['соседи', 'Вся махалля передаёт вам привет. Поимённо.'],
  ],

  /* ---------- мини-графики к выводам ---------- */
  plates() { const p = [1]; for (let n = 1; n <= 12; n++) p.push(0.3 * p[n - 1] + 1); return p; },
  // 1. Pₙ = 0,3·Pₙ₋₁ + 1 → 10/7 (сходится)
  miniConv() {
    const P = this.plates();
    const X = (n) => 22 + n * 20, Y = (p) => 120 - (p - 0.6) * 100;
    const pts = P.slice(0, 10).map((p, n) => [X(n), Y(p)]);
    const lim = Y(10 / 7).toFixed(1);
    return `<svg viewBox="0 0 220 130">
      <path class="s10-ax" d="M14,6 V122 H214"/>
      <path class="s10-asym" d="M14,${lim} H214"/>
      <polyline class="s10-ln s10-draw" style="stroke:var(--blue)" pathLength="1" points="${pts.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ')}"/>
      ${pts.map(([x, y], i) => `<circle class="s10-dot" style="--i:${i}" cx="${x}" cy="${y.toFixed(1)}" r="5.5"/>`).join('')}
    </svg>`;
  },
  // 2. Eₙ = n + 1 − Pₙ → ∞ (расходится)
  miniDiv() {
    const P = this.plates();
    const pts = [];
    for (let n = 0; n <= 8; n++) pts.push([22 + n * 21, 120 - (n + 1 - P[n]) * 13.5]);
    const [lx, ly] = pts[pts.length - 1];
    return `<svg viewBox="0 0 220 130">
      <path class="s10-ax" d="M14,6 V122 H214"/>
      <polyline class="s10-ln s10-draw" style="stroke:var(--orange)" pathLength="1" points="${pts.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ')} ${lx + 14},${(ly - 19).toFixed(1)}"/>
      <path class="s10-arrowhead" d="M${lx + 26},${(ly - 35).toFixed(1)} L${lx + 2},${(ly - 22).toFixed(1)} L${lx + 22},${(ly - 6).toFixed(1)} Z"/>
      <text class="s10-inf" x="150" y="104" text-anchor="middle">∞</text>
    </svg>`;
  },
  // 3. с бабушкой расходится всё: веер кривых во все стороны
  miniAll() {
    const cols = ['var(--red)', 'var(--gold)', 'var(--cream)', 'var(--blue)', 'var(--orange)', 'var(--turq)'];
    const cx = 108, cy = 66;
    let rays = '', sparks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      const R = 150 + (i % 3) * 20;
      const ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R * 0.62;
      const qx = cx + Math.cos(a + 0.7) * R * 0.45, qy = cy + Math.sin(a + 0.7) * R * 0.3;
      rays += `<path class="s10-ln s10-draw" style="stroke:${cols[i % cols.length]};--i:${i};stroke-width:5" pathLength="1" d="M${cx},${cy} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}"/>`;
    }
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + 0.4, r = 46 + (i % 3) * 18;
      const x = cx + Math.cos(a) * r * 1.5, y = cy + Math.sin(a) * r * 0.8;
      sparks += `<path class="s10-spark" style="--i:${i}" d="M${x.toFixed(1)},${(y - 9).toFixed(1)} l3,6 6,3 -6,3 -3,6 -3,-6 -6,-3 6,-3z" fill="${i % 2 ? 'var(--gold)' : 'var(--cream)'}"/>`;
    }
    return `<svg viewBox="0 0 220 130">
      <defs><clipPath id="s10-clip3"><rect x="-22" y="-20" width="262" height="170" rx="18"/></clipPath></defs>
      <g clip-path="url(#s10-clip3)">${rays}</g>${sparks}
      <circle class="s10-core" cx="${cx}" cy="${cy}" r="11"/>
    </svg>`;
  },

  /* ---------- Узбекский культурный центр: петербургский фасад + пештак с майоликой ---------- */
  center() {
    const INK = this.INK;
    const st = (cx, cy, R, r) => { // восьмиконечная звезда
      let d = '';
      for (let i = 0; i < 16; i++) { const a = (Math.PI / 8) * i - Math.PI / 2, rr = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }
      return d + 'Z';
    };
    // звёзды в небе
    const stars = [[60, 36], [150, 92], [236, 30], [318, 74], [452, 40], [646, 44], [770, 30], [858, 80], [936, 28], [1040, 66], [990, 138], [1070, 190], [214, 150], [32, 150]]
      .map(([x, y], i) => `<circle class="s10-star" style="--i:${i}" cx="${x}" cy="${y}" r="${i % 3 ? 2.4 : 3.4}"/>`).join('');
    // балюстрада на крыше (классика)
    let bal = '';
    for (const [x0, x1] of [[132, 404], [696, 968]]) {
      bal += `<rect x="${x0}" y="146" width="${x1 - x0}" height="8" fill="#f5ebd5" stroke="${INK}" stroke-width="3"/>`;
      for (let x = x0 + 10; x < x1 - 6; x += 17) bal += `<path d="M${x},155 q-5,6 0,11 q5,5 0,11 h7 q-5,-6 0,-11 q5,-5 0,-11z" fill="#e9dcbd" stroke="${INK}" stroke-width="2"/>`;
      bal += `<rect x="${x0}" y="176" width="${x1 - x0}" height="4" fill="#d8c79f"/>`;
    }
    // карниз с сухариками
    let dent = '';
    for (let x = 116; x < 984; x += 15) dent += `<rect x="${x}" y="190" width="8" height="7" fill="#d8c79f"/>`;
    // окна флигелей: верхний этаж с сандриками, нижний — арочные
    const xs = [170, 264, 778, 872];
    let wins = '';
    xs.forEach((x, k) => {
      const i1 = k, i2 = k + 4;
      wins += `
        <path d="M${x - 16},${314} L${x + 28},${292} L${x + 72},${314} Z" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="${x - 8}" y="318" width="72" height="104" rx="3" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>
        <rect class="s10-win" style="--i:${i1}" x="${x}" y="326" width="56" height="88" stroke="${INK}" stroke-width="3"/>
        <path d="M${x + 28},326 V414 M${x},362 H${x + 56}" stroke="#f5ebd5" stroke-width="5"/>
        <path d="M${x - 8},${560} V${494} A36,36 0 0 1 ${x + 64},${494} V${560} Z" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>
        <path class="s10-win" style="--i:${i2}" d="M${x},${560} V${496} A28,28 0 0 1 ${x + 56},${496} V${560} Z" stroke="${INK}" stroke-width="3"/>
        <path d="M${x + 28},468 V560 M${x},516 H${x + 56}" stroke="#f5ebd5" stroke-width="5"/>
        <rect x="${x - 12}" y="560" width="80" height="9" fill="#e9dcbd" stroke="${INK}" stroke-width="3"/>`;
    });
    // колонны (по две с каждой стороны портала)
    let cols = '';
    [340, 374, 704, 738].forEach((x) => {
      cols += `
        <rect x="${x}" y="300" width="24" height="288" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>
        <path d="M${x + 8},306 V584 M${x + 16},306 V584" stroke="#d8c79f" stroke-width="2.5"/>
        <rect x="${x - 7}" y="288" width="38" height="14" rx="3" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="${x - 3}" cy="301" r="5" fill="#f5ebd5" stroke="${INK}" stroke-width="3"/><circle cx="${x + 27}" cy="301" r="5" fill="#f5ebd5" stroke="${INK}" stroke-width="3"/>
        <rect x="${x - 6}" y="586" width="36" height="14" rx="2" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>`;
    });
    // ступенчатые ниши-мукарны внутри арки
    let muq = '';
    for (let row = 0; row < 3; row++) {
      const n = 3 + row, w = 27, y = 354 + row * 23, x0 = 550 - (n * w) / 2;
      for (let i = 0; i < n; i++) muq += `<path d="M${x0 + i * w},${y} v-8 q${w / 2},-15 ${w},0 v8 z" fill="${(i + row) % 2 ? '#1fa3b4' : '#f5ebd5'}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    }
    // ограда набережной
    let rail = '';
    for (let x = 11; x < 1100; x += 22) rail += `<path d="M${x},616 V646" stroke="${INK}" stroke-width="2.5"/>`;
    for (let x = 44; x < 1100; x += 88) rail += `<circle cx="${x}" cy="631" r="10" fill="none" stroke="${INK}" stroke-width="3"/>`;
    let posts = '';
    for (let x = 0; x <= 1100; x += 220) posts += `<rect x="${x - 13}" y="604" width="26" height="46" rx="3" fill="#9b7f78" stroke="${INK}" stroke-width="3"/>`;
    // блики на воде
    const ripples = [[60, 690, '#d8c79f'], [190, 704, '#f6bb2a'], [300, 688, '#d8c79f'], [470, 694, '#f6bb2a'], [560, 708, '#ffd27a'], [640, 690, '#f6bb2a'], [800, 702, '#f6bb2a'], [910, 690, '#d8c79f'], [1010, 706, '#f6bb2a']]
      .map(([x, y, c]) => `<path class="s10-ripple" d="M${x - 30},${y} q15,-6 30,0 t30,0" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>`).join('');

    return `<svg class="s10-center" viewBox="0 0 1100 720" role="img" aria-label="Узбекский культурный центр РГПУ им. А. И. Герцена: петербургский фасад с колоннами и узбекский портал с синей майоликой">
      <defs>
        <linearGradient id="s10-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#141a31"/><stop offset=".42" stop-color="#2b2c54"/><stop offset=".7" stop-color="#7b4561"/><stop offset=".86" stop-color="#d9774a"/><stop offset="1" stop-color="#f3a556"/>
        </linearGradient>
        <linearGradient id="s10-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22305a"/><stop offset="1" stop-color="#121a33"/></linearGradient>
        <linearGradient id="s10-niche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#132a6b"/><stop offset="1" stop-color="#2453b0"/></linearGradient>
        <radialGradient id="s10-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset=".55" stop-color="#ffc24a" stop-opacity=".45"/><stop offset="1" stop-color="#ffb22e" stop-opacity="0"/></radialGradient>
        <pattern id="s10-tile" patternUnits="userSpaceOnUse" width="30" height="30">
          <rect width="30" height="30" fill="#2453b0"/>
          <path d="M15,2 L18.6,11.4 L28,15 L18.6,18.6 L15,28 L11.4,18.6 L2,15 L11.4,11.4 Z" fill="#1fa3b4"/>
          <rect x="11" y="11" width="8" height="8" transform="rotate(45 15 15)" fill="#f5ebd5"/>
          <circle cx="15" cy="15" r="2.2" fill="#e8432d"/>
          <g fill="#f6bb2a"><circle r="3.2"/><circle cx="30" r="3.2"/><circle cy="30" r="3.2"/><circle cx="30" cy="30" r="3.2"/></g>
        </pattern>
        <pattern id="s10-tile2" patternUnits="userSpaceOnUse" width="22" height="22">
          <rect width="22" height="22" fill="#f5ebd5"/>
          <path d="M11,1.5 L20.5,11 L11,20.5 L1.5,11 Z" fill="none" stroke="#1fa3b4" stroke-width="2.4"/>
          <circle cx="11" cy="11" r="3" fill="#2453b0"/>
        </pattern>
        <pattern id="s10-rust" patternUnits="userSpaceOnUse" width="40" height="22">
          <rect width="40" height="22" fill="#dfa645"/><rect y="19" width="40" height="3" fill="#b9802a"/>
        </pattern>
        <pattern id="s10-twist" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(35)">
          <rect width="20" height="20" fill="#1fa3b4"/><rect width="20" height="8" fill="#2453b0"/>
        </pattern>
      </defs>

      <rect width="1100" height="720" fill="url(#s10-sky)"/>
      ${stars}

      <!-- силуэты: шпиль слева, дома справа -->
      <g fill="#3b3456" stroke="${INK}" stroke-width="3">
        <rect x="26" y="300" width="80" height="304"/><rect x="40" y="236" width="52" height="66"/>
        <path d="M986,404 h46 v-30 h40 v30 h40 v200 h-126 z"/>
      </g>
      <path d="M57,238 L66,34 L75,238 Z" fill="#f6bb2a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="66" cy="32" r="5" fill="#f6bb2a" stroke="${INK}" stroke-width="2.5"/>
      <g fill="#ffd27a" opacity=".85"><rect x="44" y="330" width="14" height="22"/><rect x="74" y="380" width="14" height="22"/><rect x="1004" y="430" width="14" height="20"/><rect x="1062" y="470" width="14" height="20"/></g>

      <!-- классический фасад -->
      ${bal}
      <rect x="110" y="180" width="880" height="20" fill="#f5ebd5" stroke="${INK}" stroke-width="4"/>
      ${dent}
      <rect x="128" y="196" width="844" height="406" fill="#e5af4b" stroke="${INK}" stroke-width="4"/>
      <rect x="128" y="440" width="844" height="160" fill="url(#s10-rust)"/>
      <rect x="122" y="430" width="856" height="14" fill="#f5ebd5" stroke="${INK}" stroke-width="3.5"/>
      ${wins}
      ${cols}

      <!-- пештак: узбекский портал с майоликой -->
      <rect x="406" y="98" width="18" height="502" fill="url(#s10-twist)" stroke="${INK}" stroke-width="3.5"/>
      <rect x="676" y="98" width="18" height="502" fill="url(#s10-twist)" stroke="${INK}" stroke-width="3.5"/>
      <path d="M402,100 Q402,78 415,68 Q428,78 428,100 Z" fill="#1fa3b4" stroke="${INK}" stroke-width="3.5"/>
      <path d="M672,100 Q672,78 685,68 Q698,78 698,100 Z" fill="#1fa3b4" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="415" cy="64" r="4.5" fill="#f6bb2a" stroke="${INK}" stroke-width="2.5"/><circle cx="685" cy="64" r="4.5" fill="#f6bb2a" stroke="${INK}" stroke-width="2.5"/>
      <rect x="424" y="104" width="252" height="496" fill="url(#s10-tile)" stroke="${INK}" stroke-width="5"/>
      <rect x="424" y="96" width="252" height="12" fill="#1fa3b4" stroke="${INK}" stroke-width="3.5"/>
      <rect x="450" y="128" width="200" height="472" fill="url(#s10-tile2)" stroke="${INK}" stroke-width="3.5"/>
      <path d="${st(550, 162, 27, 14)}" fill="#f6bb2a" stroke="${INK}" stroke-width="3"/>
      <circle cx="550" cy="162" r="6" fill="#e8432d" stroke="${INK}" stroke-width="2.5"/>
      <path d="M472,600 V392 Q472,330 550,304 Q628,330 628,392 V600 Z" fill="url(#s10-niche)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M484,600 V394 Q484,342 550,318 Q616,342 616,394 V600" fill="none" stroke="#f5ebd5" stroke-width="3"/>
      ${muq}
      <ellipse class="s10-doorglow" cx="550" cy="520" rx="96" ry="110" fill="url(#s10-glow)"/>
      <path class="s10-door" d="M512,600 V462 Q512,432 550,420 Q588,432 588,462 V600 Z" stroke="${INK}" stroke-width="4.5"/>
      <path d="M512,462 L490,452 L490,606 L512,600 Z" fill="#7a3f1c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M588,462 L610,452 L610,606 L588,600 Z" fill="#7a3f1c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M496,480 L506,484 M496,520 L506,522 M496,560 L506,561 M604,480 L594,484 M604,520 L594,522 M604,560 L594,561" stroke="#f6bb2a" stroke-width="3" stroke-linecap="round"/>

      <!-- вывеска -->
      <rect x="116" y="198" width="868" height="86" rx="4" fill="#1f3f95" stroke="${INK}" stroke-width="4.5"/>
      <rect x="126" y="206" width="848" height="70" rx="2" fill="none" stroke="#f6bb2a" stroke-width="3"/>
      <path d="${st(166, 241, 17, 8)}" fill="#f6bb2a"/><path d="${st(934, 241, 17, 8)}" fill="#f6bb2a"/>
      <text class="s10-sign1" x="550" y="240" text-anchor="middle">Узбекский культурный центр</text>
      <text class="s10-sign2" x="550" y="271" text-anchor="middle">РГПУ им. А.&#160;И.&#160;Герцена</text>

      <!-- тротуар, ступени, фонарь -->
      <rect x="0" y="600" width="1100" height="50" fill="#6c6977"/>
      <ellipse class="s10-spill" cx="550" cy="628" rx="170" ry="26" fill="url(#s10-glow)"/>
      <rect x="474" y="600" width="152" height="10" fill="#e9dcbd" stroke="${INK}" stroke-width="3"/>
      <rect x="462" y="609" width="176" height="10" fill="#e9dcbd" stroke="${INK}" stroke-width="3"/>
      <circle class="s10-lampglow" cx="1036" cy="356" r="66" fill="url(#s10-glow)"/>
      <rect x="1031" y="372" width="10" height="236" fill="#2a2a2e" stroke="${INK}" stroke-width="3"/>
      <path d="M1018,340 L1054,340 L1048,374 L1024,374 Z" fill="#ffd27a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M1012,342 L1036,320 L1060,342 Z" fill="#2a2a2e" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>

      <!-- набережная: решётка, гранит, вода -->
      <path d="M0,616 H1100 M0,646 H1100" stroke="${INK}" stroke-width="4.5"/>
      ${rail}${posts}
      <rect x="-4" y="648" width="1108" height="26" fill="#8f7470" stroke="${INK}" stroke-width="4"/>
      <path d="M110,650 V672 M330,650 V672 M550,650 V672 M770,650 V672 M990,650 V672" stroke="#6e5652" stroke-width="3"/>
      <rect x="0" y="674" width="1100" height="46" fill="url(#s10-water)"/>
      ${ripples}
    </svg>`;
  },

  /* ---------- бабушка машет рукой ---------- */
  wavingGrandma() {
    let svg = Art.grandma({ variant: 'uz', mood: 'happy', holding: 'none' });
    // правый рукав и правая ладонь уходят — вместо них поднятая машущая рука
    svg = svg.replace(/<path d="M288,306[^>]*\/>/, '').replace(/<circle cx="234" cy="420"[^>]*\/>/, '');
    const arm = `<g class="s10-wave">
      <path d="M262,316 Q304,300 330,262 L354,222 L388,238 L364,282 Q336,336 284,364 Z" fill="url(#p-atlas)" stroke="${this.INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M352,228 Q340,206 344,188 Q346,176 354,178 Q360,180 360,192 L360,170 Q360,158 368,158 Q376,158 376,170 L377,166 Q378,154 386,155 Q394,157 393,170 L392,178 Q396,168 403,171 Q409,175 405,190 Q400,214 388,232 Q368,246 352,228 Z" fill="#e2ab7f" stroke="${this.INK}" stroke-width="4.5" stroke-linejoin="round"/>
    </g>`;
    return svg.replace(/<\/svg>\s*$/, `${arm}</svg>`);
  },
};

Deck.register('10', {
  init(api) {
    const el = api.el;
    [...el.classList].filter((c) => c.startsWith('s10-')).forEach((c) => el.classList.remove(c));
    el.classList.add('s10-sc-a');
    delete el.dataset.chrome;
    Object.assign(api.state, { scene: 'a', c: 0, short: false, n: 0, offset: 0, listOn: false });

    api.$('.s10-mini--1').innerHTML = S10.miniConv();
    api.$('.s10-mini--2').innerHTML = S10.miniDiv();
    api.$('.s10-mini--3').innerHTML = S10.miniAll();
    api.$('.s10-a-res').innerHTML = Art.researcher({ mood: 'serious' });
    api.$('.s10-a-gma-in').innerHTML = Art.grandma({ variant: 'uz', mood: 'kind', holding: 'plate', amount: 1 });
    api.$('.s10-pc-art').innerHTML = S10.center();
    api.$('.s10-guest-in').innerHTML = Art.guest({ mood: 'polite' });
    api.$('.s10-res-in').innerHTML = Art.researcher({ mood: 'serious' });
    api.$('.s10-e-bow').innerHTML = Art.researcher({ mood: 'happy' });
    api.$('.s10-e-gma-in').innerHTML = S10.wavingGrandma();

    const on = (sel, fn) => api.$$(sel).forEach((b) => b.addEventListener('click', (e) => { e.currentTarget.blur(); fn(); api.updateSteps(); }));
    // клик по строке N открывает выводы по порядку до N включительно
    api.$$('.s10-row').forEach((b, i) => b.addEventListener('click', (e) => {
      e.currentTarget.blur();
      const st = api.state, n = i + 1;
      const step = () => { if (st.c < n && this.conclude(api)) api.timeout(step, 320); };
      step();
      api.updateSteps();
    }));
    on('.s10-go-b', () => this.toCenter(api));
    on('.s10-go-c', () => this.toQuestion(api));
    on('.s10-btn-short', () => this.answerShort(api));
    on('.s10-btn-uz', () => this.answerUz(api));
    on('.s10-go-e', () => this.toFinal(api));
  },

  enter(api) {
    const s = api.state;
    if (s.scene === 'a' && s.c === 0) {
      const r = api.$('.s10-a-res .art');
      api.timeout(() => r.setAttribute('data-point', 'up'), 1200);
    }
    if (s.scene === 'd' || s.scene === 'e') this.startList(api);
  },

  leave(api) {
    api.clearTimers();
    api.state.listOn = false;
    FX.clear(); // конфетти и рис этого слайда не должны сыпаться на соседний
  },

  setScene(api, sc) {
    const el = api.el;
    ['a', 'b', 'c', 'd', 'e'].forEach((k) => el.classList.toggle('s10-sc-' + k, k === sc));
    if (sc === 'a' || sc === 'b') delete el.dataset.chrome; else el.dataset.chrome = 'off';
    api.state.scene = sc;
    api.updateSteps();
  },

  // A: следующий вывод
  conclude(api) {
    const s = api.state;
    if (s.scene !== 'a' || s.c >= 3) return false;
    s.c += 1;
    api.el.classList.add('s10-c' + s.c);
    const res = api.$('.s10-a-res .art');
    const num = api.$(`.s10-row--${s.c} .s10-num`);
    res.setAttribute('data-point', 'up');
    api.sfx('swoosh');
    // эффекты — только пока мы ещё в сцене выводов (кликер мог уже перелистнуть на культурный центр)
    const inA = (fn) => () => { if (s.scene === 'a') fn(); };
    if (s.c < 3) {
      const k = s.c;
      api.timeout(inA(() => { api.sfx(k === 1 ? 'ding' : 'coin'); FX.at(num, 'rice', { count: 26, power: 12 }); }), 380);
      Art.mood(res, k === 1 ? 'serious' : 'smug');
    } else {
      const g = api.$('.s10-a-gma-in');
      s.c3At = performance.now();
      s.c3Timers = [];
      const keep = (t) => { s.c3Timers.push(t); return t; };
      keep(api.timeout(inA(() => { api.sfx('boing'); FX.shakeStage(); Art.mood(res, 'shock'); FX.at(num, 'confetti', { count: 40, power: 14, spread: 6.28 }); }), 380));
      keep(api.timeout(inA(() => { api.sfx('plop'); const c = FX.centerOf(g); FX.plov({ x: c.x, y: c.y - 30, count: 70, power: 17 }); Art.mood(g, 'happy'); }), 1000));
      keep(api.timeout(inA(() => { api.sfx('stamp'); FX.at(api.$('.s10-qed'), 'rice', { count: 30, power: 12 }); Art.mood(res, 'proud'); Art.mood(g, 'proud'); }), 1520));
    }
    api.updateSteps();
    return true;
  },

  // быстрое нажатие сразу после третьего вывода: показать «Ч. Т. Д.» и бабушку немедленно, а не проскочить
  settleC3(api) {
    const s = api.state;
    (s.c3Timers || []).forEach(clearTimeout);
    s.c3Timers = [];
    s.c3Settled = true;
    api.el.classList.add('s10-c3-now');
    const res = api.$('.s10-a-res .art'), g = api.$('.s10-a-gma-in');
    Art.mood(res, 'proud'); Art.mood(g, 'proud');
    api.sfx('stamp');
    api.updateSteps();
    return true;
  },

  // A → B: культурный центр
  toCenter(api) {
    const s = api.state;
    if (s.scene !== 'a') return false;
    while (s.c < 3) { s.c += 1; api.el.classList.add('s10-c' + s.c); }
    this.setScene(api, 'b');
    api.sfx('whoosh');
    // отложенные звуки звучат, только если мы всё ещё в этой сцене
    const inB = (fn) => () => { if (s.scene === 'b') fn(); };
    api.timeout(inB(() => api.sfx('sparkle')), 700);
    api.timeout(inB(() => api.sfx('pop')), 1350);
    api.timeout(inB(() => api.sfx('ding')), 1600);
    return true;
  },

  // B → C: «Как дела?»
  toQuestion(api) {
    if (api.state.scene !== 'b') return false;
    this.setScene(api, 'c');
    api.sfx('swoosh');
    Art.mood(api.$('.s10-guest-in .art'), 'polite');
    Art.mood(api.$('.s10-res-in .art'), 'serious');
    const inC = (fn) => () => { if (api.state.scene === 'c') fn(); };
    api.timeout(inC(() => api.sfx('pop')), 520);
    api.timeout(inC(() => api.sfx('click')), 1150);
    return true;
  },

  // C: «Ответить кратко» — «Нормально.»
  answerShort(api) {
    const s = api.state;
    if (s.scene !== 'c' || s.short) return false;
    s.short = true;
    api.el.classList.add('s10-short');
    api.sfx('click');
    api.timeout(() => api.sfx('pop'), 120);
    Art.mood(api.$('.s10-res-in .art'), 'serious');
    const g = api.$('.s10-guest-in');
    Art.mood(g, 'neutral');
    api.timeout(() => { if (s.scene !== 'c') return; Art.mood(g, 'surprised'); api.sfx('tick'); }, 1150);
    return true;
  },

  // C → D: «Ответить по-узбекски» — бесконечный список
  answerUz(api) {
    if (api.state.scene !== 'c') return false;
    this.setScene(api, 'd');
    api.sfx('whoosh');
    Art.mood(api.$('.s10-res-in .art'), 'happy');
    Art.mood(api.$('.s10-guest-in .art'), 'polite');
    if (api.state.short) api.timeout(() => api.sfx('swoosh'), 250);
    api.timeout(() => this.startList(api), 650);
    return true;
  },

  startList(api) {
    const s = api.state;
    if (s.listOn) return;
    s.listOn = true;
    this.addItem(api);
    api.interval(() => this.addItem(api), 720);
  },

  addItem(api) {
    const s = api.state;
    const list = api.$('.s10-list'), view = api.$('.s10-view');
    if (!list || !view) return;
    const [tag, text] = S10.ITEMS[s.n % S10.ITEMS.length];
    s.n += 1;
    const li = document.createElement('li');
    li.className = 's10-item';
    li.style.setProperty('--r', `${((s.n * 7) % 5 - 2) * 0.35}deg`);
    li.innerHTML = `<span class="s10-item-n">${s.n}</span><span class="s10-item-b"><span class="s10-tag s10-tag--${S10.TAGS[tag]}">${tag}</span> ${text}</span>`;
    list.appendChild(li);
    // старые пункты давно уехали вверх — убираем, чтобы DOM не рос бесконечно
    if (list.children.length > 22) {
      const first = list.firstElementChild;
      const h = first.offsetHeight + S10.GAP;
      list.removeChild(first);
      s.offset = Math.max(0, s.offset - h);
      list.style.transition = 'none';
      list.style.transform = `translateY(${-s.offset}px)`;
      void list.offsetHeight;
      list.style.transition = '';
    }
    s.offset = Math.max(0, list.offsetHeight - view.clientHeight);
    list.style.transform = `translateY(${-s.offset}px)`;
    // «полоса прокрутки» тает: ответ становится всё длиннее
    api.$('.s10-thumb').style.setProperty('--th', `${clamp(600 / (s.n + 5), 4, 100).toFixed(1)}%`);
    const cn = api.$('.s10-count-n');
    cn.textContent = s.n;
    FX.replay(cn, 'is-bump');
    api.$('.s10-e-n').textContent = s.n;
    // гость постепенно осознаёт масштаб ответа
    const g = api.$('.s10-guest-in');
    const mood = s.n >= 11 ? 'dizzy' : s.n >= 7 ? 'shock' : s.n >= 3 ? 'surprised' : 'polite';
    const svg = g.querySelector('.art');
    if (svg.getAttribute('data-mood') !== mood) { Art.mood(g, mood); FX.replay(g, 'is-wobble'); }
    if (s.scene === 'd') api.sfx(s.n % 4 === 1 ? 'pop' : 'tick');
  },

  // D → E: финал. Конфетти бьёт только с боков и наружу — центр («RAHMAT! СПАСИБО!») остаётся чистым
  sideConfetti(xl, xr, opts = {}) {
    const tilt = opts.tilt == null ? 0.35 : opts.tilt;
    const o = { spread: 0.8, ...opts };
    delete o.tilt;
    FX.confetti({ ...o, x: xl, angle: -Math.PI / 2 - tilt });
    FX.confetti({ ...o, x: xr, angle: -Math.PI / 2 + tilt });
  },

  toFinal(api) {
    if (api.state.scene !== 'd') return false;
    this.setScene(api, 'e');
    api.sfx('whoosh');
    api.timeout(() => api.sfx('swoosh'), 750);
    api.timeout(() => { api.sfx('tada'); this.sideConfetti(300, 1620, { count: 140 }); }, 1250);
    api.timeout(() => { api.sfx('boing'); this.sideConfetti(440, 1480, { count: 90, power: 24, tilt: 0.45, spread: 0.7 }); }, 1700);
    api.timeout(() => api.sfx('sparkle'), 2300);
    api.timeout(() => this.sideConfetti(140, 1780, { count: 70, tilt: 0.15, spread: 0.6 }), 2800);
    return true;
  },

  // E: «→» на последнем слайде — не мёртвое нажатие, а маленький бис (если после него есть слайды — просто дальше)
  encore(api) {
    if (Deck.index < Deck.slides.length - 1) return false;
    api.sfx('sparkle');
    this.sideConfetti(300, 1620, { count: 80 });
    FX.replay(api.$('.s10-e-thanks'), 'is-bump');
    return true;
  },

  next(api) {
    const s = api.state;
    switch (s.scene) {
      case 'a':
        if (s.c < 3) return this.conclude(api);
        if (!s.c3Settled && performance.now() - (s.c3At || 0) < 1600) return this.settleC3(api);
        return this.toCenter(api);
      case 'b': return this.toQuestion(api);
      case 'c': return this.answerUz(api);
      case 'd': return this.toFinal(api);
      case 'e': return this.encore(api);
      default: return false;
    }
  },

  progress(api) {
    const s = api.state;
    return { done: s.c + Math.max(0, 'abcde'.indexOf(s.scene)), total: 7 };
  },

  keys: {
    Digit1(api) { this.answerShort(api); },
    Digit2(api) { this.answerUz(api); },
  },
});
