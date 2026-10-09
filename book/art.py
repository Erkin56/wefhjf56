# -*- coding: utf-8 -*-
"""Библиотека плоской векторной графики: люди, объекты, транспорт, стрелки.

Все примитивы рисуются прямо на canvas ReportLab. Единая визуальная система:
светлая заливка + тёмный контур, чтобы схема читалась и в чёрно-белой печати.
"""
from math import hypot, cos, sin, pi, atan2
from reportlab.pdfbase import pdfmetrics
from book.theme import (INK, INK_SOFT, INK_FAINT, LINE, LINE_SOFT, PANEL, WHITE, PANEL_WARM,
                        TO, TO_SOFT, TO_PALE, FROM, FROM_SOFT, FROM_PALE,
                        NEUT, NEUT_SOFT, OK, OK_SOFT, ERR, ERR_SOFT,
                        SLATE, SLATE_SOFT, OBJ)

# =============================================================== утилиты
import re as _re
_TAGRE = _re.compile(r"<[^>]+>")


def txt(c, x, y, s, font="Im", size=7.4, color=INK, align="c", tracking=0):
    s = _TAGRE.sub("", s) if s else s
    c.setFont(font, size)
    c.setFillColor(color)
    if tracking:
        w = pdfmetrics.stringWidth(s, font, size) + tracking * (len(s) - 1)
        sx = x - w / 2 if align == "c" else (x - w if align == "r" else x)
        t = c.beginText(sx, y)
        t.setFont(font, size)
        t.setCharSpace(tracking)
        t.textOut(s)
        t.setCharSpace(0)
        c.drawText(t)
        return
    if align == "c":
        c.drawCentredString(x, y, s)
    elif align == "r":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)


def panel(c, x, y, w, h, r=7, fill=PANEL, stroke=None, lw=0.7):
    c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke); c.setLineWidth(lw)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke is not None else 0, fill=1)


def ground(c, x1, x2, y, color=LINE, lw=1.0, dash=None):
    c.setStrokeColor(color); c.setLineWidth(lw)
    c.setDash(dash or [])
    c.line(x1, y, x2, y)
    c.setDash()


def chip(c, x, y, s, color=TO, bg=TO_SOFT, size=6.6, font="Isb", pad=5.4, h=12.0,
         align="c", border=None):
    w = pdfmetrics.stringWidth(s, font, size) + 2 * pad
    x0 = x - w / 2 if align == "c" else (x - w if align == "r" else x)
    c.setFillColor(bg)
    if border is not None:
        c.setStrokeColor(border); c.setLineWidth(0.7)
    c.roundRect(x0, y, w, h, h / 2, stroke=1 if border is not None else 0, fill=1)
    txt(c, x0 + w / 2, y + (h - size) / 2 + 0.9, s, font, size, color, "c")
    return w


def bubble(c, x, y, s, size=7.3, font="Im", color=INK, bg=WHITE, border=LINE,
           tail="bl", pad=5.0):
    """Речевое облачко; (x,y) — левый нижний угол корпуса."""
    w = pdfmetrics.stringWidth(s, font, size) + 2 * pad
    h = size + 2 * pad - 1.2
    c.setFillColor(bg); c.setStrokeColor(border); c.setLineWidth(0.75)
    c.roundRect(x, y, w, h, 4.2, stroke=1, fill=1)
    tx = (x + 11.0) if tail == "bl" else (x + w - 11.0)
    sgn = -1 if tail == "bl" else 1
    p = c.beginPath()
    p.moveTo(tx - sgn * 0.0, y + 1.2)
    p.lineTo(tx + sgn * 2.0, y - 7.4)
    p.lineTo(tx - sgn * 9.5, y + 1.2)
    p.close()
    c.setFillColor(bg); c.setStrokeColor(bg); c.setLineWidth(1.4)
    c.drawPath(p, fill=1, stroke=1)
    c.setStrokeColor(border); c.setLineWidth(0.75); c.setLineJoin(1)
    c.line(tx, y + 1.0, tx + sgn * 2.0, y - 7.4)
    c.line(tx + sgn * 2.0, y - 7.4, tx - sgn * 9.5, y + 1.0)
    txt(c, x + w / 2, y + pad - 0.4, s, font, size, color, "c")
    return w, h


# =============================================================== стрелки
def arrowhead(c, x, y, ux, uy, color=TO, size=1.0):
    hl, hw = 8.6 * size, 5.9 * size
    px, py = -uy, ux
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x - ux * hl + px * hw / 2, y - uy * hl + py * hw / 2)
    p.lineTo(x - ux * hl * 0.72, y - uy * hl * 0.72)
    p.lineTo(x - ux * hl - px * hw / 2, y - uy * hl - py * hw / 2)
    p.close()
    c.setFillColor(color)
    c.drawPath(p, fill=1, stroke=0)


def arrow(c, x1, y1, x2, y2, color=TO, lw=2.3, dash=None, bulge=0.0, hsize=1.0,
          start_head=False, label=None, lab_size=6.6, lab_font="Isb", lab_bg=None,
          lab_off=7.0, lab_color=None, end_head=True):
    """Стрелка из (x1,y1) в (x2,y2). bulge — изгиб (доля длины, + влево от хода)."""
    dx, dy = x2 - x1, y2 - y1
    L = hypot(dx, dy) or 1.0
    ux, uy = dx / L, dy / L
    px, py = -uy, ux
    hl = 8.6 * hsize * 0.92
    ex, ey = (x2 - ux * hl * 0.55, y2 - uy * hl * 0.55) if end_head else (x2, y2)
    sx, sy = (x1 + ux * hl * 0.55, y1 + uy * hl * 0.55) if start_head else (x1, y1)
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineCap(1); c.setLineJoin(1)
    c.setDash(dash or [])
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if abs(bulge) < 1e-6:
        c.line(sx, sy, ex, ey)
        tux, tuy = ux, uy
        sux, suy = -ux, -uy
        lx, ly = mx + px * lab_off, my + py * lab_off
    else:
        b = bulge * L
        c1x, c1y = sx + (ex - sx) * 0.28 + px * b * 1.08, sy + (ey - sy) * 0.28 + py * b * 1.08
        c2x, c2y = sx + (ex - sx) * 0.72 + px * b * 1.08, sy + (ey - sy) * 0.72 + py * b * 1.08
        p = c.beginPath(); p.moveTo(sx, sy); p.curveTo(c1x, c1y, c2x, c2y, ex, ey)
        c.drawPath(p, fill=0, stroke=1)
        t1 = hypot(ex - c2x, ey - c2y) or 1.0
        tux, tuy = (ex - c2x) / t1, (ey - c2y) / t1
        t2 = hypot(sx - c1x, sy - c1y) or 1.0
        sux, suy = (sx - c1x) / t2, (sy - c1y) / t2
        lx, ly = mx + px * (b * 0.78 + lab_off), my + py * (b * 0.78 + lab_off)
    c.setDash()
    if end_head:
        arrowhead(c, x2, y2, tux, tuy, color, hsize)
    if start_head:
        arrowhead(c, x1, y1, sux, suy, color, hsize)
    if label:
        lc = lab_color or color
        if lab_bg is not None:
            chip(c, lx, ly - 5.4, label, lc, lab_bg, lab_size, lab_font, 4.0, 10.6)
        else:
            txt(c, lx, ly - lab_size * 0.36, label, lab_font, lab_size, lc, "c")


def turn_arrow(c, x, y, size=26, side=1, color=TO, lw=2.6, up=16):
    """Г-образная стрелка поворота: вверх, затем вправо (side=1) или влево (side=-1)."""
    r = size * 0.34
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineCap(1); c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x, y + up - r)
    p.curveTo(x, y + up - r * 0.45, x + side * r * 0.45, y + up, x + side * r, y + up)
    p.lineTo(x + side * (size - 8.0), y + up)
    c.drawPath(p, fill=0, stroke=1)
    arrowhead(c, x + side * size, y + up, side, 0, color, 1.05)


def uturn_arrow(c, x1, x2, y, color=TO, lw=2.4, rise=22, dash=None, label=None,
                lab_bg=None, lab_size=6.6):
    """Дуга «туда и обратно»: из x1 поднимается и возвращается в x2 на том же уровне."""
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineCap(1)
    c.setDash(dash or [])
    p = c.beginPath()
    p.moveTo(x1, y)
    p.curveTo(x1, y + rise * 1.25, x2 + (x2 - x1) * 0.06, y + rise * 1.25, x2, y + 7.0)
    c.drawPath(p, fill=0, stroke=1)
    c.setDash()
    arrowhead(c, x2, y, 0, -1, color, 1.0)
    if label:
        mx = (x1 + x2) / 2
        if lab_bg is not None:
            chip(c, mx, y + rise * 0.86, label, color, lab_bg, lab_size, "Isb", 4.2, 10.8)
        else:
            txt(c, mx, y + rise * 0.92, label, "Isb", lab_size, color, "c")


def dim_line(c, x1, x2, y, label=None, color=INK_FAINT, lw=0.8, tick=4.2, size=6.4):
    c.setStrokeColor(color); c.setLineWidth(lw); c.setDash([2.2, 2.0])
    c.line(x1, y, x2, y); c.setDash()
    c.line(x1, y - tick, x1, y + tick); c.line(x2, y - tick, x2, y + tick)
    if label:
        txt(c, (x1 + x2) / 2, y + 4.0, label, "Im", size, color, "c")


def motion_lines(c, x, y, n=3, length=7.5, gap=3.4, color=None, facing=1, lw=1.3):
    """Короткие штрихи «скорости» позади движущегося объекта."""
    col = color or SLATE
    c.setStrokeColor(col); c.setLineWidth(lw); c.setLineCap(1)
    for i in range(n):
        yy = y + i * gap
        ln = length * (1.0 - 0.18 * i)
        c.line(x - facing * 0, yy, x - facing * ln, yy)


# =============================================================== человек
def person(c, x, y, h=44, facing=1, color=SLATE, pose="stand", carry=None,
           label=None, lab_color=None, lab_size=6.5, lab_font="Isb", lab_dy=-9.0,
           head_color=None):
    """Плоская фигурка. (x, y) — середина ступней, h — полный рост."""
    hr = 0.112 * h
    hcy = y + h - hr
    sh_y = y + 0.672 * h
    hip_y = y + 0.405 * h
    tw = 0.268 * h
    legw, armw = 0.076 * h, 0.062 * h
    col = color
    c.setLineCap(1); c.setLineJoin(1)

    # --- ноги
    c.setStrokeColor(col); c.setLineWidth(legw)
    if pose in ("walk", "carry", "walk2"):
        c.line(x, hip_y, x + facing * 0.150 * h, y + legw * 0.45)
        c.line(x, hip_y, x - facing * 0.140 * h, y + legw * 0.45)
    elif pose == "run":
        c.line(x, hip_y, x + facing * 0.225 * h, y + 0.055 * h)
        c.line(x, hip_y, x - facing * 0.150 * h, y + 0.140 * h)
        c.line(x - facing * 0.150 * h, y + 0.140 * h, x - facing * 0.255 * h, y + 0.035 * h)
    elif pose == "sit":
        c.line(x, hip_y, x + facing * 0.175 * h, hip_y)
        c.line(x + facing * 0.175 * h, hip_y, x + facing * 0.175 * h, y + legw * 0.45)
    else:
        c.line(x - 0.062 * h, hip_y, x - 0.062 * h, y + legw * 0.45)
        c.line(x + 0.062 * h, hip_y, x + 0.062 * h, y + legw * 0.45)

    # --- корпус
    c.setFillColor(col)
    c.roundRect(x - tw / 2, hip_y - 0.012 * h, tw, sh_y - hip_y + 0.055 * h,
                tw * 0.42, stroke=0, fill=1)

    # --- руки
    c.setStrokeColor(col); c.setLineWidth(armw)
    hand = None
    if pose == "carry":
        c.line(x + facing * tw * 0.34, sh_y - 0.02 * h,
               x + facing * 0.200 * h, y + 0.472 * h)
        hand = (x + facing * 0.200 * h, y + 0.472 * h)
        c.line(x - facing * tw * 0.30, sh_y - 0.02 * h,
               x - facing * 0.125 * h, y + 0.432 * h)
    elif pose == "carry2":
        c.line(x + facing * tw * 0.30, sh_y - 0.02 * h,
               x + facing * 0.118 * h, y + 0.400 * h)
        hand = (x + facing * 0.118 * h, y + 0.400 * h)
        c.line(x - facing * tw * 0.30, sh_y - 0.02 * h,
               x - facing * 0.128 * h, y + 0.408 * h)
    elif pose in ("walk", "walk2"):
        c.line(x + facing * tw * 0.26, sh_y - 0.02 * h,
               x + facing * 0.150 * h, y + 0.470 * h)
        c.line(x - facing * tw * 0.26, sh_y - 0.02 * h,
               x - facing * 0.140 * h, y + 0.465 * h)
        hand = (x + facing * 0.150 * h, y + 0.470 * h)
    elif pose == "run":
        c.line(x + facing * tw * 0.22, sh_y - 0.03 * h,
               x + facing * 0.175 * h, y + 0.600 * h)
        c.line(x - facing * tw * 0.22, sh_y - 0.03 * h,
               x - facing * 0.185 * h, y + 0.455 * h)
    elif pose == "wave":
        c.line(x + facing * tw * 0.26, sh_y - 0.02 * h,
               x + facing * 0.172 * h, y + 0.880 * h)
        c.line(x - facing * tw * 0.26, sh_y - 0.02 * h,
               x - facing * 0.098 * h, y + 0.440 * h)
    elif pose == "point":
        c.line(x + facing * tw * 0.26, sh_y - 0.02 * h,
               x + facing * 0.250 * h, y + 0.660 * h)
        c.line(x - facing * tw * 0.26, sh_y - 0.02 * h,
               x - facing * 0.098 * h, y + 0.440 * h)
        hand = (x + facing * 0.250 * h, y + 0.660 * h)
    else:
        c.line(x + tw * 0.30, sh_y - 0.02 * h, x + 0.108 * h, y + 0.432 * h)
        c.line(x - tw * 0.30, sh_y - 0.02 * h, x - 0.108 * h, y + 0.432 * h)
        hand = (x + 0.108 * h, y + 0.432 * h)

    # --- голова
    c.setFillColor(head_color or col)
    c.circle(x, hcy, hr, stroke=0, fill=1)

    if carry and hand:
        draw_carry(c, carry, hand[0], hand[1], h, facing, col)
    if label:
        txt(c, x, y + lab_dy, label, lab_font, lab_size, lab_color or col, "c")
    return x, y


def draw_carry(c, kind, hx, hy, h, facing, col):
    s = h / 44.0
    if kind == "box":
        w, bh = 15 * s, 11.5 * s
        x0, y0 = hx + facing * w * 0.46 - w / 2, hy - bh * 0.50
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        c.rect(x0, y0, w, bh, stroke=1, fill=1)
        c.setLineWidth(0.85); c.setStrokeColor(SLATE)
        c.line(x0 + w / 2, y0, x0 + w / 2, y0 + bh)
        c.line(x0, y0 + bh * 0.62, x0 + w, y0 + bh * 0.62)
    elif kind == "cup":
        w, bh = 9.2 * s, 12.5 * s
        x0, y0 = hx + facing * w * 0.40 - w / 2, hy - bh * 0.40
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        p = c.beginPath()
        p.moveTo(x0 + w * 0.12, y0 + bh * 0.82); p.lineTo(x0 + w * 0.26, y0)
        p.lineTo(x0 + w * 0.74, y0); p.lineTo(x0 + w * 0.88, y0 + bh * 0.82)
        p.close(); c.drawPath(p, fill=1, stroke=1)
        c.rect(x0, y0 + bh * 0.80, w, bh * 0.14, stroke=1, fill=1)
        c.setLineWidth(1.3); c.setStrokeColor(OBJ); c.setLineCap(1)
        c.line(x0 + w * 0.62, y0 + bh * 0.94, x0 + w * 0.78, y0 + bh * 1.22)
    elif kind == "book":
        w, bh = 13 * s, 9.6 * s
        x0, y0 = hx + facing * w * 0.40 - w / 2, hy - bh * 0.5
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        c.rect(x0, y0, w, bh, stroke=1, fill=1)
        c.setLineWidth(0.8); c.setStrokeColor(SLATE)
        c.line(x0 + w * 0.5, y0 + 0.8, x0 + w * 0.5, y0 + bh - 0.8)
        for i in (0.35, 0.55, 0.75):
            c.line(x0 + w * 0.56, y0 + bh * i, x0 + w * 0.90, y0 + bh * i)
    elif kind == "bag":
        w, bh = 12 * s, 11 * s
        x0, y0 = hx + facing * w * 0.2 - w / 2, hy - bh - 2.0 * s
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        c.rect(x0, y0, w, bh, stroke=1, fill=1)
        c.setLineWidth(1.0); c.setStrokeColor(OBJ)
        p = c.beginPath(); p.moveTo(x0 + w * 0.25, y0 + bh)
        p.curveTo(x0 + w * 0.25, y0 + bh * 1.5, x0 + w * 0.75, y0 + bh * 1.5, x0 + w * 0.75, y0 + bh)
        c.drawPath(p, fill=0, stroke=1)
    elif kind == "papers":
        w, bh = 12.5 * s, 14 * s
        x0, y0 = hx + facing * w * 0.40 - w / 2, hy - bh * 0.5
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        c.rect(x0, y0, w, bh, stroke=1, fill=1)
        c.setLineWidth(0.75); c.setStrokeColor(SLATE)
        for i in (0.22, 0.40, 0.58, 0.76):
            c.line(x0 + w * 0.18, y0 + bh * i, x0 + w * 0.82, y0 + bh * i)
    elif kind == "suitcase":
        w, bh = 13 * s, 10.5 * s
        x0, y0 = hx + facing * w * 0.18 - w / 2, hy - bh - 1.5 * s
        c.setFillColor(WHITE); c.setStrokeColor(OBJ); c.setLineWidth(1.05)
        c.roundRect(x0, y0, w, bh, 1.6, stroke=1, fill=1)
        c.setLineWidth(1.0)
        c.line(x0 + w * 0.32, y0 + bh, x0 + w * 0.32, y0 + bh * 1.32)
        c.line(x0 + w * 0.68, y0 + bh, x0 + w * 0.68, y0 + bh * 1.32)
        c.line(x0 + w * 0.32, y0 + bh * 1.32, x0 + w * 0.68, y0 + bh * 1.32)
        c.setStrokeColor(SLATE); c.setLineWidth(0.85)
        c.line(x0, y0 + bh * 0.45, x0 + w, y0 + bh * 0.45)
    elif kind == "flower":
        c.setStrokeColor(OK); c.setLineWidth(1.2); c.setLineCap(1)
        c.line(hx, hy, hx + facing * 2, hy + 12 * s)
        c.setFillColor(FROM)
        for a in range(5):
            ang = a * 2 * pi / 5
            c.circle(hx + facing * 2 + cos(ang) * 2.6 * s, hy + 12 * s + sin(ang) * 2.6 * s,
                     2.1 * s, stroke=0, fill=1)


def child(c, x, y, h=28, facing=1, color=SLATE, pose="walk", label=None, lab_color=None):
    """Ребёнок: та же фигурка, но голова относительно больше."""
    hr = 0.145 * h
    hcy = y + h - hr
    sh_y = y + 0.620 * h
    hip_y = y + 0.370 * h
    tw = 0.260 * h
    c.setLineCap(1)
    c.setStrokeColor(color); c.setLineWidth(0.082 * h)
    if pose == "walk":
        c.line(x, hip_y, x + facing * 0.130 * h, y + 0.04 * h)
        c.line(x, hip_y, x - facing * 0.120 * h, y + 0.04 * h)
    else:
        c.line(x - 0.058 * h, hip_y, x - 0.058 * h, y + 0.04 * h)
        c.line(x + 0.058 * h, hip_y, x + 0.058 * h, y + 0.04 * h)
    c.setFillColor(color)
    c.roundRect(x - tw / 2, hip_y - 0.01 * h, tw, sh_y - hip_y + 0.05 * h,
                tw * 0.42, stroke=0, fill=1)
    c.setStrokeColor(color); c.setLineWidth(0.068 * h)
    c.line(x - facing * tw * 0.28, sh_y - 0.02 * h, x - facing * 0.165 * h, y + 0.470 * h)
    c.line(x + facing * tw * 0.28, sh_y - 0.02 * h, x + facing * 0.135 * h, y + 0.420 * h)
    c.setFillColor(color)
    c.circle(x, hcy, hr, stroke=0, fill=1)
    if label:
        txt(c, x, y - 9.0, label, "Isb", 6.3, lab_color or color, "c")
    return x - facing * 0.165 * h, y + 0.470 * h   # свободная рука


def hold_hands(c, adult_hand, child_hand, color=SLATE, lw=2.0):
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineCap(1)
    c.line(adult_hand[0], adult_hand[1], child_hand[0], child_hand[1])


def speaker(c, x, y, h=44, facing=1, color=TO, label="ГОВОРЯЩИЙ", pin_label=None,
            pose="stand", show_pin=True):
    """Говорящий = точка отсчёта. Фигурка + метка-«булавка» над головой."""
    person(c, x, y, h, facing, color, pose)
    if show_pin:
        pin(c, x, y + h + 5.0, 14.0, color)
    if label:
        txt(c, x, y - 9.4, label, "Isb", 6.1, color, "c", tracking=0.4)
    if pin_label:
        txt(c, x, y + h + 21.5, pin_label, "Im", 6.2, color, "c")


def pin(c, x, y, h=15, color=TO):
    """Векторная «булавка» (точка нахождения)."""
    r = h * 0.335
    cy = y + h - r
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(x, y)
    p.curveTo(x - r * 0.62, y + h * 0.40, x - r, cy - r * 0.42, x - r, cy)
    p.curveTo(x - r, cy + r * 1.1, x + r, cy + r * 1.1, x + r, cy)
    p.curveTo(x + r, cy - r * 0.42, x + r * 0.62, y + h * 0.40, x, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.circle(x, cy, r * 0.40, stroke=0, fill=1)


def point(c, x, y, letter, r=8.6, color=INK, filled=False, sub=None, size=8.0):
    c.setLineWidth(1.5)
    if filled:
        c.setFillColor(color); c.circle(x, y, r, stroke=0, fill=1)
        txt(c, x, y - size * 0.34, letter, "Ib", size, WHITE, "c")
    else:
        c.setStrokeColor(color); c.setFillColor(WHITE)
        c.circle(x, y, r, stroke=1, fill=1)
        txt(c, x, y - size * 0.34, letter, "Ib", size, color, "c")
    if sub:
        txt(c, x, y - r - 8.4, sub, "Im", 6.3, INK_SOFT, "c")


def dot(c, x, y, r=4.2, color=INK, sub=None, ring=False):
    c.setFillColor(color)
    c.circle(x, y, r, stroke=0, fill=1)
    if ring:
        c.setStrokeColor(color); c.setLineWidth(0.9)
        c.circle(x, y, r + 3.0, stroke=1, fill=0)
    if sub:
        txt(c, x, y - r - 8.6, sub, "Im", 6.3, INK_SOFT, "c")


# =============================================================== здания
def house(c, x, y, w=46, label=None, lab_color=None, fill=WHITE, door=True,
          windows=True, lw=1.15, color=OBJ, smoke=False):
    """Дом: (x, y) — середина основания, w — ширина."""
    bh = 0.60 * w
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw)
    c.setLineJoin(1)
    c.rect(x - w / 2, y, w, bh, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(x - w / 2 - 0.075 * w, y + bh)
    p.lineTo(x, y + bh + 0.345 * w)
    p.lineTo(x + w / 2 + 0.075 * w, y + bh)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    if door:
        dw, dh = 0.165 * w, 0.275 * w
        c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw * 0.85)
        c.rect(x - dw / 2, y, dw, dh, stroke=1, fill=1)
        c.setFillColor(color)
        c.circle(x + dw * 0.26, y + dh * 0.52, 0.80, stroke=0, fill=1)
    if windows:
        ww = 0.155 * w
        c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw * 0.85)
        for sx in (-0.29, 0.29):
            c.rect(x + sx * w - ww / 2, y + bh * 0.47, ww, ww, stroke=1, fill=1)
            c.setLineWidth(0.6); c.setStrokeColor(SLATE_SOFT)
            c.line(x + sx * w, y + bh * 0.47, x + sx * w, y + bh * 0.47 + ww)
            c.line(x + sx * w - ww / 2, y + bh * 0.47 + ww / 2,
                   x + sx * w + ww / 2, y + bh * 0.47 + ww / 2)
            c.setLineWidth(lw * 0.85); c.setStrokeColor(color)
    if smoke:
        c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw * 0.85)
        c.rect(x + 0.26 * w, y + bh + 0.10 * w, 0.085 * w, 0.20 * w, stroke=1, fill=1)
    if label:
        txt(c, x, y - 9.6, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return y + bh + 0.345 * w


def school(c, x, y, w=62, label="OKUL", lab_color=None, fill=WHITE, color=OBJ, lw=1.15,
           flag=True):
    bh = 0.52 * w
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    c.rect(x - w / 2, y, w, bh, stroke=1, fill=1)
    c.rect(x - w / 2 - 0.035 * w, y + bh, w + 0.07 * w, 0.055 * w, stroke=1, fill=1)
    dw, dh = 0.135 * w, 0.225 * w
    c.rect(x - dw / 2, y, dw, dh, stroke=1, fill=1)
    c.setLineWidth(0.7); c.setStrokeColor(SLATE)
    c.line(x, y, x, y + dh)
    ww = 0.085 * w
    c.setLineWidth(lw * 0.8); c.setStrokeColor(color); c.setFillColor(fill)
    for row in (0.56, 0.24):
        for sx in (-0.34, -0.17, 0.17, 0.34):
            c.rect(x + sx * w - ww / 2, y + bh * row, ww, ww * 1.15, stroke=1, fill=1)
    if flag:
        c.setStrokeColor(color); c.setLineWidth(1.0)
        c.line(x, y + bh + 0.055 * w, x, y + bh + 0.26 * w)
        c.setFillColor(FROM)
        p = c.beginPath()
        p.moveTo(x, y + bh + 0.26 * w); p.lineTo(x + 0.14 * w, y + bh + 0.225 * w)
        p.lineTo(x, y + bh + 0.19 * w); p.close()
        c.drawPath(p, fill=1, stroke=0)
    if label:
        txt(c, x, y - 9.6, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return y + bh + 0.26 * w


def building(c, x, y, w=46, floors=3, label=None, fill=WHITE, color=OBJ, lw=1.15,
             floor_h=None, floor_labels=None, lab_color=None, door=True):
    """Многоэтажный дом с подписями этажей (для вертикального движения)."""
    fh = floor_h or 0.30 * w
    H = fh * floors
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    c.rect(x - w / 2, y, w, H, stroke=1, fill=1)
    c.setLineWidth(0.75); c.setStrokeColor(LINE)
    for i in range(1, floors):
        c.line(x - w / 2, y + fh * i, x + w / 2, y + fh * i)
    ww = 0.17 * w
    for i in range(floors):
        for sx in (-0.26, 0.26):
            if i == 0 and door and sx > 0:
                continue
            c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(0.85)
            c.rect(x + sx * w - ww / 2, y + fh * i + fh * 0.30, ww, ww * 0.95,
                   stroke=1, fill=1)
    if door:
        dw, dh = 0.15 * w, fh * 0.60
        c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(0.95)
        c.rect(x + 0.26 * w - dw / 2, y, dw, dh, stroke=1, fill=1)
    c.setStrokeColor(color); c.setLineWidth(lw)
    c.rect(x - w / 2, y, w, H, stroke=1, fill=0)
    if floor_labels:
        for i, t in enumerate(floor_labels):
            txt(c, x - w / 2 - 6.0, y + fh * i + fh * 0.42, t, "Isb", 6.4, INK_SOFT, "r")
    if label:
        txt(c, x, y - 9.6, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return y + H


def room(c, x, y, w=86, h=52, label=None, opening="l", fill=WHITE, color=OBJ, lw=1.25,
         lab_color=None, op_frac=0.42, op_size=0.44):
    """Помещение в разрезе с проёмом: opening = 'l' | 'r' | None."""
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    c.rect(x, y, w, h, stroke=0, fill=1)
    oh = h * op_size
    oy = y + h * 0.0
    c.setStrokeColor(color); c.setLineWidth(lw)
    c.line(x, y + h, x + w, y + h)          # потолок
    c.line(x, y, x + w, y)                  # пол
    if opening == "l":
        c.line(x, y + oh, x, y + h)
        c.line(x + w, y, x + w, y + h)
    elif opening == "r":
        c.line(x, y, x, y + h)
        c.line(x + w, y + oh, x + w, y + h)
    else:
        c.line(x, y, x, y + h); c.line(x + w, y, x + w, y + h)
    if label:
        txt(c, x + w / 2, y + h + 5.0, label, "Isb", 6.8, lab_color or INK_SOFT, "c")


def door_fig(c, x, y, w=22, open_=False, facing=1, color=OBJ, fill=WHITE, lw=1.2,
             label=None):
    """Отдельная дверь. (x, y) — середина основания."""
    h = w * 2.15
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    c.rect(x - w / 2, y, w, h, stroke=1, fill=1)
    if open_:
        c.setFillColor(PANEL)
        p = c.beginPath()
        p.moveTo(x - facing * w / 2, y)
        p.lineTo(x - facing * w / 2 + facing * w * 0.70, y + h * 0.10)
        p.lineTo(x - facing * w / 2 + facing * w * 0.70, y + h * 0.90)
        p.lineTo(x - facing * w / 2, y + h)
        p.close()
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.setFillColor(color)
        c.circle(x + facing * w * 0.29, y + h * 0.47, 1.25, stroke=0, fill=1)
    if label:
        txt(c, x, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


def doorway(c, x, y, w=34, h=48, color=OBJ, lw=1.4, label=None, lab_color=None):
    """Проём/арка (для geçmek — «пройти через»)."""
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineCap(0); c.setLineJoin(1)
    t = w * 0.13
    c.setFillColor(SLATE_SOFT)
    c.rect(x - w / 2 - t, y, t, h, stroke=0, fill=1)
    c.rect(x + w / 2, y, t, h, stroke=0, fill=1)
    c.rect(x - w / 2 - t, y + h, w + 2 * t, t * 0.9, stroke=0, fill=1)
    if label:
        txt(c, x, y + h + t + 5.0, label, "Isb", 6.5, lab_color or INK_SOFT, "c")


def stairs(c, x, y, w=62, h=42, steps=5, facing=1, color=OBJ, fill=PANEL, lw=1.15,
           label=None):
    """Лестница в профиль. Поднимается в сторону facing."""
    sw, sh = w / steps, h / steps
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    p = c.beginPath()
    if facing > 0:
        p.moveTo(x, y)
        for i in range(steps):
            p.lineTo(x + i * sw, y + (i + 1) * sh)
            p.lineTo(x + (i + 1) * sw, y + (i + 1) * sh)
        p.lineTo(x + w, y)
    else:
        p.moveTo(x + w, y)
        for i in range(steps):
            p.lineTo(x + w - i * sw, y + (i + 1) * sh)
            p.lineTo(x + w - (i + 1) * sw, y + (i + 1) * sh)
        p.lineTo(x, y)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


def elevator(c, x, y, w=30, h=66, cabin=0.5, color=OBJ, lw=1.2, floors=3, label=None):
    c.setFillColor(WHITE); c.setStrokeColor(color); c.setLineWidth(lw)
    c.rect(x, y, w, h, stroke=1, fill=1)
    c.setLineWidth(0.7); c.setStrokeColor(LINE)
    for i in range(1, floors):
        c.line(x, y + h * i / floors, x + w, y + h * i / floors)
    ch = h / floors * 0.82
    cy = y + (h - ch) * cabin
    c.setFillColor(PANEL); c.setStrokeColor(color); c.setLineWidth(1.0)
    c.rect(x + w * 0.12, cy, w * 0.76, ch, stroke=1, fill=1)
    c.setLineWidth(0.8); c.setStrokeColor(SLATE)
    c.line(x + w * 0.5, cy, x + w * 0.5, cy + ch)
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


def mountain(c, x, y, w=96, h=52, color=OBJ, fill=PANEL, lw=1.15, label=None,
             snow=True):
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(x, y); p.lineTo(x + w * 0.42, y + h); p.lineTo(x + w * 0.66, y + h * 0.56)
    p.lineTo(x + w * 0.82, y + h * 0.78); p.lineTo(x + w, y)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    if snow:
        c.setFillColor(WHITE); c.setStrokeColor(color); c.setLineWidth(0.8)
        p = c.beginPath()
        p.moveTo(x + w * 0.42 - w * 0.085, y + h * 0.80)
        p.lineTo(x + w * 0.42, y + h)
        p.lineTo(x + w * 0.42 + w * 0.075, y + h * 0.80)
        p.lineTo(x + w * 0.42 + w * 0.03, y + h * 0.845)
        p.lineTo(x + w * 0.42 - w * 0.03, y + h * 0.805)
        p.close(); c.drawPath(p, fill=1, stroke=1)
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


def city(c, x, y, w=96, h=44, color=OBJ, fill=WHITE, lw=1.0, label=None, seed=0):
    """Силуэт города: несколько домов разной высоты."""
    hs = [0.62, 1.0, 0.78, 0.92, 0.55, 0.72]
    hs = hs[seed % 2:] + hs[:seed % 2]
    n = len(hs)
    bw = w / n
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    for i, f in enumerate(hs):
        bx = x + i * bw
        c.rect(bx, y, bw * 0.90, h * f, stroke=1, fill=1)
    c.setFillColor(SLATE_SOFT)
    for i, f in enumerate(hs):
        bx = x + i * bw
        rows = max(1, int(h * f / 9.5))
        for r in range(rows):
            for cc in (0.26, 0.62):
                c.rect(bx + bw * 0.90 * cc, y + 4.0 + r * 9.0, bw * 0.19, 4.0,
                       stroke=0, fill=1)
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.6, INK_SOFT, "c")


def tree(c, x, y, h=30, color=OK, lw=1.1):
    c.setStrokeColor(OBJ); c.setLineWidth(lw * 1.5); c.setLineCap(0)
    c.line(x, y, x, y + h * 0.42)
    c.setFillColor(OK_SOFT); c.setStrokeColor(color); c.setLineWidth(lw)
    c.circle(x, y + h * 0.66, h * 0.30, stroke=1, fill=1)


def boxes(c, x, y, s=1.0, color=OBJ, label=None):
    """Коробки для переезда."""
    c.setStrokeColor(color); c.setLineWidth(1.1); c.setLineJoin(1)
    c.setFillColor(WHITE)
    c.rect(x, y, 20 * s, 15 * s, stroke=1, fill=1)
    c.rect(x + 21 * s, y, 15 * s, 11 * s, stroke=1, fill=1)
    c.rect(x + 3 * s, y + 15 * s, 15 * s, 12 * s, stroke=1, fill=1)
    c.setStrokeColor(SLATE); c.setLineWidth(0.85)
    c.line(x + 10 * s, y, x + 10 * s, y + 15 * s)
    c.line(x, y + 9.5 * s, x + 20 * s, y + 9.5 * s)
    c.line(x + 28.5 * s, y, x + 28.5 * s, y + 11 * s)
    c.line(x + 10.5 * s, y + 15 * s, x + 10.5 * s, y + 27 * s)
    if label:
        txt(c, x + 18 * s, y - 9.0, label, "Isb", 6.4, INK_SOFT, "c")


def road_h(c, x, y, w, h=26, color=SLATE_SOFT, dash_color=WHITE, label=None):
    """Горизонтальная дорога (вид сверху-сбоку) с прерывистой разметкой."""
    c.setFillColor(color)
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setStrokeColor(dash_color); c.setLineWidth(1.6); c.setDash([5.5, 4.5])
    c.line(x, y + h / 2, x + w, y + h / 2)
    c.setDash()
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


def road_v(c, x, y, h, w=30, color=SLATE_SOFT, dash_color=WHITE, zebra=False,
           label=None):
    """Вертикальная дорога — её переходят (для geçmek)."""
    c.setFillColor(color)
    c.rect(x, y, w, h, stroke=0, fill=1)
    if zebra:
        c.setFillColor(WHITE)
        n = 5
        sh = h / (n * 2 - 1)
        for i in range(n):
            c.rect(x + 1.5, y + i * sh * 2, w - 3.0, sh * 0.92, stroke=0, fill=1)
    else:
        c.setStrokeColor(dash_color); c.setLineWidth(1.6); c.setDash([5.5, 4.5])
        c.line(x + w / 2, y, x + w / 2, y + h)
        c.setDash()
    if label:
        txt(c, x + w / 2, y + h + 5.0, label, "Isb", 6.5, INK_SOFT, "c")


def bridge(c, x, y, w=90, color=OBJ, lw=1.2, label=None):
    c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1); c.setFillColor(WHITE)
    c.rect(x, y + 14, w, 7, stroke=1, fill=1)
    for fx in (0.14, 0.50, 0.86):
        c.line(x + w * fx, y + 14, x + w * fx, y)
    c.setStrokeColor(SLATE); c.setLineWidth(0.9)
    c.line(x, y + 21, x, y + 30); c.line(x + w, y + 21, x + w, y + 30)
    c.line(x, y + 30, x + w, y + 30)
    c.setStrokeColor(TO_SOFT); c.setLineWidth(5.0)
    c.line(x - 6, y + 4, x + w + 6, y + 4)
    if label:
        txt(c, x + w / 2, y - 9.4, label, "Isb", 6.5, INK_SOFT, "c")


# =============================================================== транспорт
def _wheels(c, pts, r, color=OBJ, lw=1.1):
    for (wx, wy) in pts:
        c.setFillColor(OBJ); c.circle(wx, wy, r, stroke=0, fill=1)
        c.setFillColor(WHITE); c.circle(wx, wy, r * 0.42, stroke=0, fill=1)


def car(c, x, y, w=58, facing=1, color=OBJ, fill=WHITE, lw=1.2, label=None,
        lab_color=None, passenger=None, taxi=False):
    """Машина в профиль. (x, y) — середина основания (уровень земли)."""
    c.saveState()
    if facing < 0:
        c.translate(2 * x, 0); c.scale(-1, 1)
    H = w * 0.30
    wr = w * 0.082
    bx = x - w / 2
    by = y + wr * 0.75
    c.setLineJoin(1); c.setLineCap(1)
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw)
    p = c.beginPath()
    p.moveTo(bx + w * 0.26, by + H * 0.80)
    p.lineTo(bx + w * 0.355, by + H * 1.62)
    p.lineTo(bx + w * 0.675, by + H * 1.62)
    p.lineTo(bx + w * 0.815, by + H * 0.80)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.roundRect(bx, by, w, H, H * 0.38, stroke=1, fill=1)
    c.setFillColor(TO_PALE); c.setStrokeColor(color); c.setLineWidth(0.85)
    p = c.beginPath()
    p.moveTo(bx + w * 0.305, by + H * 1.02); p.lineTo(bx + w * 0.375, by + H * 1.50)
    p.lineTo(bx + w * 0.495, by + H * 1.50); p.lineTo(bx + w * 0.495, by + H * 1.02)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath()
    p.moveTo(bx + w * 0.530, by + H * 1.02); p.lineTo(bx + w * 0.530, by + H * 1.50)
    p.lineTo(bx + w * 0.655, by + H * 1.50); p.lineTo(bx + w * 0.760, by + H * 1.02)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    c.setStrokeColor(SLATE); c.setLineWidth(0.8)
    c.line(bx + w * 0.49, by + H * 0.96, bx + w * 0.49, by + H * 0.16)
    c.setFillColor(FROM_SOFT); c.setStrokeColor(color); c.setLineWidth(0.8)
    c.circle(bx + w * 0.955, by + H * 0.55, w * 0.025, stroke=1, fill=1)
    _wheels(c, [(bx + w * 0.235, y + wr), (bx + w * 0.775, y + wr)], wr, color)
    if taxi:
        c.setFillColor(FROM); c.setStrokeColor(color); c.setLineWidth(0.8)
        c.rect(bx + w * 0.42, by + H * 1.62, w * 0.22, H * 0.32, stroke=1, fill=1)
        txt(c, bx + w * 0.53, by + H * 1.62 + H * 0.095, "TAKSİ", "Ib", 4.1, WHITE, "c")
    if passenger:
        c.setFillColor(passenger)
        c.circle(bx + w * 0.435, by + H * 1.24, w * 0.040, stroke=0, fill=1)
    c.restoreState()
    if label:
        txt(c, x, y - 10.0, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return by + H * 1.62


def bus(c, x, y, w=78, facing=1, color=OBJ, fill=WHITE, lw=1.2, label="OTOBÜS",
        lab_color=None, show_door=True, passengers=0, door_open=False):
    """Автобус в профиль; дверь всегда ближе к «хвосту» по ходу движения."""
    c.saveState()
    if facing < 0:
        c.translate(2 * x, 0); c.scale(-1, 1)
    H = w * 0.44
    wr = w * 0.065
    bx = x - w / 2
    by = y + wr * 0.80
    c.setLineJoin(1)
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw)
    c.roundRect(bx, by, w, H, H * 0.17, stroke=1, fill=1)
    wy, wh = by + H * 0.46, H * 0.36
    c.setFillColor(TO_PALE); c.setStrokeColor(color); c.setLineWidth(0.85)
    c.rect(bx + w * 0.855, wy, w * 0.105, wh, stroke=1, fill=1)      # лобовое
    win_x = [0.055, 0.175, 0.295, 0.585, 0.705]
    for i, f in enumerate(win_x):
        c.rect(bx + w * f, wy, w * 0.105, wh, stroke=1, fill=1)
        if i < passengers:
            c.setFillColor(SLATE)
            c.circle(bx + w * (f + 0.0525), wy + wh * 0.46, w * 0.027, stroke=0, fill=1)
            c.setFillColor(TO_PALE)
    if show_door:
        dx, dw = bx + w * 0.415, w * 0.135
        c.setFillColor(PANEL_WARM if door_open else PANEL)
        c.setStrokeColor(color); c.setLineWidth(0.95)
        c.rect(dx, by + H * 0.07, dw, H * 0.72, stroke=1, fill=1)
        c.setStrokeColor(SLATE); c.setLineWidth(0.75)
        if door_open:
            c.line(dx + dw * 0.22, by + H * 0.07, dx + dw * 0.22, by + H * 0.79)
            c.line(dx + dw * 0.78, by + H * 0.07, dx + dw * 0.78, by + H * 0.79)
        else:
            c.line(dx + dw * 0.5, by + H * 0.07, dx + dw * 0.5, by + H * 0.79)
    _wheels(c, [(bx + w * 0.215, y + wr), (bx + w * 0.79, y + wr)], wr, color)
    c.restoreState()
    if label:
        txt(c, x, y - 10.0, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return by + H


def train(c, x, y, w=96, facing=1, color=OBJ, fill=WHITE, lw=1.2, label="TREN",
          lab_color=None, metro=False, rails=True):
    """Поезд: вагон + локомотив со скруглённым носом по ходу движения."""
    c.saveState()
    if facing < 0:
        c.translate(2 * x, 0); c.scale(-1, 1)
    H = w * 0.30
    wr = w * 0.042
    bx = x - w / 2
    by = y + wr * 1.5
    c.setLineJoin(1)
    lw_ = w * 0.44
    cw = w * 0.50
    lx = bx + w - lw_
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw)
    p = c.beginPath()
    p.moveTo(lx, by)
    p.lineTo(lx + lw_ * 0.72, by)
    p.curveTo(lx + lw_ * 0.95, by, lx + lw_, by + H * 0.42, lx + lw_, by + H * 0.66)
    p.curveTo(lx + lw_, by + H * 0.90, lx + lw_ * 0.94, by + H, lx + lw_ * 0.86, by + H)
    p.lineTo(lx, by + H)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    c.roundRect(bx, by, cw, H, 2.2, stroke=1, fill=1)
    c.setStrokeColor(color); c.setLineWidth(1.3); c.setLineCap(0)
    c.line(bx + cw, by + H * 0.30, lx, by + H * 0.30)
    c.setFillColor(TO_PALE); c.setStrokeColor(color); c.setLineWidth(0.8)
    for i in range(3):
        c.rect(bx + cw * (0.10 + i * 0.28), by + H * 0.46, cw * 0.17, H * 0.34,
               stroke=1, fill=1)
    c.rect(lx + lw_ * 0.18, by + H * 0.46, lw_ * 0.20, H * 0.34, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(lx + lw_ * 0.52, by + H * 0.46); p.lineTo(lx + lw_ * 0.52, by + H * 0.80)
    p.lineTo(lx + lw_ * 0.74, by + H * 0.80); p.lineTo(lx + lw_ * 0.80, by + H * 0.46)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    pts = [(bx + cw * f, y + wr) for f in (0.18, 0.78)] + \
          [(lx + lw_ * f, y + wr) for f in (0.20, 0.78)]
    _wheels(c, pts, wr, color)
    if rails:
        c.setStrokeColor(SLATE); c.setLineWidth(1.4)
        c.line(bx - 9, y, bx + w + 9, y)
        c.setLineWidth(0.8); c.setStrokeColor(SLATE_SOFT)
        for i in range(9):
            xx = bx - 7 + i * (w + 14) / 8
            c.line(xx, y - 2.8, xx, y + 1.2)
    if metro:
        c.setFillColor(TO)
        c.circle(lx + lw_ * 0.45, by + H * 0.20, w * 0.030, stroke=0, fill=1)
        txt(c, lx + lw_ * 0.45, by + H * 0.20 - 2.1, "M", "Ib", 5.4, WHITE, "c")
    c.restoreState()
    if label:
        txt(c, x, y - 11.4, label, "Isb", 6.6, lab_color or INK_SOFT, "c")
    return by + H


def plane(c, x, y, w=76, facing=1, color=OBJ, fill=WHITE, lw=1.2, label=None,
          lab_color=None, tilt=0.0):
    """Самолёт (вид сбоку). (x, y) — центр фюзеляжа."""
    c.saveState()
    c.translate(x, y)
    if tilt:
        c.rotate(tilt)
    if facing < 0:
        c.scale(-1, 1)
    H = w * 0.150
    c.setLineJoin(1); c.setLineCap(1)
    c.setFillColor(fill); c.setStrokeColor(color); c.setLineWidth(lw)
    p = c.beginPath()
    p.moveTo(-w * 0.50, -H * 0.10)
    p.lineTo(-w * 0.455, H * 0.44)
    p.lineTo(w * 0.20, H * 0.48)
    p.curveTo(w * 0.42, H * 0.44, w * 0.50, H * 0.18, w * 0.50, -0.02 * H)
    p.curveTo(w * 0.50, -H * 0.22, w * 0.40, -H * 0.48, w * 0.18, -H * 0.50)
    p.lineTo(-w * 0.44, -H * 0.44)
    p.close()
    c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath()                                   # киль
    p.moveTo(-w * 0.455, H * 0.40); p.lineTo(-w * 0.425, H * 1.42)
    p.lineTo(-w * 0.255, H * 0.46); p.close()
    c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath()                                   # стабилизатор
    p.moveTo(-w * 0.455, -H * 0.30); p.lineTo(-w * 0.395, -H * 0.86)
    p.lineTo(-w * 0.275, -H * 0.86); p.lineTo(-w * 0.300, -H * 0.36); p.close()
    c.setFillColor(PANEL); c.drawPath(p, fill=1, stroke=1)
    p = c.beginPath()                                   # крыло
    p.moveTo(w * 0.02, -H * 0.34); p.lineTo(-w * 0.145, -H * 1.22)
    p.lineTo(-w * 0.015, -H * 1.24); p.lineTo(w * 0.165, -H * 0.38); p.close()
    c.setFillColor(SLATE_SOFT); c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(TO_PALE); c.setStrokeColor(color); c.setLineWidth(0.7)
    for i in range(5):
        c.circle(-w * 0.30 + i * w * 0.100, H * 0.06, H * 0.115, stroke=1, fill=1)
    p = c.beginPath()                                   # кабина
    p.moveTo(w * 0.295, H * 0.22); p.lineTo(w * 0.415, H * 0.16)
    p.lineTo(w * 0.395, -H * 0.06); p.lineTo(w * 0.285, -H * 0.02); p.close()
    c.drawPath(p, fill=1, stroke=1)
    c.restoreState()
    if label:
        txt(c, x, y - w * 0.30, label, "Isb", 6.6, lab_color or INK_SOFT, "c")


def bicycle(c, x, y, w=48, facing=1, color=OBJ, lw=1.25, label=None):
    """Велосипед в профиль."""
    c.saveState()
    if facing < 0:
        c.translate(2 * x, 0); c.scale(-1, 1)
    r = w * 0.225
    bx = x - w / 2
    rw = (bx + r, y + r)                 # заднее колесо
    fw = (bx + w - r, y + r)             # переднее колесо
    bb = (bx + w * 0.44, y + r * 0.42)   # каретка
    st = (bx + w * 0.345, y + r * 2.05)  # седло
    ht = (bx + w * 0.735, y + r * 1.95)  # руль
    c.setStrokeColor(color); c.setLineWidth(lw * 0.85); c.setLineCap(1); c.setLineJoin(1)
    c.circle(rw[0], rw[1], r, stroke=1, fill=0)
    c.circle(fw[0], fw[1], r, stroke=1, fill=0)
    c.setLineWidth(lw * 1.25)
    c.line(rw[0], rw[1], bb[0], bb[1])        # нижние перья
    c.line(rw[0], rw[1], st[0], st[1])        # подседельные перья
    c.line(bb[0], bb[1], st[0], st[1])        # подседельная труба
    c.line(st[0], st[1], ht[0], ht[1])        # верхняя труба
    c.line(bb[0], bb[1], ht[0], ht[1])        # нижняя труба
    c.line(ht[0], ht[1], fw[0], fw[1])        # вилка
    c.setLineWidth(lw * 1.1)
    c.line(ht[0] - w * 0.055, ht[1] + w * 0.045, ht[0] + w * 0.045, ht[1] + w * 0.015)
    c.line(st[0] - w * 0.055, st[1], st[0] + w * 0.045, st[1])
    c.setFillColor(color)
    c.circle(bb[0], bb[1], w * 0.030, stroke=0, fill=1)
    c.restoreState()
    if label:
        txt(c, x, y - 10.0, label, "Isb", 6.5, INK_SOFT, "c")


def stop_sign(c, x, y, label="DURAK", color=OBJ, lw=1.1):
    """Знак автобусной остановки."""
    c.setStrokeColor(color); c.setLineWidth(lw * 1.3); c.setLineCap(0)
    c.line(x, y, x, y + 30)
    c.setFillColor(WHITE); c.setStrokeColor(color); c.setLineWidth(lw)
    c.roundRect(x - 13, y + 30, 26, 13, 2.0, stroke=1, fill=1)
    txt(c, x, y + 34.2, label, "Isb", 5.6, INK_SOFT, "c")


def airport(c, x, y, w=70, color=OBJ, lw=1.15, label="HAVAALANI"):
    c.setFillColor(WHITE); c.setStrokeColor(color); c.setLineWidth(lw); c.setLineJoin(1)
    c.rect(x - w / 2, y, w, w * 0.26, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(x - w / 2, y + w * 0.26); p.lineTo(x - w * 0.34, y + w * 0.40)
    p.lineTo(x + w * 0.34, y + w * 0.40); p.lineTo(x + w / 2, y + w * 0.26)
    p.close(); c.drawPath(p, fill=1, stroke=1)
    c.setFillColor(TO_PALE); c.setStrokeColor(color); c.setLineWidth(0.8)
    for i in range(4):
        c.rect(x - w * 0.36 + i * w * 0.20, y + w * 0.07, w * 0.13, w * 0.12,
               stroke=1, fill=1)
    c.setStrokeColor(color); c.setLineWidth(1.0)
    c.line(x + w * 0.30, y + w * 0.40, x + w * 0.30, y + w * 0.58)
    c.setFillColor(SLATE_SOFT); c.setStrokeColor(color); c.setLineWidth(0.9)
    c.circle(x + w * 0.30, y + w * 0.63, w * 0.055, stroke=1, fill=1)
    if label:
        txt(c, x, y - 9.6, label, "Isb", 6.5, INK_SOFT, "c")
