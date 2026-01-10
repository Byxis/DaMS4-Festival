![](banner_polytech_dams.png)

# DaMS4 - Festival

<div align="center">

**🌍 Language / Langue**

[![🇺🇸 English](https://img.shields.io/badge/🇺🇸-English-lightgrey?style=for-the-badge)](README.md)
[![🇫🇷 Français](https://img.shields.io/badge/🇫🇷-Français-blue?style=for-the-badge)](README.fr.md)

---

</div>

# DaMS4 - Festival

DaMS4 Festival est une application web spécialisée conçue pour l'organisation de **festivals de jeux de société**. Elle permet aux organisateurs de gérer le cycle de vie complet des réservations de tables et d'espaces de jeu par les éditeurs et les prestataires de services. L'application facilite la location d'espaces, le suivi des mètres carrés disponibles (convertis en tables) et la logistique des affectations de jeux à travers différentes zones tarifaires et zones de plan.

## Fonctionnalités Clés

L'application est structurée autour de plusieurs fonctionnalités principales :

### 1. Logistique des Festivals & Zones
- **Support Multi-Festival** : Créez, gérez et basculez facilement entre différents festivals.
- **Zones Tarifaires** : Définissez des zones avec des règles de tarification spécifiques (par table ou m²) et des types de tables (standard, grandes, tables de ville).
- **Suivi d'Espace** : Suivi en temps réel de la "jauge" disponible et des stocks de tables pour éviter les surréservations.

### 2. Éditeurs & Réservataires
- **Workflow des Réservataires** : Gérez différents types de réservataires (Éditeurs, Prestataires, Associations, Boutiques, Animations).
- **Historique des Interactions** : Suivez le statut de chaque relation : *À Contacter*, *Contacté*, *En Discussion*, *Réservé*, ou *Absent*.
- **Base de Données Contacts** : Gestion centralisée des contacts de facturation et des détails des éditeurs.

### 3. Réservation & Facturation
- **Moteur de Réservation** : Gérez les réservations pour des nombres spécifiques de tables à travers plusieurs zones tarifaires.
- **Gestion Financière** : Calculs de facturation automatisés incluant les remises globales et les coûts d'espace.
- **Suivi de Statut** : Suivez les états des réservations (`Facturé`, `Payé`) et gérez la conformité financière.

### 4. Gestion & Affectation des Jeux
- **Catalogue de Jeux** : Maintenez un portefeuille détaillé de jeux (Nom, Type, Tranche d'Âge, Auteurs).
- **Affectation des Tables** : Allocation de jeux spécifiques aux tables réservées et aux zones de plan (ex: "Jeu X assigné à 1/2 grande table dans la Zone A").
- **Logique d'Exposition** : Distinguez entre les jeux fournis par les éditeurs et les jeux présentés par le festival.

### 5. Authentification & Sécurité
- **Contrôle d'Accès** : Connexion/déconnexion sécurisée pour les organisateurs du festival.
- **Privilèges Admin** : Protection basée sur les rôles pour les opérations sensibles comme la création de festival et la configuration logique.

---

### Stack Technique

- **Frontend** : Angular 20, SCSS
- **Backend** : Node.js, Express, TypeScript
- **Base de données** : PostgreSQL
- **Stockage de fichiers** : Multer
- **Sécurité** : Authentification JWT

## Prérequis

- Docker
- Docker Compose
- Git
- Node.js
- npm

## Installation

Pour installer l'application, suivez ces étapes :

1. Cloner le dépôt :
```bash
$ git clone https://github.com/byxis/DaMS4-Festival.git
```

2. Installer les dépendances :
```bash
$ cd DaMS4-Festival
$ npm install
```

3. Copier le fichier .env.example vers .env et remplir les valeurs :
```bash
$ cp backend/.env.example .env
$ nano .env
```

4. Ajouter vos fichiers de certificats dans le répertoire `certs` :
```bash
$ cp /path/to/your/cert.pem /path/to/your/key.pem certs/
```
*Note : Les fichiers de certificats peuvent devoir être ajoutés au répertoire `backend/certs` et au répertoire `frontend/certs`*

5. Lancer l'application avec docker :
```bash
$ docker compose -f docker-compose.prod.yml up --build
```

## Auteurs

<div align="center">

| [<img src="https://github.com/byxis.png" width="100px" style="border-radius: 50%;" alt="Alexis Serrano"/>](https://github.com/byxis) | [<img src="https://github.com/AndreaAntoniali.png" width="100px" style="border-radius: 50%;" alt="Andréa Antoniali"/>](https://github.com/AndreaAntoniali) | [<img src="https://github.com/esternielsen.png" width="100px" style="border-radius: 50%;" alt="Esther Nielsen"/>](https://github.com/esternielsen) | [<img src="https://github.com/YoanBst.png" width="100px" style="border-radius: 50%;" alt="Yoan Bastide"/>](https://github.com/YoanBst) |
| :---: | :---: | :---: | :---: |
| **Alexis Serrano** | **Andréa Antoniali** | **Esther Nielsen** | **Yoan Bastide** |
| [![GitHub](https://img.shields.io/badge/GitHub-Byxis-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/byxis) | [![GitHub](https://img.shields.io/badge/GitHub-AndreaAntoniali-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AndreaAntoniali) | [![GitHub](https://img.shields.io/badge/GitHub-esternielsen-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/esternielsen) | [![GitHub](https://img.shields.io/badge/GitHub-YoanBst-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YoanBst) |

</div>
