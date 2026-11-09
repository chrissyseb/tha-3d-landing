import glob, re, os
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p); assert a in s or b in s, (p, a[:60]); wr(p, s.replace(a, b))

# ---------- sub-pages: same nav and WhatsApp button as home ----------
NAV = '<div class="sn-links" id="snLinks"><a href="/#sample-report">Sample report</a><a href="/#pricing">Pricing</a><a href="/#masterclasses">Masterclasses</a><a href="/about.html">About</a><a href="/#faq">FAQ</a></div>'
WA_OLD = re.compile(r'\.wa-float\{position:fixed;right:16px;bottom:16px;.*?\.wa-float svg\{width:22px;height:22px;fill:#fff\}', re.S)
WA_NEW = '.wa-float{position:fixed;right:24px;bottom:24px;z-index:60;width:48px;height:48px;border-radius:50%;background:#1F7A4D;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(17,17,17,.2);padding:0}.wa-float span{display:none!important}.wa-float svg{width:22px;height:22px;fill:#fff}'
WA_M_OLD = '.wa-float{bottom:88px;right:12px;padding:12px}.wa-float span{display:none}'
WA_M_NEW = '.wa-float{bottom:88px;right:16px;width:44px;height:44px}'
TAP = '<style id="tap-44">@media (max-width:899px){html body .foot-nav a:not(#_):not(#_),html body .foot-bottom a:not(#_):not(#_),html body .foot-col a:not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}html body .sn-links a:not(#_):not(#_){min-height:44px;display:flex;align-items:center}}</style>'
SCRIPT = '<script src="/v2/motion-pause.js" defer></script>'

# ---------- sentence case on sub-page headings and buttons ----------
KEEP = {'PSLE','O-Level','A-Level','GP','IB','IGCSE','SEAB','Cambridge','Singapore','English','Literature','Humanities','EssayLabsg','EssayLabsg™','EssayLab','AL','SBQ','AQ','WhatsApp','PayNow','I','FAQ','FAQs','AI','PDF','Masterclass','Masterclasses','SA2','P1','P2','Stripe','Google','Paper','Lang','Lit','JC'}
PROTECT = ['Exam Preparation Specialists', 'Thinking Hack', 'General Paper', 'Social Studies', 'Paper 1', 'Paper 2']
def sentence(t):
    m = {}
    for i, p in enumerate(PROTECT):
        if p in t: k = 'zq%dq' % i; t = t.replace(p, k); m[k] = p
    out = []
    for i, w in enumerate(t.split(' ')):
        core = w.strip('?,.:;!()"’“”')
        if i and core and core[0].isupper() and core not in KEEP and not core.isupper():
            w = w.replace(core, core[0].lower() + core[1:], 1)
        out.append(w)
    t = ' '.join(out)
    for k, p in m.items(): t = t.replace(k, p)
    return t
def caps(t): return sum(1 for w in t.split()[1:] if w[:1].isupper() and w.strip('?,.:;!') not in KEEP)
changed = []
def fix(m):
    a, t, b = m.group(1), m.group(2), m.group(3)
    if caps(t) < 1 or '{' in t or '$' in t: return m.group(0)
    n = sentence(t)
    if n != t: changed.append(t + '  ->  ' + n)
    return a + n + b
HEAD = re.compile(r'(<h[1-4]\b[^>]*>)([^<]{3,120})(</h[1-4]>)')
BTN = re.compile(r'(<(?:a|button)\b[^>]*>)([A-Z][^<]{3,60})(</(?:a|button)>)')
def split_body(s):
    i = s.find('<body'); i = i if i >= 0 else 0
    return s[:i], s[i:]
for f in glob.glob('../*.html'):
    name = os.path.basename(f)
    if name == 'index.html': continue
    s = rd(f)
    s, n = re.subn(r'<div class="sn-links" id="snLinks">.*?</div>', NAV, s, count=1, flags=re.S); assert n == 1, name
    s, n = WA_OLD.subn(WA_NEW, s); assert n or WA_NEW in s, name
    s = s.replace(WA_M_OLD, WA_M_NEW)
    if 'id="tap-44"' not in s: s = s.replace('</head>', TAP + '</head>', 1)
    if SCRIPT not in s: s = s.replace('</body>', SCRIPT + '</body>', 1)
    if name not in ('terms.html', 'privacy.html'):
        h, b = split_body(s)
        b = HEAD.sub(fix, b); b = BTN.sub(fix, b)
        s = h + b
    if name == 'app.html':
        s = s.replace('Essays, <em>Marked<svg', 'Essays, <em>marked<svg').replace('</em> Like the Real Exam</h1>', '</em> like the real exam</h1>')
        s = s.replace('app.js?v=ec5', 'app.js?v=ec6')
    wr(f, s)
wr('sentence-case-changes.txt', '\n'.join(sorted(set(changed))))
print('sentence-case changes', len(set(changed)))

# ---------- the app script error ----------
s = rd('../app.js')
a = 'if(chData && chData.marked >= 20){ $("#community").textContent = `${chData.marked} students marked essays with us this week`; $("#community").hidden = false; }'
b = 'const cm = $("#community"); if(cm && chData && chData.marked >= 20){ cm.textContent = `${chData.marked} students marked essays with us this week`; cm.hidden = false; }'
assert a in s or b in s; s = s.replace(a, b)
a = 'if(chData && chData.wk) $("#chWeek").textContent ='
b = 'const cw = $("#chWeek"); if(cw && chData && chData.wk) cw.textContent ='
assert a in s or b in s; s = s.replace(a, b)
wr('../app.js', s)

# ---------- crest logos wait until needed ----------
s = rd('sections/crest.html')
if 'loading="lazy"' not in s: s = s.replace('decoding="async">', 'loading="lazy" decoding="async">')
wr('sections/crest.html', s)

# ---------- pause control for the moving logo and banner ----------
wr('motion-pause.js', r'''/* A small footer control that pauses the logo ring and banner. They run by default. */
(function () {
  var KEY = "el-motion-paused", root = document.documentElement, paused = false;
  try { paused = localStorage.getItem(KEY) === "1"; } catch (e) {}
  var st = document.createElement("style");
  st.textContent = "html.motion-paused *,html.motion-paused *::before,html.motion-paused *::after{animation-play-state:paused!important}.motion-toggle{display:inline-flex;align-items:center;min-height:44px;padding:0;border:0;background:none;color:inherit;font:inherit;font-size:14px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}";
  document.head.appendChild(st);
  function ready() {
    var host = document.querySelector("footer .foot-bottom"); if (!host) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "motion-toggle";
    function show() { root.classList.toggle("motion-paused", paused); b.textContent = paused ? "Play animation" : "Pause animation"; b.setAttribute("aria-pressed", paused ? "true" : "false"); }
    b.addEventListener("click", function () { paused = !paused; try { localStorage.setItem(KEY, paused ? "1" : "0"); } catch (e) {} show(); });
    show(); host.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
''')

# ---------- home: tap sizes, form column, phone spacing ----------
sub('hero.css', '.btn-sm{height:40px;', '.btn-sm{height:44px;')
c = rd('home.css')
if 'reviewer round 2' not in c:
    c += r'''
/* reviewer round 2 */
.classes-more:not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}
#handin .teach-ok:not(#_):not(#_){min-height:44px;align-items:center}
#handin label[for="photo"]:not(#_),#handin label:has(input[type=file]):not(#_){display:inline-flex;min-height:44px;align-items:center}
.hand-gets{margin:32px 0 0;padding:0;list-style:none;font:400 var(--type-fs-body)/24px var(--font-body);color:var(--ink)}
.hand-gets li{padding:8px 0}
.hand-photo{position:relative;margin:24px 0 0;max-width:100%}
.hand-photo img{display:block;width:100%;height:auto;border-radius:16px}
@media (max-width:899px){
 .hand-gets,.hand-photo{display:none}
 #how-it-works:not(#_):not(#_):not(#_),#handin:not(#_):not(#_):not(#_),#sample-report:not(#_):not(#_):not(#_),#reviews:not(#_):not(#_):not(#_),#pricing:not(#_):not(#_):not(#_),#faq:not(#_):not(#_):not(#_){padding-top:64px}
 #masterclasses:not(#_):not(#_):not(#_){margin-top:64px}
 #closing:not(#_):not(#_):not(#_){margin-top:64px;padding-top:64px;padding-bottom:64px}
 footer.site:not(#_):not(#_):not(#_){padding-top:64px}
 footer.site .foot-grid:not(#_):not(#_){grid-template-columns:repeat(2,minmax(0,1fr));gap:32px 16px}
 footer.site .foot-brand:not(#_):not(#_){grid-column:1/-1}
 footer.site .foot-col a:not(#_):not(#_):not(#_):not(#_):not(#_),footer.site .foot-bottom a:not(#_):not(#_):not(#_):not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}
 .brand:not(#_):not(#_){min-height:44px;align-items:center}
}
'''
wr('home.css', c)

# ---------- build: form column and pause script on home ----------
s = rd('build.py')
MARK = "io.open('../index.html', 'w', encoding='utf-8', newline='\\n').write(head + body)"
assert MARK in s
if 'hand-gets' not in s:
    s = s.replace(MARK, r'''GETS = '<ul class="hand-gets"><li>An estimated score, band and grade</li><li>A mark and a short comment for each criterion</li><li>Your most important improvement, highlighted on your essay</li><li>One free re-mark after you revise it</li><li>Ready in about a minute</li></ul><figure class="hand-photo"><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-report.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="Sample photo of a marked report"></figure>'
_a = 'Marked against the published SEAB, Cambridge and IB criteria.</span></div>'
assert _a in body
body = body.replace(_a, _a[:-6] + GETS + '</div>', 1)
body = body.replace('</body>', '<script src="/v2/motion-pause.js" defer></script></body>', 1)
''' + MARK)
wr('build.py', s)
print('ok')
