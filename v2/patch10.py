import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
RULE = "url(\"data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 40' preserveAspectRatio='none'%%3E%%3Crect y='39' width='8' height='1' fill='%%23E7E5E2'/%%3E%%3C/svg%%3E\") 0 0/8px %s repeat"

# hero
h = rd('hero.css')
h = re.sub(r"\.opt-b-unused\{[^}]*\}\n?", "", h)
h = re.sub(r"\.ruled\{flex:1;background:[^}]*\}", ".ruled{flex:1;background:" + (RULE % "var(--rule)") + "}", h)
h = re.sub(r"\.u\{[^}]*\}", ".u{text-decoration:underline;text-decoration-color:var(--uc,#C4122F);text-decoration-thickness:2px;text-underline-offset:6px}", h)
h = re.sub(r"box-shadow:[^;}]+;?", "", h)
wr('hero.css', h)
j = rd('hero.js')
j = j.replace('.fromTo(q(".u"), {"--p": "0%"}, {"--p": "100%", duration: .6}, "+=.1")', '.fromTo(q(".u"), {"--uc": "rgba(196,18,47,0)"}, {"--uc": "rgba(196,18,47,1)", duration: .5}, "+=.1")')
j = j.replace('    g.from("h1", {opacity: 0, y: calm ? 0 : 16, duration: .8, ease: "expo.out"});\n', '')
wr('hero.js', j)

# how and sample
c = rd('sections/how.css')
c = re.sub(r"box-shadow:[^;}]+;?", "", c)
c = re.sub(r"background-image:repeating-linear-gradient\([^;]*;[^;}]*background-size:[^;}]*;?", "background:" + (RULE % "var(--rule)") + ";", c, flags=re.S) if 'background-size' in c else re.sub(r"background-image:repeating-linear-gradient\((?:[^()]|\([^()]*\)|\((?:[^()]|\([^()]*\))*\))*\)", "background-image:" + (RULE % "var(--rule)").split(' 0 0/')[0] + ";background-size:8px var(--rule)", c)
c = re.sub(r"#how-it-works \.how-u\{[^}]*\}", "#how-it-works .how-u{text-decoration:underline;text-decoration-color:var(--pen);text-decoration-thickness:2px;text-underline-offset:6px}", c)
wr('sections/how.css', c)
c = rd('sections/sample.css')
c = re.sub(r"box-shadow:[^;}]+;?", "", c)
m = re.search(r"#sample-report \.sr-ruled\{[^}]*\}", c)
var = re.search(r"calc\(var\((--[\w-]+)\)", m.group(0))
print('sample rule var', var and var.group(1))
newr = re.sub(r"background:linear-gradient\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)[^;}]*(?:;background-size:[^;}]*)?", "background:" + (RULE % ("var(%s)" % var.group(1))), m.group(0))
c = c.replace(m.group(0), newr)
c = re.sub(r"#sample-report mark\{[^}]*\}", "#sample-report mark{color:inherit;background:none;text-decoration:underline;text-decoration-color:var(--sr-ink,var(--pen));text-decoration-thickness:2px;text-underline-offset:6px}", c)
c = re.sub(r"#sample-report del\{[^}]*\}", "#sample-report del{text-decoration:line-through;text-decoration-color:var(--sr-ink,var(--pen));text-decoration-thickness:2px}", c)
wr('sections/sample.css', c)
s = rd('sections/sample.js')
s = s.replace('{"--p": "0%"}, {"--p": "100%", duration: dur, ease: "power1.inOut"}, at)', '{"--sr-ink": OFF}, {"--sr-ink": ON, duration: dur, ease: "none"}, at)')
wr('sections/sample.js', s)

# crest: no fade mask; faq: no hairlines
c = rd('sections/crest.css')
c = re.sub(r"\s*-webkit-mask-image:[^;]*;\s*mask-image:[^;}]*", "", c)
wr('sections/crest.css', c)
c = rd('sections/faq.css')
c = c.replace('#faq .faq-list{margin-top:48px;border-top:1px solid var(--line)}', '#faq .faq-list{margin-top:48px}')
c = c.replace('#faq details{border-bottom:1px solid var(--line)}', '#faq details{margin:0 0 8px}')
wr('sections/faq.css', c)

# pricing: the pen note sits beside the price, free plan open, paid plan on the tone
h = rd('sections/pricing.html')
if 'price-row' not in h:
    h = re.sub(r'<p class="price"><span class="ringed">(.*?)</span><span class="pen"([^>]*)>(.*?)</span></p>', r'<div class="price-row"><p class="price"><span class="ringed">\1</span></p><span class="pen"\2>\3</span></div>', h, flags=re.S)
    wr('sections/pricing.html', h)
c = rd('sections/pricing.css')
c = c.replace('#pricing .plan-free{background:var(--well)}', '#pricing .plan-free{background:none}')
c = c.replace('#pricing .plan-paid{background:var(--surface);border:1px solid var(--line)}', '#pricing .plan-paid{background:var(--well)}')
c = c.replace('#pricing .btn-quiet{background:var(--surface);color:var(--ink);border:1px solid var(--line)}', '#pricing .btn-quiet{background:var(--well);color:var(--ink)}\n#pricing .plan-paid .btn-quiet{background:var(--surface)}')
c = c.replace('#pricing .btn-quiet:hover{background:var(--surface);border-color:var(--ink)}', '#pricing .btn-quiet:hover{background:#E9E7E3}')
c += "\n#pricing .price-row{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 24px;margin:16px 0 0}\n#pricing .price-row .price{margin:0}\n"
wr('sections/pricing.css', c)

# product: no card in a card; the photo counts as a picture
h = rd('sections/product.html')
h = h.replace('<figure class="pd-card" data-ui>', '<figure class="pd-card">')
wr('sections/product.html', h)
c = rd('sections/product.css')
c = c.replace('background:var(--well);border-radius:24px;padding:8px}', 'gap:32px}').replace('#product .pd-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;gap:32px}', '#product .pd-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}')
c = c.replace('#product .pd-card{margin:0;background:var(--surface);border-radius:16px;padding:16px 16px 0;overflow:hidden}', '#product .pd-card{margin:0}')
c = c.replace('border-radius:8px 8px 0 0}', 'border-radius:16px}')
c = c.replace('margin:0 -8px;border-radius:20px;padding:6px}', 'gap:24px}')
wr('sections/product.css', c)

# build: strip kicker labels, rename the unlock class
b = rd('build.py')
if "class=\"kicker\"" not in b:
    a = "body = post.home_text(body)\n"; assert a in b
    b = b.replace(a, a + "body = re.sub(r'<span class=\"kicker\">.*?</span>', '', body, flags=re.S)\nbody = body.replace('class=\"unlock\"', 'class=\"upgrade-box\"')\n", 1)
    wr('build.py', b)
l = rd('legacy.css'); wr('legacy.css', l.replace('.unlock', '.upgrade-box'))

c = rd('home.css')
c = c.replace('box-shadow:0 2px 8px rgba(17,17,17,.2);padding:0}', 'box-shadow:0 2px 8px rgba(17,17,17,.2);padding:0} /* taste-skill-ignore: a real floating control */')
c += r"""
/* no card inside a card, no outlines: one tone step only */
.frame:not(#_){background:none;padding:0;border-radius:0}
.tabs button[aria-selected="true"]:not(#_){background:var(--well)}
.paper:not(#_){background:var(--well)}
.marks:not(#_){background:none}
#sample-report .sr-frame:not(#_){background:none;padding:0;border-radius:0}
#sample-report .sr-paper:not(#_){background:var(--well)}
#sample-report .sr-marks:not(#_),#sample-report .sr-fixes:not(#_){background:none}
#handin .sheet-inner:not(#_):not(#_){background:none;padding:0;border-radius:0;margin:0}
#handin .sec-title:not(#_):not(#_){padding:0}
#handin input[type=text]:not(#_):not(#_),#handin input[type=number]:not(#_):not(#_),#handin textarea:not(#_):not(#_){background:var(--well);border:0}
#handin .paper-opt:not(#_):not(#_):not(#_){background:var(--well);border:0}
#handin .paper-opt[aria-pressed="true"]:not(#_):not(#_):not(#_){background:var(--ink)}
#handin .dropzone:not(#_):not(#_){background:var(--well);border:0}
#handin .dropzone.over:not(#_):not(#_){background:#E9E7E3}
#handin .btn.ghost:not(#_):not(#_),#result .btn.ghost:not(#_):not(#_){background:var(--well);border:0}
#handin .dropzone .btn.ghost:not(#_):not(#_){background:#fff}
#result>.sheet:not(#_):not(#_),#result>.sheet:first-child:not(#_):not(#_){background:none!important;border:0}
#result>.sheet>.sheet-inner:not(#_):not(#_){padding:32px 0!important}
#result .crit-item:not(#_):not(#_),#result .fix:not(#_):not(#_),#result .model .after:not(#_):not(#_),#result .script:not(#_):not(#_){background:var(--well)}
#result .result-more:not(#_){padding:0}
/* reading: no lone last words, comfortable line length, running text in ink */
.script,.note,.sr-script,.how-sheet p,.plan-note,.classes-quotes figcaption,.classes-sub,main p{text-wrap:pretty}
main p:not(.script):not(.sr-script):not(.note):not(.sr-note){max-width:72ch}
footer.site .foot-legal:not(#_):not(#_){max-width:60ch}
:root{--soft:#3A3733}
"""
wr('home.css', c)
print('ok')
