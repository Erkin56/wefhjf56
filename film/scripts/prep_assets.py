#!/usr/bin/env python3
"""Prepare local assets for the film: sprite cutouts, scene images, videos,
synthesized music cues and the final audio mix. No network, no paid services.
Usage: python3 scripts/prep_assets.py <scratchpad_dir>
"""
import glob, json, os, subprocess, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy import signal

SP = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
for d in ('img', 'vid', 'audio', 'logo'):
    os.makedirs(os.path.join(PUB, d), exist_ok=True)
assets = {'sprites': {}}

# ---------------------------------------------------------------- sprites
def cutout(img, box, thr=9):
    x0, y0, x1, y1 = box
    crop = img[y0:y1, x0:x1].astype(np.int16)
    left = np.median(crop[:, :6], axis=1)
    right = np.median(crop[:, -6:], axis=1)
    xs = np.linspace(0, 1, crop.shape[1])[None, :, None]
    bg = left[:, None, :] * (1 - xs) + right[:, None, :] * xs
    diff = np.abs(crop - bg).max(axis=2)
    m = diff > thr
    m = ndi.binary_closing(m, iterations=3)
    m = ndi.binary_fill_holes(m)
    m = ndi.binary_opening(m, iterations=1)
    lab, n = ndi.label(m)
    if n:
        sizes = ndi.sum(m, lab, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s > 0.004 * m.size]
        m = np.isin(lab, keep)
    a = ndi.gaussian_filter(m.astype(np.float32), 1.0)
    a = np.clip((a - 0.4) / 0.45, 0, 1)
    rgb = img[y0:y1, x0:x1, ::-1]
    return np.dstack([rgb, (a * 255).astype(np.uint8)])

def save_sprite(name, rgba):
    ys, xs = np.where(rgba[:, :, 3] > 8)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(rgba).save(os.path.join(PUB, 'img', name + '.png'))
    assets['sprites'][name] = {'w': int(rgba.shape[1]), 'h': int(rgba.shape[0])}
    return rgba

def to_suit(rgba, clothes_from=0.0, tie=None, straps=True):
    """Recolor the blue jacket to dark navy, the orange straps to navy and the cream hoodie to white."""
    out = rgba.copy()
    hsv = cv2.cvtColor(out[:, :, :3], cv2.COLOR_RGB2HSV).astype(np.float32)
    hgt = out.shape[0]
    rows = np.arange(hgt)[:, None] >= clothes_from * hgt
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    blue = (h > 100) & (h < 128) & (s > 80)
    v[blue] *= 0.40; s[blue] *= 0.85; h[blue] = 113
    if straps:
        orange = (h > 3) & (h < 16) & (s > 150) & (v > 70) & rows
        h[orange] = 113; s[orange] = 150; v[orange] *= 0.35
    cream = (h > 12) & (h < 32) & (s > 18) & (s < 95) & (v > 150) & rows
    s[cream] *= 0.18; v[cream] = np.minimum(255, v[cream] * 1.07)
    out[:, :, :3] = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2RGB)
    if tie:
        im = Image.fromarray(out)
        d = ImageDraw.Draw(im)
        cx, top, w, length = tie
        W, H = im.size
        cx, top, w, length = cx * W, top * H, w * W, length * H
        d.polygon([(cx - w * .55, top), (cx + w * .55, top), (cx + w * .38, top + w * .9), (cx - w * .38, top + w * .9)], fill=(24, 74, 200, 255))
        d.polygon([(cx - w * .38, top + w * .9), (cx + w * .38, top + w * .9), (cx + w * .75, top + length * .82), (cx, top + length), (cx - w * .75, top + length * .82)], fill=(31, 92, 232, 255))
        d.line([(cx - w * .38, top + w * .9), (cx + w * .38, top + w * .9)], fill=(14, 48, 140, 255), width=max(2, int(w * .12)))
        out = np.array(im)
        out[:, :, 3] = np.maximum(out[:, :, 3], 0)
    return out

hero = cv2.imread(os.path.join(SP, 'img/refs/hero_sheet_RuaA7OdP.png'))
robot = cv2.imread(os.path.join(SP, 'img/refs/robot_sheet_qagcr7oa.png'))
bosses = cv2.imread(os.path.join(SP, 'img/refs/bosses_sheet_Pyp6MSOm.png'))

h_front = save_sprite('hero_front', cutout(hero, (28, 70, 266, 722)))
h_back = save_sprite('hero_back', cutout(hero, (742, 75, 980, 722)))
h_smile = save_sprite('hero_smile', cutout(hero, (1036, 384, 1322, 752)))
h_panic = save_sprite('hero_panic', cutout(hero, (1030, 16, 1306, 384)))
save_sprite('suit_front', to_suit(h_front, 0.2, tie=(0.5, 0.245, 0.055, 0.2)))
save_sprite('suit_smile', to_suit(h_smile, 0.69, tie=(0.5, 0.8, 0.07, 0.2), straps=False))
save_sprite('suit_panic', to_suit(h_panic, 0.69, tie=(0.46, 0.8, 0.07, 0.2), straps=False))

r_front = save_sprite('robot_front', cutout(robot, (40, 100, 372, 402), thr=7))
save_sprite('robot_34', cutout(robot, (384, 100, 700, 402), thr=7))
# eye positions on the front robot (cyan blobs), relative to the sprite size
hsv = cv2.cvtColor(r_front[:, :, :3], cv2.COLOR_RGB2HSV)
cy = (hsv[:, :, 0] > 80) & (hsv[:, :, 0] < 100) & (hsv[:, :, 1] > 90) & (hsv[:, :, 2] > 180)
cy[: int(r_front.shape[0] * 0.2)] = False
cy[int(r_front.shape[0] * 0.58):] = False
lab, n = ndi.label(ndi.binary_opening(cy, iterations=2))
blobs = sorted(((ndi.sum(cy, lab, i), i) for i in range(1, n + 1)), reverse=True)[:2]
eyes = []
for _, i in blobs:
    ys, xs = np.where(lab == i)
    eyes.append({'cx': float(xs.mean() / r_front.shape[1]), 'cy': float(ys.mean() / r_front.shape[0]),
                 'rx': float((xs.max() - xs.min()) / 2 / r_front.shape[1]), 'ry': float((ys.max() - ys.min()) / 2 / r_front.shape[0])})
assets['robotEyes'] = sorted(eyes, key=lambda e: e['cx'])

row = save_sprite('bosses', cutout(bosses, (20, 150, 1366, 598)))
red = cutout(bosses, (236, 214, 596, 584))
yy, xx = np.mgrid[0:red.shape[0], 0:red.shape[1]]
ell = ((xx - red.shape[1] * 0.5) / (red.shape[1] * 0.5)) ** 2 + ((yy - red.shape[0] * 0.5) / (red.shape[0] * 0.52)) ** 2
red[:, :, 3] = (red[:, :, 3] * np.clip((1.02 - ell) / 0.08, 0, 1)).astype(np.uint8)
rh = cv2.cvtColor(red[:, :, :3], cv2.COLOR_RGB2HSV)
red[:, :, 3][(rh[:, :, 0] > 18) & (rh[:, :, 0] < 150) & (rh[:, :, 1] > 70)] = 0
red[:, :, 3] = (ndi.gaussian_filter(ndi.binary_opening(red[:, :, 3] > 100, iterations=2).astype(np.float32), 1.0) * 255).astype(np.uint8)
save_sprite('boss_red', red)

# debug sheet to eyeball the cutouts
names = ['hero_front', 'hero_back', 'hero_smile', 'hero_panic', 'suit_front', 'suit_smile', 'suit_panic', 'robot_front', 'robot_34', 'boss_red']
sheet = Image.new('RGB', (len(names) * 260, 420), (90, 20, 110))
for i, nme in enumerate(names):
    im = Image.open(os.path.join(PUB, 'img', nme + '.png'))
    im.thumbnail((250, 400))
    sheet.paste(im, (i * 260 + 5, 10), im)
sheet.save(os.path.join(SP, 'sprites_debug.jpg'), quality=88)
b = Image.open(os.path.join(PUB, 'img', 'bosses.png')); b.thumbnail((1300, 500))
bg = Image.new('RGB', b.size, (20, 20, 60)); bg.paste(b, (0, 0), b); bg.save(os.path.join(SP, 'bosses_debug.jpg'), quality=88)

# ---------------------------------------------------------------- scene images
for k in ['K_1A', 'K_1B', 'K_1C', 'K_1D', 'K_1E', 'K_2B', 'K_3D', 'K_3F', 'K_4B', 'K_4D']:
    im = Image.open(os.path.join(SP, 'img/kf', k + '.png')).convert('RGB')
    im = im.resize((1080, int(round(1080 * im.height / im.width))), Image.LANCZOS)
    im.save(os.path.join(PUB, 'img', k.lower().replace('_', '') + '.jpg'), quality=93)
for src, dst in [('K_1D', 'bg_game_blur'), ('K_4D', 'bg_lab_blur')]:
    im = cv2.imread(os.path.join(SP, 'img/kf', src + '.png'))
    im = cv2.GaussianBlur(cv2.resize(im, (540, 968)), (0, 0), 14)
    cv2.imwrite(os.path.join(PUB, 'img', dst + '.jpg'), im, [cv2.IMWRITE_JPEG_QUALITY, 90])

# ---------------------------------------------------------------- videos (30 fps, 1080x1920, no audio)
for src, dst in [('vid/test/omni_h1.mp4', 'h1.mp4'), ('vid/test/veo_react.mp4', 'react.mp4')]:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(SP, src), '-an', '-vf',
                    'fps=30,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,unsharp=5:5:0.5',
                    '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', os.path.join(PUB, 'vid', dst)], check=True)

# ---------------------------------------------------------------- audio
SR = 48000
DUR = 90.0
N = int(SR * DUR)

def load(path, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if af:
        cmd += ['-af', af]
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

def put(bus, x, t, gain=1.0):
    i = int(round(t * SR))
    if i >= N:
        return
    x = x[: N - i]
    bus[i:i + len(x)] += x * gain

def fade(x, fin=0.01, fout=0.05):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

def rms_norm(x, target):
    m = np.abs(x).max(axis=1)
    act = m > 0.02
    r = np.sqrt(np.mean(x[act] ** 2)) if act.any() else 1.0
    return x * (target / max(r, 1e-6))

def note(freq, dur, kind='square', duty=0.5, a=0.004, d=6.0):
    t = np.arange(int(dur * SR)) / SR
    ph = (freq * t) % 1.0
    if kind == 'square': w = np.where(ph < duty, 1.0, -1.0)
    elif kind == 'tri': w = 4 * np.abs(ph - 0.5) - 1
    elif kind == 'saw': w = 2 * ph - 1
    else: w = np.sin(2 * np.pi * freq * t)
    env = np.minimum(1, t / a) * np.exp(-d * t)
    return (w * env).astype(np.float32)

def mono_put(buf, x, t, g=1.0):
    i = int(round(t * SR))
    x = x[: max(0, len(buf) - i)]
    buf[i:i + len(x)] += x * g

def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def chiptune(total=20.0, bpm=150):
    beat = 60 / bpm; step = beat / 4
    buf = np.zeros(int(total * SR), np.float32)
    chords = [(45, [69, 72, 76]), (41, [65, 69, 72]), (48, [67, 72, 76]), (43, [67, 71, 74])]
    melody = [76, 79, 81, 79, 76, 72, 74, 76]
    rng = np.random.default_rng(7)
    bar = 0
    while bar * 4 * beat < total:
        root, tones = chords[bar % 4]
        t0 = bar * 4 * beat
        for s in range(16):
            t = t0 + s * step
            mono_put(buf, note(midi(tones[s % 3] + (12 if (s // 3) % 2 else 0)), step * 0.9, 'square', 0.25, d=9), t, 0.16)
            if s % 2 == 0:
                mono_put(buf, note(midi(root), step * 1.8, 'tri', d=4), t, 0.34)
                mono_put(buf, (rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / (0.006 * SR))).astype(np.float32), t, 0.07)
            if s % 4 == 0:
                tt = np.arange(int(0.14 * SR)) / SR
                kick = np.sin(2 * np.pi * (50 * tt + 55 * (1 - np.exp(-tt * 40)) / 40 * 40)) * np.exp(-tt * 22)
                mono_put(buf, kick.astype(np.float32), t, 0.5)
            if s % 8 == 4:
                nn = int(0.11 * SR)
                sn = rng.standard_normal(nn) * np.exp(-np.arange(nn) / (0.03 * SR))
                mono_put(buf, np.diff(sn, prepend=0).astype(np.float32), t, 0.22)
        if bar >= 2:
            for i in range(8):
                mono_put(buf, note(midi(melody[(i + bar) % 8] + (12 if bar % 4 == 3 and i > 5 else 0)), beat * 0.48, 'square', 0.5, d=5), t0 + i * beat / 2, 0.13)
        bar += 1
    return np.tanh(buf * 1.4)

def anthem(total=24.0, bpm=100):
    beat = 60 / bpm
    buf = np.zeros(int(total * SR), np.float32)
    chords = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [60, 64, 69, 72]), (41, [60, 65, 69, 72])]
    bl, al = signal.butter(2, 1500 / (SR / 2))
    i = 0
    while i * 4 * beat < total:
        root, tones = chords[i % 4]
        t0 = i * 4 * beat
        dur = 4 * beat + 0.4
        t = np.arange(int(dur * SR)) / SR
        pad = np.zeros_like(t)
        for n_ in tones:
            for det in (-0.006, 0.0, 0.007):
                f = midi(n_) * (1 + det)
                pad += 2 * ((f * t) % 1.0) - 1
        pad = signal.lfilter(bl, al, pad) / 12
        env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.4)
        mono_put(buf, (pad * env).astype(np.float32), t0, 0.55 + 0.25 * min(1, t0 / total * 1.4))
        mono_put(buf, note(midi(root), 4 * beat, 'sine', d=0.6), t0, 0.35)
        arp = tones + [tones[2], tones[1]]
        for s in range(8):
            mono_put(buf, note(midi(arp[s % len(arp)] + 12), beat * 0.9, 'tri', d=4.5), t0 + s * beat / 2, 0.11 + 0.07 * min(1, t0 / total * 1.5))
        if i >= 2:
            for bt in range(4):
                tt = np.arange(int(0.2 * SR)) / SR
                mono_put(buf, (np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 16)).astype(np.float32), t0 + bt * beat, 0.3)
        i += 1
    return np.tanh(buf * 1.2)

def sting():
    buf = np.zeros(int(2.4 * SR), np.float32)
    for k, n_ in enumerate([72, 76, 79, 84, 88]):
        mono_put(buf, note(midi(n_), 2.2, 'sine', d=1.6), 0.06 * k, 0.2)
        mono_put(buf, note(midi(n_ - 12), 2.2, 'tri', d=1.2), 0.0, 0.07)
    return buf

st = lambda m: np.stack([m, m], axis=1)
voice = np.zeros((N, 2), np.float32); music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

def take(line, tk):
    return glob.glob(os.path.join(SP, 'voice/takes', f'{line}_{tk}_*.mp3'))[0]

VO = [('H1', 'b', 10.0, 0.12, None), ('R1', 'b', 14.25, 0.105, None), ('H2pl', 'a', 18.75, 0.11, None), ('R2', 'b', 22.1, 0.105, None),
      ('B1', 'a', 31.8, 0.15, 'rubberband=tempo=0.9:pitch=0.69,aecho=0.8:0.55:85:0.3'), ('H3', 'a', 34.4, 0.115, None), ('H4', 'a', 38.9, 0.11, None),
      ('N1', 'b', 45.3, 0.10, None), ('R3', 'a', 55.1, 0.105, None), ('H5', 'a', 59.0, 0.11, None), ('H6', 'b', 67.7, 0.11, 'aecho=0.8:0.3:60:0.12'),
      ('R4', 'a', 78.3, 0.105, None), ('H7', 'b', 81.2, 0.11, None), ('R5', 'a', 82.0, 0.105, None)]
for line, tk, t, lvl, af in VO:
    put(voice, rms_norm(load(take(line, tk), af), lvl), t)

m1 = load(os.path.join(SP, 'audio/music/M1.mp3')); m3 = load(os.path.join(SP, 'audio/music/M3.mp3'))
m1 = m1[: int(25.4 * SR)].copy(); m1[int(12.0 * SR):] *= 0.7
put(music, fade(rms_norm(m1, 0.075), 0.02, 0.6), 0.0)
put(music, fade(rms_norm(st(chiptune(20.2)), 0.07), 0.02, 0.5), 25.2)
put(music, fade(rms_norm(m3[: int(18.6 * SR)], 0.075), 0.3, 0.9), 45.0)
put(music, fade(rms_norm(st(anthem(22.5)), 0.07), 0.8, 0.07), 63.2)
put(sfx, st(sting()), 87.5, 0.9)

S = lambda n: os.path.join(SP, 'audio/sfx', f'sfx_{n}.mp3')
SFX = [('swoosh', 3.0, .5), ('notify', 4.15, .6), ('notify', 5.05, .6), ('glitch', 6.5, .5), ('whoosh1', 7.7, .5), ('whoosh1', 8.3, .5),
       ('whoosh2', 8.7, .55), ('whoosh1', 9.35, .5), ('bonk', 11.86, .7), ('freeze', 12.0, .7), ('sparkle', 13.15, .6), ('cricket', 20.85, .5),
       ('levelstart', 25.2, .55), ('land', 27.05, .7), ('growl', 28.0, .5), ('growl', 31.55, .5), ('holo', 36.55, .55), ('blip', 37.5, .5),
       ('pop', 41.95, .8), ('win', 43.4, .55), ('powerup', 44.0, .5), ('swoosh', 45.0, .45), ('blip', 50.2, .45), ('robotfly', 54.95, .45),
       ('cricket', 61.75, .5), ('swoosh', 63.2, .4), ('applause', 75.3, .6), ('robotfly', 78.1, .45), ('holo', 83.85, .4), ('blip', 85.0, .45),
       ('error', 87.0, .75)]
for n_, t, g in SFX:
    put(sfx, fade(rms_norm(load(S(n_)), 0.11), 0.003, 0.08), t, g / 0.6)
alarm = os.path.join(SP, 'dl/sfx_alarm_a.mp3')
if os.path.exists(alarm):
    put(sfx, rms_norm(load(alarm), 0.1), 5.12, 0.8)

# music ducking under voice, hard music stop for the final gag
env = np.abs(voice).max(axis=1)
k = int(0.12 * SR)
env = np.convolve(env, np.ones(k) / k, mode='same')
env = np.clip(env / 0.05, 0, 1)
env = ndi.maximum_filter1d(env, int(0.3 * SR))
env = np.convolve(env, np.ones(k) / k, mode='same')
music *= (1 - 0.6 * env)[:, None]
cut = int(85.72 * SR)
music[cut:] = 0
mix = voice + music + sfx
mix = np.tanh(mix * 1.6) / 1.6
mix *= 0.93 / np.abs(mix).max()
import soundfile as sf
sf.write(os.path.join(PUB, 'audio', 'mix.wav'), mix, SR, subtype='PCM_16')

assets['hasLogo'] = os.path.exists(os.path.join(PUB, 'logo', 'dnt-logo.png'))
json.dump(assets, open(os.path.join(ROOT, 'src', 'assets.json'), 'w'), indent=1)
print(json.dumps(assets))
print('mix seconds', len(mix) / SR)
