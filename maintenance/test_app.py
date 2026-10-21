"""Recette Streamlit sur des copies temporaires, sans audio fourni dans le dépôt."""

import importlib.util
import shutil
import tempfile
import unittest
import wave
from pathlib import Path

RACINE = Path(__file__).resolve().parents[1]
STREAMLIT = importlib.util.find_spec("streamlit") is not None


@unittest.skipUnless(STREAMLIT, "Installer les dépendances Streamlit pour tester l'interface")
class ApplicationTests(unittest.TestCase):
    def setUp(self):
        from streamlit.testing.v1 import AppTest
        self.dossier = tempfile.TemporaryDirectory()
        self.addCleanup(self.dossier.cleanup)
        self.racine = Path(self.dossier.name)
        for nom in ["app.py", "catalogue.py", "fonctions.py", "demandes.py", "sons.py"]:
            shutil.copy2(RACINE / nom, self.racine / nom)
        self.app = AppTest.from_file(str(self.racine / "app.py"), default_timeout=15)

    def socle_requis(self):
        from niveaux import a_completer, definitions
        source = (self.racine / "fonctions.py").read_text()
        if a_completer(definitions(source)["formater_devis"]):
            self.skipTest("Fonctions du socle à compléter sur ce point de reprise")

    def audio_requis(self):
        if "from sons import SONS_PRODUITS" not in (self.racine / "app.py").read_text():
            self.skipTest("Intégration audio à réaliser sur ce point de reprise")

    def bouton(self, libelle):
        return next(b for b in self.app.button if b.label == libelle)

    def test_demarrage_sans_audio(self):
        self.app.run()
        self.assertEqual(list(self.app.exception), [])
        from catalogue import CATALOGUE
        self.assertEqual(len(self.app.toggle), len(CATALOGUE))
        self.assertEqual(len(self.app.get("audio")), 0)

    def test_recherche_selection_vide_et_favori(self):
        self.socle_requis()
        self.app.run()
        self.app.text_input[0].set_value("  REQUIN  ").run()
        self.assertEqual(len(self.app.toggle), 4)
        self.app.text_input[0].set_value("introuvable").run()
        self.assertEqual(len(self.app.toggle), 0)
        self.assertTrue(self.bouton("Calculer le budget").disabled)
        self.assertTrue(next(s for s in self.app.selectbox if s.label == "Produit").disabled)
        self.assertEqual(list(self.app.exception), [])
        self.app.text_input[0].set_value("").run()
        self.app.checkbox[0].check().run()
        self.assertEqual(len(self.app.toggle), 4)
        self.app.toggle[0].set_value(True).run()
        self.assertTrue(self.app.session_state.catalogue[0]["favori"])
        self.app.toggle[0].set_value(False).run()
        self.assertFalse(self.app.session_state.catalogue[0]["favori"])

    def fiches(self):
        return {s.value for s in self.app.subheader}

    def test_demarrage_avec_images_du_catalogue(self):
        from catalogue import CATALOGUE
        for produit in CATALOGUE:
            source = RACINE / produit["image"]
            self.assertTrue(source.is_file(), f"Image absente : {produit['image']}")
            destination = self.racine / produit["image"]
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        self.app.run()
        self.assertEqual(list(self.app.exception), [])
        self.assertEqual(len(self.app.get("image")), len(CATALOGUE))

    def test_seuils_inactifs_puis_application_automatique(self):
        self.socle_requis()
        self.app.run()
        self.assertIn("Requin Arêtes", self.fiches())
        for cle in ["prix_max", "poids_max", "longueur_max"]:
            self.assertTrue(self.app.number_input(key=cle).disabled)
        self.app.checkbox(key="bureaux").check().run()
        self.assertEqual(self.fiches(), {
            "Sulfateuse à Relances", "Fumigène à ultrason", "Arbalète Anti-Réunionite", "Orbe de Décompression",
        })
        for cle in ["prix_max", "poids_max", "longueur_max"]:
            self.assertFalse(self.app.number_input(key=cle).disabled)
        self.app.number_input(key="prix_max").set_value(10.0).run()
        self.assertEqual(self.fiches(), set())
        self.assertTrue(self.bouton("Calculer le budget").disabled)
        self.app.checkbox(key="bureaux").uncheck().run()
        self.assertIn("Requin Arêtes", self.fiches())
        self.assertTrue(self.app.number_input(key="prix_max").disabled)
        self.app.checkbox(key="bureaux").check().run()
        self.assertEqual(self.app.number_input(key="prix_max").value, 10.0)
        self.assertEqual(self.fiches(), set())
        self.assertEqual(list(self.app.exception), [])

    def test_trois_maxima_inclusifs(self):
        self.socle_requis()
        self.app.run()
        self.app.checkbox(key="bureaux").check().run()
        for cle, limite, sous_limite, defaut in [
            ("prix_max", 39.5, 39.49, 60.0),
            ("poids_max", 650, 649, 800),
            ("longueur_max", 32, 31, 50),
        ]:
            with self.subTest(critere=cle):
                self.app.number_input(key=cle).set_value(limite).run()
                self.assertIn("Sulfateuse à Relances", self.fiches())
                self.app.number_input(key=cle).set_value(sous_limite).run()
                self.assertNotIn("Sulfateuse à Relances", self.fiches())
                self.app.number_input(key=cle).set_value(defaut).run()
                self.assertEqual(list(self.app.exception), [])

    def test_filtres_combines_reinitialisation_et_favori_conserve(self):
        self.socle_requis()
        self.app.run()
        self.app.toggle[0].set_value(True).run()
        self.app.text_input(key="recherche").set_value("  BRUME  ").run()
        self.app.selectbox(key="code_choisi").select("brume-neutre").run()
        self.assertEqual(self.fiches(), {"Fumigène à ultrason", "Mini-requins fumigènes", "Brume neutre"})
        self.app.checkbox(key="bureaux").check().run()
        self.assertEqual(self.fiches(), {"Fumigène à ultrason"})
        self.assertTrue(any("1 produit(s) affiché(s) sur 16" == c.value for c in self.app.caption))
        self.bouton("Réinitialiser les filtres").click().run()
        self.assertEqual(len(self.app.toggle), 16)
        self.assertEqual(self.app.text_input(key="recherche").value, "")
        self.assertEqual(self.app.selectbox(key="code_choisi").value, "Tous les produits")
        self.assertFalse(self.app.checkbox(key="bureaux").value)
        self.assertTrue(self.app.toggle[0].value)
        self.assertTrue(self.app.session_state.catalogue[0]["favori"])
        self.assertEqual(list(self.app.exception), [])

    def test_devis_frais_et_commande_vide(self):
        self.socle_requis()
        self.app.run()
        self.bouton("Préparer le devis").click().run()
        self.assertEqual(list(self.app.exception), [])
        self.assertIn("1170.60 €", self.app.code[0].value)
        self.assertTrue(any("BB-99" in t.value for t in self.app.markdown))
        next(n for n in self.app.number_input if n.label == "Frais de livraison (€)").set_value(0.0).run()
        self.bouton("Préparer le devis").click().run()
        self.assertIn("1164.60 €", self.app.code[0].value)
        self.app.text_area[0].set_value("  ").run()
        self.bouton("Préparer le devis").click().run()
        self.assertEqual(self.app.code[0].value, "Total livré : 0.00 €")

    def test_demandes_invalides_signalees_sans_devis(self):
        self.socle_requis()
        self.app.run()
        for demande in ["BB-01 ; -2", "BB-01 ; 2 ; surplus", " ; 2", "BB-01", "BB-01 ; 1.5", "BB-01 ;"]:
            with self.subTest(demande=demande):
                self.app.text_area[0].set_value(demande).run()
                self.bouton("Préparer le devis").click().run()
                self.assertEqual(list(self.app.exception), [])
                self.assertEqual(len(self.app.code), 0)
                self.assertEqual(len(self.app.error), 1)
                self.assertIn("Ligne 1", self.app.error[0].value)
        self.app.text_area[0].set_value("BB-01 ; 2\n\nRE-01 ; -1").run()
        self.bouton("Préparer le devis").click().run()
        self.assertIn("Ligne 3", self.app.error[0].value)
        self.assertEqual(len(self.app.code), 0)
        self.app.text_area[0].set_value("BB-01 ; 0").run()
        self.bouton("Préparer le devis").click().run()
        self.assertEqual(list(self.app.error), [])
        self.assertIn("Total livré : 6.00 €", self.app.code[0].value)

    def test_budget_et_devis_persistants_sans_resultat_perime(self):
        self.socle_requis()
        self.app.run()
        self.app.selectbox(key="budget_produit").select("BB-02").run()
        self.bouton("Calculer le budget").click().run()
        def quantite():
            return next(n for n in self.app.number_input if n.label == "Quantité")
        quantite().set_value(0).run()
        self.assertFalse(any(s.value.startswith("Budget :") for s in self.app.success))
        self.bouton("Calculer le budget").click().run()
        self.assertTrue(any(s.value == "Budget : 0,00 €" for s in self.app.success))
        quantite().set_value(1).run()
        self.bouton("Calculer le budget").click().run()
        self.bouton("Préparer le devis").click().run()
        texte = self.app.code[0].value
        self.assertTrue(any(s.value == "Budget : 489,00 €" for s in self.app.success))
        self.app.toggle[0].set_value(True).run()
        self.assertEqual(self.app.code[0].value, texte)
        self.assertTrue(any(s.value == "Budget : 489,00 €" for s in self.app.success))
        self.app.text_input(key="recherche").set_value("REQUIN").run()
        self.assertEqual(self.app.selectbox(key="budget_produit").value, "BB-02")
        self.assertEqual(self.app.code[0].value, texte)
        self.app.checkbox(key="bureaux").check().run()
        self.assertEqual(len(self.app.code), 1)
        self.assertFalse(any(s.value.startswith("Budget :") for s in self.app.success))
        next(n for n in self.app.number_input if n.label == "Frais de livraison (€)").set_value(10.0).run()
        self.assertEqual(len(self.app.code), 0)
        self.bouton("Préparer le devis").click().run()
        self.assertIn("1174.60 €", self.app.code[0].value)
        self.app.text_area[0].set_value("BB-01 ; 1").run()
        self.assertEqual(len(self.app.code), 0)
        self.assertEqual(list(self.app.exception), [])

    def test_audio_present_partage_et_manquant(self):
        self.audio_requis()
        from sons import SONS_PRODUITS
        chemins = {p for sons in SONS_PRODUITS.values() for p in sons}
        for index, chemin in enumerate(sorted(chemins), 1):
            destination = self.racine / chemin
            destination.parent.mkdir(parents=True, exist_ok=True)
            with wave.open(str(destination), "wb") as fichier:
                fichier.setnchannels(1)
                fichier.setsampwidth(2)
                fichier.setframerate(8000)
                fichier.writeframes(bytes((index, 0)) * 800)
        self.app.run()
        self.assertEqual(list(self.app.exception), [])
        lecteurs = self.app.get("audio")
        self.assertEqual(len(lecteurs), 10)
        self.assertEqual(len(self.app.warning), 0)
        self.assertTrue(all(not l.proto.autoplay for l in lecteurs))
        self.assertEqual(len({l.proto.url for l in lecteurs}), 9)
        (self.racine / "sons/rire-requin.wav").unlink()
        self.app.run()
        self.assertEqual(len(self.app.get("audio")), 9)
        self.assertEqual([w.value for w in self.app.warning], ["Son absent : sons/rire-requin.wav"])
        self.assertEqual(list(self.app.exception), [])


if __name__ == "__main__":
    unittest.main()
