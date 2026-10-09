# -*- coding: utf-8 -*-
"""Flowable-обёртка для схем: панель + рисунок + подпись."""
import re
from reportlab.platypus import Flowable
from reportlab.pdfbase import pdfmetrics
from book.theme import (INK, INK_SOFT, LINE, PANEL, WHITE, TO, FROM, NEUT)
import book.art as A


_TAG = re.compile(r"<[^>]+>")


def plain(s):
    """Снять простую HTML-разметку: такие блоки рисуются прямо на canvas."""
    return _TAG.sub("", s) if s else s


def wrap_text(s, font, size, maxw):
    s = plain(s)
    words, lines, cur = s.split(" "), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if pdfmetrics.stringWidth(t, font, size) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def wrap_text2(s, font, size, w_first, w_rest):
    """Перенос с разной шириной первой и последующих строк."""
    s = plain(s)
    words, lines, cur = s.split(" "), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        lim = w_first if not lines else w_rest
        if pdfmetrics.stringWidth(t, font, size) <= lim or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


class Scene(Flowable):
    """draw(c, W, H) рисует внутри панели шириной W и высотой H."""

    def __init__(self, draw, height, caption=None, sub=None, bg=PANEL, border=None,
                 radius=9, cap_gap=3.6, width=None, cap_size=8.1, sub_size=7.4,
                 cap_color=INK, sub_color=INK_SOFT, cap_font="Isb", keep=True,
                 pad_bottom=0.0):
        Flowable.__init__(self)
        self.drawfn = draw
        self.boxh = height
        self.caption = caption
        self.sub = sub
        self.bg = bg
        self.border = border
        self.radius = radius
        self.cap_gap = cap_gap
        self.fixedw = width
        self.cap_size = cap_size
        self.sub_size = sub_size
        self.cap_color = cap_color
        self.sub_color = sub_color
        self.cap_font = cap_font
        self.pad_bottom = pad_bottom

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        h = self.boxh
        self._cl, self._sl = [], []
        if self.caption:
            self._cl = wrap_text(self.caption, self.cap_font, self.cap_size, self.W - 14)
            h += self.cap_gap + len(self._cl) * (self.cap_size * 1.22)
        if self.sub:
            self._sl = wrap_text(self.sub, "I", self.sub_size, self.W - 14)
            h += (1.2 if self._cl else self.cap_gap) + len(self._sl) * (self.sub_size * 1.20)
        h += self.pad_bottom
        self.H = h
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        top = self.H - self.boxh
        c.saveState()
        if self.bg is not None:
            A.panel(c, 0, top, self.W, self.boxh, self.radius, self.bg, self.border)
        c.saveState()
        c.translate(0, top)
        self.drawfn(c, self.W, self.boxh)
        c.restoreState()
        y = top - self.cap_gap
        for ln in self._cl:
            y -= self.cap_size * 1.05
            A.txt(c, self.W / 2, y, ln, self.cap_font, self.cap_size, self.cap_color, "c")
            y -= self.cap_size * 0.23
        if self._sl:
            y -= 1.6 if self._cl else (self.cap_gap - 2)
            for ln in self._sl:
                y -= self.sub_size * 1.04
                A.txt(c, self.W / 2, y, ln, "I", self.sub_size, self.sub_color, "c")
                y -= self.sub_size * 0.23
        c.restoreState()


def pan2(c, W, H, gap=9.0, bg=PANEL, radius=9, border=None):
    """Две панели рядом. Возвращает (x0, w, x1) — левая и правая области."""
    w = (W - gap) / 2.0
    A.panel(c, 0, 0, w, H, radius, bg, border)
    A.panel(c, w + gap, 0, w, H, radius, bg, border)
    return 0.0, w, w + gap


def pan2v(c, W, H, gap=8.0, bg=PANEL, radius=9, border=None):
    """Две панели одна над другой. Возвращает (yb, h, yt)."""
    h = (H - gap) / 2.0
    A.panel(c, 0, 0, W, h, radius, bg, border)
    A.panel(c, 0, h + gap, W, h, radius, bg, border)
    return 0.0, h, h + gap


def ptitle(c, x, y, s, color=TO, size=7.0, align="c", font="Isb"):
    A.txt(c, x, y, s, font, size, color, align, tracking=0.5)


def vs_badge(c, x, y, r=10.0, color=INK_SOFT, s="≠"):
    c.setFillColor(WHITE); c.setStrokeColor(LINE); c.setLineWidth(0.9)
    c.circle(x, y, r, stroke=1, fill=1)
    A.txt(c, x, y - 3.4, s, "Isb", 9.0, color, "c")
