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
- **Requin Arêtes** : le modèle phare. Un lance-requins de 1,18 m à porter à deux mains, gueule dentée, yeux lumineux et graffitis roses et bleus. Il propulse à l’air comprimé des mini-requins en mousse qui zigzaguent en laissant une traînée de fumée colorée, dans un éclat de rire enregistré.
- **Gantelets du Sprint** : paire de gantelets lance-disques, LED violettes et jingle de montée de niveau.
- **Brume de Bonne Humeur** : grenade lumineuse étanche, indice **IP68**, qui diffuse pendant 20 secondes une brume d’eau éclairée en rose. Cartouches de 100 ml neutres ou parfumées girofle-orange.
- **Coin-Coin de Crise** : canon à canards en mousse, chaque canard émet un coin-coin au départ.
- **Arbalète Anti-Réunionite** : arbalète à fléchettes en mousse, armement à levier et « ding » à chaque tir.
- **Catapulte à Croissants** : catapulte de bureau à bras réglable, clochette de boulangerie, croissants en mousse parfumés. Non comestible.
- **Orbe de Décompression** : lanceur sphérique de balles en mousse, tenu à une main, halo vert pendant le chargement.

BureauBlasters vend aussi les **munitions de remplacement** et les **cartouches de brume**. La direction souhaite éviter de commander six canons sans canards, ou deux litres de brume sans grenade.

## Ta mission

**Fiabilise les données et complète les fonctions Python du catalogue.**

La Happiness Team doit pouvoir consulter les produits, retrouver les équipements et recharges compatibles, estimer une commande et conserver ses favoris pendant sa session.

Tu travailles sur les données et les fonctions. L’interface Streamlit prend en charge l’affichage, les messages d’erreur et l’état de la session. Tu peux vérifier tes fonctions indépendamment grâce à l’aperçu terminal et aux tests.

**Couverture :** listes et dictionnaires, sets, fonctions avec paramètres et retours, mutation, exceptions, tests avec `assert`.

**Prérequis :** tu sais lancer un script, utiliser des variables, des conditions et des boucles ; tu as pratiqué les dictionnaires et les premières fonctions.

**Durée indicative :** environ 6 heures, selon ton rythme et les extensions choisies.

**Modalité :** travail individuel ; échange avec les autres pour comprendre un blocage.

## Tes fichiers de travail

```text
catalogue_source.txt         Les 16 fiches produits de référence
catalogue.py                 Les données Python à corriger et compléter
fonctions.py                 Les quatre fonctions à compléter
tests_catalogue.py           Les vérifications fournies et leur lancement
tests_perso.py               Tes propres tests
app.py                       L’interface Streamlit
apercu_terminal.py           L’aperçu utilisable sans Streamlit
images/                      Les visuels des produits
requirements.txt             Les dépendances du projet
```

Le catalogue comprend **8 équipements et 8 références de munitions ou recharges**. Tu modifies `catalogue.py`, `fonctions.py` et `tests_perso.py`. Lis les autres fichiers autant que tu veux : ils montrent comment tes fonctions sont utilisées.

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
| `conditionnement` | `str` | Par exemple : `1 blaster`, `lot de 4 mini-requins`, `1 cartouche de 100 ml`. |
| `consommables` | `list[str]` | Codes des consommables utilisés par un équipement ou fournis par un lot ou une recharge. |
| `portee_m` | `int` ou `None` | Portée ; `None` si elle ne s’applique pas. |
| `cadence_tirs_min` | `int` ou `None` | Cadence ; `None` si elle ne s’applique pas. |
| `poids_g` | `int` | Poids du conditionnement vendu. |
| `dimensions_cm` | `dict` | Clés `longueur`, `largeur` et `hauteur`, avec des valeurs numériques. |
| `indice_protection` | `str` ou `None` | Indice d’étanchéité, par exemple `IP68`. |
| `effets` | `list[str]` | Lumières, sons, senteurs ou mouvements. |
| `image` | `str` | Chemin du visuel. |
| `favori` | `bool` | Valeur initiale du favori. |

### Complète les fiches manquantes

Ajoute **BB-02 Requin Arêtes**, **BB-04 Brume de Bonne Humeur** et **RE-08 Brume girofle-agrumes** à partir de leurs fiches. Conserve l’ordre des références : équipements BB-01 à BB-08, puis munitions et recharges RE-01 à RE-08.

Utilise `None` pour une caractéristique non applicable et une liste vide pour l’absence d’effets.

### Lance les vérifications des données

```sh
python tests_catalogue.py donnees
```

Chaque test vérifie une règle. En cas d’échec, le message indique le produit concerné et la ligne de l’assertion : ouvre `tests_catalogue.py` à cette ligne, lis la règle vérifiée, compare la valeur obtenue avec la fiche source, corrige, puis relance le groupe.

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

**Résultat attendu :** 16 produits dans l’ordre, des types et des unités conformes, des codes de consommables cohérents entre équipements et recharges, des valeurs fidèles aux fiches. Tous les tests du groupe `donnees` passent.

## 2. Retrouve les consommables compatibles

Complète deux fonctions de `fonctions.py` :

| Fonction | Résultat attendu |
| --- | --- |
| `consommables_disponibles(catalogue)` | Un `set` des codes de consommables présents, sans doublons. |
| `filtrer_par_consommable(catalogue, code)` | Une nouvelle liste de tous les produits contenant ce code dans `consommables`, dans l’ordre du catalogue. |

Parcours les produits et leurs listes de codes. Conserve les données reçues inchangées et retourne une collection vide si rien ne correspond.

Le filtre porte sur **toutes les catégories** : avec `requin-mousse`, tu retrouves le lanceur et ses mini-requins. Avec `brume-girofle-agrumes`, tu retrouves la grenade et la cartouche parfumée.

```sh
python tests_catalogue.py filtres
```

**Points de contrôle :** les codes apparaissent une seule fois dans les choix de l’interface. Un code inconnu retourne une liste vide ; un catalogue vide donne un ensemble vide ou une liste vide selon la fonction.

La liste filtrée est nouvelle, mais elle contient les dictionnaires du catalogue. Sélectionner un produit ne fabrique pas une copie indépendante de celui-ci.

## 3. Donne un chiffre à la comptabilité

Complète `calculer_budget(produit, quantite)` :

- reçois un dictionnaire produit et une quantité entière ;
- multiplie `prix_euros` par cette quantité ;
- retourne un nombre arrondi à deux décimales ;
- accepte zéro pour un budget nul ;
- lève `ValueError` avec un message explicite si la quantité est négative.

La quantité désigne des **conditionnements** : deux lots de quatre mini-requins représentent huit mini-requins, facturés au prix de deux lots.

```sh
python tests_catalogue.py budget
```

**Points de contrôle :** deux Rafales de Post-it à 39,50 € coûtent 79 €. Deux lots de mini-requins à 59,90 € coûtent 119,80 €. Trois cartouches girofle-agrumes à 6,90 € coûtent 20,70 €, sans décimales parasites. Une quantité nulle donne zéro ; `-1` provoque `ValueError`.

Retourne le montant et laisse l’interface le présenter. Conserve le produit inchangé. L’interface intercepte l’exception pour afficher son message : saisis une quantité négative pour le vérifier.

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

L’interface conserve les favoris pendant ta session. Une nouvelle session repart des valeurs du catalogue ; la sauvegarde durable est une extension.

## 5. Mets tes fonctions à l’épreuve

Écris tes propres tests dans `tests_perso.py`. Chaque test est une fonction sans paramètre dont le nom commence par `test_`, la convention reprise par l’outil de test `pytest`. Inspire-toi des tests fournis dans `tests_catalogue.py` : un petit jeu de données indépendant, un appel, des `assert` avec un message utile. Écris au moins **un test personnel par fonction**.

| Fonction | Cas à couvrir dans l’ensemble des tests |
| --- | --- |
| `consommables_disponibles` | Doublons entre produits ; catalogue vide. |
| `filtrer_par_consommable` | Plusieurs catégories compatibles ; aucun résultat ; données inchangées. |
| `calculer_budget` | Prix d’un lot ; quantité nulle ; quantité négative. |
| `definir_favori` | Passage à `True`, puis à `False` ; autres champs inchangés. |

Pour vérifier des données inchangées ou une mutation, compare avec une valeur attendue indépendante, plutôt qu’avec un deuxième nom vers le même dictionnaire.

```sh
python tests_catalogue.py perso
python tests_catalogue.py
```

**Point de contrôle :** provoque temporairement une erreur dans une fonction, constate qu’un de tes tests la détecte, puis rétablis le comportement attendu.

## Reprends à une autre étape si tu bloques

Choisis un point de reprise avec le formateur. Chaque branche fournit les étapes précédentes terminées.

| Branche | Contenu fourni | Étape à pratiquer |
| --- | --- | --- |
| `main` | Catalogue à corriger, interface, signatures et tests fournis. | 1 : données. |
| `reprise/02-filtres` | Catalogue corrigé et complet. | 2 : sets et filtres. |
| `reprise/03-budget` | Catalogue et fonctions de sélection. | 3 : budget et exception. |
| `reprise/04-favoris` | Étapes précédentes et budget. | 4 : mutation. |
| `reprise/05-tests` | Catalogue et quatre fonctions complètes. | 5 : tests personnels. |

Enregistre tes fichiers, publie ton travail en cours (voir [Publie ton travail](#publie-ton-travail)) et arrête Streamlit avec **Ctrl+C**. Pour reprendre à l’étape 2, exécute les commandes une par une :

```sh
git remote set-branches origin '*'
git fetch origin
git stash push --include-untracked -m "Sauvegarde avant reprise"
git switch reprise/02-filtres
git branch --show-current
```

Les deux premières commandes rendent les reprises disponibles, même si une seule branche a été téléchargée. `git stash` met de côté tes modifications non publiées ; si Git indique qu’il n’y a rien à sauvegarder, poursuis. La dernière commande doit afficher `reprise/02-filtres`.

<details>
<summary>Git indique que la branche de reprise n’existe pas</summary>

Ton fork contient seulement `main`. Récupère les branches depuis le dépôt d’origine :

```sh
git remote add upstream https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters.git
git fetch upstream
git switch -c reprise/02-filtres upstream/reprise/02-filtres
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
4. Clique sur **Create pull request**, puis complète la description proposée : branche de départ, parties réalisées personnellement, tests ajoutés, blocage résolu ou restant. Glisse dans la description une capture de l’interface montrant une sélection compatible et un budget.
5. Transmets le lien de la pull request au formateur par Discord en MP.

Tu peux encore publier des commits dans ton fork après l’ouverture : ils s’ajoutent automatiquement à la pull request jusqu’à sa clôture.

Prépare une démonstration courte : un comportement réussi, un test pertinent et une modification expliquée. Si tu as utilisé une branche de reprise, distingue le code fourni de ton travail personnel.

## Vérifie les critères de réussite

- Tes données respectent la source, les types, les unités et le conditionnement vendu.
- Tes fonctions utilisent leurs paramètres, sans dépendre d’un catalogue global ni coder les réponses en dur.
- Ton set élimine les doublons et ton filtre conserve l’ordre des produits.
- Ton budget est correct ; une quantité négative provoque l’exception attendue.
- Ta fonction de favoris modifie l’objet reçu ; tes autres fonctions conservent leurs entrées inchangées.
- Tes tests contrôlent des valeurs, des limites et l’exception.
- Tes noms rendent le code lisible et tes commentaires éclairent les choix qui en ont besoin.
- Tu peux expliquer une fonction et adapter son comportement.

## Choisis une extension

Après vérification du socle, choisis une extension :

1. **Bureaux minuscules :** filtre par poids et longueur maximaux. Vérifie le cas exactement à la limite.
2. **Comptabilité exigeante :** trie une sélection par prix sans modifier le catalogue initial.
3. **Commande collective :** calcule un panier de plusieurs références et quantités en réutilisant le calcul existant.
4. **Favoris durables :** découvre le format JSON, puis ajoute chargement et sauvegarde. Réutilise les fonctions de sélection et traite un fichier absent ou un JSON invalide.
5. **Service qualité :** ajoute des tests qui détectent plusieurs erreurs plausibles et démontre leur utilité.

## Consulte les ressources utiles

- [Python : listes, dictionnaires et ensembles](https://docs.python.org/fr/3/tutorial/datastructures.html).
- [Python : fonctions](https://docs.python.org/fr/3/tutorial/controlflow.html#defining-functions).
- [Python : erreurs et exceptions](https://docs.python.org/fr/3/tutorial/errors.html).
- [Python : instruction `assert`](https://docs.python.org/fr/3/reference/simple_stmts.html#the-assert-statement).
- [Python : affectation et copie](https://docs.python.org/fr/3/library/copy.html).
- [GitHub : créer une pull request depuis un fork](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).
- [Git : sauvegardes avec `stash`](https://git-scm.com/docs/git-stash).
- [Streamlit : lancement](https://docs.streamlit.io/develop/concepts/architecture/run-your-app).
