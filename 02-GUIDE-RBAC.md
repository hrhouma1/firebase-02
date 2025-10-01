# Guide Complet - API REST avec RBAC (Rôles)

## Vue d'ensemble

Cette API implémente un système de **contrôle d'accès basé sur les rôles (RBAC)** avec 3 rôles :

### Les 3 Rôles

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Administrateur système | - Gérer tous les utilisateurs<br>- Accéder à toutes les fonctionnalités<br>- Modifier/supprimer tous les contenus |
| **Professeur** | Enseignant | - Créer et gérer ses cours<br>- Voir les inscriptions de ses cours<br>- Gérer ses notes personnelles |
| **Étudiant** | Apprenant | - S'inscrire aux cours<br>- Voir ses inscriptions<br>- Gérer ses notes personnelles |

---

## Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
npm install
cd functions && npm install && cd ..

# Démarrer les émulateurs
npm run serve
```

### 2. Créer le premier Admin (PowerShell)

```powershell
# 1. Créer l'utilisateur dans Auth
$signup = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$adminUid = $signup.localId

# 2. Se connecter pour obtenir le token
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'

$token = $login.idToken

# 3. Créer le profil admin dans Firestore (via UI Emulator)
# Ouvrir http://localhost:4000 → Firestore → Collection "users" → Ajouter document:
# Document ID: $adminUid
# Champs:
# - uid: $adminUid
# - email: "admin@school.com"
# - role: "admin"
# - firstName: "Super"
# - lastName: "Admin"
# - createdAt: 1704067200000
# - updatedAt: 1704067200000
```

---

## Guide d'Utilisation par Rôle

### Variables d'environnement PowerShell

```powershell
# Base URL de l'API
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"

# Headers avec authentification
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
```

---

## Scénario 1 : Admin

### Créer un Professeur

```powershell
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

$profUid = $prof.data.uid
Write-Host "Professeur créé: $profUid"
```

### Créer des Étudiants

```powershell
# Étudiant 1
$student1 = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/users" `
  -Headers $headers `
  -Body (@{
    email = "sophie.dubois@school.com"
    password = "student123"
    role = "student"
    firstName = "Sophie"
    lastName = "Dubois"
  } | ConvertTo-Json)

# Étudiant 2
$student2 = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/users" `
  -Headers $headers `
  -Body (@{
    email = "lucas.bernard@school.com"
    password = "student123"
    role = "student"
    firstName = "Lucas"
    lastName = "Bernard"
  } | ConvertTo-Json)

$student1Uid = $student1.data.uid
$student2Uid = $student2.data.uid
```

### Lister tous les utilisateurs

```powershell
# Tous les utilisateurs
Invoke-RestMethod -Uri "$baseUrl/v1/users" -Headers $headers

# Filtrer par rôle
Invoke-RestMethod -Uri "$baseUrl/v1/users?role=professor" -Headers $headers
Invoke-RestMethod -Uri "$baseUrl/v1/users?role=student" -Headers $headers
```

### Modifier le rôle d'un utilisateur

```powershell
Invoke-RestMethod -Method Put `
  -Uri "$baseUrl/v1/users/$student1Uid" `
  -Headers $headers `
  -Body (@{
    role = "professor"
  } | ConvertTo-Json)
```

### Supprimer un utilisateur

```powershell
Invoke-RestMethod -Method Delete `
  -Uri "$baseUrl/v1/users/$student2Uid" `
  -Headers $headers
```

---

## Scénario 2 : Professeur

### Se connecter en tant que Professeur

```powershell
$profLogin = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"prof.martin@school.com","password":"prof123","returnSecureToken":true}'

$profToken = $profLogin.idToken

$profHeaders = @{
    Authorization = "Bearer $profToken"
    "Content-Type" = "application/json"
}
```

### Consulter son profil

```powershell
Invoke-RestMethod -Uri "$baseUrl/v1/profile" -Headers $profHeaders
```

### Créer un cours

```powershell
$course1 = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/courses" `
  -Headers $profHeaders `
  -Body (@{
    title = "Introduction à Python"
    description = "Apprendre les bases de la programmation Python"
    maxStudents = 30
  } | ConvertTo-Json)

$courseId = $course1.data.id

$course2 = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/courses" `
  -Headers $profHeaders `
  -Body (@{
    title = "JavaScript Avancé"
    description = "Concepts avancés de JavaScript ES6+"
    maxStudents = 25
  } | ConvertTo-Json)
```

### Lister ses cours

```powershell
Invoke-RestMethod -Uri "$baseUrl/v1/courses/my" -Headers $profHeaders
```

### Modifier un cours

```powershell
Invoke-RestMethod -Method Put `
  -Uri "$baseUrl/v1/courses/$courseId" `
  -Headers $profHeaders `
  -Body (@{
    title = "Python pour Débutants"
    maxStudents = 35
  } | ConvertTo-Json)
```

### Voir les inscriptions à un cours

```powershell
Invoke-RestMethod `
  -Uri "$baseUrl/v1/courses/$courseId/enrollments" `
  -Headers $profHeaders
```

### Supprimer un cours

```powershell
Invoke-RestMethod -Method Delete `
  -Uri "$baseUrl/v1/courses/$courseId" `
  -Headers $profHeaders
```

---

## Scénario 3 : Étudiant

### Se connecter en tant qu'Étudiant

```powershell
$studentLogin = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=anything" `
  -ContentType "application/json" `
  -Body '{"email":"sophie.dubois@school.com","password":"student123","returnSecureToken":true}'

$studentToken = $studentLogin.idToken

$studentHeaders = @{
    Authorization = "Bearer $studentToken"
    "Content-Type" = "application/json"
}
```

### Consulter son profil

```powershell
Invoke-RestMethod -Uri "$baseUrl/v1/profile" -Headers $studentHeaders
```

### Modifier son profil

```powershell
Invoke-RestMethod -Method Put `
  -Uri "$baseUrl/v1/profile" `
  -Headers $studentHeaders `
  -Body (@{
    firstName = "Sophie"
    lastName = "Dubois-Martin"
  } | ConvertTo-Json)
```

### Lister tous les cours disponibles

```powershell
$courses = Invoke-RestMethod -Uri "$baseUrl/v1/courses" -Headers $studentHeaders
$courses.data | Format-Table id, title, professorName, currentStudents, maxStudents
```

### Consulter un cours spécifique

```powershell
Invoke-RestMethod -Uri "$baseUrl/v1/courses/$courseId" -Headers $studentHeaders
```

### S'inscrire à un cours

```powershell
$enrollment = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/enrollments" `
  -Headers $studentHeaders `
  -Body (@{
    courseId = $courseId
  } | ConvertTo-Json)

$enrollmentId = $enrollment.data.id
```

### Voir ses inscriptions

```powershell
$myEnrollments = Invoke-RestMethod `
  -Uri "$baseUrl/v1/enrollments/my" `
  -Headers $studentHeaders

# Afficher avec détails des cours
$myEnrollments.data | Format-Table studentName, status, @{Label="Course"; Expression={$_.course.title}}
```

### Annuler une inscription

```powershell
Invoke-RestMethod -Method Delete `
  -Uri "$baseUrl/v1/enrollments/$enrollmentId" `
  -Headers $studentHeaders
```

---

## Gestion des Notes (Tous les rôles)

Tous les utilisateurs authentifiés peuvent gérer leurs propres notes.

### Créer une note

```powershell
$note = Invoke-RestMethod -Method Post `
  -Uri "$baseUrl/v1/notes" `
  -Headers $studentHeaders `
  -Body (@{
    title = "Résumé du cours Python"
    content = "Variables, fonctions, boucles..."
  } | ConvertTo-Json)

$noteId = $note.data.id
```

### Lister ses notes

```powershell
Invoke-RestMethod -Uri "$baseUrl/v1/notes" -Headers $studentHeaders
```

### Mettre à jour une note

```powershell
Invoke-RestMethod -Method Put `
  -Uri "$baseUrl/v1/notes/$noteId" `
  -Headers $studentHeaders `
  -Body (@{
    title = "Résumé Python - Chapitre 1"
    content = "Variables: int, str, float. Fonctions: def, return..."
  } | ConvertTo-Json)
```

### Supprimer une note

```powershell
Invoke-RestMethod -Method Delete `
  -Uri "$baseUrl/v1/notes/$noteId" `
  -Headers $studentHeaders
```

---

## Tests de Sécurité

### Tester les permissions (doit échouer)

```powershell
# Un étudiant ne peut PAS créer de cours
try {
    Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/courses" `
      -Headers $studentHeaders `
      -Body (@{
        title = "Cours non autorisé"
        description = "Ceci devrait échouer"
        maxStudents = 10
      } | ConvertTo-Json)
} catch {
    Write-Host "Erreur attendue: 403 Forbidden"
}

# Un professeur ne peut PAS créer d'utilisateurs
try {
    Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/users" `
      -Headers $profHeaders `
      -Body (@{
        email = "test@test.com"
        password = "test123"
        role = "student"
        firstName = "Test"
        lastName = "Test"
      } | ConvertTo-Json)
} catch {
    Write-Host "Erreur attendue: 403 Forbidden"
}
```

---

## Tableau Récapitulatif des Permissions

| Action | Admin | Professeur | Étudiant |
|--------|-------|------------|----------|
| **Users** |
| Créer utilisateurs | OUI | NON | NON |
| Lister utilisateurs | OUI | NON | NON |
| Modifier utilisateurs | OUI | NON | NON |
| Supprimer utilisateurs | OUI | NON | NON |
| **Courses** |
| Créer cours | OUI | OUI | NON |
| Lister cours | OUI | OUI | OUI |
| Modifier ses cours | OUI | OUI | NON |
| Supprimer ses cours | OUI | OUI | NON |
| Voir inscriptions | OUI | OUI (ses cours) | NON |
| **Enrollments** |
| S'inscrire | OUI | NON | OUI |
| Voir ses inscriptions | OUI | NON | OUI |
| Annuler inscription | OUI | NON | OUI |
| **Notes** |
| CRUD notes | OUI | OUI | OUI |
| **Profile** |
| Voir son profil | OUI | OUI | OUI |
| Modifier son profil | OUI | OUI | OUI |

---

## Déploiement en Production

```bash
# Déployer les functions et les règles
npm run deploy:all

# Créer le premier admin en production
firebase auth:export users.json --project backend-demo-1
# Puis utiliser la console Firebase pour ajouter le document user
```

---

## Troubleshooting

### Erreur 403 "Forbidden"
- Vérifier que l'utilisateur a un profil dans Firestore (`/users/{uid}`)
- Vérifier que le rôle est correct
- Vérifier que le token est valide

### Erreur "User profile not found"
- Créer le document dans Firestore: `users/{uid}` avec les champs requis

### Cours complet
- Vérifier `currentStudents < maxStudents`

---

## Ressources

- [Firebase Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Express.js](https://expressjs.com/)

---

**Bon développement !**

