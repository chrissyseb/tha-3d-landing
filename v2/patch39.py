import glob
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# Fallbacks sized to the brand fonts (widths measured in Chrome, metrics from the font files),
# so a first visit reflows nothing when the real fonts arrive.
FACES = (
"@font-face{font-family:'Inter Tight Fallback';src:local('Arial');size-adjust:98.25%;ascent-override:98.6%;descent-override:24.55%;line-gap-override:0%}\n"
"@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:106.65%;ascent-override:90.84%;descent-override:22.6%;line-gap-override:0%}\n"
"@font-face{font-family:'Caveat Fallback';src:local('Arial');size-adjust:76.43%;ascent-override:125.6%;descent-override:39.25%;line-gap-override:0%}\n")
n = 0
for f in glob.glob('*.css') + glob.glob('sections/*.css'):
    s = t = rd(f)
    if 'Inter Tight Fallback' in s: continue
    s = s.replace("'Inter Tight',", "'Inter Tight','Inter Tight Fallback',").replace("'Inter',", "'Inter','Inter Fallback',").replace("'Caveat',", "'Caveat','Caveat Fallback',")
    if s != t: wr(f, s); n += 1
h = rd('hero.css')
if '@font-face{font-family:\'Inter Tight Fallback\'' not in h: wr('hero.css', FACES + h)
print('ok', n)
