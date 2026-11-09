# Final text and structure pass used by build.py. Labels only; marking logic is not changed.
import re, json, html as H
SHARE_NEW = 'Share your link. When 7 new people open it, each on their own device and network, you get a free detailed report.'
HOME = [
 ('Message Our Specialists','Message our specialists'),('official SEAB','published SEAB'),('official criteria','published criteria'),
 (' Share with 7 people. Get a free detailed report.',''),
 ('<span id="invHint">Share with 7 people. Get a free detailed report.</span>', '<span id="invHint"></span>'),
 ('Share with 7 people. Get a free detailed report.', SHARE_NEW),
 ('or share with 7 people to get a detailed report free', 'or share your link with 7 new people to earn a detailed report'),
 ('Your tutor approves this phone or laptop once, then you mark free and unlimited here.', 'Send us a request on WhatsApp. Once we approve it, this device gets free instant marking on every paper, up to 15 an hour. It does not cover detailed reports.'),
 ('tuition-quality explanations','teacher-quality explanations'),
 ('<div class="sec-title"></span>','<div class="sec-title">'),
 ('purple:"#4C3A9A"','purple:"#111111"'),
 ('"#msg?text="','"/api/wa?text="'),('`#msg?text=','`/api/wa?text='),
 ('let t = ""; try{ t = decodeURIComponent(q); }catch{} openMsg(t);','let t = ""; try{ t = decodeURIComponent(q); }catch{} window.open(t ? "/api/wa?text=" + encodeURIComponent(t) : "/api/wa", "_blank", "noopener");'),
 ('href="/app.html#msg?text=','href="/api/wa?text='),('href="#msg?text=','href="/api/wa?text='),
 ('uid, ref, remark_token:','uid, ref, lead_email: window.leadEmail ? leadEmail() : undefined, remark_token:'),
 ('if(r.error === "weekly" ||','if(r.error === "needemail"){ if(window.showEmailGate) showEmailGate(r.left); return; }\n    if(r.error === "weekly" ||'),
 ('<h2 style="margin-top:8px">${esc(p.name)} · ${esc(p.sub.split(" /")[0])}</h2>','<h2 style="margin-top:24px">${esc(p.name)} · ${esc(p.sub.split(" /")[0]).replace(" Essay"," essay").replace(/-/g,"‑")}</h2>'),
 ('LOGO_MARK.src = "/logo-mark.png"','LOGO_MARK.src = "/logo-b.png"'),
 ('renderInvites(); updWaTop(); }\n  updFree();\n}','renderInvites(); updWaTop(); updFree(); }\n}'),
 ('>Uploading…<','>Preparing your essay<'),('>Marking…<','>Marking, usually about a minute<'),('>Done<','>Marked<'),
 ('Paste at least a full paragraph (80+ words), or upload a photo of the script.','Your essay is too short to mark. Paste at least 80 words, or upload a photo of the script.'),
 ('Mark my essay free','Mark my essay free'),('Mark my essay','Mark my essay'),('Sample Report','Sample report'),('Essay Marker','Essay marker'),
 ('Weekly Challenge','Weekly challenge'),('How It Works','How it works'),('Marking Criteria','Marking criteria'),('Message Us','Message us'),('Ask a Question','Ask a question'),
 ('PSLE Composition Marking','PSLE composition marking'),('PSLE Situational Writing','PSLE situational writing'),('O-Level English Essay Marking','O-Level English essay marking'),
 ('A-Level GP Essay Marking','A-Level GP essay marking'),('IB English Paper 1 Marking','IB English Paper 1 marking'),('IGCSE English Essay Marking','IGCSE English essay marking'),
 ('Get 4 Detailed Reports','Get 4 detailed reports'),('Mark One Free First','Mark one free first'),('Subscribe Monthly','Subscribe monthly'),('See the Full Comparison','See the full comparison'),
 ('See Full Details','See full details'),('Copy My Link','Copy my link'),('Try a Sample GP Essay','Try a sample GP essay'),('Start Timed Exam Mode','Start timed exam mode'),
 ('More Options','More options'),('Have an invite or promo code?','Have an invite or promo code?'),('Bring Friends, Earn Essays','Share with 7 people'),
 ('Every paragraph marked!','Every paragraph marked'),('Get unlimited marking.','Marking for your class'),('>Unlock<','>Use my code<'),
 ('Your Progress','Your progress'),('Watch the Band Climb','See your band go up'),('One Question, One Leaderboard, Every Week','One question, one leaderboard, every week'),
 ('A Community That Writes Better Together','A community that writes better together'),('Challenge a Friend','Challenge a friend'),
 ('Free instant marking costs nothing: 3 free instant markings, no sign-up.','Instant marking is free: 3 markings for PSLE English, O-Level English and A-Level GP. The first needs no sign-up, the other 2 need your email.'),
]
NOTE = "Not subscribed? You get 3 free instant markings for PSLE English, O-Level English or A-Level GP. For every other paper, and comments on every paragraph, get detailed feedback: 4 reports for S$39. Share with 7 people. Get a free detailed report."
RESULT = [
 ('Criterion by Criterion','Criterion by criterion'),('Three Fixes Worth the Most Marks','Three fixes worth the most marks'),('Fix It, Then Re-Mark for Free','Fix it, then re-mark for free'),
 ('Your Idea, Rewritten at Top Band','Your idea, rewritten at top band'),('A Note From Your Specialist','A note from your specialist'),('Your Script, Marked','Your script, marked'),
 ('Send Report to My Parent','Send report to my parent'),('Copy Report','Copy report'),('Share with a Friend','Share with a friend'),('Save My Story Card','Save my story card'),
 ('Recommended for This Essay','Recommended for this essay'),('Join the Online Group Class Early List','Join the online group class early list'),('How Was Your Marking?','How was your marking?'),
 ('Download Parent Report (PDF)','Download parent report (PDF)'),
 ('<span class="chip">${esc(r.band)}</span>',''),
 ('<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button></div>','<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button><a class="btn ghost" href="/app.html#planBox">Get detailed feedback · S$39</a></div>'),
 ('<div class="s"><b>Keep:</b> ${esc(c.strength)}</div><div class="g"><b>Lift:</b> ${esc(c.gap)}</div>','${c.strength ? `<div class="s"><b>Keep:</b> ${esc(c.strength)}</div>` : ""}${c.gap ? `<div class="g"><b>Lift:</b> ${esc(c.gap)}</div>` : ""}'),
]
def result_labels(s):
    for a, b in RESULT:
        s = s.replace(a, b)
    return s
BRAND_FN = 'function drawBrand(g, x, y, size, color, align, desc){\n  // One lockup: the circle matches the wordmark\'s height; "sg" is small; TM is small and raised.\n  g.save(); g.textBaseline = "alphabetic"; g.textAlign = "left";\n  const sg = Math.round(size * .4), tm = Math.round(size * .23), d = size * .95, gap = d * .26;\n  g.font = `300 ${size}px ${DISPLAY}`; const w = g.measureText("EssayLab").width;\n  g.font = `400 ${sg}px ${DISPLAY}`; const sw = g.measureText("sg").width; g.font = `400 ${tm}px ${DISPLAY}`; const tw = g.measureText("™").width;\n  const sgGap = sg * .1, total = d + gap + w + sgGap + sw + 1 + tw, x0 = align === "center" ? x - total / 2 : x, top = y - size * .255 - d / 2;\n  if(LOGO_MARK.complete && LOGO_MARK.naturalWidth) g.drawImage(LOGO_MARK, x0, top, d, d);\n  else { g.fillStyle = BRAND.orb[1]; g.beginPath(); g.arc(x0 + d / 2, top + d / 2, d / 2, 0, Math.PI * 2); g.fill(); }\n  let cx = x0 + d + gap; g.fillStyle = color; g.font = `300 ${size}px ${DISPLAY}`; g.fillText("EssayLab", cx, y); cx += w + sgGap;\n  g.font = `400 ${sg}px ${DISPLAY}`; g.fillText("sg", cx, y); cx += sw + 1;\n  g.font = `400 ${tm}px ${DISPLAY}`; g.fillText("™", cx, y - size * .58);\n  g.restore();\n}\n'
def home_text(s):
    s = re.sub(r"function drawBrand\(g, x, y, size, color, align, desc\)\{.*?\n\}\n", lambda m: BRAND_FN, s, count=1, flags=re.S)
    s = s.replace('orb:["#EBA98A","#A895E6","#93AACB"]', 'orb:["#6F8FD0","#8B6FD6","#E0703C"]')
    s = s.replace('unlockBox', 'upgradeBox').replace('unlockWhy', 'upgradeWhy')
    s = re.sub(r"Not subscribed\?[^<]*(?:<a\b[^>]*>[^<]*</a>[^<]*)?", NOTE, s)
    for a, b in HOME:
        s = s.replace(a, b)
    return s
def stub(fragment):
    "Keep only the ids the old script looks up, as hidden empty elements of the same tag."
    return ''.join('<%s id="%s"></%s>' % (('div' if t[0] == 'h' and t[1:].isdigit() else t), i, ('div' if t[0] == 'h' and t[1:].isdigit() else t)) for t, i in re.findall(r'<([a-z0-9]+)\b[^>]*?\bid="([^"]+)"', fragment))
def no_headings(fragment):
    return re.sub(r'<h[1-6]\b([^>]*)>(.*?)</h[1-6]>', r'<div\1 role="heading" aria-level="2">\2</div>', fragment, flags=re.S)
def strip_tm(v):
    if isinstance(v, list): return [strip_tm(i) for i in v]
    return v.replace('™', '') if isinstance(v, str) else v
def clean(x):
    if isinstance(x, dict):
        return {k: (strip_tm(clean(v)) if k in ('name', 'alternateName') else clean(v)) for k, v in x.items()}
    if isinstance(x, list): return [clean(v) for v in x]
    return x
def txt(x): return H.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x))).strip()
def ld_fix(ld, faq_html):
    d = clean(json.loads(re.sub(r'</?script[^>]*>', '', ld)))
    items = re.findall(r'<details\b.*?<h3[^>]*>(.*?)</h3>.*?</summary>\s*<p[^>]*>(.*?)</p>', faq_html, flags=re.S)
    for n in d.get('@graph', []):
        if n.get('@type') == 'FAQPage':
            assert items, 'faq parse'
            n['mainEntity'] = [{'@type': 'Question', 'name': txt(q), 'acceptedAnswer': {'@type': 'Answer', 'text': txt(a)}} for q, a in items]
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>'
