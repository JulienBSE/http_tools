#!/bin/sh

# ============================================
# SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES ET DES MODÈLES
# ============================================
# Ce script copie les fichiers initiaux dans les volumes Docker si nécessaire

DB_PATH="/app/data/database.sqlite3"
DB_INITIAL="/app/database.sqlite3.initial"
MODELES_PATH="/app/modeles"
MODELES_INITIAL="/app/modeles.initial"

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

# Initialiser les modèles si le dossier est vide ou n'existe pas
# Créer le dossier modeles s'il n'existe pas
mkdir -p "$MODELES_PATH"

# Vérifier si le dossier est vide (pas de fichiers .drawio)
if [ ! -f "$MODELES_PATH/modele_http.drawio" ]; then
    if [ -d "$MODELES_INITIAL" ] && [ -f "$MODELES_INITIAL/modele_http.drawio" ]; then
        echo "📋 Copie des modèles Draw.io initiaux..."
        cp -r "$MODELES_INITIAL"/* "$MODELES_PATH"/ 2>/dev/null || true
        echo "✅ Modèles initialisés dans $MODELES_PATH"
    else
        echo "⚠️  Aucun modèle initial trouvé dans $MODELES_INITIAL"
    fi
else
    echo "✅ Modèle déjà présent dans le volume : $MODELES_PATH/modele_http.drawio"
fi

