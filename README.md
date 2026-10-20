# BureauBlasters : la productivité passe en mode mousse

## La situation

Tu viens de rejoindre **Ludiverse**, une petite ESN qui fait un carton dans la gamification en entreprise. Sa spécialité : transformer les moments pénibles du travail en défis qu’on aurait presque envie de relever.

Pour assurer une productivité et une ambiance absolument optimales, la **Happiness Team RH** et la direction ont décidé de franchir un cap : équiper tout·es les employé·es d’un arsenal ludique à projectiles en mousse.

L’objectif officiel : proposer des pauses de jeu entre volontaires pour détendre l’atmosphère. L’objectif officieux : donner un sens très littéral à « sortir l’artillerie lourde », sans dépasser le budget fournitures.

**BureauBlasters**, une jeune entreprise spécialisée dans les équipements de bureau franchement déraisonnables, a décroché le contrat. Ludiverse a obtenu un tarif exceptionnel : c’est son premier client.

Un super deal. Avec un petit astérisque.

BureauBlasters a consacré tout son budget au design des produits. Les fiches sont prêtes, mais le catalogue Python est incomplet et contient des erreurs. L’interface sait afficher des cartes et des boutons ; les fonctions derrière restent à écrire. Quant au bouton « Calculer le budget », il répond pour le moment « Faites confiance à votre intuition ».

La direction de Ludiverse apprécie l’audace. La comptabilité, un peu moins.

Tu récupères le prototype avant la première commande. À toi de rendre le catalogue utilisable.

### La gamme BureauBlasters

- **Rafale de Post-it** : blaster compact à fléchettes en mousse, chargeur de 12 fléchettes, LED orange et bruit de tampon administratif à chaque tir.
- **Requin Arêtes** : le modèle phare. Un lance-requins de 1,18 m à porter à deux mains, gueule dentée, yeux lumineux et graffitis roses et bleus. Il propulse à l’air comprimé les **Mini-requins fumigènes (RE-02)**, qui zigzaguent en diffusant une brume ultrasonique par plusieurs trous, éclairée en rose et bleu par des LED voisines, dans un éclat de rire enregistré. Les liquides **RE-07 ou RE-08** remplissent les mini-requins, jamais le lanceur ; la senteur dépend du liquide choisi.
- **Gantelets du Sprint** : paire de gantelets lance-disques, LED violettes et jingle de montée de niveau.
- **Fumigène à ultrason** : grenade-jouet de poche de **4 × 4 × 6 cm**, à enveloppe en **silicone mat amortissant** ; trois exemplaires tiennent dans une main. Étanche, indice **IP68**, elle diffuse pendant 20 secondes une brume d’eau produite par ultrasons à travers plusieurs trous, avec des LED roses à proximité de chaque sortie. Son petit réservoir intégré se recharge par un **clapet à charnière souple**, appareil éteint, en y versant un liquide à base d’eau : **Brume neutre (RE-07)** sans parfum ou **Brume girofle-agrumes (RE-08)** parfumé. Ces liquides sont vendus séparément en petites bouteilles de **100 ml**, pour plusieurs remplissages.
- **Coin-Coin de Crise** : canon à canards en mousse, chaque canard émet un coin-coin au départ.
- **Arbalète Anti-Réunionite** : arbalète à fléchettes en mousse, armement à levier et « ding » à chaque tir.
- **Catapulte à Croissants** : catapulte de bureau à bras réglable, clochette de boulangerie, croissants en mousse parfumés. Non comestible.
- **Orbe de Décompression** : lanceur sphérique de balles en mousse, tenu à une main, halo vert pendant le chargement.

BureauBlasters vend aussi les **munitions de remplacement** et les **bouteilles de recharge liquide pour la brume**. Munitions et liquides se commandent séparément des équipements ; les réservoirs sont livrés vides. Seul le conditionnement décrit ce qui est inclus, pas les objets visibles sur les photos de démonstration. La direction souhaite éviter de commander six canons sans canards, ou deux litres de liquide sans appareil à remplir.

## Ta mission

**Fiabilise les données et complète les fonctions Python du catalogue.**

La Happiness Team doit pouvoir consulter les produits, retrouver les équipements et recharges compatibles, estimer une commande et conserver ses favoris pendant sa session.

Tu travailles sur les données et les quatre fonctions du catalogue. L’interface Streamlit affiche les fiches produits, propose les filtres de compatibilité, présente le budget et conserve les favoris pendant la session. Vérifie ces quatre usages dans l’interface, avec l’aperçu terminal ou avec les vérifications fournies.

**Couverture :** types et conversions, conditions, boucles, listes, dictionnaires, sets, fonctions avec paramètres et retours, mutation et partage des objets.

**Prérequis :** tu sais lancer un script et utiliser des variables, des conditions et des boucles ; tu as pratiqué les collections, les fonctions et la mutation d’un dictionnaire.

**Durée indicative :** environ 6 heures, selon ton rythme et les extensions choisies.

**Modalité :** travail individuel ; échange avec les autres pour comprendre un blocage.

## Tes fichiers de travail

```text
catalogue_source.txt         Les 16 fiches produits de référence
catalogue.py                 Les données Python à corriger et compléter
fonctions.py                 Les quatre fonctions à compléter
tests_catalogue.py           Les vérifications fournies et leur lancement
tests_perso.py               Tes propres tests, en bonus
app.py                       L’interface Streamlit
apercu_terminal.py           L’aperçu utilisable sans Streamlit
images/                      Les visuels des produits
requirements.txt             Les dépendances du projet
```

Le catalogue comprend **8 équipements et 8 références de munitions ou recharges**. Tu modifies `catalogue.py` et `fonctions.py`, puis `tests_perso.py` si tu choisis le bonus tests. Lis les autres fichiers autant que tu veux : ils montrent comment tes fonctions sont utilisées.

## Ouvre ton environnement

### Crée ta copie du projet

Sur la page du dépôt [SIMPLON-DIST-DEVIA-P1-199833/bureaublasters](https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters), clique sur **Fork**. Choisis ton compte comme **Owner**, **décoche « Copy the main branch only »**, puis clique sur **Create fork**. Ta copie contient ainsi les branches de reprise.

Tu travailles et publies dans ce fork, sur ton compte GitHub.

### Dans Codespaces

Depuis ton fork, ouvre **Code → Codespaces → Create codespace on main**. Attends la fin de la préparation et ouvre **Terminal → New Terminal**.

Lance l’interface :

```sh
python -m streamlit run app.py
```

Ouvre le lien proposé sur le port **8501**. Garde ce terminal pour l’application et ouvre un second terminal pour les vérifications.

Pour arrêter l’application, utilise **Ctrl+C**. En fin de travail, arrête ton Codespace depuis [la liste des Codespaces](https://github.com/codespaces).

### Sur ton poste

Clone ton fork et ouvre-le dans VS Code. Avec **Python: Create Environment → Venv**, crée un environnement et sélectionne-le avec **Python: Select Interpreter**. Dans un nouveau terminal associé à cet environnement :

```sh
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

## 1. Remets le catalogue d’aplomb

`catalogue_source.txt` fait référence. Chaque produit de la liste `CATALOGUE`, dans `catalogue.py`, suit la même structure :

| Clé | Type attendu | Signification |
| --- | --- | --- |
| `id` | `str` | Identifiant unique du produit. |
| `nom` | `str` | Nom affiché. |
| `categorie` | `str` | `lanceur`, `accessoire`, `munition` ou `recharge`. |
| `description` | `str` | Description commerciale. |
| `prix_euros` | `int` ou `float` | Prix du conditionnement vendu. |
| `conditionnement` | `str` | Par exemple : `1 blaster`, `lot de 4 mini-requins`, `1 bouteille de 100 ml`. |
| `consommables` | `list[str]` | Codes des munitions ou liquides utilisés ou fournis par ce produit, quelle que soit sa catégorie. |
| `portee_m` | `int` ou `None` | Portée ; `None` si elle ne s’applique pas. |
| `cadence_tirs_min` | `int` ou `None` | Cadence ; `None` si elle ne s’applique pas. |
| `poids_g` | `int` | Poids du conditionnement vendu. |
| `dimensions_cm` | `dict` | Clés `longueur`, `largeur` et `hauteur`, avec des valeurs numériques. |
| `indice_protection` | `str` ou `None` | Indice d’étanchéité, par exemple `IP68`. |
| `effets` | `list[str]` | Lumières, sons, senteurs ou mouvements. |
| `image` | `str` | Chemin du visuel. |
| `favori` | `bool` | Valeur initiale du favori. |

Un **identifiant produit**, comme `RE-07`, désigne une référence vendue. Un **code de consommable**, comme `brume-neutre`, regroupe les produits associés au même liquide ou à la même munition. Le nom commercial et la description servent à la lecture ; tes fonctions sélectionnent les produits à partir des codes, sans analyser ces textes.

Une munition peut elle-même utiliser une recharge : les Mini-requins fumigènes sont fournis sous le code `requin-mousse` et utilisent les liquides `brume-neutre` ou `brume-girofle-agrumes`. Leur liste contient donc trois codes. Leur catégorie reste `munition`.

### Complète les fiches manquantes

Ajoute **BB-02 Requin Arêtes**, **BB-04 Fumigène à ultrason** et **RE-08 Brume girofle-agrumes** à partir de leurs fiches. Conserve l’ordre des références : équipements BB-01 à BB-08, puis munitions et recharges RE-01 à RE-08.

Utilise `None` pour une caractéristique non applicable et une liste vide pour l’absence d’effets.

### Lance les vérifications des données

```sh
python tests_catalogue.py donnees
```

Chaque vérification affiche `OK`, `ÉCHEC`, `ERREUR` ou `À COMPLÉTER`. En cas d’échec, utilise le produit, le champ et la valeur indiqués dans le message pour comparer avec la fiche source. Corrige, puis relance le groupe. `À COMPLÉTER` désigne une fonction que tu dois encore écrire.

### Résous les problèmes signalés par la Happiness Team

**« À l’ouverture de l’interface, les Disques de livraison sont déjà dans nos favoris. Personne ne les a choisis. »**

<details>
<summary>Indice 1</summary>

Compare la valeur `favori` de ce produit avec celle des autres produits. Elle se ressemble, mais est-elle du même type ?

</details>

<details>
<summary>Indice 2</summary>

Dans un terminal Python, observe le résultat de `bool("False")`, puis celui de `bool(False)`.

</details>

**« Une fois le Requin Arêtes ajouté, impossible de lui trouver des munitions. Pourtant, elles sont dans le catalogue. »**

<details>
<summary>Indice 1</summary>

Le code de consommable relie un équipement à ses munitions. Python compare les chaînes de caractères exactement, caractère par caractère.

</details>

<details>
<summary>Indice 2</summary>

Affiche les codes du lanceur et du lot de mini-requins avec `print(repr(...))` et compare leurs séparateurs.

</details>

### Trouve les erreurs restantes

Le catalogue contient encore **au moins trois erreurs** que personne n’a signalées. Certaines font échouer un test ; une au moins passe tous les tests. Pour celle-là, compare ce qu’affichent l’interface ou `python apercu_terminal.py` avec les fiches source.

<details>
<summary>Indice 1</summary>

Une erreur porte sur un type, une sur une unité, une sur un ordre de grandeur. Le test `test_donnees_colis` s’appuie sur une règle écrite en tête de `catalogue_source.txt`.

</details>

<details>
<summary>Indice 2</summary>

Une valeur peut s’afficher exactement comme dans la fiche et rester du mauvais type. Parcours la colonne des prix de l’aperçu terminal : un lot de munitions coûte-t-il vraiment plus cher que le Requin Arêtes ?

</details>

<details>
<summary>Indice 3</summary>

Regarde `prix_euros` de BB-01 et de RE-06, ainsi que `dimensions_cm` de BB-07.

</details>

**Résultat attendu :** 16 produits dans l’ordre, des types et des unités conformes, des codes de consommables fidèles aux fiches pour toutes les catégories, des valeurs fidèles à la source. Tous les tests du groupe `donnees` passent. Un test de type ou de cohérence ne prouve pas que toutes les valeurs commerciales sont justes : conserve la comparaison avec les fiches.

## 2. Retrouve les consommables compatibles

Complète deux fonctions de `fonctions.py` :

| Fonction | Résultat attendu |
| --- | --- |
| `consommables_disponibles(catalogue)` | Un `set` des codes de consommables présents, sans doublons. |
| `filtrer_par_consommable(catalogue, code)` | Une nouvelle liste de tous les produits contenant ce code dans `consommables`, dans l’ordre du catalogue. |

Parcours les produits et leurs listes de codes. Conserve les données reçues inchangées et retourne une collection vide si rien ne correspond.

### Prédis une sélection, puis vérifie-la

Avant de coder, relève dans les fiches les identifiants que doit retourner chaque code, dans l’ordre du catalogue :

| Code | Situation à observer |
| --- | --- |
| `requin-mousse` | Un lanceur et ses munitions. |
| `flechette-mousse` | Deux lanceurs partagent les mêmes fléchettes. |
| `brume-girofle-agrumes` | Un accessoire et une munition utilisent le même liquide vendu en recharge. |

Le filtre porte sur **toutes les catégories** et examine seulement la présence du code demandé. Il ne suit pas les liens de proche en proche : le Requin Arêtes utilise les mini-requins, mais ne reçoit pas de liquide. Il ne doit donc pas apparaître dans la sélection `brume-girofle-agrumes`.

<details>
<summary>Vérifie tes prévisions après avoir cherché</summary>

- `requin-mousse` : `BB-02`, `RE-02`.
- `flechette-mousse` : `BB-01`, `BB-06`, `RE-01`.
- `brume-girofle-agrumes` : `BB-04`, `RE-02`, `RE-08`.
- `brume-neutre` : `BB-04`, `RE-02`, `RE-07`.

</details>

### Compatibilité et commande complète ne sont pas synonymes

Le filtre regroupe les produits associés à un code ; il ne dit pas lesquels acheter ensemble. Deux lanceurs partageant les mêmes fléchettes ne s’utilisent pas l’un dans l’autre. RE-07 et RE-08 sont deux liquides **alternatifs**, pas deux achats obligatoires. Les codes ne précisent pas si un produit fournit une munition ou consomme un liquide ; les descriptions expliquent ces rôles.

Le filtre ne remplit pas un panier et n’ajoute aucune recharge au budget. Dans le socle de l’atelier, tu retrouves les produits ; la préparation d’une commande complète est une extension.

```sh
python tests_catalogue.py filtres
```

**Points de contrôle :** les codes apparaissent une seule fois dans les choix de l’interface. Un code inconnu retourne une liste vide ; un catalogue vide donne un ensemble vide ou une liste vide selon la fonction.

La liste filtrée est nouvelle, mais elle contient les dictionnaires du catalogue. Sélectionner un produit ne fabrique pas une copie indépendante de celui-ci.

## 3. Donne un chiffre à la comptabilité

Complète `calculer_budget(produit, quantite)` :

- reçois un dictionnaire produit et une quantité entière positive ou nulle ;
- multiplie `prix_euros` par cette quantité ;
- retourne un nombre arrondi à deux décimales avec `round(montant, 2)` ;
- accepte zéro pour un budget nul.

La quantité désigne des **conditionnements** : deux lots de quatre mini-requins représentent huit mini-requins, facturés au prix de deux lots. Trois bouteilles de 100 ml représentent 300 ml de liquide, pas trois utilisations. La capacité des réservoirs et la consommation par utilisation ne sont pas chiffrées : ne déduis pas un nombre d’utilisations.

Ce calcul porte sur **une seule référence**. Le budget d’un lanceur n’inclut ni les munitions ni les liquides vendus séparément.

```sh
python tests_catalogue.py budget
```

**Points de contrôle :** deux Rafales de Post-it à 39,50 € coûtent 79 €. Deux lots de mini-requins à 59,90 € coûtent 119,80 €. Trois bouteilles de Brume girofle-agrumes à 6,90 € coûtent 20,70 €, sans décimales parasites. Une quantité nulle donne zéro.

Retourne le montant et laisse l’interface le présenter. Conserve le produit inchangé.

## 4. Prépare les favoris de la Happiness Team

Complète `definir_favori(produit, favori)` :

- reçois un dictionnaire produit et un booléen ;
- modifie la clé `favori` de ce dictionnaire ;
- conserve ses autres informations ;
- retourne `None` : le résultat recherché est la modification de l’objet reçu.

```sh
python tests_catalogue.py favoris
```

**Points de contrôle :** active puis désactive un favori dans l’interface et observe la liste des favoris. Explique la différence entre modifier `produit["favori"]` et réaffecter le nom local `produit` à un autre dictionnaire.

L’interface conserve les favoris pendant ta session. Une nouvelle session repart des valeurs du catalogue.

## Vérifie le catalogue terminé

```sh
python tests_catalogue.py
```

**Résultat attendu :** les vérifications des données et des quatre fonctions affichent `OK`. Dans l’interface, retrouve les références associées à un code, calcule un budget et active puis désactive un favori. Explique une de tes fonctions et vérifie-la avec une entrée différente.

## Bonus : mets tes fonctions à l’épreuve

Choisis un ou deux comportements à vérifier dans `tests_perso.py`. Un test est une fonction sans paramètre dont le nom commence par `test_`. L’instruction `assert condition, "message"` vérifie que la condition est vraie ; sinon, le lanceur affiche un échec et le message.

Par exemple, pour vérifier un budget nul :

```python
def test_budget_nul():
    produit = {"prix_euros": 39.5}
    montant = calculer_budget(produit, 0)
    assert montant == 0, f"Budget nul attendu, obtenu : {montant}"
```

Choisis ensuite un autre cas :

| Fonction | Idées de vérifications |
| --- | --- |
| `consommables_disponibles` | Doublons entre produits ; catalogue vide. |
| `filtrer_par_consommable` | Plusieurs produits compatibles ; aucun résultat ; données inchangées. |
| `calculer_budget` | Prix de deux lots ; arrondi. |
| `definir_favori` | Passage à `True`, puis à `False` ; autres champs inchangés. |

Pour vérifier des données inchangées ou une mutation, compare avec une valeur attendue indépendante, plutôt qu’avec un deuxième nom vers le même dictionnaire.

```sh
python tests_catalogue.py perso
```

**Point de contrôle :** provoque temporairement une erreur dans la fonction testée, constate que ton test la détecte, puis rétablis le comportement attendu.

## Reprends à une autre étape si tu bloques

Choisis un point de reprise avec le formateur. Chaque branche fournit les étapes précédentes terminées. Toutes les branches utilisent les mêmes fiches de référence et les mêmes consignes ; seules les erreurs à corriger, les fonctions à compléter et les tests personnels fournis diffèrent.

| Branche | Contenu fourni | Étape à pratiquer |
| --- | --- | --- |
| `main` | Catalogue à corriger, interface, signatures et tests fournis. | 1 : données. |
| `etape/02-filtres` | Catalogue corrigé et complet. | 2 : sets et filtres. |
| `etape/03-budget` | Catalogue et fonctions de sélection. | 3 : budget. |
| `etape/04-favoris` | Étapes précédentes et budget. | 4 : mutation. |
| `etape/05-tests` | Catalogue et quatre fonctions complètes. | Bonus : tests personnels. |

Enregistre tes fichiers, publie ton travail en cours (voir [Publie ton travail](#publie-ton-travail)) et arrête Streamlit avec **Ctrl+C**. Pour reprendre à l’étape 2, exécute les commandes une par une :

```sh
git remote set-branches origin '*'
git fetch origin
git stash push --include-untracked -m "Sauvegarde avant reprise"
git switch etape/02-filtres
git branch --show-current
```

Les deux premières commandes rendent les reprises disponibles, même si une seule branche a été téléchargée. `git stash` met de côté tes modifications non publiées ; si Git indique qu’il n’y a rien à sauvegarder, poursuis. La dernière commande doit afficher `etape/02-filtres`.

<details>
<summary>Git indique que la branche de reprise n’existe pas</summary>

Ton fork contient seulement `main`. Récupère les branches depuis le dépôt d’origine :

```sh
git remote add upstream https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters.git
git fetch upstream
git switch -c etape/02-filtres upstream/etape/02-filtres
```

</details>

Pour une autre reprise, remplace le nom de la branche. Si une commande échoue, conserve son message et demande de l’aide avant de poursuivre.

Pour retrouver tes sauvegardes et consulter le fichier de fonctions de la plus récente :

```sh
git stash list
git show 'stash@{0}:fonctions.py'
```

## Publie ton travail

À chaque étape terminée, publie ton travail dans ton fork : dans **Source Control** de VS Code, sélectionne tes fichiers modifiés, écris un message décrivant ce que tu as fait, puis utilise **Commit** et **Sync Changes**. Ouvre ensuite ton fork sur GitHub et vérifie que tes derniers fichiers y figurent.

Enregistrer un fichier dans Codespaces ne le publie pas.

## Remets ton travail

Le formateur crée pour toi une branche de rendu `rendu/<ton-pseudo-github>` dans le dépôt d’origine. Tu y proposes ton travail par une **pull request** depuis ton fork :

1. Sur ton fork, ouvre **Pull requests → New pull request**.
2. Choisis comme **base repository** `SIMPLON-DIST-DEVIA-P1-199833/bureaublasters` et comme **base** ta branche `rendu/<ton-pseudo-github>`.
3. Choisis comme **head repository** ton fork et comme **compare** la branche sur laquelle tu as terminé.
4. Clique sur **Create pull request**, puis complète la description proposée : branche de départ, parties réalisées personnellement, vérifications effectuées, bonus réalisés et blocage résolu ou restant. Glisse dans la description une capture de l’interface montrant une sélection compatible et un budget.
5. Transmets le lien de la pull request au formateur par Discord en MP.

Tu peux encore publier des commits dans ton fork après l’ouverture : ils s’ajoutent automatiquement à la pull request jusqu’à sa clôture.

Prépare une démonstration courte : un comportement réussi et une modification expliquée. Si tu as utilisé une branche de reprise, distingue le code fourni de ton travail personnel. Si tu as écrit un test en bonus, montre le comportement qu’il vérifie.

## Vérifie les critères de réussite

- Tes données respectent la source, les types, les unités et le conditionnement vendu.
- Tes fonctions utilisent leurs paramètres, sans dépendre d’un catalogue global ni coder les réponses en dur.
- Ton set élimine les doublons et ton filtre conserve l’ordre des produits, dans toutes les catégories et sans ajouter de correspondance indirecte.
- Tu distingues une référence produit, un code de consommable, une alternative de recharge et une commande complète.
- Ton budget est correct pour une quantité positive ou nulle, avec un montant arrondi à deux décimales.
- Ta fonction de favoris modifie l’objet reçu ; tes autres fonctions conservent leurs entrées inchangées.
- Tu vérifies les résultats avec les fiches source, l’interface et les vérifications fournies.
- Tes noms rendent le code lisible et tes commentaires éclairent les choix qui en ont besoin.
- Tu peux expliquer une fonction et adapter son comportement.

## Choisis une extension

Après vérification du socle, choisis une extension :

1. **Bureaux minuscules :** filtre par poids et longueur maximaux. Vérifie le cas exactement à la limite.
2. **Comptabilité exigeante :** trie une sélection par prix sans modifier le catalogue initial.
3. **Commande collective :** calcule un panier de plusieurs références et quantités en réutilisant le calcul existant. Puis propose les munitions ou liquides adaptés à un produit et laisse la personne choisir lesquels ajouter : ne commande pas automatiquement les deux liquides alternatifs. Teste un panier vide et un panier associant un équipement, un lot de munitions et un liquide. Ne calcule pas les quantités de liquide nécessaires sans capacité de réservoir ni consommation documentées.
4. **Quantité invalide, bonus exceptions :** fais évoluer `calculer_budget` pour lever `ValueError` avec un message indiquant la quantité reçue si elle est négative. Une exception signale que l’appel ne peut pas produire le résultat demandé ; `raise ValueError("message")` permet de la déclencher. Vérifie ce bonus avec `python tests_catalogue.py exceptions`. Les quantités positives ou nulles gardent le même comportement.
5. **Service qualité :** ajoute des tests qui détectent plusieurs erreurs plausibles et démontre leur utilité. Distingue validation des types, cohérence des codes et fidélité aux fiches. Garde un exemple de valeur incorrecte qui passe un test de type, puis ajoute une vérification adaptée.
6. **Références lisibles :** affiche les noms et identifiants des produits associés à un code en les retrouvant dans le catalogue, sans recopier ces noms dans une table de correspondance. Distingue cet affichage d’une recommandation d’achat.

## Consulte les ressources utiles

- [Python : listes, dictionnaires et ensembles](https://docs.python.org/fr/3/tutorial/datastructures.html).
- [Python : fonctions](https://docs.python.org/fr/3/tutorial/controlflow.html#defining-functions).
- [Python : erreurs et exceptions](https://docs.python.org/fr/3/tutorial/errors.html).
- [Python : instruction `assert`](https://docs.python.org/fr/3/reference/simple_stmts.html#the-assert-statement).
- [Python : affectation et copie](https://docs.python.org/fr/3/library/copy.html).
- [GitHub : créer une pull request depuis un fork](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).
- [Git : sauvegardes avec `stash`](https://git-scm.com/docs/git-stash).
- [Streamlit : lancement](https://docs.streamlit.io/develop/concepts/architecture/run-your-app).
