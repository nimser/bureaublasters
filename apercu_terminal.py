"""Aperçu du catalogue BureauBlasters dans le terminal.

Lancement : python apercu_terminal.py
"""

import copy

from catalogue import CATALOGUE
from fonctions import (
    calculer_budget,
    consommables_disponibles,
    definir_favori,
    filtrer_par_consommable,
)


def essayer(titre, action):
    print(f"\n== {titre} ==")
    try:
        action()
    except NotImplementedError as erreur:
        print(f"À compléter : {erreur}")


def lister_produits():
    for produit in CATALOGUE:
        print(f"{produit['id']:6} {produit['nom']:28} {produit['prix_euros']!r:>8} €  {produit['conditionnement']}")


def lister_consommables():
    for code in sorted(consommables_disponibles(CATALOGUE)):
        print(f"- {code}")


def filtrer_requins():
    for produit in filtrer_par_consommable(CATALOGUE, "requin-mousse"):
        print(f"- {produit['id']} {produit['nom']}")


def estimer_budgets():
    for produit in CATALOGUE[:2]:
        print(f"2 × {produit['nom']} : {calculer_budget(produit, 2)!r} €")
    try:
        calculer_budget(CATALOGUE[0], -1)
    except ValueError as erreur:
        print(f"Quantité -1 refusée : {erreur}")


def basculer_favori():
    produit = copy.deepcopy(CATALOGUE[0])
    definir_favori(produit, True)
    print(f"{produit['nom']} après activation : favori = {produit['favori']!r}")
    definir_favori(produit, False)
    print(f"{produit['nom']} après désactivation : favori = {produit['favori']!r}")


print(f"{len(CATALOGUE)} produits dans le catalogue.")
essayer("Produits", lister_produits)
essayer("Consommables disponibles", lister_consommables)
essayer("Compatibles avec requin-mousse", filtrer_requins)
essayer("Budgets", estimer_budgets)
essayer("Favori", basculer_favori)
