/* VocaBobby: the one canonical Bobby.
   Master = the app-icon face (icons/fox.svg, the icon-512 face). Everything here is built from those exact paths.
   BOB.face(expr,size)  head only (same framing as the icon)
   BOB.full(opts)       full body: {stage:0-3 (Kit/Scout/Hero/Legend outfit), expr, size, pose:'stand'|'runA'|'runB'|'hop', cls}
*/
(function(){
const K='#241B4B',OR='#FF8A3D',CR='#FFF4E6',EAR='#3B1C4A',BL='#FF7AA8';
let N=0;
// ---- six expressions, drawn in the icon's own coordinates (eyes at 200/312, 206) ----
const EYES={
 happy:`<ellipse cx="200" cy="206" rx="24" ry="30" fill="${K}"/><ellipse cx="312" cy="206" rx="24" ry="30" fill="${K}"/><circle cx="208" cy="194" r="9" fill="#fff"/><circle cx="320" cy="194" r="9" fill="#fff"/>`,
 excited:`<path d="M176 214 Q200 180 224 214 M288 214 Q312 180 336 214" fill="none" stroke="${K}" stroke-width="14" stroke-linecap="round"/>`,
 think:`<ellipse cx="206" cy="200" rx="22" ry="28" fill="${K}"/><ellipse cx="318" cy="200" rx="22" ry="28" fill="${K}"/><circle cx="214" cy="188" r="8" fill="#fff"/><circle cx="326" cy="188" r="8" fill="#fff"/>`,
 sorry:`<ellipse cx="200" cy="212" rx="20" ry="24" fill="${K}"/><ellipse cx="312" cy="212" rx="20" ry="24" fill="${K}"/><circle cx="206" cy="203" r="7" fill="#fff"/><circle cx="318" cy="203" r="7" fill="#fff"/>`,
 cheer:`<path d="M200 172l9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3z" fill="#FFE45C" stroke="${K}" stroke-width="8" stroke-linejoin="round"/><path d="M312 172l9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3z" fill="#FFE45C" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>`,
 sleep:`<path d="M178 208 Q200 228 222 208 M290 208 Q312 228 334 208" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/>`
};
const BROWS={
 happy:'<path d="M168 160 Q192 146 222 160"/><path d="M290 160 Q320 146 344 160"/>',
 excited:'<path d="M168 150 Q192 132 222 148"/><path d="M290 148 Q320 132 344 150"/>',
 think:'<path d="M172 162 Q194 156 222 164"/><path d="M290 146 Q320 128 344 140"/>',
 sorry:'<path d="M172 150 Q196 160 224 170"/><path d="M288 170 Q316 160 340 150"/>',
 cheer:'<path d="M168 150 Q192 132 222 148"/><path d="M290 148 Q320 132 344 150"/>',
 sleep:'<path d="M170 168 Q194 160 222 166"/><path d="M290 166 Q318 160 342 168"/>'
};
const MOUTH={
 happy:'<path d="M232 292 Q256 312 280 292" fill="none" stroke-width="9"/>',
 excited:`<path d="M226 290 Q256 340 286 290Z" fill="${K}"/><path d="M240 312 Q256 326 272 312" fill="#FF8FA8" stroke-width="0"/>`,
 think:'<path d="M240 300 H272" fill="none" stroke-width="9"/>',
 sorry:'<path d="M234 304 Q256 290 278 304" fill="none" stroke-width="9"/>',
 cheer:`<path d="M222 288 Q256 348 290 288Z" fill="${K}"/><path d="M238 314 Q256 330 274 314" fill="#FF8FA8" stroke-width="0"/>`,
 sleep:`<ellipse cx="256" cy="300" rx="9" ry="7" fill="${K}"/>`
};
const EXTRA={
 sorry:`<path d="M372 196 q14 22 0 32 q-14 -10 0 -32z" fill="#8FD0F6" stroke="${K}" stroke-width="6"/>`,
 sleep:`<text x="372" y="120" font-family="Fredoka,sans-serif" font-weight="700" font-size="54" fill="#7D82DE">z</text><text x="404" y="84" font-family="Fredoka,sans-serif" font-weight="700" font-size="38" fill="#7D82DE">z</text>`,
 cheer:`<path d="M96 120l18 14M420 116l-18 16M92 236l22-4" stroke="#7D82DE" stroke-width="10" stroke-linecap="round"/>`,
 think:`<circle cx="398" cy="110" r="10" fill="#fff" stroke="${K}" stroke-width="6"/><circle cx="420" cy="80" r="16" fill="#fff" stroke="${K}" stroke-width="6"/>`
};
// the icon head, exactly (ears, inner ears, face, cheeks, forehead flame, nose, blush)
function head(ex){ex=EYES[ex]?ex:'happy';return `<g class="bhead" stroke="${K}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round">
<path d="M128 178 L150 52 L238 128Z" fill="${OR}"/><path d="M384 178 L362 52 L274 128Z" fill="${OR}"/>
<path d="M150 150 L160 88 L208 128Z" fill="${EAR}" stroke-width="0"/><path d="M362 150 L352 88 L304 128Z" fill="${EAR}" stroke-width="0"/>
<path d="M112 168 Q256 96 400 168 Q412 236 256 330 Q100 236 112 168Z" fill="${OR}"/>
<path d="M118 200 Q184 214 256 326 Q132 262 118 200Z" fill="${CR}" stroke-width="0"/><path d="M394 200 Q328 214 256 326 Q380 262 394 200Z" fill="${CR}" stroke-width="0"/>
<path d="M112 168 Q256 96 400 168 Q412 236 256 330 Q100 236 112 168Z" fill="none"/>
<path d="M226 128 Q256 112 286 128 L256 176Z" fill="#FFD040" stroke-width="0"/>
<g class="beyes" stroke-width="0">${EYES[ex]}</g>
<g fill="none" stroke-width="10">${BROWS[ex]}</g>
<path d="M238 262 Q256 252 274 262 Q270 280 256 284 Q242 280 238 262Z" fill="${K}"/>
${MOUTH[ex]}
<ellipse cx="160" cy="250" rx="16" ry="10" fill="${BL}" stroke-width="0" opacity=".8"/><ellipse cx="352" cy="250" rx="16" ry="10" fill="${BL}" stroke-width="0" opacity=".8"/>
</g>${EXTRA[ex]||''}`}
function face(ex='happy',sz=64,cls=''){return `<svg class="bobf bob-${ex} ${cls}" width="${sz}" height="${sz}" viewBox="96 40 320 300" aria-hidden="true">${head(ex)}</svg>`}
// thick outlined limb: ink stroke under a coloured stroke
const limb=(d,w,c)=>`<path d="${d}" fill="none" stroke="${K}" stroke-width="${w+24}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function full(o={}){
 const st=Math.max(0,Math.min(3,o.stage|0)),ex=o.expr||'happy',sz=o.size||120,pose=o.pose||'stand',id='b'+(++N);
 const ph=pose==='runA'?1:pose==='runB'?-1:0;
 // legs
 const lL=`M226 488 L${222-ph*26} 566`,lR=`M286 488 L${290+ph*26} 566`;
 const legs=limb(lL,40,OR)+limb(lR,40,OR)+`<ellipse cx="${220-ph*26}" cy="574" rx="30" ry="17" fill="${CR}" stroke="${K}" stroke-width="12"/><ellipse cx="${292+ph*26}" cy="574" rx="30" ry="17" fill="${CR}" stroke="${K}" stroke-width="12"/>`;
 const arms=pose==='hop'||o.cheer?limb('M184 380 Q140 340 132 290',34,OR)+limb('M328 380 Q372 340 380 290',34,OR)+`<circle cx="132" cy="284" r="20" fill="${CR}" stroke="${K}" stroke-width="12"/><circle cx="380" cy="284" r="20" fill="${CR}" stroke="${K}" stroke-width="12"/>`
  :limb(`M182 384 Q${150+ph*14} 420 ${150+ph*20} 462`,34,OR)+limb(`M330 384 Q${362-ph*14} 420 ${362-ph*20} 462`,34,OR)+`<circle cx="${150+ph*20}" cy="468" r="20" fill="${CR}" stroke="${K}" stroke-width="12"/><circle cx="${362-ph*20}" cy="468" r="20" fill="${CR}" stroke="${K}" stroke-width="12"/>`;
 const tail=`<g class="btail"><path d="M318 470 Q420 470 446 380 Q462 316 420 270 Q440 340 396 380 Q360 410 318 420Z" fill="${OR}" stroke="${K}" stroke-width="12" stroke-linejoin="round"/><path d="M420 270 Q462 316 446 380 Q436 338 404 312 Q430 300 420 270Z" fill="${CR}" stroke="${K}" stroke-width="12" stroke-linejoin="round"/></g>`;
 const body=`<path d="M176 360 Q170 300 256 300 Q342 300 336 360 Q352 470 300 500 Q256 516 212 500 Q160 470 176 360Z" fill="${OR}" stroke="${K}" stroke-width="12" stroke-linejoin="round"/><path d="M214 370 Q256 344 298 370 Q312 450 256 488 Q200 450 214 370Z" fill="${CR}"/>`;
 // outfits, worn on the same Bobby
 const scarf=st>=1?`<path d="M168 318 Q256 366 344 318 L338 352 Q256 396 174 352Z" fill="#3FABE7" stroke="${K}" stroke-width="12" stroke-linejoin="round"/><path d="M300 350 L322 420 L292 414 L278 356Z" fill="#3FABE7" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>`:'';
 const pack=st===1?`<rect x="104" y="356" width="70" height="96" rx="22" fill="#FFE45C" stroke="${K}" stroke-width="12"/><path d="M116 392 H162" stroke="${K}" stroke-width="10"/>`:'';
 const cape=st>=2?`<defs><linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FABE7"/><stop offset=".5" stop-color="#7D82DE"/><stop offset="1" stop-color="#B15FD7"/></linearGradient></defs><path class="bcape" d="M180 330 Q120 420 96 548 Q140 530 176 556 Q216 532 256 556 Q296 532 336 556 Q372 530 416 548 Q392 420 332 330Z" fill="url(#${id}c)" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>`:'';
 const badge=st>=2?`<circle cx="256" cy="430" r="26" fill="#FFE45C" stroke="${K}" stroke-width="10"/><path d="M256 414l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#fff" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`:'';
 const crown=st>=3?`<path d="M196 92 L210 40 L236 74 L256 30 L276 74 L302 40 L316 92Z" fill="#FFE45C" stroke="${K}" stroke-width="10" stroke-linejoin="round"/><circle cx="256" cy="66" r="8" fill="#B15FD7"/>`:'';
 const glow=st>=3?`<defs><radialGradient id="${id}g"><stop offset=".35" stop-color="#FFE45C" stop-opacity=".6"/><stop offset="1" stop-color="#FFE45C" stop-opacity="0"/></radialGradient></defs><circle cx="256" cy="320" r="300" fill="url(#${id}g)"/>`:'';
 const shadow=o.noShadow?'':`<ellipse cx="256" cy="590" rx="130" ry="18" fill="${K}" opacity=".12"/>`;
 const h=Math.round(sz*620/440);
 return `<svg class="bobby bobfull ${o.cls||''}" width="${sz}" height="${h}" viewBox="36 10 440 620" aria-hidden="true">${glow}${shadow}${cape}${tail}${legs}${pack}${body}${badge}${arms}${scarf}<g class="bheadw">${head(ex)}</g>${crown}</svg>`}
// small image cache for the canvas run (same SVG, rasterised)
const IMG={};
function img(stage,pose){const k=stage+pose;if(IMG[k])return IMG[k];const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(full({stage,pose,size:88,noShadow:1}).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));IMG[k]=i;return i}
window.BOB={face,full,head,img,EXPR:Object.keys(EYES),OUTFITS:['Kit','Scout','Hero','Legend']};
})();
