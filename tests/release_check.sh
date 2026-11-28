#!/usr/bin/env bash
# Release gate. Run from anywhere: bash tests/release_check.sh [--long]
cd "$(dirname "$0")/.." || exit 1
FAIL=0; f(){ echo "FAIL: $*"; FAIL=1; }
for j in api/*.js; do node --check "$j" 2>/dev/null || f "syntax $j"; done
node -e '
const fs=require("fs");for(const p of ["index.html","record.html","team.html","account.html","lists.html","admin.html"]){if(!fs.existsSync(p))continue;
const h=fs.readFileSync(p,"utf8");const re=/<script(?![^>]*\b(src|type="application\/ld\+json"))[^>]*>([\s\S]*?)<\/script>/g;let m,k=0;
while((m=re.exec(h))){k++;try{new Function(m[2])}catch(e){console.log("FAIL: inline script "+p+"#"+k+": "+e.message);process.exitCode=1}}}' || FAIL=1
for j in vo.js psle.js creatures.js creatures-art.js bobby.js intro.js skin.js voice.js; do [ -f "$j" ] && { node --check "$j" 2>/dev/null || f "syntax $j"; }; done
node -e 'const s=require("fs").readFileSync("sw.js","utf8");const L=JSON.parse(s.match(/SHELL = (\[.*?\]);/)[1].replace(/\x27/g,"\""));const fs=require("fs");L.forEach(p=>{const f=p==="/"?"index.html":p.slice(1);if(!fs.existsSync(f)){console.log("FAIL: sw SHELL missing "+p);process.exitCode=1}})' || FAIL=1
N=$(ls api/*.js | grep -v '/_' | wc -l); [ "$N" -le 12 ] || f "api functions $N > 12"; echo "api functions: $N"
(python3 -m http.server 8123 >/dev/null 2>&1 &) ; sleep 1
for t in tests/*.mjs; do timeout 180 node "$t" >/tmp/rc.out 2>&1 || { grep -q "Cannot find package" /tmp/rc.out && echo "WARN missing deps: $t" || { f "$t"; tail -5 /tmp/rc.out; }; }; done
for t in tests/*_test.py; do timeout 300 python3 "$t" >/tmp/rc.out 2>&1 || { grep -q "ModuleNotFoundError" /tmp/rc.out && echo "WARN missing deps: $t" || { f "$t"; tail -5 /tmp/rc.out; }; }; done
timeout 900 python3 tests/smoke_release.py "$@" || f smoke_release
[ $FAIL = 0 ] && echo "RELEASE CHECK: PASS" || echo "RELEASE CHECK: FAIL"; exit $FAIL
