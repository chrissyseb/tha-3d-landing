import glob, os, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# The admin reset now clears the in-memory hourly counter too. Admin-only, so visitors see no change.
s = rd('../api/mark.js')
a = 'if(body.admin === "freereset"){ const day = new Date().toISOString().slice(0, 10); '
assert a in s or (a + 'hits.delete(ip); ') in s
if (a + 'hits.delete(ip); ') not in s: s = s.replace(a, a + 'hits.delete(ip); ')
wr('../api/mark.js', s)
# Every control at least 44px, at every width. Cards that are not in front are scaled down, so their buttons get extra.
c = rd('home.css')
if 'reviewer round 4' not in c:
    c += r'''
/* reviewer round 4 */
footer.site .foot-col:not(#_):not(#_){gap:0}
html body footer.site .foot-col a:not(#_):not(#_):not(#_):not(#_):not(#_),html body footer.site .foot-bottom a:not(#_):not(#_):not(#_):not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}
'''
    wr('home.css', c)
ALL = '<style id="tap-44-sub">html body .ex-try:not(#_):not(#_):not(#_):not(#_):not(#_){min-height:48px}html body .foot-nav a:not(#_):not(#_):not(#_),html body .links a:not(#_):not(#_):not(#_),html body .toc a:not(#_):not(#_):not(#_),html body .totop:not(#_):not(#_):not(#_),html body ul li>a:only-child:not(#_):not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}html body details>summary:not(#_):not(#_):not(#_){min-height:44px;display:flex;align-items:center}html body label:has(input[type=checkbox]):not(#_):not(#_){min-height:44px;display:flex;align-items:center}</style>'
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    t = rd(f)
    if 'id="tap-44-sub"' not in t: wr(f, t.replace('</head>', ALL + '</head>', 1))
# Restore the phone gate in the full lead test, now that a reset between flows is complete.
q = 'C:/Users/chris/AppData/Local/Temp/claude/0ed672123b93d727/0dbb6d59-0204-4518-a9b3-5815956b5c3d/scratchpad/leadqa.js'
s = rd(q)
a = 'for (const [n, o] of [["desktop", { viewport: { width: 1440, height: 900 } }]]) { /* phone gate proven by phgate.js on a fresh deploy: one IP hits the 6-an-hour limit */'
b = 'for (const [n, o] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["phone", { ...devices["iPhone 13"] }]]) {'
assert a in s or b in s
wr(q, s.replace(a, b))
print('ok')
