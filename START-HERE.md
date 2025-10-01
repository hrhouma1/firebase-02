# COMMENCEZ ICI - GUIDE RAPIDE

## Swagger ne fonctionne pas bien avec Firebase Functions

**Utilisez les fichiers .http à la place - C'est beaucoup plus simple !**

---

## ÉTAPES ULTRA-RAPIDES

### 1. Installer l'extension REST Client

Dans VS Code/Cursor :
- Extensions (Ctrl+Shift+X)
- Cherchez "REST Client"
- Installez

### 2. Ouvrir le fichier de test

**Ouvrez : `api-tests/01-auth.http`**

### 3. Créer votre admin

1. Trouvez la section "CRÉER UN COMPTE ADMIN"
2. Cliquez sur **"Send Request"** au-dessus de la requête
3. Vous devez voir une réponse avec Status 201
4. Le compte ET le profil Firestore sont créés automatiquement !

### 4. Obtenir le token

1. Section "SE CONNECTER ET OBTENIR LE TOKEN"
2. Cliquez sur **"Send Request"**
3. Le token est automatiquement stocké dans la variable `@adminToken`

### 5. Tester

1. Section "TESTER LA CONNEXION"
2. Cliquez sur **"Send Request"**
3. Vous voyez votre profil admin !

### 6. Créer un professeur et un étudiant

Continuez dans le fichier `01-auth.http` en cliquant sur "Send Request" pour chaque section.

---

## Fichiers à utiliser dans l'ordre

| Fichier | Description |
|---------|-------------|
| **01-auth.http** | Créer les comptes (commencez ici) |
| **02-admin.http** | Tests admin (gérer les users) |
| **03-professor.http** | Tests professeur (créer des cours) |
| **04-student.http** | Tests étudiant (s'inscrire) |
| **06-scenario-guide.http** | Scénario complet guidé |

---

## URLs utiles

- **UI Firebase** : http://localhost:4000
- **Health Check** : http://localhost:5001/backend-demo-1/us-central1/api/health

---

## Pourquoi REST Client au lieu de Swagger ?

- Plus simple et plus rapide
- Pas de problème de redirection
- Variables automatiques
- Fichiers réutilisables
- Parfait pour Firebase Functions

---

**Ouvrez `api-tests/01-auth.http` et commencez à cliquer sur "Send Request" !**

