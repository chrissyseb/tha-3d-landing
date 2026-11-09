rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
s = rd('post.py')
if 'u2011' not in s:
    a = "HOME = [\n"
    assert a in s
    s = s.replace(a, a + r""" ('<h2 style="margin-top:8px">${esc(p.name)} · ${esc(p.sub.split(" /")[0])}</h2>','<h2 style="margin-top:24px">${esc(p.name)} · ${esc(p.sub.split(" /")[0]).replace(" Essay"," essay").replace(/-/g,"‑")}</h2>'),""" + "\n", 1)
    wr('post.py', s)
c = rd('home.css')
if 'finish: result edge' not in c:
    c += '''
/* finish: result edge */
@media (max-width:899px){#result>.sheet:not(#_):not(#_):not(#_){margin-left:0!important;margin-right:0!important}}
'''
    wr('home.css', c)
print('ok')
