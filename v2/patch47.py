import glob, os, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# my own slip from the last patch
for f in glob.glob('../*.html') + glob.glob('sections/*.html') + ['hero-a.html', 'post.py', '../app.js', 'marker.js']:
    if not os.path.exists(f) or f.endswith('index.html'): continue
    s = rd(f)
    if 'Mark my essay Free' in s: wr(f, s.replace('Mark my essay Free', 'Mark my essay free'))
# phone: sub-page pill fits beside the logo and pause button
c = rd('nav.css')
if 'sn-pill-fit' not in c:
    c += r'''
/* sn-pill-fit */
@media (max-width:899px){html body .sn-in>.sn-pill:not(#_):not(#_):not(#_){padding:0 14px!important;white-space:nowrap!important;flex:0 0 auto!important}html body .sn-in>.brand:not(#_):not(#_):not(#_){flex:0 1 auto;min-width:0}html body .sn-in>.brand .brand-by:not(#_):not(#_):not(#_){display:none!important}}
.skip:not(:focus):not(#_){position:absolute;left:-9999px}
'''
    wr('nav.css', c)
# skip link and main target on every inner page
for f in glob.glob('../*.html'):
    n = os.path.basename(f)
    if n in ('index.html', 'app.html', '404.html'): continue
    s = t = rd(f)
    if 'class="skip"' not in s:
        s = re.sub(r'(<body[^>]*>)', r'\1<a class="skip" href="#main">Skip to content</a>', s, count=1)
    s = re.sub(r'<main class="wrap"(?![^>]*\bid=)', '<main id="main" tabindex="-1" class="wrap"', s, count=1)
    s = s.replace('<main class="wrap legal" id="top">', '<main class="wrap legal" id="main" tabindex="-1">')
    if s != t: wr(f, s)
print('ok')
