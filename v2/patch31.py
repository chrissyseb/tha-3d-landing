import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def rep(p, a, b, must=True):
    s = rd(p)
    if a not in s:
        assert not must or b in s, (p, a[:60])
        return
    wr(p, s.replace(a, b))
LEAD_OLD = 'In about a minute you get a band score, red-pen comments'
rep('hero-a.html', LEAD_OLD, 'In about a minute you get an AL, band or grade, red-pen comments')
rep('sections/how.html', 'A band score against the official criteria', 'An AL, band or grade against the official criteria')
rep('sections/sample.html', '<p class="sr-grade">Est. grade C</p>', '<p class="sr-grade">Paper 1 estimate</p>')
SHARE = 'Share your link. When 7 new people open it, each on their own device and network, you get a free detailed report.'
rep('sections/pricing.html', 'Share with 7 people. Get a free detailed report.', SHARE)
s = rd('sections/pricing.html')
s = s.replace('<span>For 4 essays.</span>', '<span>S$39 for 4 detailed reports.</span>')
s = s.replace('Get 4 reports · S$39 a month', 'Get 4 detailed reports · S$39')
s = s.replace('<a href="/app.html#planBox">Or pay once with a 31-day pass</a>. ', '<a href="/app.html#planBox">Pay by card monthly, or PayNow once for 31 days.</a> ')
wr('sections/pricing.html', s)
f = rd('sections/faq.html')
f = re.sub(r'13 papers: PSLE English, O-Level English, Literature, Social Studies, History and Geography, A-Level General Paper \(Paper 1 and the Paper 2 AQ\), IB English Lang &amp; Lit and IGCSE English\.', '13 papers: PSLE English and Situational Writing, O-Level English and Situational Writing, O-Level Literature, Social Studies, History and Geography, A-Level General Paper (Paper 1 and the Paper 2 AQ), IB English Lang &amp; Lit (Paper 1 and Paper 2) and IGCSE English.', f)
assert 'IB English Lang &amp; Lit (Paper 1 and Paper 2)' in f
f = re.sub(r'They design the marking criteria and the frameworks EssayLabsg(&trade;|™) uses, and they teach', 'They mark to the published SEAB criteria, use the Thinking Hack&trade; frameworks, and teach', f)
assert 'mark to the published SEAB criteria' in f
n = re.sub(r"[^.>]*not kept on our servers[^.<]*\.", " Free essays aren't kept, unless you tick the box below.", f)
print('faq kept sentences', f.count('not kept on our servers')); wr('sections/faq.html', n)
s = rd('sections/footer.html')
n = re.sub(r"Free marking: your essay is marked and not kept on our servers\.", "Free essays aren't kept, unless you tick the teaching-example box.", s)
print('footer changed', n != s); wr('sections/footer.html', n)
s = rd('sections/classes.html')
if 'quotes-h' not in s:
    s = s.replace('<div class="classes-quotes">', '<h3 class="quotes-h">What Masterclass parents told us</h3><div class="classes-quotes">', 1)
    wr('sections/classes.html', s)
s = rd('post.py')
if 'SHARE_NEW' not in s:
    s = s.replace('HOME = [\n', """SHARE_NEW = 'Share your link. When 7 new people open it, each on their own device and network, you get a free detailed report.'
HOME = [
 ('Share with 7 people. Get a free detailed report.', SHARE_NEW),
 ('or share with 7 people to get a detailed report free', 'or share your link with 7 new people to earn a detailed report'),
 ('Your tutor approves this phone or laptop once, then you mark free and unlimited here.', 'Send us a request on WhatsApp. Once we approve it, this device gets free instant marking on every paper, up to 15 an hour. It does not cover detailed reports.'),
""", 1)
    wr('post.py', s)
s = rd('build.py')
if 'Mark your essay<' not in s:
    s = s.replace("body = body.replace('<div class=\"sec-title\"></span>'", "body = body.replace('>Send us your essay<', '>Mark your essay<').replace('>Marks for this question<', '>Total marks for this question (from the paper)<')\nbody = body.replace('<div class=\"sec-title\"></span>'", 1)
    s = s.replace("DESC = '3 free instant markings for PSLE English, O-Level English and GP, in about a minute. Band scores against SEAB and Cambridge criteria, with red-pen fixes.'", "DESC = '3 free instant markings for PSLE English, O-Level English and GP, in about a minute. AL, band or grade against SEAB and Cambridge criteria, with red-pen fixes.'")
    wr('build.py', s)
s = rd('../app.html')
s = s.replace('>Marks for this question<', '>Total marks for this question (from the paper)<')
s = s.replace('Your tutor approves this phone or laptop once, then you mark free and unlimited here.', 'Send us a request on WhatsApp. Once we approve it, this device gets free instant marking on every paper, up to 15 an hour. It does not cover detailed reports.')
wr('../app.html', s)
c = rd('home.css')
if 'quotes-h' not in c:
    c += '\n/* quotes heading */\n.quotes-h:not(#_):not(#_){margin:32px 0 16px}\n'
    wr('home.css', c)
print('ok')
