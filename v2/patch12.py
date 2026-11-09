import json
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
# one score for the one sample essay: 28/50, Est. C, as in the sample report
h = rd('sections/product.html')
h = h.replace('>32/50</text>', '>28/50</text>').replace('>Est. B</text>', '>Est. C</text>').replace('estimated score of 32 out of 50, Est. B.', 'estimated score of 28 out of 50, Est. C.')
wr('sections/product.html', h)
m = json.load(open('../img/sample-script/marks.json', encoding='utf-8')); m['ring'].update(total=28, grade='Est. C')
open('../img/sample-script/marks.json', 'w', encoding='utf-8', newline='\n').write(json.dumps(m, indent=1, ensure_ascii=False))
# result: one grade beside the ring
p = rd('post.py')
if 'chip">${esc(r.band)}' not in p:
    p = p.replace(" ('Download Parent Report (PDF)','Download parent report (PDF)'),", " ('Download Parent Report (PDF)','Download parent report (PDF)'),\n ('<span class=\"chip\">${esc(r.band)}</span>',''),", 1)
    wr('post.py', p)
a = rd('../app.js'); wr('../app.js', a.replace('<span class="chip">${esc(r.band)}</span>', ''))
# paper picker: one level at a time
e = rd('enhance.js')
old = e[e.index('  const group = () => {'):e.index('  if (box) { new MutationObserver(group)')]
new = '''  let openLevel = null;
  const LEVELS = ["Primary", "Secondary", "JC and international"];
  const show = () => {
    box.querySelectorAll(".paper-group").forEach(g => { g.hidden = g.getAttribute("aria-label") !== openLevel; });
    box.querySelectorAll(".paper-tabs button").forEach(b => b.setAttribute("aria-selected", String(b.textContent === openLevel)));
  };
  const group = () => {
    if (!box || box.querySelector(":scope > .paper-group")) return;
    const btns = [...box.querySelectorAll(":scope > .paper-opt")]; if (!btns.length) return;
    btns.forEach(b => { if (FREE.has(b.dataset.id)) b.dataset.free = ""; });
    const on = btns.find(b => b.getAttribute("aria-pressed") === "true");
    if (on) openLevel = level(on); else if (!openLevel) openLevel = LEVELS[0];
    const frag = document.createDocumentFragment();
    const tabs = document.createElement("div"); tabs.className = "paper-tabs"; tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Level");
    tabs.innerHTML = LEVELS.map(n => `<button type="button" role="tab">${n}</button>`).join("");
    tabs.addEventListener("click", ev => { const t = ev.target.closest("button"); if (t) { ev.stopPropagation(); openLevel = t.textContent; show(); } });
    frag.appendChild(tabs);
    LEVELS.forEach(name => {
      const g = document.createElement("div"); g.className = "paper-group"; g.setAttribute("role", "group"); g.setAttribute("aria-label", name);
      g.innerHTML = '<div class="paper-list"></div>';
      btns.filter(b => level(b) === name).forEach(b => g.lastChild.appendChild(b)); frag.appendChild(g);
    });
    box.appendChild(frag); show();
  };
'''
e = e.replace(old, new); wr('enhance.js', e)
c = rd('home.css')
c += r"""
/* closing line centred; level tabs for the papers */
#closing p:not(#_):not(#_){margin-inline:auto}
#handin .paper-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0 0 8px}
#handin .paper-tabs button{min-height:44px;border:0;border-radius:16px;background:none;color:var(--soft);font:500 var(--type-fs-small)/var(--type-lh-small) var(--font-body);cursor:pointer}
#handin .paper-tabs button[aria-selected="true"]{background:var(--well);color:var(--ink)}
#handin .paper-level{display:none}
@media (max-width:899px){#handin .sec-title:not(#_):not(#_):not(#_){padding-bottom:24px}#handin .paper-tabs button{padding:0 4px}}
"""
wr('home.css', c)
q = rd('../../review-1104/v2/site_qa.py')
a = '        n = p.locator("#papers .paper-opt").count(); good = 0\n        for i in range(n):\n            o = p.locator("#papers .paper-opt").nth(i); o.click(); p.wait_for_timeout(80)\n'
assert a in q
q = q.replace(a, '''        n = p.locator("#papers .paper-opt").count(); good = 0
        for i in range(n):
            o = p.locator("#papers .paper-opt").nth(i)
            lv = o.evaluate("e => e.closest('.paper-group').getAttribute('aria-label')")
            p.click(f'#papers .paper-tabs button:has-text("{lv}")'); p.wait_for_timeout(60)
            o = p.locator("#papers .paper-opt").nth(i); o.click(); p.wait_for_timeout(80)
''')
q = q.replace('''p.click('#papers .paper-opt[data-id="gp"]')\n        more =''', '''p.click('#papers .paper-tabs button:has-text("JC and international")'); p.click('#papers .paper-opt[data-id="gp"]')\n        more =''')
q = q.replace('''p.click('#papers .paper-opt[data-id="gp"]'); p.fill("#question"''', '''p.click('#papers .paper-tabs button:has-text("JC and international")'); p.click('#papers .paper-opt[data-id="gp"]'); p.fill("#question"''')
wr('../../review-1104/v2/site_qa.py', q)
print('ok')
