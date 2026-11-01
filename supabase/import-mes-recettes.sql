-- =========================================================
--  Import de mes 15 recettes dans La Popote des Copains
--  1. Crée d'abord ton compte dans l'app (Créer un compte).
--  2. Remplace ton-email@exemple.fr ci-dessous par l'e-mail de ce compte.
--  3. Supabase > SQL Editor > New query > colle ce fichier > Run.
--  Les recettes seront à toi et partagées avec les autres membres.
-- =========================================================
do $$
declare
  me uuid;
begin
  select id into me from auth.users where email = 'ton-email@exemple.fr';
  if me is null then
    raise exception 'Aucun compte avec cet e-mail : crée ton compte dans l''app puis corrige l''e-mail en haut du fichier.';
  end if;

  -- Purée maison
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Purée maison', 'Accompagnement', array['facile', 'classique']::text[], 4, 15, 25,
    '[{"qty":1,"unit":"kg","name":"pommes de terre (type Bintje, Agria ou Monalisa)"},{"qty":50,"unit":"g","name":"beurre"},{"qty":20,"qty_max":25,"unit":"cl","name":"lait chaud"},{"qty":null,"unit":"","name":"sel"},{"qty":null,"unit":"","name":"poivre","optional":"facultatif"},{"qty":1,"unit":"pincée","name":"noix de muscade","optional":"facultatif"}]'::jsonb,
    '["Épluchez les pommes de terre et coupez-les en morceaux.","Faites-les cuire dans une grande casserole d’eau salée pendant 20 à 25 minutes, jusqu’à ce qu’elles soient bien tendres.","Égouttez-les puis remettez-les 1 minute dans la casserole sur feu doux pour éliminer l’excès d’humidité.","Écrasez-les avec un presse-purée ou un écrase-pommes.","Incorporez le beurre, puis ajoutez progressivement le lait chaud jusqu’à obtenir une purée lisse et onctueuse.","Salez, poivrez et ajoutez une pincée de muscade si vous le souhaitez."]'::jsonb,
    'Évitez le mixeur, qui rend la purée élastique et collante. Un presse-purée ou une fourchette donne un meilleur résultat.', null, true);

  -- Poulet aux champignons à la crème
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Poulet aux champignons à la crème', 'Plat', array['rapide', 'poêle']::text[], 2, 10, 20,
    '[{"qty":300,"qty_max":400,"unit":"g","name":"filet de poulet coupé en dés"},{"qty":250,"unit":"g","name":"champignons de Paris émincés"},{"qty":20,"unit":"cl","name":"crème fraîche épaisse ou liquide"},{"qty":1,"unit":"","name":"oignon émincé"},{"qty":1,"unit":"gousse","name":"ail hachée","optional":"facultatif"},{"qty":1,"unit":"c. à soupe","name":"huile ou 20 g de beurre"},{"qty":null,"unit":"","name":"sel"},{"qty":null,"unit":"","name":"poivre"},{"qty":null,"unit":"","name":"persil","optional":"facultatif"},{"qty":1,"unit":"c. à café","name":"moutarde","optional":"astuce"}]'::jsonb,
    '["Faire chauffer l’huile ou le beurre dans une poêle.","Faire revenir l’oignon 2 à 3 minutes.","Ajouter les dés de poulet et les faire dorer sur toutes les faces pendant 5 à 6 minutes.","Ajouter les champignons et cuire encore 5 minutes jusqu’à ce qu’ils rendent leur eau.","Ajouter l’ail, saler et poivrer.","Verser la crème fraîche, mélanger et laisser mijoter à feu doux 5 minutes.","Parsemer de persil avant de servir."]'::jsonb,
    'Pour une sauce plus parfumée, ajouter 1 cuillère à café de moutarde à la crème fraîche avant de l’incorporer.
À servir avec : riz blanc, tagliatelles fraîches, pommes de terre vapeur ou purée maison.', null, true);

  -- Sangria maison
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Sangria maison', 'Boisson', array['apéro', 'alcool', 'été']::text[], 6, 15, null,
    '[{"qty":75,"unit":"cl","name":"vin rouge fruité (1 bouteille)"},{"qty":10,"unit":"cl","name":"cognac ou brandy"},{"qty":5,"unit":"cl","name":"Cointreau ou Grand Marnier","optional":"facultatif"},{"qty":2,"unit":"","name":"oranges"},{"qty":1,"unit":"","name":"citron"},{"qty":1,"unit":"","name":"pomme"},{"qty":2,"qty_max":3,"unit":"c. à soupe","name":"sucre"},{"qty":25,"unit":"cl","name":"limonade ou eau gazeuse bien fraîche"},{"qty":null,"unit":"","name":"glaçons"},{"qty":20,"unit":"cl","name":"jus d’orange","optional":"astuce"},{"qty":10,"unit":"cl","name":"jus de citron","optional":"astuce"},{"qty":null,"unit":"","name":"pêches ou fruits rouges de saison (quelques morceaux)","optional":"astuce"}]'::jsonb,
    '["Couper les oranges, le citron et la pomme en morceaux.","Mettre les fruits dans un grand saladier ou une carafe.","Ajouter le sucre, le cognac et le Cointreau. Mélanger.","Verser le vin rouge.","Couvrir et laisser macérer au réfrigérateur au moins 4 heures, idéalement toute une nuit.","Juste avant de servir, ajouter la limonade ou l’eau gazeuse.","Ajouter les glaçons et servir bien frais."]'::jsonb,
    'Pour 6 à 8 personnes.
Version plus fruitée : ajouter 20 cl de jus d’orange, 10 cl de jus de citron et quelques morceaux de pêche ou de fruits rouges selon la saison.
Une sangria gagne nettement en goût après 12 à 24 heures de macération.', null, true);

  -- Blanquette de veau au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Blanquette de veau au Cookeo', 'Plat', array['cookeo', 'mijoté', 'classique']::text[], 4, 20, 40,
    '[{"qty":1,"unit":"kg","name":"veau à blanquette (épaule, tendron ou collier)"},{"qty":2,"unit":"","name":"carottes"},{"qty":250,"unit":"g","name":"champignons de Paris"},{"qty":1,"unit":"","name":"gros oignon"},{"qty":1,"unit":"","name":"poireau"},{"qty":20,"unit":"cl","name":"crème fraîche épaisse"},{"qty":1,"unit":"","name":"jaune d’œuf"},{"qty":50,"unit":"cl","name":"bouillon de volaille"},{"qty":20,"unit":"g","name":"beurre"},{"qty":2,"unit":"c. à soupe","name":"farine"},{"qty":1,"unit":"","name":"bouquet garni (thym, laurier)"},{"qty":0.5,"unit":"","name":"citron (le jus)"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":100,"unit":"g","name":"petits oignons grelots","optional":"astuce"}]'::jsonb,
    '["# La cuisson","Couper les carottes en rondelles, le poireau en tronçons, émincer l’oignon et les champignons.","En mode Dorer, faire fondre le beurre puis faire revenir l’oignon 2 minutes.","Ajouter le veau et le faire colorer légèrement pendant 5 minutes.","Saupoudrer de farine, mélanger pendant 1 minute.","Ajouter les carottes, le poireau, les champignons, le bouquet garni et le bouillon. Saler légèrement et poivrer.","Passer en cuisson sous pression pendant 30 minutes.","# La sauce onctueuse","Dans un bol, mélanger la crème fraîche, le jaune d’œuf et le jus de citron.","À la fin de la cuisson, retirer le bouquet garni.","Ajouter le mélange crème-jaune d’œuf dans la cuve et remuer délicatement. Laisser épaissir 2 à 3 minutes en maintien au chaud sans faire bouillir."]'::jsonb,
    'Pour 4 à 6 personnes.
Ajouter 100 g de petits oignons grelots revenus au beurre avant le service.
Servir avec du riz pilaf ou des pommes de terre vapeur.
La sauce devient particulièrement veloutée si elle repose 10 minutes avant dégustation.', null, true);

  -- Viande et légumes mijotés au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Viande et légumes mijotés au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 20, 35,
    '[{"qty":600,"unit":"g","name":"bœuf à mijoter (paleron, macreuse ou bourguignon)"},{"qty":4,"unit":"","name":"carottes"},{"qty":4,"unit":"","name":"pommes de terre"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":250,"unit":"g","name":"champignons de Paris"},{"qty":20,"unit":"cl","name":"bouillon de bœuf"},{"qty":1,"unit":"c. à soupe","name":"concentré de tomate"},{"qty":1,"unit":"c. à soupe","name":"huile"},{"qty":1,"unit":"feuille","name":"laurier"},{"qty":null,"unit":"","name":"thym"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":1,"unit":"c. à soupe","name":"maïzena","optional":"astuce"}]'::jsonb,
    '["Couper la viande en gros cubes.","Éplucher les carottes et les pommes de terre puis les couper en morceaux.","Émincer l’oignon et hacher l’ail.","En mode Dorer, faire revenir l’huile, l’oignon et la viande pendant 5 minutes.","Ajouter l’ail, le concentré de tomate et mélanger.","Incorporer les carottes, les pommes de terre, les champignons, le bouillon, le laurier et le thym.","Saler et poivrer légèrement.","Lancer la cuisson sous pression pour 30 minutes.","À la fin de la cuisson, ajuster l’assaisonnement."]'::jsonb,
    'Pour une sauce plus épaisse, mélanger 1 cuillère à soupe de maïzena avec un peu d’eau froide et ajouter en mode Dorer pendant 2 à 3 minutes.', null, true);

  -- Sauté de porc aux légumes et moutarde au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Sauté de porc aux légumes et moutarde au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 15, 30,
    '[{"qty":700,"unit":"g","name":"échine ou sauté de porc"},{"qty":3,"unit":"","name":"carottes"},{"qty":2,"unit":"","name":"courgettes"},{"qty":1,"unit":"","name":"oignon"},{"qty":20,"unit":"cl","name":"crème fraîche"},{"qty":1,"unit":"c. à soupe","name":"moutarde à l’ancienne"},{"qty":15,"unit":"cl","name":"bouillon de volaille"},{"qty":1,"unit":"c. à soupe","name":"huile"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":null,"unit":"","name":"persil"}]'::jsonb,
    '["Couper le porc en morceaux.","Émincer l’oignon, couper les carottes en rondelles et les courgettes en dés.","En mode Dorer, faire revenir l’huile, l’oignon et le porc pendant 5 minutes.","Ajouter les carottes et poursuivre 2 minutes.","Incorporer le bouillon, saler légèrement et poivrer.","Cuire sous pression 18 minutes.","Ajouter les courgettes, la moutarde et la crème fraîche.","Relancer la cuisson sous pression 4 minutes.","Parsemer de persil avant de servir."]'::jsonb,
    'Servir avec du riz, des pâtes fraîches ou simplement du pain de campagne pour profiter de la sauce.', null, true);

  -- Bœuf mijoté à la provençale au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Bœuf mijoté à la provençale au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 20, 42,
    '[{"qty":800,"unit":"g","name":"bœuf à mijoter"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":3,"unit":"","name":"carottes"},{"qty":1,"unit":"","name":"poivron rouge"},{"qty":400,"unit":"g","name":"tomates concassées"},{"qty":100,"unit":"g","name":"olives noires"},{"qty":20,"unit":"cl","name":"bouillon de bœuf"},{"qty":1,"unit":"c. à soupe","name":"huile d’olive"},{"qty":null,"unit":"","name":"thym, romarin"},{"qty":null,"unit":"","name":"sel, poivre"}]'::jsonb,
    '["Couper le bœuf en gros cubes.","Émincer l’oignon et l’ail. Couper les carottes en rondelles et le poivron en lanières.","En mode Dorer, faire revenir l’huile, l’oignon et la viande pendant 5 à 6 minutes.","Ajouter l’ail et mélanger 1 minute.","Incorporer les carottes, le poivron, les tomates concassées, le bouillon, les olives et les herbes.","Saler modérément et poivrer.","Lancer la cuisson sous pression pour 35 minutes.","Laisser reposer 5 minutes avant de servir."]'::jsonb,
    'La sauce devient encore meilleure réchauffée le lendemain.
Accompagner de pommes de terre vapeur, de riz ou de polenta.', null, true);

  -- Poulet façon blanquette au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Poulet façon blanquette au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 15, 20,
    '[{"qty":800,"unit":"g","name":"cuisses ou hauts de cuisse de poulet désossés"},{"qty":4,"unit":"","name":"carottes"},{"qty":250,"unit":"g","name":"champignons de Paris"},{"qty":1,"unit":"","name":"oignon"},{"qty":20,"unit":"cl","name":"crème fraîche"},{"qty":20,"unit":"cl","name":"bouillon de volaille"},{"qty":1,"unit":"c. à soupe","name":"farine"},{"qty":1,"unit":"c. à soupe","name":"huile"},{"qty":1,"unit":"","name":"jaune d’œuf"},{"qty":1,"unit":"c. à soupe","name":"jus de citron"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":null,"unit":"","name":"thym"}]'::jsonb,
    '["Couper le poulet en gros morceaux.","Émincer l’oignon, couper les carottes en rondelles et les champignons en quartiers.","En mode Dorer, faire revenir l’huile, l’oignon et le poulet pendant 5 minutes.","Saupoudrer de farine et mélanger.","Ajouter les carottes, les champignons, le bouillon et le thym.","Cuire sous pression 12 minutes.","Dans un bol, mélanger la crème, le jaune d’œuf et le jus de citron.","Ajouter ce mélange dans la cuve en fin de cuisson, remuer sans faire bouillir.","Rectifier l’assaisonnement."]'::jsonb,
    'Servir avec du riz, des tagliatelles fraîches ou des pommes de terre vapeur.', null, true);

  -- Veau marengo au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Veau marengo au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 15, 32,
    '[{"qty":800,"unit":"g","name":"sauté de veau"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"","name":"carottes"},{"qty":250,"unit":"g","name":"champignons de Paris"},{"qty":400,"unit":"g","name":"tomates concassées"},{"qty":15,"unit":"cl","name":"bouillon de volaille"},{"qty":1,"unit":"c. à soupe","name":"concentré de tomate"},{"qty":1,"unit":"c. à soupe","name":"huile d’olive"},{"qty":1,"unit":"feuille","name":"laurier"},{"qty":null,"unit":"","name":"thym"},{"qty":null,"unit":"","name":"sel, poivre"}]'::jsonb,
    '["Couper le veau en morceaux si nécessaire.","Émincer l’oignon, couper les carottes en rondelles et les champignons en quartiers.","En mode Dorer, faire revenir l’huile, l’oignon puis le veau pendant 5 minutes.","Ajouter le concentré de tomate et mélanger 1 minute.","Incorporer les carottes, les champignons, les tomates concassées, le bouillon, le thym et le laurier.","Saler et poivrer.","Cuire sous pression 25 minutes.","Laisser reposer quelques minutes avant de servir."]'::jsonb,
    'Accompagner de pâtes fraîches, de riz ou de pommes de terre vapeur.
La sauce tomate parfumée aux herbes se marie particulièrement bien avec le veau.', null, true);

  -- Salade niçoise
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Salade niçoise', 'Entrée', array['salade', 'été']::text[], 4, 25, 10,
    '[{"qty":4,"unit":"","name":"tomates mûres"},{"qty":1,"unit":"","name":"concombre"},{"qty":1,"unit":"","name":"poivron vert"},{"qty":1,"unit":"","name":"petit oignon rouge"},{"qty":200,"unit":"g","name":"haricots verts fins"},{"qty":4,"unit":"","name":"œufs"},{"qty":1,"unit":"boîte","name":"thon au naturel (petite)"},{"qty":8,"unit":"filet","name":"anchois"},{"qty":1,"unit":"poignée","name":"olives noires de Nice"},{"qty":null,"unit":"","name":"basilic (quelques feuilles)"},{"qty":4,"unit":"c. à soupe","name":"huile d’olive","group":"Vinaigrette"},{"qty":1,"unit":"c. à soupe","name":"vinaigre de vin","group":"Vinaigrette"},{"qty":null,"unit":"","name":"sel, poivre","group":"Vinaigrette"}]'::jsonb,
    '["Faire cuire les œufs 9 minutes dans l’eau bouillante, puis les refroidir et les couper en quartiers.","Cuire les haricots verts 5 à 7 minutes dans l’eau bouillante salée. Égoutter et laisser refroidir.","Couper les tomates en quartiers, le concombre en rondelles et le poivron en fines lamelles.","Émincer l’oignon rouge.","Disposer tous les légumes dans un grand saladier.","Ajouter le thon émietté, les anchois et les olives.","Préparer la vinaigrette en mélangeant huile, vinaigre, sel et poivre.","Arroser la salade, ajouter les feuilles de basilic et servir frais."]'::jsonb,
    'Variante traditionnelle niçoise : à Nice, certains puristes ne mettent ni pommes de terre ni haricots verts cuits dans la recette authentique. On y trouve surtout tomates, œufs, anchois, thon, cébettes, olives et crudités.', null, true);

  -- Hachis Parmentier classique
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Hachis Parmentier classique', 'Plat', array['four', 'classique']::text[], 4, 25, 45,
    '[{"qty":800,"unit":"g","name":"pommes de terre farineuses"},{"qty":400,"unit":"g","name":"bœuf haché"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":20,"unit":"cl","name":"lait"},{"qty":40,"unit":"g","name":"beurre"},{"qty":100,"unit":"g","name":"fromage râpé"},{"qty":1,"unit":"c. à soupe","name":"huile"},{"qty":null,"unit":"","name":"sel"},{"qty":null,"unit":"","name":"poivre"},{"qty":null,"unit":"","name":"muscade","optional":"facultatif"},{"qty":null,"unit":"","name":"persil","optional":"facultatif"},{"qty":1,"unit":"","name":"carotte","optional":"astuce"},{"qty":null,"unit":"","name":"fond de veau (un peu)","optional":"astuce"},{"qty":null,"unit":"","name":"chapelure","optional":"astuce"},{"qty":null,"unit":"","name":"beurre (quelques noisettes)","optional":"astuce"}]'::jsonb,
    '["Éplucher les pommes de terre. Les couper en morceaux.","Cuire dans l’eau salée environ 20 minutes jusqu’à ce qu’elles soient tendres.","Pendant ce temps, émincer l’oignon et l’ail.","Faire revenir l’oignon dans l’huile 3 à 4 minutes.","Ajouter l’ail puis le bœuf haché.","Cuire jusqu’à coloration complète. Saler, poivrer. Ajouter du persil si voulu.","Égoutter les pommes de terre.","Écraser en purée avec le beurre et le lait chaud. Ajouter sel, poivre et un peu de muscade.","Dans un plat à gratin : déposer la viande, recouvrir avec la purée, puis ajouter le fromage râpé.","Cuire au four à 200 °C pendant 20 à 25 minutes jusqu’à gratin doré."]'::jsonb,
    'Variante plus riche : ajouter une carotte coupée finement avec l’oignon, un peu de fond de veau dans la viande, et de la chapelure avec des noisettes de beurre sur le dessus pour une croûte plus croustillante.
Accompagnement : salade verte vinaigrée ou haricots verts.', null, true);

  -- Jarret de porc mijoté au Cookeo, légumes racines
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Jarret de porc mijoté au Cookeo, légumes racines', 'Plat', array['cookeo', 'mijoté']::text[], 4, 20, 90,
    '[{"qty":1.2,"qty_max":1.5,"unit":"kg","name":"jarret de porc demi-sel ou frais (1 jarret)"},{"qty":4,"unit":"","name":"carottes"},{"qty":3,"unit":"","name":"pommes de terre"},{"qty":2,"unit":"","name":"navets"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":20,"unit":"cl","name":"vin blanc sec"},{"qty":40,"unit":"cl","name":"bouillon (ou eau)"},{"qty":1,"unit":"","name":"bouquet garni"},{"qty":1,"unit":"c. à soupe","name":"huile"},{"qty":null,"unit":"","name":"poivre"},{"qty":null,"unit":"","name":"sel (seulement si jarret frais)","optional":"facultatif"}]'::jsonb,
    '["Si jarret demi-sel : dessaler 1 h dans l’eau froide, changer l’eau une fois.","Éplucher et couper les légumes en gros morceaux. Émincer oignon et ail.","Mode Dorer : huile, colorer le jarret sur toutes les faces 8 à 10 min. Réserver.","Faire revenir oignon et ail 2 à 3 min. Déglacer au vin blanc, réduire 1 min.","Remettre le jarret. Ajouter eau/bouillon, bouquet garni, poivre. Le liquide doit arriver à mi-hauteur.","Cuisson sous pression : 45 min (jarret frais) ou 35 min (déjà précuit).","Ajouter carottes et navets. Cuisson sous pression : 10 min.","Ajouter pommes de terre. Cuisson sous pression : 8 min.","Maintien au chaud 10 min couvercle fermé. Ajuster l’assaisonnement."]'::jsonb,
    'Résultat attendu : viande fondante, légumes structurés.
Si la sauce est trop liquide, retirer viande et légumes, puis réduire en mode Dorer 5 à 10 min.
Jarret demi-sel : prévoir 1 h de dessalage en plus.', null, true);

  -- Ragoût rustique d’échine de porc au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Ragoût rustique d’échine de porc au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 20, 40,
    '[{"qty":500,"unit":"g","name":"échine de porc en cubes"},{"qty":4,"unit":"","name":"carottes"},{"qty":3,"unit":"","name":"navets"},{"qty":4,"unit":"","name":"pommes de terre"},{"qty":1,"unit":"","name":"oignon"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":20,"unit":"cl","name":"bouillon (volaille ou légumes)"},{"qty":10,"unit":"cl","name":"vin blanc sec"},{"qty":1,"unit":"c. à soupe","name":"concentré de tomate"},{"qty":null,"unit":"","name":"thym, laurier"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":null,"unit":"","name":"huile"},{"qty":300,"qty_max":400,"unit":"g","name":"sauce tomate (remplace le vin et le concentré)","optional":"astuce"},{"qty":1,"unit":"pincée","name":"sucre (si la sauce est acide)","optional":"astuce"}]'::jsonb,
    '["Mode Dorer. Huile. Saisir la viande 4 à 5 min jusqu’à coloration franche. Retirer.","Toujours en Dorer. Ajouter l’oignon émincé et l’ail. Suer 2 min. Ajouter le concentré de tomate. Torréfier 1 min.","Déglacer au vin blanc. Réduire 1 min.","Remettre la viande. Ajouter les carottes en rondelles, les navets en quartiers, les pommes de terre en gros morceaux. Ajouter thym et laurier. Saler, poivrer.","Verser le bouillon à hauteur sans noyer.","Cuisson sous pression 25 min.","Relâcher la pression. Vérifier la texture. Si nécessaire, mode Dorer 5 à 10 min pour concentrer le jus."]'::jsonb,
    'Résultat attendu : viande fondante, légumes tendres, sauce courte et nappante.

Variante à la sauce tomate (remplace le vin blanc et le concentré par 300 à 400 g de sauce tomate) :
1. Dorer la viande. Réserver.
2. Dorer oignon et ail.
3. Remettre la viande. Ajouter carottes, navets, pommes de terre.
4. Verser la sauce tomate + 10 à 15 cl de bouillon. La sauce ne doit pas couvrir totalement, seulement enrober.
5. Thym, laurier, sel, poivre.
6. Cuisson sous pression 25 min.

Si la sauce est acide, corriger en fin de cuisson avec une pincée de sucre. Si trop liquide, mode Dorer 5 à 10 min pour réduire.', null, true);

  -- Bœuf bourguignon simplifié au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Bœuf bourguignon simplifié au Cookeo', 'Plat', array['cookeo', 'mijoté', 'classique']::text[], 4, 20, 60,
    '[{"qty":1,"unit":"kg","name":"bœuf à bourguignon"},{"qty":2,"unit":"","name":"oignons"},{"qty":2,"unit":"","name":"carottes"},{"qty":2,"unit":"gousse","name":"ail"},{"qty":200,"unit":"g","name":"champignons"},{"qty":75,"unit":"cl","name":"vin rouge"},{"qty":20,"unit":"cl","name":"bouillon de bœuf"},{"qty":2,"unit":"c. à soupe","name":"farine"},{"qty":2,"unit":"c. à soupe","name":"huile"},{"qty":1,"unit":"","name":"bouquet garni"},{"qty":null,"unit":"","name":"sel, poivre"}]'::jsonb,
    '["Mode Dorer. Chauffer l’huile. Saisir la viande par petites quantités. Réserver.","Faire revenir les oignons émincés et l’ail. Ajouter les carottes en rondelles.","Remettre la viande. Saupoudrer de farine. Mélanger 1 minute.","Verser le vin rouge et le bouillon. Ajouter le bouquet garni, sel, poivre.","Ajouter les champignons.","Mode Cuisson sous pression : 45 minutes.","Repos 5 minutes. Retirer le bouquet garni. Ajuster l’assaisonnement."]'::jsonb,
    'Résultat : viande fondante, sauce liée.
Accompagnement neutre recommandé : pommes de terre vapeur, pâtes ou riz.', null, true);

  -- Plat de côte mijoté très long au Cookeo
  insert into public.recipes (owner_id, title, category, tags, servings, prep_minutes, cook_minutes, ingredients, steps, tips, origin, is_shared)
  values (me, 'Plat de côte mijoté très long au Cookeo', 'Plat', array['cookeo', 'mijoté']::text[], 4, 20, 210,
    '[{"qty":1.5,"qty_max":2,"unit":"kg","name":"plat de côte de bœuf"},{"qty":2,"unit":"","name":"oignons"},{"qty":4,"unit":"","name":"carottes"},{"qty":3,"unit":"gousse","name":"ail"},{"qty":1,"unit":"branche","name":"céleri"},{"qty":1,"unit":"","name":"bouquet garni"},{"qty":1,"unit":"c. à soupe","name":"concentré de tomate"},{"qty":50,"unit":"cl","name":"vin rouge"},{"qty":50,"unit":"cl","name":"bouillon de bœuf"},{"qty":null,"unit":"","name":"sel, poivre"},{"qty":null,"unit":"","name":"huile (un peu)"}]'::jsonb,
    '["# Dorage","Mode Dorer. Ajouter l’huile.","Saisir le plat de côte sur toutes les faces, coloration franche. Retirer la viande.","Ajouter les oignons émincés et l’ail. Faire revenir 2 à 3 min.","Déglacer avec le vin rouge. Réduction 3 à 4 min.","Ajouter le concentré de tomate.","# Mise en place","Remettre la viande. Ajouter les carottes, le céleri et le bouquet garni.","Verser le bouillon (liquide à hauteur sans dépasser la limite).","Poivrer. Saler modérément.","# Cuisson longue fractionnée","Mode Cuisson sous pression : 1er cycle de 45 min, puis décompression naturelle.","Retourner la viande. 2e cycle de 45 min, puis décompression naturelle.","Retourner la viande. 3e cycle de 45 min, puis décompression naturelle.","# Concentration","Retirer le couvercle. Mode Dorer 10 à 15 min pour réduire la sauce.","Ajuster sel et poivre."]'::jsonb,
    'Le Cookeo ne gère pas 6 h en une fois : procéder par cycles. Temps sous pression total : 2 h 15, soit l’équivalent d’environ 6 h de mijotage.
Résultat attendu : viande très fondante, fibres longues, texture gélatineuse.
Optimal après repos prolongé ou réchauffage le lendemain.', null, true);

  raise notice '% recettes importées', 15;
end $$;
