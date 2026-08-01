# Module "Mails intelligents" — KBM Toiture

Ce module ajoute à votre application planning une page **Mails** qui relève automatiquement votre boîte Gmail, fait analyser chaque message par l'IA (Gemini, gratuite), et vous propose une réponse à valider en un clic.

**Fonctionnement en bref :**
1. Un petit robot gratuit (hébergé sur GitHub Actions) se réveille toutes les 10 minutes
2. Il relève les nouveaux mails de votre Gmail
3. Il envoie chaque mail à l'IA Gemini qui le résume, le classe, et propose une réponse
4. Le résultat apparaît dans l'onglet **Mails** de votre application
5. Vous validez (ou modifiez) la réponse suggérée → le robot l'envoie au prochain passage (10 min max)

Aucun serveur à payer ni à maintenir, aucune carte bancaire à renseigner nulle part : hébergement (GitHub Actions) et IA (Gemini) sont tous les deux gratuits pour ce volume d'usage.

---

## 1. Créer votre clé API Gemini (gratuite, sans carte bancaire)

1. Allez sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → connectez-vous avec votre compte Google
2. Cliquez sur **Create API Key** → copiez la clé générée

C'est tout — pas de carte bancaire, pas d'expiration. Le quota gratuit (1 500 requêtes/jour) est très largement suffisant pour une boîte mail d'artisan.

⚠️ Point à connaître : sur ce quota gratuit, Google peut utiliser le contenu échangé pour améliorer ses modèles. Rien d'alarmant pour un usage courant, mais à garder en tête si des informations très sensibles transitent par mail.

Gardez cette clé de côté, vous la collerez à l'étape 5.

---

## 2. Créer un mot de passe d'application Gmail

1. Activez la validation en 2 étapes si ce n'est pas déjà fait : [myaccount.google.com/security](https://myaccount.google.com/security)
2. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Créez un mot de passe d'application nommé par exemple "KBM Mails"
4. Copiez le code à 16 caractères généré (sans les espaces)

---

## 3. Créer une clé de compte de service Firebase

Cette clé permet au robot d'écrire dans votre base de données Firestore existante (celle du planning).

1. [Console Firebase](https://console.firebase.google.com) → votre projet `kbm-toiture-planning`
2. Icône ⚙️ → **Paramètres du projet** → onglet **Comptes de service**
3. Cliquez sur **Générer une nouvelle clé privée** → un fichier `.json` se télécharge
4. Ouvrez ce fichier avec le Bloc-notes, vous en aurez besoin à l'étape 5 (tout le contenu, tel quel)

⚠️ Ce fichier donne un accès complet à votre base de données. Ne le partagez jamais publiquement, ne le mettez jamais dans le dépôt GitHub.

---

## 4. Retrouver votre identifiant utilisateur (UID)

1. [Console Firebase](https://console.firebase.google.com) → **Authentication → Users**
2. Repérez votre compte dans la liste, copiez la valeur de la colonne **User UID** (une longue chaîne de caractères)

---

## 5. Ajouter les secrets dans GitHub

C'est l'endroit sécurisé où stocker toutes ces informations sensibles (GitHub ne les affiche plus une fois enregistrées, et elles ne sont jamais visibles dans le code).

1. Sur votre dépôt GitHub → **Settings → Secrets and variables → Actions**
2. Cliquez sur **New repository secret** pour chacune des lignes suivantes :

| Nom du secret | Valeur |
|---|---|
| `GMAIL_ADDRESS` | votre adresse Gmail complète |
| `GMAIL_APP_PASSWORD` | le code à 16 caractères de l'étape 2 |
| `GEMINI_API_KEY` | la clé de l'étape 1 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | tout le contenu du fichier `.json` de l'étape 3, collé tel quel |
| `KBM_USER_ID` | l'UID de l'étape 4 |
| `SIGNATURE` | votre signature, ex : `KBM Toiture\nTél. 06 12 34 56 78` |

---

## 6. Activer le workflow

Le fichier `.github/workflows/sync-emails.yml` est déjà inclus dans le projet. Une fois poussé sur GitHub avec les secrets configurés, il se déclenche automatiquement toutes les 10 minutes.

**Pour un premier test immédiat** (sans attendre 10 minutes) :
1. Sur GitHub → onglet **Actions**
2. Cliquez sur **Synchronisation des mails KBM** dans la liste de gauche
3. Bouton **Run workflow** → **Run workflow**
4. Attendez 30 secondes à 1 minute, rafraîchissez la page pour voir le résultat (✓ vert ou ✗ rouge)
5. Cliquez sur l'exécution pour voir le détail des logs si besoin

---

## 7. Publier la nouvelle page dans l'application

La page **Mails** est déjà intégrée au code. Il suffit de reconstruire et redéployer l'application comme d'habitude :

```bash
npm run build
firebase deploy --only hosting
```

Rechargez la page (Ctrl+Maj+R) — l'onglet **Mails** apparaît dans le menu de gauche.

---

## 8. Autoriser Firestore à stocker les mails

Bonne nouvelle : rien à faire ici. Les règles de sécurité déjà en place (`firestore.rules`) autorisent déjà toutes les sous-collections de votre compte, y compris la nouvelle collection `emails`.

---

## Tester en local (optionnel, pour les curieux)

```bash
cd email-worker
npm install
cp .env.example .env
# remplissez .env avec les mêmes valeurs que les secrets GitHub
npm run sync
```

---

## Budget à prévoir

**0 €.** Hébergement (GitHub Actions) et IA (Gemini API, quota gratuit Google) sont tous les deux gratuits pour ce volume d'usage, sans carte bancaire à renseigner nulle part.

Seule limite du gratuit : 1 500 analyses de mails par jour maximum (largement suffisant), et vos échanges peuvent être utilisés par Google pour améliorer ses modèles (voir étape 1).

---

## Sécurité importante

- Le mode d'envoi est **toujours manuel** : aucune réponse n'est envoyée sans que vous cliquiez sur "Valider" dans l'application. Le robot ne fait qu'exécuter les envois que vous avez explicitement approuvés.
- Ne collez jamais vos clés (clé Gemini, mot de passe d'application, fichier de compte de service) ailleurs que dans les secrets GitHub.
- Si une clé est compromise : régénérez-la immédiatement (Google AI Studio pour la clé Gemini, Google Account pour le mot de passe d'application, Firebase Console pour le compte de service) puis mettez à jour le secret GitHub correspondant.
