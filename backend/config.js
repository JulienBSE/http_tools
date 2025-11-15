// ============================================
// CONFIGURATION GLOBALE DU BACKEND
// ============================================
// Ce fichier centralise tous les chemins et paramètres de configuration
// Équivalent du fichier config.py du projet Python

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Récupérer le chemin du dossier backend (équivalent de __dirname en CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CHEMINS DES FICHIERS
// ============================================

// Chemin de la base de données SQLite
export const CHEMIN_BDD = join(__dirname, 'database.sqlite3');

// Chemin du dossier contenant les modèles Draw.io
export const CHEMIN_MODELES = join(__dirname, 'modeles');

// Nom du fichier modèle par défaut
export const NOM_MODELE_DEFAULT = 'modele_http.drawio';

// Chemin complet du modèle Draw.io par défaut
export const CHEMIN_MODELE_DRAWIO = join(CHEMIN_MODELES, NOM_MODELE_DEFAULT);

// Chemin où seront enregistrés les fichiers générés
export const CHEMIN_OUTPUT = join(__dirname, 'output');

// Version de l'application
export const VERSION_BUILD = "V1.0.2 19/03/2025";

// ============================================
// VÉRIFICATIONS
// ============================================

// Vérifier que la base de données existe
if (!existsSync(CHEMIN_BDD)) {
    console.warn(`⚠️  Attention : La base de données n'existe pas à ${CHEMIN_BDD}`);
}

// Vérifier que le dossier des modèles existe
if (!existsSync(CHEMIN_MODELES)) {
    console.warn(`⚠️  Attention : Le dossier des modèles n'existe pas à ${CHEMIN_MODELES}`);
}

// Créer le dossier output s'il n'existe pas
import { mkdirSync } from 'fs';
if (!existsSync(CHEMIN_OUTPUT)) {
    mkdirSync(CHEMIN_OUTPUT, { recursive: true });
    console.log(`📁 Dossier output créé : ${CHEMIN_OUTPUT}`);
}

