@echo off
echo ========================================
echo Push vers GitHub - firebase-01
echo ========================================
echo.

REM Vérifier si git est initialisé
if not exist .git (
    echo [0/6] Initialisation du depot git...
    git init
    echo.
)

REM Ajouter tous les fichiers
echo [1/6] Ajout des fichiers...
git add .

REM Commit
echo.
echo [2/6] Commit des changements...
git commit -m "Update: API REST avec RBAC (Admin/Professeur/Etudiant) + Swagger UI fonctionnel"

REM Ajouter le remote (ignorer l'erreur si déjà existant)
echo.
echo [3/6] Configuration du remote GitHub...
git remote add origin https://github.com/hrhouma1/firebase-01.git 2>nul
if errorlevel 1 (
    echo Remote deja configure, mise a jour...
    git remote set-url origin https://github.com/hrhouma1/firebase-01.git
)

REM Basculer sur main
echo.
echo [4/6] Basculement vers la branche main...
git branch -M main

REM Push
echo.
echo [5/6] Push vers GitHub...
git push -u origin main

echo.
echo ========================================
echo Push termine avec succes!
echo ========================================
echo.
pause

