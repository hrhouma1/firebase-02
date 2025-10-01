# DÉMARRAGE ULTRA-RAPIDE

## Checklist en 3 étapes

### Étape 1 : Installer l'extension REST Client

1. Ouvrez VS Code/Cursor
2. Allez dans Extensions (`Ctrl+Shift+X`)
3. Recherchez **"REST Client"**
4. Installez l'extension par **Huachao Mao**

### Étape 2 : Démarrer les émulateurs

```bash
npm run serve
```

Attendez de voir :
```
functions[us-central1-api]: http function initialized
All emulators ready!
```

### Étape 3 : Suivre le scénario guidé

1. Ouvrez le fichier **`SCENARIO-GUIDE.http`**
2. Suivez les instructions **étape par étape**
3. Cliquez sur **"Send Request"** au-dessus de chaque requête

---

## Scénario en bref

Le fichier `SCENARIO-GUIDE.http` vous guide à travers :

| Étape | Rôle | Action |
|-------|------|--------|
| 1-4 | **Admin** | Créer le système et les utilisateurs |
| 5-7 | **Professeur** | Créer 2 cours (Python, JavaScript) |
| 8-12 | **Étudiante Sophie** | S'inscrire aux cours et prendre des notes |
| 13-14 | **Étudiant Lucas** | S'inscrire au cours Python |
| 15-16 | **Professeur** | Voir les inscriptions et modifier le cours |
| 17 | **Sophie** | Annuler une inscription |
| 18 | **Admin** | Rapport complet du système |
| 19 | **Tests** | Vérifier les permissions (doivent échouer) |

---

## Comment utiliser REST Client

### Envoyer une requête
Cliquez sur **"Send Request"** qui apparaît au-dessus de chaque requête :

```http
### Cliquez ici sur "Send Request"
GET http://localhost:5001/.../api/health
```

### Voir la réponse
La réponse s'affiche dans un nouvel onglet à droite avec :
- Le **status code** (200, 201, 403, etc.)
- Les **headers**
- Le **corps de la réponse** (JSON formaté)

### Variables automatiques
Les réponses sont stockées automatiquement :

```http
# @name login
POST .../signInWithPassword
...

# Utiliser le token de la réponse précédente
@token = {{login.response.body.idToken}}

GET .../profile
Authorization: Bearer {{token}}
```

---

## Changements de rôle

Le scénario vous indique clairement quand changer de rôle :

```
################################################################################
#   CHANGEMENT DE RÔLE: Admin → Professeur
################################################################################
```

À ce moment :
1. Exécutez la requête de **login** pour le nouveau rôle
2. Un nouveau token est créé automatiquement
3. Continuez avec les requêtes suivantes

---

## Raccourcis clavier

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Envoyer la requête | `Ctrl+Alt+R` | `Cmd+Alt+R` |
| Annuler | `Ctrl+Alt+K` | `Cmd+Alt+K` |

---

## IMPORTANT : Créer le profil Admin

À l'**Étape 1**, après avoir créé le compte admin, vous devez manuellement créer son profil dans Firestore :

### Instructions visuelles :

1. **Ouvrir l'UI des émulateurs**
   - Allez sur http://localhost:4000
   - Cliquez sur **"Firestore Database"**

2. **Créer la collection**
   - Cliquez sur **"Start collection"**
   - Nom : `users`
   - Cliquez sur **"Next"**

3. **Créer le document admin**
   - **Document ID** : Collez le `localId` copié de la réponse
   - Ajoutez les champs (cliquez sur **"Add field"** pour chaque) :

   | Nom du champ | Type | Valeur |
   |--------------|------|--------|
   | uid | string | [le localId] |
   | email | string | admin@school.com |
   | role | string | admin |
   | firstName | string | Super |
   | lastName | string | Admin |
   | createdAt | number | 1704067200000 |
   | updatedAt | number | 1704067200000 |

4. **Sauvegarder**
   - Cliquez sur **"Save"**

5. **Continuer le scénario**
   - Revenez dans le fichier `.http`
   - Continuez à l'étape suivante

---

## Problèmes courants

### ❌ "Connection refused"
→ Les émulateurs ne sont pas démarrés. Exécutez `npm run serve`

### ❌ "User profile not found"
→ Vous n'avez pas créé le profil admin dans Firestore (voir ci-dessus)

### ❌ "403 Forbidden"
→ C'est normal pour les tests de sécurité ! Vérifiez que c'est bien un test attendu

### ❌ Variables non définies
→ Exécutez d'abord la requête qui définit la variable (celle avec `# @name`)

---

## Après le scénario

Une fois le scénario terminé, vous pouvez :

1. **Explorer les autres fichiers** :
   - `01-admin.http` - Tous les tests admin
   - `02-professor.http` - Tous les tests professeur
   - `03-student.http` - Tous les tests étudiant

2. **Modifier et expérimenter** :
   - Changez les valeurs
   - Ajoutez vos propres requêtes
   - Testez d'autres scénarios

3. **Consulter la documentation complète** :
   - `GUIDE_RBAC.md` - Guide détaillé
   - `README.md` - Documentation du projet

---

## Captures d'écran de l'UI

### Interface Firestore (http://localhost:4000)

```
┌─────────────────────────────────────────┐
│  Firebase Emulator Suite               │
├─────────────────────────────────────────┤
│  Functions  │ Authentication            │
│  Firestore  │ Logs                      │
└─────────────────────────────────────────┘

Firestore Database:
└── users
    ├── [adminUid]
    │   ├── uid: "..."
    │   ├── email: "admin@school.com"
    │   ├── role: "admin"
    │   └── ...
    ├── [profUid]
    └── [studentUid]
```

---

## Astuce Pro

Gardez l'UI des émulateurs ouverte (http://localhost:4000) pendant les tests pour voir en temps réel :
- Les utilisateurs créés dans **Authentication**
- Les documents dans **Firestore**
- Les logs des fonctions dans **Logs**

---

**Prêt ? Ouvrez `SCENARIO-GUIDE.http` et commencez !**

