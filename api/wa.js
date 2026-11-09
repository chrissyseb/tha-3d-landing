/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Masterclass enquiries: /api/wa?topic=<class name> redirects to WhatsApp with a prefilled message.
// The number lives only in the WA_NUMBER env var, never in the page code. Without it, fall back to the Message us form.
module.exports = (req, res) => {
  const num = String(process.env.WA_NUMBER || "").replace(/\D/g, "");
  const topic = String((req.query && req.query.topic) || "").replace(/[^\w &().,'/-]/g, "").trim().slice(0, 80);
  // ?about=permission: permission requests from the Terms page.
  const custom = String((req.query && req.query.text) || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 500);
  const text = custom ? custom : (req.query && req.query.about) === "privacy" ? "Hi, I'd like to ask about my personal data on EssayLabsg™." : (req.query && req.query.about) === "permission" ? "Hi, I'd like to ask for permission to use EssayLabsg™ content or marks." : topic ? `Hi, I'd like to ask about the ${topic} Masterclass: dates, availability and rates.` : "Hi, I'd like to ask about your Masterclasses and classes.";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.statusCode = 302;
  res.setHeader("Location", num ? "https://wa.me/" + num + "?text=" + encodeURIComponent(text) : "/app.html#msg?text=" + encodeURIComponent(text));
  res.end();
};
