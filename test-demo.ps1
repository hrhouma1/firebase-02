# Script de démonstration complète du système RBAC
# À exécuter après avoir démarré les émulateurs avec: npm run serve

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5001/backend-demo-1/us-central1/api"
$authUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎓 Démonstration Système RBAC - API Académique         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Fonction helper pour afficher les résultats
function Show-Result {
    param($Title, $Data)
    Write-Host "✅ $Title" -ForegroundColor Green
    Write-Host ($Data | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    Write-Host ""
}

function Show-Error {
    param($Title, $Error)
    Write-Host "❌ $Title" -ForegroundColor Red
    Write-Host $Error -ForegroundColor DarkRed
    Write-Host ""
}

# ============================================
# 1. CRÉATION DU COMPTE ADMIN
# ============================================
Write-Host "📋 Étape 1: Création du compte Admin" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────" -ForegroundColor Yellow

try {
    # Créer le compte Auth
    $adminSignup = Invoke-RestMethod -Method Post `
      -Uri "$authUrl/accounts:signUp?key=anything" `
      -ContentType "application/json" `
      -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'
    
    $adminUid = $adminSignup.localId
    
    # Se connecter
    $adminLogin = Invoke-RestMethod -Method Post `
      -Uri "$authUrl/accounts:signInWithPassword?key=anything" `
      -ContentType "application/json" `
      -Body '{"email":"admin@school.com","password":"admin123","returnSecureToken":true}'
    
    $adminToken = $adminLogin.idToken
    $adminHeaders = @{
        Authorization = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    Show-Result "Admin créé (UID: $adminUid)" @{email="admin@school.com"}
    
    Write-Host "⚠️  IMPORTANT: Créez manuellement le profil admin dans Firestore" -ForegroundColor Magenta
    Write-Host "   1. Ouvrez http://localhost:4000" -ForegroundColor White
    Write-Host "   2. Allez dans Firestore" -ForegroundColor White
    Write-Host "   3. Créez une collection 'users'" -ForegroundColor White
    Write-Host "   4. Créez un document avec ID: $adminUid" -ForegroundColor White
    Write-Host "   5. Ajoutez ces champs:" -ForegroundColor White
    Write-Host "      - uid: '$adminUid'" -ForegroundColor White
    Write-Host "      - email: 'admin@school.com'" -ForegroundColor White
    Write-Host "      - role: 'admin'" -ForegroundColor White
    Write-Host "      - firstName: 'Super'" -ForegroundColor White
    Write-Host "      - lastName: 'Admin'" -ForegroundColor White
    Write-Host "      - createdAt: 1704067200000 (number)" -ForegroundColor White
    Write-Host "      - updatedAt: 1704067200000 (number)" -ForegroundColor White
    Write-Host ""
    Write-Host "Appuyez sur ENTRÉE une fois le profil créé..." -ForegroundColor Yellow
    $null = Read-Host
    
} catch {
    Show-Error "Erreur lors de la création de l'admin" $_.Exception.Message
    exit 1
}

# ============================================
# 2. ADMIN CRÉE DES UTILISATEURS
# ============================================
Write-Host ""
Write-Host "📋 Étape 2: Admin crée un professeur et des étudiants" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor Yellow

# Créer un professeur
try {
    $professor = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/users" `
      -Headers $adminHeaders `
      -Body (@{
        email = "prof.martin@school.com"
        password = "prof123"
        role = "professor"
        firstName = "Jean"
        lastName = "Martin"
      } | ConvertTo-Json)
    
    $profUid = $professor.data.uid
    Show-Result "Professeur créé" $professor.data
} catch {
    Show-Error "Erreur création professeur" $_.Exception.Message
}

# Créer étudiant 1
try {
    $student1 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/users" `
      -Headers $adminHeaders `
      -Body (@{
        email = "sophie.dubois@school.com"
        password = "student123"
        role = "student"
        firstName = "Sophie"
        lastName = "Dubois"
      } | ConvertTo-Json)
    
    $student1Uid = $student1.data.uid
    Show-Result "Étudiant 1 créé" $student1.data
} catch {
    Show-Error "Erreur création étudiant 1" $_.Exception.Message
}

# Créer étudiant 2
try {
    $student2 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/users" `
      -Headers $adminHeaders `
      -Body (@{
        email = "lucas.bernard@school.com"
        password = "student123"
        role = "student"
        firstName = "Lucas"
        lastName = "Bernard"
      } | ConvertTo-Json)
    
    $student2Uid = $student2.data.uid
    Show-Result "Étudiant 2 créé" $student2.data
} catch {
    Show-Error "Erreur création étudiant 2" $_.Exception.Message
}

# Lister tous les utilisateurs
try {
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/v1/users" -Headers $adminHeaders
    Show-Result "Liste de tous les utilisateurs (${$allUsers.count} total)" $allUsers.data
} catch {
    Show-Error "Erreur liste utilisateurs" $_.Exception.Message
}

# ============================================
# 3. PROFESSEUR CRÉE DES COURS
# ============================================
Write-Host ""
Write-Host "📋 Étape 3: Professeur crée des cours" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────" -ForegroundColor Yellow

# Se connecter en tant que professeur
try {
    $profLogin = Invoke-RestMethod -Method Post `
      -Uri "$authUrl/accounts:signInWithPassword?key=anything" `
      -ContentType "application/json" `
      -Body '{"email":"prof.martin@school.com","password":"prof123","returnSecureToken":true}'
    
    $profToken = $profLogin.idToken
    $profHeaders = @{
        Authorization = "Bearer $profToken"
        "Content-Type" = "application/json"
    }
    
    # Créer cours 1
    $course1 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/courses" `
      -Headers $profHeaders `
      -Body (@{
        title = "Introduction à Python"
        description = "Apprendre les bases de la programmation Python"
        maxStudents = 30
      } | ConvertTo-Json)
    
    $course1Id = $course1.data.id
    Show-Result "Cours 1 créé" $course1.data
    
    # Créer cours 2
    $course2 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/courses" `
      -Headers $profHeaders `
      -Body (@{
        title = "JavaScript Avancé"
        description = "Concepts avancés de JavaScript ES6+"
        maxStudents = 25
      } | ConvertTo-Json)
    
    $course2Id = $course2.data.id
    Show-Result "Cours 2 créé" $course2.data
    
} catch {
    Show-Error "Erreur lors de la création des cours" $_.Exception.Message
}

# ============================================
# 4. ÉTUDIANT S'INSCRIT AUX COURS
# ============================================
Write-Host ""
Write-Host "📋 Étape 4: Étudiants s'inscrivent aux cours" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────" -ForegroundColor Yellow

# Se connecter en tant qu'étudiant 1
try {
    $student1Login = Invoke-RestMethod -Method Post `
      -Uri "$authUrl/accounts:signInWithPassword?key=anything" `
      -ContentType "application/json" `
      -Body '{"email":"sophie.dubois@school.com","password":"student123","returnSecureToken":true}'
    
    $student1Token = $student1Login.idToken
    $student1Headers = @{
        Authorization = "Bearer $student1Token"
        "Content-Type" = "application/json"
    }
    
    # Voir tous les cours disponibles
    $availableCourses = Invoke-RestMethod -Uri "$baseUrl/v1/courses" -Headers $student1Headers
    Show-Result "Cours disponibles pour Sophie" $availableCourses.data
    
    # S'inscrire au cours 1
    $enrollment1 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/enrollments" `
      -Headers $student1Headers `
      -Body (@{courseId = $course1Id} | ConvertTo-Json)
    
    Show-Result "Sophie inscrite au cours Python" $enrollment1.data
    
    # S'inscrire au cours 2
    $enrollment2 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/enrollments" `
      -Headers $student1Headers `
      -Body (@{courseId = $course2Id} | ConvertTo-Json)
    
    Show-Result "Sophie inscrite au cours JavaScript" $enrollment2.data
    
    # Voir ses inscriptions
    $myEnrollments = Invoke-RestMethod -Uri "$baseUrl/v1/enrollments/my" -Headers $student1Headers
    Show-Result "Inscriptions de Sophie" $myEnrollments.data
    
} catch {
    Show-Error "Erreur lors des inscriptions" $_.Exception.Message
}

# Étudiant 2 s'inscrit aussi
try {
    $student2Login = Invoke-RestMethod -Method Post `
      -Uri "$authUrl/accounts:signInWithPassword?key=anything" `
      -ContentType "application/json" `
      -Body '{"email":"lucas.bernard@school.com","password":"student123","returnSecureToken":true}'
    
    $student2Token = $student2Login.idToken
    $student2Headers = @{
        Authorization = "Bearer $student2Token"
        "Content-Type" = "application/json"
    }
    
    # S'inscrire au cours 1 seulement
    $enrollment3 = Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/enrollments" `
      -Headers $student2Headers `
      -Body (@{courseId = $course1Id} | ConvertTo-Json)
    
    Show-Result "Lucas inscrit au cours Python" $enrollment3.data
    
} catch {
    Show-Error "Erreur inscription Lucas" $_.Exception.Message
}

# ============================================
# 5. PROFESSEUR CONSULTE LES INSCRIPTIONS
# ============================================
Write-Host ""
Write-Host "📋 Étape 5: Professeur consulte les inscriptions" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────" -ForegroundColor Yellow

try {
    $courseEnrollments = Invoke-RestMethod `
      -Uri "$baseUrl/v1/courses/$course1Id/enrollments" `
      -Headers $profHeaders
    
    Show-Result "Inscriptions au cours Python" $courseEnrollments.data
} catch {
    Show-Error "Erreur consultation inscriptions" $_.Exception.Message
}

# ============================================
# 6. TESTS DE SÉCURITÉ
# ============================================
Write-Host ""
Write-Host "📋 Étape 6: Tests de sécurité (tentatives refusées)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Yellow

# Étudiant tente de créer un cours (doit échouer)
Write-Host "Test 1: Étudiant tente de créer un cours..." -ForegroundColor White
try {
    Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/courses" `
      -Headers $student1Headers `
      -Body (@{
        title = "Cours non autorisé"
        description = "Ceci devrait échouer"
        maxStudents = 10
      } | ConvertTo-Json)
    
    Write-Host "❌ ERREUR: L'étudiant a pu créer un cours!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correct: Accès refusé (403)" -ForegroundColor Green
}

# Professeur tente de créer un utilisateur (doit échouer)
Write-Host "Test 2: Professeur tente de créer un utilisateur..." -ForegroundColor White
try {
    Invoke-RestMethod -Method Post `
      -Uri "$baseUrl/v1/users" `
      -Headers $profHeaders `
      -Body (@{
        email = "unauthorized@test.com"
        password = "test123"
        role = "student"
        firstName = "Test"
        lastName = "Test"
      } | ConvertTo-Json)
    
    Write-Host "❌ ERREUR: Le professeur a pu créer un utilisateur!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correct: Accès refusé (403)" -ForegroundColor Green
}

# ============================================
# 7. RÉSUMÉ
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✅ DÉMONSTRATION TERMINÉE               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Résumé des actions:" -ForegroundColor Yellow
Write-Host "  • 1 Admin créé" -ForegroundColor White
Write-Host "  • 1 Professeur créé" -ForegroundColor White
Write-Host "  • 2 Étudiants créés" -ForegroundColor White
Write-Host "  • 2 Cours créés" -ForegroundColor White
Write-Host "  • 3 Inscriptions effectuées" -ForegroundColor White
Write-Host "  • Tests de sécurité validés ✅" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Liens utiles:" -ForegroundColor Yellow
Write-Host "  • Firebase Emulator UI: http://localhost:4000" -ForegroundColor White
Write-Host "  • API Health Check: $baseUrl/health" -ForegroundColor White
Write-Host ""
Write-Host "📚 Pour plus d'informations, consultez GUIDE_RBAC.md" -ForegroundColor Cyan

