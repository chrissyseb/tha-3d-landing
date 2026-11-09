import glob, json, os, re, shutil
rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
R = '../'
shutil.copyfile(R + 'logo-mark.png', R + 'logo-b.png')   # the one still logo, made from logo-b.svg
wr(R + 'site.webmanifest', json.dumps({"name": "EssayLabsg", "short_name": "EssayLabsg", "start_url": "/", "display": "standalone", "background_color": "#ffffff", "theme_color": "#ffffff", "icons": [{"src": "/apple-touch-icon.png?v=10", "sizes": "180x180", "type": "image/png"}, {"src": "/logo-b.png?v=10", "sizes": "512x512", "type": "image/png"}, {"src": "/favicon.svg?v=10", "sizes": "any", "type": "image/svg+xml"}]}, indent=1))
ICONS = '<link rel="icon" href="/favicon.ico?v=10" sizes="48x48"><link rel="icon" href="/favicon.svg?v=10" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=10"><link rel="manifest" href="/site.webmanifest?v=10">'
BRAND = '<span class="brand-orb" aria-hidden="true"></span><span class="brand-word">EssayLab<span class="brand-sg">sg</span><sup class="brand-tm">™</sup></span><span class="brand-by">by Thinking Hack™</span>'
WORD = '<div class="foot-word" aria-hidden="true">' + ''.join('<i style="--i:%d">%s</i>' % (k, ch) for k, ch in enumerate('EssayLab')) + '<span class="fw-sg" style="--i:8">sg</span><span class="fw-tm" style="--i:9">™</span></div>'
SHARED = 'html body .brand-orb::before{animation:elspin 14s linear infinite!important}html body .foot-word:not(#_):not(#_){font-size:22cqi!important}html body .foot-word .fw-sg:not(#_):not(#_){font-size:.4em!important;margin-left:.04em!important;font-weight:400;letter-spacing:0}html body .foot-word .fw-tm:not(#_):not(#_){font-size:.2em!important;vertical-align:2.85em!important;line-height:0;letter-spacing:0}html body .foot-word i{font-style:normal;display:inline-block}html body .foot-word .fw-sg,html body .foot-word .fw-tm{display:inline-block}'
ICON_RX = r'<link rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>\s*'
def page(s):
    s = re.sub(r'<a class="brand"([^>]*)>.*?</a>', lambda m: '<a class="brand"' + m.group(1) + '>' + BRAND + '</a>', s, flags=re.S)
    s = re.sub(ICON_RX, '', s)
    s = s.replace('</title>', '</title>\n' + ICONS, 1)
    s = s.replace('?v=9', '?v=10')
    s = re.sub(r'\.brand-orb\{display:inline-block;width:18px;height:18px;border-radius:50%;[^}]*conic-gradient[^}]*\}', '', s)
    s = s.replace('background:url(/logo-b.svg) center/contain no-repeat!important;', '')
    s = s.replace('@media (prefers-reduced-motion:reduce){html body .brand-orb::before{animation:none}}', '')
    s = re.sub(r'<div class="foot-word"[^>]*>.*?</div>', WORD, s, count=1, flags=re.S)
    if 'id="logo-shared"' not in s: s = s.replace('</head>', '<style id="logo-shared">' + SHARED + '</style></head>', 1)
    return s
for f in glob.glob(R + '*.html'):
    if f.replace('\\', '/').endswith('index.html'): continue
    wr(f, page(rd(f)))
s = rd('sections/footer.html')
s = re.sub(r'<div class="foot-word"[^>]*>.*?</div>', WORD, s, count=1, flags=re.S); wr('sections/footer.html', s)
c = rd('home.css')
if 'id-shared' not in c:
    c += '\n/* id-shared: one footer wordmark and one spin, on every page */\n' + SHARED + '\nhtml.fw-arm .foot-word :is(i,.fw-sg,.fw-tm){opacity:0;transform:translateY(.28em);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i) * 55ms)}\nhtml.fw-arm .foot-word.fw-in :is(i,.fw-sg,.fw-tm){opacity:1;transform:none}\n'
    wr('home.css', c)
s = rd('enhance.js')
if 'fw-arm' not in s:
    i = s.rindex('})();')
    s = s[:i] + r'''
  /* Footer wordmark rises in, as on the other pages. */
  { const w = document.querySelector(".foot-word"); if (w && "IntersectionObserver" in window && w.getBoundingClientRect().top >= innerHeight) { document.documentElement.classList.add("fw-arm"); const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { w.classList.add("fw-in"); io.disconnect(); } }, {threshold: .4}); io.observe(w); } }
''' + s[i:]
    wr('enhance.js', s)
s = rd(R + 'app.js').replace('LOGO_MARK.src = "/logo-mark.png"', 'LOGO_MARK.src = "/logo-b.png"'); wr(R + 'app.js', s)
s = rd('post.py').replace("'LOGO_MARK.src = \"/logo-mark-512.webp\"'", "'LOGO_MARK.src = \"/logo-b.png\"'"); wr('post.py', s)
s = rd('build.py')
s = s.replace("head.replace('?v=7', '?v=9')", "head.replace('?v=7', '?v=10')")
if 'site.webmanifest' not in s:
    a = "# SEO head\n"
    s = s.replace(a, a + "head = re.sub(r'<link rel=\"(?:icon|shortcut icon|apple-touch-icon|manifest)\"[^>]*>\\s*', '', head)\nhead = head.replace('</title>', '</title>\\n" + ICONS + "', 1)\n", 1)
    wr('build.py', s)
wr('build.py', s)
for name in ['logo-ring-96.webp', 'logo-ring-192.webp', 'logo-el-96.webp', 'logo-el-192.webp', 'logo-mark-96.webp', 'logo-mark-128.png', 'logo-mark-192.webp', 'logo-mark-512.webp', 'logo-mark.png', 'og.png']:
    if os.path.exists(R + name): os.remove(R + name)
print('ok')
