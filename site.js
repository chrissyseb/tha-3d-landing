(function(){
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  // 1. Time slider (#t-marks → #t-out): minutes = marks × 1.5
  (function(){
    var r=$('#t-marks'),o=$('#t-out');
    if(r&&o){function u(){var m=+r.value,t=m*1.5;o.innerHTML='<b>'+t+' minute'+(t===1?'':'s')+'</b> for '+m+' mark'+(m===1?'':'s');}r.addEventListener('input',u);u();}
  })();

  // 2. AL calculator (#calc-al) and L1R5 calculator (#calc-l1r5)
  (function(){
    ['calc-al','calc-l1r5'].forEach(function(cid){
      var f=document.getElementById(cid);if(!f)return;
      var o=f.querySelector('.calc-out');
      var label=cid==='calc-al'?'PSLE Score':'L1R5';
      function u(){var t=0;[].forEach.call(f.querySelectorAll('select'),function(x){t+=+x.value;});o.innerHTML=label+': <b>'+t+'</b>';}
      f.addEventListener('change',u);
      f.addEventListener('submit',function(e){e.preventDefault();});
      u();
    });
  })();

  // 3. Free-paper buttons ([data-free]) fill contact form and scroll to #faq
  (function(){
    var sec=$('#free');if(!sec)return;
    sec.addEventListener('click',function(e){
      var b=e.target.closest('[data-free]');if(!b)return;
      var i=document.getElementById('c-interest'),m=document.getElementById('c-msg'),f=document.getElementById('faq');
      if(i)i.value='Exam notes waitlist';
      if(m)m.value='Please email me '+b.dataset.free+'.\nStudent level: ';
      if(f)f.scrollIntoView({behavior:'smooth'});
      setTimeout(function(){var em=document.getElementById('c-email');if(em)em.focus({preventScroll:true});},400);
    });
  })();

  // 4. Nav highlight: IntersectionObserver on #main-nav links, .on class, smooth scroll
  (function(){
    var nav=$('#main-nav');if(!nav||!('IntersectionObserver' in window))return;
    var links=[].slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
    var map={};links.forEach(function(l){var s=document.getElementById(l.getAttribute('href').slice(1));if(s)map[s.id]=l;});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var l=map[e.target.id];if(!l)return;
      links.forEach(function(x){x.classList.remove('on');});l.classList.add('on');
      if(nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:Math.max(0,l.offsetLeft-24),behavior:'smooth'});
    });
  },{rootMargin:'-40% 0px -55% 0px'});
    Object.keys(map).forEach(function(id){io.observe(document.getElementById(id));});
  })();

  // 5. WhatsApp pre-filled text (idempotent: skips if ?text= already present)
  (function(){
    var msg=encodeURIComponent('Hi Thinking Hack, I\u2019d like to be matched with an Exam Preparation Specialist\u2122. Exam and level: ');
    $$('a[href*="wa.me/6590030002"]').forEach(function(a){
      if(/[?&]text=/.test(a.href)) return;
      var base=a.href.split('?')[0];
      a.href=base+'?text='+msg;
    });
  })();

  // 6. Click tracking via window.va (Form send, WhatsApp click, Free paper request)
  (function(){
    window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};
    function track(n,d){try{window.va('event',{name:n,data:d||{}})}catch(e){}}
    document.addEventListener('submit',function(e){var f=e.target;if(f&&(f.id==='wizard'||f.id==='contact-form'))track('Form send',{form:f.id});},true);
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href*="wa.me/"]');
      if(a)track('WhatsApp click',{where:(a.closest('section,header,footer,.mbar')||{}).id||a.className||'page'});
      var b=e.target.closest&&e.target.closest('[data-free]');
      if(b)track('Free paper request',{item:b.dataset.free.slice(0,80)});
    },true);
  })();

  // 7. Mobile bar (#mbar): hide/inert when #match or #contact-form is in view, or a field is focused
  (function(){
    var mbar=$('#mbar');if(!mbar)return;
    var inView=new Set(),typing=false;
    function update(){var hide=inView.size>0||typing;mbar.classList.toggle('is-hidden',hide);if(hide)mbar.setAttribute('inert','');else mbar.removeAttribute('inert');}
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting)inView.add(en.target);else inView.delete(en.target);});update();},{rootMargin:'0px 0px -80px 0px'});
      ['#match','#contact-form'].forEach(function(s){var el=$(s);if(el)io.observe(el);});
    }
    document.addEventListener('focusin',function(e){if(e.target.matches('input, select, textarea')){typing=true;update();}});
    document.addEventListener('focusout',function(e){if(e.target.matches('input, select, textarea')){typing=false;update();}});
    update();
  })();
})();
