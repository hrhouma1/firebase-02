# Firebase Functions REST API - Système de Gestion Académique avec RBAC

Une API REST complète avec **contrôle d'accès basé sur les rôles (RBAC)** pour gérer un système académique avec Firebase Functions, Express et authentification Firebase.

## Fonctionnalités

- **Authentification Firebase** avec tokens JWT
- **3 Rôles utilisateur** : Admin, Professeur, Étudiant
- **Gestion des utilisateurs** (Admin uniquement)
- **Gestion des cours** (Professeurs)
- **Inscriptions aux cours** (Étudiants)
- **Notes personnelles** (Tous les utilisateurs)
- **Firestore Security Rules** avec RBAC
- **Middlewares de vérification de rôles**
- **Documentation Swagger interactive**
- Support des émulateurs Firebase pour le développement local

## Les 3 Rôles

| Rôle | Permissions principales |
|------|------------------------|
| **Admin** | Gérer tous les utilisateurs, accès complet à toutes les fonctionnalités |
| **Professeur** | Créer et gérer ses cours, voir les inscriptions |
| **Étudiant** | S'inscrire aux cours, gérer ses inscriptions et notes |

## Prérequis

- Node.js 22+
- Firebase CLI: `npm install -g firebase-tools`
- Compte Firebase

## Installation

```bash
# Installer les dépendances root
npm install

# Installer les dépendances des functions
cd functions
npm install
cd ..
```

## Démarrage

### Émulateurs (développement local)

```bash
npm run serve
```

Cela démarre les émulateurs:
- **Functions**: http://localhost:5001
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8081
- **UI**: http://localhost:4000

### Déploiement en production

```bash
npm run deploy:all
```

## API Endpoints

### Public
- `GET /health` - Health check

### Profile (Authentifié)
- `GET /v1/profile` - Consulter son profil
- `PUT /v1/profile` - Modifier son profil

### Admin uniquement
- `POST /v1/users` - Créer un utilisateur
- `GET /v1/users` - Lister les utilisateurs (filtrable par rôle)
- `GET /v1/users/:uid` - Consulter un utilisateur
- `PUT /v1/users/:uid` - Modifier un utilisateur
- `DELETE /v1/users/:uid` - Supprimer un utilisateur

### Professeurs & Admins
- `POST /v1/courses` - Créer un cours
- `GET /v1/courses/my` - Lister ses cours
- `PUT /v1/courses/:id` - Modifier un cours
- `DELETE /v1/courses/:id` - Supprimer un cours
- `GET /v1/courses/:courseId/enrollments` - Voir les inscriptions d'un cours

### Étudiants & Admins
- `POST /v1/enrollments` - S'inscrire à un cours
- `GET /v1/enrollments/my` - Voir ses inscriptions
- `DELETE /v1/enrollments/:id` - Annuler une inscription

### Tous les utilisateurs authentifiés
- `GET /v1/courses` - Lister tous les cours
- `GET /v1/courses/:id` - Consulter un cours
- `POST /v1/notes` - Créer une note
- `GET /v1/notes` - Lister ses notes
- `GET /v1/notes/:id` - Consulter une note
- `PUT /v1/notes/:id` - Modifier une note
- `DELETE /v1/notes/:id` - Supprimer une note

## Tests de l'API

### Méthode 1 : Swagger UI (Le plus simple)

Interface graphique interactive dans votre navigateur :

**http://localhost:5001/backend-demo-1/us-central1/api/docs**

- Voir toutes les routes organisées par catégories
- Tester les endpoints en un clic
- Documentation interactive complète
- Schémas de données avec exemples

**Guide Swagger complet** : [01-SWAGGER-GUIDE.md](01-SWAGGER-GUIDE.md)

### Méthode 2 : Fichiers .http (Pour développeurs)

Utilisez l'extension **REST Client** pour tester l'API directement dans votre éditeur :

1. **Installer l'extension** : Recherchez "REST Client" dans VS Code/Cursor
2. **Ouvrir les fichiers** : Allez dans le dossier `api-tests/`
3. **Cliquer sur "Send Request"** au-dessus de chaque requête

**Fichiers disponibles :**
- `01-auth.http` - Authentification
- `02-admin.http` - Tests Admin
- `03-professor.http` - Tests Professeur  
- `04-student.http` - Tests Étudiant
- `05-workflow-complet.http` - Scénario complet
- `06-scenario-guide.http` - Scénario guidé étape par étape

**Guide détaillé** : [api-tests/00-README.md](api-tests/00-README.md)

### Méthode 3 : PowerShell

Consultez le **[02-GUIDE-RBAC.md](02-GUIDE-RBAC.md)** pour :
- Documentation complète de tous les endpoints
- Scripts PowerShell de test pour chaque rôle
- Tests de sécurité
- Tableau récapitulatif des permissions
- Scénarios complets d'utilisation

## Structure du projet

```
firebasefunctionsrest/
├── functions/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── noteController.ts         # CRUD notes
│   │   │   ├── userController.ts         # CRUD utilisateurs (Admin)
│   │   │   ├── courseController.ts       # CRUD cours (Professeurs)
│   │   │   └── enrollmentController.ts   # Inscriptions (Étudiants)
│   │   ├── middlewares/
│   │   │   ├── auth.ts                   # Authentification JWT
│   │   │   └── roles.ts                  # Vérification des rôles (RBAC)
│   │   ├── types/
│   │   │   └── index.ts                  # Types TypeScript
│   │   ├── firebase.ts                   # Configuration Firebase Admin
│   │   ├── swagger.ts                    # Configuration Swagger
│   │   └── index.ts                      # Routes Express
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.js
├── api-tests/                            # Tests avec REST Client
│   ├── 00-README.md
│   ├── 01-auth.http
│   ├── 02-admin.http
│   ├── 03-professor.http
│   ├── 04-student.http
│   ├── 05-workflow-complet.http
│   └── 06-scenario-guide.http
├── firebase.json
├── firestore.rules                       # Security Rules avec RBAC
├── firestore.indexes.json
├── package.json
├── README.md                             # Ce fichier
├── 01-SWAGGER-GUIDE.md                   # Guide Swagger
└── 02-GUIDE-RBAC.md                      # Guide complet PowerShell
```

## Sécurité

Les Firestore Security Rules garantissent que:
- Seuls les utilisateurs authentifiés peuvent créer des notes
- Les utilisateurs ne peuvent lire/modifier/supprimer que leurs propres notes
- Les rôles sont vérifiés côté serveur (middleware) et côté Firestore (rules)
- Chaque action est protégée selon le rôle de l'utilisateur

## Tableau des Permissions

| Action | Admin | Professeur | Étudiant |
|--------|-------|------------|----------|
| Gérer users | OUI | NON | NON |
| Créer cours | OUI | OUI | NON |
| Voir ses cours | OUI | OUI | OUI |
| Modifier ses cours | OUI | OUI | NON |
| S'inscrire aux cours | OUI | NON | OUI |
| Voir ses inscriptions | OUI | NON | OUI |
| Voir inscriptions d'un cours | OUI | OUI (ses cours) | NON |
| CRUD notes personnelles | OUI | OUI | OUI |

## Démarrage Rapide

```bash
# 1. Installer
npm install
cd functions && npm install && cd ..

# 2. Démarrer les émulateurs
npm run serve

# 3. Ouvrir Swagger UI
# http://localhost:5001/backend-demo-1/us-central1/api/docs

# 4. Suivre le guide pour créer le premier admin
# Voir 01-SWAGGER-GUIDE.md ou api-tests/06-scenario-guide.http
```

## Ressources

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Express.js](https://expressjs.com/)
- [Swagger/OpenAPI](https://swagger.io/)

## License

MIT

