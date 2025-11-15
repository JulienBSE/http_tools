#!/bin/bash

# ============================================
# SCRIPT DE DÉPLOIEMENT RAPIDE
# ============================================
# Ce script automatise le déploiement de l'application
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de HTTP Tools..."
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que les fichiers nécessaires existent
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Fichier docker-compose.yml introuvable."
    exit 1
fi

if [ ! -f "backend/database.sqlite3" ]; then
    echo "⚠️  Attention: backend/database.sqlite3 n'existe pas."
    echo "   Assurez-vous que la base de données est présente."
fi

if [ ! -d "backend/modeles" ]; then
    echo "⚠️  Attention: backend/modeles/ n'existe pas."
    echo "   Assurez-vous que les modèles Draw.io sont présents."
fi

# Arrêter les conteneurs existants (si présents)
echo "🛑 Arrêt des conteneurs existants..."
docker compose down 2>/dev/null || true

# Construire les images
echo "🔨 Construction des images Docker..."
docker compose build --no-cache

# Démarrer les conteneurs
echo "▶️  Démarrage des conteneurs..."
docker compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 5

# Vérifier l'état des conteneurs
echo ""
echo "📊 État des conteneurs:"
docker compose ps

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 L'application est accessible sur:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:3000"
echo ""
echo "📋 Pour voir les logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Pour arrêter l'application:"
echo "   docker compose down"

