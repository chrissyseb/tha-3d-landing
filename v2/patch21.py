rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
s = rd('enhance.js')
a = '''const choose = document.createElement("label");
    choose.className = "btn ghost choose-btn"; choose.htmlFor = "photo"; choose.textContent = "Choose a photo"; choose.tabIndex = 0; choose.setAttribute("role", "button");
    choose.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });'''
assert a in s
s = s.replace(a, '''const choose = document.createElement("button");
    choose.type = "button"; choose.className = "btn ghost choose-btn"; choose.textContent = "Choose a photo";
    choose.addEventListener("click", () => input.click());''')
a = '''const cam = pb.querySelector(".cam-btn"); if (cam) { cam.tabIndex = 0; cam.setAttribute("role", "button"); cam.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); document.getElementById("photoCam").click(); } }); }'''
assert a in s
s = s.replace(a, '''const cam = pb.querySelector(".cam-btn"); if (cam) { const c = document.createElement("button"); c.type = "button"; c.className = cam.className; c.style.cssText = cam.style.cssText; c.textContent = cam.textContent; c.addEventListener("click", () => document.getElementById("photoCam").click()); cam.replaceWith(c); }''')
wr('enhance.js', s)
print('ok')
