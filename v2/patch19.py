rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, a[:70]
    wr(p, s.replace(a, b))

# Phone menu: Tab goes from the button into the links; Esc and choosing a link close it.
sub('hero.js', '''if (burger) burger.addEventListener("click", () => burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));''',
'''if (burger) {
    const links = nav.querySelector(".nav-links"), brand = nav.querySelector(".brand");
    links.id = "navLinks"; burger.setAttribute("aria-controls", "navLinks");
    const close = refocus => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); if (refocus) burger.focus(); };
    const place = () => { if (getComputedStyle(burger).display === "none") { brand.after(links); close(); } else burger.after(links); };
    burger.addEventListener("click", () => burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
    links.addEventListener("click", e => { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) close(true); });
    addEventListener("resize", place); place();
  }''')
# Hero panels have names.
sub('hero.js', '''<div class="pane" data-k="${k}" role="tabpanel">''', '''<div class="pane" data-k="${k}" role="tabpanel" aria-label="Sample marking, ${x.name}">''')

# Picking a paper keeps your place.
sub('enhance.js', '''    box.appendChild(frag); show();
  };''', '''    box.appendChild(frag); show();
    if (wantFocus) { const f = box.querySelector(`.paper-opt[data-id="${wantFocus}"]`); wantFocus = ""; if (f) f.focus({preventScroll: true}); }
  };''')
sub('enhance.js', '''  let openLevel = null;\n''', '''  let openLevel = null, wantFocus = "";\n  if (box) box.addEventListener("click", ev => { const o = ev.target.closest(".paper-opt"); if (o) wantFocus = o.dataset.id; }, true);\n''')

# Photo controls announce as buttons.
sub('enhance.js', '''choose.textContent = "Choose a photo"; choose.tabIndex = 0;''', '''choose.textContent = "Choose a photo"; choose.tabIndex = 0; choose.setAttribute("role", "button");''')
sub('enhance.js', '''if (cam) { cam.tabIndex = 0; cam.addEventListener''', '''if (cam) { cam.tabIndex = 0; cam.setAttribute("role", "button"); cam.addEventListener''')

# Crest banner can be paused; phone shows one script at a time.
s = rd('enhance.js')
if 'crest-pause' not in s:
    i = s.rindex('})();')
    s = s[:i] + r'''
  /* The moving crest banner has a pause control. */
  { const wrap = document.querySelector("#crest .crest-wrap"), note = document.querySelector("#crest .crest-note");
    if (wrap && note) { const b = document.createElement("button"); b.type = "button"; b.className = "crest-pause"; b.textContent = "Pause the banner"; note.append(" ", b);
      b.addEventListener("click", () => { const off = wrap.classList.toggle("paused"); b.textContent = off ? "Play the banner" : "Pause the banner"; }); } }
  /* Phone: one script at a time, photo or marked. */
  { const pair = document.querySelector("#product .pd-pair");
    if (pair) { const t = document.createElement("div"); t.className = "pd-toggle"; t.setAttribute("role", "group"); t.setAttribute("aria-label", "Sample script");
      t.innerHTML = '<button type="button" data-show="photo" aria-pressed="false">The photo</button><button type="button" data-show="marked" aria-pressed="true">Marked in red pen</button>';
      const set = v => { pair.dataset.show = v; t.style.setProperty("--i", v === "marked" ? 1 : 0); t.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.show === v))); };
      t.addEventListener("click", e => { const b = e.target.closest("button"); if (b) set(b.dataset.show); });
      pair.before(t); set("marked"); } }
''' + s[i:]
    wr('enhance.js', s)

# How it works reads 1, 2, 3 on one line.
s = rd('sections/how.css')
s = s.replace('/* How it works: three pieces of one script, climbing left to right. */', '/* How it works: three pieces of one script, left to right. */')
a = '''/* The climb: step three starts level with the heading, then each earlier step sits one flight lower. */
#how-it-works .how-s3{grid-column:3;grid-row:1/3}
#how-it-works .how-s2{grid-column:2;grid-row:2;margin-top:64px}
#how-it-works .how-s1{grid-column:1;grid-row:2;margin-top:160px}'''
if a in s:
    s = s.replace(a, '''#how-it-works .how-step{grid-row:2;margin-top:64px}
#how-it-works .how-s1{grid-column:1}
#how-it-works .how-s2{grid-column:2}
#how-it-works .how-s3{grid-column:3}''')
    s = s.replace('#how-it-works .how-head{grid-column:1/3;grid-row:1;padding-right:48px}', '#how-it-works .how-head{grid-column:1/-1;grid-row:1;max-width:800px}')
    s = s.replace('''#how-it-works .how-head{grid-column:1/-1;padding-right:0}
 #how-it-works .how-s3{grid-row:2;margin-top:48px}
 #how-it-works .how-s2{margin-top:96px}
 #how-it-works .how-s1{margin-top:144px}
''', '''#how-it-works .how-step{margin-top:48px}
''')
    wr('sections/how.css', s)

c = rd('home.css')
if 'finish: review fixes' not in c:
    c += r'''
/* finish: review fixes */
#crest .crest-wrap.paused .crest-track:not(#_):not(#_){animation-play-state:paused!important}
#crest .crest-pause{min-height:24px;padding:0;border:0;background:none;color:var(--ink);font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
#product .pd-toggle{display:none}
@media (max-width:899px){
 #product .pd-toggle{position:relative;isolation:isolate;display:grid;grid-template-columns:repeat(2,1fr);margin:0 0 16px}
 #product .pd-toggle::before{content:"";position:absolute;z-index:-1;inset:0 auto 0 0;width:50%;border-radius:16px;background:var(--well);transform:translateX(calc(var(--i,1)*100%));transition:transform .25s cubic-bezier(.23,1,.32,1)}
 #product .pd-toggle button{min-height:44px;border:0;border-radius:16px;background:none;color:var(--soft);font:500 var(--type-fs-small)/var(--type-lh-small) var(--font-body);cursor:pointer}
 #product .pd-toggle button[aria-pressed="true"]{color:var(--ink)}
 #product .pd-pair[data-show="marked"] .pd-card:not(.pd-marked),#product .pd-pair[data-show="photo"] .pd-marked{display:none}
 #product .pd-pair[data-show] figcaption{display:none}
}
'''
    wr('home.css', c)
print('ok')
