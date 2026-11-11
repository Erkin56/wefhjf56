#!/usr/bin/env python3
"""Second asset pass (run after prep_assets.py).

- rebuilds the boss mattes from the sheet with a fitted backdrop model
- removes light fringes from the character cutouts
- 4x super-resolution (EDSR via cv2.dnn when the model file is present, Lanczos otherwise)
- extra stills: close-up of the hero in the lab, freeze frame of the talking clip

Usage: python3 scripts/enhance_assets.py <scratchpad> [path/to/EDSR_x4.pb]
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np
from scipy import ndimage as ndi

SP = sys.argv[1]
MODEL = sys.argv[2] if len(sys.argv) > 2 else ''
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'public', 'img')
META = os.path.join(ROOT, 'src', 'assets.json')
MEAN = np.array([103.1545782, 111.561547, 114.35629928], np.float32)

class DepthToSpace:
    """Pixel shuffle layer (TensorFlow DepthToSpace); plain OpenCV builds do not ship it."""

    def __init__(self, params, blobs):
        pass

    @staticmethod
    def _r(c):
        return int(round((c / 3) ** 0.5))

    def getMemoryShapes(self, inputs):
        n, c, h, w = inputs[0]
        r = self._r(c)
        return [[n, c // (r * r), h * r, w * r]]

    def forward(self, inputs):
        x = inputs[0]
        n, c, h, w = x.shape
        r = self._r(c)
        oc = c // (r * r)
        return [np.ascontiguousarray(x.reshape(n, r, r, oc, h, w).transpose(0, 3, 4, 1, 5, 2).reshape(n, oc, h * r, w * r))]


NET = None
if MODEL and os.path.exists(MODEL) and os.path.getsize(MODEL) > 1_000_000:
    try:
        cv2.dnn_registerLayer('DepthToSpace', DepthToSpace)
        NET = cv2.dnn.readNetFromTensorflow(MODEL)
        probe = np.full((16, 16, 3), 120, np.float32)
        NET.setInput(cv2.dnn.blobFromImage(probe, 1.0, (16, 16), tuple(MEAN.tolist()), False, False))
        assert NET.forward().shape == (1, 3, 64, 64)
    except Exception as e:  # noqa: BLE001
        print('EDSR unavailable:', str(e)[:200])
        NET = None
print('super-resolution:', 'EDSR x4' if NET is not None else 'Lanczos x4')


def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def sr4(bgr):
    """4x upscale of a BGR uint8 image."""
    if NET is None:
        up = cv2.resize(bgr, None, fx=4, fy=4, interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
        return np.clip(up + 0.7 * (up - cv2.GaussianBlur(up, (0, 0), 2.2)), 0, 255).astype(np.uint8)
    h, w = bgr.shape[:2]
    out = np.zeros((h * 4, w * 4, 3), np.uint8)
    T, P = 200, 12
    for y0 in range(0, h, T):
        for x0 in range(0, w, T):
            ya, yb = max(0, y0 - P), min(h, y0 + T + P)
            xa, xb = max(0, x0 - P), min(w, x0 + T + P)
            tile = bgr[ya:yb, xa:xb].astype(np.float32)
            blob = cv2.dnn.blobFromImage(tile, 1.0, (tile.shape[1], tile.shape[0]), tuple(MEAN.tolist()), False, False)
            NET.setInput(blob)
            res = NET.forward()[0].transpose(1, 2, 0) + MEAN
            res = np.clip(res, 0, 255).astype(np.uint8)
            ye, xe = min(h, y0 + T), min(w, x0 + T)
            out[y0 * 4:ye * 4, x0 * 4:xe * 4] = res[(y0 - ya) * 4:(ye - ya) * 4, (x0 - xa) * 4:(xe - xa) * 4]
    return out


def bleed(bgr, known, it=14):
    """Spread known colours into unknown pixels so resampling never picks up backdrop colour."""
    known = known.astype(np.float32)
    col = bgr.astype(np.float32) * known[..., None]
    for _ in range(it):
        kb = cv2.blur(known, (5, 5))
        cb = cv2.blur(col, (5, 5))
        new = (kb > 1e-3) & (known < 0.5)
        col[new] = cb[new] / kb[new][:, None]
        known[new] = 1
    if (known > 0.5).any():
        col[known < 0.5] = col[known > 0.5].mean(0)
    return np.clip(col, 0, 255).astype(np.uint8)


def upscale_rgba(bgr, alpha, choke=0.0, max_h=None):
    """bgr uint8, alpha float 0..1 -> 4x RGBA (BGRA uint8)."""
    big = sr4(bgr)
    a = cv2.resize(alpha.astype(np.float32), None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    a = np.clip(a * (1 + choke) - choke, 0, 1)
    out = np.dstack([big, (a * 255).astype(np.uint8)])
    if max_h and out.shape[0] > max_h:
        s = max_h / out.shape[0]
        out = cv2.resize(out, (int(round(out.shape[1] * s)), max_h), interpolation=cv2.INTER_AREA)
    return out


def trim(rgba, pad=3):
    ys, xs = np.where(rgba[:, :, 3] > 6)
    y0, y1 = max(0, ys.min() - pad), min(rgba.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(rgba.shape[1], xs.max() + 1 + pad)
    return rgba[y0:y1, x0:x1], x0, y0


meta = json.load(open(META))
sprites = meta['sprites']

# ---------------------------------------------------------------- bosses
sheet = cv2.imread(os.path.join(SP, 'img/refs/bosses_sheet_Pyp6MSOm.png')).astype(np.float32)
H, W = sheet.shape[:2]
mx, mn = sheet.max(2), sheet.min(2)
chroma, V = mx - mn, mx
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
X, Y = xx / W, yy / H
TERMS = [np.ones_like(X), X, Y, X * X, X * Y, Y * Y, X ** 3, X * X * Y, X * Y * Y, Y ** 3]


def fit(mask):
    ys, xs = np.where(mask)
    ys, xs = ys[::5], xs[::5]
    A = np.stack([t[ys, xs] for t in TERMS], 1)
    coef = [np.linalg.lstsq(A, sheet[ys, xs, c], rcond=None)[0] for c in range(3)]
    return np.stack([sum(cf[i] * TERMS[i] for i in range(len(TERMS))) for cf in coef], -1)


conf = ndi.binary_erosion((chroma < 7) & (V > 190), iterations=5)
B = fit(conf)
for _ in range(3):
    B = fit(conf & (np.abs((sheet - B).mean(2)) < 4))
d = np.abs(sheet - B).max(2)
Vb = B.max(2)
print('backdrop fit residual p95:', float(np.percentile(d[conf], 95)))
soft = np.clip((d - 7) / 20, 0, 1)
shadow = (chroma < 18) & (V < Vb - 2) & (V > 110) & (yy > 0.70 * H)
soft[shadow] = 0
hard = soft > 0.5
holes = ndi.binary_fill_holes(hard) & ~hard
lab, n = ndi.label(holes)
if n:
    sizes = ndi.sum(holes, lab, range(1, n + 1))
    soft[np.isin(lab, 1 + np.where(sizes < 260)[0])] = 1
# cloud under the teal boss: white on a light backdrop, keep it with a soft region rule
ell = ((xx - 1228) / 138) ** 2 + ((yy - 487) / 68) ** 2 < 1
cloud = ell & ((V > Vb + 3.5) | (sheet[:, :, 0] - sheet[:, :, 2] > 4) | (soft > 0.3))
cloud = ndi.binary_fill_holes(ndi.binary_closing(cloud, structure=disk(5)))
cloud = ndi.binary_opening(cloud, structure=disk(3))
forced = cv2.GaussianBlur(cloud.astype(np.float32), (0, 0), 1.4)
alpha = np.maximum(soft, forced)
# drop specks that are not attached to a character
lab, n = ndi.label(alpha > 0.3)
if n:
    sizes = ndi.sum(alpha > 0.3, lab, range(1, n + 1))
    alpha[np.isin(lab, 1 + np.where(sizes < 500)[0])] = 0
a3 = alpha[..., None]
F = np.where(a3 > 0.03, (sheet - (1 - a3) * B) / np.maximum(a3, 0.03), sheet)
F = np.where(forced[..., None] > 0.5, sheet, F)
F = np.clip(F, 0, 255)
alpha = np.clip(alpha * 1.12 - 0.08, 0, 1)

row_bgr = bleed(F.astype(np.uint8), alpha > 0.3, 6)
row = np.dstack([row_bgr, (alpha * 255).astype(np.uint8)])[150:600, 10:1370]
row, tx, ty = trim(row)
cv2.imwrite(os.path.join(IMG, 'bosses.png'), row)
sprites['bosses'] = {'w': int(row.shape[1]), 'h': int(row.shape[0]), 'ox': 10 + int(tx), 'oy': 150 + int(ty)}

# the red boss on its own
x0, y0, x1, y1 = 244, 214, 600, 592
f = F[y0:y1, x0:x1].astype(np.uint8)
a = alpha[y0:y1, x0:x1]
hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
hh, ss, vv = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
redm = ((hh < 10) | (hh > 166)) & (ss > 85) & (a > 0.5)
redm = ndi.binary_opening(redm, structure=disk(2))
lab, n = ndi.label(redm)
core = lab == (1 + int(np.argmax(ndi.sum(redm, lab, range(1, n + 1)))))
body = ndi.binary_fill_holes(ndi.binary_closing(np.pad(core, 12), structure=disk(10))[12:-12, 12:-12]) & (a > 0.04)
foreign = body & (hh > 15) & (hh < 165) & (ss > 70) & (vv > 60)
foreign = ndi.binary_dilation(foreign, structure=disk(2)) & body
f = cv2.inpaint(f, foreign.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
ra = a * cv2.GaussianBlur(body.astype(np.float32), (0, 0), 1.0)
red = upscale_rgba(bleed(f, ra > 0.4, 8), ra)
red, _, _ = trim(red)
cv2.imwrite(os.path.join(IMG, 'boss_red.png'), red)
sprites['boss_red'] = {'w': int(red.shape[1]), 'h': int(red.shape[0])}
print('bosses', row.shape, 'boss_red', red.shape, 'foreign px', int(foreign.sum()))

# ---------------------------------------------------------------- characters
if not meta.get('enhanced'):
    for name in ['hero_front', 'hero_back', 'hero_smile', 'hero_panic', 'suit_front', 'suit_smile', 'suit_panic', 'robot_front', 'robot_34']:
        p = os.path.join(IMG, name + '.png')
        im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
        a = im[:, :, 3].astype(np.float32) / 255
        robot = name.startswith('robot')
        if robot:
            col = bleed(im[:, :, :3], a > 0.06, 10)
            out = upscale_rgba(col, a, choke=0.0)
        else:
            a = np.clip(a * 1.3 - 0.3, 0, 1)
            col = bleed(im[:, :, :3], ndi.binary_erosion(a > 0.9, iterations=1), 10)
            keep = (a > 0.97)[..., None]
            col = np.where(keep, im[:, :, :3], col)
            out = upscale_rgba(col, a, choke=0.08, max_h=1500)
        cv2.imwrite(p, out)
        sprites[name] = {'w': int(out.shape[1]), 'h': int(out.shape[0])}
        print(name, out.shape)
    meta['enhanced'] = True

# ---------------------------------------------------------------- extra stills
k4d = cv2.imread(os.path.join(IMG, 'k4d.jpg'))
crop = k4d[430:1390, 0:540]
big = cv2.resize(sr4(crop), (1080, 1920), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(IMG, 'k4d_hero.jpg'), big, [cv2.IMWRITE_JPEG_QUALITY, 93])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ROOT, 'public', 'vid', 'h1.mp4'), '-vf', 'select=eq(n\\,60)',
                '-frames:v', '1', '-q:v', '2', os.path.join(IMG, 'h1_last.jpg')], check=True)
meta['phone'] = {'x': 353, 'y': 532, 'w': 374, 'h': 828, 'r': 40}
json.dump(meta, open(META, 'w'), ensure_ascii=False)
print(json.dumps(meta, ensure_ascii=False))

# ---------------------------------------------------------------- debug sheet on a dark backdrop
os.makedirs(os.path.join(SP, 'chk'), exist_ok=True)
canvas = np.zeros((1250, 1400, 3), np.uint8)
canvas[:] = (70, 14, 34)


def paste(dst, rgba, x, y, hgt):
    s = hgt / rgba.shape[0]
    r = cv2.resize(rgba, (int(rgba.shape[1] * s), hgt), interpolation=cv2.INTER_AREA)
    w = min(r.shape[1], dst.shape[1] - x)
    al = r[:, :w, 3:4].astype(np.float32) / 255
    dst[y:y + hgt, x:x + w] = (r[:, :w, :3] * al + dst[y:y + hgt, x:x + w] * (1 - al)).astype(np.uint8)
    return x + w + 12


paste(canvas, row, 20, 10, int(row.shape[0] * 1360 / row.shape[1] * 0.98))
x = 10
for name in ['boss_red', 'robot_front', 'suit_smile', 'suit_panic', 'hero_smile', 'suit_front', 'hero_back']:
    x = paste(canvas, cv2.imread(os.path.join(IMG, name + '.png'), cv2.IMREAD_UNCHANGED), x, 470, 380)
    if x > 1300:
        break
paste(canvas, np.dstack([big, np.full(big.shape[:2], 255, np.uint8)]), 10, 860, 380)
x = 240
for name in ['robot_34', 'hero_front', 'hero_panic']:
    x = paste(canvas, cv2.imread(os.path.join(IMG, name + '.png'), cv2.IMREAD_UNCHANGED), x, 860, 380)
cv2.imwrite(os.path.join(SP, 'chk', 'enhanced.jpg'), canvas, [cv2.IMWRITE_JPEG_QUALITY, 86])
