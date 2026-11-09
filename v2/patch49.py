import glob, json, os, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# Trust strip under the plans, her own terms and privacy wording only
s = rd('sections/pricing.html')
STRIP = '''  <ul class="trust-strip" aria-label="Privacy and independence">
   <li>Free essays aren't kept unless you tick the teaching-example box.</li>
   <li>We do not use advertising or tracking cookies.</li>
   <li>Marked against published SEAB, Cambridge and IB criteria. EssayLabsg&trade; is not affiliated with or endorsed by them.</li>
   <li><a href="/privacy.html">Read the privacy policy</a></li>
  </ul>
'''
if 'trust-strip' not in s:
    i = s.rindex(' </div>\n</section>')
    s = s[:i] + STRIP + s[i:]
    wr('sections/pricing.html', s)
c = rd('home.css')
if 'trust-strip' not in c:
    c += r'''
/* trust strip and offline note */
.trust-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px 24px;list-style:none;margin:48px 0 0;padding:0;font:400 var(--type-fs-small)/20px var(--font-body);color:var(--soft)}
.trust-strip a{color:var(--ink);display:inline-flex;min-height:44px;align-items:flex-start}
@media (max-width:899px){.trust-strip{grid-template-columns:1fr;margin-top:32px;gap:8px}}
.net-note{margin:12px 0 0;font:400 var(--type-fs-small)/20px var(--font-body);color:var(--ink)}
'''
    wr('home.css', c)
# Offline note beside the marking button
e = rd('enhance.js')
if 'net-note' not in e:
    i = e.rindex('})();')
    e = e[:i] + r'''
  /* Say so when the connection drops; the draft stays on this device. */
  { const btn = document.getElementById("markBtn");
    if (btn) { const n = document.createElement("p"); n.className = "net-note"; n.setAttribute("role", "status"); n.hidden = navigator.onLine; n.textContent = "You're offline. Your essay stays here on this device. Reconnect, then press the button."; btn.parentNode.insertBefore(n, btn.nextSibling);
      addEventListener("offline", () => { n.hidden = false; }); addEventListener("online", () => { n.hidden = true; }); } }
''' + e[i:]
    wr('enhance.js', e)
# Print styles
wr('print.css', '''@media print{.nav,.sitenav,.wa-float,video,.skip,.toast,.nav-progress,.motion-top,.motion-toggle,.crest-pause{display:none!important}
body{background:#fff!important;color:#000!important}
*{animation:none!important;box-shadow:none!important}
details>*{display:block!important}
h2{break-after:avoid;-webkit-text-fill-color:#000!important;background:none!important;color:#000!important}
table,figure{break-inside:avoid}
}
''')
PR = '<link rel="stylesheet" href="/v2/print.css" media="print">'
# 404 built from the about page's frame
a = rd('../about.html')
m1 = a.index('<main'); m2 = a.index('</main>') + 7
BODY = '''<main id="main" tabindex="-1" class="wrap" style="padding-top:96px;padding-bottom:96px">
<h1>This page isn't here</h1>
<p>The link may be old. You can mark an essay free, or pick your paper.</p>
<p><a class="sn-pill" href="/#handin">Mark my essay free</a></p>
<ul>
<li><a href="/psle-composition-marking.html">PSLE composition marking</a></li>
<li><a href="/psle-situational-writing.html">PSLE situational writing</a></li>
<li><a href="/o-level-english-essay-marking.html">O-Level English essay marking</a></li>
<li><a href="/gp-essay-marking.html">A-Level GP essay marking</a></li>
<li><a href="/ib-english-paper-1.html">IB English Paper 1 marking</a></li>
<li><a href="/igcse-english-essay-marking.html">IGCSE English essay marking</a></li>
</ul>
</main>'''
h = a[:m1] + BODY + a[m2:]
h = re.sub(r'<title>[^<]*</title>', "<title>Page not found · EssayLabsg™</title>", h, count=1)
h = re.sub(r'<meta name="robots"[^>]*>', '', h)
h = re.sub(r'<link rel="canonical"[^>]*>', '', h)
h = re.sub(r'<script type="application/ld\+json">.*?</script>', '', h, flags=re.S)
h = h.replace('</head>', '<meta name="robots" content="noindex"></head>', 1)
wr('../404.html', h)
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    s = t = rd(f)
    if PR not in s: s = s.replace('</head>', PR + '</head>', 1)
    if s != t: wr(f, s)
b = rd('build.py')
if 'print.css' not in b:
    x = "head = head.replace('</head>', '<link rel=\"stylesheet\" href=\"/v2/nav.css\"></head>', 1)"
    assert x in b
    b = b.replace(x, "head = head.replace('</head>', '<link rel=\"stylesheet\" href=\"/v2/nav.css\"><link rel=\"stylesheet\" href=\"/v2/print.css\" media=\"print\"></head>', 1)")
    wr('build.py', b)
# Manifest
mf = json.loads(rd('../site.webmanifest'))
mf.setdefault('id', '/'); mf.setdefault('description', 'Essay marking for PSLE, O-Level and GP'); mf['theme_color'] = '#ffffff'
wr('../site.webmanifest', json.dumps(mf, indent=1, ensure_ascii=False))
# App: tabs need role=tab; note text contrast
s = rd('../app.html')
def tabs(m): return re.sub(r'<button(?![^>]*role=)', '<button role="tab"', m.group(0))
s2 = re.sub(r'<div class="lvl-tabs" id="lvlTabs".*?</div>', tabs, s, count=1, flags=re.S)
s2 = s2.replace('.hero-note{margin:12px 0 0;font-size:13px;opacity:.75;text-align:center}', '.hero-note{margin:12px 0 0;font-size:13px;color:#555;text-align:center}')
wr('../app.html', s2)
print('ok')
