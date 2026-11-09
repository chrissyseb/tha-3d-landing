import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# about: price is S$39 for 4, not "message us"
s = rd('../about.html')
n = re.sub(r'Detailed reports, marked by Exam Preparation Specialists™, are a separate, priced option:\s*<a [^>]*>[^<]*</a>[^.<]*\.', 'Detailed feedback is S$39 for 4 reports, marked by Exam Preparation Specialists™ and ready within 48 hours.', s)
assert n != s or 'priced option' not in s
wr('../about.html', n)
# hero script waits for gsap instead of starting the intro at window load
b = rd('build.py')
a = "'<script src=\"/v2/hero.js\"></script></section>'"
c = "'<script src=\"/v2/hero.js\" defer></script></section>'"
assert a in b or c in b
wr('build.py', b.replace(a, c))
# second pause control in the sticky nav, kept in step with the footer one
m = rd('motion-pause.js')
a = 'show(); host.appendChild(b);'
if a in m:
    m = m.replace('function show() { root.classList.toggle("motion-paused", paused); b.textContent = paused ? "Play animation" : "Pause animation"; b.setAttribute("aria-pressed", paused ? "true" : "false"); }',
      'var top = document.createElement("button"); top.type = "button"; top.className = "motion-top";\n    function show() { root.classList.toggle("motion-paused", paused); b.textContent = paused ? "Play animation" : "Pause animation"; b.setAttribute("aria-pressed", paused ? "true" : "false"); top.setAttribute("aria-pressed", paused ? "true" : "false"); top.setAttribute("aria-label", paused ? "Play animation" : "Pause animation"); top.title = top.getAttribute("aria-label"); top.innerHTML = paused ? \'<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>\' : \'<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>\'; }')
    m = m.replace('b.addEventListener("click", function () {', 'function flip() {')
    m = m.replace('show(); });\n    show(); host.appendChild(b);', 'show(); }\n    b.addEventListener("click", flip); top.addEventListener("click", flip);\n    show(); host.appendChild(b);\n    var cta = document.querySelector(".nav-in>.btn, .sn-in>.sn-pill"); if (cta) cta.parentNode.insertBefore(top, cta);')
    assert 'insertBefore(top, cta)' in m
    wr('motion-pause.js', m)
# progress line under the sticky nav
c = rd('nav.css')
if 'nav-progress' not in c:
    c += r'''
.motion-top{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;flex:0 0 44px;padding:0;border:0;background:none;color:#111;border-radius:50%;cursor:pointer;transition:background-color .2s ease}
@media (hover:hover) and (pointer:fine){.motion-top:hover{background:#F5F4F3}}
.motion-top:focus-visible{outline:2px solid #111;outline-offset:2px}
.nav-progress{position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#111;transform:scaleX(0);transform-origin:0 50%;pointer-events:none}
@media (max-width:899px){html body .nav-in>.motion-top,html body .sn-in>.motion-top{order:2;margin-left:auto!important}}
'''
    wr('nav.css', c)
j = rd('nav.js')
if 'nav-progress' not in j:
    a = 'var row = links[0].parentElement;'
    assert a in j
    j = j.replace(a, a + '''
  var bar = document.createElement("div"), navEl = document.querySelector(".nav,.sitenav");
  bar.className = "nav-progress"; bar.setAttribute("aria-hidden", "true"); navEl.appendChild(bar);
  var tick = false;
  function prog() { tick = false; var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")"; }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();''')
    wr('nav.js', j)
print('ok')
