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
                "consommables_utilises": ["brume-neutre", "brume-girofle-agrumes"],
                "consommables_fournis": ["requin-mousse"],
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
        self.comparaisons = []

    def verifier(self):
        def branche(reference):
            return reference.removeprefix("refs/heads/")

        with (
            patch.object(controle, "fichiers_communs", return_value=controle.COMMUNS),
            patch.object(controle, "lire", side_effect=lambda r, p: self.contenus[branche(r), p]),
            patch.object(controle, "catalogue", side_effect=lambda r: self.catalogues[branche(r)]),
            patch.object(controle, "fonctions", side_effect=lambda r: self.definitions[branche(r)]),
            patch.object(controle, "verifier_comparaisons", return_value=self.comparaisons),
        ):
            return controle.verifier(None)

    def test_progression_coherente(self):
        self.assertEqual(self.verifier(), [])

    def test_erreurs_comparaisons_dans_bilan(self):
        self.comparaisons = ["Comparaison incorrecte entre deux étapes"]
        self.assertEqual(self.verifier(), self.comparaisons)

    def test_tous_les_fichiers_suivis_hors_variantes_sont_communs(self):
        chemins = controle.VARIANTES | {
            "requirements.txt", ".devcontainer/devcontainer.json",
            "images/tools/generate.ts", "sounds/sources/coin-coin.wav",
        }
        with patch.object(controle, "git", return_value="\n".join(chemins).encode()):
            self.assertEqual(
                controle.fichiers_communs("correction"),
                controle.COMMUNS | (chemins - controle.VARIANTES),
            )

    def test_documentation_desynchronisee(self):
        self.contenus["etape/02-filtres", "README.md"] = b"ancienne consigne"
        self.assertTrue(any("README.md" in e for e in self.verifier()))

    def test_catalogue_main_corrige_par_erreur(self):
        self.catalogues["main"] = copy.deepcopy(self.corrige)
        self.assertTrue(any("main : catalogue" in e for e in self.verifier()))

    def test_nouveaux_codes_conserves_avec_erreur_intentionnelle(self):
        requins = next(p for p in self.catalogues["main"] if p["id"] == "RE-02")
        self.assertEqual(requins["consommables_fournis"], ["requin_mousse"])
        self.assertEqual(requins["consommables_utilises"], ["brume-neutre", "brume-girofle-agrumes"])
        requins["consommables_utilises"].pop()
        self.assertTrue(any("main : catalogue" in e for e in self.verifier()))

    def test_reponse_distribuee_trop_tot(self):
        self.definitions["etape/03-budget"]["calculer_budget"] = self.definitions["correction"]["calculer_budget"]
        self.assertTrue(any("calculer_budget doit rester à compléter" in e for e in self.verifier()))

    def test_fonction_fournie_incorrecte(self):
        self.definitions["etape/04-favoris"]["calculer_budget"] = ast.parse(
            "def calculer_budget(produit):\n    return 0\n"
        ).body[0]
        self.assertTrue(any("calculer_budget doit être fourni et corrigé" in e for e in self.verifier()))

    def test_tests_personnels_distribues_trop_tot(self):
        self.contenus["etape/05-tests", "tests_perso.py"] = b"def test_exemple():\n    assert True\n"
        self.assertTrue(any("tests personnels doivent rester à écrire" in e for e in self.verifier()))

    def test_correction_incomplete(self):
        self.definitions["correction"]["definir_favori"] = self.definitions["main"]["definir_favori"]
        with self.assertRaisesRegex(ValueError, "quatre fonctions doivent être implémentées"):
            self.verifier()


class VerificationComparaisonsTests(unittest.TestCase):
    def setUp(self):
        self.references = {b: f"refs/heads/{b}" for b in controle.BRANCHES}
        self.reponses = {}
        chemins = ["catalogue.py", "fonctions.py", "fonctions.py", "fonctions.py", "tests_perso.py"]
        for position, (avant, apres, chemin) in enumerate(zip(controle.BRANCHES, controle.BRANCHES[1:], chemins)):
            base, suite = self.references[avant], self.references[apres]
            self.reponses[("rev-parse", base)] = f"commit-{position}\n".encode()
            self.reponses[("merge-base", base, suite)] = f"commit-{position}\n".encode()
            self.reponses[("diff", "--name-only", f"{base}...{suite}")] = f"{chemin}\n".encode()
        self.base, self.suite = self.references["main"], self.references["etape/02-filtres"]

    def verifier(self):
        with patch.object(controle, "git", side_effect=lambda *args: self.reponses[args]):
            return controle.verifier_comparaisons(self.references)

    def test_comparaisons_trois_points_limitees_aux_exercices(self):
        self.assertEqual(self.verifier(), [])

    def test_ancetre_ancien_refuse_meme_si_contenus_synchronises(self):
        self.reponses[("merge-base", self.base, self.suite)] = b"ancien-commit\n"
        erreurs = self.verifier()
        self.assertEqual(len(erreurs), 1)
        self.assertIn("main → etape/02-filtres", erreurs[0])
        self.assertIn("ancêtre", erreurs[0])

    def test_documentation_parasite_dans_comparaison(self):
        self.reponses[("diff", "--name-only", f"{self.base}...{self.suite}")] = b"README.md\ncatalogue.py\n"
        self.assertTrue(any("catalogue.py seul" in erreur for erreur in self.verifier()))

    def test_etape_sans_ajout_refusee(self):
        self.reponses[("diff", "--name-only", f"{self.base}...{self.suite}")] = b""
        self.assertTrue(any("obtenu []" in erreur for erreur in self.verifier()))

    def test_reference_absente_signalee(self):
        with patch.object(controle, "git", side_effect=ValueError("Référence absente")):
            erreurs = controle.verifier_comparaisons(self.references)
        self.assertEqual(len(erreurs), 5)
        self.assertTrue(all("Référence absente" in erreur for erreur in erreurs))


if __name__ == "__main__":
    unittest.main()
