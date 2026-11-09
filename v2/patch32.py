"""One logo lockup everywhere: circle height equals wordmark height; small sg at 0.40 of the word (12px floor); small raised TM."""
import glob, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
BRAND_FN = r'''function drawBrand(g, x, y, size, color, align, desc){
  // One lockup: the circle matches the wordmark's height; "sg" is small; TM is small and raised.
  g.save(); g.textBaseline = "alphabetic"; g.textAlign = "left";
  const sg = Math.round(size * .4), tm = Math.round(size * .23), d = size * .95, gap = d * .26;
  g.font = `300 ${size}px ${DISPLAY}`; const w = g.measureText("EssayLab").width;
  g.font = `400 ${sg}px ${DISPLAY}`; const sw = g.measureText("sg").width; g.font = `400 ${tm}px ${DISPLAY}`; const tw = g.measureText("™").width;
  const sgGap = sg * .1, total = d + gap + w + sgGap + sw + 1 + tw, x0 = align === "center" ? x - total / 2 : x, top = y - size * .255 - d / 2;
  if(LOGO_MARK.complete && LOGO_MARK.naturalWidth) g.drawImage(LOGO_MARK, x0, top, d, d);
  else { g.fillStyle = BRAND.orb[1]; g.beginPath(); g.arc(x0 + d / 2, top + d / 2, d / 2, 0, Math.PI * 2); g.fill(); }
  let cx = x0 + d + gap; g.fillStyle = color; g.font = `300 ${size}px ${DISPLAY}`; g.fillText("EssayLab", cx, y); cx += w + sgGap;
  g.font = `400 ${sg}px ${DISPLAY}`; g.fillText("sg", cx, y); cx += sw + 1;
  g.font = `400 ${tm}px ${DISPLAY}`; g.fillText("™", cx, y - size * .58);
  g.restore();
}
'''
PAT = r'function drawBrand\(g, x, y, size, color, align, desc\)\{.*?\n\}\n'
ORB_OLD, ORB_NEW = 'orb:["#EBA98A","#A895E6","#93AACB"]', 'orb:["#6F8FD0","#8B6FD6","#E0703C"]'
s = rd('../app.js')
s, n = re.subn(PAT, lambda m: BRAND_FN, s, count=1, flags=re.S); assert n == 1 or BRAND_FN in s
wr('../app.js', s.replace(ORB_OLD, ORB_NEW))
s = rd('post.py')
if 'BRAND_FN' not in s:
    s = s.replace('def home_text(s):\n', 'BRAND_FN = ' + repr(BRAND_FN) + '\ndef home_text(s):\n    s = re.sub(r"function drawBrand\\(g, x, y, size, color, align, desc\\)\\{.*?\\n\\}\\n", lambda m: BRAND_FN, s, count=1, flags=re.S)\n    s = s.replace(\'orb:["#EBA98A","#A895E6","#93AACB"]\', \'orb:["#6F8FD0","#8B6FD6","#E0703C"]\')\n', 1)
    wr('post.py', s)
OLD = 'html{--logo-h:34px}@media (max-width:899px){html{--logo-h:26px}}'
NEW = 'html{--logo-h:34px}@media (max-width:899px){html{--logo-h:24px}}'
def css(t):
    t = t.replace(OLD, NEW)
    t = t.replace('font-size:calc(var(--logo-h)*.46)!important;margin-left:.12em!important', 'font-size:max(12px,calc(var(--logo-h)*.42))!important;margin-left:.1em!important')
    t = t.replace('font-size:calc(var(--logo-h)*.26)!important', 'font-size:max(7px,calc(var(--logo-h)*.24))!important')
    return t
for f in glob.glob('../*.html') + ['home.css']:
    t = rd(f); n = css(t)
    if n != t: wr(f, n)
s = rd('sections/footer.css')
s = s.replace('footer.site .fw-sg{font-size:.32em;letter-spacing:0;margin-left:.06em}', 'footer.site .fw-sg{font-size:.4em;letter-spacing:0;margin-left:.04em}')
wr('sections/footer.css', s)
c = rd('home.css').replace('footer.site .fw-sg{margin-left:.12em;font-weight:400}', 'footer.site .fw-sg{margin-left:.04em;font-weight:400}')
wr('home.css', c)
print('ok')
