# Maintenance des branches de l’atelier

Ces outils sont réservés à l’équipe pédagogique.

## Contrat pédagogique

Le socle vise environ 4 h de réinvestissement des acquis de semaine 1 et du lundi/mardi de semaine 2. Il comprend données, recherche, sélection multicritère, compatibilités, lecture de demandes, copies de fiches, commande, devis, frais paramétrables et favoris. Dix tests guidés sont obligatoires et répartis dans les étapes. JSON et exceptions ne sont pas requis.

Le seul bonus est l’audio. Nicolas transmet les neuf WAV sur Discord en cours de matinée. Les apprenants les ajoutent dans `sons/`, écrivent les associations et la fonction de recherche, puis intègrent eux-mêmes les lecteurs dans les cartes. Les commentaires de `app.py` et la documentation Streamlit orientent l’intégration. Aucun fichier audio n’est fourni dans les arbres Git des huit branches actives, y compris `correction`.

Les recettes de synthèse et les outils internes restent dans `sounds/`. Leurs sorties sont locales et ignorées par Git. Les anciens commits peuvent contenir des WAV ; la préparation d’une publication pédagogique doit exporter l’arbre, pas importer cet historique.

## Points de reprise

| Branche | Étapes terminées | Travail restant à partir de ce point |
| --- | --- | --- |
| `main` | Aucune. | Données : trois fiches et cinq erreurs intentionnelles. |
| `etape/02-recherche` | 1. | Recherche et sélection, deux tests. |
| `etape/03-compatibilites` | 1–2. | Compatibilités, différence de sets et un test. |
| `etape/04-commande` | 1–3. | Lecture, recherche de référence, budget, copies, commande et deux tests. |
| `etape/05-devis` | 1–4. | Cumuls, frais, récapitulatif, favoris et quatre tests. |
| `etape/06-tests` | 1–5. | Test du parcours complet et recette. |
| `etape/07-audio` | 1–6. | Ajout des fichiers reçus, associations, fonction audio et lecteurs. |
| `correction` | Socle et bonus. | Fichiers sonores à ajouter pour écouter. |

Les anciennes branches `etape/02-filtres`, `etape/03-budget`, `etape/04-favoris` et `etape/05-tests` ne sont plus des reprises de ce parcours. Elles ne doivent pas être sélectionnées pour une nouvelle publication.

## Fichiers et variantes

Tous les fichiers suivis sont communs, sauf :

- `catalogue.py` : incomplet et incorrect sur `main`, corrigé sur les reprises.
- `fonctions.py` : fonctions des étapes précédentes fournies, autres corps à écrire.
- `tests_perso.py` : tests des étapes précédentes fournis, autres tests guidés à écrire.
- `sons.py` : associations à écrire avant la correction audio.
- `app.py` : interface du socle et commentaires du bonus avant `correction` ; intégration audio sur `correction`.

`maintenance/niveaux.py` décrit les étapes et produit les variantes depuis les sources corrigées. Il conserve les signatures et contrats, ainsi que le début du premier test guidé. Les dictionnaires de `catalogue_source.txt` restent limités aux trois références non migrées ; ne pas dupliquer les treize autres fiches.

## Comparaisons GitHub

Chaque branche doit descendre du dernier commit de la précédente. Les comparaisons à trois points montrent uniquement le travail effectué pour atteindre le point suivant :

| Base | Comparaison | Fichiers modifiés |
| --- | --- | --- |
| `main` | `etape/02-recherche` | `catalogue.py` |
| `etape/02-recherche` | `etape/03-compatibilites` | `fonctions.py`, `tests_perso.py` |
| `etape/03-compatibilites` | `etape/04-commande` | `fonctions.py`, `tests_perso.py` |
| `etape/04-commande` | `etape/05-devis` | `fonctions.py`, `tests_perso.py` |
| `etape/05-devis` | `etape/06-tests` | `fonctions.py`, `tests_perso.py` |
| `etape/06-tests` | `etape/07-audio` | `tests_perso.py` |
| `etape/07-audio` | `correction` | `fonctions.py`, `sons.py`, `app.py` |

Reporter les changements communs sur `main`, puis avancer dans cet ordre en préservant les variantes. Ne pas réécrire les branches publiées. La synchronisation des fichiers seule ne suffit pas : vérifier aussi l’ascendance, afin d’exclure les anciens changements des diffs GitHub.

```sh
python maintenance/verifier_branches.py
git fetch origin
python maintenance/verifier_branches.py --remote origin
```

Le contrôleur lit les versions commitées, sans modifier les branches ni accéder au réseau. Il vérifie les fichiers communs, les variantes, les tests, l’absence d’audio livré et les sept diffs. Les références distantes doivent avoir été récupérées avant le second contrôle.

## Vérifications

```sh
python tests_catalogue.py
python tests_catalogue.py audio
python -m unittest discover -s maintenance -v
```

Le socle comprend le groupe `perso` et échoue si un test reste à compléter ou est supprimé. `audio` est explicite et contrôle les associations sans exiger les fichiers distribués séparément. La recette de l’interface et l’écoute complètent ces tests.

Sur un point de reprise, les fonctions et tests à écrire affichent `À COMPLÉTER` et le lanceur retourne un code d’échec. Seuls les groupes déjà terminés doivent réussir ; les erreurs intentionnelles de `main` sont attendues. Tester l’interface avec Streamlit 1.66.0, y compris une sélection vide et le parcours sans aucun WAV.

Pour l’audio, utiliser des fichiers temporaires hors du dépôt ou des WAV placés provisoirement dans `sons/`, puis les retirer avant le commit. Vérifier les lecteurs, le produit silencieux, le son partagé, le fichier manquant et l’absence de lecture automatique. Ne pas enregistrer une nouvelle validation humaine d’écoute à partir d’un simple test logiciel.

## Données et sémantique

La transcription vérifie les trois fiches de l’extrait. Les autres données sont contrôlées par leurs types, unités et cohérence. Le prix de RE-06 exige toujours une comparaison avec la note de comptabilité ; un test de type ne le détecte pas.

Le filtre de compatibilité examine les codes utilisés et fournis, sans relation indirecte. `consommables_sans_offre` compare les deux rôles par différence d’ensembles. RE-07 et RE-08 restent des alternatives ; la préparation de commande ajoute seulement les références explicitement demandées.

Les lignes copiées reçoivent les champs `quantite` et `sous_total_euros`. Les données imbriquées ne sont pas modifiées. Les quantités sont des nombres de conditionnements positifs ou nuls. Les demandes non vides respectent le format annoncé. Une ligne de quantité zéro reste présente et entraîne donc les frais d’une commande non vide.
