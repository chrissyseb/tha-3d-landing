#!/usr/bin/env python3
"""Build api/_dict.js: compact open-licence word data for custom-list auto-build.
Sources: Open English WordNet 2024 (CC BY 4.0), Tatoeba via manythings fra-eng (CC BY 2.0 FR),
CEFR-J 1.5 + Octanove C1/C2 (levels), CMUdict via `pronouncing` (stress), pyphen (hyphenation), wordfreq (fallback level)."""
import csv, json, re, sys
import wn, pyphen, pronouncing
from wordfreq import zipf_frequency

OLP = '/home/claude/olp'; OUT = sys.argv[1]
POSMAP = {'noun': 'n', 'verb': 'v', 'adjective': 'a', 'adverb': 'r'}
LV = {}
def addlv(word, pos, lvl):
    for w in word.split('/'):
        w = w.strip().lower()
        if re.fullmatch(r"[a-z][a-z'-]{1,18}", w) and pos in POSMAP:
            k = (w, POSMAP[pos]); old = LV.get(k)
            if not old or lvl < old: LV[k] = lvl
for r in csv.DictReader(open(f'{OLP}/cefrj-vocabulary-profile-1.5.csv')): addlv(r['headword'], r['pos'], r['CEFR'][:2])
for r in csv.DictReader(open(f'{OLP}/octanove-vocabulary-profile-c1c2-1.0.csv')): addlv(r['headword'], r['pos'], r['CEFR'][:2])

BADS = re.compile(r"\b(kill\w*|die[ds]?|dead|death|murder\w*|gun\w*|sex\w*|drunk|beer|wine|whisky|vodka|alcohol|drug\w*|suicide|naked|hell|damn|god|stupid|idiot|hate|bomb\w*|war|blood\w*|weapon\w*|knife|shoot\w*|prison|police|cigarette\w*|smok\w*|girlfriend|boyfriend|kiss\w*|marry|married|divorce\w*|pregnant|ugly|fat)\b", re.I)
# Tatoeba sentences (English side), with ids for attribution
SENT = {}
for line in open('/tmp/fe/data/fra.txt', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) < 3: continue
    en = p[0]; m = re.search(r'tatoeba\.org #(\d+)', p[2])
    if not m or BADS.search(en): continue
    n = len(en.split())
    if n < 5 or n > 14 or '"' in en: continue
    for tok in set(re.findall(r"[a-z]+", en.lower())):
        L = SENT.setdefault(tok, [])
        if len(L) < 6: L.append((en, int(m.group(1))))

dic = pyphen.Pyphen(lang='en_GB')
def syll(w):
    parts = dic.inserted(w).split('-')
    ph = pronouncing.phones_for_word(w)
    if ph:
        st = [int(c) for c in re.findall(r'\d', ph[0])]
        if len(st) == len(parts) and len(parts) > 1 and 1 in st:
            i = st.index(1); parts[i] = parts[i].upper()
    return '·'.join(parts) if len(parts) > 1 else w

def tip(w):
    if len(w) < 6: return ''
    d = re.findall(r'([a-z])\1', w)
    if 'ie' in w or 'ei' in w:
        if re.search(r'cei', w): return 'i before e, except after c: "cei".'
    if w.endswith('ible'): return 'Ends in -ible, not -able.'
    if w.endswith('ence') or w.endswith('ent') and len(w) > 7: return 'Ends in -e' + w[w.rfind('e')+1:] + ', not -a' + w[w.rfind('e')+1:] + '.'
    for s, t in (('kn', 'silent k'), ('wr', 'silent w'), ('mb', 'silent b'), ('gh', 'silent gh'), ('ps', 'silent p')):
        if w.startswith(s) or (s in ('mb', 'gh') and s in w): return f'Watch the {t}.'
    if len(d) >= 2: return 'Two sets of double letters: ' + ', '.join(c + c for c in d) + '.'
    if len(d) == 1 and len(w) >= 7: return f'Double {d[0]}: "{d[0]*2}".'
    return ''

def blank(sent, w):
    forms = {w, w + 's', w + 'es', w + 'ed', w + 'd', w + 'ing', w[:-1] + 'ing' if w.endswith('e') else w, w[:-1] + 'ies' if w.endswith('y') else w}
    for f in sorted(forms, key=len, reverse=True):
        r = re.compile(r'\b' + re.escape(f) + r'\b', re.I)
        if r.search(sent): return r.sub('___', sent, count=1), f
    return None, None

def lvl_from_freq(w):
    z = zipf_frequency(w, 'en')
    return 'A1' if z >= 5.6 else 'A2' if z >= 5 else 'B1' if z >= 4.4 else 'B2' if z >= 3.8 else 'C1' if z >= 3.3 else 'C2'

oewn = wn.Wordnet('oewn:2024')
cands = set(w for w, _ in LV)
for wd in oewn.words():
    l = wd.lemma()
    if re.fullmatch(r'[a-z]{3,16}', l) and zipf_frequency(l, 'en') >= 3.4: cands.add(l)
out = []; stats = {'high': 0, 'med': 0, 'low': 0}
for w in sorted(cands):
    poss = [p for (x, p) in LV if x == w]
    syns = []
    for p in (poss or ['n', 'v', 'a', 'r']):
        ss = oewn.synsets(w, pos=p) + (oewn.synsets(w, pos='s') if p == 'a' else [])
        if ss: syns.append((p, ss))
    if not syns:
        out.append([w, LV.get((w, poss[0])) if poss else lvl_from_freq(w), poss[0] if poss else '', '', '', 0, syll(w), tip(w), 0]); stats['low'] += 1; continue
    # prefer the POS the level list gives, then most-senses
    if poss:
        lo = min(LV[(w, q)] for q, _ in syns if (w, q) in LV) if any((w, q) in LV for q, _ in syns) else None
        pool = [t for t in syns if LV.get((w, t[0])) == lo] or syns
    else: pool = syns
    p, ss = max(pool, key=lambda t: len(t[1]))
    pick = next((x for x in ss[:5] if x.definition() and not re.search(r'(?<!^)\b[A-Z][a-z]', x.definition())), ss[0])
    ss = [pick] + [x for x in ss if x is not pick]
    d = ss[0].definition() or ''
    d = re.sub(r'\s*\(.*?\)', '', d).strip()
    if len(d) > 90: d = d[:d.rfind(' ', 0, 88)] + '…'
    lvl = LV.get((w, p)); conf = 2 if lvl else 1
    lvl = lvl or lvl_from_freq(w)
    sent, sid = '', 0
    for en, i in sorted(SENT.get(w, []) + [x for f in (w + 's', w + 'ed', w + 'ing') for x in SENT.get(f, [])], key=lambda t: len(t[0])):
        b, _ = blank(en, w)
        if b: sent, sid = b, i; break
    if not sent:
        for s in ss[:3]:
            for ex in s.examples():
                b, _ = blank(ex, w)
                if b and not BADS.search(ex): sent = b[0].upper() + b[1:]; break
            if sent: break
        if not sent: conf = min(conf, 1)
    if not d: conf = 0
    stats['high' if conf == 2 else 'med' if conf == 1 else 'low'] += 1
    out.append([w, lvl, p, d, sent, sid, syll(w), tip(w), conf])
from wn.morphy import Morphy
mor = Morphy(oewn); have = {r[0]: r for r in out}; redir = {}
for r in out:
    if r[8] == 0:
        for p in ('v', 'n', 'a'):
            bs = [b for b in mor(r[0], p).get(p, set()) if b != r[0] and b in have and have[b][8] > 0]
            if bs: redir[r[0]] = bs[0]; break
from lemminflect import getAllInflections
for r in out:
    if r[8] > 0 and r[2] in ('v','n','a'):
        for forms in getAllInflections(r[0], upos={'v':'VERB','n':'NOUN','a':'ADJ'}[r[2]]).values():
            for f in forms:
                if f != r[0] and re.fullmatch(r'[a-z]+', f) and (f not in have or have[f][8] == 0) and f not in redir: redir[f] = r[0]
print('redirects', len(redir), list(redir.items())[:8])
js = '// Auto-generated by build_dict.py. Open data: Open English WordNet 2024 (CC BY 4.0), Tatoeba (CC BY 2.0 FR), CEFR-J 1.5, Octanove C1/C2 (CC BY-SA 4.0), CMUdict, pyphen.\n// Row: [word, level, pos(n/v/a/r), meaning, sentence with ___, tatoebaId, syllables, spelling tip, confidence 0-2]\nexport const DICT = JSON.parse(' + json.dumps(json.dumps(out, separators=(',', ':'), ensure_ascii=False)) + ');\nexport const REDIR = ' + json.dumps(redir) + ';\n'
open(OUT, 'w').write(js)
print(len(out), stats, round(len(js) / 1e6, 2), 'MB')
