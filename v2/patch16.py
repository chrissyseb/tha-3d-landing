import re, glob
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
GATE = '@media (hover:hover) and (pointer:fine){'
# 1. Hover only on devices with a real pointer, so a tap on a phone doesn't leave it stuck.
for f in ['home.css', 'hero.css'] + glob.glob('sections/*.css'):
    s = rd(f)
    if GATE in s or ':hover' not in s: continue
    def wrap(m):
        sel = m.group(1)
        lead = re.match(r'\s*(/\*.*?\*/\s*)*', sel, re.S).group(0)
        print(f, '|', sel[len(lead):].strip()[:80])
        return lead + GATE + sel[len(lead):] + '{' + m.group(2) + '}}'
    wr(f, re.sub(r'([^{}]*:hover[^{}]*)\{([^{}]*)\}', wrap, s))
# 2. Press feedback on everything pressable, and quicker button response.
s = rd('hero.css')
a = 'transition:background-color .2s,transform .2s'
assert a in s or 'transform .16s' in s
s = s.replace(a, 'transition:background-color .2s,transform .16s cubic-bezier(.23,1,.32,1)'); wr('hero.css', s)
c = rd('home.css')
if 'finish: press' not in c:
    c += '''
/* finish: press feedback */
:is(.tabs button,.paper-tabs button,.paper-opt,.burger){transition-property:background-color,border-color,color,transform;transition-duration:.2s,.2s,.2s,.16s}
:is(.tabs button,.paper-tabs button,.paper-opt,.burger):active{transform:scale(.98)}
'''
    wr('home.css', c)
# 3. FAQ under 300ms.
s = rd('sections/faq.css')
s = s.replace('transform .35s cubic-bezier(.2,.8,.2,1)', 'transform .25s cubic-bezier(.23,1,.32,1)').replace('height .35s cubic-bezier(.2,.8,.2,1),content-visibility .35s allow-discrete', 'height .25s cubic-bezier(.23,1,.32,1),content-visibility .25s allow-discrete')
wr('sections/faq.css', s)
# 4. Keyboard use of the hero tabs shows the marking at once.
s = rd('hero.js')
a = 'tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.k, true); });'
if a in s:
    s = s.replace(a, 'tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { show(b.dataset.k, true); if (e.detail === 0 && tl) tl.progress(1); } });')
    a2 = 'show(order[i], true); tabs.querySelector('
    assert a2 in s
    s = s.replace(a2, 'show(order[i], true); if (tl) tl.progress(1); tabs.querySelector(')
    wr('hero.js', s)
print('ok')
