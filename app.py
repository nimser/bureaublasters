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

DOSSIER = Path(__file__).parent
TOUS = "Tous les produits"
FILTRES_DEFAUT = {
    "recherche": "", "bureaux": False, "prix_max": 60.0,
    "poids_max": 800, "longueur_max": 50, "code_choisi": TOUS,
}


def format_euros(valeur):
    if isinstance(valeur, (int, float)) and not isinstance(valeur, bool):
        return f"{valeur:,.2f} €".replace(",", " ").replace(".", ",")
    return repr(valeur)


def format_mesure(valeur, unite):
    return "non applicable" if valeur is None else f"{valeur} {unite}"


def basculer_favori(produit, cle):
    st.session_state.pop("favori_a_completer", None)
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
        st.toggle(
            "Favori", value=bool(produit["favori"]), key=cle,
            on_change=basculer_favori, args=(produit, cle),
        )


def reinitialiser_filtres():
    st.session_state.update(FILTRES_DEFAUT)


def verifier_demandes(demandes):
    for numero, texte in enumerate(demandes, 1):
        if not texte.strip():
            continue
        champs = texte.split(";")
        if len(champs) != 2 or not champs[0].strip():
            raise ValueError(f"Ligne {numero} : utilise une référence et une quantité, comme BB-01 ; 2.")
        try:
            quantite = int(champs[1].strip())
        except ValueError:
            raise ValueError(f"Ligne {numero} : la quantité doit être un entier positif ou nul.") from None
        if quantite < 0:
            raise ValueError(f"Ligne {numero} : la quantité doit être positive ou nulle.")


st.set_page_config(page_title="BureauBlasters", page_icon="🎯", layout="wide")
if "catalogue" not in st.session_state:
    st.session_state.catalogue = copy.deepcopy(CATALOGUE)
catalogue = st.session_state.catalogue
for cle, valeur in FILTRES_DEFAUT.items():
    st.session_state.setdefault(cle, valeur)

st.title("BureauBlasters")
st.caption("Du catalogue à la commande de la Happiness Team")
selection = catalogue
with st.sidebar:
    st.header("Recherche et sélection")
    recherche = st.text_input("Nom ou description", key="recherche")
    bureaux = st.checkbox("Équipements adaptés aux petits bureaux", key="bureaux")
    st.caption("Coche la case pour activer les trois maxima sur les lanceurs et accessoires.")
    prix_max = st.number_input(
        "Prix maximal (€)", min_value=0.0, step=1.0, disabled=not bureaux, key="prix_max",
    )
    poids_max = st.number_input(
        "Poids maximal (g)", min_value=0, disabled=not bureaux, key="poids_max",
    )
    longueur_max = st.number_input(
        "Longueur maximale (cm)", min_value=0, disabled=not bureaux, key="longueur_max",
    )
    st.header("Consommables")
    try:
        codes = sorted(consommables_disponibles(catalogue))
    except NotImplementedError as erreur:
        codes = []
        st.info(f"À compléter : {erreur}")
    code_choisi = st.selectbox("Code associé", [TOUS] + codes, key="code_choisi")
    st.button("Réinitialiser les filtres", on_click=reinitialiser_filtres)
    st.caption("Les filtres s’appliquent automatiquement et se combinent.")
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

filtres_appliques = []
try:
    if recherche:
        selection = rechercher_produits(selection, recherche)
        filtres_appliques.append(f"recherche « {recherche.strip()} »")
    if bureaux:
        selection = selectionner_equipements(selection, prix_max, poids_max, longueur_max)
        filtres_appliques.append(
            f"équipements ≤ {format_euros(prix_max)}, {poids_max} g et {longueur_max} cm"
        )
    if code_choisi != TOUS:
        selection = filtrer_par_consommable(selection, code_choisi)
        filtres_appliques.append(f"code {code_choisi}")
except NotImplementedError as erreur:
    st.info(f"Filtrage à compléter : {erreur}")
except TypeError:
    st.error("Vérifie les types du catalogue avec python tests_catalogue.py donnees.")

st.caption(f"{len(selection)} produit(s) affiché(s) sur {len(catalogue)}")
st.caption("Filtres appliqués : " + (" ; ".join(filtres_appliques) or "aucun"))

st.header("Budget d'une référence")
st.caption("Choisis parmi les produits affichés. La quantité compte les conditionnements.")
produits_selectionnes = {produit["id"]: produit for produit in selection}
colonne_produit, colonne_quantite = st.columns([3, 1])
with colonne_produit:
    identifiant_produit = st.selectbox(
        "Produit", list(produits_selectionnes), disabled=not selection, key="budget_produit",
        format_func=lambda identifiant: (
            f"{identifiant} · {produits_selectionnes[identifiant]['nom']} "
            f"({produits_selectionnes[identifiant]['conditionnement']})"
        ),
    )
with colonne_quantite:
    quantite = st.number_input("Quantité", min_value=0, value=1, step=1)
parametres_budget = (identifiant_produit, quantite)
if st.session_state.get("budget", {}).get("parametres") != parametres_budget:
    st.session_state.pop("budget", None)
if st.button("Calculer le budget", disabled=not selection) and identifiant_produit is not None:
    st.session_state.pop("budget", None)
    try:
        montant = calculer_budget(produits_selectionnes[identifiant_produit], int(quantite))
    except NotImplementedError as erreur:
        st.info(f"À compléter : {erreur}")
    except TypeError:
        st.error("Vérifie le type des prix dans catalogue.py.")
    else:
        st.session_state.budget = {"parametres": parametres_budget, "montant": montant}
if "budget" in st.session_state:
    st.success(f"Budget : {format_euros(st.session_state.budget['montant'])}")

st.header("Commande et devis")
st.caption("Une ligne par référence : identifiant ; quantité entière positive ou nulle.")
saisie = st.text_area("Demande de la Happiness Team", value="\n".join(DEMANDES))
frais = st.number_input("Frais de livraison (€)", min_value=0.0, value=6.0)
parametres_devis = (saisie, frais)
if st.session_state.get("devis", {}).get("parametres") != parametres_devis:
    st.session_state.pop("devis", None)
if st.button("Préparer le devis"):
    st.session_state.pop("devis", None)
    try:
        demandes = saisie.splitlines()
        verifier_demandes(demandes)
        commande = preparer_commande(catalogue, demandes)
        lignes = commande["lignes"]
        texte = formater_devis(lignes, frais)
        hors_livraison = calculer_total(lignes)
        total = total_avec_livraison(lignes, frais)
    except NotImplementedError as erreur:
        st.info(f"À compléter : {erreur}")
    except ValueError as erreur:
        st.error(f"Demande invalide : {erreur}")
    except IndexError:
        st.error("Vérifie le découpage des demandes dans lire_demande.")
    except TypeError:
        st.error("Vérifie les types des prix et les retours de tes fonctions.")
    else:
        st.session_state.devis = {
            "parametres": parametres_devis, "inconnues": commande["inconnues"],
            "texte": texte, "hors_livraison": hors_livraison, "total": total,
        }
if "devis" in st.session_state:
    devis = st.session_state.devis
    if devis["inconnues"]:
        st.write("Références inconnues : " + ", ".join(devis["inconnues"]))
    st.code(devis["texte"], language=None)
    st.write(f"Articles : {format_euros(devis['hors_livraison'])}")
    st.success(f"Total livré : {format_euros(devis['total'])}")

st.header("Catalogue" if code_choisi == TOUS else f"Produits associés à {code_choisi}")
if not selection:
    st.write("Aucun produit.")
positions = {id(produit): index for index, produit in enumerate(catalogue)}
colonnes = st.columns(3)
for position, produit in enumerate(selection):
    with colonnes[position % 3]:
        afficher_produit(produit, f"favori-{positions[id(produit)]}")
