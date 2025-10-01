# 📖 Guide Swagger UI - Documentation Interactive

## 🚀 Accéder à Swagger

Une fois les émulateurs démarrés :

```bash
npm run serve
```

Ouvrez votre navigateur sur :

### 🌐 **http://localhost:5001/backend-demo-1/us-central1/api/docs**

---

## 🎯 Qu'est-ce que Swagger ?

Swagger UI est une **interface graphique interactive** qui vous permet de :

- ✅ **Voir toutes les routes** de l'API organisées par catégories
- ✅ **Tester les endpoints** directement depuis le navigateur
- ✅ **Voir les schémas** de données (User, Course, Enrollment, Note)
- ✅ **Comprendre les permissions** de chaque route
- ✅ **Copier les exemples** de requêtes

**Plus besoin de PowerShell ou fichiers .http !** Tout se fait dans le navigateur ! 🎉

---

## 🔐 S'authentifier dans Swagger

### Étape 1 : Obtenir un token

Vous avez besoin d'un token JWT Firebase. Deux options :

#### Option A : Via Firebase Auth Emulator UI
1. Allez sur http://localhost:4000
2. Onglet **Authentication**
3. Connectez-vous avec un utilisateur existant
4. Copiez le token (si disponible)

#### Option B : Via l'API (recommandé)
```bash
# Dans PowerShell ou terminal
curl -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'
```

Copiez le `idToken` de la réponse.

### Étape 2 : Ajouter le token dans Swagger

1. Dans Swagger UI, cliquez sur le bouton **🔓 Authorize** (en haut à droite)
2. Dans le champ qui apparaît, tapez : `Bearer VOTRE_TOKEN`
   - **Important** : Commencez par le mot "Bearer" suivi d'un espace !
   - Exemple : `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...`
3. Cliquez sur **Authorize**
4. Cliquez sur **Close**

✅ **Vous êtes maintenant authentifié !** Toutes les requêtes incluront automatiquement votre token.

---

## 🧪 Tester une route

### Exemple : Créer un cours (en tant que Professeur)

1. **Trouvez la route** : Cherchez la section **👨‍🏫 Courses**
2. **Ouvrez la route** : Cliquez sur `POST /v1/courses`
3. **Cliquez sur "Try it out"** (en haut à droite)
4. **Modifiez le JSON** dans "Request body" :
   ```json
   {
     "title": "Mon Super Cours",
     "description": "Description du cours",
     "maxStudents": 25
   }
   ```
5. **Cliquez sur "Execute"**
6. **Voir la réponse** en dessous :
   - Status code (201 = succès)
   - Headers
   - Response body avec les données créées

---

## 📊 Organisation de l'API

Swagger organise les routes en **6 catégories** :

### 🏥 Health
- `GET /health` - Vérifier que l'API fonctionne (public, pas d'auth)

### 👤 Profile
- `GET /v1/profile` - Voir son profil
- `PUT /v1/profile` - Modifier son profil

### 👨‍💼 Admin
- `POST /v1/users` - Créer un utilisateur
- `GET /v1/users` - Lister les utilisateurs (filtrable par rôle)
- `GET /v1/users/{uid}` - Consulter un utilisateur
- `PUT /v1/users/{uid}` - Modifier un utilisateur
- `DELETE /v1/users/{uid}` - Supprimer un utilisateur

### 👨‍🏫 Courses
- `POST /v1/courses` - Créer un cours (Professeur)
- `GET /v1/courses` - Lister tous les cours (Tous)
- `GET /v1/courses/my` - Mes cours (Professeur)
- `GET /v1/courses/{id}` - Consulter un cours (Tous)
- `PUT /v1/courses/{id}` - Modifier un cours (Professeur propriétaire)
- `DELETE /v1/courses/{id}` - Supprimer un cours (Professeur propriétaire)
- `GET /v1/courses/{courseId}/enrollments` - Inscriptions d'un cours (Professeur)

### 👨‍🎓 Enrollments
- `POST /v1/enrollments` - S'inscrire à un cours (Étudiant)
- `GET /v1/enrollments/my` - Mes inscriptions (Étudiant)
- `DELETE /v1/enrollments/{id}` - Annuler une inscription (Étudiant)

### 📝 Notes
- `POST /v1/notes` - Créer une note (Tous)
- `GET /v1/notes` - Lister ses notes (Tous)
- `GET /v1/notes/{id}` - Consulter une note (Tous)
- `PUT /v1/notes/{id}` - Modifier une note (Tous)
- `DELETE /v1/notes/{id}` - Supprimer une note (Tous)

---

## 🎬 Scénario complet dans Swagger

### 1️⃣ Connexion Admin
```
Obtenir token admin → Authorize avec le token
```

### 2️⃣ Admin crée un professeur
```
POST /v1/users
{
  "email": "prof@school.com",
  "password": "prof123",
  "role": "professor",
  "firstName": "Jean",
  "lastName": "Martin"
}
```

### 3️⃣ Admin crée un étudiant
```
POST /v1/users
{
  "email": "student@school.com",
  "password": "student123",
  "role": "student",
  "firstName": "Sophie",
  "lastName": "Dubois"
}
```

### 4️⃣ Déconnexion et reconnexion en Professeur
```
1. Obtenir token professeur (via curl ou auth emulator)
2. Cliquer sur 🔓 Authorize
3. Remplacer l'ancien token par le nouveau
4. Authorize
```

### 5️⃣ Professeur crée un cours
```
POST /v1/courses
{
  "title": "Python pour débutants",
  "description": "Apprendre Python",
  "maxStudents": 30
}
→ Copier le "id" du cours créé
```

### 6️⃣ Déconnexion et reconnexion en Étudiant
```
1. Obtenir token étudiant
2. Authorize avec le nouveau token
```

### 7️⃣ Étudiant consulte les cours
```
GET /v1/courses
→ Voir tous les cours disponibles
```

### 8️⃣ Étudiant s'inscrit au cours
```
POST /v1/enrollments
{
  "courseId": "[ID du cours copié]"
}
```

### 9️⃣ Étudiant crée une note
```
POST /v1/notes
{
  "title": "Résumé cours 1",
  "content": "Variables, fonctions..."
}
```

---

## 💡 Astuces Swagger

### ✨ Voir les schémas de données
En bas de la page Swagger, section **"Schemas"** :
- Cliquez sur `User`, `Course`, `Enrollment`, `Note`
- Voir tous les champs disponibles avec exemples

### 🔍 Chercher une route
Utilisez `Ctrl+F` dans le navigateur pour chercher un mot-clé

### 📋 Copier les exemples
Les exemples de requêtes sont copiables directement

### 🎨 Status codes colorés
- 🟢 200-299 : Succès
- 🟡 400-499 : Erreur client (permissions, validation)
- 🔴 500-599 : Erreur serveur

### 🔄 Changer de rôle
Pour tester avec un autre rôle :
1. Obtenir le token du nouvel utilisateur
2. Cliquer sur **🔓 Authorize**
3. Remplacer le token
4. **Authorize**

---

## 🐛 Dépannage

### ❌ "Failed to fetch"
→ Les émulateurs ne sont pas démarrés. Lancez `npm run serve`

### ❌ 401 Unauthorized
→ Token manquant ou expiré. Cliquez sur 🔓 Authorize et ajoutez votre token

### ❌ 403 Forbidden
→ Votre rôle n'a pas les permissions pour cette action
- Vérifiez que vous utilisez le bon token (admin/prof/student)
- Vérifiez les permissions dans la documentation de la route

### ❌ Interface Swagger vide
→ Attendez quelques secondes que Swagger charge
→ Rafraîchissez la page (F5)

---

## 📸 Captures d'écran

### Page d'accueil Swagger
```
╔══════════════════════════════════════════════════════════╗
║  API Gestion Académique avec RBAC          🔓 Authorize ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  🏥 Health                                               ║
║  ├─ GET /health                                          ║
║                                                          ║
║  👤 Profile                                              ║
║  ├─ GET /v1/profile                                      ║
║  └─ PUT /v1/profile                                      ║
║                                                          ║
║  👨‍💼 Admin                                               ║
║  ├─ POST /v1/users                                       ║
║  ├─ GET /v1/users                                        ║
║  ...                                                     ║
╚══════════════════════════════════════════════════════════╝
```

### Tester une route
```
POST /v1/courses  [Try it out]

Request body:
┌──────────────────────────────────────┐
│ {                                    │
│   "title": "string",                 │
│   "description": "string",           │
│   "maxStudents": 0                   │
│ }                                    │
└──────────────────────────────────────┘

[Execute]

Response:
Status: 201 Created
{
  "data": {
    "id": "abc123",
    "title": "...",
    ...
  }
}
```

---

## 🆚 Swagger vs REST Client vs PowerShell

| Critère | Swagger UI | REST Client | PowerShell |
|---------|-----------|-------------|------------|
| **Interface** | Web 🌐 | Éditeur 📝 | Terminal 💻 |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Automatisation** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Visualisation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

### Quand utiliser quoi ?

- **Swagger** : Explorer l'API, comprendre les endpoints, tests rapides
- **REST Client** : Scénarios répétables, développement
- **PowerShell** : Scripts d'automatisation, CI/CD

---

## 🎓 En résumé

### Démarrage rapide
```bash
# 1. Démarrer les émulateurs
npm run serve

# 2. Obtenir un token
curl -X POST "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

# 3. Ouvrir Swagger
http://localhost:5001/backend-demo-1/us-central1/api/docs

# 4. Authorize avec le token

# 5. Tester les routes !
```

---

**Swagger rend vos tests d'API **beaucoup plus simples et visuels** ! 🚀**

**Bon test ! 🎉**

