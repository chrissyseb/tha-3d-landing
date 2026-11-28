# Release smoke: every main screen at phone/landscape/tablet sizes, day+night, fresh + existing save; plays a real run.
# Serve the repo on :8123 first (release_check.sh does this). Run: python3 tests/smoke_release.py [--long]
# Fails on any pageerror, or when no tappable control appears for >6s during a run. Screenshots -> $OUT (default /mnt/user-data/outputs/fullcheck).
import json,sys,os,time
from playwright.sync_api import sync_playwright
URL='http://localhost:8123/';OUT=os.environ.get('OUT','/mnt/user-data/outputs/fullcheck');os.makedirs(OUT,exist_ok=True)
LONG='--long' in sys.argv
BASE={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'Tester','coins':0,'cr':{'intro':1},'tipsSeen':1}
OLD=dict(BASE,coins=14000,runs=6,pts=5000,bonus=2,days=['2026-11-20'],av={'shirt':'#e74c3c','pants':'#2b2b2b','hat':'none','own':['#2f80ed','#2b2b2b','none','#e74c3c']},
  cr={'intro':1,'own':{'bobby':{'nick':'','xp':40,'got':1},'hootle':{'nick':'','xp':120,'got':2}},'eggs':[{'r':0,'src':'run','t':1},{'r':1,'src':'run','t':2}],'log':{},'act':'hootle','hints':{}})
problems=[]
def bad(m):problems.append(m);print('PROBLEM',m,flush=True)
# one action of a player who answers correctly; returns what it did
STEP=r"""(()=>{const vis=e=>e&&!e.disabled&&!e.hidden&&e.offsetParent&&e.getBoundingClientRect().width>0;
document.querySelectorAll('.sheet .go,.chestsheet .go,#bhint').forEach(e=>{if(vis(e))e.click()});
if(!sess)return 'nosess';const s=sess.steps[sess.i];if(!s)return 'end';
const nx=document.getElementById('nx');if(vis(nx)){nx.click();return 'next'}
const bub=[...document.querySelectorAll('#main .bub')].filter(vis);if(bub.length){bub[0].click();return 'power'}
const x=s.x,ans=x?[x[0],x[2],A(x)].map(v=>String(v).toLowerCase()):[];
const ws=[...document.querySelectorAll('#main [data-w]')].filter(e=>vis(e)&&!e.classList.contains('done'));
if(ws.length){const w=ws[0];w.click();const m=[...document.querySelectorAll('#main [data-m]')].find(e=>e.dataset.m===w.dataset.w);if(m)m.click();return 'match'}
const os=[...document.querySelectorAll('#main .opt')].filter(vis);
if(os.length){let b=os.find(o=>ans.includes(o.innerText.trim().toLowerCase()));if(!b&&s.t==='tf'){const said=(document.querySelector('#main .q:last-of-type')||{}).innerText||'';b=os.find(o=>o.innerText.trim()===(said.toLowerCase().includes(String(x[2]).toLowerCase())?'True':'False'))}(b||os[0]).click();return 'opt:'+s.t}
const tl=[...document.querySelectorAll('#main .tile')].filter(vis);if(tl.length){for(const c of x[0].toLowerCase()){const t=[...document.querySelectorAll('#main .tile')].find(e=>!e.disabled&&e.innerText===c);if(t)t.click()}const ck=document.getElementById('chk');if(vis(ck))ck.click();return 'tiles'}
const i=document.querySelector('#main input');if(vis(i)){i.value=x[0];const f=i.closest('form');if(f)f.requestSubmit();return 'type'}
if(document.querySelector('#main .runcard'))return 'running';return 'idle'})()"""
def mk(b,W,H,night,seed,rm=True):
    ctx=b.new_context(service_workers='block',viewport={'width':W,'height':H},reduced_motion='reduce' if rm else 'no-preference')
    pg=ctx.new_page()
    pg.add_init_script("if(!sessionStorage.getItem('sd')){localStorage.clear();localStorage.setItem('p6vq3',%s);localStorage.setItem('vq_ed','psle');localStorage.setItem('vb_intro','1');localStorage.setItem('vb_ded','1');localStorage.setItem('vb-dedi-seen','v2');%ssessionStorage.setItem('sd',1)}"%(json.dumps(json.dumps(seed)),"localStorage.setItem('vq_skin','night');" if night else "localStorage.setItem('vq_skin','day');"))
    def route(rt):
        r=rt.fetch();body=r.text().replace("<script>VO_READY.then(()=>{","<script>VO_READY.then(()=>{window.__t=f=>eval(f);",1);rt.fulfill(response=r,body=body)
    pg.route(lambda u:u.endswith(':8123/') or u.endswith('/index.html'),route)
    pg.route('**/api/**',lambda rt:rt.fulfill(status=200,content_type='application/json',body='{}'))
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(1800)
    T=lambda js:pg.evaluate("c=>window.__t(c)",js)
    T("(()=>{const n=%s;if(document.body.classList.contains('night')!==n&&typeof toggleSkin==='function')toggleSkin()})()"%('true' if night else 'false'))
    return ctx,pg,T,errs
def shot(pg,n):
    try:pg.screenshot(path=f'{OUT}/{n}.png')
    except Exception as e:bad(f'screenshot {n}: {e}')
def tappable(T):return T("[...document.querySelectorAll('button,input,a')].some(e=>!e.disabled&&e.offsetParent&&(()=>{const r=e.getBoundingClientRect();return r.width>8&&r.bottom>0&&r.top<innerHeight})())")
def play(pg,T,tag,until_gate=None,max_s=60):
    t0=time.time();last=time.time();seen=set();bossAt=[]
    while time.time()-t0<max_s:
        try:a=T(STEP)
        except Exception as e:bad(f'{tag} step error {e}');break
        if a in('end','nosess'):break
        seen.add(a.split(':')[-1]) if a.startswith('opt') else seen.add(a)
        st=T("({g:sess.gate,b:!!(sess.steps[sess.i]||{}).boss,bid:(sess.steps[sess.i]||{}).bid})")
        if st['b'] and st['bid'] not in [x[1] for x in bossAt]:bossAt.append((st['g'],st['bid']))
        if a!='running' and a!='idle':last=time.time()
        elif a=='idle' and not tappable(T) and time.time()-last>6:bad(f'{tag}: no tappable control >6s at step {T("sess.i")}');break
        if until_gate and (st['g'] or 0)>=until_gate:break
        pg.wait_for_timeout(250 if a=='running' else 120)
    return seen,bossAt
def screens(pg,T,tag):
    for name,js in [('home','home()'),('map','worldmap()'),('creatures','CRE.screen()'),('style','myAvatar()'),('shop','shop()'),('more','(()=>{document.querySelector("#bnav [data-nav=more]").click()})()'),
                    ('badges','badges()'),('board','leaderboard()'),('redeem','redeem()'),('book','book()'),('howto','howto()')]:
        try:T("(()=>{document.querySelectorAll('.storyov,.sheet').forEach(e=>e.remove());%s})()"%js)
        except Exception as e:bad(f'{tag} {name}: {e}');continue
        pg.wait_for_timeout(500);shot(pg,f'{tag}_{name}')
        if not tappable(T):bad(f'{tag} {name}: nothing tappable')
        if name in('creatures','style','shop'):
            if T("!document.querySelector('#main .card')"):bad(f'{tag} {name}: empty screen')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome') if os.path.exists('/usr/bin/google-chrome') else p.chromium.launch()
    VPS=[(390,700),(844,390),(820,1050),(1180,740)]
    for W,H in VPS:
        for night in (False,True):
            for sname,seed in (('fresh',BASE),('old',OLD)):
                if night and sname=='fresh' and (W,H)!=(390,700):continue
                tag=f'{W}x{H}_{"night" if night else "day"}_{sname}'
                ctx,pg,T,errs=mk(b,W,H,night,seed)
                c0=T("S.coins");screens(pg,T,tag)
                if sname=='old':
                    if T("S.coins")<c0:bad(f'{tag}: coins lost on load')
                    if T("(CRE.st().eggs||[]).length")<2:bad(f'{tag}: eggs lost')
                    if not T("!!CRE.st().own.hootle"):bad(f'{tag}: creature lost')
                # run: first gates, then jump to the boss, wrong + right
                T("(()=>{home();start('learn')})()");seen,_=play(pg,T,tag,until_gate=2,max_s=40);shot(pg,f'{tag}_run')
                T("(()=>{const bi=sess.steps.findIndex(z=>z.boss);for(let j=0;j<bi;j++)(sess.done||(sess.done={}))[sess.steps[j].u]=1;sess.i=bi;run()})()")
                pg.wait_for_timeout(3500);shot(pg,f'{tag}_boss')
                if not T("!!(OB.st&&OB.st.boss)"):bad(f'{tag}: boss not drawn')
                play(pg,T,tag+' boss',max_s=12)
                # save & stop -> continue
                T("persist();home()");pg.wait_for_timeout(400)
                if not T("!!document.getElementById('res')"):bad(f'{tag}: no Continue after save&stop')
                else:T("document.getElementById('res').click()");pg.wait_for_timeout(1500)
                # shadow chase
                T("(()=>{S.bonus=Math.max(1,S.bonus||0);sess=null;chase(home)})()");pg.wait_for_timeout(2500);shot(pg,f'{tag}_chase')
                cv=T("(()=>{const c=document.querySelector('canvas.chase,#chase canvas,#main canvas');if(!c)return null;const r=c.getBoundingClientRect();return [r.width,r.height]})()")
                if not cv or cv[0]<200 or cv[1]<150:bad(f'{tag}: Shadow Chase canvas size {cv}')
                T("home()")
                if errs:bad(f'{tag} page errors: {errs[:3]}')
                ctx.close()
    # existing player: egg buy/hatch + feed
    ctx,pg,T,errs=mk(b,390,700,False,OLD)
    T("CRE.screen()");pg.wait_for_timeout(400);shot(pg,'eggs_screen')
    if errs:bad(f'egg screen errors {errs[:3]}')
    ctx.close()
    for pth in ('team.html','account.html','lists.html'):
        ctx=b.new_context(service_workers='block');pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        r=pg.goto(URL+pth);pg.wait_for_timeout(800);shot(pg,'page_'+pth.replace('.html',''))
        if not r or r.status!=200:bad(f'{pth} status {r and r.status}')
        if errs:bad(f'{pth} errors {errs[:2]}')
        ctx.close()
    if LONG:  # real run to gate 31
        ctx,pg,T,errs=mk(b,390,700,False,BASE)
        T("(()=>{home();start('learn')})()");seen,bossAt=play(pg,T,'long',until_gate=31,max_s=420)
        print('long run types',sorted(seen),'bosses',bossAt,flush=True)
        if not any(bid=='m30' for g,bid in bossAt):bad(f'long run: no boss at 30 ({bossAt}, gate {T("sess&&sess.gate")})')
        if not {'meaning','under','blank'}&set(seen):bad(f'long run: few question types {seen}')
        if errs:bad(f'long run errors {errs[:3]}')
        ctx.close()
    b.close()
with open(f'{OUT}/REPORT.md','w') as f:
    f.write('# VocaBobby full check\n\n'+('No problems found.\n' if not problems else '\n'.join('- '+x for x in problems)+'\n'))
print('SMOKE','PASS' if not problems else f'FAIL ({len(problems)})');sys.exit(1 if problems else 0)
