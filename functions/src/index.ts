import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import {requireAuth} from "./middlewares/auth";
import {requireAdmin, requireProfessor, requireStudent} from "./middlewares/roles";
import {UserRole} from "./types";
import {getSwaggerSpec} from "./swagger";

// Controllers
import {
  signup,
  signin,
} from "./controllers/authController";

import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "./controllers/noteController";

import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from "./controllers/userController";

import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from "./controllers/courseController";

import {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
  cancelEnrollment,
} from "./controllers/enrollmentController";

const app = express();
app.use(cors());
app.use(express.json());

// ==================== ROOT ROUTE ====================
// Preserve the Cloud Functions base path by using a relative redirect
app.get("/", (_req, res) => {
  res.redirect("docs/");
});

// ==================== SWAGGER DOCUMENTATION ====================
/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Documentation Swagger UI
 *     description: Interface interactive pour tester l'API
 */

// Expose le schéma OpenAPI à côté de Swagger (URL relative)
app.get("/docs/openapi.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(getSwaggerSpec());
});

// Monte Swagger UI sous un Router Express (SOLUTION FIREBASE FUNCTIONS)
const docsRouter = express.Router();
docsRouter.use("/", swaggerUi.serve);
docsRouter.get(
  "/",
  swaggerUi.setup(undefined, {
    customSiteTitle: "API Gestion Académique",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      url: "./openapi.json", // URL RELATIVE - garde le préfixe Firebase Functions
      deepLinking: true,
      validatorUrl: null,
    },
  })
);

// Monte le router sous /docs
app.use("/docs", docsRouter);

// ==================== AUTH ROUTES (Public) ====================
/**
 * @swagger
 * /v1/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Créer un compte utilisateur (Public)
 *     description: |
 *       Créer un nouveau compte avec Auth + profil Firestore en une seule requête.
 *       
 *       **Parfait pour les tests depuis Swagger !**
 *       
 *       Le compte est créé dans Firebase Auth ET le profil dans Firestore automatiquement.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@school.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: admin123
 *               role:
 *                 type: string
 *                 enum: [admin, professor, student]
 *                 example: admin
 *               firstName:
 *                 type: string
 *                 example: Super
 *               lastName:
 *                 type: string
 *                 example: Admin
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Account created successfully. You can now login.
 *       400:
 *         description: Email déjà utilisé ou données invalides
 *       422:
 *         description: Données manquantes ou invalides
 *
 * /v1/auth/signin-info:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Obtenir les instructions de connexion
 *     description: |
 *       Cette route retourne les instructions pour se connecter et obtenir un token.
 *       
 *       **Utilisez les instructions PowerShell fournies dans la réponse.**
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@school.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Instructions de connexion
 */
app.post("/v1/auth/signup", signup);
app.post("/v1/auth/signin-info", signin);

// ==================== PUBLIC ROUTES ====================
/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Vérifier que l'API fonctionne
 *     security: []
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: api
 *                 version:
 *                   type: string
 *                   example: v2
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["admin", "professor", "student"]
 */
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "api",
    version: "v2",
    roles: Object.values(UserRole),
    swagger: "/docs",
  });
});

// ==================== PROFILE ROUTES (Authenticated) ====================
/**
 * @swagger
 * /v1/profile:
 *   get:
 *     tags:
 *       - 👤 Profile
 *     summary: Consulter son profil
 *     description: Récupérer les informations de son profil utilisateur
 *     responses:
 *       200:
 *         description: Profil récupéré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Profil non trouvé
 *   put:
 *     tags:
 *       - 👤 Profile
 *     summary: Modifier son profil
 *     description: Mettre à jour son prénom et nom (le rôle ne peut pas être modifié)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sophie
 *               lastName:
 *                 type: string
 *                 example: Dubois
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         description: Non authentifié
 */
app.get("/v1/profile", requireAuth, getProfile);
app.put("/v1/profile", requireAuth, updateProfile);

// ==================== ADMIN ROUTES ====================
/**
 * @swagger
 * /v1/users:
 *   post:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: Créer un utilisateur (Admin uniquement)
 *     description: Créer un nouvel utilisateur avec un rôle spécifique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: prof.martin@school.com
 *               password:
 *                 type: string
 *                 example: prof123
 *               role:
 *                 type: string
 *                 enum: [admin, professor, student]
 *                 example: professor
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Martin
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       403:
 *         description: Permissions insuffisantes
 *       422:
 *         description: Données invalides
 *   get:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: Lister les utilisateurs (Admin uniquement)
 *     description: Récupérer tous les utilisateurs, filtrable par rôle
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, professor, student]
 *         description: Filtrer par rôle
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       403:
 *         description: Permissions insuffisantes
 */
app.post("/v1/users", requireAuth, requireAdmin, createUser);
app.get("/v1/users", requireAuth, requireAdmin, getUsers);

/**
 * @swagger
 * /v1/users/{uid}:
 *   get:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: Consulter un utilisateur (Admin uniquement)
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *   put:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: Modifier un utilisateur (Admin uniquement)
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, professor, student]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *   delete:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: Supprimer un utilisateur (Admin uniquement)
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
app.get("/v1/users/:uid", requireAuth, requireAdmin, getUser);
app.put("/v1/users/:uid", requireAuth, requireAdmin, updateUser);
app.delete("/v1/users/:uid", requireAuth, requireAdmin, deleteUser);

// ==================== PROFESSOR ROUTES ====================
/**
 * @swagger
 * /v1/courses/my:
 *   get:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Lister MES cours (Professeur)
 *     description: Récupérer les cours créés par le professeur connecté
 *     responses:
 *       200:
 *         description: Liste des cours du professeur
 *       403:
 *         description: Permissions insuffisantes (rôle professeur requis)
 *
 * /v1/courses/{courseId}/enrollments:
 *   get:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Voir les inscriptions d'un cours (Professeur)
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 *       403:
 *         description: Permissions insuffisantes
 */
app.get("/v1/courses/my", requireAuth, requireProfessor, getMyCourses);
app.get(
  "/v1/courses/:courseId/enrollments",
  requireAuth,
  requireProfessor,
  getCourseEnrollments
);

// ==================== STUDENT ROUTES ====================
/**
 * @swagger
 * /v1/enrollments:
 *   post:
 *     tags:
 *       - 👨‍🎓 Enrollments
 *     summary: S'inscrire à un cours (Étudiant)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: course123
 *     responses:
 *       201:
 *         description: Inscription réussie
 *       400:
 *         description: Cours complet ou déjà inscrit
 *       403:
 *         description: Rôle étudiant requis
 *
 * /v1/enrollments/my:
 *   get:
 *     tags:
 *       - 👨‍🎓 Enrollments
 *     summary: Voir MES inscriptions (Étudiant)
 *     responses:
 *       200:
 *         description: Liste des inscriptions de l'étudiant
 *
 * /v1/enrollments/{id}:
 *   delete:
 *     tags:
 *       - 👨‍🎓 Enrollments
 *     summary: Annuler une inscription (Étudiant)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inscription annulée
 *       403:
 *         description: Vous pouvez seulement annuler vos propres inscriptions
 */
app.post("/v1/enrollments", requireAuth, requireStudent, enrollInCourse);
app.get("/v1/enrollments/my", requireAuth, requireStudent, getMyEnrollments);
app.delete("/v1/enrollments/:id", requireAuth, requireStudent, cancelEnrollment);

// ==================== ALL AUTHENTICATED ROUTES ====================
/**
 * @swagger
 * /v1/courses:
 *   get:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Lister tous les cours disponibles
 *     description: Accessible à tous les utilisateurs authentifiés
 *     responses:
 *       200:
 *         description: Liste de tous les cours
 *   post:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Créer un cours (Professeur)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - maxStudents
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction à Python
 *               description:
 *                 type: string
 *                 example: Apprendre les bases de Python
 *               maxStudents:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Cours créé
 *       403:
 *         description: Rôle professeur requis
 *
 * /v1/courses/{id}:
 *   get:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Consulter un cours
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du cours
 *       404:
 *         description: Cours non trouvé
 *   put:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Modifier un cours (Professeur propriétaire)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cours mis à jour
 *       403:
 *         description: Seul le professeur propriétaire peut modifier
 *   delete:
 *     tags:
 *       - 👨‍🏫 Courses
 *     summary: Supprimer un cours (Professeur propriétaire)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cours supprimé
 *       403:
 *         description: Seul le professeur propriétaire peut supprimer
 *
 * /v1/notes:
 *   get:
 *     tags:
 *       - 📝 Notes
 *     summary: Lister MES notes
 *     responses:
 *       200:
 *         description: Liste de vos notes personnelles
 *   post:
 *     tags:
 *       - 📝 Notes
 *     summary: Créer une note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Résumé Python
 *               content:
 *                 type: string
 *                 example: Variables, fonctions, boucles...
 *     responses:
 *       201:
 *         description: Note créée
 *
 * /v1/notes/{id}:
 *   get:
 *     tags:
 *       - 📝 Notes
 *     summary: Consulter une note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la note
 *       403:
 *         description: Vous ne pouvez voir que vos propres notes
 *   put:
 *     tags:
 *       - 📝 Notes
 *     summary: Modifier une note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note mise à jour
 *   delete:
 *     tags:
 *       - 📝 Notes
 *     summary: Supprimer une note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note supprimée
 */
app.get("/v1/courses", requireAuth, getCourses);
app.post("/v1/courses", requireAuth, requireProfessor, createCourse);
app.get("/v1/courses/:id", requireAuth, getCourse);
app.put("/v1/courses/:id", requireAuth, requireProfessor, updateCourse);
app.delete("/v1/courses/:id", requireAuth, requireProfessor, deleteCourse);

app.post("/v1/notes", requireAuth, createNote);
app.get("/v1/notes", requireAuth, getNotes);
app.get("/v1/notes/:id", requireAuth, getNote);
app.put("/v1/notes/:id", requireAuth, updateNote);
app.delete("/v1/notes/:id", requireAuth, deleteNote);

export const api = functions.https.onRequest(app);

