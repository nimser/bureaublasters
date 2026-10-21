"""Aperçu sans Streamlit : python apercu_terminal.py."""

from catalogue import CATALOGUE
from demandes import DEMANDES
from fonctions import (
    consommables_disponibles,
    consommables_sans_offre,
    definir_favori,
    filtrer_par_consommable,
    formater_devis,
    preparer_commande,
    rechercher_produits,
    selectionner_equipements,
)


def essayer(titre, action):
    print(f"\n== {titre} ==")
    try:
        action()
    except NotImplementedError as erreur:
        print(f"À compléter : {erreur}")
    except (TypeError, KeyError) as erreur:
        print(f"Vérifie les données et le retour de tes fonctions : {erreur}")


def lister_produits():
    for produit in CATALOGUE:
        print(f"{produit['id']:6} {produit['nom']:28} {produit['prix_euros']!r:>8} €  {produit['conditionnement']}")


def rechercher():
    print([p["id"] for p in rechercher_produits(CATALOGUE, "  REQUIN  ")])
    print([p["id"] for p in selectionner_equipements(CATALOGUE, 60, 800, 50)])


def compatibilites():
    print("Codes :", sorted(consommables_disponibles(CATALOGUE)))
    print("Requins :", [p["id"] for p in filtrer_par_consommable(CATALOGUE, "requin-mousse")])
    print("Sans offre :", consommables_sans_offre(CATALOGUE))


def devis():
    commande = preparer_commande(CATALOGUE, DEMANDES)
    print("Références inconnues :", commande["inconnues"])
    print(formater_devis(commande["lignes"]))


def favoris():
    produit = CATALOGUE[0].copy()
    retour = definir_favori(produit, True)
    print("Favori :", produit["favori"], "Retour :", retour)
    definir_favori(produit, False)
    print("Après désactivation :", produit["favori"])


if __name__ == "__main__":
    essayer("Produits", lister_produits)
    essayer("Recherche et petits bureaux", rechercher)
    essayer("Compatibilités", compatibilites)
    essayer("Devis de la Happiness Team", devis)
    essayer("Favoris", favoris)
