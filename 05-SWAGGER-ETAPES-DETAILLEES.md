# 05 - Scénario Swagger détaillé (A → Z)

Ce document complète `04-SWAGGER-ETAPES.md` en proposant un **parcours opérationnel complet** :
- préparation de l’environnement ;
- description du schéma de données généré par les fonctions Cloud ;
- explication détaillée des rôles (Admin, Professeur, Étudiant) ;
- scénario chronologique utilisant **uniquement Swagger UI** ;
- annexes avec les corps JSON prêts à copier/coller ;
- idées de tests négatifs pour valider le contrôle d’accès.

---

## 1. Mise en place rapide

```powershell
# 1. Aller dans le projet
cd C:\03-projetsGA\firebasefunctionsrest

# 2. Installer les dépendances racine
npm install

# 3. Installer les dépendances des fonctions
cd functions
npm install

# 4. Compiler TypeScript
npm run build

# 5. Revenir à la racine et lancer les émulateurs
cd ..
Stop-Process -Name node,java -Force -ErrorAction SilentlyContinue
npm run serve
```

Attendre le message `✔  All emulators ready!`.

### URLs locales essentielles
| Service | URL | Utilisation |
|---------|-----|-------------|
| Swagger UI | http://localhost:5001/backend-demo-1/us-central1/api/docs/ | Interface de test (gardez le `/` final)
| Health | http://localhost:5001/backend-demo-1/us-central1/api/health | Vérifie que l’API répond
| OpenAPI | http://localhost:5001/backend-demo-1/us-central1/api/docs/openapi.json | Schéma utilisé par Swagger
| Emulator UI | http://localhost:4000 | Outil visuel pour Auth & Firestore

---

## 2. Schéma de données (Firestore)

| Collection | Clef | Champs principaux | Description |
|------------|------|-------------------|-------------|
| `users` | UID Firebase | `email`, `role`, `firstName`, `lastName`, `createdAt`, `updatedAt` | Profil applicatif. Le rôle pilote les autorisations.
| `courses` | ID auto (doc) | `title`, `description`, `maxStudents`, `professorUid`, `createdAt`, `updatedAt` | Cours créés par les professeurs (ou admin).
| `enrollments` | ID auto | `courseId`, `studentUid`, `status`, `enrolledAt` | Inscriptions des étudiants ; `status` = `active/cancelled`.
| `notes` | ID auto | `ownerUid`, `title`, `content`, `createdAt`, `updatedAt` | Notes privées par utilisateur.

Chaque écriture est auditée par les règles Firestore :
- les admins peuvent tout faire ;
- les professeurs manipulent leurs cours ;
- les étudiants gèrent uniquement leurs inscriptions et leurs notes.

---

## 3. Rôles et permissions

### Admin
- créer / lire / mettre à jour / supprimer les utilisateurs ;
- créer & gérer les cours (comme un professeur) ;
- consulter toutes les inscriptions & notes (via Firestore ou outils admin).

### Professeur
- gérer ses propres cours (`POST/PUT/DELETE /v1/courses`) ;
- consulter les inscriptions de ses cours (`GET /v1/courses/{courseId}/enrollments`).

### Étudiant
- consulter la liste des cours (`GET /v1/courses`) ;
- s’inscrire / se désinscrire (`POST/DELETE /v1/enrollments`) ;
- gérer ses notes (`/v1/notes`).

> Swagger applique les middlewares `requireAdmin`, `requireProfessor`, `requireStudent` : l’icône cadenas doit être mis à jour quand on change de rôle.

---

## 4. Scénario complet via Swagger UI

### Étape 0 — Ouvrir Swagger
- URL : **http://localhost:5001/backend-demo-1/us-central1/api/docs/**
- Nettoyer le cache si nécessaire (`Ctrl + F5`).

### Étape 1 — Créer le super administrateur
1. Section **Auth** → `POST /v1/auth/signup` → **Try it out**.
2. Coller le JSON `ADMIN_SIGNUP` (voir annexe A.1).
3. `Execute` → Status `201 Created`.

### Étape 2 — Récupérer son token
1. Toujours dans **Auth** → `POST /v1/auth/signin-info`.
2. Coller le JSON `ADMIN_SIGNIN`.
3. `Execute` → La réponse contient `instructions.powershell`.
4. Copier la commande, exécuter dans PowerShell → récupérer `idToken`.

### Étape 3 — Se connecter dans Swagger
1. Cliquer sur **Authorize** (cadenas).
2. Coller `Bearer {ID_TOKEN}`.
3. `Authorize` → `Close`.

### Étape 4 — Vérifier son profil
- **Profile** → `GET /v1/profile` → `Execute`.
- Vérifier que `role` = `admin`.

### Étape 5 — Créer les comptes Professeur & Étudiant
1. **Admin** → `POST /v1/users` → coller `PROFESSOR_CREATE`.
2. Répéter avec `STUDENT_CREATE`.
3. Optionnel : `GET /v1/users` (filtrer par rôle).

### Étape 6 — Basculer en professeur
1. **Auth** → `POST /v1/auth/signin-info` avec `prof.martin@school.com`.
2. Exécuter la commande PowerShell → récupérer le token.
3. Dans Swagger → **Authorize** → remplacer par le token professeur.
4. **Profile** → `GET /v1/profile` (rôle `professor`).

### Étape 7 — Créer des cours
1. **Courses** → `POST /v1/courses` → JSON `COURSE_PYTHON`.
2. Créer un second cours (ex. `COURSE_JS`).
3. **Courses** → `GET /v1/courses/my` → vérifiez les cours du professeur.

### Étape 8 — Passer en étudiant
1. **Auth** → `POST /v1/auth/signin-info` avec `sophie.dubois@school.com`.
2. Exécuter la commande → récupérer le token étudiant.
3. Dans Swagger → **Authorize** → remplacer par le token étudiant.
4. **Profile** → `GET /v1/profile` (rôle `student`).

### Étape 9 — S’inscrire à un cours
1. **Courses** → `GET /v1/courses` → récupérer l’un des `id`.
2. **Enrollments** → `POST /v1/enrollments` → corps `ENROLL_IN_COURSE`.
3. **Enrollments** → `GET /v1/enrollments/my` → vérifier l’inscription.
4. (Optionnel) `DELETE /v1/enrollments/{id}` → annuler.

### Étape 10 — Gérer ses notes
1. **Notes** → `POST /v1/notes` → corps `NOTE_CREATE`.
2. `GET /v1/notes` → vérifier.
3. `PUT /v1/notes/{id}` → mettre à jour.
4. `DELETE /v1/notes/{id}` → supprimer.

### Étape 11 — Retour professeur pour voir les inscriptions
1. Ré-authentifier Swagger avec le token professeur.
2. **Courses** → `GET /v1/courses/{courseId}/enrollments` → vérifier l’étudiant.

### Étape 12 — Tests Admin complémentaires
1. Ré-authentifier Swagger avec le token admin.
2. `GET /v1/users/{uid}` → vérifier un utilisateur spécifique.
3. `PUT /v1/users/{uid}` → changer le nom d’un étudiant.
4. `DELETE /v1/users/{uid}` → tester la suppression (attention aux impacts !).

---

## 5. Checklists par rôle

### 5.1 Admin
- Authentification : signup → signin-info → Authorize → profil.
- Gestion utilisateurs : `POST/GET/PUT/DELETE /v1/users`, `GET /v1/users/{uid}`.
- Gestion cours : `POST /v1/courses`, `PUT/DELETE /v1/courses/{id}`, `GET /v1/courses`.
- Suivi global : `GET /v1/courses/{courseId}/enrollments`, accès aux notes via Firestore.
- Tests négatifs : essayer `requireAdmin` sans token → 401, avec token professeur → 403.

### 5.2 Professeur
- Connexion : signin-info → Authorize → `GET /v1/profile`.
- Cours : `POST`, `PUT`, `DELETE`, `GET /v1/courses/my`.
- Inscriptions : `GET /v1/courses/{courseId}/enrollments` (lecture seule).
- Tests négatifs : tentative `DELETE /v1/users/{uid}` → 403 ; `POST /v1/enrollments` → 403.

### 5.3 Étudiant
- Connexion : signin-info → Authorize.
- Cours : `GET /v1/courses` (lecture).
- Inscriptions : `POST /v1/enrollments`, `GET /v1/enrollments/my`, `DELETE /v1/enrollments/{id}`.
- Notes : CRUD complet sur `/v1/notes`.
- Tests négatifs : `POST /v1/courses` → 403 ; `DELETE /v1/users/{uid}` → 403.

---

## 6. Annexes — JSON prêts à l’emploi

### A.1 Comptes
```json
// ADMIN_SIGNUP
{
  "email": "admin@school.com",
  "password": "Admin123!",
  "role": "admin",
  "firstName": "Super",
  "lastName": "Admin"
}

// ADMIN_SIGNIN
{
  "email": "admin@school.com",
  "password": "Admin123!"
}

// PROFESSOR_CREATE
{
  "email": "prof.martin@school.com",
  "password": "Prof123!",
  "role": "professor",
  "firstName": "Jean",
  "lastName": "Martin"
}

// STUDENT_CREATE
{
  "email": "sophie.dubois@school.com",
  "password": "Student123!",
  "role": "student",
  "firstName": "Sophie",
  "lastName": "Dubois"
}
```

### A.2 Cours
```json
// COURSE_PYTHON
{
  "title": "Introduction à Python",
  "description": "Bases de Python, variables, boucles, fonctions.",
  "maxStudents": 25
}

// COURSE_JS
{
  "title": "JavaScript Moderne",
  "description": "ES2023, async/await, APIs REST.",
  "maxStudents": 20
}
```

### A.3 Inscriptions & Notes
```json
// ENROLL_IN_COURSE
{
  "courseId": "REMPLACER_PAR_ID_COURS"
}

// NOTE_CREATE
{
  "title": "Révision Python",
  "content": "Lister les notions importantes avant le quiz."
}

// NOTE_UPDATE
{
  "title": "Révision Python",
  "content": "Ajout exercices sur les listes et dictionnaires."
}
```

### A.4 Liste complète des URL

Toutes les routes sont exposées derrière le préfixe Firebase Functions :
`http://localhost:5001/backend-demo-1/us-central1/api`

| Type | Méthode | Chemin | Description |
|------|---------|--------|-------------|
| Documentation | GET | `/docs/` | Interface Swagger UI |
| Documentation | GET | `/docs/openapi.json` | Schéma OpenAPI généré |
| Public | GET | `/health` | Health check |
| Auth | POST | `/v1/auth/signup` | Créer un compte (Auth + Firestore) |
| Auth | POST | `/v1/auth/signin-info` | Obtenir les instructions pour un token |
| Profil | GET | `/v1/profile` | Lire son profil |
| Profil | PUT | `/v1/profile` | Mettre à jour prénom/nom |
| Admin | POST | `/v1/users` | Créer un utilisateur |
| Admin | GET | `/v1/users` | Lister les utilisateurs |
| Admin | GET | `/v1/users/{uid}` | Lire un utilisateur |
| Admin | PUT | `/v1/users/{uid}` | Modifier rôle / nom |
| Admin | DELETE | `/v1/users/{uid}` | Supprimer un utilisateur |
| Cours | GET | `/v1/courses` | Lister tous les cours |
| Cours | POST | `/v1/courses` | Créer un cours (prof/admin) |
| Cours | GET | `/v1/courses/{id}` | Lire un cours |
| Cours | PUT | `/v1/courses/{id}` | Modifier un cours |
| Cours | DELETE | `/v1/courses/{id}` | Supprimer un cours |
| Cours | GET | `/v1/courses/my` | Lister MES cours (professeur) |
| Cours | GET | `/v1/courses/{courseId}/enrollments` | Voir inscriptions d’un cours |
| Inscriptions | POST | `/v1/enrollments` | S’inscrire à un cours |
| Inscriptions | GET | `/v1/enrollments/my` | Voir MES inscriptions |
| Inscriptions | DELETE | `/v1/enrollments/{id}` | Annuler une inscription |
| Notes | GET | `/v1/notes` | Lister MES notes |
| Notes | POST | `/v1/notes` | Créer une note |
| Notes | GET | `/v1/notes/{id}` | Lire une note |
| Notes | PUT | `/v1/notes/{id}` | Modifier une note |
| Notes | DELETE | `/v1/notes/{id}` | Supprimer une note |

> Pour la production, remplacez l’hôte par `https://us-central1-backend-demo-1.cloudfunctions.net/api`.

---

## 7. Tests négatifs recommandés

| Cas | Endpoint | Résultat attendu |
|-----|----------|------------------|
| Sans token | `GET /v1/profile` | 401 Unauthorized |
| Token étudiant sur route admin | `GET /v1/users` | 403 Forbidden |
| CourseId invalide | `POST /v1/enrollments` | 404 Not Found |
| maxStudents < 1 | `POST /v1/courses` | 422 ValidationError |
| Note trop courte (title vide) | `POST /v1/notes` | 422 |
| Suppression cours d’un autre prof | `DELETE /v1/courses/{id}` (token prof B) | 403 |

---

## 8. Astuces Swagger
- Le bouton **Authorize** accepte plusieurs tokens ; penser à cliquer sur **Logout** avant de changer d’utilisateur.
- Les réponses `signin-info` sont copiables directement (clic sur l’icône copier).
- En cas de `403`, vérifier le rôle courant avec `GET /v1/profile`.

---

## 9. Revenir à un état propre

```powershell
# Sauvegarder (optionnel)
firebase emulators:export ./.emulator-data

# Arrêter
Stop-Process -Name node,java -Force -ErrorAction SilentlyContinue

# Nettoyer Firestore (optionnel)
Remove-Item -Recurse -Force .\.emulator-data
```

Vous disposez maintenant d’un guide complet pour démontrer la solution RBAC via Swagger UI, du provisioning initial jusqu’aux tests négatifs par rôle. Bonnes démos !
