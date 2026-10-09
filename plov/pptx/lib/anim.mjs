// Генератор PowerPoint-анимаций (p:timing) по декларативному описанию.
//
// Описание слайда:
//   anims = {
//     auto:  [effect, ...],                 // запускаются сами при открытии слайда
//     clicks: [[effect, ...], ...],         // каждый элемент — один щелчок / нажатие кликера
//     triggers: [{ on: 'имяФигуры', effects: [effect, ...] }],  // щелчок по фигуре
//   }
//   effect = { t: 'objectName', fx: 'fade', delay: 0, dur: 500, sound: 'stamp', repeat: 'indefinite', ...параметры }
// Время — в миллисекундах от начала щелчка (все эффекты щелчка — «вместе с предыдущим» + задержка).
//
// Эффекты (fx):
//   входа:   appear fade zoom pop slam drop flyTop flyBottom flyLeft flyRight wipeLeft wipeRight wipeUp wipeDown expandX riseUp
//   выхода:  hide fadeOut zoomOut collapseX flyOutTop flyOutBottom flyOutLeft flyOutRight sinkDown
//   выделения: pulse grow spin teeter shake float heartbeat
//   пути:    move (path: 'M 0 0 L 0.1 0 E' в долях слайда)

let nextId;
const nid = () => nextId++;

const tgt = (spid) => `<p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>`;
const cbhvr = (spid, dur, attrs = [], extra = '', ctnExtra = '') =>
  `<p:cBhvr${extra}><p:cTn id="${nid()}" dur="${dur}"${ctnExtra}/>${tgt(spid)}${attrs.length ? `<p:attrNameLst>${attrs.map((a) => `<p:attrName>${a}</p:attrName>`).join('')}</p:attrNameLst>` : ''}</p:cBhvr>`;

const setVis = (spid, val, delay = 0) =>
  `<p:set><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="${delay}"/></p:stCondLst></p:cTn>${tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="${val}"/></p:to></p:set>`;

const animEffect = (spid, dur, transition, filter) =>
  `<p:animEffect transition="${transition}" filter="${filter}">${cbhvr(spid, dur)}</p:animEffect>`;

// анимация свойства по ключевым кадрам: tav = [[tm 0..100000, 'value'], ...]
const animProp = (spid, dur, attr, tav, { calcmode = 'lin', fill = 'hold' } = {}) =>
  `<p:anim calcmode="${calcmode}" valueType="num"><p:cBhvr additive="base"><p:cTn id="${nid()}" dur="${dur}" fill="${fill}"/>${tgt(spid)}<p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>${tav.map(([tm, v]) => `<p:tav tm="${tm}"><p:val><p:strVal val="${v}"/></p:val></p:tav>`).join('')}</p:tavLst></p:anim>`;

const animScale = (spid, dur, byPct, { autoRev = false, repeat = null, decel = 0 } = {}) =>
  `<p:animScale><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${autoRev ? ' autoRev="1"' : ''}${repeat ? ` repeatCount="${repeat}"` : ''}${decel ? ` decel="${decel}"` : ''}/>${tgt(spid)}</p:cBhvr><p:by x="${byPct * 1000}" y="${byPct * 1000}"/></p:animScale>`;

const animRot = (spid, dur, byDeg, { autoRev = false, repeat = null } = {}) =>
  `<p:animRot by="${Math.round(byDeg * 60000)}"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${autoRev ? ' autoRev="1"' : ''}${repeat ? ` repeatCount="${repeat}"` : ''}/>${tgt(spid)}<p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>`;

const animMotion = (spid, dur, path, { autoRev = false, repeat = null, accel = 0, decel = 0 } = {}) =>
  `<p:animMotion origin="layout" path="${path}" pathEditMode="relative"><p:cBhvr><p:cTn id="${nid()}" dur="${dur}" fill="hold"${autoRev ? ' autoRev="1"' : ''}${repeat ? ` repeatCount="${repeat}"` : ''}${accel ? ` accel="${accel}"` : ''}${decel ? ` decel="${decel}"` : ''}/>${tgt(spid)}<p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr></p:animMotion>`;

// эффекты: возвращают { cls, preset, sub, body }
function buildFx(e, spid) {
  const d = e.dur ?? 500;
  const W = '#ppt_w', H = '#ppt_h', X = '#ppt_x', Y = '#ppt_y';
  switch (e.fx) {
    // ---------- вход ----------
    case 'appear': return { cls: 'entr', preset: 1, sub: 0, body: setVis(spid, 'visible') };
    case 'fade': return { cls: 'entr', preset: 10, sub: 0, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'fade') };
    case 'zoom': return { cls: 'entr', preset: 53, sub: 16, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_w', [[0, '0'], [100000, W]]) + animProp(spid, d, 'ppt_h', [[0, '0'], [100000, H]]) + animEffect(spid, d, 'in', 'fade') };
    case 'pop': { // появление с перелётом 112% → 100%
      const s = e.over ?? 1.14;
      return { cls: 'entr', preset: 53, sub: 16, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_w', [[0, '0'], [65000, `${W}*${s}`], [100000, W]]) + animProp(spid, d, 'ppt_h', [[0, '0'], [65000, `${H}*${s}`], [100000, H]]) + animEffect(spid, Math.round(d * .5), 'in', 'fade') };
    }
    case 'slam': { // печать: из 260% удар до 100%
      const s = e.from ?? 2.6;
      return { cls: 'entr', preset: 53, sub: 32, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_w', [[0, `${W}*${s}`], [70000, `${W}*0.94`], [100000, W]]) + animProp(spid, d, 'ppt_h', [[0, `${H}*${s}`], [70000, `${H}*0.94`], [100000, H]]) + animEffect(spid, Math.round(d * .45), 'in', 'fade') };
    }
    case 'drop': // падение сверху с отскоком
      return { cls: 'entr', preset: 2, sub: 1, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_y', [[0, `0-${H}/2`], [62000, `${Y}+${H}*0.05`], [80000, `${Y}-${H}*0.04`], [100000, Y]]) + animProp(spid, d, 'ppt_x', [[0, X], [100000, X]]) };
    case 'flyTop': return fly(spid, d, 1, `0-${H}/2`, null);
    case 'flyBottom': return fly(spid, d, 4, `1+${H}/2`, null);
    case 'flyLeft': return fly(spid, d, 8, null, `0-${W}/2`);
    case 'flyRight': return fly(spid, d, 2, null, `1+${W}/2`);
    case 'riseUp': // всплывает на 6% высоты слайда с проявлением
      return { cls: 'entr', preset: 42, sub: 0, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'fade') + animProp(spid, d, 'ppt_y', [[0, `${Y}+.05`], [100000, Y]]) + animProp(spid, d, 'ppt_x', [[0, X], [100000, X]]) };
    case 'wipeLeft': return { cls: 'entr', preset: 22, sub: 8, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'wipe(left)') };
    case 'wipeRight': return { cls: 'entr', preset: 22, sub: 2, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'wipe(right)') };
    case 'wipeUp': return { cls: 'entr', preset: 22, sub: 4, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'wipe(up)') };
    case 'wipeDown': return { cls: 'entr', preset: 22, sub: 1, body: setVis(spid, 'visible') + animEffect(spid, d, 'in', 'wipe(down)') };
    case 'expandX': return { cls: 'entr', preset: 17, sub: 10, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_w', [[0, '0'], [100000, W]]) };
    // ---------- выход ----------
    case 'hide': return { cls: 'exit', preset: 1, sub: 0, body: setVis(spid, 'hidden') };
    case 'fadeOut': return { cls: 'exit', preset: 10, sub: 0, body: animEffect(spid, d, 'out', 'fade') + setVis(spid, 'hidden', d - 1) };
    case 'zoomOut': return { cls: 'exit', preset: 53, sub: 16, body: animProp(spid, d, 'ppt_w', [[0, W], [100000, '0']]) + animProp(spid, d, 'ppt_h', [[0, H], [100000, '0']]) + animEffect(spid, d, 'out', 'fade') + setVis(spid, 'hidden', d - 1) };
    case 'collapseX': return { cls: 'exit', preset: 17, sub: 10, body: animProp(spid, d, 'ppt_w', [[0, W], [100000, '0']]) + setVis(spid, 'hidden', d - 1) };
    case 'flyOutTop': return flyOut(spid, d, 1, `0-${H}/2`, null);
    case 'flyOutBottom': return flyOut(spid, d, 4, `1+${H}/2`, null);
    case 'flyOutLeft': return flyOut(spid, d, 8, null, `0-${W}/2`);
    case 'flyOutRight': return flyOut(spid, d, 2, null, `1+${W}/2`);
    case 'sinkDown': return { cls: 'exit', preset: 42, sub: 0, body: animEffect(spid, d, 'out', 'fade') + animProp(spid, d, 'ppt_y', [[0, Y], [100000, `${Y}+.05`]]) + animProp(spid, d, 'ppt_x', [[0, X], [100000, X]]) + setVis(spid, 'hidden', d - 1) };
    // ---------- выделение ----------
    case 'pulse': return { cls: 'emph', preset: 26, sub: 0, body: animScale(spid, d / 2, e.by ?? 112, { autoRev: true, repeat: e.repeat ? String(e.repeat === 'indefinite' ? 'indefinite' : e.repeat * 1000) : null }) };
    case 'grow': return { cls: 'emph', preset: 6, sub: 0, body: animScale(spid, d, e.by ?? 150, { decel: 50000 }) };
    case 'spin': return { cls: 'emph', preset: 8, sub: 0, body: animRot(spid, d, e.deg ?? 360, { repeat: e.repeat ? String(e.repeat === 'indefinite' ? 'indefinite' : e.repeat * 1000) : null }) };
    case 'teeter': return { cls: 'emph', preset: 32, sub: 0, body: animRot(spid, d / 4, e.deg ?? 5, { autoRev: true, repeat: '2000' }) };
    case 'shake': return { cls: 'emph', preset: 0, sub: 0, path: true, body: animMotion(spid, Math.round(d / 6), `M 0 0 L ${(e.amp ?? .006)} 0 E`, { autoRev: true, repeat: '3000' }) };
    case 'float': return { cls: 'emph', preset: 0, sub: 0, path: true, body: animMotion(spid, d, `M 0 0 L 0 ${-(e.amp ?? .012)} E`, { autoRev: true, repeat: 'indefinite' }) };
    case 'heartbeat': return { cls: 'emph', preset: 26, sub: 0, body: animScale(spid, d / 2, e.by ?? 106, { autoRev: true, repeat: 'indefinite' }) };
    // ---------- путь ----------
    case 'move': return { cls: 'path', preset: 0, sub: 0, body: animMotion(spid, d, e.path, { autoRev: !!e.autoRev, repeat: e.repeat ? String(e.repeat === 'indefinite' ? 'indefinite' : e.repeat * 1000) : null, accel: e.accel ?? 0, decel: e.decel ?? 50000 }) };
    default: throw new Error(`Неизвестный эффект ${e.fx}`);
  }
}
function fly(spid, d, sub, fromY, fromX) {
  const X = '#ppt_x', Y = '#ppt_y';
  return { cls: 'entr', preset: 2, sub, body: setVis(spid, 'visible') + animProp(spid, d, 'ppt_x', [[0, fromX ?? X], [100000, X]]) + animProp(spid, d, 'ppt_y', [[0, fromY ?? Y], [100000, Y]]) };
}
function flyOut(spid, d, sub, toY, toX) {
  const X = '#ppt_x', Y = '#ppt_y';
  return { cls: 'exit', preset: 2, sub, body: animProp(spid, d, 'ppt_x', [[0, X], [100000, toX ?? X]]) + animProp(spid, d, 'ppt_y', [[0, Y], [100000, toY ?? Y]]) + setVis(spid, 'hidden', d - 1) };
}

/**
 * Собирает <p:timing>.
 * ctx = { ids: {objectName: spid}, kinds: {objectName: 'sp'|'pic'|'chart'}, sound: (name) => rId }
 * Возвращает строку XML (или '' если анимаций нет).
 */
export function buildTiming(anims, ctx) {
  nextId = 1;
  const grp = {}; // spid → следующий grpId
  const bld = [];  // {spid, grpId, kind}
  const resolve = (name) => {
    const id = ctx.ids[name];
    if (id == null) throw new Error(`Анимация: нет фигуры с именем «${name}»`);
    return id;
  };
  const effectXml = (e, nodeType) => {
    const spid = resolve(e.t);
    const g = grp[spid] = (grp[spid] ?? -1) + 1;
    const fx = buildFx(e, spid);
    const kind = ctx.kinds[e.t] || 'sp';
    bld.push({ spid, grpId: g, kind });
    let sound = '';
    if (e.sound) {
      const rId = ctx.sound(e.sound);
      sound = `<p:subTnLst><p:audio><p:cMediaNode vol="${e.vol ?? 80000}"><p:cTn id="${nid()}" display="0" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:sndTgt r:embed="${rId}" name="${e.sound}.wav"/></p:tgtEl></p:cMediaNode></p:audio></p:subTnLst>`;
    }
    const pathAttrs = fx.cls === 'path' ? ' presetClass="path"' : ` presetClass="${fx.cls}"`;
    return `<p:par><p:cTn id="${nid()}" presetID="${fx.preset}"${pathAttrs} presetSubtype="${fx.sub}" fill="hold" grpId="${g}" nodeType="${nodeType}"><p:stCondLst><p:cond delay="${e.delay ?? 0}"/></p:stCondLst><p:childTnLst>${fx.body}</p:childTnLst>${sound}</p:cTn></p:par>`;
  };
  const group = (effects, first = 'clickEffect') => {
    const inner = effects.map((e, i) => effectXml(e, i === 0 ? first : 'withEffect')).join('');
    return `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par>`;
  };

  const hasMain = (anims.auto && anims.auto.length) || (anims.clicks && anims.clicks.length);
  const hasTrig = anims.triggers && anims.triggers.length;
  if (!hasMain && !hasTrig) return '';

  const rootId = nid(); // 1
  let seqXml = '';
  if (hasMain) {
    const mainId = nid(); // 2
    let pars = '';
    if (anims.auto && anims.auto.length) {
      const id = nid();
      pars += `<p:par><p:cTn id="${id}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="${mainId}"/></p:cond></p:stCondLst><p:childTnLst>${group(anims.auto, 'withEffect')}</p:childTnLst></p:cTn></p:par>`;
    }
    for (const click of anims.clicks || []) {
      const id = nid();
      pars += `<p:par><p:cTn id="${id}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>${group(click, 'clickEffect')}</p:childTnLst></p:cTn></p:par>`;
    }
    seqXml += `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${mainId}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${pars}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>`;
  }
  for (const tr of anims.triggers || []) {
    const spid = resolve(tr.on);
    const id = nid();
    const inner = `<p:par><p:cTn id="${nid()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${group(tr.effects, 'clickEffect')}</p:childTnLst></p:cTn></p:par>`;
    seqXml += `<p:seq concurrent="1" nextAc="seek"><p:cTn id="${id}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst><p:cond evt="onClick" delay="0"><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cond></p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>${inner}</p:childTnLst></p:cTn><p:nextCondLst><p:cond evt="onClick" delay="0"><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl></p:cond></p:nextCondLst></p:seq>`;
  }
  // список «сборок»: текстовые фигуры — bldP, диаграммы — bldGraphic; картинкам запись не нужна
  const seen = new Set();
  const bldXml = bld.filter((b) => b.kind !== 'pic').filter((b) => { const k = `${b.spid}:${b.grpId}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((b) => (b.kind === 'chart' ? `<p:bldGraphic spid="${b.spid}" grpId="${b.grpId}"><p:bldAsOne/></p:bldGraphic>` : `<p:bldP spid="${b.spid}" grpId="${b.grpId}" animBg="1"/>`)).join('');
  return `<p:timing><p:tnLst><p:par><p:cTn id="${rootId}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>${seqXml}</p:childTnLst></p:cTn></p:par></p:tnLst>${bldXml ? `<p:bldLst>${bldXml}</p:bldLst>` : ''}</p:timing>`;
}

/** Переход между слайдами (стандартные ECMA-переходы) */
export function buildTransition(tr = {}) {
  const spd = tr.spd || 'med';
  const kind = tr.kind || 'fade';
  const inner = {
    fade: '<p:fade/>', push: `<p:push dir="${tr.dir || 'u'}"/>`, wipe: `<p:wipe dir="${tr.dir || 'r'}"/>`, zoom: '<p:zoom/>',
    cover: `<p:cover dir="${tr.dir || 'l'}"/>`, split: '<p:split orient="horz" dir="out"/>', circle: '<p:circle/>', dissolve: '<p:dissolve/>', cut: '<p:cut/>',
  }[kind] || '<p:fade/>';
  return `<p:transition spd="${spd}">${inner}</p:transition>`;
}
