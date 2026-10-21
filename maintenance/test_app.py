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
        self.bouton("Calculer le budget").click().run()
        self.assertEqual(list(self.app.exception), [])
        self.app.text_input[0].set_value("").run()
        self.app.checkbox[0].check().run()
        self.assertEqual(len(self.app.toggle), 4)
        self.app.toggle[0].set_value(True).run()
        self.assertTrue(self.app.session_state.catalogue[0]["favori"])
        self.app.toggle[0].set_value(False).run()
        self.assertFalse(self.app.session_state.catalogue[0]["favori"])

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
