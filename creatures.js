/* VocaBobby creatures, story, navigation, hints and dedication.
   Talks to the game through window.VBH (set inside index.html). All copy lives in STR (index.html). */
(function(){
const H=()=>window.VBH,T=()=>H().STR.cr,S=()=>H().S(),$=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const today=()=>new Date().toDateString();
// id, rarity (0 Common,1 Rare,2 Epic,3 Legendary,4 Supporter), egg pool
const LIST=[['bobby',0,0],['hootle',0,1],['inkoo',0,1],['snailbet',0,1],['crab',0,1],['lexi',1,1],['pagewing',1,1],['echobat',1,1],['glyphin',2,1],['syntaxolotl',2,1],['lexicorn',3,1],['rex',3,1],['phoenix',4,0]];
const R=id=>(LIST.find(x=>x[0]===id)||[id,0])[1];
const RCOL=['#3FABE7','#3FABE7','#B15FD7','#FFB23F','#FF8A3D'];
const EVO=[0,12,36],EGG_PRICE=600,FEEDS=5;
const name=id=>(T().names[id]||[id])[0];
function st(){const s=S();if(!s.cr)s.cr={eggs:[],own:{},act:'bobby',log:{},hints:{}};const c=s.cr;c.eggs=c.eggs||[];c.own=c.own||{};c.log=c.log||{};c.hints=c.hints||{};if(!c.own.bobby)c.own.bobby={nick:'',xp:0,got:Date.now()};if(!c.act||!c.own[c.act])c.act='bobby';return c}
const save=()=>H().save();
// ---------------- init + migration ----------------
function init(){const s=S(),c=st();
 if(!c.mig){c.mig=1;
  // old coin-bought pets: every pet a child already had becomes an egg of the same rarity, so nothing is lost
  (s.pets||[]).forEach(i=>{const P=H().PETS[i];if(!P)return;if(i===13){c.own.phoenix=c.own.phoenix||{nick:'',xp:0,got:Date.now()};return}c.eggs.push({r:Math.min(3,P[1]),src:'old',t:Date.now()})});
  c.log.mast=Math.floor(mastered()/10)*10;c.log.tw=s.teamWins||0;c.log.giant=s.giants||0;save()}
 if(s.sup==='20'&&!c.own.phoenix){c.own.phoenix={nick:'',xp:0,got:Date.now()};save()}
 // Team Up wins happen on team.html: each new win brings a Rare egg back here
 const tw=s.teamWins||0;if(tw>(c.log.tw||0)){for(let i=c.log.tw||0;i<tw;i++)give(1,'team',1);c.log.tw=tw;save()}
}
function mastered(){const s=S();let m=0;for(const k in s.w){const v=s.w[k];if(v&&(v.m||0)>=2&&v.sp)m++}return m}
// ---------------- eggs: earned by learning ----------------
function give(r,src,quiet){const c=st();c.eggs.push({r,src,t:Date.now()});save();
 if(!quiet){const t=T();toast(`${CRA.egg(r,34,{noGlow:1})}<span><b>${t.eggFound(t.rar[r])}</b><small>${esc(t.src[src]||'')}</small></span>`,r)}
 updateNav()}
function toast(html,r){const d=document.createElement('div');d.className='crtoast r'+(r||0);d.setAttribute('role','status');d.innerHTML=html;document.body.appendChild(d);
 H().buzz(r>=1?[20,40,20,40,60]:[15,30,15]);try{H().sfx('star')}catch(e){}setTimeout(()=>d.classList.add('out'),3200);setTimeout(()=>d.remove(),3700)}
const ev={
 mastered(word){const c=st(),m=mastered(),last=c.log.mast||0,step=Math.floor(m/10)*10;
  // XP for the creature that's with you
  const o=c.own[c.act];if(o){o.xp=(o.xp||0)+3}
  if(step>last&&step>0){c.log.mast=step;const r=step%150===0?3:step%50===0?2:step%25===0?1:0;if(step%10===0||r)give(r,'mastery')}
  save()},
 boss(o){const c=st(),s=S();o=o||{};
  if(o.giant){const g=(c.log.giantE||0)+1;c.log.giantE=g;give(g%3===0?3:2,'giant')}
  else if(o.final)give(1,'land');else give(0,'boss')},
 first(){give(1,'first',1)},
 daily(n){const c=st();const wk=weekKey();if(n===3&&c.log.d3!==wk){c.log.d3=wk;give(0,'daily')}if(n>=7&&c.log.d7!==wk){c.log.d7=wk;give(1,'daily')}},
 side(game,score,best){const c=st(),th={chase:40,sprint:5,speed:8}[game]||5;if(score<th)return;const k='sq_'+game;if(c.log[k]===today())return;c.log[k]=today();give(best&&score>=th*2?1:0,'side')}
};
function weekKey(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.toDateString()}
// pick which creature hatches: rarity is fixed by how the egg was earned; inside a rarity, new ones first, then an equal chance
function pickFor(r){const c=st(),pool=LIST.filter(x=>x[2]&&x[1]===r).map(x=>x[0]),fresh=pool.filter(id=>!c.own[id]);const p=fresh.length?fresh:pool;return p[Math.floor(Math.random()*p.length)]}
// ---------------- the hatch moment ----------------
function hatch(i,after){const c=st(),e=c.eggs[i];if(!e)return;c.eggs.splice(i,1);const id=pickFor(e.r),dup=!!c.own[id];
 if(dup){c.own[id].xp=(c.own[id].xp||0)+6;S().coins+=50}else c.own[id]={nick:'',xp:0,got:Date.now(),from:e.src};save();
 const t=T(),r=e.r,d=document.createElement('div');d.className='hatchov r'+r;d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',t.hatching);
 d.innerHTML=`<div class="hrays" aria-hidden="true"></div><div class="hflash" aria-hidden="true"></div><div class="hwrap"><div class="hegg">${CRA.egg(r,170)}</div><p class="htap">${t.tapEgg}</p><button class="hskip" type="button">${t.skip}</button></div>`;
 document.body.appendChild(d);document.body.classList.add('noscroll');
 let n=0,done=false,timer=0;const eg=d.querySelector('.hegg'),tap=d.querySelector('.htap');
 const crack=()=>{if(done)return;n++;eg.innerHTML=CRA.egg(r,170,{crack:n});eg.classList.remove('wob');void eg.offsetWidth;eg.classList.add('wob','w'+n);H().buzz([12,30,12+n*10]);try{H().sfx('pop')}catch(e){}clearTimeout(timer);if(n>=3)setTimeout(burst,RM()?0:520);else timer=setTimeout(crack,900)};
 const burst=()=>{if(done)return;done=true;d.classList.add('burst');H().buzz([40,50,40,50,40,90,120]);try{H().chime();H().sfx('win')}catch(e){}
  if(!RM()){const b=eg.getBoundingClientRect();H().shatter(b.left+b.width/2,b.top+b.height/2,['#fff','#FFE45C',RCOL[r],'#7D82DE']);H().confetti(r>=2?260:r===1?160:80)}
  setTimeout(reveal,RM()?0:650)};
 const reveal=()=>{const o=c.own[id];d.classList.add('shown');
  d.querySelector('.hwrap').innerHTML=`<div class="hban r${r}"><span>${esc(t.rar[r])}</span></div><div class="hcr">${CRA.svg(id,0,200,{cls:'idle'})}</div>
  <div class="hname">${dup?esc(t.dupTitle(name(id))):esc(t.newTitle(name(id)))}</div><p class="hsub">${esc(dup?t.dupSub:t.blurb[id]||'')}</p>
  ${dup?'':`<label class="hlab" for="hnick">${t.nameIt}</label><input id="hnick" class="inp" maxlength="14" autocomplete="off" placeholder="${esc(name(id))}">`}
  <div class="hrow"><button class="go" id="hact">${t.takeIt}</button><button class="go soft" id="hok">${t.done}</button></div>`;
  const fin=act=>{const v=$('hnick')&&$('hnick').value.trim();if(v&&/^[\p{L}\p{N} '\-]{1,14}$/u.test(v))o.nick=v;if(act)c.act=id;save();d.remove();document.body.classList.remove('noscroll');updateNav();(after||screen)()};
  $('hact').onclick=()=>fin(1);$('hok').onclick=()=>fin(0);($('hnick')||$('hok')).focus()};
 eg.onclick=crack;tap.onclick=crack;d.querySelector('.hskip').onclick=()=>{clearTimeout(timer);n=3;eg.innerHTML=CRA.egg(r,170,{crack:3});burst()};
 if(RM()){tap.hidden=true;setTimeout(burst,300)}else timer=setTimeout(crack,700);
}
// ---------------- evolution ----------------
function stageOf(id,o){if(id==='bobby')return H().bobbyStage();const x=o.xp||0;return x>=EVO[2]?2:x>=EVO[1]?1:0}
function checkEvo(after){const c=st();for(const id in c.own){if(id==='bobby')continue;const o=c.own[id],s=stageOf(id,o);if(s>(o.st||0)){o.st=s;save();evolve(id,s-1,s,after);return true}}return false}
function evolve(id,from,to,after){const t=T(),bob=id==='bobby',d=document.createElement('div');d.className='hatchov evo';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
 const art=s=>bob?BOB.full({stage:s,size:170,expr:'cheer'}):CRA.svg(id,s,200);
 d.innerHTML=`<div class="hrays" aria-hidden="true"></div><div class="hflash" aria-hidden="true"></div><div class="hwrap"><p class="htap">${esc(t.evoStart(nick(id)))}</p><div class="hcr evoart">${art(from)}</div></div>`;
 document.body.appendChild(d);H().buzz([20,40,20,40,20,40,90]);try{H().sfx('star')}catch(e){}
 const a=d.querySelector('.evoart');if(!RM())a.classList.add('glowing');
 setTimeout(()=>{d.classList.add('burst');try{H().chime()}catch(e){}if(!RM()){const b=a.getBoundingClientRect();H().shatter(b.left+b.width/2,b.top+b.height/2,['#fff','#FFE45C','#B15FD7','#3FABE7']);H().confetti(160)}
  a.classList.remove('glowing');a.innerHTML=art(to);d.classList.add('shown');
  d.querySelector('.hwrap').insertAdjacentHTML('beforeend',`<div class="hname">${esc(t.evoDone(nick(id),bob?BOB.OUTFITS[to]:t.stages[to]))}</div><p class="hsub">${esc(bob?t.bobOutfit:t.evoSub)}</p><button class="go" id="evok">${t.yay}</button>`);
  d.querySelector('.htap').remove();$('evok').focus();$('evok').onclick=()=>{d.remove();after&&after()}},RM()?200:1700)}
const nick=id=>{const o=st().own[id];return (o&&o.nick)||name(id)};
// ---------------- feeding (never hunger, never punishment) ----------------
function feed(id){const c=st(),o=c.own[id],s=S(),t=T(),td=today();o.fed=o.fed&&o.fed.d===td?o.fed:{d:td,n:0,w:[]};
 if(o.fed.n>=FEEDS){H().pop(t.full(nick(id)));return null}
 const learnt=Object.keys(s.w).filter(w=>((s.w[w].m||0)>=1||s.w[w].seen)&&!o.fed.w.includes(w));
 if(!learnt.length){H().pop(t.noWords);return null}
 const w=learnt[Math.floor(Math.random()*learnt.length)];o.fed.n++;o.fed.w.push(w);o.xp=(o.xp||0)+1;save();H().buzz([10,30,10]);try{H().sfx('star')}catch(e){}return w}
// ---------------- screens ----------------
function screen(){const h=H();h.leave();const c=st(),t=T(),m=h.main,found=LIST.filter(x=>x[1]<4&&c.own[x[0]]).length,total=LIST.filter(x=>x[1]<4).length;
 const eggs=c.eggs.map((e,i)=>`<button class="eggbtn r${e.r}" data-egg="${i}" aria-label="${esc(t.hatchA(t.rar[e.r]))}">${CRA.egg(e.r,64)}<small>${esc(t.rar[e.r])}</small></button>`).join('');
 m.innerHTML=`<div class="card crscreen"><span class="tag">${t.title}</span><div class="word" style="font-size:clamp(26px,6vw,36px)">${t.dexTitle}</div><p class="crcount">${t.found(found,total)}</p>
 <div class="eggbox"><b class="crh">${t.yourEggs}</b>${eggs?`<div class="eggrow">${eggs}</div>`:`<p class="crmut">${t.noEggs}</p>`}
 <div class="crbtns"><button class="go soft" id="einfo">${t.eggInfo}</button><button class="go soft" id="ebuy" ${S().coins<EGG_PRICE?'aria-disabled="true"':''}>${t.buy(EGG_PRICE)}</button></div></div>
 <div class="dex">${LIST.filter(x=>x[1]<4||c.own[x[0]]).map(([id,r])=>{const o=c.own[id];return o?`<button class="dexc r${r} ${c.act===id?'act':''}" data-cr="${id}">${CRA.svg(id,stageOf(id,o),88,{bobbyStage:H().bobbyStage()})}<b>${esc(nick(id))}</b><small>${esc(t.rar[r])}${c.act===id?' · '+t.withYou:''}</small></button>`:`<div class="dexc sil r${r}" aria-label="${esc(t.notFound(t.rar[r]))}">${CRA.svg(id,0,88,{sil:1})}<b>???</b><small>${esc(t.rar[r])}</small></div>`}).join('')}</div></div>`;
 m.querySelectorAll('[data-egg]').forEach(b=>b.onclick=()=>hatch(+b.dataset.egg));
 m.querySelectorAll('[data-cr]').forEach(b=>b.onclick=()=>detail(b.dataset.cr));
 $('einfo').onclick=eggInfo;$('ebuy').onclick=()=>{if(S().coins<EGG_PRICE){h.pop(t.needCoins(EGG_PRICE-S().coins));return}S().coins-=EGG_PRICE;give(0,'shop',1);h.hud();screen()};
 nav('cr');if(!checkEvo(screen))hint(c.eggs.length?'eggs':'creatures')}
function detail(id){const c=st(),o=c.own[id],t=T(),h=H(),r=R(id),s=stageOf(id,o),bob=id==='bobby';
 let prog='';if(bob){const g=h.bobbyGrowth(),nx=h.BOBBY_AT[s+1];prog=`<p class="crmut">${esc(t.bobOutfitNow(BOB.OUTFITS[s]))}</p>${nx!=null?`<div class="evobar"><i style="width:${Math.min(100,Math.round(g.pts/nx*100))}%"></i></div><p class="crmut">${esc(t.bobNext(nx-g.pts,BOB.OUTFITS[s+1]))}</p>`:''}`}
 else{const nx=EVO[s+1];prog=`<p class="crmut">${esc(t.formNow(t.stages[s]))}</p>${nx!=null?`<div class="evobar"><i style="width:${Math.min(100,Math.round((o.xp||0)/nx*100))}%"></i></div><p class="crmut">${esc(t.evoNext(Math.ceil((nx-(o.xp||0))/3),t.stages[s+1]))}</p>`:`<p class="crmut">${t.maxed}</p>`}`}
 h.main.innerHTML=`<div class="card crdetail r${r}"><button class="back" id="cb">‹ ${t.back}</button><div class="crbig" id="crb">${bob?BOB.full({stage:s,size:150}):CRA.svg(id,s,190)}<div class="hearts" id="hts"></div></div>
 <div class="word" style="font-size:clamp(26px,6vw,36px)">${esc(nick(id))}</div><p class="crsp"><span class="rchip r${r}">${esc(t.rar[r])}</span> ${esc((T().names[id]||[])[1]||'')}</p><p class="hsub">${esc(t.blurb[id]||'')}</p>${prog}
 <div class="crbtns"><button class="go" id="cact" ${c.act===id?'aria-pressed="true"':''}>${c.act===id?t.withYouNow:t.takeIt}</button><button class="go soft" id="cfeed">${t.feed}</button><button class="go soft" id="cren">${t.rename}</button></div><p class="crmut" id="fedmsg" aria-live="polite"></p></div>`;
 $('cb').onclick=screen;$('cact').onclick=()=>{c.act=id;save();H().pop(t.joined(nick(id)));detail(id)};
 $('cfeed').onclick=()=>{const w=feed(id);if(!w)return;$('fedmsg').textContent=t.yum(nick(id),w);const a=$('crb').querySelector('svg');if(a&&!RM()){a.classList.remove('happy');void a.getBoundingClientRect();a.classList.add('happy')}
  const hs=$('hts');if(!RM()){hs.innerHTML='<i>💗</i><i>✨</i><i>💗</i>';setTimeout(()=>hs.innerHTML='',1200)}if(!bob)checkEvo(()=>detail(id))};
 $('cren').onclick=()=>{const v=prompt(t.nameIt,o.nick||name(id));if(v==null)return;const x=v.trim();if(!x){o.nick='';save();return detail(id)}if(!/^[\p{L}\p{N} '\-]{1,14}$/u.test(x)){H().pop(t.badName);return}o.nick=x;save();detail(id)};
 nav('cr')}
function eggInfo(){const t=T(),d=document.createElement('div');d.className='sheet';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',t.eggInfo);
 const per=r=>{const p=LIST.filter(x=>x[2]&&x[1]===r);return `<li class="r${r}">${CRA.egg(r,40,{noGlow:1})}<div><b>${esc(t.rar[r])} egg</b><small>${esc(t.how[r])}</small><small>${esc(t.odds(p.length,p.map(x=>name(x[0]))))}</small></div></li>`};
 d.innerHTML=`<div class="sheetc"><b class="sht">${t.eggInfo}</b><p class="crmut">${t.infoTop}</p><ul class="einfo">${[0,1,2,3].map(per).join('')}</ul><p class="crmut">${t.infoFair}</p><button class="go" id="eix">${H().STR.close}</button></div>`;
 document.body.appendChild(d);const x=()=>d.remove();$('eix').onclick=x;d.onclick=e=>{if(e.target===d)x()};$('eix').focus()}
// ---------------- creature in the run (canvas follower) ----------------
const IMG={};function cimg(id,s){const k=id+s;if(IMG[k])return IMG[k];const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(CRA.svg(id,s,64).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));IMG[k]=i;return i}
// Companion runs beside the avatar. Visible art ~40 units tall (~68% of the 58-unit avatar), so it reads on a 390px phone.
// Personality: a signature idle per species, a celebration on correct, a gentle reaction on wrong (Bobby throws a rope),
// and the odd spontaneous moment (butterfly chase, presenting a word token). Reduced motion: no hops/flips/bobs, cues stay.
const ELEM={bobby:'fire',phoenix:'fire',rex:'fire',inkoo:'water',crab:'water',glyphin:'water',syntaxolotl:'water',lexi:'zap',echobat:'zap',hootle:'wind',pagewing:'wind',snailbet:'leaf',lexicorn:'star'};
const IDLE={bobby:'wag',hootle:'blink',inkoo:'float',snailbet:'peek',crab:'side',lexi:'spin',pagewing:'flap',echobat:'float',glyphin:'arc',syntaxolotl:'wiggle',lexicorn:'prance',rex:'stomp',phoenix:'float'};
let RX=null,PRE=0,SP={next:0,k:'',t0:0};
function react(k){RX={k,t0:performance.now()}}
const DUR={ok:700,bad:1300,flip:900};
function star(g,x,y,z){g.beginPath();g.moveTo(x,y-z*1.6);g.lineTo(x+z*.5,y-z*.5);g.lineTo(x+z*1.6,y);g.lineTo(x+z*.5,y+z*.5);g.lineTo(x,y+z*1.6);g.lineTo(x-z*.5,y+z*.5);g.lineTo(x-z*1.6,y);g.lineTo(x-z*.5,y-z*.5);g.closePath();g.fill();g.stroke()}
function followerPos(ax,ay){return{x:ax-44,y:ay-24}}
function drawFollower(g,ax,ay,t,running,rm,s){const c=st(),id=c.act,o=c.own[id];if(!o)return;
 if(!PRE&&id==='bobby'){PRE=1;const bs=H().bobbyStage();['excited','sorry','cheer'].forEach(e=>['stand','hop','runA','runB'].forEach(p=>BOB.img(bs,p,e)))}
 const now=performance.now(),re=RX&&now-RX.t0<DUR[RX.k]?RX:null,k=re?(now-re.t0)/DUR[re.k]:0,ink='#241B4B';
 // spontaneous moments, only while calmly running and not reacting
 if(!SP.next)SP.next=now+9000+Math.random()*8000;
 if(!SP.k&&!re&&running&&now>SP.next){SP.k=Math.random()<.5&&!rm?'fly':'token';SP.t0=now}
 const sk=SP.k?(now-SP.t0)/2600:0;if(SP.k&&sk>=1){SP.k='';SP.next=now+14000+Math.random()*10000}
 const idle=IDLE[id]||'wag',ph=t*(running?9:3);
 let bounce=rm?0:Math.abs(Math.sin(ph))*(running?4:2),dx=0,rot=0,sx=1;
 if(!rm){if(idle==='float'||idle==='flap')bounce=6+Math.sin(t*4)*4;if(idle==='side')dx=Math.sin(t*3)*3;if(idle==='spin'&&(t%5)<.5)sx=Math.cos((t%5)/.5*Math.PI*2);if(idle==='wiggle')rot=Math.sin(t*6)*.08;if(idle==='prance')bounce=Math.abs(Math.sin(ph*.5))*7;if(idle==='stomp')bounce=Math.max(0,Math.sin(ph*.7))*3}
 if(SP.k==='fly'&&!rm)dx+=Math.sin(sk*Math.PI)*22;
 const hop=re&&(re.k==='ok'||re.k==='flip')&&!rm?Math.sin(Math.min(1,k/.7)*Math.PI)*(re.k==='flip'?24:16):0;
 if(re&&re.k==='flip'&&!rm)rot=Math.min(1,k/.7)*-Math.PI*2;
 const cx=ax-44+dx,base=ay-bounce-hop;
 g.fillStyle='rgba(15,18,48,.2)';g.beginPath();g.ellipse(cx,ay+1,15-hop*.3,3.5,0,0,7);g.fill();
 g.save();g.translate(cx,base-22);if(rot)g.rotate(rot);if(sx!==1)g.scale(sx,1);
 if(id==='bobby'){const ex=re&&re.k==='bad'?'sorry':re?'excited':SP.k?'excited':'happy',pose=re&&re.k!=='bad'?'hop':running&&!rm?(Math.sin(t*14)>0?'runA':'runB'):'stand';
  const bs=H().bobbyStage();let im=BOB.img(bs,pose,ex);if(!(im.complete&&im.naturalWidth))im=BOB.img(bs,'stand');if(im.complete&&im.naturalWidth)g.drawImage(im,-17,-25,33,47)}
 else{const im=cimg(id,stageOf(id,o));if(im.complete&&im.naturalWidth)g.drawImage(im,-25,-26,50,50)}
 g.restore();
 // wrong answer: puzzled "?" (never a punishment); Bobby throws a rope to pull the avatar back
 if(re&&re.k==='bad'){
  if(id==='bobby'&&s&&s.mode==='fall'){const px=ax,py=ay+(s.ay||0)-30;g.strokeStyle='#C98A4B';g.lineWidth=2.5;g.beginPath();g.moveTo(cx+10,base-24);g.quadraticCurveTo((cx+px)/2,Math.max(base,py)+18,px,py);g.stroke();g.fillStyle='#C98A4B';g.beginPath();g.arc(px,py,3.5,0,7);g.fill()}
  else{g.fillStyle='#fff';g.strokeStyle=ink;g.lineWidth=1.5;g.beginPath();g.arc(cx+20,base-46,8,0,7);g.fill();g.stroke();g.fillStyle=ink;g.font='800 12px Fredoka,sans-serif';g.textAlign='center';g.fillText(id==='bobby'?'!':'?',cx+20,base-42)}}
 // celebration sparkles
 if(re&&re.k!=='bad'){g.save();g.globalAlpha=Math.max(0,1-k);g.fillStyle='#FFE45C';g.strokeStyle=ink;g.lineWidth=1.2;
  for(let i=0;i<(re.k==='flip'?7:5);i++){const ang=i*(6.283/(re.k==='flip'?7:5))+.4,r=rm?24:16+k*16;star(g,cx+Math.cos(ang)*r,base-24+Math.sin(ang)*r*.8,rm?3.5:3.5+Math.sin(k*Math.PI)*1.5)}g.restore()}
 // spontaneous: butterfly to chase, or proudly hold up a word token
 if(SP.k==='fly'){const bx=cx+30+Math.sin(sk*9)*10,by=base-50+Math.cos(sk*13)*6,w=Math.abs(Math.sin(t*20))*5+1;g.fillStyle='#FF7AA8';g.strokeStyle=ink;g.lineWidth=1;g.beginPath();g.ellipse(bx-w*.7,by,w,4,0,0,7);g.ellipse(bx+w*.7,by,w,4,0,0,7);g.fill();g.stroke()}
 if(SP.k==='token'){const a=Math.min(1,sk*4,(1-sk)*4),ty=base-52-(rm?0:Math.sin(Math.min(1,sk*3)*Math.PI/2)*4);g.save();g.globalAlpha=a;g.fillStyle='#FFE45C';g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(cx-14,ty-9,28,16,5):g.rect(cx-14,ty-9,28,16);g.fill();g.stroke();g.fillStyle=ink;g.font='800 10px Fredoka,sans-serif';g.textAlign='center';g.fillText('ABC',cx,ty+3);g.restore()}
}
// ---------------- bottom nav ----------------
const NI={home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14"/>',cr:'<path d="M12 3c4 0 7 6 7 10a7 7 0 0 1-14 0c0-4 3-10 7-10z"/>',av:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7z"/>',more:'<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>'};
function navHTML(){const t=T(),c=st();return `<nav class="bnav" id="bnav" aria-label="${t.navLabel}">${[['home',t.nav[0]],['map',t.nav[1]],['cr',t.nav[2]],['av',t.nav[3]],['more',t.nav[4]]].map(([k,l])=>`<button data-nav="${k}" type="button"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${NI[k]}</svg><span>${l}</span>${k==='cr'&&c.eggs.length?`<i class="nbadge" aria-label="${c.eggs.length}">${c.eggs.length}</i>`:''}</button>`).join('')}</nav>`}
function updateNav(){const n=$('bnav');if(!n)return;const cur=n.dataset.cur;n.outerHTML=navHTML();wireNav();nav(cur)}
function wireNav(){const n=$('bnav');n.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{const k=b.dataset.nav,h=H();H().buzz(10);({home:h.home,map:h.worldmap,cr:screen,av:h.myAvatar,more})[k]()})}
function nav(k){let n=$('bnav');if(!n){document.body.insertAdjacentHTML('beforeend',navHTML());wireNav();n=$('bnav')}n.dataset.cur=k||'';n.querySelectorAll('[data-nav]').forEach(b=>{const on=b.dataset.nav===k;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});document.body.classList.add('hasnav')}
// ---------------- More ----------------
function more(){const h=H();h.leave();const t=T(),s=S();
 const row=(id,ico,b,sm)=>`<button class="sec" id="${id}"><span class="ico">${h.ic(ico)}</span><span class="lbl"><b>${b}</b><small>${sm}</small></span></button>`;
 h.main.innerHTML=`<div class="card"><span class="tag">${t.nav[4]}</span><div class="menu">
 <p class="wmk"><b>${t.mLearn}</b></p>${row('mrev','review',t.mRev,t.mRevS(h.dueN()))}${row('mfix','fix',t.mFix,t.mFixS)}${row('mbook','book',t.mBook,t.mBookS)}
 <p class="wmk"><b>${t.mMe}</b></p>${row('mbdg','medal',t.mBadges,t.mBadgesS((s.badges||[]).length,h.BADGES.length))}${row('mlb','trophy',t.mBoard,t.mBoardS)}
 <p class="wmk"><b>${t.mHelp}</b></p>${row('mstory','book',t.mStory,t.mStoryS)}${row('mhow','help',t.mHow,t.mHowS)}
 <p class="wmk"><b>${t.mSet}</b></p>${row('mvib','bolt',t.mVib(h.VIBON()),t.mVibS)}${row('mskin','star',t.mSkin(document.body.classList.contains('night')),t.mSkinS)}
 ${row('mabout','help',t.mAbout,t.mAboutS)}<a class="sec" href="/account.html"><span class="ico">${h.ic('lock')}</span><span class="lbl"><b>${t.mAcc}</b><small>${t.mAccS}</small></span></a></div></div>`;
 $('mrev').onclick=()=>h.start('rev');$('mfix').onclick=()=>h.start('fix');$('mbook').onclick=h.book;$('mbdg').onclick=h.badges;$('mlb').onclick=h.leaderboard;$('mstory').onclick=()=>story(more);$('mhow').onclick=h.howto;
 $('mvib').onclick=()=>{h.setVib(!h.VIBON());h.buzz(30);more()};$('mskin').onclick=()=>{h.toggleSkin();more()};$('mabout').onclick=about;
 nav('more');hint('more')}
// ---------------- story intro (skippable, 3 cards) ----------------
function story(after){const t=T(),cards=t.story;let i=0;const d=document.createElement('div');d.className='storyov';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',t.storyLabel);document.body.appendChild(d);
 const pics=[`<div class="spic"><svg viewBox="0 0 200 120" width="220" aria-hidden="true"><g font-family="Fredoka,sans-serif" font-weight="700" fill="#7D82DE">${['brave','calm','vivid','swift','curious','gleam'].map((w,k)=>`<text x="${20+k*30}" y="${30+(k%3)*30}" font-size="15" transform="rotate(${k*17-40} ${20+k*30} ${30+(k%3)*30})">${w}</text>`).join('')}</g></svg>${CRA.egg(0,54,{noGlow:1})}${CRA.egg(1,54,{noGlow:1})}${CRA.egg(2,54,{noGlow:1})}</div>`,
  `<div class="spic">${BOB.full({stage:0,size:96,pose:'runA',expr:'excited'})}<div class="sgate">${esc(t.gateWord)}</div></div>`,
  `<div class="spic">${BOB.full({stage:0,size:96,expr:'cheer',cheer:1})}${CRA.egg(1,80)}</div>`];
 const draw=()=>{d.innerHTML=`<div class="storyc"><div class="sdots" aria-hidden="true">${cards.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>${pics[i]}<h2>${esc(cards[i][0])}</h2><p>${esc(cards[i][1])}</p><div class="hrow"><button class="go soft" id="sskip">${t.skipStory}</button><button class="go" id="snext">${i<cards.length-1?t.next:t.letsGo}</button></div></div>`;
  $('snext').onclick=()=>{if(i<cards.length-1){i++;draw()}else end()};$('sskip').onclick=end;$('snext').focus()};
 const end=()=>{S().cr.intro=1;save();d.remove();after&&after()};draw()}
// ---------------- first-time hints: one Bobby bubble per feature ----------------
function hint(k){const c=st();if(c.hints[k])return;const tx=T().hints[k];if(!tx)return;c.hints[k]=1;save();const old=$('bhint');if(old)old.remove();
 const d=document.createElement('button');d.id='bhint';d.type='button';d.className='bhint';d.innerHTML=`${BOB.face('excited',46)}<span>${esc(tx)}</span>`;d.setAttribute('aria-label',tx+'. '+T().tapClose);
 setTimeout(()=>{document.body.appendChild(d);d.onclick=()=>d.remove();setTimeout(()=>d.remove(),7000)},350)}
// ---------------- dedication (book-style) ----------------
function dedication(after,manual){const d=document.createElement('div');d.className='dedi';d.setAttribute('role','dialog');d.setAttribute('aria-label',T().dediLabel);
 d.innerHTML=`<div class="dedip"><p>${H().STR.dedication.map(l=>l?(/^PS:/.test(l)?`<span class="deps">${esc(l)}</span>`:esc(l)):'').join('<br>')}</p><div class="dedib">${BOB.face('happy',40)}</div>${manual?`<button class="dedic" type="button">${H().STR.close}</button>`:''}</div>`;
 document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('in'));let gone=false;
 const out=()=>{if(gone)return;gone=true;d.classList.add('out');setTimeout(()=>{d.remove();after&&after()},RM()?0:700)};
 d.onclick=out;if(!manual)setTimeout(out,5200)}
function about(){const h=H(),t=T();h.leave();h.main.innerHTML=`<div class="card"><button class="back" id="ab">‹ ${t.back}</button><span class="tag">${t.mAbout}</span><div class="aboutded">${h.STR.dedication.map(l=>l?(/^PS:/.test(l)?`<span class="deps">${esc(l)}</span>`:esc(l)):'').join('<br>')}<div>${BOB.face('happy',40)}</div></div><p class="crmut">${t.credits}</p><button class="go soft" id="adv">${t.showDedi}</button></div>`;
 $('ab').onclick=more;$('adv').onclick=()=>dedication(null,1);nav('more')}
// ---------------- share card helper ----------------
function shareList(){const c=st();return [c.act,...Object.keys(c.own).filter(k=>k!==c.act)].slice(0,4)}
window.CRE={evolve,init,ev,give,hatch,screen,detail,eggInfo,drawFollower,react,ELEM,followerPos,nav,more,story,hint,dedication,about,checkEvo,st,stageOf,nick,shareList,R,RCOL,LIST,count:()=>LIST.filter(x=>x[1]<4&&st().own[x[0]]).length,total:()=>LIST.filter(x=>x[1]<4).length,
 bonus:()=>{const r=R(st().act);return [.1,.25,.5,1,0][r]||0},hideNav:()=>{const n=$('bnav');if(n)n.remove();document.body.classList.remove('hasnav')}};
})();
