# 04 - Scénario complet avec Swagger

Ce guide décrit pas à pas l’installation du projet, le lancement des émulateurs Firebase et l’utilisation de **Swagger UI** pour exécuter un scénario complet (Admin → Professeur → Étudiant) sans avoir besoin d’outils externes.

---

## 1. Prérequis

1. Installer **Node.js 22+** : https://nodejs.org/
2. (Optionnel) Installer **Git** : https://git-scm.com/
3. Installer le **Firebase CLI** :
   ```powershell
   npm install -g firebase-tools
   ```
4. (Optionnel) Se connecter à Firebase (utile pour le déploiement) :
   ```powershell
   firebase login
   ```

---

## 2. Installation du projet

```powershell
cd C:\03-projetsGA\firebasefunctionsrest

# Installer les dépendances racine
npm install

# Installer les dépendances des functions
cd functions
npm install

# Compiler le TypeScript
npm run build

# Revenir à la racine
cd ..
```

---

## 3. Lancer les émulateurs Firebase

### 3.1 Nettoyer les anciens processus
```powershell
Stop-Process -Name node,java -Force -ErrorAction SilentlyContinue
```

### 3.2 Démarrer les émulateurs
```powershell
npm run serve
```
Attendre le message : `✔  All emulators ready!`

### 3.3 URLs locales utiles
| Service          | URL                                                       | Description                            |
|------------------|-----------------------------------------------------------|----------------------------------------|
| UI émulateurs    | http://localhost:4000                                     | Console pour gérer Auth/Firestore/logs |
| API base         | http://localhost:5001/backend-demo-1/us-central1/api      | Redirige vers Swagger                  |
| Swagger UI       | http://localhost:5001/backend-demo-1/us-central1/api/docs/| Documentation interactive (notez le `/` final) |
| Health check     | http://localhost:5001/backend-demo-1/us-central1/api/health| Vérifie que l’API répond               |

### 3.4 Vérifier le health check
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/backend-demo-1/us-central1/api/health"
```
Résultat attendu : `{ "ok": true, ... }`

---

## 4. Utiliser Swagger UI

1. Ouvrir **http://localhost:5001/backend-demo-1/us-central1/api/docs/** (très important : `/` final).
2. Les sections apparaissent dans la colonne de gauche : Auth, Health, Profile, Admin, Courses, Enrollments, Notes.
3. Si la page ne se charge pas, forcer le rafraîchissement (`Ctrl + F5`) ou utiliser la navigation privée.

---

## 5. Scénario complet via Swagger

### 5.1 Créer le compte administrateur
- Section **Auth** → `POST /v1/auth/signup`
- Cliquer sur **Try it out** → remplacer le JSON par :
  ```json
  {
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin",
    "firstName": "Super",
    "lastName": "Admin"
  }
  ```
- Cliquer sur **Execute** → Status `201 Created`
- Le compte Auth **et** le profil Firestore sont créés automatiquement.

### 5.2 Obtenir le token admin
- Toujours dans **Auth** → `POST /v1/auth/signin-info`
- `Try it out` → JSON :
  ```json
  {
    "email": "admin@school.com",
    "password": "admin123"
  }
  ```
- `Execute` → la réponse contient `instructions.powershell`
- Copier la commande PowerShell, l’exécuter dans un terminal → récupérer le `idToken`.

# exemple 1 
```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$login.idToken

# exemple 2 
```powershell
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" -ContentType "application/json" -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'; $login.idToken
```



### 5.3 Autoriser Swagger avec le token
- Cliquer sur **Authorize** (icône cadenas)
- Saisir `Bearer <ID_TOKEN>`
- Cliquer sur **Authorize** → **Close**

### 5.4 Vérifier le profil admin
- Section **Profile** → `GET /v1/profile` → `Execute`

### 5.5 Créer un professeur
- Section **Admin** → `POST /v1/users`
- Corps :
  ```json
  {
    "email": "prof.martin@school.com",
    "password": "prof123",
    "role": "professor",
    "firstName": "Jean",
    "lastName": "Martin"
  }
  ```

### 5.6 Créer un étudiant
- `POST /v1/users` avec :
  ```json
  {
    "email": "sophie.dubois@school.com",
    "password": "student123",
    "role": "student",
    "firstName": "Sophie",
    "lastName": "Dubois"
  }
  ```

### 5.7 Lister les utilisateurs
- `GET /v1/users` → on visualise admin, professeur et étudiant.

---

## 6. Rôle professeur

### 6.1 Obtenir le token professeur
- **Auth** → `POST /v1/auth/signin-info`
  ```json
  {
    "email": "prof.martin@school.com",
    "password": "prof123"
  }
  ```
- Exécuter la commande PowerShell fournie → copier l’`idToken`.
- Cliquer sur **Authorize** → remplacer le token par `Bearer <TOKEN_PROF>`.

### 6.2 Créer des cours
- **Courses** → `POST /v1/courses`
  ```json
  {
    "title": "Introduction à Python",
    "description": "Apprendre les bases de Python",
    "maxStudents": 30
  }
  ```
- Créer un second cours si besoin (JavaScript, etc.).

### 6.3 Mes cours
- `GET /v1/courses/my` → affiche tous les cours du professeur.

### 6.4 Voir les inscriptions
- `GET /v1/courses/{courseId}/enrollments` (après inscriptions des étudiants).

---

## 7. Rôle étudiant

### 7.1 Obtenir le token
- **Auth** → `POST /v1/auth/signin-info`
  ```json
  {
    "email": "sophie.dubois@school.com",
    "password": "student123"
  }
  ```
- Exécuter la commande PowerShell → récupérer le token.
- Autoriser Swagger avec `Bearer <TOKEN_ETUDIANT>`.

### 7.2 S’inscrire à un cours
- **Enrollments** → `POST /v1/enrollments`
  ```json
  {
    "courseId": "<ID_COURS>"
  }
  ```

### 7.3 Vérifier ses inscriptions
- `GET /v1/enrollments/my`

### 7.4 Annuler une inscription
- `DELETE /v1/enrollments/{id}`

### 7.5 Notes personnelles
- **Notes** → `POST /v1/notes` pour créer une note.
- `GET /v1/notes`, `PUT /v1/notes/{id}`, `DELETE /v1/notes/{id}` pour gérer ses notes.

---

## 8. URLs utiles

| Usage              | URL                                                                 |
|--------------------|----------------------------------------------------------------------|
| Swagger            | http://localhost:5001/backend-demo-1/us-central1/api/docs/          |
| Schéma OpenAPI     | http://localhost:5001/backend-demo-1/us-central1/api/docs/openapi.json |
| Health check       | http://localhost:5001/backend-demo-1/us-central1/api/health         |
| API base           | http://localhost:5001/backend-demo-1/us-central1/api                |
| UI Emulateur       | http://localhost:4000                                                |

---

## 9. Arrêter ou redémarrer rapidement

```powershell
# Arrêter les émulateurs
Stop-Process -Name node,java -Force -ErrorAction SilentlyContinue

# Recompiler et relancer
cd C:\03-projetsGA\firebasefunctionsrest\functions
npm run build
cd ..
npm run serve
```

---

Swagger est désormais pleinement fonctionnel : vous pouvez réaliser l’intégralité du scénario (création d’utilisateurs, cours, inscriptions, notes) uniquement depuis l’interface Swagger UI, aussi bien en local qu’après déploiement.
