# 🚀 Guide de Déploiement - HTTP Tools

Ce guide explique comment déployer l'application **HTTP Tools** en production avec Docker et Portainer.

---

## 📋 Prérequis

- **Serveur Ubuntu/Debian** avec accès root ou sudo
- **Docker** installé
- **Docker Compose** installé
- **Portainer** installé (optionnel mais recommandé)

---

## 🔧 Installation des Prérequis

### 1. Installer Docker

```bash
# Mettre à jour les paquets
sudo apt update

# Installer les dépendances
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version
```

### 2. Installer Portainer (Recommandé)

```bash
# Créer un volume pour Portainer
docker volume create portainer_data

# Lancer Portainer
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Accéder à Portainer : `http://votre-serveur:9000`

---

## 📦 Déploiement de l'Application

### Option 1 : Via Portainer (Interface Graphique)

1. **Connecter-vous à Portainer** (`http://votre-serveur:9000`)
2. **Créer un nouveau Stack** :
   - Cliquez sur "Stacks" dans le menu
   - Cliquez sur "Add stack"
   - Nommez-le : `http-tools`
3. **Copier le contenu de `docker-compose.yml`** dans l'éditeur
4. **Cliquer sur "Deploy the stack"**
5. **Vérifier les logs** pour s'assurer que tout démarre correctement

### Option 2 : Via Ligne de Commande

```bash
# Se placer dans le dossier du projet
cd /chemin/vers/http_tools

# Construire et lancer les conteneurs
docker compose up -d

# Vérifier que les conteneurs tournent
docker compose ps

# Voir les logs
docker compose logs -f
```

---

## 🌐 Accès à l'Application

Une fois déployée, l'application est accessible :

- **Frontend** : `http://votre-serveur` (port 80)
- **Backend API** : `http://votre-serveur:3000` (directement, ou via `/api` depuis le frontend)

---

## 🔒 Configuration avec un Domaine (Optionnel)

Si vous avez un domaine (ex: `http-tools.mon-entreprise.com`), vous pouvez :

1. **Configurer un reverse proxy** (Nginx ou Traefik) devant Docker
2. **Utiliser HTTPS** avec Let's Encrypt
3. **Modifier les ports** dans `docker-compose.yml` si nécessaire

### Exemple avec Nginx comme Reverse Proxy

```nginx
server {
    listen 80;
    server_name http-tools.mon-entreprise.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📁 Structure des Volumes

Les données suivantes sont persistantes (montées depuis l'hôte) :

- **Base de données** : `./backend/database.sqlite3`
- **Modèles Draw.io** : `./backend/modeles/`
- **Fichiers générés** : `./backend/output/`

⚠️ **Important** : Assurez-vous que ces fichiers existent sur le serveur avant le déploiement !

---

## 🔄 Mise à Jour de l'Application

### Via Portainer

1. Aller dans "Stacks" → `http-tools`
2. Cliquer sur "Editor"
3. Mettre à jour le `docker-compose.yml` si nécessaire
4. Cliquer sur "Update the stack"

### Via Ligne de Commande

```bash
# Arrêter les conteneurs
docker compose down

# Reconstruire les images (si le code a changé)
docker compose build --no-cache

# Redémarrer
docker compose up -d
```

---

## 🐛 Dépannage

### Vérifier les logs

```bash
# Logs de tous les services
docker compose logs

# Logs du backend uniquement
docker compose logs backend

# Logs du frontend uniquement
docker compose logs frontend

# Suivre les logs en temps réel
docker compose logs -f
```

### Redémarrer un service

```bash
# Redémarrer le backend
docker compose restart backend

# Redémarrer le frontend
docker compose restart frontend
```

### Vérifier l'état des conteneurs

```bash
# Liste des conteneurs
docker compose ps

# Informations détaillées
docker compose ps -a
```

### Accéder au shell d'un conteneur

```bash
# Shell du backend
docker compose exec backend sh

# Shell du frontend
docker compose exec frontend sh
```

---

## 💾 Sauvegarde

### Sauvegarder la base de données

```bash
# Copier la base de données
cp backend/database.sqlite3 backups/database_$(date +%Y%m%d).sqlite3
```

### Sauvegarder les modèles

```bash
# Archiver les modèles
tar -czf backups/modeles_$(date +%Y%m%d).tar.gz backend/modeles/
```

---

## 🔐 Sécurité

- ✅ Les conteneurs sont isolés
- ✅ Seuls les ports nécessaires sont exposés
- ⚠️ **Important** : En production, configurez un firewall (UFW) pour limiter l'accès
- ⚠️ **Important** : Utilisez HTTPS avec un certificat SSL (Let's Encrypt)

---

## 📞 Support

En cas de problème, vérifiez :
1. Les logs des conteneurs
2. Que les ports 80 et 3000 ne sont pas utilisés par d'autres services
3. Que les fichiers de données (BDD, modèles) existent et sont accessibles
4. Que Docker et Docker Compose sont à jour

---

## 🎯 Prochaines Étapes

- [ ] Configurer un domaine personnalisé
- [ ] Mettre en place HTTPS (Let's Encrypt)
- [ ] Configurer des sauvegardes automatiques
- [ ] Mettre en place un monitoring (optionnel)

