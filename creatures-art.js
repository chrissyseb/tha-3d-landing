/* VocaBobby creatures: original word-themed creatures, one consistent style
   (ink #241B4B outlines, 6px strokes, Bobby-style eyes with a white glint, pink blush).
   CRA.svg(id, stage 0-2, size, opts) ; CRA.egg(rarity 0-3, size, opts) */
(function(){
const K='#241B4B',S='stroke="#241B4B" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
const eye=(x,y,r=1)=>`<ellipse cx="${x}" cy="${y}" rx="${8*r}" ry="${10*r}" fill="${K}"/><circle cx="${x+3*r}" cy="${y-4*r}" r="${3.2*r}" fill="#fff"/>`;
const eyes=(x1,x2,y,r)=>eye(x1,y,r)+eye(x2,y,r);
const blush=(x1,x2,y)=>`<ellipse cx="${x1}" cy="${y}" rx="8" ry="5" fill="#FF7AA8" opacity=".75"/><ellipse cx="${x2}" cy="${y}" rx="8" ry="5" fill="#FF7AA8" opacity=".75"/>`;
const smile=(x,y,w=10)=>`<path d="M${x-w} ${y} Q${x} ${y+9} ${x+w} ${y}" fill="none" ${S} stroke-width="5"/>`;
const sparkles=c=>`<g fill="${c||'#FFE45C'}" stroke="${K}" stroke-width="3" stroke-linejoin="round"><path d="M28 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/><path d="M172 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M176 120l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>`;
const aura=(id,c)=>`<defs><radialGradient id="${id}"><stop offset=".3" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="108" r="96" fill="url(#${id})"/>`;
const ground='<ellipse cx="100" cy="188" rx="52" ry="7" fill="#241B4B" opacity=".12"/>';
let N=0;
const grad=(id,a,b,c)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>`;
// ---------- the creatures ----------
const ART={
hootle(s,u){const c='#7D82DE';return `${s>1?aura(u+'a','#7D82DE'):''}${ground}
${s>1?`<path d="M40 110 Q0 80 10 150 Q30 140 46 150Z M160 110 Q200 80 190 150 Q170 140 154 150Z" fill="${c}" ${S}/>`:''}
<path d="M58 62 L52 28 L82 52Z M142 62 L148 28 L118 52Z" fill="${c}" ${S}/>
<ellipse cx="100" cy="118" rx="${s?60:54}" ry="${s?66:60}" fill="${c}" ${S}/>
<ellipse cx="100" cy="140" rx="34" ry="34" fill="#FFF4E6"/><path d="M86 132 l4 -10 4 10 M87.5 128h5 M104 122v12 q6 0 6 -4 q0 -3 -6 -3" fill="none" ${S} stroke-width="3.5"/>
<circle cx="78" cy="96" r="22" fill="#FFF4E6" ${S}/><circle cx="122" cy="96" r="22" fill="#FFF4E6" ${S}/>${eyes(78,122,98,1.1)}
<path d="M93 112 L107 112 L100 124Z" fill="#FFE45C" ${S} stroke-width="4"/>${blush(64,136,120)}
<path d="M44 118 Q34 150 60 164 M156 118 Q166 150 140 164" fill="none" ${S}/>
<path d="M84 182 v-8 M92 182 v-8 M108 182 v-8 M116 182 v-8" ${S} stroke-width="5"/>
${s>=1?`<path d="M58 54 L100 36 L142 54 L100 70Z" fill="${K}"/><rect x="84" y="56" width="32" height="10" fill="${K}"/><path d="M142 54 v20" ${S} stroke="#FFE45C" stroke-width="4"/><circle cx="142" cy="78" r="5" fill="#FFE45C"/>`:''}
${s>1?`<rect x="70" y="160" width="60" height="24" rx="3" fill="#FFE45C" ${S} stroke-width="5"/><path d="M100 160v24" ${S} stroke-width="4"/>`+sparkles():''}`},
inkoo(s,u){const c='#B15FD7';return `${s>1?aura(u+'a','#B15FD7'):''}${ground}
${[0,1,2,3,4].map(i=>{const x=52+i*24;return `<path d="M${x} 130 Q${x-8+i*4} 160 ${x-14+i*7} 178 Q${x-2+i*4} 176 ${x+6} 160" fill="${c}" ${S}/>`}).join('')}
<path d="M44 130 Q40 50 100 46 Q160 50 156 130 Q100 146 44 130Z" fill="${c}" ${S}/>
<ellipse cx="78" cy="70" rx="14" ry="8" fill="#fff" opacity=".35"/>${eyes(80,120,100,1.15)}${blush(66,134,118)}${smile(100,118)}
${s>=1?`<g transform="rotate(-30 160 120)"><path d="M152 70 Q170 90 162 128 L156 128 Q150 96 152 70Z" fill="#FFF4E6" ${S} stroke-width="4"/><path d="M158 128 l1 12" ${S} stroke-width="4"/></g><circle cx="38" cy="150" r="6" fill="${K}"/><circle cx="28" cy="164" r="4" fill="${K}"/>`:''}
${s>1?`<g fill="${K}"><path d="M70 40 q6 -16 12 0 a6 6 0 0 1 -12 0z"/><path d="M94 30 q6 -18 12 0 a6 6 0 0 1 -12 0z"/><path d="M118 40 q6 -16 12 0 a6 6 0 0 1 -12 0z"/></g>`+sparkles('#B15FD7'):''}`},
snailbet(s,u){const sh=s>1?`url(#${u}g)`:'#FFE45C';return `${s>1?grad(u+'g','#3FABE7','#7D82DE','#B15FD7')+aura(u+'a','#7D82DE'):''}${ground}
<path d="M24 178 Q20 150 50 146 L150 146 Q178 150 176 178Z" fill="#8FD8C4" ${S}/>
<circle cx="102" cy="112" r="${s?52:46}" fill="${sh}" ${S}/>
<path d="M102 112 m0 -8 a8 8 0 1 1 -8 8 a18 18 0 1 1 18 18 a28 28 0 1 1 -28 -28" fill="none" ${S} stroke-width="5"/>
<text x="102" y="${s?84:90}" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="16" fill="${s>1?'#fff':K}">abc</text>
<path d="M150 146 Q176 140 172 104 Q170 86 150 90 Q140 120 150 146Z" fill="#8FD8C4" ${S}/>
<path d="M156 92 L150 62 M168 94 L176 64" ${S} stroke-width="5"/><circle cx="150" cy="58" r="7" fill="${s>=1?'#FFE45C':'#8FD8C4'}" ${S} stroke-width="4"/><circle cx="177" cy="60" r="7" fill="${s>=1?'#FFE45C':'#8FD8C4'}" ${S} stroke-width="4"/>
${eye(152,112,.8)}${eye(170,112,.8)}<ellipse cx="146" cy="128" rx="6" ry="4" fill="#FF7AA8" opacity=".75"/>${smile(162,128,7)}
${s>1?sparkles():''}`},
crab(s,u){const c=s>1?'#FFB23F':'#FF7A6B';return `${s>1?aura(u+'a','#FFE45C'):''}${ground}
<path d="M40 150 L22 176 M56 160 L44 182 M160 150 L178 176 M144 160 L156 182" ${S} stroke-width="7"/>
<path d="M50 100 Q30 70 28 54" fill="none" ${S} stroke-width="8"/><path d="M150 100 Q170 70 172 54" fill="none" ${S} stroke-width="8"/>
<path d="M28 60 a18 18 0 1 1 18 -12 q-6 10 -18 12z" fill="${c}" ${S}/><path d="M172 60 a18 18 0 1 0 -18 -12 q6 10 18 12z" fill="${c}" ${S}/>
<ellipse cx="100" cy="132" rx="62" ry="42" fill="${c}" ${S}/>
<path d="M84 96 V72 M116 96 V72" ${S} stroke-width="5"/><circle cx="84" cy="66" r="13" fill="#fff" ${S} stroke-width="5"/><circle cx="116" cy="66" r="13" fill="#fff" ${S} stroke-width="5"/>${eye(85,67,.75)}${eye(117,67,.75)}
${blush(70,130,140)}${smile(100,138,12)}
${s>=1?`<path d="M74 52 Q100 26 126 52Z" fill="#3FABE7" ${S} stroke-width="5"/><path d="M68 52 H132" ${S} stroke-width="6"/>`:''}
${s>1?sparkles():''}`},
lexi(s,u){const c='#3FABE7';return `${s>1?aura(u+'a','#FFE45C'):''}${ground}
<path d="M140 150 Q190 140 184 100 Q176 118 160 112 Q178 96 164 80 Q160 104 132 126Z" fill="${c}" ${S}/>
<ellipse cx="96" cy="142" rx="54" ry="38" fill="${c}" ${S}/>
<path d="M62 176 v-14 M86 180 v-12 M110 180 v-12 M132 176 v-14" ${S} stroke-width="8"/>
<path d="M82 120 l14 14 -10 4 16 18" fill="none" stroke="#FFE45C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
${s>=1?`<path d="M62 108 l8 -16 8 14 8 -18 8 16 8 -16 8 18" fill="#FFE45C" ${S} stroke-width="4"/>`:''}
<path d="M30 86 Q30 52 70 52 Q104 54 106 86 Q104 112 70 114 Q34 114 30 86Z" fill="${c}" ${S}/>${eyes(56,84,80,1)}${blush(46,94,98)}${smile(70,98,10)}
${s>1?`<path d="M20 40 l14 18 -10 2 14 20" fill="none" stroke="#FFE45C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M180 30 l-12 16 9 2 -12 18" fill="none" stroke="#FFE45C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`:''}`},
pagewing(s,u){const w=s>1?`url(#${u}g)`:'#FFF4E6',sc=s?1.12:1;return `${s>1?grad(u+'g','#3FABE7','#7D82DE','#B15FD7')+aura(u+'a','#B15FD7'):''}${ground}
<g transform="translate(100 104) scale(${sc}) translate(-100 -104)"><path d="M96 96 Q60 30 20 50 Q12 100 92 116Z" fill="${w}" ${S}/><path d="M104 96 Q140 30 180 50 Q188 100 108 116Z" fill="${w}" ${S}/>
<path d="M92 118 Q40 120 34 160 Q70 170 96 130Z" fill="${w}" ${S}/><path d="M108 118 Q160 120 166 160 Q130 170 104 130Z" fill="${w}" ${S}/>
<path d="M34 64 Q60 66 80 92 M30 80 Q56 84 76 102 M166 64 Q140 66 120 92 M170 80 Q144 84 124 102" fill="none" stroke="${s>1?'#fff':'#7D82DE'}" stroke-width="4" stroke-linecap="round"/></g>
<ellipse cx="100" cy="122" rx="16" ry="44" fill="#7D82DE" ${S}/><circle cx="100" cy="84" r="22" fill="#7D82DE" ${S}/>
<path d="M92 64 Q84 40 72 36 M108 64 Q116 40 128 36" fill="none" ${S} stroke-width="4"/><circle cx="72" cy="36" r="5" fill="#FFE45C" ${S} stroke-width="3"/><circle cx="128" cy="36" r="5" fill="#FFE45C" ${S} stroke-width="3"/>
${eyes(92,108,84,.8)}${smile(100,96,6)}${s>=1?'<path d="M92 120h16M92 132h16M92 144h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>':''}${s>1?sparkles():''}`},
echobat(s,u){const c='#5E54B8';return `${s>1?aura(u+'a','#3FABE7'):''}${ground}
<path d="M64 110 Q30 80 8 96 Q20 110 16 130 Q36 120 46 140 Q56 124 70 132Z" fill="${c}" ${S}/><path d="M136 110 Q170 80 192 96 Q180 110 184 130 Q164 120 154 140 Q144 124 130 132Z" fill="${c}" ${S}/>
<path d="M66 70 Q50 20 80 34 Q86 50 84 64Z M134 70 Q150 20 120 34 Q114 50 116 64Z" fill="${c}" ${S}/>
<ellipse cx="100" cy="116" rx="46" ry="54" fill="${c}" ${S}/><ellipse cx="100" cy="138" rx="24" ry="24" fill="#C9CCF4"/>
${eyes(84,116,102,1.05)}${blush(72,128,120)}<path d="M90 120 Q100 130 110 120" fill="none" ${S} stroke-width="5"/><path d="M93 121 l3 6 3 -5 M101 121 l3 5 3 -6" fill="#fff" stroke="#fff" stroke-width="2"/>
<path d="M88 170 v10 M112 170 v10" ${S}/>
${s>=1?`<path d="M30 54 q-10 10 0 20 M18 46 q-16 18 0 36 M170 54 q10 10 0 20 M182 46 q16 18 0 36" fill="none" stroke="#3FABE7" stroke-width="5" stroke-linecap="round"/>`:''}
${s>1?`<path d="M100 38 l10 14 -10 14 -10 -14z" fill="#8FD0F6" ${S} stroke-width="4"/>`+sparkles('#8FD0F6'):''}`},
glyphin(s,u){const c='#6FD3F7';return `${s>1?aura(u+'a','#3FABE7'):''}${ground}
${s>1?`<path d="M30 180 Q50 160 70 180 Q90 160 110 180 Q130 160 150 180 Q170 160 190 180" fill="none" stroke="#3FABE7" stroke-width="6" stroke-linecap="round"/>`:''}
<path d="M30 120 Q40 60 110 60 Q170 62 178 110 Q170 160 110 160 Q60 160 30 120Z" fill="${c}" ${S}/>
<path d="M30 120 Q10 100 8 80 Q24 94 36 100 Q20 120 14 146 Q30 132 40 130Z" fill="${c}" ${S}/>
<path d="M110 62 Q120 30 140 26 Q132 50 136 66Z" fill="${c}" ${S}/>
<path d="M176 108 Q196 112 196 122 Q184 124 174 120" fill="${c}" ${S}/>
<path d="M60 140 Q110 158 160 128 Q150 150 110 156 Q72 156 60 140Z" fill="#E6F8FF"/>
${eye(140,98,1.05)}<ellipse cx="152" cy="118" rx="7" ry="4.5" fill="#FF7AA8" opacity=".75"/><path d="M150 126 Q164 132 174 122" fill="none" ${S} stroke-width="5"/>
<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M76 86 l8 14 8 -14"/><path d="M100 82 v18 M94 88 h12"/></g>
${s>=1?`<path d="M84 150 Q90 176 70 184 Q80 166 72 150Z" fill="${c}" ${S}/>`:''}
${s>1?`<path d="M112 46 l6 -16 6 12 8 -14 4 18" fill="#FFE45C" ${S} stroke-width="4"/>`+sparkles():''}`},
syntaxolotl(s,u){const c='#FF9EC4';return `${s>1?aura(u+'a','#B15FD7'):''}${ground}
<path d="M130 150 Q180 150 186 120 Q170 128 150 124Z" fill="${c}" ${S}/>
<ellipse cx="104" cy="150" rx="48" ry="28" fill="${c}" ${S}/><path d="M72 174 v8 M96 178 v6 M118 178 v6 M138 172 v8" ${S} stroke-width="7"/>
${['M48 72 Q20 60 16 76 Q30 80 44 86','M44 92 Q14 92 14 108 Q30 106 46 104','M48 110 Q24 122 30 134 Q40 124 54 118','M152 72 Q180 60 184 76 Q170 80 156 86','M156 92 Q186 92 186 108 Q170 106 154 104','M152 110 Q176 122 170 134 Q160 124 146 118'].slice(0,s>=1?6:4).map(d=>`<path d="${d}" fill="${s>1?'#B15FD7':'#FF6FA8'}" ${S} stroke-width="5"/>`).join('')}
<ellipse cx="100" cy="98" rx="56" ry="42" fill="${c}" ${S}/>${eyes(80,120,94,1)}${blush(64,136,110)}<path d="M84 112 Q100 126 116 112" fill="none" ${S} stroke-width="5"/>
<text x="100" y="72" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="16" fill="${K}">{ }</text>
${s>1?sparkles('#FF9EC4'):''}`},
lexicorn(s,u){const m=`url(#${u}m)`;return `${grad(u+'m','#3FABE7','#7D82DE','#B15FD7')}${s>1?aura(u+'a','#FFE45C'):''}${ground}
${s>=1?`<path d="M104 120 Q150 70 190 86 Q170 100 176 116 Q150 108 130 134Z" fill="#fff" ${S}/><path d="M150 96 Q166 96 176 104" fill="none" stroke="#C9CCF4" stroke-width="4"/>`:''}
<ellipse cx="108" cy="142" rx="52" ry="32" fill="#fff" ${S}/>
<path d="M70 166 v16 M94 170 v14 M124 170 v14 M146 164 v18" ${S} stroke-width="9"/>
<path d="M156 130 Q190 140 180 172 Q172 152 156 150Z" fill="${m}" ${S}/>
<path d="M56 140 Q36 100 52 72 L86 80 Q84 110 84 132Z" fill="#fff" ${S}/>
<path d="M38 74 Q30 52 54 36 Q86 30 96 58 Q100 82 70 88 Q40 90 38 74Z" fill="#fff" ${S}/>
<path d="M78 34 Q110 36 108 64 Q116 90 98 110 Q92 86 88 76 Q98 58 78 34Z" fill="${m}" ${S}/>
<path d="M66 36 L74 2 L84 34Z" fill="#FFE45C" ${S} stroke-width="5"/><path d="M68 26 l12 -4 M70 16 l8 -3" stroke="${K}" stroke-width="3"/>
${eye(74,60,.9)}<ellipse cx="62" cy="74" rx="7" ry="4.5" fill="#FF7AA8" opacity=".75"/><path d="M84 74 Q90 80 96 74" fill="none" ${S} stroke-width="4"/>
${s>1?sparkles():''}`},
rex(s,u){const c='#2BB3A3';return `${s>1?aura(u+'a','#FFE45C'):''}${ground}
<path d="M130 150 Q186 160 192 128 Q170 140 140 128Z" fill="${c}" ${S}/>
${s>=1?`<path d="M106 50 l10 -16 8 18 10 -14 6 20 10 -10 2 22" fill="#FFE45C" ${S} stroke-width="5"/>`:''}
<ellipse cx="108" cy="134" rx="50" ry="48" fill="${c}" ${S}/><ellipse cx="104" cy="146" rx="28" ry="30" fill="#D8F5F0"/>
<path d="M84 178 v6 M128 178 v6" ${S} stroke-width="10"/>
<path d="M40 80 Q40 40 92 40 Q140 42 140 80 Q138 110 92 112 Q42 112 40 80Z" fill="${c}" ${S}/>
${eyes(76,108,72,1)}${blush(62,122,92)}<path d="M66 94 Q92 108 118 94" fill="none" ${S} stroke-width="5"/><path d="M76 96 l4 6 4 -5 M100 97 l4 5 4 -6" fill="#fff" stroke="#fff" stroke-width="2"/>
<rect x="76" y="124" width="46" height="34" rx="4" fill="#B15FD7" ${S} stroke-width="5"/><path d="M99 124v34" ${S} stroke-width="4"/><text x="88" y="146" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="12" fill="#fff">A</text><text x="111" y="146" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="12" fill="#fff">Z</text>
<path d="M66 128 Q60 140 74 144 M146 128 Q152 140 126 144" fill="none" ${S} stroke-width="6"/>
${s>1?`<path d="M64 42 L68 14 L82 30 L92 8 L102 30 L116 14 L120 42Z" fill="#FFE45C" ${S} stroke-width="5"/>`+sparkles():''}`},
phoenix(s,u){return `${aura(u+'a','#FF8A3D')}${ground}
<path d="M70 130 Q20 110 14 60 Q50 80 64 100 Q50 60 70 34 Q82 80 90 110Z" fill="#FFB23F" ${S}/><path d="M130 130 Q180 110 186 60 Q150 80 136 100 Q150 60 130 34 Q118 80 110 110Z" fill="#FFB23F" ${S}/>
<path d="M84 150 Q70 176 80 186 Q96 170 100 160 Q104 170 120 186 Q130 176 116 150Z" fill="#FF5D8F" ${S}/>
<ellipse cx="100" cy="120" rx="36" ry="44" fill="#FF8A3D" ${S}/><path d="M92 76 Q96 50 104 44 Q102 60 112 72" fill="#FFE45C" ${S} stroke-width="4"/>
${eyes(88,112,110,.9)}<path d="M94 124 L106 124 L100 134Z" fill="#FFE45C" ${S} stroke-width="4"/>${blush(78,122,126)}
<path d="M86 150 q14 -12 28 0 q-14 14 -28 0z" fill="#FF5D8F" stroke="#fff" stroke-width="3"/>`}
};
// Bobby is drawn by BOB (the canonical one); in the Dex he shows as the head-and-body Kit
function svg(id,stage=0,sz=96,o={}){const u='c'+(++N);
 if(id==='bobby'&&window.BOB)return BOB.full({stage:o.bobbyStage||0,size:Math.round(sz*.72),cls:'crsvg '+(o.cls||''),expr:o.expr});
 const f=ART[id];if(!f)return'';
 const sil=o.sil?` style="filter:brightness(0) opacity(.18)"`:'';
 return `<svg class="crsvg ${o.cls||''}" width="${sz}" height="${sz}" viewBox="0 0 200 200" aria-hidden="true"${sil}>${f(Math.max(0,Math.min(2,stage)),u)}</svg>`}
// ---------- eggs: one look per rarity, each glows its own colour ----------
const EGG=[
 {b:'#FFF4E6',d:'#C9CCF4',spot:'#7DC6F0',glow:'#7DC6F0'},
 {b:'#8FD0F6',d:'#3FABE7',spot:'#fff',glow:'#3FABE7'},
 {b:'#C9A7F0',d:'#B15FD7',spot:'#FFE45C',glow:'#B15FD7'},
 {b:'#FFE45C',d:'#FFB23F',spot:'#fff',glow:'#FFC642'}];
function egg(r=0,sz=90,o={}){const e=EGG[r]||EGG[0],u='e'+(++N),cr=o.crack||0;
 const pat=r===0?`<g fill="${e.spot}"><circle cx="38" cy="60" r="7"/><circle cx="62" cy="44" r="5"/><circle cx="58" cy="84" r="8"/><circle cx="34" cy="92" r="4"/></g>`
  :r===1?`<g fill="#fff" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"><path d="M40 52l3 6 6 1-5 4 2 6-6-3-6 3 2-6-5-4 6-1z"/><path d="M62 78l2.5 5 5 .8-4 3.4 1 5-4.5-2.6-4.5 2.6 1-5-4-3.4 5-.8z"/></g>`
  :r===2?`<path d="M18 70 l12 -10 12 10 12 -10 12 10 12 -10 12 10" fill="none" stroke="${e.spot}" stroke-width="7" stroke-linejoin="round"/><path d="M24 92 l10 -8 10 8 10 -8 10 8 10 -8 10 8" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>`
  :`<path d="M22 66 Q50 54 78 66" fill="none" stroke="url(#${u}r)" stroke-width="9"/><g fill="#fff" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"><path d="M50 30l4 8 8 1-6 5 2 8-8-4-8 4 2-8-6-5 8-1z"/></g><path d="M30 88 l6 4 M64 92 l6 -4" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
 const cracks=[`<path d="M30 60 l10 6 -6 8 10 6" fill="none" stroke="${K}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,`<path d="M58 40 l-6 10 8 6 -6 10 10 4" fill="none" stroke="${K}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,`<path d="M18 74 l14 -2 6 8 12 -6 10 8 12 -6 12 4" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`];
 return `<svg class="eggsvg egg-r${r} ${o.cls||''}" width="${sz}" height="${Math.round(sz*1.2)}" viewBox="0 0 100 120" aria-hidden="true"><defs><radialGradient id="${u}g"><stop offset=".45" stop-color="${e.glow}" stop-opacity="${o.noGlow?0:.55}"/><stop offset="1" stop-color="${e.glow}" stop-opacity="0"/></radialGradient><linearGradient id="${u}r" x1="0" x2="1"><stop offset="0" stop-color="#3FABE7"/><stop offset=".5" stop-color="#7D82DE"/><stop offset="1" stop-color="#B15FD7"/></linearGradient><clipPath id="${u}c"><path d="M50 8 C80 8 92 50 92 72 C92 98 74 114 50 114 C26 114 8 98 8 72 C8 50 20 8 50 8Z"/></clipPath></defs>
<ellipse cx="50" cy="66" rx="50" ry="56" fill="url(#${u}g)"/>
<path d="M50 8 C80 8 92 50 92 72 C92 98 74 114 50 114 C26 114 8 98 8 72 C8 50 20 8 50 8Z" fill="${e.b}"/>
<g clip-path="url(#${u}c)">${pat}<path d="M8 90 Q50 104 92 90 V120 H8Z" fill="${e.d}" opacity=".45"/><ellipse cx="34" cy="38" rx="9" ry="14" fill="#fff" opacity=".6" transform="rotate(20 34 38)"/></g>
<path d="M50 8 C80 8 92 50 92 72 C92 98 74 114 50 114 C26 114 8 98 8 72 C8 50 20 8 50 8Z" fill="none" stroke="${K}" stroke-width="5"/>${cracks.slice(0,cr).join('')}</svg>`}
window.CRA={svg,egg,ids:Object.keys(ART)};
})();
