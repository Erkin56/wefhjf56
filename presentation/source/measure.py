import sys
from fontTools.ttLib import TTFont
FONTS = {}
def width_in(text, font, pt, spacing_pt=0.0):
    if font not in FONTS:
        t = TTFont(font)
        FONTS[font] = (t.getBestCmap(), t['hmtx'], t['head'].unitsPerEm)
    cmap, hmtx, upm = FONTS[font]
    w = 0
    for ch in text:
        g = cmap.get(ord(ch))
        w += hmtx[g][0] if g else upm * 0.5
    return (w / upm * pt + spacing_pt * len(text)) / 72.0
if __name__ == '__main__':
    F = sys.argv[1]
    tests = [
        ('PlayfairDisplay-400.ttf', 36, 0, 'Наследие Узбекистана на языке моды'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Дизайнер костюма из Ташкента'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Код культуры в каждом образе'),
        ('PlayfairDisplay-400.ttf', 50, 0, '«Код Бехзода»'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Стажировка в NABA, Милан'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Член Санкт-Петербургского'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'союза дизайнеров'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'От подиума до музейных залов'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Более 10 конкурсных наград'),
        ('PlayfairDisplay-400.ttf', 36, 0, 'Чему я научилась и куда иду'),
        ('PlayfairDisplay-400.ttf', 78, 0, 'Мохинур'),
        ('PlayfairDisplay-400.ttf', 78, 0, 'Комолова'),
        ('PlayfairDisplay-400i.ttf', 22, 0, 'Код культуры в современном костюме'),
        ('Montserrat-700.ttf', 11, 3, 'ДОСТИЖЕНИЕ 03 · ПРОФЕССИОНАЛЬНОЕ ПРИЗНАНИЕ'),
        ('Montserrat-700.ttf', 11, 3, 'НОМИНАЦИЯ «ВДОХНОВЛЕННЫЕ ТВОРЧЕСТВОМ»'),
        ('PlayfairDisplay-400i.ttf', 96, 0, 'Рахмат!'),
        ('PlayfairDisplay-400.ttf', 40, 0, 'Спасибо за внимание'),
    ]
    for f, pt, sp, t in tests:
        print(f'{width_in(t, F + "/" + f, pt, sp):6.2f} in  {pt}pt  {t}')
