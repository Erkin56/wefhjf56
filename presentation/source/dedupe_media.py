#!/usr/bin/env python3
"""Point every slide at one copy of each identical media file, then drop the copies.

usage: python3 -I dedupe_media.py deck.pptx
"""
import hashlib
import re
import sys
import zipfile

path = sys.argv[1]
with zipfile.ZipFile(path) as z:
    items = [(i, z.read(i.filename)) for i in z.infolist()]

keep = {}      # digest -> kept media name
alias = {}     # dropped media name -> kept media name
for info, data in items:
    if info.filename.startswith('ppt/media/') and not info.filename.endswith('/'):
        digest = hashlib.sha256(data).hexdigest()
        if digest in keep:
            alias[info.filename] = keep[digest]
        else:
            keep[digest] = info.filename

def fix_rels(xml):
    def sub(m):
        target = m.group(2)
        name = 'ppt/media/' + target.split('/media/')[-1]
        if name in alias:
            target = target.replace(name.split('/')[-1], alias[name].split('/')[-1])
        return m.group(1) + target + m.group(3)
    return re.sub(r'(Target=")([^"]*?/media/[^"]+)(")', sub, xml)

with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
    for info, data in items:
        if info.filename in alias:
            continue
        if info.filename.endswith('.rels'):
            data = fix_rels(data.decode('utf-8')).encode('utf-8')
        if info.filename == '[Content_Types].xml':
            text = data.decode('utf-8')
            for name in alias:
                text = re.sub(r'<Override PartName="/%s"[^>]*/>' % re.escape(name), '', text)
            data = text.encode('utf-8')
        z.writestr(info, data, compress_type=zipfile.ZIP_STORED if info.filename.endswith(('.jpg', '.jpeg', '.png')) else zipfile.ZIP_DEFLATED)
print(f'removed {len(alias)} duplicate media files')
