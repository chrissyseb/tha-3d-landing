/* Records the product demo from the real preview page. The marking response is a saved real result, played back so the clip stays under 25 seconds. */
const { createRequire } = require("module");
const { chromium } = createRequire("C:/Users/chris/node_modules/")("playwright");
const fs = require("fs"), SP = "C:/Users/chris/AppData/Local/Temp/claude/0ed672123b93d727/0dbb6d59-0204-4518-a9b3-5815956b5c3d/scratchpad/", OUT = SP + "video/"; fs.mkdirSync(OUT, { recursive: true });
const U = process.argv[2], MARK = fs.readFileSync(SP + "mark.json", "utf8");
const cap = (p, t) => p.evaluate(t => { let c = document.getElementById("vcap"); if (!c) { c = document.createElement("div"); c.id = "vcap"; c.style.cssText = "position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:99999;background:#111;color:#fff;font:500 22px/30px Inter,sans-serif;padding:10px 24px;border-radius:999px;white-space:nowrap;transition:opacity .25s"; document.body.append(c); } c.textContent = t; c.style.opacity = t ? 1 : 0; }, t);
const to = (p, sel, off = 90) => p.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: "smooth" }); }, [sel, off]);
(async () => { let b; try { b = await chromium.launch(); } catch { b = await chromium.launch({ channel: "chrome" }); }
 const c = await b.newContext({ viewport: { width: 1000, height: 562 }, deviceScaleFactor: 1.28 }), p = await c.newPage();
 let run = false, n = 0; const T = []; const FR = OUT + "f/"; fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR); const loop = async () => { while (run) { const name = String(n++).padStart(5, "0") + ".jpg"; await p.screenshot({ path: FR + name, type: "jpeg", quality: 82 }).catch(() => {}); T.push(Date.now()); } };
 await p.route("**/api/**", async r => { const d = r.request().postData() || ""; if (r.request().method() !== "POST") return r.continue(); if (d.includes('"essay"')) { await new Promise(x => setTimeout(x, 2600)); return r.fulfill({ status: 200, contentType: "application/json", body: MARK }); } return r.fulfill({ status: 200, contentType: "application/json", body: '{"left":3,"used":0,"credits":0}' }); });
 const t0 = Date.now(); await p.goto(U + "/", { waitUntil: "load" }); await p.addStyleTag({ content: ".wa-float,#vercel-live-feedback,vercel-live-feedback{display:none!important}html{scroll-behavior:smooth}" }); await p.waitForTimeout(600);
 await to(p, "#handin", 70); await p.waitForTimeout(1200); await p.click('#papers .paper-tabs button:has-text("JC and international")'); await p.click('#papers .paper-opt[data-id="gp"]'); await p.waitForTimeout(300);
 const start = Date.now() - t0; run = true; const L = loop();
 await to(p, "#question", 110); await cap(p, "Paste your essay"); await p.waitForTimeout(900);
 await p.click("#loadSample"); await p.waitForTimeout(2200);
 await to(p, "#markBtn", 330); await p.waitForTimeout(800); await cap(p, "Press mark"); await p.waitForTimeout(700); await p.click("#markBtn"); await p.waitForTimeout(600); await cap(p, "Marked in about a minute"); await p.waitForTimeout(1600);
 await p.waitForSelector("#result .lead-offer", { timeout: 30000 }); await p.waitForTimeout(500); await cap(p, "Your score and the reasons"); await p.waitForTimeout(3000);
 await p.mouse.wheel(0, 0); await cap(p, "The one fix worth the most marks"); await p.evaluate(() => { const r = document.querySelector("#result .fix") || document.querySelector("#result"); window.scrollTo({ top: r.getBoundingClientRect().top + scrollY - 120, behavior: "smooth" }); }); await p.waitForTimeout(3200);
 await cap(p, "Red-pen comments on your script"); await p.evaluate(() => { const r = document.querySelector("#result .script"); if (r) window.scrollTo({ top: r.getBoundingClientRect().top + scrollY - 100, behavior: "smooth" }); }); await p.waitForTimeout(3400);
 run = false; await L; fs.writeFileSync(OUT + "times.json", JSON.stringify(T)); await c.close(); await b.close(); console.log(JSON.stringify({ frames: n, dur: (T[T.length - 1] - T[0]) / 1000 })); })().catch(e => { console.log("CRASH", e.message.slice(0, 300)); process.exit(1); });
