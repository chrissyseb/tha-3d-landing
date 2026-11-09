import json, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def rep(p, a, b):
    s = rd(p)
    if b in s and a not in s: return
    assert a in s, (p, a[:60])
    wr(p, s.replace(a, b))

rep('sections/how.html', 'Marked like a script, explained like a lesson', 'We mark it the way an examiner would, and tell you why')
rep('sections/how.html', 'Fix it and climb', 'Rewrite it and re-mark it')
rep('sections/pricing.html', 'Start free. <span class="keep">Go deeper for S$39.</span>', 'Try it free. <span class="keep">Detailed reports: S$39 for 4.</span>')
rep('sections/pricing.html', "If a report fails, it doesn't use up one of your 4.", "If we can't mark a report, we re-mark it free, and if that fails we refund that report.")
rep('sections/cta.html', 'Detailed reports from S$39 for 4.', 'S$39 for 4 detailed reports.')
rep('sections/footer.html', 'Built on Thinking Hack™.', 'A Thinking Hack™ product.')
rep('sections/sample.html', 'Every paragraph marked, every criterion explained, and up to three fixes with a suggested rewrite.', 'We comment on each paragraph and criterion, and give up to three fixes with a suggested rewrite.')
rep('../app.html', 'A failed report doesn’t use a report credit. Just send your essay again.', "If we can't mark a report, we re-mark it free, and if that fails we refund that report.")
rep('../app.js', 'tuition-quality explanations', 'teacher-quality explanations')

s = rd('post.py')
if 'teacher-quality' not in s:
    s = s.replace('HOME = [\n', """HOME = [
 ('tuition-quality explanations','teacher-quality explanations'),
 ('<div class="sec-title"></span>','<div class="sec-title">'),
""", 1)
s = s.replace("'Watch your band climb'", "'See your band go up'").replace("'Free instant marking costs nothing: 3 markings", "'Instant marking is free: 3 markings")
wr('post.py', s)

s = rd('build.py')
if 'FAQ names' not in s:
    a = "io.open('../index.html', 'w'"
    s = s.replace(a, """# FAQ names in the schema carry no trademark sign; the visible text keeps it.
head = re.sub(r'("@type": "Question", "name": ")([^"]*)', lambda m: m.group(1) + m.group(2).replace('™', ''), head)
head = head.replace('<div class="sec-title"></span>', '<div class="sec-title">')
""" + a, 1)
    s = s.replace("body = body.replace('class=\"unlock\"'", "body = body.replace('<div class=\"sec-title\"></span>', '<div class=\"sec-title\">')\nbody = body.replace('class=\"unlock\"'", 1)
    wr('build.py', s)

d = json.loads(rd('placeholders.json')); d['flags']['results_strip'] = False
d['note'] = d['note'].split(' Flags:')[0] + ' Flags: sample_reviews and sample_counter are shown on the test link. The real 2025 class results moved into Masterclasses on 5 Nov.'
wr('placeholders.json', json.dumps(d, indent=2, ensure_ascii=False) + '\n')

rep('hero-a.html', 'From pasting your essay to a free band score', 'Free instant marking, ready in about a minute')
s = rd('sections/classes.html')
if 'class-results' not in s:
    block = '''  <div class="class-results" data-reveal>
   <h3>Our 2025 class results</h3>
   <ul role="list">
    <li><b>98%</b>of our PSLE English students scored AL1 or AL2</li>
    <li><b>100%</b>in PSLE Maths scored AL1 or AL2</li>
    <li><b>96%</b>in PSLE Science scored AL1 or AL2</li>
    <li><b>98%</b>in O-Level English scored A1</li>
    <li><b>98%</b>in GP scored A or B</li>
   </ul>
  </div>
'''
    i = s.rindex('</section>')
    j = s.rindex('</div>', 0, i)
    s = s[:j] + block + ' ' + s[j:]
    wr('sections/classes.html', s)
c = rd('home.css')
if 'class results' not in c:
    c += r'''
/* class results */
.class-results{grid-column:1/-1;margin-top:48px;padding-top:32px;border-top:1px solid var(--line)}
.class-results h3:not(#_){margin:0 0 24px}
.class-results ul{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px;margin:0;padding:0;list-style:none}
.class-results li{font:400 var(--type-fs-body)/24px var(--font-body);color:var(--ink)}
.class-results b{display:block;margin-bottom:8px;font:var(--w-head) var(--type-fs-h2)/1.1 var(--font-head);letter-spacing:-.01em;color:var(--ink)}
@media (max-width:899px){.class-results{margin-top:32px}.class-results ul{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px}}
'''
    wr('home.css', c)
l = rd('../llms.txt')
l = l.replace('## 2025 results\nPSLE English 98% AL1/2, PSLE Maths 100% AL1/2, PSLE Science 96% AL1/2, O-Level English 98% A1, GP 98% A/B.', '## 2025 class results (Thinking Hack™ Masterclasses)\n98% of PSLE English students scored AL1 or AL2; 100% in PSLE Maths scored AL1 or AL2; 96% in PSLE Science scored AL1 or AL2; 98% in O-Level English scored A1; 98% in GP scored A or B.')
wr('../llms.txt', l)
print('ok')
