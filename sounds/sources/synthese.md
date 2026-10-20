# Sources synthétisées

Les neuf sources WAV de ce répertoire sont calculées par `sounds/tools/synth.ts`, une synthèse procédurale déterministe : oscillateurs, partiels amortis, filtres et bruit pseudo-aléatoire à graine fixe. Aucun enregistrement, échantillon de banque, modèle génératif ni service en ligne n’intervient. L’auteur et chaque modification de la recette figurent dans l’historique Git de `sounds/tools/synth.ts`.

## Droits

Création interne BureauBlasters, sans matériel tiers. La redistribution avec le dépôt ne dépend d’aucune licence externe ni attribution fournisseur.

## Reconstruire et vérifier

```sh
bun run sounds/tools/synth.ts           # réécrit les sources depuis la recette
bun run sounds/tools/synth.ts --check   # compare les fichiers à la recette, sans écrire
bun run --cwd sounds/tools test
```

Les sources sont en WAV PCM 16 bits, mono, 44,1 kHz, à la durée déclarée dans `effects.json`, avec une crête à −1 dBFS. Les sons ponctuels se terminent par un fondu de 250 ms. Modifier une recette change les octets de sa source et invalide la validation de cet effet dans `generate.ts`.

## Recettes

| Effet | Construction |
|---|---|
| `tampon-administratif` | Déclic filtré, impact grave glissant de 170 à 72 Hz, saturation douce, résonances de bureau, froissement de papier granulaire, petit déclic de retour |
| `rire-requin` | Souffle d’air filtré, huit syllabes voisées descendantes puis une syllabe finale montante et descendante avec vibrato ; formants de voyelle ouverte décalés vers l’aigu, sans mot ni voix enregistrée |
| `montee-niveau` | Cinq notes ascendantes do5-mi5-sol5-do6-mi6, timbre rond à harmoniques impairs, petite inflexion d’attaque, filtre de haut-parleur de jouet |
| `jingle-brume` | Exactement trois notes de cloche de verre mi5-sol5-si5, régulièrement espacées de 320 ms, partiels inharmoniques amortis |
| `coin-coin` | Un seul couac : source harmonique glissant de 560 à 470 Hz, formants nasillards, couinement de caoutchouc, petit écho de corps et souffle final |
| `ding-reunion` | Une frappe à 1 320 Hz, attaque douce de 5 ms, partiels métalliques courts |
| `clochette-boulangerie` | Une frappe de petite cloche à 1 900 Hz, partiels de cloche traditionnelle et léger battement chaleureux |
| `bourdonnement-orbe` | Boucle de 4 s : sinusoïdes de 109,75 à 440,25 Hz, pulsation de 1 Hz ; toutes les fréquences sont multiples de 0,25 Hz pour un raccord exact |
| `sifflement-mini-requin` | Sifflement sinusoïdal descendant de 1 650 à 1 150 Hz, zigzag de 2,4 Hz, souffle filtré suivant la hauteur |

## Mesures de la recette

Intégration EBU R128 des sources, avant la crête de livraison à −3 dBFS, qui décale toutes les valeurs de −2 dB. La normalisation de crête n’égalise pas le volume perçu : le sifflement, presque sinusoïdal et soutenu, est nettement plus fort que les sons percussifs et appelle un gain de lecture plus bas dans l’application qui l’utilise.

| Effet | Partie active | Sonie intégrée |
|---|---:|---:|
| `tampon-administratif` | 0,04–0,44 s | −18,3 LUFS |
| `rire-requin` | 0–2,17 s | −13,3 LUFS |
| `montee-niveau` | 0,03–1,86 s | −12,1 LUFS |
| `jingle-brume` | 0,04–1,92 s | −13,4 LUFS |
| `coin-coin` | 0,04–0,43 s | −14,7 LUFS |
| `ding-reunion` | 0,02–1,41 s | −13,0 LUFS |
| `clochette-boulangerie` | 0,01–1,86 s | −16,4 LUFS |
| `bourdonnement-orbe` | boucle | −11,8 LUFS |
| `sifflement-mini-requin` | 0,05–1,34 s | −7,3 LUFS |
