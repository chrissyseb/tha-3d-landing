import json, re, glob
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

# ---- Hero: headline beside the demo; results strip after it.
h = rd('hero-a.html')
i, j = h.index('<section class="hero">'), h.index('</section>', h.index('<section class="hero">'))
h = h[:i] + '''<section class="hero">
  <div class="hero-grid">
   <div class="hero-copy">
    <h1>Essays, <em class="scribble">marked<svg class="scrib" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 15 C 40 6, 90 5, 132 9 S 186 15, 197 7" pathLength="1"/><path d="M14 21 C 60 15, 120 15, 170 18" pathLength="1"/></svg></em> like the real exam</h1>
    <div class="hero-side">
     <p class="lead">Paste your essay or snap a photo of your script. In about a minute you get a band score, red-pen comments and the one fix worth the most marks.</p>
     <div class="cta-row"><a class="btn btn-lg" href="/#handin">Mark My Essay Free</a><p class="free-note">3 free instant markings for PSLE English, <span class="nb">O-Level</span> English and <span class="nb">A-Level</span> GP. No sign-up.</p></div>
    </div>
   </div>
   <div class="frame" data-ui><div class="tabs" role="tablist" aria-label="Sample marking by paper"></div><div class="stack"></div></div>
  </div>
  <div class="proof results">
   <h2>2025 results</h2>
   <dl class="results-list">
    <div><dd>98%</dd><dt>PSLE English, AL1/2</dt></div>
    <div><dd>100%</dd><dt>PSLE Maths, AL1/2</dt></div>
    <div><dd>96%</dd><dt>PSLE Science, AL1/2</dt></div>
    <div><dd>98%</dd><dt>O-Level English, A1</dt></div>
    <div><dd>98%</dd><dt>GP, A/B</dt></div>
   </dl>
   <p class="definition">EssayLabsg™ marks 13 Singapore exam papers (PSLE, O-Level, A-Level GP, IB and IGCSE) against the published criteria.</p>
  </div>
 ''' + h[j:]
wr('hero-a.html', h)
s = rd('hero.js')
a = '.from(".hero-side", {opacity: 0, y: calm ? 0 : 12, duration: .8}, .12)'
if a in s: s = s.replace(a, '.from(".hero h1", {opacity: 0, y: calm ? 0 : 14, duration: .7}, 0)\n      .from(".hero-side", {opacity: 0, y: calm ? 0 : 12, duration: .7}, .1)')
wr('hero.js', s)

# ---- How it works: the video and three steps. No more repeated scripts.
wr('sections/how.html', '''<section id="how-it-works" aria-labelledby="how-title">
 <div class="how-wrap">
  <header class="how-head" data-reveal><h2 id="how-title">Marked like a script, explained like a lesson</h2></header>
  <div class="how-grid">
   <figure class="how-video" data-reveal>
    <span class="sample-tag">Sample</span>
    <video id="demoVideo" width="1280" height="720" muted loop playsinline preload="none" poster="/img/stand-in/demo-poster.webp" aria-label="A student pastes an essay, marks it and reads the red-pen comments"><source src="/img/stand-in/demo.mp4" type="video/mp4"></video>
    <button class="video-pause" type="button" id="videoPause">Pause the video</button>
   </figure>
   <ol class="how-steps" role="list">
    <li data-reveal><h3>Hand it in</h3><p>Pick your paper, then paste your essay or snap a photo of your handwritten script.</p></li>
    <li data-reveal><h3>Get it marked</h3><p>A band score against the official criteria, with the reason behind each mark, written on your script in red.</p></li>
    <li data-reveal><h3>Fix it and climb</h3><p>Rewrite the part worth the most marks, then re-mark to see your band go up.</p><a class="btn btn-lg how-cta" href="/#handin">Mark My Essay Free</a></li>
   </ol>
  </div>
 </div>
</section>
''')
wr('sections/how.css', '''#how-it-works{padding-top:128px}
#how-it-works .how-head{margin:0 0 48px;max-width:800px}
#how-it-works .how-head h2{margin:0}
#how-it-works .how-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:48px;align-items:start}
.how-video{position:relative;margin:0}
.how-video video{display:block;width:100%;height:auto;aspect-ratio:16/9;border-radius:16px;background:var(--well);object-fit:cover}
.video-pause{display:block;min-height:44px;margin:4px 0 0;padding:0;border:0;background:none;color:var(--ink);font:400 var(--type-fs-small)/var(--type-lh-small) var(--font-body);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
#how-it-works .how-steps{margin:0;padding:0;list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:32px}
#how-it-works .how-steps li{counter-increment:s;position:relative;padding-left:56px}
#how-it-works .how-steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:40px;height:32px;display:flex;align-items:center;justify-content:center;font:400 var(--pen-size)/1 var(--hand);color:var(--pen);background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 88' preserveAspectRatio='none'%3E%3Cpath d='M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7' fill='none' stroke='%23C4122F' stroke-width='5'/%3E%3C/svg%3E") center/contain no-repeat}
#how-it-works .how-steps h3{margin:0 0 8px}
#how-it-works .how-steps p{margin:0;font-size:var(--type-fs-body);line-height:24px;color:var(--soft);text-wrap:pretty}
#how-it-works .how-cta{margin-top:24px}
@media (max-width:899px){#how-it-works{padding-top:96px}#how-it-works .how-head{margin:0 0 32px}#how-it-works .how-grid{grid-template-columns:minmax(0,1fr);gap:32px}#how-it-works .how-cta{width:100%}}
''')

# ---- Pricing: one clear S$39 choice.
s = rd('sections/pricing.html')
a = '<a class="btn btn-lg" href="/app.html#planBox">Subscribe Monthly</a><a class="btn btn-lg btn-quiet" href="/app.html#planBox">31-Day Pass</a><p class="plan-note">'
if a in s:
    s = s.replace(a, '<a class="btn btn-lg" href="/app.html#planBox">Get 4 reports · S$39 a month</a><p class="plan-note"><a href="/app.html#planBox">Or pay once with a 31-day pass</a>. ')
wr('sections/pricing.html', s)

# ---- Solid black headings everywhere; the logo keeps its gradient.
s = rd('roles.css')
s = s.replace('/* every section heading: the same flowing gradient */', '/* every section heading: solid black */')
s = re.sub(r'background:var\(--heading-gradient\)!important;background-size:200% 100%!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important;-webkit-text-fill-color:transparent!important;animation:gflow 9s ease-in-out infinite!important;', 'color:#111!important;-webkit-text-fill-color:#111!important;background:none!important;animation:none!important;', s)
wr('roles.css', s)
BLACK = '<style id="black-heads">html body :is(h1,h2,h3,.h1w,.sec-title h2,.sec-head h2,.endcta h2):not(#_):not(#_):not(#_):not(#_):not(#_):not(#_){color:#111!important;-webkit-text-fill-color:#111!important;background:none!important;animation:none!important}</style>'
for f in glob.glob('../*.html'):
    if f.endswith('index.html'): continue
    s = rd(f)
    if 'id="black-heads"' not in s: wr(f, s.replace('</head>', BLACK + '</head>', 1))

# ---- Enhance: video plays only when in view; pause control; hide the preview toolbar.
s = rd('enhance.js')
if 'demoVideo' not in s:
    i = s.rindex('})();')
    s = s[:i] + r'''
  /* Demo video: loads and plays only when on screen, and can be paused. */
  { const v = document.getElementById("demoVideo"), b = document.getElementById("videoPause");
    if (v && b && "IntersectionObserver" in window) { let held = false;
      new IntersectionObserver(es => { if (es[0].isIntersecting && !held) v.play().catch(() => {}); else v.pause(); }, {threshold: .3}).observe(v);
      b.addEventListener("click", () => { held = !held; b.textContent = held ? "Play the video" : "Pause the video"; if (held) v.pause(); else v.play().catch(() => {}); }); } }
''' + s[i:]
    wr('enhance.js', s)

c = rd('home.css')
if 'restructure' not in c:
    c += r'''
/* restructure */
vercel-live-feedback,#vercel-live-feedback{display:none!important}
.hero:not(#_):not(#_){padding:32px 0 0}
.hero-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:48px;align-items:center;min-height:calc(100vh - 128px)}
.hero-copy h1{margin:0 0 24px}
.hero-grid .frame:not(#_):not(#_){margin:0}
.hero-grid .pane:not(#_){grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}
.hero-grid .paper:not(#_):not(#_){padding:24px 16px 24px 44px}
.hero-grid .paper:not(#_):not(#_)::before{left:28px}
.hero-grid .note:not(#_):not(#_){padding-left:8px}
.hero-grid .marks:not(#_):not(#_){padding:24px 20px}
.hero-grid .score:not(#_):not(#_){gap:12px;margin-bottom:24px}
.hero-grid .ring:not(#_):not(#_){flex:none}
.hero-grid .crit:not(#_):not(#_){margin-bottom:16px}
.hero-grid .cta-row:not(#_){flex-direction:column;align-items:flex-start;gap:12px}
.hero-grid .free-note:not(#_){flex:none;max-width:44ch}
.proof.results:not(#_):not(#_):not(#_){display:block;margin:64px calc(50% - 50vw) 0;padding:64px max(var(--edge),calc(50vw - 620px));background:var(--well);width:100vw}
.results h2:not(#_){margin:0 0 32px}
.results-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px;margin:0}
.results-list>div{display:flex;flex-direction:column-reverse;gap:8px;margin:0}
.results-list dd{margin:0;font:var(--w-head) var(--type-fs-h1)/1 var(--font-head);letter-spacing:-.02em;color:var(--ink)}
.results-list dt{margin:0;font:400 var(--type-fs-body)/24px var(--font-body);color:var(--ink)}
.results .definition:not(#_):not(#_):not(#_){margin:32px 0 0;grid-column:auto;color:var(--soft)}
.sample-tag{position:absolute;z-index:2;top:12px;left:12px;padding:2px 10px;border-radius:999px;background:#fff;color:var(--ink);font:500 var(--type-fs-small)/20px var(--font-body);box-shadow:0 0 0 1px var(--line)}
.sample-tag.inline{position:static;display:inline-block;margin-left:8px;box-shadow:0 0 0 1px var(--line);background:var(--well)}
.sr-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:32px 0 0}
.sr-photos figure{position:relative;margin:0}
.sr-photos img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:16px}
.sr-photos figcaption{margin:8px 0 0;font:400 var(--type-fs-small)/20px var(--font-body);color:var(--soft)}
#reviews{padding-top:128px}
#reviews h2{margin:0 0 32px}
.review-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin:0;padding:0;list-style:none}
.review-list li{position:relative;display:flex;flex-direction:column;gap:16px;padding:48px 24px 24px;background:var(--well);border-radius:16px}
.review-list blockquote{margin:0;font:400 var(--type-fs-body)/24px var(--font-body);color:var(--ink)}
.review-list cite{font:400 var(--type-fs-small)/20px var(--font-body);font-style:normal;color:var(--soft);margin-top:auto}
.week-count{margin:0 0 24px;font:400 var(--type-fs-body)/24px var(--font-body);color:var(--ink)}
#pricing .plan-note a{color:var(--ink);text-underline-offset:3px}
@media (max-width:899px){
 .hero-grid{grid-template-columns:minmax(0,1fr);gap:32px;min-height:0}
 .hero-grid .pane:not(#_){grid-template-columns:minmax(0,1fr)}
 .hero-grid .cta-row .btn:not(#_){width:100%}
 .hero-grid .free-note:not(#_){max-width:none;text-align:center}
 .proof.results:not(#_):not(#_):not(#_){margin-top:48px;padding:48px var(--edge)}
 .results-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}
 .results-list dd{font-size:var(--type-fs-h2)}
 .sr-photos{grid-template-columns:minmax(0,1fr)}
 #reviews{padding-top:96px}
 .review-list{grid-template-columns:minmax(0,1fr);gap:8px}
}
'''
    wr('home.css', c)

# ---- Build: section order, placeholders, guard files.
s = rd('build.py')
if 'placeholders.json' not in s:
    s = s.replace("'''% (nav, main, sec('product'), sec('crest'),", "'''% (nav, main, '', sec('crest'),")
    s = s.replace("''' % (nav, main, sec('product'), sec('crest'), sec('how'), hand, sec('sample'), sec('pricing'),", "''' % (nav, main, '', sec('crest'), sec('how'), hand, sec('sample') + reviews_html(), sec('pricing'),")
    s = s.replace('<script src="/v2/product.js" defer></script>\n', '')
    s = s.replace("hero = rd('hero-a.html')", r'''import json as _json
PH = {x['id']: x for x in _json.loads(rd('placeholders.json'))['items']}
def reviews_html():
    li = ''.join('<li><span class="sample-tag">Sample</span><blockquote>%s</blockquote><cite>%s</cite></li>' % (x['text'], x['who']) for k, x in PH.items() if k.startswith('review-'))
    return '<section id="reviews" aria-labelledby="rev-title"><h2 id="rev-title" data-reveal>What parents and students say</h2><ul class="review-list" role="list" data-reveal>' + li + '</ul></section>'
md = '# Stand-ins on the test link\n\nEach has a visible Sample tag. v2/guard.js refuses a production build while any item below is real:false.\n\n| Item | Where | What | How to swap |\n|---|---|---|---|\n' + ''.join('| %s | %s | %s | %s |\n' % (x['id'], x['where'], x.get('text') or x.get('file', ''), x['swap']) for x in PH.values())
open('placeholders.md', 'w', encoding='utf-8', newline='\n').write(md)
hero = rd('hero-a.html')''', 1)
    s = s.replace("body = post.home_text(body)\n", '''body = post.home_text(body)
_cnt = '<p class="week-count">%s<span class="sample-tag inline">Sample</span></p>' % PH['counter']['text']
assert '<div class="sheet-inner">' in body
body = re.sub(r'(<section[^>]*id="handin"[^>]*>.*?<div class="step"[^>]*>)', lambda m: m.group(1) + _cnt, body, count=1, flags=re.S) if re.search(r'id="handin"[^>]*>.*?<div class="step"', body, re.S) else body
_ph = '<div class="sr-photos" data-reveal><figure><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-script.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="A handwritten essay with red-pen marks on a wooden desk."><figcaption>Sample for illustration.</figcaption></figure><figure><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-report.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="A printed detailed report beside a red pen."><figcaption>Sample for illustration.</figcaption></figure></div>'
body = body.replace('<div class="sr-cta" data-reveal>', _ph + '<div class="sr-cta" data-reveal>', 1)
''', 1)
    wr('build.py', s)
s = rd('../vercel.json')
j = json.loads(s)
j['buildCommand'] = 'node v2/guard.js'; j['outputDirectory'] = '.'
wr('../vercel.json', json.dumps(j))
s = rd('../.vercelignore')
if 'v2/patch' not in s: wr('../.vercelignore', s.rstrip('\n') + '\nv2/make_*.js\nv2/*.md\nv2/assets-to-swap.md\n')
print('ok')
