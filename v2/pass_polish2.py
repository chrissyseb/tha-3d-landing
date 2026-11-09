rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
j = rd('hero.js')
j = j.replace('<span class=\\"nb\\">O-Level</span>', 'O-Level').replace('<span class=\\"nb\\">A-Level</span>', 'A-Level')
a = 'tl = g.timeline({defaults: {ease: "power2.inOut"}});'
assert a in j
if 'timeScale' not in j:
    j = j.replace(a, a + '\n    if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);   // still animates, quickly')
wr('hero.js', j)
c = rd('home.css')
c += """
/* polish 2 */
.proof-l:not(#_):not(#_){text-wrap:pretty}
#result .scorehead h2:not(#_):not(#_){margin:0}
"""
wr('home.css', c)
