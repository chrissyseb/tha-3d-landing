"""Every enquiry goes to WhatsApp through /api/wa. The number stays in the WA_NUMBER setting, never in the page. Sharing links to friends (wa.me/?text=) stay as they are."""
import glob, re
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)

s = rd('../api/wa.js')
if 'custom' not in s:
    a = 'const text = (req.query && req.query.about)'
    assert a in s
    s = s.replace(a, 'const custom = String((req.query && req.query.text) || "").replace(/[\\u0000-\\u001F\\u007F]/g, " ").trim().slice(0, 500);\n  const text = custom ? custom : (req.query && req.query.about)', 1)
    wr('../api/wa.js', s)

def static(s):
    s = s.replace('href="/app.html#msg?text=', 'href="/api/wa?text=').replace('href="#msg?text=', 'href="/api/wa?text=')
    s = re.sub(r'<a ((?:(?!target=)[^>])*?href="/api/wa[^"]*"(?:(?!target=)[^>])*)>', r'<a \1 target="_blank" rel="noopener">', s)
    s = re.sub(r'<link rel="icon" href="data:image/svg\+xml[^"]*"[^>]*>', '<link rel="icon" href="/favicon.svg" type="image/svg+xml">', s)
    return s
for f in glob.glob('../*.html') + glob.glob('sections/*.html') + ['hero-a.html']:
    s = rd(f); n = static(s)
    if n != s: wr(f, n)

s = rd('../app.js')
n = re.sub(r'(closest\(\'a\[href\^="#msg"\]\'\);[^\n]*\n[^\n]*\n[^\n]*?)openMsg\(t\);', r'\1window.open(t ? "/api/wa?text=" + encodeURIComponent(t) : "/api/wa", "_blank", "noopener");', s, count=1)
wr('../app.js', n)

s = rd('post.py')
if 'api/wa?text' not in s:
    s = s.replace('HOME = [\n', '''HOME = [
 ('let t = ""; try{ t = decodeURIComponent(q); }catch{} openMsg(t);','let t = ""; try{ t = decodeURIComponent(q); }catch{} window.open(t ? "/api/wa?text=" + encodeURIComponent(t) : "/api/wa", "_blank", "noopener");'),
 ('href="/app.html#msg?text=','href="/api/wa?text='),('href="#msg?text=','href="/api/wa?text='),
''', 1)
    wr('post.py', s)
print('ok')
