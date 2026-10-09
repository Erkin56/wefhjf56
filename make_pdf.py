# -*- coding: utf-8 -*-
"""Финальная сборка учебника."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_book import *                                   # noqa
from reportlab.platypus import PageBreak, Spacer, NextPageTemplate, CondPageBreak
import book.blocks as BL
from book.blocks import Mark, TocRow, SectionHead

from book.content.front import INTRO
from book.content.ch01 import CH01
from book.content.ch02 import CH02, CH03, CH04
from book.content.ch05 import CH05, CH06, CH07, CH08, CH09, CH10
from book.content.ch11 import (CH11, CH12, CH13, CH14, CH15, CH16, CH17, CH18,
                               CH19, CH20)
from book.content.compare import COMPARE
from book.content.cases import CASES
from book.content.mistakes import MISTAKES
from book.content.dialogs import DIALOGS
from book.content.examples import EXAMPLES
from book.content.exercises import EXERCISES, ANSWERS_BLOCK
from book.content.cheat import CHEAT
from book.content.toc import ITEMS
from book.content.extra import EXTRA

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "Tureckie_glagoly_dvizheniya_bez_putanicy.pdf")

SECTIONS = [
    ("Введение", "Введение", INTRO),
    ("Глава 1", "Глава 1 · gelmek и gitmek", CH01),
    ("Глава 2", "Глава 2 · gelmek и dönmek", CH02),
    ("Глава 3", "Глава 3 · getirmek и götürmek", CH03),
    ("Глава 4", "Глава 4 · almak и götürmek", CH04),
    ("Глава 5", "Глава 5 · girmek и çıkmak", CH05),
    ("Глава 6", "Глава 6 · binmek и inmek", CH06),
    ("Глава 7", "Глава 7 · вверх и вниз", CH07),
    ("Глава 8", "Глава 8 · geçmek", CH08),
    ("Глава 9", "Глава 9 · yürümek и koşmak", CH09),
    ("Глава 10", "Глава 10 · sürmek", CH10),
    ("Глава 11", "Глава 11 · uçmak", CH11),
    ("Глава 12", "Глава 12 · dönmek", CH12),
    ("Глава 13", "Глава 13 · yaklaşmak и uzaklaşmak", CH13),
    ("Глава 14", "Глава 14 · varmak и ulaşmak", CH14),
    ("Глава 15", "Глава 15 · ayrılmak", CH15),
    ("Глава 16", "Глава 16 · taşınmak", CH16),
    ("Глава 17", "Глава 17 · gezmek", CH17),
    ("Глава 18", "Глава 18 · dolaşmak", CH18),
    ("Глава 19", "Глава 19 · kaçmak", CH19),
    ("Глава 20", "Глава 20 · карта глаголов", CH20),
    ("Не путай", "Не путай", COMPARE),
    ("Глагол + падеж", "Глагол + падеж", CASES),
    ("30 типичных ошибок", "30 типичных ошибок", MISTAKES),
    ("20 жизненных ситуаций", "20 жизненных ситуаций", DIALOGS),
    ("100 коротких примеров", "100 коротких примеров", EXAMPLES),
    ("Проверь себя", "Проверь себя", EXERCISES),
    ("Ответы", "Ответы", ANSWERS_BLOCK),
    ("Глаголы движения на двух страницах", "Шпаргалка", CHEAT),
]


def toc_story(pages):
    out = [SectionHead("Содержание", None, accent=TO, size=17.0), Spacer(1, 4)]
    for left, right in ITEMS:
        bold = left.startswith("Глава") or left in (
            "Не путай", "Проверь себя", "30 типичных ошибок")
        out.append(TocRow(left, right, pages.get(left, ""), bold=bold))
    return out


def make_story(pages, store):
    story = [NextPageTemplate("even"), PageBreak()]
    story += toc_story(pages)
    story += [NextPageTemplate(["odd", "even"]), PageBreak()]
    HARD = {"Введение", "Глава 1", "Глава 3", "Глава 6", "Глава 12", "Глава 20",
            "Не путай", "Глагол + падеж", "30 типичных ошибок",
            "20 жизненных ситуаций", "100 коротких примеров", "Проверь себя",
            "Ответы", "Глаголы движения на двух страницах"}
    for i, (key, running, blocks) in enumerate(SECTIONS):
        if i:
            if key in HARD:
                story.append(PageBreak())
            else:
                story.append(CondPageBreak(150))
                story.append(Spacer(1, 13))
        story.append(Mark(key, store))
        story.append(SetRunning(running))
        story += BL.render(list(blocks) + EXTRA.get(key, []))
    return story


PASS1 = {}
doc1 = build(make_story({}, PASS1), "/tmp/_pass1.pdf")
RUN_OF = {k: r for k, r, _ in SECTIONS}
starts = sorted((pg, key) for key, pg in PASS1.items())
import build_book as _bb
for i, (pg, key) in enumerate(starts):
    end = starts[i + 1][0] - 1 if i + 1 < len(starts) else 400
    for q in range(pg, end + 1):
        _bb.PAGE_NAME[q] = RUN_OF[key]
build(make_story(PASS1, {}), OUT)
print("PASS1 pages:", PASS1)
print("saved:", OUT)
