import re, glob, json, os
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
SIZE = {64: 'h1', 68: 'h1', 38: 'h1', 44: 'h2', 32: 'h2', 24: 'h3', 20: 'lead', 17: 'lead', 18: 'body', 16: 'body', 15: 'small', 14: 'small', 13: 'small', 28: 'h3'}
def tok(px):
    px = int(float(px)); return SIZE.get(px)
def conv(css):
    # font shorthand on heading or body families; Caveat stays as it is
    def f(m):
        t = tok(m.group(2))
        return m.group(0) if not t else f"font:{m.group(1)} var(--fs-{t})/var(--lh-{t}) var(--{m.group(4)})"
    css = re.sub(r'font:(\d{3})\s+([\d.]+)px/([\d.]+)px\s+var\(--(serif|sans)\)', f, css)
    css = re.sub(r'font-size:\s*(\d+(?:\.\d+)?)px', lambda m: ('font-size:var(--fs-%s)' % tok(m.group(1))) if tok(m.group(1)) else m.group(0), css)
    css = re.sub(r'line-height:\s*(\d+)px', lambda m: ('line-height:var(--lh-%s)' % tok(m.group(1)) if m.group(1) in () else m.group(0)), css)
    return css
for p in ['hero.css', 'home.css'] + glob.glob('sections/*.css'):
    wr(p, conv(rd(p)))

# fonts: Inter Tight headings, Inter body
h = rd('hero.css')
h = h.replace("@font-face{font-family:'Geist';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/geist.woff2) format('woff2')}", "@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/inter.woff2) format('woff2')}")
h = h.replace("@font-face{font-family:'Fraunces';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/fraunces.woff2) format('woff2')}", "@font-face{font-family:'Inter Tight';font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/inter-tight.woff2) format('woff2')}")
h = h.replace("--sans:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;--serif:'Fraunces',Georgia,serif;", "--sans:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;--serif:'Inter Tight','Arial',system-ui,sans-serif;")
h = h.replace('.opt-b h1{', '.opt-b-unused{')
wr('hero.css', h)
l = rd('legacy.css').replace('Fraunces', "'Inter Tight'").replace('Geist', 'Inter')
wr('legacy.css', l)

# other pages
for p in glob.glob('../*.html'):
    if p.endswith('index.html'): continue
    s = rd(p)
    s = s.replace('/fonts/geist.woff2', '/fonts/inter.woff2').replace('/fonts/fraunces.woff2', '/fonts/inter-tight.woff2')
    s = s.replace("src:local('Georgia');font-weight:100 900;size-adjust:100%", "src:local('Arial');font-weight:100 900;size-adjust:100%")
    if 'v2/tokens.css' not in s:
        s = s.replace('<link rel="stylesheet" href="/v2/type.css">', '<link rel="stylesheet" href="/v2/tokens.css"><link rel="stylesheet" href="/v2/type.css"><link rel="stylesheet" href="/v2/roles.css">')
    wr(p, s)
t = rd('type.css')
for px, r in ((64, 'h1'), (44, 'h2'), (24, 'h3'), (20, 'lead'), (16, 'body'), (14, 'small'), (38, 'h1'), (32, 'h2'), (17, 'lead')):
    lh = {64: 68, 44: 52, 24: 32, 20: 32, 16: 24, 14: 20, 38: 44, 32: 40, 17: 24}[px]
    t = t.replace('font-size:%dpx!important;line-height:%dpx!important' % (px, lh), 'font-size:var(--fs-%s)!important;line-height:var(--lh-%s)!important' % (r, r))
# gradient now applies to section headings on every page
t = t.replace('html body :is(h1,h2,h3,.h1w,.hero-h1,.hero-h1 em):not(#_):not(#_):not(.grad){color:#111!important;-webkit-text-fill-color:#111!important;background:none!important;animation:none!important}\n', '')
wr('type.css', t)

# sections
c = rd('sections/crest.css')
c = c.replace('filter:grayscale(1);mix-blend-mode:multiply;transition:filter .2s}', '}').replace('#crest .crest-set li:hover img{filter:none}\n', '')
c = c.replace('#crest .crest-set li:hover img{filter:none}', '')
wr('sections/crest.css', c)
ph = rd('sections/pricing.html').replace('class="grad" ', '').replace(' class="grad"', '')
wr('sections/pricing.html', ph)
pc = rd('sections/pricing.css')
pc = re.sub(r"#pricing \.grad\{[^}]*\}\n?", '', pc)
wr('sections/pricing.css', pc)

# product section, from the sample-script folder
m = json.load(open('../img/sample-script/marks.json', encoding='utf-8'))
lines = ''.join('<path class="pd-u" pathLength="1" d="M%s %s L%s %s"/>' % tuple(l) for l in m['lines'])
notes = ''.join('<text class="pd-n" x="%s" y="%s" transform="rotate(%s %s %s)">%s</text>' % (n['x'], n['y'], n['rot'], n['x'], n['y'], n['t'].replace('&', '&amp;')) for n in m['notes'])
r = m['ring']; x, y = r['x'], r['y']
ring = '<g class="pd-ring"><path class="pd-c" pathLength="1" d="M%s %sc-60-20-150-2-166 58-14 56 56 88 124 86 68-2 116-32 108-84-6-42-52-62-104-64" /><text class="pd-s" x="%s" y="%s" text-anchor="middle">%s/%s</text><text class="pd-g" x="%s" y="%s">%s</text></g>' % (x + 56, y - 84, x - 24, y + 14, r['total'], r['max'], x + 118, y + 12, r['grade'])
wr('sections/product.html', '''<section id="product" aria-labelledby="product-title">
 <div class="pd-head" data-reveal><h2 id="product-title">From photo to marked script in about a minute</h2></div>
 <div class="pd-pair" data-ui>
  <figure class="pd-card"><figcaption>The photo</figcaption><img src="/img/sample-script/script.jpg" width="1200" height="1500" loading="lazy" decoding="async" alt="A phone photo of one handwritten page of a GP essay on lined paper."></figure>
  <figure class="pd-card pd-marked"><figcaption>Marked in red pen</figcaption><div class="pd-stage"><img src="/img/sample-script/script.jpg" width="1200" height="1500" loading="lazy" decoding="async" alt="The same page with red-pen underlines, three margin comments and a ringed estimated score of 32 out of 50, Est. B."><svg viewBox="%s" aria-hidden="true">%s%s%s</svg></div></figure>
 </div>
 <p class="pd-cap">Sample script for illustration.</p>
</section>
''' % (m['viewBox'], lines, notes, ring))
wr('sections/product.css', '''#product{padding-top:128px}
#product .pd-head{margin:0 0 48px}
#product .pd-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;background:var(--well);border-radius:24px;padding:8px}
#product .pd-card{margin:0;background:var(--surface);border-radius:16px;padding:16px 16px 0;overflow:hidden}
#product figcaption{font-size:var(--fs-small);line-height:var(--lh-small);font-weight:500;margin:0 0 16px}
#product img{display:block;width:100%;height:auto;border-radius:8px 8px 0 0}
#product .pd-stage{position:relative}
#product svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
#product .pd-u{fill:none;stroke:var(--pen);stroke-width:2.6;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:var(--d,0)}
#product .pd-c{fill:none;stroke:var(--pen);stroke-width:3;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:var(--d,0)}
#product text{font-family:var(--hand);fill:var(--pen)}
#product .pd-n{font-size:37px}
#product .pd-s{font-size:64px}
#product .pd-g{font-size:48px}
#product .pd-cap{margin:16px 0 0;font-size:var(--fs-small);line-height:var(--lh-small);color:var(--soft)}
@media (max-width:899px){#product{padding-top:96px}#product .pd-head{margin:0 0 32px}#product .pd-pair{grid-template-columns:minmax(0,1fr);margin:0 -8px;border-radius:20px;padding:6px}#product .pd-n{font-size:41px}}
''')
wr('product.js', '''/* Red pen draws on the sample script when it scrolls into view. Without GSAP the page simply shows fully marked. */
(() => {
  const el = document.querySelector("#product .pd-marked"); if (!el || !("IntersectionObserver" in window)) return;
  const run = () => { const g = window.gsap; if (!g) return;
    const q = s => el.querySelectorAll(s), tl = g.timeline({defaults: {ease: "power2.inOut"}});
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);
    tl.fromTo(q(".pd-u"), {"--d": 1}, {"--d": 0, duration: .5, stagger: .22})
      .fromTo(q(".pd-n"), {opacity: 0}, {opacity: 1, duration: .5, stagger: .35}, .3)
      .fromTo(q(".pd-c"), {"--d": 1}, {"--d": 0, duration: .9}, "-=.2")
      .fromTo(q(".pd-s, .pd-g"), {opacity: 0}, {opacity: 1, duration: .4, stagger: .2}, "-=.5");
  };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, {threshold: .35});
  io.observe(el);
})();
''')

# build
b = rd('build.py')
b = b.replace('<script src="/v2/fontswitch.js"></script>\n', '')
b = b.replace("scripts['fwd'].replace('if(q||', 'if((q&&!/^\\?font=[123]$/.test(q))||')", "scripts['fwd']")
b = b.replace('href="/fonts/fraunces.woff2"', 'href="/fonts/inter-tight.woff2"').replace('href="/fonts/geist.woff2"', 'href="/fonts/inter.woff2"')
b = b.replace('<link rel="stylesheet" href="/v2/legacy.css">', '<link rel="stylesheet" href="/v2/tokens.css">\n<link rel="stylesheet" href="/v2/legacy.css">')
b = b.replace('<link rel="stylesheet" href="/v2/home.css">\n', '<link rel="stylesheet" href="/v2/home.css">\n<link rel="stylesheet" href="/v2/roles.css">\n')
b = b.replace("('proof', 'how',", "('proof', 'product', 'how',")
a = "nav, main, sec('crest'), sec('how'),"; assert a in b
b = b.replace(a, "nav, main, sec('product'), sec('crest'), sec('how'),")
b = b.replace("<main class=\"container\">\n%s\n%s\n%s\n%s\n<section id=\"result\"", "<main class=\"container\">\n%s\n%s\n%s\n%s\n%s\n<section id=\"result\"")
b = b.replace('<script src="/v2/reveal.js" defer></script>', '<script src="/v2/product.js" defer></script>\n<script src="/v2/reveal.js" defer></script>')
wr('build.py', b)
open('../.vercelignore', 'w', newline='\n').write('v2/old\nv2/*.py\nv2/__pycache__\nv2/hero-a.html\nv2/hero-b.html\nv2/fontswitch.js\n')
for f in ('fontswitch.js', 'hero-b.html', '../fonts/fraunces.woff2', '../fonts/geist.woff2', '../fonts/instrument-serif.woff2'):
    if os.path.exists(f): os.remove(f)
print('ok')
