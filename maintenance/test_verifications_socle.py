"""Vérifie la séparation entre socle, tests personnels et bonus exceptions."""

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
        self.assertNotIn("exceptions", verifications.GROUPES)

    def test_bonus_sur_demande(self):
        with patch.object(verifications, "lancer", return_value={"ok": 1, "echec": 0, "a_completer": 0}) as lancer:
            self.assertEqual(self.lancer(["exceptions"]), 0)
        lancer.assert_called_once_with("exceptions")

    def test_quantite_negative_absente_du_groupe_budget(self):
        noms = [test.__name__ for test in verifications.tests_du_groupe("budget")]
        self.assertEqual(noms, ["test_budget_plusieurs_conditionnements", "test_budget_arrondi", "test_budget_quantite_nulle"])

    def test_bonus_detecte_absence_exception(self):
        with patch.object(verifications, "calculer_budget", return_value=-10):
            with self.assertRaisesRegex(AssertionError, "aurait dû lever ValueError"):
                verifications.test_exceptions_quantite_negative()

    def test_bonus_detecte_message_incomplet(self):
        with patch.object(verifications, "calculer_budget", side_effect=ValueError("Quantité invalide")):
            with self.assertRaisesRegex(AssertionError, "indiquer la quantité reçue"):
                verifications.test_exceptions_quantite_negative()

    def test_bonus_accepte_exception_explicite(self):
        with patch.object(verifications, "calculer_budget", side_effect=ValueError("Quantité invalide : -1")):
            verifications.test_exceptions_quantite_negative()

    def test_groupe_inconnu_refuse(self):
        with patch.object(verifications, "lancer") as lancer:
            self.assertEqual(self.lancer(["inconnu"]), 2)
        lancer.assert_not_called()


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
