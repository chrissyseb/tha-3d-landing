// Simulates 200 players (P5-ish, P6 average, P6 strong) in PSLE Kingdom and the main game, old vs new rules.
// Run: node tests/psle-sim.cjs
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');vm.runInThisContext(fs.readFileSync(path.join(root,'psle.js'),'utf8'));
const W=JSON.parse(fs.readFileSync(path.join(root,'words.json'),'utf8')),CW=W.filter(PK.isP),rk=PK.rk;
let seed=7;const rnd=()=>(seed=(seed*1103515245+12345)>>>0)/4294967296,gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=rnd();return u-3};
const sig=z=>1/(1+Math.exp(-z)),shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
// ability model: 4-option item, word level r, ability th, per-word learning bonus
const pKnow=(th,r,b)=>sig(1.6*(th+b-r)+0.9);const p1=(th,r,b,hint)=>.25+.75*Math.min(.98,pKnow(th,r,b)+(hint?.12:0));
const GROUPS=[['P5-ish',1.9],['P6 average',2.5],['P6 strong',3.2]],N=200,PER=[67,67,66];
function psle(th,mode,lv0){const S={lv:lv0,w:{}},bon={},out=[];let walls=0,runsDone=0;const met=new Set();
  for(let run=0;run<8;run++){
    const deck=mode==='old'?shuf(CW).slice(0,30):PK.deck(S,W,CW,{rnd});const pk=mode==='new'?PK.init(S):null;
    const sess={pkN:0,pkOk:0,pkMiss:[],pkHit:[]};let q=0,ok=0,first=0,pq=0,pok=0;
    const ask=(x,boss)=>{const isP=PK.isP(x),b=bon[x[0]]||0,hint=mode==='new'&&isP&&pk.ease>.5&&!boss;let r=rnd()<p1(th,rk(x),b,hint),v=r?1:0;if(r)first++;
      if(!r&&mode==='new'&&isP){const p2=.5+.5*pKnow(th,rk(x),b)*.7;if(rnd()<p2){r=true;v=.5}}
      q++;if(r)ok++;bon[x[0]]=b+(r?.35:.2);if(isP){met.add(x[0]);pq++;if(r)pok++}
      if(mode==='new'){PK.record(pk,v);if(isP){sess.pkN++;sess.pkOk+=v;if(!r)sess.pkMiss.push(x[0]);else if(v===1)sess.pkHit.push(x[0])}}
      if(v===1){const w=S.w[x[0]]||(S.w[x[0]]={m:0});w.m++}return r};
    // learning steps: each word asked ~3 times (blank, meaning/spell, review)
    for(let rep=0;rep<3;rep++)for(const x of deck)ask(x,0);
    // bosses: 2 minis + final
    let wall=0;for(const [hp0,fin] of [[mode==='new'?35:50,0],[mode==='new'?35:50,0],[mode==='new'?45:50,1]]){let tries=0,beat=false;
      while(tries<2&&!beat){let hp=hp0,h=3,sw=0,n=0;while(hp>0&&h>0&&n<40){n++;const x=deck[rnd()*deck.length|0];if(ask(x,1)){hp-=rnd()<.4?15:10;sw++;if(mode==='new'&&sw>=3&&h<3){h++;sw=0}}else{h--;sw=0}}if(hp<=0)beat=true;else{tries++;wall++}}
      }
    walls+=wall;if(mode==='new')PK.endRun(S,sess);out.push({acc:ok/q,first:first/q,pacc:pok/Math.max(1,pq),psleShare:pq/q})}
  return {out,walls,met:met.size,lv:S.pk?S.pk.lv:null}}
function mainGame(th,mode){let lv=Math.max(0,Math.min(5,Math.round(th-.3+gauss()*.4))),hot=0,t=th,accs=[];
  for(let run=1;run<=40;run++){const T=Math.round(lv);let ok=0,n=0;const pb=Math.max(0,Math.min(.6,(lv-1.5)*.4)),psN=mode==='new'?Math.round(8*pb):0;
    for(let i=0;i<50;i++){const u=rnd(),r=u<.7?T:u<.9?T+1:Math.max(0,T-1);if(n<50){ok+=rnd()<p1(t,Math.min(5,r),0)?1:0;n++}}
    const a=ok/n*100;accs.push(a);
    if(mode==='old'){if(a>=85)lv=Math.min(5,lv+.5);else if(a<60)lv=Math.max(0,lv-.5)}
    else{if(a>=90&&hot>=1){lv=Math.min(5,lv+1);hot=0}else if(a>=85){lv=Math.min(5,lv+.5);hot=a>=90?1:0}else{hot=0;if(a>=80)lv=Math.min(5,lv+.25);else if(a<60)lv=Math.max(0,lv-.5)}}
    t+=.03; // gradual real learning
    if(lv>=3)return {runs:run,acc:accs.reduce((x,y)=>x+y,0)/accs.length,lv}}
  return {runs:null,acc:accs.reduce((x,y)=>x+y,0)/accs.length,lv}}
const pct=x=>(x*100).toFixed(0)+'%',avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
console.log('PSLE Kingdom, 8 runs each (acc = correct incl. second tries; first = first-try; walls = boss KOs per player over 8 runs)');
GROUPS.forEach(([g,mu],gi)=>{const R={old:[],new:[]};for(let i=0;i<PER[gi];i++){const th=mu+gauss()*.25,lv0=Math.max(0,Math.round(th-.3));for(const m of ['old','new'])R[m].push(psle(th,m,lv0))}
  for(const m of ['old','new']){const L=R[m],r1=avg(L.map(p=>p.out[0].acc)),r8=avg(L.map(p=>p.out[7].acc)),all=avg(L.flatMap(p=>p.out.map(o=>o.acc))),f=avg(L.flatMap(p=>p.out.map(o=>o.first))),pa=avg(L.flatMap(p=>p.out.map(o=>o.pacc))),sh=avg(L.flatMap(p=>p.out.map(o=>o.psleShare)));
    console.log(`${g.padEnd(11)} ${m}: acc ${pct(all)} (run1 ${pct(r1)}, run8 ${pct(r8)}) first-try ${pct(f)} (run1 ${pct(avg(L.map(p=>p.out[0].first)))}, run8 ${pct(avg(L.map(p=>p.out[7].first)))}) | PSLE-word acc ${pct(pa)} | PSLE share ${pct(sh)} | PSLE words met ${avg(L.map(p=>p.met)).toFixed(0)}/${CW.length} | boss KOs ${avg(L.map(p=>p.walls)).toFixed(1)}`+(m==='new'?` | hidden rung ${avg(L.map(p=>p.lv)).toFixed(2)}`:''))}});
console.log('\nMain game: runs to reach PSLE-word level (estimate >= B2), max 40');
GROUPS.forEach(([g,mu])=>{for(const m of ['old','new']){const L=[];for(let i=0;i<67;i++)L.push(mainGame(mu+gauss()*.25,m));const got=L.filter(z=>z.runs);
  console.log(`${g.padEnd(11)} ${m}: reached ${got.length}/67, median runs ${got.length?got.map(z=>z.runs).sort((a,b)=>a-b)[got.length>>1]:'-'}, mean acc on the way ${avg(L.map(z=>z.acc)).toFixed(0)}%`)}});

// ---------- Main runs (learn/world), old vs adaptive rules: first-try accuracy ----------
// Each run: 50 words; per word ~3 asks (blank, then a meaning/spelling step, plus bosses/review). Spelling steps are harder (+0.6 rung).
// New rules model: context sentence on every question (+0.05 know), auto-open hint while easing (+0.12), easier step types while struggling.
function mainRuns(th,mode,R=10){const S={lv:Math.max(0,Math.min(5,Math.round(th-.3+gauss()*.4))),w:{}},st=n=>S.w[n]||(S.w[n]={m:0}),bon={},out=[];
  for(let run=0;run<R;run++){let pick;
    if(mode==='old'){const t=Math.round(S.lv),fresh=W.filter(x=>!st(x[0]).seen),inT=shuf(fresh.filter(x=>rk(x)===t)),low=shuf(W.filter(x=>rk(x)<t)),over=shuf(fresh.filter(x=>rk(x)===t+1)),sh=shuf(W.filter(x=>rk(x)<=1)).slice(0,10);
      pick=[...new Set([...sh,...inT.slice(0,28),...over.slice(0,8),...low.slice(0,4),...inT.slice(28),...over.slice(8)])].slice(0,50)}
    else pick=PK.mainDeck(S,W,{st,due:[],sh:shuf(W.filter(x=>rk(x)<=1)).slice(0,10),rnd});
    const mk=PK.minit(S),ease=mk.ease;let q=0,first=0;
    const ask=(x,spell)=>{const b=bon[x[0]]||0,hint=mode==='new'&&mk.ease>.5&&!spell,ctx=mode==='new'?.05:0;
      if(mode==='new'&&spell&&ease>.4&&st(x[0]).m<2)spell=false;
      const r=rnd()<p1(th,rk(x)+(spell?.6:0),b+ctx,hint);q++;if(r)first++;bon[x[0]]=b+(r?.35:.2);
      if(r)st(x[0]).m++;if(mode==='new')PK.mrecord(mk,r?1:0);return r};
    for(const x of pick){st(x[0]).seen=1;ask(x,0);ask(x,rnd()<.45);if(rnd()<.6)ask(x,rnd()<.3)}
    const a=first/q;out.push(a);
    if(mode==='old'){const accR=a*100;if(accR>=90&&(S.lvHot||0)>=1){S.lv=Math.min(5,S.lv+1);S.lvHot=0}else if(accR>=85){S.lv=Math.min(5,S.lv+.5);S.lvHot=accR>=90?1:0}else{S.lvHot=0;if(accR>=80)S.lv=Math.min(5,S.lv+.25);else if(accR<60)S.lv=Math.max(0,S.lv-.5)}}
    else PK.mainEnd(S,Math.round(a*100));if(process.env.DBG)console.log(run,(a*100|0),S.lv,PK.minit(S).ease.toFixed(2),pick.filter(x=>rk(x)>=3).length)}
  return out}
console.log('\nMain runs, 10 runs each: first-try accuracy (all runs / run 1 / run 10)');
[['P5 weaker',1.5],...GROUPS].forEach(([g,mu])=>{for(const m of ['old','new']){const L=[];for(let i=0;i<67;i++)L.push(mainRuns(mu+gauss()*.25,m));
  console.log(`${g.padEnd(11)} ${m}: first-try ${pct(avg(L.flat()))} (run1 ${pct(avg(L.map(o=>o[0])))}, run10 ${pct(avg(L.map(o=>o[9])))})`)}});
