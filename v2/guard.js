/* Build guard: a production build stops while any stand-in remains. Previews build normally. */
const fs = require("fs"), path = require("path");
const items = JSON.parse(fs.readFileSync(path.join(__dirname, "placeholders.json"), "utf8")).items, left = items.filter(x => x.real === false);
if (process.env.VERCEL_ENV === "production" && left.length) {
  console.error("Refusing a production build. Stand-ins still in place: " + left.map(x => x.id).join(", ") + ". See v2/placeholders.md.");
  process.exit(1);
}
console.log("guard ok: " + (process.env.VERCEL_ENV || "local") + ", " + left.length + " stand-ins");
