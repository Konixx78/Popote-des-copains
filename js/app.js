/* =========================================================
   La Popote des Copains — application (sans étape de build)
   Deux modes :
   - Supabase (config.js renseigné) : comptes, partage entre membres
   - Démo (config vide)             : tout reste dans ce navigateur
   ========================================================= */
(() => {
"use strict";

const CFG = window.APP_CONFIG || {};
const CATEGORIES = ["Entrée", "Plat", "Accompagnement", "Dessert", "Apéro", "Boisson", "Sauce", "Autre"];
const APP_NAME = CFG.appName || "La Popote des Copains";

/* ---------------- Utilitaires ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const fmtDate = (iso) => { try { return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch { return iso; } };
const fmtMin = (m) => { m = Number(m) || 0; if (!m) return ""; const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? " " + String(r).padStart(2, "0") : ""}` : `${r} min`; };
const stars = (n) => n ? "★".repeat(n) + "☆".repeat(5 - n) : "";

const ICONS = {
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5A2.5 2.5 0 0 0 4 21.5"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>',
  fridge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14M9 5v2M9 13v3"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4 3 7 7 7z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12l5 5 9-10"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>',
};

/* ---------------- Ingrédients : lecture, mise à l'échelle, affichage ---------------- */
const UNIT_ALIASES = [
  ["kg", ["kg", "kilo", "kilos", "kilogramme", "kilogrammes"]],
  ["g", ["g", "gr", "gr.", "gramme", "grammes"]],
  ["mg", ["mg"]],
  ["l", ["l", "litre", "litres"]],
  ["dl", ["dl"]], ["cl", ["cl"]], ["ml", ["ml"]],
  ["c. à soupe", ["c. à soupe", "c.à.s.", "c.à.s", "c. a soupe", "c à soupe", "cuillère à soupe", "cuillères à soupe", "cuillere a soupe", "cuilleres a soupe", "càs", "cas", "cs", "c.s."]],
  ["c. à café", ["c. à café", "c.à.c.", "c.à.c", "c. a cafe", "c à café", "cuillère à café", "cuillères à café", "cuillere a cafe", "cuilleres a cafe", "càc", "cac", "cc", "c.c."]],
  ["pincée", ["pincée", "pincées", "pincee", "pincees"]],
  ["tasse", ["tasse", "tasses"]], ["verre", ["verre", "verres"]], ["bol", ["bol", "bols"]],
  ["sachet", ["sachet", "sachets"]], ["gousse", ["gousse", "gousses"]], ["tranche", ["tranche", "tranches"]],
  ["botte", ["botte", "bottes"]], ["boîte", ["boîte", "boîtes", "boite", "boites"]], ["brin", ["brin", "brins"]],
  ["feuille", ["feuille", "feuilles"]], ["noix", ["noix"]], ["filet", ["filet", "filets"]], ["morceau", ["morceau", "morceaux"]],
  ["poignée", ["poignée", "poignées", "poignee", "poignees"]], ["branche", ["branche", "branches"]], ["rouleau", ["rouleau", "rouleaux"]], ["pot", ["pot", "pots"]],
];
const WORD_UNITS = new Set(["pincée", "tasse", "verre", "bol", "sachet", "gousse", "tranche", "botte", "boîte", "brin", "feuille", "filet", "morceau", "poignée", "rouleau", "pot", "branche"]);
const ALIAS_LIST = UNIT_ALIASES.flatMap(([u, al]) => al.map((a) => [a.toLowerCase(), u])).sort((a, b) => b[0].length - a[0].length);
const FRAC_CHARS = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };

function parseNumber(str) {
  str = str.trim();
  if (FRAC_CHARS[str] != null) return FRAC_CHARS[str];
  let m = str.match(/^(\d+)\s*([½¼¾⅓⅔⅛])$/); if (m) return +m[1] + FRAC_CHARS[m[2]];
  m = str.match(/^(\d+)\s+(\d+)\/(\d+)$/); if (m) return +m[1] + +m[2] / +m[3];
  m = str.match(/^(\d+)\/(\d+)$/); if (m) return +m[1] / +m[2];
  const n = parseFloat(str.replace(",", "."));
  return isNaN(n) ? null : n;
}

function parseIngredientLine(line) {
  let s = String(line || "").replace(/^\s*[-•*·–]\s*/, "").replace(/\s+/g, " ").trim();
  s = s.replace(/^(une?|deux|trois|quatre|cinq|six)\s+(?=\S)(?!peu\b)/i, (w) => ({ un: "1 ", une: "1 ", deux: "2 ", trois: "3 ", quatre: "4 ", cinq: "5 ", six: "6 " })[w.trim().toLowerCase()]);
  if (!s) return null;
  const numRe = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\s*[½¼¾⅓⅔⅛]|[½¼¾⅓⅔⅛]|\d+(?:[.,]\d+)?)(?:\s*(?:à|-|ou)\s*(\d+(?:[.,]\d+)?))?\s*/;
  const m = s.match(numRe);
  if (!m) return markOptional({ qty: null, unit: "", name: s });
  const qty = parseNumber(m[1]);
  const qtyMax = m[2] ? parseNumber(m[2]) : null;
  let rest = s.slice(m[0].length);
  let unit = "";
  const low = rest.toLowerCase();
  for (const [alias, u] of ALIAS_LIST) {
    if (low.startsWith(alias)) {
      const next = low.charAt(alias.length);
      if (next === "" || next === " " || next === "'" || next === "’" || (alias.endsWith(".") && /[a-zà-ÿ]/i.test(next) === false)) {
        unit = u; rest = rest.slice(alias.length).trim(); break;
      }
    }
  }
  rest = rest.replace(/^(de |d'|d’|du |des )/i, (x) => (/^(du|des) $/i.test(x) && !unit ? x : "")).trim();
  if (!rest) return markOptional({ qty: null, unit: "", name: s });
  const out = { qty, unit, name: rest };
  if (qtyMax != null && qtyMax > qty) out.qty_max = qtyMax;
  return markOptional(out);
}
const OPT_RE = /\s*\((?:facultatif|facultative|optionnel|optionnelle|si on veut|au choix)\)\s*$/i;
function markOptional(ing) {
  if (ing && OPT_RE.test(ing.name)) { ing.name = ing.name.replace(OPT_RE, "").trim(); ing.optional = ing.optional || "facultatif"; }
  return ing;
}
const OPT_LABEL = { facultatif: "facultatif", astuce: "pour l’astuce" };
/* Lit le champ ingrédients du formulaire : les lignes après « # Astuce » sont les ingrédients de l'astuce */
function parseIngredientBlock(text) {
  let mode = "", group = "";
  const out = [];
  for (const line of String(text || "").split(/\n/)) {
    if (/^\s*#/.test(line)) {
      const title = line.replace(/^\s*#+\s*/, "").trim();
      if (/astuce|variante|option|facultatif/i.test(title)) { mode = "astuce"; group = ""; } else { mode = ""; group = title; }
      continue;
    }
    const ing = parseIngredientLine(line);
    if (!ing) continue;
    if (mode) ing.optional = "astuce";
    else if (group) ing.group = group;
    out.push(ing);
  }
  return out;
}

function niceNumber(n, ascii = false, metric = false) {
  if (n == null || isNaN(n)) return "";
  if (n >= 50) return String(Math.round(n / 5) * 5);
  if (n >= 10) return String(Math.round(n));
  if (metric) return (Math.round(n * 10) / 10).toString().replace(".", ","); // 1,5 kg plutôt que 1½ kg
  const whole = Math.floor(n), frac = n - whole;
  const fracs = ascii
    ? [[0.25, "1/4"], [1 / 3, "1/3"], [0.5, "1/2"], [2 / 3, "2/3"], [0.75, "3/4"]]
    : [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]];
  if (frac < 0.06) return String(whole || (n > 0 ? "1" : "0"));
  if (frac > 0.94) return String(whole + 1);
  for (const [v, ch] of fracs) if (Math.abs(frac - v) < 0.05) return whole ? `${whole}${ascii ? " " : ""}${ch}` : ch;
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function unitLabel(unit, qty) {
  if (!unit) return "";
  if (WORD_UNITS.has(unit) && qty != null && qty > 1.01) return unit === "morceau" ? "morceaux" : unit === "rouleau" ? "rouleaux" : unit + "s";
  return unit;
}
const startsVowel = (s) => /^[aeiouyhâàéèêëîïôöûùœ]/i.test(s) && !/^(haricot|hareng|homard|hach|houblon|haddock|huch)/i.test(s); // h aspiré : « de haricots »

function ingredientParts(ing, factor = 1, ascii = false) {
  const q = ing.qty != null ? ing.qty * factor : null;
  const qMax = ing.qty_max != null && q != null ? ing.qty_max * factor : null;
  const metric = ["kg", "g", "mg", "l", "dl", "cl", "ml"].includes(ing.unit);
  let qty = q != null ? niceNumber(q, ascii, metric) : "";
  if (qMax != null && niceNumber(qMax, ascii, metric) !== qty) qty += " à " + niceNumber(qMax, ascii, metric);
  const unit = unitLabel(ing.unit, qMax ?? q);
  if (unit) qty += " " + unit;
  let name = ing.name;
  if (unit) name = (startsVowel(name) ? "d’" : "de ") + name;
  return { qty, name };
}
const ingredientText = (ing, f = 1, ascii = false) => { const p = ingredientParts(ing, f, ascii); return (p.qty ? p.qty + " " : "") + p.name; };
const ingredientEditLine = (ing) => ingredientText(ing, 1, true) + (ing.optional === "facultatif" ? " (facultatif)" : "");
/* Regroupe les ingrédients par sous-titre (ex. « Vinaigrette »), dans l'ordre d'apparition */
function groupIngredients(list) {
  const groups = [];
  for (const ing of list || []) {
    const g = ing.group || "";
    let cur = groups.find((x) => x.title === g);
    if (!cur) { cur = { title: g, items: [] }; g ? groups.push(cur) : groups.unshift(cur); }
    cur.items.push(ing);
  }
  return groups.filter((g) => g.items.length);
}
const ingredientEditBlock = (list) => {
  const main = groupIngredients((list || []).filter((i) => i.optional !== "astuce")).flatMap((g) => (g.title ? ["# " + g.title] : []).concat(g.items.map(ingredientEditLine)));
  const tip = (list || []).filter((i) => i.optional === "astuce").map(ingredientEditLine);
  return main.concat(tip.length ? ["# Astuce", ...tip] : []).join("\n");
};

/* Sous-titres dans les étapes : une ligne qui commence par « # » (ex. « # La sauce ») */
const isSection = (s) => /^\s*#/.test(s);
const sectionTitle = (s) => s.replace(/^\s*#+\s*/, "").trim();
function cookSteps(r) {
  let sec = ""; const out = [];
  for (const s of r.steps || []) { if (isSection(s)) sec = sectionTitle(s); else out.push({ text: s, section: sec }); }
  return out;
}

/* Ingrédients cités dans une étape (pour le mode cuisine) */
const ING_STOP = new Set("coupe coupee coupes coupees emince emincee eminces emincees hache hachee haches hachees fraiche fraiches frais epaisse liquide entier entiere chaud chaude chauds froid froide rouge rouges noir noire noires blanc blanche vert verte gros grosse petit petite petits petites mijoter fondu fondue facultatif type environ bien ferme chair saison morceau morceaux quelques grand grande fin fins fine fines ancienne paris bouteille fruite fruitee volaille legumes jus avec pour sans dans plus".split(" "));
const stem = (w) => w.replace(/[sx]$/, "").replace(/e$/, "");
function ingredientKeys(ing) {
  const keys = new Set();
  const base = norm(ing.name).replace(/\([^)]*\)/g, " ").replace(/demi-sel/g, "demisel");
  for (const part of base.split(/,| ou | et /)) {
    const words = part.split(/[^a-z]+/).filter((w) => w.length >= 3 && !["des", "les", "une", "aux"].includes(w) && !ING_STOP.has(w));
    words.forEach((w) => keys.add(stem(w)));
  }
  if (!keys.size) { const w = base.split(/[^a-z]+/).filter((x) => x.length >= 3); if (w[0]) keys.add(stem(w[0])); }
  return keys;
}
const STEP_SYNONYMS = {
  viande: ["boeuf", "veau", "porc", "poulet", "dinde", "agneau", "canard", "lapin", "echine", "paleron", "macreuse", "jarret"],
  herbe: ["thym", "romarin", "persil", "laurier", "basilic", "estragon", "ciboulette", "coriandre", "aneth", "garni"],
  fruit: ["orange", "citron", "pomme", "poire", "peche", "fraise", "framboise", "banane", "abricot"],
  legume: ["carotte", "courgette", "poireau", "poivron", "navet", "celeri", "aubergine", "haricot", "terre", "tomate", "concombre", "oignon", "chou", "brocoli", "epinard", "radi", "betterave"],
  sale: ["sel"], saler: ["sel"], salez: ["sel"], salee: ["sel"], sel: ["sel"],
  poivrer: ["poivre"], poivrez: ["poivre"], assaisonnement: ["sel", "poivre"], assaisonner: ["sel", "poivre"],
};
function ingredientsInStep(text, ingredients) {
  const raw = norm(text).replace(/demi-sel/g, "demisel").split(/[^a-z]+/).filter(Boolean);
  const tokens = new Set(raw.map(stem));
  const syn = new Set();
  for (const t of raw) (STEP_SYNONYMS[t] || STEP_SYNONYMS[t.replace(/s$/, "")] || []).forEach((k) => syn.add(stem(k)));
  // « la viande » désigne le bœuf, pas le « bouillon de bœuf »
  const LIQUIDS = new Set(["bouillon", "fond", "jus", "sauce", "concentre", "cube"]);
  // Les ingrédients de l'astuce restent à part : ils ne s'affichent pas dans les étapes normales
  const list = (ingredients || []).filter((ing) => ing.optional !== "astuce");
  const keys = list.map(ingredientKeys);
  const heads = keys.map((ks) => [...ks][0]);
  // « huile d'olive » ne doit pas s'afficher quand l'étape parle des « olives » (un autre ingrédient)
  list.forEach((ing, i) => { if (!LIQUIDS.has(heads[i]) && [...keys[i]].some((k) => syn.has(k) && !tokens.has(k))) keys[i].add("§syn"); });
  tokens.add("§syn");
  const rawHits = list.map((ing, i) => [...keys[i]].filter((k) => tokens.has(k)));
  const hits = list.map((ing, i) => [...keys[i]].filter((k, j) => tokens.has(k) && (j === 0 || !heads.some((h, x) => x !== i && h === k))));
  // « concentré de tomate » dans l'étape ne doit pas afficher aussi « tomates concassées »
  return list.filter((ing, i) => hits[i].length && !(hits[i].length === 1 && keys[i].size > 1 &&
    rawHits.some((h, x) => x !== i && h.length > 1 && h.includes(hits[i][0]))));
}

/* Minuteurs repérés dans le texte d'une étape : "15 min", "1 h 30", "2 heures"… */
function detectTimers(text) {
  const out = []; const seen = new Set();
  const re = /(\d+(?:[.,]\d+)?)\s*(?:(?:à|-)\s*(\d+(?:[.,]\d+)?)\s*)?(?:(heures?|hr|h(?![a-zà-ÿ]))(?:\s*(\d{2})(?!\d))?|(min(?:utes?)?|mn)(?![a-zà-ÿ]))/gi;
  let m;
  while ((m = re.exec(text))) {
    const a = parseFloat((m[2] || m[1]).replace(",", "."));
    const isH = !!m[3];
    let sec = isH ? a * 3600 + (m[4] ? +m[4] * 60 : 0) : a * 60;
    if (!sec || sec > 24 * 3600) continue;
    const label = isH ? fmtMin(sec / 60) : `${a} min`;
    if (!seen.has(sec)) { seen.add(sec); out.push({ sec, label }); }
  }
  return out;
}

/* ---------------- Images ---------------- */
function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
async function resizeImage(file, max = 1400, quality = 0.84) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const r = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
  } finally { URL.revokeObjectURL(url); }
}
const blobToDataURL = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });

/* ---------------- Lecture d'une recette par Claude (photo ou texte) ---------------- */
const PARSE_PROMPT = `Tu reçois une recette de cuisine (photo d'une fiche, page de livre, note manuscrite, ou texte collé).
Extrais-la fidèlement, en français, sans inventer d'ingrédient ni d'étape. Corrige seulement les fautes évidentes.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de cette forme :
{
  "title": "Nom de la recette",
  "category": "une valeur parmi : Entrée, Plat, Accompagnement, Dessert, Apéro, Boisson, Sauce, Autre",
  "servings": 4,
  "prep_minutes": 20,
  "cook_minutes": 45,
  "ingredients": ["200 g de farine", "3 œufs", "1 pincée de sel"],
  "steps": ["Première étape.", "Deuxième étape."],
  "tags": ["mot-clé court", "autre"],
  "tips": "astuce ou conseil donné avec la recette, sinon chaîne vide",
  "tip_ingredients": ["1 c. à café de moutarde"],
  "origin": "auteur ou source si indiqué, sinon chaîne vide"
}
Règles : une ligne par ingrédient avec la quantité en tête quand il y en a une ; ajoute " (facultatif)" à la fin des ingrédients indiqués comme facultatifs ; si les ingrédients sont répartis en parties (ex. « Vinaigrette », « Pâte »), insère dans "ingredients" une ligne "# Vinaigrette" avant ceux de cette partie ; les ingrédients cités seulement dans une astuce ou une variante vont dans "tip_ingredients" (pas dans "ingredients"), les simples idées d'accompagnement n'y vont pas ; une étape = une action ou un petit groupe d'actions ;
garde les durées et températures dans le texte des étapes ; si la préparation a plusieurs parties (ex. « La pâte », « La sauce »), insère dans "steps" une ligne de sous-titre commençant par "# " (ex. "# La sauce") avant les étapes de cette partie ; si une valeur numérique est inconnue, mets null ; 2 à 4 tags utiles (ex. "rapide", "végétarien", "four", "fêtes").`;

/* Lecture gratuite d'un texte collé, sans IA : repère titre, personnes, Ingrédients, Préparation, Astuce */
function localParseRecipe(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim());
  const out = { title: "", servings: null, ingredients: [], steps: [], tips: [], tip_ingredients: [] };
  const bullet = /^\s*(?:[-–—•*·]|\d+\s*[.)])\s*/;
  const isHeader = (l) => !bullet.test(l) && l.trim().length <= 60 && !/[.;]\s*\S/.test(l.trim().replace(/[.:]$/, ""));
  let mode = "start", tipList = false;
  for (const raw of lines) {
    const l = raw.trim();
    const n = norm(l);
    const serv = n.match(/(\d+)\s*(?:a\s*\d+\s*)?(?:personnes|pers\b)/);
    if (serv && !out.servings) out.servings = +serv[1];
    // « Astuce : texte… » sur une seule ligne
    const inlineTip = l.match(/^(astuce|conseil|remarque|note|résultat attendu|resultat attendu|résultat|accompagnement)\s*:\s*(.+)$/i);
    if (inlineTip && mode !== "ing") { out.tips.push(l); mode = "tips"; continue; }
    // Sous-points indentés d'une étape : rattachés à l'étape précédente
    if (mode === "steps" && /^\s{2,}[-–—•*·]/.test(raw) && out.steps.length) { out.steps[out.steps.length - 1] += " " + l.replace(bullet, "").trim(); continue; }
    if (isHeader(l)) {
      const etape = l.match(/^[ée]tape\s*\d+\s*[—–:-]\s*(.+)$/i);
      if (etape) { mode = "steps"; out.steps.push("# " + etape[1].replace(/[:.]$/, "")); continue; }
      if (/^ingredients?\b/.test(n)) { mode = "ing"; continue; }
      if (/^(preparation|procedure|etapes?|recette|deroulement|methode)\b/.test(n)) { mode = "steps"; continue; }
      if (/^(astuce|variante|conseil|accompagnement|resultat|remarque|note|bon appetit|procede adapte)/.test(n)) {
        mode = "tips"; tipList = /variante|ajouter/.test(n);
        if (!/bon appetit/.test(n)) out.tips.push(l.replace(/[.:]$/, "") + " :"); continue;
      }
      if (mode === "start" && !out.title) { out.title = l.replace(/\s*\(?\d+\s*(?:a\s*\d+\s*)?personnes?\)?/i, "").replace(/[\s.–—-]+$/, ""); continue; }
      if (mode === "ing" && !serv) { out.ingredients.push("# " + l.replace(/[:.]$/, "")); continue; }
      if (mode === "steps") { out.steps.push("# " + l.replace(/^[ée]tape\s*\d+\s*[—–-]\s*/i, "").replace(/[:.]$/, "")); continue; }
    }
    if (serv && mode !== "steps" && mode !== "tips" && l.length < 50 && !bullet.test(l)) continue;
    const item = l.replace(bullet, "").trim();
    if (!item) continue;
    if (mode === "ing") out.ingredients.push(item);
    else if (mode === "steps") out.steps.push(item);
    else if (mode === "tips") { out.tips.push(item); if (tipList && bullet.test(l)) out.tip_ingredients.push(item.replace(/[,.]$/, "")); }
    else if (!out.title) out.title = item;
  }
  return { ...out, tips: out.tips.join("\n"), tip_ingredients: [] };
}

function normalizeParsed(o) {
  const cat = CATEGORIES.find((c) => norm(c) === norm(o.category)) || "Plat";
  return {
    title: String(o.title || "").trim(),
    category: cat,
    servings: Math.max(1, parseInt(o.servings) || 4),
    prep_minutes: parseInt(o.prep_minutes) || null,
    cook_minutes: parseInt(o.cook_minutes) || null,
    ingredients: [
      ...(() => { const lines = (o.ingredients || []).filter((l) => typeof l === "string"); return parseIngredientBlock(lines.filter((l) => !/^\s*#.*(astuce|variante|option)/i.test(l)).join("\n")); })(),
      ...(o.tip_ingredients || []).map((l) => typeof l === "string" ? parseIngredientLine(l) : l).filter(Boolean).map((i) => ({ ...i, optional: "astuce" })),
    ],
    steps: (o.steps || []).map((s) => String(s).trim()).filter(Boolean),
    tags: (o.tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 6),
    origin: String(o.origin || "").trim(),
    tips: String(o.tips || "").trim(),
  };
}
function extractJSON(text) {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("Réponse illisible");
  return JSON.parse(text.slice(a, b + 1));
}

/* ---------------- Stockage : mode démo (navigateur) ---------------- */
function createLocalBackend() {
  const KEY = "carnet-cuisine-demo-v1";
  let mem = null;
  const load = () => {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { mem = null; }
    if (!mem) mem = { recipes: [], notes: {}, shopping: [] };
    const v = window.SEED_VERSION || 1;
    if (mem.seedVersion !== v) {
      mem.recipes = mem.recipes.filter((r) => !String(r.id).startsWith("exemple-"));
      for (const r of window.SEED_RECIPES || []) {
        const i = mem.recipes.findIndex((x) => x.id === r.id);
        if (i < 0) mem.recipes.push({ ...r });
        else if (!mem.recipes[i].updated_at) mem.recipes[i] = { ...r }; // jamais modifiée dans l'app : on prend la nouvelle version
      }
      mem.seedVersion = v; try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch {}
    }
    return mem;
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { toast("Stockage du navigateur plein : retire quelques photos."); } };
  const me = { id: "demo", display_name: "Moi" };
  return {
    mode: "demo",
    async init() { load(); return me; },
    async signOut() {},
    async listRecipes() { return load().recipes.slice(); },
    async profiles() { return { demo: "Moi", ...(window.SEED_MEMBERS || {}) }; },
    async saveRecipe(r) {
      const db = load(); const now = new Date().toISOString();
      if (r.id) { const i = db.recipes.findIndex((x) => x.id === r.id); db.recipes[i] = { ...db.recipes[i], ...r, updated_at: now }; save(); return db.recipes[i]; }
      const rec = { ...r, id: uid(), owner_id: "demo", created_at: now, updated_at: now }; db.recipes.push(rec); save(); return rec;
    },
    async deleteRecipe(id) { const db = load(); db.recipes = db.recipes.filter((r) => r.id !== id); delete db.notes[id]; save(); },
    async uploadPhoto(blob) { const small = await resizeImage(blob, 900, 0.78); return await blobToDataURL(small); },
    photoUrl(path) { return path || ""; },
    async removePhoto() {},
    async listNotes() { return { ...load().notes }; },
    async saveNote(recipeId, patch) { const db = load(); db.notes[recipeId] = { ...(db.notes[recipeId] || {}), ...patch }; save(); return db.notes[recipeId]; },
    async listShopping() { return load().shopping.slice(); },
    async addShopping(items) { const db = load(); const added = items.map((i) => ({ id: uid(), checked: false, created_at: new Date().toISOString(), ...i })); db.shopping.push(...added); save(); return added; },
    async updateShopping(id, patch) { const db = load(); const it = db.shopping.find((s) => s.id === id); Object.assign(it, patch); save(); return it; },
    async deleteShopping(ids) { const db = load(); db.shopping = db.shopping.filter((s) => !ids.includes(s.id)); save(); },
    async parseRecipe({ text, images }) {
      const sample = window.claude?.use ? await window.claude.use("sample") : null;
      if (!sample) throw new Error("La lecture automatique n'est pas disponible ici.");
      const input = PARSE_PROMPT + (text ? "\n\nTexte de la recette :\n" + text : "\n\nLa recette est sur la ou les photos jointes.");
      const opts = { modelTier: "default" };
      if (images?.length) opts.images = images;
      try { const { text: out } = await sample(input, opts); return extractJSON(out); }
      catch (e) {
        if (e?.code === "not_granted") throw new Error("Tu as refusé l'accès à Claude : la lecture automatique est désactivée pour cette visite.");
        if (e?.code === "rate_limited") throw new Error("Trop de demandes d'un coup, réessaie dans une minute.");
        if (e?.code === "images_unavailable") throw new Error("L'envoi de photos n'est pas disponible ici. Colle plutôt le texte.");
        throw new Error(e?.message || "La lecture a échoué.");
      }
    },
  };
}

/* ---------------- Stockage : Supabase ---------------- */
function createSupabaseBackend() {
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  const BUCKET = "recipe-photos";
  let user = null;
  const check = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const COLS = ["title", "category", "tags", "servings", "prep_minutes", "cook_minutes", "ingredients", "steps", "photo_path", "origin", "tips", "is_shared"];
  const pick = (r) => Object.fromEntries(COLS.filter((k) => k in r).map((k) => [k, r[k]]));
  return {
    mode: "supabase",
    sb,
    async init() {
      const { data } = await sb.auth.getSession();
      user = data.session?.user || null;
      sb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") { state.view = "reset"; render(); }
        if (event === "SIGNED_OUT") { user = null; }
        if (session?.user) user = session.user;
      });
      return user ? { id: user.id, display_name: user.user_metadata?.display_name || user.email } : null;
    },
    async signIn(email, password) {
      const d = check(await sb.auth.signInWithPassword({ email, password }));
      user = d.user; return { id: user.id, display_name: user.user_metadata?.display_name || user.email };
    },
    async signUp(email, password, display_name) {
      const d = check(await sb.auth.signUp({ email, password, options: { data: { display_name }, emailRedirectTo: location.origin } }));
      if (!d.session) return null; // confirmation par e-mail requise
      user = d.user; return { id: user.id, display_name };
    },
    async resetPassword(email) { check(await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin })); },
    async updatePassword(password) { check(await sb.auth.updateUser({ password })); },
    async signOut() { await sb.auth.signOut(); user = null; },
    async listRecipes() { return check(await sb.from("recipes").select("*").order("title")); },
    async profiles() { const rows = check(await sb.from("profiles").select("id, display_name")); return Object.fromEntries(rows.map((p) => [p.id, p.display_name])); },
    async saveRecipe(r) {
      if (r.id) return check(await sb.from("recipes").update(pick(r)).eq("id", r.id).select().single());
      return check(await sb.from("recipes").insert(pick(r)).select().single());
    },
    async deleteRecipe(id) { check(await sb.from("recipes").delete().eq("id", id)); },
    async uploadPhoto(blob) {
      const small = await resizeImage(blob, 1400, 0.82);
      const path = `${user.id}/${uid()}.jpg`;
      check(await sb.storage.from(BUCKET).upload(path, small, { contentType: "image/jpeg", upsert: false }));
      return path;
    },
    photoUrl(path) { if (!path) return ""; if (path.startsWith("data:")) return path; return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; },
    async removePhoto(path) { if (path && !path.startsWith("data:") && path.startsWith(user.id + "/")) await sb.storage.from(BUCKET).remove([path]); },
    async listNotes() { const rows = check(await sb.from("recipe_notes").select("*")); return Object.fromEntries(rows.map((n) => [n.recipe_id, n])); },
    async saveNote(recipeId, patch) {
      return check(await sb.from("recipe_notes").upsert({ user_id: user.id, recipe_id: recipeId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id,recipe_id" }).select().single());
    },
    async listShopping() { return check(await sb.from("shopping_items").select("*").order("created_at")); },
    async addShopping(items) { return check(await sb.from("shopping_items").insert(items.map((i) => ({ ...i, user_id: user.id }))).select()); },
    async updateShopping(id, patch) { return check(await sb.from("shopping_items").update(patch).eq("id", id).select().single()); },
    async deleteShopping(ids) { if (ids.length) check(await sb.from("shopping_items").delete().in("id", ids)); },
    async parseRecipe({ text, images }) {
      const { data } = await sb.auth.getSession();
      const imgs = [];
      for (const b of images || []) imgs.push((await blobToDataURL(b)).split(",")[1]);
      const res = await fetch(CFG.parseEndpoint || "/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
        body: JSON.stringify({ text, images: imgs }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "La lecture a échoué (" + res.status + ").");
      return out.recipe;
    },
  };
}

/* ---------------- PDF ---------------- */
function pdfSafe(s) {
  return String(s ?? "")
    .replace(/[⅓]/g, "1/3").replace(/[⅔]/g, "2/3").replace(/[⅛]/g, "1/8")
    .replace(/[“”«»]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/ | /g, " ")
    .replace(/[^\x09\x0a\x0d\x20-\x7e -ÿŒœŸ€°]/g, "");
}

async function coverDataUrl(src) {
  const img = await loadImage(src);
  const c = document.createElement("canvas"); const W = 1600, H = 700; c.width = W; c.height = H;
  const r = Math.max(W / img.width, H / img.height); const w = img.width * r, h = img.height * r;
  c.getContext("2d").drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  return c.toDataURL("image/jpeg", 0.85);
}

async function buildPdf(recipe, servings) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210, PH = 297, M = 18, W = PW - 2 * M;
  const factor = servings / (recipe.servings || servings);
  const green = [46, 106, 78], ink = [27, 34, 30], grey = [95, 105, 99];
  let y = M;
  const ensure = (h) => { if (y + h > PH - 18) { doc.addPage(); y = M; } };

  const photo = recipe.photo_path ? api.photoUrl(recipe.photo_path) : "";
  if (photo) {
    try { const d = await coverDataUrl(photo); doc.addImage(d, "JPEG", M, y, W, W * 7 / 16); y += W * 7 / 16 + 8; } catch { /* photo ignorée */ }
  }
  doc.setTextColor(...green); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text(pdfSafe(recipe.category || "").toUpperCase(), M, y + 4); y += 7;
  doc.setTextColor(...ink); doc.setFontSize(26);
  const tl = doc.splitTextToSize(pdfSafe(recipe.title), W); doc.text(tl, M, y + 8); y += tl.length * 10.5 + 3;

  const facts = [`Pour ${servings} personne${servings > 1 ? "s" : ""}`];
  if (recipe.prep_minutes) facts.push("Préparation " + fmtMin(recipe.prep_minutes));
  if (recipe.cook_minutes) facts.push("Cuisson " + fmtMin(recipe.cook_minutes));
  doc.setFont("helvetica", "normal"); doc.setFontSize(13); doc.setTextColor(...grey);
  doc.text(pdfSafe(facts.join("   ·   ")), M, y + 4); y += 12;
  doc.setDrawColor(216, 222, 213); doc.setLineWidth(0.4); doc.line(M, y, PW - M, y); y += 9;

  // Ingrédients
  doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...ink);
  doc.text("Ingrédients", M, y); y += 8;
  doc.setFontSize(14);
  const allIngs = recipe.ingredients || [];
  const ings = allIngs.filter((i) => i.optional !== "astuce");
  const tipIngs = allIngs.filter((i) => i.optional === "astuce");
  const ingGroups = groupIngredients(ings);
  const twoCols = ings.length > 9 && ingGroups.length === 1 && !ingGroups[0].title;
  const colW = twoCols ? (W - 8) / 2 : W;
  const lines = ings.map((ing) => doc.splitTextToSize(pdfSafe(ingredientText(ing, factor, true) + (ing.optional === "facultatif" ? " (facultatif)" : "")), colW - 6));
  if (twoCols) {
    const half = Math.ceil(lines.length / 2);
    const colH = (arr) => arr.reduce((h, l) => h + l.length * 6.2 + 2, 0);
    ensure(Math.max(colH(lines.slice(0, half)), colH(lines.slice(half))));
    let y1 = y, y2 = y;
    lines.forEach((l, i) => {
      const left = i < half; const x = left ? M : M + colW + 8; let yy = left ? y1 : y2;
      doc.setFont("helvetica", "bold"); doc.setTextColor(...green); doc.text("•", x, yy);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...ink); doc.text(l, x + 5, yy);
      yy += l.length * 6.2 + 2; if (left) y1 = yy; else y2 = yy;
    });
    y = Math.max(y1, y2) + 4;
  } else {
    ingGroups.forEach((g) => {
      if (g.title) {
        ensure(16); y += 2;
        doc.setFont("helvetica", "bold"); doc.setFontSize(14.5); doc.setTextColor(...green);
        doc.text(pdfSafe(g.title), M, y); y += 7; doc.setFontSize(14);
      }
      g.items.forEach((ing) => {
        const l = lines[ings.indexOf(ing)];
        ensure(l.length * 6.2 + 2);
        doc.setFont("helvetica", "bold"); doc.setTextColor(...green); doc.text("•", M, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...ink); doc.text(l, M + 5, y);
        y += l.length * 6.2 + 2;
      });
    });
    y += 4;
  }
  if (tipIngs.length) {
    ensure(16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(140, 92, 10);
    doc.text("Pour l'astuce (pas obligatoire)", M, y); y += 6.5;
    doc.setFontSize(13);
    tipIngs.forEach((ing) => {
      const l = doc.splitTextToSize(pdfSafe(ingredientText(ing, factor, true)), W - 6);
      ensure(l.length * 5.8 + 2);
      doc.setFont("helvetica", "bold"); doc.setTextColor(140, 92, 10); doc.text("•", M, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(...ink); doc.text(l, M + 5, y);
      y += l.length * 5.8 + 2;
    });
    y += 4;
  }

  // Étapes
  ensure(20);
  doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...ink);
  doc.text("Préparation", M, y); y += 9;
  doc.setFontSize(14);
  let num = 0;
  (recipe.steps || []).forEach((s) => {
    if (isSection(s)) {
      ensure(18); y += 2;
      doc.setFont("helvetica", "bold"); doc.setFontSize(14.5); doc.setTextColor(...green);
      doc.text(pdfSafe(sectionTitle(s)), M, y); y += 8; doc.setFontSize(14); return;
    }
    const i = num++;
    const l = doc.splitTextToSize(pdfSafe(s), W - 12);
    ensure(l.length * 6.4 + 5);
    doc.setFillColor(220, 235, 226); doc.circle(M + 3.6, y - 1.6, 3.8, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(...green); doc.setFontSize(11);
    doc.text(String(i + 1), M + 3.6, y - 0.3, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setTextColor(...ink); doc.setFontSize(14);
    doc.text(l, M + 12, y); y += l.length * 6.4 + 5;
  });

  if (recipe.tips) {
    doc.setFontSize(13);
    const tl2 = doc.splitTextToSize(pdfSafe(recipe.tips), W - 12);
    const h = tl2.length * 6 + 16; ensure(h + 4); y += 2;
    doc.setFillColor(246, 232, 200); doc.roundedRect(M, y - 6, W, h, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(140, 92, 10); doc.text("Astuce", M + 6, y + 1);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...ink); doc.text(tl2, M + 6, y + 8);
    y += h + 4;
  }
  if (recipe.origin) {
    ensure(12); y += 2;
    doc.setFont("helvetica", "italic"); doc.setFontSize(12); doc.setTextColor(...grey);
    doc.text(doc.splitTextToSize(pdfSafe("Origine : " + recipe.origin), W), M, y);
  }
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...grey);
    doc.text(pdfSafe(APP_NAME), M, PH - 10);
    if (n > 1) doc.text(`${p} / ${n}`, PW - M, PH - 10, { align: "right" });
  }
  return doc.output("blob");
}

const pdfFileName = (r) => norm(r.title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".pdf";

async function exportPdf(recipe, servings, mode) {
  toast("Préparation du PDF…");
  let blob;
  try { blob = await buildPdf(recipe, servings); } catch (e) { console.error(e); return toast("Le PDF n'a pas pu être créé."); }
  const name = pdfFileName(recipe);
  // Dans l'aperçu Claude : passer par la capacité de téléchargement
  const dl = api.mode === "demo" && window.claude?.use ? await window.claude.use("downloads") : null;
  if (dl) {
    try { await dl.save({ filename: name, data: blob }); toast("PDF enregistré"); }
    catch (e) { if (e?.code !== "declined") toast("Téléchargement impossible ici."); }
    return;
  }
  const file = new File([blob], name, { type: "application/pdf" });
  if (mode === "share" && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: recipe.title }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  if (mode === "print") { window.open(url, "_blank"); }
  else { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* =========================================================
   État et rendu
   ========================================================= */
const useSupabase = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
const api = useSupabase ? createSupabaseBackend() : createLocalBackend();

const state = {
  user: null, recipes: [], names: {}, notes: {}, shopping: [],
  view: "list", recipeId: null, history: [],
  q: "", cat: "", tag: "", sort: "title",
  servings: {}, draft: null, editPhoto: null,
  importTab: "photo", importFiles: [], importText: "", importBusy: false, importError: "",
  member: "", pantry: [], authTab: "in", authError: "", authInfo: "", confirmDelete: false, confirmClear: false,
  cook: null, loading: true,
};
const root = document.getElementById("app");

function go(view, extra = {}) {
  if (state.view !== view || extra.recipeId !== state.recipeId) state.history.push({ view: state.view, recipeId: state.recipeId });
  Object.assign(state, { view, confirmDelete: false, confirmClear: false }, extra);
  render(); window.scrollTo(0, 0);
}
function back() { const h = state.history.pop() || { view: "list" }; state.view = h.view; state.recipeId = h.recipeId; state.confirmDelete = false; render(); window.scrollTo(0, 0); }

let toastTimer;
function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

const recipeById = (id) => state.recipes.find((r) => r.id === id);
const isMine = (r) => r.owner_id === state.user?.id;
const totalMin = (r) => (r.prep_minutes || 0) + (r.cook_minutes || 0);
const photoOf = (r) => (r.photo_path ? api.photoUrl(r.photo_path) : "");
const thumb = (r, cls = "thumb") => {
  const src = photoOf(r);
  return src ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy">`
    : `<div class="${cls} ph-${esc(r.category || "Autre")}" aria-hidden="true">${esc((r.title || "?").trim().charAt(0).toUpperCase())}</div>`;
};

/* ---------- Vues ---------- */
function topbar(sub) {
  const right = api.mode === "demo"
    ? `<span class="demo-pill" title="Les recettes restent dans ce navigateur">Démo</span>`
    : `<button class="icon-btn" data-act="account" aria-label="Mon compte">${ICONS.user}</button>`;
  return `<header class="topbar"><div class="wrap"><div class="brand">${esc(APP_NAME)}${sub ? `<small>${esc(sub)}</small>` : ""}</div>${right}</div></header>`;
}
function tabbar() {
  const n = state.shopping.filter((s) => !s.checked).length;
  const cur = state.view === "recipe" ? (isMine(recipeById(state.recipeId) || {}) ? "list" : "others") : state.view;
  const t = (v, icon, label, extra = "") => `<button class="tab ${cur === v ? "on" : ""}" data-act="tab" data-v="${v}">${icon}<span>${label}</span>${extra}</button>`;
  return `<footer class="tabbar"><nav aria-label="Navigation">${t("list", ICONS.book, "Mes recettes")}${t("others", ICONS.users, "Recettes des copains")}${t("pantry", ICONS.fridge, "Mon frigo")}${t("shopping", ICONS.cart, "Courses", n ? `<span class="badge">${n}</span>` : "")}${t("add", ICONS.plus, "Ajouter")}</nav></footer>`;
}

const scopeRecipes = (scope) => state.recipes.filter((r) => scope === "others" ? !isMine(r) && (!state.member || r.owner_id === state.member) : isMine(r));

function filteredRecipes(scope) {
  const q = norm(state.q);
  let list = scopeRecipes(scope).filter((r) => {
    if (state.cat && r.category !== state.cat) return false;
    if (state.tag && !(r.tags || []).includes(state.tag)) return false;
    if (!q) return true;
    const hay = norm([r.title, (r.tags || []).join(" "), r.category, state.names[r.owner_id] || "", (r.ingredients || []).map((i) => i.name).join(" ")].join(" "));
    return q.split(/\s+/).every((w) => hay.includes(w));
  });
  const by = {
    title: (a, b) => a.title.localeCompare(b.title, "fr"),
    recent: (a, b) => (b.created_at || "").localeCompare(a.created_at || ""),
    rating: (a, b) => (state.notes[b.id]?.rating || 0) - (state.notes[a.id]?.rating || 0) || a.title.localeCompare(b.title, "fr"),
    quick: (a, b) => (totalMin(a) || 999) - (totalMin(b) || 999),
    lastmade: (a, b) => (state.notes[b.id]?.last_made || "").localeCompare(state.notes[a.id]?.last_made || ""),
  };
  return list.sort(by[state.sort] || by.title);
}

function card(r, extra = "") {
  const n = state.notes[r.id] || {};
  const meta = [r.category, totalMin(r) ? fmtMin(totalMin(r)) : "", r.servings ? `${r.servings} pers.` : ""].filter(Boolean);
  const by = !isMine(r) && state.names[r.owner_id] ? `<span class="by">par ${esc(state.names[r.owner_id])}</span>` : "";
  return `<button class="card" data-act="open" data-id="${esc(r.id)}">${thumb(r)}<span class="card-body"><span class="card-title">${esc(r.title)}</span><span class="card-meta">${meta.map((m) => `<span>${esc(m)}</span>`).join("")}</span>${n.rating ? `<span class="stars" aria-label="${n.rating} sur 5">${stars(n.rating)}</span>` : ""}${by}${extra}</span></button>`;
}

function viewList(scope = "mine") {
  const others = scope === "others";
  const all = scopeRecipes(scope);
  const list = filteredRecipes(scope);
  const cats = CATEGORIES.filter((c) => all.some((r) => r.category === c));
  const tags = [...new Set(all.flatMap((r) => r.tags || []))].sort((a, b) => a.localeCompare(b, "fr"));
  const chip = (val, cur, label, act, cls = "") => `<button class="chip ${cls} ${cur === val ? "on" : ""}" data-act="${act}" data-v="${esc(val)}">${esc(label)}</button>`;
  // Membres qui partagent au moins une recette
  const counts = {};
  state.recipes.filter((r) => !isMine(r)).forEach((r) => (counts[r.owner_id] = (counts[r.owner_id] || 0) + 1));
  const members = Object.keys(counts).sort((a, b) => (state.names[a] || "").localeCompare(state.names[b] || "", "fr"));
  let body;
  if (!all.length && !others) {
    body = `<div class="empty"><h2>Ton carnet est vide</h2><p>Ajoute ta première recette : à la main, depuis une photo ou en collant un texte.</p><button class="btn primary" data-act="tab" data-v="add">${ICONS.plus} Ajouter une recette</button></div>`;
  } else if (!members.length && others) {
    body = `<div class="empty"><h2>Personne n’a encore partagé de recette</h2><p>Quand les copains ajouteront leurs recettes, elles apparaîtront ici.</p></div>`;
  } else if (!list.length) {
    body = `<div class="empty"><h2>Aucune recette trouvée</h2><p>Essaie un autre mot ou retire les filtres.</p><button class="btn" data-act="clearfilters">Effacer les filtres</button></div>`;
  } else body = `<div class="grid">${list.map((r) => card(r)).join("")}</div>`;
  const total = others ? state.recipes.filter((r) => !isMine(r)).length : all.length;
  const sub = others ? `Recettes des copains · ${total}` : `Mes recettes · ${total}`;
  return `${topbar(sub)}<main class="wrap">
    <label class="search">${ICONS.search}<input id="q" type="search" placeholder="${others ? "Chercher une recette, un ingrédient, un copain…" : "Chercher une recette, un ingrédient…"}" value="${esc(state.q)}" autocomplete="off"></label>
    ${others && members.length > 1 ? `<div class="chips" role="group" aria-label="Copains">${chip("", state.member, "Tout le monde", "member")}${members.map((m) => chip(m, state.member, `${state.names[m] || "Membre"} (${counts[m]})`, "member")).join("")}</div>` : ""}
    ${all.length ? `<div class="chips" role="group" aria-label="Catégories">${chip("", state.cat, "Tout", "cat")}${cats.map((c) => chip(c, state.cat, c, "cat")).join("")}</div>
    ${tags.length ? `<div class="chips" role="group" aria-label="Mots-clés">${tags.map((t) => chip(t, state.tag, "#" + t, "tagf", "tag")).join("")}</div>` : ""}
    <div class="list-head"><span class="count">${list.length} résultat${list.length > 1 ? "s" : ""}</span>
      <select id="sort" aria-label="Trier">${[["title", "A → Z"], ["recent", "Ajoutées récemment"], ["rating", "Mieux notées"], ["quick", "Plus rapides"], ["lastmade", "Faites récemment"]].map(([v, l]) => `<option value="${v}" ${state.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>` : ""}
    ${body}</main>${tabbar()}`;
}

function viewRecipe() {
  const r = recipeById(state.recipeId);
  if (!r) { state.view = "list"; return viewList(); }
  const sv = state.servings[r.id] || r.servings || 4;
  const f = sv / (r.servings || sv);
  const n = state.notes[r.id] || {};
  const photo = photoOf(r);
  const facts = [
    r.prep_minutes ? `<span>Préparation <b>${fmtMin(r.prep_minutes)}</b></span>` : "",
    r.cook_minutes ? `<span>Cuisson <b>${fmtMin(r.cook_minutes)}</b></span>` : "",
    !isMine(r) && state.names[r.owner_id] ? `<span>Partagée par <b>${esc(state.names[r.owner_id])}</b></span>` : "",
  ].join("");
  const ingLi = (i) => { const p = ingredientParts(i, f); return `<li>${p.qty ? `<b class="ing-qty">${esc(p.qty)}</b> ` : ""}${esc(p.name)}${i.optional === "facultatif" ? ` <span class="opt">facultatif</span>` : ""}</li>`; };
  const ings = groupIngredients((r.ingredients || []).filter((i) => i.optional !== "astuce")).map((g) => (g.title ? `</ul><h3 class="ing-sub">${esc(g.title)}</h3><ul class="ing-list">` : "") + g.items.map(ingLi).join("")).join("");
  const tipIngs = (r.ingredients || []).filter((i) => i.optional === "astuce").map(ingLi).join("");
  const steps = (r.steps || []).map((s) => isSection(s) ? `<li class="step-section"><h3>${esc(sectionTitle(s))}</h3></li>` : `<li><p>${esc(s)}</p></li>`).join("");
  const owner = isMine(r);
  return `${topbar()}<main class="wrap">
    <button class="btn ghost back" data-act="back">${ICONS.back} Retour</button>
    ${photo ? `<img class="hero-img" src="${esc(photo)}" alt="">` : ""}
    <div class="recipe-head"><span class="eyebrow">${esc(r.category || "")}</span><h1>${esc(r.title)}</h1>
      ${facts ? `<div class="facts">${facts}</div>` : ""}
      ${(r.tags || []).length ? `<div class="tags">${r.tags.map((t) => `<span class="tag-pill">#${esc(t)}</span>`).join("")}</div>` : ""}</div>
    <div class="actions">
      <button class="btn primary" data-act="cook">${ICONS.flame} Mode cuisine</button>
      <button class="btn" data-act="pdf">${ICONS.pdf} PDF</button>
      ${api.mode !== "demo" ? `<button class="btn" data-act="print">${ICONS.print} Imprimer</button>` : ""}
      <button class="btn" data-act="toshop">${ICONS.cart} Aux courses</button>
      ${owner ? `<button class="btn" data-act="edit">${ICONS.pen} Modifier</button>` : `<button class="btn" data-act="copy">${ICONS.plus} Copier dans mes recettes</button>`}
    </div>
    <div class="cols">
      <section class="panel ing-panel"><h2>Ingrédients</h2>
        <div class="servings"><button class="icon-btn" data-act="sv" data-d="-1" aria-label="Une personne de moins">−</button><output aria-live="polite">${sv} pers.</output><button class="icon-btn" data-act="sv" data-d="1" aria-label="Une personne de plus">+</button>
          ${sv !== r.servings ? `<button class="btn small ghost" data-act="svreset">Revenir à ${r.servings}</button>` : ""}</div>
        <ul class="ing-list">${ings || `<li>Aucun ingrédient saisi</li>`}</ul>
        ${tipIngs ? `<h3 class="ing-sub">Pour l’astuce <span class="opt astuce">pas obligatoire</span></h3><ul class="ing-list tip-list">${tipIngs}</ul>` : ""}</section>
      <section class="panel"><h2>Préparation</h2><ol class="steps">${steps || "<li><p>Aucune étape saisie</p></li>"}</ol>
        ${r.tips ? `<div class="tip"><b>Astuce</b><p>${esc(r.tips)}</p></div>` : ""}
        ${r.origin ? `<p class="origin">Origine : ${esc(r.origin)}</p>` : ""}</section>
    </div>
    <section class="panel notes-panel stack"><h2>Mes notes</h2>
      <div class="rate" role="group" aria-label="Ma note">${[1, 2, 3, 4, 5].map((i) => `<button class="${(n.rating || 0) >= i ? "on" : ""}" data-act="rate" data-v="${i}" aria-label="${i} sur 5">★</button>`).join("")}</div>
      <div class="row"><button class="btn" data-act="made">${ICONS.check} Je l'ai faite aujourd'hui</button>
        <span class="last-made">${n.last_made ? "Dernière fois : " + fmtDate(n.last_made) : "Jamais faite pour l'instant"}</span></div>
      <div class="field form" style="margin:0"><label for="note">Remarques pour la prochaine fois</label>
        <textarea id="note" placeholder="Ex. : un peu moins de sucre, 5 min de cuisson en plus…" style="min-height:110px">${esc(n.note || "")}</textarea>
        <div><button class="btn small" data-act="savenote">Enregistrer la note</button></div></div>
    </section>
    ${owner ? `<div style="margin-top:22px">${state.confirmDelete
      ? `<div class="confirm-box"><b>Supprimer « ${esc(r.title)} » définitivement ?</b><div class="row"><button class="btn danger" data-act="delyes">Oui, supprimer</button><button class="btn" data-act="delno">Annuler</button></div></div>`
      : `<button class="btn ghost danger" data-act="del">Supprimer la recette</button>`}</div>` : ""}
  </main>${tabbar()}`;
}

function blankDraft() { return { tips: "", title: "", category: "Plat", servings: 4, prep_minutes: "", cook_minutes: "", tags: [], origin: "", ingredients: [], steps: [], is_shared: true, photo_path: null }; }

function viewEdit() {
  const d = state.draft;
  const photo = state.editPhoto ? state.editPhoto.preview : d.photo_path ? api.photoUrl(d.photo_path) : "";
  return `${topbar(d.id ? "Modifier la recette" : "Nouvelle recette")}<main class="wrap">
    <button class="btn ghost back" data-act="back">${ICONS.back} Annuler</button>
    ${d._fromImport ? `<p class="notice">Relis la recette lue automatiquement, corrige si besoin, puis enregistre.</p>` : ""}
    <form class="form" id="editform" autocomplete="off">
      <div class="field"><label for="f-title">Nom de la recette</label><input class="input" id="f-title" required value="${esc(d.title)}" placeholder="Ex. : Tarte aux pommes de mamie"></div>
      <div class="split">
        <div class="field"><label for="f-cat">Catégorie</label><select id="f-cat">${CATEGORIES.map((c) => `<option ${d.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
        <div class="field"><label for="f-serv">Personnes</label><input class="input" id="f-serv" type="number" min="1" max="100" inputmode="numeric" value="${esc(d.servings)}"></div>
        <div class="field"><label for="f-prep">Préparation <span class="hint">(min)</span></label><input class="input" id="f-prep" type="number" min="0" inputmode="numeric" value="${esc(d.prep_minutes ?? "")}"></div>
        <div class="field"><label for="f-cook">Cuisson <span class="hint">(min)</span></label><input class="input" id="f-cook" type="number" min="0" inputmode="numeric" value="${esc(d.cook_minutes ?? "")}"></div>
      </div>
      <div class="field"><label for="f-ings">Ingrédients <span class="hint">— un par ligne, quantité en premier (ex. 200 g de farine). Ajoute « (facultatif) » en fin de ligne si besoin, et mets les ingrédients de l’astuce après une ligne « # Astuce ».</span></label>
        <textarea id="f-ings" placeholder="250 g de farine&#10;3 œufs&#10;1 pincée de sel">${esc(ingredientEditBlock(d.ingredients))}</textarea></div>
      <div class="field"><label for="f-steps">Étapes <span class="hint">— une par ligne ; « # La sauce » pour un sous-titre</span></label>
        <textarea id="f-steps" placeholder="Préchauffer le four à 180 °C.&#10;Mélanger la farine et les œufs.">${esc((d.steps || []).join("\n"))}</textarea></div>
      <div class="field"><label for="f-tips">Astuce <span class="hint">(facultatif)</span></label><textarea id="f-tips" style="min-height:90px" placeholder="Un conseil pour réussir la recette">${esc(d.tips || "")}</textarea></div>
      <div class="field"><label for="f-tags">Mots-clés <span class="hint">— séparés par des virgules</span></label><input class="input" id="f-tags" value="${esc((d.tags || []).join(", "))}" placeholder="rapide, végétarien, fêtes"></div>
      <div class="field"><label for="f-origin">Origine <span class="hint">(facultatif)</span></label><input class="input" id="f-origin" value="${esc(d.origin || "")}" placeholder="Recette de mamie, livre, site…"></div>
      <div class="field"><span class="label">Photo du plat <span class="hint">(facultatif)</span></span>
        <div class="photo-pick">${photo ? `<img src="${esc(photo)}" alt="Aperçu">` : ""}
          <label class="btn small" for="f-photo">${ICONS.camera} ${photo ? "Changer" : "Ajouter une photo"}</label>
          <input id="f-photo" type="file" accept="image/*" hidden>
          ${photo ? `<button type="button" class="btn small ghost danger" data-act="rmphoto">Retirer</button>` : ""}</div></div>
      ${api.mode !== "demo" ? `<label class="check"><input type="checkbox" id="f-shared" ${d.is_shared ? "checked" : ""}><span>Partager avec les autres membres<br><span class="hint">Décoché : toi seul la vois.</span></span></label>` : ""}
      <p class="error" id="f-err" hidden></p>
      <div class="sticky-save"><button type="button" class="btn" data-act="back">Annuler</button><button class="btn primary" type="submit" id="f-save">Enregistrer</button></div>
    </form></main>${tabbar()}`;
}

function viewAdd() {
  const c = (act, icon, title, sub) => `<button class="choice" data-act="${act}"><span class="ic">${icon}</span><span><b>${title}</b><span>${sub}</span></span></button>`;
  return `${topbar("Ajouter une recette")}<main class="wrap"><div class="add-choices">
    ${CFG.aiImport === false ? "" : c("addphoto", ICONS.camera, "Depuis une photo", "Fiche manuscrite, page de livre, capture d'écran : la recette est lue et remplie pour toi.")}
    ${c("addtext", ICONS.text, "Coller un texte", CFG.aiImport === false ? "Colle une recette avec « Ingrédients » et « Préparation » : la fiche se remplit toute seule." : "Un message, une note, une page web copiée : tout est rangé en ingrédients et étapes.")}
    ${c("addmanual", ICONS.pen, "Saisir à la main", "Remplir la fiche toi-même.")}
  </div></main>${tabbar()}`;
}

function viewImport() {
  const photo = state.importTab === "photo";
  const prev = state.importFiles.map((f) => `<img src="${esc(f.preview)}" alt="">`).join("");
  return `${topbar(photo ? "Depuis une photo" : "Coller un texte")}<main class="wrap">
    <button class="btn ghost back" data-act="back">${ICONS.back} Retour</button>
    <div class="stack">
    ${photo ? `<label class="drop" id="drop" for="imp-file">${ICONS.camera}<b>Prendre ou choisir une photo</b><span class="hint">Jusqu'à 3 photos si la recette tient sur plusieurs pages</span>${prev ? `<div class="previews">${prev}</div>` : ""}</label>
      <input id="imp-file" type="file" accept="image/*" multiple hidden>
      ${state.importFiles.length ? `<button class="btn small ghost" data-act="impclear">Retirer les photos</button>` : ""}`
    : `<div class="field form" style="margin:0"><label for="imp-text">Texte de la recette</label><textarea id="imp-text" style="min-height:260px" placeholder="Colle ici la recette telle quelle, même en vrac.">${esc(state.importText)}</textarea></div>`}
    ${state.importError ? `<p class="error">${esc(state.importError)}</p>` : ""}
    <button class="btn primary" data-act="impgo" ${state.importBusy ? "disabled" : ""}>${state.importBusy ? `<span class="spinner"></span> Lecture en cours… (jusqu'à une minute)` : "Lire la recette"}</button>
    <p class="hint">Tu pourras tout relire et corriger avant d'enregistrer.</p></div></main>${tabbar()}`;
}

function pantryResults() {
  const terms = state.pantry.map(norm).filter(Boolean);
  if (!terms.length) return [];
  const sing = (w) => w.replace(/(s|x)$/, "");
  return state.recipes.map((r) => {
    const names = (r.ingredients || []).map((i) => norm(i.name));
    const required = (r.ingredients || []).filter((i) => !i.optional).map((i) => norm(i.name));
    const matchedTerms = terms.filter((t) => names.some((n) => n.includes(sing(t))));
    const matchedIngs = required.filter((n) => terms.some((t) => n.includes(sing(t))));
    return { r, hit: matchedTerms.length, missing: required.length - matchedIngs.length };
  }).filter((x) => x.hit).sort((a, b) => b.hit - a.hit || a.missing - b.missing);
}

function viewPantry() {
  const res = pantryResults();
  const terms = state.pantry.length;
  let body = "";
  if (!terms) body = `<div class="empty"><h2>Qu'est-ce qu'il te reste ?</h2><p>Ajoute 2 ou 3 ingrédients que tu as sous la main : on te montre les recettes de ton carnet qui les utilisent.</p></div>`;
  else if (!res.length) body = `<div class="empty"><h2>Aucune recette avec ces ingrédients</h2><p>Essaie un nom plus simple (ex. « poulet » plutôt que « blanc de poulet »).</p></div>`;
  else body = `<div class="grid">${res.map(({ r, hit, missing }) => card(r, `<span class="match">${hit}/${terms} de tes ingrédients</span><span class="missing">${missing ? `il manque ${missing} ingrédient${missing > 1 ? "s" : ""}` : "tu as tout !"}</span>`)).join("")}</div>`;
  return `${topbar("Avec ce que j'ai")}<main class="wrap">
    <form class="pantry-input" id="pantryform"><input class="input" id="pantry-in" placeholder="Ex. : courgette, œufs, feta" autocomplete="off" enterkeyhint="done"><button class="btn primary" type="submit">Ajouter</button></form>
    ${terms ? `<div class="have">${state.pantry.map((p, i) => `<button class="chip" data-act="unpantry" data-i="${i}" aria-label="Retirer ${esc(p)}">${esc(p)} <span aria-hidden="true">×</span></button>`).join("")}<button class="chip" data-act="clearpantry">Tout effacer</button></div>` : ""}
    ${body}</main>${tabbar()}`;
}

function viewShopping() {
  const items = state.shopping.slice().sort((a, b) => a.checked - b.checked || (a.created_at || "").localeCompare(b.created_at || ""));
  const left = items.filter((i) => !i.checked).length;
  const done = items.length - left;
  const row = (it) => { const q = it.qty != null ? niceNumber(+it.qty, false, ["kg", "g", "mg", "l", "dl", "cl", "ml"].includes(it.unit)) + (it.unit ? " " + unitLabel(it.unit, +it.qty) : "") : it.unit || "";
    return `<li class="${it.checked ? "checked" : ""}"><button class="shop-item" data-act="shopcheck" data-id="${esc(it.id)}" aria-pressed="${it.checked}"><span class="box">${it.checked ? ICONS.check : ""}</span><span class="shop-name">${esc(it.name)}${it.tag ? ` <span class="opt ${it.tag === "astuce" ? "astuce" : ""}">${esc(OPT_LABEL[it.tag] || it.tag)}</span>` : ""}${it.recipe_title ? `<span class="shop-from">${esc(it.recipe_title)}</span>` : ""}</span><span class="shop-qty">${esc(q)}</span></button></li>`; };
  return `${topbar(left ? `${left} article${left > 1 ? "s" : ""} à acheter` : "Liste de courses")}<main class="wrap">
    <form class="pantry-input" id="shopform"><input class="input" id="shop-in" placeholder="Ajouter un article (ex. 1 l de lait)" autocomplete="off" enterkeyhint="done"><button class="btn primary" type="submit">Ajouter</button></form>
    ${items.length ? `<ul class="shop-list">${items.map(row).join("")}</ul>
      <div class="row" style="margin-top:14px">
        <button class="btn small" data-act="shopcopy">Copier la liste</button>
        ${done ? `<button class="btn small" data-act="shopclean">Retirer les cochés (${done})</button>` : ""}
        ${state.confirmClear ? `<span class="row"><b>Tout vider ?</b><button class="btn small danger" data-act="shopclearyes">Oui</button><button class="btn small" data-act="shopclearno">Non</button></span>` : `<button class="btn small ghost danger" data-act="shopclear">Tout vider</button>`}
      </div>`
    : `<div class="empty"><h2>Ta liste est vide</h2><p>Depuis une recette, touche « Aux courses » : les ingrédients s'ajoutent ici pour le bon nombre de personnes.</p></div>`}
  </main>${tabbar()}`;
}

function viewAuth() {
  const up = state.authTab === "up", forgot = state.authTab === "forgot";
  const canSignup = CFG.allowSignup !== false;
  return `<main class="wrap"><div class="auth">
    <div><h1>${esc(APP_NAME)}</h1><p>Les recettes des copains, au même endroit.</p></div>
    ${!forgot && canSignup ? `<div class="seg"><button class="${!up ? "on" : ""}" data-act="authtab" data-v="in">Se connecter</button><button class="${up ? "on" : ""}" data-act="authtab" data-v="up">Créer un compte</button></div>` : ""}
    <form class="form" id="authform" style="margin:0">
      ${up ? `<div class="field"><label for="a-name">Ton prénom</label><input class="input" id="a-name" required autocomplete="given-name"></div>` : ""}
      <div class="field"><label for="a-email">E-mail</label><input class="input" id="a-email" type="email" required autocomplete="email"></div>
      ${forgot ? "" : `<div class="field"><label for="a-pass">Mot de passe</label><input class="input" id="a-pass" type="password" required minlength="6" autocomplete="${up ? "new-password" : "current-password"}"></div>`}
      ${state.authError ? `<p class="error">${esc(state.authError)}</p>` : ""}${state.authInfo ? `<p class="notice">${esc(state.authInfo)}</p>` : ""}
      <button class="btn primary" type="submit">${forgot ? "Recevoir un lien" : up ? "Créer mon compte" : "Se connecter"}</button>
    </form>
    ${forgot ? `<button class="linkish" data-act="authtab" data-v="in">Retour à la connexion</button>` : `<button class="linkish" data-act="authtab" data-v="forgot">Mot de passe oublié ?</button>`}
  </div></main>`;
}

function viewReset() {
  return `<main class="wrap"><div class="auth"><h1>Nouveau mot de passe</h1>
    <form class="form" id="resetform" style="margin:0"><div class="field"><label for="r-pass">Nouveau mot de passe</label><input class="input" id="r-pass" type="password" minlength="6" required autocomplete="new-password"></div>
    ${state.authError ? `<p class="error">${esc(state.authError)}</p>` : ""}<button class="btn primary" type="submit">Enregistrer</button></form></div></main>`;
}

function viewAccount() {
  return `${topbar("Mon compte")}<main class="wrap"><button class="btn ghost back" data-act="back">${ICONS.back} Retour</button>
    <section class="panel stack"><h2>${esc(state.user?.display_name || "")}</h2>
    <p class="hint">Mes recettes : ${state.recipes.filter(isMine).length} · Recettes des copains : ${state.recipes.filter((r) => !isMine(r)).length}</p>
    <div><button class="btn danger" data-act="signout">Se déconnecter</button></div></section></main>${tabbar()}`;
}

/* ---------- Mode cuisine ---------- */
let wakeLock = null, tickTimer = null, audioCtx = null;
async function keepAwake() { try { if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen"); } catch { wakeLock = null; } }
document.addEventListener("visibilitychange", () => { if (state.cook && document.visibilityState === "visible") keepAwake(); });

function openCook(r) {
  const sv = state.servings[r.id] || r.servings;
  state.cook = { id: r.id, step: 0, showIngs: false, factor: sv / (r.servings || sv), timers: [], ticked: {} };
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  keepAwake();
  clearInterval(tickTimer); tickTimer = setInterval(tick, 500);
  renderCook();
}
function closeCook() { state.cook = null; clearInterval(tickTimer); try { wakeLock?.release(); } catch {} wakeLock = null; $(".cook")?.remove(); document.body.style.overflow = ""; }
function beep() {
  try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch {}
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [0, 0.35, 0.7].forEach((d) => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.25); o.start(t0 + d); o.stop(t0 + d + 0.3); });
}
const fmtClock = (s) => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };
function tick() {
  const c = state.cook; if (!c) return;
  const now = Date.now(); let changed = false;
  c.timers.forEach((t) => { if (!t.paused && !t.rang && t.end <= now) { t.rang = true; beep(); changed = true; } });
  if (changed) renderCook(); else document.querySelectorAll(".run[data-tid]").forEach((el) => {
    const t = c.timers.find((x) => x.id === el.dataset.tid); if (t) el.querySelector("span").textContent = t.rang ? "Terminé !" : fmtClock(t.paused ? t.left : (t.end - now) / 1000);
  });
}
function renderCook() {
  const c = state.cook; if (!c) return;
  const r = recipeById(c.id); const steps = cookSteps(r); const total = Math.max(1, steps.length);
  const cur = steps[c.step] || { text: "Aucune étape", section: "" }; const text = cur.text;
  const tms = detectTimers(text);
  const now = Date.now();
  const html = `<div class="cook" role="dialog" aria-modal="true" aria-label="Mode cuisine">
    <div class="cook-top"><button class="icon-btn" data-act="cookclose" aria-label="Quitter le mode cuisine">${ICONS.close}</button><h2>${esc(r.title)}</h2>
      <button class="btn small" data-act="cookings" style="background:#1d2520;border-color:#2c3630;color:#f1f4f0">${c.showIngs ? "Masquer" : "Ingrédients"}</button></div>
    <div><div class="cook-progress">${steps.map((_, i) => `<i class="${i <= c.step ? "done" : ""}"></i>`).join("")}</div>
      ${c.timers.length ? `<div class="running">${c.timers.map((t) => `<span class="run ${t.rang ? "ring" : ""}" data-tid="${t.id}"><span>${t.rang ? "Terminé !" : fmtClock(t.paused ? t.left : (t.end - now) / 1000)}</span>${t.rang ? "" : `<button data-act="tpause" data-id="${t.id}" aria-label="${t.paused ? "Reprendre" : "Pause"}">${t.paused ? "▶" : "❚❚"}</button>`}<button data-act="tstop" data-id="${t.id}" aria-label="Arrêter">✕</button></span>`).join("")}</div>` : ""}</div>
    <div class="cook-body">
      ${c.showIngs ? `<div class="cook-ings"><ul>${(r.ingredients || []).map((i, k) => { const p = ingredientParts(i, c.factor); return `<li><label><input type="checkbox" data-act="ingtick" data-k="${k}" ${c.ticked[k] ? "checked" : ""}><span><b>${esc(p.qty)}</b> ${esc(p.name)}${i.optional ? ` <small style="color:#9eaaa2">(${OPT_LABEL[i.optional]})</small>` : ""}</span></label></li>`; }).join("")}</ul></div>` : ""}
      <div class="cook-step-n">${cur.section ? esc(cur.section) + " · " : ""}Étape ${c.step + 1} sur ${total}</div>
      <p class="cook-text">${esc(text)}</p>
      ${(() => { const used = ingredientsInStep(text, r.ingredients); return used.length ? `<ul class="cook-step-ings" aria-label="Ingrédients de cette étape">${used.map((i) => { const p = ingredientParts(i, c.factor); return `<li>${p.qty ? `<b>${esc(p.qty)}</b> ` : ""}${esc(p.name)}${i.optional ? ` <small>(${OPT_LABEL[i.optional]})</small>` : ""}</li>`; }).join("")}</ul>` : ""; })()}
      ${tms.length ? `<div class="cook-timers">${tms.map((t) => `<button class="timer-btn" data-act="tstart" data-sec="${t.sec}" data-label="${esc(t.label)}">${ICONS.timer} Lancer ${esc(t.label)}</button>`).join("")}</div>` : ""}
    </div>
    <div class="cook-nav"><button class="btn" data-act="cookprev" ${c.step === 0 ? "disabled" : ""}>${ICONS.back} Préc.</button>
      ${c.step < total - 1 ? `<button class="btn primary" data-act="cooknext">Étape suivante</button>` : `<button class="btn primary" data-act="cookdone">Terminé ! Bon appétit</button>`}</div>
  </div>`;
  const old = $(".cook");
  const wrap = document.createElement("div"); wrap.innerHTML = html;
  if (old) old.replaceWith(wrap.firstElementChild); else document.body.appendChild(wrap.firstElementChild);
  document.body.style.overflow = "hidden";
}

/* ---------- Rendu principal ---------- */
function render() {
  if (state.loading) { root.innerHTML = `<main class="wrap"><div class="empty"><span class="spinner"></span><p>Chargement du carnet…</p></div></main>`; return; }
  if (state.view === "reset") { root.innerHTML = viewReset(); bindAfterRender(); return; }
  if (!state.user) { root.innerHTML = viewAuth(); bindAfterRender(); return; }
  const views = { list: () => viewList("mine"), others: () => viewList("others"), recipe: viewRecipe, edit: viewEdit, add: viewAdd, import: viewImport, pantry: viewPantry, shopping: viewShopping, account: viewAccount };
  root.innerHTML = (views[state.view] || viewList)();
  bindAfterRender();
}

function bindAfterRender() {
  const q = $("#q");
  if (q) q.addEventListener("input", () => { state.q = q.value; const pos = q.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); });
  const sort = $("#sort"); if (sort) sort.addEventListener("change", () => { state.sort = sort.value; render(); });
  const fp = $("#f-photo"); if (fp) fp.addEventListener("change", () => { const f = fp.files[0]; if (!f) return; syncDraft(); state.editPhoto = { file: f, preview: URL.createObjectURL(f) }; render(); });
  const ef = $("#editform"); if (ef) ef.addEventListener("submit", (e) => { e.preventDefault(); saveDraft(); });
  const imf = $("#imp-file"); if (imf) imf.addEventListener("change", () => addImportFiles(imf.files));
  const drop = $("#drop");
  if (drop) {
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); addImportFiles(e.dataTransfer.files); });
  }
  const it = $("#imp-text"); if (it) it.addEventListener("input", () => (state.importText = it.value));
  const pf = $("#pantryform"); if (pf) pf.addEventListener("submit", (e) => { e.preventDefault(); const v = $("#pantry-in").value; v.split(/[,;]/).map((s) => s.trim()).filter(Boolean).forEach((s) => { if (!state.pantry.includes(s)) state.pantry.push(s); }); render(); $("#pantry-in")?.focus(); });
  const sf = $("#shopform"); if (sf) sf.addEventListener("submit", async (e) => { e.preventDefault(); const v = $("#shop-in").value.trim(); if (!v) return; const p = parseIngredientLine(v); await addToShopping([{ name: p.name, qty: p.qty, unit: p.unit || "" }]); render(); $("#shop-in")?.focus(); });
  const af = $("#authform"); if (af) af.addEventListener("submit", (e) => { e.preventDefault(); doAuth(); });
  const rf = $("#resetform"); if (rf) rf.addEventListener("submit", async (e) => { e.preventDefault(); try { await api.updatePassword($("#r-pass").value); state.authError = ""; state.view = "list"; await boot(); toast("Mot de passe modifié"); } catch (err) { state.authError = err.message; render(); } });
}

function addImportFiles(list) {
  const files = [...list].filter((f) => f.type.startsWith("image/")).slice(0, 3 - state.importFiles.length);
  files.forEach((f) => state.importFiles.push({ file: f, preview: URL.createObjectURL(f) }));
  state.importError = ""; render();
}

function syncDraft() {
  const d = state.draft; if (!d || !$("#editform")) return;
  d.title = $("#f-title").value.trim();
  d.category = $("#f-cat").value;
  d.servings = Math.max(1, parseInt($("#f-serv").value) || 4);
  d.prep_minutes = parseInt($("#f-prep").value) || null;
  d.cook_minutes = parseInt($("#f-cook").value) || null;
  d.ingredients = parseIngredientBlock($("#f-ings").value);
  d.steps = $("#f-steps").value.split(/\n/).map((s) => s.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim()).filter(Boolean);
  d.tags = [...new Set($("#f-tags").value.split(",").map((t) => t.trim().toLowerCase().replace(/^#/, "")).filter(Boolean))];
  d.origin = $("#f-origin").value.trim();
  d.tips = $("#f-tips").value.trim();
  const sh = $("#f-shared"); if (sh) d.is_shared = sh.checked;
}

async function saveDraft() {
  syncDraft();
  const d = state.draft, err = $("#f-err");
  if (!d.title) { err.textContent = "Donne un nom à la recette."; err.hidden = false; return; }
  const btn = $("#f-save"); btn.disabled = true; btn.textContent = "Enregistrement…";
  try {
    const rec = { ...d }; delete rec._fromImport;
    const oldPhoto = d._oldPhoto; delete rec._oldPhoto;
    if (state.editPhoto) rec.photo_path = await api.uploadPhoto(state.editPhoto.file);
    const saved = await api.saveRecipe(rec);
    if (oldPhoto && oldPhoto !== saved.photo_path) api.removePhoto(oldPhoto).catch(() => {});
    const i = state.recipes.findIndex((r) => r.id === saved.id);
    if (i >= 0) state.recipes[i] = saved; else state.recipes.push(saved);
    state.editPhoto = null; state.draft = null;
    state.history = state.history.filter((h) => !["edit", "import", "add"].includes(h.view));
    state.view = "recipe"; state.recipeId = saved.id; delete state.servings[saved.id];
    render(); window.scrollTo(0, 0); toast("Recette enregistrée");
  } catch (e) { console.error(e); err.textContent = "Enregistrement impossible : " + e.message; err.hidden = false; btn.disabled = false; btn.textContent = "Enregistrer"; }
}

async function copyRecipe(r) {
  const copy = JSON.parse(JSON.stringify(r));
  for (const k of ["id", "owner_id", "created_at", "updated_at"]) delete copy[k];
  const who = state.names[r.owner_id];
  copy.origin = [r.origin, who ? `Recette de ${who}` : ""].filter(Boolean).join(" · ");
  copy.is_shared = false;
  try {
    const saved = await api.saveRecipe(copy);
    state.recipes.push(saved);
    state.history = [];
    go("recipe", { recipeId: saved.id });
    toast("Copiée dans tes recettes : tu peux la modifier");
  } catch (e) { toast("Copie impossible : " + e.message); }
}

async function addToShopping(items) {
  const add = [];
  for (const it of items) {
    const ex = state.shopping.find((s) => !s.checked && norm(s.name) === norm(it.name) && (s.unit || "") === (it.unit || ""));
    // Un article devient obligatoire dès qu'une recette en a vraiment besoin
    const tag = ex ? (ex.tag && it.tag ? ex.tag : null) : it.tag || null;
    if (ex && ex.qty != null && it.qty != null) {
      const upd = await api.updateShopping(ex.id, { qty: Math.round((+ex.qty + +it.qty) * 100) / 100, tag, recipe_title: [ex.recipe_title, it.recipe_title].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ") || null });
      Object.assign(ex, upd);
    } else if (ex && ex.qty == null && it.qty == null) { if (ex.tag !== tag) Object.assign(ex, await api.updateShopping(ex.id, { tag })); }
    else add.push({ name: it.name, qty: it.qty == null ? null : Math.round(it.qty * 100) / 100, unit: it.unit || "", recipe_title: it.recipe_title || null, tag: it.tag || null });
  }
  if (add.length) state.shopping.push(...(await api.addShopping(add)));
}

async function doAuth() {
  const email = $("#a-email").value.trim();
  state.authError = ""; state.authInfo = "";
  try {
    if (state.authTab === "forgot") { await api.resetPassword(email); state.authInfo = "Si ce compte existe, un e-mail avec un lien vient d'être envoyé."; render(); return; }
    const pass = $("#a-pass").value;
    const u = state.authTab === "up" ? await api.signUp(email, pass, $("#a-name").value.trim()) : await api.signIn(email, pass);
    if (!u) { state.authInfo = "Compte créé. Confirme ton adresse avec le lien reçu par e-mail, puis connecte-toi."; state.authTab = "in"; render(); return; }
    state.user = u; await loadData(); state.view = "list"; render();
  } catch (e) {
    const m = e.message || "";
    state.authError = /invalid login/i.test(m) ? "E-mail ou mot de passe incorrect." : /registered|already/i.test(m) ? "Un compte existe déjà avec cet e-mail." : /signups not allowed/i.test(m) ? "Les inscriptions sont fermées : demande une invitation." : m;
    render();
  }
}

/* ---------- Actions (délégation d'événements) ---------- */
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act; const r = recipeById(state.recipeId);
  switch (act) {
    case "tab": state.history = []; if (el.dataset.v !== state.view) Object.assign(state, { q: "", cat: "", tag: "" }); go(el.dataset.v); break;
    case "member": state.member = el.dataset.v; render(); break;
    case "copy": copyRecipe(r); break;
    case "back": state.editPhoto = null; back(); break;
    case "open": go("recipe", { recipeId: el.dataset.id }); break;
    case "cat": state.cat = el.dataset.v; render(); break;
    case "tagf": state.tag = state.tag === el.dataset.v ? "" : el.dataset.v; render(); break;
    case "clearfilters": Object.assign(state, { q: "", cat: "", tag: "" }); render(); break;
    case "sv": { const cur = state.servings[r.id] || r.servings; state.servings[r.id] = Math.max(1, Math.min(60, cur + +el.dataset.d)); render(); break; }
    case "svreset": delete state.servings[r.id]; render(); break;
    case "cook": openCook(r); break;
    case "pdf": exportPdf(r, state.servings[r.id] || r.servings, "share"); break;
    case "print": exportPdf(r, state.servings[r.id] || r.servings, "print"); break;
    case "toshop": {
      const f = (state.servings[r.id] || r.servings) / r.servings;
      await addToShopping((r.ingredients || []).map((i) => ({ name: i.name, qty: i.qty == null ? null : (i.qty_max ?? i.qty) * f, unit: i.unit, recipe_title: r.title, tag: i.optional || null })));
      const nOpt = (r.ingredients || []).filter((i) => i.optional).length;
      render(); toast(`${(r.ingredients || []).length} ingrédients ajoutés aux courses${nOpt ? ` (dont ${nOpt} pas obligatoire${nOpt > 1 ? "s" : ""})` : ""}`); break;
    }
    case "edit": state.draft = { ...JSON.parse(JSON.stringify(r)), _oldPhoto: r.photo_path }; state.editPhoto = null; go("edit"); break;
    case "del": state.confirmDelete = true; render(); break;
    case "delno": state.confirmDelete = false; render(); break;
    case "delyes": try { await api.deleteRecipe(r.id); api.removePhoto(r.photo_path).catch(() => {}); state.recipes = state.recipes.filter((x) => x.id !== r.id); state.history = []; go("list"); toast("Recette supprimée"); } catch (err) { toast("Suppression impossible : " + err.message); } break;
    case "rate": { const v = +el.dataset.v; const cur = state.notes[r.id]?.rating; const n = await api.saveNote(r.id, { rating: cur === v ? null : v }); state.notes[r.id] = { ...state.notes[r.id], ...n }; render(); break; }
    case "made": { const n = await api.saveNote(r.id, { last_made: todayISO() }); state.notes[r.id] = { ...state.notes[r.id], ...n }; render(); toast("C'est noté !"); break; }
    case "savenote": { const n = await api.saveNote(r.id, { note: $("#note").value }); state.notes[r.id] = { ...state.notes[r.id], ...n }; toast("Note enregistrée"); break; }
    case "rmphoto": syncDraft(); state.editPhoto = null; state.draft.photo_path = null; render(); break;
    case "addmanual": state.draft = blankDraft(); state.editPhoto = null; go("edit"); break;
    case "addphoto": Object.assign(state, { importTab: "photo", importFiles: [], importError: "" }); go("import"); break;
    case "addtext": Object.assign(state, { importTab: "text", importText: "", importError: "" }); go("import"); break;
    case "impclear": state.importFiles = []; render(); break;
    case "impgo": runImport(); break;
    case "unpantry": state.pantry.splice(+el.dataset.i, 1); render(); break;
    case "clearpantry": state.pantry = []; render(); break;
    case "shopcheck": { const it = state.shopping.find((s) => s.id === el.dataset.id); it.checked = !it.checked; render(); api.updateShopping(it.id, { checked: it.checked }).catch(() => toast("Synchronisation impossible")); break; }
    case "shopclean": { const ids = state.shopping.filter((s) => s.checked).map((s) => s.id); await api.deleteShopping(ids); state.shopping = state.shopping.filter((s) => !s.checked); render(); break; }
    case "shopclear": state.confirmClear = true; render(); break;
    case "shopclearno": state.confirmClear = false; render(); break;
    case "shopclearyes": await api.deleteShopping(state.shopping.map((s) => s.id)); state.shopping = []; state.confirmClear = false; render(); break;
    case "shopcopy": {
      const txt = state.shopping.filter((s) => !s.checked).map((s) => "- " + (s.qty != null ? niceNumber(+s.qty, true, ["kg", "g", "mg", "l", "dl", "cl", "ml"].includes(s.unit)) + " " + (s.unit ? unitLabel(s.unit, +s.qty) + " " : "") : "") + s.name + (s.tag ? ` (${OPT_LABEL[s.tag] || s.tag}, pas obligatoire)` : "")).join("\n");
      try { await navigator.clipboard.writeText(txt); toast("Liste copiée"); } catch { toast("Copie impossible sur cet appareil"); }
      break;
    }
    case "authtab": state.authTab = el.dataset.v; state.authError = ""; state.authInfo = ""; render(); break;
    case "account": go("account"); break;
    case "signout": await api.signOut(); Object.assign(state, { user: null, recipes: [], notes: {}, shopping: [], history: [], view: "list" }); render(); break;
    // Mode cuisine
    case "cookclose": closeCook(); break;
    case "cookdone": { closeCook(); const n = await api.saveNote(r.id, { last_made: todayISO() }); state.notes[r.id] = { ...state.notes[r.id], ...n }; render(); toast("Bon appétit ! C'est noté pour aujourd'hui."); break; }
    case "cooknext": state.cook.step++; renderCook(); break;
    case "cookprev": state.cook.step = Math.max(0, state.cook.step - 1); renderCook(); break;
    case "cookings": state.cook.showIngs = !state.cook.showIngs; renderCook(); break;
    case "ingtick": state.cook.ticked[el.dataset.k] = el.checked; break;
    case "tstart": { try { audioCtx?.resume(); } catch {} const sec = +el.dataset.sec; state.cook.timers.push({ id: uid(), end: Date.now() + sec * 1000, label: el.dataset.label }); renderCook(); break; }
    case "tpause": { const t = state.cook.timers.find((x) => x.id === el.dataset.id); if (t.paused) { t.end = Date.now() + t.left * 1000; t.paused = false; } else { t.left = (t.end - Date.now()) / 1000; t.paused = true; } renderCook(); break; }
    case "tstop": state.cook.timers = state.cook.timers.filter((x) => x.id !== el.dataset.id); renderCook(); break;
  }
});
document.addEventListener("keydown", (e) => {
  if (!state.cook) return;
  if (e.key === "ArrowRight") { const r = recipeById(state.cook.id); if (state.cook.step < cookSteps(r).length - 1) { state.cook.step++; renderCook(); } }
  if (e.key === "ArrowLeft" && state.cook.step > 0) { state.cook.step--; renderCook(); }
  if (e.key === "Escape") closeCook();
});

async function runImport() {
  const images = [];
  if (state.importTab === "photo") {
    if (!state.importFiles.length) { state.importError = "Ajoute au moins une photo."; render(); return; }
  } else {
    state.importText = $("#imp-text")?.value || state.importText;
    if (state.importText.trim().length < 15) { state.importError = "Colle le texte de la recette."; render(); return; }
  }
  state.importBusy = true; state.importError = ""; render();
  try {
    if (state.importTab === "photo") for (const f of state.importFiles) images.push(await resizeImage(f.file, 1568, 0.85));
    const raw = CFG.aiImport === false ? localParseRecipe(state.importText) : await api.parseRecipe({ text: state.importTab === "text" ? state.importText : "", images });
    const parsed = normalizeParsed(raw);
    if (!parsed.title && !parsed.ingredients.length) throw new Error("Je n'ai pas trouvé de recette. Essaie avec une photo plus nette.");
    state.draft = { ...blankDraft(), ...parsed, _fromImport: true };
    state.importBusy = false; state.importFiles = [];
    go("edit");
  } catch (e) { console.error(e); state.importBusy = false; state.importError = e.message; render(); }
}

/* ---------- Démarrage ---------- */
async function loadData() {
  const [recipes, names, notes, shopping] = await Promise.all([api.listRecipes(), api.profiles(), api.listNotes(), api.listShopping()]);
  Object.assign(state, { recipes, names, notes, shopping });
}
async function boot() {
  render();
  try {
    state.user = await api.init();
    if (state.user) await loadData();
  } catch (e) { console.error(e); toast("Connexion au serveur impossible"); }
  state.loading = false;
  render();
}
window.Carnet = { localParseRecipe, parseIngredientLine, ingredientText, niceNumber, detectTimers, normalizeParsed };
boot();
})();
