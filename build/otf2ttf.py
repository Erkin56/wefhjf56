"""Convert Inter OTF (CFF outlines) to TTF (quadratic glyf) so ReportLab can embed it."""
import os, sys
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen

MAX_ERR = 1.0

def glyphs_to_quadratic(glyphs, max_err):
    quad = {}
    for name in glyphs.keys():
        glyph = glyphs[name]
        ttpen = TTGlyphPen(glyphs)
        glyph.draw(Cu2QuPen(ttpen, max_err, reverse_direction=True))
        quad[name] = ttpen.glyph()
    return quad

def update_hmtx(font, glyf):
    hmtx = font["hmtx"]
    for name, glyph in glyf.glyphs.items():
        if hasattr(glyph, "xMin"):
            hmtx[name] = (hmtx[name][0], glyph.xMin)

def otf_to_ttf(font, max_err=MAX_ERR, post_format=2.0):
    assert font.sfntVersion == "OTTO"
    assert "CFF " in font
    order = font.getGlyphOrder()
    font["loca"] = newTable("loca")
    font["glyf"] = glyf = newTable("glyf")
    glyf.glyphOrder = order
    glyf.glyphs = glyphs_to_quadratic(font.getGlyphSet(), max_err)
    del font["CFF "]
    glyf.compile(font)
    update_hmtx(font, glyf)
    font["maxp"] = maxp = newTable("maxp")
    maxp.tableVersion = 0x00010000
    maxp.maxZones = 1
    maxp.maxTwilightPoints = 0
    maxp.maxStorage = 0
    maxp.maxFunctionDefs = 0
    maxp.maxInstructionDefs = 0
    maxp.maxStackElements = 0
    maxp.maxSizeOfInstructions = 0
    maxp.maxComponentElements = max(
        (len(g.components) for g in glyf.glyphs.values() if g.isComposite()), default=0)
    maxp.compile(font)
    post = font["post"]
    post.formatType = post_format
    post.extraNames = []
    post.mapping = {}
    post.glyphOrder = order
    try:
        post.compile(font)
    except OverflowError:
        post.formatType = 3
    for tag in ("VORG", "CFF2", "BASE", "JSTF"):
        if tag in font:
            del font[tag]
    font.sfntVersion = "\000\001\000\000"

SRC = "/usr/share/fonts/opentype/inter"
DST = sys.argv[1] if len(sys.argv) > 1 else "/home/user/wefhjf56/build/fonts"
WANT = ["Inter-Regular", "Inter-Medium", "Inter-SemiBold", "Inter-Bold",
        "Inter-Light", "Inter-Italic", "Inter-MediumItalic", "Inter-BoldItalic",
        "Inter-ExtraBold", "InterDisplay-Bold", "InterDisplay-SemiBold",
        "InterDisplay-ExtraBold", "InterDisplay-Medium"]
os.makedirs(DST, exist_ok=True)
for base in WANT:
    src = os.path.join(SRC, base + ".otf")
    out = os.path.join(DST, base + ".ttf")
    f = TTFont(src)
    otf_to_ttf(f)
    f.save(out)
    print("ok", base, os.path.getsize(out))
