# Release gate: illustrated art loads (decodes) and the map art actually paints in day and night.
import json,sys
from playwright.sync_api import sync_playwright
URL='http://localhost:8123/'
ART=['/icons/art/vb-hero.webp','/icons/art/lexi-map.svg','/icons/art/kongo-arena.svg','/icons/art/hatch-meadow.svg','/icons/art/hatch-island.svg','/icons/th-logo.svg?v=50','/icons/th-wordmark.svg?v=50']
seed={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'T','coins':0,'cr':{'intro':1},'tipsSeen':1}
fails=[]
with sync_playwright() as p:
  b=p.chromium.launch()
  for sk in ('day','night'):
    pg=b.new_page(viewport={'width':360,'height':780})
    pg.add_init_script("localStorage.setItem('p6vq3',%s);localStorage.setItem('vq_ed','psle');localStorage.setItem('vb_intro','1');localStorage.setItem('vb_ded','1');localStorage.setItem('vb-dedi-seen','v2');localStorage.setItem('vb_skin','%s')"%(json.dumps(json.dumps(seed)),sk))
    pg.route('**/api/**',lambda rt:rt.fulfill(status=200,content_type='application/json',body='{}'))
    pg.goto(URL);pg.wait_for_timeout(1500)
    r=pg.evaluate("a=>Promise.all(a.map(u=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i.naturalWidth>0?'':u+' empty');i.onerror=()=>ok(u+' failed');i.src=u})))",ART)
    fails+=[f'{sk}: {x}' for x in r if x]
    pg.evaluate("document.querySelectorAll('.sheet,.ov').forEach(e=>e.remove());document.querySelector('.bnav [data-nav=map]').click()");pg.wait_for_timeout(1200)
    v=pg.evaluate("(()=>{const i=document.querySelector('.mapart img');if(!i)return 'no map art';if(!i.complete||!i.naturalWidth)return 'map art not loaded';let e=i;while(e&&e!==document.body){const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.5)return 'map art hidden by '+e.className;e=e.parentElement}const r=i.getBoundingClientRect();return r.width>100&&r.height>40?'':'map art too small'})()")
    if v:fails.append(f'{sk}: {v}')
    pg.close()
for f in fails:print('FAIL',f)
print('art visible: all passed' if not fails else 'art visible: FAIL');sys.exit(1 if fails else 0)
