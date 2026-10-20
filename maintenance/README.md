# Maintenance des branches de l’atelier

Ces opérations sont réservées à l’équipe pédagogique. Elles ne font pas partie du travail demandé aux apprenants.

## Une spécification commune, plusieurs points de départ

`correction` contient les données et les quatre fonctions corrigées, ainsi que des exemples de tests personnels. `main` et les branches `reprise/*` conservent les mêmes consignes, fiches source, tests fournis, interface et visuels. Leur catalogue Python et leurs fonctions reflètent l’étape à pratiquer.

| Branche | Catalogue Python | Fonctions à compléter | Tests personnels |
| --- | --- | --- | --- |
| `main` | Trois fiches absentes et cinq erreurs intentionnelles. | Les quatre. | À écrire. |
| `reprise/02-filtres` | Complet et corrigé. | Les quatre. | À écrire. |
| `reprise/03-budget` | Complet et corrigé. | Budget et favoris. | À écrire. |
| `reprise/04-favoris` | Complet et corrigé. | Favoris. | À écrire. |
| `reprise/05-tests` | Complet et corrigé. | Aucune. | À écrire. |
| `correction` | Complet et corrigé. | Aucune. | Exemples fournis. |

Ne pas fusionner `correction` dans les branches pédagogiques : cela distribuerait les réponses. Ne pas remplacer leurs fichiers `fonctions.py` ou `tests_perso.py` par ceux du corrigé.

## Mettre à jour une spécification

1. Modifier les fiches, le catalogue corrigé, les consignes, l’interface et les tests concernés sur `correction`. Distinguer les tests de comportement sur de petits catalogues indépendants et les tests de transcription des fiches. Ne pas utiliser les descriptions commerciales pour calculer les compatibilités.
2. Reporter les fichiers communs sur `main` et toutes les reprises. Les catalogues des reprises sont identiques au corrigé. Dans `main`, actualiser seulement les informations de référence sans résoudre les fiches manquantes et les erreurs intentionnelles. Préserver les fonctions et les tests personnels de chaque étape.
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

Les vérifications de transcription couvrent les noms, descriptions, conditionnements, effets et codes. Elles ne comparent pas tous les prix aux fiches : une valeur numérique positive mais commercialement incorrecte doit encore être trouvée par lecture et comparaison. Ne pas supprimer cette limite sans revoir les consignes de l’étape 1.

Les codes regroupent des produits sans indiquer qui fournit ou consomme quoi. Les liquides RE-07 et RE-08 sont des alternatives pour BB-04 et RE-02. BB-02 utilise les mini-requins, mais ne reçoit aucun liquide : le filtre ne doit pas suivre cette relation indirecte. Une recommandation de commande exige un modèle plus explicite des usages et des alternatives ; elle reste une extension.
