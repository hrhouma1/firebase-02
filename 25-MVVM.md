# Partie 1

# C’est quoi une “architecture” d’app Flutter ?

C’est juste **comment tu ranges ton code** pour que ce soit **clair** et **facile à modifier** plus tard.
Comme ranger une cuisine : **placards séparés** pour les assiettes, les casseroles, les épices.

# Le choix facile qui marche dans 90% des cas

**Prends : MVVM + Provider.**
Pourquoi ? Parce que c’est **simple**, **propre**, et **assez puissant** pour une vraie app.

# L’idée en image (sans jargon)

Imagine une app = **4 boîtes** qui se parlent :

1. **UI (écrans)** → ce que l’utilisateur voit (boutons, listes).
2. **Provider (cerveau léger de l’écran)** → sait quand charger, quand afficher “chargement…”.
3. **Repository (messager)** → il va chercher/écrire les données (sur Internet ou en base).
4. **Backend / API (serveur)** → la source des vraies données.

Petit dessin :

```
Écran (UI) → demande → Provider → demande → Repository → Internet/BD
       ← se met à jour  ←         ←  renvoie les données  ←
```

# Exemple concret (app “Cours”)

* L’utilisateur ouvre **“Liste des cours”**.
* L’**Écran** demande au **Provider** : “donne-moi les cours”.
* Le **Provider** demande au **Repository**.
* Le **Repository** appelle l’**API** (HTTP).
* Les cours reviennent → le **Provider** dit à l’**Écran** : “mets-toi à jour !”
* L’**Écran** affiche la liste.

# Comment ranger tes fichiers (toutes petites boîtes)

```
lib/
  screens/        ← pages et widgets (UI)
  providers/      ← petites classes qui gèrent l’état (avec Provider)
  data/           ← models + repositories + services (accès API)
  core/           ← trucs communs (boutons, constantes, validateurs)
```

# Ce que fait chaque boîte (en mots simples)

* **Model** : une fiche de données (ex. `Course` avec `id`, `title`, `price`, etc.).
* **Repository** : “le livreur” qui va chercher la fiche chez le serveur (HTTP).
* **Provider** : “le chef d’orchestre” qui sait **quand** charger et **prévenir l’UI**.
* **Screen** : “le décor de scène” qui **affiche** ce que le Provider lui donne.

# Quand choisir autre chose ?

* **Très petit prototype** (2–3 écrans) → **MVC** ou **GetX** (rapide).
* **Très grosse app / grande équipe** → **BLoC** ou **Clean** (plus rigoureux, plus de fichiers).
  Pour débuter et pour ton **School Management** → **MVVM + Provider**.

# Mini check-list “je commence aujourd’hui”

1. Installe **provider** (state) et **dio** (HTTP) dans `pubspec.yaml`.
2. Dans `main.dart`, entoure ton app avec `MultiProvider(...)`.
3. Crée **1 modèle** (ex. `Course`), **1 repository** (`CourseRepository.getCourses()`),
   **1 provider** (`CourseProvider.load()`), **1 écran** (`CourseListScreen`).
4. Sur l’écran, utilise `context.watch<CourseProvider>()` pour **afficher** la liste.
5. Si tu vois “Chargement… → Liste s’affiche”, **tu as compris le flux** ✅

# Règle d’or (à coller au mur)

> **Ne mélange jamais** :
> **UI** (affichage) ≠ **Provider** (logique d’écran) ≠ **Repository** (accès données).

En gardant ces boîtes **séparées**, ton app reste **compréhensible**, **réparable**, et **facile à faire évoluer**.


<br/>

# Partie 2 - Flutter et **MVVM** = **Model – View – ViewModel**.

> C’est juste une façon **simple et propre** de ranger ton code Flutter.

# Les 3 pièces

* **Model** (les données) : des classes “bêtes” qui décrivent la réalité.
  *Ex.* `Course(id, title, price)`.
* **View** (l’écran/UI) : ce que l’utilisateur voit (widgets, boutons, listes).
  *Rôle* : **afficher**, pas réfléchir.
* **ViewModel** (la logique d’écran) : le “cerveau léger” qui:

  * charge les données (via un repository),
  * garde l’état (`isLoading`, `items`, `error`),
  * prévient l’UI quand ça change.

En Flutter, on implémente souvent le **ViewModel** avec **Provider** (`ChangeNotifier`).

# Le flux (en 1 ligne)

**View (UI)** ↔ **ViewModel (Provider)** ↔ **Repository/API** ↔ **Serveur**

* L’UI **demande** → le ViewModel **appelle** le repo → le repo **parle** à l’API.
* Quand les données arrivent, le ViewModel **notifyListeners()** → l’UI se **met à jour**.

# Mini exemple (ultra court)

```dart
// ViewModel (Provider)
class CourseProvider extends ChangeNotifier {
  final repo = CourseRepository();
  bool isLoading = false;
  List<Course> courses = [];

  Future<void> load() async {
    isLoading = true; notifyListeners();
    courses = await repo.getCourses(); // appel HTTP
    isLoading = false; notifyListeners();
  }
}
```

```dart
// View (UI)
class CourseListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<CourseProvider>(); // ViewModel
    if (vm.isLoading) return const CircularProgressIndicator();
    return ListView.builder(
      itemCount: vm.courses.length,
      itemBuilder: (_, i) => ListTile(title: Text(vm.courses[i].title)),
    );
  }
}
```

# Pourquoi MVVM est apprécié

* **Clair** : UI séparée de la logique → code lisible.
* **Facile à tester** : tu testes le ViewModel sans l’UI.
* **Évolutif** : tu ajoutes des features sans casser l’écran.

# Différence rapide avec MVC

* **MVC** : l’UI parle à un **Controller** (souvent on finit par mélanger UI et logique).
* **MVVM** : l’UI observe un **ViewModel** (état réactif via Provider) → **mieux séparé**.

# Quand l’utiliser ?

* 5–20 écrans, logique “normale” → **MVVM + Provider** (ton cas “School Management”).
* Très gros/complexe/équipe nombreuse → BLoC/Clean.

> **Résumé en une phrase :**
> **MVVM** sépare **données (Model)**, **affichage (View)** et **logique d’écran (ViewModel/Provider)**. L’UI affiche, le ViewModel pense, le Repository parle au serveur.


<br/>

# Partie 3 — **MVVM expliqué avec l’exemple d’un resto** 🍽️

# Les rôles (qui est qui ?)

* **View (l’écran)** = **la salle + la table + la carte visible**
  → Ce que le client voit : boutons/listes = carte/table.
* **ViewModel (Provider)** = **le serveur/serveuse**
  → Prend la commande, sait quand c’est prêt, revient te voir, annonce “ça arrive !”.
* **Model** = **le bon de commande / la fiche plat**
  → Infos structurées : `id`, `nom du plat`, `prix`, `options`.
* **Repository** = **le passe-plat / système POS**
  → Transporte la commande proprement vers la cuisine et récupère l’état (“en préparation”, “terminé”).
* **API / Backend** = **la cuisine**
  → Prépare les plats, dit si un ingrédient manque, renvoie le résultat.

Résumé mapping :

| MVVM            | Resto IRL                                            |
| --------------- | ---------------------------------------------------- |
| View            | Salle + Carte                                        |
| ViewModel       | Serveur/Serveuse                                     |
| Model           | Bon de commande                                      |
| Repository      | Passe-plat / POS                                     |
| API/Backend     | Cuisine                                              |
| notifyListeners | “Votre plat arrive !” (le serveur prévient la table) |

# Le flux d’une commande (équivalent à “charger une liste de cours”)

1. **Client (utilisateur)** regarde la **carte (View)** et choisit.
2. **Serveur (ViewModel)** prend la **commande (Model)**.
3. Le **serveur** l’envoie via le **passe-plat (Repository)** à la **cuisine (API)**.
4. **Cuisine** prépare → renvoie “prêt”.
5. **Serveur** revient à la **table** et **annonce** (→ `notifyListeners`) → **la table se met à jour** (l’UI affiche le plat).

# Cas réels (et ce que fait le ViewModel)

* **Rupture de stock** (ingrédient manquant) → la **cuisine** répond “impossible”.

  * Le **serveur (ViewModel)** gère l’**erreur** et propose une **alternative** (UI affiche un message).
* **Attente** → le **serveur** dit “**en préparation**” (UI montre un **spinner** `isLoading = true`).
* **Commande multiple** → le **serveur** suit l’**état de chaque plat** (liste d’items dans le ViewModel).
* **Modification** (“sans oignons”) → le **serveur** **met à jour** la commande (ViewModel appelle Repository → API).

# Pourquoi c’est mieux que “tout en cuisine” ou “tout en salle” ?

* Si **la salle (View)** faisait aussi la cuisine → le code UI serait plein de logique et deviendrait **ingérable**.
* Si **la cuisine (Backend)** gérait l’affichage → impossible à maintenir côté app.
* Avec **MVVM**, chacun son job :

  * **View** affiche, **ViewModel** orchestre, **Repository** transporte, **Backend** cuisine.

# Mini scénario “School Management” en mode resto

* **Voir la liste des cours** = lire la **carte**.
* **S’inscrire à un cours** = **commander un plat**.
* **Validation des places** = la **cuisine** vérifie s’il reste des portions.
* **Confirmation d’inscription** = le **serveur** revient : “C’est bon !” (UI met à jour).
* **Erreur (cours complet)** = le **serveur** propose un **autre créneau** (UI affiche une alternative).

# La règle d’or (version resto)

> **La salle ne cuisine pas, la cuisine ne sert pas.**
> En Flutter : **UI n’implémente pas la logique**, **Backend n’implémente pas l’affichage**.
> Le **ViewModel (serveur)** fait la **colle** : il **prend**, **transmet**, **revient**, **annonce** (notify).



