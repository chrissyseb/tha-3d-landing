rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
e = rd('enhance.js')
if 'MAX_PHOTO' not in e:
    # paper tabs are simple toggle buttons, so screen readers aren't promised tab keys
    e = e.replace('tabs.className = "paper-tabs"; tabs.setAttribute("role", "tablist"); tabs.setAttribute("aria-label", "Level");', 'tabs.className = "paper-tabs"; tabs.setAttribute("role", "group"); tabs.setAttribute("aria-label", "Level");')
    e = e.replace('`<button type="button" role="tab">${n}</button>`', '`<button type="button">${n}</button>`')
    e = e.replace('b.setAttribute("aria-selected", String(b.textContent === openLevel))', 'b.setAttribute("aria-pressed", String(b.textContent === openLevel))')
    e = e.replace('    input.after(choose);\n', '    input.after(choose); input.tabIndex = -1;\n    const cam = pb.querySelector(".cam-btn"); if (cam) { cam.tabIndex = 0; cam.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); document.getElementById("photoCam").click(); } }); }\n')
    i = e.rindex('})();')
    e = e[:i] + r'''
  /* Clear messages: read out, in view, and next to the problem. */
  const note = document.getElementById("notice"), essay = document.getElementById("essay"), prog = document.getElementById("progress"), up = document.getElementById("upgradeBox"), markBtn = document.getElementById("markBtn");
  const say = m => { note.textContent = m; note.hidden = false; };
  if (note) {
    note.setAttribute("role", "alert");
    new MutationObserver(() => {
      if (note.hidden) { essay.removeAttribute("aria-invalid"); essay.removeAttribute("aria-describedby"); return; }
      if (/full paragraph/.test(note.textContent)) { essay.setAttribute("aria-invalid", "true"); essay.setAttribute("aria-describedby", "notice"); essay.focus({preventScroll: true}); }
      note.scrollIntoView({block: "center"});
    }).observe(note, {attributes: true, attributeFilter: ["hidden"], childList: true});
  }
  if (up) new MutationObserver(() => { if (!up.hidden) { up.setAttribute("role", "alert"); up.scrollIntoView({block: "center"}); } }).observe(up, {attributes: true, attributeFilter: ["hidden"]});
  if (prog) { prog.setAttribute("role", "status"); new MutationObserver(() => { document.getElementById("handin").setAttribute("aria-busy", String(!prog.hidden && !!markBtn.disabled)); }).observe(prog, {attributes: true, attributeFilter: ["hidden"]}); }
  /* Upload: a photo only, up to 20 MB, with a plain message otherwise. */
  const MAX_PHOTO = 20 * 1024 * 1024;
  if (input) input.addEventListener("change", ev => {
    const f = input.files[0]; if (!f) return;
    const bad = !/^image\//.test(f.type) ? "That file isn't a photo. Please choose a JPG or PNG photo of the script." : f.size > MAX_PHOTO ? "That photo is too big. Please choose one under 20 MB." : "";
    if (bad) { ev.stopImmediatePropagation(); input.value = ""; say(bad); }
  }, true);
  if (pb) pb.addEventListener("drop", ev => { const f = ev.dataTransfer && ev.dataTransfer.files[0]; if (f && !/^image\//.test(f.type)) say("That file isn't a photo. Please choose a JPG or PNG photo of the script."); });
  /* Labels for the fields that only had placeholders. */
  [["code", "Your pass code"], ["promo", "Invite or promo code"], ["stuName", "Your full name"]].forEach(([id, l]) => { const f = document.getElementById(id); if (f) f.setAttribute("aria-label", l); });
  /* Result: move focus to the top of it, rather than reading the whole report aloud. */
  if (res) { res.removeAttribute("aria-live"); res.tabIndex = -1; res.setAttribute("aria-label", "Your marked essay");
    new MutationObserver(() => { if (res.children.length) res.focus({preventScroll: true}); }).observe(res, {childList: true}); }
''' + e[i:]
    wr('enhance.js', e)
m = rd('marker.js')  # rebuilt each time; label for the loading state lives in post
p = rd('post.py')
if 'Marking…<' not in p:
    p = p.replace("HOME = [\n", "HOME = [\n ('>Uploading…<','>Preparing your essay<'),('>Marking…<','>Marking, usually about a minute<'),('>Done<','>Marked<'),\n ('Paste at least a full paragraph (80+ words), or upload a photo of the script.','Your essay is too short to mark. Paste at least 80 words, or upload a photo of the script.'),\n", 1)
    p = p.replace("/full paragraph/", "/too short/")
    wr('post.py', p)
e = rd('enhance.js').replace('/full paragraph/', '/too short/'); wr('enhance.js', e)
h = rd('hero-a.html')
h = h.replace('<div class="proof" aria-label="Product facts"></div>', '<div class="proof" role="group" aria-label="Product facts"></div>')
wr('hero-a.html', h)
c = rd('home.css')
if 'finish: states' not in c:
    c += r"""
/* finish: states */
html body :is(a,button,summary,input,textarea,select,label,[tabindex]):focus-visible:not(#_):not(#_){outline:2px solid #111!important;outline-offset:3px!important}
#result:focus{outline:0}
#handin .paper-opt[aria-pressed="true"]:focus-visible:not(#_):not(#_):not(#_){outline-offset:3px!important}
#handin .notice:not(#_):not(#_){margin:16px 0 0;padding:16px;background:var(--well);border-radius:16px;font:var(--w-body) var(--type-fs-body)/var(--type-lh-body) var(--font-body);color:var(--ink);max-width:none}
#essay[aria-invalid="true"]:not(#_):not(#_):not(#_){outline:2px solid #111;outline-offset:1px}
#markBtn:disabled:not(#_):not(#_){opacity:.5;cursor:progress}
#handin #stopBtn:not(#_):not(#_){min-height:48px;font-size:var(--type-fs-btn)}
#handin .progress:not(#_):not(#_){margin:16px 0 0;padding:24px;background:var(--well);border-radius:16px}
#handin .progress ol:not(#_):not(#_){display:flex;flex-direction:column;gap:12px;margin:0;padding:0;list-style:none}
#handin .progress li:not(#_):not(#_){display:flex;align-items:center;gap:12px;font:var(--w-body) var(--type-fs-body)/var(--type-lh-body) var(--font-body);color:var(--soft)}
#handin .progress li::before:not(#_){display:none}
#handin .progress li::before{content:"";flex:none;width:16px;height:16px;border-radius:50%;border:2px solid #CFCCC7;background:none;box-sizing:border-box}
#handin .progress li.on{color:var(--ink)!important}
#handin .progress li.on::before{border-color:#CFCCC7;border-top-color:#111;animation:pgspin .9s linear infinite}
#handin .progress li.done{color:var(--ink)!important}
#handin .progress li.done::before{background:#111;border-color:#111}
@keyframes pgspin{to{transform:rotate(360deg)}}
#handin .upgrade-box:not(#_):not(#_){margin:16px 0;padding:24px;background:var(--well);border:0;border-radius:16px;display:flex;flex-direction:column;gap:12px}
#handin .upgrade-box[hidden]:not(#_):not(#_):not(#_){display:none!important}
#handin .upgrade-box>b:not(#_):not(#_){font:var(--w-head) var(--type-fs-h3)/var(--type-lh-h3) var(--font-head)}
#handin .upgrade-box input:not(#_):not(#_):not(#_){background:#fff;flex:1 1 200px;min-width:0}
#handin .upgrade-box .btn.ghost:not(#_):not(#_):not(#_){background:#fff}
#handin .upgrade-box .hint:not(#_):not(#_){color:var(--soft)}
"""
    wr('home.css', c)
print('ok')
