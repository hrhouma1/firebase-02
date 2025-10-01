# 06 - Exercices d’extension API & Swagger

Ce document liste des fonctionnalités supplémentaires à implémenter pour aller plus loin avec l’API académique. Chaque exercice inclut :
- un objectif métier ;
- un schéma de données suggéré (Firestore) ;
- les endpoints à ajouter (REST + Swagger) ;
- les contrôles d’accès recommandés ;
- des pistes de tests (Swagger, `.http`, automatisation).

Les exercices sont indépendants : à vous de choisir ceux qui servent vos besoins pédagogiques ou démos.

> **Pré-requis** : avoir terminé le scénario de base décrit dans `04-SWAGGER-ETAPES.md` et `05-SWAGGER-ETAPES-DETAILLEES.md`.

---

## 1. Rappels techniques

- **Routing** : tous les endpoints sont sous `/v1/...` et nécessitent `requireAuth` par défaut.
- **Swagger** : pour chaque route, ajouter un bloc JSDoc dans `functions/src/index.ts` (ou modulariser via des fichiers de routes) + mettre à jour `getSwaggerSpec()` si de nouveaux schémas sont introduits.
- **Firestore** : ajouter les collections nécessaires, adapter `firestore.rules` et `firestore.indexes.json` si vous utilisez des requêtes complexes.
- **Tests** : prévoir au minimum une requête de succès et un cas d’échec (403 ou 422) par nouveau endpoint. Pensez à compléter les fichiers dans `api-tests/`.

---

## 2. Exercice A — Annonces de cours

**Objectif** : permettre aux professeurs de publier des annonces visibles par les étudiants inscrits.

### 2.1 Schéma Firestore suggéré
Collection `announcements` :
- `id` (auto)
- `courseId`
- `authorUid` (professeur)
- `title`
- `content`
- `publishedAt`
- `updatedAt`

### 2.2 Endpoints à créer
| Méthode | URL | Rôle | Description |
|---------|-----|------|-------------|
| POST | `/v1/courses/{courseId}/announcements` | Professeur/Admin | Créer une annonce pour un cours dont on est propriétaire |
| GET | `/v1/courses/{courseId}/announcements` | Étudiant inscrit / Professeur propriétaire | Lister les annonces d’un cours |
| GET | `/v1/announcements/{id}` | Étudiant inscrit / Professeur propriétaire / Admin | Voir une annonce |
| PUT | `/v1/announcements/{id}` | Professeur propriétaire/Admin | Modifier une annonce |
| DELETE | `/v1/announcements/{id}` | Professeur propriétaire/Admin | Supprimer une annonce |

### 2.3 Points d’attention
- Vérifier que l’étudiant est inscrit avant de retourner les annonces (`enrollments` collection).
- Ajouter un index composé `(courseId, publishedAt desc)` pour récupérer les annonces récentes.
- Swagger : nouveau tag `📣 Announcements`.
- Tests :
  - professeur → création + modification + suppression ;
  - étudiant inscrit → lecture OK ;
  - étudiant non inscrit → 403 attendu.

### 2.4 Scénario Swagger suggéré
1. Authentifier Swagger avec un token professeur (`Authorize`).
2. `POST /v1/courses/{courseId}/announcements` → créer une annonce (utiliser un `courseId` existant).
3. `GET /v1/courses/{courseId}/announcements` → vérifier la présence de l’annonce.
4. Ré-authentifier Swagger avec un token étudiant inscrit au cours.
5. `GET /v1/courses/{courseId}/announcements` → lecture autorisée.
6. `GET /v1/announcements/{id}` → détail.
7. Tenter `POST /v1/courses/{courseId}/announcements` avec le token étudiant → 403 attendu.

---

## 3. Exercice B — Devoirs & remises

**Objectif** : les professeurs publient des devoirs, les étudiants soumettent leur travail.

### 3.1 Schémas Firestore
- Collection `assignments`
  - `id`, `courseId`, `title`, `instructions`, `dueDate`, `createdAt`, `updatedAt`
- Collection `submissions`
  - `id`, `assignmentId`, `studentUid`, `status` (`submitted`, `graded`), `submittedAt`, `grade`, `feedback`

### 3.2 Endpoints
| Méthode | URL | Rôle | Description |
|---------|-----|------|-------------|
| POST | `/v1/courses/{courseId}/assignments` | Prof/Admin | Créer un devoir |
| GET | `/v1/courses/{courseId}/assignments` | Étudiants inscrits | Lister les devoirs du cours |
| GET | `/v1/assignments/{id}` | Étudiants inscrits | Consulter un devoir |
| PUT | `/v1/assignments/{id}` | Prof/Admin | Mettre à jour |
| DELETE | `/v1/assignments/{id}` | Prof/Admin | Supprimer |
| POST | `/v1/assignments/{id}/submissions` | Étudiant | Déposer une remise (URL de fichier, texte, etc.) |
| GET | `/v1/assignments/{id}/submissions` | Prof/Admin | Voir toutes les remises |
| GET | `/v1/submissions/my` | Étudiant | Suivre ses remises |
| PUT | `/v1/submissions/{id}` | Prof/Admin | Attribuer une note + feedback |

### 3.3 Tests & validations
- Interdire la soumission après `dueDate` (422).
- Empêcher un étudiant de déposer plusieurs remises (ou autoriser la mise à jour selon besoin).
- Swagger : fournir des exemples JSON illustrant un `submittedUrl` ou `answer`.
- Ajouter des indexes pour requêtes par `assignmentId` et `studentUid`.

### 3.4 Scénario Swagger suggéré
1. Token professeur → `POST /v1/courses/{courseId}/assignments` (créer devoir).
2. Token étudiant inscrit → `GET /v1/courses/{courseId}/assignments` (voir devoir).
3. Même token étudiant → `POST /v1/assignments/{id}/submissions` (déposer réponse).
4. Token professeur → `GET /v1/assignments/{id}/submissions` (voir remises).
5. Token professeur → `PUT /v1/submissions/{id}` (ajouter feedback + note).
6. Token étudiant → `GET /v1/submissions/my` (consulter sa note).
7. Token autre étudiant non inscrit → `POST /v1/assignments/{id}/submissions` → 403 attendu.

---

## 4. Exercice C — Messagerie interne rapide

**Objectif** : créer une messagerie simple prof ↔ étudiant inscrit au cours.

### 4.1 Schéma Firestore
Collection `messages`
- `id`
- `courseId`
- `fromUid`
- `toUid` (`*` pour message groupé optionnel)
- `content`
- `sentAt`

### 4.2 Endpoints
| Méthode | URL | Rôle | Description |
|---------|-----|------|-------------|
| POST | `/v1/courses/{courseId}/messages` | Prof/Étudiant inscrit | Envoyer un message |
| GET | `/v1/courses/{courseId}/messages` | Participants | Historique des messages du cours |

### 4.3 Bonnes pratiques
- Stocker également un champ `participants` (array) pour accélérer certaines requêtes.
- Prévoir un champ `type` (texte, lien, ressource) si besoin.
- Ajouter un filtre par `sentAt` pour la pagination (utiliser `startAfter`).
- Swagger : tag `💬 Messages`.

### 4.4 Scénario Swagger suggéré
1. Token professeur → `POST /v1/courses/{courseId}/messages` (message d’accueil).
2. Token étudiant inscrit → `POST /v1/courses/{courseId}/messages` (réponse).
3. Token professeur → `GET /v1/courses/{courseId}/messages` → historique.
4. Token étudiant inscrit → `GET /v1/courses/{courseId}/messages` → même résultat.
5. Token étudiant non inscrit → `GET /v1/courses/{courseId}/messages` → 403 attendu.

---

## 5. Exercice D — Tableau de bord Admin

Créer un endpoint agrégé pour les administrateurs :

| Méthode | URL | Rôle | Description |
|---------|-----|------|-------------|
| GET | `/v1/admin/dashboard` | Admin | Retourner stats clés (nombre de cours, étudiants par cours, inscriptions actives, etc.) |

### 5.1 Suggestions de contenu
- Nombre total d’utilisateurs par rôle.
- Top 5 des cours les plus fréquentés.
- Nombre d’inscriptions actives vs annulées.
- Dernières créations de cours.

### 5.2 Technique
- On peut exécuter plusieurs requêtes Firestore et assembler un objet JSON.
- Pour les stats lourdes : prévoir un Cloud Function programmée qui agrège dans une collection `metrics`.
- Swagger : réponse schéma `AdminDashboard`.

### 5.3 Scénario Swagger suggéré
1. Token admin → `GET /v1/admin/dashboard` (vérifier structure et données retournées).
2. Token professeur → même requête → 403 attendu.
3. Token admin → modifier les données sources (ex. créer un cours, une inscription) → relancer la requête pour vérifier les compteurs.

---

## 6. Exercice E — Recherche & filtres avancés

Ajouter des paramètres de requête sur `/v1/courses` et `/v1/users` :
- `?role=student`
- `?search=python`
- `?limit=10&after=timestamp`

### Tâches
- Ajouter la prise en charge des filtres côté contrôleur.
- Documenter chaque query param dans Swagger (`parameters` section).
- Ajouter des indexes Firestore (ex : `courses` par `title_lowercase` + `professorUid`).

### Scénario Swagger suggéré
1. Token admin → `GET /v1/users` (baseline).
2. `GET /v1/users?role=professor` → vérifier filtrage.
3. Token professeur → `GET /v1/courses?search=python` → vérifier la recherche.
4. Ajouter `?limit=1` puis `?limit=1&after=<timestamp>` pour tester la pagination.
5. Token étudiant → `GET /v1/users?role=admin` → 403 attendu.

---

## 7. Exercice F — Webhooks / Notifications (bonus)

- Exposer `POST /v1/hooks/firestore-sync` (Admin) pour déclencher une synchronisation.
- Intégrer Firebase Cloud Messaging : endpoint `POST /v1/notifications/test`.
- Documenter l’usage dans Swagger, mais ces routes peuvent être mockées pour l’apprentissage.

### Scénario Swagger suggéré
1. Token admin → `POST /v1/hooks/firestore-sync` avec un corps `{ "source": "firestore" }` → vérifier réponse.
2. Token non admin → même route → 403 attendu.
3. Token admin → `POST /v1/notifications/test` (payload de test) → vérifier retour.
4. Ajouter un test négatif (payload vide → 422).

---

## 8. Stratégie de documentation Swagger

Pour chaque nouvelle route :
1. Ajouter un tag spécifique (ex. `Assignments`, `Messages`).
2. Définir les schémas dans `components.schemas` via `functions/src/swagger.ts`.
3. Fournir des exemples (`example`/`examples`).
4. Mettre à jour la section `security` si certaines routes sont publiques.
5. Tester dans Swagger (bouton **Try it out**) et dans les `.http`.

> Astuce : si le fichier `index.ts` devient trop long, créez des routers dédiés (ex. `routes/assignments.ts`) et utilisez `swagger-jsdoc` pour explorer plusieurs fichiers.

---

## 9. Checklists d’implémentation

### 9.1 Technique
- [ ] Ajouter les modèles TypeScript (`functions/src/types/...`).
- [ ] Mettre à jour les contrôleurs + middlewares.
- [ ] Ajuster `firestore.rules` et `firestore.indexes.json`.
- [ ] Générer les types JS (`npm run build`).
- [ ] Ajouter/mettre à jour les tests `.http`.
- [ ] Vérifier Swagger (`Ctrl + F5`).

### 9.2 Qualité
- [ ] Tester chaque route avec un rôle valide + un rôle interdit (403).
- [ ] Tester les entrées invalides (422).
- [ ] Vérifier les timestamps (`firestore.FieldValue.serverTimestamp()`).
- [ ] Mettre à jour la documentation (README, guides).

---

## 10. Annexes — Tables de routes proposées

### 10.1 Résumé des nouvelles collections
| Collection | Description | Indexes recommandés |
|------------|-------------|---------------------|
| `announcements` | Annonces de cours | `(courseId, publishedAt desc)` |
| `assignments` | Devoirs | `(courseId, dueDate desc)` |
| `submissions` | Remises d’étudiants | `(assignmentId, submittedAt desc)` + `(studentUid, assignmentId)` |
| `messages` | Messagerie interne | `(courseId, sentAt desc)` |
| `metrics` (optionnel) | Cache de stats admin | selon besoin |

### 10.2 Récap endpoints (exercices)
| Exercice | Méthode | URL | Rôle | Description |
|----------|---------|-----|------|-------------|
| A | POST | `/v1/courses/{courseId}/announcements` | Prof/Admin | Créer annonce |
| A | GET | `/v1/courses/{courseId}/announcements` | Étudiant inscrit | Lister annonces |
| A | GET | `/v1/announcements/{id}` | Prof/Admin/Étudiant inscrit | Détails annonce |
| A | PUT | `/v1/announcements/{id}` | Prof/Admin | Modifier |
| A | DELETE | `/v1/announcements/{id}` | Prof/Admin | Supprimer |
| B | POST | `/v1/courses/{courseId}/assignments` | Prof/Admin | Créer devoir |
| B | GET | `/v1/courses/{courseId}/assignments` | Étudiant inscrit | Lister devoirs |
| B | GET | `/v1/assignments/{id}` | Étudiant inscrit | Détails devoir |
| B | PUT | `/v1/assignments/{id}` | Prof/Admin | Mettre à jour |
| B | DELETE | `/v1/assignments/{id}` | Prof/Admin | Supprimer |
| B | POST | `/v1/assignments/{id}/submissions` | Étudiant | Soumettre |
| B | GET | `/v1/assignments/{id}/submissions` | Prof/Admin | Lister remises |
| B | GET | `/v1/submissions/my` | Étudiant | Mes remises |
| B | PUT | `/v1/submissions/{id}` | Prof/Admin | Noter |
| C | POST | `/v1/courses/{courseId}/messages` | Participants | Envoyer message |
| C | GET | `/v1/courses/{courseId}/messages` | Participants | Historique |
| D | GET | `/v1/admin/dashboard` | Admin | Statistiques |
| E | GET | `/v1/courses?search=...` | Prof/Étudiant/Admin | Recherche cours |
| E | GET | `/v1/users?role=professor` | Admin | Filtrer utilisateurs |
| F | POST | `/v1/hooks/firestore-sync` | Admin | Webhook interne |
| F | POST | `/v1/notifications/test` | Admin | Notification test |

> Ces routes sont volontairement ambitieuses : adaptez-les selon le niveau des étudiants (mock, stub, persistance réduite…).

---

## 11. Prochaines étapes

1. Choisir un exercice.
2. Créer les types & contrôleurs.
3. Mettre à jour Swagger.
4. Tester avec les rôles concernés.
5. Documenter les résultats (README, guides, `.http`).

Bon entraînement !
