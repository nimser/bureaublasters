"""Vérifie les tests obligatoires, la composition des fonctions et le bonus audio."""

import contextlib
import io
import unittest
from unittest.mock import patch

import tests_catalogue as verifications


class VerificationSocleTests(unittest.TestCase):
    def lancer(self, arguments):
        with contextlib.redirect_stdout(io.StringIO()):
            return verifications.main(arguments)

    def test_lancement_par_defaut_sans_bonus(self):
        with patch.object(verifications, "lancer", return_value={"ok": 1, "echec": 0, "a_completer": 0}) as lancer:
            self.assertEqual(self.lancer([]), 0)
        self.assertEqual([appel.args[0] for appel in lancer.call_args_list], verifications.GROUPES)
        self.assertNotIn("audio", verifications.GROUPES)
        self.assertIn("perso", verifications.GROUPES)

    def test_bonus_sur_demande(self):
        with patch.object(verifications, "lancer", return_value={"ok": 1, "echec": 0, "a_completer": 0}) as lancer:
            self.assertEqual(self.lancer(["audio"]), 0)
        lancer.assert_called_once_with("audio")

    def test_fonction_incomplete_ne_valide_pas_le_socle(self):
        with patch.object(verifications, "lancer", return_value={"ok": 0, "echec": 0, "a_completer": 1}):
            self.assertEqual(self.lancer(["perso"]), 1)

    def test_dix_tests_obligatoires_attendus(self):
        self.assertEqual(len(verifications.TESTS_OBLIGATOIRES), 10)
        self.assertEqual(
            {f.__name__ for f in verifications.tests_du_groupe("perso")},
            verifications.TESTS_OBLIGATOIRES,
        )

    def test_suppression_des_tests_signalee(self):
        from types import SimpleNamespace
        with patch.object(verifications.importlib, "import_module", return_value=SimpleNamespace()):
            with self.assertRaisesRegex(AssertionError, "Tests obligatoires absents"):
                verifications.tests_du_groupe("perso")

    def test_groupe_inconnu_refuse(self):
        with patch.object(verifications, "lancer") as lancer:
            self.assertEqual(self.lancer(["inconnu"]), 2)
        lancer.assert_not_called()


class CompositionTests(unittest.TestCase):
    def setUp(self):
        from pathlib import Path
        from niveaux import a_completer, definitions
        source = Path(__file__).resolve().parents[1] / "fonctions.py"
        fonctions = definitions(source.read_text())
        if any(a_completer(fonctions[n]) for n in ["preparer_ligne", "total_avec_livraison", "formater_devis"]):
            self.skipTest("Fonctions de commande et devis à compléter sur ce point de reprise")

    def test_ligne_reutilise_budget(self):
        import fonctions
        with patch.object(fonctions, "calculer_budget", return_value=123) as calcul:
            produit = {"id": "L1", "prix_euros": 20}
            self.assertEqual(fonctions.preparer_ligne(produit, 2)["sous_total_euros"], 123)
        calcul.assert_called_once_with(produit, 2)

    def test_livraison_reutilise_total(self):
        import fonctions
        with patch.object(fonctions, "calculer_total", return_value=100) as calcul:
            lignes = [{"sous_total_euros": 5}]
            self.assertEqual(fonctions.total_avec_livraison(lignes, 3), 103)
        calcul.assert_called_once_with(lignes)

    def test_mise_en_forme_transmet_les_frais(self):
        import fonctions
        with patch.object(fonctions, "total_avec_livraison", return_value=77) as calcul:
            self.assertEqual(fonctions.formater_devis([], 9), "Total livré : 77.00 €")
        calcul.assert_called_once_with([], 9)


class VerificationTranscriptionTests(unittest.TestCase):
    def setUp(self):
        self.catalogue = [{"id": "BB-01", "description": "Fiche déjà migrée."}]
        self.extrait = ""
        for identifiant in ["BB-02", "BB-04", "RE-08"]:
            self.catalogue.append({
                "id": identifiant, "nom": "Produit", "description": "Description",
                "conditionnement": "1 unité", "consommables_utilises": [],
                "consommables_fournis": ["code"], "effets": [],
            })
            self.extrait += (
                f"Identifiant : {identifiant}\nNom : Produit\nDescription : Description\n"
                "Conditionnement : 1 unité\nConsommables utilisés : aucun\n"
                "Consommables fournis : code\nEffets : aucun\n\n"
            )

    def verifier(self):
        with (
            patch.object(verifications, "CATALOGUE", self.catalogue),
            patch.object(verifications.Path, "read_text", return_value=self.extrait),
        ):
            verifications.test_donnees_fiches_synchronisees()

    def test_transcription_limitee_aux_fiches_non_migrees(self):
        self.verifier()

    def test_transcription_detecte_erreur_dans_ajout(self):
        self.catalogue[1]["description"] = "Description incomplète."
        with self.assertRaisesRegex(AssertionError, "BB-02 : description"):
            self.verifier()

    def test_extrait_refuse_fiche_deja_migree(self):
        self.extrait += "Identifiant : BB-01\n"
        with self.assertRaisesRegex(AssertionError, "seulement les trois fiches"):
            self.verifier()


if __name__ == "__main__":
    unittest.main()
