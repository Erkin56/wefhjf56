# -*- coding: utf-8 -*-
"""Сборка PDF-учебника «Турецкие глаголы движения без путаницы»."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Spacer,
                                Paragraph, PageBreak, NextPageTemplate)
from reportlab.lib.units import mm
from book.theme import *
import book.art as A

register_fonts()
import book.blocks as BL
S = BL.init_styles()
import book.figures as FG
from book.scene import Scene

TITLE = "Турецкие глаголы движения без путаницы"
SUBTITLE = ("Gelmek, gitmek, getirmek, götürmek и другие глаголы "
            "в схемах, рисунках и живых примерах")

RUNNING = {"name": ""}
PAGE_NAME = {}


# ---------------------------------------------------------------- страницы
def _frame(left):
    x = M_IN if left else M_OUT
    return Frame(x, M_BOT, COL_W, PAGE_H - M_TOP - M_BOT, id="main",
                 leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)


def deco(canvas, doc):
    """Колонтитул и номер страницы."""
    pn = canvas.getPageNumber()
    if pn <= 2:
        return
    canvas.saveState()
    odd = (pn % 2 == 1)
    lx = M_IN if odd else M_OUT
    rx = PAGE_W - (M_OUT if odd else M_IN)
    y = M_BOT - 7.4
    canvas.setStrokeColor(LINE_SOFT); canvas.setLineWidth(0.5)
    canvas.line(lx, y + 9.0, rx, y + 9.0)
    name = PAGE_NAME.get(pn, RUNNING["name"])
    if odd:
        A.txt(canvas, rx, y, str(pn), "Isb", 7.6, INK_SOFT, "r")
        if name:
            A.txt(canvas, lx, y, name, "I", 6.8, INK_FAINT, "l")
    else:
        A.txt(canvas, lx, y, str(pn), "Isb", 7.6, INK_SOFT, "l")
        if name:
            A.txt(canvas, rx, y, name, "I", 6.8, INK_FAINT, "r")
    canvas.restoreState()


def title_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(PANEL)
    canvas.rect(0, 0, PAGE_W, 196, stroke=0, fill=1)
    gy = 76.0
    A.ground(canvas, 24, PAGE_W - 24, gy, LINE)
    A.person(canvas, 66, gy, 46, 1, TO, "walk")
    A.arrow(canvas, 92, gy + 25, 176, gy + 25, TO, 2.7, hsize=1.1)
    A.txt(canvas, 134, gy + 33, "GELMEK", "Isb", 7.2, TO, "c", tracking=0.7)
    A.speaker(canvas, 204, gy, 46, -1, TO, None)
    A.person(canvas, 262, gy, 46, 1, FROM, "walk")
    A.arrow(canvas, 288, gy + 25, 320, gy + 25, FROM, 2.7, dash=[4.8, 3.4], hsize=1.1)
    A.txt(canvas, 304, gy + 33, "GİTMEK", "Isb", 7.2, FROM, "c", tracking=0.7)
    A.school(canvas, 358, gy, 44, None)

    x = M_IN
    A.txt(canvas, x, PAGE_H - 112, "ТУРЕЦКИЙ ЯЗЫК  ·  УРОВЕНЬ A1–B1", "Isb", 8.0, TO,
          "l", tracking=1.3)
    canvas.setFillColor(INK)
    canvas.setFont("Deb", 25.0)
    for i, ln in enumerate(["Турецкие глаголы", "движения", "без путаницы"]):
        canvas.drawString(x, PAGE_H - 146 - i * 30.5, ln)
    canvas.setStrokeColor(TO); canvas.setLineWidth(2.4)
    canvas.line(x, PAGE_H - 256, x + 46, PAGE_H - 256)
    canvas.setFillColor(INK_SOFT)
    canvas.setFont("I", 9.4)
    for i, ln in enumerate(["Gelmek, gitmek, getirmek, götürmek",
                            "и другие глаголы в схемах, рисунках",
                            "и живых примерах"]):
        canvas.drawString(x, PAGE_H - 278 - i * 14.2, ln)
    canvas.restoreState()


def build(story, out_path):
    doc = BaseDocTemplate(out_path, pagesize=(PAGE_W, PAGE_H),
                          leftMargin=M_IN, rightMargin=M_OUT,
                          topMargin=M_TOP, bottomMargin=M_BOT,
                          title=TITLE, subject="Турецкий язык: глаголы движения",
                          creator="", author="")
    doc.addPageTemplates([
        PageTemplate(id="title", frames=[_frame(True)], onPage=title_page),
        PageTemplate(id="odd", frames=[_frame(True)], onPage=deco),
        PageTemplate(id="even", frames=[_frame(False)], onPage=deco),
    ])
    doc.build(story)
    return doc


class SetRunning(Spacer):
    """Невидимый флоу, который меняет колонтитул."""

    def __init__(self, name):
        Spacer.__init__(self, 1, 0)
        self.name = name

    def draw(self):
        RUNNING["name"] = self.name
