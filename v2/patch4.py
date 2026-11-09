import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

# home follows home.css alone; type.css is for the other pages
s = rd('build.py')
s = s.replace('<link rel="stylesheet" href="/v2/type.css">\n', '')
wr('build.py', s)

# pricing: note lives inside the button row so the two plans' rows stay aligned
h = rd('sections/pricing.html')
n = '\n    <p class="plan-note">A failed report doesn\'t use a credit. Less than one hour of most tuition.</p>'
if n in h:
    h = h.replace('31-Day Pass</a></div>' + n, '31-Day Pass</a><p class="plan-note">A failed report doesn\'t use a credit. Less than one hour of most tuition.</p></div>')
    wr('sections/pricing.html', h)

c = rd('home.css')
c = c.replace('#pricing .ringed{position:relative;display:inline-block;padding:0 16px;margin-left:-16px}', '#pricing .ringed{position:relative;display:inline-block;padding:0 24px;margin-left:-24px}')
c = c.replace('#pricing .plan-note{margin:12px 0 0;', '#pricing .plan-cta:not(#_){flex-wrap:wrap}\n#pricing .plan-note{flex:1 1 100%;margin:4px 0 0;')
if '.free-note .nb' not in c:
    c += """
.free-note{text-wrap:pretty}.free-note .nb{white-space:nowrap}
#faq .faq-head p a:not(#_){font:inherit}
#result [class*="remark"]:not(#_){background:var(--well)!important}
"""
wr('home.css', c)

# other pages: same world as the new home, no logic touched
t = rd('type.css')
if 'same world' not in t:
    t += """
/* same world as the new home: no forced capitals, ink not navy, round buttons, readable selected tabs */
html body *:not(#_){text-transform:none!important}
html body :is(h1,h2,h3,.h1w,.hero-h1,.hero-h1 em):not(#_):not(#_):not(.grad){color:#111!important;-webkit-text-fill-color:#111!important;background:none!important;animation:none!important}
html body .btn:not(#_):not(#_){border-radius:999px!important}
html body .btn.primary:not(#_):not(#_){background:#111!important;color:#fff!important;border-color:#111!important}
html body .sgbadge:not(#_):not(#_){background:#F4F3F1!important;color:#111!important}
html body [data-level][aria-pressed="true"]:not(#_):not(#_){background:#111!important;color:#fff!important;box-shadow:none!important}
html body [data-level][aria-pressed="true"] *:not(.tab-free):not(#_):not(#_){color:#fff!important;-webkit-text-fill-color:#fff!important}
html body [data-level][aria-pressed="true"] .tab-free:not(#_):not(#_){background:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important}
html body .tab-free:not(#_):not(#_){background:#F4F3F1!important;color:#111!important}
html body{background:#FDFCFC}
"""
    wr('type.css', t)
print('ok')
