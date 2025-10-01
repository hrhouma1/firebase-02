# Tests API avec REST Client

Ce dossier contient des fichiers `.http` pour tester facilement l'API avec l'extension **REST Client** de VS Code/Cursor.

## COMMENCEZ ICI

### Pour les débutants : **[QUICK-START.md](QUICK-START.md)**
Guide ultra-simple en 3 étapes pour démarrer immédiatement.

### Scénario guidé : **[SCENARIO-GUIDE.http](SCENARIO-GUIDE.http)**
**Recommandé !** Suivez un scénario complet étape par étape avec instructions détaillées à chaque changement de rôle.

## Installation de l'extension

### Dans VS Code ou Cursor :

1. Ouvrez le panneau des extensions (`Ctrl+Shift+X` ou `Cmd+Shift+X`)
2. Recherchez **"REST Client"** par **Huachao Mao**
3. Cliquez sur **Install**

**OU** installez directement depuis le terminal :
```bash
code --install-extension humao.rest-client
```

### Alternative : Extension Thunder Client

Si vous préférez une interface graphique :
- Recherchez **"Thunder Client"** dans les extensions
- Plus visuel, similaire à Postman

## Structure des fichiers

| Fichier | Description | Ordre |
|---------|-------------|-------|
| **00-auth.http** | Authentification et création de comptes | 1. Commencer ici |
| **01-admin.http** | Tests pour le rôle Admin | 2. Après avoir créé l'admin |
| **02-professor.http** | Tests pour le rôle Professeur | 3. Après avoir créé le prof |
| **03-student.http** | Tests pour le rôle Étudiant | 4. Après avoir créé l'étudiant |
| **04-workflow-complet.http** | Scénario complet de A à Z | Test d'intégration |

## Comment utiliser

### 1. Démarrer les émulateurs Firebase

```bash
npm run serve
```

Attendez que les émulateurs soient prêts :
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Firestore: http://localhost:8081
- UI: http://localhost:4000

### 2. Créer le premier Admin

#### Étape A : Ouvrir `00-auth.http`

#### Étape B : Créer le compte Auth
Cliquez sur **"Send Request"** au-dessus de cette ligne :
```http
POST {{authUrl}}/accounts:signUp?key=anything
```

#### Étape C : Copier le `localId` de la réponse

#### Étape D : Créer le profil dans Firestore
1. Ouvrez http://localhost:4000
2. Allez dans **Firestore Database**
3. Cliquez sur **Start collection**
4. Nom de la collection : `users`
5. Document ID : Collez le `localId` copié
6. Ajoutez ces champs :

| Champ | Type | Valeur |
|-------|------|--------|
| uid | string | [le localId] |
| email | string | admin@school.com |
| role | string | admin |
| firstName | string | Super |
| lastName | string | Admin |
| createdAt | number | 1704067200000 |
| updatedAt | number | 1704067200000 |

### 3. Tester l'API

#### Option 1 : Tests par Rôle
1. **00-auth.http** → Se connecter et obtenir les tokens
2. **01-admin.http** → Créer les utilisateurs (prof + étudiants)
3. **02-professor.http** → Créer des cours
4. **03-student.http** → S'inscrire aux cours

#### Option 2 : Workflow Complet
Exécuter **04-workflow-complet.http** de haut en bas pour tester tout le système.

## Utilisation de REST Client

### Exécuter une requête
- Cliquez sur **"Send Request"** au-dessus de chaque requête
- Ou utilisez le raccourci : `Ctrl+Alt+R` (Windows/Linux) ou `Cmd+Alt+R` (Mac)

### Variables
Les fichiers utilisent des variables pour réutiliser les réponses :
```http
# @name loginAdmin
POST {{authUrl}}/accounts:signInWithPassword
...

# Utiliser le token de la réponse
@adminToken = {{loginAdmin.response.body.idToken}}
```

### Voir les réponses
- Les réponses s'affichent dans un nouveau panneau
- Format JSON automatiquement indenté
- Status code et headers visibles

### Commenter des requêtes
- Utilisez `###` pour séparer les requêtes
- Utilisez `#` pour les commentaires
- Les lignes commentées sont ignorées

### Variables d'environnement
Définies en haut de chaque fichier :
```http
@apiUrl = http://localhost:5001/backend-demo-1/us-central1/api
@authUrl = http://localhost:9099/identitytoolkit.googleapis.com/v1
```

## Raccourcis Clavier

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Envoyer la requête | `Ctrl+Alt+R` | `Cmd+Alt+R` |
| Annuler la requête | `Ctrl+Alt+K` | `Cmd+Alt+K` |
| Basculer environnements | `Ctrl+Alt+E` | `Cmd+Alt+E` |
| Historique | `Ctrl+Alt+H` | `Cmd+Alt+H` |

## Tests de Sécurité

Chaque fichier contient une section **"TESTS DE SÉCURITÉ"** qui teste que les permissions fonctionnent correctement.

Par exemple, dans `03-student.http` :
```http
### ❌ Test: Un étudiant ne peut PAS créer de cours
POST {{apiUrl}}/v1/courses
Authorization: Bearer {{studentToken}}
```

**Résultat attendu :** `403 Forbidden` OK

## Dépannage

### Erreur 401 "Missing Bearer token"
- Vérifiez que vous avez exécuté la requête de connexion (`# @name loginAdmin`)
- Vérifiez que le token est bien assigné à la variable

### Erreur 403 "Forbidden"
- Vérifiez que l'utilisateur a un profil dans Firestore
- Vérifiez que le rôle est correct (`admin`, `professor`, `student`)

### Erreur 404 "Not found"
- Vérifiez l'URL de l'API
- Vérifiez que les émulateurs sont démarrés

### Variables non définies
- Assurez-vous d'exécuter les requêtes dans l'ordre
- Les variables (`@adminToken`, etc.) doivent être définies avant utilisation

## Ressources

- [REST Client Documentation](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Guide RBAC complet](../GUIDE_RBAC.md)
- [README principal](../README.md)

## Exemple Rapide

```http
### Se connecter
# @name login
POST http://localhost:9099/.../signInWithPassword?key=anything
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "admin123",
  "returnSecureToken": true
}

@token = {{login.response.body.idToken}}

### Utiliser le token
GET http://localhost:5001/.../api/v1/profile
Authorization: Bearer {{token}}
```

**C'est tout ! Beaucoup plus simple que PowerShell !**

