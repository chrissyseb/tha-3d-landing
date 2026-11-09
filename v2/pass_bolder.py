import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
j = rd('hero.js')
i = j.index('const FACTS = ['); k = j.index('];', i) + 2
j = j[:i] + '''const FACTS = [
  {head: "13", text: "Exam papers, PSLE to IB, marked against the published SEAB, Cambridge and IB criteria"},
  {head: "1 min", text: "Free instant marking for PSLE English, <span class=\\"nb\\">O-Level</span> English and <span class=\\"nb\\">A-Level</span> GP"},
  {head: "48 hrs", text: "Detailed reports, marked by Exam Preparation Specialists™"}
];''' + j[k:]
wr('hero.js', j)
c = rd('home.css')
c += r"""
/* bolder: two peaks of scale in the scroll, using only the type scale and the well tone */
.proof:not(#_):not(#_){grid-template-columns:repeat(3,1fr);gap:48px;margin:96px calc(50% - 50vw) 0;padding:96px max(var(--edge),calc(50vw - 620px));background:var(--well);width:100vw}
.proof-v:not(#_):not(#_){font:400 96px/1 var(--serif);letter-spacing:-.03em;white-space:nowrap}
.proof-l:not(#_):not(#_){margin-top:16px;font-size:16px;line-height:24px;color:var(--ink);max-width:32ch}
.definition:not(#_):not(#_){margin:32px 0 0}
#closing:not(#_):not(#_){margin:128px calc(50% - 50vw) 0;padding:128px 24px;background:var(--well);width:100vw}
#closing h2:not(#_):not(#_){font:400 64px/68px var(--serif);letter-spacing:-.02em;margin:0 0 32px}
#closing p:not(#_):not(#_){font-size:16px;line-height:24px}
footer.site:not(#_){margin-top:0}
html,body{overflow-x:clip}
@media (max-width:899px){
 .proof:not(#_):not(#_){grid-template-columns:1fr;gap:32px;margin-top:64px;padding:64px var(--edge)}
 .proof-v:not(#_):not(#_){font-size:64px}
 #closing:not(#_):not(#_){margin-top:96px;padding:96px 24px}
 #closing h2:not(#_):not(#_){font-size:38px;line-height:44px}
}
"""
wr('home.css', c)
