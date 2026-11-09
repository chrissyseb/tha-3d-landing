# Assembles the new home page: site-v2/index.html. Run from site-v2/v2: python build.py
# Reuses the old page's head tags, JSON-LD and marking script unchanged; old logic is not rewritten.
import re, io, os, sys
import post
OLD = "../../backups/site-rd1104-pass2/index.html"
h = io.open(OLD, encoding="utf-8", newline="").read()
rd = lambda p: io.open(p, encoding="utf-8").read()
def section(pat, src=h):
    m = re.search(pat, src)
    assert m, pat
    i = m.start(); d = 0
    for t in re.finditer(r'<(/?)section\b[^>]*>', src[i:]):
        d += -1 if t.group(1) else 1
        if d == 0:
            return src[i:i + t.end()]
    raise SystemExit("unclosed " + pat)
def by_id(tag, id_):
    m = re.search(r'<%s\b[^>]*\bid="%s"[^>]*>' % (tag, id_), h)
    assert m, id_
    i = m.start(); d = 0
    for t in re.finditer(r'<(/?)%s\b[^>]*>' % tag, h[i:]):
        d += -1 if t.group(1) else 1
        if d == 0:
            return h[i:i + t.end()]
    raise SystemExit("unclosed " + id_)

# head: every meta, link and title from the old page, minus font preloads we replace below
pre = h[:h.find('<div id="pvBanner"')]
pre = re.sub(r'<style\b.*?</style>', '', pre, flags=re.S)
pre = re.sub(r'<script\b.*?</script>', '', pre, flags=re.S)
tags = re.findall(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*>', pre, flags=re.S)
tags = [t for t in tags if 'as="font"' not in t and 'stylesheet' not in t and 'claude:' not in t and 'charset' not in t and 'name="viewport"' not in t]
ld = re.search(r'<script type="application/ld\+json">.*?</script>', h, re.S).group(0)
import json
_d = json.loads(re.sub(r'</?script[^>]*>', '', ld))
for _n in _d.get('@graph', []):
    if _n.get('@type') == 'FAQPage':   # the old data listed one question twice; keep the answer shown on the page
        _seen = {}
        for _q in _n['mainEntity']: _seen[_q['name']] = _q
        _n['mainEntity'] = list(_seen.values())
ld = '<script type="application/ld+json">' + json.dumps(_d, ensure_ascii=False) + '</script>'
scripts = {}
for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>', h, re.S):
    b = m.group(2).strip()
    if 'Owner pass' in b[:40]: scripts['owner'] = m.group(0)
    if b.startswith('(function(){var q=location.search,h'): scripts['fwd'] = m.group(0)
    if b.startswith('/* forward payment'): scripts['fwdpay'] = m.group(0)
    if b.startswith('const PAPERS'): io.open('marker.js', 'w', encoding='utf-8', newline='\n').write(post.home_text(post.result_labels(m.group(2))))
    if b.startswith('// "Take a photo"'): io.open('photo.js', 'w', encoding='utf-8', newline='\n').write(m.group(2))

sec = lambda n: rd('sections/%s.html' % n) if os.path.exists('sections/%s.html' % n) else '<!-- %s pending -->' % n
csses = [c for c in ('proof', 'product', 'how', 'crest', 'classes', 'sample', 'faq', 'pricing', 'footer') if os.path.exists('sections/%s.css' % c)]

# Essay box: old markup and ids so the old script keeps working; only headings change case
hand = section(r'<section class="sheet handin"')
hand = hand.replace('<span class="kicker">Essay Marker</span>', '').replace('Send Us Your Essay', 'Send us your essay').replace('>Your Essay<', '>Your essay<').replace('The question <span', 'The question <span')

i = hand.index('<div class="step">'); hand = hand[:i] + '<div class="hand-form">' + hand[i:]
j = hand.rindex('</div>', 0, hand.rindex('</section>')); hand = hand[:j] + '</div>' + hand[j:]

hand, _n = re.subn(r'<div class="row" style="align-items:center">\s*(<button class="btn ghost" id="timerBtn".*?</button>)\s*(<span class="counter" id="timerOut".*?</span>)\s*</div>', r'<div class="row">\1\2</div>', hand, flags=re.S)
hand = hand.replace('<p class="hint" style="margin:6px 0 0">Type it, paste it, or snap a photo of your handwritten essay.</p>', '')

# Elements the old script expects but the new page does not show. Kept hidden, ids intact.
msg = re.search(r'<[a-z]+\b[^>]*\bid="msgBox"', h)
msgtag = msg.group(0).split()[0][1:]
ask = post.stub(section(r'<section class="sheet" aria-labelledby="t-ask"'))
mc = post.stub(section(r'<section class="sheet" id="masterclasses"')).replace('<section id="masterclasses"></section>', '').replace('<h2 id="t-mc"></h2>', '')
extra = rd('legacy-extra.html') if os.path.exists('legacy-extra.html') else ''
visible_state = '<div hidden>' + post.stub(section(r'<section class="sheet[^"]*" id="adminBox"')) + '</div>' + post.no_headings(''.join(section(r'<section class="sheet[^"]*" id="%s"' % n) for n in ('histBox', 'chBox', 'joinBox')))

head = '''<!DOCTYPE html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
%s
<link rel="preload" href="/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/caveat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/v2/tokens.css">
<link rel="stylesheet" href="/v2/legacy.css">
<link rel="stylesheet" href="/v2/hero.css">
%s
<link rel="stylesheet" href="/v2/home.css">
<link rel="stylesheet" href="/v2/roles.css">
%s
%s
%s
<script src="/example-names.js" defer></script>
<script src="/exam-dates.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
%s
</head>
''' % ('\n'.join(tags), '\n'.join('<link rel="stylesheet" href="/v2/sections/%s.css">' % c for c in csses),
       scripts['owner'], scripts['fwd'], scripts['fwdpay'], ld)

import json as _json
_pj = _json.loads(rd('placeholders.json')); PH = {x['id']: x for x in _pj['items']}; FLAGS = _pj['flags']
def reviews_html():
    if not FLAGS['sample_reviews']: return ''
    li = ''.join('<li><span class="sample-tag">Sample</span><blockquote>%s</blockquote><cite>%s</cite></li>' % (x['text'], x['who']) for k, x in PH.items() if k.startswith('review-'))
    return '<section id="reviews" aria-labelledby="rev-title"><h2 id="rev-title" data-reveal>What parents and students say</h2><ul class="review-list" role="list" data-reveal>' + li + '</ul></section>'
md = '# Stand-ins on the test link\n\nEach has a visible Sample tag. v2/guard.js refuses a production build while any item below is real:false.\n\n| Item | Where | What | How to swap |\n|---|---|---|---|\n' + ''.join('| %s | %s | %s | %s |\n' % (x['id'], x['where'], x.get('text') or x.get('file', ''), x['swap']) for x in PH.values())
open('placeholders.md', 'w', encoding='utf-8', newline='\n').write(md)
hero = rd('hero-a.html')
nav = re.search(r'<header class="nav">.*?</header>', hero, re.S).group(0).replace('href="/#', 'href="#').replace('href="/"', 'href="#top"').replace('href="/about"', 'href="/about.html"')
main = re.sub(r'<!--FACTS-->.*?<!--/FACTS-->' if FLAGS['results_strip'] else r'<!--RESULTS-->.*?<!--/RESULTS-->', '', re.search(r'<section class="hero">.*?</section>', hero, re.S).group(0), flags=re.S).replace('href="/#', 'href="#').replace('<section class="hero">', '<section class="hero" id="top">')
main = main.replace('</section>', '<script src="/v2/hero.js"></script></section>')

body = '''<body class="opt-a">
<a class="skip" href="#handin">Skip to the essay box</a>
%s
<main class="container">
%s
%s
%s
%s
%s
<section id="result" aria-live="polite"></section>
%s
%s
%s
%s
</main>
%s
<div id="v2State">%s</div>
%s
<div id="legacyHidden" hidden>%s%s%s</div>
%s
<script src="/v2/marker.js"></script>
<script src="/v2/photo.js"></script>
<script src="/v2/enhance.js"></script>
<script src="/v2/leads.js"></script>
<script src="/v2/sections/sample.js" defer></script>
<script src="/v2/reveal.js" defer></script>
</body>
</html>
''' % (nav, main, '', sec('crest'), sec('how'), hand, sec('sample') + reviews_html(), sec('pricing'), sec('classes'), sec('faq') + sec('cta'), sec('footer'),
       visible_state, post.no_headings(by_id(msgtag, 'msgBox')), post.no_headings(ask), post.no_headings(mc), extra, '<aside aria-label="Contact">' + re.search(r'<a class="wa-float".*?</a>', h, re.S).group(0) + '</aside>')
if not os.path.exists('sections/sample.js'):
    body = body.replace('<script src="/v2/sections/sample.js" defer></script>\n', '')
body = body.replace('href="/#', 'href="#')
body = post.home_text(body)
_cnt = ('<p class="week-count">%s<span class="sample-tag inline">Sample</span></p>' % PH['counter']['text']) if FLAGS['sample_counter'] else '<p class="week-count" id="community" hidden></p>'
assert '<div class="sheet-inner">' in body
body = re.sub(r'(<section[^>]*id="handin"[^>]*>.*?<div class="step"[^>]*>)', lambda m: m.group(1) + _cnt, body, count=1, flags=re.S) if re.search(r'id="handin"[^>]*>.*?<div class="step"', body, re.S) else body
_ph = '<div class="sr-photos" data-reveal><figure><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-script.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="A handwritten essay with red-pen marks on a wooden desk."><figcaption>Sample for illustration.</figcaption></figure><figure><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-report.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="A printed detailed report beside a red pen."><figcaption>Sample for illustration.</figcaption></figure></div>'
body = body.replace('<div class="sr-cta" data-reveal>', _ph + '<div class="sr-cta" data-reveal>', 1)
body = re.sub(r'<span class="kicker">.*?</span>', '', body, flags=re.S)
body = body.replace('>Send us your essay<', '>Mark your essay<').replace('>Marks for this question<', '>Total marks for this question (from the paper)<')
body = body.replace('<div class="sec-title"></span>', '<div class="sec-title">')
body = body.replace('class="unlock"', 'class="upgrade-box"').replace('unlockBox', 'upgradeBox').replace('unlockWhy', 'upgradeWhy')
_m = rd('marker.js')
_need = set(re.findall(r'\$\("#([\w-]+)"\)', _m)) | set(re.findall(r'getElementById\("([\w-]+)"\)', _m))
_dyn = set(re.findall(r'id="([\w-]+)"', _m))
_miss = sorted(i for i in _need if ('id="%s"' % i) not in body and i not in _dyn)
print('stubs added for', _miss)
body = body.replace('<div id="legacyHidden" hidden>', '<div id="legacyHidden" hidden>' + ''.join('<div id="%s"></div>' % i for i in _miss))
head = head.replace('EssayLabsg™ | Essay Marking &amp; Feedback', 'EssayLabsg™ | Essay marking &amp; feedback')
# SEO head
head = re.sub(r'<link rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>\s*', '', head)
head = head.replace('</title>', '</title>\n<link rel="icon" href="/favicon.ico?v=10" sizes="48x48"><link rel="icon" href="/favicon.svg?v=10" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=10"><link rel="manifest" href="/site.webmanifest?v=10">', 1)
head = re.sub(r'<title>[^<]*</title>', '<title>PSLE, O-Level and GP Essay Marking in Singapore | EssayLabsg™</title>', head, count=1)
head = re.sub(r'<meta property="og:title" content="[^"]*"', '<meta property="og:title" content="PSLE, O-Level and GP essay marking | EssayLabsg™"', head)
head = re.sub(r'<meta name="twitter:card" content="[^"]*"', '<meta name="twitter:card" content="summary_large_image"', head)
head = head.replace('twitter:image" content="https://essaylab-sg.vercel.app/og-square.jpg', 'twitter:image" content="https://essaylab-sg.vercel.app/og.jpg')
DESC = '3 free instant markings for PSLE English, O-Level English and GP, in about a minute. AL, band or grade against SEAB and Cambridge criteria, with red-pen fixes.'
assert len(DESC) <= 160, len(DESC)
head, n1 = re.subn(r'<meta name="description" content="[^"]*"', '<meta name="description" content="%s"' % DESC, head)
head, n2 = re.subn(r'<meta property="og:description" content="[^"]*"', '<meta property="og:description" content="PSLE, O-Level, A-Level GP, IB &amp; IGCSE essay marking. 3 free instant markings, or detailed reports by Exam Preparation Specialists™."', head)
assert n1 == 1 and n2 == 1, (n1, n2)
head = head.replace(ld, post.ld_fix(ld, post.home_text(sec('faq'))))
head = head.replace('?v=7', '?v=10')
# FAQ names in the schema carry no trademark sign; the visible text keeps it.
head = re.sub(r'("@type": "Question", "name": ")([^"]*)', lambda m: m.group(1) + m.group(2).replace('™', ''), head)
head = head.replace('<div class="sec-title"></span>', '<div class="sec-title">')
GETS = '<ul class="hand-gets"><li>An estimated score, band and grade</li><li>A mark and a short comment for each criterion</li><li>Your most important improvement, highlighted on your essay</li><li>One free re-mark after you revise it</li><li>Ready in about a minute</li></ul><figure class="hand-photo"><span class="sample-tag">Sample</span><img src="/img/stand-in/photo-report.webp" width="1400" height="1050" loading="lazy" decoding="async" alt="Sample photo of a marked report"></figure>'
_a = 'Marked against the published SEAB, Cambridge and IB criteria.</span></div>'
assert _a in body
body = body.replace(_a, _a[:-6] + GETS + '</div>', 1)
body = body.replace('</body>', '<script src="/v2/motion-pause.js" defer></script><script src="/v2/nav.js" defer></script></body>', 1)
head = head.replace('</head>', '<link rel="stylesheet" href="/v2/nav.css"><link rel="stylesheet" href="/v2/print.css" media="print"></head>', 1)
io.open('../index.html', 'w', encoding='utf-8', newline='\n').write(head + body)
print('built', len(head + body), 'msg tag', msgtag, 'tags', len(tags))
