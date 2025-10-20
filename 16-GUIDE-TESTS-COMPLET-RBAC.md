# Guide de Tests Complet - API Firebase avec RBAC

## Schéma de la base de données Firestore

```
Collections Firestore:
├── users/
│   ├── {uid}
│   │   ├── email
│   │   ├── role (admin | professor | student)
│   │   ├── firstName
│   │   ├── lastName
│   │   ├── createdAt
│   │   └── updatedAt
├── courses/
│   ├── {courseId}
│   │   ├── title
│   │   ├── description
│   │   ├── professorUid
│   │   ├── professorName
│   │   ├── maxStudents
│   │   ├── currentStudents
│   │   ├── createdAt
│   │   └── updatedAt
├── enrollments/
│   ├── {enrollmentId}
│   │   ├── courseId
│   │   ├── studentUid
│   │   ├── studentName
│   │   ├── enrolledAt
│   │   └── status (active | completed | cancelled)
└── notes/
    ├── {noteId}
    │   ├── title
    │   ├── content
    │   ├── ownerUid
    │   ├── createdAt
    │   └── updatedAt
```

---

## GUIDE - Les 3 Rôles

### Rôle STUDENT (Étudiant)
### Rôle PROFESSOR (Professeur)
### Rôle ADMIN (Administrateur)

---

## 1 – Commencer par créer 3 utilisateurs

### IMPORTANT : Démarrez d'abord les émulateurs Firebase

```bash
npm run serve
```

Attendez que vous voyiez :
```
All emulators ready! It is now safe to connect your app.
```

### Ouvrir Swagger UI

URL : http://localhost:5001/backend-demo-1/us-central1/api/docs/

---

### Utilisateur 1 - Admin

POST /v1/auth/signup

Étapes dans Swagger :
1. Localisez la section "Auth" dans la liste
2. Cliquez sur "POST /v1/auth/signup"
3. Cliquez sur le bouton "Try it out"
4. Dans le champ "Request body", collez :

```json
{
  "email": "admin@school.com",
  "password": "admin123",
  "role": "admin",
  "firstName": "Sophie",
  "lastName": "Administrateur"
}
```

5. Cliquez sur le bouton "Execute"
6. Vérifiez que la réponse est "201 Created"
7. Notez le "uid" dans la réponse (exemple: "abc123xyz")

Réponse attendue :
```json
{
  "data": {
    "uid": "abc123xyz",
    "email": "admin@school.com",
    "role": "admin",
    "firstName": "Sophie",
    "lastName": "Administrateur",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  },
  "message": "Account created successfully. You can now login."
}
```

---

### Utilisateur 2 - Professor

POST /v1/auth/signup

Étapes dans Swagger :
1. Restez dans la section "Auth"
2. Cliquez à nouveau sur "POST /v1/auth/signup"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "prof.martin@school.com",
  "password": "prof123",
  "role": "professor",
  "firstName": "Jean",
  "lastName": "Martin"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Notez le "uid" (exemple: "def456xyz")

---

### Utilisateur 3 - Student

POST /v1/auth/signup

Étapes dans Swagger :
1. Restez dans la section "Auth"
2. Cliquez à nouveau sur "POST /v1/auth/signup"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "student.dupont@school.com",
  "password": "student123",
  "role": "student",
  "firstName": "Marie",
  "lastName": "Dupont"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Notez le "uid" (exemple: "ghi789xyz")

---

## 2 – Comment se connecter et obtenir un token JWT

### MÉTHODE COMPLÈTE : Se connecter avec un utilisateur dans Swagger UI

---

## Utilisateur 1 – admin@school.com (ADMIN)

### Étape 2.1 - Appeler l'endpoint de connexion

POST /v1/auth/signin-info

1. Dans Swagger, localisez la section "Auth"
2. Cliquez sur "POST /v1/auth/signin-info"
3. Cliquez sur "Try it out"
4. Collez ce JSON dans le champ "Request body" :

```json
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

5. Cliquez sur "Execute"
6. La réponse contient des instructions PowerShell

Exemple de réponse :
```json
{
  "message": "Use PowerShell to get your token",
  "instructions": "$body = @{ email = 'admin@school.com'; password = 'admin123'; returnSecureToken = $true } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key' -Method POST -Body $body -ContentType 'application/json'; $response.idToken"
}
```

### Étape 2.2 - Exécuter le script PowerShell pour obtenir le token

1. Ouvrez PowerShell
   - Windows : Appuyez sur Windows + X, puis sélectionnez "Windows PowerShell"
   - Ou dans VS Code : Terminal > New Terminal

2. Copiez TOUT le script PowerShell depuis "instructions" dans la réponse

3. Collez le script dans PowerShell

4. Appuyez sur Entrée pour exécuter

5. PowerShell retourne un TOKEN (longue chaîne de caractères)

Exemple de token :
```
eyJhbGciOiJSUzI1NiIsImtpZCI6IjFmODhhY2U2ODc5ZGExNWQ1MmYwNGM4YmY4MjgzOWY2ZjEwMjQ0YzUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYmFja2VuZC1kZW1vLTEiLCJhdWQiOiJiYWNrZW5kLWRlbW8tMSIsImF1dGhfdGltZSI6MTcwNDA2NzIwMCwidXNlcl9pZCI6ImFiYzEyM3h5eiIsInN1YiI6ImFiYzEyM3h5eiIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDcwODAwLCJlbWFpbCI6ImFkbWluQHNjaG9vbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYWRtaW5Ac2Nob29sLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.très-long-token...
```

6. Sélectionnez TOUT le token
7. Copiez-le (Ctrl+C)

### Étape 2.3 - Ajouter le token à Swagger UI

1. Retournez dans la page Swagger UI (http://localhost:5001/backend-demo-1/us-central1/api/docs/)

2. Cherchez le bouton "Authorize" en haut à droite de la page
   - Il ressemble à un cadenas ouvert avec le texte "Authorize"

3. Cliquez sur le bouton "Authorize"

4. Une fenêtre popup s'ouvre avec :
   - Titre : "Available authorizations"
   - Un champ texte sous "BearerAuth (http, Bearer)"

5. Dans le champ "Value", collez votre TOKEN
   - NE PAS écrire "Bearer"
   - Collez SEULEMENT le token (la longue chaîne)

6. Cliquez sur le bouton "Authorize" dans la popup

7. Cliquez sur le bouton "Close" pour fermer la popup

8. Le bouton "Authorize" en haut à droite change :
   - Le cadenas devient fermé
   - C'est bon, vous êtes authentifié !

### Étape 2.4 - Vérifier que vous êtes connecté en tant qu'ADMIN

GET /v1/profile

1. Dans Swagger, localisez la section "Profile"
2. Cliquez sur "GET /v1/profile"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"

Réponse attendue :
```json
{
  "data": {
    "uid": "abc123xyz",
    "email": "admin@school.com",
    "role": "admin",
    "firstName": "Sophie",
    "lastName": "Administrateur",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
}
```

5. Vérifiez que "role" est bien "admin"
6. Si oui, vous êtes bien connecté en tant qu'ADMIN !

### Étape 2.5 - SE DÉCONNECTER (TRÈS IMPORTANT)

AVANT DE TESTER UN AUTRE RÔLE, DÉCONNECTEZ-VOUS TOUJOURS !

1. En haut à droite de Swagger, cliquez sur le bouton "Authorize" (cadenas fermé)
2. La popup s'ouvre
3. Cliquez sur le bouton "Logout"
4. Cliquez sur "Close"
5. Le cadenas redevient ouvert = vous êtes déconnecté

---

## Utilisateur 2 – prof.martin@school.com (PROFESSOR)

### Étape 2.6 - Connexion en tant que PROFESSOR

POST /v1/auth/signin-info

1. Dans Swagger, section "Auth"
2. Cliquez sur "POST /v1/auth/signin-info"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "prof.martin@school.com",
  "password": "prof123"
}
```

5. Cliquez sur "Execute"
6. Copiez le script PowerShell de la réponse

### Étape 2.7 - Obtenir le token PROFESSOR

1. Ouvrez PowerShell
2. Collez le script PowerShell
3. Exécutez (Entrée)
4. Copiez le TOKEN retourné

### Étape 2.8 - Ajouter le token à Swagger

1. Retournez dans Swagger
2. Cliquez sur "Authorize" (en haut à droite)
3. Collez le TOKEN dans le champ "Value"
4. Cliquez sur "Authorize" dans la popup
5. Cliquez sur "Close"
6. Le cadenas se ferme = authentifié en tant que PROFESSOR

### Étape 2.9 - Vérifier que vous êtes connecté en tant que PROFESSOR

GET /v1/profile

1. Cliquez sur "GET /v1/profile"
2. Cliquez sur "Try it out"
3. Cliquez sur "Execute"

Réponse attendue :
```json
{
  "data": {
    "uid": "def456xyz",
    "email": "prof.martin@school.com",
    "role": "professor",
    "firstName": "Jean",
    "lastName": "Martin"
  }
}
```

4. Vérifiez que "role" est bien "professor"

### Étape 2.10 - SE DÉCONNECTER

1. Cliquez sur "Authorize" (en haut à droite)
2. Cliquez sur "Logout"
3. Cliquez sur "Close"

---

## Utilisateur 3 – student.dupont@school.com (STUDENT)

### Étape 2.11 - Connexion en tant que STUDENT

POST /v1/auth/signin-info

1. Dans Swagger, section "Auth"
2. Cliquez sur "POST /v1/auth/signin-info"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "student.dupont@school.com",
  "password": "student123"
}
```

5. Cliquez sur "Execute"
6. Copiez le script PowerShell de la réponse

### Étape 2.12 - Obtenir le token STUDENT

1. Ouvrez PowerShell
2. Collez le script PowerShell
3. Exécutez (Entrée)
4. Copiez le TOKEN retourné

### Étape 2.13 - Ajouter le token à Swagger

1. Retournez dans Swagger
2. Cliquez sur "Authorize" (en haut à droite)
3. Collez le TOKEN dans le champ "Value"
4. Cliquez sur "Authorize" dans la popup
5. Cliquez sur "Close"
6. Le cadenas se ferme = authentifié en tant que STUDENT

### Étape 2.14 - Vérifier que vous êtes connecté en tant que STUDENT

GET /v1/profile

1. Cliquez sur "GET /v1/profile"
2. Cliquez sur "Try it out"
3. Cliquez sur "Execute"

Réponse attendue :
```json
{
  "data": {
    "uid": "ghi789xyz",
    "email": "student.dupont@school.com",
    "role": "student",
    "firstName": "Marie",
    "lastName": "Dupont"
  }
}
```

4. Vérifiez que "role" est bien "student"

### Étape 2.15 - SE DÉCONNECTER

1. Cliquez sur "Authorize" (en haut à droite)
2. Cliquez sur "Logout"
3. Cliquez sur "Close"

---

## RÉCAPITULATIF : Comment changer d'utilisateur

```
Étape 1 : SE DÉCONNECTER du rôle actuel
   1. Cliquez sur "Authorize" (en haut à droite)
   2. Cliquez sur "Logout"
   3. Cliquez sur "Close"

Étape 2 : SE CONNECTER avec un autre utilisateur
   1. POST /v1/auth/signin-info
   2. Collez email et password
   3. Cliquez sur "Execute"
   4. Copiez le script PowerShell

Étape 3 : OBTENIR LE TOKEN
   1. Ouvrez PowerShell
   2. Collez et exécutez le script
   3. Copiez le TOKEN

Étape 4 : AJOUTER LE TOKEN à Swagger
   1. Cliquez sur "Authorize"
   2. Collez le TOKEN
   3. Cliquez sur "Authorize"
   4. Cliquez sur "Close"

Étape 5 : VÉRIFIER LE RÔLE
   1. GET /v1/profile
   2. "Try it out" → "Execute"
   3. Vérifiez le "role" dans la réponse
```

RÈGLE D'OR : TOUJOURS se déconnecter avant de changer d'utilisateur !

---

## 3 - Testez les endpoints du rôle ADMINISTRATEUR

### Utilisateur 1 – admin@school.com (ADMIN)

### Préparation

1. DÉCONNECTEZ-VOUS si vous êtes connecté avec un autre rôle
2. CONNECTEZ-VOUS en tant qu'ADMIN (suivez les étapes 2.1 à 2.4)
3. VÉRIFIEZ votre profil (GET /v1/profile doit montrer "role": "admin")

---

### CHECKLIST COMPLÈTE DES TESTS ADMIN

Tests à effectuer dans l'ordre :
1. Auth & Profile (déjà fait)
2. Users (créer, lire, modifier, supprimer)
3. Courses (créer, lire, modifier, supprimer)
4. Notes (créer, lire, modifier, supprimer)
5. Tests de validation (erreurs)

---

## TEST 1 : Créer un utilisateur (Professor)

POST /v1/users

Étapes dans Swagger :
1. Localisez la section "Admin" dans la liste
2. Cliquez sur "POST /v1/users"
3. Cliquez sur "Try it out"
4. Collez ce JSON dans le champ "Request body" :

```json
{
  "email": "nouveau.prof@school.com",
  "password": "newprof123",
  "role": "professor",
  "firstName": "Pierre",
  "lastName": "Nouveau"
}
```

5. Cliquez sur "Execute"
6. Vérifiez que le statut est "201 Created"
7. Dans la réponse, copiez le "uid" (exemple: "xyz789abc")

Réponse attendue :
```json
{
  "data": {
    "uid": "xyz789abc",
    "email": "nouveau.prof@school.com",
    "role": "professor",
    "firstName": "Pierre",
    "lastName": "Nouveau"
  },
  "message": "User created successfully"
}
```

8. Notez ce uid quelque part : _________________

---

## TEST 2 : Lire tous les utilisateurs

GET /v1/users

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "GET /v1/users"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez le statut "200 OK"
6. Vous devez voir tous les utilisateurs créés (admin, professor, student, nouveau.prof)

Réponse attendue :
```json
{
  "data": [
    {
      "uid": "abc123xyz",
      "email": "admin@school.com",
      "role": "admin",
      "firstName": "Sophie",
      "lastName": "Administrateur"
    },
    {
      "uid": "def456xyz",
      "email": "prof.martin@school.com",
      "role": "professor",
      "firstName": "Jean",
      "lastName": "Martin"
    },
    {
      "uid": "ghi789xyz",
      "email": "student.dupont@school.com",
      "role": "student",
      "firstName": "Marie",
      "lastName": "Dupont"
    },
    {
      "uid": "xyz789abc",
      "email": "nouveau.prof@school.com",
      "role": "professor",
      "firstName": "Pierre",
      "lastName": "Nouveau"
    }
  ],
  "count": 4
}
```

---

## TEST 3 : Filtrer les utilisateurs par rôle

GET /v1/users?role=professor

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "GET /v1/users"
3. Cliquez sur "Try it out"
4. Dans le champ "role" (Query parameters), entrez : professor
5. Cliquez sur "Execute"
6. Vérifiez le statut "200 OK"
7. Vous devez voir SEULEMENT les professeurs

Réponse attendue :
```json
{
  "data": [
    {
      "uid": "def456xyz",
      "email": "prof.martin@school.com",
      "role": "professor",
      "firstName": "Jean",
      "lastName": "Martin"
    },
    {
      "uid": "xyz789abc",
      "email": "nouveau.prof@school.com",
      "role": "professor",
      "firstName": "Pierre",
      "lastName": "Nouveau"
    }
  ],
  "count": 2
}
```

---

## TEST 4 : Lire un utilisateur spécifique

GET /v1/users/{uid}

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "GET /v1/users/{uid}"
3. Cliquez sur "Try it out"
4. Dans le champ "uid", collez le uid que vous avez noté au TEST 1 (exemple: xyz789abc)
5. Cliquez sur "Execute"
6. Vérifiez le statut "200 OK"
7. Vous devez voir les détails de cet utilisateur

Réponse attendue :
```json
{
  "data": {
    "uid": "xyz789abc",
    "email": "nouveau.prof@school.com",
    "role": "professor",
    "firstName": "Pierre",
    "lastName": "Nouveau",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
}
```

---

## TEST 5 : Modifier un utilisateur

PUT /v1/users/{uid}

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "PUT /v1/users/{uid}"
3. Cliquez sur "Try it out"
4. Dans le champ "uid", collez le même uid (xyz789abc)
5. Dans le champ "Request body", collez :

```json
{
  "firstName": "Pierre",
  "lastName": "Nouveau-Dupont",
  "role": "professor"
}
```

6. Cliquez sur "Execute"
7. Vérifiez le statut "200 OK"
8. Le nom de famille a changé

Réponse attendue :
```json
{
  "data": {
    "uid": "xyz789abc",
    "email": "nouveau.prof@school.com",
    "role": "professor",
    "firstName": "Pierre",
    "lastName": "Nouveau-Dupont",
    "updatedAt": 1704067300000
  },
  "message": "User updated successfully"
}
```

---

## TEST 6 : Supprimer un utilisateur

DELETE /v1/users/{uid}

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "DELETE /v1/users/{uid}"
3. Cliquez sur "Try it out"
4. Dans le champ "uid", collez le même uid (xyz789abc)
5. Cliquez sur "Execute"
6. Vérifiez le statut "200 OK"

Réponse attendue :
```json
{
  "message": "User deleted successfully"
}
```

---

## TEST 7 : Vérifier que l'utilisateur est bien supprimé (doit échouer)

GET /v1/users/{uid}

Étapes dans Swagger :
1. Restez dans la section "Admin"
2. Cliquez sur "GET /v1/users/{uid}"
3. Cliquez sur "Try it out"
4. Dans le champ "uid", collez le même uid (xyz789abc)
5. Cliquez sur "Execute"
6. Cette fois, le statut doit être "404 Not Found" (c'est normal !)
7. Cela confirme que l'utilisateur a bien été supprimé

Réponse attendue :
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

---

## TEST 8 : Créer un cours

POST /v1/courses

Étapes dans Swagger :
1. Localisez la section "Courses" dans la liste
2. Cliquez sur "POST /v1/courses"
3. Cliquez sur "Try it out"
4. Collez ce JSON :

```json
{
  "title": "Introduction à Python",
  "description": "Apprendre les bases de Python",
  "maxStudents": 30
}
```

5. Cliquez sur "Execute"
6. Vérifiez le statut "201 Created"
7. Copiez le "id" du cours dans la réponse

Réponse attendue :
```json
{
  "data": {
    "id": "course123abc",
    "title": "Introduction à Python",
    "description": "Apprendre les bases de Python",
    "professorUid": "abc123xyz",
    "professorName": "Sophie Administrateur",
    "maxStudents": 30,
    "currentStudents": 0,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  },
  "message": "Course created successfully"
}
```

8. Notez ce courseId quelque part : _________________

---

## TEST 9 : Créer un deuxième cours

POST /v1/courses

Étapes dans Swagger :
1. Restez sur "POST /v1/courses"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "title": "JavaScript Moderne",
  "description": "Apprendre ES6+ et les frameworks modernes",
  "maxStudents": 25
}
```

4. Cliquez sur "Execute"
5. Vérifiez "201 Created"
6. Copiez le "id" du deuxième cours

7. Notez ce courseId quelque part : _________________

---

## TEST 10 : Lire tous les cours

GET /v1/courses

Étapes dans Swagger :
1. Restez dans la section "Courses"
2. Cliquez sur "GET /v1/courses"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir les 2 cours créés

Réponse attendue :
```json
{
  "data": [
    {
      "id": "course123abc",
      "title": "Introduction à Python",
      "description": "Apprendre les bases de Python",
      "professorUid": "abc123xyz",
      "professorName": "Sophie Administrateur",
      "maxStudents": 30,
      "currentStudents": 0
    },
    {
      "id": "course456def",
      "title": "JavaScript Moderne",
      "description": "Apprendre ES6+ et les frameworks modernes",
      "professorUid": "abc123xyz",
      "professorName": "Sophie Administrateur",
      "maxStudents": 25,
      "currentStudents": 0
    }
  ],
  "count": 2
}
```

---

## TEST 11 : Lire un cours spécifique

GET /v1/courses/{id}

Étapes dans Swagger :
1. Restez dans la section "Courses"
2. Cliquez sur "GET /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le courseId du premier cours (course123abc)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

Réponse attendue :
```json
{
  "data": {
    "id": "course123abc",
    "title": "Introduction à Python",
    "description": "Apprendre les bases de Python",
    "professorUid": "abc123xyz",
    "professorName": "Sophie Administrateur",
    "maxStudents": 30,
    "currentStudents": 0,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
}
```

---

## TEST 12 : Modifier un cours

PUT /v1/courses/{id}

Étapes dans Swagger :
1. Restez dans la section "Courses"
2. Cliquez sur "PUT /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le courseId (course123abc)
5. Dans le champ "Request body", collez :

```json
{
  "title": "Introduction à Python - Niveau Avancé",
  "description": "Apprendre Python en profondeur avec projets pratiques",
  "maxStudents": 25
}
```

6. Cliquez sur "Execute"
7. Vérifiez "200 OK"

Réponse attendue :
```json
{
  "data": {
    "id": "course123abc",
    "title": "Introduction à Python - Niveau Avancé",
    "description": "Apprendre Python en profondeur avec projets pratiques",
    "maxStudents": 25,
    "currentStudents": 0,
    "updatedAt": 1704067300000
  },
  "message": "Course updated successfully"
}
```

---

## TEST 13 : Lire ses cours (en tant qu'admin qui a créé des cours)

GET /v1/courses/my

Étapes dans Swagger :
1. Restez dans la section "Courses"
2. Cliquez sur "GET /v1/courses/my"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir les cours créés par l'admin (vous)

---

## TEST 14 : Supprimer un cours

DELETE /v1/courses/{id}

Étapes dans Swagger :
1. Restez dans la section "Courses"
2. Cliquez sur "DELETE /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le courseId du deuxième cours (course456def)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

Réponse attendue :
```json
{
  "message": "Course deleted successfully"
}
```

---

## TEST 15 : Créer une note personnelle

POST /v1/notes

Étapes dans Swagger :
1. Localisez la section "Notes" dans la liste
2. Cliquez sur "POST /v1/notes"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "Résumé Python",
  "content": "Variables, fonctions, boucles, conditions, classes, modules"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Copiez le "id" de la note

Réponse attendue :
```json
{
  "data": {
    "id": "note123xyz",
    "title": "Résumé Python",
    "content": "Variables, fonctions, boucles, conditions, classes, modules",
    "ownerUid": "abc123xyz",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  },
  "message": "Note created successfully"
}
```

8. Notez ce noteId quelque part : _________________

---

## TEST 16 : Créer une deuxième note

POST /v1/notes

Étapes dans Swagger :
1. Restez sur "POST /v1/notes"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "title": "Plan de cours",
  "content": "Semaine 1: Intro, Semaine 2: Variables, Semaine 3: Fonctions"
}
```

4. Cliquez sur "Execute"
5. Vérifiez "201 Created"
6. Copiez le "id"

7. Notez ce noteId quelque part : _________________

---

## TEST 17 : Lire toutes ses notes

GET /v1/notes

Étapes dans Swagger :
1. Restez dans la section "Notes"
2. Cliquez sur "GET /v1/notes"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir vos 2 notes

Réponse attendue :
```json
{
  "data": [
    {
      "id": "note123xyz",
      "title": "Résumé Python",
      "content": "Variables, fonctions, boucles, conditions, classes, modules",
      "ownerUid": "abc123xyz",
      "createdAt": 1704067200000
    },
    {
      "id": "note456abc",
      "title": "Plan de cours",
      "content": "Semaine 1: Intro, Semaine 2: Variables, Semaine 3: Fonctions",
      "ownerUid": "abc123xyz",
      "createdAt": 1704067250000
    }
  ],
  "count": 2
}
```

---

## TEST 18 : Lire une note spécifique

GET /v1/notes/{id}

Étapes dans Swagger :
1. Restez dans la section "Notes"
2. Cliquez sur "GET /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le noteId du TEST 15 (note123xyz)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 19 : Modifier une note

PUT /v1/notes/{id}

Étapes dans Swagger :
1. Restez dans la section "Notes"
2. Cliquez sur "PUT /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le noteId (note123xyz)
5. Collez :

```json
{
  "title": "Résumé Python - Complet",
  "content": "Variables, fonctions, boucles, conditions, classes, modules, exceptions, fichiers"
}
```

6. Cliquez sur "Execute"
7. Vérifiez "200 OK"

---

## TEST 20 : Supprimer une note

DELETE /v1/notes/{id}

Étapes dans Swagger :
1. Restez dans la section "Notes"
2. Cliquez sur "DELETE /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Dans le champ "id", collez le noteId du deuxième note (note456abc)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TESTS DE VALIDATION (Cas d'erreur)

---

## TEST 21 : Créer un cours avec titre trop court (doit échouer)

POST /v1/courses

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "POST /v1/courses"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "Py",
  "description": "Description valide",
  "maxStudents": 30
}
```

5. Cliquez sur "Execute"
6. Cette fois, le statut doit être "422 Unprocessable Entity" (c'est normal !)
7. Cela confirme que la validation fonctionne

Réponse attendue :
```json
{
  "error": "Validation error",
  "message": "Title must be at least 3 characters long"
}
```

---

## TEST 22 : Créer un cours avec maxStudents invalide (doit échouer)

POST /v1/courses

Étapes dans Swagger :
1. Restez sur "POST /v1/courses"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "title": "Cours valide",
  "description": "Description valide",
  "maxStudents": 0
}
```

4. Cliquez sur "Execute"
5. Vérifiez "422 Unprocessable Entity"

---

## TEST 23 : Créer un utilisateur avec email invalide (doit échouer)

POST /v1/users

Étapes dans Swagger :
1. Section "Admin"
2. Cliquez sur "POST /v1/users"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "email-invalide",
  "password": "test123",
  "role": "student",
  "firstName": "Test",
  "lastName": "User"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "422 Unprocessable Entity"

---

## TEST 24 : Créer un utilisateur avec rôle invalide (doit échouer)

POST /v1/users

Étapes dans Swagger :
1. Restez sur "POST /v1/users"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "email": "test@school.com",
  "password": "test123",
  "role": "super-admin",
  "firstName": "Test",
  "lastName": "User"
}
```

4. Cliquez sur "Execute"
5. Vérifiez "422 Unprocessable Entity"

---

## TESTS ADMIN TERMINÉS !

Félicitations ! Vous avez testé tous les endpoints ADMIN.

Total : 24 tests effectués

Récapitulatif :
- 7 tests Users (créer, lire, filtrer, lire un, modifier, supprimer, vérifier suppression)
- 7 tests Courses (créer 2, lire tous, lire un, modifier, lire mes cours, supprimer)
- 6 tests Notes (créer 2, lire toutes, lire une, modifier, supprimer)
- 4 tests de validation (erreurs 422)

IMPORTANT : DÉCONNECTEZ-VOUS maintenant avant de passer aux tests PROFESSOR

1. Cliquez sur "Authorize" (en haut à droite)
2. Cliquez sur "Logout"
3. Cliquez sur "Close"
4. Le cadenas redevient ouvert

---

## 4 - Testez les endpoints du rôle PROFESSOR

### Utilisateur 2 – prof.martin@school.com (PROFESSOR)

### Préparation

1. DÉCONNECTEZ-VOUS si vous êtes connecté avec un autre rôle
2. CONNECTEZ-VOUS en tant que PROFESSOR (suivez les étapes 2.6 à 2.9)
3. VÉRIFIEZ votre profil (GET /v1/profile doit montrer "role": "professor")

---

### CHECKLIST COMPLÈTE DES TESTS PROFESSOR

Tests à effectuer dans l'ordre :
1. Auth & Profile (déjà fait)
2. Courses (créer, lire, modifier, supprimer)
3. Notes (créer, lire, modifier, supprimer)
4. Tests négatifs (vérifier les interdictions)

---

## TEST 1 : Créer un cours en tant que PROFESSOR

POST /v1/courses

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "POST /v1/courses"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "React pour débutants",
  "description": "Construire des applications web avec React",
  "maxStudents": 20
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Copiez le "id" du cours

8. Notez ce courseId : _________________

---

## TEST 2 : Créer un deuxième cours

POST /v1/courses

Étapes dans Swagger :
1. Restez sur "POST /v1/courses"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "title": "Node.js Backend",
  "description": "Créer des APIs REST avec Node.js et Express",
  "maxStudents": 25
}
```

4. Cliquez sur "Execute"
5. Vérifiez "201 Created"
6. Copiez le "id"

7. Notez ce courseId : _________________

---

## TEST 3 : Lire tous les cours disponibles

GET /v1/courses

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir TOUS les cours (y compris ceux créés par l'admin)

---

## TEST 4 : Lire MES cours (ceux que j'ai créés)

GET /v1/courses/my

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses/my"
3. Cliquez sur "Try it out"
4. Cliquez on "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir SEULEMENT les cours que VOUS avez créés (les 2 cours React et Node.js)

---

## TEST 5 : Lire un cours spécifique

GET /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez le courseId du TEST 1
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 6 : Modifier un de MES cours

PUT /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "PUT /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez le courseId du TEST 1
5. Collez :

```json
{
  "title": "React pour débutants - Edition 2024",
  "description": "Construire des applications web modernes avec React 18",
  "maxStudents": 22
}
```

6. Cliquez sur "Execute"
7. Vérifiez "200 OK"

---

## TEST 7 : Supprimer un de MES cours

DELETE /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "DELETE /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez le courseId du TEST 2 (Node.js Backend)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 8 : Créer une note personnelle

POST /v1/notes

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "POST /v1/notes"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "Plan de cours React",
  "content": "Semaine 1: JSX, Semaine 2: Components, Semaine 3: Hooks"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Copiez le "id"

8. Notez ce noteId : _________________

---

## TEST 9 : Lire toutes mes notes

GET /v1/notes

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "GET /v1/notes"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"

---

## TEST 10 : Modifier une note

PUT /v1/notes/{id}

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "PUT /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Collez le noteId du TEST 8
5. Collez :

```json
{
  "title": "Plan de cours React - Complet",
  "content": "Semaine 1: JSX, Semaine 2: Components, Semaine 3: Hooks, Semaine 4: Context API"
}
```

6. Cliquez sur "Execute"
7. Vérifiez "200 OK"

---

## TEST 11 : Supprimer une note

DELETE /v1/notes/{id}

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "DELETE /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Collez le noteId du TEST 8
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TESTS NÉGATIFS (Vérifier les interdictions)

---

## TEST 12 : Tenter de créer un utilisateur (doit échouer)

POST /v1/users

Étapes dans Swagger :
1. Section "Admin"
2. Cliquez sur "POST /v1/users"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "test@school.com",
  "password": "test123",
  "role": "student",
  "firstName": "Test",
  "lastName": "User"
}
```

5. Cliquez sur "Execute"
6. Cette fois, le statut doit être "403 Forbidden" (c'est normal !)
7. Les PROFESSOR ne peuvent PAS créer des utilisateurs

Réponse attendue :
```json
{
  "error": "Forbidden",
  "message": "Admin role required"
}
```

---

## TEST 13 : Tenter de s'inscrire à un cours (doit échouer)

POST /v1/enrollments

Étapes dans Swagger :
1. Section "Enrollments"
2. Cliquez sur "POST /v1/enrollments"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "courseId": "n-importe-quel-id"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "403 Forbidden"
7. Les PROFESSOR ne peuvent PAS s'inscrire aux cours (réservé aux STUDENT)

---

## TEST 14 : Tenter de lire les utilisateurs (doit échouer)

GET /v1/users

Étapes dans Swagger :
1. Section "Admin"
2. Cliquez sur "GET /v1/users"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "403 Forbidden"
6. Seul l'ADMIN peut lire les utilisateurs

---

## TESTS PROFESSOR TERMINÉS !

Félicitations ! Vous avez testé tous les endpoints PROFESSOR.

Total : 14 tests effectués

Récapitulatif :
- 7 tests Courses (créer 2, lire tous, lire mes cours, lire un, modifier, supprimer)
- 4 tests Notes (créer, lire, modifier, supprimer)
- 3 tests négatifs (403 attendus)

IMPORTANT : DÉCONNECTEZ-VOUS maintenant avant de passer aux tests STUDENT

1. Cliquez sur "Authorize" (en haut à droite)
2. Cliquez sur "Logout"
3. Cliquez sur "Close"

---

## 5 - Testez les endpoints du rôle STUDENT

### Utilisateur 3 – student.dupont@school.com (STUDENT)

### Préparation

1. DÉCONNECTEZ-VOUS si vous êtes connecté avec un autre rôle
2. CONNECTEZ-VOUS en tant que STUDENT (suivez les étapes 2.11 à 2.14)
3. VÉRIFIEZ votre profil (GET /v1/profile doit montrer "role": "student")

---

### CHECKLIST COMPLÈTE DES TESTS STUDENT

Tests à effectuer dans l'ordre :
1. Auth & Profile (déjà fait)
2. Courses (lire uniquement)
3. Enrollments (s'inscrire, voir mes inscriptions, annuler)
4. Notes (créer, lire, modifier, supprimer)
5. Tests négatifs (vérifier les interdictions)

---

## TEST 1 : Lire tous les cours disponibles

GET /v1/courses

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous voyez tous les cours disponibles

IMPORTANT : Copiez le "id" d'un cours qui existe (exemple: le cours "Introduction à Python" créé par l'admin)

7. Notez un courseId : _________________

---

## TEST 2 : Lire un cours spécifique

GET /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez le courseId du TEST 1
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 3 : S'inscrire à un cours

POST /v1/enrollments

Étapes dans Swagger :
1. Section "Enrollments"
2. Cliquez sur "POST /v1/enrollments"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "courseId": "REMPLACER-AVEC-LE-COURSEID-DU-TEST-1"
}
```

IMPORTANT : Remplacez "REMPLACER-AVEC-LE-COURSEID-DU-TEST-1" par le vrai courseId que vous avez noté

Exemple :
```json
{
  "courseId": "course123abc"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Copiez le "id" de l'enrollment

Réponse attendue :
```json
{
  "data": {
    "id": "enrollment123xyz",
    "courseId": "course123abc",
    "studentUid": "ghi789xyz",
    "studentName": "Marie Dupont",
    "enrolledAt": 1704067200000,
    "status": "active"
  },
  "message": "Enrolled successfully"
}
```

8. Notez ce enrollmentId : _________________

---

## TEST 4 : Voir MES inscriptions

GET /v1/enrollments/my

Étapes dans Swagger :
1. Section "Enrollments"
2. Cliquez sur "GET /v1/enrollments/my"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir votre inscription du TEST 3

---

## TEST 5 : Annuler une inscription

DELETE /v1/enrollments/{id}

Étapes dans Swagger :
1. Section "Enrollments"
2. Cliquez sur "DELETE /v1/enrollments/{id}"
3. Cliquez sur "Try it out"
4. Collez le enrollmentId du TEST 3
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 6 : Vérifier que l'inscription est annulée

GET /v1/enrollments/my

Étapes dans Swagger :
1. Section "Enrollments"
2. Cliquez sur "GET /v1/enrollments/my"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. La liste doit être vide maintenant (ou ne plus contenir l'inscription annulée)

---

## TEST 7 : Créer une note personnelle

POST /v1/notes

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "POST /v1/notes"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "Notes de cours Python",
  "content": "Variables: let, const. Fonctions: arrow functions. Async: Promises, async/await"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "201 Created"
7. Copiez le "id"

8. Notez ce noteId : _________________

---

## TEST 8 : Créer une deuxième note

POST /v1/notes

Étapes dans Swagger :
1. Restez sur "POST /v1/notes"
2. Cliquez sur "Try it out"
3. Collez :

```json
{
  "title": "To-Do Liste",
  "content": "1. Finir exercice Python, 2. Réviser pour examen, 3. Projet final"
}
```

4. Cliquez sur "Execute"
5. Vérifiez "201 Created"

---

## TEST 9 : Lire toutes mes notes

GET /v1/notes

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "GET /v1/notes"
3. Cliquez sur "Try it out"
4. Cliquez sur "Execute"
5. Vérifiez "200 OK"
6. Vous devez voir vos 2 notes

---

## TEST 10 : Lire une note spécifique

GET /v1/notes/{id}

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "GET /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Collez le noteId du TEST 7
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TEST 11 : Modifier une note

PUT /v1/notes/{id}

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "PUT /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Collez le noteId du TEST 7
5. Collez :

```json
{
  "title": "Notes de cours Python - Complètes",
  "content": "Variables: let, const. Fonctions: arrow functions. Async: Promises, async/await. Classes: constructor, methods"
}
```

6. Cliquez sur "Execute"
7. Vérifiez "200 OK"

---

## TEST 12 : Supprimer une note

DELETE /v1/notes/{id}

Étapes dans Swagger :
1. Section "Notes"
2. Cliquez sur "DELETE /v1/notes/{id}"
3. Cliquez sur "Try it out"
4. Collez le noteId du TEST 8 (To-Do Liste)
5. Cliquez sur "Execute"
6. Vérifiez "200 OK"

---

## TESTS NÉGATIFS (Vérifier les interdictions)

---

## TEST 13 : Tenter de créer un cours (doit échouer)

POST /v1/courses

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "POST /v1/courses"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "title": "Tentative non autorisée",
  "description": "Les STUDENT ne peuvent pas créer de cours",
  "maxStudents": 30
}
```

5. Cliquez sur "Execute"
6. Vérifiez "403 Forbidden" (c'est normal !)
7. Les STUDENT ne peuvent PAS créer de cours

---

## TEST 14 : Tenter de modifier un cours (doit échouer)

PUT /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "PUT /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez n'importe quel courseId
5. Collez :

```json
{
  "title": "Modification non autorisée",
  "description": "Ne devrait pas fonctionner",
  "maxStudents": 30
}
```

6. Cliquez sur "Execute"
7. Vérifiez "403 Forbidden"

---

## TEST 15 : Tenter de supprimer un cours (doit échouer)

DELETE /v1/courses/{id}

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "DELETE /v1/courses/{id}"
3. Cliquez sur "Try it out"
4. Collez n'importe quel courseId
5. Cliquez sur "Execute"
6. Vérifiez "403 Forbidden"

---

## TEST 16 : Tenter de créer un utilisateur (doit échouer)

POST /v1/users

Étapes dans Swagger :
1. Section "Admin"
2. Cliquez sur "POST /v1/users"
3. Cliquez sur "Try it out"
4. Collez :

```json
{
  "email": "test@school.com",
  "password": "test123",
  "role": "student",
  "firstName": "Test",
  "lastName": "User"
}
```

5. Cliquez sur "Execute"
6. Vérifiez "403 Forbidden"
7. Seul l'ADMIN peut créer des utilisateurs

---

## TEST 17 : Tenter de voir les inscriptions d'un cours (doit échouer)

GET /v1/courses/{courseId}/enrollments

Étapes dans Swagger :
1. Section "Courses"
2. Cliquez sur "GET /v1/courses/{courseId}/enrollments"
3. Cliquez sur "Try it out"
4. Collez n'importe quel courseId
5. Cliquez sur "Execute"
6. Vérifiez "403 Forbidden"
7. Seuls les PROFESSOR (du cours) et ADMIN peuvent voir les inscriptions

---

## TESTS STUDENT TERMINÉS !

Félicitations ! Vous avez testé tous les endpoints STUDENT.

Total : 17 tests effectués

Récapitulatif :
- 2 tests Courses (lire tous, lire un)
- 4 tests Enrollments (s'inscrire, voir mes inscriptions, annuler, vérifier annulation)
- 6 tests Notes (créer 2, lire toutes, lire une, modifier, supprimer)
- 5 tests négatifs (403 attendus)

IMPORTANT : DÉCONNECTEZ-VOUS maintenant

1. Cliquez sur "Authorize" (en haut à droite)
2. Cliquez sur "Logout"
3. Cliquez sur "Close"

---

## RÉCAPITULATIF FINAL - Tous les Tests

### ADMIN : 24 tests
- Users : 7 tests
- Courses : 7 tests
- Notes : 6 tests
- Validation : 4 tests

### PROFESSOR : 14 tests
- Courses : 7 tests
- Notes : 4 tests
- Tests négatifs : 3 tests

### STUDENT : 17 tests
- Courses : 2 tests
- Enrollments : 4 tests
- Notes : 6 tests
- Tests négatifs : 5 tests

**TOTAL GÉNÉRAL : 55 tests**

---

## Matrice Complète des Permissions

| Endpoint | ADMIN | PROFESSOR | STUDENT |
|----------|-------|-----------|---------|
| **Users** | | | |
| GET /v1/users | OUI | NON (403) | NON (403) |
| POST /v1/users | OUI | NON (403) | NON (403) |
| PUT /v1/users/{uid} | OUI | NON (403) | NON (403) |
| DELETE /v1/users/{uid} | OUI | NON (403) | NON (403) |
| **Courses** | | | |
| GET /v1/courses | OUI | OUI | OUI |
| POST /v1/courses | OUI | OUI | NON (403) |
| GET /v1/courses/{id} | OUI | OUI | OUI |
| PUT /v1/courses/{id} | OUI | OUI (ses cours) | NON (403) |
| DELETE /v1/courses/{id} | OUI | OUI (ses cours) | NON (403) |
| GET /v1/courses/my | OUI | OUI | NON (403) |
| GET /v1/courses/{id}/enrollments | OUI | OUI (ses cours) | NON (403) |
| **Enrollments** | | | |
| POST /v1/enrollments | OUI | NON (403) | OUI |
| GET /v1/enrollments/my | OUI | NON (403) | OUI |
| DELETE /v1/enrollments/{id} | OUI | NON (403) | OUI |
| **Notes** | | | |
| GET /v1/notes | OUI | OUI | OUI |
| POST /v1/notes | OUI | OUI | OUI |
| GET /v1/notes/{id} | OUI | OUI | OUI |
| PUT /v1/notes/{id} | OUI | OUI | OUI |
| DELETE /v1/notes/{id} | OUI | OUI | OUI |

---

## Codes HTTP à Connaître

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | GET, PUT, DELETE réussis |
| 201 | Created | POST réussi (ressource créée) |
| 400 | Bad Request | Logique métier (cours complet, déjà inscrit) |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Token valide mais permissions insuffisantes |
| 404 | Not Found | Ressource inexistante |
| 422 | Unprocessable Entity | Validation échouée (données invalides) |
| 500 | Internal Server Error | Erreur serveur |

---

## Astuces Pratiques

### 1. Garder une trace des IDs

Créez un document pour noter :
```
ADMIN UID: abc123xyz
PROFESSOR UID: def456xyz
STUDENT UID: ghi789xyz

Cours 1 (Admin): course123abc
Cours 2 (Admin): course456def
Cours 3 (Professor): course789ghi

Note 1 (Admin): note123xyz
Note 2 (Professor): note456abc

Enrollment 1 (Student): enrollment123xyz
```

### 2. Ordre de test recommandé

1. Créer d'abord les ressources (POST)
2. Lire ensuite (GET)
3. Modifier (PUT)
4. Supprimer en dernier (DELETE)

### 3. Vérifier systématiquement

Après chaque opération :
- Code HTTP correct ?
- Corps de réponse cohérent ?
- Données dans Firestore (vérifier dans Emulator UI : http://localhost:4000)

### 4. Se déconnecter TOUJOURS

Avant de changer d'utilisateur :
1. Authorize (en haut à droite)
2. Logout
3. Close

### 5. En cas d'erreur

Si un test échoue :
1. Vérifiez le token (cadenas Swagger)
2. Vérifiez le rôle (GET /v1/profile)
3. Vérifiez l'ID utilisé
4. Vérifiez le JSON (copié correctement ?)
5. Regardez les logs dans le terminal (npm run serve)

---

## Annexe : Corps JSON complets pour copier-coller

### ADMIN

#### Créer utilisateur Professor
```json
{
  "email": "nouveau.prof@school.com",
  "password": "newprof123",
  "role": "professor",
  "firstName": "Pierre",
  "lastName": "Nouveau"
}
```

#### Créer utilisateur Student
```json
{
  "email": "nouveau.student@school.com",
  "password": "newstudent123",
  "role": "student",
  "firstName": "Alice",
  "lastName": "Nouvelle"
}
```

#### Modifier utilisateur
```json
{
  "firstName": "Pierre",
  "lastName": "Nouveau-Dupont",
  "role": "professor"
}
```

#### Créer cours 1
```json
{
  "title": "Introduction à Python",
  "description": "Apprendre les bases de Python",
  "maxStudents": 30
}
```

#### Créer cours 2
```json
{
  "title": "JavaScript Moderne",
  "description": "Apprendre ES6+ et les frameworks modernes",
  "maxStudents": 25
}
```

#### Modifier cours
```json
{
  "title": "Introduction à Python - Niveau Avancé",
  "description": "Apprendre Python en profondeur avec projets pratiques",
  "maxStudents": 25
}
```

#### Créer note 1
```json
{
  "title": "Résumé Python",
  "content": "Variables, fonctions, boucles, conditions, classes, modules"
}
```

#### Créer note 2
```json
{
  "title": "Plan de cours",
  "content": "Semaine 1: Intro, Semaine 2: Variables, Semaine 3: Fonctions"
}
```

#### Modifier note
```json
{
  "title": "Résumé Python - Complet",
  "content": "Variables, fonctions, boucles, conditions, classes, modules, exceptions, fichiers"
}
```

---

### PROFESSOR

#### Créer cours 1
```json
{
  "title": "React pour débutants",
  "description": "Construire des applications web avec React",
  "maxStudents": 20
}
```

#### Créer cours 2
```json
{
  "title": "Node.js Backend",
  "description": "Créer des APIs REST avec Node.js et Express",
  "maxStudents": 25
}
```

#### Modifier cours
```json
{
  "title": "React pour débutants - Edition 2024",
  "description": "Construire des applications web modernes avec React 18",
  "maxStudents": 22
}
```

#### Créer note
```json
{
  "title": "Plan de cours React",
  "content": "Semaine 1: JSX, Semaine 2: Components, Semaine 3: Hooks"
}
```

#### Modifier note
```json
{
  "title": "Plan de cours React - Complet",
  "content": "Semaine 1: JSX, Semaine 2: Components, Semaine 3: Hooks, Semaine 4: Context API"
}
```

---

### STUDENT

#### S'inscrire à un cours
```json
{
  "courseId": "REMPLACER-AVEC-COURSEID-RÉEL"
}
```

#### Créer note 1
```json
{
  "title": "Notes de cours Python",
  "content": "Variables: let, const. Fonctions: arrow functions. Async: Promises, async/await"
}
```

#### Créer note 2
```json
{
  "title": "To-Do Liste",
  "content": "1. Finir exercice Python, 2. Réviser pour examen, 3. Projet final"
}
```

#### Modifier note
```json
{
  "title": "Notes de cours Python - Complètes",
  "content": "Variables: let, const. Fonctions: arrow functions. Async: Promises, async/await. Classes: constructor, methods"
}
```

---

## Annexe : Tests de Validation (Erreurs 422)

### Cours avec titre trop court
```json
{
  "title": "Py",
  "description": "Description valide",
  "maxStudents": 30
}
```

### Cours avec maxStudents invalide (zéro)
```json
{
  "title": "Cours valide",
  "description": "Description valide",
  "maxStudents": 0
}
```

### Cours avec maxStudents négatif
```json
{
  "title": "Cours valide",
  "description": "Description valide",
  "maxStudents": -5
}
```

### Utilisateur avec email invalide
```json
{
  "email": "email-invalide",
  "password": "test123",
  "role": "student",
  "firstName": "Test",
  "lastName": "User"
}
```

### Utilisateur avec rôle invalide
```json
{
  "email": "test@school.com",
  "password": "test123",
  "role": "super-admin",
  "firstName": "Test",
  "lastName": "User"
}
```

### Note sans titre
```json
{
  "content": "Contenu sans titre"
}
```

---

**Date** : 6 octobre 2025  
**Version** : 2.0  
**Projet** : Firebase Functions REST API avec RBAC  
**Format** : Guide de tests complet étape par étape sans emojis
