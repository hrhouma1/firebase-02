# GUIDE D'INSTALLATION COMPLET - DE A À Z

Ce guide vous accompagne depuis l'installation de Node.js jusqu'au premier test de l'API.

---

## PRÉREQUIS SYSTÈME

### 1. Installer Node.js

**Téléchargez Node.js 22+ :**
- Allez sur https://nodejs.org/
- Téléchargez la version LTS (Long Term Support)
- Lancez l'installateur et suivez les étapes

**Vérifier l'installation :**
```powershell
node --version
# Doit afficher v22.x.x ou supérieur

npm --version
# Doit afficher 10.x.x ou supérieur
```

### 2. Installer Git (optionnel mais recommandé)

**Téléchargez Git :**
- Allez sur https://git-scm.com/download/win
- Téléchargez et installez

**Vérifier l'installation :**
```powershell
git --version
```

---

## ÉTAPE 1 : INSTALLER FIREBASE CLI

### Installer Firebase Tools globalement

```powershell
npm install -g firebase-tools
```

**Vérifier l'installation :**
```powershell
firebase --version
# Doit afficher 13.x.x ou supérieur
```

### Se connecter à Firebase

```powershell
firebase login
```

Cela ouvre votre navigateur pour vous connecter avec votre compte Google.

**Alternative si vous avez des problèmes :**
```powershell
firebase login --no-localhost
```

---

## ÉTAPE 2 : INSTALLER LES DÉPENDANCES DU PROJET

### Naviguer vers le dossier du projet

```powershell
cd C:\03-projetsGA\firebasefunctionsrest
```

### Installer les dépendances racine

```powershell
npm install
```

**Packages installés :**
- `cors` - Gestion des requêtes cross-origin
- `express` - Framework web
- `@types/cors` - Types TypeScript
- `@types/express` - Types TypeScript

### Installer les dépendances des Functions

```powershell
cd functions
npm install
```

**Packages installés :**
- `firebase-admin` - SDK Firebase Admin
- `firebase-functions` - SDK Firebase Functions
- `swagger-ui-express` - Interface Swagger
- `swagger-jsdoc` - Génération documentation
- `typescript` - Compilateur TypeScript
- `eslint` - Linter de code
- Et leurs types TypeScript

### Retourner à la racine

```powershell
cd ..
```

---

## ÉTAPE 3 : COMPILER LE CODE TYPESCRIPT

**IMPORTANT :** Les Functions sont en TypeScript et doivent être compilées en JavaScript avant d'être exécutées.

```powershell
cd functions
npm run build
```

**Résultat attendu :**
```
> build
> tsc

# Aucune erreur = compilation réussie
# Un dossier "lib" est créé avec le JavaScript compilé
```

**Vérifier que lib/index.js existe :**
```powershell
dir lib\index.js
# Doit afficher le fichier
```

### Retourner à la racine

```powershell
cd ..
```

---

## ÉTAPE 4 : DÉMARRER LES ÉMULATEURS

### Option A : Démarrer tous les émulateurs

```powershell
npm run serve
```

**OU** (équivalent) :

```powershell
firebase emulators:start
```

### Option B : Build automatique + Démarrage

Si vous modifiez le code TypeScript, utilisez :

```powershell
cd functions
npm run serve
```

Cela compile PUIS démarre les émulateurs.

### Vérifier que les émulateurs sont démarrés

Vous devriez voir :

```
┌─────────────────────────────────────────────────────────────┐
│ All emulators ready! It is now safe to connect your app.    │
│ i  View Emulator UI at http://127.0.0.1:4000/               │
└─────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬──────────────────────────────────┐
│ Emulator       │ Host:Port      │ View in Emulator UI              │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Authentication │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth       │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Functions      │ 127.0.0.1:5001 │ http://127.0.0.1:4000/functions  │
├────────────────┼────────────────┼──────────────────────────────────┤
│ Firestore      │ 127.0.0.1:8081 │ http://127.0.0.1:4000/firestore  │
└────────────────┴────────────────┴──────────────────────────────────┘
```

### URLs importantes

- **UI des émulateurs** : http://localhost:4000
- **API Functions** : http://localhost:5001/backend-demo-1/us-central1/api
- **Swagger UI** : http://localhost:5001/backend-demo-1/us-central1/api/docs
- **Auth Emulator** : http://localhost:9099
- **Firestore Emulator** : http://localhost:8081

---

## ÉTAPE 5 : CRÉER LE PREMIER UTILISATEUR ADMIN

### Méthode 1 : Via Swagger UI (LA PLUS SIMPLE - NOUVEAU !)

**Créer un compte directement dans Swagger UI :**

1. **Ouvrir Swagger**
   ```
   http://localhost:5001/backend-demo-1/us-central1/api/docs
   ```

2. **Créer le compte admin**
   - Section **Auth** (en haut de la page)
   - Cliquez sur `POST /v1/auth/signup`
   - Cliquez sur **Try it out**
   - Modifiez le JSON :

   ```json
   {
     "email": "admin@school.com",
     "password": "admin123",
     "role": "admin",
     "firstName": "Super",
     "lastName": "Admin"
   }
   ```

   - Cliquez sur **Execute**
   - Status 201 = Compte créé avec succès !
   - Le compte Firebase Auth ET le profil Firestore sont créés automatiquement
   - COPIEZ le `uid` dans la réponse

3. **Obtenir le token de connexion**
   - Dans la même section **Auth**
   - Cliquez sur `POST /v1/auth/signin-info`
   - Cliquez sur **Try it out**
   - Entrez vos identifiants :

   ```json
   {
     "email": "admin@school.com",
     "password": "admin123"
   }
   ```

   - Cliquez sur **Execute**
   - La réponse contient la **commande PowerShell** à exécuter
   - COPIEZ la commande PowerShell affichée dans `instructions.powershell`
   - COLLEZ et EXÉCUTEZ dans votre terminal PowerShell
   - COPIEZ le token affiché

4. **S'authentifier dans Swagger**
   - En haut de la page Swagger, cliquez sur **Authorize** (icône cadenas)
   - Dans le champ, entrez : `Bearer VOTRE_TOKEN`
   - Cliquez sur **Authorize**
   - Cliquez sur **Close**
   - Vous êtes maintenant connecté comme admin !

5. **Tester votre connexion**
   - Section **Profile**
   - Cliquez sur `GET /v1/profile`
   - Cliquez sur **Try it out**
   - Cliquez sur **Execute**
   - Vous devez voir votre profil admin !

### Méthode 2 : Via PowerShell

**Dans un NOUVEAU terminal PowerShell** (laissez les émulateurs tourner) :

```powershell
# 1. Créer le compte dans Firebase Auth
$signup = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

# 2. Afficher et copier le UID
$adminUid = $signup.localId
Write-Host "UID Admin: $adminUid" -ForegroundColor Green
Write-Host "COPIEZ ce UID pour l'étape suivante !" -ForegroundColor Yellow
```

### Méthode 2 : Via l'UI des émulateurs

1. Ouvrez http://localhost:4000
2. Onglet **Authentication**
3. Cliquez sur **Add user**
4. Email : `admin@school.com`
5. Password : `admin123`
6. Cliquez sur **Save**
7. Copiez le **User UID** affiché

---

## ÉTAPE 6 : CRÉER LE PROFIL ADMIN DANS FIRESTORE

**CRUCIAL :** Le compte Auth existe, mais pas le profil avec le rôle ! Vous devez le créer manuellement.

### Via l'UI des émulateurs (Méthode visuelle)

1. **Ouvrir Firestore**
   - Allez sur http://localhost:4000
   - Cliquez sur **Firestore Database**

2. **Créer la collection "users"**
   - Cliquez sur **Start collection**
   - Collection ID : `users`
   - Cliquez sur **Next**

3. **Créer le document admin**
   - **Document ID** : Collez le UID admin copié précédemment
   - Cliquez sur **Add field** pour chaque champ :

   | Nom du champ | Type | Valeur |
   |--------------|------|--------|
   | uid | string | [le UID admin] |
   | email | string | admin@school.com |
   | role | string | admin |
   | firstName | string | Super |
   | lastName | string | Admin |
   | createdAt | number | 1704067200000 |
   | updatedAt | number | 1704067200000 |

4. **Sauvegarder**
   - Cliquez sur **Save**

5. **Vérifier**
   - Vous devez voir le document dans `users/[UID]`

---

## ÉTAPE 7 : TESTER L'API

### Option 1 : Via Swagger UI (Le plus simple)

1. **Ouvrir Swagger**
   ```
   http://localhost:5001/backend-demo-1/us-central1/api/docs
   ```

2. **Obtenir un token**
   ```powershell
   $login = Invoke-RestMethod -Method Post `
     -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
     -ContentType "application/json" `
     -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'
   
   $token = $login.idToken
   Write-Host "Token: $token" -ForegroundColor Green
   # COPIEZ le token affiché
   ```

3. **S'authentifier dans Swagger**
   - Cliquez sur le bouton **Authorize** (icône cadenas)
   - Dans le champ, tapez : `Bearer VOTRE_TOKEN`
   - Cliquez sur **Authorize**
   - Cliquez sur **Close**

4. **Tester une route**
   - Section **Profile**
   - Cliquez sur `GET /v1/profile`
   - Cliquez sur **Try it out**
   - Cliquez sur **Execute**
   - Vous devez voir votre profil admin !

### Option 2 : Via fichiers .http (REST Client)

1. **Installer l'extension REST Client**
   - Dans VS Code/Cursor : Extensions
   - Chercher "REST Client"
   - Installer (par Huachao Mao)

2. **Ouvrir le scénario guidé**
   - Fichier : `api-tests/06-SCENARIO-GUIDE.http`
   - Suivre les instructions étape par étape

3. **Exécuter les requêtes**
   - Cliquez sur **Send Request** au-dessus de chaque requête

### Option 3 : Via PowerShell

```powershell
# 1. Se connecter
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$token = $login.idToken
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Tester la route health (public)
Invoke-RestMethod -Uri "$baseUrl/health"

# 3. Voir son profil
Invoke-RestMethod -Uri "$baseUrl/v1/profile" -Headers $headers

# 4. Créer un professeur
$prof = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/users" `
  -Headers $headers `
  -Body (@{
    email = "prof.martin@school.com"
    password = "prof123"
    role = "professor"
    firstName = "Jean"
    lastName = "Martin"
  } | ConvertTo-Json)

Write-Host "Professeur créé: $($prof.data.uid)" -ForegroundColor Green
```

---

## COMMANDES UTILES

### Démarrage et arrêt

```powershell
# Démarrer les émulateurs
npm run serve

# Arrêter les émulateurs
# Appuyez sur Ctrl+C dans le terminal

# Build uniquement (sans démarrer)
npm run build

# Build en mode watch (recompile automatiquement)
cd functions
npm run build:watch
```

### Développement

```powershell
# Linter (vérifier le code)
cd functions
npm run lint

# Compiler TypeScript
npm run build

# Compiler en mode watch (auto-recompilation)
npm run build:watch
```

### Déploiement

```powershell
# Déployer les functions
npm run deploy:functions

# Déployer les règles Firestore
npm run deploy:rules

# Déployer tout (functions + rules)
npm run deploy:all
```

### Debug

```powershell
# Voir les logs des functions
firebase functions:log

# Exporter les utilisateurs Auth
firebase auth:export users.json

# Importer des utilisateurs
firebase auth:import users.json
```

---

## RÉSOLUTION DE PROBLÈMES

### Erreur : "functions\lib\index.js does not exist"

**Cause :** Le code TypeScript n'a pas été compilé.

**Solution :**
```powershell
cd functions
npm run build
cd ..
npm run serve
```

### Erreur : "Port 8080 is not open"

**Cause :** Le port 8080 est déjà utilisé.

**Solution 1 - Changer le port (déjà fait) :**
Le projet utilise maintenant le port 8081 pour Firestore.

**Solution 2 - Tuer le processus :**
```powershell
# Trouver le processus
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess

# Tuer le processus (remplacer PID)
taskkill /F /PID [PID]
```

### Erreur : "User profile not found"

**Cause :** Le profil utilisateur n'existe pas dans Firestore.

**Solution :**
1. Allez sur http://localhost:4000
2. Firestore Database
3. Créez le document dans `users/[UID]` avec les champs requis

### Erreur : "403 Forbidden"

**Causes possibles :**
1. Mauvais token (expiré ou invalide)
2. Mauvais rôle (pas les permissions)
3. Profil Firestore manquant ou incorrect

**Solution :**
```powershell
# 1. Vérifier le token
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$token = $login.idToken
$headers = @{ Authorization = "Bearer $token" }

# 2. Vérifier le profil
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"
Invoke-RestMethod -Uri "$baseUrl/v1/profile" -Headers $headers
```

### Erreur : "firebase : command not found"

**Cause :** Firebase CLI n'est pas dans le PATH.

**Solution :**
```powershell
# Réinstaller Firebase CLI
npm install -g firebase-tools

# Redémarrer le terminal
```

### Erreur de compilation TypeScript

```powershell
cd functions
npm run build
# Lire les erreurs affichées

# Si erreurs d'imports manquants :
npm install
npm run build
```

---

## WORKFLOW COMPLET DEPUIS ZÉRO

Voici toutes les commandes dans l'ordre pour démarrer le projet :

```powershell
# 1. Vérifier Node.js
node --version
npm --version

# 2. Installer Firebase CLI
npm install -g firebase-tools

# 3. Se connecter à Firebase
firebase login

# 4. Naviguer vers le projet
cd C:\03-projetsGA\firebasefunctionsrest

# 5. Installer les dépendances racine
npm install

# 6. Installer les dépendances des functions
cd functions
npm install

# 7. Compiler le TypeScript
npm run build

# 8. Retourner à la racine
cd ..

# 9. Démarrer les émulateurs
npm run serve

# Attendez de voir "All emulators ready!"
```

**Dans un NOUVEAU terminal :**

```powershell
# 10. Créer le compte admin
$signup = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$adminUid = $signup.localId
Write-Host "UID Admin: $adminUid" -ForegroundColor Green

# 11. Créer le profil dans Firestore
# Allez sur http://localhost:4000 → Firestore → Créer collection "users"
# Document ID: $adminUid
# Ajoutez les champs (voir ÉTAPE 6 ci-dessus)

# 12. Se connecter et obtenir le token
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$token = $login.idToken
Write-Host "Token: $token" -ForegroundColor Green

# 13. Tester l'API
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# Health check
Invoke-RestMethod -Uri "$baseUrl/health"

# Profil admin
Invoke-RestMethod -Uri "$baseUrl/v1/profile" -Headers $headers

# 14. Créer un professeur
$prof = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/users" `
  -Headers $headers `
  -Body (@{
    email = "prof.martin@school.com"
    password = "prof123"
    role = "professor"
    firstName = "Jean"
    lastName = "Martin"
  } | ConvertTo-Json)

Write-Host "Professeur créé!" -ForegroundColor Green
$prof.data

# 15. Créer un étudiant
$student = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/users" `
  -Headers $headers `
  -Body (@{
    email = "sophie.dubois@school.com"
    password = "student123"
    role = "student"
    firstName = "Sophie"
    lastName = "Dubois"
  } | ConvertTo-Json)

Write-Host "Étudiant créé!" -ForegroundColor Green
$student.data

# 16. Lister tous les utilisateurs
$users = Invoke-RestMethod -Uri "$baseUrl/v1/users" -Headers $headers
Write-Host "Total utilisateurs: $($users.count)" -ForegroundColor Cyan
$users.data | Format-Table email, role, firstName, lastName
```

---

## STRUCTURE DES FICHIERS APRÈS COMPILATION

```
firebasefunctionsrest/
├── functions/
│   ├── src/                    # Code source TypeScript
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── types/
│   │   ├── firebase.ts
│   │   ├── swagger.ts
│   │   └── index.ts
│   ├── lib/                    # Code compilé JavaScript (créé par build)
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── types/
│   │   ├── firebase.js
│   │   ├── swagger.js
│   │   └── index.js
│   ├── node_modules/
│   ├── package.json
│   └── tsconfig.json
├── api-tests/
├── node_modules/
├── firebase.json
├── firestore.rules
└── package.json
```

---

## VARIABLES D'ENVIRONNEMENT

### PowerShell

```powershell
# URLs de base
$authUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1"
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"

# Token (après connexion)
$token = "VOTRE_TOKEN"
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
```

### Fichiers .http

```http
@authUrl = http://localhost:9099/identitytoolkit.googleapis.com/v1
@apiUrl = http://localhost:5001/backend-demo-1/us-central1/api
@adminToken = {{loginAdmin.response.body.idToken}}
```

---

## COMMANDES FIREBASE UTILES

### Gestion du projet

```powershell
# Initialiser un nouveau projet Firebase
firebase init

# Voir les projets disponibles
firebase projects:list

# Changer de projet
firebase use [project-id]

# Voir le projet actuel
firebase use
```

### Émulateurs

```powershell
# Démarrer tous les émulateurs
firebase emulators:start

# Démarrer seulement certains émulateurs
firebase emulators:start --only functions,auth

# Exporter les données des émulateurs
firebase emulators:export ./emulator-data

# Importer des données sauvegardées
firebase emulators:start --import=./emulator-data
```

### Déploiement

```powershell
# Déployer les functions
firebase deploy --only functions

# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Déployer les index Firestore
firebase deploy --only firestore:indexes

# Déployer tout
firebase deploy
```

### Logs et monitoring

```powershell
# Voir les logs en temps réel
firebase functions:log

# Voir les logs d'une function spécifique
firebase functions:log --only api

# Voir les logs avec filtre
firebase functions:log --only api --limit 10
```

---

## CHECKLIST FINALE

Avant de commencer le développement, vérifiez que :

```
[ ] Node.js 22+ installé
[ ] Firebase CLI installé et connecté
[ ] Dépendances racine installées (npm install)
[ ] Dépendances functions installées (cd functions && npm install)
[ ] TypeScript compilé (npm run build)
[ ] Émulateurs démarrés (npm run serve)
[ ] Admin créé dans Auth
[ ] Profil admin créé dans Firestore
[ ] Token obtenu et testé
[ ] Route /v1/profile fonctionne
```

Si toutes les cases sont cochées, vous êtes prêt !

---

## PROCHAINES ÉTAPES

1. **Tester avec Swagger** : http://localhost:5001/backend-demo-1/us-central1/api/docs
2. **Suivre le scénario guidé** : `api-tests/06-SCENARIO-GUIDE.http`
3. **Lire la documentation** : `README.md` et `01-SWAGGER-GUIDE.md`
4. **Explorer l'UI** : http://localhost:4000

---

## LIENS RAPIDES

| Ressource | URL |
|-----------|-----|
| **UI Émulateurs** | http://localhost:4000 |
| **Swagger API** | http://localhost:5001/backend-demo-1/us-central1/api/docs |
| **Health Check** | http://localhost:5001/backend-demo-1/us-central1/api/health |
| **Auth Emulator** | http://localhost:9099 |
| **Firestore Emulator** | http://localhost:8081 |

---

## AIDE SUPPLÉMENTAIRE

### Documentation officielle

- **Firebase Functions** : https://firebase.google.com/docs/functions
- **Firebase Auth** : https://firebase.google.com/docs/auth
- **Firestore** : https://firebase.google.com/docs/firestore
- **Firebase CLI** : https://firebase.google.com/docs/cli

### Documentation du projet

- `README.md` - Vue d'ensemble
- `01-SWAGGER-GUIDE.md` - Guide Swagger
- `02-GUIDE-RBAC.md` - Guide PowerShell complet
- `api-tests/05-README.md` - Guide REST Client
- `api-tests/06-SCENARIO-GUIDE.http` - Scénario guidé

---

**Vous êtes maintenant prêt à utiliser l'API !**

