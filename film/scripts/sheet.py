#!/usr/bin/env python3
"""Contact sheets from preview stills: python3 scripts/sheet.py <dir> [cols] [thumb_w] [per_sheet]"""
import glob, os, sys
from PIL import Image, ImageDraw
d = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 7; tw = int(sys.argv[3]) if len(sys.argv) > 3 else 280; per = int(sys.argv[4]) if len(sys.argv) > 4 else 21
files = sorted(glob.glob(os.path.join(d, 'f_*.jpg'))); th = tw * 16 // 9
for old in glob.glob(os.path.join(d, 'sheet_*.jpg')): os.remove(old)
for s in range(0, len(files), per):
    part = files[s:s + per]; rows = (len(part) + cols - 1) // cols
    sh = Image.new('RGB', (cols * tw, rows * th), (30, 30, 30)); dr = ImageDraw.Draw(sh)
    for i, p in enumerate(part):
        x, y = (i % cols) * tw, (i // cols) * th
        sh.paste(Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
        lab = os.path.basename(p)[2:-4]; dr.rectangle([x, y, x + 52, y + 15], fill=(0, 0, 0)); dr.text((x + 3, y + 2), lab, fill=(255, 255, 0))
    sh.save(os.path.join(d, 'sheet_%d.jpg' % (s // per)), quality=84)
print('sheets:', (len(files) + per - 1) // per)
