"""Interface Streamlit du catalogue BureauBlasters.

Lancement : python -m streamlit run app.py
"""

import copy
from pathlib import Path

import streamlit as st

from catalogue import CATALOGUE
from fonctions import (
    calculer_budget,
    consommables_disponibles,
    definir_favori,
    filtrer_par_consommable,
)

DOSSIER = Path(__file__).parent
TOUS = "Tous les produits"


def format_euros(valeur):
    if isinstance(valeur, (int, float)) and not isinstance(valeur, bool):
        return f"{valeur:,.2f} €".replace(",", " ").replace(".", ",")
    return repr(valeur)


def format_mesure(valeur, unite):
    return "non applicable" if valeur is None else f"{valeur} {unite}"


def basculer_favori(produit, cle):
    try:
        definir_favori(produit, st.session_state[cle])
    except NotImplementedError as erreur:
        st.session_state.favori_a_completer = str(erreur)


def afficher_produit(produit, cle):
    with st.container(border=True):
        image = DOSSIER / produit["image"]
        if image.is_file():
            st.image(str(image), width="stretch")
        st.subheader(produit["nom"])
        st.caption(f"{produit['id']} · {produit['categorie']} · {produit['conditionnement']}")
        st.markdown(f"**{format_euros(produit['prix_euros'])}**")
        st.write(produit["description"])
        with st.expander("Caractéristiques"):
            dimensions = produit["dimensions_cm"]
            st.markdown(
                f"- Consommables : {', '.join(produit['consommables'])}\n"
                f"- Portée : {format_mesure(produit['portee_m'], 'm')}\n"
                f"- Cadence : {format_mesure(produit['cadence_tirs_min'], 'tirs/minute')}\n"
                f"- Poids : {produit['poids_g']} g\n"
                f"- Dimensions : {dimensions['longueur']} × {dimensions['largeur']} × {dimensions['hauteur']} cm\n"
                f"- Indice de protection : {produit['indice_protection'] or 'non applicable'}\n"
                f"- Effets : {' ; '.join(produit['effets']) or 'aucun'}"
            )
        st.toggle(
            "Favori",
            value=bool(produit["favori"]),
            key=cle,
            on_change=basculer_favori,
            args=(produit, cle),
        )


st.set_page_config(page_title="BureauBlasters", page_icon="🎯", layout="wide")

# Les favoris vivent dans une copie propre à la session.
if "catalogue" not in st.session_state:
    st.session_state.catalogue = copy.deepcopy(CATALOGUE)
catalogue = st.session_state.catalogue

st.title("BureauBlasters")
st.caption("Équipements de bureau à projectiles en mousse")

with st.sidebar:
    st.header("Consommables")
    try:
        codes = sorted(consommables_disponibles(catalogue))
    except NotImplementedError as erreur:
        codes = []
        st.info(f"À compléter : {erreur}")
    code_choisi = st.selectbox("Afficher les produits compatibles avec", [TOUS] + codes)

    st.header("Favoris")
    if "favori_a_completer" in st.session_state:
        st.info(f"À compléter : {st.session_state.favori_a_completer}")
    favoris = [produit["nom"] for produit in catalogue if produit["favori"]]
    st.write("\n".join(f"- {nom}" for nom in favoris) if favoris else "Aucun favori.")

selection = catalogue
if code_choisi != TOUS:
    try:
        selection = filtrer_par_consommable(catalogue, code_choisi)
    except NotImplementedError as erreur:
        st.info(f"À compléter : {erreur}")

st.header("Budget")
colonne_produit, colonne_quantite = st.columns([3, 1])
with colonne_produit:
    index_produit = st.selectbox(
        "Produit",
        range(len(selection)),
        format_func=lambda i: f"{selection[i]['nom']} ({selection[i]['conditionnement']})",
    )
with colonne_quantite:
    quantite = st.number_input("Quantité", value=1, step=1)
if st.button("Calculer le budget") and index_produit is not None:
    try:
        montant = calculer_budget(selection[index_produit], int(quantite))
    except NotImplementedError:
        st.warning("Faites confiance à votre intuition.")
    except ValueError as erreur:
        st.error(str(erreur))
    else:
        st.success(f"Budget : {format_euros(montant)}")

st.header("Catalogue" if code_choisi == TOUS else f"Compatibles avec {code_choisi}")
if not selection:
    st.write("Aucun produit.")
positions = {id(produit): index for index, produit in enumerate(catalogue)}
colonnes = st.columns(3)
for position, produit in enumerate(selection):
    with colonnes[position % 3]:
        afficher_produit(produit, f"favori-{positions.get(id(produit), f'selection-{position}')}")
