@echo off
echo ========================================
echo Push vers GitHub - firebase-01
echo ========================================
echo.

REM Vérifier si git est initialisé
if not exist .git (
    echo [0/7] Initialisation du depot git...
    git init
    echo.
)

REM Nettoyer le .git dans functions si existant
if exist functions\.git (
    echo [1/7] Nettoyage du sous-depot git dans functions...
    rmdir /s /q functions\.git
    echo.
)

REM Ajouter tous les fichiers
echo [2/7] Ajout des fichiers...
git add .

REM Commit
echo.
echo [3/7] Commit des changements...
git commit -m "Update: API REST avec RBAC (Admin/Professeur/Etudiant) + Swagger UI fonctionnel"

REM Ajouter le remote (ignorer l'erreur si déjà existant)
echo.
echo [4/7] Configuration du remote GitHub...
git remote add origin https://github.com/hrhouma1/firebase-01.git 2>nul
if errorlevel 1 (
    echo Remote deja configure, mise a jour...
    git remote set-url origin https://github.com/hrhouma1/firebase-01.git
)

REM Basculer sur main
echo.
echo [5/7] Basculement vers la branche main...
git branch -M main

REM Push
echo.
echo [6/7] Push vers GitHub...
git push -u origin main

echo.
echo ========================================
echo Push termine avec succes!
echo ========================================
echo.
pause

