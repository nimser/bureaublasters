"""Fonctions du catalogue BureauBlasters."""


# Étape 2 : rassembler les codes utilisés et fournis dans un set.
def consommables_disponibles(catalogue):
    """Retourne les codes utilisés ou fournis, sans doublons ni mutation."""
    # À compléter : parcourir les deux listes de codes de chaque produit.
    raise NotImplementedError("consommables_disponibles est à compléter.")


# Étape 2 : sélectionner les produits qui utilisent ou fournissent le code.
def filtrer_par_consommable(catalogue, code):
    """Retourne une nouvelle liste des utilisateurs et fournisseurs du code, dans l'ordre."""
    # À compléter : tester les deux rôles et conserver l’ordre des produits.
    raise NotImplementedError("filtrer_par_consommable est à compléter.")


# Étape 3 : calculer le prix de la quantité de conditionnements demandée.
def calculer_budget(produit, quantite):
    """Retourne le prix de « quantite » conditionnements du produit.

    produit : dictionnaire produit.
    quantite : nombre entier positif ou nul de conditionnements.
    Retour : un nombre arrondi à deux décimales.
    """
    # À compléter : multiplier le prix par la quantité et arrondir à deux décimales.
    raise NotImplementedError("calculer_budget est à compléter.")


# Étape 4 : modifier le favori dans le dictionnaire reçu.
def definir_favori(produit, favori):
    """Modifie la valeur « favori » du produit reçu.

    produit : dictionnaire produit, modifié directement.
    favori : True ou False.
    Retour : None.
    """
    # À compléter : affecter le booléen à la clé favori du dictionnaire reçu.
    raise NotImplementedError("definir_favori est à compléter.")
