@echo off
setlocal enabledelayedexpansion

echo === Nettoyage des ports Firebase Emulators ===

:: Liste des ports à libérer
set PORTS=9099 8081 5001 4000 4400 4500 9150

for %%P in (%PORTS%) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P" ^| findstr LISTENING') do (
    echo Port %%P occupe par PID %%a - tentative d'arret...
    taskkill /F /PID %%a >nul 2>&1
  )
)

:: Tenter d'arreter les processus Java residuels (emulateurs)
taskkill /F /IM java.exe >nul 2>&1

echo Nettoyage termine.
exit /b 0
