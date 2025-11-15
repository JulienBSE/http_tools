# 📁 Structure du Projet HTTP Tools

Ce document décrit la structure complète du projet et le rôle de chaque fichier.

---

## 🌳 Arborescence Complète

```
http_tools/
│
├── frontend/                    # Application React + Vite
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── Menu.jsx         # Composant de navigation (menu principal)
│   │   │   └── Menu.css         # Styles du menu
│   │   │
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Alibalek.jsx     # Page principale de l'outil Alibalek
│   │   │   └── Alibalek.css     # Styles de la page Alibalek
│   │   │
│   │   ├── assets/              # Ressources statiques (images, etc.)
│   │   │   └── react.svg
│   │   │
│   │   ├── App.jsx              # Composant racine de l'application
│   │   ├── App.css              # Styles globaux de l'application
│   │   ├── main.jsx             # Point d'entrée React (rendu dans le DOM)
│   │   └── index.css            # Styles globaux (reset CSS)
│   │
│   ├── public/                  # Fichiers statiques servis tels quels
│   │   └── vite.svg
│   │
│   ├── index.html               # Point d'entrée HTML (chargé par le navigateur)
│   ├── vite.config.js           # Configuration Vite (proxy, plugins, etc.)
│   ├── package.json             # Dépendances et scripts frontend
│   ├── package-lock.json         # Versions verrouillées des dépendances
│   └── node_modules/            # Dépendances installées (ignoré par Git)
│
├── backend/                     # Serveur Node.js + Express
│   ├── server.js                # Serveur Express principal
│   ├── package.json             # Dépendances et scripts backend
│   ├── package-lock.json        # Versions verrouillées des dépendances
│   └── node_modules/            # Dépendances installées (ignoré par Git)
│
├── .gitignore                   # Fichiers à ignorer par Git
├── README.md                     # Documentation principale du projet
├── COMMANDES.md                  # Récapitulatif des commandes utilisées
└── STRUCTURE.md                  # Ce fichier (description de la structure)
```

---

## 📄 Description des Fichiers Principaux

### Frontend

#### `frontend/src/main.jsx`
**Rôle :** Point d'entrée de l'application React
- Importe React et ReactDOM
- Récupère l'élément `<div id="root">` du HTML
- Rend le composant `<App />` dans cet élément
- Utilise `StrictMode` pour détecter les problèmes en développement

**Concept clé :** C'est ici que React "prend le contrôle" du DOM

---

#### `frontend/src/App.jsx`
**Rôle :** Composant racine qui orchestre toute l'application
- Gère l'état global de l'application (quel outil est actif)
- Affiche le composant `<Menu />` pour la navigation
- Affiche l'outil actif (Alibalek, ou d'autres à venir)
- Utilise `useState` pour gérer l'état

**Concept clé :** C'est le "chef d'orchestre" de l'application

---

#### `frontend/src/components/Menu.jsx`
**Rôle :** Composant de navigation entre les outils
- Affiche les onglets du menu (Alibalek, etc.)
- Reçoit `outilActif` et `changerOutil` en props
- Permet de changer d'outil en cliquant sur un onglet

**Concept clé :** Communication parent-enfant via props

---

#### `frontend/src/pages/Alibalek.jsx`
**Rôle :** Page principale de l'outil Alibalek
- Gère l'upload du fichier JSON
- Charge et affiche les cartes disponibles
- Permet de sélectionner les cartes
- Gère les paramètres du projet
- Génère le schéma en appelant le backend

**Concept clé :** Gestion de plusieurs états avec `useState`, appels API avec `fetch`

---

#### `frontend/vite.config.js`
**Rôle :** Configuration de Vite
- Configure le plugin React
- Configure le proxy pour rediriger `/api/*` vers `http://localhost:3000`
- Permet d'utiliser des URLs relatives dans le code frontend

**Concept clé :** Proxy = redirection transparente des requêtes

---

#### `frontend/index.html`
**Rôle :** Point d'entrée HTML
- Contient la balise `<div id="root">` où React s'attache
- Vite injecte automatiquement le script `main.jsx`

---

### Backend

#### `backend/server.js`
**Rôle :** Serveur Express principal
- Configure Express (middlewares, routes)
- Démarre le serveur sur le port 3000
- Gère les requêtes HTTP du frontend
- (À venir) Routes `/cartes` et `/generate`

**Concept clé :** Serveur HTTP qui écoute les requêtes

---

#### `backend/package.json`
**Rôle :** Configuration npm du backend
- Liste les dépendances (express, better-sqlite3, etc.)
- Définit les scripts (`npm run dev`, `npm start`)

---

## 🔄 Flux de Données

### 1. Chargement de l'Application
```
Navigateur → index.html → main.jsx → App.jsx → Menu + Alibalek
```

### 2. Chargement des Cartes
```
Alibalek.jsx → fetch('/api/cartes') → Vite Proxy → Backend (GET /cartes) → SQLite → Réponse JSON → Alibalek.jsx
```

### 3. Génération du Schéma
```
Alibalek.jsx → fetch('/api/generate', FormData) → Vite Proxy → Backend (POST /generate) → Traitement → Fichier .drawio → Téléchargement
```

---

## 🎯 Concepts React Utilisés

### 1. Composants
- **Fonctionnels** : Tous nos composants sont des fonctions
- **Réutilisables** : Menu peut être réutilisé, Alibalek est une page

### 2. Props (Propriétés)
- **Lecture seule** : On ne modifie jamais les props directement
- **Communication parent-enfant** : App passe des props à Menu et Alibalek

### 3. État (State)
- **useState** : Hook pour gérer l'état local d'un composant
- **Immutabilité** : On crée toujours de nouveaux objets/tableaux, on ne modifie jamais directement

### 4. Effets de Bord
- **useEffect** : (À venir) Pour charger les cartes au montage du composant
- **fetch** : Pour les appels API

### 5. Événements
- **onClick** : Gestion des clics
- **onChange** : Gestion des changements dans les inputs

---

## 🔧 Configuration

### Ports
- **Frontend** : `http://localhost:5173` (Vite par défaut)
- **Backend** : `http://localhost:3000` (configuré dans `server.js`)

### Proxy Vite
- Les requêtes vers `/api/*` sont redirigées vers `http://localhost:3000/*`
- Permet d'éviter les problèmes CORS en développement
- Simplifie les URLs dans le code (pas besoin de `http://localhost:3000` partout)

---

## 📦 Dépendances Principales

### Frontend
- `react` + `react-dom` : Bibliothèque React
- `vite` : Build tool et serveur de développement
- `@vitejs/plugin-react` : Plugin Vite pour React

### Backend
- `express` : Framework web
- `express-fileupload` : Upload de fichiers
- `better-sqlite3` : Base de données SQLite
- `fast-xml-parser` : Génération XML pour .drawio
- `cors` : Gestion CORS

---

## 🚀 Prochaines Étapes

1. ✅ Structure créée
2. ✅ Composants de base créés
3. ⏳ Créer la base SQLite avec les cartes
4. ⏳ Implémenter les routes backend (`/cartes`, `/generate`)
5. ⏳ Convertir la logique Python en JavaScript
6. ⏳ Tester l'upload et la génération

---

## 💡 Notes Importantes

- **Hot Module Replacement (HMR)** : Les modifications sont reflétées instantanément grâce à Vite
- **Immutabilité** : Toujours créer de nouveaux objets/tableaux pour l'état React
- **Props vs State** : Props = données du parent, State = données internes au composant
- **Proxy** : Simplifie les appels API en développement

---

**Cette structure est extensible :** On peut facilement ajouter de nouveaux outils en créant de nouvelles pages dans `frontend/src/pages/` et en les ajoutant au menu !

