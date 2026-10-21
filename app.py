"""Interface du catalogue : python -m streamlit run app.py."""

import copy
from pathlib import Path

import streamlit as st

from catalogue import CATALOGUE
from demandes import DEMANDES
from fonctions import (
    calculer_budget,
    calculer_total,
    consommables_disponibles,
    consommables_sans_offre,
    definir_favori,
    filtrer_par_consommable,
    formater_devis,
    preparer_commande,
    rechercher_produits,
    selectionner_equipements,
    total_avec_livraison,
)
# Bonus audio : importe SONS_PRODUITS et sons_pour_produit depuis leurs modules.
from fonctions import sons_pour_produit
from sons import SONS_PRODUITS

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
                f"- Consommables utilisés : {', '.join(produit['consommables_utilises']) or 'aucun'}\n"
                f"- Consommables fournis : {', '.join(produit['consommables_fournis']) or 'aucun'}\n"
                f"- Portée : {format_mesure(produit['portee_m'], 'm')}\n"
                f"- Cadence : {format_mesure(produit['cadence_tirs_min'], 'tirs/minute')}\n"
                f"- Poids : {produit['poids_g']} g\n"
                f"- Dimensions : {dimensions['longueur']} × {dimensions['largeur']} × {dimensions['hauteur']} cm\n"
                f"- Indice de protection : {produit['indice_protection'] or 'non applicable'}\n"
                f"- Effets : {' ; '.join(produit['effets']) or 'aucun'}"
            )
        # Bonus audio : parcours les chemins associés à produit["id"].
        # Pour chaque fichier existant, ajoute st.audio dans cette carte ; sinon affiche son chemin manquant.
        # Documentation : https://docs.streamlit.io/develop/api-reference/media/st.audio
        for chemin in sons_pour_produit(produit["id"], SONS_PRODUITS):
            fichier = DOSSIER / chemin
            if fichier.is_file():
                st.audio(str(fichier), format="audio/wav", autoplay=False)
            else:
                st.warning(f"Son absent : {chemin}")
        st.toggle(
            "Favori", value=bool(produit["favori"]), key=cle,
            on_change=basculer_favori, args=(produit, cle),
        )


st.set_page_config(page_title="BureauBlasters", page_icon="🎯", layout="wide")
if "catalogue" not in st.session_state:
    st.session_state.catalogue = copy.deepcopy(CATALOGUE)
catalogue = st.session_state.catalogue

st.title("BureauBlasters")
st.caption("Du catalogue à la commande de la Happiness Team")
selection = catalogue
with st.sidebar:
    st.header("Recherche et sélection")
    recherche = st.text_input("Nom ou description")
    bureaux = st.checkbox("Équipements adaptés aux petits bureaux")
    prix_max = st.number_input("Prix maximal (€)", min_value=0.0, value=60.0)
    poids_max = st.number_input("Poids maximal (g)", min_value=0, value=800)
    longueur_max = st.number_input("Longueur maximale (cm)", min_value=0, value=50)
    st.header("Consommables")
    try:
        codes = sorted(consommables_disponibles(catalogue))
    except NotImplementedError as erreur:
        codes = []
        st.info(f"À compléter : {erreur}")
    code_choisi = st.selectbox("Code associé", [TOUS] + codes)
    if st.button("Vérifier les consommables sans offre"):
        try:
            sans_offre = consommables_sans_offre(catalogue)
        except NotImplementedError as erreur:
            st.info(f"À compléter : {erreur}")
        else:
            st.write(sorted(sans_offre) if sans_offre else "Tous les codes utilisés ont un fournisseur.")
    st.header("Favoris")
    if "favori_a_completer" in st.session_state:
        st.info(f"À compléter : {st.session_state.favori_a_completer}")
    favoris = [p["nom"] for p in catalogue if p["favori"]]
    st.write("\n".join(f"- {nom}" for nom in favoris) if favoris else "Aucun favori.")

try:
    if recherche:
        selection = rechercher_produits(selection, recherche)
    if bureaux:
        selection = selectionner_equipements(selection, prix_max, poids_max, longueur_max)
    if code_choisi != TOUS:
        selection = filtrer_par_consommable(selection, code_choisi)
except NotImplementedError as erreur:
    st.info(f"À compléter : {erreur}")
except TypeError:
    st.error("Vérifie les types du catalogue avec python tests_catalogue.py donnees.")

st.header("Budget d'une référence")
st.caption("La quantité compte les conditionnements ; munitions et liquides s'ajoutent séparément.")
colonne_produit, colonne_quantite = st.columns([3, 1])
with colonne_produit:
    index_produit = st.selectbox(
        "Produit", range(len(selection)),
        format_func=lambda i: f"{selection[i]['nom']} ({selection[i]['conditionnement']})",
    )
with colonne_quantite:
    quantite = st.number_input("Quantité", min_value=0, value=1, step=1)
if st.button("Calculer le budget") and index_produit is not None:
    try:
        montant = calculer_budget(selection[index_produit], int(quantite))
    except NotImplementedError as erreur:
        st.info(f"À compléter : {erreur}")
    except TypeError:
        st.error("Vérifie le type des prix dans catalogue.py.")
    else:
        st.success(f"Budget : {format_euros(montant)}")

st.header("Commande et devis")
st.caption("Une ligne par référence : identifiant ; quantité entière positive ou nulle.")
saisie = st.text_area("Demande de la Happiness Team", value="\n".join(DEMANDES))
frais = st.number_input("Frais de livraison (€)", min_value=0.0, value=6.0)
if st.button("Préparer le devis"):
    try:
        commande = preparer_commande(catalogue, saisie.splitlines())
        lignes = commande["lignes"]
        texte = formater_devis(lignes, frais)
        hors_livraison = calculer_total(lignes)
        total = total_avec_livraison(lignes, frais)
    except NotImplementedError as erreur:
        st.info(f"À compléter : {erreur}")
    except (ValueError, IndexError):
        st.error("Utilise le format BB-01 ; 2, avec une quantité entière positive ou nulle.")
    except TypeError:
        st.error("Vérifie les types des prix et les retours de tes fonctions.")
    else:
        if commande["inconnues"]:
            st.write("Références inconnues : " + ", ".join(commande["inconnues"]))
        st.code(texte, language=None)
        st.write(f"Articles : {format_euros(hors_livraison)}")
        st.success(f"Total livré : {format_euros(total)}")

st.header("Catalogue" if code_choisi == TOUS else f"Produits associés à {code_choisi}")
if not selection:
    st.write("Aucun produit.")
positions = {id(produit): index for index, produit in enumerate(catalogue)}
colonnes = st.columns(3)
for position, produit in enumerate(selection):
    with colonnes[position % 3]:
        afficher_produit(produit, f"favori-{positions[id(produit)]}")
