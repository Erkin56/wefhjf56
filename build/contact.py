import sys; sys.path.insert(0, "/home/user/wefhjf56")
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Spacer, Paragraph
from book.theme import *
register_fonts()
S = build_styles()
import book.figures as F
from book.scene import Scene

OUT = "/tmp/claude-0/-home-user-wefhjf56/5951aaae-395c-5de6-89c2-f9316a8be902/scratchpad/contact.pdf"
only = sys.argv[1:] if len(sys.argv) > 1 else None
doc = BaseDocTemplate(OUT, pagesize=(PAGE_W, PAGE_H), leftMargin=M_IN,
                      rightMargin=M_OUT, topMargin=M_TOP, bottomMargin=M_BOT)
frame = Frame(M_IN, M_BOT, COL_W, PAGE_H - M_TOP - M_BOT, id="f",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id="p", frames=[frame])])
story = []
names = only or list(F.FIGS.keys())
for n in names:
    story.append(Paragraph("· " + n, S["h3"]))
    story.append(F.S(n))
    story.append(Spacer(1, 11))
doc.build(story)
print("ok", OUT)
