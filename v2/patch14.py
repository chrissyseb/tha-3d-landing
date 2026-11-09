import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
p = rd('post.py')
a = '    s = re.sub(r"Not subscribed\\?[^<]*", NOTE, s)\n'
assert a in p
if '</a>[^<]*' not in p:
    p = p.replace(a, '    s = re.sub(r"Not subscribed\\?[^<]*(?:<a\\b[^>]*>[^<]*</a>[^<]*)?", NOTE, s)\n')
    wr('post.py', p)
b = rd('build.py')
x = "re.search(r'<a class=\"wa-float\".*?</a>', h, re.S).group(0))"
assert x in b
if 'aria-label="Contact"' not in b:
    b = b.replace(x, "'<aside aria-label=\"Contact\">' + re.search(r'<a class=\"wa-float\".*?</a>', h, re.S).group(0) + '</aside>')")
    wr('build.py', b)
c = rd('home.css')
if 'finish: result details' not in c:
    c += r"""
/* finish: result details */
#handin .upgrade-box input:not(#_):not(#_):not(#_):not(#_){text-transform:none;letter-spacing:0}
#handin .upgrade-box input::placeholder{text-transform:none}
#result .fix:first-child:not(#_) h3::before{-webkit-text-fill-color:var(--pen)}
#result .crit-item .band:not(#_)::before{content:"Band "}
"""
    wr('home.css', c)
print('ok')
