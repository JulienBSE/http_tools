// ============================================
// PAGE ALIBALEK - GÉNÉRATEUR DE SCHÉMAS
// ============================================
// Cette page contient l'interface pour le générateur de schémas électriques
// Elle sera composée de plusieurs sections :
// 1. Upload du fichier JSON
// 2. Sélection des cartes
// 3. Paramètres du projet
// 4. Bouton de génération

import { useState, useEffect } from 'react';
import './Alibalek.css';

/**
 * Alibalek - Composant principal de l'outil Alibalek
 * 
 * Ce composant utilise plusieurs useState pour gérer différents états :
 * - Le fichier JSON uploadé
 * - Les cartes sélectionnées
 * - Les paramètres du projet
 * - L'état de chargement lors de la génération
 */
function Alibalek() {
  // État pour stocker le fichier JSON sélectionné
  // null signifie qu'aucun fichier n'a été sélectionné
  const [fichierJson, setFichierJson] = useState(null);

  // État pour stocker les cartes disponibles (groupées par marque et type)
  // Structure : { marque1: { type1: [cartes], type2: [cartes] }, marque2: {...} }
  const [cartesDisponibles, setCartesDisponibles] = useState({});

  // État pour stocker les quantités de cartes sélectionnées
  // Structure : { 'nom_carte': quantité }
  const [quantitesCartes, setQuantitesCartes] = useState({});

  // État pour gérer les marques dépliées/repliées
  // Structure : { 'marque': true/false } - true = dépliée, false = repliée
  // Par défaut, toutes les marques sont repliées (false)
  const [marquesDepliees, setMarquesDepliees] = useState({});

  // État pour les paramètres du projet
  // On utilise un objet pour regrouper plusieurs valeurs liées
  const [parametresProjet, setParametresProjet] = useState({
    auteur: '',
    nomSite: '',
    nomArmoire: '',
    dateEdition: new Date().toLocaleDateString('fr-FR'),
    indice: 'A'
  });

  // État pour les informations du modèle Draw.io
  const [modeleInfo, setModeleInfo] = useState(null);

  // État pour gérer le chargement (pendant la génération)
  // true = génération en cours, false = prêt
  const [enChargement, setEnChargement] = useState(false);

  // État pour le chargement des infos du modèle
  const [chargementModele, setChargementModele] = useState(false);

  /**
   * useEffect : Hook React qui s'exécute après le premier rendu du composant
   * Ici, on charge les informations du modèle Draw.io et les cartes au montage du composant
   * Le tableau vide [] signifie que l'effet ne s'exécute qu'une seule fois
   */
  useEffect(() => {
    chargerInfosModele();
    chargerCartes(); // Charger les cartes automatiquement au montage
  }, []); // Le tableau vide signifie : exécuter une seule fois au montage

  /**
   * Charge les informations du modèle Draw.io depuis le backend
   */
  const chargerInfosModele = async () => {
    try {
      const reponse = await fetch('/api/modele-info');
      if (reponse.ok) {
        const donnees = await reponse.json();
        setModeleInfo(donnees);
      }
    } catch (erreur) {
      console.error('Erreur lors du chargement des infos du modèle :', erreur);
    }
  };

  /**
   * Gère l'upload d'un nouveau modèle Draw.io
   */
  const gererUploadModele = async (event) => {
    const fichier = event.target.files[0];
    
    if (!fichier) {
      return;
    }

    if (!fichier.name.endsWith('.drawio')) {
      alert('Veuillez sélectionner un fichier .drawio');
      event.target.value = '';
      return;
    }

    setChargementModele(true);

    try {
      const formData = new FormData();
      formData.append('modele', fichier);

      const reponse = await fetch('/api/upload-modele', {
        method: 'POST',
        body: formData
      });

      if (!reponse.ok) {
        throw new Error('Erreur lors de la mise à jour du modèle');
      }

      const donnees = await reponse.json();
      setModeleInfo({
        nom: donnees.nom,
        dateUpload: donnees.dateUpload
      });

      alert('Modèle mis à jour avec succès !');
    } catch (erreur) {
      console.error('Erreur:', erreur);
      alert('Erreur lors de la mise à jour du modèle');
    } finally {
      setChargementModele(false);
      event.target.value = ''; // Réinitialiser l'input
    }
  };

  /**
   * Formate une date ISO en format français lisible
   */
  const formaterDate = (dateISO) => {
    if (!dateISO) return 'Non disponible';
    const date = new Date(dateISO);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Gestionnaire pour l'upload de fichier
   * Cette fonction est appelée quand l'utilisateur sélectionne un fichier
   * 
   * @param {Event} event - L'événement du changement de fichier
   */
  const gererUploadFichier = (event) => {
    // event.target.files est un FileList (liste de fichiers)
    // On prend le premier fichier (index 0)
    const fichier = event.target.files[0];

    if (fichier) {
      // Vérification que c'est bien un fichier JSON
      if (fichier.type === 'application/json' || fichier.name.endsWith('.json')) {
        // On met à jour l'état avec le fichier sélectionné
        // React va re-render le composant avec cette nouvelle valeur
        setFichierJson(fichier);
        console.log('Fichier sélectionné:', fichier.name);
      } else {
        alert('Veuillez sélectionner un fichier JSON');
        // On remet l'input à vide
        event.target.value = '';
      }
    }
  };

  /**
   * Fonction pour charger les cartes depuis le backend
   * Cette fonction fait un appel HTTP GET au backend
   */
  const chargerCartes = async () => {
    try {
      console.log('📡 [Frontend] Chargement des cartes...');
      const reponse = await fetch('/api/cartes');
      
      if (!reponse.ok) {
        const erreurData = await reponse.json().catch(() => ({}));
        throw new Error(erreurData.details || `Erreur HTTP ${reponse.status}`);
      }

      const donnees = await reponse.json();
      console.log('✅ [Frontend] Cartes chargées :', donnees);
      setCartesDisponibles(donnees);
    } catch (erreur) {
      console.error('❌ [Frontend] Erreur lors du chargement des cartes :', erreur);
      alert(`Erreur lors du chargement des cartes : ${erreur.message}`);
    }
  };

  /**
   * Met à jour la quantité d'une carte sélectionnée
   * 
   * @param {string} refCarte - Référence de la carte
   * @param {number} quantite - Nouvelle quantité (0 pour désélectionner)
   */
  const mettreAJourQuantite = (refCarte, quantite) => {
    console.log(`📝 [Frontend] Mise à jour quantité : ${refCarte} = ${quantite}`);
    
    // Trouver la carte pour vérifier son type
    let typeCarte = null;
    for (const marque in cartesDisponibles) {
      for (const type in cartesDisponibles[marque]) {
        const carte = cartesDisponibles[marque][type].find(c => c.ref === refCarte);
        if (carte) {
          typeCarte = carte.type;
          break;
        }
      }
      if (typeCarte) break;
    }

    // Si c'est un automate, limiter à 1
    if (typeCarte === 'automate' && quantite > 1) {
      alert('Un seul automate peut être sélectionné');
      quantite = 1;
    }

    // Mettre à jour l'état
    setQuantitesCartes(prev => {
      const nouveau = { ...prev };
      if (quantite === 0) {
        delete nouveau[refCarte];
      } else {
        nouveau[refCarte] = quantite;
      }
      console.log('📊 [Frontend] Quantités mises à jour :', nouveau);
      return nouveau;
    });
  };

  /**
   * Convertit les quantités en liste de références (pour l'envoi au backend)
   * Ex: { 'carte1': 2, 'carte2': 1 } => ['carte1', 'carte1', 'carte2']
   */
  const obtenirListeRefs = () => {
    const refs = [];
    for (const [ref, quantite] of Object.entries(quantitesCartes)) {
      for (let i = 0; i < quantite; i++) {
        refs.push(ref);
      }
    }
    return refs;
  };

  /**
   * Calcule les statistiques de points disponibles et utilisés
   * Retourne un objet avec les totaux par type de point
   */
  const calculerStatistiquesPoints = () => {
    const stats = {
      di: { disponible: 0, utilise: 0, restant: 0 },
      do: { disponible: 0, utilise: 0, restant: 0 },
      ai: { disponible: 0, utilise: 0, restant: 0 },
      ao: { disponible: 0, utilise: 0, restant: 0 }
    };

    // Calculer les points disponibles selon les cartes sélectionnées
    for (const [ref, quantite] of Object.entries(quantitesCartes)) {
      // Trouver la carte dans les cartes disponibles
      for (const marque in cartesDisponibles) {
        for (const type in cartesDisponibles[marque]) {
          const carte = cartesDisponibles[marque][type].find(c => c.ref === ref);
          if (carte) {
            stats.di.disponible += (carte.nb_di || 0) * quantite;
            stats.do.disponible += (carte.nb_do || 0) * quantite;
            stats.ai.disponible += (carte.nb_ai || 0) * quantite;
            stats.ao.disponible += (carte.nb_ao || 0) * quantite;
            break;
          }
        }
      }
    }

    // Calculer les points utilisés depuis le fichier JSON
    if (fichierJson) {
      try {
        const reader = new FileReader();
        // On va lire le fichier de manière synchrone via une Promise
        return new Promise((resolve) => {
          reader.onload = (e) => {
            try {
              let contenu = e.target.result;
              // Supprimer le BOM UTF-8
              contenu = contenu.replace(/^\uFEFF/, '').trim();
              const donnees = JSON.parse(contenu);
              
              if (Array.isArray(donnees)) {
                stats.di.utilise = donnees.filter(p => p.TypePoint === 'DI').length;
                stats.do.utilise = donnees.filter(p => p.TypePoint === 'DO').length;
                stats.ai.utilise = donnees.filter(p => p.TypePoint === 'AI').length;
                stats.ao.utilise = donnees.filter(p => p.TypePoint === 'AO').length;
              }
              
              // Calculer les points restants
              stats.di.restant = stats.di.disponible - stats.di.utilise;
              stats.do.restant = stats.do.disponible - stats.do.utilise;
              stats.ai.restant = stats.ai.disponible - stats.ai.utilise;
              stats.ao.restant = stats.ao.disponible - stats.ao.utilise;
              
              resolve(stats);
            } catch (err) {
              console.error('Erreur lors du calcul des stats :', err);
              resolve(stats);
            }
          };
          reader.readAsText(fichierJson);
        });
      } catch (err) {
        console.error('Erreur lors de la lecture du fichier pour les stats :', err);
        return Promise.resolve(stats);
      }
    }

    return Promise.resolve(stats);
  };

  /**
   * État pour stocker les statistiques de points
   */
  const [statistiquesPoints, setStatistiquesPoints] = useState({
    di: { disponible: 0, utilise: 0, restant: 0 },
    do: { disponible: 0, utilise: 0, restant: 0 },
    ai: { disponible: 0, utilise: 0, restant: 0 },
    ao: { disponible: 0, utilise: 0, restant: 0 }
  });

  /**
   * Met à jour les statistiques quand le fichier JSON ou les cartes changent
   * useEffect avec dépendances : se déclenche quand fichierJson, quantitesCartes ou cartesDisponibles changent
   */
  useEffect(() => {
    // Calculer les statistiques de manière asynchrone
    calculerStatistiquesPoints().then(stats => {
      setStatistiquesPoints(stats);
      console.log('📊 [Frontend] Statistiques mises à jour :', stats);
    }).catch(err => {
      console.error('❌ [Frontend] Erreur lors du calcul des statistiques :', err);
    });
  }, [fichierJson, quantitesCartes, cartesDisponibles]);

  /**
   * Bascule l'état déplié/replié d'une marque
   */
  const basculerMarque = (marque) => {
    setMarquesDepliees(prev => ({
      ...prev,
      [marque]: !prev[marque]
    }));
  };

  /**
   * Fonction pour générer le schéma
   * Cette fonction envoie les données au backend et récupère le fichier .drawio
   */
  const genererSchema = async () => {
    // Validation : on vérifie que tout est rempli
    if (!fichierJson) {
      alert('Veuillez sélectionner un fichier JSON');
      return;
    }

    const refs = obtenirListeRefs();
    if (refs.length === 0) {
      alert('Veuillez sélectionner au moins une carte');
      return;
    }
    console.log('📋 [Frontend] Cartes sélectionnées :', refs);

    // On active le mode chargement
    setEnChargement(true);

    try {
      // FormData permet d'envoyer des fichiers via HTTP
      // C'est nécessaire pour l'upload de fichiers
      const formData = new FormData();
      
      // On ajoute le fichier JSON
      formData.append('fichierJson', fichierJson);
      
      // On ajoute les cartes sélectionnées (on les convertit en JSON)
      formData.append('refs', JSON.stringify(refs));
      
      // On ajoute les paramètres du projet (format attendu par le backend)
      formData.append('params', JSON.stringify({
        auteur: parametresProjet.auteur,
        nomSite: parametresProjet.nomSite,
        nomArmoire: parametresProjet.nomArmoire,
        dateEdition: parametresProjet.dateEdition,
        indice: parametresProjet.indice,
        nomProjet: parametresProjet.nomSite // Pour le nom du fichier de sortie
      }));

      // On envoie la requête POST au backend
      // On utilise '/api' grâce au proxy configuré dans vite.config.js
      const reponse = await fetch('/api/generate', {
        method: 'POST',
        body: formData // Pas besoin de Content-Type, le navigateur le fait automatiquement
      });

      if (!reponse.ok) {
        // Essayer de récupérer les détails de l'erreur
        let erreurData = {};
        try {
          const texte = await reponse.text();
          console.error('❌ [Frontend] Réponse d\'erreur brute :', texte);
          erreurData = JSON.parse(texte);
        } catch (e) {
          console.error('❌ [Frontend] Impossible de parser la réponse d\'erreur :', e);
        }
        
        const messageErreur = erreurData.details || erreurData.erreur || `Erreur HTTP ${reponse.status}`;
        console.error('❌ [Frontend] Détails de l\'erreur :', {
          status: reponse.status,
          statusText: reponse.statusText,
          erreur: erreurData.erreur,
          details: erreurData.details,
          chemin: erreurData.chemin
        });
        
        throw new Error(messageErreur);
      }

      // On récupère le fichier .drawio comme un Blob (Binary Large Object)
      const blob = await reponse.blob();
      
      // On crée un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `${parametresProjet.nomSite || 'schema'}.drawio`;
      
      // On déclenche le téléchargement
      document.body.appendChild(lien);
      lien.click();
      
      // On nettoie
      document.body.removeChild(lien);
      window.URL.revokeObjectURL(url);

      console.log('✅ [Frontend] Schéma généré avec succès');
      alert('Schéma généré avec succès !');
    } catch (erreur) {
      console.error('❌ [Frontend] Erreur lors de la génération :', erreur);
      alert(`Erreur lors de la génération du schéma : ${erreur.message}`);
    } finally {
      // On désactive le mode chargement dans tous les cas (succès ou erreur)
      setEnChargement(false);
    }
  };

  // Le JSX retourné décrit l'interface de la page
  return (
    <div className="alibalek">
      <h2>Générateur de Schémas Électriques - Alibalek</h2>

      {/* Section 0 : Informations du modèle Draw.io */}
      <section className="section-modele">
        <h3>Modèle Draw.io</h3>
        {modeleInfo ? (
          <div className="info-modele">
            <div className="info-modele-details">
              <p><strong>Fichier :</strong> {modeleInfo.nom}</p>
              <p><strong>Date d'upload :</strong> {formaterDate(modeleInfo.dateUpload)}</p>
            </div>
            <div className="info-modele-actions">
              <input
                type="file"
                accept=".drawio"
                onChange={gererUploadModele}
                id="input-modele"
                style={{ display: 'none' }}
              />
              <label htmlFor="input-modele" className="bouton-secondaire">
                {chargementModele ? 'Mise à jour...' : 'Mettre à jour le modèle'}
              </label>
            </div>
          </div>
        ) : (
          <p>Chargement des informations du modèle...</p>
        )}
      </section>

      {/* Section 1 : Upload du fichier JSON */}
      <section className="section-upload">
        <h3>1. Fichier JSON</h3>
        <div className="upload-zone">
          <input
            type="file"
            accept=".json,application/json"
            onChange={gererUploadFichier}
            id="input-fichier"
          />
          <label htmlFor="input-fichier" className="bouton-upload">
            {fichierJson ? `Fichier sélectionné : ${fichierJson.name}` : 'Sélectionner un fichier JSON'}
          </label>
        </div>
      </section>

      {/* Section 2 : Sélection des cartes */}
      <section className="section-cartes">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>2. Sélection des cartes</h3>
          <button 
            onClick={chargerCartes} 
            className="bouton-rafraichir"
            title="Recharger les cartes"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Statistiques des points */}
        {Object.keys(quantitesCartes).length > 0 && (
          <div className="statistiques-points">
            <h4>Statistiques des points</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">DI</span>
                <span className="stat-valeur">
                  {statistiquesPoints.di.utilise} / {statistiquesPoints.di.disponible}
                  {statistiquesPoints.di.restant >= 0 ? (
                    <span className="stat-restant positif"> ({statistiquesPoints.di.restant} restants)</span>
                  ) : (
                    <span className="stat-restant negatif"> ({Math.abs(statistiquesPoints.di.restant)} en trop)</span>
                  )}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">DO</span>
                <span className="stat-valeur">
                  {statistiquesPoints.do.utilise} / {statistiquesPoints.do.disponible}
                  {statistiquesPoints.do.restant >= 0 ? (
                    <span className="stat-restant positif"> ({statistiquesPoints.do.restant} restants)</span>
                  ) : (
                    <span className="stat-restant negatif"> ({Math.abs(statistiquesPoints.do.restant)} en trop)</span>
                  )}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">AI</span>
                <span className="stat-valeur">
                  {statistiquesPoints.ai.utilise} / {statistiquesPoints.ai.disponible}
                  {statistiquesPoints.ai.restant >= 0 ? (
                    <span className="stat-restant positif"> ({statistiquesPoints.ai.restant} restants)</span>
                  ) : (
                    <span className="stat-restant negatif"> ({Math.abs(statistiquesPoints.ai.restant)} en trop)</span>
                  )}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">AO</span>
                <span className="stat-valeur">
                  {statistiquesPoints.ao.utilise} / {statistiquesPoints.ao.disponible}
                  {statistiquesPoints.ao.restant >= 0 ? (
                    <span className="stat-restant positif"> ({statistiquesPoints.ao.restant} restants)</span>
                  ) : (
                    <span className="stat-restant negatif"> ({Math.abs(statistiquesPoints.ao.restant)} en trop)</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {Object.keys(cartesDisponibles).length > 0 ? (
          <div className="cartes-groupées">
            {Object.entries(cartesDisponibles).map(([marque, types]) => {
              const estDepliee = marquesDepliees[marque] || false;
              
              return (
                <div key={marque} className="groupe-marque">
                  <div className="titre-marque-container" onClick={() => basculerMarque(marque)}>
                    <button className="chevron" type="button">
                      {estDepliee ? '▼' : '▶'}
                    </button>
                    <h4 className="titre-marque">{marque}</h4>
                  </div>
                  {estDepliee && Object.entries(types).map(([type, cartes]) => (
                    <div key={type} className="groupe-type">
                      <h5 className="titre-type">{type}</h5>
                      <div className="liste-cartes">
                        {cartes.map((carte) => {
                          const quantite = quantitesCartes[carte.ref] || 0;
                          const estAutomate = carte.type === 'automate';
                          const maxQuantite = estAutomate ? 1 : 10;
                          
                          return (
                            <div key={carte.ref} className="carte-item">
                              <label className="carte-label">
                                <span className="carte-nom">{carte.nom_complet || carte.nom}</span>
                                <div className="carte-controles">
                                  <button
                                    type="button"
                                    className="bouton-quantite"
                                    onClick={() => mettreAJourQuantite(carte.ref, Math.max(0, quantite - 1))}
                                    disabled={quantite === 0}
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max={maxQuantite}
                                    value={quantite}
                                    onChange={(e) => {
                                      const nouvelleQuantite = parseInt(e.target.value) || 0;
                                      mettreAJourQuantite(carte.ref, Math.min(nouvelleQuantite, maxQuantite));
                                    }}
                                    className="input-quantite"
                                  />
                                  <button
                                    type="button"
                                    className="bouton-quantite"
                                    onClick={() => mettreAJourQuantite(carte.ref, Math.min(maxQuantite, quantite + 1))}
                                    disabled={quantite >= maxQuantite}
                                  >
                                    +
                                  </button>
                                </div>
                                {estAutomate && quantite > 0 && (
                                  <span className="badge-automate">Automate</span>
                                )}
                              </label>
                              <div className="carte-infos">
                                <span>DI: {carte.nb_di}</span>
                                <span>DO: {carte.nb_do}</span>
                                <span>AI: {carte.nb_ai}</span>
                                <span>AO: {carte.nb_ao}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            Chargement des cartes...
          </p>
        )}
      </section>

      {/* Section 3 : Paramètres du projet */}
      <section className="section-parametres">
        <h3>3. Paramètres du projet</h3>
        <div className="formulaire-parametres">
          <label>
            Auteur :
            <input
              type="text"
              value={parametresProjet.auteur}
              onChange={(e) => {
                setParametresProjet({
                  ...parametresProjet,
                  auteur: e.target.value
                });
              }}
            />
          </label>
          
          <label>
            Nom du site :
            <input
              type="text"
              value={parametresProjet.nomSite}
              onChange={(e) => {
                setParametresProjet({
                  ...parametresProjet,
                  nomSite: e.target.value
                });
              }}
            />
          </label>
          
          <label>
            Nom armoire :
            <input
              type="text"
              value={parametresProjet.nomArmoire}
              onChange={(e) => {
                setParametresProjet({
                  ...parametresProjet,
                  nomArmoire: e.target.value
                });
              }}
            />
          </label>
          
          <label>
            Date dernière édition :
            <input
              type="text"
              value={parametresProjet.dateEdition}
              onChange={(e) => {
                setParametresProjet({
                  ...parametresProjet,
                  dateEdition: e.target.value
                });
              }}
            />
          </label>
          
          <label>
            Indice :
            <input
              type="text"
              value={parametresProjet.indice}
              onChange={(e) => {
                setParametresProjet({
                  ...parametresProjet,
                  indice: e.target.value
                });
              }}
            />
          </label>
        </div>
      </section>

      {/* Section 4 : Bouton de génération */}
      <section className="section-generation">
        <button
          onClick={genererSchema}
          disabled={enChargement}
          className="bouton-principal"
        >
          {enChargement ? 'Génération en cours...' : 'Générer le schéma'}
        </button>
      </section>
    </div>
  );
}

export default Alibalek;

