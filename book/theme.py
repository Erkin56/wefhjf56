# -*- coding: utf-8 -*-
"""Единая визуальная система учебника: формат, цвета, шрифты, стили абзацев."""
import os
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ---------------------------------------------------------------- страница
PAGE_W, PAGE_H = A5                      # 148 x 210 mm
M_OUT   = 11.5 * mm                      # внешнее поле
M_IN    = 13.5 * mm                      # внутреннее (к корешку)
M_TOP   = 10.5 * mm
M_BOT   = 12.0 * mm
COL_W   = PAGE_W - M_OUT - M_IN          # ширина набора

# ---------------------------------------------------------------- цвета
INK        = HexColor("#1C2A33")   # основной текст
INK_SOFT   = HexColor("#5C6E7B")   # второстепенный текст
INK_FAINT  = HexColor("#93A3AE")
LINE       = HexColor("#D5DEE4")
LINE_SOFT  = HexColor("#E7EDF1")
PANEL      = HexColor("#F3F7F9")   # фон схем
PANEL_WARM = HexColor("#FBF6F0")
WHITE      = HexColor("#FFFFFF")

TO         = HexColor("#0B7A75")   # движение К ориентиру / внутрь / вверх
TO_SOFT    = HexColor("#D5E8E6")
TO_PALE    = HexColor("#EAF3F2")
FROM       = HexColor("#B4560B")   # движение ОТ ориентира / наружу / вниз
FROM_SOFT  = HexColor("#F7E3CE")
FROM_PALE  = HexColor("#FBF1E6")
NEUT       = HexColor("#6B7F8C")   # направление не противопоставляется
NEUT_SOFT  = HexColor("#DEE5EA")

OK         = HexColor("#136F3B")
OK_SOFT    = HexColor("#DDEEE2")
ERR        = HexColor("#AE2B20")
ERR_SOFT   = HexColor("#F6E0DD")

SLATE      = HexColor("#8A9AA6")   # нейтральные объекты на схемах
SLATE_SOFT = HexColor("#C9D4DB")
OBJ        = HexColor("#425663")   # дома, транспорт — тёмный контур

# ---------------------------------------------------------------- шрифты
FDIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "build", "fonts")
_FONTS = [
    ("I",    "Inter-Regular"),
    ("Il",   "Inter-Light"),
    ("Im",   "Inter-Medium"),
    ("Isb",  "Inter-SemiBold"),
    ("Ib",   "Inter-Bold"),
    ("Ieb",  "Inter-ExtraBold"),
    ("Ii",   "Inter-Italic"),
    ("Imi",  "Inter-MediumItalic"),
    ("Ibi",  "Inter-BoldItalic"),
    ("Dm",   "InterDisplay-Medium"),
    ("Dsb",  "InterDisplay-SemiBold"),
    ("Db",   "InterDisplay-Bold"),
    ("Deb",  "InterDisplay-ExtraBold"),
]

def register_fonts():
    for alias, fname in _FONTS:
        pdfmetrics.registerFont(TTFont(alias, os.path.join(FDIR, fname + ".ttf")))
    pdfmetrics.registerFontFamily("I", normal="I", bold="Ib", italic="Ii", boldItalic="Ibi")
    pdfmetrics.registerFontFamily("Im", normal="Im", bold="Isb", italic="Imi", boldItalic="Ibi")

# ---------------------------------------------------------------- стили абзацев
def build_styles():
    S = {}
    S["h1num"] = ParagraphStyle("h1num", fontName="Isb", fontSize=8.2, leading=10,
                                textColor=TO, spaceAfter=3.2, tracking=0)
    S["h1"] = ParagraphStyle("h1", fontName="Deb", fontSize=18.0, leading=20.4,
                             textColor=INK, spaceAfter=2.5)
    S["h1sub"] = ParagraphStyle("h1sub", fontName="I", fontSize=9.1, leading=12.6,
                                textColor=INK_SOFT, spaceAfter=0)
    S["h2"] = ParagraphStyle("h2", fontName="Db", fontSize=11.5, leading=13.6,
                             textColor=INK, spaceBefore=5.4, spaceAfter=2.2,
                             keepWithNext=1)
    S["h3"] = ParagraphStyle("h3", fontName="Isb", fontSize=9.3, leading=11.8,
                             textColor=TO, spaceBefore=5, spaceAfter=1.8,
                             keepWithNext=1)
    S["body"] = ParagraphStyle("body", fontName="I", fontSize=8.4, leading=11.0,
                               textColor=INK, spaceAfter=3.5, alignment=TA_LEFT,
                               hyphenationLang=None)
    S["bodys"] = ParagraphStyle("bodys", parent=S["body"], fontSize=8.1, leading=11.2,
                                textColor=INK_SOFT)
    S["lead"] = ParagraphStyle("lead", fontName="Im", fontSize=9.4, leading=13.2,
                               textColor=INK, spaceAfter=5.4)
    S["li"] = ParagraphStyle("li", parent=S["body"], leftIndent=10, bulletIndent=1.5,
                             spaceAfter=1.8)
    S["lis"] = ParagraphStyle("lis", parent=S["bodys"], leftIndent=10, bulletIndent=1.5,
                              spaceAfter=1.8)
    S["cap"] = ParagraphStyle("cap", fontName="Im", fontSize=7.6, leading=10.2,
                              textColor=INK_SOFT, alignment=TA_CENTER, spaceAfter=0)
    S["tr"] = ParagraphStyle("tr", fontName="Isb", fontSize=9.2, leading=12.0,
                             textColor=INK, spaceAfter=0.6)
    S["ru"] = ParagraphStyle("ru", fontName="I", fontSize=8.3, leading=10.8,
                             textColor=INK_SOFT, spaceAfter=0)
    S["note"] = ParagraphStyle("note", fontName="I", fontSize=8.2, leading=11.4,
                               textColor=INK, spaceAfter=0)
    S["notehd"] = ParagraphStyle("notehd", fontName="Isb", fontSize=8.0, leading=10.4,
                                 textColor=TO, spaceAfter=2.2)
    S["tblh"] = ParagraphStyle("tblh", fontName="Isb", fontSize=7.5, leading=9.4,
                               textColor=INK)
    S["tbl"] = ParagraphStyle("tbl", fontName="I", fontSize=7.9, leading=10.3,
                              textColor=INK)
    S["tbltr"] = ParagraphStyle("tbltr", fontName="Im", fontSize=7.9, leading=10.3,
                                textColor=INK)
    S["tblru"] = ParagraphStyle("tblru", fontName="I", fontSize=7.6, leading=10.0,
                                textColor=INK_SOFT)
    S["ttl"] = ParagraphStyle("ttl", fontName="Deb", fontSize=25, leading=27.5,
                              textColor=INK, alignment=TA_LEFT, spaceAfter=0)
    S["ttlsub"] = ParagraphStyle("ttlsub", fontName="I", fontSize=10.2, leading=14.6,
                                 textColor=INK_SOFT, alignment=TA_LEFT)
    S["toc"] = ParagraphStyle("toc", fontName="I", fontSize=8.6, leading=13.4,
                              textColor=INK, spaceAfter=0)
    S["tocb"] = ParagraphStyle("tocb", fontName="Isb", fontSize=8.6, leading=13.4,
                               textColor=INK, spaceAfter=0)
    S["qnum"] = ParagraphStyle("qnum", fontName="Isb", fontSize=8.0, leading=10.6,
                               textColor=TO)
    S["q"] = ParagraphStyle("q", fontName="I", fontSize=8.5, leading=11.6,
                            textColor=INK, spaceAfter=0)
    S["ans"] = ParagraphStyle("ans", fontName="I", fontSize=7.8, leading=10.4,
                              textColor=INK, spaceAfter=0)
    S["cheat_v"] = ParagraphStyle("cheat_v", fontName="Ib", fontSize=9.0, leading=10.6,
                                  textColor=INK, spaceAfter=0)
    S["cheat_t"] = ParagraphStyle("cheat_t", fontName="I", fontSize=7.3, leading=9.4,
                                  textColor=INK_SOFT, spaceAfter=0)
    S["cheat_e"] = ParagraphStyle("cheat_e", fontName="Im", fontSize=7.5, leading=9.6,
                                  textColor=TO, spaceAfter=0)
    return S
