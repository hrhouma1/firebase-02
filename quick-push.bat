@echo off
REM Script rapide pour push git
echo Push rapide vers GitHub...
git add .
git commit -m "Update"
git push
echo.
echo Termine!
pause

