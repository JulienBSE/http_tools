// ============================================
// MODULE DE GESTION DES INFORMATIONS DU MODÈLE
// ============================================
// Ce module gère les informations sur le modèle Draw.io actuellement utilisé

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { CHEMIN_MODELES, NOM_MODELE_DEFAULT } from '../config.js';

/**
 * Récupère les informations du modèle Draw.io actuel
 * 
 * @returns {Object|null} Objet avec { nom, dateUpload, chemin } ou null si inexistant
 */
export function getModeleInfo() {
    const cheminModele = join(CHEMIN_MODELES, NOM_MODELE_DEFAULT);
    
    console.log(`🔍 [modeleInfo] Recherche du modèle à : ${cheminModele}`);
    console.log(`🔍 [modeleInfo] CHEMIN_MODELES : ${CHEMIN_MODELES}`);
    console.log(`🔍 [modeleInfo] Dossier modeles existe : ${existsSync(CHEMIN_MODELES)}`);
    
    if (!existsSync(cheminModele)) {
        console.error(`❌ [modeleInfo] Fichier modèle non trouvé : ${cheminModele}`);
        return null;
    }
    
    const stats = statSync(cheminModele);
    console.log(`✅ [modeleInfo] Modèle trouvé : ${cheminModele} (${stats.size} bytes)`);
    
    return {
        nom: NOM_MODELE_DEFAULT,
        dateUpload: stats.mtime.toISOString(), // Date de dernière modification
        chemin: cheminModele,
        taille: stats.size
    };
}

/**
 * Met à jour le modèle Draw.io
 * 
 * @param {string} cheminFichier - Chemin vers le nouveau fichier modèle
 * @returns {Object} Informations du modèle mis à jour
 */
export async function updateModele(cheminFichier) {
    const { writeFileSync, readFileSync } = await import('fs');
    const cheminModele = join(CHEMIN_MODELES, NOM_MODELE_DEFAULT);
    
    // Lire le nouveau fichier et l'écrire à la place de l'ancien
    const contenu = readFileSync(cheminFichier);
    writeFileSync(cheminModele, contenu);
    
    // Retourner les nouvelles informations
    return getModeleInfo();
}

