# 🛠️ HTTP Tools - Générateur de Schémas Électriques

Application web interne pour générer automatiquement des schémas électriques au format `.drawio` à partir de fichiers JSON et d'une base de données SQLite.

## 🚀 Démarrage Rapide

### Installation (Première fois uniquement)

```bash
# Installer toutes les dépendances (racine, backend et frontend)
npm run install:all
```

Cette commande installe :
- Les dépendances de la racine (concurrently pour démarrer les deux serveurs)
- Les dépendances du backend (Express, SQLite, etc.)
- Les dépendances du frontend (React, Vite, etc.)

### Démarrage du Projet

**Une seule commande pour démarrer frontend + backend :**

```bash
npm run dev
```

Cette commande démarre automatiquement :
- ✅ **Backend** sur `http://localhost:3000`
- ✅ **Frontend** sur `http://localhost:5173`

Ouvrez votre navigateur sur `http://localhost:5173` pour accéder à l'application.

---

## 📋 Structure du Projet

```
http_tools/
├── frontend/          # Application React + Vite
│   ├── src/
│   │   ├── components/    # Composants réutilisables (Menu)
│   │   ├── pages/         # Pages de l'application (Alibalek)
│   │   └── ...
│   └── package.json
│
├── backend/           # Serveur Node.js + Express
│   ├── utils/         # Modules utilitaires (SQLite, XML, etc.)
│   ├── modeles/       # Modèles Draw.io
│   ├── database.sqlite3  # Base de données SQLite
│   ├── server.js      # Serveur Express principal
│   └── package.json
│
└── package.json       # Scripts pour démarrer les deux serveurs
```

---

## 🎯 Utilisation

### 1. Accéder à l'application

Une fois les serveurs démarrés, ouvrez `http://localhost:5173` dans votre navigateur.

### 2. Vérifier le modèle Draw.io

La section "Modèle Draw.io" affiche :
- Le nom du fichier modèle actuel
- La date d'upload
- Un bouton pour mettre à jour le modèle si nécessaire

### 3. Charger un fichier JSON

Cliquez sur "Sélectionner un fichier JSON" et choisissez votre fichier.

**Format attendu :** Tableau JSON avec des objets contenant :
- `NomArmoire` : Nom de l'armoire
- `NomEquipement` : Nom de l'équipement
- `NomPoint` : Nom du point
- `TypePoint` : Type du point (DI, DO, AI, AO, COM : ...)

**Exemple :**
```json
[
  {
    "NomArmoire": "ARMOIRE 1",
    "NomEquipement": "Elec",
    "NomPoint": "Point 1",
    "TypePoint": "DI"
  }
]
```

### 4. Sélectionner les cartes

Les cartes sont automatiquement chargées et groupées par :
- **Marque** (ex: Schneider, Isma, etc.)
- **Type** (ex: automate, carte, etc.)

Pour chaque carte :
- Utilisez les boutons **+** et **-** pour ajuster la quantité
- Ou saisissez directement la quantité dans le champ
- **Note :** Les automates sont limités à 1

### 5. Remplir les paramètres du projet

- **Auteur** : Nom de l'auteur
- **Nom du site** : Nom du site/projet
- **Nom armoire** : Nom de l'armoire
- **Date dernière édition** : Date de dernière édition
- **Indice** : Indice du document (ex: A, B, C)

### 6. Générer le schéma

Cliquez sur "Générer le schéma". Le fichier `.drawio` sera automatiquement téléchargé.

---

## 🔧 Commandes Disponibles

### À la racine du projet

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre frontend + backend en parallèle |
| `npm run dev:backend` | Démarre uniquement le backend |
| `npm run dev:frontend` | Démarre uniquement le frontend |
| `npm run install:all` | Installe toutes les dépendances |

### Dans le dossier `backend/`

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur en mode watch (redémarre automatiquement) |
| `npm start` | Démarre le serveur en mode production |

### Dans le dossier `frontend/`

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement Vite |
| `npm run build` | Compile l'application pour la production |
| `npm run preview` | Prévisualise le build de production |

---

## 📡 API Backend

### Endpoints disponibles

- `GET /` - Informations sur le serveur
- `GET /cartes` - Liste des cartes disponibles (groupées par marque/type)
- `GET /modele-info` - Informations du modèle Draw.io actuel
- `POST /upload-modele` - Mettre à jour le modèle Draw.io
- `POST /generate` - Générer le schéma électrique

---

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifiez que Node.js est installé : `node --version`
2. Installez les dépendances : `npm run install:all`
3. Vérifiez les logs dans le terminal pour voir l'erreur exacte

### Erreur "Port already in use"

Un autre processus utilise le port. Soit :
- Arrêtez l'autre processus
- Ou modifiez le port dans la configuration

**Backend :** `backend/server.js` (ligne 26)  
**Frontend :** `frontend/vite.config.js`

### Erreur de connexion à la base de données

Vérifiez que le fichier `backend/database.sqlite3` existe.  
Si ce n'est pas le cas, copiez-le depuis `projet_python/db_sqlite.sqlite3`.

### Erreur "Fichier JSON invalide"

Le fichier JSON doit être :
- Un tableau JSON valide (commence par `[` et se termine par `]`)
- Encodé en UTF-8 (avec ou sans BOM)
- Chaque objet doit contenir : `NomArmoire`, `NomEquipement`, `NomPoint`, `TypePoint`

---

## 📝 Notes Techniques

### Technologies utilisées

- **Frontend :** React 19, Vite 7
- **Backend :** Node.js, Express 5
- **Base de données :** SQLite (better-sqlite3)
- **XML :** fast-xml-parser, xmlbuilder2

### Ports par défaut

- Frontend : `5173`
- Backend : `3000`

### Hot Reload

- **Frontend :** Les modifications sont reflétées instantanément (HMR)
- **Backend :** Redémarre automatiquement avec `node --watch`

---

## 🎨 Couleurs de l'Application

L'application utilise les couleurs de la boîte :
- **Vert foncé :** `#4B707C`
- **Vert clair :** `#53C0A5`

---

## 📚 Documentation Complémentaire

- `COMMANDES.md` - Détails sur toutes les commandes utilisées
- `STRUCTURE.md` - Description détaillée de la structure du projet
- `TEST.md` - Guide de test pour vérifier que tout fonctionne

---

**Bon développement ! 🚀**
