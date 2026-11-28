# Egg shop purchase flow at the new prices. Serve the repo on :8123 (python3 -m http.server 8123), then run: python3 tests/egg_shop_flow_test.py
import json
from playwright.sync_api import sync_playwright
seed={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'Tester','coins':13000,'runE':[2000,4000],'cr':{'intro':1}}
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_context(service_workers='block').new_page()
    pg.add_init_script("if(!sessionStorage.getItem('s')){localStorage.clear();localStorage.setItem('p6vq3',%s);sessionStorage.setItem('s','1')}"%json.dumps(json.dumps(seed)))
    def route(rt):
        r=rt.fetch();body=r.text().replace("<script>VO_READY.then(()=>{","<script>VO_READY.then(()=>{window.__t=f=>eval(f);",1);rt.fulfill(response=r,body=body)
    pg.route(lambda u:u.endswith(':8123/') or u.endswith('/index.html'),route)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8123/');pg.wait_for_timeout(1500)
    pg.evaluate("f=>window.__t(f)","(()=>{document.querySelectorAll('.sheet,.chestsheet').forEach(e=>e.remove())})()")
    pg.evaluate("f=>window.__t(f)","(()=>{SHOPMODE='shop';SHOPTAB='pet';shop()})()")
    print([t.inner_text().replace('\n',' | ') for t in pg.query_selector_all('.eggcard')])
    pg.click('[data-egg="1"]');pg.wait_for_timeout(300)
    print('after Rare:',pg.evaluate("f=>window.__t(f)",'(()=>[S.coins,CRE.st().eggs.map(e=>e.r+e.src),CRE.st().log.bought])()'))
    pg.evaluate("f=>window.__t(f)","(()=>{SHOPMODE='shop';SHOPTAB='pet';shop()})()");pg.click('[data-egg="0"]');pg.wait_for_timeout(300)
    print('after Common:',pg.evaluate("f=>window.__t(f)",'(()=>[S.coins,CRE.st().log.bought])()'))
    pg.evaluate("f=>window.__t(f)","(()=>{SHOPMODE='shop';SHOPTAB='pet';shop()})()");pg.click('[data-egg="3"]');pg.wait_for_timeout(300)
    print('Legendary unaffordable:',pg.evaluate("f=>window.__t(f)",'(()=>[S.coins,CRE.st().log.bought])()'))
    print('errors',errs[:3])
