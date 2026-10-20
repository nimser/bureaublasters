"""Vérifications du catalogue BureauBlasters.

Lance tous les groupes : python tests_catalogue.py
Lance un groupe : python tests_catalogue.py donnees
Le groupe perso lance les tests de tests_perso.py.
"""

import importlib
import sys
import traceback
from pathlib import Path

from catalogue import CATALOGUE
from fonctions import (
    calculer_budget,
    consommables_disponibles,
    definir_favori,
    filtrer_par_consommable,
)

GROUPES = ["donnees", "filtres", "budget", "favoris", "perso"]

CLES = {
    "id", "nom", "categorie", "description", "prix_euros", "conditionnement",
    "consommables", "portee_m", "cadence_tirs_min", "poids_g", "dimensions_cm",
    "indice_protection", "effets", "image", "favori",
}
EQUIPEMENTS = {"lanceur", "accessoire"}
CONSOMMABLES = {"munition", "recharge"}
COLIS_MAX_CM = {"longueur": 150, "largeur": 60, "hauteur": 60}
ORDRE_ATTENDU = [f"BB-0{n}" for n in range(1, 9)] + [f"RE-0{n}" for n in range(1, 9)]


def est_nombre(valeur):
    return isinstance(valeur, (int, float)) and not isinstance(valeur, bool)


def decrire(valeur):
    return f"{valeur!r} ({type(valeur).__name__})"


# Données du catalogue


def test_donnees_identifiants():
    identifiants = [produit.get("id") for produit in CATALOGUE]
    assert identifiants == ORDRE_ATTENDU, f"Identifiants obtenus : {identifiants}"


def test_donnees_cles():
    for produit in CATALOGUE:
        manquantes = CLES - produit.keys()
        en_trop = produit.keys() - CLES
        assert not manquantes and not en_trop, (
            f"{produit.get('id')} : clés manquantes {manquantes or 'aucune'}, en trop {en_trop or 'aucune'}"
        )


def test_donnees_textes():
    for produit in CATALOGUE:
        for cle in ["id", "nom", "categorie", "description", "conditionnement", "image"]:
            assert isinstance(produit[cle], str), f"{produit['id']} : {cle} vaut {decrire(produit[cle])}, texte attendu"
        assert produit["categorie"] in EQUIPEMENTS | CONSOMMABLES, (
            f"{produit['id']} : catégorie inconnue {produit['categorie']!r}"
        )


def test_donnees_prix():
    for produit in CATALOGUE:
        prix = produit["prix_euros"]
        assert est_nombre(prix) and prix > 0, f"{produit['id']} : prix_euros vaut {decrire(prix)}, nombre positif attendu"


def test_donnees_mesures():
    for produit in CATALOGUE:
        for cle in ["portee_m", "cadence_tirs_min"]:
            valeur = produit[cle]
            assert valeur is None or isinstance(valeur, int), (
                f"{produit['id']} : {cle} vaut {decrire(valeur)}, entier ou None attendu"
            )
        assert isinstance(produit["poids_g"], int) and produit["poids_g"] > 0, (
            f"{produit['id']} : poids_g vaut {decrire(produit['poids_g'])}, entier positif attendu"
        )
        dimensions = produit["dimensions_cm"]
        assert set(dimensions) == set(COLIS_MAX_CM), f"{produit['id']} : clés de dimensions_cm {set(dimensions)}"
        for cle, valeur in dimensions.items():
            assert est_nombre(valeur) and valeur > 0, f"{produit['id']} : {cle} vaut {decrire(valeur)}"


def test_donnees_colis():
    for produit in CATALOGUE:
        for cle, maximum in COLIS_MAX_CM.items():
            valeur = produit["dimensions_cm"][cle]
            assert valeur <= maximum, f"{produit['id']} : {cle} de {valeur} cm, colis limité à {maximum} cm"


def test_donnees_listes():
    for produit in CATALOGUE:
        for cle in ["consommables", "effets"]:
            valeurs = produit[cle]
            assert isinstance(valeurs, list), f"{produit['id']} : {cle} vaut {decrire(valeurs)}, liste attendue"
            for valeur in valeurs:
                assert isinstance(valeur, str), f"{produit['id']} : {cle} contient {decrire(valeur)}"
        assert produit["consommables"], f"{produit['id']} : la liste des consommables est vide"
        protection = produit["indice_protection"]
        assert protection is None or isinstance(protection, str), (
            f"{produit['id']} : indice_protection vaut {decrire(protection)}"
        )


def test_donnees_favoris():
    for produit in CATALOGUE:
        favori = produit["favori"]
        assert isinstance(favori, bool), f"{produit['id']} : favori vaut {decrire(favori)}, booléen attendu"


def test_donnees_compatibilites():
    for produit in CATALOGUE:
        for code in produit["consommables"]:
            partenaires = [
                autre["id"] for autre in CATALOGUE
                if autre["id"] != produit["id"] and code in autre["consommables"]
            ]
            assert partenaires, f"{produit['id']} : aucun autre produit associé au code {code!r}"


def test_donnees_brume():
    brumes = [produit for produit in CATALOGUE if produit["id"] == "BB-04"]
    assert brumes, "BB-04 est absent du catalogue"
    assert brumes[0]["nom"] == "Fumigène à ultrason", f"BB-04 : nom obtenu {brumes[0]['nom']!r}"
    assert brumes[0]["indice_protection"] == "IP68", f"BB-04 : indice_protection vaut {brumes[0]['indice_protection']!r}"
    assert brumes[0]["dimensions_cm"] == {"longueur": 4, "largeur": 4, "hauteur": 6}, (
        f"BB-04 : dimensions obtenues {brumes[0]['dimensions_cm']}"
    )


def test_donnees_mini_requins_rechargeables():
    produits = {produit["id"]: produit for produit in CATALOGUE}
    assert produits["RE-02"]["categorie"] == "munition", "RE-02 : catégorie munition attendue"
    assert produits["RE-02"]["consommables"] == ["requin-mousse", "brume-neutre", "brume-girofle-agrumes"], (
        f"RE-02 : codes obtenus {produits['RE-02']['consommables']}"
    )
    assert produits["BB-02"]["consommables"] == ["requin-mousse"], "Le lanceur ne reçoit pas de liquide"


def test_donnees_recharges_liquides():
    produits = {produit["id"]: produit for produit in CATALOGUE}
    for identifiant, code in [("RE-07", "brume-neutre"), ("RE-08", "brume-girofle-agrumes")]:
        produit = produits[identifiant]
        assert produit["categorie"] == "recharge", f"{identifiant} : catégorie recharge attendue"
        assert produit["conditionnement"] == "1 bouteille de 100 ml", f"{identifiant} : bouteille attendue"
        assert produit["consommables"] == [code], f"{identifiant} : code de liquide incorrect"
        associes = [produit["id"] for produit in CATALOGUE if code in produit["consommables"]]
        assert associes == ["BB-04", "RE-02", identifiant], f"{code} : références obtenues {associes}"


def test_donnees_fiches_synchronisees():
    source = Path(__file__).with_name("catalogue_source.txt").read_text(encoding="utf-8")
    fiches = {}
    for bloc in source.split("Identifiant : ")[1:]:
        identifiant, *lignes = bloc.splitlines()
        fiches[identifiant] = dict(ligne.split(" : ", 1) for ligne in lignes if " : " in ligne)
    for produit in CATALOGUE:
        fiche = fiches[produit["id"]]
        for cle, libelle in [("nom", "Nom"), ("description", "Description"), ("conditionnement", "Conditionnement")]:
            assert produit[cle] == fiche[libelle], f"{produit['id']} : {cle} diffère de la fiche source"
        codes = fiche["Codes de consommables"].split(" ; ")
        assert produit["consommables"] == codes, f"{produit['id']} : codes différents de la fiche source"
        effets = [] if fiche["Effets"] == "aucun" else fiche["Effets"].split(" ; ")
        assert produit["effets"] == effets, (
            f"{produit['id']} : effets différents de la fiche source"
        )


# Petits catalogues indépendants des données réelles


def petit_catalogue():
    return [
        {"id": "L1", "categorie": "lanceur", "consommables": ["bille"], "prix_euros": 20, "favori": False},
        {"id": "L2", "categorie": "lanceur", "consommables": ["disque"], "prix_euros": 30, "favori": False},
        {"id": "M1", "categorie": "munition", "consommables": ["bille"], "prix_euros": 5, "favori": False},
        {"id": "M2", "categorie": "munition", "consommables": ["disque", "bille"], "prix_euros": 8, "favori": False},
    ]


def test_filtres_codes_sans_doublons():
    codes = consommables_disponibles(petit_catalogue())
    assert codes == {"bille", "disque"}, f"Obtenu : {codes!r}"


def test_filtres_toutes_categories_dans_l_ordre():
    resultat = filtrer_par_consommable(petit_catalogue(), "bille")
    identifiants = [produit["id"] for produit in resultat]
    assert identifiants == ["L1", "M1", "M2"], f"Obtenu : {identifiants}"


def test_filtres_code_inconnu():
    resultat = filtrer_par_consommable(petit_catalogue(), "croissant")
    assert resultat == [], f"Obtenu : {resultat!r}"


def petit_catalogue_liquides():
    return [
        {"id": "L1", "categorie": "lanceur", "consommables": ["projectile"]},
        {"id": "A1", "categorie": "accessoire", "consommables": ["liquide-a", "liquide-b"]},
        {"id": "M1", "categorie": "munition", "consommables": ["projectile", "liquide-a", "liquide-b"]},
        {"id": "R1", "categorie": "recharge", "consommables": ["liquide-a"]},
        {"id": "R2", "categorie": "recharge", "consommables": ["liquide-b"]},
    ]


def test_filtres_codes_produit_multicode():
    codes = consommables_disponibles(petit_catalogue_liquides())
    assert codes == {"projectile", "liquide-a", "liquide-b"}, f"Obtenu : {codes!r}"


def test_filtres_liquides_sans_association_indirecte():
    catalogue = petit_catalogue_liquides()
    for code, recharge in [("liquide-a", "R1"), ("liquide-b", "R2")]:
        resultat = filtrer_par_consommable(catalogue, code)
        identifiants = [produit["id"] for produit in resultat]
        assert identifiants == ["A1", "M1", recharge], f"{code} : obtenu {identifiants}"


def test_filtres_catalogue_vide():
    assert consommables_disponibles([]) == set(), "Un catalogue vide ne contient aucun code"
    assert filtrer_par_consommable([], "liquide-a") == [], "Un catalogue vide ne contient aucun produit"


def test_filtres_codes_sans_mutation():
    catalogue = petit_catalogue_liquides()
    consommables_disponibles(catalogue)
    assert catalogue == petit_catalogue_liquides(), "La collecte des codes a modifié le catalogue"


def test_filtres_liste_nouvelle_produits_identiques():
    catalogue = petit_catalogue_liquides()
    resultat = filtrer_par_consommable(catalogue, "liquide-a")
    assert catalogue == petit_catalogue_liquides(), "Le filtre a modifié le catalogue"
    assert resultat is not catalogue, "Le filtre doit construire une nouvelle liste"
    assert len(resultat) == 3, f"Trois produits attendus, obtenu : {len(resultat)}"
    for produit, position in zip(resultat, [1, 2, 3]):
        assert produit is catalogue[position], "Le filtre ne doit pas copier les dictionnaires"


def test_budget_plusieurs_conditionnements():
    montant = calculer_budget({"prix_euros": 39.5}, 2)
    assert montant == 79, f"Obtenu : {montant!r}"


def test_budget_arrondi():
    montant = calculer_budget({"prix_euros": 6.9}, 3)
    assert montant == 20.7, f"Obtenu : {montant!r}"


def test_budget_quantite_nulle():
    montant = calculer_budget({"prix_euros": 489.0}, 0)
    assert montant == 0, f"Obtenu : {montant!r}"


def test_budget_quantite_negative():
    try:
        calculer_budget({"prix_euros": 10}, -1)
    except ValueError:
        return
    assert False, "calculer_budget(produit, -1) aurait dû lever ValueError"


def test_favoris_activer_puis_desactiver():
    produit = {"id": "L1", "favori": False}
    resultat = definir_favori(produit, True)
    assert produit["favori"] is True, f"Après activation : {produit['favori']!r}"
    assert resultat is None, f"definir_favori a retourné {resultat!r}"
    definir_favori(produit, False)
    assert produit["favori"] is False, f"Après désactivation : {produit['favori']!r}"


# Lancement des tests


def tests_du_groupe(groupe):
    if groupe != "perso":
        return [fonction for nom, fonction in globals().items() if nom.startswith(f"test_{groupe}_")]
    module = importlib.import_module("tests_perso")
    return [fonction for nom, fonction in vars(module).items() if nom.startswith("test_") and callable(fonction)]


def lancer(groupe):
    print(f"\n== {groupe} ==")
    try:
        tests = tests_du_groupe(groupe)
    except Exception as erreur:
        print(f"  ERREUR       import de tests_perso.py : {type(erreur).__name__}: {erreur}")
        if isinstance(erreur, SyntaxError):
            print(f"               ligne {erreur.lineno} : {(erreur.text or '').strip()}")
        else:
            cadre = traceback.extract_tb(erreur.__traceback__)[-1]
            print(f"               {cadre.filename.split('/')[-1]}, ligne {cadre.lineno} : {cadre.line}")
        return {"ok": 0, "echec": 1, "a_completer": 0}
    if not tests:
        print("  Aucun test pour le moment.")
    bilan = {"ok": 0, "echec": 0, "a_completer": 0}
    for test in tests:
        try:
            test()
        except NotImplementedError as erreur:
            bilan["a_completer"] += 1
            print(f"  À COMPLÉTER  {test.__name__} : {erreur}")
        except AssertionError as erreur:
            bilan["echec"] += 1
            print(f"  ÉCHEC        {test.__name__}")
            print(f"               {erreur}")
            cadres = traceback.extract_tb(erreur.__traceback__)
            ligne = [cadre for cadre in cadres if cadre.filename == test.__code__.co_filename][-1]
            print(f"               ligne {ligne.lineno} : {ligne.line}")
        except Exception as erreur:
            bilan["echec"] += 1
            cadre = traceback.extract_tb(erreur.__traceback__)[-1]
            print(f"  ERREUR       {test.__name__} : {type(erreur).__name__}: {erreur}")
            print(f"               {cadre.filename.split('/')[-1]}, ligne {cadre.lineno} : {cadre.line}")
        else:
            bilan["ok"] += 1
            print(f"  OK           {test.__name__}")
    return bilan


def main(arguments):
    inconnus = [groupe for groupe in arguments if groupe not in GROUPES]
    if inconnus:
        print(f"Groupe inconnu : {', '.join(inconnus)}. Groupes disponibles : {', '.join(GROUPES)}.")
        return 2
    total = {"ok": 0, "echec": 0, "a_completer": 0}
    for groupe in arguments or GROUPES:
        for cle, valeur in lancer(groupe).items():
            total[cle] += valeur
    print(f"\nBilan : {total['ok']} OK, {total['echec']} en échec, {total['a_completer']} à compléter.")
    return 1 if total["echec"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
