# Magnet regression: run: python3 tests/magnet_test.py
import json
from playwright.sync_api import sync_playwright
import os,mimetypes
from urllib.parse import urlparse
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def serve(rt,patch=None):
    # serves the repo straight from disk (no local server needed); index.html optionally patched
    path=urlparse(rt.request.url).path;f=os.path.join(ROOT,path.lstrip('/') or 'index.html')
    if not os.path.isfile(f):return rt.fulfill(status=404,body='{}',content_type='application/json')
    body=open(f,'rb').read()
    if patch and f.endswith('index.html'):body=patch(body.decode()).encode()
    rt.fulfill(status=200,body=body,content_type=mimetypes.guess_type(f)[0] or 'application/octet-stream')

seed={'lad':{'placed':1,'t':0,'pr':0},'plDone':1,'mig2':1,'seenHow':1,'nick':'Tester','coins':0,'cr':{'intro':1}}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome');pg=b.new_context(service_workers='block').new_page()
    pg.add_init_script("localStorage.clear();localStorage.setItem('p6vq3',%s);localStorage.setItem('vq_ed','psle')"%json.dumps(json.dumps(seed)))
    def route(rt):
        serve(rt,lambda s:s.replace("<script>VO_READY.then(()=>{","<script>VO_READY.then(()=>{window.__t=f=>eval(f);",1))
    pg.route('http://localhost:8123/**',route)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8123/');pg.wait_for_timeout(1500)
    r=pg.evaluate("src=>window.__t('('+src+')()')","""async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));document.querySelectorAll('.sheet,.chestsheet').forEach(e=>e.remove());
      start('learn');await sl(400);const s=OB.st;if(!s)return {err:'no OB.st'};
      s.coins=[];s.crates=[];s.pads=[];s.gaps=[];s.mode='run';s.ground=true;s.ay=0;s.vy=0;s.target=s.ax+3000;s.cb=null;s.paused=false;
      const x=s.ax;
      s.coins.push({x:x+40,y:85,got:false,tag:'above-near'});   // overhead, needs a jump
      s.coins.push({x:x+150,y:100,got:false,tag:'above-far'});
      s.coins.push({x:x+50,y:30,got:false,tag:'low-near'});     // within reach band
      s.coins.push({x:x+150,y:60,got:false,tag:'mid-far'});     // pulled only once within 2 tiles
      s.magnet=4;s.magMax=4;const msgs=[];
      for(let k=0;k<110;k++){await sl(50);if(s.msgT>0&&!msgs.includes(s.msg))msgs.push(s.msg)}
      return {coins:s.coins.map(c=>[c.tag,c.got,Math.round(c.y)]),magnet:s.magnet,msgs,ay:s.ay}}""")
    print(r);print('errors',errs[:3])
    d={c[0]:c[1] for c in r['coins']}
    assert not d['above-near'] and not d['above-far'],'overhead coins collected without jumping'
    assert d['low-near'],'reachable coin not collected'
    assert 'Magnet wore off' in r['msgs']
    print('PASS')
    b.close()
