#!/usr/bin/env python3
"""QA PowerPoint-версии: снимок слайда после каждого щелчка (и после триггеров).
  python3 qa-states.py deck.pptx deck.anims.json outdir path/to/soffice.py [--slide N] [--dpi 72]
Для каждого слайда N (или только --slide N) рендерит состояния s{N}-k{K}.jpg: K = 0 (до щелчков) … все щелчки,
затем s{N}-t{i}.jpg — после i-го триггера (поверх всех щелчков). Видимость считается по эффектам:
вход — фигура видна, выход — скрыта, выделение/путь — не меняет (движение по пути не отображается)."""
import json
import subprocess
import sys
from pathlib import Path

from pptx import Presentation

EXIT = {'hide', 'fadeOut', 'zoomOut', 'collapseX', 'flyOutTop', 'flyOutBottom', 'flyOutLeft', 'flyOutRight', 'sinkDown'}
ENTR = {'appear', 'fade', 'zoom', 'pop', 'slam', 'drop', 'flyTop', 'flyBottom', 'flyLeft', 'flyRight', 'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown', 'expandX', 'riseUp'}

args = sys.argv[1:]
deck, anims_f, out, soff = args[0], args[1], Path(args[2]), args[3]
only = int(args[args.index('--slide') + 1]) if '--slide' in args else None
dpi = args[args.index('--dpi') + 1] if '--dpi' in args else '72'
out.mkdir(parents=True, exist_ok=True)
anims = json.load(open(anims_f))


def states(a):
    """список (метка, [эффекты по порядку])"""
    auto = list(a.get('auto', []))
    clicks = a.get('clicks', [])
    res = []
    for k in range(len(clicks) + 1):
        effs = auto + [e for c in clicks[:k] for e in sorted(c, key=lambda e: e.get('delay', 0))]
        res.append((f'k{k}', effs))
    base = res[-1][1]
    acc = list(base)
    for i, t in enumerate(a.get('triggers', [])):
        acc = acc + sorted(t['effects'], key=lambda e: e.get('delay', 0))
        res.append((f't{i + 1}', list(acc)))
    return res


def visibility(all_effects, effects):
    first = {}
    for e in all_effects:
        first.setdefault(e['t'], e['fx'])
    vis = {n: (fx not in ENTR) for n, fx in first.items()}
    for e in effects:
        if e['fx'] in ENTR:
            vis[e['t']] = True
        elif e['fx'] in EXIT:
            vis[e['t']] = False
    return vis


jobs = []
prs0 = Presentation(deck)
n_slides = len(prs0.slides)
for si in range(n_slides):
    if only and si + 1 != only:
        continue
    a = anims[si] if si < len(anims) else {}
    all_e = list(a.get('auto', [])) + [e for c in a.get('clicks', []) for e in c] + [e for t in a.get('triggers', []) for e in t['effects']]
    for label, effs in states(a):
        jobs.append((si, label, visibility(all_e, effs)))

# все состояния — в один файл (по слайду на состояние), затем один PDF
prs = Presentation(deck)
xml_slides = prs.slides._sldIdLst
src = list(prs.slides)
order = []
for si, label, vis in jobs:
    order.append((si, label, vis))

# дублируем слайды через сохранение по одному состоянию (надёжнее, чем копировать XML)
for f in out.glob('s*.jpg'):
    f.unlink()
for si, label, vis in order:
    p = Presentation(deck)
    keep = p.slides[si]
    for sh in list(keep.shapes):
        if sh.name in vis and not vis[sh.name]:
            sh._element.getparent().remove(sh._element)
    # оставить только этот слайд
    ids = list(p.slides._sldIdLst)
    for i, sid in enumerate(ids):
        if i != si:
            p.slides._sldIdLst.remove(sid)
    name = f's{si + 1:02d}-{label}'
    p.save(out / f'{name}.pptx')
    subprocess.run([sys.executable, soff, '--headless', '--convert-to', 'pdf', '--outdir', str(out), str(out / f'{name}.pptx')], check=True, capture_output=True)
    subprocess.run(['pdftoppm', '-jpeg', '-r', dpi, '-singlefile', str(out / f'{name}.pdf'), str(out / name)], check=True)
    (out / f'{name}.pptx').unlink()
    (out / f'{name}.pdf').unlink()
    print(out / f'{name}.jpg')
