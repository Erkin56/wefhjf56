#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check.py: автоматическая проверка готовых презентаций (раздел 8 задания).

    python check.py                      # все файлы presentations/*.pptx
    python check.py presentations/Урок_01_Катюша.pptx

Проверяет:
  * у каждого слайда есть заметки докладчика;
  * нет текста мельче 16 pt (исключение: шапка над заголовком, 14 pt по разделу 5);
  * нет длинного и короткого тире (U+2014, U+2013) на слайдах и в заметках
    (в уроке 5 тире разрешено только на слайдах о пунктуации прямой речи);
  * заглушки на месте: имя группы = подпись «[ВИДЕО 1: …]», «[ВИДЕО 2: …]», «[АУДИО: …]», «[ТЕКСТ ПЕСНИ: …]», «[КАРТИНКА: …]»;
  * ответы есть только на слайдах-ответах (группа «Ответы»), на слайдах-заданиях их нет;
    в режиме АНИМАЦИЯ группа «Ответы» появляется по щелчку (<p:timing>);
  * в квизе у каждого вопроса ровно один верный вариант, верные буквы не повторяются подряд.
"""
import glob
import json
import os
import re
import sys

from pptx import Presentation
from pptx.oxml.ns import qn


HERE = os.path.dirname(os.path.abspath(__file__))
SLOT_RE = re.compile(r"^\[(ВИДЕО 1|ВИДЕО 2|АУДИО|ТЕКСТ ПЕСНИ|КАРТИНКА): .+\]$")
DASHES = chr(0x2013) + chr(0x2014)   # короткое и длинное тире


def iter_shapes(shapes):
    for sh in shapes:
        yield sh
        if sh.shape_type == 6:  # группа
            yield from iter_shapes(sh.shapes)


def shape_texts(sh):
    """(текст, размер в pt или None, имя фигуры) для каждого фрагмента текста."""
    out = []
    frames = []
    if sh.has_text_frame:
        frames.append(sh.text_frame)
    if getattr(sh, "has_table", False) and sh.has_table:
        for row in sh.table.rows:
            for cell in row.cells:
                frames.append(cell.text_frame)
    for tf in frames:
        for p in tf.paragraphs:
            for r in p.runs:
                if r.text.strip():
                    out.append((r.text, r.font.size.pt if r.font.size else None, sh.name))
    return out


def check_file(path):
    prs = Presentation(path)
    m = re.search(r"Урок_(\d+)", os.path.basename(path))
    n = int(m.group(1)) if m else 0
    data = None
    jp = os.path.join(HERE, "content", f"lesson{n:02d}.json")
    if os.path.isfile(jp):
        with open(jp, encoding="utf-8") as f:
            data = json.load(f)
    errors, slots = [], []
    min_size = 99.0
    for i, slide in enumerate(prs.slides, 1):
        kind = slide._element.cSld.get("name", "")
        notes = slide.notes_slide.notes_text_frame.text if slide.has_notes_slide else ""
        if not notes.strip():
            errors.append(f"слайд {i}: нет заметок")
        allow_dash = n == 5 and kind.startswith("grammar") or n == 5 and kind.startswith("practice")
        if any(c in notes for c in DASHES):
            errors.append(f"слайд {i}: тире в заметках")
        names = []
        for sh in iter_shapes(slide.shapes):
            names.append(sh.name)
            if sh.shape_type == 6 and SLOT_RE.match(sh.name or ""):
                cap = [t for x in sh.shapes for t, _, _ in shape_texts(x)]
                if sh.name not in " ".join(cap):
                    errors.append(f"слайд {i}: подпись заглушки не совпадает с именем «{sh.name}»")
                slots.append((i, sh.name))
            for text, size, nm in shape_texts(sh):
                if any(c in text for c in DASHES) and not allow_dash:
                    errors.append(f"слайд {i}: тире в тексте «{text[:40]}»")
                if size is None:
                    errors.append(f"слайд {i}: у текста «{text[:30]}» не задан размер")
                    continue
                if nm == "Шапка":
                    if size < 14:
                        errors.append(f"слайд {i}: шапка мельче 14 pt")
                    continue
                min_size = min(min_size, size)
                if size < 16:
                    errors.append(f"слайд {i}: {size} pt < 16 pt: «{text[:40]}» ({nm})")
        has_ans = "Ответы" in names
        if kind.endswith("-task") and has_ans:
            errors.append(f"слайд {i}: на слайде-задании видны ответы")
        if kind.endswith("-answer") and not has_ans:
            errors.append(f"слайд {i}: на слайде-ответе нет ответов")
        if kind.endswith("-anim"):
            timing = slide._element.find(qn("p:timing"))
            grp = [sh for sh in slide.shapes if sh.name == "Ответы"]
            if timing is None or not grp or f'spid="{grp[0].shape_id}"' not in str(
                    __import__("lxml.etree", fromlist=["tostring"]).tostring(timing)):
                errors.append(f"слайд {i}: ответы не скрыты анимацией")
    if data:
        letters = [q["c"] for q in data["quiz"]]
        for k, q in enumerate(data["quiz"], 1):
            if not (0 <= q["c"] < len(q["o"])) or len(set(q["o"])) != len(q["o"]):
                errors.append(f"квиз {k}: неверный индекс ответа или повтор вариантов")
        for a, b in zip(letters, letters[1:]):
            if a == b:
                errors.append(f"квиз: верная буква повторяется подряд ({'АБВ'[a]})")
        for slot in [m_["slot"] for m_ in data.get("media", [])]:
            if not any(nm.startswith(f"[{slot}:") for _, nm in slots):
                errors.append(f"нет заглушки {slot}")
    return len(prs.slides), slots, errors, min_size


def main():
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, "presentations", "*.pptx")))
    bad = 0
    for f in files:
        n, slots, errors, min_size = check_file(f)
        print(f"{os.path.basename(f)}: {n} слайдов, минимальный кегль {min_size:g} pt (шапка 14 pt)")
        for sl, nm in slots:
            print(f"   слайд {sl}: {nm}")
        for e in errors:
            print("   ОШИБКА:", e)
        bad += len(errors)
    print("Итог:", "ошибок нет" if not bad else f"ошибок: {bad}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
