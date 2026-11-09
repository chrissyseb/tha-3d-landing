rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
s = rd('enhance.js')
if 'sr-on' not in s:
    i = s.rindex('})();')
    s = s[:i] + r'''
  /* Sample report: pointing at a comment lights up the words it is about, and the other way round. */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const marks = [...document.querySelectorAll("#sample-report .sr-script mark")], notes = [...document.querySelectorAll("#sample-report .sr-note")];
    marks.forEach((m, i) => { const n = notes[i]; if (!n) return;
      const on = v => { m.classList.toggle("sr-on", v); n.classList.toggle("sr-on", v); };
      [m, n].forEach(el => { el.addEventListener("pointerenter", () => on(true)); el.addEventListener("pointerleave", () => on(false)); }); });
  }
''' + s[i:]
    wr('enhance.js', s)
c = rd('home.css')
if 'sample hover' not in c:
    c += '''
/* sample hover: comment and its words light up together */
#sample-report .sr-script mark{transition:background-color .2s;border-radius:4px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#sample-report .sr-script mark.sr-on:not(#_){background-color:rgba(196,18,47,.1)}
#sample-report .sr-note{cursor:default}
#sample-report .sr-note.sr-on:not(#_){text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:6px}
'''
    wr('home.css', c)
print('ok')
