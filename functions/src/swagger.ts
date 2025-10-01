import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gestion Académique avec RBAC",
      version: "2.0.0",
      description: `
# API REST avec contrôle d'accès par rôles

Cette API permet de gérer un système académique complet avec 3 rôles :

- **👨‍💼 Admin** : Gestion complète des utilisateurs
- **👨‍🏫 Professeur** : Création et gestion des cours
- **👨‍🎓 Étudiant** : Inscription aux cours et gestion des notes

## 🔐 Authentification

Toutes les routes (sauf \`/health\`) nécessitent un token JWT Firebase.

### Comment obtenir un token :

1. **Créer un compte** (via Firebase Auth Emulator ou console)
2. **Se connecter** pour obtenir un \`idToken\`
3. **Utiliser le token** dans le header \`Authorization: Bearer {token}\`

### Tester dans Swagger :

1. Cliquez sur le bouton **"Authorize"** 🔓
2. Entrez : \`Bearer VOTRE_TOKEN\` (avec le mot "Bearer" + espace)
3. Cliquez sur **"Authorize"**
4. Testez les routes !

## 📚 Collections de données

- **users** : Profils utilisateurs avec rôles
- **courses** : Cours créés par les professeurs
- **enrollments** : Inscriptions des étudiants aux cours
- **notes** : Notes personnelles de chaque utilisateur

## 🔗 Liens utiles

- **Firebase Emulator UI** : http://localhost:4000
- **Documentation complète** : Voir README.md et GUIDE_RBAC.md
`,
      contact: {
        name: "Support API",
        url: "https://github.com",
      },
    },
    servers: [],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT Firebase obtenu après connexion",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            uid: {type: "string", example: "abc123xyz"},
            email: {type: "string", format: "email", example: "user@school.com"},
            role: {
              type: "string",
              enum: ["admin", "professor", "student"],
              example: "student",
            },
            firstName: {type: "string", example: "Sophie"},
            lastName: {type: "string", example: "Dubois"},
            createdAt: {type: "number", example: 1704067200000},
            updatedAt: {type: "number", example: 1704067200000},
          },
        },
        Course: {
          type: "object",
          properties: {
            id: {type: "string", example: "course123"},
            title: {type: "string", example: "Introduction à Python"},
            description: {type: "string", example: "Apprendre les bases de Python"},
            professorUid: {type: "string", example: "prof123"},
            professorName: {type: "string", example: "Jean Martin"},
            maxStudents: {type: "integer", example: 30},
            currentStudents: {type: "integer", example: 5},
            createdAt: {type: "number", example: 1704067200000},
            updatedAt: {type: "number", example: 1704067200000},
          },
        },
        Enrollment: {
          type: "object",
          properties: {
            id: {type: "string", example: "enrollment123"},
            courseId: {type: "string", example: "course123"},
            studentUid: {type: "string", example: "student123"},
            studentName: {type: "string", example: "Sophie Dubois"},
            enrolledAt: {type: "number", example: 1704067200000},
            status: {
              type: "string",
              enum: ["active", "completed", "cancelled"],
              example: "active",
            },
          },
        },
        Note: {
          type: "object",
          properties: {
            id: {type: "string", example: "note123"},
            title: {type: "string", example: "Résumé Python"},
            content: {type: "string", example: "Variables, fonctions, boucles..."},
            ownerUid: {type: "string", example: "user123"},
            createdAt: {type: "number", example: 1704067200000},
            updatedAt: {type: "number", example: 1704067200000},
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {type: "string", example: "Forbidden"},
            message: {type: "string", example: "Required role: admin"},
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: "🏥 Health",
        description: "Health check (public)",
      },
      {
        name: "👤 Profile",
        description: "Gestion du profil utilisateur",
      },
      {
        name: "👨‍💼 Admin",
        description: "Gestion des utilisateurs (Admin uniquement)",
      },
      {
        name: "👨‍🏫 Courses",
        description: "Gestion des cours (Professeurs et Admins)",
      },
      {
        name: "👨‍🎓 Enrollments",
        description: "Inscriptions aux cours (Étudiants et Admins)",
      },
      {
        name: "📝 Notes",
        description: "Notes personnelles (Tous les utilisateurs)",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/index.ts"],
};

let spec = swaggerJsdoc(options);

// Configurer dynamiquement les servers selon l'environnement
export function getSwaggerSpec() {
  const projectId = process.env.GCLOUD_PROJECT || "backend-demo-1";
  const region = "us-central1";
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

  spec = {
    ...spec,
    servers: isEmulator
      ? [{
        url: `http://localhost:5001/${projectId}/${region}/api`,
        description: "Émulateur local",
      }]
      : [{
        url: `https://${region}-${projectId}.cloudfunctions.net/api`,
        description: "Production",
      }],
  };

  return spec;
}

export const swaggerSpec = spec;

