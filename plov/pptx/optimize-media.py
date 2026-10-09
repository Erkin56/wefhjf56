#!/usr/bin/env python3
"""Сжатие медиа в .pptx: одинаковые файлы склеиваются в один, PNG перекодируются в палитру 256 цветов
с прозрачностью (мультяшная графика почти не меняется), если это экономит больше 25 %.
  python3 optimize-media.py deck.pptx"""
import hashlib
import io
import re
import sys
import zipfile
from pathlib import Path

from PIL import Image

src = Path(sys.argv[1])
zin = zipfile.ZipFile(src)
names = zin.namelist()
media = [n for n in names if n.startswith('ppt/media/')]

# 1. перекодирование PNG
data = {n: zin.read(n) for n in names}
saved = 0
for n in media:
    if not n.lower().endswith('.png'):
        continue
    raw = data[n]
    try:
        im = Image.open(io.BytesIO(raw))
        im.load()
        rgba = im.convert('RGBA')
        q = rgba.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
        buf = io.BytesIO()
        q.save(buf, format='PNG', optimize=True)
        new = buf.getvalue()
        if len(new) < len(raw) * 0.75:
            saved += len(raw) - len(new)
            data[n] = new
    except Exception as e:  # noqa: BLE001
        print('  пропуск', n, e)

# 2. одинаковые файлы → один
by_hash = {}
alias = {}
for n in media:
    h = hashlib.sha1(data[n]).hexdigest()
    if h in by_hash:
        alias[n] = by_hash[h]
    else:
        by_hash[h] = n
for n in alias:
    saved += len(data[n])
    del data[n]
for n in list(data):
    if n.endswith('.rels') and alias:
        x = data[n].decode('utf8')
        for dup, keep in alias.items():
            x = x.replace(f'../media/{Path(dup).name}"', f'../media/{Path(keep).name}"')
        data[n] = x.encode('utf8')

tmp = src.with_suffix('.opt.pptx')
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for n in names:
        if n in data:
            zout.writestr(n, data[n])
tmp.replace(src)
print(f'[media] склеено дублей: {len(alias)}, экономия {saved / 1024 / 1024:.1f} МБ → {src.stat().st_size / 1024 / 1024:.1f} МБ')
