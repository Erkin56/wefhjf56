#!/usr/bin/env python3
"""Generate the deck's decorative assets and crop the photos to their slide frames.

Usage: python3 -I make_assets.py <photos_dir> <out_dir>

Writes:
  out_dir/*.jpg, *.png       cropped photos, ikat swatches, gold medallion
  out_dir/manifest.json      frame (inches) and file for every image the deck places
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PHOTOS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

DPI = 240  # target pixel density for photos placed on 13.333 x 7.5 in slides


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


# ---------------------------------------------------------------- photos

def fit_crop(size, aspect, focus=None, region=None):
    """Largest box with the given aspect (w/h) inside region, centred on focus."""
    W, H = size
    x0, y0, x1, y1 = region or (0, 0, W, H)
    rw, rh = x1 - x0, y1 - y0
    if rw / rh > aspect:
        h, w = rh, rh * aspect
    else:
        w, h = rw, rw / aspect
    fx, fy = focus or ((x0 + x1) / 2, (y0 + y1) / 2)
    left = min(max(fx - w / 2, x0), x1 - w)
    top = min(max(fy - h / 2, y0), y1 - h)
    return (round(left), round(top), round(left + w), round(top + h))


def place_photo(name, src, frame, focus=None, region=None, sharpen=False):
    im = Image.open(os.path.join(PHOTOS, src)).convert('RGB')
    aspect = frame['w'] / frame['h']
    box = fit_crop(im.size, aspect, focus, region)
    im = im.crop(box)
    target_w = round(frame['w'] * DPI)
    # never upscale more than 2x; small sources get a gentle sharpen after resampling
    target_w = min(target_w, im.width * 2)
    target_h = round(target_w / aspect)
    if target_w != im.width:
        im = im.resize((target_w, target_h), Image.LANCZOS)
    if sharpen or target_w > box[2] - box[0]:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    path = f'{name}.jpg'
    im.save(os.path.join(OUT, path), quality=90, optimize=True, progressive=True)
    return {'file': path, **frame, 'crop': box, 'px': im.size}


# ---------------------------------------------------------------- ikat fabric

def ikat_fabric(W, H, pal, seed, col_w=150, period=270):
    """Warp-ikat style textile: almond columns, comb stripes, feathered warp shifts."""
    img = Image.new('RGB', (W, H), rgb(pal['ground']))
    d = ImageDraw.Draw(img)
    ncols = W // col_w + 3
    for c in range(-1, ncols):
        x0 = c * col_w
        bw = int(col_w * 0.17)
        bx = x0 - bw // 2
        d.rectangle([bx - 9, 0, bx - 6, H], fill=rgb(pal['pin']))
        d.rectangle([bx + bw + 6, 0, bx + bw + 9, H], fill=rgb(pal['pin']))
        d.rectangle([bx, 0, bx + bw, H], fill=rgb(pal['comb_bg']))
        for y in range(0, H, 20):
            d.rectangle([bx + 3, y, bx + bw - 3, y + 8], fill=rgb(pal['comb_fg']))
    layers = [(0.43, 0.47, 'outer'), (0.31, 0.36, 'mid'), (0.19, 0.23, 'core'), (0.08, 0.10, 'dot')]
    for c in range(-1, ncols):
        cx = c * col_w + col_w / 2
        off = period / 2 if c % 2 else 0
        for r in range(-2, H // period + 3):
            cy = r * period + off
            for sx, sy, key in layers:
                hw, hh = col_w * sx, period * sy
                pts = []
                for i in range(41):
                    t = -1 + i / 20
                    pts.append((cx + hw * (1 - t * t) ** 1.15, cy + hh * t))
                for i in range(41):
                    t = 1 - i / 20
                    pts.append((cx - hw * (1 - t * t) ** 1.15, cy + hh * t))
                d.polygon(pts, fill=rgb(pal[key]))
            # small hooks between almonds (ram-horn hint)
            hy = cy + period / 2
            d.ellipse([cx - 9, hy - 9, cx + 9, hy + 9], fill=rgb(pal['outer']))

    a = np.asarray(img).copy()
    rng = np.random.default_rng(seed)
    tw = 3
    n = W // tw + 1
    walk = np.cumsum(rng.normal(0, 1.0, n))
    walk -= np.convolve(walk, np.ones(81) / 81, mode='same')
    walk = np.convolve(walk, np.ones(7) / 7, mode='same')
    offs = walk * 3.2 + rng.normal(0, 4.0, n) + (rng.random(n) < 0.07) * rng.normal(0, 15, n)
    offs = np.round(offs).astype(int)
    out = np.empty_like(a)
    for t in range(n):
        sl = slice(t * tw, min((t + 1) * tw, W))
        out[:, sl] = np.roll(a[:, sl], offs[t], axis=0)

    # dye bleed along the warp: soften vertically only
    im = Image.fromarray(out)
    im = im.resize((W, max(1, H // 3)), Image.BOX).resize((W, H), Image.BICUBIC)
    f = np.asarray(im).astype(np.float32) / 255.0
    f *= np.repeat(1 + rng.normal(0, 0.03, n), tw)[:W][None, :, None]
    y = np.arange(H)
    f *= (1 - 0.05 * (np.sin(y * 2 * np.pi / 4.0) > 0.55))[:, None, None]
    xx, yy = np.meshgrid(np.linspace(0, 1, W), np.linspace(0, 1, H))
    f *= (0.92 + 0.13 * np.exp(-((xx * 0.8 + yy * 0.6 - 0.62) ** 2) / 0.045))[..., None]
    return Image.fromarray(np.clip(f * 255, 0, 255).astype(np.uint8))


def pinked_polygon(W, H, tooth, inset):
    """Zig-zag outline of a pinking-shear cut, clockwise in image coordinates."""
    corners = [(inset, inset), (W - inset, inset), (W - inset, H - inset), (inset, H - inset)]
    pts = []
    depth = tooth * 0.42
    for i in range(4):
        (ax, ay), (bx, by) = corners[i], corners[(i + 1) % 4]
        length = math.hypot(bx - ax, by - ay)
        k = max(1, round(length / tooth))
        dx, dy = (bx - ax) / length, (by - ay) / length
        nx, ny = -dy, dx  # inward normal for clockwise traversal with y pointing down
        for j in range(k):
            t0 = j / k * length
            th = (j + 0.5) / k * length
            pts.append((ax + dx * t0, ay + dy * t0))
            pts.append((ax + dx * th + nx * depth, ay + dy * th + ny * depth))
    return pts


def swatch(name, pal, seed, size=(900, 1150), angle=0.0):
    W, H = size
    pad = 70
    ss = 3
    fabric = ikat_fabric(W, H, pal, seed)
    mask_big = Image.new('L', (W * ss, H * ss), 0)
    ImageDraw.Draw(mask_big).polygon(
        [(x * ss, y * ss) for x, y in pinked_polygon(W, H, tooth=24, inset=4)], fill=255)
    mask = mask_big.resize((W, H), Image.LANCZOS)

    canvas = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
    shadow = Image.new('L', canvas.size, 0)
    shadow.paste(mask, (pad + 10, pad + 16))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.42))
    canvas.paste((20, 16, 24, 255), (0, 0), shadow)
    piece = fabric.convert('RGBA')
    piece.putalpha(mask)
    canvas.alpha_composite(piece, (pad, pad))
    if angle:
        canvas = canvas.rotate(angle, resample=Image.BICUBIC, expand=True)
    bbox = canvas.getbbox()
    canvas = canvas.crop(bbox)
    canvas = canvas.resize((round(canvas.width * 0.55), round(canvas.height * 0.55)), Image.LANCZOS)
    path = f'{name}.png'
    canvas.save(os.path.join(OUT, path), optimize=True)
    return path, canvas.size


# ---------------------------------------------------------------- shamsa medallion

def medallion(name, size_px, gold, visible_frac):
    """Gold line medallion in the spirit of manuscript shamsa ornaments.

    visible_frac: share of the width kept from the left (the rest falls off the slide).
    """
    ss = 2
    S = size_px * ss
    c = S / 2
    R = S * 0.48
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = rgb(gold) + (255,)
    faint = rgb(gold) + (26,)
    lw = max(2, int(S * 0.0024))

    def circle(r, width=lw, fill=None):
        d.ellipse([c - r, c - r, c + r, c + r], outline=col, width=width, fill=fill)

    def polar(r, a):
        return (c + r * math.cos(a), c + r * math.sin(a))

    circle(R)
    circle(R * 0.965, width=max(1, lw // 2))
    for k in range(180):
        x, y = polar(R * 0.93, 2 * math.pi * k / 180)
        rr = S * 0.0030
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=col)
    circle(R * 0.895, width=max(1, lw // 2))

    def petal(r0, r1, a, half, steps=48):
        """Lancet petal: pointed at both ends, widest a third of the way out."""
        side = []
        for i in range(steps + 1):
            t = i / steps
            side.append((r0 + (r1 - r0) * t, half * math.sin(math.pi * t ** 0.7) ** 1.3))
        pts = [polar(r, a - w / r) for r, w in side]
        pts += [polar(r, a + w / r) for r, w in reversed(side)]
        return pts

    for k in range(16):
        a = 2 * math.pi * k / 16 - math.pi / 2
        d.polygon(petal(R * 0.61, R * 0.875, a, R * 0.052), outline=col, width=lw)
        d.polygon(petal(R * 0.655, R * 0.81, a, R * 0.022), outline=col, fill=col)
        b = a + math.pi / 16
        d.polygon(petal(R * 0.66, R * 0.80, b, R * 0.020), outline=col, width=max(1, lw // 2))
        x, y = polar(R * 0.858, b)
        rr = S * 0.0052
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=col)

    circle(R * 0.60)
    circle(R * 0.585, width=max(1, lw // 2))

    def star(r_out, width):
        r_in = r_out * math.cos(math.pi / 4) / math.cos(math.pi / 8)
        pts = []
        for j in range(16):
            a = j * math.pi / 8 - math.pi / 2
            pts.append(polar(r_out if j % 2 == 0 else r_in, a))
        d.polygon(pts, outline=col, width=width)

    star(R * 0.565, lw)
    star(R * 0.50, max(1, lw // 2))
    for j in range(8):
        a = j * math.pi / 4 - math.pi / 2
        x, y = polar(R * 0.565, a)
        rr = S * 0.0055
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=col)

    circle(R * 0.31)
    for k in range(72):
        x, y = polar(R * 0.335, 2 * math.pi * k / 72)
        rr = S * 0.0022
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=col)
    for k in range(8):
        a = 2 * math.pi * k / 8 - math.pi / 2
        d.polygon(petal(R * 0.075, R * 0.285, a, R * 0.05), outline=col, fill=faint, width=lw)
        d.polygon(petal(R * 0.12, R * 0.25, a + math.pi / 8, R * 0.014), outline=col, fill=col)
    circle(R * 0.045, fill=col)

    im = im.resize((size_px, size_px), Image.LANCZOS)
    im = im.crop((0, 0, round(size_px * visible_frac), size_px))
    path = f'{name}.png'
    im.save(os.path.join(OUT, path), optimize=True)
    return path


# ---------------------------------------------------------------- build everything

GOLD = 'C2A25C'
CRIMSON_PAL = dict(ground='9C1C33', outer='F1E6CF', mid='26326E', core='D2A63E', dot='9C1C33',
                   comb_bg='1C2452', comb_fg='D2A63E', pin='F1E6CF')
INDIGO_PAL = dict(ground='1F2B66', outer='D2A63E', mid='9C1C33', core='F1E6CF', dot='1F2B66',
                  comb_bg='9C1C33', comb_fg='F1E6CF', pin='D2A63E')
NOIR_PAL = dict(ground='17151B', outer='EEE7DA', mid='17151B', core='C9A45A', dot='EEE7DA',
                comb_bg='EEE7DA', comb_fg='17151B', pin='C9A45A')

manifest = {}

# photos: frames are in inches on a 13.333 x 7.5 in slide
manifest['cover_photo'] = place_photo('cover_photo', 'p10.jpg', dict(x=8.333, y=0.0, w=5.0, h=7.5),
                                      focus=(430, 640), region=(35, 0, 818, 1280))
manifest['s2_portrait'] = place_photo('s2_portrait', 'p14.jpg', dict(x=7.75, y=0.55, w=3.1, h=6.2),
                                      focus=(430, 640))
manifest['s2_look1'] = place_photo('s2_look1', 'p03.jpg', dict(x=11.03, y=0.55, w=1.703, h=3.01),
                                   focus=(250, 347))
manifest['s2_look2'] = place_photo('s2_look2', 'p02.jpg', dict(x=11.03, y=3.74, w=1.703, h=3.01),
                                   focus=(896, 330), region=(724, 12, 1068, 710))
manifest['s4_dress'] = place_photo('s4_dress', 'p13.jpg', dict(x=9.98, y=0.55, w=2.753, h=6.2),
                                   focus=(520, 640))
manifest['s4_cert'] = place_photo('s4_cert', 'p12.jpg', dict(x=7.35, y=0.55, w=2.43, h=1.711))
manifest['s5_card'] = place_photo('s5_card', 'p11.jpg', dict(x=0.6, y=0.55, w=4.4, h=6.2),
                                  focus=(600, 600), region=(120, 0, 960, 1280))
manifest['s6_humo'] = place_photo('s6_humo', 'p05.jpg', dict(x=0.6, y=1.9, w=6.75, h=4.494))
manifest['s7_diploma'] = place_photo('s7_diploma', 'p07.jpg', dict(x=0.6, y=1.95, w=3.95, h=2.82))
manifest['s7_stage'] = place_photo('s7_stage', 'p09.jpg', dict(x=4.75, y=1.95, w=1.88, h=2.82))
manifest['s8_parade'] = place_photo('s8_parade', 'p04.jpg', dict(x=9.45, y=1.95, w=3.283, h=4.4), region=(6, 7, 574, 460),
                                    focus=(240, 234), sharpen=True)

# fabric swatches (pinked edges, soft shadow); sizes in px at ~500 dpi for ~1.8 in pieces
for key, pal, seed, angle in [('swatch_crimson', CRIMSON_PAL, 7, -7),
                              ('swatch_indigo', INDIGO_PAL, 11, 6),
                              ('swatch_noir', NOIR_PAL, 5, -4)]:
    path, px = swatch(key, pal, seed, angle=angle)
    manifest[key] = {'file': path, 'px': px}

# medallion: 6.2 in across, centred at x = 11.25 in, so the right part falls off the slide
diam_in, centre_x = 6.2, 11.25
left_in = centre_x - diam_in / 2
visible = (13.333 - left_in) / diam_in
manifest['medallion'] = {'file': medallion('medallion', 1800, GOLD, visible),
                         'x': left_in, 'y': 3.75 - diam_in / 2, 'w': diam_in * visible, 'h': diam_in}

with open(os.path.join(OUT, 'manifest.json'), 'w') as fh:
    json.dump(manifest, fh, indent=1)
for k, v in manifest.items():
    print(k, v.get('file'), v.get('px'), v.get('crop', ''))
