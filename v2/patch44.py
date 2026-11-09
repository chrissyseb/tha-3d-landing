import glob, os
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
wr('nav.css', r'''/* Sticky horizontal nav, every page. Solid white, hairline, no hamburger. */
html{scroll-padding-top:84px}
html body .nav:not(#_):not(#_):not(#_),html body .sitenav:not(#_):not(#_):not(#_){position:sticky!important;top:0!important;z-index:50!important;background:#fff!important;border-bottom:1px solid #E7E4E0!important;box-shadow:none!important;backdrop-filter:none!important}
html body .nav-links a,html body .sn-links a{position:relative;white-space:nowrap}
html body .nav-links a[aria-current],html body .sn-links a[aria-current]{color:#111!important;box-shadow:inset 0 -2px 0 #111}
html body .burger:not(#_):not(#_):not(#_),html body .sn-burger:not(#_):not(#_):not(#_){display:none!important}
html body .ecap-c a:not(#_):not(#_):not(#_){display:inline-flex;min-height:44px;align-items:center}
@media (max-width:899px){
 html{scroll-padding-top:112px}
 html body .nav-in:not(#_):not(#_):not(#_),html body .sn-in:not(#_):not(#_):not(#_){display:flex!important;flex-wrap:wrap!important;align-items:center!important;justify-content:space-between!important;height:auto!important;min-height:100px!important;gap:0!important;padding-top:0!important;padding-bottom:0!important}
 html body .nav-in>.brand:not(#_):not(#_),html body .sn-in>.brand:not(#_):not(#_){order:1;height:56px;margin:0!important}
 html body .nav-in>.btn:not(#_):not(#_),html body .sn-in>.sn-pill:not(#_):not(#_){order:2;display:inline-flex!important;margin:0!important}
 html body .nav-links:not(#_):not(#_):not(#_),html body .sn-links:not(#_):not(#_):not(#_){order:3;display:flex!important;position:static!important;flex:0 0 100%!important;width:100%!important;height:44px!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:20px!important;margin:0!important;padding:0 24px 0 0!important;background:none!important;box-shadow:none!important;border:0!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none;-webkit-overflow-scrolling:touch;-webkit-mask-image:linear-gradient(90deg,#000 90%,transparent);mask-image:linear-gradient(90deg,#000 90%,transparent)}
 html body .nav-links::-webkit-scrollbar,html body .sn-links::-webkit-scrollbar{display:none}
 html body .nav-links a:not(#_):not(#_):not(#_),html body .sn-links a:not(#_):not(#_):not(#_){display:inline-flex!important;flex:0 0 auto!important;align-items:center!important;min-height:44px!important;height:44px!important;padding:0!important;font-size:14px!important;line-height:20px!important;border:0!important}
}
''')
wr('nav.js', r'''/* Scroll-spy: marks the section you are reading in the sticky nav. */
(function () {
  var links = [].slice.call(document.querySelectorAll(".nav-links a, .sn-links a"));
  if (!links.length) return;
  var row = links[0].parentElement;
  function setActive(a) {
    links.forEach(function (l) { if (l === a) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
    if (a && row.scrollWidth > row.clientWidth) row.scrollTo({ left: Math.max(0, a.offsetLeft - row.offsetLeft - 24), behavior: "smooth" });
  }
  var path = location.pathname.replace(/\.html$/, "");
  var page = links.filter(function (a) { return a.pathname.replace(/\.html$/, "") === path && !a.hash; })[0];
  if (page) { setActive(page); return; }
  var home = path === "/" || path === "";
  if (!home || !("IntersectionObserver" in window)) return;
  var map = {}, targets = [];
  links.forEach(function (a) { if (a.hash) { var s = document.getElementById(a.hash.slice(1)); if (s) { map[s.id] = a; targets.push(s); } } });
  var vis = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
    var cur = null; targets.forEach(function (s) { if (vis[s.id]) cur = s; });
    if (cur !== io.last) { io.last = cur; setActive(cur ? map[cur.id] : null); }
  }, { rootMargin: "-40% 0px -55% 0px" });
  targets.forEach(function (s) { io.observe(s); });
})();
''')
LINK = '<link rel="stylesheet" href="/v2/nav.css">'
JS = '<script src="/v2/nav.js" defer></script>'
for f in glob.glob('../*.html'):
    if os.path.basename(f) == 'index.html': continue
    s = t = rd(f)
    if LINK not in s: s = s.replace('</head>', LINK + '</head>', 1)
    if JS not in s: s = s.replace('</body>', JS + '</body>', 1)
    if s != t: wr(f, s)
b = rd('build.py')
if 'nav.css' not in b:
    a = "body = body.replace('</body>', '<script src=\"/v2/motion-pause.js\" defer></script></body>', 1)"
    assert a in b
    b = b.replace(a, "body = body.replace('</body>', '<script src=\"/v2/motion-pause.js\" defer></script><script src=\"/v2/nav.js\" defer></script></body>', 1)\nhead = head.replace('</head>', '<link rel=\"stylesheet\" href=\"/v2/nav.css\"></head>', 1)")
    wr('build.py', b)
print('ok')
