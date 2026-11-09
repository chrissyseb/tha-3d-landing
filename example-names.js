/* Names on the landing page (the progress graph and the parent-report card).
   Defaults are here; Chrissy changes them in ?admin → Student names (saved in the store, shown at once). */
window.EXAMPLE_NAMES = {
  chart:  {name: "Mei Ling", level: "JC1"},
  parent: {name: "Ryan", level: "JC2"},
};
async function showExampleNames(){
  try{ const r = await fetch("/api/mark", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({exnames: true})}).then(x => x.json());
    Object.assign(window.EXAMPLE_NAMES, r.names || {}); }catch{}
  document.querySelectorAll("[data-ex]").forEach(el => {
    const e = window.EXAMPLE_NAMES[el.dataset.ex]; if(e) el.textContent = e.level ? `${e.name}, ${e.level}` : e.name;
  });
}
document.addEventListener("DOMContentLoaded", showExampleNames);
