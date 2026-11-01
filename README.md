# La Popote des Copains

App web de recettes perso, partagées entre les membres (connexion par e-mail + mot de passe).
Hébergement : **Netlify** · Données, comptes et photos : **Supabase** · Lecture des photos/textes : **API Claude**.

## Fonctionnalités

- Fiches recettes (ingrédients, étapes, temps, catégorie, mots-clés, photo, origine)
- Ajustement automatique des quantités selon le nombre de personnes
- Mode cuisine : écran qui reste allumé, gros texte, une étape à la fois, minuteurs détectés dans le texte (« 25 min », « 1 h 30 »)
- « Mon frigo » : tape 2-3 ingrédients, l'app trouve les recettes qui les utilisent
- Liste de courses générée depuis une recette (quantités additionnées), cochable, copiable
- Notes perso par membre : étoiles, remarques, date de dernière réalisation
- Import par photo (jusqu'à 3) ou texte collé, relu automatiquement puis corrigeable
- Export PDF en gros caractères (partage ou impression)
- Deux onglets : « Mes recettes » et « Recettes des copains » (recettes partagées par les autres membres, filtrables par personne)
- Partage : chaque recette est visible des autres membres, sauf si tu décoches « Partager »
- « Copier dans mes recettes » : reprendre la recette d'un autre membre pour l'adapter (la copie est privée au départ)
- Ingrédients facultatifs et ingrédients d'astuce, signalés dans la fiche, le PDF et la liste de courses

## Installation (≈ 15 min)

### 1. Supabase
1. Crée un projet sur supabase.com.
2. **SQL Editor → New query** : colle tout le fichier `supabase/schema.sql`, puis **Run**.
3. **Project Settings → API** : note l'**URL du projet** et la clé **anon public**.
4. **Authentication → URL Configuration** : mets l'adresse de ton site Netlify dans *Site URL* (ex. `https://mes-recettes.netlify.app`).
5. Facultatif, pour une app réservée aux invités : **Authentication → Providers → Email**, désactive *Allow new users to sign up*, puis invite les membres depuis **Authentication → Users → Invite**. Mets aussi `allowSignup: false` dans `js/config.js`.

### 2. Configuration de l'app
Dans `js/config.js`, renseigne `supabaseUrl` et `supabaseAnonKey`.
(Laissés vides, l'app tourne en mode démo, données dans le navigateur.)

### 3. Hébergement
**Option gratuite sans badge : GitHub Pages** (recommandé)
1. Dépôt GitHub public → **Settings → Pages** → *Deploy from a branch* → branche `main`, dossier `/ (root)` → **Save**.
2. L'adresse s'affiche après 1-2 min : `https://ton-pseudo.github.io/nom-du-depot/`.
3. Mets cette adresse dans Supabase (**Authentication → URL Configuration** : *Site URL* et *Redirect URLs*).

**Ou Netlify** (affiche un badge « Powered by Netlify » sur l'offre gratuite)
La lecture de photos utilise une *Edge Function* : déploie via Git (GitHub → Netlify) ou avec `netlify deploy`, pas par simple glisser-déposer.
1. Pousse ce dossier sur un dépôt GitHub, puis **Add new site → Import from Git**. Pas de commande de build, dossier publié : `.`
2. **Site configuration → Environment variables** :
   - `ANTHROPIC_API_KEY` : ta clé sur console.anthropic.com
   - `SUPABASE_URL` et `SUPABASE_ANON_KEY` : les mêmes valeurs que dans `config.js`
   - facultatif `ANTHROPIC_MODEL` (par défaut `claude-sonnet-5-5`)
3. Redéploie. Sur téléphone, « Ajouter à l'écran d'accueil » pour l'avoir comme une app.

### 4. Importer tes recettes
1. Ouvre ton site, **Créer un compte** avec ton e-mail (confirme-le si Supabase t'envoie un lien).
2. Ouvre `supabase/import-mes-recettes.sql`, remplace `ton-email@exemple.fr` par l'e-mail de ton compte.
3. **SQL Editor → New query** : colle le fichier, puis **Run**. Tes 15 recettes apparaissent dans « Mes recettes ».
   (Ne le lance qu'une fois, sinon elles seront en double.)

### 5. Inviter la famille
Envoie-leur l'adresse du site : ils créent leur compte et voient tes recettes dans « Recettes des copains ».

## Fichiers
```
index.html                         page de l'app
css/style.css                      styles (clair et sombre)
js/config.js                       tes clés Supabase
js/app.js                          toute la logique
js/seed.js                         recettes d'exemple (mode démo seulement)
netlify/edge-functions/parse-recipe.js   lecture photo/texte via l'API Claude
supabase/schema.sql                tables, règles de sécurité, stockage des photos
supabase/import-mes-recettes.sql   tes 15 recettes, à importer une fois
```

## Mise à jour
Si tu as déjà installé une version précédente, relance `schema.sql` : il ajoute ce qui manque sans rien effacer.

## Saisie rapide des ingrédients
Une ligne par ingrédient, quantité en premier : `200 g de farine`, `3 œufs`, `1/2 c. à café de sel`, `2 gousses d'ail`.
Les lignes sans quantité (`sel, poivre`) ne changent pas quand on ajuste les portions.
- `(facultatif)` en fin de ligne : ingrédient pas obligatoire
- une ligne `# Vinaigrette` : sous-titre (les lignes suivantes sont rangées dessous)
- une ligne `# Astuce` : les lignes suivantes sont les ingrédients de l'astuce
- dans les étapes, une ligne `# La sauce` crée aussi un sous-titre
