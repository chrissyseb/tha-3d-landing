# Release gate: every opening screen (intro ident, title, letter, dedication, How to play cards) fits one screen with no scroll.
import json,os,sys
from playwright.sync_api import sync_playwright
URL='http://localhost:8123/';OUT=os.environ.get('SHOT_DIR','')
SIZES=[(360,640),(390,844),(844,390),(820,1180),(1024,768)]
FIT="""(sel=>{const vh=innerHeight,vw=innerWidth;const root=document.querySelector(sel);if(!root)return 'missing '+sel;const bad=[];root.querySelectorAll('*').forEach(e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;if(e.closest('details:not([open])')&&e.tagName!=='SUMMARY'&&e.tagName!=='DETAILS')return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.opacity==='0'||cs.display==='none')return;if(e.matches('.mote,.burst,.burst *,.spk,.glint,.compass,.trail,.trail *,.walker,i'))return;const r=e.getBoundingClientRect();if(!r.width||!r.height)return;if(r.bottom>vh+1||r.top<-1||r.right>vw+1||r.left<-1)bad.push((e.className||e.tagName)+':'+Math.round(r.top)+'-'+Math.round(r.bottom))});const se=document.scrollingElement;if(se.scrollHeight>vh+1&&!document.getElementById('intro')&&!sel.startsWith('.dedi'))bad.push('page scroll '+se.scrollHeight+'>'+vh);return bad.slice(0,4).join(' | ')})"""
fails=[]
with sync_playwright() as p:
  b=p.chromium.launch()
  for W,H in SIZES:
    ctx=b.new_context(viewport={'width':W,'height':H},service_workers='block',reduced_motion='reduce');pg=ctx.new_page()
    pg.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});if(!sessionStorage.sd){localStorage.clear();sessionStorage.sd=1}")
    def route(rt):
      r=rt.fetch();body=r.text().replace("<script>VO_READY.then(()=>{","<script>VO_READY.then(()=>{window.__t=f=>eval(f);",1);rt.fulfill(response=r,body=body)
    pg.route(lambda u:u.endswith(':8123/') or u.endswith('/index.html'),route)
    pg.route('**/api/**',lambda rt:rt.fulfill(status=200,content_type='application/json',body='{}'))
    pg.goto(URL);pg.wait_for_timeout(1500)
    for sc in ['s0','s1','s2','s3']:
      ok=pg.evaluate("s=>{const d=document.getElementById('intro');if(!d)return false;d.querySelectorAll('.sc').forEach(e=>e.classList.toggle('on',e.classList.contains(s)));return !!d.querySelector('.'+s)}",sc)
      if not ok:continue
      pg.wait_for_timeout(700)
      if sc=='s3':pg.evaluate("document.querySelectorAll('#intro .ln,#intro .tap,#intro .nbob').forEach(e=>{e.style.animation='none';e.style.opacity=1})")
      r=pg.evaluate(FIT,'#intro .sc.'+sc)
      if OUT:pg.screenshot(path=f'{OUT}/opening_{sc}_{W}x{H}.png')
      if r:fails.append(f'{W}x{H} intro {sc}: {r}')
      sk=pg.evaluate("(()=>{const s=document.querySelector('#intro .iskip');if(!s)return 'no skip';const r=s.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.width>0?'':'skip not visible'})()")
      if sk:fails.append(f'{W}x{H} intro {sc}: {sk}')
    pg.evaluate("document.getElementById('intro')&&document.getElementById('intro').remove()")
    T=lambda js:pg.evaluate("c=>window.__t(c)",js)
    pg.wait_for_timeout(500)
    try:
      T("(()=>{document.querySelectorAll('.sheet,.ov').forEach(e=>e.remove());CRE.dedication&&CRE.dedication()})()");pg.wait_for_timeout(1200)
      sel=pg.evaluate("(()=>{const e=document.querySelector('.dedi');return e?'.dedi':''})()")
      if sel:
        pg.evaluate("document.querySelectorAll('.dedi *').forEach(e=>{e.style.animation='none';e.style.transition='none'})")
        r=pg.evaluate(FIT,sel)
        if OUT:pg.screenshot(path=f'{OUT}/opening_dedication_{W}x{H}.png')
        if r:fails.append(f'{W}x{H} dedication: {r}')
        pg.evaluate("document.querySelectorAll('.dedi').forEach(e=>e.remove())")
    except Exception as e:fails.append(f'{W}x{H} dedication error {e}')
    for k in range(4):
      T("(()=>{document.querySelectorAll('.sheet,.ov').forEach(e=>e.remove());if(!document.querySelector('.howc'))howto();})()") if k==0 else T("$('hnext').click()")
      pg.wait_for_timeout(500);pg.evaluate("scrollTo(0,0)")
      r=pg.evaluate(FIT,'.howc')
      if OUT:pg.screenshot(path=f'{OUT}/opening_howto{k+1}_{W}x{H}.png')
      if r:fails.append(f'{W}x{H} howto {k+1}: {r}')
    ctx.close()
for f in fails:print('FAIL',f)
print('opening fit: all passed' if not fails else f'opening fit: {len(fails)} failures');sys.exit(1 if fails else 0)
