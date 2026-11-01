// Lit une recette (photos et/ou texte) avec l'API Claude et renvoie un JSON structuré.
// Variables d'environnement Netlify requises :
//   ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY   (facultatif : ANTHROPIC_MODEL)

const PROMPT = `Tu reçois une recette de cuisine (photo d'une fiche, page de livre, note manuscrite, ou texte collé).
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

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  const sbUrl = Netlify.env.get("SUPABASE_URL");
  const sbAnon = Netlify.env.get("SUPABASE_ANON_KEY");
  if (!key || !sbUrl || !sbAnon) return json({ error: "Lecture automatique non configurée sur le serveur." }, 500);

  // Seuls les membres connectés peuvent utiliser la lecture (évite les abus de la clé API)
  const auth = req.headers.get("authorization") || "";
  const who = await fetch(`${sbUrl}/auth/v1/user`, { headers: { Authorization: auth, apikey: sbAnon } });
  if (!who.ok) return json({ error: "Connecte-toi pour utiliser la lecture automatique." }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const text = String(body.text || "").slice(0, 30000);
  const images = (Array.isArray(body.images) ? body.images : []).slice(0, 3);
  if (!text.trim() && !images.length) return json({ error: "Rien à lire." }, 400);

  const content = [
    ...images.map((data) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } })),
    { type: "text", text: PROMPT + (text ? "\n\nTexte de la recette :\n" + text : "\n\nLa recette est sur la ou les photos jointes.") },
  ];

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: Netlify.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
      max_tokens: 4000,
      messages: [{ role: "user", content }],
    }),
  });
  if (!r.ok) {
    const detail = await r.text();
    console.error("Anthropic", r.status, detail);
    return json({ error: r.status === 429 ? "Trop de demandes, réessaie dans une minute." : "La lecture a échoué." }, 502);
  }
  const out = await r.json();
  const raw = (out.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
  try {
    return json({ recipe: JSON.parse(raw.slice(a, b + 1)) });
  } catch {
    return json({ error: "Je n'ai pas réussi à lire cette recette. Essaie une photo plus nette." }, 422);
  }
};

export const config = { path: "/api/parse-recipe" };
