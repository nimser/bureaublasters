"""Fonctions du catalogue BureauBlasters."""


def consommables_disponibles(catalogue):
    """Retourne l'ensemble des codes de consommables présents dans le catalogue.

    catalogue : liste de dictionnaires produits.
    Retour : un set de chaînes, sans doublons.
    """
    codes = set()
    for produit in catalogue:
        for code in produit["consommables"]:
            codes.add(code)
    return codes


def filtrer_par_consommable(catalogue, code):
    """Retourne les produits dont la liste « consommables » contient le code.

    catalogue : liste de dictionnaires produits.
    code : code de consommable recherché, par exemple "flechette-mousse".
    Retour : une nouvelle liste, dans l'ordre du catalogue.
    """
    compatibles = []
    for produit in catalogue:
        if code in produit["consommables"]:
            compatibles.append(produit)
    return compatibles


def calculer_budget(produit, quantite):
    """Retourne le prix de « quantite » conditionnements du produit.

    produit : dictionnaire produit.
    quantite : nombre entier de conditionnements.
    Retour : un nombre arrondi à deux décimales.
    Lève ValueError si la quantité est négative.
    """
    if quantite < 0:
        raise ValueError(f"La quantité doit être positive ou nulle, reçu : {quantite}.")
    return round(produit["prix_euros"] * quantite, 2)


def definir_favori(produit, favori):
    """Modifie la valeur « favori » du produit reçu.

    produit : dictionnaire produit, modifié directement.
    favori : True ou False.
    Retour : None.
    """
    raise NotImplementedError("definir_favori est à compléter.")
