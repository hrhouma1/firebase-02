# Guide Push GitHub

## Scripts disponibles

### 1. push-to-github.bat (Premier push)
Utiliser ce script pour le premier push vers GitHub :
```bash
push-to-github.bat
```

Ce script va :
1. Ajouter tous les fichiers (`git add .`)
2. Créer un commit avec un message descriptif
3. Configurer le remote GitHub (si pas déjà fait)
4. Basculer sur la branche `main`
5. Pusher vers GitHub

### 2. quick-push.bat (Push rapide)
Pour les pushs suivants, utiliser ce script plus simple :
```bash
quick-push.bat
```

## Push manuel (PowerShell/CMD)

Si vous préférez faire le push manuellement :

```powershell
# Ajouter les fichiers
git add .

# Commit
git commit -m "Votre message"

# Push
git push
```

## Premier push manuel

Si c'est votre premier push :

```powershell
# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit: API REST avec RBAC + Swagger"

# Configurer le remote
git remote add origin https://github.com/hrhouma1/firebase-01.git

# Basculer sur main
git branch -M main

# Push initial
git push -u origin main
```

## Fichiers ignorés

Le `.gitignore` exclut automatiquement :
- `node_modules/`
- `functions/lib/`
- `.emulator-data/`
- Logs Firebase
- Fichiers IDE

## Résolution de problèmes

### Erreur "remote already exists"
```powershell
git remote set-url origin https://github.com/hrhouma1/firebase-01.git
git push -u origin main
```

### Erreur "rejected" (conflit)
```powershell
git pull origin main --rebase
git push
```

### Forcer le push (ATTENTION : écrase l'historique distant)
```powershell
git push -f origin main
```

## Vérifier l'état

```powershell
# Voir les fichiers modifiés
git status

# Voir l'historique
git log --oneline -10

# Voir les remotes
git remote -v
```

