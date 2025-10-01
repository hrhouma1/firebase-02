# WORKFLOW VISUEL DU SCÉNARIO

## Vue d'ensemble complète

```
┌────────────────────────────────────────────────────────────────────┐
│                    TIMELINE DU SCÉNARIO                            │
└────────────────────────────────────────────────────────────────────┘

ADMIN                      PROFESSEUR                ÉTUDIANTS
    │                            │                          │
    │ Étape 1-4                  │                          │
    │ Créer système              │                          │
    │ ├─ Créer prof ────────────>│                          │
    │ ├─ Créer Sophie ──────────────────────────────────────>│
    │ └─ Créer Lucas ───────────────────────────────────────>│
    │                            │                          │
    │                            │ Étape 5-7                │
    │                            │ Créer cours              │
    │                            │ ├─ Python                │
    │                            │ └─ JavaScript            │
    │                            │                          │
    │                            │                          │ Étape 8-12
    │                            │                          │ Sophie s'inscrit
    │                            │<─────────────────────────┤ ├─ Cours Python
    │                            │<─────────────────────────┤ ├─ Cours JS
    │                            │                          │ └─ Prend notes
    │                            │                          │
    │                            │                          │ Étape 13-14
    │                            │                          │ Lucas s'inscrit
    │                            │<─────────────────────────┤ └─ Cours Python
    │                            │                          │
    │                            │ Étape 15-16              │
    │                            │ Consulter inscriptions   │
    │                            │ ├─ Python: 2 étudiants  │
    │                            │ └─ JS: 1 étudiant       │
    │                            │ Modifier cours           │
    │                            │                          │
    │                            │                          │ Étape 17
    │                            │<─────────────────────────┤ Sophie annule
    │                            │                          │ └─ Annule JS
    │                            │                          │
    │ Étape 18                   │                          │
    │ Rapport système            │                          │
    │ ├─ 4 users total           │                          │
    │ ├─ 2 cours total           │                          │
    │ └─ 2 inscriptions actives  │                          │
    │                            │                          │
    ▼                            ▼                          ▼
```

---

## Détail par Rôle

### ADMIN (Étapes 1-4, 18)

```
┌─────────────────────────────────────────────┐
│  ADMIN : Gestion du système                │
├─────────────────────────────────────────────┤
│                                             │
│  - Se connecter                             │
│  - Créer professeur (Jean Martin)          │
│  - Créer étudiante (Sophie Dubois)         │
│  - Créer étudiant (Lucas Bernard)          │
│  - Voir rapport complet                    │
│                                             │
│  ❌ Ne peut PAS s'inscrire comme étudiant  │
│                                             │
└─────────────────────────────────────────────┘
```

### PROFESSEUR (Étapes 5-7, 15-16)

```
┌─────────────────────────────────────────────┐
│  PROFESSEUR : Jean Martin                  │
├─────────────────────────────────────────────┤
│                                             │
│  - Se connecter                             │
│  - Créer cours "Python"                     │
│  - Créer cours "JavaScript"                 │
│  - Voir ses cours (2)                       │
│  - Voir inscriptions Python (2)            │
│  - Voir inscriptions JS (1)                │
│  - Modifier le cours Python                 │
│                                             │
│  ❌ Ne peut PAS créer d'utilisateurs       │
│  ❌ Ne peut PAS s'inscrire comme étudiant  │
│                                             │
└─────────────────────────────────────────────┘
```

### ÉTUDIANTE SOPHIE (Étapes 8-12, 17)

```
┌─────────────────────────────────────────────┐
│  ÉTUDIANTE : Sophie Dubois                 │
├─────────────────────────────────────────────┤
│                                             │
│  - Se connecter                             │
│  - Voir tous les cours (2)                  │
│  - S'inscrire à Python                      │
│  - S'inscrire à JavaScript                  │
│  - Créer note "Python - Jour 1"            │
│  - Créer note "JavaScript - Concepts"      │
│  - Voir ses inscriptions (2, puis 1)       │
│  - Annuler inscription JavaScript           │
│                                             │
│  ❌ Ne peut PAS créer de cours             │
│  ❌ Ne peut PAS voir inscriptions du cours │
│  ❌ Ne peut PAS voir notes de Lucas        │
│                                             │
└─────────────────────────────────────────────┘
```

### ÉTUDIANT LUCAS (Étapes 13-14)

```
┌─────────────────────────────────────────────┐
│  ÉTUDIANT : Lucas Bernard                  │
├─────────────────────────────────────────────┤
│                                             │
│  - Se connecter                             │
│  - Voir tous les cours (2)                  │
│  - S'inscrire à Python                      │
│  - Voir ses inscriptions (1)               │
│                                             │
│  ❌ Ne peut PAS créer de cours             │
│  ❌ Ne peut PAS voir notes de Sophie       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## État du système à chaque étape

### Après Étape 4 : Système initialisé
```
UTILISATEURS:
├─ Admin (Super Admin)
├─ Professeur (Jean Martin)
├─ Sophie (Dubois)
└─ Lucas (Bernard)

COURS: (vide)
INSCRIPTIONS: (vide)
NOTES: (vide)
```

### Après Étape 7 : Cours créés
```
COURS:
├─ Python (Prof: Jean Martin, 0/30 étudiants)
└─ JavaScript (Prof: Jean Martin, 0/25 étudiants)
```

### Après Étape 12 : Sophie inscrite
```
COURS:
├─ Python (Prof: Jean Martin, 2/30 étudiants)
│   ├─ Sophie
│   └─ Lucas
└─ JavaScript (Prof: Jean Martin, 1/25 étudiants)
    └─ Sophie

NOTES DE SOPHIE:
├─ Python - Jour 1
└─ JavaScript - Concepts
```

### Après Étape 14 : Lucas inscrit
```
COURS:
├─ Python (Prof: Jean Martin, 2/30 étudiants)
│   ├─ Sophie
│   └─ Lucas
└─ JavaScript (Prof: Jean Martin, 1/25 étudiants)
    └─ Sophie
```

### Après Étape 17 : Sophie annule JS
```
COURS:
├─ Python (Prof: Jean Martin, 2/30 étudiants)
│   ├─ Sophie OK
│   └─ Lucas OK
└─ JavaScript (Prof: Jean Martin, 0/25 étudiants)
    └─ (vide après annulation)
```

---

## Changements de rôle

```
┌────────────────────────────────────────────────────────────┐
│  ORDRE DES CONNEXIONS                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. Admin        → Créer le système                        │
│        ↓                                                   │
│  2. Professeur   → Créer les cours                         │
│        ↓                                                   │
│  3. Sophie       → S'inscrire et prendre notes             │
│        ↓                                                   │
│  4. Lucas        → S'inscrire au Python                    │
│        ↓                                                   │
│  5. Professeur   → Voir inscriptions                       │
│        ↓                                                   │
│  6. Sophie       → Annuler une inscription                 │
│        ↓                                                   │
│  7. Admin        → Rapport final                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Points clés à observer

### Permissions qui fonctionnent

| Qui | Peut faire | Exemple |
|-----|-----------|---------|
| Admin | Créer users | Créer prof et étudiants |
| Professeur | Créer cours | Créer Python et JS |
| Professeur | Voir inscriptions | Voir qui s'est inscrit |
| Étudiant | S'inscrire | S'inscrire aux cours |
| Étudiant | Annuler | Annuler son inscription |
| Tous | Voir cours | Liste des cours disponibles |
| Tous | Notes perso | CRUD sur ses propres notes |

### ❌ Permissions qui échouent (Étape 19)

| Qui | Ne peut PAS | Résultat |
|-----|------------|----------|
| Étudiant | Créer cours | 403 Forbidden OK |
| Professeur | Créer users | 403 Forbidden OK |
| Étudiant | Voir inscriptions cours | 403 Forbidden OK |

---

## Conseils pour le test

### Avant de commencer
1. Émulateurs démarrés (`npm run serve`)
2. Extension REST Client installée
3. Fichier `SCENARIO-GUIDE.http` ouvert

### Pendant le test
- Regardez les réponses après chaque requête
- Vérifiez les status codes (200, 201, 403)
- Prenez votre temps entre les étapes
- Notez les changements de rôle

### Interface à garder ouverte
- http://localhost:4000 (UI des émulateurs)
  - Voir les users créés
  - Voir les documents Firestore
  - Voir les logs en temps réel

---

## Checklist du scénario

```
Scénario complet :

[ ] Étape 1-4   : Admin crée le système
[ ] Étape 5-7   : Professeur crée les cours
[ ] Étape 8-12  : Sophie s'inscrit et prend notes
[ ] Étape 13-14 : Lucas s'inscrit
[ ] Étape 15-16 : Professeur consulte
[ ] Étape 17    : Sophie annule
[ ] Étape 18    : Admin fait le rapport
[ ] Étape 19    : Tests de sécurité

Scénario terminé !
```

---

**Prêt à commencer ? Ouvrez `SCENARIO-GUIDE.http` !**

