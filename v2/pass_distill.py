rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
h = rd('sections/pricing.html')
h = h.replace('<h3>Free instant marking</h3>', '<h3>Instant marking</h3>')
assert 'For 4 essays, less than S$10 each.' in h
h = h.replace('For 4 essays, less than S$10 each.', 'For 4 essays.')
wr('sections/pricing.html', h)
b = rd('build.py')
a = "visible_state = post.no_headings(''.join(section(r'<section class=\"sheet[^\"]*\" id=\"%s\"' % n) for n in ('adminBox', 'histBox', 'chBox', 'joinBox')))"
assert a in b
# Any address with ?admin is sent to /app.html before this page runs, so the admin panel's inputs need not be on the home page.
b = b.replace(a, "visible_state = '<div hidden>' + post.stub(section(r'<section class=\"sheet[^\"]*\" id=\"adminBox\"')) + '</div>' + post.no_headings(''.join(section(r'<section class=\"sheet[^\"]*\" id=\"%s\"' % n) for n in ('histBox', 'chBox', 'joinBox')))")
wr('build.py', b)
c = rd('home.css')
c += r"""
/* distill: the essay box comes sooner. One line per paper, no countdown line, no floating button over text on phones */
#handin .exam-cd:not(#_):not(#_){display:none!important}
#handin .papers:not(#_):not(#_){grid-template-columns:repeat(3,minmax(0,1fr))}
#handin .paper-opt:not(#_):not(#_){min-height:48px;padding:12px;display:flex;align-items:center}
#handin .paper-opt small:not(#_):not(#_){display:none!important}
@media (max-width:899px){#handin .papers:not(#_):not(#_){grid-template-columns:repeat(2,minmax(0,1fr))}.wa-float:not(#_):not(#_){display:none}}
"""
wr('home.css', c)
ap = rd('../app.html')
print('a few minutes count', ap.count('Detailed: a few minutes'))
wr('../app.html', ap.replace('Detailed: a few minutes', 'Detailed: within 48 hours'))
