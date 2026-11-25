/* Site motion: shop, home, About and join (GSAP 3.13 + ScrollTrigger from cdnjs, fetched by this file on first interaction).
   Rules: content is visible by default; the hidden start state is only ever set from here, and only
   for elements still below the fold. Transform and opacity only, so nothing shifts layout.
   With prefers-reduced-motion: reduce, or if GSAP does not load, nothing is hidden and nothing moves.
   Kept light on purpose: one trigger per group (a row of cards, a bundle row, a section head),
   not one per element. */
(function () {
  function setUp() {
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
      var vh = window.innerHeight;
      var below = function (el) { return el.getBoundingClientRect().top > vh * 0.92; };

      // Each group is one trigger; what moves is the group itself or its cards.
      var groups = gsap.utils.toArray('.shop .notes-group > h3, .shop .level-bundles, .shop .notes-grid, .shop .essaylab .section-head, .shop .el-shot, .shop #contact .section-head, .shop .form-card, '
        // home page, About and join: one trigger per block
        + '.home .band .section-head, .home .hw-steps, .home .vsx-shot, .home .vs-table tbody, .home .vsx-points, .home .px-copy, .home .rx-grid, .home ul.rates, .home .el-real, .home .drawers, .pg-fig, .reveal').filter(below);
      var kids = { 'hw-steps': 'li', 'vsx-points': 'li', 'rates': 'li', 'drawers': '.drawer' };
      var partsOf = function (g) {
        if (g.classList.contains('notes-grid')) return gsap.utils.toArray('.note-card', g);
        if (g.classList.contains('level-bundles')) return gsap.utils.toArray('.bundle', g);
        if (g.tagName === 'TBODY') return gsap.utils.toArray('tr', g); // the comparison, row by row
        for (var k in kids) if (g.classList.contains(k)) return gsap.utils.toArray(kids[k], g);
        return [g];
      };
      var all = [];
      groups.forEach(function (g) { all = all.concat(partsOf(g)); });
      gsap.set(all, { autoAlpha: 0, y: 20 });

      var show = function (els) {
        gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: { amount: Math.min(0.3, els.length * 0.08) }, overwrite: true, clearProps: 'transform,opacity,visibility' });
      };
      if (groups.length) ScrollTrigger.batch(groups, { start: 'top 92%', once: true, onEnter: function (batch) {
        var els = []; batch.forEach(function (g) { els = els.concat(partsOf(g)); }); show(els);
      } });

      // The pack figure: the four parts lift off the clipboard, top one first.
      var fig = document.querySelector('.shop .pack-fig-svg');
      var layers = fig ? gsap.utils.toArray('[data-pf="layer"]', fig) : [];
      var posts = fig ? gsap.utils.toArray('[data-pf="post"]', fig) : [];
      var moved = [];
      if (fig && layers.length && below(fig)) {
        moved = layers.concat(posts);
        gsap.set(layers, { y: function (i, el) { return parseFloat(el.getAttribute('data-drop')) || 0; } });
        gsap.set(posts, { autoAlpha: 0 });
        gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 80%', once: true } })
          .to(layers, { y: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.09, from: 'end' }, clearProps: 'transform' })
          .to(posts, { autoAlpha: 1, duration: 0.3, ease: 'power1.out', clearProps: 'opacity,visibility' }, '-=0.35');
      }

      // Home: the matching figure. The route dots appear in order, then the chosen card rises out of the rack.
      var mf = document.querySelector('.match-fig');
      if (mf && below(mf)) {
        var dots = gsap.utils.toArray('[data-mf="route"] circle', mf), pick = mf.querySelector('[data-mf="pick"]'), nums = gsap.utils.toArray('[data-mf="num"]', mf), tick = mf.querySelector('[data-mf="tick"]');
        var mfAll = dots.concat(nums, [pick, tick]);
        moved = moved.concat(mfAll);
        gsap.set(dots.concat(nums, [tick]), { autoAlpha: 0 });
        gsap.set(pick, { y: 22 });
        gsap.timeline({ scrollTrigger: { trigger: mf, start: 'top 78%', once: true }, defaults: { ease: 'power3.out' } })
          .to(nums[0], { autoAlpha: 1, duration: 0.25 })
          .to(dots.slice(0, 6), { autoAlpha: 1, duration: 0.2, stagger: 0.05 })
          .to(nums[1], { autoAlpha: 1, duration: 0.25 }, '<0.15')
          .to(pick, { y: 0, duration: 0.6 }, '<')
          .to(dots.slice(6), { autoAlpha: 1, duration: 0.2, stagger: 0.05 })
          .to(nums[2], { autoAlpha: 1, duration: 0.25 }, '<0.15')
          .to(tick, { autoAlpha: 1, duration: 0.3 })
          .set(mfAll, { clearProps: 'transform,opacity,visibility' });
      }

      // Home: the note pages start as one stack and fan out over the desk.
      var fan = document.querySelector('.px-fan');
      var pages = fan ? gsap.utils.toArray('.px-p', fan) : [];
      if (fan && pages.length && below(fan)) {
        moved = moved.concat(pages);
        gsap.from(pages, { rotation: 0, x: function (i) { return (1.5 - i) * fan.offsetWidth * 0.2; }, duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'transform',
          scrollTrigger: { trigger: fan, start: 'top 80%', once: true } });
      }

      // Home: the 2025 results count up once. Only figures already printed on the page; the final text is restored exactly.
      var cells = gsap.utils.toArray('.home .rx .results-table td:last-child').filter(function (td) { return /^\d+%/.test(td.textContent.trim()) && below(td); });
      cells.forEach(function (td) {
        var full = td.textContent, n = parseInt(full, 10), rest = full.trim().replace(/^\d+/, ''), o = { v: 0 };
        td.setAttribute('aria-label', full.trim());
        ScrollTrigger.create({ trigger: td, start: 'top 90%', once: true, onEnter: function () {
          gsap.to(o, { v: n, duration: 0.9, ease: 'power2.out', onUpdate: function () { td.textContent = Math.round(o.v) + rest; }, onComplete: function () { td.textContent = full; } });
        } });
      });

      // Safety net: when scrolling stops, anything on or above the screen that is still hidden is shown.
      var onEnd = function () {
        var late = all.filter(function (el) { return el.getBoundingClientRect().top < window.innerHeight && getComputedStyle(el).visibility === 'hidden' && !gsap.isTweening(el); });
        if (late.length) show(late);
      };
      ScrollTrigger.addEventListener('scrollEnd', onEnd);

      // Keyboard users: the first Tab shows everything at once, so focus never lands on a hidden control.
      var showAll = function (e) {
        if (e.key !== 'Tab') return;
        document.removeEventListener('keydown', showAll);
        ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
        gsap.killTweensOf(all.concat(moved));
        gsap.set(all.concat(moved), { clearProps: 'transform,opacity,visibility' });
      };
      document.addEventListener('keydown', showAll);

      return function () {
        document.removeEventListener('keydown', showAll);
        ScrollTrigger.removeEventListener('scrollEnd', onEnd);
        gsap.set(all.concat(moved), { clearProps: 'all' });
      };
    });
  }

  // GSAP is fetched only when the visitor first scrolls, taps or presses a key, so page load carries
  // no animation code at all. Under prefers-reduced-motion it is never fetched.
  var LIBS = [
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js', 'sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc'],
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js', 'sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh']
  ];
  var EVENTS = ['scroll', 'pointerdown', 'touchstart', 'keydown'];
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    EVENTS.forEach(function (n) { window.removeEventListener(n, load); });
    var next = function (i) {
      if (i === LIBS.length) { if (window.gsap && window.ScrollTrigger) { window.gsap.registerPlugin(window.ScrollTrigger); setUp(); } return; }
      var s = document.createElement('script');
      s.src = LIBS[i][0]; s.integrity = LIBS[i][1]; s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer';
      s.onload = function () { next(i + 1); };
      document.head.appendChild(s);
    };
    next(0);
  }
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Wait until the page has been still for a moment before fetching: ScrollTrigger measures the page when it
  // starts, and doing that in the middle of a smooth scroll (the first tap on "Find my Specialist") would cut
  // the scroll short.
  var timer = 0;
  function arm() { clearTimeout(timer); timer = setTimeout(function () { window.removeEventListener('scroll', arm); EVENTS.forEach(function (n) { window.removeEventListener(n, arm); }); load(); }, 350); }
  EVENTS.forEach(function (n) { window.addEventListener(n, arm, { passive: true }); });
})();
