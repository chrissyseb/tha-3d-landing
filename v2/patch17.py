rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, a[:70]
    wr(p, s.replace(a, b))

# POLISH: selected paper tab (the CSS still looked for the old attribute).
sub('home.css', '#handin .paper-tabs button[aria-selected="true"]{', '#handin .paper-tabs button[aria-pressed="true"]{')

# POLISH: no stray dot before the ring draws; later rotations don't sit half empty; rotation waits while someone is looking.
sub('hero.js', '''.fromTo(q(".ring path"), {"--d": 1}, {"--d": 0, duration: .9}, "-=.3")''', '''.fromTo(q(".ring path"), {"--d": 1, opacity: 0}, {"--d": 0, opacity: 1, duration: .9}, "-=.3")''')
sub('hero.js', '''if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);   // still animates, quickly''', '''if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.timeScale(4);   // still animates, quickly
    else if (played) tl.timeScale(1.8);   // the first marking plays in full; later ones get to the score sooner
    played = true;''')
sub('hero.js', 'let cur = "psle", tl = null, timer = 0, touched = false, inView = true, pane = null;', 'let cur = "psle", tl = null, timer = 0, touched = false, inView = true, pane = null, played = false, held = false;')
sub('hero.js', 'if (!inView || document.hidden) { timer', 'if (!inView || document.hidden || held) { timer')
sub('hero.js', '  render(cur);\n  const intro', '''  frame.addEventListener("pointerenter", () => { held = true; });
  frame.addEventListener("pointerleave", () => { held = false; });
  frame.addEventListener("focusin", () => { held = true; });
  frame.addEventListener("focusout", () => { held = false; });

  render(cur);
  const intro''')

# DISTILL + SEO: facts and the definition are plain HTML in one band; the free line no longer repeats the hero.
s = rd('hero.js')
i, j = s.find('/* Product facts strip.'), s.find('(() => {\n  const nav')
if i >= 0:
    assert j > i
    s = s[:i] + s[j:]
    wr('hero.js', s)
sub('hero-a.html', '''<div class="proof" role="group" aria-label="Product facts"></div>
  <p class="definition">EssayLabsg™ marks Singapore exam essays (PSLE, O-Level, A-Level GP, IB and IGCSE) against the published criteria.</p>''',
 '''<div class="proof" role="group" aria-label="Product facts">
   <div><span class="proof-v">13</span><span class="proof-l">Exam papers, PSLE to IB, marked against the published SEAB, Cambridge and IB criteria</span></div>
   <div><span class="proof-v">1 min</span><span class="proof-l">From pasting your essay to a free band score</span></div>
   <div><span class="proof-v">48 hrs</span><span class="proof-l">Detailed reports, marked by Exam Preparation Specialists™</span></div>
   <p class="definition">EssayLabsg™ marks Singapore exam essays (PSLE, O-Level, A-Level GP, IB and IGCSE) against the published criteria.</p>
  </div>''')

# POLISH: a question prompt that fits a phone.
s = rd('enhance.js')
if 'Paste the question here' not in s:
    a = '  /* Labels for the fields that only had placeholders. */\n'
    assert a in s
    wr('enhance.js', s.replace(a, a + '  { const q = document.getElementById("question"); if (q) q.placeholder = "Paste the question here"; }\n'))

c = rd('home.css')
if 'finish: exam sheet' not in c:
    c += r'''
/* distill: facts band */
.proof .definition:not(#_):not(#_):not(#_){grid-column:1/-1;margin:0;max-width:none;color:var(--ink)}
/* bolder: the essay box is an exam sheet, in the hero paper's own rules and margin */
#handin textarea#essay:not(#_):not(#_):not(#_):not(#_){min-height:320px;padding:0 24px 0 72px;font-size:var(--type-fs-body);line-height:40px;border:0;background-color:var(--well);background-image:linear-gradient(var(--line),var(--line)),repeating-linear-gradient(to bottom,transparent 0 39px,var(--line) 39px 40px);background-size:1px 100%,100% 40px;background-position:48px 0,0 0;background-repeat:repeat-y,repeat;background-attachment:local,local}
@media (max-width:899px){#handin textarea#essay:not(#_):not(#_):not(#_):not(#_){padding:0 16px 0 40px;background-position:28px 0,0 0}}
'''
    wr('home.css', c)
print('ok')
