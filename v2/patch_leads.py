rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    if b in s: return
    assert a in s, (p, a[:70])
    wr(p, s.replace(a, b, 1))

# ---- Marking API: first free marking open; 2 and 3 need an email; limits per email, device and network.
sub('../api/mark.js', '''      const ipK = `fip:${ip}`, wK = `fu:${uid}`, cK = `c:${uid}`;
      const wn = await kv("INCR", wK); held.push([wK, 1]);''', '''      const ipK = `fip:${ip}`, wK = `fu:${uid}`, cK = `c:${uid}`;
      const leadEm = String(body.lead_email || "").trim().toLowerCase(), leadOk = leadEm.length <= 120 && /^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(leadEm);
      const usedNow = +(await kv("GET", wK)) || 0, ipNow = +(await kv("GET", ipK)) || 0;
      // Only a device's first free marking needs no email, and only while the network hasn't used up its free markings.
      if(usedNow < FREE_TOTAL && !leadOk && (usedNow >= 1 || ipNow >= FREE_TOTAL)) return res.status(403).json({error:"needemail", left: FREE_TOTAL - usedNow});
      const wn = await kv("INCR", wK); held.push([wK, 1]);''')
sub('../api/mark.js', '''        // Only free markings count against the network address, so one household can't reset by clearing the browser.
        const ipn = await kv("INCR", ipK); held.push([ipK, 1]); if(ipn === 1) await kv("EXPIRE", ipK, 31536000);
        if(typeof ipn !== "number") throw new Error("kv incr");
        if(ipn > FREE_TOTAL){ await release(); return res.status(403).json({error:"freeused"}); }''', '''        // Only free markings count against the network address, so one household can't reset by clearing the browser.
        const ipn = await kv("INCR", ipK); held.push([ipK, 1]); if(ipn === 1) await kv("EXPIRE", ipK, 31536000);
        if(typeof ipn !== "number") throw new Error("kv incr");
        if(leadOk){
          // With an email the limit is per person, so students sharing school Wi-Fi aren't blocked by each other.
          const lid = require("crypto").createHash("sha256").update(leadEm).digest("hex").slice(0, 16), eK = `fe:${lid}`, lK = `fel:${uid}`;
          const linked = await kv("GET", lK), add = 1 + (linked ? 0 : usedNow);   // the markings this device already used count towards this person, once
          if(linked !== lid) await kv("SET", lK, lid);
          const en = await kv("INCRBY", eK, add); held.push([eK, add]);
          if(typeof en !== "number") throw new Error("kv incr");
          if(en > FREE_TOTAL){ await release(); return res.status(403).json({error:"freeused"}); }
          const dK = `fipd:${ip}:${new Date().toISOString().slice(0, 10)}`, dn = await kv("INCR", dK); held.push([dK, 1]); if(dn === 1) await kv("EXPIRE", dK, 172800);
          if(dn > FREE_NETWORK_DAILY){ await release(); return res.status(429).json({error:"rate"}); }
        } else if(ipn > FREE_TOTAL){ await release(); return res.status(403).json({error:"freeused"}); }''')
sub('../api/mark.js', 'const FREE_TOTAL = 3;', 'const FREE_TOTAL = 3;\nconst FREE_NETWORK_DAILY = 20;  // free markings a day on one network address, once emails are given (shared school Wi-Fi)')
sub('../api/mark.js', '''if(t) await kv("DEL", "fu:" + t); }''', '''if(t){ await kv("DEL", "fu:" + t); await kv("DEL", "fel:" + t); } }''')

# ---- Leads store.
s = rd('../api/subscribe.js')
s = s.replace('SOURCES = ["result", "share", "checklist", "masterclass", "notes"]', 'SOURCES = ["result", "share", "checklist", "masterclass", "notes", "pdf", "gate"]')
s = s.replace('page: clean(b.page, 60), t: Date.now()};', 'page: clean(b.page, 60), paper: clean(b.paper, 30), band: clean(b.band, 30), t: Date.now()};')
s = s.replace('if(n > 10) return res.status(200).json({ok: false, error: "rate"});', 'if(n > 60) return res.status(200).json({ok: false, error: "rate"});  // high enough for a class on one school network')
s = s.replace('if(old){ item.consent = old.consent || item.consent;', 'if(old){ item.paper = item.paper || old.paper || ""; item.band = item.band || old.band || ""; item.consent = old.consent || item.consent;')
wr('../api/subscribe.js', s)

# ---- Admin: Leads table and CSV.
s = rd('../app.js')
a = s.index('  // Subscribers: email capture sign-ups, newest first, with a CSV export.')
b = s.index('  const load = async () => { const r = await call("list", {}); if(r.ok){ call("freereset"')
s = s[:a] + r'''  // Leads: every email given on the site, newest first, with a CSV export. Marketing goes only to consent = yes.
  const showSubs = list => { list = list || []; $("#subCount").textContent = list.length ? "(" + list.length + ")" : "";
    $("#subList").innerHTML = list.length ? `<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th align="left">Email</th><th align="left">Consent</th><th align="left">Paper</th><th align="left">Score band</th><th align="left">Source</th><th align="left">Time</th></tr>${list.map(s => `<tr><td>${esc(s.email)}</td><td>${s.consent ? "yes" : "no"}</td><td>${esc(s.paper || "")}</td><td>${esc(s.band || "")}</td><td>${esc((s.sources || [s.source]).join(", "))}</td><td>${new Date(s.t).toLocaleString("en-SG", {timeZone: "Asia/Singapore"})}</td></tr>`).join("")}</table>` : `<p>No leads yet.</p>`;
    $("#subCsv").onclick = () => { const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"'; const csv = ["email,consent,paper,score_band,source,time,consent_version"].concat(list.map(s => [s.email, s.consent ? "yes" : "no", s.paper, s.band, (s.sources || [s.source]).join(" "), new Date(s.t).toISOString(), s.consent_text_version].map(q).join(","))).join("\n");
      const el = document.createElement("a"); el.href = URL.createObjectURL(new Blob([csv], {type: "text/csv"})); el.download = "essaylab-leads.csv"; el.click(); }; };
  $("#adminBox .sheet-inner").insertAdjacentHTML("beforeend", `<h3 style="font-size:18px;margin-top:8px">Leads <span class="counter" id="subCount"></span></h3><div class="row"><button class="btn ghost" type="button" id="subCsv">Export CSV</button></div><div id="subList" style="overflow-x:auto"></div>`);
''' + s[b:]
# /app.html marks too: send a saved email, and explain the gate if there isn't one.
assert 'uid, ref, remark_token:' in s
if 'lead_email' not in s:
    s = s.replace('uid, ref, remark_token:', 'uid, ref, lead_email: (() => { try { return localStorage.getItem("ec_email") || undefined; } catch { return undefined; } })(), remark_token:', 1)
    k = 'freeused:"'
    assert k in s
    s = s.replace(k, 'needemail:"Your next free markings need an email. Please mark this essay from the box on the home page.",\n      ' + k, 1)
wr('../app.js', s)

# ---- Home marker hooks, applied by the build.
sub('post.py', 'HOME = [\n', '''HOME = [
 ('uid, ref, remark_token:','uid, ref, lead_email: window.leadEmail ? leadEmail() : undefined, remark_token:'),
 ('if(r.error === "weekly" ||','if(r.error === "needemail"){ if(window.showEmailGate) showEmailGate(r.left); return; }\\n    if(r.error === "weekly" ||'),
''')
sub('build.py', '<script src="/v2/enhance.js"></script>\n', '<script src="/v2/enhance.js"></script>\n<script src="/v2/leads.js"></script>\n')

# ---- Privacy.
sub('../privacy.html', '<li>to send you exam tips and offers, only if you have agreed', '<li>if you give your email for your marked script, a checklist or free markings 2 and 3: to count your free markings and to send you that script or checklist and a re-mark reminder;</li>\n    <li>to send you exam tips and offers, only if you have agreed')
sub('../privacy.html', '<li>emails and WhatsApp numbers: kept until you unsubscribe or ask us to delete them;</li>', '<li>emails you give for your marked script, a checklist or free markings: stored until you ask us to remove them;</li>\n    <li>other emails and WhatsApp numbers: kept until you unsubscribe or ask us to delete them;</li>')

# ---- Look.
c = rd('home.css')
if 'lead capture' not in c:
    c += r'''
/* lead capture */
.lead-box:not(#_):not(#_){margin:16px 0;padding:24px;background:var(--well);border-radius:16px}
#result .lead-box:not(#_):not(#_):not(#_){background:#fff;margin:8px 0}
.lead-box h3:not(#_):not(#_){margin:0 0 8px}
.lead-p:not(#_):not(#_){margin:0 0 16px;font:400 var(--type-fs-body)/var(--type-lh-body) var(--font-body);color:var(--soft)}
.lead-lbl:not(#_):not(#_):not(#_){display:block;margin:0 0 8px;font:500 var(--type-fs-small)/var(--type-lh-small) var(--font-body);color:var(--ink)}
.lead-in:not(#_):not(#_):not(#_){display:block;width:100%;min-height:48px;padding:12px 16px;border:0;border-radius:16px;background:#fff;font:400 var(--type-fs-body)/var(--type-lh-body) var(--font-body);color:var(--ink)}
#result .lead-in:not(#_):not(#_):not(#_){background:var(--well)}
.lead-in[aria-invalid="true"]:not(#_):not(#_){outline:2px solid var(--ink);outline-offset:1px}
.lead-hint:not(#_):not(#_){margin:8px 0 0;font:400 var(--type-fs-small)/var(--type-lh-small) var(--font-body);color:var(--soft)}
.lead-err:not(#_):not(#_){margin:8px 0 0;font:500 var(--type-fs-small)/var(--type-lh-small) var(--font-body);color:var(--ink)}
.lead-fix:not(#_):not(#_){min-height:24px;padding:0;border:0;background:none;font:inherit;color:var(--ink);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.lead-c:not(#_):not(#_):not(#_){display:flex;gap:8px;align-items:flex-start;margin:16px 0 0;font:400 var(--type-fs-small)/var(--type-lh-small) var(--font-body);color:var(--ink);cursor:pointer}
.lead-c input:not(#_):not(#_):not(#_){flex:none;width:18px;height:18px;margin:1px 0 0}
.lead-c a{color:var(--ink);text-underline-offset:3px}
.lead-actions:not(#_):not(#_){display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin:16px 0 0}
.lead-main:not(#_):not(#_){margin:0;gap:8px}
.lead-actions[hidden]:not(#_):not(#_){display:none}
.lead-no:not(#_):not(#_){min-height:44px;padding:0;border:0;background:none;font:400 var(--type-fs-small)/var(--type-lh-small) var(--font-body);color:var(--ink);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.lead-done:not(#_):not(#_){margin:16px 0 0;font:400 var(--type-fs-body)/var(--type-lh-body) var(--font-body);color:var(--ink)}
#result.lead-on #pdfBtn:not(#_):not(#_){display:none}
@media (max-width:899px){.lead-box:not(#_):not(#_){padding:16px}.lead-main .btn:not(#_):not(#_):not(#_),.lead-go:not(#_):not(#_):not(#_){width:100%;min-height:44px;height:auto;white-space:normal}}
'''
    wr('home.css', c)
print('ok')
