/* © 2026 Christine Sebastian. All rights reserved. EssayLabsg™ website and marking engine. Unauthorised copying, reproduction or reuse is prohibited. */
// Examiner analytics: deterministic measurements of an essay, computed before the AI marks it.
// The numbers anchor the AI's marking (it is told to treat them as facts) and are shown to the student.
// Files starting with "_" in /api are not served as endpoints.

const STOP = new Set(("a an the and or but if so of to in on at by for with from as is are was were be been being it its this that these those " +
  "i me my we our you your he him his she her they them their there here what which who whom when where why how not no nor do does did done " +
  "have has had will would can could should shall may might must than then also just only very too more most much many such into over about " +
  "up out off all any some each both few other own same one two s t am because while until again further once").split(" "));

// Discourse markers grouped by the job they do in an argument.
const CONNECTIVES = {
  addition: ["furthermore", "moreover", "in addition", "additionally", "besides", "what is more", "likewise", "similarly"],
  contrast: ["however", "nevertheless", "nonetheless", "on the other hand", "in contrast", "conversely", "yet", "whereas", "despite", "in spite of", "although", "even though"],
  cause: ["therefore", "thus", "hence", "consequently", "as a result", "because of this", "this means", "accordingly", "it follows that"],
  example: ["for example", "for instance", "such as", "a case in point", "to illustrate", "notably", "in particular", "evidently"],
  concession: ["admittedly", "granted", "it is true that", "while it is true", "some may argue", "critics argue", "proponents", "detractors", "opponents"],
  conclusion: ["in conclusion", "ultimately", "on balance", "all things considered", "to conclude", "in sum", "overall"],
};
const COUNTER = ["however, some", "some may argue", "some might argue", "some people may argue", "some people argue", "critics", "opponents", "detractors", "proponents",
  "admittedly", "granted", "it is true that", "on the other hand", "others believe", "others argue", "skeptics", "sceptics", "conversely", "one could argue", "it can be argued"];
const EVALUATE = ["to a large extent", "to a certain extent", "to some extent", "outweigh", "more significant", "more important", "less significant", "on balance", "ultimately",
  "depends on", "the extent to which", "far more", "crucially", "the real issue", "more convincing", "less convincing", "in the long run", "in the short term", "while this", "this is not to say", "however, this"];
const VAGUE = ["in today's modern world", "in today's world", "in this modern world", "since time immemorial", "since the dawn of time", "nowadays", "a lot of", "lots of", "things",
  "stuff", "many studies have shown", "studies show", "everyone knows", "it is a well-known fact", "in my opinion", "i think", "i feel", "very very", "and so on", "etc"];
const SG = ["singapore", "singaporean", "hdb", "moe", "cpf", "skillsfuture", "lta", "mrt", "nea", "smart nation", "circuit breaker", "psle", "budget 20", "ministry of",
  "parliament", "pap", "jurong", "punggol", "tampines", "sentosa", "changi", "woodlands", "our tampines hub", "community club", "grassroots", "ns ", "national service",
  "cecas", "pdpa", "pofma", "cpib", "gst", "coe", "erp", "bto", "hawker", "kampung", "racial harmony", "total defence", "forward singapore", "safe distancing", "tracetogether",
  "mindef", "mom ", "msf", "ica", "nparks", "pub ", "newater", "nus", "ntu", "smu", "sutd", "polytechnic", "ite ", "temasek", "gic", "dbs", "grab", "shopee", "lee kuan yew", "lawrence wong"];
const SENSES = ["saw", "glimpsed", "stared", "glared", "gazed", "heard", "whispered", "screamed", "roared", "echoed", "smelled", "smelt", "stench", "aroma", "fragrance",
  "tasted", "bitter", "salty", "sour", "felt", "touched", "rough", "smooth", "icy", "warm", "trembled", "shivered", "pounded", "thumped", "glistened", "shimmered", "creaked", "rustled"];
const FEELINGS = ["afraid", "scared", "terrified", "anxious", "nervous", "relieved", "guilty", "ashamed", "proud", "furious", "angry", "jealous", "lonely", "grateful", "embarrassed",
  "excited", "devastated", "overjoyed", "frustrated", "regret", "remorse", "dread", "panic", "elated", "miserable", "hopeful", "determined"];
// A short academic word list (headwords common in top-band GP and O-Level scripts).
const ACADEMIC = ("analyse analysis approach assess assume authority benefit concept consequence consist constitute context contract create data define derive distribute " +
  "economy environment establish estimate evident export factor finance formula function identify income indicate individual interpret involve issue labour legal legislate " +
  "major method occur percent period policy principle proceed process require research respond role section sector significant similar source specific structure theory vary " +
  "achieve acquire administrate affect appropriate aspect assist category chapter commission community complex compute conclude conduct consequent construct consume credit " +
  "culture design distinct element equate evaluate feature final focus impact injure institute invest item journal maintain normal obtain participate perceive positive " +
  "potential previous primary purchase range region regulate relevant reside resource restrict secure seek select site strategy survey text tradition transfer " +
  "alternative circumstance comment compensate component consent considerable constant constrain contribute convene coordinate core corporate correspond criteria deduce " +
  "demonstrate document dominate emphasis ensure exclude framework fund illustrate immigrate imply initial instance interact justify layer link locate maximise minor negate " +
  "outcome partner philosophy physical proportion publish react register rely remove scheme sequence sex shift specify sufficient task technical technique technology valid volume " +
  "ambiguous inevitable paradox pragmatic scrutiny unprecedented sustainable mitigate exacerbate undermine compelling nuanced profound pervasive detrimental intrinsic " +
  "autonomy accountability equity meritocracy disparity marginalised vulnerable discourse ideology legitimacy").split(" ");
const ACAD = ACADEMIC.map(w => w.slice(0, Math.max(5, w.length - 2)));

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const countPhrase = (low, ph) => { const m = low.match(new RegExp("(^|[^a-z])" + esc(ph) + "(?=[^a-z]|$)", "g")); return m ? m.length : 0; };
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function analyse(text, paper, question){
  const raw = String(text || "").replace(/\r/g, "").trim();
  if(raw.split(/\s+/).length < 40) return null;
  const low = " " + raw.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"') + " ";
  const paras = raw.split(/\n\s*\n|\n(?=\s*[A-Z"“])/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 4);
  const sentences = raw.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g)?.map(s => s.trim()).filter(s => /[a-z]/i.test(s)) || [];
  const words = raw.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z][a-z'-]*/g) || [];
  const nW = words.length;

  // Sentence variety: average length, spread, and how many run long or run short.
  const lens = sentences.map(s => (s.match(/[A-Za-z][A-Za-z'-]*/g) || []).length).filter(n => n > 0);
  const avg = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - avg) ** 2, 0) / (lens.length || 1));
  const longS = lens.filter(n => n > 35).length, shortS = lens.filter(n => n <= 6).length;
  const openers = sentences.map(s => (s.match(/[A-Za-z']+/) || [""])[0].toLowerCase());
  const openerTop = Object.entries(openers.reduce((m, w) => (m[w] = (m[w] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1])[0] || ["", 0];

  // Vocabulary range: moving-average type-token ratio over 50-word windows (fair across essay lengths).
  const content = words.filter(w => !STOP.has(w) && w.length > 2);
  let mattr = 0, win = 50;
  if(words.length >= win){ let sum = 0, n = 0; for(let i = 0; i + win <= words.length; i += 5){ sum += new Set(words.slice(i, i + win)).size / win; n++; } mattr = sum / n; }
  else mattr = new Set(words).size / (words.length || 1);
  const acad = [...new Set(content.filter(w => ACAD.some(a => w.startsWith(a))))];
  const freq = content.reduce((m, w) => (m[w] = (m[w] || 0) + 1, m), {});
  const qWords = new Set(String(question || "").toLowerCase().match(/[a-z]{4,}/g) || []);
  const overused = Object.entries(freq).filter(([w, c]) => c >= Math.max(4, nW / 90) && !qWords.has(w)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([w, c]) => ({word: w, times: c}));

  // Cohesion: which kinds of connective are used, and how many different ones.
  const conn = {}; let connTotal = 0; const connUsed = new Set();
  for(const [k, list] of Object.entries(CONNECTIVES)){ let c = 0; for(const ph of list){ const n = countPhrase(low, ph); if(n){ c += n; connUsed.add(ph); } } conn[k] = c; connTotal += c; }
  const and_then = countPhrase(low, "and then") + countPhrase(low, "then");

  // Argument moves.
  const counter = COUNTER.filter(ph => countPhrase(low, ph));
  const evaluate = EVALUATE.filter(ph => countPhrase(low, ph));
  const vague = VAGUE.filter(ph => countPhrase(low, ph));
  const sg = [...new Set(SG.filter(ph => countPhrase(low, ph.trim())).map(s => s.trim()))];
  const numbers = (raw.match(/\b(19|20)\d{2}\b|\b\d+(\.\d+)?\s?(%|per cent|percent|million|billion|thousand)/gi) || []).length;
  const named = new Set((raw.replace(/(^|[.!?]\s+|\n)\s*["“]?[A-Z][a-z]+/g, " ").match(/\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*/g) || []).filter(w => !/^(I|However|The|This|In|It|For|But|And)$/.test(w))).size;
  const contractions = (raw.match(/\b\w+'(t|re|ve|ll|d|s|m)\b/gi) || []).filter(w => !/'s$/i.test(w)).length;
  const passive = (low.match(/\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?\w+(ed|en)\b/g) || []).length;
  const questions = (raw.match(/\?/g) || []).length;

  // Topic sentences: does each body paragraph's opening sentence use the question's key words?
  const bodies = paras.slice(1, -1);
  const onTopic = qWords.size ? bodies.filter(pp => { const first = (pp.match(/[^.!?]+/) || [""])[0].toLowerCase(); return [...qWords].some(w => first.includes(w.slice(0, 5))); }).length : null;

  // Narrative craft.
  const dialogue = (raw.match(/["“][^"”]{2,}["”]/g) || []).length;
  const senses = SENSES.filter(w => countPhrase(low, w));
  const feelings = FEELINGS.filter(w => countPhrase(low, w));
  const tell = (low.match(/\b(i|he|she|we|they)\s+(was|were|felt)\s+(very\s+|so\s+|really\s+)?(scared|happy|sad|angry|nervous|afraid|excited|shocked|worried)\b/g) || []).length;

  const m = {
    words: nW, paragraphs: paras.length, sentences: lens.length,
    avg_sentence: round(avg), sentence_spread: round(sd), long_sentences: longS, short_sentences: shortS,
    repeated_opener: openerTop[1] >= Math.max(4, lens.length / 4) ? {word: openerTop[0], times: openerTop[1]} : null,
    vocab_range: round(mattr * 100, 0), academic_words: acad.slice(0, 12), academic_count: acad.length, overused,
    connectives: conn, connective_variety: connUsed.size, connectives_per_100: round(connTotal / nW * 100),
    counter_argument: counter, evaluation: evaluate, vague_phrases: vague,
    local_examples: sg, specific_evidence: numbers + Math.min(named, 30), numbers, contractions, passive, rhetorical_questions: questions,
    topic_sentences_on_question: onTopic, body_paragraphs: bodies.length,
    dialogue, sense_words: senses, feeling_words: feelings, telling_not_showing: tell, and_then,
  };
  m.flags = flags(m, paper);
  return m;
}

// Plain-language findings, each tied to the criterion it is evidence for.
function flags(m, paper){
  const id = paper.id, f = [];
  const add = (level, criterion, text) => f.push({level, criterion, text});
  const argu = ["gp", "gpaq", "olsw", "ib2", "ss", "hist", "geog"].includes(id) || (m.counter_argument.length + m.evaluation.length > 1);
  const narrative = ["psle"].includes(id) || (m.dialogue >= 2 && !argu);
  const range = {psle: [150, 450], pslesw: [80, 250], olang: [350, 600], olsw: [250, 400], gp: [500, 900], igcse: [350, 650]}[id];
  if(range && m.words < range[0]) add("red", "Length", `${m.words} words: under the ${range[0]}-word length this paper expects, so content will be thin.`);
  if(range && m.words > range[1] * 1.15) add("amber", "Length", `${m.words} words: well over the usual ${range[1]}. Longer is not better if it costs time or precision.`);
  if(m.sentence_spread < 4 && m.sentences >= 8) add("amber", "Language", `Sentence lengths barely vary (spread ${m.sentence_spread} words). Mix short, punchy sentences with longer complex ones.`);
  else if(m.sentence_spread >= 7) add("green", "Language", `Good sentence variety (spread ${m.sentence_spread} words).`);
  if(m.long_sentences >= 2) add("amber", "Language", `${m.long_sentences} sentences run over 35 words. Split them so each makes one clear point.`);
  if(m.repeated_opener) add("amber", "Language", `${m.repeated_opener.times} sentences start with "${m.repeated_opener.word}". Vary how sentences begin.`);
  if(m.vocab_range < 72) add("amber", "Language", `Vocabulary range is narrow (${m.vocab_range}/100). Words repeat often within each stretch of writing.`);
  else if(m.vocab_range >= 86) add("green", "Language", `Wide vocabulary range (${m.vocab_range}/100).`);
  if(m.academic_count >= 8) add("green", "Language", `Precise academic vocabulary (${m.academic_words.slice(0, 4).join(", ")}).`);
  if(m.overused.length) add("amber", "Language", `Overused: ${m.overused.map(o => `"${o.word}" ×${o.times}`).join(", ")}.`);
  if(m.vague_phrases.length) add("red", "Language", `Generic phrases examiners mark down: ${m.vague_phrases.map(v => `"${v}"`).join(", ")}.`);
  if(argu){
    if(!m.counter_argument.length) add("red", "Content", "No counter-argument found. Top-band arguments raise the other side and answer it.");
    else add("green", "Content", `Counter-argument signalled ("${m.counter_argument[0]}").`);
    if(!m.evaluation.length) add("red", "Content", "No weighing language (e.g. \"to a large extent\", \"outweigh\", \"on balance\"). The argument asserts but does not evaluate.");
    else add("green", "Content", `Evaluation present (${m.evaluation.slice(0, 3).map(v => `"${v}"`).join(", ")}).`);
    if(["gp", "gpaq", "ss"].includes(id)){
      const specific = m.local_examples.filter(x => !/^singapore(an)?$/.test(x));
      if(!m.local_examples.length) add("red", "Content", "No Singapore examples found. GP and Social Studies reward specific local evidence.");
      else if(!specific.length) add("amber", "Content", "Mentions Singapore but names no specific local policy, place, event or figure.");
      else add("green", "Content", `Local examples: ${specific.slice(0, 4).join(", ")}.`);
    }
    if(m.specific_evidence < Math.max(3, m.body_paragraphs)) add("amber", "Content", "Few specific facts (names, dates, figures). Each body paragraph needs at least one checkable example.");
    if(m.contractions >= 2) add("amber", "Language", `${m.contractions} contractions (e.g. "don't"). Use full forms in formal writing.`);
    if(m.topic_sentences_on_question !== null && m.body_paragraphs && m.topic_sentences_on_question < m.body_paragraphs)
      add("amber", "Content", `${m.body_paragraphs - m.topic_sentences_on_question} of ${m.body_paragraphs} body paragraphs open without using the question's key words. Answer the question in every topic sentence.`);
    if(m.connectives.contrast === 0) add("amber", "Organisation", "No contrast connectives (however, nevertheless, whereas). Ideas are not weighed against each other.");
  }
  if(narrative){
    if(m.telling_not_showing) add("amber", "Content", `${m.telling_not_showing} place${m.telling_not_showing > 1 ? "s" : ""} where feelings are told ("I was very scared") rather than shown.`);
    if(m.sense_words.length < 3) add("amber", "Content", "Few sensory details. Add what was seen, heard and felt at the climax.");
    else add("green", "Content", `Uses the senses (${m.sense_words.slice(0, 4).join(", ")}).`);
    if(!m.feeling_words.length) add("amber", "Content", "Feelings are not named or shown. Examiners want the character's reaction and reflection.");
    if(m.and_then >= 4) add("amber", "Organisation", `"then" appears ${m.and_then} times. Events are listed rather than built up.`);
    if(m.dialogue >= 1) add("green", "Content", `Uses dialogue (${m.dialogue} line${m.dialogue > 1 ? "s" : ""}).`);
  }
  if(m.connective_variety >= 6) add("green", "Organisation", `Varied linking words (${m.connective_variety} different connectives).`);
  else if(m.connective_variety <= 2 && m.words > 200) add("amber", "Organisation", "Very few linking words. Paragraphs do not signal how ideas connect.");
  if(m.paragraphs <= 2 && m.words > 250) add("red", "Organisation", "The essay is not paragraphed. Each idea needs its own paragraph.");
  return f.slice(0, 12);
}

// The facts block given to the AI so its marks agree with what was measured.
function promptBlock(m){
  if(!m) return "";
  const lines = m.flags.map(x => `- [${x.criterion}] ${x.text}`).join("\n");
  return `MEASURED FACTS (computed by our analysis engine from the text; treat them as true, use them as evidence, and never contradict them):
- ${m.words} words, ${m.paragraphs} paragraphs, ${m.sentences} sentences, average ${m.avg_sentence} words per sentence (spread ${m.sentence_spread}).
- Vocabulary range ${m.vocab_range}/100; academic words used: ${m.academic_words.join(", ") || "none"}.
- Connectives: ${Object.entries(m.connectives).map(([k, v]) => `${k} ${v}`).join(", ")}; ${m.connective_variety} different.
- Counter-argument signals: ${m.counter_argument.join(", ") || "none"}. Evaluation language: ${m.evaluation.join(", ") || "none"}. Singapore references: ${m.local_examples.join(", ") || "none"}.
${lines}
`;
}

module.exports = {analyse, promptBlock};
