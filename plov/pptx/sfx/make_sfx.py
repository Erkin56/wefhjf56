#!/usr/bin/env python3
"""Синтез звуков для PowerPoint-версии — те же рецепты, что в core.js (WebAudio).
Запуск: python3 make_sfx.py <папка> → pop.wav, stamp.wav, ... (моно, 22 050 Гц, 16 бит)."""
import math
import sys
import wave
from pathlib import Path

import numpy as np

SR = 22050
RNG = np.random.default_rng(7)


def buf(total):
    return np.zeros(int(SR * total) + 1)


def osc(kind, freq):
    phase = np.cumsum(2 * np.pi * freq / SR)
    if kind == 'sine':
        return np.sin(phase)
    if kind == 'square':
        return np.sign(np.sin(phase))
    if kind == 'triangle':
        return 2 / np.pi * np.arcsin(np.sin(phase))
    if kind == 'sawtooth':
        return 2 * ((phase / (2 * np.pi)) % 1) - 1
    raise ValueError(kind)


def env(n, vol, attack=0.005):
    t = np.arange(n) / SR
    a = max(1, int(attack * SR))
    e = np.empty(n)
    e[:a] = np.geomspace(1e-4, vol, a)
    if n > a:
        e[a:] = vol * np.exp(np.log(1e-4 / vol) * (t[a:] - t[a]) / max(1e-6, t[-1] - t[a]))
    return e


def tone(out, kind='sine', f0=440, f1=None, t=0, dur=.2, vol=.4, curve='exp'):
    n = int(dur * SR)
    if f1:
        k = np.linspace(0, 1, n)
        freq = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
    else:
        freq = np.full(n, f0)
    s = osc(kind, freq) * env(n, vol)
    i = int(t * SR)
    out[i:i + n] += s[: len(out) - i]


def biquad(x, kind, f, q):
    w0 = 2 * math.pi * f / SR
    alpha = math.sin(w0) / (2 * q)
    c = math.cos(w0)
    if kind == 'lowpass':
        b0, b1, b2 = (1 - c) / 2, 1 - c, (1 - c) / 2
    elif kind == 'highpass':
        b0, b1, b2 = (1 + c) / 2, -(1 + c), (1 + c) / 2
    else:  # bandpass
        b0, b1, b2 = alpha, 0, -alpha
    a0, a1, a2 = 1 + alpha, -2 * c, 1 - alpha
    b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xi, y1, yi
        y[i] = yi
    return y


def noise(out, t=0, dur=.2, vol=.3, freq=1200, q=.8, kind='lowpass', f1=None):
    n = int(dur * SR)
    x = RNG.uniform(-1, 1, n)
    if f1:  # скользящий фильтр: по кускам
        y = np.zeros(n)
        parts = 12
        for p in range(parts):
            a, b = p * n // parts, (p + 1) * n // parts
            f = freq * (f1 / freq) ** (p / (parts - 1))
            y[a:b] = biquad(x[a:b], kind, f, q)
        x = y
    else:
        x = biquad(x, kind, freq, q)
    e = vol * np.exp(np.log(1e-4 / vol) * np.arange(n) / n)
    i = int(t * SR)
    out[i:i + n] += (x * e)[: len(out) - i]


def make(name, total, fn):
    out = buf(total)
    fn(out)
    peak = np.max(np.abs(out)) or 1
    out = out / max(peak, 1) * .9 if peak > .9 else out
    data = (np.clip(out, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(str(DIR / f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


DIR = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
DIR.mkdir(parents=True, exist_ok=True)

make('click', .06, lambda o: tone(o, 'square', 1800, dur=.03, vol=.08))
make('tick', .05, lambda o: tone(o, 'sine', 2200, dur=.025, vol=.12))
make('pop', .16, lambda o: tone(o, 'sine', 420, 980, dur=.12, vol=.45))
make('plop', .24, lambda o: (tone(o, 'sine', 320, 110, dur=.18, vol=.55), noise(o, dur=.08, vol=.15, freq=900)))
make('boing', .5, lambda o: (tone(o, 'sine', 180, 520, dur=.09, vol=.45), tone(o, 'triangle', 520, 240, t=.09, dur=.35, vol=.4, curve='lin')))
make('stamp', .3, lambda o: (noise(o, dur=.16, vol=.6, freq=500), tone(o, 'sine', 110, 45, dur=.22, vol=.8)))
make('ding', 1.25, lambda o: (tone(o, 'sine', 1318.5, dur=1.2, vol=.3), tone(o, 'sine', 1975.5, dur=.9, vol=.14), tone(o, 'sine', 2637, dur=.5, vol=.07)))
make('whoosh', .5, lambda o: noise(o, dur=.45, vol=.3, freq=300, f1=3000, kind='bandpass', q=1.2))
make('swoosh', .35, lambda o: noise(o, dur=.3, vol=.25, freq=2500, f1=400, kind='bandpass', q=1.5))
make('tada', 1.3, lambda o: [tone(o, 'triangle', f, t=i * .09, dur=.9 if i == 3 else .25, vol=.32) for i, f in enumerate([523.25, 659.25, 783.99, 1046.5])])
make('fail', 2.0, lambda o: [tone(o, 'sawtooth', f, f * .94 if i == 3 else None, t=i * .32, dur=.9 if i == 3 else .3, vol=.16, curve='lin') for i, f in enumerate([392, 370, 349.2, 329.6])])


def alarm(o):
    for i in range(4):
        tone(o, 'square', 880, t=i * .36, dur=.17, vol=.1)
        tone(o, 'square', 660, t=i * .36 + .18, dur=.17, vol=.1)


make('alarm', 1.5, alarm)


def drumroll(o, dur=1.4):
    t = 0
    while t < dur:
        noise(o, t=t, dur=.05, vol=.1 + .2 * (t / dur), freq=1800)
        t += .045
    noise(o, t=dur, dur=.9, vol=.45, freq=6000, kind='highpass', q=.5)
    tone(o, 'sine', 90, 40, t=dur, dur=.4, vol=.7)


make('drumroll', 2.4, drumroll)
make('coin', .42, lambda o: (tone(o, 'square', 988, dur=.08, vol=.14), tone(o, 'square', 1319, t=.08, dur=.3, vol=.14)))
make('gulp', .3, lambda o: (tone(o, 'sine', 220, 90, dur=.12, vol=.5), tone(o, 'sine', 180, 70, t=.14, dur=.12, vol=.4)))
make('sparkle', .45, lambda o: [tone(o, 'sine', f, t=i * .05, dur=.25, vol=.1) for i, f in enumerate([1568, 2093, 2637, 3136])])
print('sfx →', DIR, sorted(p.name for p in DIR.glob('*.wav')))
