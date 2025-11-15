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

echo "🔍 [init-db] Vérification des modèles..."
echo "   MODELES_PATH: $MODELES_PATH"
echo "   MODELES_INITIAL: $MODELES_INITIAL"
echo "   Modèle existe dans volume: $([ -f "$MODELES_PATH/modele_http.drawio" ] && echo "OUI" || echo "NON")"
echo "   Modèle existe dans initial: $([ -f "$MODELES_INITIAL/modele_http.drawio" ] && echo "OUI" || echo "NON")"
echo "   Dossier initial existe: $([ -d "$MODELES_INITIAL" ] && echo "OUI" || echo "NON")"

# Vérifier si le fichier modèle existe dans le volume
if [ ! -f "$MODELES_PATH/modele_http.drawio" ]; then
    echo "📋 [init-db] Le modèle n'existe pas dans le volume, initialisation..."
    
    if [ -d "$MODELES_INITIAL" ] && [ -f "$MODELES_INITIAL/modele_http.drawio" ]; then
        echo "📋 [init-db] Copie des modèles depuis $MODELES_INITIAL vers $MODELES_PATH..."
        # Lister ce qui est dans modeles.initial
        echo "   Contenu de $MODELES_INITIAL:"
        ls -la "$MODELES_INITIAL" || echo "   (vide ou erreur)"
        
        # Copier tous les fichiers
        cp -r "$MODELES_INITIAL"/* "$MODELES_PATH"/ 2>&1
        COPY_RESULT=$?
        
        if [ $COPY_RESULT -eq 0 ]; then
            echo "✅ [init-db] Modèles copiés avec succès"
            # Vérifier que le fichier existe maintenant
            if [ -f "$MODELES_PATH/modele_http.drawio" ]; then
                echo "✅ [init-db] Vérification OK : modele_http.drawio existe dans $MODELES_PATH"
                ls -lh "$MODELES_PATH/modele_http.drawio"
            else
                echo "❌ [init-db] ERREUR : Le fichier n'a pas été copié correctement"
            fi
        else
            echo "❌ [init-db] Erreur lors de la copie (code: $COPY_RESULT)"
        fi
    else
        echo "⚠️  [init-db] Aucun modèle initial trouvé"
        echo "   Vérification:"
        echo "   - Dossier $MODELES_INITIAL existe: $([ -d "$MODELES_INITIAL" ] && echo "OUI" || echo "NON")"
        if [ -d "$MODELES_INITIAL" ]; then
            echo "   - Contenu:"
            ls -la "$MODELES_INITIAL" || echo "   (vide)"
        fi
    fi
else
    echo "✅ [init-db] Modèle déjà présent dans le volume : $MODELES_PATH/modele_http.drawio"
    ls -lh "$MODELES_PATH/modele_http.drawio"
fi

# Vérification finale
echo "🔍 [init-db] Vérification finale..."
if [ -f "$MODELES_PATH/modele_http.drawio" ]; then
    echo "✅ [init-db] SUCCÈS : Le modèle est disponible à $MODELES_PATH/modele_http.drawio"
else
    echo "❌ [init-db] ÉCHEC : Le modèle n'est PAS disponible à $MODELES_PATH/modele_http.drawio"
    echo "   Le serveur ne pourra pas générer de schémas sans ce fichier !"
fi

