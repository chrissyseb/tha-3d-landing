/* Generates the logo B asset set for this build from the approved SVG. Same file names, so every reference keeps working. */
const { createRequire } = require("module");
const { chromium } = createRequire("C:/Users/chris/node_modules/")("playwright");
const fs = require("fs"), R = "C:/Users/chris/Documents/THA/essaylab-deploy/site-v2-leads/", L = "C:/Users/chris/Documents/THA/essaylab-deploy/site-v2/logo-lab/";
const b = fs.readFileSync(L + "logo-b.svg", "utf8"), m = b.match(/<g class="el-ring">.*?<\/g>/s)[0];
const head = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">';
const ring = head + m.replace(' class="el-ring"', "") + "</svg>", el = b.replace(m, "").replace(/<svg[^>]*>/, head), fav = fs.readFileSync(L + "favicon-b.svg", "utf8");
fs.writeFileSync(R + "logo-b.svg", b); fs.writeFileSync(R + "logo-ring.svg", ring); fs.writeFileSync(R + "logo-el.svg", el); fs.writeFileSync(R + "favicon.svg", fav);
for (const [a, c] of [["og-b.jpg", "og.jpg"], ["og-square-b.jpg", "og-square.jpg"]]) fs.copyFileSync(L + a, R + c);
(async () => { let br; try { br = await chromium.launch(); } catch { br = await chromium.launch({ channel: "chrome" }); }
 const p = await br.newPage(); const shot = async (svg, sz, out, bg) => { await p.setViewportSize({ width: sz, height: sz }); await p.setContent(`<!doctype html><body style="margin:0;background:${bg || "transparent"}"><div style="width:${sz}px;height:${sz}px">${svg.replace("<svg ", '<svg style="display:block;width:100%;height:100%" ')}</div></body>`); await p.screenshot({ path: out, omitBackground: !bg }); };
 const T = "C:/Users/chris/AppData/Local/Temp/claude/0ed672123b93d727/0dbb6d59-0204-4518-a9b3-5815956b5c3d/scratchpad/assets/"; fs.mkdirSync(T, { recursive: true });
 for (const [s, z, n, bg] of [[b, 512, "logo-mark"], [b, 128, "logo-mark-128"], [b, 96, "m96"], [b, 192, "m192"], [ring, 96, "r96"], [ring, 192, "r192"], [el, 96, "e96"], [el, 192, "e192"], [b, 512, "m512"], [b, 180, "apple", "#ffffff"], [fav, 16, "f16"], [fav, 32, "f32"], [fav, 48, "f48"]]) await shot(s, z, T + n + ".png", bg);
 await br.close(); })();
