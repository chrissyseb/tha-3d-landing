rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, a[:70]
    wr(p, s.replace(a, b))

# Focus never falls to the top of the page: errors, the limit card, loading and stopping each hold it.
sub('enhance.js', '''if (/too short/.test(note.textContent)) { essay.setAttribute("aria-invalid", "true"); essay.setAttribute("aria-describedby", "notice"); essay.focus({preventScroll: true}); }
      note.scrollIntoView({block: "center"});''', '''if (/too short/.test(note.textContent)) { essay.setAttribute("aria-invalid", "true"); essay.setAttribute("aria-describedby", "notice"); }
      note.tabIndex = -1; note.focus({preventScroll: true}); note.scrollIntoView({block: "center"});''')
sub('enhance.js', '''if (!up.hidden) { up.setAttribute("role", "alert"); up.scrollIntoView({block: "center"}); }''', '''if (!up.hidden) { up.setAttribute("role", "alert"); up.tabIndex = -1; up.focus({preventScroll: true}); up.scrollIntoView({block: "center"}); }''')
sub('enhance.js', '''document.getElementById("handin").setAttribute("aria-busy", String(!prog.hidden && !!markBtn.disabled)); }''', '''document.getElementById("handin").setAttribute("aria-busy", String(!prog.hidden && !!markBtn.disabled));
      if (!prog.hidden) { prog.tabIndex = -1; prog.focus({preventScroll: true}); }
      else setTimeout(() => { const a = document.activeElement; if (a === document.body || a === prog) markBtn.focus({preventScroll: true}); }, 0); }''')
# The hidden file input isn't an extra stop for assistive technology.
sub('enhance.js', 'input.after(choose); input.tabIndex = -1;', 'input.after(choose); input.tabIndex = -1; input.setAttribute("aria-hidden", "true");')
# The limit card offers the paid route first.
s = rd('enhance.js')
if 'upgrade-pay' not in s:
    a = '  /* Upload: a photo only, up to 20 MB'
    assert a in s
    s = s.replace(a, '''  if (up) { const row = up.querySelector(".row"), codeBtn = document.getElementById("codeBtn");
    if (row) { const pay = document.createElement("a"); pay.className = "btn primary upgrade-pay"; pay.href = "/app.html#planBox"; pay.textContent = "Get 4 detailed reports · S$39"; row.before(pay); }
    if (codeBtn) codeBtn.classList.replace("primary", "ghost"); }
''' + a, 1)
    wr('enhance.js', s)

# Hero: animates on first view; later rotations show the finished marking; one round only.
sub('hero.js', '''    show(order[(order.indexOf(cur) + 1) % order.length]);''', '''    const n = (order.indexOf(cur) + 1) % order.length;
    if (n === 0) touched = true;   // one full round, then it stays still
    show(order[n]);
    if (tl) tl.progress(1);
    if (window.gsap) window.gsap.fromTo(pane, {opacity: 0}, {opacity: 1, duration: .3, ease: "power1.out", clearProps: "opacity"});''')

c = rd('home.css')
if 'finish: review fixes 2' not in c:
    c += '''
/* finish: review fixes 2 */
html body :is(#result,#notice,#progress,#upgradeBox):focus-visible:not(#_):not(#_):not(#_){outline:0!important}
#result{scroll-margin-top:88px}
#result .script:not(#_):not(#_){max-width:760px}
#handin .upgrade-pay:not(#_):not(#_){align-self:flex-start;text-decoration:none}
@media (max-width:359px){.nav .btn-sm:not(#_):not(#_){display:none}}
'''
    wr('home.css', c)
print('ok')
