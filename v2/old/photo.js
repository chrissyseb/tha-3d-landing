
// "Take a photo" (phones): hand the camera picture to the existing photo input so the same marking flow runs.
(() => { const cam = document.getElementById("photoCam"), ph = document.getElementById("photo"); if(!cam || !ph) return;
  cam.addEventListener("change", () => { if(!cam.files.length) return; const dt = new DataTransfer(); dt.items.add(cam.files[0]); ph.files = dt.files; ph.dispatchEvent(new Event("change", {bubbles: true})); });
  if(!matchMedia("(pointer:coarse)").matches) document.querySelector(".cam-btn")?.setAttribute("hidden", ""); })();
