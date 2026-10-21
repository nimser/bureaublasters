"""Recherche, compatibilités et préparation des commandes BureauBlasters."""


# Étape 2 : nettoyer une recherche et combiner des critères.
def rechercher_produits(catalogue, recherche):
    """Retourne les fiches dont le nom ou la description contient la recherche nettoyée."""
    recherche = recherche.strip().lower()
    resultat = []
    for produit in catalogue:
        if recherche in produit["nom"].lower() or recherche in produit["description"].lower():
            resultat.append(produit)
    return resultat


def selectionner_equipements(catalogue, prix_max, poids_max_g, longueur_max_cm):
    """Retourne les lanceurs et accessoires respectant les trois maxima inclusifs."""
    resultat = []
    for produit in catalogue:
        if (produit["categorie"] in ["lanceur", "accessoire"]
                and produit["prix_euros"] <= prix_max
                and produit["poids_g"] <= poids_max_g
                and produit["dimensions_cm"]["longueur"] <= longueur_max_cm):
            resultat.append(produit)
    return resultat


# Étape 3 : réunir les codes, filtrer les fiches et repérer une offre manquante.
def consommables_disponibles(catalogue):
    """Retourne les codes utilisés ou fournis, sans doublons ni mutation."""
    codes = set()
    for produit in catalogue:
        for code in produit["consommables_utilises"] + produit["consommables_fournis"]:
            codes.add(code)
    return codes


def filtrer_par_consommable(catalogue, code):
    """Retourne une nouvelle liste des utilisateurs et fournisseurs du code, dans l'ordre."""
    resultat = []
    for produit in catalogue:
        if code in produit["consommables_utilises"] or code in produit["consommables_fournis"]:
            resultat.append(produit)
    return resultat


def consommables_sans_offre(catalogue):
    """Retourne les codes utilisés par un produit mais fournis par aucune référence."""
    utilises = set()
    fournis = set()
    for produit in catalogue:
        for code in produit["consommables_utilises"]:
            utilises.add(code)
        for code in produit["consommables_fournis"]:
            fournis.add(code)
    return utilises - fournis


# Étape 4 : transformer chaque demande en une ligne de commande indépendante.
def trouver_produit(catalogue, identifiant):
    """Retourne la fiche d'identifiant exact, ou None si elle est absente."""
    for produit in catalogue:
        if produit["id"] == identifiant:
            return produit
    return None


def lire_demande(texte):
    """Retourne un dictionnaire id/quantite depuis une ligne « identifiant ; entier »."""
    champs = texte.split(";")
    return {"id": champs[0].strip().upper(), "quantite": int(champs[1].strip())}


def calculer_budget(produit, quantite):
    """Retourne le prix de quantite conditionnements, entière positive ou nulle, arrondi à deux décimales."""
    return round(produit["prix_euros"] * quantite, 2)


def preparer_ligne(produit, quantite):
    """Retourne une copie superficielle de la fiche avec quantite et sous_total_euros."""
    ligne = produit.copy()
    ligne["quantite"] = quantite
    ligne["sous_total_euros"] = calculer_budget(produit, quantite)
    return ligne


def preparer_commande(catalogue, demandes):
    """Retourne un dictionnaire lignes/inconnues en ignorant les demandes blanches."""
    lignes = []
    inconnues = []
    for texte in demandes:
        if texte.strip():
            demande = lire_demande(texte)
            produit = trouver_produit(catalogue, demande["id"])
            if produit is None:
                inconnues.append(demande["id"])
            else:
                lignes.append(preparer_ligne(produit, demande["quantite"]))
    return {"lignes": lignes, "inconnues": inconnues}


# Étape 5 : réutiliser les résultats et choisir les effets sur les données.
def calculer_total(lignes):
    """Retourne la somme des sous-totaux arrondie à deux décimales, ou zéro."""
    total = 0
    for ligne in lignes:
        total += ligne["sous_total_euros"]
    return round(total, 2)


def total_avec_livraison(lignes, frais_euros=6):
    """Ajoute les frais une seule fois si les lignes ne sont pas vides, sinon retourne zéro."""
    if not lignes:
        return 0
    return round(calculer_total(lignes) + frais_euros, 2)


def formater_devis(lignes, frais_euros=6):
    """Retourne le récapitulatif textuel avec deux décimales et un total livré."""
    messages = []
    for ligne in lignes:
        messages.append(
            f"{ligne['id']} | {ligne['quantite']} x {ligne['nom']} : {ligne['sous_total_euros']:.2f} €"
        )
    messages.append(f"Total livré : {total_avec_livraison(lignes, frais_euros):.2f} €")
    return "\n".join(messages)


def definir_favori(produit, favori):
    """Modifie uniquement favori dans le dictionnaire reçu et retourne None."""
    produit["favori"] = favori


# Bonus audio : retrouver les chemins associés à une référence.
def sons_pour_produit(identifiant, associations):
    """Retourne les chemins associés à l'identifiant, ou une liste vide."""
    return associations.get(identifiant, [])
