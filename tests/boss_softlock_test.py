# Boss soft-lock regression. Serve the repo on :8123 (python3 -m http.server 8123), then: python3 tests/boss_softlock_test.py
# Covers: wrong answer -> boss hits -> Next appears -> next question is answerable; canvas paused mid-attack (app switch / pause
# button) still returns control; correct answer -> power buttons visible and tappable; reload mid-boss redraws the boss;
# canvas gate label matches the run gate; no page errors. Portrait 390x844 and landscape 844x390.
import json,sys
from playwright.sync_api import sync_playwright
URL='http://localhost:8123/'
seed={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'Tester','coins':0,'cr':{'intro':1},'tipsSeen':1}
fails=[]
def ok(c,m):
    if not c:fails.append(m);print('FAIL',m)
WRONG="(()=>{const s=sess.steps[sess.i],x=s.x,ans=[x[0],x[2],x[6]].map(v=>String(v).toLowerCase());const os=[...document.querySelectorAll('#main .opt:not(:disabled)')];const b=os.find(o=>!ans.includes(o.innerText.trim().toLowerCase()));if(b){b.click();return 'opt'}const i=document.querySelector('#main input');if(i){i.value='zzzz';i.dispatchEvent(new Event('input'));const f=i.closest('form');if(f)f.requestSubmit();else i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 'inp'}return 'none'})()"
RIGHT="(()=>{const s=sess.steps[sess.i],x=s.x,ans=[x[0],x[2],x[6]].map(v=>String(v).toLowerCase());const os=[...document.querySelectorAll('#main .opt:not(:disabled)')];const b=os.find(o=>ans.includes(o.innerText.trim().toLowerCase()));if(b){b.click();return 'opt'}cur_boss=true;result(true,x);return 'direct'})()"
STATE="(()=>{const nx=document.getElementById('nx');const live=[...document.querySelectorAll('#main button,#main input')].filter(b=>!b.disabled&&!b.hidden&&b.offsetParent&&b.id!=='tipq'&&!b.classList.contains('spk')).map(b=>b.id||b.className);const bub=[...document.querySelectorAll('#main .bub')].map(b=>{const r=b.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=-1&&r.width>20&&!b.disabled});return {i:sess&&sess.i,gate:sess&&sess.gate,hearts:sess&&sess.hearts,live,bub,nxVis:!!(nx&&!nx.hidden&&nx.offsetParent),obBoss:!!(OB.st&&OB.st.boss&&!OB.st.boss.dead)}})()"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for W,H in ((390,844),(844,390)):
        pg=b.new_context(service_workers='block',viewport={'width':W,'height':H}).new_page()
        pg.add_init_script("if(!sessionStorage.getItem('sd')){localStorage.clear();localStorage.setItem('p6vq3',%s);localStorage.setItem('vq_ed','psle');sessionStorage.setItem('sd',1)}"%json.dumps(json.dumps(seed)))
        def route(rt):
            r=rt.fetch();body=r.text().replace("<script>VO_READY.then(()=>{","<script>VO_READY.then(()=>{window.__t=f=>eval(f);",1);rt.fulfill(response=r,body=body)
        pg.route(lambda u:u.endswith(':8123/') or u.endswith('/index.html'),route)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL);pg.wait_for_timeout(1500)
        T=lambda js:pg.evaluate("c=>window.__t(c)",js)
        tag=f'{W}x{H}'
        T("(()=>{document.querySelectorAll('.sheet,.chestsheet').forEach(e=>e.remove());sess=null;start('learn');const bi=sess.steps.findIndex(z=>z.boss);for(let j=0;j<bi;j++)(sess.done||(sess.done={}))[sess.steps[j].u]=1;sess.i=bi;run()})()")
        pg.wait_for_timeout(4500)
        st=T(STATE);ok(st['obBoss'],tag+' boss drawn at gate 10');ok(st['gate']==10,tag+' gate 10 at first boss: %s'%st['gate'])
        lbl=T("(()=>{const g=OB.c.getContext('2d');let t='';const f=g.fillText;g.fillText=function(s){if(/Gate/.test(s))t=s;return f.apply(this,arguments)};return new Promise(r=>setTimeout(()=>{g.fillText=f;r(t)},300))})()")
        ok('Stage 1 · Gate 10/10' in lbl,tag+' canvas label shows run gate: '+lbl)
        for rnd in range(2):  # wrong -> (first miss may only cross out) -> wrong -> hit -> next
            h0=T("sess.hearts")
            for k in range(3):
                T(WRONG);pg.wait_for_timeout(3500)
                if T("sess.hearts")<h0:break
            st=T(STATE);ok(st['hearts']<h0,tag+' wrong answer costs a heart');ok(st['nxVis'],tag+' Next visible after boss hit %s'%st)
            T("document.getElementById('nx').click()");pg.wait_for_timeout(1500)
            st=T(STATE);ok(any(x.startswith('opt') for x in st['live']) or 'inp' in str(st['live']) or len(st['live'])>0,tag+' next question answerable %s'%st)
        # paused canvas mid-attack must not soft-lock
        T("OB.pause()");h0=T("sess.hearts")
        for k in range(3):
            T(WRONG);pg.wait_for_timeout(3500)
            if T("sess.hearts")<h0 or T("!!document.getElementById('kretry')"):break
        st=T(STATE);ok(st['nxVis'] or T("!!document.getElementById('kretry')"),tag+' paused canvas: control returns %s'%st)
        if T("!!document.getElementById('kretry')"):T("document.getElementById('kretry').click()");pg.wait_for_timeout(1500)
        else:T("document.getElementById('nx').click()");pg.wait_for_timeout(1500)
        # correct answer -> power buttons visible and tappable
        T(RIGHT);pg.wait_for_timeout(1500);st=T(STATE)
        ok(st['bub'] and all(st['bub']),tag+' power buttons visible+enabled %s'%st['bub'])
        T("document.querySelector('#main .bub').click()");pg.wait_for_timeout(3500);st=T(STATE)
        ok(st['nxVis'] or T("!!document.querySelector('.victory')"),tag+' after attack Next returns %s'%st)
        # reload mid-boss: boss redrawn, label consistent
        T("document.getElementById('nx')&&document.getElementById('nx').click()");pg.wait_for_timeout(800);T("persist()")
        pg.reload();pg.wait_for_timeout(1500)
        T("(()=>{document.querySelectorAll('.sheet,.chestsheet').forEach(e=>e.remove());const r=document.getElementById('res');if(r)r.click()})()");pg.wait_for_timeout(3000)
        st=T(STATE);ok(st['obBoss'],tag+' boss re-created after reload mid-boss %s'%st)
        ok(not errs,tag+' page errors: %s'%errs[:3])
print('boss soft-lock: all passed' if not fails else '%d failures'%len(fails));sys.exit(1 if fails else 0)
