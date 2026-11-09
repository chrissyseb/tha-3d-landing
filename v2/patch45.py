import glob, os, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
miss = []
def rep(p, a, b, all=True):
    s = rd(p)
    if a not in s:
        if b not in s: miss.append((p, a[:70]))
        return
    wr(p, s.replace(a, b) if all else s.replace(a, b, 1))
# Facts that disagreed between pages
rep('../app.html', 'Detailed feedback: a few minutes.', 'Detailed feedback within 48 hours.')
rep('hero-a.html', 'A-Level</span> GP. No sign-up.', 'A-Level</span> GP. The first needs no sign-up.')
rep('../about.html', 'Detailed reports, marked by Exam Preparation Specialists™, are a separate, priced option: message us to ask about it.', 'Detailed feedback is S$39 for 4 reports, marked by Exam Preparation Specialists™ and ready within 48 hours.')
rep('../app.html', 'Built for Singapore primary schools', 'Built for PSLE students in Singapore')
rep('../psle-composition-marking.html', 'Built for Singapore primary schools', 'Built for PSLE students in Singapore')
rep('../psle-composition-marking.html', 'Free instant marking covers PSLE English, 3 free instant markings. The first needs no sign-up, the other 2 need your email.', 'You get 3 free instant markings for PSLE English. The first needs no sign-up, the other 2 need your email.')
rep('../thanks.html', 'paste or upload it', 'paste or type it. Detailed feedback takes typed text, not photos')
# llms.txt
s = rd('../llms.txt')
n = re.sub(r'^- Free:[^\n]*', '- Free: 3 instant markings for PSLE English, O-Level English and A-Level GP. The first needs no sign-up, the other 2 need an email. Ready in about a minute.', s, count=1, flags=re.M)
if n == s and 'The first needs no sign-up' not in s: miss.append(('llms', 'Free bullet'))
wr('../llms.txt', n)
# App hero and share text must not imply specialists do the free marking
s = rd('../app.html')
s2 = re.sub(r'Marked by Exam Preparation Specialists™\. Get an estimated score against your\s+exam’s criteria and clear advice on what to improve\. Try free instant marking or\s+choose detailed feedback, marked by Exam Preparation Specialists™ and ready\s+within 48 hours\.',
            'Get an estimated score against your exam’s criteria and clear advice on what to improve. Try free instant marking, or choose detailed feedback, marked by Exam Preparation Specialists™ and ready within 48 hours.', s)
if s2 == s: miss.append(('app', 'hero paragraph'))
s3 = re.sub(r'(<meta property="og:description" content=")[^"]*(")', r'\1PSLE, O-Level, A-Level GP, IB &amp; IGCSE essays marked against the published criteria. 3 free instant markings, or detailed reports by Exam Preparation Specialists™.\2', s2, count=1)
wr('../app.html', s3)
# Sitemap: app.html is noindex
s = rd('../sitemap.xml'); n = re.sub(r'\s*<url>\s*<loc>[^<]*app\.html</loc>.*?</url>', '', s, flags=re.S); wr('../sitemap.xml', n)
# thanks share tags
s = rd('../thanks.html')
m = re.search(r'<meta name="description" content="([^"]*)"', s)
s = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\1Thank you · EssayLabsg™', s, count=1)
if m: s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda x: x.group(1) + m.group(1), s, count=1)
s = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\1https://essaylab-sg.vercel.app/thanks.html', s, count=1)
wr('../thanks.html', s)
# Sentence case leftovers, in the pages and in the strings the app script writes
PAIRS = [('Mark My Essay','Mark my essay'),('More Subjects','More subjects'),('Subscribe by Card — S$39 for 4 Reports','Subscribe by card: S$39 for 4 reports'),('Get Detailed Feedback','Get detailed feedback'),('Evidence From Your Essay','Evidence from your essay'),('What This Band Means','What this band means'),('To Reach the Next Band','To reach the next band'),('3 Improvements Worth the Most Marks','3 improvements worth the most marks'),('Model Paragraph','Model paragraph'),('Writing Analytics','Writing analytics'),('Framework Audit','Framework audit'),('Ask About Availability','Ask about availability'),('Send It to Me','Send it to me'),('Get the Checklists','Get the checklists'),('Leave Your Details','Leave your details'),('Have an Invite or Promo Code?','Have an invite or promo code?'),('Copy Link and Text','Copy link and text'),('Your Detailed Reports','Your detailed reports'),('Monthly Plan','Monthly plan'),('31-Day Pass','31-day pass'),('Subscribe Now','Get detailed feedback'),('PEEL Audited with Point · Evidence · Explanation · Link, paragraph by paragraph.','PEEL audit: Point, Evidence, Explanation, Link, paragraph by paragraph.'),('for S$39 for 4 reports','at S$39 for 4 reports')]
files = glob.glob('../*.html') + ['../app.js', 'marker.js', 'pricing.html' if os.path.exists('pricing.html') else 'sections/pricing.html', 'sections/faq.html', 'post.py']
for f in files:
    if not os.path.exists(f) or f.endswith('index.html'): continue
    s = t = rd(f)
    for a, b in PAIRS: s = s.replace(a, b)
    if s != t: wr(f, s)
# Article FAQ questions (visible and schema), and legal H2s
KEEP = {'PSLE','O-Level','A-Level','GP','IB','IGCSE','SEAB','Cambridge','Singapore','English','Literature','Humanities','EssayLabsg™','I','AL','AQ','Paper','WhatsApp','PayNow','PDPA'}
def sent(t):
    w = t.split(' '); o = [w[0]]
    for x in w[1:]:
        c = x.strip('?,.:;!()"’')
        o.append(x if not c or not c[0].isupper() or c in KEEP or c.isupper() else x.replace(c, c[0].lower() + c[1:], 1))
    return ' '.join(o)
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    s = t = rd(f)
    s = re.sub(r'(<summary[^>]*>)([A-Z][^<]{3,110})(</summary>)', lambda m: m.group(1) + sent(m.group(2)) + m.group(3), s)
    s = re.sub(r'("@type": "Question", "name": ")([^"]+)', lambda m: m.group(1) + sent(m.group(2)), s)
    if os.path.basename(f) in ('terms.html', 'privacy.html'):
        s = re.sub(r'(<h[23][^>]*>)([A-Z][^<]{3,70})(</h[23]>)', lambda m: m.group(1) + sent(m.group(2)) + m.group(3), s)
    s = s.replace('With Detailed feedback', 'With detailed feedback')
    if s != t: wr(f, s)
print('missed', miss)
