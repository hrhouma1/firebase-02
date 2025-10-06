# 🚀 Référence Rapide des Commandes - Firebase Functions API

## 📋 Table des matières

- [Démarrage Rapide](#démarrage-rapide)
- [Installation](#installation)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Maintenance](#maintenance)
- [Dépannage](#dépannage)

---

## ⚡ Démarrage Rapide

### Une seule commande pour tout démarrer

```bash
npm run serve
```

Cette commande :
1. ✅ Nettoie automatiquement les ports (9099, 8081, 5001, 4000, 4400, 4500, 9150)
2. ✅ Démarre tous les émulateurs Firebase (Auth, Firestore, Functions)
3. ✅ Active le hot-reload pour les functions

---

## 📦 Installation

### Installation Initiale (première fois)

```bash
# 1. Installer les dépendances root
npm install

# 2. Installer les dépendances des functions
cd functions
npm install
cd ..

# 3. Se connecter à Firebase (si pas déjà fait)
firebase login

# 4. Vérifier la configuration
firebase projects:list
```

### Réinstallation Propre

```bash
# Supprimer tous les node_modules
Remove-Item -Recurse -Force node_modules, functions/node_modules

# Réinstaller
npm install
cd functions && npm install && cd ..
```

---

## 🛠️ Développement

### Démarrer les Émulateurs

```bash
# Méthode 1 : Avec nettoyage automatique des ports (RECOMMANDÉ)
npm run serve

# Méthode 2 : Sans nettoyage (si déjà propre)
firebase emulators:start

# Méthode 3 : Avec UI uniquement
firebase emulators:start --only auth,firestore
```

### Compiler TypeScript

```bash
# Compiler une fois
npm run build

# Compiler en mode watch (recompile automatiquement)
cd functions
npm run build:watch
```

### Nettoyer et Recompiler

```bash
# Supprimer le dossier lib compilé
Remove-Item -Recurse -Force functions/lib

# Recompiler proprement
npm run build
```

---

## 🧪 Tests

### URLs de Test

| Service | URL | Description |
|---------|-----|-------------|
| **Swagger UI** | http://localhost:5001/backend-demo-1/us-central1/api/docs/ | Interface interactive de test |
| **Health Check** | http://localhost:5001/backend-demo-1/us-central1/api/health | Vérifier que l'API fonctionne |
| **Emulator UI** | http://localhost:4000/ | Interface Firebase (Auth, Firestore, Functions) |
| **Firestore** | http://localhost:8081/ | Émulateur Firestore direct |
| **Auth** | http://localhost:9099/ | Émulateur Auth direct |

### Tests PowerShell

```powershell
# Test Health Check
Invoke-WebRequest -Uri "http://localhost:5001/backend-demo-1/us-central1/api/health" -UseBasicParsing

# Test avec curl
curl.exe -s http://localhost:5001/backend-demo-1/us-central1/api/health

# Test redirection
curl.exe -I http://localhost:5001/backend-demo-1/us-central1/api/
```

### Tests avec fichiers .http

```bash
# 1. Installer l'extension REST Client dans VS Code/Cursor

# 2. Ouvrir les fichiers dans api-tests/
# - 01-auth.http         : Créer comptes et se connecter
# - 02-admin.http        : Tests admin
# - 03-professor.http    : Tests professeur
# - 04-student.http      : Tests étudiant
# - 06-scenario-guide.http : Scénario complet guidé

# 3. Cliquer sur "Send Request" au-dessus de chaque requête
```

---

## 🚀 Déploiement

### Déployer en Production

```bash
# Déployer tout (functions + rules)
npm run deploy:all

# Déployer seulement les functions
npm run deploy:functions

# Déployer seulement les rules Firestore
npm run deploy:rules
```

### Vérifier avant de déployer

```bash
# Compiler TypeScript
npm run build

# Vérifier les erreurs
cd functions
npm run lint
```

### Déploiement avec vérification

```bash
# 1. Compiler et vérifier
npm run build
cd functions && npm run lint && cd ..

# 2. Tester en local
npm run serve
# Tester manuellement...

# 3. Déployer
npm run deploy:all
```

---

## 🔧 Maintenance

### Nettoyer les Ports Bloqués

```bash
# Méthode 1 : Script automatique
.\clean-emu-ports.bat

# Méthode 2 : Manuel (PowerShell)
# Trouver les processus sur les ports
netstat -ano | findstr ":5001 :8081 :9099 :4000"

# Tuer un processus spécifique
taskkill /F /PID <PID>

# Tuer tous les processus Java (émulateurs)
taskkill /F /IM java.exe
```

### Logs et Debug

```bash
# Voir les logs Firebase Functions (production)
firebase functions:log

# Voir les logs en temps réel
firebase functions:log --only api

# Logs des émulateurs (locaux)
# - firebase-debug.log
# - firestore-debug.log
Get-Content firebase-debug.log -Tail 50
Get-Content firestore-debug.log -Tail 50
```

### Vérifier l'État du Projet

```bash
# Lister les projets Firebase
firebase projects:list

# Voir le projet actuel
firebase use

# Changer de projet
firebase use <project-id>

# Voir les functions déployées
firebase functions:list
```

---

## 🐛 Dépannage

### Problème : Port déjà utilisé

```bash
# Solution automatique
.\clean-emu-ports.bat
npm run serve

# Solution manuelle
netstat -ano | findstr ":8081"
taskkill /F /PID <PID>
```

### Problème : Function does not exist

```bash
# 1. Nettoyer et recompiler
Remove-Item -Recurse -Force functions/lib
npm run build

# 2. Nettoyer les ports
.\clean-emu-ports.bat

# 3. Redémarrer
npm run serve

# 4. Attendre 10-15 secondes après "All emulators ready"

# 5. Tester
curl.exe -s http://localhost:5001/backend-demo-1/us-central1/api/health
```

### Problème : Swagger UI 404

```bash
# Vérifier que la fonction est chargée
curl.exe -s http://localhost:5001/backend-demo-1/us-central1/api/health

# Vérifier la redirection
curl.exe -I http://localhost:5001/backend-demo-1/us-central1/api/

# URL correcte Swagger (avec trailing slash)
http://localhost:5001/backend-demo-1/us-central1/api/docs/
```

### Problème : Modifications TypeScript non prises en compte

```bash
# Recompiler manuellement
npm run build

# Ou utiliser le mode watch
cd functions
npm run build:watch
# Gardez ce terminal ouvert
```

### Problème : Dépendances manquantes

```bash
# Vérifier les dépendances
cd functions
npm list

# Réinstaller proprement
Remove-Item -Recurse -Force node_modules
npm install
cd ..
```

### Problème : Erreur "punycode deprecated"

```
# C'est juste un warning, pas une erreur
# Peut être ignoré en toute sécurité
# Sera corrigé dans une future version de Node.js
```

---

## 📊 Vérifications Système

### Vérifier les ports ouverts

```powershell
# Tous les ports Firebase
netstat -ano | findstr ":5001 :8081 :9099 :4000 :4400 :4500 :9150"

# Port spécifique
netstat -ano | findstr ":5001"
```

### Vérifier les processus Firebase

```powershell
# Processus Node.js
Get-Process node

# Processus Java (émulateurs Firestore/Auth)
Get-Process java

# Tuer tous les processus Firebase
Get-Process node | Where-Object {$_.CommandLine -like "*firebase*"} | Stop-Process -Force
Get-Process java | Stop-Process -Force
```

---

## 🎯 Workflow Recommandé

### Développement Quotidien

```bash
# 1. Démarrer les émulateurs
npm run serve

# 2. Dans un autre terminal : Mode watch TypeScript
cd functions
npm run build:watch

# 3. Développer dans functions/src/

# 4. Tester avec Swagger UI ou fichiers .http

# 5. Ctrl+C pour arrêter
```

### Avant de Commiter

```bash
# 1. Linter le code
cd functions
npm run lint

# 2. Compiler
cd ..
npm run build

# 3. Tester en local
npm run serve
# Tests manuels...

# 4. Commit
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"
git push
```

### Avant de Déployer

```bash
# 1. Vérifier la branche
git branch
git status

# 2. Pull les derniers changements
git pull origin main

# 3. Compiler et linter
npm run build
cd functions && npm run lint && cd ..

# 4. Tester en local
npm run serve
# Tests complets...

# 5. Déployer
npm run deploy:all

# 6. Vérifier en production
firebase functions:log
```

---

## 🏷️ Git et Versioning

### Créer un tag de version

```bash
# Ajouter les changements
git add .

# Commiter
git commit -m "Version stable avec RBAC complet"

# Push
git push origin main

# Créer un tag annoté
git tag -a v1.0.0 -m "Version 1.0.0 - API REST Firebase avec RBAC complet"

# Push le tag
git push origin v1.0.0

# Ou push tous les tags
git push origin --tags
```

### Lister les tags

```bash
# Lister tous les tags
git tag

# Voir les détails d'un tag
git show v1.0.0

# Checkout un tag spécifique
git checkout v1.0.0
```

---

## 📱 Raccourcis Utiles

### Créer des alias PowerShell (optionnel)

Ajoutez dans votre `$PROFILE` PowerShell :

```powershell
# Ouvrir le profil
notepad $PROFILE

# Ajouter ces fonctions :
function fb-serve { npm run serve }
function fb-build { npm run build }
function fb-deploy { npm run deploy:all }
function fb-clean { .\clean-emu-ports.bat }
function fb-logs { Get-Content firebase-debug.log -Tail 50 -Wait }

# Recharger
. $PROFILE

# Utiliser
fb-serve
fb-build
fb-deploy
```

---

## 🌐 URLs de Production (après déploiement)

```
# Functions
https://us-central1-backend-demo-1.cloudfunctions.net/api

# Swagger UI (production)
https://us-central1-backend-demo-1.cloudfunctions.net/api/docs/

# Health Check (production)
https://us-central1-backend-demo-1.cloudfunctions.net/api/health
```

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale du projet |
| `START-HERE.md` | Guide de démarrage rapide |
| `01-SWAGGER-GUIDE.md` | Guide d'utilisation de Swagger UI |
| `02-GUIDE-RBAC.md` | Guide complet du système RBAC |
| `GUIDE-REDIRECTION-FIREBASE-FUNCTIONS.md` | Explication du problème de redirection |
| `COMMANDES-REFERENCE.md` | Ce fichier - référence des commandes |
| `api-tests/` | Fichiers .http pour tester l'API |

---

## 🆘 Support

### Problèmes Fréquents

1. **Port occupé** → `.\clean-emu-ports.bat`
2. **Function not found** → Attendre 15s après "emulators ready"
3. **404 sur Swagger** → Utiliser l'URL complète avec `/docs/`
4. **Modifications ignorées** → `npm run build`

### Commande Magique (résout 90% des problèmes)

```bash
# Tout nettoyer et redémarrer proprement
.\clean-emu-ports.bat
Remove-Item -Recurse -Force functions/lib
npm run build
npm run serve
```

---

**Dernière mise à jour :** 6 octobre 2025  
**Version :** 1.0  
**Projet :** Firebase Functions REST API avec RBAC

