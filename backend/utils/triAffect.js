// ============================================
// MODULE DE TRI ET AFFECTATION DES POINTS
// ============================================
// Ce module gère l'ordonnancement des cartes et l'affectation des points
// Équivalent du fichier tri_affect.py du projet Python

/**
 * Ordonne les cartes selon un ordre spécifique :
 * Automate → AI → DI → DO → AO → ISMA
 * 
 * @param {Array<Object>} listeCarte - Liste des cartes à ordonner
 * @returns {Array<Object>} Liste des cartes ordonnées
 */
export function ordonnerLesCartes(listeCarte) {
    const listeCarteSorted = [];
    
    // 1. Placer l'automate en premier
    for (const carte of listeCarte) {
        if (carte.type === 'automate') {
            listeCarteSorted.push(carte);
            break;
        }
    }
    
    // 2. Ordre spécifique des cartes (selon le code Python)
    const ordreCartes = [
        's4th_8_ai_t',
        's4th_4_ai_t',
        's4th_8_ai_v',
        's4th_4_ai_v',
        's4th_8_ai_ma',
        's4th_4_ai_ma',
        's4th_16_di',
        's4th_8_di',
        's4th_8_do',
        's4th_4_do',
        's4th_8_ao',
        's4th_4_ao',
        'isma_mix38',
        'isma_mix18',
        'isma_8u',
        'isma_8i',
        'isma_4i4o',
        'isma_4o'
    ];
    
    // 3. Ajouter les cartes dans l'ordre spécifié
    for (const nomCarte of ordreCartes) {
        for (const carte of listeCarte) {
            if (carte.nom === nomCarte) {
                listeCarteSorted.push(carte);
            }
        }
    }
    
    return listeCarteSorted;
}

/**
 * Affecte les points aux cartes selon leurs capacités
 * 
 * @param {Array<Object>} listeCartesSorted - Liste des cartes triées
 * @param {Array<Object>} listePoints - Liste de tous les points à affecter
 * @returns {Array<Object>} Liste des cartes avec les points affectés
 */
export function affecterPoints(listeCartesSorted, listePoints) {
    // Créer une copie de la liste des points pour pouvoir la modifier
    const pointsRestants = [...listePoints];
    
    for (const carte of listeCartesSorted) {
        const nbDiCarte = parseInt(carte.nb_di) || 0;
        const nbAiCarte = parseInt(carte.nb_ai_t) || 0;
        const nbDoCarte = parseInt(carte.nb_do) || 0;
        const nbAoCarte = parseInt(carte.nb_ao) || 0;
        
        const affectDi = [];
        const affectAi = [];
        const affectDo = [];
        const affectAo = [];
        
        // Parcourir les points restants et les affecter selon le type
        let index = 0;
        while (index < pointsRestants.length) {
            const point = pointsRestants[index];
            const typePoint = point.TypePoint;
            
            // Affecter selon le type et la capacité disponible
            if (typePoint === 'DI' && affectDi.length < nbDiCarte) {
                affectDi.push(pointsRestants.splice(index, 1)[0]);
                // Ne pas incrémenter index car on a retiré un élément
            } else if (typePoint === 'AI' && affectAi.length < nbAiCarte) {
                affectAi.push(pointsRestants.splice(index, 1)[0]);
            } else if (typePoint === 'DO' && affectDo.length < nbDoCarte) {
                affectDo.push(pointsRestants.splice(index, 1)[0]);
            } else if (typePoint === 'AO' && affectAo.length < nbAoCarte) {
                affectAo.push(pointsRestants.splice(index, 1)[0]);
            } else {
                // Point non affectable à cette carte, passer au suivant
                index++;
            }
        }
        
        // Ajouter les listes d'affectation à la carte
        if (nbDiCarte > 0) {
            carte.affect_di = affectDi;
        }
        if (nbAiCarte > 0) {
            carte.affect_ai = affectAi;
        }
        if (nbDoCarte > 0) {
            carte.affect_do = affectDo;
        }
        if (nbAoCarte > 0) {
            carte.affect_ao = affectAo;
        }
    }
    
    return listeCartesSorted;
}

/**
 * Vérifie que le nombre total de points ne dépasse pas le nombre de points disponibles
 * 
 * @param {Array<Object>} listeDi - Liste des points DI
 * @param {Array<Object>} listeAi - Liste des points AI
 * @param {Array<Object>} listeDo - Liste des points DO
 * @param {Array<Object>} listeAo - Liste des points AO
 * @param {Array<Object>} listeCartesSorted - Liste des cartes triées
 * @throws {Error} Si le nombre de points dépasse la capacité disponible
 */
export function verifierPointsDisponibles(listeDi, listeAi, listeDo, listeAo, listeCartesSorted) {
    const nbDiTotal = listeDi.length;
    const nbAiTotal = listeAi.length;
    const nbDoTotal = listeDo.length;
    const nbAoTotal = listeAo.length;
    
    console.log(`Nombre de points DI : ${nbDiTotal} Nombre de points AI : ${nbAiTotal} ` +
                `Nombre de points DO : ${nbDoTotal} Nombre de points AO : ${nbAoTotal}`);
    
    // Calculer le nombre de points disponibles
    const typesPoints = ['di', 'ai_t', 'do', 'ao'];
    const nbPointsDisp = { di: 0, ai_t: 0, do: 0, ao: 0 };
    const nbTotals = {
        di: nbDiTotal,
        ai_t: nbAiTotal,
        do: nbDoTotal,
        ao: nbAoTotal
    };
    
    // Somme des capacités de toutes les cartes
    for (const carte of listeCartesSorted) {
        for (const tp of typesPoints) {
            nbPointsDisp[tp] += parseInt(carte[`nb_${tp}`]) || 0;
        }
    }
    
    console.log(`Nombre de points DI disponibles : ${nbPointsDisp.di} ` +
                `Nombre de points AI disponibles : ${nbPointsDisp.ai_t} ` +
                `Nombre de points DO disponibles : ${nbPointsDisp.do} ` +
                `Nombre de points AO disponibles : ${nbPointsDisp.ao}`);
    
    // Vérifier que le nombre total ne dépasse pas la capacité
    for (const tp of typesPoints) {
        if (nbTotals[tp] > nbPointsDisp[tp]) {
            const erreur = `ERREUR : Le nombre de points ${tp.toUpperCase()} total (${nbTotals[tp]}) ` +
                          `dépasse le nombre de points ${tp.toUpperCase()} disponibles (${nbPointsDisp[tp]})`;
            console.error(`-->${erreur}<--`);
            throw new Error(erreur);
        }
    }
}

