from PIL import Image
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, a[:60]
    wr(p, s.replace(a, b))

# GSAP: sequence the hero intro with a timeline, not delays; hand transforms back to CSS when done.
sub('hero.js',
 '''    g.from(".hero-side", {opacity: 0, y: calm ? 0 : 12, duration: .8, delay: .12, ease: "expo.out"});
    g.from(".frame", {opacity: 0, y: calm ? 0 : 24, duration: 1, delay: .24, ease: "expo.out", onStart: () => show(cur)});''',
 '''    g.timeline({defaults: {ease: "expo.out", clearProps: "transform"}})
      .from(".hero-side", {opacity: 0, y: calm ? 0 : 12, duration: .8}, .12)
      .from(".frame", {opacity: 0, y: calm ? 0 : 24, duration: 1, onStart: () => show(cur)}, .24);''')
sub('hero.js', 'name: "PSLE Composition"', 'name: "PSLE composition"')

# Copy: plain words, nothing unproven, and sample figures labelled.
sub('sections/pricing.html', "A failed report doesn't use a credit. Less than one hour of most tuition.", "If a report fails, it doesn't use up one of your 4.")
sub('sections/how.html', 'the reasons behind each mark and the fixes worth the most.', 'the reason behind each mark and the fix worth the most.')
sub('sections/how.html', '<p class="how-note">Re-marked 28 → 34</p>', '<p class="how-note">Sample: re-marked 28 → 34</p>')

# Marker: smaller share-card logo; only show the free count once the server has given it.
s = rd('post.py')
if 'logo-mark-512.webp' not in s:
    s = s.replace("HOME = [\n", "HOME = [\n ('LOGO_MARK.src = \"/logo-mark.png\"','LOGO_MARK.src = \"/logo-mark-512.webp\"'),\n ('renderInvites(); updWaTop(); }\\n  updFree();\\n}','renderInvites(); updWaTop(); updFree(); }\\n}'),\n", 1)
    wr('post.py', s)
Image.open('../logo-mark.png').save('../logo-mark-512.webp', quality=92, alpha_quality=100, method=6)

# SEO: description within 160 characters; share text accurate about who marks what.
s = rd('build.py')
if 'SEO head' not in s:
    a = "head = head.replace(ld, post.ld_fix("
    assert a in s
    s = s.replace(a, '''# SEO head
DESC = '3 free instant markings for PSLE English, O-Level English and GP, in about a minute. Band scores against SEAB and Cambridge criteria, with red-pen fixes.'
assert len(DESC) <= 160, len(DESC)
head, n1 = re.subn(r'<meta name="description" content="[^"]*"', '<meta name="description" content="%s"' % DESC, head)
head, n2 = re.subn(r'<meta property="og:description" content="[^"]*"', '<meta property="og:description" content="PSLE, O-Level, A-Level GP, IB &amp; IGCSE essay marking. 3 free instant markings, or detailed reports by Exam Preparation Specialists™."', head)
assert n1 == 1 and n2 == 1, (n1, n2)
''' + a, 1)
    wr('build.py', s)

wr('../llms.txt', """# EssayLabsg™

> Essay marking for Singapore exam students: PSLE, O-Level, A-Level General Paper, IB and IGCSE. Essays are marked against the published SEAB, Cambridge and IB criteria. EssayLabsg™ is a product of Thinking Hack™.

## Pricing
- Free: 3 instant markings for PSLE English, O-Level English and A-Level GP, no sign-up, ready in about a minute.
- Detailed feedback: S$39 for 4 essays, marked by Exam Preparation Specialists™, within 48 hours. Available as a monthly plan or a one-off 31-day pass. Covers all 13 papers.

## Pages
- [Home and essay box](https://essaylab-sg.vercel.app/)
- [PSLE composition marking](https://essaylab-sg.vercel.app/psle-composition-marking.html)
- [PSLE situational writing](https://essaylab-sg.vercel.app/psle-situational-writing.html)
- [O-Level English essay marking](https://essaylab-sg.vercel.app/o-level-english-essay-marking.html)
- [A-Level GP essay marking](https://essaylab-sg.vercel.app/gp-essay-marking.html)
- [IB English Paper 1 marking](https://essaylab-sg.vercel.app/ib-english-paper-1.html)
- [IGCSE English essay marking](https://essaylab-sg.vercel.app/igcse-english-essay-marking.html)
- [About](https://essaylab-sg.vercel.app/about.html)

## Notes
Scores are an estimate against the published criteria. EssayLabsg™ is not affiliated with or endorsed by SEAB, Cambridge Assessment or the IB.
""")
print('ok')
