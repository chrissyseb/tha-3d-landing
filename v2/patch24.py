rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
c = rd('home.css')
assert '#result{scroll-margin-top:88px}' in c or '#result{scroll-margin-top:0}' in c
c = c.replace('#result{scroll-margin-top:88px}', '#result{scroll-margin-top:0}')
if 'polish 2' not in c:
    c += '''
/* polish 2 */
#handin .upgrade-box.is-limit .hint:not(#_):not(#_):not(#_){display:none}
#crest .crest-pause{padding:10px 0;margin:-10px 0}
'''
wr('home.css', c)
s = rd('enhance.js')
a = 'if (!up.hidden) { up.setAttribute("role", "alert");'
b = 'if (!up.hidden) { up.classList.toggle("is-limit", /used your/.test(document.getElementById("upgradeWhy").textContent)); up.setAttribute("role", "alert");'
if b not in s:
    assert a in s
    wr('enhance.js', s.replace(a, b))
print('ok')
