# Règle d’or (méga simple)

* **Si c’est juste pour *afficher*** → **pas de Function**.
* **Si ça doit être *vrai, sûr, ou secret*** → **Function**.

# Le test des 3 questions (oui = Function)

1. **Y a-t-il un SECRET ?** (clé Stripe, SendGrid, API privée)
2. **Y a-t-il une RÈGLE d’accès ?** (rôle admin/prof/étudiant, champs à cacher)
3. **Y a-t-il une ACTION critique ?** (écrire, payer, compter, tout-ou-rien)

> Si tu réponds **oui** à au moins une → **Function**.
> Si **non** aux trois → fais-le **directement côté client** (Firestore + Rules).

# Mémo visuel (mini arbre de décision)

```
As-tu un secret / des rôles / une écriture critique ?
            └── Oui → Function
            └── Non → Lecture directe (pas de Function)
```

# Exemples concrets (pour “GET”)

* **Catalogue public** (titres, profs, tags) → **sans Function**
* **Mes inscriptions** (uniquement moi)

  * simple (filtre par `uid` via Rules) → **sans Function**
  * complexe (masquer des champs, jointures, quotas) → **Function**
* **Stats admin globales** (totaux, revenus) →

  * calcule en **arrière-plan** (trigger/scheduler) → stocke en Firestore → **GET sans Function**

# Exemples concrets (pour “POST/écritures”)

* **S’inscrire à un cours** (limites, doublons, compteur) → **Function**
* **Paiement Stripe** (clé secrète + webhooks) → **Function**
* **Envoyer emails** (clés API) → **Function**

# Règles rapides (à coller)

* **Affichage/UI** : listes, tri à l’écran, formulaires → **pas de Function**
* **Sécurité/Logique métier/Transactions/Secrets** → **Function**
* **Gros calculs récurrents** : fais-les **une fois en background** (trigger/cron), sauvegarde le résultat, puis lis-le **sans Function**.

# Anti-pièges (très fréquent)

* Mettre une **clé secrète** dans le frontend ❌
* Laisser le client **écrire** des données critiques sans contrôle serveur ❌
* Essayer de coder toute la **logique métier** dans les Security Rules ❌ (elles protègent, elles ne “pensent” pas)

Si tu hésites : pose-toi “**secret / rôle / écriture critique ?**”.
Le premier **oui** te bascule côté **Function**.
