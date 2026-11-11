#!/usr/bin/env python3
"""Per-frame voice loudness envelopes (30 fps) used to drive robot lights and speech motion.

Usage: python3 scripts/voice_env.py <scratchpad>
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np

SP = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, SR, N = 30, 48000, 2700
VO = [('H1', 'b', 10.0, None), ('R1', 'b', 14.25, None), ('H2pl', 'a', 18.75, None), ('R2', 'b', 22.1, None),
      ('B1', 'a', 31.8, 'rubberband=tempo=0.9:pitch=0.69'), ('H3', 'a', 34.4, None), ('H4', 'a', 38.9, None),
      ('N1', 'b', 45.3, None), ('R3', 'a', 55.1, None), ('H5', 'a', 59.0, None), ('H6', 'b', 67.7, None),
      ('R4', 'a', 78.3, None), ('H7', 'b', 81.2, None), ('R5', 'a', 82.0, None)]
WHO = {'H': 'hero', 'R': 'robot', 'B': 'boss', 'N': 'narr'}
out = {k: np.zeros(N, np.float32) for k in WHO.values()}
for line, tk, t0, af in VO:
    path = glob.glob(os.path.join(SP, 'voice/takes', f'{line}_{tk}_*.mp3'))[0]
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    hop = SR // FPS
    n = len(x) // hop
    rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
    rms = rms / (np.percentile(rms, 97) + 1e-9)
    i0 = int(round(t0 * FPS))
    seg = out[WHO[line[0]]][i0:i0 + n]
    seg[:] = np.maximum(seg, np.clip(rms[:len(seg)], 0, 1))
for k, v in out.items():
    s = v.copy()
    for i in range(1, N):          # fast attack, soft release
        s[i] = max(v[i], s[i - 1] * 0.62)
    out[k] = [round(float(a), 2) for a in s]
json.dump(out, open(os.path.join(ROOT, 'src', 'voice.json'), 'w'), separators=(',', ':'))
print({k: round(float(np.mean(v)), 3) for k, v in out.items()})
