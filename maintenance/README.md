# Maintenance des branches de l’atelier

Ces opérations sont réservées à l’équipe pédagogique. Elles ne font pas partie du travail demandé aux apprenants.

## Une spécification commune, plusieurs points de départ

Le socle réinvestit les acquis de semaine 1 et du lundi/mardi de semaine 2 : données, collections, fonctions, budget et mutation des favoris. Les tests personnels et les exceptions sont des bonus indépendants. Traceback et JSON relèvent de la séance du jeudi.

`correction` contient les données et les quatre fonctions corrigées, ainsi que des exemples de tests personnels facultatifs. `main` et les branches `etape/*` conservent les mêmes consignes, extrait source, tests fournis, interface et visuels. Leur catalogue Python et leurs fonctions reflètent l’étape à pratiquer.

`catalogue_source.txt` contient uniquement BB-02, BB-04 et RE-08, les trois fiches non migrées au départ. Les treize autres références se lisent directement dans `catalogue.py` ; ne pas dupliquer leurs fiches dans l’extrait. La note de relecture de l’énoncé donne les informations nécessaires aux erreurs d’unité et de prix.

| Branche | Catalogue Python | Fonctions à compléter | Tests personnels |
| --- | --- | --- | --- |
| `main` | Trois fiches absentes et cinq erreurs intentionnelles. | Les quatre. | À écrire. |
| `etape/02-filtres` | Complet et corrigé. | Les quatre. | À écrire. |
| `etape/03-budget` | Complet et corrigé. | Budget et favoris. | À écrire. |
| `etape/04-favoris` | Complet et corrigé. | Favoris. | À écrire. |
| `etape/05-tests` | Complet et corrigé. | Aucune. | Bonus à écrire. |
| `correction` | Complet et corrigé. | Aucune. | Exemples fournis. |

Les commentaires `À compléter` signalent uniquement les fiches manquantes et les fonctions à écrire dans chaque branche. Les erreurs intentionnelles du catalogue restent à identifier à partir des consignes et des fiches ; ne pas les marquer une par une.

Ne pas fusionner `correction` dans les branches pédagogiques : cela distribuerait les réponses. Ne pas remplacer leurs fichiers `fonctions.py` ou `tests_perso.py` par ceux du corrigé.

## Mettre à jour une spécification

1. Modifier les fiches, le catalogue corrigé, les consignes, l’interface et les tests concernés sur `correction`. Distinguer les tests de comportement sur de petits catalogues indépendants et les tests de transcription des fiches. Ne pas utiliser les descriptions commerciales pour calculer les compatibilités.
2. Reporter tous les fichiers suivis communs sur `main` et les branches `etape/*`, y compris les outils de maintenance, les dépendances et les médias. Seuls `catalogue.py`, `fonctions.py` et `tests_perso.py` varient selon l’étape. Les catalogues des reprises sont identiques au corrigé. Dans `main`, actualiser seulement les informations de référence sans résoudre les fiches manquantes et les erreurs intentionnelles. Préserver les fonctions et les tests personnels de chaque étape.
3. Synchroniser aussi les images et leurs prompts, sans confondre les références de génération d’images avec les dépendances des produits vendus. Le répertoire `images/tools/` est un outil de maintenance indépendant, pas un prérequis de l’atelier.
4. Vérifier les tests sur chaque branche avant de créer ses commits. Les échecs de données de `main` et les `NotImplementedError` des fonctions à écrire sont attendus ; les autres groupes déjà fournis doivent passer.
5. Une fois les commits préparés sur les six branches, vérifier les références locales avec la commande ci-dessous, puis publier toutes les branches. Ne pas annoncer une mise à jour terminée si une publication est bloquée.

```sh
python maintenance/verifier_branches.py
```

Le script utilise uniquement la bibliothèque standard Python. Il lit les versions **commitées** des six branches, pas les modifications non commitées. Il ne change aucune branche, ne crée aucun commit et ne publie rien. Il compare les fichiers communs, les catalogues attendus et la progression des fonctions et des tests personnels. Une évolution délibérée des exercices exige d’adapter aussi ses attentes.

Pour contrôler les références publiées après récupération depuis le dépôt concerné :

```sh
git fetch origin
python maintenance/verifier_branches.py --remote origin
```

Le contrôle distant utilise les références déjà récupérées ; il n’effectue aucun accès réseau lui-même.

Les tests du contrôleur n’utilisent ni accès réseau ni branches réelles :

```sh
python -m unittest discover -s maintenance -v
```

## Garder la portée pédagogique des tests

`python tests_catalogue.py` vérifie le socle et les tests personnels présents. Le groupe `exceptions` est lancé uniquement sur demande explicite ; il échoue tant que le bonus n’est pas réalisé, y compris sur le corrigé du socle. Le champ quantité de l’interface est limité aux entiers positifs ou nuls. Vérifier le bonus par appel de fonction, sans modifier l’interface.

Les vérifications de transcription couvrent les noms, descriptions, conditionnements, effets et codes des trois fiches de l’extrait uniquement. Les autres références sont contrôlées par les tests de structure et de cohérence, pas par une deuxième copie du catalogue. Le prix incorrect de RE-06 doit encore être trouvé en comparant l’affichage à la note de la comptabilité dans l’énoncé. Ne pas supprimer cette limite sans revoir les consignes de l’étape 1.

Les champs `consommables_utilises` et `consommables_fournis` distinguent les deux rôles ; une liste vide signifie qu’aucun code ne s’applique à ce rôle. Le filtre examine les deux listes, sans ajouter deux fois un produit. Les liquides RE-07 et RE-08 sont des alternatives pour BB-04 et RE-02. BB-02 utilise les mini-requins, mais ne reçoit aucun liquide : le filtre ne doit pas suivre cette relation indirecte. Une recommandation de commande doit aussi tenir compte des alternatives ; elle reste une extension.
