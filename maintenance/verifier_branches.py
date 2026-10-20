"""Vérifie les références Git de l'atelier sans modifier les branches."""

import argparse
import ast
import copy
import subprocess
import sys

BRANCHES = [
    "main",
    "reprise/02-filtres",
    "reprise/03-budget",
    "reprise/04-favoris",
    "reprise/05-tests",
    "correction",
]
FONCTIONS = [
    "consommables_disponibles",
    "filtrer_par_consommable",
    "calculer_budget",
    "definir_favori",
]
A_COMPLETER = [4, 4, 2, 1, 0, 0]
COMMUNS = {
    "README.md",
    "catalogue_source.txt",
    "tests_catalogue.py",
    "app.py",
    "apercu_terminal.py",
    ".github/pull_request_template.md",
}


def git(*arguments):
    resultat = subprocess.run(["git", *arguments], capture_output=True, check=False)
    if resultat.returncode:
        raise ValueError(resultat.stderr.decode().strip())
    return resultat.stdout


def fichiers_communs(reference):
    chemins = git("ls-tree", "-r", "--name-only", reference).decode().splitlines()
    return COMMUNS | {
        chemin for chemin in chemins
        if chemin.startswith(("images/prompts/", "maintenance/"))
        or (chemin.startswith("images/") and chemin.count("/") == 1 and chemin.endswith(".jpg"))
    }


def lire(reference, chemin):
    return git("show", f"{reference}:{chemin}")


def catalogue(reference):
    arbre = ast.parse(lire(reference, "catalogue.py"))
    for noeud in arbre.body:
        if isinstance(noeud, ast.Assign) and any(
            isinstance(cible, ast.Name) and cible.id == "CATALOGUE" for cible in noeud.targets
        ):
            return ast.literal_eval(noeud.value)
    raise ValueError(f"{reference} : liste CATALOGUE absente")


def fonctions(reference):
    arbre = ast.parse(lire(reference, "fonctions.py"))
    return {noeud.name: noeud for noeud in arbre.body if isinstance(noeud, ast.FunctionDef)}


def est_a_completer(fonction):
    return any(
        isinstance(noeud, ast.Raise) and isinstance(noeud.exc, ast.Call)
        and isinstance(noeud.exc.func, ast.Name) and noeud.exc.func.id == "NotImplementedError"
        for noeud in ast.walk(fonction)
    )


def catalogue_depart(corrige):
    produits = copy.deepcopy([p for p in corrige if p["id"] not in {"BB-02", "BB-04", "RE-08"}])
    index = {p["id"]: p for p in produits}
    index["BB-01"]["prix_euros"] = "39,50"
    index["BB-07"]["dimensions_cm"]["longueur"] = 480
    index["RE-02"]["consommables"][0] = "requin_mousse"
    index["RE-03"]["favori"] = "False"
    index["RE-06"]["prix_euros"] = 890
    return produits


def verifier(remote):
    prefixe = f"refs/remotes/{remote}" if remote else "refs/heads"
    references = {branche: f"{prefixe}/{branche}" for branche in BRANCHES}
    correction = references["correction"]
    communs = fichiers_communs(correction)
    contenus = {chemin: lire(correction, chemin) for chemin in communs}
    corrige = catalogue(correction)
    fonctions_corrigees = fonctions(correction)
    identifiants = [f"BB-0{n}" for n in range(1, 9)] + [f"RE-0{n}" for n in range(1, 9)]
    if [p["id"] for p in corrige] != identifiants:
        raise ValueError("correction : les seize références doivent être présentes dans l’ordre")
    if set(fonctions_corrigees) != set(FONCTIONS) or any(
        est_a_completer(fonction) for fonction in fonctions_corrigees.values()
    ):
        raise ValueError("correction : les quatre fonctions doivent être implémentées")
    erreurs = []
    for branche, nombre in zip(BRANCHES, A_COMPLETER):
        reference = references[branche]
        try:
            if fichiers_communs(reference) != communs:
                erreurs.append(f"{branche} : liste des fichiers communs différente")
            for chemin, contenu in contenus.items():
                if lire(reference, chemin) != contenu:
                    erreurs.append(f"{branche} : {chemin} diffère de correction")
            attendu = catalogue_depart(corrige) if branche == "main" else corrige
            if catalogue(reference) != attendu:
                erreurs.append(f"{branche} : catalogue différent du niveau pédagogique attendu")
            definitions = fonctions(reference)
            if set(definitions) != set(FONCTIONS):
                erreurs.append(f"{branche} : signatures des quatre fonctions attendues absentes")
            for position, nom in enumerate(FONCTIONS):
                fonction = definitions[nom]
                if ast.dump(fonction.args) != ast.dump(fonctions_corrigees[nom].args):
                    erreurs.append(f"{branche} : paramètres de {nom} différents")
                if position >= len(FONCTIONS) - nombre:
                    if not est_a_completer(fonction):
                        erreurs.append(f"{branche} : {nom} doit rester à compléter")
                elif ast.dump(fonction) != ast.dump(fonctions_corrigees[nom]):
                    erreurs.append(f"{branche} : {nom} doit être fourni et corrigé")
            if branche != "correction":
                arbre = ast.parse(lire(reference, "tests_perso.py"))
                if any(isinstance(n, ast.FunctionDef) and n.name.startswith("test_") for n in arbre.body):
                    erreurs.append(f"{branche} : les tests personnels doivent rester à écrire")
        except (ValueError, KeyError, SyntaxError) as erreur:
            erreurs.append(f"{branche} : {erreur}")
    return erreurs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--remote", help="Vérifie les références distantes déjà récupérées, par exemple origin")
    arguments = parser.parse_args()
    try:
        erreurs = verifier(arguments.remote)
    except (ValueError, SyntaxError) as erreur:
        erreurs = [str(erreur)]
    for erreur in erreurs:
        print(f"ÉCHEC : {erreur}", file=sys.stderr)
    if erreurs:
        return 1
    print("OK : six branches cohérentes, cinq erreurs et trois fiches manquantes conservées sur main.")
    print("OK : progression des fonctions et tests personnels à écrire préservés sur les reprises.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
