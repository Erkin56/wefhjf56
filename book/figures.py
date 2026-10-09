# -*- coding: utf-8 -*-
"""Реестр учебных схем. Каждая функция рисует одну схему в панели W x H."""
from math import sin, cos, pi
from book.theme import *
import book.art as A
from book.scene import Scene, pan2, pan2v, ptitle, vs_badge

FIGS = {}
GY = 34.0          # линия земли
PH = 46.0          # рост фигурки


def fig(name, h, caption=None, sub=None, **kw):
    def deco(f):
        FIGS[name] = (f, h, caption, sub, kw)
        return f
    return deco


def S(name, **over):
    f, h, cap, sub, kw = FIGS[name]
    k = dict(kw); k.update(over)
    return Scene(f, h, cap, sub, **k)


def _gr(c, W, y=GY, m=15):
    A.ground(c, m, W - m, y)


# ================================================================ ВВЕДЕНИЕ
@fig("legend", 142)
def _legend(c, W, H):
    x0 = 18
    ptitle(c, W / 2, H - 15, "УСЛОВНЫЕ ОБОЗНАЧЕНИЯ КНИГИ", INK_SOFT, 7.0)
    y = H - 42
    A.arrow(c, x0, y, x0 + 76, y, TO, 2.5)
    A.txt(c, x0 + 86, y - 2.6, "движение К ориентиру, внутрь, вверх", "I", 7.4, INK, "l")
    y -= 24
    A.arrow(c, x0, y, x0 + 76, y, FROM, 2.5, dash=[4.6, 3.2])
    A.txt(c, x0 + 86, y - 2.6, "движение ОТ ориентира, наружу, вниз", "I", 7.4, INK, "l")
    y -= 24
    A.arrow(c, x0, y, x0 + 76, y, NEUT, 2.3)
    A.txt(c, x0 + 86, y - 2.6, "направление не противопоставляется: важен способ", "I", 7.4, INK, "l")
    y -= 26
    A.pin(c, x0 + 12, y - 5, 15, TO)
    A.txt(c, x0 + 86, y - 2.6, "точка отсчёта: где находится говорящий", "I", 7.4, INK, "l")
    y -= 24
    A.point(c, x0 + 12, y + 1, "A", 8.0, INK)
    A.point(c, x0 + 40, y + 1, "B", 8.0, FROM, filled=True)
    A.txt(c, x0 + 86, y - 2.6, "A — откуда, B — куда", "I", 7.4, INK, "l")


@fig("ru_one_many", 138)
def _ru_one_many(c, W, H):
    bx, bw, bh = 16, 104, 40
    by = H / 2 - bh / 2 + 4
    A.panel(c, bx, by, bw, bh, 7, WHITE, LINE)
    A.txt(c, bx + bw / 2, by + bh / 2 + 1.0, "идти / ехать", "Isb", 9.4, INK, "c")
    A.txt(c, bx + bw / 2, by + bh / 2 - 9.6, "одно русское слово", "I", 6.4,
          INK_FAINT, "c")
    outs = [("gitmek", "от точки отсчёта", FROM_PALE, FROM),
            ("gelmek", "к точке отсчёта", TO_PALE, TO),
            ("yürümek", "пешком", PANEL, NEUT),
            ("binmek", "сесть в транспорт", PANEL, NEUT)]
    sx, sy = bx + bw + 3, by + bh / 2
    rh, rgap = 26.0, 4.0
    top = H - 12
    for i, (v, ru, bg, col) in enumerate(outs):
        yy = top - i * (rh + rgap) - rh
        A.arrow(c, sx, sy, 172, yy + rh / 2, col, 1.6, hsize=0.68)
        A.panel(c, 178, yy, W - 194, rh, 5, bg, None)
        A.txt(c, 188, yy + rh / 2 + 0.6, v, "Isb", 8.2, col, "l")
        A.txt(c, 188, yy + rh / 2 - 8.6, ru, "I", 6.5, INK_SOFT, "l")


@fig("viewpoint", 117)
def _viewpoint(c, W, H):
    xa, xb = 70, W - 70
    A.ground(c, 30, W - 30, GY + 6)
    A.house(c, xa, GY + 6, 44, "EV")
    A.school(c, xb, GY + 6, 56, "OKUL")
    A.person(c, W / 2 - 4, GY + 6, PH, 1, NEUT, "walk")
    A.pin(c, xa, GY + 44, 14, TO)
    A.txt(c, xa, GY + 66, "говорящий здесь", "Im", 6.3, TO, "c")
    A.arrow(c, W / 2 + 20, GY + 28, xb - 34, GY + 28, FROM, 2.3, dash=[4.6, 3.2],
            label="gidiyor", lab_bg=FROM_SOFT)
    A.pin(c, xb, GY + 48, 14, FROM)
    A.txt(c, xb, GY + 70, "говорящий здесь", "Im", 6.3, FROM, "c")
    A.arrow(c, xa + 32, GY + 60, W / 2 - 26, GY + 60, TO, 2.3,
            label="geliyor", lab_bg=TO_SOFT)
    A.txt(c, W / 2, 10, "Одно и то же движение — разный глагол: всё решает, где стоит говорящий.",
          "Im", 6.9, INK_SOFT, "c")


# ============================================ ГЛАВА 1. GELMEK / GİTMEK
@fig("gel_1", 123, "Ali buraya geliyor.", "Али идёт сюда.")
def _gel1(c, W, H):
    _gr(c, W)
    sx = W - 62
    A.speaker(c, sx, GY, PH, -1, TO, "ГОВОРЯЩИЙ")
    A.person(c, 56, GY, PH, 1, TO, "walk", label="ALİ", lab_color=INK_SOFT)
    A.arrow(c, 86, GY + 24, sx - 28, GY + 24, TO, 2.6, label="GELMEK", lab_bg=TO_SOFT,
            lab_size=6.8)
    A.chip(c, W / 2, H - 22, "движение К ТОЧКЕ ОТСЧЁТА", TO, TO_SOFT, 6.4)


@fig("git_1", 123, "Ali okula gidiyor.", "Али идёт в школу.")
def _git1(c, W, H):
    _gr(c, W)
    sx = 52
    A.speaker(c, sx, GY, PH, 1, FROM, "ГОВОРЯЩИЙ")
    A.person(c, 150, GY, PH, 1, FROM, "walk", label="ALİ", lab_color=INK_SOFT)
    A.school(c, W - 66, GY, 58, "OKUL")
    A.arrow(c, 178, GY + 24, W - 100, GY + 24, FROM, 2.6, dash=[4.6, 3.2],
            label="GİTMEK", lab_bg=FROM_SOFT, lab_size=6.8)
    A.chip(c, W / 2, H - 22, "движение ОТ ТОЧКИ ОТСЧЁТА", FROM, FROM_SOFT, 6.4)


@fig("gel_git_pair", 132, bg=None)
def _gelgit(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    for bx, lab, col in ((x0, "GELMEK", TO), (x1, "GİTMEK", FROM)):
        ptitle(c, bx + w / 2, H - 16, lab, col, 8.4)
    # left
    A.ground(c, x0 + 14, x0 + w - 14, 42)
    A.pin(c, x0 + w - 32, 86, 14, TO)
    A.person(c, x0 + w - 32, 42, 38, -1, TO, "stand")
    A.person(c, x0 + 32, 42, 38, 1, TO, "walk")
    A.arrow(c, x0 + 55, 60, x0 + w - 52, 60, TO, 2.4)
    A.txt(c, x0 + w / 2, 26, "к говорящему", "Im", 6.8, TO, "c")
    # right
    A.ground(c, x1 + 14, x1 + w - 14, 42)
    A.pin(c, x1 + 32, 86, 14, FROM)
    A.person(c, x1 + 32, 42, 38, 1, FROM, "stand")
    A.person(c, x1 + w - 36, 42, 38, 1, FROM, "walk")
    A.arrow(c, x1 + 55, 60, x1 + w - 56, 60, FROM, 2.4, dash=[4.6, 3.2])
    A.txt(c, x1 + w / 2, 26, "от говорящего", "Im", 6.8, FROM, "c")
    vs_badge(c, W / 2, H / 2 - 4, 10.5, INK_SOFT, "≠")


@fig("eve_geliyorum", 122, "Eve geliyorum.", "Я иду (еду) домой.")
def _eve_gel(c, W, H):
    _gr(c, W)
    A.house(c, W - 70, GY, 50, "EV")
    A.pin(c, W - 70, GY + 56, 14, TO)
    A.person(c, 62, GY, PH, 1, TO, "walk", label="BEN", lab_color=INK_SOFT)
    A.arrow(c, 92, GY + 24, W - 104, GY + 24, TO, 2.6, label="eve", lab_bg=TO_SOFT)
    A.txt(c, W - 70, GY + 78, "дом = точка отсчёта", "Im", 6.4, TO, "c")


@fig("okula_gidiyorum", 106, "Okula gidiyorum.", "Я иду (еду) в школу.")
def _okula_git(c, W, H):
    _gr(c, W)
    A.house(c, 56, GY, 44, "EV")
    A.pin(c, 56, GY + 50, 14, FROM)
    A.person(c, 148, GY, PH, 1, FROM, "walk", label="BEN", lab_color=INK_SOFT)
    A.school(c, W - 68, GY, 56, "OKUL")
    A.arrow(c, 176, GY + 24, W - 102, GY + 24, FROM, 2.6, dash=[4.6, 3.2],
            label="okula", lab_bg=FROM_SOFT)


@fig("sana_geliyorum", 125, "Sana geliyorum.", "Я иду (еду) к тебе.")
def _sana(c, W, H):
    _gr(c, W)
    A.person(c, 62, GY, PH, 1, TO, "walk", label="BEN", lab_color=INK_SOFT)
    A.person(c, W - 70, GY, PH, -1, SLATE, "stand", label="SEN", lab_color=INK_SOFT)
    A.pin(c, W - 70, GY + PH + 6, 14, TO)
    A.arrow(c, 92, GY + 24, W - 100, GY + 24, TO, 2.6, label="GELMEK", lab_bg=TO_SOFT)
    A.txt(c, W / 2, H - 16, "Точка отсчёта — там, где СОБЕСЕДНИК. Поэтому gelmek, а не gitmek.",
          "Im", 6.9, INK_SOFT, "c")


@fig("geliyorum_call", 142, "— Ayşe, yemek hazır! — Geliyorum!",
     "— Айше, еда готова! — Иду!")
def _gel_call(c, W, H):
    A.room(c, 14, GY - 2, 142, 62, "MUTFAK", "r")
    A.room(c, W - 150, GY - 2, 136, 62, "ODA", "l")
    A.person(c, 56, GY, 42, 1, TO, "wave", label="ANNE", lab_color=INK_SOFT)
    A.person(c, W - 62, GY, 42, -1, TO, "walk", label="AYŞE", lab_color=INK_SOFT)
    A.pin(c, 56, GY + 48, 13, TO)
    A.arrow(c, W - 92, GY + 22, 96, GY + 22, TO, 2.5, label="geliyorum", lab_bg=TO_SOFT)
    A.bubble(c, 106, H - 22, "Yemek hazır!", 7.0, tail="bl")
    A.txt(c, W / 2, 10, "По-русски «иду», по-турецки — gelmek: Айше движется К зовущему.",
          "Im", 6.8, INK_SOFT, "c")


@fig("bura_ora", 120)
def _bura_ora(c, W, H):
    y = H - 46
    A.pin(c, 66, y, 15, TO)
    A.txt(c, 66, y - 12, "BURASI", "Isb", 7.2, TO, "c")
    A.txt(c, 66, y - 22, "здесь", "I", 6.6, INK_SOFT, "c")
    A.point(c, W - 72, y + 6, "B", 9.5, FROM, filled=True)
    A.txt(c, W - 72, y - 12, "ORASI", "Isb", 7.2, FROM, "c")
    A.txt(c, W - 72, y - 22, "там", "I", 6.6, INK_SOFT, "c")
    A.arrow(c, W - 96, y + 18, 90, y + 18, TO, 2.4, label="buraya gel", lab_bg=TO_SOFT)
    A.arrow(c, 90, y - 38, W - 96, y - 38, FROM, 2.4, dash=[4.6, 3.2],
            label="oraya git", lab_bg=FROM_SOFT, lab_off=-7.0)
    A.txt(c, W / 2, 9, "buraya — сюда   ·   oraya — туда   ·   buradan — отсюда   ·   oradan — оттуда",
          "Im", 6.6, INK_SOFT, "c")


@fig("evden_eve", 138, bg=None)
def _evden_eve(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "EVDEN  GELİYORUM", TO, 7.6)
    ptitle(c, x1 + w / 2, H - 16, "EVE  GELİYORUM", TO, 7.6)
    A.ground(c, x0 + 14, x0 + w - 14, 44)
    A.house(c, x0 + 32, 44, 34, None)
    A.person(c, x0 + w - 42, 44, 36, 1, TO, "walk")
    A.pin(c, x0 + w - 24, 92, 13, TO)
    A.arrow(c, x0 + 54, 62, x0 + w - 58, 62, TO, 2.3)
    A.txt(c, x0 + w / 2, 30, "откуда: -DEN", "Isb", 6.8, TO, "c")
    A.txt(c, x0 + w / 2, 20, "Я иду из дома.", "I", 6.6, INK_SOFT, "c")
    A.ground(c, x1 + 14, x1 + w - 14, 44)
    A.person(c, x1 + 34, 44, 36, 1, TO, "walk")
    A.house(c, x1 + w - 36, 44, 34, None)
    A.pin(c, x1 + w - 36, 92, 13, TO)
    A.arrow(c, x1 + 56, 62, x1 + w - 60, 62, TO, 2.3)
    A.txt(c, x1 + w / 2, 30, "куда: -E", "Isb", 6.8, TO, "c")
    A.txt(c, x1 + w / 2, 20, "Я иду домой.", "I", 6.6, INK_SOFT, "c")


@fig("sen_git", 122, "Sen git, ben sonra gelirim.", "Ты иди, я потом приду.")
def _sen_git(c, W, H):
    _gr(c, W, GY)
    A.person(c, 54, GY, PH, 1, FROM, "stand", label="BEN", lab_color=INK_SOFT)
    A.person(c, 112, GY, PH, 1, FROM, "walk", label="SEN", lab_color=INK_SOFT)
    A.house(c, W - 64, GY, 48, "KAFE")
    A.pin(c, W - 64, GY + 54, 14, TO)
    A.arrow(c, 140, GY + 30, W - 98, GY + 30, FROM, 2.4, dash=[4.6, 3.2],
            label="sen git", lab_bg=FROM_SOFT)
    A.arrow(c, 78, GY + 58, W - 96, GY + 58, TO, 2.4, bulge=0.07,
            label="ben gelirim", lab_bg=TO_SOFT)
    A.txt(c, W / 2, 10, "Говорящий придёт туда, где будет собеседник, — поэтому gelmek.",
          "Im", 6.8, INK_SOFT, "c")


@fig("partiye", 126, "Partiye geliyor musun?", "Ты придёшь на вечеринку?")
def _partiye(c, W, H):
    _gr(c, W)
    A.house(c, W - 72, GY, 52, "PARTİ")
    A.pin(c, W - 72, GY + 58, 14, TO)
    A.txt(c, W - 72, GY + 80, "здесь буду я", "Im", 6.4, TO, "c")
    A.person(c, 60, GY, PH, 1, SLATE, "stand", label="SEN", lab_color=INK_SOFT)
    A.arrow(c, 90, GY + 24, W - 106, GY + 24, TO, 2.5, label="gelmek", lab_bg=TO_SOFT)
    A.txt(c, W / 2 - 10, H - 18, "Я буду там → для меня это движение КО МНЕ",
          "Im", 6.9, INK_SOFT, "c")


@fig("ankaraya", 110, "Yarın Ankara'ya gidiyorum.", "Завтра я еду в Анкару.")
def _ankaraya(c, W, H):
    A.city(c, 24, GY + 4, 84, 40, label="İSTANBUL")
    A.city(c, W - 110, GY + 4, 84, 40, label="ANKARA", seed=1)
    A.pin(c, 66, GY + 54, 14, FROM)
    A.arrow(c, 118, GY + 26, W - 118, GY + 26, FROM, 2.6, dash=[4.6, 3.2], bulge=0.10,
            label="gitmek", lab_bg=FROM_SOFT)
    A.txt(c, W / 2, GY - 16, "Говорящий сейчас в Стамбуле: Анкара — «другое место».",
          "Im", 6.8, INK_SOFT, "c")


# ============================================ ГЛАВА 2. GELMEK / DÖNMEK
@fig("geldim_dondum", 158, bg=None)
def _geldim_dondum(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "EVE GELDİM", TO, 8.0)
    ptitle(c, x1 + w / 2, H - 16, "EVE DÖNDÜM", TO, 8.0)
    A.ground(c, x0 + 14, x0 + w - 14, 50)
    A.person(c, x0 + 32, 50, 34, 1, TO, "walk")
    A.house(c, x0 + w - 38, 50, 36, "EV")
    A.arrow(c, x0 + 52, 66, x0 + w - 62, 66, TO, 2.3)
    A.txt(c, x0 + w / 2, 30, "просто прибыл домой", "Im", 6.6, INK_SOFT, "c")
    A.txt(c, x0 + w / 2, 20, "о начале пути ничего не сказано", "I", 6.2, INK_FAINT, "c")
    A.ground(c, x1 + 14, x1 + w - 14, 50)
    A.house(c, x1 + 32, 50, 34, "EV")
    A.school(c, x1 + w - 40, 50, 40, "İŞ")
    A.arrow(c, x1 + 54, 96, x1 + w - 62, 96, FROM, 2.0, dash=[4.0, 3.0], hsize=0.8)
    A.arrow(c, x1 + w - 62, 66, x1 + 54, 66, TO, 2.3, hsize=0.9)
    A.txt(c, x1 + w / 2, 30, "ушёл и вернулся обратно", "Im", 6.6, INK_SOFT, "c")
    A.txt(c, x1 + w / 2, 20, "возврат в ту же точку", "I", 6.2, INK_FAINT, "c")


@fig("donmek_cycle", 125, "Sabah işe gittim, akşam eve döndüm.",
     "Утром я ушёл на работу, вечером вернулся домой.")
def _don_cycle(c, W, H):
    A.ground(c, 24, W - 24, GY + 4)
    A.house(c, 62, GY + 4, 46, "EV")
    A.school(c, W - 72, GY + 4, 54, "İŞ")
    A.arrow(c, 96, GY + 56, W - 106, GY + 56, FROM, 2.4, dash=[4.6, 3.2], bulge=0.13,
            label="gitmek", lab_bg=FROM_SOFT)
    A.arrow(c, W - 106, GY + 22, 96, GY + 22, TO, 2.4, bulge=0.13,
            label="dönmek", lab_bg=TO_SOFT, lab_off=-7.0)
    A.txt(c, W / 2, 9, "dönmek = вернуться туда, откуда ушёл", "Im", 7.0, INK_SOFT, "c")


@fig("turkiyeye_dondu", 111, "Ailesi Türkiye'ye döndü.", "Его семья вернулась в Турцию.")
def _tr_don(c, W, H):
    A.city(c, 22, GY + 6, 78, 36, label="TÜRKİYE")
    A.city(c, W - 104, GY + 6, 78, 36, label="ALMANYA", seed=1)
    A.arrow(c, 110, GY + 54, W - 116, GY + 54, FROM, 2.0, dash=[4.0, 3.0], hsize=0.8,
            label="уехали раньше", lab_size=6.2, lab_color=INK_FAINT)
    A.arrow(c, W - 116, GY + 22, 110, GY + 22, TO, 2.5, label="döndü", lab_bg=TO_SOFT,
            lab_off=-7.0)
    A.txt(c, W / 2, 10, "Вернулись туда, откуда когда-то уехали.", "Im", 6.8, INK_SOFT, "c")


@fig("gel_don_pair", 136, bg=None)
def _gel_don(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 15, "GELMEK", TO, 8.0)
    ptitle(c, x1 + w / 2, H - 15, "DÖNMEK", TO, 8.0)
    A.txt(c, x0 + w / 2, H - 27, "прибыть в точку отсчёта", "I", 6.3, INK_SOFT, "c")
    A.txt(c, x1 + w / 2, H - 27, "вернуться в исходную точку", "I", 6.3, INK_SOFT, "c")
    A.ground(c, x0 + 16, x0 + w - 16, 42)
    A.point(c, x0 + 32, 56, "?", 8.4, INK_FAINT)
    A.house(c, x0 + w - 40, 42, 34)
    A.arrow(c, x0 + 48, 56, x0 + w - 62, 56, TO, 2.3)
    A.txt(c, x0 + w / 2, 26, "откуда — неважно", "I", 6.4, INK_FAINT, "c")
    A.ground(c, x1 + 16, x1 + w - 16, 42)
    A.house(c, x1 + 36, 42, 34)
    A.point(c, x1 + w - 34, 56, "B", 8.4, FROM, filled=True)
    A.arrow(c, x1 + 56, 76, x1 + w - 44, 76, FROM, 1.9, dash=[3.6, 2.8], hsize=0.75)
    A.arrow(c, x1 + w - 46, 54, x1 + 56, 54, TO, 2.3)
    A.txt(c, x1 + w / 2, 26, "сначала ушёл, потом вернулся", "I", 6.4, INK_FAINT, "c")


# ============================================ ГЛАВА 3. GETİRMEK / GÖTÜRMEK
@fig("getirmek_1", 125, "Bana su getir.", "Принеси мне воды.")
def _getir1(c, W, H):
    _gr(c, W)
    A.speaker(c, W - 60, GY, PH, -1, TO, "BANA (мне)")
    h = A.person(c, 66, GY, PH, 1, TO, "carry", carry="cup", label="SEN",
                 lab_color=INK_SOFT)
    A.arrow(c, 104, GY + 26, W - 92, GY + 26, TO, 2.6, label="GETİRMEK", lab_bg=TO_SOFT)
    A.chip(c, W / 2, H - 22, "человек + предмет  →  К ГОВОРЯЩЕМУ", TO, TO_SOFT, 6.4)


@fig("goturmek_1", 125, "Bu kitabı okula götür.", "Отнеси эту книгу в школу.")
def _gotur1(c, W, H):
    _gr(c, W)
    A.speaker(c, 50, GY, PH, 1, FROM, "BURASI")
    A.person(c, 148, GY, PH, 1, FROM, "carry", carry="book", label="SEN",
             lab_color=INK_SOFT)
    A.school(c, W - 64, GY, 54, "OKUL")
    A.arrow(c, 186, GY + 26, W - 96, GY + 26, FROM, 2.6, dash=[4.6, 3.2],
            label="GÖTÜRMEK", lab_bg=FROM_SOFT)
    A.chip(c, W / 2 - 6, H - 22, "человек + предмет  →  ОТ ГОВОРЯЩЕГО", FROM, FROM_SOFT, 6.4)


@fig("getir_gotur_pair", 150, bg=None)
def _gg_pair(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "GETİRMEK", TO, 8.4)
    ptitle(c, x1 + w / 2, H - 16, "GÖTÜRMEK", FROM, 8.4)
    A.ground(c, x0 + 14, x0 + w - 14, 46)
    A.person(c, x0 + 34, 46, 38, 1, TO, "carry", carry="box")
    A.pin(c, x0 + w - 30, 92, 13, TO)
    A.person(c, x0 + w - 30, 46, 38, -1, TO, "stand")
    A.arrow(c, x0 + 64, 62, x0 + w - 50, 62, TO, 2.3)
    A.txt(c, x0 + w / 2, 28, "предмет едет КО МНЕ", "Im", 6.7, TO, "c")
    A.ground(c, x1 + 14, x1 + w - 14, 46)
    A.pin(c, x1 + 26, 92, 13, FROM)
    A.person(c, x1 + 26, 46, 38, 1, FROM, "stand")
    A.person(c, x1 + w * 0.42, 46, 38, 1, FROM, "carry", carry="box")
    A.arrow(c, x1 + w * 0.42 + 30, 62, x1 + w - 14, 62, FROM, 2.3, dash=[4.4, 3.0])
    A.txt(c, x1 + w / 2, 28, "предмет едет ОТ МЕНЯ", "Im", 6.7, FROM, "c")
    vs_badge(c, W / 2, H / 2 - 6, 10.5, INK_SOFT, "≠")


@fig("getir_tri", 150, bg=None)
def _getir_tri(c, W, H):
    """Принести / привезти / привести — один глагол getirmek."""
    gap = 7.0
    w = (W - 2 * gap) / 3.0
    for i, (ttl, ru) in enumerate((("getirmek", "принести"), ("getirmek", "привезти"),
                                   ("getirmek", "привести"))):
        bx = i * (w + gap)
        A.panel(c, bx, 0, w, H, 9, TO_PALE)
        ptitle(c, bx + w / 2, H - 15, ttl.upper(), TO, 7.2)
        A.txt(c, bx + w / 2, H - 27, ru, "Im", 7.6, INK, "c")
    bx = 0
    A.ground(c, bx + 10, bx + w - 10, 40)
    A.person(c, bx + 26, 40, 34, 1, TO, "carry", carry="cup")
    A.pin(c, bx + w - 22, 76, 12, TO)
    A.arrow(c, bx + 50, 54, bx + w - 32, 54, TO, 2.1, hsize=0.85)
    A.txt(c, bx + w / 2, 20, "в руках", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Bana su getir.", "Im", 6.5, TO, "c")
    bx = w + gap
    A.ground(c, bx + 10, bx + w - 10, 40)
    A.car(c, bx + 34, 40, 42, 1, passenger=TO)
    A.pin(c, bx + w - 20, 76, 12, TO)
    A.arrow(c, bx + 60, 60, bx + w - 30, 60, TO, 2.1, hsize=0.85)
    A.txt(c, bx + w / 2, 20, "на машине", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Kitapları getirdim.", "Im", 6.5, TO, "c")
    bx = 2 * (w + gap)
    A.ground(c, bx + 10, bx + w - 10, 40)
    hand = (bx + 26 + 0.150 * 34, 40 + 0.470 * 34)
    A.person(c, bx + 26, 40, 34, 1, TO, "walk")
    ch = A.child(c, bx + 50, 40, 22, 1, TO, "walk")
    A.hold_hands(c, hand, ch, TO, 1.7)
    A.pin(c, bx + w - 20, 76, 12, TO)
    A.arrow(c, bx + 66, 58, bx + w - 30, 58, TO, 2.1, hsize=0.85)
    A.txt(c, bx + w / 2, 20, "человека", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Çocuğu getir.", "Im", 6.5, TO, "c")


@fig("gotur_tri", 150, bg=None)
def _gotur_tri(c, W, H):
    gap = 7.0
    w = (W - 2 * gap) / 3.0
    for i, (ttl, ru) in enumerate((("götürmek", "унести"), ("götürmek", "отвезти"),
                                   ("götürmek", "отвести"))):
        bx = i * (w + gap)
        A.panel(c, bx, 0, w, H, 9, FROM_PALE)
        ptitle(c, bx + w / 2, H - 15, ttl.upper(), FROM, 7.2)
        A.txt(c, bx + w / 2, H - 27, ru, "Im", 7.6, INK, "c")
    bx = 0
    A.ground(c, bx + 10, bx + w - 10, 40)
    A.pin(c, bx + 18, 76, 12, FROM)
    A.person(c, bx + w - 40, 40, 34, 1, FROM, "carry", carry="papers")
    A.arrow(c, bx + 26, 54, bx + w - 12, 54, FROM, 2.1, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, bx + w / 2, 20, "в руках", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Bunu götür.", "Im", 6.5, FROM, "c")
    bx = w + gap
    A.ground(c, bx + 10, bx + w - 10, 40)
    A.pin(c, bx + 16, 76, 12, FROM)
    A.car(c, bx + w - 34, 40, 42, 1, passenger=FROM)
    A.arrow(c, bx + 24, 60, bx + w - 10, 60, FROM, 2.1, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, bx + w / 2, 20, "на машине", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Eşyaları götürdü.", "Im", 6.5, FROM, "c")
    bx = 2 * (w + gap)
    A.ground(c, bx + 10, bx + w - 10, 40)
    A.pin(c, bx + 16, 76, 12, FROM)
    hand = (bx + w - 54 + 0.150 * 34, 40 + 0.470 * 34)
    A.person(c, bx + w - 54, 40, 34, 1, FROM, "walk")
    ch = A.child(c, bx + w - 30, 40, 22, 1, FROM, "walk")
    A.hold_hands(c, hand, ch, FROM, 1.7)
    A.arrow(c, bx + 24, 58, bx + w - 66, 58, FROM, 2.1, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, bx + w / 2, 20, "человека", "I", 6.3, INK_SOFT, "c")
    A.txt(c, bx + w / 2, 10, "Çocuğu götür.", "Im", 6.5, FROM, "c")


@fig("cocugu_getir", 107, "Çocuğu buraya getir.", "Приведи ребёнка сюда.")
def _cocuk_getir(c, W, H):
    _gr(c, W)
    A.speaker(c, W - 56, GY, PH, -1, TO, "BURAYA")
    hand = (66 + 0.150 * PH, GY + 0.470 * PH)
    A.person(c, 66, GY, PH, 1, TO, "walk", label="SEN", lab_color=INK_SOFT)
    ch = A.child(c, 100, GY, 30, 1, TO, "walk", label="ÇOCUK", lab_color=INK_SOFT)
    A.hold_hands(c, hand, ch, TO)
    A.arrow(c, 124, GY + 34, W - 86, GY + 34, TO, 2.5, label="getir", lab_bg=TO_SOFT)


@fig("cocugu_gotur", 90, "Çocuğu okula götürüyorum.", "Я отвожу ребёнка в школу.")
def _cocuk_gotur(c, W, H):
    _gr(c, W)
    A.pin(c, 34, GY + 34, 14, FROM)
    A.txt(c, 34, GY + 20, "EV", "Isb", 6.4, FROM, "c")
    hand = (110 + 0.150 * PH, GY + 0.470 * PH)
    A.person(c, 110, GY, PH, 1, FROM, "walk", label="BEN", lab_color=INK_SOFT)
    ch = A.child(c, 144, GY, 30, 1, FROM, "walk", label="ÇOCUK", lab_color=INK_SOFT)
    A.hold_hands(c, hand, ch, FROM)
    A.school(c, W - 64, GY, 54, "OKUL")
    A.arrow(c, 170, GY + 34, W - 96, GY + 34, FROM, 2.5, dash=[4.6, 3.2],
            label="götürüyorum", lab_bg=FROM_SOFT)


@fig("getir_gotur_formula", 118, bg=None)
def _gg_formula(c, W, H):
    A.panel(c, 0, H / 2 + 4, W, H / 2 - 4, 9, TO_PALE)
    A.panel(c, 0, 0, W, H / 2 - 4, 9, FROM_PALE)
    yh = H / 2 + 4 + (H / 2 - 4) / 2
    A.txt(c, 16, yh - 3.0, "GETİRMEK", "Ib", 10.5, TO, "l")
    A.txt(c, 110, yh + 4.0, "кто-то + предмет", "Im", 7.4, INK, "l")
    A.arrow(c, 110, yh - 6, 180, yh - 6, TO, 2.2, hsize=0.85)
    A.txt(c, 188, yh - 8.6, "К ТОЧКЕ ОТСЧЁТА", "Isb", 7.6, TO, "l")
    yl = (H / 2 - 4) / 2
    A.txt(c, 16, yl - 3.0, "GÖTÜRMEK", "Ib", 10.5, FROM, "l")
    A.txt(c, 110, yl + 4.0, "кто-то + предмет", "Im", 7.4, INK, "l")
    A.arrow(c, 110, yl - 6, 180, yl - 6, FROM, 2.2, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, 188, yl - 8.6, "ОТ ТОЧКИ ОТСЧЁТА", "Isb", 7.6, FROM, "l")


# ============================================ ГЛАВА 4. ALMAK / GÖTÜRMEK
@fig("almak_pickup", 88, "Çocuğu okuldan aldım.", "Я забрал ребёнка из школы.")
def _almak_pick(c, W, H):
    _gr(c, W)
    A.school(c, 62, GY, 54, "OKUL")
    A.person(c, 170, GY, PH, -1, TO, "walk", label="BEN", lab_color=INK_SOFT)
    ch = A.child(c, 140, GY, 30, -1, TO, "stand", label="ÇOCUK", lab_color=INK_SOFT)
    A.hold_hands(c, (170 - 0.150 * PH, GY + 0.470 * PH), ch, TO)
    A.pin(c, W - 50, GY + 30, 14, TO)
    A.arrow(c, 196, GY + 34, W - 70, GY + 34, TO, 2.5, label="almak", lab_bg=TO_SOFT)
    A.txt(c, W / 2, 10, "almak = взять объект СЕБЕ; дальше объект идёт со мной",
          "Im", 6.8, INK_SOFT, "c")


@fig("al_gotur_pair", 146, bg=None)
def _al_gotur(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "ALMAK", TO, 8.4)
    ptitle(c, x1 + w / 2, H - 16, "GÖTÜRMEK", FROM, 8.4)
    A.txt(c, x0 + w / 2, H - 28, "взять, забрать себе", "I", 6.4, INK_SOFT, "c")
    A.txt(c, x1 + w / 2, H - 28, "унести/отвезти в другое место", "I", 6.4, INK_SOFT, "c")
    A.ground(c, x0 + 14, x0 + w - 14, 44)
    A.house(c, x0 + 32, 44, 32)
    A.person(c, x0 + w - 42, 44, 36, -1, TO, "stand")
    A.arrow(c, x0 + 52, 60, x0 + w - 62, 60, TO, 2.2, hsize=0.85)
    A.txt(c, x0 + w / 2, 28, "Çantamı aldım.", "Im", 6.8, TO, "c")
    A.txt(c, x0 + w / 2, 18, "важно: объект теперь у меня", "I", 6.2, INK_FAINT, "c")
    A.ground(c, x1 + 14, x1 + w - 14, 44)
    A.person(c, x1 + 36, 44, 36, 1, FROM, "carry", carry="bag")
    A.house(c, x1 + w - 34, 44, 32)
    A.arrow(c, x1 + 62, 64, x1 + w - 56, 64, FROM, 2.2, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, x1 + w / 2, 28, "Çantamı götürdüm.", "Im", 6.8, FROM, "c")
    A.txt(c, x1 + w / 2, 18, "важно: объект уехал туда", "I", 6.2, INK_FAINT, "c")


@fig("beni_al", 99, "Beni de al. / Beni de götür.", "Забери и меня. / Возьми меня с собой.")
def _beni_al(c, W, H):
    _gr(c, W)
    A.car(c, 86, GY, 66, 1, passenger=TO, label="araba")
    A.person(c, 196, GY, PH, -1, NEUT, "wave", label="BEN", lab_color=INK_SOFT)
    A.arrow(c, 176, GY + 54, 122, GY + 54, TO, 2.2, hsize=0.85,
            label="al: сесть к тебе", lab_bg=TO_SOFT, lab_size=6.2)
    A.arrow(c, 210, GY + 20, W - 24, GY + 20, FROM, 2.2, dash=[4.0, 2.8], hsize=0.85,
            label="götür: увези меня туда", lab_bg=FROM_SOFT, lab_size=6.2, lab_off=-7.0)


# ============================================ ГЛАВА 5. GİRMEK / ÇIKMAK
@fig("girmek_1", 130, "Eve girdim.", "Я вошёл в дом.")
def _girmek(c, W, H):
    A.room(c, W / 2 - 24, GY - 2, 150, 66, "EV", "l")
    A.person(c, 64, GY, PH, 1, TO, "walk", label="DIŞARI", lab_color=INK_SOFT)
    A.arrow(c, 94, GY + 22, W / 2 + 18, GY + 22, TO, 2.6, label="GİRMEK", lab_bg=TO_SOFT)
    A.person(c, W / 2 + 56, GY, PH, 1, TO, "stand", label="İÇERİ", lab_color=INK_SOFT)
    A.chip(c, 86, H - 20, "снаружи → внутрь", TO, TO_SOFT, 6.4)


@fig("cikmak_1", 130, "Odadan çıktım.", "Я вышел из комнаты.")
def _cikmak(c, W, H):
    A.room(c, 14, GY - 2, 150, 66, "ODA", "r")
    A.person(c, 62, GY, PH, 1, FROM, "stand", label="İÇERİ", lab_color=INK_SOFT)
    A.arrow(c, 120, GY + 22, W - 96, GY + 22, FROM, 2.6, dash=[4.6, 3.2],
            label="ÇIKMAK", lab_bg=FROM_SOFT)
    A.person(c, W - 62, GY, PH, 1, FROM, "walk", label="DIŞARI", lab_color=INK_SOFT)
    A.chip(c, W - 90, H - 20, "изнутри → наружу", FROM, FROM_SOFT, 6.4)


@fig("gir_cik_pair", 150, bg=None)
def _gircik(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "GİRMEK", TO, 8.4)
    ptitle(c, x1 + w / 2, H - 16, "ÇIKMAK", FROM, 8.4)
    A.room(c, x0 + w - 74, 40, 64, 56, None, "l")
    A.person(c, x0 + 26, 40, 34, 1, TO, "walk")
    A.arrow(c, x0 + 46, 56, x0 + w - 64, 56, TO, 2.3)
    A.chip(c, x0 + w / 2, 18, "eve girmek   -E", TO, TO_SOFT, 6.6)
    A.room(c, x1 + 12, 40, 64, 56, None, "r")
    A.person(c, x1 + 36, 40, 34, 1, FROM, "stand")
    A.arrow(c, x1 + 82, 56, x1 + w - 24, 56, FROM, 2.3, dash=[4.4, 3.0])
    A.chip(c, x1 + w / 2, 18, "evden çıkmak   -DEN", FROM, FROM_SOFT, 6.6)
    vs_badge(c, W / 2, H / 2 - 4, 10.5, INK_SOFT, "≠")


@fig("iceri_disari", 101, "İçeri gir! / Dışarı çık!", "Заходи внутрь! / Выходи наружу!")
def _iceri(c, W, H):
    A.room(c, W / 2 - 46, GY - 4, 92, 62, None, None)
    A.txt(c, W / 2, GY + 26, "İÇERİ", "Isb", 8.0, TO, "c")
    A.txt(c, W / 2, GY + 14, "внутри", "I", 6.4, INK_SOFT, "c")
    A.txt(c, 46, GY + 26, "DIŞARI", "Isb", 8.0, FROM, "c")
    A.txt(c, 46, GY + 14, "снаружи", "I", 6.4, INK_SOFT, "c")
    A.txt(c, W - 46, GY + 26, "DIŞARI", "Isb", 8.0, FROM, "c")
    A.txt(c, W - 46, GY + 14, "снаружи", "I", 6.4, INK_SOFT, "c")
    A.arrow(c, 84, GY + 46, W / 2 - 52, GY + 46, TO, 2.3, label="gir", lab_bg=TO_SOFT,
            lab_size=6.2)
    A.arrow(c, W / 2 + 52, GY + 46, W - 84, GY + 46, FROM, 2.3, dash=[4.4, 3.0],
            label="çık", lab_bg=FROM_SOFT, lab_size=6.2)
    A.txt(c, W / 2, 10, "İçeri и dışarı — наречия: падежного окончания не требуют.",
          "Im", 6.8, INK_SOFT, "c")


# ============================================ ГЛАВА 6. BİNMEK / İNMEK
@fig("binmek_1", 136, "Otobüse bindim.", "Я сел в автобус.")
def _binmek(c, W, H):
    _gr(c, W, GY)
    A.bus(c, W - 104, GY, 104, -1, label="OTOBÜS", door_open=True)
    A.person(c, 58, GY, PH, 1, TO, "walk", label="BEN", lab_color=INK_SOFT)
    A.arrow(c, 88, GY + 24, W - 150, GY + 24, TO, 2.6, label="BİNMEK", lab_bg=TO_SOFT)
    A.chip(c, W / 2 - 30, H - 20, "ДАТЕЛЬНЫЙ ПАДЕЖ: otobüs + E", TO, TO_SOFT, 6.4)


@fig("inmek_1", 136, "Otobüsten indim.", "Я вышел из автобуса.")
def _inmek(c, W, H):
    _gr(c, W, GY)
    A.bus(c, 104, GY, 104, 1, label="OTOBÜS", door_open=True)
    A.person(c, W - 58, GY, PH, 1, FROM, "walk", label="BEN", lab_color=INK_SOFT)
    A.arrow(c, 150, GY + 24, W - 88, GY + 24, FROM, 2.6, dash=[4.6, 3.2],
            label="İNMEK", lab_bg=FROM_SOFT)
    A.chip(c, W / 2 + 30, H - 20, "ИСХОДНЫЙ ПАДЕЖ: otobüs + DEN", FROM, FROM_SOFT, 6.4)


@fig("bin_in_cases", 128, bg=None)
def _bin_in_cases(c, W, H):
    A.panel(c, 0, H / 2 + 4, W, H / 2 - 4, 9, TO_PALE)
    A.panel(c, 0, 0, W, H / 2 - 4, 9, FROM_PALE)
    yh = H / 2 + 4 + (H / 2 - 4) / 2
    A.arrow(c, 18, yh, 68, yh, TO, 2.4)
    A.txt(c, 80, yh + 2.5, "BİNMEK", "Ib", 10.0, TO, "l")
    A.txt(c, 80, yh - 8.5, "садиться НА / В транспорт", "I", 6.8, INK_SOFT, "l")
    A.chip(c, W - 16, yh - 6, "otobüsE  ·  arabayA  ·  uçağA", TO, WHITE, 6.8, align="r",
           border=TO_SOFT)
    yl = (H / 2 - 4) / 2
    A.arrow(c, 18, yl, 68, yl, FROM, 2.4, dash=[4.4, 3.0])
    A.txt(c, 80, yl + 2.5, "İNMEK", "Ib", 10.0, FROM, "l")
    A.txt(c, 80, yl - 8.5, "выходить ИЗ / С транспорта", "I", 6.8, INK_SOFT, "l")
    A.chip(c, W - 16, yl - 6, "otobüsTEN  ·  arabaDAN  ·  uçakTAN", FROM, WHITE, 6.8,
           align="r", border=FROM_SOFT)


@fig("transport_grid", 160, bg=None)
def _tgrid(c, W, H):
    gap = 7.0
    w = (W - 2 * gap) / 3.0
    h = (H - gap) / 2.0
    items = [("araba", "arabaya", "arabadan", A.car, 46),
             ("otobüs", "otobüse", "otobüsten", A.bus, 62),
             ("taksi", "taksiye", "taksiden", None, 46),
             ("tren", "trene", "trenden", A.train, 76),
             ("uçak", "uçağa", "uçaktan", A.plane, 62),
             ("bisiklet", "bisiklete", "bisikletten", A.bicycle, 44)]
    for i, (name, dat, abl, fn, sz) in enumerate(items):
        col, row = i % 3, i // 3
        bx = col * (w + gap)
        by = H - (row + 1) * h - row * gap
        A.panel(c, bx, by, w, h, 8, PANEL)
        cx = bx + w / 2
        if fn is A.plane:
            A.plane(c, cx, by + h * 0.62, sz, 1)
        elif fn is None:
            A.car(c, cx, by + h * 0.44, sz, 1, taxi=True)
        elif fn is A.train:
            A.train(c, cx, by + h * 0.44, sz, 1, label=None, rails=False)
        elif fn is A.bicycle:
            A.bicycle(c, cx, by + h * 0.44, sz, 1)
        elif fn is A.bus:
            A.bus(c, cx, by + h * 0.44, sz, 1, label=None)
        else:
            A.car(c, cx, by + h * 0.44, sz, 1)
        A.txt(c, cx, by + h - 13, name, "Isb", 7.6, INK, "c")
        A.txt(c, cx, by + 14.5, dat, "Isb", 7.0, TO, "c")
        A.txt(c, cx, by + 6.0, abl, "Isb", 7.0, FROM, "c")


@fig("durakta_in", 124, "Bir sonraki durakta ineceğim.", "Я выйду на следующей остановке.")
def _durakta(c, W, H):
    _gr(c, W, GY)
    A.bus(c, 92, GY, 96, 1, label=None, door_open=True)
    A.stop_sign(c, W - 74, GY, "DURAK")
    A.person(c, W - 128, GY, PH, 1, FROM, "walk")
    A.arrow(c, 148, GY + 54, W - 96, GY + 54, FROM, 2.3, dash=[4.4, 3.0],
            label="inmek", lab_bg=FROM_SOFT)
    A.chip(c, W / 2, H - 18, "durakTA inmek — МЕСТНЫЙ падеж: где именно выйти",
           NEUT, NEUT_SOFT, 6.4)


# ============================================ ГЛАВА 7. ВЕРТИКАЛЬ
@fig("merdiven", 150, bg=None)
def _merdiven(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "MERDİVENLERDEN ÇIKMAK", TO, 7.0)
    ptitle(c, x1 + w / 2, H - 16, "MERDİVENLERDEN İNMEK", FROM, 7.0)
    A.ground(c, x0 + 12, x0 + w - 12, 28, LINE_SOFT)
    A.stairs(c, x0 + 42, 28, 74, 44, 5, 1)
    A.person(c, x0 + 22, 28, 28, 1, TO, "walk")
    A.arrow(c, x0 + 46, 54, x0 + w - 36, 96, TO, 2.4, label="yukarı", lab_bg=TO_SOFT,
            lab_size=6.3, lab_off=9.0)
    A.txt(c, x0 + w / 2, 16, "вверх по лестнице", "Im", 6.6, TO, "c")
    A.ground(c, x1 + 12, x1 + w - 12, 28, LINE_SOFT)
    A.stairs(c, x1 + 14, 28, 74, 44, 5, -1)
    A.person(c, x1 + w - 24, 28, 28, -1, FROM, "walk")
    A.arrow(c, x1 + 18, 96, x1 + w - 44, 54, FROM, 2.4, dash=[4.4, 3.0], label="aşağı",
            lab_bg=FROM_SOFT, lab_size=6.3, lab_off=9.0)
    A.txt(c, x1 + w / 2, 16, "вниз по лестнице", "Im", 6.6, FROM, "c")


@fig("katlar", 150, "Üçüncü kata çıktım, sonra birinci kata indim.",
     "Я поднялся на третий этаж, потом спустился на первый.")
def _katlar(c, W, H):
    bx, bw = 62, 74
    fh = 0.30 * bw
    A.building(c, bx, 22, bw, 3, None, floor_labels=["1. kat", "2. kat", "3. kat"])
    ytop = 22 + fh * 2.62
    A.arrow(c, bx + 56, 28, bx + 56, ytop, TO, 2.5)
    A.txt(c, bx + 62, (28 + ytop) / 2 - 3, "çıkmak", "Isb", 7.0, TO, "l")
    A.arrow(c, bx + 104, ytop, bx + 104, 28, FROM, 2.5, dash=[4.4, 3.0])
    A.txt(c, bx + 110, (28 + ytop) / 2 - 3, "inmek", "Isb", 7.0, FROM, "l")
    px, pw = W - 130, 118
    py, ph = 18, H - 36
    A.panel(c, px, py, pw, ph, 8, WHITE, LINE)
    cx = px + pw / 2
    A.chip(c, cx, py + ph - 20, "-E çıkmak   (куда)", TO, TO_SOFT, 6.6)
    A.txt(c, cx, py + ph - 36, "üçüncü katA çıkmak", "Im", 7.0, INK, "c")
    A.txt(c, cx, py + ph - 46, "подняться на 3-й этаж", "I", 6.2, INK_FAINT, "c")
    A.chip(c, cx, py + ph - 70, "-DEN inmek   (откуда)", FROM, FROM_SOFT, 6.6)
    A.txt(c, cx, py + ph - 86, "üçüncü katTAN inmek", "Im", 7.0, INK, "c")
    A.txt(c, cx, py + ph - 96, "спуститься с 3-го этажа", "I", 6.2, INK_FAINT, "c")


@fig("asansor_dag", 142, bg=None)
def _asansor_dag(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 15, "ASANSÖRLE", INK_SOFT, 7.0)
    A.elevator(c, x0 + w / 2 - 17, 28, 34, 72, 0.62, floors=3)
    A.arrow(c, x0 + 30, 34, x0 + 30, 96, TO, 2.3, label="çıkmak", lab_off=15,
            lab_size=6.3)
    A.arrow(c, x0 + w - 30, 96, x0 + w - 30, 34, FROM, 2.3, dash=[4.4, 3.0],
            label="inmek", lab_off=15, lab_size=6.3)
    ptitle(c, x1 + w / 2, H - 15, "DAĞA", INK_SOFT, 7.0)
    A.mountain(c, x1 + 18, 30, w - 36, 56)
    A.person(c, x1 + 44, 44, 26, 1, TO, "walk")
    A.arrow(c, x1 + 30, 34, x1 + w * 0.46, 92, TO, 2.3, label="dağa çıkmak",
            lab_bg=TO_SOFT, lab_size=6.2)
    A.txt(c, x1 + w / 2, 16, "Dağa çıktık. — Мы поднялись на гору.", "Im", 6.4,
          INK_SOFT, "c")


# ============================================ ГЛАВА 8. GEÇMEK
@fig("gecmek_road", 132, "Caddeyi geçtim.", "Я перешёл улицу.")
def _gec_road(c, W, H):
    A.road_v(c, W / 2 - 22, 22, 86, 44, zebra=True)
    A.person(c, 62, GY + 6, PH, 1, TO, "walk")
    A.arrow(c, 92, GY + 28, W - 92, GY + 28, TO, 2.6, label="geçmek", lab_bg=TO_SOFT)
    A.person(c, W - 62, GY + 6, PH, 1, TO, "stand")
    A.chip(c, W / 2, H - 18, "cadde + Yİ  —  ВИНИТЕЛЬНЫЙ падеж", TO, TO_SOFT, 6.4)


@fig("gecmek_past", 128, "Araba yanımdan geçti.", "Машина проехала мимо меня.")
def _gec_past(c, W, H):
    _gr(c, W, GY)
    A.person(c, 58, GY, PH, 1, NEUT, "stand", label="BEN", lab_color=INK_SOFT)
    A.car(c, 190, GY, 64, 1)
    A.motion_lines(c, 152, GY + 16, 3, 13, 5, SLATE, 1, 1.5)
    A.arrow(c, 96, GY + 52, W - 36, GY + 52, NEUT, 2.4, label="geçti", lab_bg=NEUT_SOFT)
    A.chip(c, W / 2, H - 18, "yanım + DAN  —  ИСХОДНЫЙ падеж: мимо чего", NEUT,
           NEUT_SOFT, 6.4)


@fig("gecmek_door_route", 150, bg=None)
def _gec_dr(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "KAPIDAN GEÇMEK", NEUT, 7.2)
    A.doorway(c, x0 + w / 2, 36, 34, 54, NEUT)
    A.person(c, x0 + 26, 36, 32, 1, NEUT, "walk")
    A.arrow(c, x0 + 44, 52, x0 + w - 24, 52, NEUT, 2.3)
    A.txt(c, x0 + w / 2, 20, "пройти ЧЕРЕЗ дверь", "Im", 6.6, INK_SOFT, "c")
    ptitle(c, x1 + w / 2, H - 16, "ŞEHİRDEN GEÇMEK", NEUT, 7.2)
    A.city(c, x1 + w / 2 - 34, 44, 68, 34)
    A.arrow(c, x1 + 16, 58, x1 + w - 16, 58, NEUT, 2.3, bulge=0.16)
    A.txt(c, x1 + w / 2, 20, "маршрут идёт через город", "Im", 6.6, INK_SOFT, "c")


# ============================================ ГЛАВА 9. YÜRÜMEK / KOŞMAK
@fig("git_yuru", 152, bg=None)
def _git_yuru(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "GİTMEK", FROM, 8.6)
    A.txt(c, x0 + w / 2, H - 30, "NEREYE?  —  КУДА?", "Isb", 7.2, INK, "c")
    A.ground(c, x0 + 14, x0 + w - 14, 44)
    A.person(c, x0 + 30, 44, 32, 1, FROM, "walk")
    A.school(c, x0 + w - 36, 44, 40, "OKUL")
    A.arrow(c, x0 + 50, 60, x0 + w - 62, 60, FROM, 2.3, dash=[4.4, 3.0])
    A.txt(c, x0 + w / 2, 26, "Okula gidiyorum.", "Im", 7.0, INK, "c")
    A.txt(c, x0 + w / 2, 15, "способ не важен", "I", 6.3, INK_FAINT, "c")
    ptitle(c, x1 + w / 2, H - 16, "YÜRÜMEK", NEUT, 8.6)
    A.txt(c, x1 + w / 2, H - 30, "NASIL?  —  КАК?", "Isb", 7.2, INK, "c")
    A.ground(c, x1 + 14, x1 + w - 14, 44)
    A.person(c, x1 + 44, 44, 32, 1, NEUT, "walk")
    A.motion_lines(c, x1 + 30, 50, 3, 10, 4, SLATE, 1, 1.3)
    A.person(c, x1 + w - 48, 44, 32, 1, NEUT, "walk")
    A.motion_lines(c, x1 + w - 62, 50, 3, 10, 4, SLATE, 1, 1.3)
    A.txt(c, x1 + w / 2, 26, "Yürüyerek gidiyorum.", "Im", 7.0, INK, "c")
    A.txt(c, x1 + w / 2, 15, "иду именно пешком", "I", 6.3, INK_FAINT, "c")


@fig("kosmak", 100, "Otobüse yetişmek için koştum.", "Я побежал, чтобы успеть на автобус.")
def _kosmak(c, W, H):
    _gr(c, W, GY)
    A.person(c, 76, GY, PH, 1, NEUT, "run")
    A.motion_lines(c, 62, GY + 15, 4, 14, 5.5, SLATE, 1, 1.5)
    A.bus(c, W - 80, GY, 92, 1, label=None)
    A.arrow(c, 110, GY + 46, W - 128, GY + 46, NEUT, 2.4, label="koşmak",
            lab_bg=NEUT_SOFT)
    A.txt(c, W / 2, 10, "koşmak — это способ движения, а не его направление.",
          "Im", 6.8, INK_SOFT, "c")


# ============================================ ГЛАВА 10. SÜRMEK
@fig("surmek", 146, bg=None)
def _surmek(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "ARABA SÜRMEK / KULLANMAK", NEUT, 6.8)
    A.ground(c, x0 + 14, x0 + w - 14, 40)
    A.car(c, x0 + w / 2, 40, 76, 1, passenger=TO)
    A.arrow(c, x0 + 22, 80, x0 + w - 22, 80, NEUT, 2.2, hsize=0.85)
    A.txt(c, x0 + w / 2, 24, "я ЗА РУЛЁМ", "Isb", 7.2, TO, "c")
    A.txt(c, x0 + w / 2, 14, "Arabayı ben sürüyorum.", "Im", 6.5, INK_SOFT, "c")
    ptitle(c, x1 + w / 2, H - 16, "ARABAYA BİNMEK", NEUT, 6.8)
    A.ground(c, x1 + 14, x1 + w - 14, 40)
    A.car(c, x1 + w / 2 + 16, 40, 66, 1)
    A.person(c, x1 + 28, 40, 34, 1, TO, "walk")
    A.arrow(c, x1 + 46, 56, x1 + w / 2 - 6, 56, TO, 2.2, hsize=0.85)
    A.txt(c, x1 + w / 2, 24, "я САЖУСЬ в машину", "Isb", 7.2, TO, "c")
    A.txt(c, x1 + w / 2, 14, "Arabaya bindim.", "Im", 6.5, INK_SOFT, "c")


# ============================================ ГЛАВА 11. UÇMAK
@fig("ucmak", 138, "İstanbul'dan Ankara'ya uçuyorum.", "Я лечу из Стамбула в Анкару.")
def _ucmak(c, W, H):
    A.city(c, 20, 38, 72, 32, label="İSTANBUL")
    A.city(c, W - 96, 38, 72, 32, label="ANKARA", seed=1)
    A.arrow(c, 100, 84, W - 102, 84, NEUT, 2.3, bulge=0.14, dash=[5.0, 3.4])
    A.plane(c, W / 2, 116, 74, 1)
    A.chip(c, 56, 5, "-DAN  откуда", FROM, FROM_SOFT, 6.4)
    A.chip(c, W - 60, 5, "-A  куда", TO, TO_SOFT, 6.4)


# ============================================ ГЛАВА 12. DÖNMEK
@fig("eve_donmek", 122, "Akşam eve döndüm.", "Вечером я вернулся домой.")
def _eve_don(c, W, H):
    A.ground(c, 24, W - 24, GY)
    A.house(c, 62, GY, 46, "EV")
    A.point(c, W - 68, GY + 24, "B", 9.5, FROM, filled=True, sub="İŞ")
    A.uturn_arrow(c, 96, W - 92, GY + 56, TO, 2.4, 26, label="dönmek", lab_bg=TO_SOFT)
    A.txt(c, W / 2, 10, "Движение замыкает круг: я снова там, откуда вышел.",
          "Im", 6.8, INK_SOFT, "c")


@fig("geri_donmek", 103, "Yolu şaşırdık, geri döndük.", "Мы сбились с пути и повернули назад.")
def _geri_don(c, W, H):
    A.ground(c, 24, W - 24, GY)
    A.person(c, W - 42, GY, PH, -1, TO, "walk")
    A.arrow(c, 44, GY + 48, W - 74, GY + 48, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8,
            label="шли туда", lab_size=6.2, lab_color=INK_FAINT)
    A.arrow(c, W - 74, GY + 20, 44, GY + 20, TO, 2.5, label="geri dönmek",
            lab_bg=TO_SOFT, lab_off=-7.0)
    A.txt(c, W / 2, 10, "geri dönmek — повернуть назад, не дойдя до цели.",
          "Im", 6.8, INK_SOFT, "c")


@fig("saga_sola", 150, bg=None)
def _saga_sola(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "SAĞA DÖN", TO, 8.6)
    A.road_v(c, x0 + w / 2 - 16, 26, 68, 32)
    A.road_h(c, x0 + w / 2 - 16, 64, w / 2 + 24, 26)
    A.turn_arrow(c, x0 + w / 2, 34, 56, 1, TO, 2.8, 43)
    A.dot(c, x0 + w / 2, 32, 3.6, TO)
    A.txt(c, x0 + w / 2, 14, "направо", "Im", 6.8, INK_SOFT, "c")
    ptitle(c, x1 + w / 2, H - 16, "SOLA DÖN", FROM, 8.6)
    A.road_v(c, x1 + w / 2 - 16, 26, 68, 32)
    A.road_h(c, x1 + 12, 64, w / 2 + 20, 26)
    A.turn_arrow(c, x1 + w / 2, 34, 56, -1, FROM, 2.8, 43)
    A.dot(c, x1 + w / 2, 32, 3.6, FROM)
    A.txt(c, x1 + w / 2, 14, "налево", "Im", 6.8, INK_SOFT, "c")


# ============================================ ГЛАВА 13. YAKLAŞMAK / UZAKLAŞMAK
@fig("yaklas_uzaklas", 150, bg=None)
def _yak_uz(c, W, H):
    yb, h, yt = pan2v(c, W, H, 8)
    ptitle(c, 60, yt + h - 15, "YAKLAŞMAK", TO, 8.0, "c")
    A.txt(c, 60, yt + h - 27, "приближаться  -E", "I", 6.4, INK_SOFT, "c")
    A.person(c, 134, yt + 20, 34, 1, TO, "walk")
    A.house(c, W - 50, yt + 20, 38, None)
    A.arrow(c, 156, yt + 36, W - 78, yt + 36, TO, 2.4)
    A.dim_line(c, 158, W - 80, yt + 10, "расстояние уменьшается", INK_FAINT, 0.8, 3.2, 5.9)
    ptitle(c, 60, yb + h - 15, "UZAKLAŞMAK", FROM, 8.0, "c")
    A.txt(c, 60, yb + h - 27, "удаляться  -DEN", "I", 6.4, INK_SOFT, "c")
    A.house(c, 134, yb + 20, 38, None)
    A.person(c, W - 50, yb + 20, 34, 1, FROM, "walk")
    A.arrow(c, 158, yb + 36, W - 76, yb + 36, FROM, 2.4, dash=[4.4, 3.0])
    A.dim_line(c, 158, W - 80, yb + 10, "расстояние увеличивается", INK_FAINT, 0.8, 3.2, 5.9)


# ============================================ ГЛАВА 14. VARMAK / ULAŞMAK
@fig("varmak_line", 136, "Saat dokuzda İstanbul'a vardık.", "В девять часов мы прибыли в Стамбул.")
def _varmak(c, W, H):
    y = GY + 30
    A.ground(c, 24, W - 24, y - 18, LINE_SOFT, 1.0)
    A.point(c, 44, y, "A", 9.0, INK_FAINT, sub="начало")
    A.arrow(c, 60, y, W - 76, y, NEUT, 2.4, dash=[5.0, 3.4], label="yol — путь",
            lab_size=6.4, lab_color=INK_SOFT)
    A.point(c, W - 56, y, "B", 9.5, TO, filled=True, sub="varmak")
    A.chip(c, W / 2, H - 20, "varmak = точка, где путь ЗАКОНЧИЛСЯ", TO, TO_SOFT, 6.4)
    A.txt(c, W / 2, 12, "Важен сам момент прибытия, а не направление.", "Im", 6.8,
          INK_SOFT, "c")


@fig("gel_var_ulas", 150, bg=None)
def _gvu(c, W, H):
    gap = 7.0
    w = (W - 2 * gap) / 3.0
    data = [("GELMEK", "прийти сюда", "Eve geldim.", TO, TO_PALE),
            ("VARMAK", "добраться, прибыть", "Eve vardım.", TO, PANEL),
            ("ULAŞMAK", "достичь, дотянуться", "Eve ulaştım.", TO, PANEL)]
    notes = ["точка отсчёта — здесь", "важен момент прибытия",
             "путь был непростым"]
    for i, (v, ru, ex, col, bg) in enumerate(data):
        bx = i * (w + gap)
        A.panel(c, bx, 0, w, H, 9, bg)
        ptitle(c, bx + w / 2, H - 16, v, col, 7.8)
        A.txt(c, bx + w / 2, H - 29, ru, "Im", 6.8, INK, "c")
        A.ground(c, bx + 12, bx + w - 12, 46)
        A.house(c, bx + w - 26, 46, 30, None)
        if i == 0:
            A.person(c, bx + 24, 46, 30, 1, col, "walk")
            A.arrow(c, bx + 40, 60, bx + w - 44, 60, col, 2.1, hsize=0.8)
            A.pin(c, bx + w - 26, 84, 11, col)
        elif i == 1:
            A.arrow(c, bx + 16, 60, bx + w - 44, 60, col, 2.1, dash=[4.0, 2.6], hsize=0.8)
            A.dot(c, bx + w - 44, 60, 3.4, col)
            A.txt(c, bx + 18, 74, "09:00", "Isb", 6.4, INK_SOFT, "l")
        else:
            A.arrow(c, bx + 16, 58, bx + w - 46, 58, col, 2.1, bulge=0.20, hsize=0.8)
        A.txt(c, bx + w / 2, 30, ex, "Isb", 7.0, col, "c")
        A.txt(c, bx + w / 2, 14, notes[i], "I", 5.9, INK_FAINT, "c")


# ============================================ ГЛАВА 15. AYRILMAK
@fig("ayrilmak", 128, "Sabah sekizde otelden ayrıldık.", "В восемь утра мы выехали из отеля.")
def _ayrilmak(c, W, H):
    A.room(c, 16, GY - 2, 128, 64, "OTEL", "r")
    A.person(c, 62, GY, PH, 1, FROM, "carry2", carry="suitcase")
    A.arrow(c, 150, GY + 24, W - 48, GY + 24, FROM, 2.6, dash=[4.6, 3.2],
            label="ayrılmak", lab_bg=FROM_SOFT)
    A.pin(c, 62, GY + 46, 13, FROM)
    A.chip(c, W / 2 + 20, H - 18, "otel + DEN  —  ИСХОДНЫЙ падеж", FROM, FROM_SOFT, 6.4)
    A.txt(c, W / 2, 10, "Акцент на том, что мы покинули это место.", "Im", 6.8,
          INK_SOFT, "c")


@fig("ayril_cik", 142, bg=None)
def _ayril_cik(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "EVDEN ÇIKTIM", FROM, 7.6)
    A.room(c, x0 + 14, 40, 56, 50, None, "r")
    A.person(c, x0 + 86, 40, 32, 1, FROM, "walk")
    A.arrow(c, x0 + 74, 56, x0 + w - 18, 56, FROM, 2.2, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, x0 + w / 2, 26, "вышел за дверь", "Im", 6.7, INK_SOFT, "c")
    A.txt(c, x0 + w / 2, 16, "физическое пересечение границы", "I", 6.1, INK_FAINT, "c")
    ptitle(c, x1 + w / 2, H - 16, "EVDEN AYRILDIM", FROM, 7.6)
    A.room(c, x1 + 14, 40, 56, 50, None, "r")
    A.person(c, x1 + w - 40, 40, 32, 1, FROM, "carry2", carry="suitcase")
    A.arrow(c, x1 + 74, 56, x1 + w - 60, 56, FROM, 2.2, dash=[4.0, 2.8], hsize=0.85)
    A.txt(c, x1 + w / 2, 26, "покинул, уехал насовсем", "Im", 6.7, INK_SOFT, "c")
    A.txt(c, x1 + w / 2, 16, "акцент на расставании с местом", "I", 6.1, INK_FAINT, "c")


# ============================================ ГЛАВА 16. TAŞINMAK
@fig("tasinmak", 150, "Yeni bir eve taşınıyoruz.", "Мы переезжаем в новый дом.")
def _tasinmak(c, W, H):
    A.ground(c, 20, W - 20, GY)
    A.house(c, 52, GY, 44, "ESKİ EV")
    A.house(c, W - 56, GY, 48, "YENİ EV")
    A.boxes(c, W / 2 - 34, GY, 0.95)
    A.person(c, W / 2 + 28, GY, 40, 1, FROM, "carry", carry="box")
    A.arrow(c, 82, GY + 68, W - 84, GY + 68, FROM, 2.5, dash=[4.6, 3.2], bulge=0.08,
            label="taşınmak", lab_bg=FROM_SOFT)
    A.chip(c, W / 2, H - 16, "yeni evE taşınmak  —  ДАТЕЛЬНЫЙ падеж", TO, TO_SOFT, 6.4)
    A.txt(c, W / 2, 10, "Переезжают не «в гости», а жить: меняется место жизни.",
          "Im", 6.7, INK_SOFT, "c")


@fig("tasin_git", 136, bg=None)
def _tasin_git(c, W, H):
    x0, w, x1 = pan2(c, W, H, 10)
    ptitle(c, x0 + w / 2, H - 16, "İSTANBUL'A GİTTİM", FROM, 7.4)
    A.city(c, x0 + w / 2 - 32, 48, 64, 30)
    A.person(c, x0 + 24, 44, 30, 1, FROM, "carry2", carry="bag")
    A.arrow(c, x0 + 40, 36, x0 + w - 22, 36, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8)
    A.txt(c, x0 + w / 2, 20, "поехал — и, возможно, вернусь", "I", 6.3, INK_SOFT, "c")
    ptitle(c, x1 + w / 2, H - 16, "İSTANBUL'A TAŞINDIM", TO, 7.4)
    A.city(c, x1 + w / 2 - 32, 48, 64, 30)
    A.boxes(c, x1 + 16, 30, 0.72)
    A.arrow(c, x1 + 58, 36, x1 + w - 22, 36, TO, 2.1, hsize=0.8)
    A.txt(c, x1 + w / 2, 20, "переехал жить — остаюсь", "I", 6.3, INK_SOFT, "c")


# ============================================ ГЛАВА 17-18. GEZMEK / DOLAŞMAK
@fig("gezmek", 121, "Bütün gün İstanbul'u gezdik.", "Мы весь день гуляли по Стамбулу / осматривали Стамбул.")
def _gezmek(c, W, H):
    A.panel(c, 26, 26, W - 52, H - 48, 10, WHITE, LINE)
    A.txt(c, W / 2, H - 36, "İSTANBUL", "Isb", 7.2, INK_SOFT, "c")
    c.setStrokeColor(TO); c.setLineWidth(2.2); c.setLineCap(1); c.setDash([])
    p = c.beginPath()
    p.moveTo(60, 48)
    p.curveTo(84, 86, 116, 86, 136, 58)
    p.curveTo(154, 34, 192, 36, 208, 64)
    p.curveTo(224, 90, 258, 92, 274, 66)
    p.curveTo(284, 50, 292, 46, W - 58, 50)
    c.drawPath(p, fill=0, stroke=1)
    A.arrowhead(c, W - 58, 50, 0.97, 0.22, TO, 1.0)
    for (px, py) in ((60, 48), (136, 58), (208, 64), (274, 66)):
        c.setFillColor(WHITE); c.setStrokeColor(TO); c.setLineWidth(1.5)
        c.circle(px, py, 3.4, stroke=1, fill=1)
    A.person(c, 46, 40, 28, 1, TO, "walk")
    A.txt(c, W / 2, 14, "Движение ВНУТРИ места: важна не цель, а сам процесс.",
          "Im", 6.8, INK_SOFT, "c")


@fig("gez_dolas_yuru", 156, bg=None)
def _gdy(c, W, H):
    gap = 7.0
    w = (W - 2 * gap) / 3.0
    titles = [("GEZMEK", "осматривать, гулять"), ("DOLAŞMAK", "бродить, обходить"),
              ("YÜRÜMEK", "идти пешком")]
    for i, (v, ru) in enumerate(titles):
        bx = i * (w + gap)
        A.panel(c, bx, 0, w, H, 9, PANEL)
        ptitle(c, bx + w / 2, H - 16, v, TO if i == 0 else (NEUT if i == 2 else FROM), 7.6)
        A.txt(c, bx + w / 2, H - 28, ru, "I", 6.3, INK_SOFT, "c")
    # gezmek: точки-достопримечательности
    bx = 0
    c.setStrokeColor(TO); c.setLineWidth(2.0); c.setLineCap(1)
    pp = [(bx + 20, 52), (bx + 42, 78), (bx + 66, 56), (bx + 90, 82)]
    p = c.beginPath(); p.moveTo(*pp[0])
    for q in pp[1:]:
        p.lineTo(*q)
    c.drawPath(p, fill=0, stroke=1)
    for q in pp:
        c.setFillColor(WHITE); c.setStrokeColor(TO); c.setLineWidth(1.3)
        c.circle(q[0], q[1], 3.2, stroke=1, fill=1)
    A.txt(c, bx + w / 2, 34, "İstanbul'u gezdik.", "Im", 6.5, INK, "c")
    A.txt(c, bx + w / 2, 22, "по интересным местам", "I", 6.0, INK_FAINT, "c")
    A.txt(c, bx + w / 2, 11, "-İ  /  -DE", "Isb", 6.4, TO, "c")
    # dolaşmak: петля
    bx = w + gap
    c.setStrokeColor(FROM); c.setLineWidth(2.0)
    p = c.beginPath()
    p.moveTo(bx + 24, 52)
    p.curveTo(bx + 10, 90, bx + 50, 98, bx + 58, 74)
    p.curveTo(bx + 66, 50, bx + 96, 56, bx + 88, 84)
    c.drawPath(p, fill=0, stroke=1)
    A.arrowhead(c, bx + 88, 84, -0.3, 0.95, FROM, 0.95)
    A.txt(c, bx + w / 2, 34, "Sokaklarda dolaştık.", "Im", 6.5, INK, "c")
    A.txt(c, bx + w / 2, 22, "без маршрута, кругами", "I", 6.0, INK_FAINT, "c")
    A.txt(c, bx + w / 2, 11, "-DE  /  -İ", "Isb", 6.4, FROM, "c")
    # yürümek: прямая, ноги
    bx = 2 * (w + gap)
    A.ground(c, bx + 14, bx + w - 14, 56)
    A.person(c, bx + 30, 56, 30, 1, NEUT, "walk")
    A.motion_lines(c, bx + 18, 62, 3, 9, 4, SLATE, 1, 1.2)
    A.arrow(c, bx + 48, 72, bx + w - 18, 72, NEUT, 2.1, hsize=0.8)
    A.txt(c, bx + w / 2, 34, "Yarım saat yürüdük.", "Im", 6.5, INK, "c")
    A.txt(c, bx + w / 2, 22, "способ передвижения", "I", 6.0, INK_FAINT, "c")
    A.txt(c, bx + w / 2, 11, "-DE  /  -E kadar", "Isb", 6.4, NEUT, "c")


# ============================================ ГЛАВА 19. KAÇMAK
@fig("kacmak", 126, "Köpek bahçeden kaçtı.", "Собака убежала из сада.")
def _kacmak(c, W, H):
    A.room(c, 16, GY - 2, 124, 60, "BAHÇE", "r")
    A.person(c, W - 80, GY, PH, 1, FROM, "run")
    A.motion_lines(c, W - 108, GY + 16, 4, 15, 6, SLATE, 1, 1.5)
    A.arrow(c, 146, GY + 26, W - 44, GY + 26, FROM, 2.6, dash=[4.6, 3.2],
            label="kaçmak", lab_bg=FROM_SOFT)
    A.chip(c, W / 2 + 12, H - 18, "bahçe + DEN  —  ИСХОДНЫЙ падеж", FROM, FROM_SOFT, 6.4)


# ============================================ ГЛАВА 20. КАРТА
def _node(c, x, y, w, h, title, items, col, pale):
    A.panel(c, x, y, w, h, 7, pale, col, 0.8)
    A.txt(c, x + w / 2, y + h - 11.0, title, "Isb", 6.4, col, "c")
    for i, it in enumerate(items):
        A.txt(c, x + w / 2, y + h - 21.5 - i * 9.8, it, "Isb", 7.5, INK, "c")


@fig("map", 396, bg=None)
def _map(c, W, H):
    L = (("К ТОЧКЕ ОТСЧЁТА", ["gelmek", "getirmek"], TO, TO_PALE),
         ("ВНУТРЬ", ["girmek"], TO, TO_PALE),
         ("НА ТРАНСПОРТ", ["binmek"], TO, TO_PALE),
         ("ВВЕРХ", ["çıkmak"], TO, TO_PALE),
         ("ВОЗВРАЩЕНИЕ", ["dönmek"], TO, TO_PALE),
         ("ПРИБЛИЖЕНИЕ", ["yaklaşmak"], TO, TO_PALE),
         ("ПЕШКОМ / БЕГОМ", ["yürümek", "koşmak"], NEUT, PANEL),
         ("ПО МЕСТУ", ["gezmek", "dolaşmak"], NEUT, PANEL))
    R = (("ОТ ТОЧКИ ОТСЧЁТА", ["gitmek", "götürmek"], FROM, FROM_PALE),
         ("НАРУЖУ", ["çıkmak", "ayrılmak"], FROM, FROM_PALE),
         ("С ТРАНСПОРТА", ["inmek"], FROM, FROM_PALE),
         ("ВНИЗ", ["inmek"], FROM, FROM_PALE),
         ("ПРИБЫТИЕ", ["varmak", "ulaşmak"], TO, TO_PALE),
         ("УДАЛЕНИЕ", ["uzaklaşmak", "kaçmak"], FROM, FROM_PALE),
         ("ЧЕРЕЗ / МИМО", ["geçmek"], NEUT, PANEL),
         ("ПЕРЕЕЗД", ["taşınmak"], NEUT, PANEL))
    gap, vgap = 9.0, 6.5
    w = (W - gap) / 2.0
    cx = W / 2
    # центральный узел
    ch = 38.0
    cy = H - ch
    A.panel(c, cx - 76, cy, 152, ch, 8, INK, None)
    A.txt(c, cx, cy + 21.0, "ГЛАГОЛЫ", "Deb", 10.2, WHITE, "c")
    A.txt(c, cx, cy + 8.0, "ДВИЖЕНИЯ", "Deb", 10.2, WHITE, "c")
    heights = [max(23.0 + 9.8 * len(L[i][1]), 23.0 + 9.8 * len(R[i][1]))
               for i in range(len(L))]
    top = cy - 20.0
    y = top
    for i in range(len(L)):
        h = heights[i]
        y -= h
        for col_i, (ttl, items, col, pale) in enumerate((L[i], R[i])):
            x = col_i * (w + gap)
            _node(c, x, y, w, h, ttl, items, col, pale)
            if i == 0:
                A.arrow(c, cx + (-26 if col_i == 0 else 26), cy - 2,
                        x + w / 2, y + h + 3.0, col, 1.5, hsize=0.7)
            else:
                c.setStrokeColor(LINE); c.setLineWidth(0.8); c.setDash([2.0, 2.2])
                c.line(x + w / 2, y + h + vgap, x + w / 2, y + h)
                c.setDash()
        y -= vgap


# ============================================ компактные схемы «НЕ ПУТАЙ»
def _nc_build(sentence, lverb, ldraw, lmean, rverb, rdraw, rmean, h=112):
    def draw(c, W, H):
        A.panel(c, 0, H - 22, W, 22, 6, PANEL)
        A.txt(c, W / 2, H - 15.4, sentence, "Isb", 8.4, INK, "c")
        gap = 10.0
        w = (W - gap) / 2.0
        ph = H - 28
        A.panel(c, 0, 0, w, ph, 8, TO_PALE)
        A.panel(c, w + gap, 0, w, ph, 8, FROM_PALE)
        A.txt(c, w / 2, ph - 13.0, lverb, "Ib", 9.6, TO, "c")
        A.txt(c, w + gap + w / 2, ph - 13.0, rverb, "Ib", 9.6, FROM, "c")
        c.saveState(); c.translate(0, 0); ldraw(c, w, ph); c.restoreState()
        c.saveState(); c.translate(w + gap, 0); rdraw(c, w, ph); c.restoreState()
        A.txt(c, w / 2, 8.0, lmean, "I", 6.6, INK_SOFT, "c")
        A.txt(c, w + gap + w / 2, 8.0, rmean, "I", 6.6, INK_SOFT, "c")
        vs_badge(c, W / 2, ph / 2 - 4, 9.0, INK_SOFT, "≠")
    return draw


def _nc(name, sentence, lverb, ldraw, lmean, rverb, rdraw, rmean, h=112):
    FIGS[name] = (_nc_build(sentence, lverb, ldraw, lmean, rverb, rdraw, rmean, h),
                  h, None, None, {"bg": None})


_GY2 = 34.0


def _d_gel(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, 26, _GY2, 30, 1, TO, "walk")
    A.pin(c, w - 26, _GY2 + 32, 11, TO)
    A.person(c, w - 26, _GY2, 30, -1, TO, "stand")
    A.arrow(c, 42, _GY2 + 15, w - 42, _GY2 + 15, TO, 2.1, hsize=0.8)


def _d_git(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.pin(c, 22, _GY2 + 32, 11, FROM)
    A.person(c, 22, _GY2, 30, 1, FROM, "stand")
    A.school(c, w - 28, _GY2, 34, None)
    A.arrow(c, 40, _GY2 + 15, w - 50, _GY2 + 15, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8)


def _d_getir(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, 24, _GY2, 30, 1, TO, "walk")
    ch = A.child(c, 46, _GY2, 20, 1, TO, "walk")
    A.hold_hands(c, (24 + 0.150 * 30, _GY2 + 0.470 * 30), ch, TO, 1.5)
    A.pin(c, w - 24, _GY2 + 32, 11, TO)
    A.person(c, w - 24, _GY2, 30, -1, TO, "stand")
    A.arrow(c, 60, _GY2 + 14, w - 40, _GY2 + 14, TO, 2.1, hsize=0.8)


def _d_gotur(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.pin(c, 20, _GY2 + 32, 11, FROM)
    A.person(c, 20, _GY2, 30, 1, FROM, "stand")
    A.person(c, w * 0.48, _GY2, 30, 1, FROM, "walk")
    ch = A.child(c, w * 0.48 + 22, _GY2, 20, 1, FROM, "walk")
    A.hold_hands(c, (w * 0.48 + 0.150 * 30, _GY2 + 0.470 * 30), ch, FROM, 1.5)
    A.arrow(c, w * 0.48 + 36, _GY2 + 14, w - 14, _GY2 + 14, FROM, 2.1, dash=[4.0, 2.8],
            hsize=0.8)


def _d_gir(c, w, h):
    A.room(c, w - 56, _GY2 - 2, 46, 38, "EV", "l")
    A.person(c, 22, _GY2, 30, 1, TO, "walk")
    A.arrow(c, 38, _GY2 + 13, w - 48, _GY2 + 13, TO, 2.1, hsize=0.8)


def _d_cik(c, w, h):
    A.room(c, 10, _GY2 - 2, 46, 38, "EV", "r")
    A.person(c, w - 24, _GY2, 30, 1, FROM, "walk")
    A.arrow(c, 62, _GY2 + 13, w - 40, _GY2 + 13, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8)


def _d_bin(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.bus(c, w - 38, _GY2, 56, -1, label=None, door_open=True)
    A.person(c, 22, _GY2, 28, 1, TO, "walk")
    A.arrow(c, 38, _GY2 + 13, w - 68, _GY2 + 13, TO, 2.1, hsize=0.8)


def _d_in(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.bus(c, 38, _GY2, 56, 1, label=None, door_open=True)
    A.person(c, w - 22, _GY2, 28, 1, FROM, "walk")
    A.arrow(c, 68, _GY2 + 13, w - 38, _GY2 + 13, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8)


def _d_gel2(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, 24, _GY2, 30, 1, TO, "walk")
    A.house(c, w - 30, _GY2, 32, None)
    A.arrow(c, 40, _GY2 + 14, w - 50, _GY2 + 14, TO, 2.1, hsize=0.8)
    A.point(c, 24, _GY2 + 38, "?", 7.0, INK_FAINT, size=6.6)


def _d_don(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.house(c, 28, _GY2, 32, None)
    A.point(c, w - 24, _GY2 + 16, "B", 8.0, FROM, filled=True, size=7.4)
    A.arrow(c, 52, _GY2 + 36, w - 38, _GY2 + 36, FROM, 1.7, dash=[3.4, 2.4], hsize=0.65)
    A.arrow(c, w - 38, _GY2 + 14, 50, _GY2 + 14, TO, 2.1, hsize=0.8)


def _d_git2(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, 24, _GY2, 30, 1, FROM, "walk")
    A.school(c, w - 28, _GY2, 34, None)
    A.arrow(c, 40, _GY2 + 14, w - 50, _GY2 + 14, FROM, 2.1, dash=[4.0, 2.8], hsize=0.8)
    A.chip(c, w / 2, _GY2 + 38, "куда?", FROM, WHITE, 6.2, border=FROM_SOFT)


def _d_yuru(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, w * 0.36, _GY2, 30, 1, NEUT, "walk")
    A.motion_lines(c, w * 0.36 - 14, _GY2 + 11, 3, 9, 4, SLATE, 1, 1.2)
    A.person(c, w * 0.72, _GY2, 30, 1, NEUT, "walk")
    A.motion_lines(c, w * 0.72 - 14, _GY2 + 11, 3, 9, 4, SLATE, 1, 1.2)
    A.chip(c, w / 2, _GY2 + 38, "как?", NEUT, WHITE, 6.2, border=NEUT_SOFT)


def _d_var(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.arrow(c, 16, _GY2 + 14, w - 50, _GY2 + 14, TO, 2.1, dash=[4.0, 2.8], hsize=0.8)
    A.dot(c, w - 50, _GY2 + 14, 3.4, TO)
    A.house(c, w - 30, _GY2, 32, None)
    A.txt(c, 34, _GY2 + 34, "09:00", "Isb", 6.4, INK_SOFT, "l")


def _d_gel3(c, w, h):
    A.ground(c, 12, w - 12, _GY2)
    A.person(c, 24, _GY2, 30, 1, TO, "walk")
    A.house(c, w - 30, _GY2, 32, None)
    A.pin(c, w - 30, _GY2 + 42, 11, TO)
    A.arrow(c, 40, _GY2 + 14, w - 50, _GY2 + 14, TO, 2.1, hsize=0.8)


_nc("nc1", "Ali ____ .", "GELİYOR", _d_gel, "идёт сюда, ко мне",
    "GİDİYOR", _d_git, "идёт туда, от меня")
_nc("nc2", "Çocuğu ____ .", "GETİR", _d_getir, "приведи сюда",
    "GÖTÜR", _d_gotur, "отведи туда")
_nc("nc3", "Eve / evden ____ .", "GİRDİM", _d_gir, "вошёл внутрь",
    "ÇIKTIM", _d_cik, "вышел наружу")
_nc("nc4", "Otobüse / otobüsten ____ .", "BİNDİM", _d_bin, "сел в автобус",
    "İNDİM", _d_in, "вышел из автобуса")
_nc("nc5", "Eve ____ .", "GELDİM", _d_gel2, "пришёл (откуда — неважно)",
    "DÖNDÜM", _d_don, "вернулся туда, откуда ушёл")
_nc("nc6", "Okula ____ .", "GİDİYORUM", _d_git2, "направление: в школу",
    "YÜRÜYORUM", _d_yuru, "способ: пешком")
_nc("nc7", "Eve ____ .", "GELDİ", _d_gel3, "пришёл ко мне домой",
    "VARDI", _d_var, "добрался, путь окончен")


# ============================================ схема для заданий
@fig("quiz_dir", 244, bg=None)
def _quiz(c, W, H):
    gap = 9.0
    w = (W - gap) / 2.0
    h = (H - gap) / 2.0
    cells = ["A", "B", "C", "D"]
    for i, t in enumerate(cells):
        col, row = i % 2, i // 2
        bx = col * (w + gap)
        by = H - (row + 1) * h - row * gap
        A.panel(c, bx, by, w, h, 8, PANEL)
        c.setFillColor(INK)
        c.circle(bx + 13, by + h - 13, 8.0, stroke=0, fill=1)
        A.txt(c, bx + 13, by + h - 15.8, t, "Ib", 8.0, WHITE, "c")
    gy = 26.0
    # A — к говорящему
    bx, by = 0, H - h
    A.ground(c, bx + 14, bx + w - 14, by + gy)
    A.person(c, bx + 30, by + gy, 30, 1, SLATE, "walk")
    A.pin(c, bx + w - 30, by + gy + 32, 11, INK)
    A.person(c, bx + w - 30, by + gy, 30, -1, SLATE, "stand")
    A.arrow(c, bx + 48, by + gy + 14, bx + w - 48, by + gy + 14, INK, 2.1, hsize=0.8)
    # B — от говорящего к школе
    bx, by = w + gap, H - h
    A.ground(c, bx + 14, bx + w - 14, by + gy)
    A.pin(c, bx + 26, by + gy + 32, 11, INK)
    A.person(c, bx + 26, by + gy, 30, 1, SLATE, "stand")
    A.school(c, bx + w - 32, by + gy, 36, None)
    A.arrow(c, bx + 44, by + gy + 14, bx + w - 56, by + gy + 14, INK, 2.1,
            dash=[4.0, 2.8], hsize=0.8)
    # C — предмет к говорящему
    bx, by = 0, 0
    A.ground(c, bx + 14, bx + w - 14, by + gy)
    A.person(c, bx + 30, by + gy, 30, 1, SLATE, "carry", carry="cup")
    A.pin(c, bx + w - 30, by + gy + 32, 11, INK)
    A.person(c, bx + w - 30, by + gy, 30, -1, SLATE, "stand")
    A.arrow(c, bx + 56, by + gy + 13, bx + w - 48, by + gy + 13, INK, 2.1, hsize=0.8)
    # D — выход из автобуса
    bx, by = w + gap, 0
    A.ground(c, bx + 14, bx + w - 14, by + gy)
    A.bus(c, bx + 44, by + gy, 60, 1, label=None, door_open=True)
    A.person(c, bx + w - 26, by + gy, 28, 1, SLATE, "walk")
    A.arrow(c, bx + 76, by + gy + 13, bx + w - 42, by + gy + 13, INK, 2.1,
            dash=[4.0, 2.8], hsize=0.8)
