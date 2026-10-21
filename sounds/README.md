# Bruitages BureauBlasters

Outil de maintenance réservé à l’équipe pédagogique, indépendant de l’exercice Python et du générateur d’images. Les WAV sont transmis séparément sur Discord. Les apprenants les ajoutent dans `sons/` et intègrent les lecteurs dans `app.py` ; `correction` fournit cette intégration. Aucun compte audio, Bun ou FFmpeg n’est nécessaire pour suivre l’atelier.

## Quel type de génération ?

Un LLM de texte peut aider à rédiger un prompt, mais ne produit pas lui-même le signal sonore. Le script appelle directement **ElevenLabs Sound Effects**, modèle audio `eleven_text_to_sound_v2`, sans réécriture intermédiaire par un LLM. L’API d’images CPA n’est pas utilisée comme API audio.

- **Audio génératif** : pertinent pour explorer le rire du Requin Arêtes, un coin-coin stylisé ou une identité sonore originale. Un prompt permet de changer le timbre, l’intention et la texture ; le résultat doit être écouté.
- **Enregistrement, banque de sons ou synthèse déterministe** : préférables pour un bruit réel précis, une mélodie ou un nombre de notes strict, ou une synchronisation exacte. Importer le fichier obtenu avec sa licence. Un prompt ne garantit pas que le jingle du fumigène contiendra exactement trois notes.
- **Approche hybride** : générer les textures originales et importer les signaux précis, puis préparer, contrôler et publier tous les fichiers avec le même outil.

Les neuf effets configurés sont synthétisés localement par `sounds/tools/synth.ts` (voir `sounds/sources/synthese.md`) : aucun appel payant ni droit fournisseur n’intervient. Leurs prompts restent la description de référence de chaque son. `coin-coin` est partagé par BB-05 et RE-04 : le son vient de la puce du canard. Les produits sans effet sonore déclaré n’ont pas de fichier. Le jingle du fumigène n’est pas une bande-son de vingt secondes ; les ultrasons ne sont pas artificiellement rendus audibles.

## Installation et aperçu sans appel payant

Depuis la racine du dépôt, avec Bun et FFmpeg accessibles dans `PATH` :

```sh
bun install --cwd sounds/tools --frozen-lockfile
bun run --cwd sounds/tools typecheck
bun run sounds/tools/synth.ts
bun run --cwd sounds/tools test
bun run sounds/tools/generate.ts --plan
```

Provisionner FFmpeg avec l’outillage partagé mise/Nix de la machine. Les tests utilisent FFmpeg et des signaux synthétiques locaux, **sans réseau et sans clé**. `--plan` affiche les prompts assemblés, les paramètres et l’état des fichiers ; il ne génère rien et ne nécessite pas FFmpeg.

## Modifier un son ou ajouter un produit

- `sounds/prompts/style.md` : direction sonore commune.
- `sounds/prompts/<effet>.md` : intention, timbre, déroulement et exclusions propres à l’effet. Tout le fichier est envoyé comme prompt, avec le style et la durée.
- `sounds/tools/effects.json` : nom stable de l’effet, identifiants des produits associés, durée demandée entre 0,5 et 30 secondes, boucle, influence du prompt et source.

Pour un effet synthétisé, modifier sa recette dans `sounds/tools/synth.ts`, reconstruire les sources, puis régénérer l’effet ; modifier seulement son prompt n’en change pas le son. Pour un effet génératif, modifier par exemple `sounds/prompts/rire-requin.md`, puis régénérer `rire-requin`. Une modification du prompt invalide son ancienne validation, pas celles des autres effets. Une modification du style commun invalide toute la série. L’outil ne modifie pas les fiches commerciales : conserver les prompts et `catalogue_source.txt` cohérents.

Pour un nouveau produit, ajouter une entrée à `effects.json` et le fichier de prompt portant le même nom. Aucun changement du script n’est nécessaire. Pour partager un bruitage, ajouter plusieurs identifiants dans `products`. Un produit peut aussi être associé à plusieurs effets : leur mixage ou leur séquençage reste à définir dans l’application utilisatrice.

## Générer avec un prompt

Fournir `ELEVENLABS_API_KEY` dans l’environnement via le gestionnaire de secrets habituel. Ne pas écrire de clé dans les fichiers, les commandes enregistrées ou Git. Une clé CPA ne remplace pas une clé ElevenLabs.

```sh
bun run sounds/tools/generate.ts --generate rire-requin
# Après validation de la direction sonore, préparer le reste :
bun run sounds/tools/generate.ts --generate all
```

**Chaque effet manquant ou modifié peut entraîner un appel facturé.** Commencer par un seul effet. Aucun appel n’a lieu pour les sorties à jour ; aucun appel n’est relancé automatiquement, notamment après une erreur de quota ou de réseau. `all` est une sélection explicite de toute la configuration. Les requêtes sont séquentielles, avec un délai maximal de deux minutes par requête.

L’API reçoit `text`, `model_id`, `duration_seconds`, `prompt_influence` et `loop`. Le MP3 `mp3_44100_128` évite de demander le WAV 44,1 kHz réservé par le fournisseur à certaines offres ; le WAV de livraison est décodé depuis ce MP3, sans restaurer l’information perdue par la compression. Le script n’annonce ni coût fixe ni droit commercial automatique : ils dépendent de l’offre souscrite. L’offre gratuite exclut l’usage commercial et impose l’attribution à ElevenLabs. Les [conditions Sound Effects](https://elevenlabs.io/creative-terms) n’autorisent l’usage des sons qu’intégrés à d’autres contenus et interdisent de les mettre à disposition comme fichiers isolés ou dans une bibliothèque d’effets ; vérifier leur compatibilité avec `sounds/library/` avant toute génération. Les conditions d’utilisation et de conservation du fournisseur s’appliquent aux prompts envoyés.

La génération reste aléatoire ; une procédure et des empreintes identiques ne garantissent pas des échantillons identiques. Pour rejouer un essai non approuvé :

```sh
bun run sounds/tools/generate.ts --retry rire-requin
```

Après approbation, modifier sa fiche et utiliser `--generate` pour créer une nouvelle version. `--retry` refuse les sons approuvés.

## Partir d’un son existant ou synthétisé

Les sources synthétisées se reconstruisent sans réseau ; `--check` vérifie qu’elles correspondent à leur recette :

```sh
bun run sounds/tools/synth.ts
bun run sounds/tools/synth.ts --check
```

Placer le fichier dans `sounds/sources/`, puis remplacer la source de l’effet dans `effects.json` :

```json
{
  "kind": "file",
  "path": "ding-reunion.wav",
  "license": "CC0-1.0",
  "url": "https://exemple.org/page-de-la-source",
  "attribution": "Nom du son — auteur — CC0-1.0"
}
```

Ces valeurs sont un exemple, pas une autorisation pour un fichier réel. Renseigner la page d’origine, la licence exacte et l’attribution réellement applicable. Pour un enregistrement ou une synthèse interne, documenter l’auteur, les droits et la recette dans un fichier versionné de `sounds/sources/`, et utiliser son chemin comme `url`. Ne pas importer un son dont les droits sont inconnus.

```sh
bun run sounds/tools/generate.ts --generate ding-reunion
```

Aucune clé ni connexion n’est nécessaire pour une série composée uniquement de sources `file`. WAV, MP3, OGG, FLAC, AIFF et M4A sont acceptés. Un import réutilise ses octets : **modifier son prompt ne transforme pas le son**. Pour changer son timbre ou son contenu, remplacer le fichier, le retraiter avec son outil d’origine ou repasser sa source à `{ "kind": "elevenlabs" }`. La durée demandée et `loop` ne raccourcissent ni ne rendent automatiquement bouclable un import.

Conserver les WAV reconstruits ou importés hors des fichiers suivis de l’atelier ; distribuer les extraits autorisés sur Discord. Les chemins d’import doivent rester sous `sounds/sources/`.

## Écouter, approuver, publier

Les fichiers de travail sont dans `sounds/tools/.generation/`, exclu de Git : sortie native, prompt assemblé, WAV et journal d’empreintes. La préparation décode en **WAV PCM 16 bits, mono, 44,1 kHz**, ajuste la crête à **−3 dBFS**, et applique un fondu de 5 ms aux extrémités des sons non bouclés. Les boucles ne reçoivent pas ces fondus. Ce traitement n’égalise pas le volume perçu et ne garantit pas un raccord parfait.

Les fichiers indécodables, silencieux ou quasi silencieux et les durées reçues hors de 0,5 à 30 secondes sont refusés. Le journal conserve la durée effectivement reçue : le script ne coupe pas un son pour simuler le respect de la durée demandée.

Écouter chaque WAV à volume modéré. Vérifier l’identité du produit, les attaques et fins sans clic, le nombre de notes, l’absence de paroles, de musique parasite et de fréquences agressives. Tester le raccord du bourdonnement en répétition et comparer les volumes perçus entre produits. Vérifier aussi les droits de diffusion, les obligations d’attribution et l’offre fournisseur utilisée. Les tests automatisés ne remplacent pas ces décisions.

```sh
bun run sounds/tools/generate.ts --approve rire-requin
# Uniquement après écoute et vérification de tous les effets :
bun run sounds/tools/generate.ts --approve all
bun run sounds/tools/generate.ts --publish
```

`--approve` enregistre une décision humaine d’écoute et de vérification des droits ; il ne les vérifie pas lui-même. `--publish` refuse la série si un effet manque, a été modifié ou n’est pas approuvé. Le contrôle précède tout remplacement de la bibliothèque. La publication remplace entièrement le répertoire géré **`sounds/library/`**, avec les WAV et `generation.json` : ne pas y ajouter de fichiers manuels. Les effets supprimés de la configuration disparaissent de la bibliothèque à la publication suivante.

Le journal publié conserve modèle, paramètres, effets et produits associés, droits/attributions, empreintes du prompt, de la source native et du WAV, version de FFmpeg, durée réelle et dates de préparation/approbation. La clé de cache intègre aussi le verrou des dépendances. Ni clé API ni corps d’erreur du fournisseur n’est enregistré. Pour les imports, les octets de la source participent à l’invalidation du cache.

Le script ne crée pas de commit. Les WAV préparés restent locaux et sont distribués séparément après contrôle. L’interface Streamlit et les branches pédagogiques ne sont pas modifiées par ces commandes.

## Reprise après interruption

Un verrou empêche deux opérations d’écriture simultanées. Après arrêt forcé, vérifier qu’aucun processus du générateur ne tourne avant de supprimer `sounds/tools/.generation/.lock`. Les erreurs ordinaires libèrent le verrou.

Une interruption pendant la publication peut laisser `sounds/tools/.publish/` ou `.backup/`. Examiner les fichiers avant suppression : `.backup/` contient la bibliothèque précédente. Si `sounds/library/` manque, restaurer `.backup/` à cet emplacement ; si la nouvelle bibliothèque est complète avec son journal, conserver celle-ci. Retirer les répertoires intermédiaires seulement après ce contrôle, puis republier si nécessaire.

Une conversion échouée laisse la sortie native disponible pour diagnostic. Relancer `--generate` après cet échec peut refaire un appel payant : il n’existe pas de reprise automatique d’une réponse fournisseur non validée.

## Références fournisseur

- [API Sound Effects : paramètres et formats](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)
- [Conditions ElevenCreative, dont Sound Effects](https://elevenlabs.io/creative-terms)
