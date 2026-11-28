# Release gate: during a question every answer button is inside the viewport (phones incl. ~56px browser bar, landscape, iPad).
import json,sys
from playwright.sync_api import sync_playwright
import os;OUT=os.environ.get('SHOT_DIR','/tmp/');tag='fit'
seed={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'Tester','coins':1400,'runs':6,'pts':5000,'cr':{'intro':1},'tipsSeen':1,'days':['2026-11-20']}
M="(()=>{const vh=innerHeight;const o=[...document.querySelectorAll('#main .opt,#main .tile')].filter(e=>e.offsetParent);return {n:o.length,out:o.filter(e=>{const r=e.getBoundingClientRect();return r.bottom>vh+1||r.top<0}).length,maxB:Math.max(0,...o.map(e=>Math.round(e.getBoundingClientRect().bottom))),vh}})()"
fails=0
with sync_playwright() as p:
  b=p.chromium.launch()
  for W,H in [(360,640),(360,724),(390,788),(412,915),(844,390),(820,1180)]:
    pg=b.new_page(viewport={'width':W,'height':H})
    pg.add_init_script("localStorage.setItem('p6vq3',%s);localStorage.setItem('vq_ed','psle');localStorage.setItem('vb_intro','1');localStorage.setItem('vb_ded','1');localStorage.setItem('vb-dedi-seen','v2');localStorage.setItem('vb_skin','night')"%json.dumps(json.dumps(seed)))
    pg.route('**/api/**',lambda rt:rt.fulfill(status=200,content_type='application/json',body='{}'))
    pg.goto('http://localhost:8123/');pg.wait_for_timeout(1500)
    pg.evaluate("document.querySelectorAll('.sheet,.ov,[class*=gift],[class*=badgepop]').forEach(e=>e.remove())")
    pg.evaluate("(document.getElementById('res')||document.getElementById('go')).click()");pg.wait_for_timeout(1500)
    r=None
    for k in range(25):
      r=pg.evaluate(M)
      if r['n']:break
      pg.evaluate("(()=>{document.querySelectorAll('.sheet,.ov,.chestsheet').forEach(e=>e.remove());const b=document.getElementById('nx');if(b)b.click()})()");pg.wait_for_timeout(700)
    pg.wait_for_timeout(400);r=pg.evaluate(M)
    pg.screenshot(path=f'{OUT}{tag}_question_{W}x{H}.png')
    ok=r['n']>0 and r['out']==0; fails+=not ok
    print(W,H,r,'OK' if ok else 'FAIL',flush=True)
    pg.close()
sys.exit(1 if fails else 0)
