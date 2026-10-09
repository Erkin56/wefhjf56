import sys, os
sys.path.insert(0, "/home/user/wefhjf56")
from reportlab.pdfgen import canvas as cv
from book.theme import *
register_fonts()
import book.figures as FG
import book.art as A
from reportlab.lib.colors import HexColor

SCR = "/tmp/claude-0/-home-user-wefhjf56/5951aaae-395c-5de6-89c2-f9316a8be902/scratchpad"
W = COL_W
names = list(FG.FIGS.keys())
# рисуем каждую схему на отдельной странице, панель Scene не рисуем
PAD = 20
c = cv.Canvas(os.path.join(SCR, "meas.pdf"), pagesize=(W + 2 * PAD, 600))
heights = {}
for n in names:
    fn, h, cap, sub, kw = FG.FIGS[n]
    heights[n] = h
    c.saveState(); c.translate(PAD, 20)
    fn(c, W, h)
    c.restoreState()
    c.showPage()
c.save()
import subprocess
subprocess.run(["pdftoppm", "-r", "72", "-png", os.path.join(SCR, "meas.pdf"),
                os.path.join(SCR, "ms")], check=True)
from PIL import Image
import glob, re
files = sorted(glob.glob(os.path.join(SCR, "ms-*.png")))
out = []
for f, n in zip(files, names):
    im = Image.open(f).convert("L")
    w, hh = im.size
    bw = im.point(lambda p: 0 if p > 250 else 255)
    bb = bw.getbbox()
    H = heights[n]
    if not bb:
        out.append((n, H, 0, 0)); continue
    # координаты PNG: y сверху. Схема занимает y от (hh-20-H) до (hh-20)
    top_png = hh - 20 - H
    slack_top = bb[1] - top_png          # пустота сверху внутри схемы
    slack_bot = (hh - 20) - bb[3]        # пустота снизу
    out.append((n, H, slack_top, slack_bot))
out.sort(key=lambda r: -(r[2] + r[3]))
print(f"{'figure':24s} {'H':>5s} {'top':>5s} {'bot':>5s}")
for n, H, t, b in out:
    if t + b > 3:
        print(f"{n:24s} {H:5.0f} {t:5.0f} {b:5.0f}")
print("TOTAL slack pts:", sum(max(0, t) + max(0, b) for _, _, t, b in out))
