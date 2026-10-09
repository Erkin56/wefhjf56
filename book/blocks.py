# -*- coding: utf-8 -*-
"""Рендер содержательных блоков книги в flowable-ы ReportLab."""
from reportlab.platypus import (Paragraph, Spacer, Table, TableStyle, KeepTogether,
                                PageBreak, Flowable)
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from book.theme import *
import book.art as A
from book.scene import Scene, wrap_text, wrap_text2, plain
import book.figures as FG

S = None


def init_styles():
    global S
    S = build_styles()
    return S


# ------------------------------------------------------------------ врезки
class Band(Flowable):
    """Цветная врезка с заголовком и текстом (правило / предупреждение / совет)."""

    def __init__(self, title, body, accent=TO, bg=TO_PALE, width=None, size=7.8,
                 tsize=7.1, pad=7.0, icon=None):
        Flowable.__init__(self)
        self.title, self.body = title, body
        self.accent, self.bg = accent, bg
        self.fixedw, self.size, self.tsize, self.pad = width, size, tsize, pad
        self.icon = icon

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        inner = self.W - 2 * self.pad - 6
        self._tl = wrap_text(self.title, "Isb", self.tsize, inner) if self.title else []
        self._bl = []
        for para in self.body.split("\n"):
            self._bl.extend(wrap_text(para, "I", self.size, inner) if para else [""])
        h = self.pad * 2
        h += len(self._tl) * (self.tsize * 1.34)
        if self._tl and self._bl:
            h += 3.0
        h += len(self._bl) * (self.size * 1.36)
        self.H = max(h, 26)
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        A.panel(c, 0, 0, self.W, self.H, 7, self.bg)
        c.setFillColor(self.accent)
        p = c.beginPath()
        p.moveTo(0, 7); p.lineTo(0, self.H - 7)
        p.curveTo(0, self.H - 3, 1, self.H, 3.4, self.H)
        p.lineTo(3.4, 0)
        p.curveTo(1, 0, 0, 3, 0, 7)
        p.close()
        c.drawPath(p, fill=1, stroke=0)
        y = self.H - self.pad
        for ln in self._tl:
            y -= self.tsize * 1.05
            A.txt(c, self.pad + 6, y, ln, "Isb", self.tsize, self.accent, "l")
            y -= self.tsize * 0.29
        if self._tl and self._bl:
            y -= 3.0
        for ln in self._bl:
            y -= self.size * 1.10
            A.txt(c, self.pad + 6, y, ln, "I", self.size, INK, "l")
            y -= self.size * 0.32


class ExList(Flowable):
    """Примеры: турецкая строка + русский перевод, с тонкой линией слева."""

    def __init__(self, items, accent=TO, width=None, tsize=8.1, rsize=7.2, gap=2.2,
                 numbered=False, start=1, indent=11.0):
        Flowable.__init__(self)
        self.items = items
        self.accent = accent
        self.fixedw = width
        self.tsize, self.rsize, self.gap = tsize, rsize, gap
        self.numbered, self.start, self.indent = numbered, start, indent

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self._rows = []
        h = 0.0
        inner = self.W - self.indent - 4
        for i, (tr, ru) in enumerate(self.items):
            tl = wrap_text(tr, "Isb", self.tsize, inner)
            rl = wrap_text(ru, "I", self.rsize, inner) if ru else []
            hh = len(tl) * (self.tsize * 1.26) + len(rl) * (self.rsize * 1.22)
            self._rows.append((tl, rl, hh))
            h += hh + (self.gap if i else 0)
        self.H = h
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        c.setStrokeColor(self.accent); c.setLineWidth(1.5); c.setLineCap(1)
        c.line(1.0, 2.0, 1.0, self.H - 2.0)
        y = self.H
        for i, (tl, rl, hh) in enumerate(self._rows):
            if i:
                y -= self.gap
            for ln in tl:
                y -= self.tsize * 1.00
                A.txt(c, self.indent, y, ln, "Isb", self.tsize, INK, "l")
                y -= self.tsize * 0.26
            for ln in rl:
                y -= self.rsize * 0.97
                A.txt(c, self.indent, y, ln, "I", self.rsize, INK_SOFT, "l")
                y -= self.rsize * 0.25


class Mistake(Flowable):
    """Карточка типичной ошибки: НЕПРАВИЛЬНО / ПРАВИЛЬНО / ПОЧЕМУ."""

    def __init__(self, n, wrong, right, why, width=None):
        Flowable.__init__(self)
        self.n, self.wrong, self.right, self.why = n, wrong, right, why
        self.fixedw = width

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        inner = self.W - 40
        self._w = wrap_text(self.wrong, "Im", 8.1, inner)
        self._r = wrap_text(self.right, "Isb", 8.1, inner)
        self._pw = pdfmetrics.stringWidth("ПОЧЕМУ: ", "Isb", 7.2)
        self._y = wrap_text2(self.why, "I", 7.2, self.W - 24 - self._pw,
                             self.W - 24)
        self.H = (len(self._w) * 10.2 + len(self._r) * 10.2 + 2.0
                  + len(self._y) * 9.1 + 11.0)
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        y = self.H - 2
        A.txt(c, 0, y - 8.2, "%02d" % self.n, "Ieb", 9.0, INK_FAINT, "l")
        y -= 1.0
        for i, ln in enumerate(self._w):
            y -= 10.2
            if i == 0:
                A.txt(c, 22, y, "✗", "Isb", 8.4, ERR, "l")
            A.txt(c, 34, y, ln, "Im", 8.1, ERR, "l")
        y -= 2.0
        for i, ln in enumerate(self._r):
            y -= 10.2
            if i == 0:
                A.txt(c, 22, y, "✓", "Isb", 8.4, OK, "l")
            A.txt(c, 34, y, ln, "Isb", 8.1, OK, "l")
        y -= 3.0
        for i, ln in enumerate(self._y):
            y -= 9.1
            if i == 0:
                A.txt(c, 22, y, "ПОЧЕМУ:", "Isb", 7.2, INK_FAINT, "l")
                A.txt(c, 22 + self._pw, y, ln, "I", 7.2, INK, "l")
            else:
                A.txt(c, 22, y, ln, "I", 7.2, INK, "l")
        c.setStrokeColor(LINE_SOFT); c.setLineWidth(0.6)
        c.line(0, 1.5, self.W, 1.5)


class Dialog(Flowable):
    """Мини-диалог с пояснением выбора глагола."""

    def __init__(self, n, title, lines, why, width=None):
        Flowable.__init__(self)
        self.n, self.title, self.lines, self.why = n, title, lines, why
        self.fixedw = width

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        pad = 7.6
        inner = self.W - 2 * pad - 16
        self._rows = []
        h = pad + 11.0
        for who, tr, ru in self.lines:
            tl = wrap_text(tr, "Isb", 7.9, inner)
            rl = wrap_text(ru, "I", 7.1, inner)
            hh = len(tl) * 9.8 + len(rl) * 8.7 + 1.2
            self._rows.append((who, tl, rl, hh))
            h += hh
        self._why = wrap_text("Почему этот глагол? " + self.why, "I", 7.0,
                              self.W - 2 * pad - 2)
        h += 3.8 + len(self._why) * 8.7 + pad
        self.H = h
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        pad = 7.6
        A.panel(c, 0, 0, self.W, self.H, 8, PANEL)
        y = self.H - pad
        A.txt(c, pad, y - 7.2, "%02d" % self.n, "Ieb", 8.2, TO, "l")
        A.txt(c, pad + 17, y - 7.2, self.title.upper(), "Isb", 7.2, INK_SOFT, "l",
              tracking=0.4)
        y -= 13.2
        for who, tl, rl, hh in self._rows:
            for i, ln in enumerate(tl):
                y -= 9.8
                if i == 0:
                    A.txt(c, pad, y, who, "Ib", 7.9, TO if who == "—" else INK_FAINT, "l")
                A.txt(c, pad + 13, y, ln, "Isb", 7.9, INK, "l")
            for ln in rl:
                y -= 8.7
                A.txt(c, pad + 13, y, ln, "I", 7.1, INK_SOFT, "l")
            y -= 1.2
        y -= 2.4
        c.setStrokeColor(LINE); c.setLineWidth(0.6)
        c.line(pad, y + 2.0, self.W - pad, y + 2.0)
        for ln in self._why:
            y -= 8.7
            A.txt(c, pad, y, ln, "I", 6.9, INK_SOFT, "l")


class CheatRow(Flowable):
    """Строка финальной шпаргалки: глагол · стрелка · значение · модель · пример."""

    def __init__(self, verb, kind, ru, gov, ex, width=None, h=32.0):
        Flowable.__init__(self)
        self.verb, self.kind = plain(verb), kind
        self.ru, self.gov = plain(ru), plain(gov)
        self.ex = (plain(ex[0]), plain(ex[1]))
        self.fixedw, self.boxh = width, h

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self.H = self.boxh
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        col = {"to": TO, "from": FROM, "neut": NEUT}[self.kind]
        dash = [3.4, 2.4] if self.kind == "from" else []
        c.setStrokeColor(LINE_SOFT); c.setLineWidth(0.55)
        c.line(0, 0.5, self.W, 0.5)
        A.txt(c, 0, self.H - 13.0, self.verb, "Ib", 8.8, INK, "l")
        A.arrow(c, 0, self.H - 24.0, 26, self.H - 24.0, col, 1.9, dash=dash, hsize=0.72)
        A.txt(c, 74, self.H - 12.4, self.ru, "I", 7.4, INK_SOFT, "l")
        A.txt(c, 74, self.H - 22.4, self.gov, "Isb", 7.3, col, "l")
        A.txt(c, self.W, self.H - 12.4, self.ex[0], "Isb", 8.0, INK, "r")
        A.txt(c, self.W, self.H - 22.4, self.ex[1], "I", 7.1, INK_FAINT, "r")


class Pair(Flowable):
    """Компактная формула сравнения: A ↔ B."""

    def __init__(self, left, right, lsub, rsub, width=None, h=40.0):
        Flowable.__init__(self)
        self.l, self.r, self.ls, self.rs = left, right, lsub, rsub
        self.fixedw, self.boxh = width, h

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self.H = self.boxh
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        w = (self.W - 26) / 2
        A.panel(c, 0, 0, w, self.H, 7, TO_PALE)
        A.panel(c, w + 26, 0, w, self.H, 7, FROM_PALE)
        A.txt(c, w / 2, self.H - 16.0, self.l, "Ib", 10.4, TO, "c")
        A.txt(c, w / 2, self.H - 27.0, self.ls, "I", 6.9, INK_SOFT, "c")
        A.txt(c, w + 26 + w / 2, self.H - 16.0, self.r, "Ib", 10.4, FROM, "c")
        A.txt(c, w + 26 + w / 2, self.H - 27.0, self.rs, "I", 6.9, INK_SOFT, "c")
        A.txt(c, self.W / 2, self.H / 2 - 4.4, "↔", "Ib", 12.0, INK_FAINT, "c")


class HRule(Flowable):
    def __init__(self, width=None, color=LINE, lw=0.7, pad=0.0):
        Flowable.__init__(self); self.fixedw, self.color, self.lw, self.pad = width, color, lw, pad

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self.H = self.lw + self.pad
        return (self.W, self.H)

    def draw(self):
        self.canv.setStrokeColor(self.color); self.canv.setLineWidth(self.lw)
        self.canv.line(0, self.H / 2, self.W, self.H / 2)


# ------------------------------------------------------------------ таблицы
def make_table(head, rows, widths, align=None, head_bg=PANEL, fsize=7.7,
               hsize=7.2, pad=4.2, tr_cols=(), accent_cols=None):
    """Компактная таблица: заголовок + строки. widths — доли от ширины колонки."""
    total = COL_W
    cw = [w * total for w in widths]
    data = []
    if head:
        data.append([Paragraph("<b>%s</b>" % h, S["tblh"]) for h in head])
    for r in rows:
        cells = []
        for j, cell in enumerate(r):
            st = S["tbltr"] if j in tr_cols else S["tbl"]
            cells.append(Paragraph(cell, st))
        data.append(cells)
    t = Table(data, colWidths=cw, hAlign="LEFT")
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), pad),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), 2.8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.0),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE_SOFT),
        ("LINEBELOW", (0, -1), (-1, -1), 0.7, LINE),
    ]
    if head:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), head_bg),
                 ("LINEBELOW", (0, 0), (-1, 0), 0.8, LINE),
                 ("TOPPADDING", (0, 0), (-1, 0), 4.2),
                 ("BOTTOMPADDING", (0, 0), (-1, 0), 4.4)]
    if accent_cols:
        for j, col in accent_cols.items():
            cmds.append(("TEXTCOLOR", (j, 1 if head else 0), (j, -1), col))
    t.setStyle(TableStyle(cmds))
    return t


def two_col_examples(items, accent=TO, gap=10.0, tsize=7.6, rsize=6.9):
    """Два столбца примеров (турецкий + русский) — для раздела «100 примеров»."""
    w = (COL_W - gap) / 2.0
    half = (len(items) + 1) // 2
    left, right = items[:half], items[half:]
    rows = []
    for i in range(half):
        l = ExList(left[i:i + 1], accent, width=w, tsize=tsize, rsize=rsize, indent=14.0)
        r = (ExList(right[i:i + 1], accent, width=w, tsize=tsize, rsize=rsize, indent=14.0)
             if i < len(right) else Spacer(w, 1))
        rows.append([l, r])
    t = Table(rows, colWidths=[w, w], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, -1), gap),
        ("RIGHTPADDING", (1, 0), (1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1.6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.6),
    ]))
    return t


class ChapterHead(Flowable):
    def __init__(self, kicker, title, sub=None, width=None, accent=TO):
        Flowable.__init__(self)
        self.kicker, self.title, self.sub, self.accent = kicker, title, sub, accent
        self.fixedw = width

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self._t = wrap_text(self.title, "Deb", 17.5, self.W)
        self._s = wrap_text(self.sub, "I", 8.4, self.W - 6) if self.sub else []
        self.H = 10.0 + len(self._t) * 20.0 + (4.0 + len(self._s) * 11.2 if self._s else 0) + 3.0
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        y = self.H
        c.setFillColor(self.accent)
        c.rect(0, y - 3.0, 26, 2.6, stroke=0, fill=1)
        y -= 12.0
        A.txt(c, 0, y, self.kicker, "Isb", 7.4, self.accent, "l", tracking=0.9)
        for ln in self._t:
            y -= 19.2
            A.txt(c, 0, y, ln, "Deb", 17.5, INK, "l")
        if self._s:
            y -= 5.0
            for ln in self._s:
                y -= 10.9
                A.txt(c, 0, y, ln, "I", 8.4, INK_SOFT, "l")


class SectionHead(Flowable):
    def __init__(self, title, sub=None, width=None, accent=TO, size=15.0):
        Flowable.__init__(self)
        self.title, self.sub, self.accent, self.size = title, sub, accent, size
        self.fixedw = width

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self._t = wrap_text(self.title, "Deb", self.size, self.W)
        self._s = wrap_text(self.sub, "I", 8.5, self.W - 6) if self.sub else []
        self.H = len(self._t) * (self.size * 1.14) + (4.5 + len(self._s) * 11.0 if self._s else 0) + 13.5
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        y = self.H - 2.0
        for ln in self._t:
            y -= self.size * 1.08
            A.txt(c, 0, y, ln, "Deb", self.size, INK, "l")
            y -= self.size * 0.10
        if self._s:
            y -= 5.0
            for ln in self._s:
                y -= 11.0
                A.txt(c, 0, y, ln, "I", 8.5, INK_SOFT, "l")
        c.setStrokeColor(self.accent); c.setLineWidth(1.8)
        c.line(0, 3.5, 32, 3.5)


# ------------------------------------------------------------------ рендер DSL
def render(blocks):
    out = []
    for b in blocks:
        k = b[0]
        if k == "chapter":
            out.append(ChapterHead(b[1], b[2], b[3] if len(b) > 3 else None))
        elif k == "section":
            out.append(SectionHead(b[1], b[2] if len(b) > 2 else None,
                                   size=b[3] if len(b) > 3 else 15.0))
        elif k == "h2":
            out.append(Paragraph(b[1], S["h2"]))
        elif k == "h3":
            out.append(Paragraph(b[1], S["h3"]))
        elif k == "p":
            out.append(Paragraph(b[1], S["body"]))
        elif k == "ps":
            out.append(Paragraph(b[1], S["bodys"]))
        elif k == "lead":
            out.append(Paragraph(b[1], S["lead"]))
        elif k == "ul":
            for it in b[1]:
                out.append(Paragraph(it, S["li"], bulletText="•"))
            out.append(Spacer(1, 3.4))
        elif k == "uls":
            for it in b[1]:
                out.append(Paragraph(it, S["lis"], bulletText="•"))
            out.append(Spacer(1, 2.4))
        elif k == "fig":
            kw = b[2] if len(b) > 2 else {}
            out.append(FG.S(b[1], **kw))
            out.append(Spacer(1, 2.4))
        elif k == "ex":
            out.append(ExList(b[1], b[2] if len(b) > 2 else TO))
            out.append(Spacer(1, 3.2))
        elif k == "band":
            out.append(Band(b[1], b[2], b[3] if len(b) > 3 else TO,
                            b[4] if len(b) > 4 else TO_PALE))
            out.append(Spacer(1, 3.8))
        elif k == "warn":
            out.append(Band(b[1], b[2], FROM, PANEL_WARM))
            out.append(Spacer(1, 3.8))
        elif k == "note":
            out.append(Band(b[1], b[2], NEUT, PANEL))
            out.append(Spacer(1, 3.8))
        elif k == "table":
            out.append(make_table(b[1], b[2], b[3], **(b[4] if len(b) > 4 else {})))
            out.append(Spacer(1, 5.0))
        elif k == "pair":
            out.append(Pair(b[1], b[2], b[3], b[4]))
            out.append(Spacer(1, 5.4))
        elif k == "mistake":
            out.append(Mistake(b[1], b[2], b[3], b[4]))
            out.append(Spacer(1, 3.6))
        elif k == "dialog":
            out.append(Dialog(b[1], b[2], b[3], b[4]))
            out.append(Spacer(1, 4.6))
        elif k == "cheat":
            out.append(CheatRow(*b[1:]))
        elif k == "ex2":
            out.append(two_col_examples(b[1]))
            out.append(Spacer(1, 4.6))
        elif k == "q":
            out.append(QList(b[1], b[2] if len(b) > 2 else 1))
            out.append(Spacer(1, 7.0))
        elif k == "ans":
            out.append(AnsList(b[1], b[2] if len(b) > 2 else 1,
                               b[3] if len(b) > 3 else 2))
            out.append(Spacer(1, 7.0))
        elif k == "rule":
            out.append(HRule(pad=b[1] if len(b) > 1 else 0))
        elif k == "sp":
            out.append(Spacer(1, b[1]))
        elif k == "pb":
            out.append(PageBreak())
        elif k == "keep":
            out.append(KeepTogether(render(b[1])))
        else:
            raise ValueError("unknown block %r" % (k,))
    return out


class QList(Flowable):
    """Нумерованные задания."""

    def __init__(self, items, start=1, width=None, size=8.2, gap=3.8, numw=18.0,
                 accent=TO):
        Flowable.__init__(self)
        self.items, self.start = items, start
        self.fixedw, self.size, self.gap, self.numw = width, size, gap, numw
        self.accent = accent

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self._rows = []
        h = 0.0
        for i, it in enumerate(self.items):
            ls = wrap_text(it, "I", self.size, self.W - self.numw)
            hh = len(ls) * (self.size * 1.30)
            self._rows.append(ls)
            h += hh + (self.gap if i else 0)
        self.H = h
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        y = self.H
        for i, ls in enumerate(self._rows):
            if i:
                y -= self.gap
            first = True
            for ln in ls:
                y -= self.size * 1.04
                if first:
                    A.txt(c, 0, y, "%d." % (self.start + i), "Isb", self.size,
                          self.accent, "l")
                    first = False
                A.txt(c, self.numw, y, ln, "I", self.size, INK, "l")
                y -= self.size * 0.26


class AnsList(Flowable):
    """Ответы в несколько колонок."""

    def __init__(self, items, start=1, cols=2, width=None, size=7.6, gap=12.0,
                 numw=17.0):
        Flowable.__init__(self)
        self.items, self.start, self.cols = items, start, cols
        self.fixedw, self.size, self.gap, self.numw = width, size, gap, numw

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        cw = (self.W - self.gap * (self.cols - 1)) / self.cols
        self._cw = cw
        self._rows = [wrap_text(it, "I", self.size, cw - self.numw) for it in self.items]
        per = (len(self._rows) + self.cols - 1) // self.cols
        self._per = per
        hs = []
        for cidx in range(self.cols):
            chunk = self._rows[cidx * per:(cidx + 1) * per]
            hs.append(sum(len(r) * (self.size * 1.34) + 2.4 for r in chunk))
        self.H = max(hs) if hs else 0
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        for cidx in range(self.cols):
            x = cidx * (self._cw + self.gap)
            y = self.H
            chunk = self._rows[cidx * self._per:(cidx + 1) * self._per]
            n = self.start + cidx * self._per
            for k, ls in enumerate(chunk):
                first = True
                for ln in ls:
                    y -= self.size * 1.06
                    if first:
                        A.txt(c, x, y, "%d." % (n + k), "Isb", self.size, INK_FAINT, "l")
                        first = False
                    A.txt(c, x + self.numw, y, ln, "I", self.size, INK, "l")
                    y -= self.size * 0.28
                y -= 2.4


class Mark(Flowable):
    """Невидимая метка: запоминает номер страницы для оглавления."""

    def __init__(self, key, store):
        Flowable.__init__(self)
        self.key, self.store = key, store
        self.width = self.height = 0

    def wrap(self, aw, ah):
        return (0, 0)

    def draw(self):
        self.store[self.key] = self.canv.getPageNumber()


class TocRow(Flowable):
    def __init__(self, left, right, page, width=None, bold=False, h=14.6):
        Flowable.__init__(self)
        self.left, self.right, self.page = left, right, page
        self.fixedw, self.bold, self.boxh = width, bold, h

    def wrap(self, aw, ah):
        self.W = self.fixedw or aw
        self.H = self.boxh
        return (self.W, self.H)

    def draw(self):
        c = self.canv
        y = 4.0
        f = "Isb" if self.bold else "I"
        A.txt(c, 0, y, self.left, f, 8.6, INK, "l")
        lw = pdfmetrics.stringWidth(self.left, f, 8.6)
        x = lw + 6
        if self.right:
            A.txt(c, x, y, self.right, "I", 8.0, INK_SOFT, "l")
            x += pdfmetrics.stringWidth(self.right, "I", 8.0) + 6
        pstr = str(self.page) if self.page else ""
        pw = pdfmetrics.stringWidth(pstr, "Isb", 8.4)
        c.setStrokeColor(LINE); c.setLineWidth(0.5)
        c.setDash([0.8, 2.6]); c.setLineCap(1)
        if self.W - pw - 6 > x + 4:
            c.line(x + 2, y + 2.2, self.W - pw - 6, y + 2.2)
        c.setDash()
        A.txt(c, self.W, y, pstr, "Isb", 8.4, INK, "r")
