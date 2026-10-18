"""Catalogue des produits BureauBlasters."""

CATALOGUE = [
    {
        "id": "BB-01",
        "nom": "Rafale de Post-it",
        "categorie": "lanceur",
        "description": "Blaster compact à fléchettes en mousse, chargeur de 12 fléchettes. Une main suffit.",
        "prix_euros": "39,50",
        "conditionnement": "1 blaster",
        "consommables": [
            "flechette-mousse"
        ],
        "portee_m": 8,
        "cadence_tirs_min": 90,
        "poids_g": 650,
        "dimensions_cm": {
            "longueur": 32,
            "largeur": 8,
            "hauteur": 18
        },
        "indice_protection": None,
        "effets": [
            "LED orange au départ du tir",
            "bruit de tampon administratif"
        ],
        "image": "images/rafale-post-it.jpg",
        "favori": False
    },
    {
        "id": "BB-03",
        "nom": "Gantelets du Sprint",
        "categorie": "lanceur",
        "description": "Paire de gantelets lance-disques, un disque par gantelet et par tir. Réglage de taille par sangle.",
        "prix_euros": 79.9,
        "conditionnement": "1 paire de gantelets",
        "consommables": [
            "disque-mousse"
        ],
        "portee_m": 5,
        "cadence_tirs_min": 30,
        "poids_g": 900,
        "dimensions_cm": {
            "longueur": 28,
            "largeur": 18,
            "hauteur": 16
        },
        "indice_protection": None,
        "effets": [
            "LED violettes",
            "jingle de montée de niveau"
        ],
        "image": "images/gantelets-sprint.jpg",
        "favori": False
    },
    {
        "id": "BB-05",
        "nom": "Coin-Coin de Crise",
        "categorie": "lanceur",
        "description": "Canon à canards en mousse, chargement par l’avant. Chaque canard émet un coin-coin au départ.",
        "prix_euros": 54.5,
        "conditionnement": "1 canon",
        "consommables": [
            "canard-mousse"
        ],
        "portee_m": 5,
        "cadence_tirs_min": 18,
        "poids_g": 1000,
        "dimensions_cm": {
            "longueur": 38,
            "largeur": 15,
            "hauteur": 22
        },
        "indice_protection": None,
        "effets": [
            "coin-coin au départ du canard",
            "LED jaunes"
        ],
        "image": "images/coin-coin-crise.jpg",
        "favori": False
    },
    {
        "id": "BB-06",
        "nom": "Arbalète Anti-Réunionite",
        "categorie": "lanceur",
        "description": "Arbalète à fléchettes en mousse, armement à levier. Un « ding » signale chaque tir.",
        "prix_euros": 44.9,
        "conditionnement": "1 arbalète",
        "consommables": [
            "flechette-mousse"
        ],
        "portee_m": 7,
        "cadence_tirs_min": 15,
        "poids_g": 700,
        "dimensions_cm": {
            "longueur": 40,
            "largeur": 30,
            "hauteur": 15
        },
        "indice_protection": None,
        "effets": [
            "LED bleues",
            "ding de fin de réunion"
        ],
        "image": "images/arbalete-anti-reunionite.jpg",
        "favori": False
    },
    {
        "id": "BB-07",
        "nom": "Catapulte à Croissants",
        "categorie": "lanceur",
        "description": "Catapulte de bureau à bras réglable pour croissants en mousse. Non comestible.",
        "prix_euros": 59.5,
        "conditionnement": "1 catapulte de bureau",
        "consommables": [
            "croissant-mousse"
        ],
        "portee_m": 4,
        "cadence_tirs_min": 6,
        "poids_g": 1400,
        "dimensions_cm": {
            "longueur": 480,
            "largeur": 20,
            "hauteur": 30
        },
        "indice_protection": None,
        "effets": [
            "clochette de boulangerie",
            "senteur de croissant chaud"
        ],
        "image": "images/catapulte-croissants.jpg",
        "favori": False
    },
    {
        "id": "BB-08",
        "nom": "Orbe de Décompression",
        "categorie": "lanceur",
        "description": "Lanceur sphérique de balles en mousse, tenu à une main. Halo vert pendant le chargement.",
        "prix_euros": 49.9,
        "conditionnement": "1 lanceur",
        "consommables": [
            "balle-mousse"
        ],
        "portee_m": 6,
        "cadence_tirs_min": 24,
        "poids_g": 800,
        "dimensions_cm": {
            "longueur": 24,
            "largeur": 20,
            "hauteur": 20
        },
        "indice_protection": None,
        "effets": [
            "halo vert pulsé",
            "bourdonnement grave"
        ],
        "image": "images/orbe-decompression.jpg",
        "favori": False
    },
    {
        "id": "RE-01",
        "nom": "Fléchettes de rappel",
        "categorie": "munition",
        "description": "Fléchettes en mousse à embout souple, compatibles avec la Rafale de Post-it et l’Arbalète Anti-Réunionite.",
        "prix_euros": 9.5,
        "conditionnement": "lot de 20 fléchettes",
        "consommables": [
            "flechette-mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 100,
        "dimensions_cm": {
            "longueur": 18,
            "largeur": 12,
            "hauteur": 5
        },
        "indice_protection": None,
        "effets": [],
        "image": "images/flechettes-rappel.jpg",
        "favori": False
    },
    {
        "id": "RE-02",
        "nom": "Mini-requins fumigènes",
        "categorie": "munition",
        "description": "Mini-requins en mousse pour le Requin Arêtes, avec LED et cartouche de fumée froide rechargeable.",
        "prix_euros": 59.9,
        "conditionnement": "lot de 4 mini-requins",
        "consommables": [
            "requin_mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 360,
        "dimensions_cm": {
            "longueur": 30,
            "largeur": 20,
            "hauteur": 10
        },
        "indice_protection": None,
        "effets": [
            "trajectoire en zigzag",
            "fumée froide rose et bleue",
            "sifflement aigu",
            "senteur barbe à papa"
        ],
        "image": "images/mini-requins.jpg",
        "favori": False
    },
    {
        "id": "RE-03",
        "nom": "Disques de livraison",
        "categorie": "munition",
        "description": "Disques en mousse pour les Gantelets du Sprint.",
        "prix_euros": 11.5,
        "conditionnement": "lot de 12 disques",
        "consommables": [
            "disque-mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 180,
        "dimensions_cm": {
            "longueur": 15,
            "largeur": 15,
            "hauteur": 6
        },
        "indice_protection": None,
        "effets": [],
        "image": "images/disques-livraison.jpg",
        "favori": "False"
    },
    {
        "id": "RE-04",
        "nom": "Canards de soutien",
        "categorie": "munition",
        "description": "Canards en mousse pour le Coin-Coin de Crise, avec puce sonore.",
        "prix_euros": 12.9,
        "conditionnement": "lot de 6 canards",
        "consommables": [
            "canard-mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 210,
        "dimensions_cm": {
            "longueur": 24,
            "largeur": 16,
            "hauteur": 8
        },
        "indice_protection": None,
        "effets": [
            "coin-coin"
        ],
        "image": "images/canards-soutien.jpg",
        "favori": False
    },
    {
        "id": "RE-05",
        "nom": "Croissants de réserve",
        "categorie": "munition",
        "description": "Croissants en mousse parfumés pour la Catapulte à Croissants. Non comestible.",
        "prix_euros": 13.5,
        "conditionnement": "lot de 8 croissants",
        "consommables": [
            "croissant-mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 200,
        "dimensions_cm": {
            "longueur": 25,
            "largeur": 18,
            "hauteur": 8
        },
        "indice_protection": None,
        "effets": [
            "senteur de croissant chaud"
        ],
        "image": "images/croissants-reserve.jpg",
        "favori": False
    },
    {
        "id": "RE-06",
        "nom": "Balles de décompression",
        "categorie": "munition",
        "description": "Balles en mousse pour l’Orbe de Décompression.",
        "prix_euros": 890,
        "conditionnement": "lot de 10 balles",
        "consommables": [
            "balle-mousse"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 150,
        "dimensions_cm": {
            "longueur": 20,
            "largeur": 15,
            "hauteur": 8
        },
        "indice_protection": None,
        "effets": [],
        "image": "images/balles-decompression.jpg",
        "favori": False
    },
    {
        "id": "RE-07",
        "nom": "Brume neutre",
        "categorie": "recharge",
        "description": "Cartouche d’eau pour la Brume de Bonne Humeur, sans senteur.",
        "prix_euros": 5.5,
        "conditionnement": "1 cartouche de 100 ml",
        "consommables": [
            "brume-neutre"
        ],
        "portee_m": None,
        "cadence_tirs_min": None,
        "poids_g": 130,
        "dimensions_cm": {
            "longueur": 4,
            "largeur": 4,
            "hauteur": 12
        },
        "indice_protection": None,
        "effets": [
            "brume d’eau"
        ],
        "image": "images/brume-neutre.jpg",
        "favori": False
    }
]
