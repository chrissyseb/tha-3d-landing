
/* Testimonials. Only real people who gave permission, in their own words (light edits only). Chrissy confirmed these are real and edited with permission (31 Oct 2026). Masterclass quotes only for now.
   name and result only where they agreed. Keep a record of each permission (and a parent's OK for under-18s). */
const TESTIMONIALS = [];  // All testimonials come from ?admin → Testimonials (Chrissy's six are seeded there, On).
let TESTI_FEATURE = null;
document.querySelectorAll(".testi-more").forEach(btn => btn.addEventListener("click", () => { const c = btn.closest(".testi-card"); btn.textContent = c.classList.toggle("open") ? "Show Less" : "Read More"; }));
