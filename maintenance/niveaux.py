"""Contrats des points de reprise et fabrication de leurs variantes pédagogiques."""

import ast

BRANCHES = [
    "main", "etape/02-recherche", "etape/03-compatibilites", "etape/04-commande",
    "etape/05-devis", "etape/06-tests", "etape/07-audio", "correction",
]
ETAPES_FONCTIONS = {
    2: ["rechercher_produits", "selectionner_equipements"],
    3: ["consommables_disponibles", "filtrer_par_consommable", "consommables_sans_offre"],
    4: ["trouver_produit", "lire_demande", "calculer_budget", "preparer_ligne", "preparer_commande"],
    5: ["calculer_total", "total_avec_livraison", "formater_devis", "definir_favori"],
    7: ["sons_pour_produit"],
}
ETAPES_TESTS = {
    2: ["test_recherche_normalisee", "test_selection_seuil_inclus"],
    3: ["test_consommable_sans_fournisseur"],
    4: ["test_lecture_demande", "test_ligne_independante"],
    5: ["test_total_cumule", "test_commande_vide_sans_frais", "test_favori_autres_champs", "test_frais_parametres"],
    6: ["test_parcours_complet"],
}
FONCTIONS = [nom for noms in ETAPES_FONCTIONS.values() for nom in noms]
TESTS = [nom for noms in ETAPES_TESTS.values() for nom in noms]
VARIANTES = {"catalogue.py", "fonctions.py", "tests_perso.py", "sons.py", "app.py"}
TRANSITIONS = [
    {"catalogue.py"},
    {"fonctions.py", "tests_perso.py"},
    {"fonctions.py", "tests_perso.py"},
    {"fonctions.py", "tests_perso.py"},
    {"fonctions.py", "tests_perso.py"},
    {"tests_perso.py"},
    {"app.py", "fonctions.py", "sons.py"},
]


def definitions(source):
    return {n.name: n for n in ast.parse(source).body if isinstance(n, ast.FunctionDef)}


def a_completer(fonction):
    return any(
        isinstance(n, ast.Raise) and isinstance(n.exc, ast.Call)
        and isinstance(n.exc.func, ast.Name) and n.exc.func.id == "NotImplementedError"
        for n in ast.walk(fonction)
    )


def variante(source, etapes, niveau):
    lignes = source.splitlines(keepends=True)
    fonctions = definitions(source)
    remplacements = []
    for etape, noms in etapes.items():
        if etape <= niveau:
            continue
        for nom in noms:
            fonction = fonctions[nom]
            premiere = fonction.body[0]
            debut = premiere.end_lineno if isinstance(premiere, ast.Expr) and isinstance(premiere.value, ast.Constant) else fonction.lineno
            corps = []
            if nom == "test_recherche_normalisee":
                corps = [
                    '    catalogue = catalogue_essai()\n',
                    '    resultat = rechercher_produits(catalogue, "  LANCEUR  ")\n',
                    '    identifiants = []\n',
                    '    for produit in resultat:\n',
                    '        identifiants.append(produit["id"])\n',
                    '    # À compléter : compare les identifiants et le résultat de la recherche normalisée.\n',
                ]
            else:
                corps = ['    # À compléter : suis le contrat et les vérifications de cette étape dans le README.\n']
            corps.append(f'    raise NotImplementedError("{nom} est à compléter.")\n')
            remplacements.append((debut, fonction.end_lineno, corps))
    for debut, fin, corps in sorted(remplacements, reverse=True):
        lignes[debut:fin] = corps
    return "".join(lignes)


def app_sans_audio(source):
    lignes = source.splitlines(keepends=True)
    retraits = []
    for noeud in ast.walk(ast.parse(source)):
        if isinstance(noeud, ast.ImportFrom) and (
            noeud.module == "sons" or any(alias.name == "sons_pour_produit" for alias in noeud.names)
        ):
            retraits.append((noeud.lineno - 1, noeud.end_lineno))
        if isinstance(noeud, ast.For) and isinstance(noeud.iter, ast.Call) and isinstance(noeud.iter.func, ast.Name):
            if noeud.iter.func.id == "sons_pour_produit":
                retraits.append((noeud.lineno - 1, noeud.end_lineno))
    for debut, fin in sorted(retraits, reverse=True):
        del lignes[debut:fin]
    return "".join(lignes)


def sons_sans_associations(source):
    arbre = ast.parse(source)
    affectation = next(n for n in arbre.body if isinstance(n, ast.Assign))
    lignes = source.splitlines(keepends=True)
    lignes[affectation.lineno - 1:affectation.end_lineno] = ["SONS_PRODUITS = {\n    # À compléter : ajoute les associations du tableau du bonus audio.\n}\n"]
    return "".join(lignes)
