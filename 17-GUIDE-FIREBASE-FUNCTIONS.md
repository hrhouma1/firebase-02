# Guide Complet - Firebase Functions Expliqué Simplement

## Table des matières

1. [Qu'est-ce qu'une Firebase Function ?](#quest-ce-quune-firebase-function)
2. [Que DOIVENT faire les Functions ?](#que-doivent-faire-les-functions)
3. [Que PEUVENT faire les Functions ?](#que-peuvent-faire-les-functions)
4. [Sans Functions vs Avec Functions](#sans-functions-vs-avec-functions)
5. [Dans Notre Projet](#dans-notre-projet)

---

## Qu'est-ce qu'une Firebase Function ?

### Définition Simple

Une Firebase Function est un **programme qui s'exécute sur les serveurs de Google** (pas sur l'ordinateur de l'utilisateur).

```
┌─────────────────────────────────────────────────────┐
│  Ordinateur de l'utilisateur (Frontend)            │
│  - React/Vue/Angular                               │
│  - iPhone/Android App                              │
│  - Site web                                        │
└─────────────────────────────────────────────────────┘
                      ↓
              (Internet)
                      ↓
┌─────────────────────────────────────────────────────┐
│  Serveur Google (Backend)                          │
│  - Firebase Functions  ← Programme côté serveur    │
│  - Code que PERSONNE ne peut voir ou modifier      │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  Base de données Firestore                         │
│  - Stockage des données                            │
└─────────────────────────────────────────────────────┘
```

### Analogie Simple

**Firebase Function = Employé de banque**

SANS Functions (mauvais) :
```
Vous voulez retirer 100€
→ Vous allez DIRECTEMENT dans le coffre-fort
→ Vous prenez l'argent vous-même
→ Vous modifiez vous-même le registre
→ PROBLÈME : N'importe qui peut faire pareil !
```

AVEC Functions (bien) :
```
Vous voulez retirer 100€
→ Vous demandez à l'EMPLOYÉ (Function)
→ L'employé vérifie votre identité
→ L'employé vérifie votre solde
→ L'employé vous donne l'argent
→ L'employé met à jour le registre
→ L'employé garde une trace de la transaction
→ Sécurisé et automatisé !
```

---

## Que DOIVENT faire les Functions ?

### 1. Vérifier l'Identité (Authentification)

**Ce qui DOIT être fait côté serveur :**

```typescript
// functions/src/middlewares/auth.ts

// Vérifier le token JWT
const token = "eyJhbGciOiJSUzI1NiI...";  // Token de l'utilisateur

// La Function vérifie :
1. Le token est-il valide ?
2. Le token a-t-il expiré ?
3. Le token vient-il vraiment de Firebase ?
4. Qui est cet utilisateur ?

// Si tout est OK → Continuer
// Sinon → Erreur 401 Unauthorized
```

**Pourquoi côté serveur ?**
- Un hacker peut modifier le code JavaScript dans son navigateur
- Seul le serveur peut vérifier de manière sûre

### 2. Vérifier les Permissions (Autorisation)

**Ce qui DOIT être fait côté serveur :**

```typescript
// functions/src/middlewares/roles.ts

// Vérifier le rôle
Utilisateur veut créer un cours

// La Function vérifie :
1. L'utilisateur est-il un Professor ou Admin ?
2. Si OUI → Autoriser
3. Si NON → Erreur 403 Forbidden
```

**Pourquoi côté serveur ?**
- Un étudiant peut modifier son rôle dans le frontend
- Seul le serveur peut vérifier le VRAI rôle dans la base de données

### 3. Valider les Données

**Ce qui DOIT être fait côté serveur :**

```typescript
// functions/src/controllers/courseController.ts

// Créer un cours
Données reçues :
{
  title: "Python",
  description: "Apprendre Python",
  maxStudents: 30
}

// La Function vérifie :
1. Le titre est-il rempli ?
2. Le titre fait-il au moins 3 caractères ?
3. maxStudents est-il entre 1 et 1000 ?
4. Le cours existe-t-il déjà ?

// Si tout est OK → Créer le cours
// Sinon → Erreur 422 Validation Error
```

**Pourquoi côté serveur ?**
- Un hacker peut envoyer n'importe quelles données
- Seul le serveur peut garantir que les données sont valides

### 4. Exécuter la Logique Métier

**Ce qui DOIT être fait côté serveur :**

```typescript
// functions/src/controllers/enrollmentController.ts

// S'inscrire à un cours
Étudiant veut s'inscrire au cours "Python"

// La Function fait (automatiquement) :
1. Vérifier que le cours existe
2. Vérifier qu'il reste de la place
3. Vérifier que l'étudiant n'est pas déjà inscrit
4. Créer l'inscription
5. Incrémenter le compteur d'étudiants
6. Logger l'action (audit)
7. Mettre à jour les statistiques

// TOUT ça en UNE SEULE transaction atomique
```

**Pourquoi côté serveur ?**
- Pour garantir que tout se passe en même temps (atomique)
- Pour éviter les race conditions (2 personnes en même temps)
- Pour automatiser toutes les étapes

### 5. Protéger les Secrets

**Ce qui DOIT être fait côté serveur :**

```typescript
// Secrets (JAMAIS dans le frontend)

// Envoyer un email avec SendGrid
const SENDGRID_API_KEY = "SG.abc123...";  // Secret !

// Traiter un paiement avec Stripe
const STRIPE_SECRET_KEY = "sk_live_abc123...";  // Secret !

// Appeler une API externe
const API_KEY = "ma-clé-secrète";  // Secret !
```

**Pourquoi côté serveur ?**
- Le code frontend est visible par tout le monde
- Les clés API doivent rester secrètes

---

## Que PEUVENT faire les Functions ?

### 1. Envoyer des Emails

```typescript
// Exemple : Envoyer un email de bienvenue

import sgMail from '@sendgrid/mail';

export const sendWelcomeEmail = async (email: string, name: string) => {
  await sgMail.send({
    to: email,
    from: 'noreply@myschool.com',
    subject: 'Bienvenue !',
    text: `Bonjour ${name}, bienvenue sur notre plateforme !`
  });
};

// Impossible à faire dans le frontend de manière sécurisée !
```

### 2. Traiter des Paiements

```typescript
// Exemple : Créer un paiement Stripe

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,  // En centimes
    currency: 'eur'
  });
  return paymentIntent;
};

// La clé secrète Stripe ne doit JAMAIS être dans le frontend !
```

### 3. Transformer des Images

```typescript
// Exemple : Redimensionner une photo de profil

import sharp from 'sharp';

export const resizeProfilePicture = async (imageBuffer: Buffer) => {
  const resized = await sharp(imageBuffer)
    .resize(200, 200)
    .jpeg({ quality: 80 })
    .toBuffer();
  
  return resized;
};

// Impossible à faire efficacement dans le frontend !
```

### 4. Planifier des Tâches

```typescript
// Exemple : Envoyer un rappel tous les jours à 9h

export const sendDailyReminders = functions.pubsub
  .schedule('0 9 * * *')  // Tous les jours à 9h
  .onRun(async () => {
    // Envoyer des emails de rappel
    const students = await getStudentsWithClasses();
    
    for (const student of students) {
      await sendReminderEmail(student.email);
    }
  });

// Impossible à faire dans le frontend (qui n'est pas toujours ouvert) !
```

### 5. Réagir à des Événements

```typescript
// Exemple : Quand un nouveau cours est créé, notifier tous les étudiants

export const onCourseCreated = functions.firestore
  .document('courses/{courseId}')
  .onCreate(async (snapshot) => {
    const course = snapshot.data();
    const students = await getAllStudents();
    
    for (const student of students) {
      await sendNewCourseNotification(student.email, course.title);
    }
  });

// Automatique, pas besoin de le déclencher manuellement !
```

---

## Sans Functions vs Avec Functions

### Scénario Concret : Un étudiant s'inscrit à un cours

#### SANS Functions (Frontend fait tout)

```javascript
// Code dans votre application React/Vue/Angular
// Environ 80 lignes de code

async function inscrireAuCours(courseId) {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  
  // 1. Vérifier que l'utilisateur est connecté
  if (!user) {
    alert("Vous devez être connecté");
    return;
  }
  
  // 2. Vérifier le token
  const token = await user.getIdToken();
  // ...
  
  // 3. Lire le profil pour vérifier le rôle
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.data().role !== "student") {
    alert("Seuls les étudiants peuvent s'inscrire");
    return;
  }
  
  // 4. Vérifier que le cours existe
  const courseDoc = await getDoc(doc(db, "courses", courseId));
  if (!courseDoc.exists()) {
    alert("Le cours n'existe pas");
    return;
  }
  
  const course = courseDoc.data();
  
  // 5. Vérifier qu'il reste de la place
  if (course.currentStudents >= course.maxStudents) {
    alert("Le cours est complet");
    return;
  }
  
  // 6. Vérifier que l'étudiant n'est pas déjà inscrit
  const enrollments = await getDocs(
    query(
      collection(db, "enrollments"),
      where("courseId", "==", courseId),
      where("studentUid", "==", user.uid)
    )
  );
  
  if (!enrollments.empty) {
    alert("Déjà inscrit");
    return;
  }
  
  // 7. Créer l'inscription
  await addDoc(collection(db, "enrollments"), {
    courseId: courseId,
    studentUid: user.uid,
    studentName: `${userDoc.data().firstName} ${userDoc.data().lastName}`,
    enrolledAt: Date.now(),
    status: "active"
  });
  
  // 8. Incrémenter le compteur (ATTENTION: Race condition possible !)
  await updateDoc(doc(db, "courses", courseId), {
    currentStudents: course.currentStudents + 1
  });
  
  alert("Inscription réussie !");
}
```

**PROBLÈMES :**
1. 80 lignes de code complexe
2. Race condition : 2 étudiants peuvent s'inscrire en même temps et dépasser maxStudents
3. Pas de transaction atomique
4. Code dupliqué entre web, iOS, Android
5. Un hacker peut modifier le code dans la console
6. Pas de logs d'audit
7. Security Rules deviennent très complexes

---

#### AVEC Functions (Notre Projet)

```javascript
// Code dans votre application React/Vue/Angular
// 10 lignes de code

async function inscrireAuCours(courseId) {
  const token = await firebase.auth().currentUser.getIdToken();
  
  const response = await fetch('/api/v1/enrollments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ courseId })
  });
  
  const data = await response.json();
  alert(data.message);
}
```

**AVANTAGES :**
1. 10 lignes de code simple
2. Pas de race condition (transaction atomique côté serveur)
3. Code réutilisable (web, iOS, Android utilisent la MÊME API)
4. Impossible à hacker (code côté serveur)
5. Logs d'audit automatiques
6. Security Rules simples

---

## Dans Notre Projet

### Structure des Functions

```
firebasefunctionsrest/
│
├── functions/                      ← Dossier des Functions
│   │
│   ├── src/                        ← Code source TypeScript
│   │   │
│   │   ├── index.ts                ← Point d'entrée principal
│   │   │                           ← Crée l'API HTTP
│   │   │
│   │   ├── firebase.ts             ← Connexion Firebase Admin
│   │   │
│   │   ├── middlewares/            ← Automatisations
│   │   │   ├── auth.ts             ← Vérifie le token JWT
│   │   │   └── roles.ts            ← Vérifie les rôles
│   │   │
│   │   └── controllers/            ← Logique métier
│   │       ├── authController.ts       ← Signup, Login
│   │       ├── userController.ts       ← CRUD Users (Admin)
│   │       ├── courseController.ts     ← CRUD Courses (Prof)
│   │       ├── enrollmentController.ts ← Inscriptions (Student)
│   │       └── noteController.ts       ← CRUD Notes (Tous)
│   │
│   └── lib/                        ← Code compilé (généré auto)
│
└── firestore.rules                 ← Security Rules (simples)
```

### Fichier Principal : functions/src/index.ts

```typescript
import * as functions from "firebase-functions";
import express from "express";

const app = express();

// Routes
app.post("/v1/enrollments", 
  requireAuth,        // 1. Vérifie le token JWT
  requireStudent,     // 2. Vérifie que c'est un étudiant
  enrollInCourse      // 3. Inscrit au cours
);

// Créer la Function HTTP
export const api = functions.https.onRequest(app);
```

**Ce fichier fait 3 choses :**
1. Crée un serveur Express
2. Définit les routes (URL)
3. Exporte la Function pour Firebase

### Middleware d'Authentification : functions/src/middlewares/auth.ts

```typescript
export const requireAuth = async (req, res, next) => {
  try {
    // 1. Extraire le token du header
    const token = req.headers.authorization?.split("Bearer ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    // 2. Vérifier le token avec Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 3. Ajouter l'utilisateur à la requête
    req.user = decodedToken;
    
    // 4. Passer au middleware suivant
    next();
    
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

**Ce middleware fait 4 choses :**
1. Extrait le token
2. Vérifie avec Firebase
3. Ajoute l'utilisateur à la requête
4. Passe au suivant

### Middleware de Rôle : functions/src/middlewares/roles.ts

```typescript
export const requireStudent = async (req, res, next) => {
  try {
    // 1. Lire le profil de l'utilisateur
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(req.user.uid)
      .get();
    
    const role = userDoc.data()?.role;
    
    // 2. Vérifier le rôle
    if (role !== "student" && role !== "admin") {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "Student role required" 
      });
    }
    
    // 3. Passer au controller
    next();
    
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
```

**Ce middleware fait 3 choses :**
1. Lit le profil
2. Vérifie le rôle
3. Autorise ou refuse

### Controller d'Inscription : functions/src/controllers/enrollmentController.ts

```typescript
export const enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  const studentUid = req.user.uid;

  try {
    // TRANSACTION ATOMIQUE (évite les race conditions)
    await admin.firestore().runTransaction(async (transaction) => {
      
      // 1. Lire le cours
      const courseRef = admin.firestore().collection("courses").doc(courseId);
      const courseDoc = await transaction.get(courseRef);
      
      if (!courseDoc.exists) {
        throw new Error("Course not found");
      }
      
      const course = courseDoc.data();
      
      // 2. Vérifier les places disponibles
      if (course.currentStudents >= course.maxStudents) {
        throw new Error("Course is full");
      }
      
      // 3. Vérifier que pas déjà inscrit
      const existingEnrollment = await admin.firestore()
        .collection("enrollments")
        .where("courseId", "==", courseId)
        .where("studentUid", "==", studentUid)
        .get();
        
      if (!existingEnrollment.empty) {
        throw new Error("Already enrolled");
      }
      
      // 4. Récupérer le nom de l'étudiant
      const studentDoc = await admin.firestore()
        .collection("users")
        .doc(studentUid)
        .get();
      const studentName = `${studentDoc.data().firstName} ${studentDoc.data().lastName}`;
      
      // 5. Créer l'inscription
      const enrollmentRef = admin.firestore().collection("enrollments").doc();
      transaction.set(enrollmentRef, {
        courseId,
        studentUid,
        studentName,
        enrolledAt: Date.now(),
        status: "active"
      });
      
      // 6. Incrémenter le compteur
      transaction.update(courseRef, {
        currentStudents: admin.firestore.FieldValue.increment(1)
      });
    });
    
    return res.status(201).json({
      message: "Enrolled successfully"
    });
    
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
};
```

**Ce controller fait 6 choses (automatiquement) :**
1. Vérifie que le cours existe
2. Vérifie les places disponibles
3. Vérifie que pas déjà inscrit
4. Récupère le nom de l'étudiant
5. Crée l'inscription
6. Incrémente le compteur

**TOUT en une transaction atomique !**

---

## Flux Complet d'une Requête

### Exemple : Un étudiant s'inscrit à un cours

```
1. FRONTEND (React/Vue/Angular)
   │
   │ L'étudiant clique sur "S'inscrire"
   │
   ├─ Code JavaScript :
   │  fetch('/api/v1/enrollments', {
   │    method: 'POST',
   │    headers: { 'Authorization': 'Bearer eyJhbGc...' },
   │    body: JSON.stringify({ courseId: 'course123' })
   │  })
   │
   └─→ Envoie la requête HTTP
       │
       ↓
       
2. FIREBASE FUNCTIONS (Serveur Google)
   │
   ├─ functions/src/index.ts
   │  │
   │  │ Reçoit : POST /v1/enrollments
   │  │ Headers: Authorization: Bearer eyJhbGc...
   │  │ Body: { courseId: 'course123' }
   │  │
   │  └─→ Route vers les middlewares et controller
   │
   ├─ functions/src/middlewares/auth.ts
   │  │
   │  │ Vérifie le token JWT
   │  │ Extrait l'utilisateur
   │  │
   │  ├─ Si token invalide → 401 Unauthorized
   │  └─ Si token valide → Continue
   │
   ├─ functions/src/middlewares/roles.ts
   │  │
   │  │ Vérifie le rôle dans Firestore
   │  │
   │  ├─ Si pas student → 403 Forbidden
   │  └─ Si student → Continue
   │
   └─ functions/src/controllers/enrollmentController.ts
      │
      │ Transaction atomique :
      │ 1. Vérifie le cours
      │ 2. Vérifie les places
      │ 3. Vérifie pas déjà inscrit
      │ 4. Crée l'inscription
      │ 5. Incrémente le compteur
      │
      └─→ Retourne 201 Created
          │
          ↓
          
3. FIRESTORE (Base de données)
   │
   │ Données sauvegardées :
   │
   ├─ Collection "enrollments"
   │  └─ Document enrollment123
   │     ├─ courseId: "course123"
   │     ├─ studentUid: "student456"
   │     ├─ studentName: "Marie Dupont"
   │     ├─ enrolledAt: 1704067200000
   │     └─ status: "active"
   │
   └─ Collection "courses"
      └─ Document course123
         └─ currentStudents: 15 → 16 (incrémenté)
         
4. FRONTEND (React/Vue/Angular)
   │
   │ Reçoit la réponse :
   │ { message: "Enrolled successfully" }
   │
   └─→ Affiche : "Inscription réussie !"
```

---

## Récapitulatif : Ce que Font les Functions

### Ce qui DOIT être fait dans les Functions

| Quoi | Pourquoi | Fichier |
|------|----------|---------|
| Vérifier le token JWT | Sécurité | `middlewares/auth.ts` |
| Vérifier les rôles | Autorisation | `middlewares/roles.ts` |
| Valider les données | Intégrité | Tous les controllers |
| Transactions atomiques | Éviter race conditions | `enrollmentController.ts` |
| Protéger les secrets | Sécurité | Tous les controllers |

### Ce qui PEUT être fait dans les Functions

| Quoi | Exemple | Avantage |
|------|---------|----------|
| Envoyer des emails | SendGrid, Mailgun | Clés API sécurisées |
| Traiter des paiements | Stripe, PayPal | Clés secrètes |
| Transformer des images | Redimensionner photos | Performance |
| Planifier des tâches | Rappels quotidiens | Automatisation |
| Réagir à des événements | Nouveau cours → Email | Temps réel |

### Ce qui NE doit PAS être dans les Functions

| Quoi | Où le mettre | Pourquoi |
|------|--------------|----------|
| Interface utilisateur (HTML/CSS) | Frontend | Performance |
| Affichage des données | Frontend | Réactivité |
| Formulaires | Frontend | Expérience utilisateur |
| Animations | Frontend | Fluidité |

---

## Commandes Importantes

### Développement Local

```bash
# Compiler le TypeScript
npm run build

# Démarrer les émulateurs
npm run serve

# URL de l'API locale
http://localhost:5001/backend-demo-1/us-central1/api
```

### Déploiement Production

```bash
# Déployer les Functions
npm run deploy:functions

# URL de l'API production
https://us-central1-backend-demo-1.cloudfunctions.net/api
```

---

## Conclusion

### Règle Simple

**Si ça touche à la sécurité, la validation ou la logique métier → Firebase Functions**

**Si ça touche à l'affichage → Frontend**

### Dans Ce Projet

Les Functions font :
1. Authentification (vérifier token)
2. Autorisation (vérifier rôles)
3. Validation (vérifier données)
4. Logique métier (inscriptions, cours, users, notes)
5. Transactions atomiques
6. Logs d'audit
7. Documentation Swagger

Le Frontend fait :
1. Afficher les pages
2. Formulaires
3. Boutons
4. Appeler l'API

**Résultat : Application sécurisée, maintenable et professionnelle**

---

**Date** : 6 octobre 2025  
**Version** : 2.0 (Version pédagogique)  
**Projet** : Firebase Functions REST API avec RBAC  
**Fichier** : 17-GUIDE-FIREBASE-FUNCTIONS.md

