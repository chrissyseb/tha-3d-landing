/* Scroll-spy: marks the section you are reading in the sticky nav. */
(function () {
  var links = [].slice.call(document.querySelectorAll(".nav-links a, .sn-links a"));
  if (!links.length) return;
  var row = links[0].parentElement;
  var bar = document.createElement("div"), navEl = document.querySelector(".nav,.sitenav");
  bar.className = "nav-progress"; bar.setAttribute("aria-hidden", "true"); navEl.appendChild(bar);
  var tick = false;
  function prog() { tick = false; var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")"; }
  addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();
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
