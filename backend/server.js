// ============================================
// SERVEUR EXPRESS - POINT D'ENTRÉE DU BACKEND
// ============================================
// Ce fichier démarre le serveur Node.js qui va :
// - Recevoir les requêtes HTTP du frontend
// - Gérer l'upload de fichiers JSON
// - Interroger la base SQLite
// - Générer les fichiers .drawio

import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Import des modules utilitaires
import { recupererListeRefCartes, recupererInfosCartes, recupererToutesLesCartesAvecInfos } from './utils/fctSqlite.js';
import { filtrerPointsParTypeDepuisObjet } from './utils/decodeJson.js';
import { ordonnerLesCartes, affecterPoints, verifierPointsDisponibles } from './utils/triAffect.js';
import { genererSchemaElec } from './utils/gestionXml.js';
import { getModeleInfo, updateModele } from './utils/modeleInfo.js';
import { CHEMIN_MODELE_DRAWIO, CHEMIN_BDD } from './config.js';

const app = express();
const PORT = 3000; // Port sur lequel le serveur écoute

// ============================================
// MIDDLEWARES
// ============================================

// CORS : Permet au frontend (qui tourne sur un autre port) de communiquer avec le backend
app.use(cors());

// Permet de parser les données JSON envoyées dans le body des requêtes POST
app.use(express.json());

// Permet de parser les données de formulaire
app.use(express.urlencoded({ extended: true }));

// Configuration de l'upload de fichiers
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50 Mo (pour les fichiers Draw.io)
    abortOnLimit: true
}));

// ============================================
// ROUTES
// ============================================

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend HTTP Tools - Serveur actif',
        endpoints: [
            'GET /cartes - Liste des cartes disponibles',
            'GET /modele-info - Informations du modèle Draw.io actuel',
            'POST /upload-modele - Mettre à jour le modèle Draw.io',
            'POST /generate - Génère un fichier .drawio'
        ]
    });
});

// GET /cartes - Liste des cartes disponibles, groupées par marque et type
app.get('/cartes', (req, res) => {
    try {
        console.log('📡 [SERVER] GET /cartes - Début de la récupération des cartes');
        
        const toutesLesCartes = recupererToutesLesCartesAvecInfos();
        
        // Grouper par marque puis par type
        const cartesGroupées = {};
        
        for (const carte of toutesLesCartes) {
            const marque = carte.marque || 'Autre';
            const type = carte.type || 'autre';
            
            if (!cartesGroupées[marque]) {
                cartesGroupées[marque] = {};
            }
            
            if (!cartesGroupées[marque][type]) {
                cartesGroupées[marque][type] = [];
            }
            
            cartesGroupées[marque][type].push({
                ref: carte.nom,
                nom: carte.nom,
                nom_complet: carte.nom_complet,
                marque: carte.marque,
                type: carte.type,
                nb_di: carte.nb_di,
                nb_do: carte.nb_do,
                nb_ai: carte.nb_ai_t,
                nb_ao: carte.nb_ao,
                ordre_gui: carte.ordre_gui
            });
        }
        
        // Trier les marques : Sofrel en premier, puis les autres par ordre alphabétique
        const marquesTriees = Object.keys(cartesGroupées).sort((a, b) => {
            if (a.toLowerCase() === 'sofrel') return -1;
            if (b.toLowerCase() === 'sofrel') return 1;
            return a.localeCompare(b);
        });
        
        // Créer un nouvel objet avec les marques triées
        const cartesGroupéesTriees = {};
        for (const marque of marquesTriees) {
            cartesGroupéesTriees[marque] = cartesGroupées[marque];
        }
        
        console.log(`✅ [SERVER] GET /cartes - ${toutesLesCartes.length} cartes groupées par ${marquesTriees.length} marques (Sofrel en premier)`);
        res.json(cartesGroupéesTriees);
        
    } catch (error) {
        console.error('❌ [SERVER] GET /cartes - Erreur :', error);
        console.error('📚 [SERVER] GET /cartes - Stack trace :', error.stack);
        res.status(500).json({ 
            erreur: 'Erreur lors de la récupération des cartes',
            details: error.message,
            chemin: CHEMIN_BDD || 'non défini'
        });
    }
});

// GET /modele-info - Informations du modèle Draw.io actuel
app.get('/modele-info', (req, res) => {
    try {
        const info = getModeleInfo();
        
        if (!info) {
            return res.status(404).json({ erreur: 'Modèle Draw.io non trouvé' });
        }
        
        res.json({
            nom: info.nom,
            dateUpload: info.dateUpload,
            taille: info.taille
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des infos du modèle :', error);
        res.status(500).json({ erreur: 'Erreur lors de la récupération des infos du modèle' });
    }
});

// GET /database/download - Télécharger la base de données
app.get('/database/download', (req, res) => {
    try {
        console.log('📥 [SERVER] GET /database/download - Téléchargement de la base de données');
        
        if (!existsSync(CHEMIN_BDD)) {
            return res.status(404).json({ erreur: 'Base de données non trouvée' });
        }
        
        const contenuBdd = readFileSync(CHEMIN_BDD);
        
        res.setHeader('Content-Type', 'application/x-sqlite3');
        res.setHeader('Content-Disposition', 'attachment; filename="database.sqlite3"');
        res.send(contenuBdd);
        
        console.log('✅ [SERVER] GET /database/download - Base de données téléchargée');
    } catch (error) {
        console.error('❌ [SERVER] GET /database/download - Erreur :', error);
        res.status(500).json({ erreur: 'Erreur lors du téléchargement de la base de données' });
    }
});

// POST /database/upload - Mettre à jour la base de données
app.post('/database/upload', (req, res) => {
    try {
        console.log('📤 [SERVER] POST /database/upload - Upload de la base de données');
        
        if (!req.files || !req.files.database) {
            return res.status(400).json({ erreur: 'Aucun fichier base de données fourni' });
        }
        
        const fichierBdd = req.files.database;
        
        // Vérifier que c'est bien un fichier .sqlite3
        if (!fichierBdd.name.endsWith('.sqlite3')) {
            return res.status(400).json({ erreur: 'Le fichier doit être un fichier .sqlite3' });
        }
        
        // Sauvegarder la base de données
        writeFileSync(CHEMIN_BDD, fichierBdd.data);
        
        console.log('✅ [SERVER] POST /database/upload - Base de données mise à jour');
        
        res.json({
            message: 'Base de données mise à jour avec succès',
            taille: fichierBdd.size
        });
    } catch (error) {
        console.error('❌ [SERVER] POST /database/upload - Erreur :', error);
        res.status(500).json({ erreur: 'Erreur lors de la mise à jour de la base de données' });
    }
});

// POST /upload-modele - Mettre à jour le modèle Draw.io
app.post('/upload-modele', async (req, res) => {
    try {
        if (!req.files || !req.files.modele) {
            return res.status(400).json({ erreur: 'Aucun fichier modèle fourni' });
        }
        
        const fichierModele = req.files.modele;
        
        // Vérifier que c'est bien un fichier .drawio
        if (!fichierModele.name.endsWith('.drawio')) {
            return res.status(400).json({ erreur: 'Le fichier doit être un fichier .drawio' });
        }
        
        // Sauvegarder temporairement le fichier
        const cheminTemp = join(tmpdir(), `modele_${Date.now()}.drawio`);
        writeFileSync(cheminTemp, fichierModele.data);
        
        // Mettre à jour le modèle
        const info = await updateModele(cheminTemp);
        
        // Supprimer le fichier temporaire
        unlinkSync(cheminTemp);
        
        res.json({
            message: 'Modèle mis à jour avec succès',
            nom: info.nom,
            dateUpload: info.dateUpload
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du modèle :', error);
        res.status(500).json({ erreur: 'Erreur lors de la mise à jour du modèle' });
    }
});

// POST /generate - Générer le schéma électrique
app.post('/generate', async (req, res) => {
    try {
        console.log('📡 [SERVER] POST /generate - Début de la génération du schéma');
        
        // Vérifier que le fichier JSON est présent
        if (!req.files || !req.files.fichierJson) {
            console.error('❌ [SERVER] POST /generate - Fichier JSON manquant');
            return res.status(400).json({ erreur: 'Fichier JSON manquant' });
        }
        
        const fichierJson = req.files.fichierJson;
        console.log(`📄 [SERVER] POST /generate - Fichier JSON reçu : ${fichierJson.name} (${fichierJson.size} bytes)`);
        
        // Parser le JSON
        // Le fichier peut contenir un BOM UTF-8 (Byte Order Mark) au début
        // On le supprime en utilisant replace() pour nettoyer le contenu
        let donneesJson;
        try {
            let contenuJson = fichierJson.data.toString('utf-8');
            
            // Supprimer le BOM UTF-8 s'il est présent (caractère invisible ﻿)
            // Le BOM est représenté par les bytes EF BB BF en UTF-8
            contenuJson = contenuJson.replace(/^\uFEFF/, '');
            
            // Nettoyer aussi les espaces en début/fin
            contenuJson = contenuJson.trim();
            
            console.log(`📄 [SERVER] POST /generate - Taille du JSON : ${contenuJson.length} caractères`);
            donneesJson = JSON.parse(contenuJson);
            
            // Vérifier que c'est bien un tableau
            if (!Array.isArray(donneesJson)) {
                throw new Error('Le fichier JSON doit contenir un tableau de points');
            }
            
            console.log(`✅ [SERVER] POST /generate - JSON parsé : ${donneesJson.length} points trouvés`);
        } catch (error) {
            console.error('❌ [SERVER] POST /generate - Erreur parsing JSON :', error.message);
            console.error('📚 [SERVER] POST /generate - Stack trace :', error.stack);
            
            // Nettoyer le message d'erreur (peut contenir le BOM)
            let messageErreur = error.message;
            if (messageErreur.includes('Unexpected token')) {
                messageErreur = 'Le fichier JSON contient des caractères invalides (BOM UTF-8 détecté). Le fichier sera automatiquement nettoyé.';
            }
            
            return res.status(400).json({ 
                erreur: 'Fichier JSON invalide',
                details: messageErreur 
            });
        }
        
        // Récupérer les paramètres
        let refs, params;
        try {
            refs = JSON.parse(req.body.refs || '[]');
            params = JSON.parse(req.body.params || '{}');
            console.log(`📋 [SERVER] POST /generate - ${refs.length} cartes sélectionnées`);
            console.log(`⚙️ [SERVER] POST /generate - Paramètres :`, params);
        } catch (error) {
            console.error('❌ [SERVER] POST /generate - Erreur parsing refs/params :', error.message);
            return res.status(400).json({ 
                erreur: 'Erreur dans les paramètres',
                details: error.message 
            });
        }
        
        // Filtrer les points par type
        console.log('🔍 [SERVER] POST /generate - Filtrage des points par type...');
        const listeDi = filtrerPointsParTypeDepuisObjet('DI', donneesJson);
        const listeDo = filtrerPointsParTypeDepuisObjet('DO', donneesJson);
        const listeAo = filtrerPointsParTypeDepuisObjet('AO', donneesJson);
        const listeAi = filtrerPointsParTypeDepuisObjet('AI', donneesJson);
        const listeCom = filtrerPointsParTypeDepuisObjet('COM : Modbus RS485', donneesJson);
        console.log(`📊 [SERVER] POST /generate - Points filtrés : DI=${listeDi.length}, DO=${listeDo.length}, AI=${listeAi.length}, AO=${listeAo.length}, COM=${listeCom.length}`);
        
        // Récupérer les informations des cartes
        console.log('📦 [SERVER] POST /generate - Récupération des infos des cartes...');
        const listeInfosCartes = recupererInfosCartes(refs);
        
        if (listeInfosCartes.length === 0) {
            console.error('❌ [SERVER] POST /generate - Aucune carte trouvée');
            return res.status(400).json({ 
                erreur: 'Aucune carte valide trouvée',
                details: 'Vérifiez que les références de cartes sont correctes' 
            });
        }
        
        // Ordonner les cartes
        console.log('🔄 [SERVER] POST /generate - Ordonnancement des cartes...');
        const listeCartesSorted = ordonnerLesCartes(listeInfosCartes);
        console.log(`✅ [SERVER] POST /generate - ${listeCartesSorted.length} cartes ordonnées`);
        
        // Vérifier que le nombre de points ne dépasse pas la capacité
        console.log('✔️ [SERVER] POST /generate - Vérification des capacités...');
        verifierPointsDisponibles(listeDi, listeAi, listeDo, listeAo, listeCartesSorted);
        console.log('✅ [SERVER] POST /generate - Capacités vérifiées');
        
        // Combiner les listes de points
        const listePoints = [...listeDi, ...listeAi, ...listeDo, ...listeAo];
        console.log(`📌 [SERVER] POST /generate - ${listePoints.length} points à affecter`);
        
        // Affecter les points aux cartes
        console.log('🎯 [SERVER] POST /generate - Affectation des points aux cartes...');
        const cartesAvecPoints = affecterPoints(listeCartesSorted, listePoints);
        console.log('✅ [SERVER] POST /generate - Points affectés');
        
        // Afficher l'affectation détaillée des points (comme liste_cartes_sorted en Python)
        console.log('\n📋 [SERVER] POST /generate - AFFECTATION DES POINTS PAR CARTE :');
        for (const carte of cartesAvecPoints) {
            console.log(`\n  📦 Carte : ${carte.nom} (${carte.type})`);
            if (carte.affect_di && carte.affect_di.length > 0) {
                console.log(`    DI (${carte.affect_di.length}/${carte.nb_di || 0}) :`);
                carte.affect_di.forEach((point, idx) => {
                    console.log(`      [${idx + 1}] ${point.nom_schema || `${point.NomEquipement} - ${point.NomPoint}`}`);
                });
            }
            if (carte.affect_ai && carte.affect_ai.length > 0) {
                console.log(`    AI (${carte.affect_ai.length}/${carte.nb_ai_t || 0}) :`);
                carte.affect_ai.forEach((point, idx) => {
                    console.log(`      [${idx + 1}] ${point.nom_schema || `${point.NomEquipement} - ${point.NomPoint}`}`);
                });
            }
            if (carte.affect_do && carte.affect_do.length > 0) {
                console.log(`    DO (${carte.affect_do.length}/${carte.nb_do || 0}) :`);
                carte.affect_do.forEach((point, idx) => {
                    console.log(`      [${idx + 1}] ${point.nom_schema || `${point.NomEquipement} - ${point.NomPoint}`}`);
                });
            }
            if (carte.affect_ao && carte.affect_ao.length > 0) {
                console.log(`    AO (${carte.affect_ao.length}/${carte.nb_ao || 0}) :`);
                carte.affect_ao.forEach((point, idx) => {
                    console.log(`      [${idx + 1}] ${point.nom_schema || `${point.NomEquipement} - ${point.NomPoint}`}`);
                });
            }
        }
        console.log('\n');
        
        // Préparer les paramètres du projet (format attendu par gestion_xml)
        const paramsProjet = {
            'Auteur': params.auteur || params['Auteur'] || '',
            'Nom du site': params.nomSite || params['Nom du site'] || params.nomProjet || '',
            'Nom armoire': params.nomArmoire || params['Nom armoire'] || '',
            'Date dernière édition': params.dateEdition || params['Date dernière édition'] || new Date().toLocaleDateString('fr-FR'),
            'Indice': params.indice || params['Indice'] || 'A'
        };
        console.log('⚙️ [SERVER] POST /generate - Paramètres projet :', paramsProjet);
        
        // Générer le schéma
        console.log('🎨 [SERVER] POST /generate - Génération du schéma XML...');
        const cheminFichierGenere = genererSchemaElec(CHEMIN_MODELE_DRAWIO, cartesAvecPoints, paramsProjet);
        console.log(`✅ [SERVER] POST /generate - Schéma généré : ${cheminFichierGenere}`);
        
        // Lire le fichier généré et l'envoyer
        const contenuFichier = readFileSync(cheminFichierGenere);
        console.log(`📤 [SERVER] POST /generate - Envoi du fichier (${contenuFichier.length} bytes)`);
        
        // Définir les headers pour le téléchargement
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="schema_elec_auto.drawio"`);
        
        // Envoyer le fichier
        res.send(contenuFichier);
        console.log('✅ [SERVER] POST /generate - Génération terminée avec succès');
        
    } catch (error) {
        console.error('❌ [SERVER] POST /generate - Erreur :', error);
        console.error('📚 [SERVER] POST /generate - Stack trace :', error.stack);
        console.error('📋 [SERVER] POST /generate - Détails de l\'erreur :', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        // Construire un message d'erreur détaillé
        let messageDetaille = error.message;
        
        // Ajouter des informations contextuelles selon le type d'erreur
        if (error.message.includes('points') && error.message.includes('dépasse')) {
            messageDetaille = `Capacité insuffisante : ${error.message}`;
        } else if (error.message.includes('JSON')) {
            messageDetaille = `Erreur de format JSON : ${error.message}`;
        } else if (error.message.includes('SQLite')) {
            messageDetaille = `Erreur base de données : ${error.message}`;
        } else if (error.message.includes('XML') || error.message.includes('drawio')) {
            messageDetaille = `Erreur lors de la génération XML : ${error.message}`;
        }
        
        res.status(500).json({ 
            erreur: 'Erreur lors de la génération du schéma',
            details: messageDetaille,
            type: error.name || 'Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
    console.log(`📡 Prêt à recevoir les requêtes du frontend`);
});
