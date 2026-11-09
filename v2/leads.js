/* Lead capture on the home essay box. Loads after marker.js and uses its uid, last, left, unlocked, paperId and savePdf.
   The first marking needs nothing. The result always shows first. The consent box is never pre-ticked. */
(() => {
  const CONSENT_V = "v2-2026-11-04";
  const CONSENT = 'Send me exam tips and offers from Thinking Hack™. Unsubscribe any time. <a href="/privacy.html">Privacy</a>';
  const CHECK = {psle: ["PSLE composition", "psle-composition"], pslesw: ["PSLE composition", "psle-composition"], olang: ["O-Level English", "o-level-english"], olsw: ["O-Level English", "o-level-english"], gp: ["GP Paper 1", "gp-paper-1"]};
  const TYPOS = {"gmial.com": "gmail.com", "gmal.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "hotmial.com": "hotmail.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com", "outlok.com": "outlook.com", "icloud.co": "icloud.com"};
  const OK = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const saved = () => { try { return localStorage.getItem("ec_email") || ""; } catch { return ""; } };
  const remember = v => { try { localStorage.setItem("ec_email", v); } catch {} };
  window.leadEmail = () => saved() || undefined;

  const save = (email, consent, source, band) => fetch("/api/subscribe", {method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email, marketing_consent: consent, consent_text_version: CONSENT_V, source, paper: paperId, band: band || "", page: location.pathname})}).then(r => r.json());

  /* One email form, used by the gate and by the result offers. Resolves with the email once saved, or null on Not now. */
  let formN = 0;
  function emailForm(host, {submit, hint, source, band, softFail}) {
    return new Promise(done => {
      const n = ++formN, kid = /^psle/.test(paperId);
      const wrap = document.createElement("form"); wrap.className = "lead-form"; wrap.noValidate = true;
      wrap.innerHTML = `<label class="lead-lbl" for="leadEmail${n}">${kid ? "Parent's email" : "Your email"}</label>
        <input id="leadEmail${n}" class="lead-in" type="email" name="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" aria-describedby="leadHint${n} leadErr${n}">
        <p class="lead-err" id="leadErr${n}" role="alert" hidden></p>
        <p class="lead-hint" id="leadHint${n}">${hint}${kid ? "" : " Under 13? Please use a parent's email."}</p>
        <label class="lead-c"><input type="checkbox" name="mc"><span>${CONSENT}</span></label>
        <div class="lead-actions"><button class="btn primary lead-go" type="submit">${submit}</button><button class="lead-no" type="button">Not now</button></div>`;
      host.append(wrap);
      const input = wrap.elements.email, err = wrap.querySelector(".lead-err"), go = wrap.querySelector(".lead-go");
      input.value = saved();
      const say = html => { err.innerHTML = html; err.hidden = !html; input.setAttribute("aria-invalid", String(!!html)); };
      const close = v => { wrap.remove(); done(v); };
      wrap.querySelector(".lead-no").addEventListener("click", () => close(null));
      wrap.addEventListener("keydown", e => { if (e.key === "Escape") close(null); });
      err.addEventListener("click", e => { const b = e.target.closest("[data-fix]"); if (b) { input.value = b.dataset.fix; say(""); input.focus(); } });
      wrap.addEventListener("submit", async e => {
        e.preventDefault();
        const v = input.value.trim().toLowerCase();
        if (!OK.test(v)) { say("Please enter an email like name@example.com."); input.focus(); return; }
        const dom = v.split("@")[1];
        if (TYPOS[dom] && wrap.dataset.warned !== v) { wrap.dataset.warned = v; const fix = v.split("@")[0] + "@" + TYPOS[dom]; say(`Did you mean <button type="button" class="lead-fix" data-fix="${fix}">${fix}</button>? Press the button again to keep what you typed.`); return; }
        go.disabled = true; say("");
        try {
          const r = await save(v, wrap.elements.mc.checked, source, band);
          if (!r.ok) throw r.error || "x";
          remember(v); close(v);
        } catch (x) {
          go.disabled = false;
          if (x === "email") { say("Please enter an email like name@example.com."); input.focus(); return; }
          if (softFail) { close(""); return; }
          say("That didn't save. Please try again in a minute.");
        }
      });
      input.focus({preventScroll: true});
    });
  }

  /* Free markings 2 and 3: asked only when they press Mark, and their essay stays in the box. */
  window.showEmailGate = n => {
    const old = document.getElementById("emailGate"); if (old) old.remove();
    const btn = document.getElementById("markBtn");
    const box = document.createElement("div"); box.id = "emailGate"; box.className = "lead-box lead-gate"; box.setAttribute("role", "group"); box.setAttribute("aria-labelledby", "gateT");
    const count = typeof n === "number" && n > 0 ? n : left;
    box.innerHTML = `<h3 id="gateT">${count === 1 ? "1 free marking left" : count + " free markings left"}</h3><p class="lead-p">Your first marking needed no sign-up. Add your email to use the rest. Your essay stays here.</p>`;
    (btn.closest(".row") || btn).before(box);
    box.scrollIntoView({block: "center"});
    emailForm(box, {submit: "Continue and mark", hint: "We use it to count your free markings.", source: "gate"}).then(v => { box.remove(); if (v) btn.click(); else btn.focus({preventScroll: true}); });
  };

  /* Under the result: the PDF and the matching checklist. The result is already on screen. */
  function pdfNow() { try { const p = savePdf(last); if (p && p.catch) p.catch(() => {}); } catch {} }
  function offer() {
    const res = document.getElementById("result");
    if (!res || !res.children.length || res.querySelector(".lead-offer") || typeof unlocked === "undefined" || unlocked) return;
    res.classList.add("lead-on");
    const paper = (last && last.paper) || paperId, list = CHECK[paper], band = (last && last.grade) || "";
    const box = document.createElement("div"); box.className = "lead-box lead-offer";
    box.innerHTML = `<h3>Keep this marking</h3><p class="lead-p">Your full marked script as a PDF. Email delivery and re-mark reminders are coming soon.</p>
      <div class="lead-actions lead-main"><button class="btn primary" type="button" data-get="pdf">Email me the full marked script (PDF)</button>${list ? `<button class="btn ghost" type="button" data-get="checklist">Get the ${list[0]} checklist (PDF)</button>` : ""}</div><div class="lead-slot"></div><p class="lead-done" role="status" hidden></p>`;
    const more = res.querySelector(":scope > .result-more"); if (more) more.before(box); else res.append(box);
    const main = box.querySelector(".lead-main"), slot = box.querySelector(".lead-slot"), done = box.querySelector(".lead-done");
    const give = kind => {
      if (kind === "pdf") { pdfNow(); done.textContent = "Your PDF is ready. We haven't emailed a copy, because email delivery isn't switched on yet."; }
      else { const a = document.createElement("a"); a.href = `/checklists/essaylab-checklist-${list[1]}.pdf`; a.download = ""; document.body.append(a); a.click(); a.remove(); done.textContent = `Your ${list[0]} checklist is downloading now.`; }
      done.hidden = false;
    };
    main.addEventListener("click", async e => {
      const b = e.target.closest("[data-get]"); if (!b) return;
      const kind = b.dataset.get; done.hidden = true;
      if (saved()) { save(saved(), false, kind, band).catch(() => {}); give(kind); return; }
      main.hidden = true;
      const v = await emailForm(slot, {submit: kind === "pdf" ? "Get my PDF" : "Get my checklist", hint: "You get the file straight away.", source: kind, band, softFail: true});
      main.hidden = false;
      if (v === null) { b.focus({preventScroll: true}); return; }
      give(kind); b.focus({preventScroll: true});
    });
  }
  const res = document.getElementById("result");
  if (res) new MutationObserver(() => setTimeout(offer, 0)).observe(res, {childList: true});
})();
