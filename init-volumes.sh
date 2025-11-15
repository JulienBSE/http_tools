#!/bin/bash

# ============================================
# SCRIPT D'INITIALISATION DES VOLUMES
# ============================================
# Ce script crée les fichiers et dossiers nécessaires
# pour le montage des volumes Docker

set -e

echo "🔧 Initialisation des volumes Docker..."

# Créer le dossier backend s'il n'existe pas
mkdir -p backend

# Créer le fichier database.sqlite3 s'il n'existe pas
# (fichier vide, sera rempli par l'application si nécessaire)
if [ ! -f "backend/database.sqlite3" ]; then
    echo "📄 Création de backend/database.sqlite3..."
    touch backend/database.sqlite3
    # Donner les permissions appropriées
    chmod 666 backend/database.sqlite3
fi

# Créer le dossier modeles s'il n'existe pas
if [ ! -d "backend/modeles" ]; then
    echo "📁 Création de backend/modeles/..."
    mkdir -p backend/modeles
    chmod 755 backend/modeles
fi

# Créer le dossier output s'il n'existe pas
if [ ! -d "backend/output" ]; then
    echo "📁 Création de backend/output/..."
    mkdir -p backend/output
    chmod 755 backend/output
fi

echo "✅ Initialisation terminée !"

