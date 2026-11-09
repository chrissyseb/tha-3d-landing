import glob, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def must(p, a, b):
    s = rd(p); assert a in s or b in s, a[:60]; wr(p, s.replace(a, b))
# One clear price block.
s = rd('sections/pricing.html')
s = re.sub(r'\s*<p class="pr-fact"[^>]*>.*?</p>', '', s, count=1, flags=re.S)
s = s.replace('<span>S$39 for 4 detailed reports.</span> Marked by', '<span>S$39 for 4 detailed reports, under S$10 an essay.</span> Marked by')
s = s.replace('Get 4 detailed reports · S$39</a><p class="plan-note">', 'Get 4 detailed reports</a><p class="plan-note">')
wr('sections/pricing.html', s)
# Marks stay on screen: the pen draws; nothing fades.
s = rd('hero.js')
s = s.replace('''      .fromTo(q(".ring span"), {opacity: 0}, {opacity: 1, duration: .4}, "<.2")\n''', '')
s = s.replace('''      .fromTo(q(".grade"), {opacity: 0}, {opacity: 1, duration: .4}, "-=.2")\n''', '')
s = s.replace('''.fromTo(q(".bar i"), {scaleX: 0}, {scaleX: 1, duration: .7, stagger: .1, ease: "expo.out"}, "<")''', '''.fromTo(q(".bar i"), {scaleX: 0}, {scaleX: 1, duration: .7, stagger: .1, ease: "expo.out"}, "-=.3")''')
s = s.replace('''\n      .fromTo(q(".fix"), {opacity: 0}, {opacity: 1, duration: .5}, "-=.3");''', ';')
s = s.replace('window.gsap.fromTo(pane, {opacity: 0}, {opacity: 1, duration: .3, ease: "power1.out", clearProps: "opacity"});', 'window.gsap.fromTo(pane, {y: 6}, {y: 0, duration: .3, ease: "power1.out", clearProps: "transform"});')
wr('hero.js', s)
TM = 'font-size:max(10px,calc(var(--logo-h)*.3))!important'
OLD = 'font-size:max(7px,calc(var(--logo-h)*.24))!important'
SUB = 'html body .sn-in:not(#_):not(#_){box-sizing:border-box;width:min(1240px,calc(100% - 48px))!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}'
for f in glob.glob('../*.html'):
    t = rd(f); n = t.replace(OLD, TM)
    if not f.replace('\\', '/').endswith('index.html') and 'id="logo-pos"' not in n:
        n = n.replace('</head>', '<style id="logo-pos">' + SUB + '</style></head>', 1)
    if n != t: wr(f, n)
c = rd('home.css').replace(OLD, TM)
if 'reviewer fixes' not in c:
    c += r'''
/* reviewer fixes */
#handin .paper-opt:not(#_):not(#_):not(#_){border:1px solid #8E8A84}
#handin .paper-opt[aria-pressed="true"]:not(#_):not(#_):not(#_){border-color:#111}
/* headings on the page ground, so the soft gradient reaches 3:1 */
#masterclasses .classes-grid:not(#_):not(#_){background:#fff}
#closing:not(#_):not(#_),#closing>*:not(#_):not(#_){background:#fff}
#masterclasses .classes-side h2:not(#_){background-color:transparent}
'''
wr('home.css', c)
print('ok')
