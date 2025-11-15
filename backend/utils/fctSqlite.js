// ============================================
// MODULE DE GESTION SQLITE
// ============================================
// Ce module gère toutes les interactions avec la base de données SQLite
// Équivalent du fichier fct_sqlite.py du projet Python

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { CHEMIN_BDD } from '../config.js';

/**
 * Récupère la liste de toutes les références de cartes disponibles
 * Les cartes sont triées par ordre_gui pour l'affichage dans l'interface
 * 
 * @returns {Array<string>} Liste des noms de cartes
 */
export function recupererListeRefCartes() {
    try {
        console.log('📦 [fctSqlite] Récupération de la liste des cartes...');
        const db = new Database(CHEMIN_BDD);
        
        // Exécuter la requête pour récupérer tous les noms de cartes
        const resultats = db.prepare('SELECT nom FROM materiel ORDER BY ordre_gui').all();
        
        db.close();
        
        const noms = resultats.map(ligne => ligne.nom);
        console.log(`✅ [fctSqlite] ${noms.length} cartes récupérées`);
        return noms;
        
    } catch (error) {
        console.error(`❌ [fctSqlite] Erreur SQLite lors de la récupération des cartes : ${error.message}`);
        console.error(error.stack);
        return [];
    }
}

/**
 * Récupère toutes les cartes avec leurs informations, groupées par marque et type
 * 
 * @returns {Array<Object>} Liste des cartes avec toutes leurs informations
 */
export function recupererToutesLesCartesAvecInfos() {
    try {
        console.log('📦 [fctSqlite] Récupération de toutes les cartes avec infos...');
        console.log(`📁 [fctSqlite] Chemin BDD : ${CHEMIN_BDD}`);
        
        // Vérifier que le fichier existe
        if (!existsSync(CHEMIN_BDD)) {
            throw new Error(`Le fichier de base de données n'existe pas : ${CHEMIN_BDD}`);
        }
        
        const db = new Database(CHEMIN_BDD);
        console.log('✅ [fctSqlite] Connexion à la BDD réussie');
        
        // Récupérer toutes les informations des cartes, triées par marque puis type
        const resultats = db.prepare(
            'SELECT nom, nom_complet, marque, type, nb_di, nb_do, nb_ai_t, nb_ao, ordre_gui FROM materiel ORDER BY marque, type, ordre_gui'
        ).all();
        
        db.close();
        
        console.log(`✅ [fctSqlite] ${resultats.length} cartes récupérées avec leurs informations`);
        return resultats;
        
    } catch (error) {
        console.error(`❌ [fctSqlite] Erreur lors de la récupération des cartes avec infos : ${error.message}`);
        console.error(`📚 [fctSqlite] Stack trace :`, error.stack);
        throw error; // Propager l'erreur pour qu'elle soit gérée par le serveur
    }
}

/**
 * Récupère les informations détaillées des cartes sélectionnées
 * 
 * @param {Array<string>} listeMesCartes - Liste des références de cartes
 * @returns {Array<Object>} Liste des objets cartes avec leurs propriétés
 */
export function recupererInfosCartes(listeMesCartes) {
    try {
        console.log(`📦 [fctSqlite] Récupération des infos pour ${listeMesCartes.length} cartes...`);
        console.log(`📋 [fctSqlite] Liste des cartes :`, listeMesCartes);
        
        const db = new Database(CHEMIN_BDD);
        
        const cartes = [];
        
        // Pour chaque carte, récupérer ses informations
        for (const carteRef of listeMesCartes) {
            // Préparer la requête avec un paramètre (protection contre les injections SQL)
            const resultat = db.prepare(
                'SELECT nom, nb_di, nb_do, nb_ai_t, nb_ao, type FROM materiel WHERE nom = ?'
            ).get(carteRef);
            
            if (resultat) {
                // Créer l'objet carte avec les informations récupérées
                const carte = {
                    nom: resultat.nom,
                    nb_di: resultat.nb_di,
                    nb_do: resultat.nb_do,
                    nb_ai_t: resultat.nb_ai_t,
                    nb_ao: resultat.nb_ao,
                    type: resultat.type
                };
                cartes.push(carte);
                console.log(`  ✓ [fctSqlite] Carte trouvée : ${carte.nom} (type: ${carte.type})`);
            } else {
                console.warn(`  ⚠️ [fctSqlite] Carte non trouvée : ${carteRef}`);
            }
        }
        
        db.close();
        
        console.log(`✅ [fctSqlite] ${cartes.length} cartes récupérées avec succès`);
        return cartes;
        
    } catch (error) {
        console.error(`❌ [fctSqlite] Erreur lors de la récupération des informations des cartes : ${error.message}`);
        console.error(error.stack);
        return [];
    }
}

/**
 * Récupère le code Base64 d'une carte (pour l'affichage sur le synoptique)
 * 
 * @param {string} nomCarte - Le nom de la carte
 * @returns {string} Le code Base64 de la carte
 */
export function recupererCodeBase64Carte(nomCarte) {
    try {
        const db = new Database(CHEMIN_BDD);
        
        // Exécuter la requête pour récupérer le code Base64
        const resultat = db.prepare(
            'SELECT code_base_64 FROM materiel WHERE nom = ?'
        ).get(nomCarte);
        
        db.close();
        
        // Retourner le code Base64 ou une chaîne vide si non trouvé
        return resultat ? resultat.code_base_64 : '';
        
    } catch (error) {
        console.error(`Erreur SQLite lors de la récupération du code Base64 : ${error.message}`);
        return '';
    }
}

