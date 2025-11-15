// ============================================
// MODULE DE GESTION XML POUR DRAW.IO (CORRIGÉ)
// ============================================
// Version corrigée utilisant xmldom pour une compatibilité exacte avec le code Python

import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CHEMIN_OUTPUT } from '../config.js';
import { recupererCodeBase64Carte } from './fctSqlite.js';

/**
 * Génère le schéma électrique en modifiant le modèle Draw.io
 * 
 * @param {string} cheminModeleDrawio - Chemin vers le fichier modèle Draw.io
 * @param {Array<Object>} listeCartesSorted - Liste des cartes triées avec points affectés
 * @param {Object} paramsProjet - Paramètres du projet (Auteur, Nom du site, etc.)
 * @returns {string} Chemin du fichier généré
 */
export function genererSchemaElec(cheminModeleDrawio, listeCartesSorted, paramsProjet) {
    try {
        // Lire le fichier XML modèle
        const contenuXml = readFileSync(cheminModeleDrawio, 'utf-8');
        
        // Parser le XML avec xmldom (équivalent à ET.parse en Python)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contenuXml, 'text/xml');
        const root = xmlDoc.documentElement; // Équivalent à tree.getroot()
        
        // Trouver les pages modèles
        const pagesModele = {};
        const diagrams = root.getElementsByTagName('diagram');
        
        for (let i = 0; i < diagrams.length; i++) {
            const diagram = diagrams[i];
            const name = diagram.getAttribute('name');
            if (name) {
                pagesModele[name] = diagram;
            }
        }
        
        console.log(`📚 [gestionXml] ${Object.keys(pagesModele).length} pages modèles trouvées`);
        
        // Dupliquer la page synoptique selon l'automate
        for (const carte of listeCartesSorted) {
            if (carte.type === 'automate') {
                const nomPageSynoptique = `synoptique_${carte.nom}`;
                if (pagesModele[nomPageSynoptique]) {
                    const originalPage = pagesModele[nomPageSynoptique];
                    const newPage = originalPage.cloneNode(true); // Deep copy
                    newPage.setAttribute('name', nomPageSynoptique);
                    newPage.setAttribute('id', `page_Synoptique_${carte.nom}_conserv`);
                    
                    // Positionner les cartes sur le synoptique
                    positionnerCarteSurSynoptique(newPage, listeCartesSorted);
                    
                    root.appendChild(newPage);
                    console.log(`📄 [gestionXml] Page synoptique créée : ${nomPageSynoptique}`);
                }
            }
        }
        
        // Dupliquer les pages modèles pour chaque carte et affecter les points
        let index = -1;
        for (const carte of listeCartesSorted) {
            index++;
            const carteNom = carte.nom;
            
            if (pagesModele[carteNom]) {
                const originalPage = pagesModele[carteNom];
                const newPage = originalPage.cloneNode(true); // Deep copy
                newPage.setAttribute('name', `${carteNom}_${index}`);
                newPage.setAttribute('id', `page_${carteNom}_${index}_conserv`);
                
                console.log(`🔧 [gestionXml] Modification des labels pour la carte ${carteNom} (index ${index})`);
                console.log(`  📊 [gestionXml] Points affectés à ${carteNom}:`, {
                    di: carte.affect_di ? carte.affect_di.length : 0,
                    ai: carte.affect_ai ? carte.affect_ai.length : 0,
                    do: carte.affect_do ? carte.affect_do.length : 0,
                    ao: carte.affect_ao ? carte.affect_ao.length : 0
                });
                
                // Remplacer les noms des points (équivalent Python)
                modifierLabels(carte, newPage);
                
                root.appendChild(newPage);
                console.log(`📄 [gestionXml] Page créée : ${carteNom}_${index}`);
            } else {
                console.warn(`⚠️ [gestionXml] Page modèle "${carteNom}" non trouvée`);
            }
        }
        
        // Effacer les pages non conservées
        effacerPagesNonConserv(root);
        
        // Modifier les paramètres des pages
        const diagramsFinaux = root.getElementsByTagName('diagram');
        for (let i = 0; i < diagramsFinaux.length; i++) {
            rechercherRemplacerParametres(diagramsFinaux[i], paramsProjet);
        }
        
        // Remplacer les textes d'entrée/sortie inutilisés
        remplacerTexteEntreeSortieInutilisee(root);
        
        // NOTE: L'indentation est gérée par le XMLSerializer
        // On peut appeler indenterXML si nécessaire, mais pour l'instant on le désactive
        // car cela peut causer des problèmes avec la structure DOM
        // indenterXML(root);
        
        // Sérialiser le XML
        const serializer = new XMLSerializer();
        let xmlFinal = serializer.serializeToString(xmlDoc);
        
        // Ajouter la déclaration XML si absente
        if (!xmlFinal.startsWith('<?xml')) {
            xmlFinal = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlFinal;
        }
        
        // Sauvegarder le fichier
        const outputFile = join(CHEMIN_OUTPUT, 'schema_elec_auto.drawio');
        writeFileSync(outputFile, xmlFinal, 'utf-8');
        
        console.log(`✅ Schéma généré avec succès : ${outputFile}`);
        return outputFile;
        
    } catch (error) {
        console.error(`❌ Erreur lors de la génération du schéma : ${error.message}`);
        console.error(error.stack);
        throw error;
    }
}

/**
 * Modifie les labels des points DI, AI, DO, AO dans une carte
 * Équivalent EXACT de modifier_labels() en Python
 * 
 * @param {Object} carte - Carte avec les listes de points affectés
 * @param {Element} page - Élément XML de la page (DOM Element)
 */
function modifierLabels(carte, page) {
    const typesPoints = ['di', 'ai', 'do', 'ao'];
    
    console.log(`🔧 [modifierLabels] Début pour la carte ${carte.nom}`);
    
    for (const tp of typesPoints) {
        const cleAffect = `affect_${tp}`;
        if (carte[cleAffect] && Array.isArray(carte[cleAffect])) {
            const points = carte[cleAffect];
            console.log(`  📝 [modifierLabels] Type ${tp.toUpperCase()} : ${points.length} points`);
            
            for (let i = 0; i < points.length; i++) {
                const nomPoint = points[i].nom_schema || `${points[i].NomEquipement} - ${points[i].NomPoint}`;
                const nomModele = `$${tp}${i + 1}$`;
                
                console.log(`    🔍 [modifierLabels] ${nomModele} → "${nomPoint}"`);
                
                let nbRemplacements = 0;
                
                // Remplacer dans les mxCell (équivalent: for mxcell in page.findall(".//mxCell"))
                const mxCells = page.getElementsByTagName('mxCell');
                for (let j = 0; j < mxCells.length; j++) {
                    const mxCell = mxCells[j];
                    const value = mxCell.getAttribute('value');
                    if (value === nomModele) {
                        mxCell.setAttribute('value', nomPoint);
                        nbRemplacements++;
                    }
                }
                
                // Remplacer dans les objects (équivalent: for obj in page.findall(".//object"))
                const objects = page.getElementsByTagName('object');
                for (let j = 0; j < objects.length; j++) {
                    const obj = objects[j];
                    const label = obj.getAttribute('label');
                    if (label === nomModele) {
                        obj.setAttribute('label', nomPoint);
                        nbRemplacements++;
                    }
                }
                
                if (nbRemplacements > 0) {
                    console.log(`    ✅ [modifierLabels] ${nbRemplacements} remplacement(s) effectué(s)`);
                } else {
                    console.warn(`    ⚠️ [modifierLabels] Aucun remplacement pour ${nomModele}`);
                }
            }
        }
    }
    
    console.log(`✅ [modifierLabels] Fin pour la carte ${carte.nom}`);
}

/**
 * Recherche et remplace les paramètres dans les éléments
 * Équivalent de rechercher_remplacer_parametres() en Python
 * 
 * @param {Element} page - Élément XML de la page
 * @param {Object} paramsProjet - Paramètres du projet
 */
function rechercherRemplacerParametres(page, paramsProjet) {
    const paramMapping = {
        'Auteur': 'Auteur',
        'Nom du site': 'Nom du site',
        'Nom armoire': 'Nom armoire',
        'Date dernière édition': '__/__/____',
        'Indice': 'A'
    };
    
    // Fonction récursive pour parcourir tous les éléments (équivalent de element.iter())
    function remplacerDansTousLesElements(element) {
        // Parcourir tous les attributs de l'élément
        const attributes = element.attributes;
        if (attributes) {
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                let valeur = attr.value;
                
                for (const [param, xmlParam] of Object.entries(paramMapping)) {
                    const paramKey = `$${xmlParam}$`;
                    if (valeur.includes(paramKey)) {
                        const nouvelleValeur = paramsProjet[param] || '';
                        valeur = valeur.replace(new RegExp(paramKey.replace(/\$/g, '\\$'), 'g'), nouvelleValeur);
                    }
                }
                
                if (valeur !== attr.value) {
                    attr.value = valeur;
                }
            }
        }
        
        // Parcourir récursivement les enfants
        const children = element.childNodes;
        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeType === 1) { // ELEMENT_NODE
                remplacerDansTousLesElements(children[i]);
            }
        }
    }
    
    remplacerDansTousLesElements(page);
}

/**
 * Efface toutes les pages dont l'ID ne se termine pas par "_conserv"
 * Équivalent de effacer_pages_non_conserv() en Python
 * 
 * @param {Element} root - Élément racine du fichier XML
 */
function effacerPagesNonConserv(root) {
    const diagrams = root.getElementsByTagName('diagram');
    const aSupprimer = [];
    
    // Collecter les pages à supprimer
    for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i];
        const pageId = diagram.getAttribute('id');
        if (pageId && !pageId.endsWith('_conserv')) {
            aSupprimer.push(diagram);
        }
    }
    
    // Supprimer les pages collectées
    for (const diagram of aSupprimer) {
        root.removeChild(diagram);
    }
    
    console.log(`🗑️ [gestionXml] ${aSupprimer.length} pages modèles supprimées`);
}

/**
 * Positionne les cartes sur le synoptique
 * Équivalent de positionner_carte_sur_synoptique() en Python
 * 
 * @param {Element} page - Élément XML de la page synoptique
 * @param {Array<Object>} listeCartesSorted - Liste des cartes triées
 */
function positionnerCarteSurSynoptique(page, listeCartesSorted) {
    const positionXCartes = [530, 592, 654, 715, 777, 839, 901, 962, 1024, 1086];
    const positionYCartes = 140;
    
    let indexCarte = 0;
    
    // Trouver l'élément <root> dans la page
    const roots = page.getElementsByTagName('root');
    if (roots.length === 0) {
        console.error('❌ Élément <root> introuvable dans la page synoptique');
        return;
    }
    const rootElement = roots[0];
    
    for (const carte of listeCartesSorted) {
        if (carte.type === 'carte') {
            const codeBase64 = recupererCodeBase64Carte(carte.nom);
            const codeBase64Nettoye = codeBase64.trim().replace(/\n/g, '').replace(/\r/g, '');
            
            if (!codeBase64Nettoye) {
                console.warn(`⚠️ Aucun code Base64 pour la carte ${carte.nom}`);
                continue;
            }
            
            const positionX = positionXCartes[indexCarte];
            const positionY = positionYCartes;
            indexCarte++;
            const idElement = `${carte.nom}${positionX}`;
            
            // Créer l'élément <object> (équivalent de lxmlET.Element)
            const doc = page.ownerDocument;
            const objectElement = doc.createElement('object');
            objectElement.setAttribute('label', '');
            objectElement.setAttribute('id', idElement);
            
            // Créer l'élément <mxCell>
            const mxCellElement = doc.createElement('mxCell');
            const styleValue = `shape=image;verticalLabelPosition=bottom;labelBackgroundColor=default;verticalAlign=top;aspect=fixed;imageAspect=0;image=data:image/svg+xml,${codeBase64Nettoye}`;
            mxCellElement.setAttribute('style', styleValue);
            mxCellElement.setAttribute('vertex', '1');
            mxCellElement.setAttribute('parent', '1');
            
            // Créer l'élément <mxGeometry>
            const mxGeometryElement = doc.createElement('mxGeometry');
            mxGeometryElement.setAttribute('x', positionX.toString());
            mxGeometryElement.setAttribute('y', positionY.toString());
            mxGeometryElement.setAttribute('width', '62.14');
            mxGeometryElement.setAttribute('height', '290');
            mxGeometryElement.setAttribute('as', 'geometry');
            
            // Assembler la structure
            mxCellElement.appendChild(mxGeometryElement);
            objectElement.appendChild(mxCellElement);
            rootElement.appendChild(objectElement);
            
            console.log(`📍 [gestionXml] Carte ${carte.nom} positionnée à (${positionX}, ${positionY})`);
        }
    }
}

/**
 * Indente les éléments XML pour un formatage correct
 * Équivalent de indent() en Python
 * 
 * @param {Element} elem - Élément XML à indenter
 * @param {number} level - Niveau d'indentation
 */
function indenterXML(elem, level = 0) {
    // Constante pour ELEMENT_NODE
    const ELEMENT_NODE = 1;
    const TEXT_NODE = 3;
    
    const i = '\n' + '  '.repeat(level);
    
    if (elem.childNodes && elem.childNodes.length > 0) {
        // Vérifier si l'élément a des enfants de type élément
        let hasElementChildren = false;
        for (let j = 0; j < elem.childNodes.length; j++) {
            if (elem.childNodes[j].nodeType === ELEMENT_NODE) {
                hasElementChildren = true;
                break;
            }
        }
        
        if (hasElementChildren) {
            // Si l'élément n'a pas de texte avant le premier enfant, en ajouter
            if (!elem.firstChild || elem.firstChild.nodeType !== TEXT_NODE || !elem.firstChild.nodeValue || !elem.firstChild.nodeValue.trim()) {
                const textNode = elem.ownerDocument.createTextNode(i + '  ');
                if (elem.firstChild) {
                    elem.insertBefore(textNode, elem.firstChild);
                } else {
                    elem.appendChild(textNode);
                }
            }
            
            // Indenter récursivement tous les enfants
            for (let j = 0; j < elem.childNodes.length; j++) {
                const child = elem.childNodes[j];
                if (child.nodeType === ELEMENT_NODE) {
                    indenterXML(child, level + 1);
                    
                    // Ajouter indentation après chaque enfant élément
                    if (child.nextSibling) {
                        if (child.nextSibling.nodeType !== TEXT_NODE) {
                            const textNode = elem.ownerDocument.createTextNode(i + '  ');
                            elem.insertBefore(textNode, child.nextSibling);
                        }
                    }
                }
            }
            
            // Ajouter indentation avant la balise fermante
            if (elem.lastChild && elem.lastChild.nodeType === ELEMENT_NODE) {
                const textNode = elem.ownerDocument.createTextNode(i);
                elem.appendChild(textNode);
            }
        }
    } else {
        // Si l'élément n'a pas d'enfants et qu'on n'est pas à la racine
        if (level > 0) {
            const textNode = elem.ownerDocument.createTextNode(i);
            if (elem.nextSibling) {
                elem.parentNode.insertBefore(textNode, elem.nextSibling);
            } else {
                elem.parentNode.appendChild(textNode);
            }
        }
    }
}

/**
 * Remplace toutes les valeurs des entrées/sorties inutilisées par 'Libre'
 * Équivalent de remplacer_texte_entree_sortie_inutilisee() en Python
 * 
 * @param {Element} root - Élément racine du document XML
 */
function remplacerTexteEntreeSortieInutilisee(root) {
    // Remplacer dans les mxCell
    const mxCells = root.getElementsByTagName('mxCell');
    for (let i = 0; i < mxCells.length; i++) {
        const mxCell = mxCells[i];
        const value = mxCell.getAttribute('value');
        if (value && value.startsWith('$') && value.endsWith('$')) {
            mxCell.setAttribute('value', 'Libre');
        }
    }
    
    // Remplacer dans les objects
    const objects = root.getElementsByTagName('object');
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        const label = obj.getAttribute('label');
        if (label && label.startsWith('$') && label.endsWith('$')) {
            obj.setAttribute('label', 'Libre');
        }
    }
    
    console.log('✅ [gestionXml] Textes inutilisés remplacés par "Libre"');
}