# 📋 Récapitulatif des Commandes Utilisées

Ce document liste toutes les commandes utilisées pour mettre en place le projet, avec leurs explications détaillées.

---

## 🏗️ Commandes de Setup (Déjà Exécutées)

### 1. Création de la Structure du Projet

```powershell
New-Item -ItemType Directory -Path frontend, backend -Force
```

**Explication :**
- `New-Item` : Commande PowerShell pour créer des fichiers/dossiers
- `-ItemType Directory` : Spécifie qu'on crée un dossier (pas un fichier)
- `-Path frontend, backend` : Crée les deux dossiers en une seule commande
- `-Force` : Force la création même si les dossiers existent déjà (évite les erreurs)

**Résultat :** Crée la structure de base du projet (monorepo avec frontend et backend séparés)

---

### 2. Initialisation du Frontend (React + Vite)

```bash
cd frontend
npm create vite@latest . -- --template react --yes
```

**Explication :**
- `cd frontend` : Se déplace dans le dossier frontend
- `npm create vite@latest` : Utilise npx pour exécuter create-vite (outil de scaffolding)
- `.` : Crée le projet dans le dossier courant (pas dans un sous-dossier)
- `--template react` : Utilise le template React (configure Vite pour React)
- `--yes` : Répond automatiquement "oui" aux questions (mode non-interactif)

**Résultat :** 
- Crée les fichiers de configuration Vite (`vite.config.js`)
- Crée la structure React de base (`src/App.jsx`, `src/main.jsx`)
- Crée `package.json` avec les dépendances React et Vite
- Crée `index.html` (point d'entrée HTML)

**Note :** Cette commande ne fait QUE créer les fichiers. Il faut ensuite faire `npm install` pour installer les dépendances.

---

### 3. Initialisation du Backend (Node.js)

```bash
cd backend
npm init -y
```

**Explication :**
- `cd backend` : Se déplace dans le dossier backend
- `npm init` : Initialise un projet Node.js
- `-y` : Utilise les valeurs par défaut pour toutes les questions (évite l'interaction)

**Résultat :** 
- Crée un `package.json` basique avec :
  - `name: "backend"`
  - `version: "1.0.0"`
  - `main: "index.js"`
  - Scripts par défaut

---

### 4. Installation des Dépendances Frontend

```bash
cd frontend
npm install
```

**Explication :**
- `npm install` : Lit le fichier `package.json` et installe toutes les dépendances listées
- Les dépendances sont installées dans `node_modules/`
- Un fichier `package-lock.json` est créé pour verrouiller les versions exactes

**Dépendances installées automatiquement (définies dans package.json) :**
- `react` et `react-dom` : Bibliothèque React
- `vite` : Build tool
- `@vitejs/plugin-react` : Plugin Vite pour React
- `eslint` : Linter (outil de vérification de code)

**Temps d'exécution :** ~10-20 secondes

---

### 5. Installation des Dépendances Backend

```bash
cd backend
npm install express express-fileupload better-sqlite3 fast-xml-parser
```

**Explication :**
- `npm install <package1> <package2> ...` : Installe plusieurs packages en une seule commande
- Les packages sont ajoutés à `dependencies` dans `package.json`
- Ils sont installés dans `node_modules/`

**Packages installés :**
- `express` : Framework web pour créer l'API REST
- `express-fileupload` : Middleware pour gérer l'upload de fichiers
- `better-sqlite3` : Bibliothèque SQLite (synchrone, rapide)
- `fast-xml-parser` : Parser XML pour générer les fichiers .drawio

**Temps d'exécution :** ~5-10 secondes

---

### 6. Installation de CORS (Backend)

```bash
cd backend
npm install cors
```

**Explication :**
- `cors` : Middleware Express pour gérer les requêtes Cross-Origin Resource Sharing
- Nécessaire car le frontend (port 5173) et le backend (port 3000) sont sur des ports différents
- Sans CORS, le navigateur bloquerait les requêtes pour des raisons de sécurité

---

## 🚀 Commandes de Démarrage (À Utiliser Quotidiennement)

### Démarrage du Backend

```bash
cd backend
npm run dev
```

**Explication :**
- `npm run dev` : Exécute le script `"dev"` défini dans `package.json`
- Le script est : `"dev": "node --watch server.js"`
- `node --watch` : Mode watch de Node.js (redémarre automatiquement quand un fichier change)
- `server.js` : Fichier principal du serveur

**Résultat :**
- Le serveur démarre sur `http://localhost:3000`
- Affiche : `🚀 Serveur backend démarré sur http://localhost:3000`
- Redémarre automatiquement quand vous modifiez un fichier backend

**Note :** Gardez ce terminal ouvert pendant le développement.

---

### Démarrage du Frontend

```bash
cd frontend
npm run dev
```

**Explication :**
- `npm run dev` : Exécute le script `"dev": "vite"` défini dans `package.json`
- `vite` : Lance le serveur de développement Vite
- Vite démarre un serveur avec Hot Module Replacement (HMR)

**Résultat :**
- Le serveur démarre généralement sur `http://localhost:5173`
- Vite affiche l'URL dans le terminal
- Les modifications sont reflétées instantanément dans le navigateur (HMR)

**Note :** Gardez ce terminal ouvert pendant le développement.

**Important :** Vous devez avoir **2 terminaux ouverts** :
- Terminal 1 : Backend (`npm run dev` dans `backend/`)
- Terminal 2 : Frontend (`npm run dev` dans `frontend/`)

---

## 🔧 Commandes Utiles (Optionnelles)

### Build de Production (Frontend)

```bash
cd frontend
npm run build
```

**Explication :**
- Compile et optimise le code React pour la production
- Crée un dossier `dist/` avec les fichiers statiques optimisés
- Les fichiers sont minifiés et optimisés pour la performance
- Prêt à être déployé sur un serveur web

**Quand l'utiliser :** Avant de déployer l'application en production

---

### Prévisualisation du Build

```bash
cd frontend
npm run preview
```

**Explication :**
- Lance un serveur local pour prévisualiser le build de production
- Utile pour tester l'application avant le déploiement
- Simule l'environnement de production localement

---

### Linter (Vérification du Code)

```bash
cd frontend
npm run lint
```

**Explication :**
- Vérifie la qualité et la cohérence du code JavaScript/JSX
- Détecte les erreurs potentielles et les mauvaises pratiques
- Utilise ESLint configuré dans `eslint.config.js`

**Quand l'utiliser :** Avant de commiter du code, pour s'assurer de la qualité

---

### Démarrage Backend en Mode Production

```bash
cd backend
npm start
```

**Explication :**
- Démarre le serveur sans le mode watch (pas de redémarrage automatique)
- Utilisé en production où on ne modifie pas le code
- Plus léger que `npm run dev` (pas de surveillance des fichiers)

---

## 📝 Résumé des Commandes Essentielles

### Setup Initial (Une Seule Fois)
```bash
# 1. Installer dépendances frontend
cd frontend
npm install

# 2. Installer dépendances backend
cd ../backend
npm install
```

### Démarrage Quotidien
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (nouveau terminal)
cd frontend
npm run dev
```

---

## 🎯 Commandes PowerShell vs Bash

**Note importante :** Sur Windows, PowerShell est utilisé par défaut. Certaines commandes diffèrent :

| Bash (Linux/Mac) | PowerShell (Windows) | Explication |
|------------------|---------------------|-------------|
| `mkdir dir1 dir2` | `New-Item -ItemType Directory -Path dir1, dir2` | Créer des dossiers |
| `cd ../` | `cd ..` | Remonter d'un niveau |
| `&&` | `;` | Enchaîner des commandes |

**Exemple :**
- Bash : `cd frontend && npm install`
- PowerShell : `cd frontend; npm install`

---

## ❓ Questions Fréquentes

### Pourquoi 2 terminaux ?
Le frontend et le backend sont deux serveurs séparés qui doivent tourner en même temps pour que l'application fonctionne.

### Que faire si un port est déjà utilisé ?
Changer le port dans la configuration :
- Frontend : `frontend/vite.config.js`
- Backend : `backend/server.js`

### Comment arrêter les serveurs ?
Appuyer sur `Ctrl + C` dans chaque terminal.

---

**💡 Astuce :** Gardez ce fichier à portée de main pendant les premières semaines de développement !

