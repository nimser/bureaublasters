"""Bonus : tes tests du catalogue BureauBlasters.

Chaque fonction dont le nom commence par test_ est un test.
Lancement : python tests_catalogue.py perso
"""

from fonctions import (
    calculer_budget,
    consommables_disponibles,
    definir_favori,
    filtrer_par_consommable,
)


# Bonus : ajouter des tests test_... sur de petits catalogues indépendants.
def mini_catalogue():
    return [
        {"id": "L1", "categorie": "lanceur", "consommables_utilises": ["bille"],
         "consommables_fournis": [], "prix_euros": 20, "favori": False},
        {"id": "A1", "categorie": "accessoire", "consommables_utilises": ["brume"],
         "consommables_fournis": [], "prix_euros": 15, "favori": False},
        {"id": "M1", "categorie": "munition", "consommables_utilises": [],
         "consommables_fournis": ["bille"], "prix_euros": 5, "favori": False},
        {"id": "R1", "categorie": "recharge", "consommables_utilises": [],
         "consommables_fournis": ["brume"], "prix_euros": 3, "favori": False},
    ]


def test_codes_doublons_entre_produits():
    codes = consommables_disponibles(mini_catalogue())
    assert codes == {"bille", "brume"}, f"Obtenu : {codes!r}"


def test_codes_catalogue_vide():
    codes = consommables_disponibles([])
    assert codes == set(), f"Obtenu : {codes!r}"


def test_filtre_accessoire_et_recharge():
    identifiants = [produit["id"] for produit in filtrer_par_consommable(mini_catalogue(), "brume")]
    assert identifiants == ["A1", "R1"], f"Obtenu : {identifiants}"


def test_filtre_donnees_inchangees():
    catalogue = mini_catalogue()
    filtrer_par_consommable(catalogue, "bille")
    assert catalogue == mini_catalogue(), "Le filtre a modifié le catalogue reçu"


def test_filtre_renvoie_les_produits_du_catalogue():
    catalogue = mini_catalogue()
    resultat = filtrer_par_consommable(catalogue, "brume")
    assert resultat is not catalogue, "Le filtre doit construire une nouvelle liste"
    assert resultat[0] is catalogue[1], "Le filtre doit conserver les dictionnaires du catalogue"


def test_budget_lot():
    montant = calculer_budget({"prix_euros": 59.9}, 2)
    assert montant == 119.8, f"Obtenu : {montant!r}"


def test_budget_produit_inchange():
    produit = {"id": "M1", "prix_euros": 5, "favori": False}
    avant = {"id": "M1", "prix_euros": 5, "favori": False}
    calculer_budget(produit, 3)
    assert produit == avant, f"Produit modifié : {produit}"


def test_favori_autres_champs_inchanges():
    produit = {"id": "L1", "categorie": "lanceur", "prix_euros": 20, "favori": False}
    definir_favori(produit, True)
    assert produit == {"id": "L1", "categorie": "lanceur", "prix_euros": 20, "favori": True}, f"Obtenu : {produit}"
    definir_favori(produit, False)
    assert produit["favori"] is False, f"Après désactivation : {produit['favori']!r}"
