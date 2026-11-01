#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py: генератор презентаций для учителя к урокам учебника
Э. Б. Маманазарова «Учебник русского языка через песни Великой Отечественной войны» (B1).

Одна и та же программа строит все уроки из content/lessonNN.json, поэтому все
презентации выглядят одинаково.

Запуск:
    python build.py 1                     # урок 1 -> presentations/Урок_01_Катюша.pptx
    python build.py 1 2 3                 # несколько уроков
    python build.py all                   # все уроки, для которых есть JSON
    python build.py 1 --mode АНИМАЦИЯ     # ответы появляются по щелчку на том же слайде
    python build.py 1 --no-autofit        # служебный режим для проверки переполнения

Нужны: Python 3.9+, python-pptx (pip install python-pptx), Pillow (ставится вместе с python-pptx).
Размер текста подбирается по реальным метрикам шрифтов Georgia, Arial Narrow, Segoe Print:
на Windows они берутся из C:\\Windows\\Fonts, на других системах из ./fonts или через fc-match.
"""
import argparse
import glob
import json
import math
import os
import re
import subprocess
import sys

from lxml import etree
from PIL import ImageFont
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

# ---------------------------------------------------------------- настройки
ANSWER_MODE = "ОТДЕЛЬНЫЙ_СЛАЙД"          # или "АНИМАЦИЯ"
LESSON_MINUTES = 90
HERE = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(HERE, "content")
OUT_DIR = os.path.join(HERE, "presentations")

# ---------------------------------------------------------------- палитра
PAPER = "F2EADB"      # фон бумага
PAPER2 = "E8DDC7"     # второй фон (квиз)
CARD = "FBF6EC"       # карточки
DARK = "2A2620"       # тёмный фон и заголовки
INK = "4A4237"        # основной текст
INK2 = "6B6152"       # второстепенный текст
RED = "9E3424"        # красный акцент
GREEN = "3D5F2F"      # «ВЕРНО»
LINE = "CDBEA2"       # линии
ON_DARK = "F2EADB"    # текст на тёмном
ACC_DARK = "E8957C"   # акцент на тёмном
SLOT = "B3A487"       # пунктир заглушек (серо-бежевый, чуть темнее линий, чтобы рамка была видна)

F_HEAD = "Arial Narrow"   # заголовки: полужирный, ПРОПИСНЫЕ
F_BODY = "Georgia"        # основной текст
F_HAND = "Segoe Print"    # «красная ручка» и ключевое слово

# ---------------------------------------------------------------- геометрия (дюймы, 16:9)
W, H = 13.333, 7.5
M = 0.6                    # поля
CW = W - 2 * M             # ширина рабочей области
KICK_Y = 0.40              # шапка
TITLE_Y = 0.72             # заголовок
CT = 1.62                  # верх контента без подзаголовка
CT_SUB = 2.08              # верх контента с подзаголовком
CB = 6.78                  # низ контента
FOOT_LINE = 6.92
FOOT_Y = 6.97

MIN_PT = 16                # ничего мельче 16 pt (кроме шапки 14 pt по разделу 5)
KICK_PT = 14

STAGES = [  # этап, минуты, что делаем (шаблон)
    ("Разминка", 7, "Ключевое слово урока, вопросы «Перед чтением»"),
    ("Слушаем песню", 10, "Два прослушивания, текст песни, слова из песни"),
    ("История и контекст", 10, "Как появилась песня, время песни"),
    ("Словарь и образы", 15, "Слова урока, образы песни, наглядная опора"),
    ("Грамматика", 20, "{g1}; {g2}; тренировка"),
    ("Проверка и игры", 13, "Верно или неверно, пары, квиз из 7 вопросов"),
    ("Говорим и поём", 12, "Поём вместе, монолог, дискуссия, письмо"),
    ("Итоги", 3, "Домашнее задание, рефлексия «3-2-1»"),
]
ST_A, ST_B, ST_C, ST_D = "ВХОД В УРОК", "ПЕСНЯ", "ИСТОРИЯ И КОНТЕКСТ", "СЛОВАРЬ И ОБРАЗЫ"
ST_E, ST_F, ST_G, ST_H = "ГРАММАТИКА", "ПРОВЕРКА И ИГРЫ", "ГОВОРИМ, ПОЁМ, ПИШЕМ", "ИТОГИ"

LETTERS = "абвгдежзик"
ABV = "АБВ"
PHRASES = ["По-моему…", "Мне кажется, что…", "С одной стороны… с другой стороны…", "Я думаю так, потому что…", "Например…"]
NO_STYLE_TABLE = "{2D5ABB26-0587-4C30-8999-92F81FD0307C}"


def rgb(h):
    return RGBColor.from_string(h)


# ================================================================ измерение текста
FONT_FILES = {
    (F_BODY, False, False): ["georgia.ttf", "Georgia.ttf"],
    (F_BODY, True, False): ["georgiab.ttf", "Georgia Bold.ttf"],
    (F_BODY, False, True): ["georgiai.ttf", "Georgia Italic.ttf"],
    (F_BODY, True, True): ["georgiaz.ttf", "Georgia Bold Italic.ttf"],
    (F_HEAD, False, False): ["ARIALN.TTF", "arialn.ttf", "Arial Narrow.ttf"],
    (F_HEAD, True, False): ["ARIALNB.TTF", "arialnb.ttf", "Arial Narrow Bold.ttf"],
    (F_HAND, False, False): ["segoepr.ttf", "SEGOEPR.TTF"],
    (F_HAND, True, False): ["segoeprb.ttf", "SEGOEPRB.TTF"],
}
FONT_DIRS = [
    os.path.join(HERE, "fonts"),
    os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts"),
    os.path.expanduser(r"~\AppData\Local\Microsoft\Windows\Fonts"),
    "/Library/Fonts", os.path.expanduser("~/Library/Fonts"),
]
# если шрифт не найден: средняя ширина знака и высота строки (в долях кегля), с запасом
FALLBACK = {F_BODY: (0.56, 1.19), F_HEAD: (0.47, 1.17), F_HAND: (0.68, 1.75)}


class Measure:
    """Ширина и высота текста по метрикам шрифта (дюймы)."""

    def __init__(self):
        self.fonts = {}
        self.found = {}

    def _find(self, family, bold, italic):
        key = (family, bold, italic)
        names = FONT_FILES.get(key) or FONT_FILES.get((family, bold, False)) or []
        for d in FONT_DIRS:
            for n in names:
                p = os.path.join(d, n)
                if os.path.isfile(p):
                    return p
        try:  # Linux / macOS с fontconfig
            pat = family + (":bold" if bold else "") + (":italic" if italic else "")
            out = subprocess.run(["fc-match", "-f", "%{family}|%{file}", pat],
                                 capture_output=True, text=True, timeout=10).stdout
            fam, path = out.split("|", 1)
            if family.lower() in fam.lower() and os.path.isfile(path):
                return path
        except Exception:
            pass
        return None

    def font(self, family, bold, italic):
        key = (family, bold, italic)
        if key not in self.fonts:
            path = self._find(family, bold, italic)
            self.found[key] = path
            self.fonts[key] = ImageFont.truetype(path, 1000, layout_engine=ImageFont.Layout.BASIC) if path else None
        return self.fonts[key]

    def width(self, text, family, size, bold=False, italic=False, spc=0):
        f = self.font(family, bold, italic)
        if f is None:
            em = FALLBACK[family][0] * len(text)
        else:
            em = f.getlength(text) / 1000.0
        return (em * size + spc / 100.0 * len(text)) / 72.0 * 1.02

    def line_h(self, family, size, bold=False, italic=False):
        f = self.font(family, bold, italic)
        k = FALLBACK[family][1] if f is None else max(f.font.height, f.font.ascent + f.font.descent) / 1000.0 * 1.06
        return k * size / 72.0


MEAS = Measure()


class R:
    """Фрагмент текста (run)."""

    def __init__(self, text, font=F_BODY, size=20, bold=False, italic=False, color=INK, spc=0):
        self.text, self.font, self.size, self.bold, self.italic = text, font, size, bold, italic
        self.color, self.spc = color, spc


class P:
    """Абзац."""

    def __init__(self, runs, align="l", line=1.0, before=0, after=0):
        self.runs = runs if isinstance(runs, list) else [runs]
        self.align, self.line, self.before, self.after = align, line, before, after


def T(text, font=F_BODY, size=20, bold=False, italic=False, color=INK, spc=0, align="l", line=1.0, before=0, after=0):
    return P([R(text, font, size, bold, italic, color, spc)], align, line, before, after)


def para_height(p, sizes, width):
    """Высота абзаца и признак «слово не помещается в строку»."""
    segs = []  # (char, run, size)
    for r, sz in zip(p.runs, sizes):
        for ch in r.text:
            segs.append((ch, r, sz))
    words, cur = [], []
    for ch, r, sz in segs:
        if ch == " ":
            if cur:
                words.append((cur, (r, sz)))
                cur = []
        else:
            cur.append((ch, r, sz))
    if cur:
        words.append((cur, None))

    def wlen(chars):
        tot, buf, key = 0.0, "", None
        for ch, r, sz in chars:
            k = (r.font, sz, r.bold, r.italic, r.spc)
            if key is not None and k != key:
                tot += MEAS.width(buf, key[0], key[1], key[2], key[3], key[4])
                buf = ""
            key = k
            buf += ch
        if buf:
            tot += MEAS.width(buf, key[0], key[1], key[2], key[3], key[4])
        return tot

    lines, cur_w, too_long = 1, 0.0, False
    space_w = 0.0
    for chars, after_space in words:
        w = wlen(chars)
        if w > width + 1e-6:
            too_long = True
        if cur_w == 0:
            cur_w = w
        elif cur_w + space_w + w <= width:
            cur_w += space_w + w
        else:
            lines += 1
            cur_w = w
        if after_space:
            r, sz = after_space
            space_w = MEAS.width(" ", r.font, sz, r.bold, r.italic, r.spc)
    lh = max(MEAS.line_h(r.font, sz, r.bold, r.italic) for r, sz in zip(p.runs, sizes)) * p.line
    return lines * lh + (p.before + p.after) / 72.0, too_long, lines


def block_height(paras, sizes, width):
    tot, bad = 0.0, False
    for p, sz in zip(paras, sizes):
        h, tl, _ = para_height(p, sz, width)
        tot += h
        bad = bad or tl
    return tot, bad


def sizes_for_k(paras, k, min_pt=MIN_PT):
    """Размеры после k шагов уменьшения (самый крупный кегль минус k pt, остальные пропорционально)."""
    base = [[r.size for r in p.runs] for p in paras]
    top = max(max(b) for b in base)
    f = max(0.0, (top - k) / top)
    return [[max(min(min_pt, s0), round(s0 * f * 2) / 2) for s0 in b] for b in base]


def fit_steps(paras, width, height, min_pt=MIN_PT):
    """Сколько шагов по 1 pt нужно, чтобы текст поместился: (k, поместился ли, высота)."""
    base = [[r.size for r in p.runs] for p in paras]
    top = max(max(b) for b in base)
    h = 0.0
    for k in range(0, int(top) + 1):
        sizes = sizes_for_k(paras, k, min_pt)
        h, bad = block_height(paras, sizes, width)
        if h <= height and not bad:
            return k, True, h
        if all(s1 <= min(min_pt, s0) for b1, b0 in zip(sizes, base) for s1, s0 in zip(b1, b0)):
            return k, False, h
    return k, False, h


def fit_sizes(paras, width, height, min_pt=MIN_PT):
    """Подбирает кегль: уменьшает все размеры на 1 pt за шаг, пока текст не поместится."""
    k, ok, h = fit_steps(paras, width, height, min_pt)
    return sizes_for_k(paras, k, min_pt), ok, h


# ================================================================ низкоуровневые фигуры
def _strip_style(shape):
    st = shape._element.find(qn("p:style"))
    if st is not None:
        shape._element.remove(st)


def shape_rect(cont, x, y, w, h, fill=None, line=None, lw=1.0, radius=0.0, dash=False, name=None, kind=None):
    if kind is None:
        kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius > 0 else MSO_SHAPE.RECTANGLE
    sh = cont.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    _strip_style(sh)
    if kind == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = min(0.5, radius / max(0.01, min(w, h)))
    if fill:
        sh.fill.solid()
        sh.fill.fore_color.rgb = rgb(fill)
    else:
        sh.fill.background()
    if line:
        sh.line.color.rgb = rgb(line)
        sh.line.width = Pt(lw)
        if dash:
            sh.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    else:
        sh.line.fill.background()
    if name:
        sh.name = name
    return sh


def shape_line(cont, x1, y1, x2, y2, color=LINE, lw=1.0, arrow=False, name=None, dash=False):
    c = cont.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    _strip_style(c)
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(lw)
    if dash:
        c.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    if arrow:
        ln = c.line._get_or_add_ln()
        te = etree.SubElement(ln, qn("a:tailEnd"))
        te.set("type", "triangle")
        te.set("w", "med")
        te.set("len", "med")
    if name:
        c.name = name
    return c


def star(cont, x, y, size, color, name="Звёздочка"):
    s = shape_rect(cont, x, y, size, size, fill=color, kind=MSO_SHAPE.STAR_5_POINT, name=name)
    return s


def add_text(cont, x, y, w, h, paras, anchor="t", inset=(0.08, 0.04, 0.08, 0.04), fit=True,
             min_pt=MIN_PT, name=None, autofit=True, warn=None, wrap=True, sizes=None):
    """Текстовое поле с подбором кегля. inset = (слева, сверху, справа, снизу)."""
    l, t, r, b = inset
    aw, ah = (w - l - r) * 0.98, h - t - b
    if sizes is not None:
        used, bad = block_height(paras, sizes, aw)
        if (used > ah + 1e-6 or bad) and warn is not None:
            snippet = "".join(rr.text for rr in paras[0].runs)[:60]
            warn(f"не помещается ({used:.2f} из {ah:.2f} дюйма): «{snippet}»")
    elif fit:
        sizes, ok, used = fit_sizes(paras, aw, ah, min_pt)
        if not ok and warn is not None:
            snippet = "".join(rr.text for rr in paras[0].runs)[:60]
            warn(f"не помещается ({used:.2f} из {ah:.2f} дюйма): «{snippet}»")
    else:
        sizes = [[r_.size for r_ in p.runs] for p in paras]
    tb = cont.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        tb.name = name
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.margin_left, tf.margin_top, tf.margin_right, tf.margin_bottom = Inches(l), Inches(t), Inches(r), Inches(b)
    tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE, "b": MSO_ANCHOR.BOTTOM}[anchor]
    if autofit and BUILD_OPTS.get("autofit", True):
        tf.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE   # «Сжимать текст при переполнении»
    else:
        tf.auto_size = MSO_AUTO_SIZE.NONE
    for i, (p, sz) in enumerate(zip(paras, sizes)):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = {"l": PP_ALIGN.LEFT, "c": PP_ALIGN.CENTER, "r": PP_ALIGN.RIGHT}[p.align]
        para.line_spacing = p.line
        if p.before:
            para.space_before = Pt(p.before)
        if p.after:
            para.space_after = Pt(p.after)
        for rr, s in zip(p.runs, sz):
            run = para.add_run()
            run.text = rr.text
            f = run.font
            f.name = rr.font
            f.size = Pt(s)
            f.bold = rr.bold
            f.italic = rr.italic
            f.color.rgb = rgb(rr.color)
            rpr = run._r.get_or_add_rPr()
            rpr.set("lang", "ru-RU")
            if rr.spc:
                rpr.set("spc", str(int(rr.spc)))
    return tb


def measure(paras, w, inset=(0.08, 0.04, 0.08, 0.04)):
    l, t, r, b = inset
    sizes = [[r_.size for r_ in p.runs] for p in paras]
    h, _ = block_height(paras, sizes, (w - l - r) * 0.98)
    return h + t + b


BUILD_OPTS = {"autofit": True}


# ================================================================ анимация «Появление» по щелчку
def add_click_appear(slide, spids):
    """Добавляет <p:timing>: по одному щелчку появляются все фигуры spids (эффект «Появление»)."""
    if not spids:
        return
    P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
    ids = iter(range(3, 1000))
    inner = []
    for k, spid in enumerate(spids):
        a, b = next(ids), next(ids)
        node = "clickEffect" if k == 0 else "withEffect"
        inner.append(
            f'<p:par><p:cTn id="{a}" presetID="1" presetClass="entr" presetSubtype="0" fill="hold" nodeType="{node}">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:set><p:cBhvr>'
            f'<p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName>'
            f'</p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set></p:childTnLst></p:cTn></p:par>')
    o1, o2 = next(ids), next(ids)
    xml = (
        f'<p:timing xmlns:p="{P_NS}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">'
        f'<p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq">'
        f'<p:childTnLst><p:par><p:cTn id="{o1}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
        f'<p:childTnLst><p:par><p:cTn id="{o2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
        f'<p:childTnLst>{"".join(inner)}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
        f'</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond>'
        f'</p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond>'
        f'</p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
    el = etree.fromstring(xml)
    sld = slide._element
    old = sld.find(qn("p:timing"))
    if old is not None:
        sld.remove(old)
    clr = sld.find(qn("p:clrMapOvr"))
    if clr is not None:
        clr.addnext(el)
    else:
        sld.append(el)


# ================================================================ вспомогательное для текста
def ru_minutes(x):
    if abs(x - round(x)) < 1e-9:
        n = int(round(x))
        if n % 10 == 1 and n % 100 != 11:
            return f"{n} минута"
        if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14):
            return f"{n} минуты"
        return f"{n} минут"
    if x < 1:
        return f"{int(round(x * 60))} секунд"
    return f"{str(x).replace('.', ',')} минуты"


def strip_listen_prefix(s):
    s = re.sub(r"^(Первое|Второе|Третье) прослушивание:\s*", "", s)
    return s[:1].upper() + s[1:]


def fill_blanks(q, a):
    """«Она (петь) песню» + «пела» -> «Она пела песню». Иначе «q → a»."""
    groups = re.findall(r"\([^)]*\)", q)
    parts = [x.strip() for x in re.split(r",\s*", a)] if groups else []
    if groups and len(parts) == len(groups):
        out = q
        for g, v in zip(groups, parts):
            out = out.replace(g, v, 1)
        return out
    return f"{q} → {a}"


def end(t):
    """Точка в конце, если её нет."""
    t = t.rstrip()
    return t if t[-1:] in ".!?…»" else t + "."


def quote(t):
    """Текст задания в кавычках «…» без конечной точки внутри."""
    t = t.rstrip()
    if t.endswith(".") and not t.endswith("..."):
        t = t[:-1]
    return f"«{t}»"


def split_title(t, limit=44):
    """Длинную формулировку задания делим на заголовок и подзаголовок по первому двоеточию."""
    if len(t) > limit and ": " in t:
        a, b = t.split(": ", 1)
        return a, b
    return t, None


# ================================================================ сборка урока
class Lesson:
    def __init__(self, data, mode):
        self.d = data
        self.mode = mode
        self.n = data["n"]
        self.song = data["song"]
        self.prs = Presentation()
        self.prs.slide_width, self.prs.slide_height = Inches(W), Inches(H)
        self.layout = self.prs.slide_layouts[6]
        self.warnings = []
        self.slide_no = 0
        self.index = {}       # тип слайда -> номер
        self.slots = []       # (номер слайда, подпись заглушки)
        self._set_theme_fonts()
        has_wf = bool(data.get("wordform"))
        has_v2 = bool(self.media("ВИДЕО 2"))
        nv = max(1, math.ceil(len(data["vocab"]) / 6))
        self.t = {
            "cover": 0.5, "plan": 0.5, "keyword": 1, "warmup": 5,
            "listen": 4, "lyrics": 4, "words_t": 1.5, "words_a": 0.5,
            "history": 3 if has_v2 else 5, "video2": 4, "context": 3 if has_v2 else 5,
            "vocab": 9 / nv, "realia": 3, "visual": 3,
            "grammar": 4 if has_wf else 5, "pr_t": 3 if has_wf else 4, "pr_a": 1, "wf_t": 3, "wf_a": 1,
            "tf_t": 2, "tf_a": 1, "match_t": 2, "match_a": 1, "quiz_t": 40 / 60, "quiz_a": 20 / 60,
            "sing": 4, "speaking": 4, "discussion": 3, "writing": 1, "homework": 1, "reflection": 2,
        }

    # ---------------- данные
    def media(self, slot):
        for m in self.d.get("media", []):
            if m["slot"] == slot:
                return m
        return None

    def slot_caption(self, slot):
        m = self.media(slot)
        if not m:
            return None
        label = m.get("label") or ", ".join(x for x in (m.get("what"), m.get("who")) if x)
        return f"[{slot}: {label}]"

    def pg(self, *keys):
        pages = self.d["pages"]
        for k in keys + ("lesson",):
            if pages.get(k):
                return pages[k]
        return ""

    def first_page(self):
        return self.pg("lesson").split("-")[0]

    def tip(self, key):
        return self.d.get("tips", {}).get(key, "")

    # ---------------- служебное
    def _set_theme_fonts(self):
        master = self.prs.slide_master
        theme_part = master.part.part_related_by(RT.THEME)
        root = etree.fromstring(theme_part.blob)
        ns = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
        for tag, face in (("major", F_HEAD), ("minor", F_BODY)):
            el = root.find(f".//a:fontScheme/a:{tag}Font/a:latin", ns)
            if el is not None:
                el.set("typeface", face)
        theme_part._blob = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)

    def warn(self, msg):
        self.warnings.append(f"слайд {self.slide_no}: {msg}")

    def new_slide(self, kind, bg=PAPER):
        s = self.prs.slides.add_slide(self.layout)
        self.slide_no += 1
        s._element.cSld.set("name", kind)
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = rgb(bg)
        self.index.setdefault(kind, self.slide_no)
        return s

    def text(self, cont, x, y, w, h, paras, **kw):
        kw.setdefault("warn", self.warn)
        return add_text(cont, x, y, w, h, paras, **kw)

    def notes(self, s, text):
        text = re.sub(r"[ \t]+\n", "\n", text.strip())
        s.notes_slide.notes_text_frame.text = text

    def header(self, s, kicker, title=None, sub=None, dark=False, title_pt=38):
        kc = ACC_DARK if dark else RED
        star(s, M, KICK_Y + 0.07, 0.2, kc)
        self.text(s, M + 0.32, KICK_Y - 0.03, 8.6, 0.4, [T(kicker, F_HEAD, KICK_PT, bold=True, color=kc, spc=300)],
                  anchor="m", inset=(0, 0, 0, 0), fit=False, name="Шапка")
        if title:
            self.text(s, M, TITLE_Y, CW, 0.8, [T(title, F_HEAD, title_pt, bold=True, color=ON_DARK if dark else DARK)],
                      inset=(0, 0, 0, 0), min_pt=36, name="Заголовок")
        if sub:
            self.text(s, M, 1.44, CW, 0.5, [T(sub, F_BODY, 20, italic=True, color=LINE if dark else INK2)],
                      inset=(0, 0, 0, 0), min_pt=18, name="Подзаголовок")
        return CT_SUB if sub else CT

    def footer(self, s, page, dark=False):
        col = LINE if dark else INK2
        shape_line(s, M, FOOT_LINE, W - M, FOOT_LINE, color=INK2 if dark else LINE, lw=0.75, name="Колонтитул: линия")
        self.text(s, M, FOOT_Y - 0.02, 7.5, 0.42, [T(f"Урок {self.n} · «{self.song}»", F_BODY, 16, color=col)],
                  inset=(0, 0, 0, 0), fit=False, name="Колонтитул слева")
        if page:
            self.text(s, W - M - 4.5, FOOT_Y - 0.02, 4.5, 0.42, [T(f"Учебник, с. {page}", F_BODY, 16, color=col, align="r")],
                      inset=(0, 0, 0, 0), fit=False, name="Колонтитул справа")

    def card(self, cont, x, y, w, h, bar=None, fill=CARD, line=LINE, lw=1.0, name=None, bar_color=RED):
        r = 0.12
        c = shape_rect(cont, x, y, w, h, fill=fill, line=line, lw=lw, radius=r, name=name or "Карточка")
        if bar == "top":
            shape_rect(cont, x + r + 0.06, y - 0.01, w - 2 * r - 0.12, 0.085, fill=bar_color, name="Полоса")
        elif bar == "left":
            shape_rect(cont, x - 0.01, y + r + 0.06, 0.085, h - 2 * r - 0.12, fill=bar_color, name="Полоса")
        return c

    def answers_tag(self, cont, dark=False):
        col = ACC_DARK if dark else RED
        shape_rect(cont, W - M - 1.55, KICK_Y - 0.04, 1.55, 0.42, fill=None, line=col, lw=1.5, radius=0.08, name="Метка ОТВЕТЫ")
        self.text(cont, W - M - 1.55, KICK_Y - 0.08, 1.55, 0.5, [T("ОТВЕТЫ", F_HEAD, 16, bold=True, color=col, spc=200, align="c")],
                  anchor="m", inset=(0, 0, 0, 0), fit=False)

    def stamp(self, cont, cx, cy, word, color, size=18, h=0.5):
        w = MEAS.width(word, F_HEAD, size, bold=True, spc=200) + 0.42
        g = cont.shapes.add_group_shape()
        g.name = f"Штамп «{word}»"
        o = shape_rect(g, cx - w / 2, cy - h / 2, w, h, fill=None, line=color, lw=2.25, radius=0.05, name="рамка 1")
        o.rotation = -8
        i = shape_rect(g, cx - w / 2 + 0.06, cy - h / 2 + 0.06, w - 0.12, h - 0.12, fill=None, line=color, lw=1.0,
                       radius=0.03, name="рамка 2")
        i.rotation = -8
        tf = i.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = word
        f = run.font
        f.name, f.size, f.bold = F_HEAD, Pt(size), True
        f.color.rgb = rgb(color)
        rpr = run._r.get_or_add_rPr()
        rpr.set("spc", "200")
        rpr.set("lang", "ru-RU")
        return g, w

    def answers_group(self, s):
        g = s.shapes.add_group_shape()
        g.name = "Ответы"
        return g

    def finish_answers(self, s, g):
        """Группа «Ответы» поверх всего; в режиме АНИМАЦИЯ она появляется по щелчку."""
        tree = s.shapes._spTree
        tree.remove(g._element)
        tree.append(g._element)
        g._element.recalculate_extents()
        if self.mode == "АНИМАЦИЯ":
            add_click_appear(s, [g.shape_id])

    # ---------------- заглушки
    def placeholder(self, s, slot, x, y, w, h, dark_bg=False):
        cap = self.slot_caption(slot)
        g = s.shapes.add_group_shape()
        g.name = cap
        shape_rect(g, x, y, w, h, fill=CARD, line=SLOT, lw=2.5, radius=0.14, dash=True, name="рамка")
        icon = min(1.5, 0.3 * min(w, h))
        cy = y + h / 2 - 0.42
        cx = x + w / 2
        self._icon(g, slot, cx, cy, icon)
        self.text(g, x + 0.3, cy + icon / 2 + 0.18, w - 0.6, 1.0,
                  [T(cap, F_BODY, 18, color=INK2, align="c")], inset=(0, 0, 0, 0), name="подпись")
        self.slots.append((self.slide_no, cap))
        return g

    def _icon(self, g, slot, cx, cy, sz):
        col = INK2
        if slot.startswith("ВИДЕО"):
            shape_rect(g, cx - sz / 2, cy - sz / 2, sz, sz, fill=None, line=col, lw=3, kind=MSO_SHAPE.OVAL, name="значок")
            tri = shape_rect(g, cx - sz * 0.17, cy - sz * 0.24, sz * 0.44, sz * 0.48, fill=col, kind=MSO_SHAPE.ISOSCELES_TRIANGLE,
                             name="значок ▶")
            tri.rotation = 90
        elif slot == "АУДИО":
            hw, hh = sz * 0.36, sz * 0.27
            hx, hy = cx - sz * 0.22, cy + sz * 0.22
            head = shape_rect(g, hx - hw / 2, hy - hh / 2, hw, hh, fill=col, kind=MSO_SHAPE.OVAL, name="значок ♪")
            head.rotation = -20
            sx = hx + hw / 2 - sz * 0.05
            shape_rect(g, sx, cy - sz * 0.5, sz * 0.06, sz * 0.72, fill=col, name="значок ♪ штиль")
            flag = shape_rect(g, sx, cy - sz * 0.5, sz * 0.36, sz * 0.36, fill=col, kind=MSO_SHAPE.RIGHT_TRIANGLE,
                              name="значок ♪ флажок")
            flag._element.spPr.find(qn("a:xfrm")).set("flipV", "1")   # прямой угол сверху: флажок у штиля
        elif slot == "ТЕКСТ ПЕСНИ":
            self.text(g, cx - sz, cy - sz * 0.62, 2 * sz, sz * 1.25, [T("¶", F_BODY, int(sz * 72 * 0.8), color=col, align="c")],
                      anchor="m", inset=(0, 0, 0, 0), fit=False, name="значок ¶", autofit=False)
        else:  # КАРТИНКА: рамка, горы, солнце
            fw, fh = sz * 1.25, sz * 0.95
            shape_rect(g, cx - fw / 2, cy - fh / 2, fw, fh, fill=None, line=col, lw=3, radius=0.06, name="значок картинка")
            shape_rect(g, cx - fw * 0.42, cy - fh * 0.05, fw * 0.5, fh * 0.5, fill=col, kind=MSO_SHAPE.ISOSCELES_TRIANGLE, name="гора 1")
            shape_rect(g, cx - fw * 0.08, cy + fh * 0.07, fw * 0.48, fh * 0.38, fill=col, kind=MSO_SHAPE.ISOSCELES_TRIANGLE, name="гора 2")
            shape_rect(g, cx + fw * 0.16, cy - fh * 0.34, fh * 0.22, fh * 0.22, fill=col, kind=MSO_SHAPE.OVAL, name="солнце")

    def slot_note(self, slot):
        m = self.media(slot)
        if not m:
            return ""
        cap = self.slot_caption(slot)
        parts = [f"Заглушка {cap}: вставьте {m.get('what', 'материал')}"]
        if m.get("who"):
            parts.append(f"исполнитель по учебнику: {m['who']}")
        if m.get("dur"):
            parts.append(f"примерная длительность: {m['dur']}")
        how = {"ВИДЕО 1": "Вставка → Видео", "ВИДЕО 2": "Вставка → Видео", "АУДИО": "Вставка → Звук",
               "КАРТИНКА": "Вставка → Рисунки", "ТЕКСТ ПЕСНИ": "скопируйте текст песни из учебника в текстовое поле"}[slot]
        return ("; ".join(parts) + ". Как заменить: Главная → Выделить → Область выделения, найдите группу "
                f"«{cap}», удалите её и на это место {('вставьте материал (' + how + ')') if slot != 'ТЕКСТ ПЕСНИ' else how}.")

    # ================================================================ общие раскладки
    def uniform(self, specs, min_pt=MIN_PT):
        """Однотипные поля одного слайда получают одинаковый кегль (по самому длинному тексту)."""
        kmax = 0
        for sp in specs:
            l, t, r, b = sp.get("inset", (0.08, 0.04, 0.08, 0.04))
            k, ok, _ = fit_steps(sp["paras"], (sp["w"] - l - r) * 0.98, sp["h"] - t - b, sp.get("min_pt", min_pt))
            kmax = max(kmax, k)
        out = []
        for sp in specs:
            kw = {k_: v for k_, v in sp.items() if k_ not in ("cont", "x", "y", "w", "h", "paras", "min_pt")}
            sizes = sizes_for_k(sp["paras"], kmax, sp.get("min_pt", min_pt))
            out.append(self.text(sp["cont"], sp["x"], sp["y"], sp["w"], sp["h"], sp["paras"], sizes=sizes, **kw))
        return out

    def table(self, s, x, y, widths, head, rows, max_h, total=None, name="Таблица", body_pt=18, given_rows=(),
              hand_cells=None, blank_cells=None, fill_h=False, max_row=0.75, dry=False, fixed=None):
        """Таблица со своей стилизацией. hand_cells: {(r,c)}: ответы «красной ручкой».
        dry=True: ничего не рисует, возвращает высоту таблицы при кегле body_pt."""
        hand_cells = hand_cells or set()
        blank_cells = blank_cells or set()
        all_rows = [head] + rows + ([total] if total else [])
        nr, nc = len(all_rows), len(widths)
        ml, mt = 0.1, 0.05

        def cell_paras(ri, ci, pt):
            txt = all_rows[ri][ci] if ci < len(all_rows[ri]) else ""
            if ri == 0:
                return [T(txt.upper(), F_HEAD, pt, bold=True, color=ON_DARK, spc=50)]
            if (ri, ci) in hand_cells:
                return [T(txt, F_HAND, pt, color=RED)]
            if (ri, ci) in blank_cells:
                return [T(txt, F_BODY, pt, color=INK2)]
            bold = (total is not None and ri == nr - 1) or ci == 0
            return [T(txt, F_BODY, pt, bold=bold, italic=(ri - 1) in given_rows, color=DARK if ci == 0 else INK)]

        def row_heights(pt):
            hs = []
            for ri in range(nr):
                hmax = 0.0
                for ci in range(nc):
                    paras = cell_paras(ri, ci, pt)
                    hh, bad = block_height(paras, [[r_.size for r_ in p_.runs] for p_ in paras], (widths[ci] - 2 * ml) * 0.98)
                    hmax = max(hmax, hh + 2 * mt + (9 if bad else 0))
                hs.append(max(0.40, hmax + 0.03))
            return hs

        if dry is True:
            return sum(row_heights(body_pt))
        if fixed is not None:
            pt, heights = fixed
        else:
            heights = []
            for pt in range(body_pt, MIN_PT - 1, -1):
                heights = row_heights(pt)
                if sum(heights) <= max_h:
                    break
            else:
                self.warn(f"таблица выше области ({sum(heights):.2f} > {max_h:.2f})")
            if fill_h and sum(heights) < max_h:
                add = (max_h - sum(heights)) / nr
                heights = [min(h_ + add, max(h_, max_row)) for h_ in heights]
        if dry == "layout":
            return pt, heights
        gf = s.shapes.add_table(nr, nc, Inches(x), Inches(y), Inches(sum(widths)), Inches(sum(heights)))
        gf.name = name
        tbl = gf.table
        tblPr = tbl._tbl.tblPr
        tblPr.set("firstRow", "0")
        tblPr.set("bandRow", "0")
        sid = tblPr.find(qn("a:tableStyleId"))
        if sid is None:
            sid = etree.SubElement(tblPr, qn("a:tableStyleId"))
        sid.text = NO_STYLE_TABLE
        for ci, wv in enumerate(widths):
            tbl.columns[ci].width = Inches(wv)
        for ri, hv in enumerate(heights):
            tbl.rows[ri].height = Inches(hv)
        for ri in range(nr):
            for ci in range(nc):
                cell = tbl.cell(ri, ci)
                cell.margin_left = cell.margin_right = Inches(ml)
                cell.margin_top = cell.margin_bottom = Inches(mt)
                cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                if ri == 0:
                    fill = DARK
                elif (ri - 1) in given_rows or (total is not None and ri == nr - 1):
                    fill = PAPER2
                else:
                    fill = CARD
                tf = cell.text_frame
                tf.word_wrap = True
                for k, p in enumerate(cell_paras(ri, ci, pt)):
                    para = tf.paragraphs[0] if k == 0 else tf.add_paragraph()
                    para.alignment = PP_ALIGN.LEFT
                    for rr in p.runs:
                        run = para.add_run()
                        run.text = rr.text
                        f = run.font
                        f.name, f.size, f.bold, f.italic = rr.font, Pt(rr.size), rr.bold, rr.italic
                        f.color.rgb = rgb(rr.color)
                        rpr = run._r.get_or_add_rPr()
                        rpr.set("lang", "ru-RU")
                        if rr.spc:
                            rpr.set("spc", str(rr.spc))
                self._cell_style(cell, fill)
        return gf, sum(heights), heights, pt

    @staticmethod
    def _cell_style(cell, fill, border=LINE):
        tcPr = cell._tc.get_or_add_tcPr()
        for child in list(tcPr):
            tcPr.remove(child)
        for tag in ("a:lnL", "a:lnR", "a:lnT", "a:lnB"):
            ln = etree.SubElement(tcPr, qn(tag))
            ln.set("w", str(Pt(1)))
            ln.set("cap", "flat")
            ln.set("cmpd", "sng")
            sf = etree.SubElement(ln, qn("a:solidFill"))
            etree.SubElement(sf, qn("a:srgbClr")).set("val", border)
            etree.SubElement(ln, qn("a:prstDash")).set("val", "solid")
        sf = etree.SubElement(tcPr, qn("a:solidFill"))
        etree.SubElement(sf, qn("a:srgbClr")).set("val", fill)

    @staticmethod
    def natural_widths(head, rows, pt):
        nat = []
        for ci in range(len(head)):
            wmax = MEAS.width(head[ci].upper(), F_HEAD, pt, bold=True, spc=50)
            for r in rows:
                if ci < len(r):
                    wmax = max(wmax, MEAS.width(r[ci], F_BODY, pt, bold=(ci == 0)))
            nat.append(max(0.9, wmax + 0.32))
        return nat

    def grid_numbered(self, s, items, y0, y1, label, cols=2, text_pt=22):
        n = len(items)
        rows = math.ceil(n / cols)
        gx, gy = 0.3, 0.26
        cw = (CW - gx * (cols - 1)) / cols
        ch = (y1 - y0 - gy * (rows - 1)) / rows
        specs = []
        for i, q in enumerate(items):
            r, c = divmod(i, cols)
            x, y = M + c * (cw + gx), y0 + r * (ch + gy)
            self.card(s, x, y, cw, ch, bar="left", name=f"{label} {i + 1}")
            self.text(s, x + 0.2, y + 0.08, 0.85, 1.2, [T(str(i + 1), F_HEAD, 60, bold=True, color=RED)],
                      inset=(0, 0, 0, 0), fit=False, name=f"Номер {i + 1}")
            specs.append(dict(cont=s, x=x + 1.05, y=y + 0.2, w=cw - 1.3, h=ch - 0.4,
                              paras=[T(q, F_BODY, text_pt, color=INK, line=1.05)], anchor="m", inset=(0, 0, 0, 0),
                              name=f"{label} {i + 1}: текст"))
        self.uniform(specs)

    def grid_cells(self, n, y0, y1, cols, rows, order="row", gx=0.3, gy=0.22):
        """Координаты карточек сетки: order='row' (а б в / г д е) или 'col' (по столбцам)."""
        cw = (CW - gx * (cols - 1)) / cols
        ch = (y1 - y0 - gy * (rows - 1)) / rows
        out = []
        for i in range(n):
            if order == "row":
                r, c = divmod(i, cols)
            else:
                c, r = divmod(i, rows)
            out.append((M + c * (cw + gx), y0 + r * (ch + gy), cw, ch))
        return out

    # ================================================================ слайды
    def build(self):
        d = self.d
        self.s_cover()
        self.s_plan()
        self.s_keyword()
        self.s_warmup()
        self.s_listen()
        self.s_lyrics()
        self.pair(self.s_words)
        self.s_history()
        if self.media("ВИДЕО 2"):
            self.s_video2()
        self.s_context()
        chunks = [d["vocab"][i:i + 6] for i in range(0, len(d["vocab"]), 6)]
        for i, ch in enumerate(chunks):
            self.s_vocab(ch, i, len(chunks))
        self.s_realia()
        self.s_visual()
        for gi in range(len(d["grammar"])):
            self.s_grammar(gi)
            if gi < len(d["practice"]):
                self.pair(lambda show, gi=gi: self.s_practice(gi, show))
        if d.get("wordform"):
            self.pair(self.s_wordform)
        self.pair(self.s_tf)
        self.pair(self.s_match)
        for qi in range(len(d["quiz"])):
            self.pair(lambda show, qi=qi: self.s_quiz(qi, show))
        self.s_sing()
        self.s_speaking()
        self.s_discussion()
        self.s_writing()
        self.s_homework()
        self.s_reflection()
        return self.prs

    def pair(self, fn):
        """Задание + ответ: два слайда (ОТДЕЛЬНЫЙ_СЛАЙД) или один слайд с анимацией (АНИМАЦИЯ)."""
        if self.mode == "АНИМАЦИЯ":
            fn(True)
        else:
            fn(False)
            fn(True)

    def kind(self, base, show):
        if self.mode == "АНИМАЦИЯ":
            return base + "-anim"
        return base + ("-answer" if show else "-task")

    def task_notes(self, show):
        """Заметки «задания» нужны на слайде-задании и на единственном слайде в режиме АНИМАЦИЯ."""
        return (not show) or self.mode == "АНИМАЦИЯ"

    def where_answers(self, one=False):
        if self.mode == "АНИМАЦИЯ":
            return "Ответ появится по щелчку." if one else "Ответы появятся по щелчку (один щелчок показывает все ответы)."
        return "Ответ на следующем слайде." if one else "Ответы на следующем слайде."

    # ---------------- 1. обложка
    def s_cover(self):
        d = self.d
        s = self.new_slide("cover", DARK)
        shape_rect(s, 0.25, 0.25, W - 0.5, H - 0.5, fill=None, line=ACC_DARK, lw=1.0, name="Рамка")
        shape_rect(s, 0.33, 0.33, W - 0.66, H - 0.66, fill=None, line=ACC_DARK, lw=0.5, name="Рамка 2")
        lx, lw = M + 0.15, 7.15
        star(s, lx, 1.02, 0.28, ACC_DARK)
        self.text(s, lx + 0.42, 0.93, 6.5, 0.48, [T(f"УРОК {self.n} ИЗ 10", F_HEAD, 22, bold=True, color=ACC_DARK, spc=400)],
                  anchor="m", inset=(0, 0, 0, 0), fit=False, name="Урок N из 10")
        title = [T(f"«{self.song.upper()}»", F_HEAD, 80, bold=True, color=ON_DARK, line=0.9)]
        self.text(s, lx, 1.55, lw, 2.15, title, inset=(0, 0, 0, 0), min_pt=44, anchor="m", name="Название песни")
        shape_rect(s, lx, 3.82, 1.6, 0.06, fill=ACC_DARK, name="Линия")
        y = 4.1
        blk = [T(f"{d['credits']}, {d['year']}", F_BODY, 22, color=ON_DARK)]
        hh = min(1.0, measure(blk, lw, (0, 0, 0, 0)) + 0.05)
        self.text(s, lx, y, lw, hh, blk, inset=(0, 0, 0, 0), name="Авторы и год")
        y += hh + 0.18
        blk = [P([R("Тема урока: ", F_BODY, 20, bold=True, color=ACC_DARK), R(d["theme"], F_BODY, 20, italic=True, color=ON_DARK)])]
        hh = min(1.0, measure(blk, lw, (0, 0, 0, 0)) + 0.05)
        self.text(s, lx, y, lw, hh, blk, inset=(0, 0, 0, 0), name="Тема урока")
        ref = [T("Э. Б. Маманазаров. Учебник русского языка через песни Великой Отечественной войны (B1). "
                 f"Урок {self.n}: с. {self.pg('lesson')}", F_BODY, 16, color=LINE)]
        self.text(s, lx, 6.12, lw, 0.75, ref, inset=(0, 0, 0, 0), anchor="b", name="Ссылка на учебник")
        self.placeholder(s, "КАРТИНКА", 8.3, 0.85, 4.43, 5.8)
        self.notes(s, f"""
ОБЛОЖКА. Этап «Разминка» (7 минут на весь этап), этот слайд: {ru_minutes(self.t['cover'])}.
Поздоровайтесь и назовите тему: урок {self.n} из 10, песня «{self.song}» ({d['year']}). {d['credits']}.
Попросите студентов открыть учебник на с. {self.first_page()}.
Тема урока: {d['theme']}.
{self.slot_note('КАРТИНКА')}
""")

    # ---------------- 2. план урока
    def s_plan(self):
        d = self.d
        s = self.new_slide("plan")
        y0 = self.header(s, f"{ST_A} · {LESSON_MINUTES} МИНУТ", "ПЛАН УРОКА")
        g1 = d["grammar"][0]["title"]
        g2 = d["grammar"][1]["title"] if len(d["grammar"]) > 1 else ""
        rows = []
        for i, (stage, mins, what) in enumerate(STAGES):
            what = what.format(g1=g1, g2=g2[:1].lower() + g2[1:])
            rows.append([f"{i + 1}. {stage}", f"{mins} мин", what])
        widths = [3.45, 1.45, CW - 3.45 - 1.45]
        self.table(s, M, y0, widths, ["Этап", "Время", "Что делаем"], rows, CB - y0,
                   total=["Всего", f"{sum(x[1] for x in STAGES)} мин", ""], name="Таблица: план урока", body_pt=20,
                   fill_h=True, max_row=0.6)
        self.footer(s, self.pg("lesson"))
        lines = "\n".join(f"{i + 1}) {r[0][3:]}: {r[1]}. {r[2]}." for i, r in enumerate(rows))
        self.notes(s, f"""
ПЛАН УРОКА ({ru_minutes(self.t['plan'])}). Коротко покажите студентам этапы урока, чтобы они знали, что их ждёт.
{lines}
Всего {LESSON_MINUTES} минут. Если группа работает медленнее, сократите квиз (вопросы 6-7) или перенесите дискуссию на следующий урок.
""")

    # ---------------- 3. ключевое слово
    def s_keyword(self):
        d = self.d
        kw = d["key_word"]
        s = self.new_slide("keyword", DARK)
        self.header(s, f"{ST_A} · КЛЮЧЕВОЕ СЛОВО УРОКА", dark=True)
        self.text(s, M, 0.95, 6.6, 2.3, [T(kw["word"], F_HAND, 88, color=ACC_DARK, align="l")], anchor="m",
                  inset=(0, 0, 0, 0), min_pt=40, name="Ключевое слово")
        self.text(s, M, 3.22, 6.6, 0.55, [T(kw["gloss"], F_BODY, 26, italic=True, color=ON_DARK)], inset=(0, 0, 0, 0),
                  name="Перевод")
        shape_line(s, 7.35, 1.25, 7.35, 3.65, color=ACC_DARK, lw=1.5, name="Линия")
        self.text(s, 7.65, 1.15, W - M - 7.65, 2.6, [T(kw["line"], F_BODY, 24, color=ON_DARK, line=1.05)], anchor="m",
                  inset=(0, 0, 0, 0), name="Почему это слово ключевое")
        n = len(d["goals"])
        gap = 0.3
        cw = (CW - gap * (n - 1)) / n
        y, h = 4.12, 2.55
        specs = []
        for i, g in enumerate(d["goals"]):
            x = M + i * (cw + gap)
            self.card(s, x, y, cw, h, bar="top", name=f"Цель: {g['t']}")
            self.text(s, x + 0.25, y + 0.25, cw - 0.5, 0.45, [T(g["t"].upper(), F_HEAD, 20, bold=True, color=RED, spc=150)],
                      inset=(0, 0, 0, 0), fit=False)
            specs.append(dict(cont=s, x=x + 0.25, y=y + 0.75, w=cw - 0.5, h=h - 0.95,
                              paras=[T(g["d"][:1].upper() + g["d"][1:], F_BODY, 20, color=INK, line=1.05)], inset=(0, 0, 0, 0),
                              name=f"Цель: {g['t']}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("warmup"), dark=True)
        goals = "\n".join(f"{g['t']}: {g['d']}." for g in d["goals"])
        self.notes(s, f"""
КЛЮЧЕВОЕ СЛОВО УРОКА ({ru_minutes(self.t['keyword'])}). Напишите на доске: «{kw['word']}» ({kw['gloss']}).
Скажите: {quote(kw['line'])}.
Спросите 1-2 студентов: с какими словами вы знаете это слово? Запишите ответы на доске.
Цели урока (прочитайте вслух, коротко):
{goals}
В конце урока (слайд «3-2-1») вернитесь к этому слову.
""")

    # ---------------- 4. разминка
    def s_warmup(self):
        d = self.d
        s = self.new_slide("warmup")
        y0 = self.header(s, f"{ST_A} · РАЗМИНКА", "ПЕРЕД ПЕСНЕЙ", sub="Обсудите в парах, потом всей группой.")
        self.grid_numbered(s, d["warmup"], y0, CB, "Вопрос")
        self.footer(s, self.pg("warmup"))
        qs = "\n".join(f"{i + 1}) {q}" for i, q in enumerate(d["warmup"]))
        self.notes(s, f"""
РАЗМИНКА ({ru_minutes(self.t['warmup'])}). Учебник, с. {self.pg('warmup')}, раздел «Перед чтением».
Организация: пары, затем общее обсуждение. {self.tip('warmup')}
Вопросы:
{qs}
""")

    # ---------------- 5. слушаем песню
    def s_listen(self):
        d = self.d
        s = self.new_slide("listen")
        self.header(s, f"{ST_B} · ДВА ПРОСЛУШИВАНИЯ", "СЛУШАЕМ ПЕСНЮ")
        vw = 7.35
        vh = vw * 9 / 16
        vy = CT + (CB - CT - vh) / 2
        self.placeholder(s, "ВИДЕО 1", M, vy, vw, vh)
        x = M + vw + 0.35
        w = W - M - x
        tasks = [("1. СЛУШАЕМ БЕЗ ТЕКСТА", strip_listen_prefix(d["listen"]["task1"])),
                 (f"2. СЛУШАЕМ С ТЕКСТОМ (УЧЕБНИК, С. {self.pg('lyrics')})", strip_listen_prefix(d["listen"]["task2"]))]
        ch = (CB - CT - 0.3) / 2
        specs = []
        for i, (t, q) in enumerate(tasks):
            y = CT + i * (ch + 0.3)
            self.card(s, x, y, w, ch, bar="top", name=f"Задание {i + 1}")
            specs.append(dict(cont=s, x=x + 0.25, y=y + 0.25, w=w - 0.5, h=ch - 0.45,
                              paras=[T(t, F_HEAD, 21, bold=True, color=RED, spc=50, after=6), T(q, F_BODY, 21, color=INK, line=1.05)],
                              inset=(0, 0, 0, 0), name=f"Задание {i + 1}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("lyrics"))
        self.notes(s, f"""
СЛУШАЕМ ПЕСНЮ. Этап «Песня»: 10 минут. Этот слайд: первое прослушивание без текста ({ru_minutes(self.t['listen'])}).
До прослушивания прочитайте вслух задание 1: {quote(strip_listen_prefix(d['listen']['task1']))}.
Учебники закрыты. После прослушивания 1 минута на ответы всей группой.
Ожидаемый ответ: {d['listen'].get('a1', 'ответы студентов')}
{self.tip('listen')}
Задание 2 (второе прослушивание, следующий слайд): {quote(strip_listen_prefix(d['listen']['task2']))}.
{self.slot_note('ВИДЕО 1')}
""")

    # ---------------- 6. текст песни
    def s_lyrics(self):
        d = self.d
        s = self.new_slide("lyrics")
        self.header(s, f"{ST_B} · ВТОРОЕ ПРОСЛУШИВАНИЕ", "ТЕКСТ ПЕСНИ")
        self.placeholder(s, "ТЕКСТ ПЕСНИ", M, CT, CW, CB - CT)
        self.footer(s, self.pg("lyrics"))
        self.notes(s, f"""
ТЕКСТ ПЕСНИ: второе прослушивание с текстом ({ru_minutes(self.t['lyrics'])}). Учебник, с. {self.pg('lyrics')}.
Студенты открывают учебник и следят по тексту. Включите запись ещё раз: видео со слайда {self.index.get('listen')} или аудио со слайда «Поём вместе»; аудио можно скопировать и на этот слайд.
Задание: {quote(strip_listen_prefix(d['listen']['task2']))} (проверка на следующих двух слайдах).
Попросите отметить в тексте незнакомые слова: их разберём на этапе «Словарь».
{self.slot_note('ТЕКСТ ПЕСНИ')} Текст песни в презентацию специально не перенесён.
""")

    # ---------------- 7. какие слова звучат в песне
    def s_words(self, show):
        d = self.d
        words = d["listen"]["words"]
        s = self.new_slide(self.kind("words", show))
        sub = "Есть это слово в песне или нет? Отметьте в тетради."
        if show and self.mode != "АНИМАЦИЯ":
            sub = f"Проверяем по тексту песни (учебник, с. {self.pg('lyrics')})."
        y0 = self.header(s, f"{ST_B} · СЛОВА ИЗ ПЕСНИ", "КАКИЕ СЛОВА ЗВУЧАТ В ПЕСНЕ?", sub=sub)
        cols = 5
        rows = math.ceil(len(words) / cols)
        cells = self.grid_cells(len(words), y0, CB, cols, rows, "row", gx=0.25, gy=0.3)
        ans = self.answers_group(s) if show else None
        specs = []
        for i, (wd, (x, y, cw, ch)) in enumerate(zip(words, cells)):
            self.card(s, x, y, cw, ch, bar="top", name=f"Слово {i + 1}")
            specs.append(dict(cont=s, x=x + 0.12, y=y + 0.2, w=cw - 0.24, h=ch * 0.55,
                              paras=[T(wd["w"], F_BODY, 28, bold=True, color=DARK, align="c")], anchor="m", inset=(0, 0, 0, 0),
                              name=f"Слово {i + 1}: {wd['w']}"))
            if show:
                word, col = ("ЕСТЬ", GREEN) if wd["in"] else ("НЕТ", RED)
                self.stamp(ans, x + cw / 2, y + ch * 0.76, word, col, size=20, h=0.52)
        self.uniform(specs)
        if show:
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg("lyrics"))
        yes = ", ".join(w["w"] for w in words if w["in"])
        no = ", ".join(w["w"] for w in words if not w["in"])
        if self.task_notes(show):
            extra = (f"\nПосле щелчка: проверка ({ru_minutes(self.t['words_a'])}). Попросите найти эти слова в тексте песни в учебнике."
                     if self.mode == "АНИМАЦИЯ" else "")
            self.notes(s, f"""
КАКИЕ СЛОВА ЗВУЧАТ В ПЕСНЕ? (задание: {ru_minutes(self.t['words_t'])}). Студенты в парах решают: есть слово в песне или нет.
Можно сделать по памяти сразу после первого прослушивания, а проверить по тексту после второго.
{self.where_answers()}
Ответы: есть в песне: {yes}; нет в песне: {no}.{extra}
""")
        else:
            self.notes(s, f"""
ОТВЕТЫ ({ru_minutes(self.t['words_a'])}). Есть в песне ({sum(w['in'] for w in words)}): {yes}. Нет в песне ({sum(not w['in'] for w in words)}): {no}.
Попросите найти слова в тексте песни в учебнике (с. {self.pg('lyrics')}) и прочитать строку вслух.
""")

    # ---------------- 8. история песни: лента времени
    def s_history(self):
        d = self.d
        s = self.new_slide("history")
        self.header(s, f"{ST_C} · ИСТОРИЯ ПЕСНИ", "КАК ПОЯВИЛАСЬ ПЕСНЯ")
        items = d["history"]
        n = len(items)
        colw = CW / n
        ly = 2.72
        shape_line(s, M, ly, W - M, ly, color=RED, lw=2.25, name="Лента времени")
        dates, texts = [], []
        for i, it in enumerate(items):
            cx = M + colw * (i + 0.5)
            dates.append(dict(cont=s, x=cx - colw / 2 + 0.05, y=CT + 0.02, w=colw - 0.1, h=0.78,
                              paras=[T(it["date"], F_HEAD, 32, bold=True, color=RED, align="c")], anchor="b", inset=(0, 0, 0, 0),
                              min_pt=22, name=f"Дата {i + 1}"))
            shape_rect(s, cx - 0.16, ly - 0.16, 0.32, 0.32, fill=PAPER, line=RED, lw=2.25, kind=MSO_SHAPE.OVAL, name=f"Точка {i + 1}")
            shape_rect(s, cx - 0.07, ly - 0.07, 0.14, 0.14, fill=RED, kind=MSO_SHAPE.OVAL, name=f"Точка {i + 1}: центр")
            shape_line(s, cx, ly + 0.16, cx, 3.12, color=RED, lw=1.25, name=f"Связь {i + 1}")
            x, y, w, h = cx - colw / 2 + 0.1, 3.12, colw - 0.2, CB - 3.12
            self.card(s, x, y, w, h, name=f"Событие {i + 1}")
            texts.append(dict(cont=s, x=x + 0.2, y=y + 0.2, w=w - 0.4, h=h - 0.35,
                              paras=[T(it["text"], F_BODY, 20, color=INK, line=1.05)], inset=(0, 0, 0, 0), name=f"Событие {i + 1}: текст"))
        self.uniform(dates, min_pt=22)
        self.uniform(texts)
        self.footer(s, self.pg("history"))
        ev = "\n".join(f"{it['date']}: {it['text']}" for it in items)
        v2 = " Следующий слайд: фрагмент «Смотрим» (ВИДЕО 2)." if self.media("ВИДЕО 2") else ""
        self.notes(s, f"""
КАК ПОЯВИЛАСЬ ПЕСНЯ. Этап «История и контекст»: 10 минут, этот слайд: {ru_minutes(self.t['history'])}.{v2}
Учебник, с. {self.pg('history')}, раздел «История песни». Организация: студенты 2 минуты читают раздел про себя, затем учитель идёт по ленте времени слева направо и задаёт вопрос по каждой дате.
{self.tip('history')}
Лента времени:
{ev}
""")

    # ---------------- 8a. смотрим (ВИДЕО 2)
    def s_video2(self):
        d = self.d
        s = self.new_slide("video2")
        self.header(s, f"{ST_C} · ДОПОЛНИТЕЛЬНЫЙ МАТЕРИАЛ", "СМОТРИМ")
        vw = 7.35
        vh = vw * 9 / 16
        vy = CT + (CB - CT - vh) / 2
        self.placeholder(s, "ВИДЕО 2", M, vy, vw, vh)
        x = M + vw + 0.35
        w = W - M - x
        qs = d.get("watch") or ["Кто исполняет песню?", "Где и когда это происходит?", "Как слушают песню люди вокруг?"]
        self.card(s, x, CT, w, CB - CT, bar="top", name="Вопросы к фрагменту")
        paras = [T("СМОТРИМ И ОТВЕЧАЕМ", F_HEAD, 21, bold=True, color=RED, spc=50, after=8)]
        paras += [T(f"{i + 1}. {q}", F_BODY, 21, color=INK, after=8) for i, q in enumerate(qs)]
        self.text(s, x + 0.25, CT + 0.25, w - 0.5, CB - CT - 0.45, paras, inset=(0, 0, 0, 0), name="Вопросы к фрагменту: текст")
        self.footer(s, self.pg("history"))
        qn_ = "\n".join(f"{i + 1}) {q}" for i, q in enumerate(qs))
        self.notes(s, f"""
СМОТРИМ ({ru_minutes(self.t['video2'])}). Покажите фрагмент и обсудите вопросы на слайде всей группой.
Вопросы:
{qn_}
{self.slot_note('ВИДЕО 2')}
""")

    # ---------------- 9. время песни
    def s_context(self):
        d = self.d
        c = d["context"]
        s = self.new_slide("context")
        self.header(s, f"{ST_C} · ИСТОРИЧЕСКИЙ КОНТЕКСТ", "ВРЕМЯ ПЕСНИ")
        lw = 3.75
        self.text(s, M, CT + 0.1, lw, 1.9, [T(c["big"], F_HEAD, 120, bold=True, color=RED)], anchor="m",
                  inset=(0, 0, 0, 0), min_pt=48, name="Большая дата")
        shape_rect(s, M, CT + 2.12, 1.2, 0.06, fill=RED, name="Линия")
        self.text(s, M, CT + 2.35, lw, CB - CT - 2.4,
                  [T(c["caption"][:1].upper() + c["caption"][1:], F_BODY, 22, italic=True, color=INK, line=1.05)],
                  inset=(0, 0, 0, 0), name="Подпись к дате")
        x = M + lw + 0.45
        w = W - M - x
        pts = c["points"]
        gy = 0.22
        ch = (CB - CT - gy * (len(pts) - 1)) / len(pts)
        specs = []
        for i, p_ in enumerate(pts):
            y = CT + i * (ch + gy)
            self.card(s, x, y, w, ch, bar="left", name=f"Факт {i + 1}")
            specs.append(dict(cont=s, x=x + 0.3, y=y + 0.08, w=w - 0.5, h=ch - 0.16,
                              paras=[T(p_, F_BODY, 21, color=INK, line=1.05)], anchor="m", inset=(0, 0, 0, 0), name=f"Факт {i + 1}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("context", "history"))
        pts_n = "\n".join(f"{i + 1}) {p_}" for i, p_ in enumerate(pts))
        self.notes(s, f"""
ВРЕМЯ ПЕСНИ ({ru_minutes(self.t['context'])}). Учебник, с. {self.pg('context', 'history')}, раздел «Исторический контекст».
Большая дата на слайде: {c['big']}. Подпись: {quote(c['caption'][:1].upper() + c['caption'][1:])}.
{self.tip('context')}
Организация: студенты по очереди читают факты вслух; после каждого факта один вопрос к группе: «Что это значит для песни?»
Факты на слайде:
{pts_n}
""")

    # ---------------- 10-12. слова урока
    def s_vocab(self, chunk, i, total):
        s = self.new_slide(f"vocab-{i + 1}")
        self.header(s, f"{ST_D} · СЛОВАРЬ · {i + 1} ИЗ {total}", "СЛОВА УРОКА")
        cells = self.grid_cells(len(chunk), CT, CB, 3, 2, "row", gx=0.28, gy=0.28)
        specs = []
        for k, (v, (x, y, cw, ch)) in enumerate(zip(chunk, cells)):
            self.card(s, x, y, cw, ch, bar="left", name=f"Слово {k + 1}")
            paras = [T(v["w"], F_BODY, 26, bold=True, color=DARK, after=6, line=1.0),
                     T(v["m"], F_BODY, 21, color=INK, after=6, line=1.0),
                     T(v["n"], F_BODY, 18, italic=True, color=INK2, line=1.0)]
            specs.append(dict(cont=s, x=x + 0.3, y=y + 0.18, w=cw - 0.5, h=ch - 0.3, paras=paras, inset=(0, 0, 0, 0),
                              name=f"Слово {k + 1}: {v['w']}"))
        self.uniform(specs)
        self.footer(s, self.pg("vocab"))
        lst = "\n".join(f"{v['w']}: {v['m']} ({v['n']})" for v in chunk)
        self.notes(s, f"""
СЛОВА УРОКА, часть {i + 1} из {total} ({ru_minutes(self.t['vocab'])}).{' Этап «Словарь и образы»: 15 минут.' if i == 0 else ''} Учебник, с. {self.pg('vocab')}.
Организация: учитель читает слово, группа повторяет хором; следите за ударением (знак над гласной). Затем студенты в парах придумывают словосочетание с двумя словами со слайда.
Слова на слайде:
{lst}
""")

    # ---------------- 13. образы песни
    def s_realia(self):
        d = self.d
        s = self.new_slide("realia")
        self.header(s, f"{ST_D} · КУЛЬТУРНЫЕ РЕАЛИИ", "ОБРАЗЫ ПЕСНИ")
        items = d["realia"]
        n = len(items)
        gx = 0.3
        cw = (CW - gx * (n - 1)) / n
        specs = []
        for i, it in enumerate(items):
            x = M + i * (cw + gx)
            self.card(s, x, CT, cw, CB - CT, bar="top", name=f"Образ {i + 1}")
            paras = [T(f"«{it['t']}»", F_HEAD, 28, bold=True, color=RED, after=10, line=0.95),
                     T(it["d"], F_BODY, 22, color=INK, line=1.05)]
            specs.append(dict(cont=s, x=x + 0.28, y=CT + 0.3, w=cw - 0.56, h=CB - CT - 0.5, paras=paras, inset=(0, 0, 0, 0),
                              name=f"Образ {i + 1}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("realia", "vocab"))
        lst = "\n".join(f"«{it['t']}»: {it['d']}" for it in items)
        self.notes(s, f"""
ОБРАЗЫ ПЕСНИ ({ru_minutes(self.t['realia'])}). Учебник, с. {self.pg('realia', 'vocab')}, раздел «Культурные реалии».
{self.tip('realia')}
Организация: три группы, у каждой один образ; группа 1 минуту читает и объясняет образ остальным своими словами.
{lst}
""")

    # ---------------- 14. наглядная опора
    def s_visual(self):
        d = self.d
        v = d["visual"]
        s = self.new_slide("visual")
        self.header(s, f"{ST_D} · НАГЛЯДНАЯ ОПОРА", v["title"].upper())
        items = v["items"]
        n = len(items)
        aw = 0.5
        pad = 0.36
        pt = 26
        while pt > 18:
            need = [MEAS.width(it, F_BODY, pt, bold=True) + pad for it in items]
            if sum(need) + aw * (n - 1) <= CW:
                break
            pt -= 1
        need = [MEAS.width(it, F_BODY, pt, bold=True) + pad for it in items]
        extra = max(0.0, CW - aw * (n - 1) - sum(need))
        widths = [w_ + extra / n for w_ in need]
        by, bh = CT + 0.35, 1.45
        x = M
        for i, it in enumerate(items):
            bw = widths[i]
            self.card(s, x, by, bw, bh, bar="top", name=f"Блок {i + 1}")
            self.text(s, x + 0.05, by + 0.1, bw - 0.1, bh - 0.2, [T(it, F_BODY, pt, bold=True, color=DARK, align="c")],
                      anchor="m", inset=(0, 0, 0, 0), fit=False, name=f"Блок {i + 1}: {it}", wrap=False)
            if i < n - 1:
                ax = x + bw + 0.07
                shape_line(s, ax, by + bh / 2, ax + aw - 0.14, by + bh / 2, color=RED, lw=2.5, arrow=True, name=f"Стрелка {i + 1}")
            x += bw + aw
        sy = by + bh + 0.75
        bar = shape_rect(s, M, sy, CW, 0.34, fill=PAPER2, line=LINE, lw=0.75, radius=0.17, name="Шкала")
        bar.fill.gradient()
        bar.fill.gradient_angle = 0
        stops = bar.fill.gradient_stops
        stops[0].color.rgb = rgb(PAPER2)
        stops[0].position = 0.0
        stops[1].color.rgb = rgb(RED)
        stops[1].position = 1.0
        sc = v.get("scale") or ["", ""]
        self.text(s, M, sy + 0.45, 5.5, 0.5, [T("← " + sc[0], F_BODY, 21, italic=True, color=INK2)], inset=(0, 0, 0, 0),
                  name="Шкала: слева")
        self.text(s, W - M - 5.5, sy + 0.45, 5.5, 0.5, [T(sc[1] + " →", F_BODY, 21, bold=True, italic=True, color=RED, align="r")],
                  inset=(0, 0, 0, 0), name="Шкала: справа")
        cy = sy + 1.25
        self.card(s, M, cy, CW, CB - cy, fill=PAPER2, line=None, name="Вывод")
        self.text(s, M + 0.35, cy + 0.1, CW - 0.7, CB - cy - 0.2, [T(v["caption"], F_BODY, 24, italic=True, color=DARK, align="c")],
                  anchor="m", inset=(0, 0, 0, 0), name="Вывод: текст")
        self.footer(s, self.pg("realia", "vocab"))
        self.notes(s, f"""
НАГЛЯДНАЯ ОПОРА ({ru_minutes(self.t['visual'])}). {v['title']}: {' → '.join(items)}.
Шкала: от «{sc[0]}» к «{sc[1]}». {v['caption']}
{self.tip('visual') or 'Попросите студентов привести свои примеры.'}
""")

    # ---------------- 15/17. грамматика
    def s_grammar(self, gi):
        d = self.d
        g = d["grammar"][gi]
        total = len(d["grammar"])
        s = self.new_slide(f"grammar-{gi + 1}")
        self.header(s, f"{ST_E} · {gi + 1} ИЗ {total}", g["title"].upper())
        ex = g.get("examples") or []
        tab = g.get("table")

        def rule_p(pt=21):
            return [T(g["rule"], F_BODY, pt, color=DARK, line=1.05)]

        def ex_block(pt=20):
            return ([T("ПРИМЕРЫ", F_HEAD, 18, bold=True, color=RED, spc=150, after=6)] +
                    [T(e, F_BODY, pt, color=INK, after=8, line=1.05) for e in ex])

        def ex_band(pt):
            return [P([R("Примеры: ", F_BODY, pt, bold=True, color=RED)] +
                      [R(("   " if i else "") + e, F_BODY, pt, color=INK) for i, e in enumerate(ex)], line=1.05)]

        def scaled(nat, avail):
            return [w_ * avail / sum(nat) for w_ in nat]

        def tab_h(wds, pt):
            return self.table(s, 0, 0, wds, tab["head"], tab["rows"], 99, body_pt=pt, dry=True)

        G = {}   # текущие параметры плотности: кегль правила и примечания, промежутки

        def set_level(level):
            rule_pt, note_pt, gap = ((21, 20, 0.22), (19, 19, 0.18))[level]
            G.update(rule_pt=rule_pt, note_pt=note_pt, gap=gap)
            G["note"] = [P([R("Обратите внимание: ", F_BODY, note_pt, bold=True, color=RED), R(g["note"], F_BODY, note_pt, color=DARK)],
                           line=1.05)]
            G["nh"] = min(1.3, measure(G["note"], CW - 1.2, (0, 0, 0, 0)) + 0.28)
            G["ny"] = CB - G["nh"]
            G["rh"] = min(1.6, measure(rule_p(rule_pt), CW - 0.75, (0, 0, 0, 0)) + 0.32)

        def plan_side(pt):        # правило сверху; таблица слева, примеры справа
            gap, ny = G["gap"], G["ny"]
            my0 = CT + G["rh"] + gap
            mh = ny - gap - my0
            for side_w in (4.35, 3.9, 3.5):
                nat = self.natural_widths(tab["head"], tab["rows"], pt)
                aw = CW - side_w - 0.3
                if sum(nat) > aw:
                    continue
                wds = scaled(nat, aw)
                if tab_h(wds, pt) > mh:
                    continue
                if fit_steps(ex_block(), (side_w - 0.5) * 0.98, mh - 0.3, 18)[1]:
                    return dict(kind="side", pt=pt, wds=wds, side_w=side_w, my0=my0, mh=mh)
            return None

        def plan_top(pt):         # правило и примеры рядом сверху; таблица на всю ширину
            gap, ny = G["gap"], G["ny"]
            nat = self.natural_widths(tab["head"], tab["rows"], pt)
            if sum(nat) > CW:
                return None
            wds = scaled(nat, CW)
            th = tab_h(wds, pt)
            avail = min(ny - gap - th - gap - CT, 2.6)
            if avail < 1.0:
                return None
            for ex_w in (4.6, 5.2, 5.8, 6.4):
                rule_w = CW - ex_w - 0.3
                if not fit_steps(rule_p(G["rule_pt"]), (rule_w - 0.7) * 0.98, avail - 0.32, 18)[1]:
                    continue
                if not fit_steps(ex_block(), (ex_w - 0.5) * 0.98, avail - 0.3, 18)[1]:
                    continue
                need = max(measure(rule_p(G["rule_pt"]), rule_w - 0.7, (0, 0, 0, 0)) + 0.32,
                           measure(ex_block(), ex_w - 0.5, (0, 0, 0, 0)) + 0.3)
                return dict(kind="top", pt=pt, wds=wds, top_h=min(avail, max(need, 1.0)), ex_w=ex_w, rule_w=rule_w)
            return None

        def plan_below(pt):       # правило сверху; таблица; примеры полосой под таблицей
            gap, ny = G["gap"], G["ny"]
            my0 = CT + G["rh"] + gap
            mh = ny - gap - my0
            nat = self.natural_widths(tab["head"], tab["rows"], pt)
            if sum(nat) > CW:
                return None
            wds = scaled(nat, CW)
            eh = measure(ex_band(max(pt, 18)), CW - 0.6, (0, 0, 0, 0)) + 0.26
            if tab_h(wds, pt) + gap + eh <= mh:
                return dict(kind="below", pt=pt, wds=wds, eh=eh, my0=my0, mh=mh)
            return None

        plan = None
        if tab and ex:
            for level, pts in ((0, (20, 19, 18)), (1, (20, 19, 18)), (1, (17, 16))):
                set_level(level)
                for fn in (plan_side, plan_top, plan_below):
                    for pt in pts:
                        plan = fn(pt)
                        if plan:
                            break
                    if plan:
                        break
                if plan:
                    break
            if not plan:
                set_level(1)
                nat = self.natural_widths(tab["head"], tab["rows"], 16)
                my0 = CT + G["rh"] + G["gap"]
                plan = dict(kind="side", pt=16, wds=scaled(nat, CW - 3.8), side_w=3.5, my0=my0, mh=G["ny"] - G["gap"] - my0)
                self.warn("грамматика: таблица и примеры едва помещаются")
        else:
            set_level(0)
            my0 = CT + G["rh"] + G["gap"]
            mh = G["ny"] - G["gap"] - my0
            if tab:
                for pt in (20, 19, 18, 17, 16):
                    nat = self.natural_widths(tab["head"], tab["rows"], pt)
                    if sum(nat) <= CW:
                        break
                plan = dict(kind="full", pt=pt, wds=scaled(nat, CW), my0=my0, mh=mh)
            else:
                plan = dict(kind="exonly" if ex else "none", my0=my0, mh=mh)
        note, nh, ny, rh_full = G["note"], G["nh"], G["ny"], G["rh"]

        def rule_box(x, y, w, h):
            shape_rect(s, x, y, w, h, fill=CARD, line=RED, lw=1.5, radius=0.1, name="Правило: рамка")
            shape_rect(s, x + 0.06, y + 0.06, w - 0.12, h - 0.12, fill=None, line=RED, lw=0.5, radius=0.08, name="Правило: рамка 2")
            self.text(s, x + 0.35, y + 0.16, w - 0.7, h - 0.32, rule_p(G["rule_pt"]), anchor="m", inset=(0, 0, 0, 0), min_pt=18,
                      name="Правило")

        def ex_card(x, y, w, h, pt=20):
            self.card(s, x, y, w, h, bar="left", name="Примеры")
            self.text(s, x + 0.3, y + 0.15, w - 0.5, h - 0.3, ex_block(pt), inset=(0, 0, 0, 0), min_pt=18, name="Примеры: текст")

        k = plan["kind"]
        if k == "top":
            rule_box(M, CT, plan["rule_w"], plan["top_h"])
            ex_card(M + plan["rule_w"] + 0.3, CT, plan["ex_w"], plan["top_h"])
            ty = CT + plan["top_h"] + G["gap"]
            self.table(s, M, ty, plan["wds"], tab["head"], tab["rows"], ny - G["gap"] - ty, name="Таблица", body_pt=plan["pt"],
                       fill_h=True, max_row=0.62)
        else:
            rule_box(M, CT, CW, rh_full)
            my0, mh = plan["my0"], plan["mh"]
            if k == "side":
                self.table(s, M, my0, plan["wds"], tab["head"], tab["rows"], mh, name="Таблица", body_pt=plan["pt"],
                           fill_h=True, max_row=0.62)
                x = M + sum(plan["wds"]) + 0.3
                ex_card(x, my0, W - M - x, mh)
            elif k == "below":
                ey = my0 + mh - plan["eh"]
                self.table(s, M, my0, plan["wds"], tab["head"], tab["rows"], ey - G["gap"] - my0, name="Таблица", body_pt=plan["pt"])
                self.card(s, M, ey, CW, plan["eh"], bar="left", name="Примеры")
                self.text(s, M + 0.3, ey + 0.13, CW - 0.6, plan["eh"] - 0.26, ex_band(max(plan["pt"], 18)), anchor="m",
                          inset=(0, 0, 0, 0), name="Примеры: текст")
            elif k == "full":
                self.table(s, M, my0, plan["wds"], tab["head"], tab["rows"], mh, name="Таблица", body_pt=plan["pt"],
                           fill_h=True, max_row=0.62)
            elif k == "exonly":
                ex_card(M, my0, CW, mh, pt=22)
        # «Обратите внимание»
        self.card(s, M, ny, CW, nh, fill=PAPER2, line=None, name="Обратите внимание")
        shape_rect(s, M + 0.22, ny + nh / 2 - 0.25, 0.5, 0.5, fill=RED, kind=MSO_SHAPE.OVAL, name="Значок !")
        self.text(s, M + 0.22, ny + nh / 2 - 0.3, 0.5, 0.6, [T("!", F_HEAD, 24, bold=True, color=ON_DARK, align="c")],
                  anchor="m", inset=(0, 0, 0, 0), fit=False)
        self.text(s, M + 0.95, ny + 0.12, CW - 1.2, nh - 0.24, note, anchor="m", inset=(0, 0, 0, 0), name="Обратите внимание: текст")
        self.footer(s, self.pg(f"grammar{gi + 1}", "grammar"))
        tab_txt = ("Таблица: " + "; ".join(" / ".join(c_.rstrip(".") for c_ in r) for r in tab["rows"]) + ".") if tab else ""
        self.notes(s, f"""
ГРАММАТИКА {gi + 1} ИЗ {total}: {g['title']} ({ru_minutes(self.t['grammar'])}).{' Этап «Грамматика»: 20 минут.' if gi == 0 else ''} Учебник, с. {self.pg(f'grammar{gi + 1}', 'grammar')}.
Правило: {g['rule']}
{tab_txt}
{('Примеры: ' + ' '.join(ex)) if ex else ''}
Обратите внимание: {g['note']}
{self.tip(f'grammar{gi + 1}')}
Организация: объясните правило по рамке (1 минута), студенты читают таблицу хором, затем каждый придумывает свой пример и говорит его соседу.
""")

    # ---------------- 16/18. тренировка
    def practice_layout(self, items, y0):
        """Выбор сетки 2×3 (по столбцам) или 3×2 (по строкам): где ответы помещаются крупнее."""
        n = len(items)
        options = [(2, math.ceil(n / 2), "col"), (3, math.ceil(n / 3), "row")] if n > 4 else [(2, math.ceil(n / 2), "row")]
        best = None
        for cols, rows, order in options:
            cells = self.grid_cells(n, y0, CB, cols, rows, order, gx=0.3, gy=0.22)
            cw, ch = cells[0][2], cells[0][3]
            iw = (cw - 0.45) * 0.98
            for k in range(0, 7):
                qs, as_ = 21 - k, 20 - k
                if as_ < 17:
                    break
                need = 0.0
                for it in items:
                    q = [P([R("а) ", F_HEAD, qs + 1, bold=True), R(it["q"], F_BODY, qs)])]
                    a = [P([R("→ ", F_BODY, as_, bold=True), R(it["a"], F_HAND, as_)], line=0.95)]
                    hq, bq = block_height(q, [[qs + 1, qs]], iw)
                    ha, ba = block_height(a, [[as_, as_]], iw)
                    need = max(need, 0.12 + hq + 0.05 + ha + 0.1 + (9 if bq or ba else 0))
                if need <= ch:
                    if best is None or k < best[0]:
                        best = (k, cols, rows, order, qs, as_)
                    break
        if best is None:
            cols, rows, order = options[-1]
            best = (9, cols, rows, order, 18, 17)
            self.warn("тренировка: ответы не помещаются даже в мелком кегле")
        return best

    def s_practice(self, pi, show):
        d = self.d
        pr = d["practice"][pi]
        s = self.new_slide(self.kind(f"practice-{pi + 1}", show))
        title, sub = split_title(pr["title"])
        y0 = self.header(s, f"{ST_E} · ТРЕНИРОВКА {pi + 1} · {pr['source'].upper()}", title.upper(), sub=sub)
        items = pr["items"]
        _, cols, rows, order, qs, as_ = self.practice_layout(items, y0)
        cells = self.grid_cells(len(items), y0, CB, cols, rows, order, gx=0.3, gy=0.22)
        ans = self.answers_group(s) if show else None
        for i, (it, (x, y, cw, ch)) in enumerate(zip(items, cells)):
            self.card(s, x, y, cw, ch, bar="left", name=f"Пункт {LETTERS[i]})")
            q = [P([R(f"{LETTERS[i]}) ", F_HEAD, qs + 1, bold=True, color=RED), R(it["q"], F_BODY, qs, color=DARK)], line=1.0)]
            hq = measure(q, cw - 0.45, (0, 0, 0, 0)) + 0.03
            self.text(s, x + 0.28, y + 0.12, cw - 0.45, hq, q, inset=(0, 0, 0, 0), name=f"Пункт {LETTERS[i]}): задание",
                      sizes=[[qs + 1, qs]])
            if show:
                a = [P([R("→ ", F_BODY, as_, bold=True, color=RED), R(it["a"], F_HAND, as_, color=RED)], line=0.95)]
                self.text(ans, x + 0.28, y + 0.12 + hq + 0.03, cw - 0.45, ch - hq - 0.22, a, inset=(0, 0, 0, 0),
                          name=f"Ответ {LETTERS[i]})", sizes=[[as_, as_]])
        if show:
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg(f"practice{pi + 1}", "exercises"))
        key = "\n".join(f"{LETTERS[i]}) {fill_blanks(it['q'], it['a'])}" for i, it in enumerate(items))
        note = (" " + pr["note"]) if pr.get("note") else ""
        if self.task_notes(show):
            self.notes(s, f"""
ТРЕНИРОВКА {pi + 1}: {pr['source']} ({ru_minutes(self.t['pr_t'])}). Задание: {quote(pr['title'])}.{note}
Организация: студенты пишут в тетради сами (2 минуты), затем сверяют ответы в парах.
{self.where_answers()}
Ответы:
{key}
""")
        else:
            self.notes(s, f"""
ОТВЕТЫ, {pr['source']} ({ru_minutes(self.t['pr_a'])}). Проверяем по цепочке: каждый студент читает одно предложение целиком.
{key}
""")

    # ---------------- 19. словообразование
    def s_wordform(self, show):
        d = self.d
        wf = d["wordform"]
        s = self.new_slide(self.kind("wordform", show))
        y0 = self.header(s, f"{ST_E} · СЛОВООБРАЗОВАНИЕ · {wf['source'].upper()}", wf["title"].upper(),
                         sub="Заполните таблицу по образцу первой строки.")
        head = wf["head"]
        nc = len(head)
        rows_a, rows_t, hand, given, overlay = [], [], set(), [], []
        for ri, row in enumerate(wf["rows"]):
            q = list(row["q"])
            if row.get("given"):
                rows_a.append(q + [""] * (nc - len(q)))
                rows_t.append(q + [""] * (nc - len(q)))
                given.append(ri)
                continue
            a = row.get("a", [])
            ca, ct = q[:], q[:]
            for k in range(nc - len(q)):
                val = a[k] if k < len(a) else ""
                ca.append(val)
                ct.append("…")
                hand.add((ri + 1, len(q) + k))
                overlay.append((ri + 1, len(q) + k, val))
            rows_a.append(ca)
            rows_t.append(ct)
        in_cells = show and self.mode != "АНИМАЦИЯ"
        # место под комментарий оставляем всегда, чтобы таблица не «прыгала» между заданием и ответом
        note = None
        note_h = 0.0
        if wf.get("note"):
            note = [P([R("Комментарий: ", F_BODY, 19, bold=True, color=RED), R(wf["note"], F_BODY, 19, italic=True, color=INK)], line=1.05)]
            note_h = min(1.2, measure(note, CW - 0.5, (0, 0, 0, 0)) + 0.25)
        avail = CB - y0 - (note_h + 0.22 if note else 0)
        widths = [CW / nc] * nc
        # геометрия считается по таблице с ответами: на слайде-задании и на слайде-ответе она одинаковая
        lay = self.table(s, M, y0, widths, head, rows_a, avail, body_pt=21, given_rows=given, hand_cells=hand,
                         fill_h=True, max_row=0.7, dry="layout")
        gf, th, rhs, _ = self.table(s, M, y0, widths, head, rows_a if in_cells else rows_t, avail,
                                    name="Таблица: словообразование", body_pt=21, given_rows=given,
                                    hand_cells=hand if in_cells else set(), blank_cells=set() if in_cells else hand, fixed=lay)
        if show:
            ans = self.answers_group(s)
            if self.mode == "АНИМАЦИЯ":
                for ri, ci, val in overlay:
                    cx0 = M + sum(widths[:ci]) + 0.03
                    cy0 = y0 + sum(rhs[:ri]) + 0.03
                    tb = self.text(ans, cx0, cy0, widths[ci] - 0.06, rhs[ri] - 0.06, [T(val, F_HAND, lay[0], color=RED)],
                                   anchor="m", inset=(0.07, 0.02, 0.07, 0.02), name=f"Ответ: {val}")
                    tb.fill.solid()
                    tb.fill.fore_color.rgb = rgb(CARD)
            if note:
                ny = y0 + th + 0.22
                self.card(ans, M, ny, CW, note_h, fill=PAPER2, line=None, name="Комментарий")
                self.text(ans, M + 0.25, ny + 0.1, CW - 0.5, note_h - 0.2, note, anchor="m", inset=(0, 0, 0, 0), name="Комментарий: текст")
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg("wordform", "exercises"))
        key = "\n".join(f"{r['q'][0]}: {', '.join(r.get('a', []))}" for r in wf["rows"] if not r.get("given"))
        if self.task_notes(show):
            self.notes(s, f"""
СЛОВООБРАЗОВАНИЕ: {wf['source']} ({ru_minutes(self.t['wf_t'])}). {wf['title']}. Организация: пары, заполняют таблицу в тетради по образцу первой строки.
{self.where_answers()}
Ответы:
{key}
{wf.get('note', '')}
""")
        else:
            self.notes(s, f"""
ОТВЕТЫ, {wf['source']} ({ru_minutes(self.t['wf_a'])}).
{key}
{wf.get('note', '')}
""")

    # ---------------- 20. верно или неверно
    def tf_layout(self, items, y0):
        """Варианты: 2×3 (штамп и исправление в строку), 3×2 (исправление под штампом), 1×6 (всё в строку)."""
        n = len(items)
        options = [("2colB", 2, math.ceil(n / 2), "col"), ("2col", 2, math.ceil(n / 2), "col"),
                   ("3col", 3, math.ceil(n / 3), "row"), ("1col", 1, n, "row")]
        best = None
        for name, cols, rows, order in options:
            cells = self.grid_cells(n, y0, CB, cols, rows, order, gx=0.3, gy=0.18 if cols == 1 else 0.22)
            cw, ch = cells[0][2], cells[0][3]
            iw = cw - 0.45
            for k in range(0, 6):
                ss, fs = 21 - k, 19 - k
                if fs < 16:
                    break
                need = 0.0
                for it in items:
                    st = [P([R("а) ", F_HEAD, ss + 1, bold=True), R(it["s"], F_BODY, ss)])]
                    fx = [P([R("→ ", F_BODY, fs, bold=True), R(it.get("fix", ""), F_HAND, fs)], line=0.95)]
                    if name == "2colB":
                        hs, bs = block_height(st, [[ss + 1, ss]], (iw - 1.8) * 0.98)
                        hs += 0.03
                        hf, bf = block_height(fx, [[fs, fs]], iw * 0.98) if it.get("fix") else (0, False)
                        need_i = 0.12 + max(hs, 0.55) + 0.05 + hf + 0.08
                    elif name == "2col":
                        hs, bs = block_height(st, [[ss + 1, ss]], iw * 0.98)
                        hs += 0.03
                        hf, bf = block_height(fx, [[fs, fs]], (iw - 1.85) * 0.98) if it.get("fix") else (0, False)
                        need_i = 0.12 + hs + 0.06 + max(0.5, hf) + 0.08
                    elif name == "3col":
                        hs, bs = block_height(st, [[ss + 1, ss]], iw * 0.98)
                        hs += 0.03
                        hf, bf = block_height(fx, [[fs, fs]], iw * 0.98) if it.get("fix") else (0, False)
                        need_i = 0.12 + hs + 0.06 + 0.5 + 0.05 + hf + 0.08
                    else:
                        hs, bs = block_height(st, [[ss + 1, ss]], 5.6 * 0.98)
                        hf, bf = block_height(fx, [[fs, fs]], (cw - 5.6 - 2.15) * 0.98) if it.get("fix") else (0, False)
                        need_i = max(hs, 0.5, hf) + 0.14
                    if bs or bf:
                        need_i += 9
                    need = max(need, need_i)
                if need <= ch:
                    if best is None or k < best[0]:
                        best = (k, name, cols, rows, order, ss, fs)
                    break
        if best is None:
            best = (9, "3col", 3, math.ceil(n / 3), "row", 18, 16)
            self.warn("верно/неверно: исправления не помещаются")
        return best

    def s_tf(self, show):
        d = self.d
        items = d["tf"]
        s = self.new_slide(self.kind("tf", show))
        src = d.get("tf_source", "упр. 2")
        y0 = self.header(s, f"{ST_F} · {src.upper()}", "ВЕРНО ИЛИ НЕВЕРНО?", sub="Если неверно, исправьте.")
        _, lay, cols, rows, order, ss, fs = self.tf_layout(items, y0)
        cells = self.grid_cells(len(items), y0, CB, cols, rows, order, gx=0.3, gy=0.18 if cols == 1 else 0.22)
        ans = self.answers_group(s) if show else None
        for i, (it, (x, y, cw, ch)) in enumerate(zip(items, cells)):
            self.card(s, x, y, cw, ch, bar="left", name=f"Утверждение {LETTERS[i]})")
            st = [P([R(f"{LETTERS[i]}) ", F_HEAD, ss + 1, bold=True, color=RED), R(it["s"], F_BODY, ss, color=DARK)], line=1.0)]
            sw = 5.6 if lay == "1col" else (cw - 0.45 - 1.8 if lay == "2colB" else cw - 0.45)
            hs = measure(st, sw, (0, 0, 0, 0)) + 0.03
            if lay == "1col":
                self.text(s, x + 0.28, y + 0.07, sw, ch - 0.14, st, anchor="m", inset=(0, 0, 0, 0),
                          name=f"Утверждение {LETTERS[i]}): текст", sizes=[[ss + 1, ss]])
            else:
                self.text(s, x + 0.28, y + 0.12, sw, hs, st, inset=(0, 0, 0, 0), name=f"Утверждение {LETTERS[i]}): текст",
                          sizes=[[ss + 1, ss]])
            if not show:
                continue
            word, col = ("ВЕРНО", GREEN) if it["a"] else ("НЕВЕРНО", RED)
            fx = [P([R("→ ", F_BODY, fs, bold=True, color=RED), R(it.get("fix", ""), F_HAND, fs, color=RED)], line=0.95)]
            if lay == "2colB":
                top_h = max(hs, 0.55)
                self.stamp(ans, x + cw - 0.15 - 0.85, y + 0.12 + top_h / 2, word, col, size=18, h=0.48)
                if not it["a"] and it.get("fix"):
                    fy = y + 0.12 + top_h + 0.05
                    self.text(ans, x + 0.28, fy, cw - 0.45, y + ch - 0.06 - fy, fx, inset=(0, 0, 0, 0),
                              name=f"Исправление {LETTERS[i]})", sizes=[[fs, fs]])
            elif lay == "2col":
                zy = y + 0.12 + hs + 0.06
                zh = y + ch - 0.08 - zy
                self.stamp(ans, x + 0.28 + 0.8, zy + min(zh, 0.9) / 2 if zh < 0.9 else zy + 0.3, word, col, size=18, h=0.48)
                if not it["a"] and it.get("fix"):
                    fx_x = x + 0.28 + 1.85
                    self.text(ans, fx_x, zy, x + cw - 0.17 - fx_x, zh, fx, anchor="t", inset=(0, 0, 0, 0),
                              name=f"Исправление {LETTERS[i]})", sizes=[[fs, fs]])
            elif lay == "3col":
                zy = y + 0.12 + hs + 0.06
                self.stamp(ans, x + 0.28 + 0.8, zy + 0.25, word, col, size=18, h=0.48)
                if not it["a"] and it.get("fix"):
                    self.text(ans, x + 0.28, zy + 0.55, cw - 0.45, y + ch - 0.08 - (zy + 0.55), fx, inset=(0, 0, 0, 0),
                              name=f"Исправление {LETTERS[i]})", sizes=[[fs, fs]])
            else:
                self.stamp(ans, x + 0.28 + 5.6 + 0.95, y + ch / 2, word, col, size=18, h=0.48)
                if not it["a"] and it.get("fix"):
                    fx_x = x + 0.28 + 5.6 + 1.95
                    self.text(ans, fx_x, y + 0.05, x + cw - 0.15 - fx_x, ch - 0.1, fx, anchor="m", inset=(0, 0, 0, 0),
                              name=f"Исправление {LETTERS[i]})", sizes=[[fs, fs]])
        if show:
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg("tf", "exercises"))
        key = "\n".join(f"{LETTERS[i]}) {it['s']} {'Верно.' if it['a'] else 'Неверно → ' + end(it.get('fix', ''))}"
                        for i, it in enumerate(items))
        if self.task_notes(show):
            self.notes(s, f"""
ВЕРНО ИЛИ НЕВЕРНО? ({src}, {ru_minutes(self.t['tf_t'])}). Этап «Проверка и игры»: 13 минут.
Организация: учитель читает утверждение, студенты показывают карточку «В» или «Н» (или поднимают руку); неверные утверждения исправляют устно.
{self.where_answers()}
Ответы:
{key}
""")
        else:
            self.notes(s, f"""
ОТВЕТЫ ({ru_minutes(self.t['tf_a'])}).
{key}
Попросите студентов исправить неверные утверждения полным предложением.
""")

    # ---------------- 21. подберите пары
    def s_match(self, show):
        d = self.d
        mt = d["match"]
        pairs = mt["pairs"]
        order = mt.get("order") or list(range(len(pairs)))
        s = self.new_slide(self.kind("match", show))
        title, sub = split_title(mt["title"])
        y0 = self.header(s, f"{ST_F} · {mt['source'].upper()}", title.upper(), sub=sub or "Соедините слово и значение.")
        n = len(pairs)
        gy = 0.16
        rh = (CB - y0 - gy * (n - 1)) / n
        lw, gap = 3.75, 1.75
        rx = M + lw + gap
        rw = W - M - rx
        pos = {pi: k for k, pi in enumerate(order)}
        ans = self.answers_group(s) if show else None
        left, right = [], []
        for i, (wd, mn) in enumerate(pairs):
            y = y0 + i * (rh + gy)
            self.card(s, M, y, lw, rh, bar="left", name=f"Слово {i + 1}")
            left.append(dict(cont=s, x=M + 0.28, y=y + 0.04, w=lw - 0.4, h=rh - 0.08,
                             paras=[P([R(f"{i + 1}. ", F_HEAD, 23, bold=True, color=RED), R(wd, F_BODY, 22, bold=True, color=DARK)])],
                             anchor="m", inset=(0, 0, 0, 0), name=f"Слово {i + 1}: {wd}"))
        for k, pi in enumerate(order):
            y = y0 + k * (rh + gy)
            self.card(s, rx, y, rw, rh, name=f"Значение {LETTERS[k]}")
            right.append(dict(cont=s, x=rx + 0.25, y=y + 0.04, w=rw - 0.4, h=rh - 0.08,
                              paras=[P([R(f"{LETTERS[k]}. ", F_HEAD, 23, bold=True, color=RED), R(pairs[pi][1], F_BODY, 22, color=INK)])],
                              anchor="m", inset=(0, 0, 0, 0), name=f"Значение {LETTERS[k]}: текст"))
        self.uniform(left)
        self.uniform(right)
        if show:
            for i in range(n):
                y = y0 + i * (rh + gy) + rh / 2
                shape_line(ans, M + lw + 0.12, y, M + lw + 1.05, y, color=RED, lw=2.5, arrow=True, name=f"Стрелка {i + 1}")
                self.text(ans, M + lw + 1.1, y - 0.36, 0.6, 0.72, [T(LETTERS[pos[i]], F_HAND, 26, color=RED, align="c")],
                          anchor="m", inset=(0, 0, 0, 0), fit=False, name=f"Буква {i + 1}")
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg("match", "exercises"))
        key = "\n".join(f"{i + 1}. {wd} → {LETTERS[pos[i]]} ({mn})" for i, (wd, mn) in enumerate(pairs))
        if self.task_notes(show):
            self.notes(s, f"""
ПОДБЕРИТЕ ПАРЫ ({mt['source']}, {ru_minutes(self.t['match_t'])}). Задание: {quote(mt['title'])}.
Организация: пары; кто первым соединил все слова, поднимает руку и читает ответы.
{self.where_answers()}
Ответы:
{key}
""")
        else:
            self.notes(s, f"""
ОТВЕТЫ ({ru_minutes(self.t['match_a'])}). Стрелка и буква показывают правильное значение.
{key}
Попросите составить предложение с одной из пар.
""")

    # ---------------- 22-28. квиз
    def s_quiz(self, qi, show):
        d = self.d
        q = d["quiz"][qi]
        total = len(d["quiz"])
        s = self.new_slide(self.kind(f"quiz-{qi + 1}", show), PAPER2)
        self.header(s, f"{ST_F} · КВИЗ · ВОПРОС {qi + 1} ИЗ {total}")
        self.text(s, M, TITLE_Y, CW, 1.45, [T(q["q"], F_BODY, 32, bold=True, color=DARK, line=1.0)], anchor="m",
                  inset=(0, 0, 0, 0), min_pt=24, name="Вопрос")
        gx = 0.35
        cw = (CW - 2 * gx) / 3
        cy, chh = 2.45, 3.05
        ans = self.answers_group(s) if show else None
        specs = []
        for i, opt in enumerate(q["o"]):
            x = M + i * (cw + gx)
            good = show and i == q["c"]
            self.card(s, x, cy, cw, chh, bar="top", name=f"Вариант {ABV[i]}")
            if good:
                shape_rect(ans, x - 0.06, cy - 0.06, cw + 0.12, chh + 0.12, fill=None, line=GREEN, lw=3, radius=0.16,
                           name="Рамка верного ответа")
            self.text(s, x + 0.3, cy + 0.12, 1.0, 1.25, [T(ABV[i], F_HEAD, 64, bold=True, color=RED)], inset=(0, 0, 0, 0),
                      fit=False, name=f"Буква {ABV[i]}")
            specs.append(dict(cont=s, x=x + 0.3, y=cy + 1.3, w=cw - 0.6, h=chh - 1.5,
                              paras=[T(opt, F_BODY, 26, color=DARK, line=1.0)], inset=(0, 0, 0, 0), min_pt=18,
                              name=f"Вариант {ABV[i]}: текст"))
            if good:
                self.stamp(ans, x + cw - 1.05, cy + 0.68, "ВЕРНО", GREEN, size=22, h=0.6)
        self.uniform(specs, min_pt=18)
        if show:
            why = [P([R("Почему: ", F_BODY, 21, bold=True, color=RED), R(q["e"], F_BODY, 21, color=DARK)], line=1.05)]
            self.card(ans, M, 5.78, CW, CB - 5.78, fill=CARD, line=LINE, name="Почему")
            self.text(ans, M + 0.3, 5.84, CW - 0.6, CB - 5.9, why, anchor="m", inset=(0, 0, 0, 0), name="Почему: текст")
            self.answers_tag(ans)
            self.finish_answers(s, ans)
        self.footer(s, self.pg("lesson"))
        right = f"{ABV[q['c']]}) {q['o'][q['c']]}"
        if self.task_notes(show):
            intro = (" Квиз: 7 минут на 7 вопросов. Организация: две команды или все вместе; студенты показывают ответ "
                     "на пальцах (1, 2, 3 = А, Б, В) или карточками.") if qi == 0 else ""
            self.notes(s, f"""
КВИЗ, ВОПРОС {qi + 1} ИЗ {total} ({ru_minutes(self.t['quiz_t'])}).{intro}
Прочитайте вопрос и варианты вслух, дайте 15-20 секунд на размышление.
{self.where_answers(one=True)}
Правильный ответ: {end(right)} Почему: {q['e']}
""")
        else:
            self.notes(s, f"""
ОТВЕТ ({ru_minutes(self.t['quiz_a'])}): {end(right)}
Почему: {q['e']}
Спросите: почему два других варианта не подходят? Команды получают по одному баллу за верный ответ.
""")

    # ---------------- 29. поём вместе
    def s_sing(self):
        s = self.new_slide("sing", DARK)
        self.header(s, f"{ST_G} · ПЕСНЯ", "ПОЁМ ВМЕСТЕ", dark=True)
        pw = 6.1
        self.placeholder(s, "АУДИО", M, CT, pw, CB - CT)
        x = M + pw + 0.6
        w = W - M - x
        steps = [("Читаем", f"текст хором по учебнику (с. {self.pg('lyrics')})"), ("Слушаем", "запись песни ещё раз"),
                 ("Поём", "вместе с записью: один куплет или припев")]
        sh = (CB - CT - 0.4) / 3
        specs = []
        for i, (a, b) in enumerate(steps):
            y = CT + i * (sh + 0.2)
            shape_rect(s, x, y + sh / 2 - 0.42, 0.84, 0.84, fill=ACC_DARK, kind=MSO_SHAPE.OVAL, name=f"Шаг {i + 1}: кружок")
            self.text(s, x, y + sh / 2 - 0.42, 0.84, 0.84, [T(str(i + 1), F_HEAD, 34, bold=True, color=DARK, align="c")],
                      anchor="m", inset=(0, 0, 0, 0), fit=False, name=f"Шаг {i + 1}: номер")
            specs.append(dict(cont=s, x=x + 1.1, y=y, w=w - 1.1, h=sh,
                              paras=[P([R(a.upper(), F_HEAD, 28, bold=True, color=ACC_DARK, spc=100)], after=2),
                                     T(b, F_BODY, 22, color=ON_DARK, line=1.0)], anchor="m", inset=(0, 0, 0, 0),
                              name=f"Шаг {i + 1}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("lyrics"), dark=True)
        self.notes(s, f"""
ПОЁМ ВМЕСТЕ ({ru_minutes(self.t['sing'])}). Этап «Говорим, поём, пишем»: 12 минут.
Шаг 1: читаем текст хором по учебнику (с. {self.pg('lyrics')}), медленно, с правильным ударением.
Шаг 2: слушаем запись ещё раз, студенты тихо подпевают.
Шаг 3: поём вместе с записью (хотя бы один куплет или припев). Никого не заставляйте петь соло.
{self.slot_note('АУДИО')}
""")

    # ---------------- 30. монолог
    def s_speaking(self):
        d = self.d
        s = self.new_slide("speaking")
        src = d.get("speaking_source", "упр. 7")
        y0 = self.header(s, f"{ST_G} · ГОВОРИМ · {src.upper()}", "МОНОЛОГ: 2-3 МИНУТЫ", sub="Выберите одно задание.")
        items = d["speaking"]
        n = len(items)
        gx = 0.3
        cw = (CW - gx * (n - 1)) / n
        ph = 1.32
        chh = CB - y0 - ph - 0.3
        specs = []
        for i, it in enumerate(items):
            x = M + i * (cw + gx)
            self.card(s, x, y0, cw, chh, bar="top", name=f"Задание {LETTERS[i]})")
            specs.append(dict(cont=s, x=x + 0.28, y=y0 + 0.22, w=cw - 0.56, h=chh - 0.4,
                              paras=[T(f"{LETTERS[i]})", F_HEAD, 28, bold=True, color=RED, after=4), T(it, F_BODY, 22, color=DARK, line=1.05)],
                              inset=(0, 0, 0, 0), name=f"Задание {LETTERS[i]}): текст"))
        self.uniform(specs)
        py = CB - ph
        shape_rect(s, M, py, CW, ph, fill=DARK, radius=0.12, name="Полезные фразы")
        self.text(s, M + 0.35, py + 0.12, CW - 0.7, 0.36, [T("ПОЛЕЗНЫЕ ФРАЗЫ", F_HEAD, 16, bold=True, color=ACC_DARK, spc=300)],
                  inset=(0, 0, 0, 0), fit=False)
        self.text(s, M + 0.35, py + 0.46, CW - 0.7, ph - 0.56, [T("  /  ".join(PHRASES), F_BODY, 21, italic=True, color=ON_DARK)],
                  anchor="m", inset=(0, 0, 0, 0), name="Полезные фразы: текст")
        self.footer(s, self.pg("speaking", "exercises"))
        lst = "\n".join(f"{LETTERS[i]}) {it}" for i, it in enumerate(items))
        self.notes(s, f"""
МОНОЛОГ ({src}, {ru_minutes(self.t['speaking'])}). Студенты выбирают одно задание из трёх.
{self.tip('speaking')}
Попросите использовать 2-3 полезные фразы с полосы внизу и 3 слова из словаря урока.
Задания:
{lst}
""")

    # ---------------- 31. дискуссия
    def s_discussion(self):
        d = self.d
        s = self.new_slide("discussion")
        y0 = self.header(s, f"{ST_G} · ВОПРОСЫ ДЛЯ ДИСКУССИИ", "ДИСКУССИЯ",
                         sub="Правильных и неправильных ответов нет: важно объяснить своё мнение.")
        self.grid_numbered(s, d["discussion"], y0, CB, "Вопрос")
        self.footer(s, self.pg("discussion"))
        qs = "\n".join(f"{i + 1}) {q}" for i, q in enumerate(d["discussion"]))
        self.notes(s, f"""
ДИСКУССИЯ ({ru_minutes(self.t['discussion'])}). Учебник, с. {self.pg('discussion')}, раздел «Вопросы для дискуссии».
Организация: группы по 3-4 человека; каждая группа выбирает один вопрос, обсуждает 2 минуты, затем один студент коротко рассказывает мнение группы (1 минута на все группы).
Вопросы:
{qs}
""")

    # ---------------- 32. письмо
    def s_writing(self):
        d = self.d
        s = self.new_slide("writing")
        src = d.get("writing_source", "упр. 8")
        y0 = self.header(s, f"{ST_G} · ПИШЕМ · {src.upper()}", "ПИСЬМО: 120-150 СЛОВ", sub="Выберите одну тему. Текст пишем дома.")
        items = d["writing"]
        lw = 7.6
        gy = 0.24
        chh = (CB - y0 - gy * (len(items) - 1)) / len(items)
        specs = []
        for i, it in enumerate(items):
            y = y0 + i * (chh + gy)
            self.card(s, M, y, lw, chh, bar="left", name=f"Тема {LETTERS[i]})")
            specs.append(dict(cont=s, x=M + 0.3, y=y + 0.08, w=lw - 0.5, h=chh - 0.16,
                              paras=[P([R(f"{LETTERS[i]}) ", F_HEAD, 24, bold=True, color=RED), R(it, F_BODY, 22, color=DARK)], line=1.05)],
                              anchor="m", inset=(0, 0, 0, 0), name=f"Тема {LETTERS[i]}): текст"))
        self.uniform(specs)
        self.letter_triangle(s, M + lw + 0.35, y0, W - M - (M + lw + 0.35), CB - y0)
        self.footer(s, self.pg("writing", "exercises"))
        lst = "\n".join(f"{LETTERS[i]}) {it}" for i, it in enumerate(items))
        self.notes(s, f"""
ПИСЬМО ({src}, в классе {ru_minutes(self.t['writing'])}). Учебник, с. {self.pg('writing', 'exercises')}.
Студенты выбирают тему; сам текст (120-150 слов) пишут дома, это часть домашнего задания.
Рисунок справа: фронтовое письмо-треугольник. Во время войны письма часто складывали треугольником, без конверта, а адрес писали на внешней стороне (об этом рассказывает урок 2 учебника).
Темы:
{lst}
""")

    def letter_triangle(self, s, x, y, w, h):
        """Фронтовое письмо-треугольник, нарисованное фигурами."""
        g = s.shapes.add_group_shape()
        g.name = "Рисунок: письмо-треугольник"
        tw = min(w - 0.1, 4.3)
        th = tw * 0.66
        cx = x + w / 2
        ty = y + (h - th - 0.55) / 2
        # лист, сложенный треугольником: длинная сторона сверху, вершина внизу
        tri = shape_rect(g, cx - tw / 2, ty, tw, th, fill=CARD, line=INK2, lw=2.0, kind=MSO_SHAPE.ISOSCELES_TRIANGLE, name="лист")
        tri.rotation = 180
        # заправленный уголок (клапан) и линии сгиба
        flap = shape_rect(g, cx - tw * 0.2, ty, tw * 0.4, th * 0.4, fill=PAPER2, line=INK2, lw=1.25,
                          kind=MSO_SHAPE.ISOSCELES_TRIANGLE, name="клапан")
        flap.rotation = 180
        shape_line(g, cx - tw * 0.2, ty + 0.02, cx, ty + th - 0.06, color=INK2, lw=0.75, dash=True, name="сгиб 1")
        shape_line(g, cx + tw * 0.2, ty + 0.02, cx, ty + th - 0.06, color=INK2, lw=0.75, dash=True, name="сгиб 2")
        # строки адреса слева и справа от клапана
        for k in range(3):
            f = 0.13 + 0.12 * k
            yy = ty + th * f
            x0 = cx - tw / 2 * (1 - f) + 0.2
            x1 = cx - tw * 0.2 * (1 - f) - 0.12
            shape_line(g, x0, yy, x1, yy, color=INK, lw=1.75, name=f"строка адреса {k + 1}")
        # штемпель полевой почты
        r = 0.95
        px, py = cx + tw * 0.24, ty + th * 0.04
        shape_rect(g, px, py, r, r, fill=None, line=RED, lw=2.0, kind=MSO_SHAPE.OVAL, name="штемпель")
        shape_rect(g, px + 0.12, py + 0.12, r - 0.24, r - 0.24, fill=None, line=RED, lw=0.75, kind=MSO_SHAPE.OVAL, name="штемпель 2")
        star(g, px + r / 2 - 0.17, py + r / 2 - 0.17, 0.34, RED, name="звёздочка")
        self.text(g, x, ty + th + 0.2, w, 0.42, [T("Фронтовое письмо-треугольник", F_BODY, 17, italic=True, color=INK2, align="c")],
                  inset=(0, 0, 0, 0), fit=False, name="подпись")

    # ---------------- 33. домашнее задание
    def s_homework(self):
        d = self.d
        hw = d["homework"]
        s = self.new_slide("homework")
        self.header(s, f"{ST_H} · ДОМАШНЕЕ ЗАДАНИЕ", "ДОМАШНЕЕ ЗАДАНИЕ")
        gx = 0.35
        lw = (CW - gx) * 0.56
        rw = CW - gx - lw
        specs = []
        for (x, w, title, items, col) in ((M, lw, "ОБЯЗАТЕЛЬНО", hw["required"], RED),
                                         (M + lw + gx, rw, "НА ВЫБОР", hw["optional"], INK2)):
            self.card(s, x, CT, w, CB - CT, bar="top", bar_color=col, name=f"Домашнее: {title.lower()}")
            paras = [T(title, F_HEAD, 24, bold=True, color=col, spc=200, after=10)]
            paras += [P([R(f"{i + 1}. ", F_HEAD, 23, bold=True, color=col), R(it, F_BODY, 22, color=DARK)], after=12, line=1.05)
                      for i, it in enumerate(items)]
            specs.append(dict(cont=s, x=x + 0.3, y=CT + 0.3, w=w - 0.6, h=CB - CT - 0.5, paras=paras, inset=(0, 0, 0, 0),
                              name=f"Домашнее: {title.lower()}: текст"))
        self.uniform(specs)
        self.footer(s, self.pg("homework"))
        req = "\n".join(f"{i + 1}) {it}" for i, it in enumerate(hw["required"]))
        opt = "\n".join(f"{i + 1}) {it}" for i, it in enumerate(hw["optional"]))
        self.notes(s, f"""
ДОМАШНЕЕ ЗАДАНИЕ ({ru_minutes(self.t['homework'])}). Этап «Итоги»: 3 минуты. Учебник, с. {self.pg('homework')}.
Обязательно:
{req}
На выбор (творческое задание):
{opt}
Попросите студентов записать задание в тетрадь или сфотографировать слайд.
""")

    # ---------------- 34. рефлексия 3-2-1
    def s_reflection(self):
        d = self.d
        kw = d["key_word"]
        s = self.new_slide("reflection", DARK)
        self.header(s, f"{ST_H} · РЕФЛЕКСИЯ «3-2-1»", "ЧТО МЫ УЗНАЛИ СЕГОДНЯ?", dark=True)
        cols = [("3", "новых слова", "запишите их с переводом"), ("2", "факта о песне", "что вас удивило?"),
                ("1", "вопрос", "что хотите узнать?")]
        gx = 0.3
        cw = (CW - 2 * gx) / 3
        y, hh = CT, 2.85
        specs = []
        for i, (num, a, b) in enumerate(cols):
            x = M + i * (cw + gx)
            shape_rect(s, x, y, cw, hh, fill=None, line=ACC_DARK, lw=1.25, radius=0.12, name=f"3-2-1: {num}")
            self.text(s, x + 0.25, y + 0.02, 1.3, 1.85, [T(num, F_HEAD, 100, bold=True, color=ACC_DARK)], inset=(0, 0, 0, 0),
                      fit=False, name=f"Цифра {num}")
            specs.append(dict(cont=s, x=x + 0.3, y=y + 1.65, w=cw - 0.6, h=hh - 1.8,
                              paras=[T(a, F_BODY, 26, bold=True, color=ON_DARK, after=4), T(b, F_BODY, 20, italic=True, color=LINE)],
                              inset=(0, 0, 0, 0), name=f"3-2-1: {num}: текст"))
        self.uniform(specs)
        ky = y + hh + 0.4
        self.card(s, M, ky, CW, CB - ky, fill=CARD, line=None, name="Ключевое слово: возврат")
        self.text(s, M + 0.35, ky + 0.12, 4.6, CB - ky - 0.24,
                  [T("КЛЮЧЕВОЕ СЛОВО", F_HEAD, 16, bold=True, color=RED, spc=300, after=0),
                   T(kw["word"], F_HAND, 40, color=RED, line=0.9)], anchor="m", inset=(0, 0, 0, 0), min_pt=24,
                  name="Ключевое слово")
        self.text(s, M + 5.1, ky + 0.12, CW - 5.4, CB - ky - 0.24,
                  [T(kw.get("q") or kw["line"], F_BODY, 22, color=DARK, line=1.05)], anchor="m", inset=(0, 0, 0, 0),
                  name="Ключевое слово: вопрос")
        self.footer(s, self.pg("lesson"), dark=True)
        self.notes(s, f"""
РЕФЛЕКСИЯ «3-2-1» ({ru_minutes(self.t['reflection'])}). Каждый студент записывает на листке: 3 новых слова, 2 факта о песне, 1 вопрос.
Организация: 1 минута на запись, затем 2-3 студента читают вслух. Листки можно собрать: вопросы студентов помогут начать следующий урок.
Вернитесь к ключевому слову «{kw['word']}» ({kw['gloss']}): {kw.get('q') or kw['line']}
Спасибо за урок!
""")


# ================================================================ запуск
def out_name(d):
    slug = re.sub(r"[^\w]+", "_", d["song"]).strip("_")
    return f"Урок_{d['n']:02d}_{slug}.pptx"


def build_lesson(n, mode, out_dir):
    path = os.path.join(CONTENT_DIR, f"lesson{n:02d}.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    les = Lesson(data, mode)
    prs = les.build()
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, out_name(data))
    prs.save(out)
    return out, les


def main():
    ap = argparse.ArgumentParser(description="Презентации для учителя к урокам учебника")
    ap.add_argument("lessons", nargs="*", default=["1"], help="номера уроков или all")
    ap.add_argument("--mode", default=ANSWER_MODE, help="ОТДЕЛЬНЫЙ_СЛАЙД (по умолчанию) или АНИМАЦИЯ")
    ap.add_argument("--out", default=OUT_DIR, help="папка для результата")
    ap.add_argument("--no-autofit", action="store_true", help="служебное: выключить «Сжимать текст при переполнении»")
    a = ap.parse_args()
    mode = {"separate": "ОТДЕЛЬНЫЙ_СЛАЙД", "animation": "АНИМАЦИЯ"}.get(a.mode.lower(), a.mode.upper())
    if mode not in ("ОТДЕЛЬНЫЙ_СЛАЙД", "АНИМАЦИЯ"):
        sys.exit("--mode: ОТДЕЛЬНЫЙ_СЛАЙД или АНИМАЦИЯ")
    BUILD_OPTS["autofit"] = not a.no_autofit
    if a.lessons == ["all"]:
        nums = sorted(int(re.search(r"(\d+)", os.path.basename(p)).group(1)) for p in glob.glob(os.path.join(CONTENT_DIR, "lesson*.json")))
    else:
        nums = [int(x) for x in a.lessons]
    missing = [k for k, v in MEAS.found.items() if v is None]
    for n in nums:
        out, les = build_lesson(n, mode, a.out)
        print(f"Урок {n}: {out} ({les.slide_no} слайдов, режим {mode})")
        for sl, cap in les.slots:
            print(f"   заглушка на слайде {sl}: {cap}")
        for w_ in les.warnings:
            print("   ВНИМАНИЕ:", w_)
    missing = [k for k, v in MEAS.found.items() if v is None]
    if missing:
        print("Шрифты не найдены, размеры текста оценены приблизительно:", ", ".join(f"{k[0]}{' bold' if k[1] else ''}{' italic' if k[2] else ''}" for k in missing))


if __name__ == "__main__":
    main()
