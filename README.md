# KBM Toiture — Planning

Application de planning professionnel pour la gestion des chantiers de KBM Toiture.
Next.js 14 (App Router) · React · TypeScript · Tailwind CSS · Firebase (Auth, Firestore, Storage) · Netlify.

---

## 1. Aperçu

- **Planning** jour / semaine / mois avec glisser-déposer pour changer une date en un geste.
- **Suggestion intelligente de créneau** : à la création d'un chantier, l'appli propose les 5 meilleures dates en croisant votre charge (1 chantier/jour visé, 2 max), la proximité géographique avec les chantiers voisins et les jours ouvrés.
- **Fiche chantier** complète : client, adresse, type de travaux, durée, montant, statut, notes, photos, documents.
- **Carte** avec itinéraire Google Maps et distance estimée entre chantiers consécutifs.
- **Notifications** automatiques : chantier demain / aujourd'hui / reporté / planning modifié.
- **Dashboard** : prochains chantiers, semaine en cours, jours libres, CA prévisionnel.
- Mode sombre, recherche rapide, interface responsive PC/mobile.

Toutes les données sont propres à votre compte : chaque utilisateur ne voit que ses propres chantiers, clients et documents (règles de sécurité Firestore/Storage incluses).

---

## 2. Configuration du projet Firebase

### 2.1 Créer le projet

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com) → **Ajouter un projet** → nommez-le par exemple `kbm-toiture-planning`.
2. Une fois le projet créé, cliquez sur l'icône **Web (`</>`)** pour ajouter une application web. Donnez-lui un nom (ex. "KBM Planning Web") — **ne cochez pas** Firebase Hosting (on utilise Netlify).
3. Firebase affiche un bloc de configuration (`apiKey`, `authDomain`, etc.) : gardez cette page ouverte, vous en aurez besoin à l'étape 4.

### 2.2 Activer l'authentification

1. Dans le menu de gauche : **Build → Authentication → Get started**.
2. Onglet **Sign-in method** → activez **Email/Password**.
3. Onglet **Users** → **Add user** → créez votre compte (email + mot de passe). C'est cet identifiant qui vous servira à vous connecter à l'application. Il n'y a pas de page d'inscription publique : vous créez les comptes vous-même dans la console Firebase (accès réservé à l'équipe).

### 2.3 Activer Firestore

1. **Build → Firestore Database → Créer une base de données**.
2. Choisissez **Mode production**, puis une région proche (ex. `eur3 (europe-west)`).
3. Une fois créée, onglet **Règles** → collez le contenu du fichier `firestore.rules` fourni dans ce projet, puis **Publier**.

### 2.4 Activer Storage (photos & documents)

1. **Build → Storage → Get started**, mode production, même région que Firestore.
2. Onglet **Rules** → collez le contenu du fichier `storage.rules` fourni, puis **Publier**.

### 2.5 Récupérer les clés de configuration

Dans **Paramètres du projet** (icône ⚙️ en haut à gauche) → onglet **Général** → section **Vos applications**, vous retrouvez à tout moment le bloc `firebaseConfig`. Ce sont ces valeurs qu'il faut reporter dans `.env.local`.

---

## 3. Installation en local

Prérequis : [Node.js](https://nodejs.org) version 18 ou supérieure.

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.local.example .env.local
```

Ouvrez `.env.local` et complétez avec les valeurs de votre `firebaseConfig` :

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kbm-toiture-planning.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kbm-toiture-planning
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kbm-toiture-planning.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

```bash
# 3. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`. Connectez-vous avec le compte créé à l'étape 2.2.

---

## 4. Déploiement sur Netlify

### Option A — via un dépôt Git (recommandé)

1. Poussez ce projet sur GitHub/GitLab.
2. Sur [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → sélectionnez le dépôt.
3. Netlify détecte `netlify.toml` automatiquement (build : `npm run build`, publication : `out`).
4. Avant de déployer, allez dans **Site settings → Environment variables** et ajoutez les 6 mêmes variables que dans `.env.local`.
5. Cliquez sur **Deploy site**.

### Option B — déploiement manuel (glisser-déposer)

```bash
npm run build
```

Cela génère un dossier `out/`. Sur Netlify : **Add new site → Deploy manually** → glissez le dossier `out/`.
⚠️ Avec cette option, pensez à définir les variables d'environnement dans Netlify **avant** de lancer `npm run build` en local (elles sont injectées au moment du build, pas à l'exécution).

---

## 5. Structure du projet

```
src/
  app/
    login/                 Page de connexion
    (app)/                 Zone protégée (redirige vers /login si non connecté)
      dashboard/           Tableau de bord
      planning/            Planning jour/semaine/mois
      clients/             Fiches clients
      carte/                Carte et itinéraires
      parametres/          Paramètres de l'entreprise
  components/               Composants réutilisables (Sidebar, ChantierDrawer, calendriers...)
  lib/                       Accès Firebase, logique métier (suggestion de créneau, géocodage...)
  types/                     Modèle de données TypeScript
firestore.rules              Règles de sécurité Firestore
storage.rules                 Règles de sécurité Storage
```

### Collections Firestore

Toutes les données sont stockées sous `users/{votre-uid}/...` :

| Collection       | Contenu                                             |
|-------------------|------------------------------------------------------|
| `chantiers`       | Chaque chantier (client, adresse, statut, photos...) |
| `clients`         | Fiches clients et historique                         |
| `notifications`   | Notifications (chantier demain, report, etc.)        |
| `parametres/general` | Réglages de l'entreprise (horaires, durée par défaut) |

Il n'y a pas de collection `planning` séparée : le planning est simplement une vue calculée à partir de `chantiers` (plus simple à maintenir, une seule source de vérité).

---

## 6. Notes techniques importantes

- **Géocodage** : les adresses sont géolocalisées via l'API publique et gratuite [adresse.data.gouv.fr](https://adresse.data.gouv.fr) (aucune clé requise). La distance entre deux chantiers est calculée à vol d'oiseau (formule de Haversine) — suffisant pour prioriser les créneaux sans dépendre d'une API payante. Les liens "Itinéraire" ouvrent directement Google Maps pour le calcul de trajet réel.
- **Notifications "chantier demain / aujourd'hui"** : générées côté client au chargement de l'application (une fois par jour). Pour une fiabilité totale même application fermée (ex. notification poussée le matin même sans ouvrir l'app), il faudrait ajouter une Cloud Function planifiée (Cloud Scheduler) — non incluse ici pour rester simple, mais la logique dans `src/lib/use-daily-notifications.ts` est directement réutilisable dans une Cloud Function.
- **Export statique** : le projet utilise `output: "export"` (site 100 % statique), compatible avec l'hébergement gratuit Netlify et sans serveur Next.js à maintenir.

---

## 7. Évolutions possibles

- Signature électronique du devis sur la fiche chantier
- Export du planning en PDF pour un client ou un salarié
- Multi-utilisateurs (plusieurs couvreurs, plannings partagés)
- Notifications push réelles (via Firebase Cloud Messaging + Cloud Function planifiée)
