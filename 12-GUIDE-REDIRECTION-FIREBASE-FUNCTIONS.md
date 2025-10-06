# 🔄 Guide Complet : Problème de Redirection avec Firebase Functions

## 📋 Table des matières

1. [Le Problème Rencontré](#le-problème-rencontré)
2. [Pourquoi Ce Problème Existe](#pourquoi-ce-problème-existe)
3. [Comprendre Firebase Functions et les Chemins](#comprendre-firebase-functions-et-les-chemins)
4. [La Solution](#la-solution)
5. [Explication Technique Détaillée](#explication-technique-détaillée)
6. [Exemples Concrets](#exemples-concrets)
7. [Bonnes Pratiques](#bonnes-pratiques)
8. [Autres Cas d'Usage](#autres-cas-dusage)

---

## 🚨 Le Problème Rencontré

### Symptôme Initial

Lorsqu'on essayait d'accéder à Swagger UI via :
```
http://localhost:5001/backend-demo-1/us-central1/api/
```

La redirection nous envoyait vers :
```
http://localhost:5001/docs/  ❌ MAUVAISE URL
```

Au lieu de :
```
http://localhost:5001/backend-demo-1/us-central1/api/docs/  ✅ BONNE URL
```

### Résultat

- **Erreur 404 : Not Found**
- Swagger UI inaccessible
- Frustration totale 😤

---

## 🔍 Pourquoi Ce Problème Existe

### 1. Architecture Firebase Functions

Firebase Functions déploie vos endpoints HTTP derrière un **chemin de base (base path)** :

```
https://{REGION}-{PROJECT_ID}.cloudfunctions.net/{FUNCTION_NAME}
```

**En local (émulateurs) :**
```
http://localhost:5001/{PROJECT_ID}/{REGION}/{FUNCTION_NAME}
```

**Dans notre cas :**
```
http://localhost:5001/backend-demo-1/us-central1/api
                      └────────────────────────────┘
                            BASE PATH
```

### 2. Le Code Initial Problématique

```typescript
// ❌ CODE INCORRECT
app.get("/", (_req, res) => {
  res.redirect("/docs/");  // Redirection ABSOLUE
});
```

### 3. Ce Qui Se Passait

Quand Express voit une redirection commençant par `/`, il considère que c'est un chemin **absolu** depuis la **racine du serveur**.

#### Étape par étape :

1. **Requête entrante :**
   ```
   GET http://localhost:5001/backend-demo-1/us-central1/api/
   ```

2. **Express traite la route `/` et exécute :**
   ```typescript
   res.redirect("/docs/");
   ```

3. **Le navigateur reçoit le header HTTP :**
   ```http
   HTTP/1.1 302 Found
   Location: /docs/
   ```

4. **Le navigateur interprète `/docs/` comme :**
   ```
   http://localhost:5001/docs/
   ```
   
   Et **PAS** :
   ```
   http://localhost:5001/backend-demo-1/us-central1/api/docs/
   ```

5. **Résultat : 404 Not Found** 💥

---

## 🧠 Comprendre Firebase Functions et les Chemins

### Comment Express gère les chemins dans Firebase Functions

Lorsque Firebase Functions exécute votre app Express, elle est **montée** à un chemin spécifique.

```
Serveur Firebase : http://localhost:5001/
                   │
                   └── backend-demo-1/
                       └── us-central1/
                           └── api/  ← Votre app Express est ici
                               ├── /
                               ├── /health
                               ├── /docs/
                               └── /v1/...
```

### Ce que voit Express vs ce que voit le client

| Perspective | Chemin vu |
|------------|-----------|
| **Client (navigateur)** | `http://localhost:5001/backend-demo-1/us-central1/api/health` |
| **Express** | `/health` |
| **req.baseUrl** | `/backend-demo-1/us-central1/api` |
| **req.path** | `/health` |
| **req.originalUrl** | `/backend-demo-1/us-central1/api/health` |

### Types de redirections Express

#### 1. Redirection Absolue (commence par `/`)

```typescript
res.redirect("/docs/");
```

**Résultat :** Le navigateur va à `http://localhost:5001/docs/`  
**Problème :** Le base path est perdu ❌

#### 2. Redirection Relative (pas de `/` au début)

```typescript
res.redirect("docs/");
```

**Résultat :** Le navigateur va à `http://localhost:5001/backend-demo-1/us-central1/api/docs/`  
**Parfait :** Le base path est préservé ✅

#### 3. Redirection Complète (URL complète)

```typescript
res.redirect("http://localhost:5001/backend-demo-1/us-central1/api/docs/");
```

**Résultat :** Fonctionne mais pas flexible (hard-coded) ⚠️

---

## ✅ La Solution

### Code Corrigé

```typescript
// ✅ CODE CORRECT - Solution 1 : Redirection relative
app.get("/", (_req, res) => {
  res.redirect("docs/");  // PAS de "/" au début
});

// ✅ CODE CORRECT - Solution 2 : Utiliser req.baseUrl
app.get("/", (req, res) => {
  const basePath = req.baseUrl || "";
  res.redirect(`${basePath}/docs/`);
});

// ✅ CODE CORRECT - Solution 3 : Utiliser une route relative avec ../
app.get("/", (_req, res) => {
  res.redirect("./docs/");
});
```

### Pourquoi ça fonctionne maintenant

Avec `res.redirect("docs/")` :

1. **Requête entrante :**
   ```
   GET http://localhost:5001/backend-demo-1/us-central1/api/
   ```

2. **Express génère le header :**
   ```http
   HTTP/1.1 302 Found
   Location: docs/  ← Chemin RELATIF
   ```

3. **Le navigateur interprète `docs/` comme :**
   ```
   http://localhost:5001/backend-demo-1/us-central1/api/docs/
   ```
   
4. **Résultat : Swagger UI s'affiche !** 🎉

---

## 🔬 Explication Technique Détaillée

### RFC 3986 : URIs et Chemins Relatifs

Selon le RFC 3986 (standard des URIs), un chemin relatif est résolu par rapport à l'URI de base :

```
Base URI: http://localhost:5001/backend-demo-1/us-central1/api/
Relative:  docs/
Result:    http://localhost:5001/backend-demo-1/us-central1/api/docs/
```

```
Base URI: http://localhost:5001/backend-demo-1/us-central1/api/
Absolute:  /docs/
Result:    http://localhost:5001/docs/
```

### Comment Express construit les redirections

Dans le code source d'Express (`response.js`) :

```javascript
// Quand vous faites res.redirect(location)
if (!hasScheme.test(location)) {
  // Si pas de schéma (http://, https://), c'est relatif
  
  if (location[0] === '/') {
    // Commence par "/" = chemin absolu depuis la racine
    location = req.protocol + '://' + req.get('host') + location;
  } else {
    // Pas de "/" au début = relatif au chemin actuel
    location = req.protocol + '://' + req.get('host') + 
               req.originalUrl.replace(/[^/]*$/, '') + location;
  }
}
```

### Headers HTTP générés

#### Avec redirection absolue (`/docs/`)

```http
HTTP/1.1 302 Found
Location: /docs/
Content-Type: text/plain; charset=utf-8
Content-Length: 46
Date: Mon, 06 Oct 2025 20:30:00 GMT
Connection: keep-alive

Found. Redirecting to /docs/
```

#### Avec redirection relative (`docs/`)

```http
HTTP/1.1 302 Found
Location: docs/
Content-Type: text/plain; charset=utf-8
Content-Length: 46
Date: Mon, 06 Oct 2025 20:30:00 GMT
Connection: keep-alive

Found. Redirecting to docs/
```

---

## 💡 Exemples Concrets

### Exemple 1 : Redirection Simple

```typescript
// Dans functions/src/index.ts
app.get("/", (_req, res) => {
  res.redirect("docs/");
});
```

**Test :**
```bash
$ curl -I http://localhost:5001/backend-demo-1/us-central1/api/

HTTP/1.1 302 Found
location: docs/
```

### Exemple 2 : Utiliser req.baseUrl pour plus de clarté

```typescript
app.get("/", (req, res) => {
  // req.baseUrl = "/backend-demo-1/us-central1/api"
  const docsUrl = `${req.baseUrl}/docs/`;
  res.redirect(docsUrl);
});
```

**Test :**
```bash
$ curl -I http://localhost:5001/backend-demo-1/us-central1/api/

HTTP/1.1 302 Found
location: /backend-demo-1/us-central1/api/docs/
```

### Exemple 3 : Gérer production ET émulateurs

```typescript
app.get("/", (req, res) => {
  // Fonctionne en local ET en production
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";
  
  if (isEmulator) {
    // En local : http://localhost:5001/{PROJECT}/{REGION}/{FUNCTION}
    res.redirect("docs/");
  } else {
    // En production : https://{REGION}-{PROJECT}.cloudfunctions.net/{FUNCTION}
    res.redirect("docs/");
  }
  
  // Résultat : la même solution fonctionne partout !
  res.redirect("docs/");
});
```

---

## 📚 Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours utiliser des chemins relatifs pour les redirections internes**
   ```typescript
   res.redirect("docs/");
   res.redirect("../admin/");
   res.redirect("./profile");
   ```

2. **Utiliser `req.baseUrl` si vous avez besoin de construire des URLs**
   ```typescript
   const apiBase = req.baseUrl || "";
   const docsUrl = `${apiBase}/docs/`;
   ```

3. **Tester avec l'URL complète Firebase Functions**
   ```bash
   curl http://localhost:5001/backend-demo-1/us-central1/api/
   ```

4. **Logger les chemins pendant le développement**
   ```typescript
   app.get("/", (req, res) => {
     console.log("baseUrl:", req.baseUrl);
     console.log("originalUrl:", req.originalUrl);
     console.log("path:", req.path);
     res.redirect("docs/");
   });
   ```

### ❌ À ÉVITER

1. **Ne pas utiliser de chemins absolus commençant par `/`**
   ```typescript
   // ❌ MAUVAIS
   res.redirect("/docs/");
   res.redirect("/api/users");
   ```

2. **Ne pas hard-coder les URLs complètes**
   ```typescript
   // ❌ MAUVAIS (ne fonctionne pas en production)
   res.redirect("http://localhost:5001/backend-demo-1/us-central1/api/docs/");
   ```

3. **Ne pas oublier le trailing slash pour les routes**
   ```typescript
   // ⚠️ Peut causer des problèmes
   app.use("/docs", docsRouter);  // Mieux avec app.use("/docs/", ...)
   ```

---

## 🌐 Autres Cas d'Usage

### Cas 1 : Redirections dans des sous-routes

```typescript
// Routes utilisateur
const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  // Redirige vers /backend-demo-1/us-central1/api/users/profile
  res.redirect("users/profile");
});

userRouter.get("/profile", (req, res) => {
  res.json({ user: "John" });
});

app.use("/users", userRouter);
```

### Cas 2 : Redirections vers des ressources externes

```typescript
// OK d'utiliser une URL complète pour des sites externes
app.get("/github", (_req, res) => {
  res.redirect("https://github.com/votreprojet");
});
```

### Cas 3 : Redirections conditionnelles

```typescript
app.get("/dashboard", (req, res) => {
  if (!req.user) {
    // Redirige vers la page de connexion (relatif)
    res.redirect("../auth/login");
  } else {
    // Affiche le dashboard
    res.render("dashboard");
  }
});
```

### Cas 4 : Swagger UI avec chemins dynamiques

```typescript
// Configuration Swagger pour gérer les chemins Firebase Functions
app.get("/docs/openapi.json", (req, res) => {
  const spec = getSwaggerSpec();
  
  // Ajouter le base URL dynamiquement
  spec.servers = [{
    url: req.baseUrl || "/",
    description: "Current environment"
  }];
  
  res.json(spec);
});
```

---

## 🎯 Résumé Final

### Le Problème en Une Phrase

**Les redirections absolues (`/docs/`) dans Firebase Functions perdent le chemin de base (`/backend-demo-1/us-central1/api/`) et envoient vers la racine du serveur.**

### La Solution en Une Ligne

**Utilisez des redirections relatives (`docs/`) pour préserver le chemin de base Firebase Functions.**

### Avant / Après

| Aspect | Avant ❌ | Après ✅ |
|--------|---------|---------|
| **Code** | `res.redirect("/docs/")` | `res.redirect("docs/")` |
| **Header** | `Location: /docs/` | `Location: docs/` |
| **URL finale** | `http://localhost:5001/docs/` | `http://localhost:5001/backend-demo-1/us-central1/api/docs/` |
| **Résultat** | 404 Not Found | Swagger UI fonctionne |

---

## 🔧 Vérification et Tests

### Test 1 : Vérifier la redirection

```bash
curl -I http://localhost:5001/backend-demo-1/us-central1/api/
```

**Résultat attendu :**
```http
HTTP/1.1 302 Found
location: docs/
```

### Test 2 : Suivre la redirection

```bash
curl -L http://localhost:5001/backend-demo-1/us-central1/api/
```

**Résultat attendu :** HTML de Swagger UI

### Test 3 : Vérifier dans le navigateur

1. Ouvrir : `http://localhost:5001/backend-demo-1/us-central1/api/`
2. Observer la barre d'adresse après redirection
3. Doit afficher : `http://localhost:5001/backend-demo-1/us-central1/api/docs/`

---

## 📖 Références

- [Express Response.redirect() Documentation](https://expressjs.com/en/api.html#res.redirect)
- [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [Firebase Functions HTTP Triggers](https://firebase.google.com/docs/functions/http-events)
- [Express Router Documentation](https://expressjs.com/en/4x/api.html#router)

---

## ✨ Conclusion

Ce problème est **très commun** lors du développement avec Firebase Functions, car les développeurs ont l'habitude de travailler avec des apps Express "normales" où les chemins absolus fonctionnent parfaitement.

La clé est de **toujours penser au base path** imposé par Firebase Functions et d'utiliser des **chemins relatifs** pour les redirections internes.

**Règle d'or : Si c'est une redirection interne à votre API, utilisez un chemin relatif !**

---

**Auteur :** Documentation générée suite à la résolution du problème de redirection Swagger UI  
**Date :** 6 octobre 2025  
**Version :** 1.0  
**Projet :** Firebase Functions REST API avec RBAC

