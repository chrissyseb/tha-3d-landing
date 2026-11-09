/* Exam countdown (official dates only). Source: SEAB 2026 Singapore-Cambridge GCE A-Level Examination Timetable,
   updated 13 Feb 2026 (https://go.gov.sg/2026-a-level-exam-cal). O-Level English and humanities papers ended 29 Oct 2026
   (https://go.gov.sg/2026-o-level-exam-cal); PSLE written papers are over. Add 2027 dates here once SEAB publishes them. */
window.EXAM_DATES = [
  {name: "A-Level General Paper 1", date: "2026-11-02T08:00:00+08:00"},
  {name: "A-Level General Paper 2", date: "2026-11-04T08:00:00+08:00"},
];
(function(){
  const el = document.getElementById("examCd"); if(!el) return;
  const now = Date.now(), DAY = 864e5;
  const next = window.EXAM_DATES.map(e => ({...e, t: Date.parse(e.date)})).filter(e => e.t > now - 4 * 3600e3).sort((a, b) => a.t - b.t)[0];
  if(!next || next.t - now > 120 * DAY){ el.textContent = "2027 Exams: Start Practising Now"; return; }
  const sg = t => new Date(t + 8 * 3600e3).toISOString().slice(0, 10), days = Math.round((Date.parse(sg(next.t)) - Date.parse(sg(now))) / DAY);
  el.textContent = days <= 0 ? `${next.name}: Today. Good Luck!` : `${next.name} in ${days} Day${days === 1 ? "" : "s"}`;
})();
