/* A small footer control that pauses the logo ring and banner. They run by default. */
(function () {
  var KEY = "el-motion-paused", root = document.documentElement, paused = false;
  try { paused = localStorage.getItem(KEY) === "1"; } catch (e) {}
  var st = document.createElement("style");
  st.textContent = "html.motion-paused *,html.motion-paused *::before,html.motion-paused *::after{animation-play-state:paused!important}html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_),html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_)::before,html.motion-paused body *:not(#_):not(#_):not(#_):not(#_):not(#_)::after{animation-play-state:paused!important}.motion-toggle:focus-visible{outline:2px solid currentColor;outline-offset:2px}.motion-toggle{display:inline-flex;align-items:center;min-height:44px;padding:0;border:0;background:none;color:inherit;font:inherit;font-size:14px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}";
  document.head.appendChild(st);
  function ready() {
    var host = document.querySelector("footer .foot-bottom"); if (!host) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "motion-toggle";
    var top = document.createElement("button"); top.type = "button"; top.className = "motion-top";
    function show() { root.classList.toggle("motion-paused", paused); b.textContent = paused ? "Play animation" : "Pause animation"; b.setAttribute("aria-pressed", paused ? "true" : "false"); top.setAttribute("aria-pressed", paused ? "true" : "false"); top.setAttribute("aria-label", paused ? "Play animation" : "Pause animation"); top.title = top.getAttribute("aria-label"); top.innerHTML = paused ? '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>'; }
    function flip() { paused = !paused; try { localStorage.setItem(KEY, paused ? "1" : "0"); } catch (e) {} show(); }
    b.addEventListener("click", flip); top.addEventListener("click", flip);
    show(); host.appendChild(b);
    var cta = document.querySelector(".nav-in>.btn, .sn-in>.sn-pill"); if (cta) cta.parentNode.insertBefore(top, cta);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
