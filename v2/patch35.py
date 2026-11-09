import glob, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
c = rd('home.css')
if 'audit fixes' not in c:
    c += r'''
/* audit fixes */
@media (max-width:480px){#pricing .keep:not(#_):not(#_){white-space:normal;display:inline}}
.how-video .sample-tag:not(#_):not(#_):not(#_){top:auto;left:auto;right:16px;bottom:10px}
html body .brand .brand-by:not(#_):not(#_):not(#_):not(#_):not(#_):not(#_){margin-left:16px}
.paper-need{margin:8px 0 0;font:400 var(--type-fs-small)/20px var(--font-body);color:var(--ink)}
'''
    wr('home.css', c)
s = rd('enhance.js')
if 'paper-need' not in s:
    i = s.rindex('})();')
    s = s[:i] + r'''
  /* Say the rules before they press Mark, not after. */
  { const count = document.getElementById("count"), essayBox = document.getElementById("essay"), pbox = document.getElementById("papers");
    if (count) { const tip = document.createElement("span"); tip.textContent = " · at least 80 words"; count.after(tip); tip.className = "hint"; }
    if (pbox) { const need = document.createElement("p"); need.className = "paper-need"; need.hidden = true; need.textContent = "This paper needs a detailed feedback plan. Free marking covers PSLE English, O-Level English and A-Level GP."; pbox.after(need);
      const check = () => { const on = pbox.querySelector('.paper-opt[aria-pressed="true"]'); need.hidden = !on || "free" in on.dataset; };
      new MutationObserver(check).observe(pbox, {subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed"]}); check(); } }
''' + s[i:]
    wr('enhance.js', s)
for f in glob.glob('../*.html'):
    if f.replace('\\', '/').endswith('index.html'): continue
    t = rd(f); n = t
    for a, b in [('>Mark My Essay<', '>Mark my essay<'), ('>Sample Report<', '>Sample report<'), ('>Message Us<', '>Message us<')]:
        n = n.replace(a, b)
    if n != t: wr(f, n)
print('ok')
