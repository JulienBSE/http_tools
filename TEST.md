# ✅ Guide de Test - Vérifier que Tout Fonctionne

Ce guide vous permet de vérifier que l'environnement est correctement configuré.

---

## 🧪 Test 1 : Vérifier l'Installation

### Frontend
```bash
cd frontend
npm list --depth=0
```

**Résultat attendu :** Liste des packages installés (react, vite, etc.)

### Backend
```bash
cd backend
npm list --depth=0
```

**Résultat attendu :** Liste des packages installés (express, better-sqlite3, etc.)

---

## 🧪 Test 2 : Démarrer le Backend

```bash
cd backend
npm run dev
```

**Résultat attendu :**
```
🚀 Serveur backend démarré sur http://localhost:3000
📡 Prêt à recevoir les requêtes du frontend
```

**Test manuel :** Ouvrir `http://localhost:3000` dans le navigateur
- **Résultat attendu :** JSON avec `{ message: "Backend HTTP Tools - Serveur actif", ... }`

---

## 🧪 Test 3 : Démarrer le Frontend

**Dans un NOUVEAU terminal :**
```bash
cd frontend
npm run dev
```

**Résultat attendu :**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Test manuel :** Ouvrir `http://localhost:5173` dans le navigateur
- **Résultat attendu :** 
  - Menu "HTTP Tools" en haut
  - Page "Alibalek" avec les sections :
    - 1. Fichier JSON
    - 2. Sélection des cartes
    - 3. Paramètres du projet
    - 4. Bouton de génération

---

## 🧪 Test 4 : Vérifier la Communication Frontend ↔ Backend

### Test du Proxy Vite

1. Ouvrir la console du navigateur (F12 → Console)
2. Dans la page Alibalek, cliquer sur "Charger les cartes disponibles"
3. **Résultat attendu :** 
   - Erreur dans la console (normal, la route `/cartes` n'existe pas encore)
   - Mais la requête est bien envoyée (visible dans l'onglet Network)

**Si vous voyez une erreur CORS :** Le proxy ne fonctionne pas. Vérifier `vite.config.js`.

---

## 🧪 Test 5 : Vérifier les Composants React

### Test du Menu
- Cliquer sur l'onglet "Alibalek" (devrait être actif par défaut)
- **Résultat attendu :** L'onglet est surligné

### Test de l'Upload
- Cliquer sur "Sélectionner un fichier JSON"
- Sélectionner un fichier JSON (ou n'importe quel fichier)
- **Résultat attendu :** 
  - Si JSON : Le texte change en "Fichier sélectionné : nom_du_fichier.json"
  - Si autre : Alerte "Veuillez sélectionner un fichier JSON"

### Test des Paramètres
- Remplir "Nom du projet" et "Automate"
- **Résultat attendu :** Les champs se remplissent normalement

---

## 🐛 Dépannage

### Erreur "Cannot find module"
**Solution :** Réinstaller les dépendances
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### Erreur "Port already in use"
**Solution :** 
1. Trouver le processus qui utilise le port
2. L'arrêter ou changer le port dans la configuration

### Le frontend ne se charge pas
**Vérifier :**
1. Le terminal frontend est bien démarré
2. Aucune erreur dans le terminal
3. L'URL dans le navigateur est correcte (`http://localhost:5173`)

### Le backend ne répond pas
**Vérifier :**
1. Le terminal backend est bien démarré
2. Aucune erreur dans le terminal
3. Tester directement `http://localhost:3000` dans le navigateur

---

## ✅ Checklist de Vérification

- [ ] Les dépendances sont installées (frontend et backend)
- [ ] Le backend démarre sans erreur
- [ ] Le frontend démarre sans erreur
- [ ] Le menu s'affiche correctement
- [ ] La page Alibalek s'affiche
- [ ] L'upload de fichier fonctionne (validation)
- [ ] Les champs de formulaire fonctionnent
- [ ] Le proxy fonctionne (pas d'erreur CORS)

---

## 🎯 Prochaines Étapes Après les Tests

Une fois que tout fonctionne :

1. ✅ Environnement configuré
2. ⏳ Créer la base SQLite avec les cartes
3. ⏳ Implémenter la route `/cartes` dans le backend
4. ⏳ Implémenter la route `/generate` dans le backend
5. ⏳ Convertir la logique Python en JavaScript
6. ⏳ Tester la génération complète

---

**Si tous les tests passent, vous êtes prêt à développer ! 🚀**

