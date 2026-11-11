#!/usr/bin/env bash
# Final delivery encode: 2700 frames (90.000 s), H.264 High, yuv420p, BT.709, AAC 48 kHz stereo, faststart.
# The sound comes straight from the lossless mix, so it is compressed only once.
# Usage: bash scripts/export.sh [master.mp4] [output.mp4]     (CRF=20 by default)
set -euo pipefail
cd "$(dirname "$0")/.."
IN="${1:-out/master.mp4}"
OUT="${2:-release/russkiy-yazyk-missiya-nevypolnima.mp4}"
CRF="${CRF:-20}"
mkdir -p "$(dirname "$OUT")"
ffmpeg -v error -y -i "$IN" -i public/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -frames:v 2700 -r 30 -c:v libx264 -preset slow -crf "$CRF" -profile:v high -level 4.2 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -af "volume=-1dB,atrim=0:89.98,afade=t=out:st=89.95:d=0.03" -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -movflags +faststart -metadata title="Русский язык: миссия невыполнима?" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,duration,sample_rate,channels -of default=nw=1 "$OUT"
