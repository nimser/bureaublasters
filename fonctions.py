"""Fonctions du catalogue BureauBlasters."""


# Étape 2 : rassembler les codes utilisés et fournis dans un set.
def consommables_disponibles(catalogue):
    """Retourne les codes utilisés ou fournis, sans doublons ni mutation."""
    codes = set()
    for produit in catalogue:
        for code in produit["consommables_utilises"] + produit["consommables_fournis"]:
            codes.add(code)
    return codes


# Étape 2 : sélectionner les produits qui utilisent ou fournissent le code.
def filtrer_par_consommable(catalogue, code):
    """Retourne une nouvelle liste des utilisateurs et fournisseurs du code, dans l'ordre."""
    compatibles = []
    for produit in catalogue:
        if code in produit["consommables_utilises"] or code in produit["consommables_fournis"]:
            compatibles.append(produit)
    return compatibles


# Étape 3 : calculer le prix de la quantité de conditionnements demandée.
def calculer_budget(produit, quantite):
    """Retourne le prix de « quantite » conditionnements du produit.

    produit : dictionnaire produit.
    quantite : nombre entier positif ou nul de conditionnements.
    Retour : un nombre arrondi à deux décimales.
    """
    return round(produit["prix_euros"] * quantite, 2)


# Étape 4 : modifier le favori dans le dictionnaire reçu.
def definir_favori(produit, favori):
    """Modifie la valeur « favori » du produit reçu.

    produit : dictionnaire produit, modifié directement.
    favori : True ou False.
    Retour : None.
    """
    # À compléter : affecter le booléen à la clé favori du dictionnaire reçu.
    raise NotImplementedError("definir_favori est à compléter.")
