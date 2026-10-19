# Génération des visuels BureauBlasters

Maintenance des visuels réservée à l’équipe pédagogique, hors exercice Python. Aucune de ces commandes n’est nécessaire pour suivre l’atelier. Exécuter les commandes depuis la racine du dépôt avec Bun.

## Une recette pour toute la collection

- **SDK** : Vercel AI (`ai` et `@ai-sdk/openai`), versions fixées dans `package.json` et `bun.lock`.
- **Fournisseur** : CPA, endpoint OpenAI Images. La clé héritée via `CPA_CLIENT_API_KEY` est prioritaire ; sinon le script consulte automatiquement l’entrée gopass `bg/cpa.tn.nwo.pm/client-api-key`. La clé reste en mémoire : aucune valeur affichée, stockée dans un fichier ou passée en argument.
- **Modèle** : `gpt-image-2.5-sunburst`, fixé dans `RECIPE`, sans modèle de secours ni changement automatique.
- **Appels** : une image par requête, qualité `high`, carré `1024x1024` demandé, zéro relance automatique. Sans références : `/images/generations` ; avec références : `/images/edits`, par le même SDK et le même fournisseur.
- **Prompts** : même préambule, même direction artistique extraite de `images/prompts/README.md`, références jointes dans l’ordre déclaré, puis sujet et prise de vue du fichier produit. Aucune réécriture du texte par une étape LLM dans le script.
- **Sortie** : les carrés natifs d’au moins 1024 pixels sont réduits sans recadrage en JPEG 1024 × 1024, qualité 95. Les images non carrées ou trop petites sont refusées. Le format et les dimensions reçus sont consignés, indépendamment des paramètres demandés.

Astra (`gpt-astra-latest`) est un modèle de langage pouvant piloter l’outil de génération d’images via Responses, pas un modèle pour l’endpoint Images. Le choix de Sunburst privilégie la précision d’édition et le respect des consignes, conformément à la [documentation Vercel AI](https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-models). Le script appelle directement le modèle d’image, sans orchestrateur Astra supplémentaire.

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

Examiner `images/tools/.generation/brume-bonne-humeur.jpg` : plusieurs sorties de brume, LED voisines, bouchon gris sur le flanc droit, géométrie et décor conformes à la charte. Après contrôle visuel seulement :

```sh
bun run images/tools/generate.ts --approve brume-bonne-humeur
bun run images/tools/generate.ts --generate rafale-post-it requin-aretes gantelets-sprint coin-coin-crise catapulte-croissants orbe-decompression
```

Contrôler et valider chaque équipement avant de générer ses consommables. Le graphe complet apparaît dans `--plan` :

1. Le fumigène établit la référence de style de la série.
2. L’arbalète reçoit aussi la Rafale validée pour partager son modèle de fléchette.
3. Les munitions reçoivent le style commun et leur lanceur validé ; les fléchettes reçoivent les deux lanceurs.
4. La recharge neutre reçoit le fumigène comme référence d’objet.
5. La recharge parfumée reçoit le fumigène et la recharge neutre validée.

Les références proviennent exclusivement de la série en préparation, jamais des anciens JPEG du catalogue. Le script vérifie récursivement leurs validations, leurs empreintes et les prompts dont elles dépendent. Un équipement de référence ne doit pas être ajouté à une photo de lot si son prompt ne le demande pas.

Pour chaque image, contrôler le nombre d’objets, les détails des projectiles, l’origine des effets et les accessoires inclus. Les recharges doivent verser le liquide dans le bouchon latéral ouvert du même fumigène, éteint ; son bouton supérieur ne devient pas un couvercle. Comparer aussi les images en grille pour vérifier le style de collection.

```sh
bun run images/tools/generate.ts --approve rafale-post-it
bun run images/tools/generate.ts --generate arbalete-anti-reunionite
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
