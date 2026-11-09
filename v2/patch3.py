# One-off edits for the skill pass. Run once from site-v2/v2.
import re, post
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

s = rd('build.py')
if 'import post' not in s:
    s = s.replace("import re, io, os, sys\n", "import re, io, os, sys\nimport post\n", 1)
    a = "io.open('marker.js', 'w', encoding='utf-8', newline='\\n').write(m.group(2))"; assert a in s
    s = s.replace(a, "io.open('marker.js', 'w', encoding='utf-8', newline='\\n').write(post.home_text(post.result_labels(m.group(2))))")
    a = "ask = section(r'<section class=\"sheet\" aria-labelledby=\"t-ask\"')"; assert a in s
    s = s.replace(a, "ask = post.stub(section(r'<section class=\"sheet\" aria-labelledby=\"t-ask\"'))")
    s, n = re.subn(r"mc = section\(r'<section class=\"sheet\" id=\"masterclasses\"'\)[^\n]*\n", "mc = post.stub(section(r'<section class=\"sheet\" id=\"masterclasses\"')).replace('<section id=\"masterclasses\"></section>', '').replace('<h2 id=\"t-mc\"></h2>', '')\n", s); assert n == 1
    a = "visible_state = ''.join(section(r'<section class=\"sheet[^\"]*\" id=\"%s\"' % n) for n in ('adminBox', 'histBox', 'chBox', 'joinBox'))"; assert a in s
    s = s.replace(a, "visible_state = post.no_headings(''.join(section(r'<section class=\"sheet[^\"]*\" id=\"%s\"' % n) for n in ('adminBox', 'histBox', 'chBox', 'joinBox')))")
    a = "# Elements the old script expects"; assert a in s
    s = s.replace(a, """hand, _n = re.subn(r'<div class="row" style="align-items:center">\\s*(<button class="btn ghost" id="timerBtn".*?</button>)\\s*(<span class="counter" id="timerOut".*?</span>)\\s*</div>', r'<div class="row">\\1\\2</div>', hand, flags=re.S)
hand = hand.replace('<p class="hint" style="margin:6px 0 0">Type it, paste it, or snap a photo of your handwritten essay.</p>', '')

""" + a, 1)
    a = "sec('pricing'), sec('classes'), sec('faq'), sec('footer'),"; assert a in s
    s = s.replace(a, "sec('pricing'), '<div class=\"pen-rule\" aria-hidden=\"true\"><svg viewBox=\"0 0 640 16\" preserveAspectRatio=\"none\"><path pathLength=\"1\" d=\"M3 10C90 3 190 5 300 8s220 4 337-3\"/></svg></div>' + sec('classes'), sec('faq') + sec('cta'), sec('footer'),")
    a = "body = body.replace('href=\"/#', 'href=\"#')"; assert a in s
    s = s.replace(a, a + "\nbody = post.home_text(body)\nhead = head.replace('EssayLabsg™ | Essay Marking &amp; Feedback', 'EssayLabsg™ | Essay marking &amp; feedback')\nhead = head.replace(ld, post.ld_fix(ld, sec('faq')))")
    wr('build.py', s)

a = rd('../app.js'); b = post.result_labels(a); wr('../app.js', b); print('app.js labels changed', a != b)

h = rd('hero-a.html')
h = re.sub(r'<p class="free-note">.*?</p>', '<p class="free-note">3 free instant markings for PSLE English, <span class="nb">O-Level</span> English and <span class="nb">A-Level</span> GP. No sign-up.</p>', h, flags=re.S)
if 'class="definition"' not in h:
    h = h.replace('<div class="proof" aria-label="Product facts"></div>', '<div class="proof" aria-label="Product facts"></div>\n  <p class="definition">EssayLabsg™ marks Singapore exam essays (PSLE, O-Level, A-Level GP, IB and IGCSE) against the published criteria.</p>')
h = h.replace('<div class="frame">', '<div class="frame" data-ui>')
wr('hero-a.html', h)

h = rd('sections/how.html')
a = "Designed by our Exam Preparation Specialists™. Every essay comes back with the reasons behind the mark, the fixes worth the most, and a way to prove you've improved."
if a in h: h = h.replace(a, "Every essay comes back with the reasons behind each mark and the fixes worth the most.")
h = h.replace('class="how-sheet"', 'class="how-sheet" data-ui') if 'how-sheet" data-ui' not in h else h
wr('sections/how.html', h)

h = rd('sections/pricing.html')
if 'class="ringed"' not in h:
    a = '<p class="price">S$39<span class="pen"'; assert a in h
    h = h.replace(a, '<p class="price"><span class="ringed">S$39<svg viewBox="0 0 128 88" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7"/></svg></span><span class="pen"')
    a = '31-Day Pass</a></div>'; assert a in h
    h = h.replace(a, a + '\n    <p class="plan-note">A failed report doesn\'t use a credit. Less than one hour of most tuition.</p>')
    wr('sections/pricing.html', h)

h = rd('sections/classes.html')
if 'classes-quotes' not in h:
    q = """   <div class="classes-quotes"><figure><blockquote>“He went from AL5 to AL1 for English in his PSLE! Most importantly, he stopped dreading compositions.”</blockquote><figcaption>Mrs Lim, parent of a P6 student · PSLE English Masterclass</figcaption></figure><figure><blockquote>“She came home teaching me the 'Show Don't Tell' technique! Her SA2 compo jumped from 28/40 to 36/40.”</blockquote><figcaption>Mrs Koh, parent of a P5 student · PSLE Composition &amp; Comprehension</figcaption></figure></div>\n"""
    i = h.index('<div class="classes-links">'); j = h.index('</div>', i) + 6
    h = h[:j] + '\n' + q + h[j:]; wr('sections/classes.html', h)

h = rd('sections/sample.html')
if 'sr-frame" data-ui' not in h: wr('sections/sample.html', h.replace('class="sr-frame"', 'class="sr-frame" data-ui'))

wr('sections/cta.html', '''<section id="closing" aria-labelledby="closing-title" data-reveal>
 <h2 id="closing-title">Mark your next essay free</h2>
 <a class="btn btn-lg" href="#handin">Mark my essay free</a>
 <p>Detailed reports from S$39 for 4.</p>
</section>
''')

c = rd('home.css')
c = re.sub(r"@font-face\{font-family:'Inter[^\n]*\n", "", c)
if 'one motif' not in c:
    c += """
/* one motif: the examiner's red-pen ring */
.opt-a .ring{width:160px;height:110px;font-size:48px}
.opt-a .ring small{font-size:28px}
#how-it-works .how-step h3:not(#_){display:flex;align-items:center;gap:12px;counter-increment:howstep}
#how-it-works{counter-reset:howstep}
#how-it-works .how-step h3:not(#_)::before{content:counter(howstep);flex:none;width:44px;height:36px;display:flex;align-items:center;justify-content:center;font:400 24px/1 var(--hand);color:var(--pen);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 88' preserveAspectRatio='none'%3E%3Cpath d='M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7' fill='none' stroke='%23C4122F' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat}
#pricing .ck:not(#_),#pricing .ck *:not(#_){stroke:var(--pen)!important}
#pricing .ringed{position:relative;display:inline-block;padding:0 16px;margin-left:-16px}
#pricing .ringed svg{position:absolute;inset:-14px -6px -6px;width:calc(100% + 12px);height:calc(100% + 20px);overflow:visible}
#pricing .ringed path{fill:none;stroke:var(--pen);stroke-width:2;stroke-linecap:round;vector-effect:non-scaling-stroke}
#pricing .plan-note{margin:12px 0 0;font-size:14px;line-height:20px;color:var(--soft)}
.pen-rule{margin:128px auto 0;width:min(640px,80%);height:16px}
.pen-rule svg{display:block;width:100%;height:100%;overflow:visible}
.pen-rule path{fill:none;stroke:var(--pen);stroke-width:2;stroke-linecap:round;vector-effect:non-scaling-stroke}
.pen-rule+#masterclasses:not(#_):not(#_){margin-top:64px}
.classes-quotes{margin-top:48px;display:grid;gap:24px}
.classes-quotes figure{margin:0}
.classes-quotes blockquote{margin:0 0 8px;font:400 16px/24px var(--sans);color:var(--ink)}
.classes-quotes figcaption{font-size:14px;line-height:20px;color:var(--soft)}
.definition{margin:32px 0 0;font-size:16px;line-height:24px;color:var(--soft);max-width:72ch}
#closing{padding-top:128px;text-align:center}
#closing h2{margin:0 0 24px;font:400 44px/52px var(--serif);letter-spacing:-.015em}
#closing p{margin:16px 0 0;font-size:14px;line-height:20px;color:var(--soft)}
#crest .crest-track:not(#_){animation:crest-marq 200s linear infinite!important}
#faq details:not(#_){border:0;background:var(--well);border-radius:16px;padding:0 24px;margin:0 0 8px}
#faq summary:not(#_){padding:24px 0;border:0}
#faq details>p:not(#_){padding:0 56px 24px 0}
#faq .faq-list:not(#_){border:0}
@media (max-width:899px){.pen-rule{margin-top:96px}.pen-rule+#masterclasses:not(#_):not(#_){margin-top:48px}#closing{padding-top:96px}#closing h2{font-size:32px;line-height:40px}.opt-a .ring{width:128px;height:88px;font-size:40px}.opt-a .ring small{font-size:24px}}
"""
wr('home.css', c)

# GSAP review: clear transforms after reveals; pause the pen when the demo is off screen
r = rd('reveal.js')
r = r.replace('{autoAlpha: 1, y: 0, duration: .8, ease: "expo.out"}', '{autoAlpha: 1, y: 0, duration: .8, ease: "expo.out", overwrite: "auto", clearProps: "transform"}'); wr('reveal.js', r)
j = rd('hero.js')
a = 'new IntersectionObserver(es => { inView = es[0].isIntersecting; }).observe(frame);'
if a in j: j = j.replace(a, 'new IntersectionObserver(es => { inView = es[0].isIntersecting; if (tl) inView ? tl.resume() : tl.pause(); }).observe(frame);'); wr('hero.js', j)
print('patched')
