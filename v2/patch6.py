rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

# temperature on test links only
m = rd('../api/mark.js')
a = 'body: JSON.stringify({model, max_tokens: 8000, response_format:{type:"json_object"}, messages:[{role:"user", content}]})});'
assert m.count(a) == 1 or 'STEADY_MARKS' in m
if 'STEADY_MARKS' not in m:
    m = m.replace(a, 'body: JSON.stringify({model, max_tokens: 8000, response_format:{type:"json_object"}, ...STEADY_MARKS, messages:[{role:"user", content}]})});')
    b = 'const FREE_LIMIT_BYPASS_IPS ='
    m = m.replace(b, '// Test links only for now: same essay, same settings, to steady the free marking score.\nconst STEADY_MARKS = process.env.VERCEL_ENV === "preview" ? {temperature: 0, seed: 7} : {};\n' + b, 1)
    wr('../api/mark.js', m)

# robots: training crawlers stay blocked, answer and search bots allowed
r = rd('../robots.txt')
if 'OAI-SearchBot' not in r:
    allow = ''.join('User-agent: %s\nAllow: /\nDisallow: /api/\nDisallow: /thanks.html\n\n' % x for x in ('OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User'))
    r = r.replace('User-agent: PerplexityBot\nDisallow: /\n\n', '').replace('User-agent: PerplexityBot\r\nDisallow: /\r\n\r\n', '')
    r = allow + r
    wr('../robots.txt', r)

# copy decisions and result next steps
p = rd('post.py')
if 'Use my code' not in p:
    p = p.replace("('>Unlock<','>Get detailed feedback<')", "('>Unlock<','>Use my code<')")
    p = p.replace(" ('Download Parent Report (PDF)','Download parent report (PDF)'),", """ ('Download Parent Report (PDF)','Download parent report (PDF)'),
 ('<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button></div>','<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button><a class="btn ghost" href="/app.html#planBox">Get detailed feedback · S$39</a></div>'),""")
    wr('post.py', p)
a = rd('../app.js')
x = '<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button></div>'
if x in a:
    wr('../app.js', a.replace(x, '<div class="row"><button class="btn primary" id="remarkBtn" type="button" >Edit my essay and re-mark</button><a class="btn ghost" href="#planBox">Get detailed feedback · S$39</a></div>'))

# taste fixes
h = rd('hero.css')
h = h.replace('.tabs button[aria-selected="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(17,17,17,.08)}', '.tabs button[aria-selected="true"]{background:var(--surface);color:var(--ink)}')
h = h.replace('transition:background-color .2s,color .2s,box-shadow .2s}', 'transition:background-color .2s,color .2s}')
wr('hero.css', h)
pc = rd('sections/pricing.css')
pc = pc.replace('#pricing .btn-quiet:hover{background:var(--surface);box-shadow:inset 0 0 0 1px var(--ink)}', '#pricing .btn-quiet:hover{background:var(--surface);border-color:var(--ink)}')
wr('sections/pricing.css', pc)

c = rd('home.css')
if 'result screen v2' not in c:
    c += r"""
/* phone: reading text is 16px at least */
@media (max-width:899px){
 .proof-l,.free-note,#crest .crest-set li,#crest p,.classes-table span,.classes-table small,.classes-quotes figcaption,#pricing .plan-note,#pricing .note-free,#pricing .note-paid,#pricing .note-all,#sample-report .sr-k,#handin .hint,#handin .counter,#handin .exam-cd,#handin label,#handin .lbl,#handin small,#handin summary,#handin .paper-opt b,#handin .paper-opt small,#handin .teach-ok,footer.site a,footer.site p,.definition,#closing p{font-size:16px!important;line-height:24px!important}
}

/* result screen v2: same world as the page. Data and logic unchanged. */
#result:not(:empty):not(#_){max-width:none;margin:0;padding-top:64px}
#result>.sheet:not(#_){padding:0;margin:0 0 8px!important;background:var(--well)!important;border-radius:24px}
#result>.sheet>.sheet-inner:not(#_){padding:48px!important;background:none!important;max-width:none}
#result>.sheet:first-child:not(#_){background:var(--surface)!important;border:1px solid var(--line)}
#result .result-tag:not(#_){display:block;background:none;padding:0;margin:0 0 24px;border:0}
#result .scorehead:not(#_){display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:48px;align-items:center}
#result .scorehead .ring:not(#_){position:relative;width:200px;height:136px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 88' preserveAspectRatio='none'%3E%3Cpath d='M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7' fill='none' stroke='%23C4122F' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat}
#result .scorehead .ring svg:not(#_){display:none}
#result .scorehead .num:not(#_){position:absolute;inset:0;display:flex;align-items:baseline;justify-content:center;gap:4px;padding-top:44px;color:var(--pen)}
#result .scorehead .num b:not(#_){font:400 56px/1 var(--hand)!important;color:var(--pen)}
#result .scorehead .num small:not(#_){font:400 24px/1 var(--hand)!important;color:var(--pen)}
#result .scorehead .chip:not(#_){background:none;border:0;padding:0;margin-right:16px;font:400 24px/32px var(--hand);color:var(--pen)}
#result .scorehead p:not(#_){margin:8px 0 0;color:var(--soft);font-size:16px;line-height:24px;max-width:64ch}
#result .sec-title:not(#_) h2{margin:0}
#result .crit:not(#_){display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#result .crit-item:not(#_){background:#fff;border:0;border-radius:16px;padding:24px;margin:0;box-shadow:none}
#result .crit-top:not(#_){display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin:0 0 12px}
#result .crit-top h3:not(#_){font:500 16px/24px var(--sans)!important;margin:0}
#result .crit-top .mk:not(#_){font-size:16px;line-height:24px;color:var(--ink);white-space:nowrap}
#result .crit-item .bar:not(#_){height:4px;background:var(--well);border-radius:2px;margin:0 0 12px;overflow:hidden}
#result .crit-item .bar i:not(#_){background:var(--ink)!important;display:block;height:100%}
#result .crit-item .band:not(#_){display:block;background:none;padding:0;margin:0 0 8px;font-size:14px;line-height:20px;color:var(--soft);font-weight:400}
#result .crit-item p:not(#_){color:var(--soft)}
#result .sg:not(#_){display:block;margin:16px 0 0}
#result .sg>div:not(#_){background:none;border:0;padding:0;margin:8px 0 0;font-size:14px;line-height:20px;color:var(--soft)}
#result .sg b:not(#_){font-weight:500;color:var(--ink)!important}
#result .fixes:not(#_){list-style:none;margin:0;padding:0;display:grid;gap:8px}
#result .fix:not(#_){display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:24px;background:#fff;border:0;border-radius:16px;padding:24px;margin:0;box-shadow:none}
#result .fix .n:not(#_){width:48px;height:36px;display:flex;align-items:center;justify-content:center;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 88' preserveAspectRatio='none'%3E%3Cpath d='M92 8C60-2 14 8 6 38c-7 28 28 44 62 43 34-1 58-16 54-42C119 18 96 8 70 7' fill='none' stroke='%23C4122F' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") center/100% 100% no-repeat;border:0;border-radius:0;color:var(--pen);font:400 24px/1 var(--hand)}
#result .fix h3:not(#_){font:400 24px/32px var(--serif)!important;margin:0 0 8px}
#result .fix q:not(#_){display:block;font:400 20px/32px var(--hand);color:var(--ink);quotes:none;margin:0 0 8px}
#result .fix p:not(#_){margin:0 0 8px;color:var(--soft)}
#result .fix .try:not(#_){background:none;border:0;padding:0;margin:0;color:var(--ink)}
#result .fix .try b:not(#_){font-weight:500;color:var(--ink)!important}
#result .fix:first-child:not(#_) h3::before{content:"The one fix worth the most marks";display:block;font:400 24px/32px var(--hand);color:var(--pen);transform:rotate(-1deg);transform-origin:left center;margin:0 0 8px}
#result .fix:first-child:not(#_) q{text-decoration:underline wavy var(--pen) 1.5px;text-underline-offset:6px}
#result .row:not(#_){display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
#result .model .before:not(#_){font:400 20px/32px var(--hand);color:var(--ink);text-decoration:line-through var(--pen);margin:0 0 16px}
#result .model .after:not(#_){background:#fff;border:0;border-radius:16px;padding:24px;margin:0 0 16px;font-size:16px;line-height:24px;color:var(--ink);max-width:none}
#result .model .why:not(#_){color:var(--soft)}
#result .target:not(#_){margin:16px 0 0}#result .target b:not(#_){font-weight:500}
#result .script:not(#_){background:#fff;border-radius:16px;padding:32px 32px 32px 72px;border:0;font:400 20px/32px var(--hand)!important;color:var(--ink)}
#result .script:not(#_)::before{left:48px;background:var(--line)}
#result .script mark:not(#_){background:none!important;color:inherit;font:inherit!important;text-decoration:underline wavy var(--pen) 1.5px;text-underline-offset:6px}
#result .script sup:not(#_){color:var(--pen);font:400 16px/1 var(--hand)!important}
#result>.row:not(#_){margin:24px 0}
#result .chip:not(.scorehead .chip):not(#_){background:none;padding:0;font-size:14px;color:var(--soft)}
@media (max-width:899px){
 #result>.sheet:not(#_){border-radius:20px;margin-left:-8px!important;margin-right:-8px!important}
 #result>.sheet>.sheet-inner:not(#_){padding:24px 16px!important}
 #result .scorehead:not(#_){display:block}
 #result .scorehead .ring:not(#_){margin:0 0 16px;width:160px;height:110px}
 #result .scorehead .num:not(#_){padding-top:34px}
 #result .scorehead .num b:not(#_){font-size:44px!important}
 #result .crit:not(#_){grid-template-columns:minmax(0,1fr)}
 #result .fix:not(#_){grid-template-columns:minmax(0,1fr);row-gap:8px;padding:16px}
 #result .script:not(#_){padding:16px 16px 16px 40px}
 #result .script:not(#_)::before{left:28px}
 #result .btn:not(#_){width:100%}
}
"""
    wr('home.css', c)
print('ok')
