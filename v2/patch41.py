import glob, os
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
FIX = [('Ask about one-to-One lessons', 'Ask about one-to-one lessons'), ('Do you offer one-To-One lessons?', 'Do you offer one-to-one lessons?'),
 ('Choose your Paper', 'Choose your paper'), ('Marking guides by Paper', 'Marking guides by paper'), ('Sample results for each Paper', 'Sample results for each paper'),
 ('Holiday Masterclasses, november to december 2026', 'Holiday Masterclasses, November to December 2026'), ('Weekly group classes from january 2027', 'Weekly group classes from January 2027'),
 ('Share with 7 people. get a free detailed report.', 'Share with 7 people. Get a free detailed report.'), ('Thank you! your detailed report', 'Thank you! Your detailed report'),
 ('</svg>Timed Mode<', '</svg>Timed mode<')]
TAP_ALL = '<style id="tap-44-all">html body button:not(.sn-burger):not(#_):not(#_),html body .ex-try:not(#_):not(#_),html body .role-go:not(#_):not(#_),html body .btn:not(#_):not(#_),html body .linkbtn:not(#_):not(#_),html body .sn-pill:not(#_):not(#_),html body .topcta:not(#_):not(#_),html body .topghost:not(#_):not(#_){min-height:44px}html body a.ex-try:not(#_):not(#_),html body a.role-go:not(#_):not(#_),html body a.linkbtn:not(#_):not(#_),html body a.sn-pill:not(#_):not(#_){display:inline-flex;align-items:center}html body .brand:not(#_):not(#_){min-height:44px;align-items:center}html body .sn-links a:not(#_):not(#_){padding-top:12px;padding-bottom:12px}</style>'
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    s = t = rd(f)
    for a, b in FIX: s = s.replace(a, b)
    if 'id="tap-44-all"' not in s: s = s.replace('</head>', TAP_ALL + '</head>', 1)
    if s != t: wr(f, s)
s = rd('../app.js'); wr('../app.js', s.replace('.textContent = "Timed Mode"', '.textContent = "Timed mode"'))
s = rd('motion-pause.js')
a = 'html.motion-paused *::after{animation-play-state:paused!important}'
b = a + 'html.motion-paused body .brand-orb::before{animation-play-state:paused!important}'
assert a in s
if b not in s: s = s.replace(a, b)
wr('motion-pause.js', s)
c = rd('home.css')
if 'reviewer round 3' not in c:
    c += r'''
/* reviewer round 3: every control at least 44px */
#crest .crest-pause:not(#_):not(#_){min-height:44px}
html body .brand:not(#_):not(#_):not(#_){min-height:44px;align-items:center}
html body button:not(.burger):not(.paper-opt):not(#_):not(#_):not(#_),html body .btn:not(#_):not(#_):not(#_){min-height:44px}
#handin details>summary:not(#_):not(#_){min-height:44px;display:flex;align-items:center}
.nav-links a:not(#_):not(#_){padding-top:12px;padding-bottom:12px}
#pricing a[href*="comparison"]:not(#_),#pricing .pr-more:not(#_){display:inline-flex;min-height:44px;align-items:center}
'''
wr('home.css', c)
print('ok')
