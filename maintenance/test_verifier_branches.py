"""Tests du contrôle de cohérence des branches pédagogiques."""

import ast
import copy
import unittest
from unittest.mock import patch

import verifier_branches as controle


class VerificationBranchesTests(unittest.TestCase):
    def setUp(self):
        self.corrige = [
            {
                "id": f"{prefixe}-0{n}",
                "prix_euros": 10,
                "dimensions_cm": {"longueur": 4},
                "consommables": ["requin-mousse", "brume-neutre", "brume-girofle-agrumes"],
                "favori": False,
            }
            for prefixe in ["BB", "RE"] for n in range(1, 9)
        ]
        self.catalogues = {b: copy.deepcopy(self.corrige) for b in controle.BRANCHES}
        self.catalogues["main"] = controle.catalogue_depart(self.corrige)
        self.definitions = {}
        for branche, nombre in zip(controle.BRANCHES, controle.A_COMPLETER):
            self.definitions[branche] = {}
            for position, nom in enumerate(controle.FONCTIONS):
                corps = "raise NotImplementedError('À compléter')" if position >= 4 - nombre else "return 1"
                self.definitions[branche][nom] = ast.parse(f"def {nom}(produit):\n    {corps}\n").body[0]
        self.contenus = {
            (branche, chemin): b"document commun" for branche in controle.BRANCHES for chemin in controle.COMMUNS
        }
        self.contenus.update({(branche, "tests_perso.py"): b"" for branche in controle.BRANCHES})

    def verifier(self):
        def branche(reference):
            return reference.removeprefix("refs/heads/")

        with (
            patch.object(controle, "fichiers_communs", return_value=controle.COMMUNS),
            patch.object(controle, "lire", side_effect=lambda r, p: self.contenus[branche(r), p]),
            patch.object(controle, "catalogue", side_effect=lambda r: self.catalogues[branche(r)]),
            patch.object(controle, "fonctions", side_effect=lambda r: self.definitions[branche(r)]),
        ):
            return controle.verifier(None)

    def test_progression_coherente(self):
        self.assertEqual(self.verifier(), [])

    def test_documentation_desynchronisee(self):
        self.contenus["reprise/02-filtres", "README.md"] = b"ancienne consigne"
        self.assertTrue(any("README.md" in e for e in self.verifier()))

    def test_catalogue_main_corrige_par_erreur(self):
        self.catalogues["main"] = copy.deepcopy(self.corrige)
        self.assertTrue(any("main : catalogue" in e for e in self.verifier()))

    def test_nouveaux_codes_conserves_avec_erreur_intentionnelle(self):
        requins = next(p for p in self.catalogues["main"] if p["id"] == "RE-02")
        self.assertEqual(requins["consommables"], ["requin_mousse", "brume-neutre", "brume-girofle-agrumes"])
        requins["consommables"].pop()
        self.assertTrue(any("main : catalogue" in e for e in self.verifier()))

    def test_reponse_distribuee_trop_tot(self):
        self.definitions["reprise/03-budget"]["calculer_budget"] = self.definitions["correction"]["calculer_budget"]
        self.assertTrue(any("calculer_budget doit rester à compléter" in e for e in self.verifier()))

    def test_fonction_fournie_incorrecte(self):
        self.definitions["reprise/04-favoris"]["calculer_budget"] = ast.parse(
            "def calculer_budget(produit):\n    return 0\n"
        ).body[0]
        self.assertTrue(any("calculer_budget doit être fourni et corrigé" in e for e in self.verifier()))

    def test_tests_personnels_distribues_trop_tot(self):
        self.contenus["reprise/05-tests", "tests_perso.py"] = b"def test_exemple():\n    assert True\n"
        self.assertTrue(any("tests personnels doivent rester à écrire" in e for e in self.verifier()))

    def test_correction_incomplete(self):
        self.definitions["correction"]["definir_favori"] = self.definitions["main"]["definir_favori"]
        with self.assertRaisesRegex(ValueError, "quatre fonctions doivent être implémentées"):
            self.verifier()


if __name__ == "__main__":
    unittest.main()
