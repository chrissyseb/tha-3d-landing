import re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
b = rd('build.py')
if 'upgrade-box' not in b:
    a = "body = post.home_text(body)\n"; assert a in b
    b = b.replace(a, a + "body = re.sub(r'<span class=\"kicker\">.*?</span>', '', body, flags=re.S)\nbody = body.replace('class=\"unlock\"', 'class=\"upgrade-box\"').replace('unlockBox', 'upgradeBox').replace('unlockWhy', 'upgradeWhy')\n", 1)
    wr('build.py', b)
p = rd('post.py')
if 'upgradeBox' not in p:
    a = "def home_text(s):\n"; assert a in p
    p = p.replace(a, a + "    s = s.replace('unlockBox', 'upgradeBox').replace('unlockWhy', 'upgradeWhy')\n")
    wr('post.py', p)
c = rd('sections/how.css')
c = re.sub(r"background-image:repeating-linear-gradient\(.*?background-repeat:no-repeat", "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 40' preserveAspectRatio='none'%3E%3Crect y='39' width='8' height='1' fill='%23E7E5E2'/%3E%3C/svg%3E\");background-position:0 24px;background-size:8px var(--rule);background-repeat:repeat", c, flags=re.S)
c = c.replace('background:var(--surface) ;', 'background-color:var(--well);')
wr('sections/how.css', c)
c = rd('home.css')
c = re.sub(r"border:1px solid (?:var\(--line\)|transparent);?", "border:0;", c)
c += "\n#faq details>p:not(#_):not(#_){max-width:68ch}\n"
wr('home.css', c)
print('ok')
