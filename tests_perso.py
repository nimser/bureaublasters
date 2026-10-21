"""Tes tests obligatoires : python tests_catalogue.py perso."""

from fonctions import (
    calculer_total,
    consommables_sans_offre,
    definir_favori,
    formater_devis,
    lire_demande,
    preparer_commande,
    preparer_ligne,
    rechercher_produits,
    selectionner_equipements,
    total_avec_livraison,
)


def catalogue_essai():
    return [
        {"id": "L1", "nom": "Lanceur", "description": "Propulse une bille.",
         "categorie": "lanceur", "prix_euros": 20, "poids_g": 800,
         "dimensions_cm": {"longueur": 50}, "favori": False,
         "consommables_utilises": ["bille"], "consommables_fournis": []},
        {"id": "A1", "nom": "Brume", "description": "Un accessoire de poche.",
         "categorie": "accessoire", "prix_euros": 15, "poids_g": 801,
         "dimensions_cm": {"longueur": 10}, "favori": False,
         "consommables_utilises": ["liquide"], "consommables_fournis": []},
        {"id": "M1", "nom": "Billes", "description": "Pour le lanceur.",
         "categorie": "munition", "prix_euros": 5, "poids_g": 100,
         "dimensions_cm": {"longueur": 10}, "favori": False,
         "consommables_utilises": [], "consommables_fournis": ["bille"]},
    ]


# Étape 2 : comparer les références et vérifier une frontière.
def test_recherche_normalisee():
    """Avec catalogue_essai(), «  LANCEUR  » et « lanceur » doivent retrouver L1 et M1."""
    catalogue = catalogue_essai()
    resultat = rechercher_produits(catalogue, "  LANCEUR  ")
    identifiants = []
    for produit in resultat:
        identifiants.append(produit["id"])
    assert identifiants == ["L1", "M1"], f"Obtenu : {identifiants}"
    assert resultat == rechercher_produits(catalogue, "lanceur")


def test_selection_seuil_inclus():
    """Avec les maxima 20 €, 800 g et 50 cm, seule L1 convient ; A1 dépasse le poids."""
    resultat = selectionner_equipements(catalogue_essai(), 20, 800, 50)
    assert resultat == [catalogue_essai()[0]], f"Obtenu : {resultat}"
    assert selectionner_equipements(catalogue_essai(), 20, 799, 50) == []


# Étape 3 : comparer les besoins aux références fournies.
def test_consommable_sans_fournisseur():
    """catalogue_essai() utilise « liquide » sans fournisseur ; seul ce code est attendu."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_consommable_sans_fournisseur est à compléter.")


# Étape 4 : contrôler la conversion et la copie d'une fiche.
def test_lecture_demande():
    """« l1 ; 2 » doit donner {"id": "L1", "quantite": 2}, avec une quantité entière."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_lecture_demande est à compléter.")


def test_ligne_independante():
    """Deux L1 coûtent 40 € ; la ligne est un autre dictionnaire et la fiche reste inchangée."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_ligne_independante est à compléter.")


# Étape 5 : vérifier les cumuls, le paramètre par défaut et la mutation choisie.
def test_total_cumule():
    """Deux lignes de sous-totaux 40 € et 15 € donnent 55 €, sans modifier les lignes."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_total_cumule est à compléter.")


def test_commande_vide_sans_frais():
    """Une commande vide donne zéro, même avec 10 € de frais demandés."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_commande_vide_sans_frais est à compléter.")


def test_favori_autres_champs():
    """Active puis désactive le favori de L1 ; les autres champs restent inchangés, retour None."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_favori_autres_champs est à compléter.")


def test_frais_parametres():
    """Deux lignes totalisant 55 € donnent 61 € par défaut, 55 € avec zéro et 65 € avec dix."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_frais_parametres est à compléter.")


# Étape 6 : vérifier plusieurs fonctions dans un même parcours.
def test_parcours_complet():
    """Deux L1, une référence absente et trois M1 donnent 55 € avant frais et 61 € livrés."""
    # À compléter : suis le contrat et les vérifications de cette étape dans le README.
    raise NotImplementedError("test_parcours_complet est à compléter.")
