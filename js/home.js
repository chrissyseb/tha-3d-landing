/* Home page helpers. No network calls and no form posts here.
   1. Hero quick start: the exam chosen in the hero is carried into the enquiry form, then we scroll to it.
   2. Drawers: a link to something inside a closed <details> opens it first, so every #anchor still lands. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var behavior = reduce ? 'auto' : 'smooth';

  // 1. Hero quick start
  var qs = document.getElementById('quick-start');
  var wizard = document.getElementById('wizard');
  if (qs && wizard) {
    qs.addEventListener('submit', function (e) {
      e.preventDefault();
      var from = document.getElementById('qs-level');
      var to = document.getElementById('w-level');
      if (from && to && from.value) {
        to.value = from.value;
        to.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var target = document.getElementById('match') || wizard;
      var next = from && from.value ? document.getElementById('w-name') : to;
      // scroll on the next frame (after the form has redrawn its subjects), focus once the scroll has settled
      requestAnimationFrame(function () {
        var y = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: y, behavior: behavior });
        setTimeout(function () { if (next) next.focus({ preventScroll: true }); }, reduce ? 0 : 900);
      });
    });
  }

  // 2. Drawers
  function openFor(id) {
    if (!id) return null;
    var el = document.getElementById(id);
    if (!el) return null;
    var d = el.closest('details:not([open])');
    while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details:not([open])'); }
    if (el.tagName === 'DETAILS') el.open = true;
    return el;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    var closed = el.closest('details:not([open])') || (el.tagName === 'DETAILS' && !el.open);
    if (!closed) return;
    e.preventDefault();
    openFor(id);
    el.scrollIntoView({ behavior: behavior, block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });
  if (location.hash.length > 1) {
    var first = openFor(decodeURIComponent(location.hash.slice(1)));
    if (first) setTimeout(function () { first.scrollIntoView({ block: 'start' }); }, 60);
  }
})();
