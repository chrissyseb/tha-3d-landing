/* VocaBobby day/night: follows the device unless the player picked a look (shared with the game, key vb_skin) */
(function(){var q=matchMedia('(prefers-color-scheme: dark)');function p(){try{return localStorage.getItem('vb_skin')}catch(e){return null}}
function a(){var v=p(),n=v?v==='night':q.matches;document.documentElement.classList.toggle('night',n)}a();q.addEventListener&&q.addEventListener('change',a);addEventListener('storage',a)})();
