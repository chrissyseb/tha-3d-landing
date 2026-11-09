import glob, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def rep(p, a, b):
    s = rd(p)
    if a in s: wr(p, s.replace(a, b)); return 1
    return 0
LONG = "Share your link. When 7 new people open it, each on their own device and network, you get a free detailed report."
# 1
rep('sections/faq.html', "Free essays aren't kept, unless you tick the box below.", "Free essays aren't kept unless you tick the teaching-example box when you hand in.")
rep('sections/footer.html', "Free essays aren't kept, unless you tick the teaching-example box.", "Free essays aren't kept unless you tick the teaching-example box when you hand in.")
# 2
for f in glob.glob('../*.html'): rep(f, '/#testimonials', '/#reviews')
# 5 official -> published
for f in glob.glob('sections/*.html') + ['hero.js']:
    s = rd(f); n = s.replace('official criteria', 'published criteria').replace('official SEAB', 'published SEAB').replace('Official criteria', 'Published criteria')
    if n != s: wr(f, n)
# 6, 7, 8, 9, 10
HOME_REFUND = "If we can't mark your essay, we re-mark it free. If we still can't, we refund that report."
rep('sections/pricing.html', "If we can't mark a report, we re-mark it free, and if that fails we refund that report.", HOME_REFUND)
rep('../app.html', "If we can't mark a report, we re-mark it free, and if that fails we refund that report.", HOME_REFUND)
rep('../app.html', "A report that fails to generate doesn’t use a report credit", HOME_REFUND.rstrip('.'))
rep('../terms.html', "If a report fails to generate, its credit is returned automatically.", "If we can't deliver a report, its credit is returned automatically.")
rep('sections/pricing.html', 'Marked the way examiners mark, using the Thinking Hack™ frameworks our Exam Preparation Specialists™ teach', 'Marked to the published criteria with the Thinking Hack™ frameworks')
rep('sections/pricing.html', 'Try it free. <span class="keep">Detailed reports: S$39 for 4.</span>', 'Try it free. <span class="keep">Then 4 detailed reports for S$39.</span>')
rep('sections/pricing.html', 'S$39 for 4 essays: less than S$10 each.', 'Under S$10 an essay.')
rep('sections/cta.html', 'S$39 for 4 detailed reports.', 'Or get 4 detailed reports for S$39, marked by Exam Preparation Specialists™ within 48 hours.')
# 11, 12, 3
s = rd('post.py')
if 'Message our specialists' not in s:
    s = s.replace('HOME = [\n', """HOME = [
 ('Message Our Specialists','Message our specialists'),('official SEAB','published SEAB'),('official criteria','published criteria'),
 (' Share with 7 people. Get a free detailed report.',''),
""", 1)
    s = s.replace("('Share with 7 people. Get a free detailed report.', SHARE_NEW),\n", "('<span id=\"invHint\">Share with 7 people. Get a free detailed report.</span>', '<span id=\"invHint\"></span>'),\n ('Share with 7 people. Get a free detailed report.', SHARE_NEW),\n")
    wr('post.py', s)
s = rd('build.py')
if 'summary_large_image' not in s:
    a = "# SEO head\n"
    s = s.replace(a, a + """head = re.sub(r'<title>[^<]*</title>', '<title>PSLE, O-Level and GP Essay Marking in Singapore | EssayLabsg™</title>', head, count=1)
head = re.sub(r'<meta property="og:title" content="[^"]*"', '<meta property="og:title" content="PSLE, O-Level and GP essay marking | EssayLabsg™"', head)
head = re.sub(r'<meta name="twitter:card" content="[^"]*"', '<meta name="twitter:card" content="summary_large_image"', head)
head = head.replace('twitter:image" content="https://essaylab-sg.vercel.app/og-square.jpg', 'twitter:image" content="https://essaylab-sg.vercel.app/og.jpg')
""", 1)
    wr('build.py', s)
rep('../llms.txt', '## 2025 class results (Thinking Hack™ Masterclasses)', '## 2025 Masterclass results')
print('ok')
