# BureauBlasters : la productivité passe en mode mousse

## La situation

Tu viens de rejoindre **Ludiverse**, une petite ESN qui fait un carton dans la gamification en entreprise. Sa spécialité : transformer les moments pénibles du travail en défis qu’on aurait presque envie de relever.

Pour assurer une productivité et une ambiance absolument optimales, la **Happiness Team RH** et la direction ont décidé de franchir un cap : équiper tout·es les employé·es d’un arsenal ludique à projectiles en mousse.

L’objectif officiel : proposer des pauses de jeu entre volontaires pour détendre l’atmosphère. L’objectif officieux : donner un sens très littéral à « sortir l’artillerie lourde », sans dépasser le budget fournitures.

**BureauBlasters**, une jeune entreprise spécialisée dans les équipements de bureau franchement déraisonnables, a décroché le contrat. Ludiverse a obtenu un tarif exceptionnel : c’est son premier client.

Un super deal. Avec un petit astérisque.

Un de tes collègues a déjà migré une bonne partie du catalogue BureauBlasters en Python : **13 références sur 16** sont dans `catalogue.py`. Il n’a pas terminé et quelques erreurs se sont glissées dans la saisie. Il t’a laissé un **extrait du catalogue papier** avec uniquement les trois fiches qui restent à intégrer, dans `catalogue_source.txt`.

L’interface sait afficher des cartes et des boutons ; les fonctions derrière restent à écrire. Le bouton « Préparer le devis » attend encore de savoir retrouver les références et calculer les montants.

La direction de Ludiverse apprécie l’audace. La comptabilité, un peu moins.

Tu récupères le prototype avant la première commande. À toi de rendre le catalogue utilisable.

### La gamme BureauBlasters

- **Sulfateuse à Relances** : sulfateuse compacte à fléchettes en mousse, barillet rotatif à six canons, chargeur de 12 fléchettes, LED orange et crépitement de notifications de relance à chaque tir.
- **Requin Arêtes** : le modèle phare. Un lance-requins de 1,18 m à porter à deux mains, gueule dentée, yeux lumineux et graffitis roses et bleus. Il propulse à l’air comprimé les **Mini-requins fumigènes (RE-02)**, qui zigzaguent en diffusant une brume ultrasonique par plusieurs trous, éclairée en rose et bleu par des LED voisines, dans un éclat de rire enregistré. Les liquides **RE-07 ou RE-08** remplissent les mini-requins, jamais le lanceur ; la senteur dépend du liquide choisi.
- **Gantelets du Sprint** : paire de gantelets lance-disques, LED violettes et jingle de montée de niveau.
- **Fumigène à ultrason** : grenade-jouet de poche de **4 × 4 × 6 cm**, à enveloppe en **silicone mat amortissant** ; trois exemplaires tiennent dans une main. Étanche, indice **IP68**, elle diffuse pendant 20 secondes une brume d’eau produite par ultrasons à travers plusieurs trous, avec des LED roses à proximité de chaque sortie. Son petit réservoir intégré se recharge par un **clapet à charnière souple**, appareil éteint, en y versant un liquide à base d’eau : **Brume neutre (RE-07)** sans parfum ou **Brume girofle-agrumes (RE-08)** parfumé. Ces liquides sont vendus séparément en petites bouteilles de **100 ml**, pour plusieurs remplissages.
- **Coin-Coin de Crise** : canon à canards en mousse, chaque canard émet un coin-coin au départ.
- **Arbalète Anti-Réunionite** : arbalète à fléchettes en mousse, armement à levier et « ding » à chaque tir.
- **Catapulte à Croissants** : catapulte de bureau à bras réglable, clochette de boulangerie, croissants en mousse parfumés. Non comestible.
- **Orbe de Décompression** : lanceur sphérique de balles en mousse, tenu à une main, halo vert pendant le chargement.

BureauBlasters vend aussi les **munitions de remplacement** et les **bouteilles de recharge liquide pour la brume**. Munitions et liquides se commandent séparément des équipements ; les réservoirs sont livrés vides. Seul le conditionnement décrit ce qui est inclus, pas les objets visibles sur les photos de démonstration. La direction souhaite éviter de commander six canons sans canards, ou deux litres de liquide sans appareil à remplir.

## Ta mission

**Transforme le prototype en un outil de recherche, de commande et de devis.**

La Happiness Team t’envoie une demande peu soignée. Retrouve ses références, prépare une sélection adaptée aux petits bureaux et produis un devis sans modifier les fiches du catalogue. Conserve aussi les favoris pendant la session.

À chaque étape, écris les fonctions demandées, complète les tests indiqués dans `tests_perso.py` et vérifie le résultat dans l’interface ou avec l’aperçu terminal. Tu peux traiter de petites données d’essai avant de travailler sur les 16 références. Après chaque consigne complétée, [fais un commit et publie-le](#publie-ton-travail).

**Couverture :** nettoyage et découpage des chaînes, conversions, f-strings, conditions combinées, boucles et cumuls, listes et dictionnaires imbriqués, sets et différence, fonctions avec paramètres, retours et valeur par défaut, portée, copie superficielle et mutation.

**Prérequis :** tu sais lancer un script et utiliser des variables, des conditions et des boucles ; tu as pratiqué les collections, les fonctions et la mutation d’un dictionnaire.

**Durée indicative :** environ 4 heures pour le socle, puis 30 à 45 minutes pour l’extension audio.

**Modalité :** travail individuel ; échange avec les autres pour comprendre un blocage.

## Tes fichiers de travail

```text
catalogue_source.txt         L’extrait des 3 fiches non migrées
catalogue.py                 Les données Python à corriger et compléter
fonctions.py                 Les fonctions à écrire
demandes.py                  La demande de la Happiness Team
tests_catalogue.py           Les vérifications fournies et leur lancement
tests_perso.py               Les 10 tests obligatoires à compléter
app.py                       L’interface Streamlit et les repères du bonus audio
apercu_terminal.py           L’aperçu utilisable sans Streamlit
sons.py                      Les associations du bonus audio
images/                      Les visuels des produits
requirements.txt             Les dépendances du projet
```

Le catalogue comprend **8 équipements et 8 références de munitions ou recharges**. Tu modifies `catalogue.py`, `fonctions.py` et `tests_perso.py`. Pour l’extension audio, tu modifies aussi `sons.py` et `app.py` et tu ajoutes les fichiers reçus dans un dossier `sons/`.

Les commentaires `Étape` et `À compléter` repèrent le travail correspondant à ta branche. Dans chaque fonction ou test à écrire, remplace `raise NotImplementedError(...)` par ton code en conservant le nom et les paramètres. Lis les autres fichiers pour retrouver les appels de tes fonctions.

## Ouvre ton environnement

### Crée ta copie du projet

Sur la page du dépôt [SIMPLON-DIST-DEVIA-P1-199833/bureaublasters](https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters), clique sur **Fork**. Choisis ton compte comme **Owner**, **décoche « Copy the main branch only »**, puis clique sur **Create fork**. Ta copie contient ainsi les branches de reprise.

Tu développes et publies tes commits dans ce fork, sur ton compte GitHub. **Le rendu final doit impérativement se faire par une pull request vers le dépôt `SIMPLON-DIST-DEVIA-P1-199833/bureaublasters`, dans la branche existante `rendu/<mon-prenom>`.** Publier dans ton fork ne suffit pas à rendre le travail. Remplace `<mon-prenom>` par ton prénom tel qu’il apparaît dans le nom de la branche de rendu. **Sollicite l’aide du formateur si tu as besoin d’aide pour effectuer cette pull request.**

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

Pars du travail de ton collègue dans `catalogue.py` : ne ressaisis pas les produits déjà présents. Utilise `catalogue_source.txt` uniquement pour ajouter les trois fiches non migrées et vérifier leurs liens avec les autres produits. Les règles ci-dessous et les signalements de la Happiness Team servent à relire les données existantes.

Chaque produit de la liste `CATALOGUE` suit la même structure :

| Clé | Type attendu | Signification |
| --- | --- | --- |
| `id` | `str` | Identifiant unique du produit. |
| `nom` | `str` | Nom affiché. |
| `categorie` | `str` | `lanceur`, `accessoire`, `munition` ou `recharge`. |
| `description` | `str` | Description commerciale. |
| `prix_euros` | `int` ou `float` | Prix du conditionnement vendu. |
| `conditionnement` | `str` | Par exemple : `1 blaster`, `lot de 4 mini-requins`, `1 bouteille de 100 ml`. |
| `consommables_utilises` | `list[str]` | Codes des munitions ou liquides que ce produit utilise ; `[]` s’il n’en utilise aucun. |
| `consommables_fournis` | `list[str]` | Codes des munitions ou liquides que cette référence fournit à d’autres produits ; `[]` si elle n’en fournit aucun. |
| `portee_m` | `int` ou `None` | Portée ; `None` si elle ne s’applique pas. |
| `cadence_tirs_min` | `int` ou `None` | Cadence ; `None` si elle ne s’applique pas. |
| `poids_g` | `int` | Poids du conditionnement vendu. |
| `dimensions_cm` | `dict` | Clés `longueur`, `largeur` et `hauteur`, avec des valeurs numériques. |
| `indice_protection` | `str` ou `None` | Indice d’étanchéité, par exemple `IP68`. |
| `effets` | `list[str]` | Lumières, sons, senteurs ou mouvements. |
| `image` | `str` | Chemin du visuel. |
| `favori` | `bool` | Valeur initiale du favori. |

Un **identifiant produit**, comme `RE-07`, désigne une référence vendue. Un **code de consommable**, comme `brume-neutre`, regroupe les produits associés au même liquide ou à la même munition. La recherche textuelle examine les noms et les descriptions ; les fonctions de compatibilité utilisent les codes, sans analyser les textes commerciaux.

Une munition peut elle-même utiliser une recharge. Les deux listes distinguent ce qu’un produit utilise de ce qu’il fournit :

| Produit | `consommables_utilises` | `consommables_fournis` |
| --- | --- | --- |
| Requin Arêtes (BB-02) | `["requin-mousse"]` | `[]` |
| Mini-requins fumigènes (RE-02) | `["brume-neutre", "brume-girofle-agrumes"]` | `["requin-mousse"]` |
| Brume neutre (RE-07) | `[]` | `["brume-neutre"]` |

Les mini-requins utilisent l’un des deux liquides, pas d’autres mini-requins. Leur catégorie reste `munition`. Un code dans `consommables_fournis` décrit la munition ou le liquide vendu sous cette référence, pas un cadeau inclus avec un équipement.

### Complète les fiches manquantes

Ajoute **BB-02 Requin Arêtes**, **BB-04 Fumigène à ultrason** et **RE-08 Brume girofle-agrumes** à partir de leurs fiches. Conserve l’ordre des références : équipements BB-01 à BB-08, puis munitions et recharges RE-01 à RE-08.

Utilise `None` pour une caractéristique non applicable et une liste vide pour l’absence d’effets ou de consommables utilisés ou fournis.

### Lance les vérifications des données

```sh
python tests_catalogue.py donnees
```

Chaque vérification affiche `OK`, `ÉCHEC`, `ERREUR` ou `À COMPLÉTER`. En cas d’échec, utilise le produit, le champ et la valeur indiqués dans le message : compare avec la structure attendue, les signalements ci-dessous ou l’extrait si la fiche en fait partie. Corrige, puis relance le groupe. `À COMPLÉTER` désigne une fonction que tu dois encore écrire.

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

Affiche `consommables_utilises` du lanceur et `consommables_fournis` du lot de mini-requins avec `print(repr(...))` et compare leurs séparateurs.

</details>

### Trouve les erreurs restantes

Le catalogue contient encore **trois erreurs** à repérer dans les données déjà migrées. **Deux sont détectées par les tests ; une seule ne l’est pas.** Observe ce qu’affichent l’interface ou `python apercu_terminal.py`, les types attendus et cette note laissée par tes collègues :

> **Note de relecture :** une longueur a été copiée en millimètres alors que `dimensions_cm` attend des centimètres. La comptabilité confirme aussi que le lot de 10 Balles de décompression coûte **8,90 €**.

<details>
<summary>Indice 1</summary>

Une erreur porte sur un type, une sur une unité, une sur un ordre de grandeur. Le test `test_donnees_colis` s’appuie sur une règle écrite en tête de `catalogue_source.txt`.

</details>

<details>
<summary>Indice 2</summary>

Une valeur peut s’afficher comme un prix et rester du mauvais type. Parcours la colonne des prix de l’aperçu terminal : un lot de munitions coûte-t-il vraiment plus cher que le Requin Arêtes ?

</details>

<details>
<summary>Indice 3</summary>

Regarde `prix_euros` de BB-01 et de RE-06, ainsi que `dimensions_cm` de BB-07.

</details>

**Résultat attendu :** 16 produits dans l’ordre, des types et des unités conformes, des codes cohérents entre produits, trois fiches ajoutées fidèles à l’extrait et des erreurs de saisie corrigées selon les signalements. Tous les tests du groupe `donnees` passent. Un test de type ou de cohérence ne prouve pas qu’un prix est juste : vérifie aussi la note de la comptabilité.

## 2. Recherche des produits et sélectionne les équipements

### Retrouve un mot dans les fiches

Écris `rechercher_produits(catalogue, recherche)` :

1. Nettoie les espaces aux extrémités de `recherche` et passe-la en minuscules.
2. Parcours les produits et cherche ce texte dans leur nom **ou** leur description, sans tenir compte de la casse.
3. Retourne une nouvelle liste des fiches complètes, dans l’ordre du catalogue, en conservant les dictionnaires d’origine.

Une recherche vide ou composée d’espaces retrouve toutes les fiches. Un mot absent ou une source vide donne `[]`. La comparaison conserve les accents.

**À vérifier :** `"  REQUIN  "` retrouve BB-02, RE-02, RE-07 et RE-08 ; `"charnière"` retrouve BB-04 grâce à sa description. Les fiches reçues restent inchangées.

<details><summary>Indice</summary>

Conserve le résultat de `strip().lower()` dans un nom. Pour chaque fiche, compare la recherche au nom en minuscules ou à la description en minuscules. Initialise la liste avant la boucle et retourne-la après.

</details>

### Réponds à la demande des petits bureaux

Écris `selectionner_equipements(catalogue, prix_max, poids_max_g, longueur_max_cm)`.

Retourne les fiches de catégorie `lanceur` ou `accessoire` qui respectent **les trois maxima inclusifs** : prix, poids et longueur. Une munition reste exclue même si ses mesures conviennent. Conserve l’ordre et les fiches reçues.

**À vérifier :** pour 60 €, 800 g et 50 cm, les références attendues sont BB-01, BB-04, BB-06 et BB-08. Vérifie aussi une source vide et des maxima à zéro.

Dans l’interface, coche **Activer les limites de prix, poids et longueur** pour activer les trois maxima. Ils sont grisés tant que la case est décochée. La recherche, les maxima actifs et le code de consommable se combinent automatiquement ; le nombre de produits affichés et les filtres appliqués indiquent le résultat. **Réinitialiser les filtres** rétablit le catalogue complet et conserve tes favoris.

<details><summary>Indice</summary>

Lis la longueur avec `produit["dimensions_cm"]["longueur"]`. Combine la catégorie et les trois comparaisons avec `and`. « Au maximum » inclut la limite : utilise `<=`.

</details>

### Écris tes deux premiers tests

Un test est une fonction sans paramètre dont le nom commence par `test_`. `assert condition, "message"` vérifie que la condition est vraie ; sinon, le lanceur affiche un échec.

Par exemple, voici un test sur une recherche sans résultat :

```python
def test_recherche_absente():
    produits = [{"nom": "Lanceur", "description": "Pour une bille."}]
    resultat = rechercher_produits(produits, "croissant")
    assert resultat == [], f"Liste vide attendue, obtenu : {resultat}"
```

Dans `tests_perso.py`, utilise les fiches fournies par `catalogue_essai()` et complète :

- `test_recherche_normalisee` : vérifie que `"  LANCEUR  "` retrouve L1 et M1, puis que `"lanceur"` donne le même résultat. Le début du test est fourni.
- `test_selection_seuil_inclus` : avec 20 €, 800 g et 50 cm, vérifie que seule L1 reste sélectionnée. Recommence avec 799 g : attends une liste vide.

```sh
python tests_catalogue.py recherche
python tests_catalogue.py perso
```

Les tests des étapes suivantes affichent encore `À COMPLÉTER`. Concentre-toi sur ceux de l’étape réalisée.

## 3. Retrouve les consommables compatibles

Complète trois fonctions de `fonctions.py` :

| Fonction | Résultat attendu |
| --- | --- |
| `consommables_disponibles(catalogue)` | Un `set` des codes présents dans `consommables_utilises` ou `consommables_fournis`, sans doublons. |
| `filtrer_par_consommable(catalogue, code)` | Une nouvelle liste de tous les produits qui utilisent ou fournissent ce code, dans l’ordre du catalogue. |
| `consommables_sans_offre(catalogue)` | Un set des codes utilisés par un produit mais fournis par aucune référence. |

Parcours les produits et leurs deux listes de codes. Un produit ne doit apparaître qu’une fois, même si le code figure dans les deux listes. Conserve les données reçues inchangées et retourne une collection vide si rien ne correspond.

### Prédis une sélection, puis vérifie-la

Avant de coder, relève dans `catalogue.py` les identifiants que doit retourner chaque code, dans l’ordre du catalogue :

| Code | Situation à observer |
| --- | --- |
| `requin-mousse` | Un lanceur et ses munitions. |
| `flechette-mousse` | Deux lanceurs partagent les mêmes fléchettes. |
| `brume-girofle-agrumes` | Un accessoire et une munition utilisent le même liquide vendu en recharge. |

Le filtre porte sur **toutes les catégories** et examine seulement la présence du code demandé dans l’une des deux listes. Il ne suit pas les liens de proche en proche : le Requin Arêtes utilise les mini-requins, mais ne reçoit pas de liquide. Il ne doit donc pas apparaître dans la sélection `brume-girofle-agrumes`.

<details>
<summary>Vérifie tes prévisions après avoir cherché</summary>

- `requin-mousse` : `BB-02`, `RE-02`.
- `flechette-mousse` : `BB-01`, `BB-06`, `RE-01`.
- `brume-girofle-agrumes` : `BB-04`, `RE-02`, `RE-08`.
- `brume-neutre` : `BB-04`, `RE-02`, `RE-07`.

</details>

### Compatibilité et commande complète ne sont pas synonymes

Le filtre regroupe les produits associés à un code ; il ne dit pas lesquels acheter ensemble. Deux lanceurs partageant les mêmes fléchettes ne s’utilisent pas l’un dans l’autre. RE-07 et RE-08 sont deux liquides **alternatifs**, pas deux achats obligatoires. Les deux champs précisent qui utilise ou fournit chaque consommable, mais ne disent pas si plusieurs codes utilisés sont des alternatives ou des besoins cumulés ; les descriptions précisent ce choix.

Le filtre ne remplit pas la commande. À l’étape 4, tu prépares uniquement les références explicitement demandées.

Pour `consommables_sans_offre`, construis séparément l’ensemble des codes utilisés et celui des codes fournis, puis retourne leur différence. Le catalogue complet et corrigé doit donner `set()`.

<details><summary>Indice</summary>

Si `besoins = {"bille", "liquide"}` et `offre = {"bille"}`, alors `besoins - offre` contient seulement `"liquide"`. Le sens de la soustraction compte.

</details>

Complète `test_consommable_sans_fournisseur` dans `tests_perso.py`. Avec `catalogue_essai()`, attends exactement `{"liquide"}`.

```sh
python tests_catalogue.py filtres
```

**Points de contrôle :** les codes apparaissent une seule fois dans les choix de l’interface. Un code inconnu retourne une liste vide ; un catalogue vide donne un ensemble vide ou une liste vide selon la fonction.

La liste filtrée est nouvelle, mais elle contient les dictionnaires du catalogue. Sélectionner un produit ne fabrique pas une copie indépendante de celui-ci.

## 4. Transforme la demande en commande

Ouvre `demandes.py`. Chaque ligne non vide contient un identifiant et une quantité de conditionnements séparés par `;`. Les quantités fournies sont des entiers positifs ou nuls. Les identifiants peuvent contenir des minuscules et des espaces autour du champ.

### Découpe et retrouve les références

Écris les fonctions suivantes :

| Fonction | Résultat attendu |
| --- | --- |
| `lire_demande(texte)` | Un dictionnaire avec `id` nettoyé et en majuscules, et `quantite` convertie en entier. `" bb-02 ; 2 "` donne `{"id": "BB-02", "quantite": 2}`. |
| `trouver_produit(catalogue, identifiant)` | Le dictionnaire d’origine dont `id` correspond exactement, ou `None` si la référence est absente. |

<details><summary>Indice</summary>

`split(";")` produit une liste de chaînes. Applique `strip()` à chaque champ, `upper()` à l’identifiant et `int()` à la quantité. Pour retrouver un produit, retourne la fiche lorsqu’elle convient ; place le retour `None` après la boucle.

</details>

Complète `test_lecture_demande` : vérifie le dictionnaire obtenu avec `" l1 ; 2 "` et le type entier de la quantité.

### Calcule le prix de chaque ligne

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

**Points de contrôle :** deux Sulfateuses à Relances à 39,50 € coûtent 79 €. Deux lots de mini-requins à 59,90 € coûtent 119,80 €. Trois bouteilles de Brume girofle-agrumes à 6,90 € coûtent 20,70 €, sans décimales parasites. Une quantité nulle donne zéro.

Retourne le montant et laisse l’interface le présenter. Conserve le produit inchangé.

### Prépare des lignes sans modifier les produits

Écris `preparer_ligne(produit, quantite)` :

1. Crée une copie superficielle du dictionnaire avec `.copy()`.
2. Ajoute `quantite` et `sous_total_euros` à cette copie.
3. Calcule le sous-total en appelant `calculer_budget`.
4. Retourne la copie.

Complète `test_ligne_independante` : deux L1 coûtent 40 €. Vérifie la quantité, le sous-total, l’identité différente des dictionnaires avec `is not` et la fiche source inchangée. Compare l’original à une nouvelle fiche renvoyée par `catalogue_essai()`, plutôt qu’à un deuxième nom désignant le même objet.

<details><summary>Indice</summary>

`copie = produit` conserve le même dictionnaire. `copie = produit.copy()` crée le dictionnaire où ajouter les deux champs. Une copie superficielle suffit pour ces ajouts de premier niveau.

</details>

### Assemble la commande

Écris `preparer_commande(catalogue, demandes)`. Retourne un dictionnaire de cette forme :

```python
{"lignes": [...], "inconnues": [...]}
```

- Ignore les lignes vides ou composées d’espaces.
- Appelle `lire_demande`, puis `trouver_produit` pour chaque autre ligne.
- Pour une référence trouvée, ajoute le résultat de `preparer_ligne` à `lignes`.
- Pour une référence absente, ajoute son identifiant normalisé à `inconnues`.
- Conserve l’ordre des demandes dans chaque liste et les données reçues inchangées.

**Résultat attendu pour `DEMANDES` :** trois lignes, BB-02 × 2, RE-02 × 3 et RE-08 × 1 ; `inconnues` contient `["BB-99"]`. Les sous-totaux sont 978 €, 179,70 € et 6,90 €. Une liste de demandes vide donne deux listes vides.

<details><summary>Indice</summary>

Initialise les deux listes avant la boucle. Un test sur `texte.strip()` distingue une ligne blanche. Distingue ensuite `produit is None` d’un produit trouvé et réutilise tes fonctions.

</details>

```sh
python tests_catalogue.py commande budget
python tests_catalogue.py perso
```

## 5. Produis le devis et conserve les favoris

### Cumule et ajoute les frais une seule fois

Écris `calculer_total(lignes)` : cumule `sous_total_euros` dans une boucle, puis retourne le total arrondi à deux décimales. Une liste vide donne zéro.

Écris `total_avec_livraison(lignes, frais_euros=6)` : réutilise `calculer_total`, ajoute les frais une seule fois si la liste contient au moins une ligne et retourne un montant arrondi. Une liste vide donne zéro, quels que soient les frais.

Une ligne de quantité zéro reste une ligne de commande : elle compte pour la présence de lignes, même si son sous-total est nul.

**Pour la demande fournie :** 1 164,60 € d’articles, 1 170,60 € livrés avec les frais par défaut, 1 164,60 € avec zéro frais et 1 174,60 € avec dix euros de frais.

<details><summary>Indice</summary>

Initialise le total avant la boucle. Le paramètre `frais_euros=6` fournit une valeur quand l’appel ne précise rien. Appelle ensuite la fonction avec `frais_euros=0` pour changer seulement ces frais.

</details>

### Prépare un récapitulatif lisible

Écris `formater_devis(lignes, frais_euros=6)`. Construis une chaîne avec une ligne par référence et une dernière ligne pour le total livré. Réutilise `total_avec_livraison` avec le paramètre reçu.

Format attendu pour `DEMANDES`, avec un point décimal et deux décimales :

```text
BB-02 | 2 x Requin Arêtes : 978.00 €
RE-02 | 3 x Mini-requins fumigènes : 179.70 €
RE-08 | 1 x Brume girofle-agrumes : 6.90 €
Total livré : 1170.60 €
```

Pour une liste vide, retourne `"Total livré : 0.00 €"`. La fonction retourne le texte ; l’interface ou le script choisit de l’afficher.

<details><summary>Indice</summary>

Ajoute des f-strings dans une liste, avec `:.2f` pour chaque montant. Ajoute le total à la fin et rassemble les messages avec `"\n".join(messages)`.

</details>

### Prépare les favoris de la Happiness Team

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

### Complète les tests du devis

Dans `tests_perso.py` :

- `test_total_cumule` : deux lignes contenant seulement `sous_total_euros`, avec 40 et 15, donnent 55 ; les lignes restent inchangées.
- `test_commande_vide_sans_frais` : vérifie zéro pour `calculer_total([])`, puis pour une livraison vide avec les frais par défaut et avec dix euros.
- `test_frais_parametres` : avec les deux lignes de 40 et 15, attends 61 par défaut, 55 avec zéro frais et 65 avec dix euros.
- `test_favori_autres_champs` : active puis désactive le favori de L1 ; vérifie le retour `None` et les autres informations inchangées.

```sh
python tests_catalogue.py devis favoris
python tests_catalogue.py perso
```

## 6. Vérifie le parcours complet

```sh
python tests_catalogue.py
```

Complète `test_parcours_complet` avec `catalogue_essai()` et ces demandes :

```python
[" l1 ; 2 ", " absent ; 1 ", "m1;3", "   "]
```

Vérifie successivement :

1. `inconnues` vaut `["ABSENT"]`.
2. Les lignes contiennent L1 puis M1, dans cet ordre.
3. Le total des articles vaut 55 et le total livré vaut 61.
4. Le texte vaut exactement `"L1 | 2 x Lanceur : 40.00 €\nM1 | 3 x Billes : 15.00 €\nTotal livré : 61.00 €"`.
5. Le catalogue et les demandes sont inchangés.

<details><summary>Indice</summary>

Crée la commande une seule fois dans le test. Récupère `commande["lignes"]` pour appeler les fonctions de total et de mise en forme. Compare les données sources à de nouvelles valeurs attendues, indépendantes des objets testés.

</details>

**Vérifie que tes tests servent :** remplace temporairement `<=` par `<` dans le test de poids de `selectionner_equipements`. Lance `python tests_catalogue.py perso` et constate l’échec de `test_selection_seuil_inclus`. Rétablis ensuite `<=` et relance l’ensemble.

**Résultat attendu :** toutes les vérifications du socle et tes dix tests affichent `OK`. Dans l’interface, recherche un mot, sélectionne les petits équipements, retrouve une compatibilité et prépare le devis. Vérifie la référence inconnue, change les frais et active puis désactive un favori. Explique une fonction et vérifie-la avec une autre entrée.

## Reprends à une autre étape si tu bloques

Choisis un point de reprise avec le formateur. Chaque branche fournit les étapes précédentes terminées, y compris leurs tests. Les consignes, l’extrait source et les vérifications fournies sont identiques. Les repères du bonus restent à compléter dans `app.py` jusqu’à l’intégration audio.

| Branche | Contenu fourni | Étape à pratiquer |
| --- | --- | --- |
| `main` | Catalogue à corriger, interface et fonctions/tests à compléter. | 1 : données. |
| `etape/02-recherche` | Catalogue corrigé et complet. | 2 : recherche et sélection. |
| `etape/03-compatibilites` | Recherche, sélection et leurs deux tests terminés. | 3 : compatibilités et sets. |
| `etape/04-commande` | Étapes précédentes et test de consommable sans offre terminés. | 4 : lecture de la demande et commande. |
| `etape/05-devis` | Commande et ses deux tests terminés. | 5 : devis, copies et favoris. |
| `etape/06-tests` | Fonctions du socle et neuf tests terminés. | 6 : test du parcours complet et recette. |
| `etape/07-audio` | Socle et dix tests terminés. | Bonus : fichiers sonores et lecteurs. |

Enregistre tes fichiers, publie ton travail en cours (voir [Publie ton travail](#publie-ton-travail)) et arrête Streamlit avec **Ctrl+C**. Pour reprendre à l’étape 2, exécute les commandes une par une :

```sh
git remote set-branches origin '*'
git fetch origin
git stash push --include-untracked -m "Sauvegarde avant reprise"
git switch etape/02-recherche
git branch --show-current
```

Les deux premières commandes rendent les reprises disponibles, même si une seule branche a été téléchargée. `git stash` met de côté tes modifications non publiées ; si Git indique qu’il n’y a rien à sauvegarder, poursuis. La dernière commande doit afficher `etape/02-recherche`.

<details>
<summary>Git indique que la branche de reprise n’existe pas</summary>

Ton fork contient seulement `main`. Récupère les branches depuis le dépôt d’origine :

```sh
git remote add upstream https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters.git
git fetch upstream
git switch -c etape/02-recherche upstream/etape/02-recherche
```

</details>

Pour une autre reprise, remplace le nom de la branche. Si une commande échoue, conserve son message et demande de l’aide avant de poursuivre.

Pour retrouver tes sauvegardes et consulter le fichier de fonctions de la plus récente :

```sh
git stash list
git show 'stash@{0}:fonctions.py'
```

## Publie ton travail

**Fais un commit après chaque consigne complétée.** Enregistre tes fichiers, puis, dans **Source Control** de VS Code, place les fichiers concernés dans **Staged Changes** avec le bouton **+**, écris un message décrivant la consigne réalisée et clique sur **Commit**. Utilise ensuite **Sync Changes** pour publier le commit dans ton fork. Ouvre ton fork sur GitHub et vérifie que tes derniers fichiers y figurent.

**Si tu n’arrives pas à faire le commit ou à le publier depuis ton poste, appelle le formateur pour le faire avec lui.**

Enregistrer un fichier dans Codespaces ne le publie pas.

## Remets ton travail

**Le rendu final se fait obligatoirement par une pull request** depuis ton fork vers le dépôt [SIMPLON-DIST-DEVIA-P1-199833/bureaublasters](https://github.com/SIMPLON-DIST-DEVIA-P1-199833/bureaublasters), dans ta branche **déjà existante** `rendu/<mon-prenom>`. Utilise le nom exact de cette branche, pas `main`, et ne crée pas une nouvelle branche de rendu.

**Sollicite l’aide du formateur** si tu ne retrouves pas ta branche ou si tu as besoin d’aide pour ouvrir la pull request :

1. Sur ton fork, ouvre **Pull requests → New pull request**.
2. Choisis comme **base repository** `SIMPLON-DIST-DEVIA-P1-199833/bureaublasters` et comme **base** ta branche existante `rendu/<mon-prenom>`.
3. Choisis comme **head repository** ton fork et comme **compare** la branche sur laquelle tu as terminé.
4. Clique sur **Create pull request**, puis complète la description proposée : branche de départ, parties réalisées personnellement, vérifications effectuées, bonus réalisés et blocage résolu ou restant. Glisse dans la description une capture de l’interface montrant une sélection et le devis calculé.
5. Transmets le lien de la pull request au formateur par Discord en MP.

Tu peux encore publier des commits dans ton fork après l’ouverture : ils s’ajoutent automatiquement à la pull request jusqu’à sa clôture.

Prépare une démonstration courte : un comportement réussi et une modification expliquée. Si tu as utilisé une branche de reprise, distingue le code fourni de ton travail personnel. Montre aussi un de tes tests et le comportement qu’il vérifie. Si tu as réalisé le bonus audio, montre un lecteur et explique son emplacement dans la carte.

## Vérifie les critères de réussite

- Ton catalogue est complet et conforme aux fiches et aux signalements.
- Recherche, filtres, commande, devis et favoris fonctionnent selon les consignes.
- Tes fonctions utilisent leurs paramètres et ne modifient que les données prévues.
- Les vérifications fournies et tes dix tests passent ; tu montres qu’un test détecte une erreur.
- Tu sais expliquer une fonction et le test qui la vérifie.

## Bonus : ajoute les effets sonores

**Objectif :** associer les fichiers reçus aux produits et intégrer toi-même un lecteur dans les cartes Streamlit.

**Prérequis :** socle terminé ; boucles, conditions, dictionnaires et lecture d’un appel de fonction. **Durée indicative :** 30 à 45 minutes.

### Ajoute les fichiers reçus sur Discord

Télécharge l’archive sonore partagée par le formateur sur Discord et extrais-la. Crée un dossier `sons/` à la racine du projet et ajoute directement les neuf fichiers `.wav` dedans, en conservant leurs noms. Vérifie par exemple la présence de `sons/rire-requin.wav`, sans dossier intermédiaire supplémentaire.

### Associe les références aux sons

Dans `sons.py`, complète `SONS_PRODUITS`. Chaque clé est un identifiant produit ; sa valeur est une **liste de chemins relatifs à la racine du projet**. Par exemple, la référence BB-01 est associée à `["sons/tampon-administratif.wav"]`.

| Référence | Fichier dans `sons/` |
| --- | --- |
| BB-01 | `tampon-administratif.wav` |
| BB-02 | `rire-requin.wav` |
| BB-03 | `montee-niveau.wav` |
| BB-04 | `jingle-brume.wav` |
| BB-05 | `coin-coin.wav` |
| BB-06 | `ding-reunion.wav` |
| BB-07 | `clochette-boulangerie.wav` |
| BB-08 | `bourdonnement-orbe.wav` |
| RE-02 | `sifflement-mini-requin.wav` |
| RE-04 | `coin-coin.wav` |

Les autres références restent absentes du dictionnaire et sont silencieuses. BB-05 et RE-04 partagent le même fichier.

Complète `sons_pour_produit(identifiant, associations)` dans `fonctions.py` : retourne la liste associée à l’identifiant ou `[]` si aucune association n’existe. Conserve le dictionnaire reçu inchangé.

<details><summary>Indice</summary>

`associations.get(identifiant, [])` permet de fournir une liste vide quand la clé est absente. Utilise le paramètre reçu, plutôt que d’importer le dictionnaire dans la fonction.

</details>

### Intègre les lecteurs dans les cartes

Ouvre `app.py`. Les commentaires `Bonus audio` repèrent les imports à ajouter et l’emplacement à compléter dans `afficher_produit`, après les caractéristiques et avant le favori.

1. Importe `SONS_PRODUITS` depuis `sons` et `sons_pour_produit` depuis `fonctions`.
2. Appelle ta fonction avec l’identifiant de la fiche et le dictionnaire d’associations, puis parcours les chemins obtenus.
3. Construis le chemin du fichier avec `DOSSIER / chemin`. `DOSSIER` est déjà défini dans `app.py` ; `fichier.is_file()` permet de vérifier sa présence.
4. Pour un fichier présent, ajoute un lecteur **dans le `with st.container(border=True)` de la fiche**. Utilise `st.audio`, le chemin converti avec `str(fichier)`, le format `"audio/wav"` et une lecture déclenchée par la personne qui consulte la carte.
5. Pour un fichier absent, affiche un message avec son chemin à l’aide de `st.warning`. Conserve les autres cartes utilisables.

Consulte ces passages précis de la documentation :

- [`st.audio` : paramètres `data`, `format` et `autoplay`](https://docs.streamlit.io/develop/api-reference/media/st.audio). Repère l’exemple de lecture d’un fichier local ; garde `autoplay=False`.
- [`st.container` : exemple 1, insertion avec `with`](https://docs.streamlit.io/develop/api-reference/layout/st.container). Observe comment l’indentation détermine le conteneur qui reçoit l’élément.
- [`st.warning` : paramètre `body` et exemple](https://docs.streamlit.io/develop/api-reference/status/st.warning). Construis un message qui identifie le fichier manquant.

<details><summary>Indice</summary>

Commence par une seule référence et un seul fichier. Garde le lecteur dans la boucle des chemins de la fiche. Une liste de chemins vide effectue zéro tour : aucun lecteur n’est ajouté au produit silencieux.

</details>

### Vérifie le bonus

```sh
python tests_catalogue.py audio
python tests_catalogue.py
```

Ces vérifications contrôlent les associations et les fonctions. Termine par ces essais dans l’interface :

- BB-02 affiche le lecteur de son rire ; RE-01 n’affiche aucun lecteur.
- BB-05 et RE-04 permettent d’écouter le même coin-coin.
- La lecture commence quand tu actionnes le lecteur.
- Renomme temporairement `rire-requin.wav` : sa carte affiche le chemin absent et les autres produits restent utilisables. Rétablis ensuite le nom du fichier.
- Recherche un produit, applique un filtre, prépare le devis et bascule un favori : ces fonctions restent opérationnelles.

Publie les fichiers sonores ajoutés, les associations, la fonction et l’intégration du lecteur dans ton fork. Ajoute à ta pull request une capture d’une carte avec son lecteur.

## Bonus : améliore le design et l’ergonomie du catalogue

**Prérequis :** socle fonctionnel. **Durée indicative :** 20 à 30 minutes.

Comment rendrais-tu le catalogue plus agréable à consulter et plus simple à utiliser ?

Choisis et réalise une amélioration dans `app.py`. Par exemple, fais apparaître les premières fiches du catalogue dès l’ouverture de la page, sans avoir à faire défiler l’écran, tout en gardant la recherche et les filtres faciles à trouver.

Vérifie le résultat sur une fenêtre d’ordinateur puis une fenêtre plus étroite. Teste la recherche, les filtres, les favoris et le devis pour confirmer qu’ils restent utilisables.

Ajoute une capture avant/après à ta pull request et explique brièvement le problème résolu et ton choix.

## Consulte les ressources utiles

- [Python 3.15 : listes, dictionnaires et ensembles](https://docs.python.org/3.15/tutorial/datastructures.html).
- [Python 3.15 : fonctions](https://docs.python.org/3.15/tutorial/controlflow.html#defining-functions).
- [Python 3.15 : instruction `assert`](https://docs.python.org/3.15/reference/simple_stmts.html#the-assert-statement).
- [Python 3.15 : affectation et copie](https://docs.python.org/3.15/library/copy.html).
- [GitHub : créer une pull request depuis un fork](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).
- [Git : sauvegardes avec `stash`](https://git-scm.com/docs/git-stash).
- [Streamlit : lancement](https://docs.streamlit.io/develop/concepts/architecture/run-your-app).
