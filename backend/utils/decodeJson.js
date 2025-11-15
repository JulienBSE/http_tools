// ============================================
// MODULE DE DÉCODAGE JSON
// ============================================
// Ce module filtre les points par type depuis un fichier JSON
// Équivalent du fichier decode_json.py du projet Python

import { readFileSync } from 'fs';

/**
 * Filtre les points par type depuis un fichier JSON
 * 
 * @param {string} typePoint - Le type de point à filtrer (DI, DO, AI, AO, COM : Modbus RS485)
 * @param {string} cheminFichierJson - Le chemin vers le fichier JSON
 * @returns {Array} Liste des points filtrés avec la clé "nom_schema" ajoutée
 */
export function filtrerPointsParType(typePoint, cheminFichierJson) {
    try {
        // Lire le fichier JSON avec gestion du BOM (Byte Order Mark)
        // utf-8-sig supprime automatiquement le BOM s'il est présent
        const contenu = readFileSync(cheminFichierJson, { encoding: 'utf-8' });
        
        // Parser le JSON
        const donnees = JSON.parse(contenu);
        
        // Filtrer les points par type et ajouter la clé "nom_schema"
        const resultat = [];
        
        for (const point of donnees) {
            if (point.TypePoint === typePoint) {
                // Créer le nom_schema : "NomEquipement - NomPoint"
                point.nom_schema = `${point.NomEquipement} - ${point.NomPoint}`;
                resultat.push(point);
            }
        }
        
        return resultat;
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error(`Erreur lors du décodage JSON : ${error.message}`);
        } else {
            console.error(`Erreur inattendue : ${error.message}`);
        }
        return [];
    }
}

/**
 * Filtre les points depuis un objet JSON (déjà parsé)
 * Utile quand le JSON est déjà en mémoire (upload via FormData)
 * 
 * @param {string} typePoint - Le type de point à filtrer
 * @param {Array} donneesJson - Les données JSON déjà parsées
 * @returns {Array} Liste des points filtrés avec la clé "nom_schema" ajoutée
 */
export function filtrerPointsParTypeDepuisObjet(typePoint, donneesJson) {
    try {
        const resultat = [];
        
        for (const point of donneesJson) {
            if (point.TypePoint === typePoint) {
                // Créer le nom_schema : "NomEquipement - NomPoint"
                point.nom_schema = `${point.NomEquipement} - ${point.NomPoint}`;
                resultat.push(point);
            }
        }
        
        return resultat;
        
    } catch (error) {
        console.error(`Erreur lors du filtrage : ${error.message}`);
        return [];
    }
}

