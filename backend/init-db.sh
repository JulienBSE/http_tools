#!/bin/sh

# ============================================
# SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES
# ============================================
# Ce script copie le fichier database.sqlite3 initial
# dans le volume Docker si il n'existe pas déjà

DB_PATH="/app/data/database.sqlite3"
DB_INITIAL="/app/database.sqlite3.initial"

# Créer le dossier data s'il n'existe pas
mkdir -p /app/data

# Si le fichier n'existe pas dans le volume, copier le fichier initial
if [ ! -f "$DB_PATH" ] && [ -f "$DB_INITIAL" ]; then
    echo "📋 Copie de la base de données initiale vers le volume..."
    cp "$DB_INITIAL" "$DB_PATH"
    echo "✅ Base de données initialisée dans le volume"
elif [ ! -f "$DB_PATH" ]; then
    echo "⚠️  Aucun fichier database.sqlite3 initial trouvé, la BDD sera créée par l'application si nécessaire"
fi

