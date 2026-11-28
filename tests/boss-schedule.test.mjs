// Regression: bosses at gates 10/20/30/40 and the final boss at the end, on fresh runs and after
// Save & stop / Continue (JSON round trip) at every stage boundary and at random points, including old saves.
// Run: node tests/boss-schedule.test.mjs
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const grab=re=>{const m=html.match(re);if(!m)throw new Error('source not found: '+re);return m[0]};
const src=grab(/function gateOf\(z\)\{[^\n]*/)+'\n'+grab(/function bossDue\(z\)\{[\s\S]*?\n\/\/ ---------- run ----------/);
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let sess;const api=new Function('shuf','getS',src.replace(/\bsess\b/g,'getS()')+';\nreturn {bossDue,gateOf}')(shuf,()=>sess);
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.error('FAIL',m)}};
function newRun(N=50,kind='learn'){const words=Array.from({length:N},(_,k)=>['w'+k]),steps=[];let u=0;
  for(let i=0;i<N;i+=5){const g=words.slice(i,i+5);g.forEach(x=>steps.push({t:'intro',n:x[0]}));steps.push({t:'match',ns:g.map(x=>x[0])});g.forEach(x=>steps.push({t:'blank',n:x[0]}));g.forEach(x=>steps.push({t:'meaning',n:x[0]}));
    if((i+5)%10===0&&i+5<N)g.forEach(x=>steps.push({t:'under',n:x[0],boss:1,bid:'m'+(i+5)}))}
  for(let k=0;k<16;k++)steps.push({t:'spell',n:'w'+k,boss:1,bid:'final',giant:1});steps.forEach(s=>s.u=++u);
  return {kind,words,steps,i:0,gate:0,uc:u,done:{}}}
const rt=z=>JSON.parse(JSON.stringify(z));
function play(z,{acc=.75,resume=()=>false,dropBoss=false}={}){sess=z;const seen=[];let guard=0;
  while(guard++<5000){
    while(sess.i<sess.steps.length&&sess.done[sess.steps[sess.i].u])sess.i++;
    api.bossDue(sess);sess.steps.forEach(t=>{if(t.u==null)t.u=sess.uc=(sess.uc||0)+1});
    if(sess.bossOn){const s0=sess.steps[sess.i];if(!s0||s0.bid!==sess.bid)sess.steps.splice(sess.i,0,{t:'meaning',n:'w0',boss:1,bid:sess.bid,u:sess.uc=(sess.uc||0)+1})} // addBossStep
    const s=sess.steps[sess.i];if(!s)break;sess.gate=Math.max(sess.gate,api.gateOf(s));
    if(s.boss){if(!sess.bossOn){seen.push([s.bid,sess.gate]);sess.bossOn=1;sess.bid=s.bid}
      if(Math.random()<.3){sess.done[s.u]=1;sess.i++;continue}
      (sess.bdone||(sess.bdone=[])).push(s.bid);const b=s.bid;sess.steps=sess.steps.filter((t,k)=>k<=sess.i||t.bid!==b);sess.bossOn=0;if(b==='final')sess.beatFinal=1;sess.i++;
      if(resume('boss',b)){sess=rt(sess)}continue}
    sess.done[s.u]=1;
    if(!(s.t==='intro'||s.t==='match'||Math.random()<acc))sess.steps.splice(Math.min(sess.i+4,sess.steps.length),0,{t:'meaning',n:s.n});
    sess.i++;
    if(dropBoss&&Math.random()<.05){const k=sess.steps.findIndex((t,j)=>j>=sess.i&&t.boss&&t.bid!=='final');if(k>=0){const b=sess.steps[k].bid;sess.steps=sess.steps.filter(t=>t.bid!==b)}}
    if(resume('q')){sess=rt(sess)}}
  return seen}
const want=N=>[...Array.from({length:Math.ceil(N/10)-1},(_,k)=>'m'+(k+1)*10),'final'];
const check=(got,N,m)=>{ok(JSON.stringify(got.map(x=>x[0]))===JSON.stringify(want(N)),m+' order '+JSON.stringify(got));got.forEach(([b,g])=>{if(b!=='final')ok(g===+b.slice(1),m+' '+b+' at gate '+g)})};
for(let r=0;r<200;r++){
  check(play(newRun()),50,'fresh');
  check(play(newRun(),{acc:.4}),50,'struggling');
  check(play(newRun(),{resume:(w,b)=>w==='boss'&&b==='m20'}),50,'save & stop after stage 2, continue to 30+');
  check(play(newRun(),{resume:w=>w==='boss'}),50,'continue from every stage boundary');
  check(play(newRun(),{resume:()=>Math.random()<.1}),50,'reload at random points');
  check(play(newRun(),{dropBoss:true}),50,'boss steps lost from the plan are re-created');
  check(play(newRun(30,'challenge')),30,'PSLE Kingdom 30-gate run');}
console.log(fail?fail+' failures':'boss schedule: all passed');process.exit(fail?1:0);
