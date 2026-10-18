"""Fonctions du catalogue BureauBlasters."""


def consommables_disponibles(catalogue):
    """Retourne l'ensemble des codes de consommables présents dans le catalogue.

    catalogue : liste de dictionnaires produits.
    Retour : un set de chaînes, sans doublons.
    """
    raise NotImplementedError("consommables_disponibles est à compléter.")


def filtrer_par_consommable(catalogue, code):
    """Retourne les produits dont la liste « consommables » contient le code.

    catalogue : liste de dictionnaires produits.
    code : code de consommable recherché, par exemple "flechette-mousse".
    Retour : une nouvelle liste, dans l'ordre du catalogue.
    """
    raise NotImplementedError("filtrer_par_consommable est à compléter.")


def calculer_budget(produit, quantite):
    """Retourne le prix de « quantite » conditionnements du produit.

    produit : dictionnaire produit.
    quantite : nombre entier de conditionnements.
    Retour : un nombre arrondi à deux décimales.
    Lève ValueError si la quantité est négative.
    """
    raise NotImplementedError("calculer_budget est à compléter.")


def definir_favori(produit, favori):
    """Modifie la valeur « favori » du produit reçu.

    produit : dictionnaire produit, modifié directement.
    favori : True ou False.
    Retour : None.
    """
    raise NotImplementedError("definir_favori est à compléter.")
