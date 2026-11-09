import glob, os
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# Links inside paragraphs: bigger hit area with padding only, so no line moves.
PAD = 'html body p a:not(#_):not(#_):not(#_){padding-top:12px;padding-bottom:12px}'
FIX = [('Holiday Masterclasses, November to December 2026', 'Holiday masterclasses, November to December 2026'),
 ('Humanities Essay and Case Study Bootcamp', 'Humanities essay and case study bootcamp'),
 ('>Writing Analytics<', '>Writing analytics<'), ('>Framework Audit<', '>Framework audit<'),
 ('>Mark an Essay<', '>Mark an essay<'), ('>PSLE Composition<', '>PSLE composition<'), ('>PSLE Situational Writing<', '>PSLE situational writing<')]
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    s = t = rd(f)
    for a, b in FIX: s = s.replace(a, b)
    if PAD not in s: s = s.replace('<style id="tap-44-sub">', '<style id="tap-44-sub">' + PAD, 1)
    if s != t: wr(f, s)
c = rd('home.css')
if 'reviewer round 5' not in c:
    c += '\n/* reviewer round 5 */\n' + PAD.replace('html body p a', 'html body #pricing p a') + '\n'
    wr('home.css', c)
s = rd('motion-pause.js')
a = 'html.motion-paused body .brand-orb::before{animation-play-state:paused!important}'
b = 'html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_),html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_)::before,html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_)::after{animation-play-state:paused!important}.motion-toggle:focus-visible{outline:2px solid currentColor;outline-offset:2px}'
assert a in s or b in s
wr('motion-pause.js', s.replace(a, b))
print('ok')
