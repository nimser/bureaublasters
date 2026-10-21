"""Vérifie les contenus commités, la progression et les comparaisons GitHub."""

import argparse
import ast
import copy
import subprocess
import sys

from niveaux import (
    BRANCHES, ETAPES_FONCTIONS, ETAPES_TESTS, FONCTIONS, TESTS, TRANSITIONS, VARIANTES,
    app_sans_audio, definitions, sons_sans_associations, variante,
)

COMMUNS = {"README.md", "catalogue_source.txt", "tests_catalogue.py", "demandes.py", "apercu_terminal.py"}


def git(*arguments):
    resultat = subprocess.run(["git", *arguments], capture_output=True, check=False)
    if resultat.returncode:
        raise ValueError(resultat.stderr.decode().strip())
    return resultat.stdout


def fichiers_communs(reference):
    chemins = git("ls-tree", "-r", "--name-only", reference).decode().splitlines()
    return COMMUNS | (set(chemins) - VARIANTES)


def lire(reference, chemin):
    return git("show", f"{reference}:{chemin}")


def catalogue(reference):
    arbre = ast.parse(lire(reference, "catalogue.py"))
    affectation = next(n for n in arbre.body if isinstance(n, ast.Assign))
    return ast.literal_eval(affectation.value)


def catalogue_depart(corrige):
    produits = copy.deepcopy([p for p in corrige if p["id"] not in {"BB-02", "BB-04", "RE-08"}])
    index = {p["id"]: p for p in produits}
    index["BB-01"]["prix_euros"] = "39,50"
    index["BB-07"]["dimensions_cm"]["longueur"] = 480
    index["RE-02"]["consommables_fournis"][0] = "requin_mousse"
    index["RE-03"]["favori"] = "False"
    index["RE-06"]["prix_euros"] = 890
    return produits


def verifier_comparaisons(references):
    erreurs = []
    for avant, apres, chemins in zip(BRANCHES, BRANCHES[1:], TRANSITIONS):
        base, suite = references[avant], references[apres]
        transition = f"{avant} → {apres}"
        try:
            attendu = git("rev-parse", base).decode().strip()
            ancetre = git("merge-base", base, suite).decode().strip()
            if ancetre != attendu:
                erreurs.append(f"{transition} : la branche précédente doit être un ancêtre de la suivante")
                continue
            fichiers = set(git("diff", "--name-only", f"{base}...{suite}").decode().splitlines())
            if fichiers != chemins:
                erreurs.append(f"{transition} : fichiers attendus {sorted(chemins)}, obtenu {sorted(fichiers)}")
        except ValueError as erreur:
            erreurs.append(f"{transition} : {erreur}")
    return erreurs


def verifier(remote=None):
    prefixe = f"refs/remotes/{remote}" if remote else "refs/heads"
    references = {branche: f"{prefixe}/{branche}" for branche in BRANCHES}
    correction = references["correction"]
    communs = fichiers_communs(correction)
    contenus = {chemin: lire(correction, chemin) for chemin in communs}
    sources = {chemin: lire(correction, chemin).decode() for chemin in VARIANTES - {"catalogue.py"}}
    corrige = catalogue(correction)
    identifiants = [f"BB-0{n}" for n in range(1, 9)] + [f"RE-0{n}" for n in range(1, 9)]
    if [p["id"] for p in corrige] != identifiants:
        raise ValueError("correction : les seize références doivent être présentes dans l’ordre")
    for chemin, attendus in [("fonctions.py", FONCTIONS), ("tests_perso.py", TESTS)]:
        noms = set(definitions(sources[chemin]))
        if chemin == "tests_perso.py":
            noms.discard("catalogue_essai")
        if noms != set(attendus):
            raise ValueError(f"correction : définitions de {chemin} différentes du contrat")
        if "raise NotImplementedError" in sources[chemin]:
            raise ValueError(f"correction : {chemin} doit être terminé")
    erreurs = verifier_comparaisons(references)
    for niveau, branche in enumerate(BRANCHES):
        reference = references[branche]
        try:
            if fichiers_communs(reference) != communs:
                erreurs.append(f"{branche} : liste des fichiers communs différente")
            for chemin, contenu in contenus.items():
                if lire(reference, chemin) != contenu:
                    erreurs.append(f"{branche} : {chemin} diffère de correction")
            attendu = catalogue_depart(corrige) if niveau == 0 else corrige
            if catalogue(reference) != attendu:
                erreurs.append(f"{branche} : catalogue différent du niveau attendu")
            for chemin, etapes in [("fonctions.py", ETAPES_FONCTIONS), ("tests_perso.py", ETAPES_TESTS)]:
                attendu = variante(sources[chemin], etapes, niveau)
                if ast.dump(ast.parse(lire(reference, chemin))) != ast.dump(ast.parse(attendu)):
                    erreurs.append(f"{branche} : progression de {chemin} incorrecte")
            attendu_app = sources["app.py"] if niveau == 7 else app_sans_audio(sources["app.py"])
            attendu_sons = sources["sons.py"] if niveau == 7 else sons_sans_associations(sources["sons.py"])
            for chemin, attendu in [("app.py", attendu_app), ("sons.py", attendu_sons)]:
                if lire(reference, chemin).decode() != attendu:
                    erreurs.append(f"{branche} : {chemin} ne respecte pas le niveau audio attendu")
            chemins = git("ls-tree", "-r", "--name-only", reference).decode().splitlines()
            if any(p.lower().endswith((".wav", ".mp3", ".ogg", ".flac")) for p in chemins):
                erreurs.append(f"{branche} : les fichiers audio doivent être ajoutés par les apprenants depuis Discord")
        except (ValueError, KeyError, SyntaxError) as erreur:
            erreurs.append(f"{branche} : {erreur}")
    return erreurs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--remote", help="Références distantes déjà récupérées, par exemple origin")
    arguments = parser.parse_args()
    try:
        erreurs = verifier(arguments.remote)
    except (ValueError, SyntaxError, KeyError) as erreur:
        erreurs = [str(erreur)]
    for erreur in erreurs:
        print(f"ÉCHEC : {erreur}", file=sys.stderr)
    if erreurs:
        return 1
    print("OK : huit branches cohérentes, trois fiches manquantes et cinq erreurs conservées sur main.")
    print("OK : fonctions, dix tests et intégration audio progressent sans réponses anticipées.")
    print("OK : sept comparaisons GitHub limitées au travail de chaque étape, sans audio fourni.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
