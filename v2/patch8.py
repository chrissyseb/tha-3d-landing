rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

m = rd('../api/mark.js')
if 'stripMachine' not in m:
    a = '${prev ? `- This is the student\'s REVISED version'
    assert m.count(a) == 1
    m = m.replace(a, '- Write as a teacher talking to the student. Never mention measured facts, measurements, analysis, flags or checks, and never put a phrase in quotation marks unless it is copied from the student\'s essay.\n' + a)
    a = '      // Keep the grade consistent with the mark, using the usual percentage bands for these papers.'
    assert m.count(a) == 1
    m = m.replace(a, """      // Teacher's voice only: remove any wording that leaks our internal measurements.
      { const each = (o, ks) => ks.forEach(k => { if(o && typeof o[k] === "string") o[k] = stripMachine(o[k]); });
        (out.fixes || []).forEach(f => each(f, ["why", "try", "title"]));
        (out.criteria || []).forEach(c => each(c, ["comment", "strength", "gap"]));
        each(out, ["verdict", "note", "next_target"]); each(out.model, ["why"]); }
""" + a)
    a = 'const FREE_LIMIT_BYPASS_IPS ='
    m = m.replace(a, r"""function stripMachine(t){
  const FLAG = "[‘'\"“](?:No|Few|Little|Limited|Wide|Narrow|Precise|Good|Low|High|Some)\\s[^’'\"”]{2,70}[’'\"”]";
  return t
    .replace(/(?:^|(?<=[.!?]\s))[^.!?]*\b(?:measured (?:facts?|evidence|analysis)|the analytics|automated (?:check|analysis))\b[^.!?]*[.!?]\s*/gi, "")
    .replace(new RegExp("[,;]?\\s*(?:as\\s+)?(?:noted|indicated|shown|supported|flagged|evidenced|highlighted)\\s+by\\s+" + FLAG, "gi"), "")
    .replace(new RegExp("[,;]?\\s*(?:showing|such as|including)\\s+" + FLAG + "(?:\\s+and\\s+" + FLAG + ")?", "gi"), "")
    .replace(new RegExp("\\s*\\(?" + FLAG + "\\)?", "g"), "")
    .replace(/\s+([.,;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
}
""" + a, 1)
    wr('../api/mark.js', m)

b = rd('build.py')
if 'enhance.js' not in b:
    a = '<script src="/v2/photo.js"></script>'; assert a in b
    b = b.replace(a, a + '\n<script src="/v2/enhance.js"></script>'); wr('build.py', b)

c = rd('home.css')
if '/* picker and upload */' not in c:
    c += r"""
/* picker and upload */
#handin .papers:not(#_):not(#_):not(#_){display:block}
#handin .paper-group{margin:0 0 16px}
#handin .paper-level{display:block;font-size:14px;line-height:20px;color:var(--soft);margin:0 0 8px}
#handin .paper-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#handin .paper-opt[data-free]:not(#_):not(#_){justify-content:space-between}
#handin .paper-opt[data-free]::after{content:"Free";font-size:14px;line-height:20px;color:var(--soft);font-weight:400;margin-left:8px}
#handin .paper-opt[aria-pressed="true"]:not(#_):not(#_){background:var(--ink);color:#fff;border-color:var(--ink)}
#handin .paper-opt[aria-pressed="true"] b:not(#_):not(#_){color:#fff}
#handin .paper-opt[aria-pressed="true"]::after{color:#fff}
#handin .dropzone:not(#_):not(#_){display:flex;gap:16px;align-items:center;background:#fff;border:1.5px dashed var(--line);border-radius:16px;padding:24px;transition:border-color .2s,background-color .2s}
#handin .dropzone.over:not(#_):not(#_){border-color:var(--ink);background:var(--well)}
#handin .dropzone img:not([hidden]){width:72px;height:72px;object-fit:cover;border-radius:8px;flex:none}
#handin .dropzone input[type=file]:not(#_):not(#_){position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}
#handin .dropzone>div:not(#_){display:flex!important;flex-direction:row!important;flex-wrap:wrap;align-items:center;gap:8px 8px!important;width:100%}
#handin .dropzone label[for=photo]:not(.btn):not(#_){flex:1 1 100%;margin:0}
#handin .dropzone .hint:not(#_){flex:1 1 100%}
#handin .dropzone .btn:not(#_){margin:0;cursor:pointer}
#handin .choose-btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
@media (min-width:900px){#handin .dropzone label[for=photo]:not(.btn):not(#_)::after{content:" Drop it here, or choose one.";font-weight:400;color:var(--soft)}}
@media (max-width:899px){
 #handin .paper-list{grid-template-columns:minmax(0,1fr)}
 #handin #markBtn:not(#_):not(#_){width:100%}
 #handin .dropzone .btn:not(#_){flex:1 1 100%;min-height:48px}
 #handin .step .row .btn:not(#_){flex:1 1 100%}
}
/* result: one main path */
#result .result-more{margin:8px 0 0;background:var(--well);border-radius:24px;padding:0 48px}
#result .result-more>summary{padding:24px 0;font-size:16px;line-height:24px;font-weight:500;cursor:pointer}
#result .result-more[open]{padding-bottom:48px}
#result .result-more .sheet:not(#_){background:none!important;padding:0;margin:0 0 24px!important}
#result .result-more .sheet-inner:not(#_){padding:0!important}
@media (max-width:899px){#result .result-more{margin:8px -8px 0;border-radius:20px;padding:0 16px}#result .result-more[open]{padding-bottom:24px}}
"""
    wr('home.css', c)
print('ok')
