# Génération des visuels BureauBlasters

Maintenance des visuels réservée à l’équipe pédagogique, hors exercice Python. Aucune de ces commandes n’est nécessaire pour suivre l’atelier. Exécuter les commandes depuis la racine du dépôt avec Bun.

## Une recette pour toute la collection

- **SDK** : Vercel AI (`ai` et `@ai-sdk/openai`), versions fixées dans `package.json` et `bun.lock`.
- **Fournisseur** : CPA, endpoint OpenAI Images. La clé héritée via `CPA_CLIENT_API_KEY` est prioritaire ; sinon le script consulte automatiquement l’entrée gopass `bg/cpa.tn.nwo.pm/client-api-key`. La clé reste en mémoire : aucune valeur affichée, stockée dans un fichier ou passée en argument.
- **Modèle** : `gpt-image-2.5-sunburst`, fixé dans `RECIPE`, sans modèle de secours ni changement automatique.
- **Appels** : une image par requête, qualité `high`, carré `1024x1024` demandé, zéro relance automatique. Sans références : `/images/generations` ; avec références : `/images/edits`, par le même SDK et le même fournisseur.
- **Prompts** : même préambule, même direction artistique extraite de `images/prompts/README.md`, références jointes dans l’ordre déclaré, puis sujet et prise de vue du fichier produit. Aucune réécriture du texte par une étape LLM dans le script.
- **Sortie** : les carrés natifs d’au moins 1024 pixels sont réduits sans recadrage en JPEG 1024 × 1024, qualité 95. Les images non carrées ou trop petites sont refusées. Le format et les dimensions reçus sont consignés, indépendamment des paramètres demandés.

Astra (`gpt-astra-latest`) est un modèle de langage pouvant piloter l’outil de génération d’images via Responses, pas un modèle pour l’endpoint Images. Sunburst est le modèle de cette recette, pas un gagnant artistique présumé : les spectateurs choisissent les démonstrations les plus séduisantes et proches de la direction visuelle. Le script appelle directement le modèle d’image, sans orchestrateur Astra supplémentaire.

Les générations restent aléatoires : cette recette garantit une procédure commune, pas des pixels identiques à chaque appel. Le modèle ne prend pas en charge une graine dans le SDK ; aucune n’est envoyée. CPA et son fournisseur conservent leur propre routage interne.

Le transport ajoute un nom de fichier aux références multipart anonymes de Bun pour qu’elles soient reconnues comme fichiers par CPA. Il ne modifie ni leurs octets ni le prompt.

## Installation et vérifications

```sh
bun install --cwd images/tools --frozen-lockfile
bun run --cwd images/tools typecheck
bun run --cwd images/tools test
bun run images/tools/generate.ts --plan
```

`--plan` et les tests ne nécessitent ni clé ni appel de génération. `CPA_BASE_URL` peut remplacer l’URL CPA par défaut ; conserver le même endpoint pendant une série.

Pour vérifier l’authentification et la présence du modèle sans générer d’image, y compris sans clé héritée :

```sh
env -u CPA_CLIENT_API_KEY bun run images/tools/generate.ts --check
```

`gopass` doit être installé et son trousseau accessible. Une erreur d’accès arrête le script sans afficher la sortie privée du gestionnaire de secrets.

## Générer, contrôler, valider

```sh
bun run images/tools/generate.ts --generate brume-bonne-humeur
```

Éprouver d’abord la direction sur trois démonstrations : fumigène, Requin Arêtes et recharge neutre. Examiner `images/tools/.generation/brume-bonne-humeur.jpg` : collègue adulte tenant le produit, expression malicieuse lisible, véritable bureau accueillant, produit net au premier plan. Vérifier aussi le format de poche permettant d’en tenir trois dans une main, un seul exemplaire visible, le silicone mat amortissant, les sorties multiples avec LED voisines et le clapet bleu pétrole fermé sur l’épaule droite. Après contrôle visuel seulement :

```sh
bun run images/tools/generate.ts --approve brume-bonne-humeur
bun run images/tools/generate.ts --generate requin-aretes brume-neutre
```

Présenter ces trois images aux spectateurs : envie de jouer, expressions complices, énergie mécanique et graphique inspirée d’Arcane, lumière et mise en scène. Ne pas étendre la série avant validation de cette direction ; les tests automatiques ne mesurent pas le goût artistique. Aucun JPEG du catalogue n’est remplacé à ce stade.

Contrôler et valider chaque équipement avant de générer ses consommables. Après accord sur les essais, poursuivre les équipements :

```sh
bun run images/tools/generate.ts --generate gantelets-sprint coin-coin-crise catapulte-croissants orbe-decompression
```

Le graphe complet apparaît dans `--plan` :

1. Le fumigène établit la référence de style de la série.
2. La Rafale est en attente de refonte de son nom et de son concept. Suspendre sa génération et celle de l’arbalète et des fléchettes, qui dépendent de son modèle de munition.
3. Les munitions reçoivent le style commun et leur lanceur validé ; les fléchettes reçoivent les deux lanceurs.
4. La recharge neutre reçoit le fumigène comme référence d’objet.
5. La recharge parfumée reçoit le fumigène et la recharge neutre validée.

Les références proviennent exclusivement de la série en préparation, jamais des anciens JPEG du catalogue. Le script vérifie récursivement leurs validations, leurs empreintes et les prompts dont elles dépendent. Un équipement de référence ne doit pas être ajouté à une photo de lot si son prompt ne le demande pas.

Pour chaque image, juger d’abord l’attrait visuel, la malice du visage et la crédibilité du geste dans un vrai bureau d’entreprise créative. Le produit entier doit dominer le premier plan sans devenir géant par rapport aux mains ; les doigts et la brume ne doivent cacher aucune fonction. Les références de style ne servent pas à cloner les personnes, les poses ou le mobilier.

Vérifier ensuite le nombre d’objets, les détails des projectiles, l’origine des effets et les accessoires inclus. Un lanceur d’arrière-plan demandé dans un prompt de lot doit rester vide, secondaire et distinct du produit vendu. Les recharges versent le liquide exactement au centre de l’orifice du même petit fumigène éteint, sous son clapet ouvert et toujours attaché sur l’épaule droite ; le filet franchit le rebord sans mouiller la coque. Son bouton ne devient pas un couvercle. La bouteille de 100 ml reste plus grande que l’appareil et permet plusieurs remplissages. Comparer aussi les images en grille pour vérifier la cohérence de l’entreprise et de la collection.

```sh
bun run images/tools/generate.ts --approve requin-aretes
bun run images/tools/generate.ts --generate mini-requins
```

`--approve` enregistre une décision de contrôle visuel ; il ne réalise pas ce contrôle automatiquement. Ne jamais valider aveuglément une liste d’images.

## Reprendre et publier

`--generate` réutilise une sortie dont le prompt, les paramètres, les références et les octets n’ont pas changé. Une sortie non conforme et non validée peut être rejouée avec le même prompt :

```sh
bun run images/tools/generate.ts --retry flechettes-rappel
```

Si une consigne produit doit être précisée, modifier son fichier dans `images/prompts/`, puis relancer `--generate`. Le nouveau prompt invalide aussi les images qui en dépendent. Changer de recette ou de dépendances exige une nouvelle série dans un répertoire `images/tools/.generation/` vide ; aucune série ne peut mélanger ces versions. Exécuter un seul processus de génération à la fois.

Les sorties natives, JPEG, prompts assemblés et le journal de travail restent dans `images/tools/.generation/`, exclu de Git. Les empreintes SHA-256 relient chaque image à son prompt, ses références et sa recette. Une fois les seize images contrôlées et validées :

```sh
bun run images/tools/generate.ts --publish
```

Cette commande vérifie toute la série avant de remplacer `images/*.jpg` et de publier `images/tools/generation.json`. Ce journal versionné conserve le modèle, les paramètres, l’empreinte du verrou de dépendances, les formats natifs, les empreintes des prompts/références/images et les dates de génération et validation. Il ne contient aucune clé.
