rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
c = rd('home.css')
a = '#masterclasses .classes-grid:not(#_):not(#_){background:#fff}'
b = '#masterclasses:not(#_):not(#_):not(#_){background:#fff}'
assert a in c or b in c
c = c.replace(a, b).replace('#masterclasses .classes-side h2:not(#_){background-color:transparent}\n', '')
wr('home.css', c)
# Test only: clear this PC's free counters between flows, as each flow stands for a different visitor.
q = 'C:/Users/chris/AppData/Local/Temp/claude/0ed672123b93d727/0dbb6d59-0204-4518-a9b3-5815956b5c3d/scratchpad/leadqa.js'
s = rd(q)
if 'const rst' not in s:
    s = s.replace('(async () => {\n  try { b = await chromium.launch()', 'const rst = () => fetch(U + "/api/mark", { method: "POST", headers: { "content-type": "application/json", origin: U }, body: JSON.stringify({ admin: "freereset", key: require("fs").readFileSync(SP + "lk.txt", "utf8").trim() }) });\n(async () => {\n  try { b = await chromium.launch()', 1)
    s = s.replace('  await resultFlow("phone",', '  await rst(); await resultFlow("phone",', 1)
    s = s.replace('["phone", { ...devices["iPhone 13"] }]]) {\n    const c = await b.newContext(o)', '["phone", { ...devices["iPhone 13"] }]]) {\n    await rst(); const c = await b.newContext(o)', 1)
    assert s.count('rst()') == 3, s.count('rst()')
    wr(q, s)
print('ok')
