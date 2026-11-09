
// Owner pass: after Chrissy logs in to ?admin on this device, marking requests carry her key (from this browser's storage only).
(() => { let k = ""; try{ k = localStorage.getItem("ec_admin") || ""; }catch{} if(!k) return;
  const f = window.fetch.bind(window); window.fetch = (u, o = {}) => { if(String(u).startsWith("/api/mark")) o = {...o, headers: {...(o.headers || {}), "X-Owner-Key": k}}; return f(u, o); }; })();
