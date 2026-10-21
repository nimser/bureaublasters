"""Tests hors réseau du contrat de progression des branches."""

import ast
import copy
import unittest
from unittest.mock import patch

import niveaux
import verifier_branches as controle


class VerificationBranchesTests(unittest.TestCase):
    def setUp(self):
        self.corrige = [
            {"id": f"{prefixe}-0{n}", "prix_euros": 10, "dimensions_cm": {"longueur": 4},
             "consommables_utilises": ["brume-neutre"], "consommables_fournis": ["requin-mousse"], "favori": False}
            for prefixe in ["BB", "RE"] for n in range(1, 9)
        ]
        self.catalogues = {b: copy.deepcopy(self.corrige) for b in niveaux.BRANCHES}
        self.catalogues["main"] = controle.catalogue_depart(self.corrige)
        fonctions = "\n".join(f'def {nom}(produit):\n    """Contrat."""\n    return 1\n' for nom in niveaux.FONCTIONS)
        tests = "\n".join(f'def {nom}():\n    """Contrat."""\n    assert True\n' for nom in niveaux.TESTS)
        app = (
            "from fonctions import sons_pour_produit\nfrom sons import SONS_PRODUITS\n"
            "def afficher(produit):\n"
            "    for chemin in sons_pour_produit(produit['id'], SONS_PRODUITS):\n        print(chemin)\n"
            "    print(produit)\n"
        )
        sons = 'SONS_PRODUITS = {"L1": ["sons/couac.wav"]}\n'
        self.contenus = {}
        for niveau, branche in enumerate(niveaux.BRANCHES):
            for chemin in controle.COMMUNS:
                self.contenus[branche, chemin] = b"document commun"
            self.contenus[branche, "fonctions.py"] = niveaux.variante(fonctions, niveaux.ETAPES_FONCTIONS, niveau).encode()
            self.contenus[branche, "tests_perso.py"] = niveaux.variante(tests, niveaux.ETAPES_TESTS, niveau).encode()
            self.contenus[branche, "app.py"] = (app if niveau == 7 else niveaux.app_sans_audio(app)).encode()
            self.contenus[branche, "sons.py"] = (sons if niveau == 7 else niveaux.sons_sans_associations(sons)).encode()
        self.comparaisons = []

    def verifier(self, chemins=b"README.md\napp.py\n"):
        def branche(reference):
            return reference.removeprefix("refs/heads/")

        with (
            patch.object(controle, "fichiers_communs", return_value=controle.COMMUNS),
            patch.object(controle, "lire", side_effect=lambda r, p: self.contenus[branche(r), p]),
            patch.object(controle, "catalogue", side_effect=lambda r: self.catalogues[branche(r)]),
            patch.object(controle, "verifier_comparaisons", return_value=self.comparaisons),
            patch.object(controle, "git", return_value=chemins),
        ):
            return controle.verifier()

    def test_progression_coherente(self):
        self.assertEqual(self.verifier(), [])

    def test_tous_fichiers_hors_variantes_sont_communs(self):
        chemins = niveaux.VARIANTES | {"requirements.txt", ".devcontainer/devcontainer.json", "images/tools/generate.ts"}
        with patch.object(controle, "git", return_value="\n".join(chemins).encode()):
            self.assertEqual(controle.fichiers_communs("correction"), controle.COMMUNS | (chemins - niveaux.VARIANTES))

    def test_documentation_desynchronisee(self):
        self.contenus["etape/02-recherche", "README.md"] = b"ancienne consigne"
        self.assertTrue(any("README.md" in e for e in self.verifier()))

    def test_catalogue_main_corrige_par_erreur(self):
        self.catalogues["main"] = copy.deepcopy(self.corrige)
        self.assertTrue(any("main : catalogue" in e for e in self.verifier()))

    def test_nouveaux_codes_conserves_avec_erreur_intentionnelle(self):
        requins = next(p for p in self.catalogues["main"] if p["id"] == "RE-02")
        self.assertEqual(requins["consommables_fournis"], ["requin_mousse"])
        self.assertEqual(requins["consommables_utilises"], ["brume-neutre"])

    def test_reponse_distribuee_trop_tot(self):
        self.contenus["etape/02-recherche", "fonctions.py"] = self.contenus["correction", "fonctions.py"]
        self.assertTrue(any("progression de fonctions.py" in e for e in self.verifier()))

    def test_test_obligatoire_distribue_trop_tot(self):
        self.contenus["etape/06-tests", "tests_perso.py"] = self.contenus["correction", "tests_perso.py"]
        self.assertTrue(any("progression de tests_perso.py" in e for e in self.verifier()))

    def test_player_distribue_trop_tot(self):
        self.contenus["etape/07-audio", "app.py"] = self.contenus["correction", "app.py"]
        self.assertTrue(any("niveau audio" in e for e in self.verifier()))

    def test_fichier_audio_fourni_refuse(self):
        erreurs = self.verifier(chemins=b"sounds/sources/couac.wav\n")
        self.assertEqual(len(erreurs), 8)
        self.assertTrue(all("depuis Discord" in erreur for erreur in erreurs))

    def test_correction_incomplete(self):
        self.contenus["correction", "fonctions.py"] = self.contenus["main", "fonctions.py"]
        with self.assertRaisesRegex(ValueError, "doit être terminé"):
            self.verifier()


class VariantesTests(unittest.TestCase):
    def test_signature_docstring_et_debut_de_test_preserves(self):
        source = 'def test_recherche_normalisee():\n    """Contrat."""\n    assert True\n'
        resultat = niveaux.variante(source, {2: ["test_recherche_normalisee"]}, 1)
        definition = ast.parse(resultat).body[0]
        self.assertEqual(ast.get_docstring(definition), "Contrat.")
        self.assertTrue(niveaux.a_completer(definition))
        self.assertIn('resultat = rechercher_produits(catalogue, "  LANCEUR  ")', resultat)
        self.assertEqual(niveaux.variante(source, {2: ["test_recherche_normalisee"]}, 2), source)


class VerificationComparaisonsTests(unittest.TestCase):
    def setUp(self):
        self.references = {b: f"refs/heads/{b}" for b in niveaux.BRANCHES}
        self.reponses = {}
        for i, (avant, apres, chemins) in enumerate(zip(niveaux.BRANCHES, niveaux.BRANCHES[1:], niveaux.TRANSITIONS)):
            base, suite = self.references[avant], self.references[apres]
            self.reponses["rev-parse", base] = f"commit-{i}\n".encode()
            self.reponses["merge-base", base, suite] = f"commit-{i}\n".encode()
            self.reponses["diff", "--name-only", f"{base}...{suite}"] = "\n".join(sorted(chemins)).encode()
        self.base, self.suite = self.references["main"], self.references["etape/02-recherche"]

    def verifier(self):
        with patch.object(controle, "git", side_effect=lambda *args: self.reponses[args]):
            return controle.verifier_comparaisons(self.references)

    def test_diffs_limites_aux_exercices(self):
        self.assertEqual(self.verifier(), [])

    def test_ancetre_ancien_refuse(self):
        self.reponses["merge-base", self.base, self.suite] = b"ancien-commit\n"
        self.assertTrue(any("ancêtre" in e for e in self.verifier()))

    def test_documentation_parasite_refusee(self):
        self.reponses["diff", "--name-only", f"{self.base}...{self.suite}"] = b"README.md\ncatalogue.py\n"
        self.assertTrue(any("fichiers attendus" in e for e in self.verifier()))

    def test_etape_sans_ajout_refusee(self):
        self.reponses["diff", "--name-only", f"{self.base}...{self.suite}"] = b""
        self.assertTrue(any("obtenu []" in e for e in self.verifier()))

    def test_reference_absente_signalee(self):
        with patch.object(controle, "git", side_effect=ValueError("Référence absente")):
            erreurs = controle.verifier_comparaisons(self.references)
        self.assertEqual(len(erreurs), 7)


if __name__ == "__main__":
    unittest.main()
