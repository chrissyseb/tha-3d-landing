rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, a[:70]
    wr(p, s.replace(a, b))
# Sliding tab pill (21st.dev "Slide Tabs" pattern, rebuilt in CSS). Transform only; instant from the keyboard.
sub('hero.js', '''tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.k === k)));''',
 '''tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.k === k)));
    tabs.style.setProperty("--i", order.indexOf(k));''')
sub('hero.js', 'if (e.detail === 0 && tl) tl.progress(1);', 'tabs.style.setProperty("--t", e.detail === 0 ? "0s" : ".25s"); if (e.detail === 0 && tl) tl.progress(1);')
sub('hero.js', 'show(order[i], true); if (tl) tl.progress(1);', 'tabs.style.setProperty("--t", "0s"); show(order[i], true); if (tl) tl.progress(1);')
sub('enhance.js', '''box.querySelectorAll(".paper-tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.textContent === openLevel)));''',
 '''box.querySelectorAll(".paper-tabs button").forEach(b => b.setAttribute("aria-pressed", String(b.textContent === openLevel)));
    { const pt = box.querySelector(".paper-tabs"); if (pt) pt.style.setProperty("--i", LEVELS.indexOf(openLevel)); }''')
sub('enhance.js', '''if (t) { ev.stopPropagation(); openLevel = t.textContent; show(); }''', '''if (t) { ev.stopPropagation(); tabs.style.setProperty("--t", ev.detail === 0 ? "0s" : ".25s"); openLevel = t.textContent; show(); }''')
c = rd('home.css')
if 'slide tabs' not in c:
    c += r'''
/* slide tabs: one pill moves between equal columns */
:is(.tabs,#handin .paper-tabs):not(#_){position:relative;isolation:isolate}
:is(.tabs,#handin .paper-tabs):not(#_)::before{content:"";position:absolute;z-index:-1;top:0;bottom:0;left:0;width:calc(100%/3);border-radius:16px;background:var(--well);transform:translateX(calc(var(--i,0)*100%));transition:transform var(--t,.25s) cubic-bezier(.23,1,.32,1)}
.tabs button[aria-selected="true"]:not(#_):not(#_){background:none}
#handin .paper-tabs button[aria-pressed="true"]:not(#_):not(#_){background:none}
'''
    wr('home.css', c)
print('ok')
